/**
 * Amy 英语打卡 — API Worker
 *
 * Today it does one job: turn a child's 16kHz mono WAV into text using
 * Workers AI Whisper, so the app stops depending on the browser's
 * SpeechRecognition (Chrome-only, and it streams audio to Google, which is
 * unreachable from the mainland).
 *
 * The client treats this as best-effort — it has already stored the audio
 * locally before calling — so every failure path here returns quickly and
 * says what happened rather than hanging.
 */

const MODEL = '@cf/openai/whisper';

// Same constant as public/api.js. Teacher-only endpoints check this; it is
// the app's whole auth model today (the roster blob is equally public), so
// this adds server-side state, not server-side secrets.
const TEACHER_PHONE = '13259532991';

// A read-along is a few seconds of 16kHz mono 16-bit PCM: ~32KB/second.
// 2MB is a minute of audio, far past anything legitimate.
const MAX_BYTES = 2 * 1024 * 1024;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env);

    if (url.pathname === '/api/health') {
      return cors(json({ ok: true }), env);
    }

    if (url.pathname === '/api/grade-translation') {
      if (request.method !== 'POST') return cors(json({ error: 'method_not_allowed' }, 405), env);
      return cors(await gradeTranslation(request, env), env);
    }

    if (url.pathname === '/api/tts') {
      return cors(await tts(request, env, ctx), env);
    }

    if (url.pathname === '/api/transcribe') {
      if (request.method !== 'POST') return cors(json({ error: 'method_not_allowed' }, 405), env);
      return cors(await transcribe(request, env), env);
    }

    if (url.pathname === '/api/dict') {
      return cors(await dict(url, env, ctx), env);
    }

    if (url.pathname.startsWith('/api/class/')) {
      return cors(await classApi(request, url, env), env);
    }

    if (url.pathname.startsWith('/api/wrong-questions')) {
      return cors(await wrongQuestionsApi(request, url, env), env);
    }

    return cors(json({ error: 'not_found' }, 404), env);
  },
};

// Grade a spoken Chinese translation.
//
// Character overlap alone cannot say WHY an answer is weak — it cannot tell a
// missing clause from a wrong one, and it marks 「很有天赋」 down against
// 「非常有天赋」 for no real reason. A language model can, and it writes its
// answer in Simplified Chinese, which also ends the losing game of hand-
// maintaining a Traditional-to-Simplified table.
const GRADE_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

async function gradeTranslation(request, env) {
  const url = new URL(request.url);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const en = String(body.en || '').slice(0, 600);
  const ref = String(body.reference || '').slice(0, 600);
  const said = String(body.spoken || '').slice(0, 600);
  if (!en || !said) return json({ error: 'missing_fields' }, 400);

  const prompt = [
    '你是小学英语老师，正在批改学生的口头翻译。',
    '英文原句：' + en,
    '参考译文：' + ref,
    '学生说的：' + said,
    '',
    '评分要求：',
    '1. 只看意思是否传达到位，用词和句式与参考不同不算错。',
    '2. 学生是小学生，语气要鼓励，但错误要指出来。',
    '3. 所有中文一律用简体。',
    '4. 学生是口头作答，文字由语音识别转写。繁体字、同音字、标点差异都是',
    '   转写造成的，不是学生的错，不要当作翻译错误。',
    '',
    '只输出 JSON，不要任何其他文字：',
    '{"score":0-100的整数,"understood":true或false,',
    '"missing":["漏掉的关键信息"],"errors":["译错的地方"],',
    '"better":"更自然的说法","said":"学生说的话，转成简体"}',
  ].join('\n');

  let out;
  try {
    out = await env.AI.run(GRADE_MODEL, {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.2,
    });
  } catch (e) {
    return json({ error: 'grade_failed', detail: String(e && e.message || e) }, 502);
  }

  // Reasoning models put the answer in different places and can spend the
  // whole token budget on thinking; surface the shape when nothing parses.
  // choices[] first: on this model `response` is an OBJECT, so reading it
  // first turned the answer into the string "[object Object]".
  let raw = '';
  if (typeof out === 'string') raw = out;
  else if (out) {
    const c = out.choices && out.choices[0];
    const fromChoice = c && ((c.message && c.message.content) || c.text);
    raw = fromChoice || (typeof out.response === 'string' ? out.response : '')
       || (typeof out.result === 'string' ? out.result : '');
  }
  raw = String(raw || '');
  if (url.searchParams.get('debug') === '1') {
    return json({ shape: out && typeof out === 'object' ? Object.keys(out) : typeof out,
                  rawLen: raw.length, sample: raw.slice(0, 400), full: out });
  }
  // Models wrap JSON in prose or fences often enough that the client should
  // never have to care; pull out the object here.
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return json({ error: 'unparsable', raw: raw.slice(0, 300) }, 502);
  let parsed;
  try { parsed = JSON.parse(m[0]); } catch (e) { return json({ error: 'unparsable', raw: m[0].slice(0, 300) }, 502); }

  return json({
    score: Math.max(0, Math.min(100, parseInt(parsed.score, 10) || 0)),
    understood: !!parsed.understood,
    missing: Array.isArray(parsed.missing) ? parsed.missing.slice(0, 4) : [],
    errors: Array.isArray(parsed.errors) ? parsed.errors.slice(0, 4) : [],
    better: String(parsed.better || '').slice(0, 200),
    said: String(parsed.said || said).slice(0, 300),
  });
}

