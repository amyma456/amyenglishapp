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
// Responses are cached — 45 children read the same sentences over and over,
// so almost every request after the first is a cache hit and costs nothing.
const TTS_MODEL = '@cf/deepgram/aura-2-en';
const TTS_MAX_CHARS = 900;

async function tts(request, env, ctx) {
  const url = new URL(request.url);
  const text = (url.searchParams.get('text') || '').trim();
  if (!text) return json({ error: 'no_text' }, 400);
  if (text.length > TTS_MAX_CHARS) return json({ error: 'too_long' }, 413);

  const cacheKey = new Request(url.origin + '/api/tts?text=' + encodeURIComponent(text), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let audio;
  try {
    audio = await env.AI.run(TTS_MODEL, { text: text });
  } catch (e) {
    return json({ error: 'tts_failed', detail: String(e && e.message || e) }, 502);
  }

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

  const res = new Response(body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
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

// turbo 要 base64 字符串；默认 whisper 要 [0..255,...] 整数数组。形状不能混，
// 混了不是"效果差一点"，而是直接 500 —— 孩子这一次朗读的分数就没了。
function fastInput(bytes, mode) {
  const input = { audio: toBase64(bytes), task: 'transcribe', language: 'en' };
  if (mode === 'letter') {
    input.initial_prompt = 'The speaker is reading single English alphabet letters aloud, one at a time.';
  }
  return input;
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
    bytes = new Uint8Array(buf);
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

  try {
    let out = null;
    let model = MODEL;
    if (wantFast) {
      try {
        out = await env.AI.run(TURBO_MODEL, fastInput(bytes, mode));
        model = TURBO_MODEL;
      } catch (e) {
        // 快模型额度用尽、临时故障、入参不兼容 —— 任何一种都不能让孩子这
        // 一次朗读变成"出分失败"。静默降级，下面用默认模型兜住。
        out = null;
      }
    }

    let text = (out && out.text ? out.text : '').trim();
    // 快模型对特别短的片段、或者声音很小的孩子可能返回空。这时多花一次调用
    // 换回默认模型，孩子不用重读一遍。
    //
    // NOTE: @cf/openai/whisper accepts only `audio` — language and
    // initial_prompt are ignored (tested: a Simplified-Chinese prompt still
    // returned Traditional). Chinese is normalised on the client instead.
    if (!text) {
      out = await env.AI.run(MODEL, { audio: [...bytes] });
      model = MODEL;
      text = (out && out.text ? out.text : '').trim();
    }

    return json({
      model: model,
      text: text,
      words: (out && out.words) || null,
      wordCount: (out && out.word_count) || null,
    });
  } catch (e) {
    // Model errors and quota exhaustion both land here. The client falls back
    // to self-assessment and queues the clip for a retry.
    return json({ error: 'transcribe_failed', detail: String(e && e.message || e) }, 502);
  }
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
