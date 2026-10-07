#!/usr/bin/env node
/**
 * 预生成「固定课程」的朗读音频，落成 public/tts/*.mp3 静态文件（v97）。
 *
 * 为什么做这件事
 *   /api/tts 的默认通道是按字符计费的（阿里云 qwen3-tts-flash，¥0.8/万字符）。
 *   课程内容是死的 —— 同一句 "What's your favorite subject at school?" 每个孩子、
 *   每台设备、每次重装都会去要一次。边缘缓存虽然能挡住大部分重复，但它一年后会
 *   过期、也可能被挤掉，一到期就重新计费。
 *   把全量合成好、当静态资源发布之后：这部分朗读永久零成本，只剩跟读识别花钱；
 *   顺带还快了（静态文件直出，不走 Worker、不碰上游）。
 *
 * 生成的是哪个音色
 *   默认 = 直连阿里云 qwen3-tts-flash / Jennifer，跟现在孩子听到的完全一致 ——
 *   换静态文件不会让音色发生变化。阿里云的 WAV 会转成 48kbps MP3（体积八分之一）。
 *   --engine=cf 换成 Cloudflare Deepgram 音色（免费，但每天额度有限，跑不完整批）。
 *
 * 用法
 *   node tools/pregen-tts.js --dry               只统计要生成多少条，不发请求
 *   node tools/pregen-tts.js                     正式生成（可重复跑，已生成的会跳过）
 *   node tools/pregen-tts.js --limit=20          本次最多生成 20 条（先小批试跑用这个）
 *   node tools/pregen-tts.js --audit             体检已生成的音频，时长不合常理的挑出来重做
 *   node tools/pregen-tts.js --engine=cf         换成 Cloudflare 音色
 *   node tools/pregen-tts.js --select=short      只做「单词 / 2~3 词短语」
 *   node tools/pregen-tts.js --select=short --force --engine=cf
 *                                                把短词的示范音换成 CF 音色（v98）
 *   node tools/pregen-tts.js --select=short --todo=noncf --engine=cf
 *                                                补漏：只做还没换到 CF 的那几条
 *   node tools/pregen-tts.js --reset             清空状态，全部重来（覆盖已有文件）
 *   node tools/pregen-tts.js --concurrency=4     并发（默认 3，别调太高）
 *
 * 跑之前先加载 Key：
 *   set -a; . ~/.workbuddy/secrets/cloudflare.env; set +a
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(PUBLIC_DIR, 'tts');
const STATE_FILE = path.join(__dirname, '.pregen-tts-state.json');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'tts-manifest.json');
const WORKER_MANIFEST = path.join(ROOT, 'worker', 'src', 'tts-manifest.js');

const ENDPOINT = process.env.PREGEN_ENDPOINT || 'https://amyeng.top';

// 静态通道探针：客户端只会请求题库里的真实文本，所以这个键谁也不会播到。
// 它存在的唯一目的是让「线上静态优先这条链路通不通」随时一条 curl 就能验证。
const PROBE_TEXT = '__static_probe__';
const PROBE_FILE = '_probe.mp3';

// ---------------------------------------------------------------- 命令行参数
function arg(name, dflt) {
  const hit = process.argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : dflt;
}
const DRY = process.argv.includes('--dry');
const RESET = process.argv.includes('--reset');
const AUDIT = process.argv.includes('--audit');
// ali（默认）= 直连阿里云 = Jennifer，跟线上现在的音色完全一致（推荐）。
// cf          = 走线上 worker 的 Cloudflare 通道 = Deepgram 母语音色 —— 免费，
//               但每天 neurons 额度有限（一百来句），而且跟当天的跟读识别抢额度，
//               整批跑不完，只适合试听对比。
const ENGINE = (arg('engine', 'ali') || 'ali').toLowerCase();
const LIMIT = parseInt(arg('limit', '0'), 10) || 0;
// --select=short：只处理「孩子单独点一下听的那个音」—— 单词、2~3 个词的短语。
// 句子不在内：句子的音色家长没意见，而且量大、跑一遍贵。见 isShortDemo。
const SELECT = (arg('select', '') || '').toLowerCase();
// --force：忽略状态文件里已有的记录，把选中的条目全部重做（换音色时用）。
const FORCE = process.argv.includes('--force');
// --todo=noncf：只做「还没换到 CF 音色」的那些。整批跑完之后补漏用 ——
// 个别条目会因为上游抖动 / 超时掉队，重跑一遍整批不值当（既慢又费额度）。
const TODO = (arg('todo', '') || '').toLowerCase();
const CONCURRENCY = Math.max(1, Math.min(6, parseInt(arg('concurrency', '3'), 10) || 3));
const RETRY = 3;

// 「短词/短语」的口径。之所以单拎出来，是因为这两类的听感是家长最容易挑的：
// 单词单独念一遍，机器味、口音、重音全暴露；句子一整句念过去反而听不出来。
function isShortDemo(t) {
  if (/[\u4e00-\u9fff]/.test(t)) return false;             // 中文归中文那条路
  if (t.length > 24) return false;
  if (!/^[A-Za-z][A-Za-z0-9'\- ]*$/.test(t)) return false;  // 纯英文词/短语
  return t.trim().split(/\s+/).length <= 3;
}

const ALIYUN_TTS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const ALIYUN_TTS_MODEL = 'qwen3-tts-flash';
const ALIYUN_TTS_VOICE_EN = 'Jennifer';   // 跟 worker/src/index.js 的 ALIYUN_TTS_VOICE_EN 保持一致

// 为什么直连阿里云、而不是走自家 /api/tts：
//   1. worker 有每日 3 万字符的保险上限（防止哪天出 bug 把账单跑飞）。整批 4.5 万字符
//      一趟跑下来会撞上限，后半截静默落到 Cloudflare —— 结果是同一个模块里两种音色，
//      孩子听得出"这句是人声、那句是另一个人"。这是预生成，本来就该绕开这个闸。
//   2. 预生成是一次性的运维动作，不该占用当天线上朗读的额度。
//   3. 少一跳，快一半。
// --engine=cf 例外：Cloudflare 那条通道要走 worker 的 AI 绑定，直连不了。
const loadLame = () => {
  // lamejs 的包入口有 MPEGMode 未定义的经典 bug，自带的 lame.all.js 才是完整打包，
  // eval 出来才能拿到能用的 Mp3Encoder。
  const candidates = ['lamejs/lame.all.js',
    'C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/lamejs/lame.all.js'];
  for (const c of candidates) {
    try {
      const src = fs.readFileSync(require.resolve(c), 'utf8');
      const l = (new Function(src + '; return lamejs;'))();
      if (l && l.Mp3Encoder) return l;
    } catch (e) { /* 换下一个 */ }
  }
  return null;
};