// Text-to-speech from our own origin.
//
// The app used to point <audio> at 有道/百度 TTS URLs. Those are third-party
// cross-origin resources: they work in desktop Chrome and fail in restricted
// mobile browsers (Xiaomi's built-in browser plays nothing). Serving the audio
// from the same origin as the page removes that whole class of problem.
//
// Responses are cached — every child reads the same sentences over and over,
// so almost every request after the first is a cache hit and costs nothing.
//
// 通道顺序（v89 起）：阿里云 qwen3-tts-flash（主，按字符计费、不烧 neurons）
//   → Cloudflare Deepgram aura（备，烧 neurons，额度大头就是它）
//   → 百度/有道代理（免费兜底）。见下方 aliyunTtsAudio / tts()。
//
// v95 增加 per-request 的音色偏好 `?prefer=cf`（AI 口语练习专用）：
// 家长反馈"口语练习的发音太烂了，默认给我走 Cloudflare"。Deepgram aura 是
// 英语母语音色，明显好听过阿里云的中英双语音色；但它每次朗读烧 90~145
// neurons，是每天 10,000 免费额度的真正大头，全站都切过去半天就烧光。
// 所以只有口语练习这一个模块写 prefer=cf：日常先用 CF 的好音色，额度用完
// 或上游故障时**自动落阿里云**（仍是按字符计费，不影响孩子听到声音）。
const TTS_MODEL = '@cf/deepgram/aura-2-en';
const TTS_MAX_CHARS = 900;

// 备用通道：Workers AI 的免费额度（每天 10,000 neurons）用完时，AI.run 会抛
// "4006: you have used up your daily free allocation"，整条 /api/tts 直接 502，
// 客户端只能走"自家失败→再试第三方"的弯路，孩子点什么都先干等一两秒。
// 现在服务端就地换道：整句走百度、单词/字母走有道（跟客户端原来的路由一致），
// 取回来的音频照样写进边缘缓存 —— 全班孩子只有第一人付一次回源的钱。
async function ttsFallbackAudio(text) {
  const enc = encodeURIComponent(text);
  const isSentence = /\s/.test(text.trim());
  const upstream = isSentence
    ? 'https://fanyi.baidu.com/gettts?lan=en&text=' + enc + '&spd=3&source=web'
    : 'https://dict.youdao.com/dictvoice?audio=' + enc + '&type=2';
  const r = await fetch(upstream, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  if (!r.ok) throw new Error('tts_fallback_http_' + r.status);
  const ct = r.headers.get('content-type') || '';
  if (!/audio|octet-stream/i.test(ct)) throw new Error('tts_fallback_ct_' + ct);
  const buf = await r.arrayBuffer();
  // 上游偶尔把错误页/空响应吐回来（几百字节的 JSON），拿去当音频只会让
  // <audio> 再抛一次错。太小的当失败处理。
  if (buf.byteLength < 500) throw new Error('tts_fallback_too_small');
  return buf;
}

// 阿里云 qwen3-tts-flash（v89）：示范读音的主通道。
// 为什么切：Deepgram aura 每次朗读烧 90~145 neurons，是 Cloudflare 每天
// 10,000 免费额度的真正大头（实测占 98%），傍晚必然耗尽。qwen3-tts-flash
// 按字符计费（¥0.8/万字符），平台朗读文本全部来自固定题库且结果写边缘
// 缓存 —— 同一段文字只有第一次生成收钱，之后全站孩子免费命中。音色也比
// Deepgram 更自然。Cherry 是中英双语音色，一个声音通吃单词和中文释义。
const ALIYUN_TTS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const ALIYUN_TTS_MODEL = 'qwen3-tts-flash';
// 音色分中英文两套（v95）：Cherry 是中英双语音色，读中文自然，但读英文带
// 口音 —— 家长的原话是"这个发音真是太烂了"。英文改用阿里云专为英语训练的
// 女声（Jennifer），中英混排（单词 + 中文释义）仍用 Cherry。
// 选型依据：tools/tts-voice-bench.js（合成 → qwen3-asr-flash 反听 → 逐词比对）
// + public/voicetest/ 的人耳试听样本。
const ALIYUN_TTS_VOICE_CN = 'Cherry';
const ALIYUN_TTS_VOICE_EN = 'Jennifer';

// 消费上限：qwen3-tts-flash ¥0.8/万字符 → 30,000 字符/天 ≈ ¥2.4 封顶。
// 正常流量远到不了（题库固定 + 边缘缓存），这道闸只防缓存失效/刷量时的
// 失控账单。计数走 D1（按 UTC 日一行），超额当天自动回落免费通道。
const ALIYUN_TTS_DAILY_CHAR_CAP = 30000;

let ttsTableReady = false;
async function ttsCharsToday(env) {
  if (!env.DB) return { used: 0, add: function () {} };
  const day = new Date().toISOString().slice(0, 10);
  try {
    if (!ttsTableReady) {
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS tts_usage (day TEXT PRIMARY KEY, chars INTEGER NOT NULL DEFAULT 0)'
      ).run();
      ttsTableReady = true;
    }
    const row = await env.DB.prepare('SELECT chars FROM tts_usage WHERE day = ?1').bind(day).first();
    const self = {
      used: (row && row.chars) || 0,
      add: function (n) {
        return env.DB.prepare(
          'INSERT INTO tts_usage (day, chars) VALUES (?1, ?2) ' +
          'ON CONFLICT(day) DO UPDATE SET chars = chars + ?2'
        ).bind(day, n).run();
      },
    };
    return self;
  } catch (e) {
    // D1 出问题不能挡住朗读：按 0 计、放行。
    return { used: 0, add: function () {} };
  }
}

// 返回 ArrayBuffer；失败一律抛错，由 tts() 决定降级，不在这里吞。
// 响应里 output.audio.url 是 24 小时有效的 OSS 直链，必须当场取回字节
// 再写缓存 —— 缓存里存直链的话，第二天全站孩子都拿到过期签名。
async function aliyunTtsAudio(text, env) {
  const key = (env && (env.ALIYUN_KEY || env.DASHSCOPE_API_KEY)) || '';
  if (!key) throw new Error('aliyun_key_missing');
  const hasCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
  const res = await fetch(ALIYUN_TTS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ALIYUN_TTS_MODEL,
      input: {
        text: text,
        voice: hasCJK ? ALIYUN_TTS_VOICE_CN : ALIYUN_TTS_VOICE_EN,
        language_type: hasCJK ? 'Chinese' : 'English',
      },
    }),
  });
  if (!res.ok) throw new Error('aliyun_tts_http_' + res.status);
  const data = await res.json();
  const audioUrl = data && data.output && data.output.audio && data.output.audio.url;
  if (!audioUrl) throw new Error('aliyun_tts_no_url');
  const wav = await fetch(audioUrl);
  if (!wav.ok) throw new Error('aliyun_tts_fetch_' + wav.status);
  const buf = await wav.arrayBuffer();
  if (buf.byteLength < 500) throw new Error('aliyun_tts_too_small');
  return buf;
}

