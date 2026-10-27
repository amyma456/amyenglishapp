/* eslint-disable */
// 回归红线（v106）：字母跟读"别让学生按太久"。
//
// 家长 2026-10-14 原话：「发音识别的还是太慢了一点，放开就录上，打分判得松
// 一点……不要让学生点那么久，我发现学生点久了他们会不耐烦，快快点，快快过。」
//
// 这条测试钉住三件事：
//   1. 说完了自动收（_holdStart 第 10 参 autoStop）：听见人声之后再安静够久，
//      不用松手也自己进评分 —— 孩子不必一直按着。
//   2. 快按快松也算数：门槛从 220ms 收到 140ms，140ms 以上不再被当成"没按住"。
//   3. 三个短朗读入口（字母格 / 整词 / 连读）都真的把这一档传下去了 ——
//      传不传是"注释写了代码没写"的高发区（v96 → v99 就在 'cf' 上栽过一次）。
//
// 用法：node tools/verify-fast-hold.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
const getEl = id => (byId[id] = byId[id] || el('div'));
const bodyEl = el('body');
bodyEl.children = [];
bodyEl.appendChild = (c) => { bodyEl.children.push(c); c.remove = () => bodyEl.removeChild(c); };
bodyEl.removeChild = (c) => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };
const document = {
  getElementById: id => {
    const kid = bodyEl.children.find(c => c.id === id);
    if (kid) return kid;
    return (byId[id] = byId[id] || el('div'));
  },
  querySelector: () => null, querySelectorAll: () => [],
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
  warmup: () => {}, isFillerTranscript: (t) => !t,
  saveAnswer: async () => ({ recorded: true }), saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}), submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({}), dict: async () => null,
  transcribe: async () => ({ text: 'B' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
  // v157 补：app.js 的 hold/跟读链路会调 ASR 预算接口（v153 引入），替身要接住
  asrResetBudget: () => {}, asrCanRetry: () => false,
};

// 录音器替身：把 onLevel 交出来，stop() 给一个"有声音"的回执。
let lastLevelCb = null;
let stopCalls = 0;
const Recorder = {
  supported: () => true, warmUp: () => {},
  start: async (opts) => { lastLevelCb = (opts && opts.onLevel) || null; return {}; },
  stop: async () => { stopCalls++; return { blob: { size: 1 }, samples: null }; },
  join: () => null, padForAsr: () => null, level: () => 0,
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
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

App.state.phone = '13800000000';
App.state.role = 'student';
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test' }];
App.state.currentTab = 'today';
App.state.audioEnabled = false;
App.isTeacher = () => false;
App.speak = function (t, o) { if (o && o.onDone) o.onDone(); };

const press = () => ({ preventDefault() {}, pointerId: 1, currentTarget: { setPointerCapture() {} } });

// 一次完整的"按住 → 给一个音量 → 自动收/手动收"
function startHold(autoStop, promptLabel) {
  lastLevelCb = null;
  stopCalls = 0;
  let done = null;
  App._holdKey = null;                       // 清掉上一轮残留
  App._holdStart(press(), 'unit-t-0', promptLabel || 'B',
    getEl('h-status'), function (out, text) { done = { out: out, text: text }; },
    true, 'en', 'B', 'cf', autoStop);
  return () => done;
}

(async function main() {
  console.log('== 1) 三个短朗读入口都把 autoStop 传下去了 ==');
  const seen = [];
  const origHold = App._holdStart;
  App._holdStart = function () { seen.push([].slice.call(arguments)); };
  App._gateOpen = function () { return true; };
  App._spell = { mi: 1, kind: 'letter', word: 'bike', total: 4, units: ['b', 'i', 'k', 'e'],
                 takes: {}, unitScores: {}, phase: 'pieces' };
  App._readUnit(press(), 1, 0);
  ok(seen.length === 1 && !!seen[0][9], '_readUnit（字母格）第 10 参 = 自动收');
  ok(seen[0] && seen[0][8] === 'cf', '_readUnit 仍然带 prefer=cf（v99 红线没被碰掉）');
  App._readFullWord(press(), 1);
  ok(seen.length === 2 && !!seen[1][9], '整词朗读第 10 参 = 自动收');
  App._readContinuous(press(), 1);
  ok(seen.length === 3 && seen[2][9] === 1200,
    '连读第 10 参 = 1200ms（串比字母长，安静窗口放宽）');
  App._holdStart = origHold;

  console.log('\n== 2) 说完了自动收：不用一直按着 ==');
  const read1 = startHold(true);
  await sleep(5);   // v147 起 begin() 走 primeP.then 微任务，等 Recorder.start 真正落地再断言
  ok(typeof lastLevelCb === 'function', '录音器拿到了 onLevel');
  lastLevelCb(0.3);                          // 孩子开口
  ok(App._holdKey === 'unit-t-0', '刚开口不会立刻收（还在读）');
  await sleep(App.AUTO_STOP_SILENCE_MS + 120);
  lastLevelCb(0.001);                        // 说完了 → 安静够久
  await sleep(30);
  ok(App._holdKey === null, '安静够久 → 自动收尾（_holdKey 释放）');
  ok(stopCalls === 1, '录音器停了一次（没有重复收）');
  ok(!!read1(), '收尾后 onDone 照样跑（照常出分）');

  console.log('\n== 3) 只有底噪、没人声 → 不自动收（别把沉默当成"说完了"）==');
  const read2 = startHold(true);
  for (let i = 0; i < 6; i++) { lastLevelCb(0.005); await sleep(120); }
  ok(App._holdKey === 'unit-t-0', '一直没听见人声 → 仍然在录（等孩子开口）');
  ok(!read2(), '没有提前放行');
  App._holdKey = null;                       // 收工，别影响下一节
  clearTimeout(App._holdCap);

  console.log('\n== 4) 不传这一档的（整句跟读）不受影响 ==');
  startHold(undefined, '这句话');
  lastLevelCb(0.3);
  await sleep(App.AUTO_STOP_SILENCE_MS + 120);
  lastLevelCb(0.001);
  ok(App._holdKey === 'unit-t-0', '整句跟读还是要按住 —— 没被顺手改掉');
  App._holdKey = null;
  clearTimeout(App._holdCap);

  console.log('\n== 5) 快按快松也算数（门槛 140ms）==');
  // 140ms 以上：正常读
  const read3 = startHold(true);
  App._holdStartedAt = Date.now() - 150;
  await App._holdEnd();
  ok(!!read3(), '按住 150ms 松开 → 照常出分（旧门槛 220ms 会把这种快读判成"没按住"）');
  // 140ms 以下：真的只是碰了一下
  App._holdKey = null;
  const read4 = startHold(true);
  App._holdStartedAt = Date.now() - 60;
  getEl('h-status').innerHTML = '';
  await App._holdEnd();
  ok(!read4(), '按住 60ms 松开 → 不当成一次朗读（防误触）');
  ok(/太快了/.test(getEl('h-status').innerHTML), '提示语是"太快了"（不是旧的"按住不放才能录音"）');

  console.log('\n== 6) 两个上限没被顺手改坏 ==');
  ok(App.AUTO_STOP_SILENCE_MS === 600, '安静窗口 600ms');
  ok(App.AUTO_STOP_LEVEL === 0.05, '人声阈值 0.05（AGC 之后的说话峰值 0.1~0.5，底噪 ~0.01）');
  ok(App.AUTO_STOP_CAP_MS === 8000 && App.AUTO_STOP_CAP_MS < 15000,
    '自动收的几屏最长 8 秒（整句跟读仍是 15 秒）');

  console.log('\n' + (fail ? fail + ' 项失败' : '全部通过 ✅'));
  process.exit(fail ? 1 : 0);
})();
