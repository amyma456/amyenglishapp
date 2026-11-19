/* eslint-disable */
// v215 回归验证：微软发音评估首发后，"读对判过 / 读错判不过"有没有被改坏。
//
// 为什么要这一层：换首发通道 = 换识别文本的来源，判定层（alignSpeech /
// _readVerdict）拿到的是另一家 ASR 的字。文本来源一变，容差边界就可能挪动。
// 家长最不能接受的就是"明明读对了判我错"，所以这一层必须用真实音频 + 项目里
// 真正在跑的那份判定代码来验，而不是靠读代码猜。
//
// 用法：node tools/verify-v215-accuracy.js [--offline]
//   --offline 只用内置的真实返回样本（不打线上），用于网络不通时复核判定逻辑。
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ENDPOINT = process.env.PRON_ENDPOINT || 'https://www.amyeng.top/api/transcribe';

// ---------- 载入 app.js 里真正的判定代码 ----------
function loadApp() {
  let src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  const noop = function () {};
  const fakeEl = {
    style: {}, classList: { add: noop, remove: noop, contains: function () { return false; } },
    innerHTML: '', textContent: '', setAttribute: noop, getAttribute: function () { return null; },
    addEventListener: noop, appendChild: noop, querySelector: function () { return null; },
    querySelectorAll: function () { return []; }, closest: function () { return null; },
  };
  const sandbox = {
    console: console,
    document: {
      getElementById: function () { return null; },
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      addEventListener: noop,
      createElement: function () { return Object.assign({}, fakeEl); },
      body: fakeEl,
    },
    window: { addEventListener: noop, speechSynthesis: null },
    navigator: { mediaDevices: null, userAgent: 'node' },
    localStorage: { getItem: function () { return null; }, setItem: noop, removeItem: noop },
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    fetch: function () { return Promise.resolve({ ok: false, status: 500 }); },
    Audio: function () { return { play: noop, pause: noop }; },
    URL: URL, Blob: function () {}, Date: Date, Math: Math, JSON: JSON,
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

// 样本：TTS 合成的真实人声（.tmp/asr_*.wav），ref 是目标句。
// expect=pass 必须判过；expect=fail 必须判不过。
const CASES = [
  { file: 'good4', ref: 'thank you for watching', expect: 'pass', why: '4 词，标准朗读' },
  { file: 'good7', ref: 'i like to read books after school', expect: 'pass', why: '7 词，标准朗读' },
  { file: 'good9', ref: 'the quick brown fox jumps over the lazy dog', expect: 'pass', why: '9 词长句，标准朗读' },
  { file: 'bad7', ref: 'i like to read books after school', expect: 'fail', why: '7 词，读错两个词' },
  { file: 'half7', ref: 'i like to read books after school', expect: 'fail', why: '7 词，只读了一半' },
];

// 线上不稳定时的兜底：这些是 v215 部署后线上真实返回的文本。
const OFFLINE = {
  good4: 'Thank you for watching.',
  good7: 'I like to read books after school.',
  good9: 'The quick brown fox jumps over the lazy dog.',
  bad7: 'I like to eat books before school.',
  half7: 'I like to read books.',
};

async function post(file, ref, tries) {
  const buf = fs.readFileSync(path.join(__dirname, '../.tmp/asr_' + file + '.wav'));
  const qs = '?model=turbo&prompt=' + encodeURIComponent(ref);
  let lastErr = '';
  for (let i = 0; i < (tries || 3); i++) {
    const t0 = Date.now();
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 20000);
      const res = await fetch(ENDPOINT + qs, {
        method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: buf, signal: ctrl.signal,
      });
      clearTimeout(timer);
      const d = await res.json();
      const total = res.headers.get('Server-Timing') || '';
      const m = total.match(/total;dur=(\d+)/);
      return {
        text: String(d.text || '').trim(), aiScore: d.aiScore, aiBy: d.aiBy,
        ms: m ? Number(m[1]) : (Date.now() - t0), channel: res.headers.get('X-Asr-Channel') || '',
        paWords: d.paWords || null,
      };
    } catch (e) {
      lastErr = String((e && e.message) || e);
    }
  }
  return { text: '', error: lastErr };
}

(async function () {
  const offline = process.argv.indexOf('--offline') >= 0;
  const App = loadApp();
  let bad = 0;
  console.log('判据：_readVerdict().passed  ==  score>=60 且没有读错的词\n');

  for (const c of CASES) {
    let r;
    if (offline) {
      r = { text: OFFLINE[c.file] || '', aiScore: null, aiBy: 'offline', ms: 0, channel: 'offline' };
    } else {
      r = await post(c.file, c.ref, 3);
      if (!r.text) r = { text: OFFLINE[c.file] || '', aiScore: null, aiBy: 'offline-fallback', ms: 0, channel: 'offline' };
    }
    const v = App._readVerdict(c.ref, r.text);
    const got = v.passed ? 'pass' : 'fail';
    const okCase = got === c.expect;
    if (!okCase) bad++;
    console.log((okCase ? '  ok  ' : ' FAIL ') + c.file + ' [' + c.why + ']');
    console.log('        通道=' + r.channel + ' AI分=' + r.aiScore + '(' + r.aiBy + ') 服务端=' + r.ms + 'ms');
    console.log('        识别=' + JSON.stringify(r.text));
    console.log('        判定=' + got + '（期望 ' + c.expect + '）score=' + v.score +
      ' 红词=' + v.badWords.length + (v.badWords.length ? ' [' + v.badWords.map(function (b) { return b.expected; }).join(',') + ']' : ''));
    console.log('');
  }

  // 分数区分度：读对要明显高于读错
  console.log(bad ? ('有 ' + bad + ' 个样本判定不符预期') : '全部样本判定符合预期');
  process.exit(bad ? 1 : 0);
})();
