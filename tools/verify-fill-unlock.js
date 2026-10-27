/* eslint-disable */
// 填空题答对之后必须能进下一题（v117）。
//
// 家长的原话（2026-10-14，说的是昨天周二「语法练习」里的
// "Shanghai is one of ___ (big) cities in China."）：
//   「写完了之后就没有下一题选项……所有的题只要答对了之后100分，或者是写对了
//     没有任何错误，就弹出来下一题这个可选的项，而不是虚的显示，让学生点不了」
//
// 病根：学生一屏一题时，只要题目"有可读的英文"就把底部「下一题」锁上，等跟读
// ≥60 分才解锁。可**填空题（没有 options）根本不渲染跟读区**（跟读区跟着
// q.options 走），于是写对了也无处可通过 —— 按钮永远灰着，孩子只能把同一句
// 答案再写一遍。
//
// 钉住的行为：
//   1. 填空题（无 options）的门槛就是"写对"：写对了 submitFill 立刻解锁
//   2. 已经写对过的填空题（从下一题退回来 / 昨天做过）渲染时就不再锁
//   3. 选择题（有 options）门槛不变：选对 + 跟读 ≥60 分才解锁
//   4. 写错时按钮不许亮（不能白送）
//   5. 老师端预览不被这套门槛影响
//
// 用法：node tools/verify-fill-unlock.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub ----------
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
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  checkinKey: (sid, d) => sid + '_d' + d,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}), saveLearnedWords: () => {},
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: () => Promise.resolve({}),
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
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
// 固定用第 4 周（v153 起周二语法改成纯选择，混合「选择+填空」的模块
// 只剩 W4 周五的语法练习）：注入哪一周由测试决定，
// 不跟着日历走，免得下周日历一翻就假失败。
const WEEKS = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const WEEK = 3;
const HOMEWORK_DATA = WEEKS[WEEK];

process.on('unhandledRejection', () => {});