// Cloudflare Workers AI 的 TTS（Deepgram aura，英语母语音色）。
// 返回 null 表示这条通道这次不可用（每日 neurons 额度耗尽 / 模型报错），
// 由调用方决定往哪儿降级；不在这里吞掉整条请求。
// 入参形状的坑见「已知坑」：aura 返回 base64 对象或 ReadableStream，两种都要认。
async function cfTtsAudio(text, env) {
  try {
    const audio = await env.AI.run(TTS_MODEL, { text: text });
    // The binding returns either a ReadableStream or an object holding base64.
    let body = audio;
    if (audio && typeof audio === 'object' && !(audio instanceof ReadableStream)) {
      if (audio.audio) {
        const bin = atob(audio.audio);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        body = bytes;
      }
    }
    return body || null;
  } catch (e) {
    return null;
  }
}

async function tts(request, env, ctx) {
  const url = new URL(request.url);
  const text = (url.searchParams.get('text') || '').trim();
  if (!text) return json({ error: 'no_text' }, 400);
  if (text.length > TTS_MAX_CHARS) return json({ error: 'too_long' }, 413);

  // 缓存键带版本：朗读路由一变就 +1，让旧读音立刻全部失效（immutable
  // 缓存赖一年）。v2 = 字母改走有道；v3 = 英文音色换人 + 新增 prefer 维度。
  // engine / prefer 也要进键：同一段文字不同通道音色不同，不能互相串。
  const forceTtsQ = (url.searchParams.get('engine') || '').toLowerCase();
  const preferCf = (url.searchParams.get('prefer') || '').toLowerCase() === 'cf';
  const cacheKey = new Request(url.origin + '/api/tts?v3'
    + (forceTtsQ ? '&engine=' + forceTtsQ : '')
    + (preferCf ? '&prefer=cf' : '')
    + '&text=' + encodeURIComponent(text), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  // 单个字母直走有道 dictvoice（v90）：字母跟读的示范音是整个练习的根，
  // qwen3-tts 把孤立的字母读得又怪又不准（家长实测"每个字母都是读错的，
  // 整个单词读下来很奇怪"），Deepgram 也没验证过字母名。有道读字母名
  // 标准（v85 起就是字母的兜底通道），免费、不烧 neurons、不计字符。
  const isSingleLetter = /^[a-z]$/i.test(text.trim());
  let body = null;
  let source = 'aliyun';
  if (isSingleLetter && forceTtsQ !== 'cf') {
    try {
      body = await ttsFallbackAudio(text);
      source = 'youdao';
    } catch (e) {
      body = null;   // 有道挂了才落到下面的免费模型，读到什么算什么
    }
  }
  // prefer=cf（AI 口语练习）：先用 Cloudflare 的母语音色。额度用完/上游报错
  // 时 body 还是 null，下面照常落阿里云 —— 孩子不会因为额度耗尽就没声音。
  if (!body && preferCf && forceTtsQ !== 'ali') {
    body = await cfTtsAudio(text, env);
    if (body) source = 'cf';
  }
  if (!body && forceTtsQ !== 'cf') {
    const usage = await ttsCharsToday(env);
    if (usage.used < ALIYUN_TTS_DAILY_CHAR_CAP) {
      try {
        body = await aliyunTtsAudio(text, env);
        source = 'aliyun';
        ctx.waitUntil(usage.add(text.length));
      } catch (e) {
        body = null;   // Key 没配 / 上游抖动 / 取音频失败 —— 静默走老路
      }
    }
  }
  if (!body && !preferCf) {
    source = 'cf';
    body = await cfTtsAudio(text, env);
  }
  if (!body) {
    // 额度用完 / 模型出错：换备用通道。再不行才真的报错，让客户端走
    // 它自己的第三层兜底（speechSynthesis）。
    try {
      body = await ttsFallbackAudio(text);
      source = 'fallback';
    } catch (e2) {
      return json({ error: 'tts_failed', detail: String(e2 && e2.message || e2) }, 502);
    }
  }

  const res = new Response(body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-TTS-Source': source,
    },
  });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// ---------------------------------------------------------------------------
// 查词：孩子点一个不认识的单词，要立刻看到音标 + 中文意思 + 听到读音。
//
// 走服务端代理而不是让浏览器直接调有道，原因有两个：
//   1. 跨域 —— dict.youdao.com 不给浏览器 CORS 头，前端 fetch 一定失败；
//   2. 代理层能挂 caches.default，同一个词全站孩子只查一次，之后是边缘
//      命中，几十毫秒返回。
// 只接受单个英文词（字母、连字符、撇号），挡住把整句塞进来当翻译用。
// ---------------------------------------------------------------------------

const DICT_CACHE_SECONDS = 60 * 60 * 24 * 30;
// 改了释义过滤规则就把它 +1，让旧缓存立刻失效。
const DICT_CACHE_VERSION = 2;

