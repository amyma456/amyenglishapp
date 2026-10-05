/* eslint-disable */
// 回归红线：点选项必须有读音（v70 → v76 → v90 反复修过的行为，不许再回退）。
//
// 背景：v76 曾把「选择题点错」限定成"选项是完整句子才读"——单词/短语选项
// 点了完全没声音。第 2 周题库一半选项是单个词（England / Canada / went...），
// 家长当成 bug 报上来。v90 起任何被点的选项都朗读。本文件把这个行为锁死：
//
//   1. 口语模块 selectSpeakAnswer：点错 → speak(所选选项)；点对 → speak(所选选项)
//   2. 选择题 selectAnswer：点错 → speak(所选选项)，单词选项也一样
//   3. 渲染出的口语选项四个都带 onclick（能点就有声音）
//
// 用法：node tools/verify-answer-speech.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub（与 verify-writing-flow 同款） ----------
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false,
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
const document = {
  getElementById: getEl,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: el('body'), documentElement: el('html'),
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

const apiCalls = { speaking: [] };
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: o => { apiCalls.speaking.push(o); return Promise.resolve({}); },
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
// 固定第 1 周：断言里引用具体题目，不随日历轮换漂移。
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS, IDX: HOMEWORK_WEEK_IDX, DATA: HOMEWORK_DATA };')();
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

App.state.currentDay = 0;
App.state.phone = '13800000000';
App.state.role = 'student';
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test' }];
App.state.currentTab = 'today';
App.state.audioEnabled = true;
App.isTeacher = () => false;

// ---- 插桩 speak：只记录，不播 ----
const spoken = [];
App.speak = function (text, opts) {
  spoken.push(String(text));
  if (opts && opts.onDone) opts.onDone();     // 同步触发回调，让链路走完
  return;
};

// ---------- 找模块 ----------
let spDay = -1, spMi = -1;          // speaking 模块
let qDay = -1, qMi = -1;            // 带单词选项的 question 模块
let qShortDay = -1, qShortMi = -1, qShortQi = -1, qShortOi = -1, qShortWord = '';
HOMEWORK_DATA.forEach((d, di) => (d.modules || []).forEach((mm, mi) => {
  if (spDay < 0 && mm.type === 'speaking' && mm.questions) { spDay = di; spMi = mi; }
  if ((qDay < 0) && mm.questions && mm.type !== 'speaking' && mm.type !== 'writing_template') { qDay = di; qMi = mi; }
  if (qShortDay < 0 && mm.questions && mm.type !== 'speaking' && mm.type !== 'writing_template') {
    mm.questions.forEach((q, qi) => (q.options || []).forEach((o, oi) => {
      if (qShortDay < 0 && o && !/\s/.test(String(o).trim()) && String(o).trim() && oi !== q.answer) {
        qShortDay = di; qShortMi = mi; qShortQi = qi; qShortOi = oi; qShortWord = String(o);
      }
    }));
  }
}));

console.log('== 1) 口语模块：点错选项必须朗读所选句子 ==');
if (spDay < 0) { console.log('  FAIL 数据里没有 speaking 模块'); fail++; }
else {
  const m = HOMEWORK_DATA[spDay].modules[spMi];
  const q = m.questions[0];
  App._speakingShuffle = null;                        // 让它用原始顺序
  const html = App.renderSpeakingQuestion(m, spMi, 0, spDay);
  ok((html.match(/selectSpeakAnswer\(/g) || []).length >= 4, '四个选项都绑了 selectSpeakAnswer');
  const sh = App._speakingShuffle[spMi + '-0'];
  const wrong = (sh.answer + 1) % sh.options.length;
  spoken.length = 0;
  App.selectSpeakAnswer(spMi, 0, wrong, spDay);
  ok(spoken.length === 1, '点错触发了一次 speak（' + spoken.length + ' 次）');
  ok(spoken[0] === sh.options[wrong], '读的是所选错句："' + spoken[0] + '"');
  // 点对
  spoken.length = 0;
  App.selectSpeakAnswer(spMi, 0, sh.answer, spDay);
  ok(spoken.length >= 1, '点对也朗读（跟读入口前先读答句）');
  ok(spoken[0] === sh.options[sh.answer], '点对读的是正确答句："' + spoken[0] + '"');
}

console.log('\n== 2) 选择题：点错单词选项也必须朗读（v90 回归红线）==');
if (qShortDay < 0) { console.log('  （第 1 周没有单词选项，跳过——数据变了请更新本测试）'); }
else {
  const m = HOMEWORK_DATA[qShortDay].modules[qShortMi];
  spoken.length = 0;
  App.selectAnswer(qShortMi, qShortQi, qShortOi, qShortDay);
  ok(spoken.length === 1, '单词选项 "' + qShortWord + '" 点错触发了一次 speak（' + spoken.length + ' 次）');
  ok(spoken[0] === qShortWord, '读的就是这个单词："' + spoken[0] + '"');
}

console.log('\n== 3) 选择题：点错句子选项朗读所选句子 ==');
if (qDay < 0) { console.log('  FAIL 数据里没有 question 模块'); fail++; }
else {
  const m = HOMEWORK_DATA[qDay].modules[qMi];
  const q = m.questions[0];
  const wrongOi = q.options.findIndex((o, i) => i !== q.answer && o && /\s/.test(String(o).trim()));
  if (wrongOi < 0) {
    console.log('  （第 1 题 ' + (q.options || []).length + ' 个选项里没有句子选项，跳过）');
  } else {
    spoken.length = 0;
    App.selectAnswer(qMi, 0, wrongOi, qDay);
    ok(spoken.length === 1, '句子选项点错触发了一次 speak（' + spoken.length + ' 次）');
    ok(spoken[0] === String(q.options[wrongOi]), '读的是所选错句："' + spoken[0] + '"');
  }
}

console.log('\n' + (fail ? ('有 ' + fail + ' 项失败 —— 点选项必有读音的回归红线被踩了，别部署！')
                     : '全部通过 —— 点选项必有读音，红线完好。'));
process.exit(fail ? 1 : 0);