const App = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, HOMEWORK_EPOCH, HOMEWORK_WEEK_IDX, URL, fetch, Cloud,
          SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`)({
  document, window, location: window.location, navigator, localStorage, Api, Recorder,
  HOMEWORK_DATA, HOMEWORK_EPOCH: new Date(2026, 8, 28), HOMEWORK_WEEK_IDX: WEEK,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: '',
  requestAnimationFrame: cb => setTimeout(cb, 0),
}).App;

const PHONE = '13800000000';
const SID = 'stu1';
App.speak = function () {};
App.autoSpeak = function () {};
App._playCorrectSound = function () {};
App._playWrongSound = function () {};
App._recordAnswer = function (dayIdx, mi, qi, val, correct) {
  App.state.answers[Api.answerKey(App._myStudentId(), dayIdx, mi, qi)] = { value: val, correct: correct };
};

// 真实环境里每次渲染都是 innerHTML 整块重建，按钮是全新的（默认 enabled）。
// 测试里的 stub 对象会被复用，所以要手动"重建"一次，否则上一节留下的
// disabled=true 会污染下一节。
function resetDom() {
  Object.keys(byId).forEach(id => {
    const e = byId[id];
    e.disabled = false; e._cls.clear();
    e.value = ''; e.innerHTML = ''; e.textContent = '';
  });
}

function loginAs(day) {
  resetDom();
  App.state.currentDay = day;
  App.state.currentTab = 'today';
  App.state.role = 'student';
  App.state.phone = PHONE;
  App.state.students = [{ id: SID, phone: PHONE, name: '优诺-Uno' }];
  App.state.answers = {};
  App.state.stepIdx = 0;
}

// 周五（dayIdx 4）的语法模块里既有选择题也有填空题（v153 起唯一混合题型）。
const DAY = 4;
const dayData = HOMEWORK_DATA[DAY];
const GMI = dayData.modules.findIndex(m => m.type === 'grammar');
const GM = dayData.modules[GMI];
const FQI = GM.questions.findIndex(q => !q.options);          // 填空题
const CQI = GM.questions.findIndex(q => Array.isArray(q.options)); // 选择题
const FILL = GM.questions[FQI];
const steps = App._buildSteps(DAY);
const stepOf = (mi, qi) => steps.findIndex(s => s.kind === 'question' && s.mi === mi && s.qi === qi);

console.log('（本次用第 ' + (WEEK + 1) + ' 周周二·' + GM.name_cn + '：填空第 ' + (FQI + 1)
  + ' 题「' + FILL.question + '」答案 ' + FILL.answer + '）');

// ===========================================================================
console.log('\n=== 1. _questionSolved：只认"做对了"，答错/没做都不算 ===');
{
  loginAs(DAY);
  const k = (qi) => Api.answerKey(SID, DAY, GMI, qi);
  App.state.answers = {};
  ok(App._questionSolved(GMI, FQI, DAY) === false, '没做过 → 不算做对');

  App.state.answers[k(FQI)] = { value: 'biggest', correct: false };
  ok(App._questionSolved(GMI, FQI, DAY) === false, '答错过 → 不算做对（不能白送）');

  App.state.answers[k(FQI)] = { value: FILL.answer, correct: true };
  ok(App._questionSolved(GMI, FQI, DAY) === true, '答对了 → 算做对');
}

// ===========================================================================
console.log('\n=== 2. 填空题没做对时：底部「下一题」先锁着（门槛还在）===');
{
  loginAs(DAY);
  App.state.answers = {};
  App.state.stepIdx = stepOf(GMI, FQI);
  ok(App.state.stepIdx >= 0, '找到了填空题在步骤流里的位置（第 ' + (App.state.stepIdx + 1) + ' 步）');
  App._lockNextOnRender = false;
  const html = App.renderStage(DAY);
  ok(html.indexOf('stage-next-btn') >= 0, '这一屏有底部「下一题」按钮');
  ok(html.indexOf('id="fill-' + GMI + '-' + FQI + '"') >= 0, '填空题渲染的是输入框（不是 ABCD 选项）');
  ok(html.indexOf('qr-follow-' + GMI + '-' + FQI) < 0, '填空题**没有**跟读区（这就是病根：无处可通过）');
  ok(App._lockNextOnRender === true, '没写对 → 渲染时标记"要锁住下一题"');
  App._applyStepLock();
  ok(getEl('stage-next-btn').disabled === true, '应用后按钮确实是灰的');
}

// ===========================================================================
console.log('\n=== 3. 写对了：立刻点亮「下一题」（家长要的就是这个）===');
{
  loginAs(DAY);
  App.state.answers = {};
  App.state.stepIdx = stepOf(GMI, FQI);
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  App._applyStepLock();
  ok(getEl('stage-next-btn').disabled === true, '（前提）刚进来按钮是灰的');

  const input = getEl('fill-' + GMI + '-' + FQI);
  input.value = FILL.answer;
  App.submitFill(GMI, FQI, DAY);
  ok(App.state.answers[Api.answerKey(SID, DAY, GMI, FQI)].correct === true, '答案记成"对"了');
  ok(getEl('stage-next-btn').disabled === false, '★ 写对后底部「下一题」**可以点了**（原来一直是灰的）');
  ok(getEl('stage-next-btn').classList.contains('nudge') === true, '★ 还带上了橙色轻推，孩子一眼看到该点哪');
  const note = getEl('ans-' + GMI + '-' + FQI).innerHTML;
  ok(note.indexOf('下一题') >= 0, '正确提示里直接告诉他点哪：' + note.replace(/<[^>]*>/g, ''));
}

// ===========================================================================
console.log('\n=== 4. 写错了：按钮不许亮（门槛不能被绕过）===');
{
  loginAs(DAY);
  App.state.answers = {};
  App.state.stepIdx = stepOf(GMI, FQI);
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  App._applyStepLock();

  const input = getEl('fill-' + GMI + '-' + FQI);
  input.value = 'biggest';
  App.submitFill(GMI, FQI, DAY);
  ok(App.state.answers[Api.answerKey(SID, DAY, GMI, FQI)].correct === false, '答案记成"错"了');
  ok(getEl('stage-next-btn').disabled === true, '写错了「下一题」还是灰的，必须改对');
}

// ===========================================================================
console.log('\n=== 5. 从下一题退回来：已经写对过就不再锁（不然又卡死）===');
{
  loginAs(DAY);
  App.state.answers = {};
  App.state.answers[Api.answerKey(SID, DAY, GMI, FQI)] = { value: FILL.answer, correct: true };
  App.state.stepIdx = stepOf(GMI, FQI);
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  ok(App._lockNextOnRender === false, '★ 这题昨天/刚才已经写对了 → 渲染时不再锁');
  App._applyStepLock();
  ok(getEl('stage-next-btn').disabled === false, '★ 退回来按钮就是亮的，能直接往下走');

  // 反例：答错的题退回来仍然要重做
  App.state.answers[Api.answerKey(SID, DAY, GMI, FQI)] = { value: 'x', correct: false };
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  ok(App._lockNextOnRender === true, '答错过的题退回来仍然锁着（必须改对，不能蒙过去）');
}

// ===========================================================================
console.log('\n=== 6. 选择题不受影响：选对也要跟读 ≥60 分才解锁 ===');
{
  loginAs(DAY);
  App.state.answers = {};
  App.state.stepIdx = stepOf(GMI, CQI);
  App._lockNextOnRender = false;
  const html = App.renderStage(DAY);
  ok(html.indexOf('id="qo-' + GMI + '-' + CQI + '"') >= 0, '选择题渲染的是 ABCD 选项');
  ok(html.indexOf('qr-follow-' + GMI + '-' + CQI) >= 0, '选择题有跟读区（有地方可通过）');
  ok(App._lockNextOnRender === true, '选择题仍然先锁住，跟读过了才放行（老门槛没动）');

  // 选对了 → 不再锁（v141 家长 2026-10-18：「做对了……下一题仍然是灰色的」。
  // 做对过的题切走再切回不得重新锁死，孩子不用把读过的话再读一遍）。
  App.state.answers[Api.answerKey(SID, DAY, GMI, CQI)] = { value: 1, correct: true };
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  ok(App._lockNextOnRender === false,
     '选择题做对过 → 重渲染不再锁下一题（v141：老行为"做对了也锁"是家长报的 bug）');
}

// ===========================================================================
console.log('\n=== 7. 老师端预览也走同一套门槛（v138 起）+ 有跳过键 ===');
{
  App.state.role = 'teacher';
  App.state.currentDay = DAY;
  App.state.phone = '13259532991';
  App.state.currentTab = 'preview';
  App.state.stepIdx = stepOf(GMI, FQI);
  App._lockNextOnRender = false;
  App.renderStage(DAY);
  // v138：家长 2026-10-17 在预览里看到"我还没做题呢，下一题已经可以点了" ——
  // 预览免锁就验不出学生那边的问题。现在预览也锁，老师用「跳过本题（老师）」走。
  ok(App._lockNextOnRender === true, '老师端预览同样进"必须做对"的门槛（v138）');
  App.state.role = 'student';
  App.state.currentTab = 'today';
  App.state.phone = PHONE;
}

// ===========================================================================
console.log('\n=== 8. 静态检查：新写法在位 ===');
{
  ok(/\(blanked \? !solved : \(qHasRead && !solvedChoice\)\)\)? this\._lockNextOnRender = true;/.test(src) &&
     /const blanked = !q\.options;/.test(src),
     '填空按"写对"、选择题按"可跟读且没做过"分流（v141：做对过不再重锁）');
  ok(/const blanked = !q\.options;/.test(src), '用"有没有 options"认填空题');
  ok(/_questionSolved\(mi, qi, dayIdx\) \{/.test(src), '_questionSolved 有定义');
  ok(/this\._unlockStep\(\);/.test(src.replace(/\s+/g, ' ').replace(/ /g, ' ')) || /_unlockStep\(\)/.test(src),
     'submitFill 里调了 _unlockStep');
  const subStart = src.indexOf('submitFill(mi, qi, dayIdx)');
  const sub = src.slice(subStart, src.indexOf('renderMyErrors()', subStart));
  ok(/_unlockStep\(\)/.test(sub), '解锁确实在 submitFill 里（不是别处顺手写的）');
  ok(sub.indexOf("ansEl.innerHTML = '✅ 正确！点下面的「'") >= 0,
     '答对文案直接告诉孩子点下面的按钮（"而不是虚的显示，让学生点不了"）');
  // 学生路径上不能只剩"✅ 正确！"这一句（老师端预览没有底部按钮，保留原样）
  const studentPath = sub.replace(/if \(this\.isTeacher\(\)\) \{[\s\S]*?\}/, '');
  ok(studentPath.indexOf("ansEl.innerHTML = '✅ 正确！';") < 0,
     '学生路径上不再有"只显示正确、不给下一步"的写法（老师端预览保留原样）');

  ok(/name="app-version" content="158"/.test(htmlSrc), '版本号升到 144');
  ok(/amy-english-v158/.test(swSrc), 'Service Worker 缓存名同步到 v144（不然手机上还是旧版）');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