async function dict(url, env, ctx) {
  const raw = (url.searchParams.get('word') || '').trim();
  const word = raw.toLowerCase();
  // 只收单个词。带空格的一律拒掉 —— 否则孩子误点整句时，会把一整句
  // 塞给有道当"翻译"，返回一段莫名其妙的文本。
  if (!word || word.length > 40 || !/^[a-z][a-z'\-]*$/.test(word)) {
    return json({ error: 'bad_word' }, 400);
  }

  // 缓存键里带版本号：过滤逻辑一改就升 DICT_CACHE_VERSION，否则旧结果会
  // 在边缘赖着不走（实测改完过滤规则，piano 还是返回改之前的脏释义）。
  const cacheKey = new Request(
    'https://dict.internal/v' + DICT_CACHE_VERSION + '/' + encodeURIComponent(word),
    { method: 'GET' },
  );
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let phon = '';
  let zh = '';

  // 上游响应直接让 Cloudflare 边缘缓存：同一个词全站孩子只穿透一次
  // （实测穿透约 0.9s，命中约 30ms）。比只靠 cache.put 更可靠 ——
  // cache.put 是每 colo 一份，孩子换地方就重新穿透一次。
  const UPSTREAM = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AmyEnglishApp/1.0)' },
                     cf: { cacheTtl: 604800, cacheEverything: true } };

  // 主源：有道 jsonapi 的 ec 段，同时有音标和简明释义。
  try {
    const r = await fetch('https://dict.youdao.com/jsonapi?q=' + encodeURIComponent(word), UPSTREAM);
    if (r.ok) {
      const data = await r.json();
      const node = data && data.ec && data.ec.word;
      const w = Array.isArray(node) ? node[0] : node;
      if (w) {
        phon = w.usphone || w.ukphone || '';
        const trs = Array.isArray(w.trs) ? w.trs : [];
        const lines = [];
        for (const t of trs) {
          const tr = t && t.tr && t.tr[0];
          // 注意 tr.l.i 是**数组**（一行一个义项），不是字符串 ——
          // 直接 indexOf 永远返回 -1，过滤会静默失效。
          let line = tr && tr.l && tr.l.i;
          if (Array.isArray(line)) line = line.join(' ');
          line = String(line || '').replace(/\s+/g, ' ').trim();
          // 人名、专名的义项对小学生没有意义，跳过。
          if (line && line.indexOf('【名】') === -1 && line.indexOf('（人名）') === -1) {
            lines.push(line);
          }
          if (lines.length >= 2) break;
        }
        zh = lines.join('；');
        // 义项里常夹着人名/专名的尾巴（"（Piano）人名，法、意、葡译作皮亚诺"），
        // 对小学生是纯噪音，按分号拆开逐段丢掉。
        zh = zh.split('；')
               .map(function(x) { return x.trim(); })
               .filter(function(x) { return x && x.indexOf('人名') === -1; })
               .join('；');
      }
    }
  } catch (e) { /* 落到下面的兜底源 */ }

  // 兜底源：suggest 接口只有 248 字节，覆盖率高，但没有音标。
  if (!zh) {
    try {
      const r = await fetch(
        'https://dict.youdao.com/suggest?num=1&doctype=json&q=' + encodeURIComponent(word),
        UPSTREAM,
      );
      if (r.ok) {
        const data = await r.json();
        const e = data && data.data && data.data.entries && data.data.entries[0];
        if (e && e.explain) zh = String(e.explain).replace(/\.\.\.$/, '').trim();
      }
    } catch (e) { /* 两个源都挂了就只能返回空 */ }
  }

  const res = new Response(
    JSON.stringify({ word: word, phon: phon, zh: zh, ok: !!zh }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=' + DICT_CACHE_SECONDS,
      },
    },
  );
  // 查不到的词也缓存（空结果），免得每次都打一遍上游。
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

// ---------------------------------------------------------------------------
// 两个模型要的入参结构不一样。写错不是"效果差一点"，而是直接 500 —— 孩子
// 这一次朗读的分数就没了。逐个对照官方 schema 确认：
//   @cf/openai/whisper / whisper-tiny-en  audio: [0..255, ...] 整数数组
//   @cf/openai/whisper-large-v3-turbo     audio: base64 字符串
// 把整数数组喂给 turbo 会被拒收："Type mismatch of '/audio'"。
const TURBO_MODEL = '@cf/openai/whisper-large-v3-turbo';
const B64_CHUNK = 0x8000;

// 试过的三条路，结论记在这里，免得下次又绕一圈：
//   默认 whisper / whisper-tiny-en / whisper-large-v3-turbo
// 线上各跑三遍，三者都在 1.4–3.5s，重叠得完全分不出高下 —— 孩子松手后的等待
// 是网络往返和排队，不是模型算力。tiny 反而会把 "have breakfast" 听成
// "abreak this"，白丢准确度。所以英文跟读固定用最准的 turbo，不再换模型；
// 想省那两秒只能从客户端想办法（预取朗读音频、热连接），不是从这里。
// 另外 beam_size 从 5 降到 1 也实测过：量不出差别，已放弃。
function toBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += B64_CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + B64_CHUNK));
  }
  return btoa(bin);
}

// 裁掉 16k 单声道 16-bit WAV 首尾的静音（v92）。孩子按住→松手的录音两头
// 总有一截没声：白占上传体积和识别时长，更要命的是给 Whisper 留了"自由发
// 挥"的空拍 —— 边缘静音里出现的幻觉词（Okay / Thank you）正是"读对了却被
// 判错"的一个来源。裁剪后留 120ms 缓冲，防止把起音/尾音削掉。
// 只处理标准 RIFF/PCM；任何形状不对、多声道、非 16-bit 一律原样返回。
const TRIM_SILENCE_LEVEL = 320;      // ~1% 满幅，呼吸声/房间噪声在这之下
const TRIM_PAD_SAMPLES = 1920;       // 120ms @16kHz

