/* eslint-disable */
// 「先听再读」门禁 + 实时逐词高亮 校验。
//
// 这两块都是 v81 新加的、且很容易在后续改动里被悄悄改坏的机制：
//   1. 门禁：所有朗读控件都要先听完示范才解锁；没听就点，要在捕获阶段
//      被拦下来，录音根本不能启动。句子形态的听入口（data-listen）
//      必须走 click —— 用 touchstart 会连页面滚动一起吞掉。
//   2. 实时高亮：走"单调前缀推进"，识别出一个新词就往前推一格，永不回退。
//
// 把 public/app.js 原样加载进来（只 stub 浏览器环境），真的点一遍。
// 用法：node tools/verify-listen-gate.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- DOM stub ----------
const allEls = [];
const byId = {};

function mkEl(tag, attrs, cls) {
  const e = {
    tagName: tag || 'div', _cls: new Set(cls || []),
    _attrs: Object.assign({}, attrs || {}), _parent: null,
    style: {}, innerHTML: '', textContent: '', className: '', disabled: false,
    dataset: {},
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    toggle: (c, on) => { if (on === undefined) { e._cls.has(c) ? e._cls.delete(c) : e._cls.add(c); } else if (on) e._cls.add(c); else e._cls.delete(c); return e._cls.has(c); },
    contains: c => e._cls.has(c),
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.removeAttribute = k => { delete e._attrs[k]; };
  e.appendChild = () => {}; e.remove = () => {}; e.scrollIntoView = () => {};
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.click = () => {};
  e.play = () => Promise.resolve();
  e.closest = sel => { let n = e; while (n) { if (selMatch(n, sel)) return n; n = n._parent; } return null; };
  e.querySelector = () => null;
  e.querySelectorAll = () => [];
  allEls.push(e);
  return e;
}

// 只认本文件用到的几种选择器，够用就行
function selMatch(el, sel) {
  return sel.split(',').map(s => s.trim()).some(p => matchOne(el, p));
}
function matchOne(el, p) {
  if (p === '.gate-listen') return el._cls.has('gate-listen');
  if (p === '[data-gate]') return el.getAttribute('data-gate') !== null;
  if (p === '.rd-w') return el._cls.has('rd-w');
  // [data-gate="X"] / .gate-listen[data-gate="X"] / [data-gate="X"][data-listen="1"]
  const m = /^(?:\.([\w-]+))?\[data-gate="([^"]*)"\](?:\[data-listen="1"\])?$/.exec(p);
  if (!m) return false;
  if (el.getAttribute('data-gate') !== m[2]) return false;
  if (m[1] && !el._cls.has(m[1])) return false;
  if (p.includes('data-listen') && el.getAttribute('data-listen') !== '1') return false;
  return true;
}

