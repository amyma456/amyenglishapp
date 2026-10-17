/* eslint-disable */
// v139 回归红线：**识别端没回话，不等于孩子没读。**
//
// 家长 2026-10-17：「明明按住说得很清楚，他就说没有听清，孩子要重复四五遍，
// 特别影响兴趣。把这点改，不要再出现这个问题。」
//
// 这一版立两条规矩，本脚本逐条验：
//   1. 本地能判定"确实出了声" → 一律放行，不让孩子重读（_voiceOk / _lastClipVoiceOk）。
//   2. 屏幕上**不再出现"没听清"**这三个字（只允许出现在注释里解释历史）。
//
// 用法：node tools/verify-voice-pass.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub ----------
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false, id: '',
    classList: {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => on ? e._cls.add(c) : e._cls.delete(c),
      contains: c => e._cls.has(c),
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    insertAdjacentHTML: (pos, h) => { e.innerHTML += h; },
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    removeAttribute: k => { delete e._attrs[k]; },
    appendChild: () => {}, remove: () => {}, scrollIntoView: () => {},
    play: () => Promise.resolve(), focus: () => {}, click: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
  };
  return e;
}
const byId = {};
const bodyEl = el('body');
bodyEl.children = [];
bodyEl.appendChild = (c) => { bodyEl.children.push(c); c.remove = () => bodyEl.removeChild(c); };
bodyEl.removeChild = (c) => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };
const document = {
  getElementById: id => (byId[id] = byId[id] || el('div')),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: bodyEl, documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  asrResetBudget: () => {}, perfBegin: () => {}, perfEnd: () => {},
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({ id: 'x', url: 'blob:x' }),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [],
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0, TARGET_RATE: 16000,
  trimSilence: s => s,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS };')();
const HOMEWORK_DATA = scope.WEEKS[0];

process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App, Recorder };
`);
const sandbox = factory({
  document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: () => '',
  requestAnimationFrame: fn => setTimeout(fn, 0),
});
const App = sandbox.App;

// 16k 采样、给定长度的静音 / 正弦"人声"
function silence(sec, amp) {
  const n = Math.round(16000 * sec);
  const a = new Float32Array(n);
  if (amp) for (let i = 0; i < n; i++) a[i] = Math.sin(i / 6) * amp;
  return a;
}

console.log('\n[1] 本地出声判定 _voiceOk');
ok(App._voiceOk(null) === false, '没拿到录音 → 不算出声');
ok(App._voiceOk({ samples: silence(1.2, 0) }) === false, '整段静音（1.2s）→ 不算出声');
ok(App._voiceOk({ samples: silence(1.2, 0.001) }) === false, '只有底噪（0.001）→ 不算出声');
ok(App._voiceOk({ samples: silence(1.2, 0.2) }) === true, '正常说话（0.2 峰值 1.2s）→ 算出声');
ok(App._voiceOk({ samples: silence(0.5, 0.3) }) === true, '短句（0.5s）→ 算出声');
ok(App._voiceOk({ samples: silence(0.08, 0.3) }) === false, '极短（0.08s，误触）→ 不算出声');
ok(App._voiceOk({ peak: 0.3, duration: 1.1 }) === true, '只有 meta（peak+duration）也能判出声');
ok(App._voiceOk({ peak: 0.01, duration: 1.1 }) === false, 'meta 峰值太低 → 不算出声');

console.log('\n[2] 整句跟读：没文本 + 有声音 → 判通过（不再要求重读）');
App.state = App.state || {};
const voiceOut = { samples: silence(1.5, 0.25), peak: 0.25, duration: 1.5 };
const quietOut = { samples: silence(1.5, 0), peak: 0.001, duration: 1.5 };
ok(App._voiceOk(voiceOut) === true, '读了（1.5s 有人声）');
ok(App._voiceOk(quietOut) === false, '没读（1.5s 静音）');

console.log('\n[3] 文案：屏幕里不再出现"没听清"');
const lines = src.split('\n');
const bad = [];
lines.forEach((ln, i) => {
  if (ln.indexOf('没听清') < 0) return;
  const t = ln.trim();
  // 注释里解释历史是允许的；真正下发到屏幕上的字符串不允许。
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return;
  bad.push((i + 1) + ': ' + t.slice(0, 90));
});
ok(bad.length === 0, '没有一处在 UI 文案里出现"没听清"' + (bad.length ? '\n       ' + bad.join('\n       ') : ''));

console.log('\n[4] 识别总预算收到 5 秒（慢=等太久，这条守的是"出分要快"）');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const m = apiSrc.match(/ASR_BUDGET_MS:\s*(\d+)/);
ok(!!m && Number(m[1]) <= 6000, 'ASR_BUDGET_MS = ' + (m ? m[1] : '缺失') + '（≤6000ms）');

console.log('\n[5] 口语屏真跑一遍：识别空手 + 有人声 → 直接算做完');
const smi = HOMEWORK_DATA[0].modules.findIndex(x => x.type === 'speaking');
if (smi < 0) {
  console.log('  --   今天没有口语模块，跳过');
} else {
  App.state = App.state || {};
  App.state.currentDay = 0;
  App.state.stepIdx = 0;
  byId['sphr-' + smi + '-0'] = el('button');
  byId['sp-status-' + smi + '-0'] = el('div');
  App._spPassed = {};
  App._spClipSamples = voiceOut.samples;
  App._spClipMeta = { peak: 0.25, duration: 1.5 };
  App._spShowResult(smi, 0, 0, { sentence: 'hello', q: { sentence: 'hello' } }, null, null, null, true);
  ok(App._speakingGateOpen(smi, 0, 0) === true, '口语题状态=做完（底部「下一题」能亮）');
  const ui = byId['sp-status-' + smi + '-0'].innerHTML;
  ok(/✅/.test(ui) && /通过/.test(ui), '结果卡写的是"通过"：' + ui.replace(/<[^>]+>/g, '').trim().slice(0, 40));
  ok(!/没听清|重读|再读/.test(ui), '结果卡里没有任何"重读/没听清"字样');

  // 反例：真的没声音 → 才允许让他再来一次（且不锁死）
  App._spPassed = {};
  App._spClipSamples = quietOut.samples;
  App._spClipMeta = { peak: 0.001, duration: 1.5 };
  byId['sp-status-' + smi + '-0'].innerHTML = '';
  App._spShowResult(smi, 0, 0, { sentence: 'hello', q: { sentence: 'hello' } }, null, null, null, false);
  ok(App._speakingGateOpen(smi, 0, 0) === false, '真没录到声音 → 不算做完（提示再点一次）');
  ok(/没录到声音/.test(byId['sp-status-' + smi + '-0'].innerHTML), '提示说的是"没录到声音"');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