function trimWavSilence(bytes) {
  try {
    if (bytes.length < 44) return bytes;
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (dv.getUint32(0, true) !== 0x46464952) return bytes;          // 'RIFF'
    if (dv.getUint32(8, true) !== 0x45564157) return bytes;          // 'WAVE'
    // 找 fmt 和 data 块
    let pos = 12, fmt = null, dataOff = -1, dataLen = -1;
    while (pos + 8 <= bytes.length) {
      const id = dv.getUint32(pos, true);
      const size = dv.getUint32(pos + 4, true);
      if (id === 0x20746D66) {                                       // 'fmt '
        fmt = { ch: dv.getUint16(pos + 10, true), bits: dv.getUint16(pos + 22, true) };
      } else if (id === 0x61746164) {                                // 'data'
        dataOff = pos + 8;
        dataLen = Math.min(size, bytes.length - dataOff);
        break;
      }
      pos += 8 + size + (size % 2);
    }
    if (!fmt || dataOff < 0 || fmt.ch !== 1 || fmt.bits !== 16) return bytes;
    const n = Math.floor(dataLen / 2);
    if (n < TRIM_PAD_SAMPLES * 4) return bytes;
    let first = -1, last = -1;
    for (let i = 0; i < n; i++) {
      if (Math.abs(dv.getInt16(dataOff + i * 2, true)) > TRIM_SILENCE_LEVEL) {
        if (first < 0) first = i;
        last = i;
      }
    }
    if (first < 0) return bytes;                                     // 整段没声，交给模型去说"没识别出"
    const from = Math.max(0, first - TRIM_PAD_SAMPLES);
    const to = Math.min(n, last + 1 + TRIM_PAD_SAMPLES);
    if (from === 0 && to === n) return bytes;
    const kept = to - from;
    if (kept < TRIM_PAD_SAMPLES) return bytes;                       // 剩太短不裁，防误伤
    const newLen = dataOff + kept * 2 + (dataLen % 2);
    const out = new Uint8Array(newLen);
    out.set(bytes.subarray(0, dataOff), 0);                          // 原样头 + 块头
    out.set(bytes.subarray(dataOff + from * 2, dataOff + to * 2), dataOff);
    new DataView(out.buffer).setUint32(dataOff - 8 + 4, kept * 2, true);   // data 块大小
    new DataView(out.buffer).setUint32(4, newLen - 8, true);               // RIFF 大小
    return out;
  } catch (e) {
    return bytes;
  }
}

// turbo 要 base64 字符串；默认 whisper 要 [0..255,...] 整数数组。形状不能混，
// 混了不是"效果差一点"，而是直接 500 —— 孩子这一次朗读的分数就没了。
//
// mode=zh（v86）：中文翻译也走 turbo。之前中文只能留在默认模型，是因为这里
// 把 language 硬钉成 'en'，中文会被硬当英文翻。默认模型还有个致命慢点：它要
// 整数数组入参，5 秒录音 160KB 的 WAV 会被 JSON 展成 ~600KB 的请求体，手机
// 上传这段就是孩子"识别时间很长"的大头。turbo 走 base64（~213KB）加上模型
// 本身更准，速度和准确度一起收。中文提示词按 Whisper 惯例给简体中文，
// 引导它直接出简体（出繁体也没关系，客户端 _toSimplified 兜底）。
//
// prompt（v87）：跟读场景把目标句/目标词传进来做 initial_prompt 偏置 ——
// 孩子是照着屏幕读的，提示词让 Whisper 朝这个内容解码，读对的词被误判
// 成漏读的情况明显变少。只对英文生效；中文模式固定用简体提示词。
function fastInput(bytes, mode, bias) {
  const input = { audio: toBase64(bytes), task: 'transcribe', language: 'en' };
  if (mode === 'letter') {
    input.initial_prompt = 'The speaker is reading single English alphabet letters aloud, one at a time.';
  } else if (mode === 'zh') {
    input.language = 'zh';
    input.initial_prompt = '以下是普通话的句子，请用简体中文输出。';
  } else if (bias) {
    input.initial_prompt = bias;
  }
  return input;
}

// ---------------------------------------------------------------------------
// 阿里云百炼（v88）—— 中文翻译识别的主通道，同时兜住 Cloudflare 额度耗尽。
//
// 为什么切过去：
//   1. 中文准确度。qwen3-asr-flash 是 LLM 架构的中文 ASR，实测孩子这种 3-5 秒
//      短句带标点逐字正确；Whisper 的中文是靠多语种能力顺带支撑的，明显弱一档。
//   2. 延迟。服务器在国内，实测一次 3 秒音频 0.5-0.9s 出结果，且不再跨境往返。
//   3. 免费额度。36,000 秒（10 小时）/90 天，孩子一天用不到 1 小时 —— 花不到钱。
//      计费 ¥0.00022/秒（≈¥0.79/小时），真超了也就几毛钱。
//
// 为什么英文不直接也切过来：qwen3-asr-flash 会把 "11-year-old" 规范化成
// "eleven-year-old"，而客户端是拿目标句逐词比对的，这种数字改写会被判成读错。
// Whisper + initial_prompt 偏置能逐字贴合。所以英文仍以 Cloudflare 为主，
// 阿里云只做额度耗尽/故障时的兜底 —— 有它在，4006 不会再让孩子这次朗读失效。
//
// 上下文偏置（system message）实测有效：把目标句给它，"Sierra" 能纠回 "Sarah"。
const ALIYUN_ASR_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const ALIYUN_ASR_MODEL = 'qwen3-asr-flash';

function aliyunSystem(mode, bias) {
  if (mode === 'zh') return '以下是普通话的句子，请用简体中文输出。';
  if (mode === 'letter') {
    return 'The speaker is reading single English alphabet letters aloud, one at a time.';
  }
  if (bias) return 'The speaker is reading this text aloud: ' + bias;
  return '';
}

function aliyunPayload(bytes, mode, bias, mime) {
  const messages = [];
  const sys = aliyunSystem(mode, bias);
  if (sys) messages.push({ role: 'system', content: [{ type: 'text', text: sys }] });
  messages.push({
    role: 'user',
    content: [{
      type: 'input_audio',
      input_audio: { data: 'data:' + mime + ';base64,' + toBase64(bytes) },
    }],
  });
  return { model: ALIYUN_ASR_MODEL, messages: messages };
}

