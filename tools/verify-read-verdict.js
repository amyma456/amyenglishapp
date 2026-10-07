/* eslint-disable */
// 跟读出分的「两路择优」与「判定口径」（v98）—— 防止"读对了却判错"再退化。
//
// 背景：家长第三次反馈同一件事 ——「跟读一遍，孩子读的对很多，还是会给判错
// 很多」。上一次（v96）改的是逐词容错，这次追到根上：手机自带的语音识别
// （A 路）是个语言模型，孩子读得稍微含糊，它会把整句**润色**成另一句通顺的
// 话。孩子读的是 "I want to be a doctor"，它回一句 "I want to be a doctor
// please"，逐词一比就红一片。
//
// 所以出分改成两路择优：A 路判过就立即出分（快），判不过才等 B 路（云端）
// 复核，谁更接近目标句用谁。这个脚本把三件事钉死：
//   ① 判定口径唯一：_readVerdict 的红词必须和分数同源（不再依赖显示格子）；
//   ② A 路判过时绝不出网（速度）；
//   ③ A 路把句子润色坏了时，B 路能把孩子救回来（准确）。
//
// 用法：node tools/verify-read-verdict.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// ---- 载入 app.js 里真正跑的那份判定代码 ----
const callLog = { transcribe: 0, lastQs: null };
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
    // 云端那一手（B 路）的替身：由每个用例换掉 __cloudText。
    Recorder: { padForAsr: function() { return 'PADDED-BLOB'; } },
    Api: {
      isFillerTranscript: function(t) { return !String(t || '').trim(); },
      transcribe: async function(blob, meta, opts) {
        callLog.transcribe++;
        callLog.lastQs = opts || null;
        return { text: sandbox.__cloudText === undefined ? '' : sandbox.__cloudText, words: null };
      },
    },
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;globalThis.__App = App;', sandbox, { filename: 'app.js' });
  return { App: sandbox.__App, sandbox: sandbox };
}

const loaded = loadApp();
const App = loaded.App;
const sandbox = loaded.sandbox;

function cloudSays(text) { sandbox.__cloudText = text; }
function resetCalls() { callLog.transcribe = 0; callLog.lastQs = null; }

const SENT = 'I want to be a doctor when I grow up.';

(async function main() {
  // ---- 1. 判定口径唯一：_readVerdict 必须和 alignSpeech 同源 --------------
  console.log('\n1. 判定口径（分数 / 红词 / 过没过）同源');
  {
    const v = App._readVerdict(SENT, 'I want to be a doctor when I grow up.');
    const a = App.alignSpeech(SENT, 'I want to be a doctor when I grow up.');
    ok('分数取自对齐结果', v.score === a.score, v.score + ' vs ' + a.score);
    const expectBad = a.items.filter(function(x) { return x.target && x.status !== 'ok'; }).length;
    ok('红词数 = 对齐结果里非 ok 的目标词数', v.badWords.length === expectBad,
      v.badWords.length + ' vs ' + expectBad);
    ok('读对了就是通过', v.passed === true, 'score=' + v.score);
  }
  {
    const v = App._readVerdict(SENT, 'I want to be a nurse when I grow up.');
    ok('真的读错（doctor→nurse）照样判错', !v.passed && v.badWords.length > 0,
      'score=' + v.score + ' bad=' + v.badWords.map(function(x) { return x.expected; }).join(','));
  }
  {
    // 虚词被吞掉不算错（v96 的回归）
    const v = App._readVerdict(SENT, 'I want be a doctor when grow up.');
    ok('吞掉虚词不算错（回归 v96）', v.badWords.length === 0,
      v.badWords.map(function(x) { return x.expected; }).join(','));
  }

  // ---- 2. A 路判过 → 不出网 ----------------------------------------------
  console.log('\n2. A 路（手机自带识别）判过 → 一次网络都不发');
  {
    resetCalls();
    cloudSays('I want to be a teacher when I grow up.');
    const r = await App._bestTranscript(SENT, 'I want to be a doctor when I grow up.', 'BLOB', null);
    ok('用了 A 路的结果', r.source === 'live', r.source);
    ok('判为通过', r.verdict.passed === true, 'score=' + r.verdict.score);
    ok('没发网络请求', callLog.transcribe === 0, 'calls=' + callLog.transcribe);
  }

  // ---- 3. A 路把句子润色坏了 → B 路救回来 --------------------------------
  console.log('\n3. A 路听岔 → B 路复核（这是家长说的"读对了却判错"）');
  {
    resetCalls();
    cloudSays('I want to be a doctor when I grow up.');
    // A 路给的是另一句通顺的话，逐词一比全红
    const bad = App._readVerdict(SENT, 'I want to be a doctor please.');
    ok('先确认 A 路这一版确实判不过', !bad.passed, 'score=' + bad.score);
    const r = await App._bestTranscript(SENT, 'I want to be a doctor please.', 'BLOB', null);
    ok('复核后用了云端结果', r.source === 'whisper', r.source);
    ok('孩子被救回来了（判通过）', r.verdict.passed === true, 'score=' + r.verdict.score);
    ok('确实发出了复核请求', callLog.transcribe === 1, 'calls=' + callLog.transcribe);
    ok('复核请求带上目标句偏置', !!callLog.lastQs && callLog.lastQs.hint === SENT,
      JSON.stringify(callLog.lastQs));
  }

  // ---- 4. 两路都判不过 → 取更像的那一个 ----------------------------------
  console.log('\n4. 两路都不过 → 取分数高的（少冤枉一点）');
  {
    resetCalls();
    cloudSays('I want to be a doctor when I go up.');
    const r = await App._bestTranscript(SENT, 'I want a doctor.', 'BLOB', null);
    ok('用了分数更高的那一路', r.source === 'whisper', r.source);
    ok('分数比 A 路高', r.verdict.score > App._readVerdict(SENT, 'I want a doctor.').score,
      r.verdict.score + ' vs ' + App._readVerdict(SENT, 'I want a doctor.').score);
  }
  {
    resetCalls();
    cloudSays('something completely different');
    const r = await App._bestTranscript(SENT, 'I want to be a doctor when I grow up.', 'BLOB', null);
    // A 路本来就是对的（过了），根本不该去问云端
    ok('A 路本来就对时，不会被云端带偏', r.source === 'live' && r.verdict.passed,
      r.source + ' score=' + r.verdict.score);
  }

  // ---- 5. 没有音频时不能崩 ------------------------------------------------
  console.log('\n5. 边界：没录到音频');
  {
    resetCalls();
    const r = await App._bestTranscript(SENT, null, null, null);
    ok('两路都空 → 返回 null（上层走"再读一次"）', r === null, JSON.stringify(r));
    ok('空音频不发网络请求', callLog.transcribe === 0, 'calls=' + callLog.transcribe);
  }

  console.log('\n' + pass + ' 项通过, ' + fail + ' 项失败');
  process.exit(fail ? 1 : 0);
})();
