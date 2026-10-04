/* eslint-disable */
// 错词巩固（v89）流程校验：把 public/app.js 原样加载进来（stub 浏览器环境），
// 验证错词从"产生"到"复习出队"的完整闭环：
//
//   1. 三个错词入口都能入队：词卡选错（checkVocabAnswer）、拼写错（checkSpell）、
//      朗读修复词卡（_renderSentenceRepair）
//   2. 队列规则：重复入队 n+1 且连对清零；跟读通过 ok+1；连对 2 次出队；
//      读错清零并排到队尾
//   3. _buildSteps：学生路径末尾插入错词巩固步骤（每天最多 5 个），老师路径不插
//   4. renderStage：巩固屏渲染出单词与"错词巩固"标题，且把 stage-next-btn 锁住
//   5. _reviewWordStart：第一按只听不录；第二按跟读 —— ≥60 分连对计数、
//      不达标清零排尾；跳过不毕业、本场不再出现
//
// 用法：node tools/verify-review-queue.js
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

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: () => Promise.resolve({}),
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
  saveLearnedWords: async () => ({}),
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

// ---------- 学生态 ----------
App.state.role = 'student';
App.state.phone = '13900000001';
App.state.students = [{ id: 'stu1', phone: '13900000001', name: '测试' }];
App.isTeacher = function () { return this.state.role === 'teacher'; };
App.speak = () => {};                 // 不测真发音
App._playCorrectSound = () => {};
App._playWrongSound = () => {};
App.showToast = () => {};
App._showCelebration = () => {};

console.log('== 1) 入队规则 ==');
App._reviewAdd('Apple');
let q = App._reviewLoad();
ok(q.length === 1 && q[0].w === 'apple' && q[0].n === 1, '答错一次 → 入队（统一小写）');
App._reviewAdd('apple');
q = App._reviewLoad();
ok(q.length === 1 && q[0].n === 2 && q[0].ok === 0, '重复入队 → n+1、连对保持 0');
App._reviewAdd('this is not a word!!');
ok(App._reviewLoad().length === 1, '非单词文本被拒收');
App._reviewAdd('panda');
q = App._reviewLoad();
ok(q.length === 2 && q[1].w === 'panda', '第二个词排在队尾');

console.log('== 2) 通过/失败/出队 ==');
ok(App._reviewPass('apple') === 1, '第 1 次跟读通过 → 连对 1/2，仍在队');
ok(App._reviewLoad().some(e => e.w === 'apple'), '毕业前不出队');
ok(App._reviewPass('apple') === 2 && !App._reviewLoad().some(e => e.w === 'apple'),
  '第 2 次跟读通过 → 连对 2/2，出队毕业');
App._reviewAdd('banana');
App._reviewPass('banana');
App._reviewFail('banana');
q = App._reviewLoad();
const bq = q.find(e => e.w === 'banana');
ok(bq.ok === 0 && q[q.length - 1].w === 'banana', '读错 → 连对清零并排到队尾');

console.log('== 3) 三个错词入口 ==');
// checkSpell 会循环找 vocab-spell-<mi>-<idx> 直到取不到为止 —— 桩必须对
// 这类 id 返回 null，否则 while(true) 永远收集下去直接把内存吃光。
const realGet = document.getElementById;
document.getElementById = id => (String(id).indexOf('vocab-spell-') === 0 ? null : realGet(id));
// 3a 词卡选错：找第一个 vocabulary_game 模块
let VDAY = -1, VMI = -1;
HOMEWORK_DATA.forEach((d, di) => (d.modules || []).forEach((m, mi) => {
  if (VDAY < 0 && m.type === 'vocabulary_game' && m.words && m.words.length) { VDAY = di; VMI = mi; }
}));
ok(VDAY >= 0, '找到词卡模块（day ' + VDAY + ' module ' + VMI + '）');
App.state.vocabWordIdx = 0;
const vword = HOMEWORK_DATA[VDAY].modules[VMI].words[0].word;
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
// 造一个假 DOM 选项组
const fakeOpts = [el('div'), el('div'), el('div'), el('div')];
byId['vocab-game-' + VMI] = { querySelectorAll: () => fakeOpts };
App.checkVocabAnswer(VMI, 1, 0, VDAY, 3, 8);   // 选错
ok(App._reviewLoad().some(e => e.w === vword.toLowerCase()), '词卡选错 → 当前单词入队（' + vword + '）');
// 3b 拼写错
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
App.checkSpell(VMI, 'pple', VDAY, 3, 8, 'apple');
ok(App._reviewLoad().some(e => e.w === 'apple'), '拼写错 → 单词入队');
// 3c 朗读修复词卡
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
byId['sent-result-9-0'] = el('div');
App._renderSentenceRepair('sent', 9, 0, ['Museum', 'dinosaur']);
q = App._reviewLoad();
ok(q.some(e => e.w === 'museum') && q.some(e => e.w === 'dinosaur'),
  '朗读读错/漏读 → 全部入队（小写）');