// 失败一律抛错、由调用方决定降级 —— 不在这里吞掉，否则分不清"没声音"和"没配上"。
async function aliyunTranscribe(bytes, env, mode, bias, mime) {
  const key = (env && (env.ALIYUN_KEY || env.DASHSCOPE_API_KEY)) || '';
  if (!key) throw new Error('aliyun_key_missing');
  const res = await fetch(ALIYUN_ASR_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(aliyunPayload(bytes, mode, bias, mime)),
  });
  if (!res.ok) throw new Error('aliyun_http_' + res.status);
  const data = await res.json();
  const choice = data && data.choices && data.choices[0];
  let content = choice && choice.message ? choice.message.content : '';
  // 少数模型会返回分段数组，拼起来。
  if (Array.isArray(content)) {
    content = content.map((p) => (typeof p === 'string' ? p : (p && p.text) || '')).join('');
  }
  return String(content || '').trim();
}

// 阿里云会把 "11-year-old" 规范化成 "eleven-year-old"。英文正常走 Cloudflare
// 不碰这条；但兜底路径上一旦出现，客户端拿目标句逐词比对就会把读对的数字
// 判成读错，孩子得白读一遍 —— 所以兜底结果要把数字词还原。
//
// 只在"目标句里写的是数字形式、且没写拼写形式"时才还原（E2E 实测
// 英文强制阿里云返回 'Sarah is an eleven-year-old girl...'，还原后与目标一致），
// 反过来目标句写的 "one" 就保持原样，不会把对的判成错的。
const NUM_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};
const NUM_RE = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:[-\s](one|two|three|four|five|six|seven|eight|nine))?\b/gi;

function restoreDigits(text, bias) {
  if (!text || !bias || !/\d/.test(bias)) return text;
  const target = bias.toLowerCase();
  return text.replace(NUM_RE, function (m, a, b) {
    if (target.indexOf(m.toLowerCase()) >= 0) return m;   // 目标句本来就这么写
    let val = NUM_WORDS[a.toLowerCase()];
    if (b) {
      const unit = NUM_WORDS[b.toLowerCase()];
      if (val >= 20 && val % 10 === 0 && unit < 10) val += unit;
    }
    const digits = String(val);
    return target.indexOf(digits) >= 0 ? digits : m;
  });
}

async function transcribe(request, env) {
  // Reject oversized bodies before buffering them.
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) return json({ error: 'too_large' }, 413);

  let bytes;
  try {
    const buf = await request.arrayBuffer();
    if (buf.byteLength === 0) return json({ error: 'empty_audio' }, 400);
    if (buf.byteLength > MAX_BYTES) return json({ error: 'too_large' }, 413);
    bytes = trimWavSilence(new Uint8Array(buf));
  } catch (e) {
    return json({ error: 'bad_body' }, 400);
  }

  // Letters and words need different handling: Whisper's language model
  // happily reassembles spelled letters into a word ("K N O W L E D G E" came
  // back as "KNOW LEDG"), so a spelling task gets a prompt that tells it what
  // it is listening to. ?mode= lets the client pick; ?model= is for A/B tests.
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'sentence';
  const wantFast = url.searchParams.get('model') === 'turbo';
  // 跟读的目标句/词（v87）：只留安全字符、限长，防注入和滥请求。
  const bias = (url.searchParams.get('prompt') || '')
    .replace(/[\r\n\t]+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim().slice(0, 200);
  // 客户端发的是 16k WAV；真出现 webm 兜底录音时，data URI 的 mime 要跟着变，
  // 否则阿里云会按错误容器解析。
  const mime = (request.headers.get('content-type') || 'audio/wav').split(';')[0].trim() || 'audio/wav';
  // ?engine=ali|cf 可强制指定，用于线上排查是哪条通道在答。
  const force = url.searchParams.get('engine') || '';
  const hasAliyun = !!(env.ALIYUN_KEY || env.DASHSCOPE_API_KEY);

  let out = null;
  let model = '';
  let text = '';
  let cfDead = false;      // Cloudflare 抛错（额度耗尽 4006 / 故障）后不再重试它
  let detail = '';

  // 中文优先走阿里云：更准、更快、不占 Cloudflare 的神经元额度。失败再落回
  // Cloudflare 的 turbo（v86 通道），不让孩子这一次翻译白说。
  if (hasAliyun && mode === 'zh' && force !== 'cf') {
    try {
      text = await aliyunTranscribe(bytes, env, mode, bias, mime);
      if (text) model = ALIYUN_ASR_MODEL;
    } catch (e) { detail = String(e && e.message || e); }
  }

  const wantCf = !text && force !== 'ali';
  if (wantCf && wantFast) {
    try {
      out = await env.AI.run(TURBO_MODEL, fastInput(bytes, mode, bias));
      model = TURBO_MODEL;
      text = ((out && out.text) || '').trim();
    } catch (e) {
      // 快模型额度用尽、临时故障、入参不兼容 —— 任何一种都不能让孩子这
      // 一次朗读变成"出分失败"。静默降级，下面用默认模型兜住。
      out = null;
      model = '';
      cfDead = true;
      detail = String(e && e.message || e);
    }
  }

  // 快模型对特别短的片段、或者声音很小的孩子可能返回空。这时多花一次调用
  // 换回默认模型，孩子不用重读一遍。
  //
  // NOTE: @cf/openai/whisper accepts only `audio` — language and
  // initial_prompt are ignored (tested: a Simplified-Chinese prompt still
  // returned Traditional). Chinese is normalised on the client instead.
  // 但 Cloudflare 已经报错（多半是额度耗尽）时别再打一次，直接交给阿里云。
  if (wantCf && !text && !cfDead) {
    try {
      out = await env.AI.run(MODEL, { audio: [...bytes] });
      model = MODEL;
      text = ((out && out.text) || '').trim();
    } catch (e) {
      out = null;
      cfDead = true;
      detail = String(e && e.message || e);
    }
  }

  // 英文的兜底：Cloudflare 额度耗尽（傍晚高峰的 4006）时，这次朗读照样要出分。
  if (!text && hasAliyun && mode !== 'zh' && force !== 'cf') {
    try {
      text = await aliyunTranscribe(bytes, env, mode, bias, mime);
      if (text) { model = ALIYUN_ASR_MODEL; out = null; text = restoreDigits(text, bias); }
    } catch (e) { detail = String(e && e.message || e); }
  }

  if (!text && !model) {
    // 两条通道都没接上，或者确实一个字都没识别出来。前者按失败返回（客户端
    // 会转自评并进重试队列），后者返回空文本让上层走"没听清"提示。
    if (cfDead && (!hasAliyun || force === 'cf')) {
      return json({ error: 'transcribe_failed', detail: detail || 'cloudflare_unavailable' }, 502);
    }
  }

  return json({
    model: model,
    text: text,
    words: (out && out.words) || null,
    wordCount: (out && out.word_count) || null,
  });
}

