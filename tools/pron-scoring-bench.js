/* eslint-disable */
// 跟读评分的客观体检（v96）。
//
// 为什么要有这个工具：家长反复反馈「学生读得好好的，系统判错」。这句话没法
// 靠读代码证实或证伪 —— ASR 会把读对的词写成别的样子（"I'm" → "I am"、
// subjects → subject、library → libary），判定逻辑的容错够不够只有拿真音频
// 跑一遍才知道。
//
// 做法：拿真实题库里的口语题，用 TTS 合成一版「标准读音」（等于一个读得完美
// 的孩子），送进线上 /api/transcribe，再把识别结果喂给 app.js 里真正跑的那份
// alignSpeech / _wordPassable，看它判不判过。同时用「别的题的音频」做反向对照，
// 保证容错没有松到「读错也能过」。
//
// 用法：
//   ALIYUN_KEY=sk-xxx node tools/pron-scoring-bench.js [--engine=ali|cf|both]
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const KEY = process.env.ALIYUN_KEY || process.env.DASHSCOPE_API_KEY || '';
if (!KEY) { console.error('缺少 ALIYUN_KEY'); process.exit(1); }

const ENDPOINT = process.env.PRON_ENDPOINT || 'https://amyeng.top/api/transcribe';
const TTS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const VOICE = 'Jennifer';