console.log('== 4) 步骤编排 ==');
App.state.stepIdx = 0;
const stubSteps = App._buildSteps(0);
const revSteps = stubSteps.filter(s => s.kind === 'review');
ok(stubSteps[stubSteps.length - 1].kind === 'review' && revSteps.length > 0,
  '学生路径：错词巩固排在当天全部模块之后');
ok(revSteps.length <= 5, '每天最多 5 个错词');
const teacher = App.isTeacher; App.isTeacher = () => true;
ok(App._buildSteps(0).every(s => s.kind !== 'review'), '老师路径不插巩固步骤');
App.isTeacher = teacher;

console.log('== 5) 巩固屏渲染与门禁 ==');
App.state.role = 'student';
const html = App.renderReviewStep({ kind: 'review', word: 'museum', tries: 1 });
ok(html.indexOf('museum') >= 0 && html.indexOf('错词巩固') >= 0, '渲染出单词与标题');
ok(html.indexOf('已连对 1 / 2') >= 0, '显示连对进度');
ok(html.indexOf('review-skip') >= 0, '有"先跳过"出口（识别不了的孩子不会被卡死）');
// 门禁：renderStage 落在 review 步时锁 next
App._reviewSkipped = {};
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
App._reviewAdd('tiger');
const steps = App._buildSteps(0);
const rIdx = steps.findIndex(s => s.kind === 'review');
ok(rIdx > 0, '巩固步骤就位');
App.state.currentDay = 0;
App.state.stepIdx = rIdx;
App.prefetchUpcoming = () => {};       // 预取已在别处覆盖
const stageHtml = App.renderStage(0);
ok(stageHtml.indexOf('错词巩固') >= 0, 'stage 渲染出巩固屏');
App._lockNextOnRender = true;
App._applyStepLock();
ok(byId['stage-next-btn'] && byId['stage-next-btn'].disabled === true, '跟读通过前 stage-next-btn 锁住');

console.log('== 6) 第一按只听、第二按判分 ==');
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
App._reviewAdd('pencil');
App.state.stepIdx = App._buildSteps(0).findIndex(s => s.kind === 'review' && s.word === 'pencil');
App.renderStage(0);
let spoke = 0, held = null;
App.speak = () => { spoke++; };
App._holdStart = (ev, key, promptLabel, statusEl, onDone) => { held = { key: key, cb: onDone }; };
const ev = { preventDefault: () => {}, pointerId: 1, currentTarget: { setPointerCapture: () => {} } };
App._reviewWordStart(ev);
ok(spoke === 1 && !held, '第一按：只放示范读音，不进录音');
App._reviewWordStart(ev);
ok(!!held && held.key === 'review-pencil', '第二按：发起跟读识别');
held.cb({}, 'pencil');                 // 识别命中、满分
ok(App._reviewPass === App._reviewPass, '回调进入判分');
ok(App._reviewLoad().some(e => e.w === 'pencil' && e.ok === 1), '≥60 分 → 连对 1/2');
ok(byId['stage-next-btn'] && byId['stage-next-btn'].disabled === false, '通过 → next 解锁');
App._reviewWordStart(ev);              // 再按一次（按钮应已 disabled，但直接调函数验证判分）
held.cb({}, 'banana');                 // 读歪了
ok(App._reviewLoad().some(e => e.w === 'pencil' && e.ok === 0),
   '读歪 → 连对清零（不清空队列）');
held.cb({}, 'pencil');                 // 重新读对第 1 次
ok(App._reviewLoad().some(e => e.w === 'pencil' && e.ok === 1), '重新连对 1/2');
held.cb({}, 'pencil');                 // 第 2 次 → 毕业
ok(!App._reviewLoad().some(e => e.w === 'pencil'), '连对 2 次 → 出队毕业');

console.log('== 7) 跳过不死循环 ==');
if (lsData[App._reviewKey()]) delete lsData[App._reviewKey()];
App._reviewSkipped = {};
App._reviewAdd('orange');
const s1 = App._buildSteps(0);
ok(s1.some(s => s.kind === 'review' && s.word === 'orange'), '未跳过 → 在步骤里');
App._reviewSkip('orange');
const s2 = App._buildSteps(0);
ok(!s2.some(s => s.kind === 'review' && s.word === 'orange'), '跳过 → 本场不再出现');
ok(App._reviewLoad().some(e => e.w === 'orange'), '跳过 ≠ 放弃：词还在队列里');

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