// ---------------------------------------------------------------------------
// /api/class/* — removal gate and re-join approval (D1).
//
// The roster itself still lives in the textdb blob; D1 only holds the state
// the blob cannot enforce: "this phone was removed and may not simply
// re-register". Endpoints:
//   GET  /api/class/status?phone=        student: am I removed? pending request?
//   POST /api/class/remove               teacher: record a removal
//   POST /api/class/join-request         student: ask to come back
//   GET  /api/class/join-requests        teacher: list pending applications
//   POST /api/class/join-request/resolve teacher: approve / deny
// ---------------------------------------------------------------------------
async function classApi(request, url, env) {
  const db = env.DB;
  if (!db) return json({ error: 'no_db' }, 500);
  const path = url.pathname;

  // -- student: my status --------------------------------------------------
  if (path === '/api/class/status' && request.method === 'GET') {
    const phone = (url.searchParams.get('phone') || '').trim();
    if (!phone) return json({ error: 'missing_phone' }, 400);
    const removed = await db
      .prepare('SELECT phone, name, removed_at FROM removed_students WHERE phone = ?')
      .bind(phone).first();
    let req = null;
    if (removed) {
      const row = await db
        .prepare('SELECT id, status, created_at, resolved_at FROM join_requests WHERE phone = ? ORDER BY created_at DESC LIMIT 1')
        .bind(phone).first();
      req = row || null;
    }
    return json({
      removed: !!removed,
      removedAt: removed ? removed.removed_at : null,
      request: req,
    });
  }

  // -- teacher: record a removal -------------------------------------------
  if (path === '/api/class/remove' && request.method === 'POST') {
    const body = await readJsonBody(request);
    if (!body) return json({ error: 'bad_json' }, 400);
    if (!isTeacher(body)) return json({ error: 'forbidden' }, 403);
    const phone = String(body.phone || '').trim();
    if (!phone) return json({ error: 'missing_phone' }, 400);
    const name = String(body.name || '').slice(0, 60);
    await db
      .prepare(`INSERT INTO removed_students (phone, name, removed_at) VALUES (?, ?, ?)
                ON CONFLICT(phone) DO UPDATE SET name = excluded.name, removed_at = excluded.removed_at`)
      .bind(phone, name, new Date().toISOString()).run();
    // A removal invalidates any pending request from before it — the student
    // must apply again under this removal, not ride an old approval queue.
    await db
      .prepare("UPDATE join_requests SET status = 'denied', resolved_at = ? WHERE phone = ? AND status = 'pending'")
      .bind(new Date().toISOString(), phone).run();
    return json({ ok: true });
  }

  // -- student: apply to re-join --------------------------------------------
  if (path === '/api/class/join-request' && request.method === 'POST') {
    const body = await readJsonBody(request);
    if (!body) return json({ error: 'bad_json' }, 400);
    const phone = String(body.phone || '').trim();
    const name = String(body.name || '').slice(0, 60);
    if (!phone || !name) return json({ error: 'missing_fields' }, 400);
    const removed = await db
      .prepare('SELECT phone FROM removed_students WHERE phone = ?')
      .bind(phone).first();
    if (!removed) return json({ ok: true, notRemoved: true });
    const existing = await db
      .prepare("SELECT id FROM join_requests WHERE phone = ? AND status = 'pending'")
      .bind(phone).first();
    if (existing) return json({ ok: true, duplicate: true });
    await db
      .prepare("INSERT INTO join_requests (id, phone, name, status, created_at) VALUES (?, ?, ?, 'pending', ?)")
      .bind(crypto.randomUUID(), phone, name, new Date().toISOString()).run();
    return json({ ok: true });
  }

  // -- teacher: list pending applications -----------------------------------
  if (path === '/api/class/join-requests' && request.method === 'GET') {
    if (!isTeacher({ teacher: url.searchParams.get('teacher') })) {
      return json({ error: 'forbidden' }, 403);
    }
    const rows = await db
      .prepare("SELECT id, phone, name, status, created_at FROM join_requests WHERE status = 'pending' ORDER BY created_at ASC")
      .all();
    return json({ requests: (rows && rows.results) || [] });
  }

  // -- teacher: approve / deny ----------------------------------------------
  if (path === '/api/class/join-request/resolve' && request.method === 'POST') {
    const body = await readJsonBody(request);
    if (!body) return json({ error: 'bad_json' }, 400);
    if (!isTeacher(body)) return json({ error: 'forbidden' }, 403);
    const id = String(body.id || '').trim();
    const action = body.action === 'approve' ? 'approve' : 'deny';
    if (!id) return json({ error: 'missing_id' }, 400);
    const req = await db
      .prepare('SELECT id, phone FROM join_requests WHERE id = ?')
      .bind(id).first();
    if (!req) return json({ error: 'not_found' }, 404);
    await db
      .prepare('UPDATE join_requests SET status = ?, resolved_at = ? WHERE id = ?')
      .bind(action === 'approve' ? 'approved' : 'denied', new Date().toISOString(), id).run();
    if (action === 'approve') {
      // Lift the gate; the student re-registers on their next poll/login.
      await db
        .prepare('DELETE FROM removed_students WHERE phone = ?')
        .bind(req.phone).run();
    }
    return json({ ok: true, action: action });
  }

  return json({ error: 'not_found' }, 404);
}