// ------------------------------------------------------------------ 载入 app.js
// 必须用客户端自己的 _ttsText 归一化，否则生成出来的键和服务端收到的 text 对不上，
// 静态文件永远命中不了。所以这里把 app.js 装进 vm，直接调它的那个函数。
function loadApp() {
  const noop = () => {};
  const makeEl = () => ({
    style: {}, classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
    innerHTML: '', textContent: '', value: '', dataset: {}, children: [],
    setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
    addEventListener: noop, removeEventListener: noop, appendChild: noop,
    removeChild: noop, insertBefore: noop, focus: noop, blur: noop, click: noop,
    querySelector: () => null, querySelectorAll: () => [], closest: () => null,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 }),
    scrollIntoView: noop, contains: () => false,
  });
  const doc = {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener: noop, removeEventListener: noop, createElement: makeEl,
    createDocumentFragment: makeEl, body: makeEl(), documentElement: makeEl(),
    head: makeEl(), cookie: '', hidden: false, visibilityState: 'visible',
  };
  const sandbox = {
    console, document: doc,
    window: { addEventListener: noop, removeEventListener: noop, document: doc, location: { hostname: 'amyeng.top' } },
    navigator: { userAgent: 'node', language: 'zh-CN', onLine: true, mediaDevices: {} },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    location: { hostname: 'amyeng.top', href: 'https://amyeng.top/', search: '', origin: 'https://amyeng.top' },
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask,
    fetch: () => Promise.resolve({ ok: false, status: 500 }),
    Audio: function () { return { play: noop, pause: noop, addEventListener: noop }; },
    MediaRecorder: function () { return { start: noop, stop: noop, addEventListener: noop }; },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: noop },
    Blob: function () {}, FormData: function () {}, Request: function () {}, Response: function () {},
    AbortController: function () { return { signal: {}, abort: noop }; },
    Date, Math, JSON, RegExp, Array, Object, String, Number, Boolean, Error, Promise, Set, Map,
    encodeURIComponent, decodeURIComponent, atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    alert: noop, confirm: () => false, prompt: () => null,
    speechSynthesis: { speak: noop, cancel: noop, getVoices: () => [] },
    matchMedia: () => ({ matches: false, addEventListener: noop }),
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 2,
    requestAnimationFrame: (fn) => setTimeout(fn, 0), cancelAnimationFrame: noop,
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    CustomEvent: function () {}, Event: function () {},
    IndexedDB: undefined, caches: { open: () => Promise.resolve(null) },
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.window.document = doc;
  sandbox.window.navigator = sandbox.navigator;
  vm.createContext(sandbox);

  const dataSrc = fs.readFileSync(path.join(PUBLIC_DIR, 'data.js'), 'utf8');
  vm.runInContext(dataSrc, sandbox, { filename: 'data.js' });

  let appSrc = fs.readFileSync(path.join(PUBLIC_DIR, 'app.js'), 'utf8');
  // 去掉结尾的 App.init()：我们只要它的纯函数，不要它去碰 DOM。
  const tail = appSrc.lastIndexOf('\n// Init\nApp.init();');
  if (tail > 0) appSrc = appSrc.slice(0, tail);
  vm.runInContext(appSrc, sandbox, { filename: 'app.js' });

  const App = sandbox.App || vm.runInContext('App', sandbox);
  if (!App || typeof App._ttsText !== 'function') {
    throw new Error('app.js 里取不到 _ttsText：载入方式可能变了，先修 tools/pregen-tts.js');
  }
  return { App, sandbox };
}

