/* eslint-disable */
// TTS 预取队列 校验。
//
// 这一版改的是"点读反应慢"的根子，两条规矩最容易在后续改动里被改回去：
//   1. 取的时候排队、最多三句同时在路上、永远先取离当前进度最近的那几句。
//      原先是把后面五屏一次全甩出去（口语题 25 句＝25 个并发请求），实测
//      并发 25 时排在后面的要 6 秒才回来，孩子点的那一句正好被拖慢。
//   2. 扔的时候按"离当前进度多远"，不是按取回来的先后。原先谁先取回来谁
//      先被顶掉，而下一屏的音频恰好是最先取回来的 —— 于是每一题刚预取好
//      就被扔掉，孩子点下去只能重新等网络。这就是"之前快、现在又慢"的那个
//      回归。
//
// 把 public/app.js 原样加载进来（只 stub 浏览器环境），真的取一遍。
// 用法：node tools/verify-tts-prefetch.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- DOM stub（够 load app.js 用）----------
function mkEl(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), _attrs: {}, style: {},
    innerHTML: '', textContent: '', className: '', disabled: false, dataset: {},
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    toggle: () => false,
    contains: c => e._cls.has(c),
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.removeAttribute = k => { delete e._attrs[k]; };
  e.appendChild = () => {}; e.remove = () => {}; e.scrollIntoView = () => {};
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.click = () => {};
  e.closest = () => null; e.querySelector = () => null; e.querySelectorAll = () => [];
  e.load = () => {};                       // 真实 speak() 起播前要调它
  e.pause = () => {};
  e.play = () => new Promise(() => {});    // 永远不 resolve：只关心"谁来起播"
  return e;
}
const byId = {};
const getEl = id => (byId[id] = byId[id] || mkEl('div'));