// ---------- 载入 app.js 里真正的判定代码 ----------
function loadApp() {
  let src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  const noop = function() {};
  const fakeEl = {
    style: {}, classList: { add: noop, remove: noop, contains: function() { return false; } },
    innerHTML: '', textContent: '', setAttribute: noop, getAttribute: function() { return null; },
    addEventListener: noop, appendChild: noop, querySelector: function() { return null; },
    querySelectorAll: function() { return []; }, closest: function() { return null; },
  };
  const sandbox = {
    console: console,
    document: {
      getElementById: function() { return null; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      addEventListener: noop,
      createElement: function() { return Object.assign({}, fakeEl); },
      body: fakeEl,
    },
    window: { addEventListener: noop, speechSynthesis: null },
    navigator: { mediaDevices: null, userAgent: 'node' },
    localStorage: { getItem: function() { return null; }, setItem: noop, removeItem: noop },
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    fetch: function() { return Promise.resolve({ ok: false, status: 500 }); },
    Audio: function() { return { play: noop, pause: noop }; },
    URL: URL, Blob: function() {}, Date: Date, Math: Math, JSON: JSON,
    encodeURIComponent: encodeURIComponent, atob: atob, btoa: btoa,
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(src + '\n;globalThis.__App = App;', ctx, { filename: 'app.js' });
  return sandbox.__App;
}

// ---------- 从真实题库取「问句 + 正确答句」的整句 ----------
function loadSentences() {
  const sb = {}; vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/data.js'), 'utf8') + '\n;__W=HOMEWORK_WEEKS;', sb);
  const out = [];
  sb.__W.forEach(function(week) {
    week.forEach(function(day) {
      (day.modules || []).forEach(function(m) {
        if (m.type !== 'speaking' || !m.questions) return;
        m.questions.forEach(function(q) {
          const ans = q.options && q.options[q.answer];
          if (!ans) return;
          const s = String(q.sentence || '').trim().replace(/[?？]\s*$/, '?');
          out.push({ sentence: s + ' ' + String(ans).trim(), word: String(ans).trim().split(/\s+/).pop().replace(/[^a-z]/gi, '') });
        });
      });
    });
  });
  return out;
}

// ---------- TTS：合成一版标准读音 ----------
async function synth(text) {
  const r = await fetch(TTS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen3-tts-flash', input: { text: text, voice: VOICE, language_type: 'English' } }),
  });
  const d = await r.json();
  const url = d && d.output && d.output.audio && d.output.audio.url;
  if (!url) throw new Error('tts_failed ' + JSON.stringify(d).slice(0, 200));
  const a = await fetch(url);
  return Buffer.from(await a.arrayBuffer());
}

// ---------- 送识别，计延迟 ----------
async function asr(buf, engine) {
  const qs = engine === 'ali' ? '?engine=ali' : '?model=turbo';
  const t0 = Date.now();
  const r = await fetch(ENDPOINT + qs, { method: 'POST', headers: { 'Content-Type': 'audio/mpeg' }, body: buf });
  const d = await r.json();
  return { ms: Date.now() - t0, text: (d.text || '').trim(), model: d.model };
}

const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async function main() {
  const arg = process.argv.find(a => a.indexOf('--engine=') === 0);
  const engines = arg ? [arg.split('=')[1]] : ['ali', 'cf'];
  const App = loadApp();
  const all = loadSentences();
  // 均匀取样，覆盖 4 周 7 天，别只测第一课
  const pick = [];
  const step = Math.max(1, Math.floor(all.length / 12));
  for (let i = 0; i < all.length && pick.length < 12; i += step) pick.push(all[i]);
  console.log('题库口语题共 ' + all.length + ' 句，抽样 ' + pick.length + ' 句，音色 ' + VOICE + '\n');

  const rows = [];
  for (let i = 0; i < pick.length; i++) {
    const s = pick[i].sentence;
    let audio;
    try { audio = await synth(s + '.'); } catch (e) { console.log('  TTS 失败，跳过：' + s); continue; }
    const row = { sentence: s, word: pick[i].word, audio: audio, runs: {} };
    for (const eng of engines) {
      let best = null;
      for (let k = 0; k < 2; k++) {                 // 跑两次，取快的那次（冷启动不算在延迟里）
        const r = await asr(audio, eng);
        if (!best || r.ms < best.ms) best = r;
        if (r.text) { best = r; if (k === 0 && r.ms < 2500) break; }
      }
      const a = App.alignSpeech(s, best.text || '');
      const bad = a.items.filter(x => x.target && x.status !== 'ok').map(x => x.target);
      row.runs[eng] = { ms: best.ms, text: best.text, score: a.score, bad: bad };
    }
    rows.push(row);
    const p = row.runs[engines[0]];
    console.log('  ' + String(i + 1).padStart(2) + '. ' + String(p.ms + 'ms').padStart(7)
      + '  ' + String(p.score + '分').padStart(6)
      + (p.bad.length ? '  ❌ 判错: ' + p.bad.join(',') : '  ✅')
      + '\n      ' + s);
    if (p.bad.length) console.log('      听到: ' + p.text);
    await sleep(300);
  }

  console.log('\n================ 汇总 ================');
  for (const eng of engines) {
    const ok = rows.filter(r => r.runs[eng] && r.runs[eng].bad.length === 0).length;
    const ms = rows.map(r => r.runs[eng] && r.runs[eng].ms).filter(Boolean).sort((a, b) => a - b);
    const med = ms.length ? ms[Math.floor(ms.length / 2)] : 0;
    // 反听准确度：识别文本对目标句的逐词命中率
    const hit = rows.map(r => r.runs[eng] && r.runs[eng].score).filter(v => v != null);
    const avg = hit.length ? Math.round(hit.reduce((a, b) => a + b, 0) / hit.length) : 0;
    console.log(eng === 'ali' ? '阿里云 qwen3-asr-flash' : 'Cloudflare whisper-turbo');
    console.log('  判定通过率  ' + ok + '/' + rows.length + '  (' + pct(ok, rows.length) + '%)   ← 目标 100%');
    console.log('  逐词平均分  ' + avg + ' 分');
    console.log('  识别延迟    中位数 ' + med + 'ms   最慢 ' + (ms[ms.length - 1] || 0) + 'ms');
  }

  // ---- 反向对照：拿 A 句的音频去对 B 句，必须判不过 ----
  console.log('\n---- 反向对照（读错就该判错）----');
  let falsePass = 0;
  for (let i = 0; i + 1 < rows.length; i++) {
    const A = rows[i], B = rows[i + 1];
    const eng = engines[0];
    const a = App.alignSpeech(A.sentence, B.runs[eng].text || '');
    if (a.score >= 60 && !a.items.some(x => x.target && x.status !== 'ok')) {
      falsePass++;
      console.log('  ✗ 张冠李戴却判过：' + A.sentence);
    }
  }
  console.log('  ' + (falsePass ? '❌ ' + falsePass + ' 组误放行' : '✅ 全部正确拦下（0 组误放行）'));
  process.exit(0);
})();