// -------------------------------------------------------------------- 枚举
// 按模块类型逐个取「孩子会听到的英文」。只收白名单字段 —— 把数据整棵树 walk
// 一遍会把 id（"mon-sp1"）、中文讲解、分值这些也卷进来，白花钱。
function enumerate(App, sandbox) {
  const W = sandbox.HOMEWORK_WEEKS || vm.runInContext('HOMEWORK_WEEKS', sandbox);
  const raw = [];
  const add = (v) => { if (typeof v === 'string' && v.trim()) raw.push(v); };
  const addAll = (arr) => { if (Array.isArray(arr)) arr.forEach(add); };

  // 阅读理解/完形填空的整段：客户端是逐句播的，按句切。
  const sentences = (s) => String(s || '').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);

  (W || []).forEach((week) => (week || []).forEach((day) => {
    ((day && day.modules) || []).forEach((m) => {
      if (!m) return;
      const t = m.type;
      // 题面 + 选项：几乎所有题型的听入口都在这里
      ((m.questions) || []).forEach((q) => {
        if (!q) return;
        add(q.sentence);        // speaking：问句/示范句
        add(q.audio_text);      // listening：真正要被听到的那句话
        add(q.question);
        addAll(q.options);
      });
      if (t === 'vocabulary_game') {
        (m.words || []).forEach((w) => {
          if (!w) return;
          add(w.word);          // 整词（字母/syllable 单独处理）
          add(w.example_en);
          addAll(w.syllables);
          (w.stages || []).forEach((st) => {
            if (!st) return;
            add(st.prompt);     // 多数是中文（会被 _ttsText 滤掉），spell_fill 有用
            addAll(st.options);
          });
        });
      }
      if (t === 'reading' || t === 'cloze') sentences(m.passage).forEach(add);
      if (t === 'writing_template') {
        add(m.title);
        add(m.template);
        add(m.full_text);
        addAll(m.keywords);
        (m.blanks || []).forEach((b) => { if (b) add(b.hint_en); });
      }
    });
  }));

  const texts = new Set();
  let skippedLetter = 0;
  raw.forEach((s) => {
    const t = App._ttsText(s).substring(0, 500).trim();
    if (!t) return;
    if (!/[A-Za-z]/.test(t)) return;      // 纯中文/纯符号：不归 TTS
    // 单个字母不进静态表：字母名读音一直是走有道（免费且标准），
    // 而且阿里云读孤立字母很糟 —— 保留原有路由，别把它冻进静态文件。
    if (/^[a-z]$/i.test(t)) { skippedLetter++; return; }
    texts.add(t);
  });
  return { texts: [...texts].sort(), skippedLetter, rawCount: raw.length };
}