const document = {
  getElementById: getEl,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: mkEl,
  addEventListener: () => {},
  removeEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
  caretRangeFromPoint: () => null,
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  MutationObserver: undefined,
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

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

// ---------- 可控的 fetch：记账并发与时序 ----------
let inflight = 0, maxInflight = 0, requested = [], order = [];
let resolveAll = [];
const fakeFetch = url => {
  const text = decodeURIComponent(String(url).replace(/^.*[?&]text=/, ''));
  requested.push(text);
  inflight++;
  if (inflight > maxInflight) maxInflight = inflight;
  let release;
  const p = new Promise(r => { release = r; });
  resolveAll.push(() => {
    inflight--;
    order.push(text);
    release({ ok: true, blob: async () => ({ __blob: text }) });
  });
  return p;
};
const settle = async () => { while (resolveAll.length) { const f = resolveAll.shift(); f(); await sleep(0); } await sleep(1); };

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
    URL: { createObjectURL: b => 'blob:' + (b && b.__blob), revokeObjectURL: () => {} },
    fetch: fakeFetch,
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

App.showToast = () => {};

const queuedTexts = () => (App._ttsQueue || []).map(j => j.text);
const localTexts = () => Object.keys(App._ttsBlobs || {});
const reset = () => {
  App._ttsBlobs = {}; App._ttsPending = {}; App._ttsBlobStep = {};
  App._ttsBlobOrder = []; App._ttsQueue = []; App._ttsRunning = 0;
  inflight = 0; maxInflight = 0; requested = []; order = []; resolveAll = [];
};

(async () => {
  console.log('\n=== 1. 排队与并发上限 ===');
  reset();
  App.state.stepIdx = 0;
  const CONC = App.TTS_PREFETCH_CONCURRENCY;
  // 口语题一屏 5 句（题面 + 四个选项），往后预取五屏
  for (let i = 1; i <= 25; i++) App.prefetchTts('sentence number ' + i + ' here', i);
  ok(CONC >= 2 && CONC <= 8,
     '并发上限在 2–8 之间（' + CONC + '）：实测 8 个并发每句 2.2–2.6s、25 个要拖到 6s');
  ok(inflight === CONC, '一次排入 25 句，同时只放 ' + CONC + ' 个请求出去（实际 ' + inflight + '）');
  ok(maxInflight <= CONC, '无论排多长，在路上的请求都不超过上限（实际峰值 ' + maxInflight + '）');
  ok(queuedTexts().length === 25 - CONC, '其余 ' + (25 - CONC) + ' 句在队里等着（实际 ' + queuedTexts().length + '）');

  console.log('\n=== 2. 就近优先，不是先进先出 ===');
  ok(requested[0] === 'sentence number 1 here', '先取的是离当前进度最近的第 1 句（实际 ' + JSON.stringify(requested[0]) + '）');
  ok(requested[1] === 'sentence number 2 here' && requested[2] === 'sentence number 3 here',
     '前三个请求按就近顺序发出');

  console.log('\n=== 3. 重复入队不重复取 ===');
  const before = requested.length;
  App.prefetchTts('sentence number 1 here', 1);      // 已取到（还在路上）
  App.prefetchTts('sentence number 5 here', 5);      // 队里已有
  ok(requested.length === before, '同一句不重复发请求（实际多发了 ' + (requested.length - before) + ' 个）');

  console.log('\n=== 4. 点下去优先插队 ===');
  const target = 'sentence number 26 here';
  App.prefetchTts(target, 26);
  ok(queuedTexts().indexOf(target) === queuedTexts().length - 1, '新句子老老实实排在队尾');
  const pri = [];
  const origPri = App._ttsPrioritize;
  App._ttsPrioritize = function (t) { pri.push(t); return origPri.call(this, t); };
  App.speak(target, {});
  App._ttsPrioritize = origPri;
  ok(pri.length === 1 && pri[0] === target, '孩子点的这一句会被插队，不排在一堆预取后面');
  ok(App._ttsBlobs[target] === undefined, '还没取回来，所以是走"等预取"这条路，不再发第二个请求抢连接');

  console.log('\n=== 5. 淘汰顺序：按离当前进度多远 ===');
  reset();
  App.state.stepIdx = 10;
  // 塞满：第 8、9 屏（已走过）各 5 句，第 10 屏（当前）5 句，第 11、12 屏各 5 句
  const put = (step, n) => { for (let k = 0; k < n; k++) App.prefetchTts('step' + step + ' line ' + k + ' here', step); };
  put(8, 5); put(9, 5); put(10, 5); put(11, 5); put(12, 5);   // 25 句
  await settle();                                            // 全部取回本地
  ok(localTexts().length === 25, '25 句都在本地（上限 30，先不释放）');
  put(13, 5); put(14, 5);                                    // 再塞 10 句 → 35 句，超出上限
  await settle();
  const keptNow = localTexts();
  ok(keptNow.length <= App.TTS_PREFETCH_MAX, '本地音频不会无限涨（' + keptNow.length + ' ≤ ' + App.TTS_PREFETCH_MAX + '）');
  const stepOfKept = s => keptNow.filter(t => t.indexOf('step' + s + ' ') === 0).length;
  ok(stepOfKept(8) === 0, '已经走过的那一屏最先被放掉');
  ok(stepOfKept(10) === 5, '当前这一屏一句都不能少（点下去要用）');
  ok(stepOfKept(11) === 5, '下一屏也留着 —— 这正是"点读为什么变慢"的回归点');

  console.log('\n=== 6. 口语题的真实流程：走到下一题时，选项音频还在不在本地 ===');
  reset();
  App.state.stepIdx = 3;
  const speakStep = s => {                     // 一屏 = 题面 + 四个选项
    App.prefetchTts('q' + s + ' sentence here', s);
    for (let k = 0; k < 4; k++) App.prefetchTts('q' + s + ' option ' + k + ' here', s);
  };
  const speakUpcoming = () => { for (let s = 4; s <= 8; s++) speakStep(s); };
  speakStep(3); speakUpcoming();               // 第 3 步：当前屏 + 后面五屏
  await settle();
  App.state.stepIdx = 4;                       // 孩子点了"下一题"
  speakStep(4); speakUpcoming();               // 第 4 步：当前屏 + 后面五屏
  await settle();
  const opts4 = [0, 1, 2, 3].map(k => 'q4 option ' + k + ' here');
  ok(opts4.every(t => App._ttsBlobs[t]), '走到第 4 题时，它四个选项的音频都已在本地（点下去不用等网络）');
  ok(!!App._ttsBlobs['q5 sentence here'], '下一题的题面也已在本地');

  console.log('\n=== 7. 超出上限也不会把"马上要用的"扔掉 ===');
  reset();
  App.state.stepIdx = 20;
  // 极端：一屏就有 12 句（写作朗读那种），一次性铺满
  const big = s => { for (let k = 0; k < 12; k++) App.prefetchTts('wide' + s + ' line ' + k + ' here', s); };
  for (let s = 16; s <= 24; s++) big(s);
  await settle();
  ok(localTexts().length <= App.TTS_PREFETCH_MAX, '铺了 108 句，本地仍守在 ' + App.TTS_PREFETCH_MAX + ' 句以内（' + localTexts().length + '）');
  const q21 = localTexts().filter(t => t.indexOf('wide21 ') === 0).length;
  const q22 = localTexts().filter(t => t.indexOf('wide22 ') === 0).length;
  ok(q21 > 0 || q22 > 0, '当前屏和下一屏至少留住了要紧的部分（当前 ' + q21 + ' 句 / 下一屏 ' + q22 + ' 句）');
  ok(localTexts().filter(t => t.indexOf('wide16 ') === 0).length === 0, '走过最久的那一屏最先放掉');

  console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
  process.exit(fail ? 1 : 0);
})();