const getEl = id => (byId[id] = byId[id] || mkEl('div', { id: id }));
const document = {
  getElementById: getEl,
  querySelector: sel => allEls.find(e => selMatch(e, sel)) || null,
  querySelectorAll: sel => allEls.filter(e => selMatch(e, sel)),
  createElement: mkEl,
  addEventListener: (t, fn, cap) => listeners.push({ t, fn, cap }),
  removeEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
  caretRangeFromPoint: () => null,
};
const listeners = [];
// 触发一次事件，返回事件对象（看有没有被拦）
const fire = (type, target) => {
  const ev = {
    type: type, target: target, _prevented: false, _stopped: false,
    preventDefault() { this._prevented = true; },
    stopPropagation() { this._stopped = true; },
  };
  listeners.filter(l => l.t === type).forEach(l => l.fn(ev));
  return ev;
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
  MutationObserver: undefined,
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  warmup: () => {}, isFillerTranscript: () => false,
  dict: async () => null, transcribe: async () => ({ text: '' }),
  submitSpeakingScore: async () => ({}),
  saveAnswer: async () => ({}), saveCheckin: async () => ({}),
  load: async () => ({}), getAnswers: async () => [], loadWrongCache: async () => {},
  answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
process.on('unhandledRejection', () => {});

let App;
try {
  App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${src}
    return { App };
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA,
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

// ---------- 把 speak 换成可控的：手动决定"播完了" ----------
let speakOrder = [];
let speakDone = [];
App.speak = function (text, opts) {
  speakOrder.push(text);
  if (opts && opts.onDone) speakDone.push(opts.onDone);
};
App.showToast = function () {};                       // 提示不参与断言，别去碰 DOM

(async () => {

App.state.currentDay = 3;
App._bindGateGuard();
const listenerCount = listeners.length;
App._bindGateGuard();
ok(listeners.length === listenerCount, '_bindGateGuard 重复调用不会重复注册');

console.log('\n--- 1. 门禁 id 必须带「第几天」---');
ok(App._gid('sp', 1, 2) === 'sp@3:1-2', '_gid 拼出 sp@3:1-2');
App.state.currentDay = 4;
ok(App._gid('sp', 1, 2) === 'sp@4:1-2', '换一天 → id 不同（否则昨天的"听过了"会串到今天）');
App.state.currentDay = 3;

console.log('\n--- 2. 没听就点朗读控件 → 拦下，录音不启动 ---');
let recStarted = false;
App._holdStart = () => { recStarted = true; };
const btn = mkEl('button', { 'data-gate': 'g1' }, ['word-read-btn', 'gate-locked']);
const ev1 = fire('pointerdown', btn);
ok(ev1._prevented && ev1._stopped, '手势在捕获阶段被拦下（内联 handler 拿不到）');
ok(App._gateOpen('g1') === false, '门禁仍然是锁的');
ok(btn._cls.has('gate-locked'), '锁标还在（孩子看得出来还不能点）');
ok(!recStarted, '录音没有被启动');

console.log('\n--- 3. 点「先听一遍」→ 播示范 → 播完解锁 ---');
const listen = mkEl('button', { 'data-gate': 'g1', 'data-say': 'hello world' }, ['gate-listen']);
App._gateUnlock = App._gateUnlock.bind(App);
speakOrder = []; speakDone = [];
fire('pointerdown', listen);
ok(speakOrder.length === 1 && speakOrder[0] === 'hello world', '点了就先播示范');
ok(App._gateOpen('g1') === false, '还没播完 → 门还锁着');
speakDone.shift()();
ok(App._gateOpen('g1') === true, '播完 → 解锁');
ok(!btn._cls.has('gate-locked'), '解锁后锁标被摘掉');

console.log('\n--- 4. 听过之后再点 → 正常放行 ---');
const ev2 = fire('pointerdown', btn);
ok(!ev2._prevented, '听过之后不再拦截，正常进入录音流程');

console.log('\n--- 5. 句子形态的听入口（data-listen）走 click ---');
const sent = mkEl('div', { 'data-gate': 'g2', 'data-listen': '1', 'data-say': 'a cat' }, ['sent-text']);
const evT = fire('touchstart', sent);
ok(!evT._prevented, '句子上的 touchstart 不能被吞（否则孩子在这句上滑不动页面）');
speakOrder = []; speakDone = [];
const evC = fire('click', sent);
ok(evC._prevented, 'click 被接管');
ok(speakOrder[0] === 'a cat', '点句子 → 播这一句的示范');
speakDone.shift()();
ok(App._gateOpen('g2') === true, '播完 → 解锁');

console.log('\n--- 6. 一串示范按顺序播（字母 → 音节 → 整词）---');
speakOrder = []; speakDone = [];
let seqDone = false;
App._speakSeq(['c', 'a', 't', 'cat'], () => { seqDone = true; });
ok(speakOrder.join(',') === 'c', '先播第一个');
speakDone.shift()();
await sleep(5);
ok(speakOrder.join(',') === 'c,a', '第一个播完才播第二个');
speakDone.shift()(); await sleep(5);
speakDone.shift()(); await sleep(5);
ok(speakOrder.join(',') === 'c,a,t,cat', '一路播到整词');
speakDone.shift()();
await sleep(5);
ok(seqDone, '整串播完 → 回调');

console.log('\n--- 7. 兜底：TTS 哑火也要放行（不能把孩子锁死）---');
const listen2 = mkEl('button', { 'data-gate': 'g3', 'data-say': 'x' }, ['gate-listen']);
speakOrder = []; speakDone = [];
fire('pointerdown', listen2);
ok(App._gateOpen('g3') === false, '刚点下去还没解锁');
ok(App._gateFallbackMs('x') >= 4000, '兜底时限至少 4 秒（按句子长度算）');
await sleep(App._gateFallbackMs('x') + 300);
ok(App._gateOpen('g3') === true, '示范一直没回应 → 兜底放行，不会卡死在这一题');

console.log('\n--- 8. 实时高亮：单调前缀推进 ---');
function makePanel(mi, qi, words) {
  const spans = words.map(w => {
    const s = mkEl('span', { 'data-n': '1' }, ['rd-w']);
    s.textContent = w;
    return s;
  });
  const panel = mkEl('div', { id: 'rd-sent-' + mi + '-' + qi });
  panel.querySelectorAll = sel => (sel === '.rd-w' ? spans : []);
  panel.querySelector = sel => (sel === '.rd-cur' ? (spans.find(x => x._cls.has('rd-cur')) || null) : null);
  byId['rd-sent-' + mi + '-' + qi] = panel;
  return spans;
}
const state = spans => spans.map(s =>
  s._cls.has('rd-cur') ? 'cur' : s._cls.has('rd-ok') ? 'ok' : '·').join(' ');

const SENT = 'i like red apples very much';
let sp = makePanel(0, 9, SENT.split(' '));
App._liveAdvance(0, 9, SENT, 'i like red');
ok(state(sp) === 'ok ok ok cur · ·', '读到第 3 个词 → 光标停在第 4 个（' + state(sp) + '）');

App._liveAdvance(0, 9, SENT, 'i like red apples very much');
ok(state(sp) === 'ok ok ok ok ok ok', '整句读完 → 全绿、光标消失');

sp = makePanel(0, 10, SENT.split(' '));
App._liveAdvance(0, 10, SENT, 'i like red');
App._liveAdvance(0, 10, SENT, 'i like red apples');
ok(state(sp) === 'ok ok ok ok cur ·', '继续读 → 光标继续往前走，不回退');

// 关键：识别噪声不能把光标卡住
sp = makePanel(0, 11, SENT.split(' '));
App._liveAdvance(0, 11, SENT, 'i lick red apples');
ok(state(sp).startsWith('ok · ok ok'), '中间一个词听岔了 → 光标不被它卡住，继续跟嘴（' + state(sp) + '）');

// 单调性：喂进去的话越来越长，光标只能往前进
sp = makePanel(0, 12, SENT.split(' '));
let last = -1, mono = true;
for (let n = 1; n <= 6; n++) {
  App._liveAdvance(0, 12, SENT, SENT.split(' ').slice(0, n).join(' '));
  const cur = sp.findIndex(x => x._cls.has('rd-cur'));
  const pos = cur < 0 ? 6 : cur;
  if (pos < last) mono = false;
  last = pos;
}
ok(mono, '光标位置单调前进，不会来回跳');

console.log('\n' + (fail ? '❌ 有 ' + fail + ' 项不通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);

})();