// -------------------------------------------------------------------- 体检
// 阿里云对孤立短词 / 无意义片段（音节、完形填空的 "5 blank" 之类）偶尔会吐出一段
// 十几秒的怪音 —— 实测 "forget" 生成了 10.8 秒的日文（ASR 反听是「おっけおっけ…」）。
// 一次生成不好就永久冻在静态文件里，所以必须过一遍。
//
// 判据只用一个客观量：MP3 是 CBR 48kbps，时长 = 字节数 × 8 / 48000。
// 正常语速约 13 字符/秒，偏离太远就重做；重做取「离预期最近」的那条。
const MP3_BPS = 48000;
const clipSeconds = (file) => {
  try { return fs.statSync(path.join(OUT_DIR, file)).size * 8 / MP3_BPS; } catch (e) { return 0; }
};
const expectedSeconds = (text) => Math.max(0.5, text.length / 13);
const auditScore = (text, file) => {
  const dur = clipSeconds(file);
  const exp = expectedSeconds(text);
  return { dur, exp, score: Math.abs(Math.log(Math.max(dur, 0.01) / exp)) };
};

async function runAudit(lame) {
  const state = readState();
  state.files = state.files || {};
  const texts = Object.keys(state.files)
    .filter((t) => t !== PROBE_TEXT && fs.existsSync(path.join(OUT_DIR, state.files[t].file)));

  const flagged = [];
  for (const t of texts) {
    const f = state.files[t].file;
    const dur = clipSeconds(f);
    const exp = expectedSeconds(t);
    if (dur > Math.max(2.5, 2.2 * exp) || dur < 0.30) flagged.push(t);
  }

  console.log('');
  console.log('  体检 ' + texts.length + ' 条，时长不合常理 ' + flagged.length + ' 条：');
  flagged.forEach((t) => {
    const a = auditScore(t, state.files[t].file);
    console.log('    ' + a.dur.toFixed(2) + 's / 预期 ' + a.exp.toFixed(2) + 's   ' + JSON.stringify(t.slice(0, 50)));
  });
  if (!flagged.length) return;

  console.log('\n  重做（每条最多 3 次，取离预期最近的）…');
  let fixed = 0;
  for (const t of flagged) {
    const before = auditScore(t, state.files[t].file);
    let best = null;
    let lastErr = '';
    for (let k = 0; k < 3; k++) {
      try {
        const got = await fetchOneRaw(t, lame);
        const tmpName = state.files[t].file + '.tmp';
        fs.writeFileSync(path.join(OUT_DIR, tmpName), got.buf);
        const cand = { buf: got.buf, dur: clipSeconds(tmpName) };
        fs.rmSync(path.join(OUT_DIR, tmpName));
        cand.score = Math.abs(Math.log(Math.max(cand.dur, 0.01) / before.exp));
        if (!best || cand.score < best.score) best = cand;
        if (best.score < 0.25) break;      // 已经够贴合，不用再试
      } catch (e) {
        lastErr = String((e && e.message) || e);
        await new Promise((r) => setTimeout(r, 1200));   // 连着打太快会被阿里云 429
      }
    }
    if (best && best.score < before.score) {
      fs.writeFileSync(path.join(OUT_DIR, state.files[t].file), best.buf);
      state.files[t].bytes = best.buf.length;
      state.files[t].at = new Date().toISOString();
      state.files[t].fixed = true;
      fixed++;
      console.log('    ✓ ' + before.dur.toFixed(2) + 's → ' + best.dur.toFixed(2) + 's  ' + JSON.stringify(t.slice(0, 46)));
    } else {
      console.log('    · 保留原样 ' + before.dur.toFixed(2) + 's  ' + JSON.stringify(t.slice(0, 40))
        + (lastErr ? '   [' + lastErr + ']' : ''));
    }
    writeState(state);
    await new Promise((r) => setTimeout(r, 300));        // 条目之间留点间隔
  }
  console.log('\n  ✅ 修好 ' + fixed + ' / ' + flagged.length + ' 条');
}