// ---------------------------------------------------------------------------
// /api/wrong-questions/* — per-student wrong-answer archive (D1).
//
//   POST /api/wrong-questions/report   student: record a wrong answer
//   GET  /api/wrong-questions          teacher: list every row (or by student)
//   GET  /api/wrong-questions/by-student?student_id=...
//                                     teacher: list one student
//   DELETE /api/wrong-questions/by-student?student_id=...
//                                     teacher: clear one student's archive
//
// The report path is open — any phone that knows the schema can report. We
// don't gate it because the report carries the same data the local store
// already has; gating would just hide bugs, not secrets. Teacher-only reads
// remain gated by isTeacher().
// ---------------------------------------------------------------------------
async function wrongQuestionsApi(request, url, env) {
  const db = env.DB;
  if (!db) return json({ error: 'no_db' }, 500);
  const path = url.pathname;

  // -- student: report a wrong answer ---------------------------------------
  if (path === '/api/wrong-questions/report' && request.method === 'POST') {
    const body = await readJsonBody(request);
    if (!body) return json({ error: 'bad_json' }, 400);
    const studentId = String(body.student_id || '').trim();
    const studentPhone = String(body.student_phone || '').trim();
    const studentName = String(body.student_name || '').slice(0, 60);
    if (!studentId || !studentPhone || !studentName) {
      return json({ error: 'missing_fields' }, 400);
    }
    const dayIdx = Number(body.day_idx);
    const moduleIdx = Number(body.module_idx);
    const qIdx = Number(body.q_idx);
    const question = String(body.question || '').slice(0, 400);
    const correctAnswer = String(body.correct_answer || '').slice(0, 400);
    const studentAnswer = body.student_answer != null
      ? String(body.student_answer).slice(0, 400)
      : '';
    if (!Number.isInteger(dayIdx) || !Number.isInteger(moduleIdx)
        || !Number.isInteger(qIdx) || !question || !correctAnswer) {
      return json({ error: 'bad_fields' }, 400);
    }
    const id = crypto.randomUUID();
    try {
      await db.prepare(
        `INSERT INTO wrong_questions
          (id, student_id, student_name, student_phone, day_idx, module_idx, q_idx,
           question, correct_answer, student_answer, day_cn, module_cn,
           explanation_cn, explanation_en, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, studentId, studentName, studentPhone,
        dayIdx, moduleIdx, qIdx,
        question, correctAnswer, studentAnswer,
        String(body.day_cn || '').slice(0, 40),
        String(body.module_cn || '').slice(0, 40),
        String(body.explanation_cn || '').slice(0, 400),
        String(body.explanation_en || '').slice(0, 400),
        new Date().toISOString(),
      ).run();
      return json({ ok: true, id, recorded: true });
    } catch (e) {
      // UNIQUE violation = already recorded for this (student, day, module, q).
      // That is the expected path when a student retries — keep the first one.
      if (String(e && e.message || '').includes('UNIQUE')) {
        return json({ ok: true, recorded: false, duplicate: true });
      }
      return json({ error: 'db_error', detail: String(e && e.message || e) }, 500);
    }
  }

  // -- teacher: list all (or filter by student_id) --------------------------
  if (path === '/api/wrong-questions' && request.method === 'GET') {
    if (!isTeacher({ teacher: url.searchParams.get('teacher') })) {
      return json({ error: 'forbidden' }, 403);
    }
    const sid = url.searchParams.get('student_id');
    let rows;
    if (sid) {
      const r = await db.prepare(
        `SELECT id, student_id, student_name, student_phone, day_idx, module_idx, q_idx,
                question, correct_answer, student_answer, day_cn, module_cn,
                explanation_cn, explanation_en, recorded_at
         FROM wrong_questions WHERE student_id = ? ORDER BY day_idx, module_idx, q_idx`
      ).bind(sid).all();
      rows = (r && r.results) || [];
    } else {
      const r = await db.prepare(
        `SELECT id, student_id, student_name, student_phone, day_idx, module_idx, q_idx,
                question, correct_answer, student_answer, day_cn, module_cn,
                explanation_cn, explanation_en, recorded_at
         FROM wrong_questions ORDER BY recorded_at DESC LIMIT 1000`
      ).all();
      rows = (r && r.results) || [];
    }
    return json({ rows, count: rows.length });
  }

  // -- teacher: clear one student's archive ---------------------------------
  if (path === '/api/wrong-questions/by-student' && request.method === 'DELETE') {
    if (!isTeacher({ teacher: url.searchParams.get('teacher') })) {
      return json({ error: 'forbidden' }, 403);
    }
    const sid = url.searchParams.get('student_id');
    if (!sid) return json({ error: 'missing_student_id' }, 400);
    const r = await db.prepare(
      'DELETE FROM wrong_questions WHERE student_id = ?'
    ).bind(sid).run();
    return json({ ok: true, deleted: r.meta && r.meta.changes ? r.meta.changes : 0 });
  }

  return json({ error: 'not_found' }, 404);
}

function isTeacher(body) {
  return !!(body && String(body.teacher || '') === TEACHER_PHONE);
}

async function readJsonBody(request) {
  try { return await request.json(); } catch (e) { return null; }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// The app is served from the same origin in production, so CORS only matters
// for local development against `wrangler dev`.
function cors(res, env) {
  const allowed = (env && env.ALLOWED_ORIGIN) || '*';
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', allowed);
  h.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  h.set('Access-Control-Max-Age', '86400');
  return new Response(res.body, { status: res.status, headers: h });
}