// fetchOne 的单次版本（不做重试包装），体检重做时用。
async function fetchOneRaw(text, lame) {
  const got = ENGINE === 'cf' ? await fetchViaWorker(text, 'cf') : await fetchAliyunDirect(text);
  return { buf: ENGINE === 'cf' ? got.buf : wavToMp3(got.buf, lame) };
}


// -------------------------------------------------------------------- 状态
function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return { files: {} }; }
}
function writeState(st) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 0));
}
function fileNameFor(text, engine) {
  // 文件名带上音色（v98）。原因：静态文件是按路径长缓存的（一年 immutable），
  // 换音色时如果沿用同一个文件名，孩子手机里那份旧读音一年都换不掉。把音色
  // 编进哈希，换音色 = 换文件名 = 天然破缓存，旧文件由下面的孤儿清理收走。
  const tag = (engine || ENGINE || 'ali') + '|';
  return crypto.createHash('sha1').update(tag + text, 'utf8').digest('hex').slice(0, 20) + '.mp3';
}

// -------------------------------------------------------------------- 生成
// WAV → MP3。阿里云只给 24kHz 单声道 WAV：一句 3 秒的话就是 142KB，1888 条下来
// 150MB+ —— 塞进静态资源里又慢又笨。转成 48kbps MP3 后压到八分之一（约 18KB
// 一句），孩子手机上第一声出来的也快得多。用 lamejs（纯 JS，不依赖 ffmpeg）。
function wavToMp3(buf, lame) {
  if (buf.length < 44 || buf.subarray(0, 4).toString('ascii') !== 'RIFF') return buf; // 不是 WAV 就原样返回
  let pos = 12, ch = 1, rate = 24000, bits = 16, dataOff = -1, dataLen = 0;
  while (pos + 8 <= buf.length) {
    const id = buf.subarray(pos, pos + 4).toString('ascii');
    // 阿里云这个 WAV 的尺寸字段是假的（0x7FFFFFBF 这种占位值），一律按实际长度夹紧。
    const sz = buf.readUInt32LE(pos + 4);
    if (id === 'fmt ') { ch = buf.readUInt16LE(pos + 10); rate = buf.readUInt32LE(pos + 12); bits = buf.readUInt16LE(pos + 22); }
    if (id === 'data') { dataOff = pos + 8; dataLen = Math.min(sz, buf.length - pos - 8); break; }
    pos += 8 + sz + (sz % 2);
  }
  if (dataOff < 0 || bits !== 16) return buf;
  const n = Math.floor(dataLen / 2);
  const pcm = new Int16Array(n);
  for (let i = 0; i < n; i++) pcm[i] = buf.readInt16LE(dataOff + i * 2);
  const enc = new lame.Mp3Encoder(ch, rate, 48);
  const out = [];
  const CHUNK = 1152;
  for (let i = 0; i < n; i += CHUNK) {
    const b = enc.encodeBuffer(pcm.subarray(i, Math.min(i + CHUNK, n)));
    if (b.length) out.push(Buffer.from(b));
  }
  const tail = enc.flush();
  if (tail.length) out.push(Buffer.from(tail));
  const mp3 = Buffer.concat(out);
  return mp3.length > 500 ? mp3 : buf;
}

// 直连阿里云 TTS。入参形状与 worker/src/index.js 的 aliyunTtsAudio 一致 ——
// 两边必须同音色同参数，否则静态文件跟线上听起来是两个人。
async function fetchAliyunDirect(text) {
  const key = process.env.ALIYUN_KEY || process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('缺 ALIYUN_KEY（先 source ~/.workbuddy/secrets/cloudflare.env）');
  const res = await fetch(ALIYUN_TTS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ALIYUN_TTS_MODEL,
      input: { text, voice: ALIYUN_TTS_VOICE_EN, language_type: 'English' },
    }),
  });
  if (!res.ok) throw new Error('aliyun_http_' + res.status);
  const data = await res.json();
  const url = data && data.output && data.output.audio && data.output.audio.url;
  if (!url) throw new Error('aliyun_no_url ' + JSON.stringify(data).slice(0, 120));
  const a = await fetch(url);
  if (!a.ok) throw new Error('aliyun_oss_' + a.status);
  const buf = Buffer.from(await a.arrayBuffer());
  if (buf.length < 500) throw new Error('音频过短 ' + buf.length + 'B');
  return { buf, source: 'aliyun' };
}

// 走自家 worker（--engine=cf 时用）。
async function fetchViaWorker(text, engine) {
  const qs = '?text=' + encodeURIComponent(text) + (engine ? '&engine=' + engine : '');
  const res = await fetch(ENDPOINT + '/api/tts' + qs, {
    headers: { 'User-Agent': 'curl/8.4.0' },
    // 一条不回来不能把整批拖死 —— 上游抖动时 25 秒还没影子就直接重试。
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const ct = res.headers.get('content-type') || '';
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error('音频过短 ' + buf.length + 'B');
  if (ct && !/audio|octet-stream|mpeg|wav/i.test(ct)) throw new Error('content-type ' + ct);
  const source = res.headers.get('x-tts-source') || 'worker';
  // 指定了 engine=cf 却拿到别的来源（额度耗尽时 worker 会落到免费兜底通道）：
  // 这不是我们要的音色，当失败处理，让上层重试 / 留给人工。
  if (engine === 'cf' && source !== 'cf') throw new Error('不是 cf 音色（source=' + source + '）');
  return { buf, source };
}

async function fetchOne(text, lame) {
  let lastErr = null;
  for (let k = 0; k < RETRY; k++) {
    try {
      const got = ENGINE === 'cf' ? await fetchViaWorker(text, 'cf') : await fetchAliyunDirect(text);
      return { buf: ENGINE === 'cf' ? got.buf : wavToMp3(got.buf, lame), source: got.source };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (k + 1)));
    }
  }
  throw lastErr || new Error('unknown');
}

// 写两份清单（给人看的 JSON + 服务端 import 的 JS 模块）。
// 只收「文件真的在盘上」的条目 —— 服务端拿它做静态命中，写错了会 404。
function writeManifests(state) {
  const manifest = {};
  Object.keys(state.files).forEach((t) => {
    const f = state.files[t];
    if (fs.existsSync(path.join(OUT_DIR, f.file))) manifest[t] = f.file;
  });

  // 探针：客户端永远不会请求这个键，它只用来确认线上「静态优先」这条通道是活的
  // （curl 一下看响应头是不是 X-TTS-Source: static）。永远留在清单里。
  const probeDst = path.join(OUT_DIR, PROBE_FILE);
  if (!fs.existsSync(probeDst)) {
    const probeSrc = path.join(PUBLIC_DIR, 'voicetest', 'cf-default-1.mp3');
    if (fs.existsSync(probeSrc)) fs.copyFileSync(probeSrc, probeDst);
  }
  if (fs.existsSync(probeDst)) manifest[PROBE_TEXT] = PROBE_FILE;

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest));
  const entries = Object.keys(manifest).map((k) => JSON.stringify(k) + ':' + JSON.stringify(manifest[k])).join(',\n  ');
  fs.writeFileSync(WORKER_MANIFEST,
    '// 由 tools/pregen-tts.js 生成，请勿手改。text → public/tts/ 下的文件名。\n' +
    '// 服务端 /api/tts 命中这张表就直接回静态文件：不调上游、不花字符费。\n' +
    'export default {\n  ' + entries + '\n};\n');
  return manifest;
}

async function main() {
  console.log('载入 app.js 取 _ttsText …');
  const { App, sandbox } = loadApp();
  const { texts, skippedLetter, rawCount } = enumerate(App, sandbox);
  const chars = texts.reduce((a, t) => a + t.length, 0);

  console.log('');
  console.log('  题库原始字符串         ' + rawCount);
  console.log('  归一后唯一朗读文本     ' + texts.length + ' 条');
  console.log('  其中单字母（走原路由） ' + skippedLetter + ' 条');
  console.log('  合计字符数             ' + chars);
  console.log('  按 ¥0.8/万字符 折算    ¥' + (chars * 0.8 / 10000).toFixed(2));

  if (DRY) {
    console.log('\n--dry：只看统计，不发请求。样例：');
    texts.slice(0, 12).forEach((t) => console.log('    ' + JSON.stringify(t.slice(0, 70))));
    return;
  }

  if (RESET) {
    try { fs.rmSync(STATE_FILE); } catch (e) {}
    console.log('已清空状态文件，全部重新生成。');
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  if (AUDIT) {
    const lameA = loadLame();
    if (!lameA) { console.error('体检重做需要 lamejs，先按上面的命令装一下。'); process.exit(1); }
    await runAudit(lameA);
    const m = writeManifests(readState());
    console.log('  清单累计 ' + Object.keys(m).length + ' 条（体检改过文件 → 记得重新 deploy）');
    return;
  }

  const state = readState();
  state.files = state.files || {};

  // 选出本次要处理的范围。默认是全部；--select=short 只挑单词/短语。
  let pool = texts;
  if (SELECT === 'short') {
    pool = texts.filter(isShortDemo);
    console.log('  --select=short：「单词 / 2~3 词短语」共 ' + pool.length + ' 条');
  }
  const todo = pool.filter((t) => {
    if (TODO === 'noncf') {
      const f = state.files[t];
      return !f || f.source !== 'cf';
    }
    if (FORCE) return true;
    const f = state.files[t];
    if (!f) return true;
    return !fs.existsSync(path.join(OUT_DIR, f.file));
  });
  const batch = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;

  // 旧文件：换音色会换文件名（见 fileNameFor），被替下来的那份就没人引用了。
  // 先记下来，全跑完再统一清，中途出错也不会误删还在用的文件。
  const retired = [];
  batch.forEach((t) => {
    const f = state.files[t];
    if (f && f.file) retired.push(f.file);
  });

  const lame = loadLame();
  if (ENGINE !== 'cf' && !lame) {
    console.error('\n找不到 lamejs（MP3 编码器）。阿里云只返回 WAV，1888 条会撑到 150MB+，');
    console.error('必须先转 MP3。装一下再跑：');
    console.error('  cd C:/Users/amyma/.workbuddy/binaries/node/workspace');
    console.error('  node C:/Users/amyma/.workbuddy/binaries/node/versions/22.22.2-6/node_modules/npm/bin/npm-cli.js install lamejs');
    process.exit(1);
  }

  console.log('');
  console.log('  待生成 ' + todo.length + ' 条，本次跑 ' + batch.length + ' 条（并发 ' + CONCURRENCY + '）');
  console.log('  通道 ' + (ENGINE === 'cf'
    ? 'Cloudflare Deepgram 音色（经 ' + ENDPOINT + '）'
    : '直连阿里云 ' + ALIYUN_TTS_MODEL + ' / ' + ALIYUN_TTS_VOICE_EN + '（→ 48kbps MP3）'));
  console.log('');

  let done = 0, fail = 0, bytes = 0;
  const errors = [];
  const t0 = Date.now();

  let cursor = 0;
  async function worker() {
    while (cursor < batch.length) {
      const text = batch[cursor++];
      const file = fileNameFor(text, ENGINE);
      try {
        const { buf, source } = await fetchOne(text, lame);
        // 体积体检：同一段文字换音色，时长不会差出好几倍。差太多说明合成跑偏了
        // —— 阿里云出过"forget 生成 10.8 秒日文"这种，换 CF 也一样要防。
        const prev = state.files[text];
        if (prev && prev.bytes && (buf.length > prev.bytes * 6 || buf.length < prev.bytes / 6)) {
          throw new Error('体积异常 ' + buf.length + 'B vs 上一版 ' + prev.bytes + 'B');
        }
        fs.writeFileSync(path.join(OUT_DIR, file), buf);
        state.files[text] = { file, bytes: buf.length, source, at: new Date().toISOString() };
        bytes += buf.length;
        done++;
        if (done % 20 === 0) {
          writeState(state);
          const secs = (Date.now() - t0) / 1000;
          console.log('  ... ' + done + '/' + batch.length + '  ' + (bytes / 1048576).toFixed(1) + 'MB  ' + secs.toFixed(0) + 's');
        }
      } catch (e) {
        fail++;
        errors.push({ text: text.slice(0, 60), err: String(e && e.message || e) });
        if (fail <= 5) console.log('  ✗ ' + JSON.stringify(text.slice(0, 50)) + '  ' + (e && e.message));
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  writeState(state);

  // 孤儿清理：只有 state 里记着的文件才算"在用"。被换掉的旧音色文件、或者
  // 生成到一半留下的半成品，都在这儿收走 —— 不然每换一次音色，仓库里就多
  // 躺一份没人引用的死重量。
  const alive = new Set(Object.keys(state.files).map((t) => state.files[t].file));
  alive.add(PROBE_FILE);
  let pruned = 0;
  let prunedBytes = 0;
  if (fs.existsSync(OUT_DIR)) {
    for (const f of fs.readdirSync(OUT_DIR)) {
      if (alive.has(f)) continue;
      try {
        const p = path.join(OUT_DIR, f);
        prunedBytes += fs.statSync(p).size;
        fs.rmSync(p);
        pruned++;
      } catch (e) {}
    }
  }

  const manifest = writeManifests(state);

  const secs = (Date.now() - t0) / 1000;
  console.log('');
  console.log('  ✅ 本次生成 ' + done + ' 条，失败 ' + fail + ' 条，共 ' + (bytes / 1048576).toFixed(1) + 'MB，用时 ' + secs.toFixed(0) + 's');
  if (pruned) console.log('  🧹 清掉无人引用的旧文件 ' + pruned + ' 个（' + (prunedBytes / 1048576).toFixed(2) + 'MB）');
  console.log('  清单累计 ' + Object.keys(manifest).length + ' 条 → public/tts-manifest.json');
  if (todo.length > batch.length) {
    console.log('  ⏳ 还剩 ' + (todo.length - batch.length) + ' 条没生成（--limit 限制），再跑一次本脚本继续。');
  }
  if (errors.length) {
    console.log('  失败样例：');
    errors.slice(0, 8).forEach((e) => console.log('    ' + JSON.stringify(e.text) + '  ' + e.err));
  }
  // 失败超过一半就明确提示：多半是 Cloudflare 当天额度用完了，明天再跑。
  if (fail && fail >= Math.max(3, batch.length * 0.5)) {
    console.log('  ⚠️ 失败率过半：如果是 --engine=cf，基本就是当天免费额度用完了，隔天再跑剩下的。');
  }
}

main().catch((e) => { console.error('生成失败：', e); process.exit(1); });
