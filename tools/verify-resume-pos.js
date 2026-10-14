/* eslint-disable */
// 断点续做位置校验：把 public/app.js 原样加载进来（只 stub 掉浏览器环境），
// 验「退出再登录，回到哪儿」这件事。家长报的原始问题是：优诺这个账号明明
// 读到 museum 的下一个词 dinosaur 了，退出去再进来又回到 museum。
//
// 钉住的行为：
//   1. 词汇闯关的内部坐标（第几个词 / 第几个阶段 / 分数）落本机，
//      重登录接着那一屏，不回到第 1 个词
//   2. 昨日复习屏：点过「复习完成」就不再回放
//   3. 跟读句子这类"没有答过记录"的屏也能记住（读到第 3 句就退出 →
//      重登录回第 3 句，不退回第 1 句、也不跳到后面的题）
//   4. 题已经答过 → 位置自动前进，不需要孩子再点一次「下一题」
//   5. 全部做完 → 停在完成页
//   6. 没有本机记录（清缓存 / 换设备）→ 退回按答题记录推
//   7. 记录按「学生 + 周 + 第几天」分段，不串天
//   8. 越界/脏数据不许把页面搞崩
//   9. 老师端不写断点记录
//
// 用法：node tools/verify-resume-pos.js
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
  removeEventListener_: () => {},
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

// ---------- Api / Recorder stub ----------
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  checkinKey: (sid, d) => sid + '_d' + d,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  saveLearnedWords: () => {},
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
// 固定用第 1 周的题：HOMEWORK_DATA 按日历轮换，测试里断言的是具体词/句子，
// 不钉住周数的话下周日历一翻就假失败。
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
    alert: () => {}, confirm: () => true, prompt: '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

// ---------- 找一个词汇闯关的天、一个纯题目的天 ----------
const VOCAB = [];                       // {day, mi, words}
let ALLQ = -1;                          // 全是选择题/口语题的天（没有词汇/作文）
HOMEWORK_DATA.forEach((d, di) => {
  let hasSpecial = false;
  (d.modules || []).forEach((mm, mi) => {
    if (mm.type === 'vocabulary_game') {
      hasSpecial = true;
      if ((mm.words || []).length >= 3) VOCAB.push({ day: di, mi, m: mm });
    }
    if (mm.type === 'writing_template') hasSpecial = true;
  });
  if (!hasSpecial && ALLQ < 0) ALLQ = di;
});
if (!VOCAB.length) { console.log('第 1 周数据里没有词汇闯关模块'); process.exit(1); }
if (ALLQ < 0) { console.log('第 1 周数据里没有纯题目的一天'); process.exit(1); }

const PHONE = '13800000000';
const SID = 'stu1';
App.speak = function () {};
App.autoSpeak = function () {};         // 渲染词汇阶段时不要真去播音频

// 模拟一次登录：角色/手机号/学生名单就位
function loginAs(day) {
  App.state.currentDay = day;
  App.state.currentTab = 'today';
  App.state.role = 'student';
  App.state.phone = PHONE;
  App.state.students = [{ id: SID, phone: PHONE, name: '优诺-Uno' }];
}
// 模拟"退出再登录"：内存里的坐标全清空，只剩本机（localStorage）里的记录
function relogin(day) {
  App.state.stepIdx = 0;
  App.state.vocabMi = -1;
  App.state.vocabWordIdx = 0;
  App.state.vocabStage = 0;
  App.state.vocabScore = 0;
  App.state.vocabReviewDone = false;
  App.state.answers = {};
  loginAs(day);
  App.state.stepIdx = App._resumeStepIdx(day);
  return App.state.stepIdx;
}
const wordDiv = w => '<div class="vocab-word">' + w + '</div>';
const freshPos = () => { App._posStoreCache = null; lsData[App._POS_KEY] = '{}'; };

// ---- 主体 ----
(async () => {

// ===== 1. 词汇闯关：回到"读到第几个词 / 第几个阶段" =====
console.log('--- 1. 词汇闯关：重登录回到读到的那一屏 ---');
const V = VOCAB[0];
loginAs(V.day);
const vSteps = App._buildSteps(V.day);
const vIdx = vSteps.findIndex(s => s.kind === 'vocab');
ok(vIdx >= 0, '第 ' + V.day + ' 天的步骤里有词汇闯关');
ok(App._countDayQuestions(V.day) > 0, '（前提）这一天还有别的题');

// 孩子学到第 3 个词的第 4 个阶段（meaning_choice），分数 9，昨日复习已点过
App.state.answers = {};
App.state.vocabMi = V.mi;
App.state.vocabWordIdx = 2;
App.state.vocabStage = 3;
App.state.vocabScore = 9;
App.state.vocabReviewDone = true;
App.state.stepIdx = vIdx;
App._savePos(V.day);

const back = relogin(V.day);
ok(back === vIdx, '重登录 → 停在词汇闯关这一屏（第 ' + (vIdx + 1) + ' 步），不是回到第 1 题');
const vHtml = App.renderVocabGame(V.m, V.mi, V.day);
ok(App.state.vocabWordIdx === 2, '词序恢复到第 3 个词：' + V.m.words[2].word);
ok(App.state.vocabStage === 3, '阶段恢复到第 4 个阶段（' + V.m.words[2].stages[3].type + '）');
ok(vHtml.indexOf(wordDiv(V.m.words[2].word)) >= 0, '画面上就是 ' + V.m.words[2].word);
ok(vHtml.indexOf(wordDiv(V.m.words[0].word)) < 0, '不再回到第 1 个词 ' + V.m.words[0].word);
ok(App.state.vocabScore === 9, '分数接着算（9 分）');
ok(App._getPos(V.day).vocab.reviewDone === true, '昨日复习过了也记住了');

// 「下一个单词」这一下就该落盘（不用等做完整个模块）
App.state.vocabWordIdx = 3;
App.state.vocabStage = 0;
App.state.stepIdx = vIdx;
App._savePos(V.day);
ok(App._getPos(V.day).vocab.wordIdx === 3, '点「下一个单词」立刻记位置');
App.renderVocabGame(V.m, V.mi, V.day);
ok(App.state.vocabWordIdx === 3, '（模拟重进）直接落在第 4 个词 ' + V.m.words[3].word);

// ===== 2. 昨日复习屏：点过「复习完成」就不再回放 =====
console.log('\n--- 2. 昨日复习屏不回放 ---');
const V2 = VOCAB.filter(x => x.day > 0)[0] || V;
loginAs(V2.day);
App.state.learnedWords['day_' + (V2.day - 1)] =
  [{ word: 'old', meaning: '旧的', emoji: '📖', phonetic: '/əʊld/' }];
freshPos();
App.state.vocabMi = V2.mi;
App.state.vocabWordIdx = 1;
App.state.vocabStage = 3;
App.state.vocabScore = 4;
App.state.vocabReviewDone = false;
App.state.stepIdx = App._buildSteps(V2.day).findIndex(s => s.kind === 'vocab');
App._savePos(V2.day);

let h2 = App.renderVocabGame(V2.m, V2.mi, V2.day);
ok(h2.indexOf('复习昨日单词') >= 0, '还没点「复习完成」→ 重登录先回复习屏');

App._finishReview(V2.mi, V2.day);
ok(App._getPos(V2.day).vocab.reviewDone === true, '点「复习完成」当场落盘');
App.state.vocabReviewDone = false;                 // 模拟重登录清内存
h2 = App.renderVocabGame(V2.m, V2.mi, V2.day);
ok(h2.indexOf('复习昨日单词') < 0, '复习过了 → 重登录不再回放复习屏');
ok(h2.indexOf(wordDiv(V2.m.words[1].word)) >= 0, '直接接上第 2 个词 ' + V2.m.words[1].word);

// ===== 3. 没有"答过记录"的屏也能记住 =====
console.log('\n--- 3. 跟读句子：读到第 3 句退出 → 回第 3 句 ---');
loginAs(ALLQ);
App.state.answers = {};
freshPos();                                        // 只留"连续位置"这一份
const aSteps = App._buildSteps(ALLQ);
const sentIdx = aSteps.map((s, i) => ({ s, i })).filter(x => x.s.kind === 'sentence').map(x => x.i);
ok(sentIdx.length >= 3, '第 ' + ALLQ + ' 天有 ' + sentIdx.length + ' 句跟读');
const s3 = sentIdx[2];
App.state.stepIdx = s3;
App._savePos(ALLQ);
ok(App._resumeStepIdx(ALLQ) === s3, '读到第 3 句退出 → 重登录回第 3 句（第 ' + (s3 + 1) + ' 步）');
const byAns = App._resumeStepIdxFromAnswers(ALLQ, aSteps);
ok(byAns < s3, '（对照）只靠答题记录反推会退回第 ' + (byAns + 1) + ' 步 —— 所以必须有连续位置');

// ===== 4. 题答过就自动前进，不用再点「下一题」 =====
console.log('\n--- 4. 答过的题不再停住 ---');
App.state.answers = {};
freshPos();
const qIdx = aSteps.findIndex(s => s.kind === 'question');
App.state.answers[Api.answerKey(SID, ALLQ, aSteps[qIdx].mi, aSteps[qIdx].qi)] =
  { value: 0, correct: true };
App.state.stepIdx = qIdx;
App._savePos(ALLQ);
ok(App._resumeStepIdx(ALLQ) === qIdx + 1,
   '答完第 ' + (qIdx + 1) + ' 步没点「下一题」就退出 → 重登录直接进第 ' + (qIdx + 2) + ' 步');

// 答错了也一样往前走（位置跟着"停在哪"走，不跟着对错）
App.state.answers = {};
App.state.stepIdx = qIdx;
App._savePos(ALLQ);
ok(App._resumeStepIdx(ALLQ) === qIdx, '还没答 → 就停在那一题（' + (qIdx + 1) + ' 步）');

// ===== 5. 全部做完 → 完成页 =====
console.log('\n--- 5. 全做完 → 完成页 ---');
App.state.answers = {};
aSteps.forEach(s => {
  if (s.kind === 'question' || s.kind === 'speaking') {
    App.state.answers[Api.answerKey(SID, ALLQ, s.mi, s.qi)] = { value: 0, correct: true };
  }
});
App.state.stepIdx = 2;
App._savePos(ALLQ);                                // 故意存一个中间位置
ok(App._resumeStepIdx(ALLQ) === aSteps.length,
   '答题记录说全做完了 → 位置推到完成页（' + aSteps.length + ' 步）');

// ===== 6. 没有本机记录 → 退回按答题记录推 =====
console.log('\n--- 6. 没有本机记录（清缓存 / 换设备）→ 退回答题记录 ---');
freshPos();
ok(App._resumeStepIdx(ALLQ) === App._resumeStepIdxFromAnswers(ALLQ, aSteps),
   '两份记录都读不到时，行为跟改造前一致');

// ===== 7. 位置按天分段 =====
console.log('\n--- 7. 位置不串天 ---');
freshPos();
App.state.answers = {};
App.state.stepIdx = vIdx;
loginAs(V.day);
App._savePos(V.day);
ok(App._getPos(V.day) && App._getPos(V.day).stepIdx === vIdx, '第 ' + V.day + ' 天存了第 ' + (vIdx + 1) + ' 步');
ok(App._getPos(ALLQ) === null, '第 ' + ALLQ + ' 天没有记录，不会吃别人的');
loginAs(ALLQ);
ok(App._resumeStepIdx(ALLQ) === 0, '第 ' + ALLQ + ' 天从第 1 步开始');

// ===== 8. 越界 / 脏数据 =====
console.log('\n--- 8. 越界 / 脏数据不许把页面搞崩 ---');
const store = App._posStore();
store[App._posKey(ALLQ)] = { stepIdx: 9999 };
ok(App._resumeStepIdx(ALLQ) === aSteps.length, '位置越界 → 夹到完成页');
store[App._posKey(ALLQ)] = { stepIdx: -3 };
ok(App._resumeStepIdx(ALLQ) === 0, '负数 → 归零');
store[App._posKey(ALLQ)] = { stepIdx: 'abc' };
ok(App._resumeStepIdx(ALLQ) === 0, '非数字 → 当没有记录');
delete store[App._posKey(ALLQ)];

console.log('\n--- 8b. 词汇坐标脏数据 ---');
store[App._posKey(V.day)] = { stepIdx: vIdx, vocab: { mi: 99, wordIdx: 3, stage: 0 } };
App.renderVocabGame(V.m, V.mi, V.day);
ok(App.state.vocabWordIdx === 0, '模块号对不上 → 从第 1 个词开始，不硬套');
store[App._posKey(V.day)] = { stepIdx: vIdx, vocab: { mi: V.mi, wordIdx: 99, stage: 6 } };
App.renderVocabGame(V.m, V.mi, V.day);
ok(App.state.vocabWordIdx === 0, '词序越界 → 当没有记录，从第 1 个词开始');
store[App._posKey(V.day)] = { stepIdx: vIdx, vocab: { mi: V.mi, wordIdx: 1, stage: 99 } };
App.renderVocabGame(V.m, V.mi, V.day);
ok(App.state.vocabStage === V.m.words[1].stages.length - 1,
   '阶段越界 → 夹到最后一个阶段（' + V.m.words[1].stages.length + ' 个阶段，不会渲染出 undefined）');
const stBound = App.renderVocabStage(V.m, V.mi, V.day);
ok(typeof stBound === 'string' && stBound.length > 0, '夹完之后还能正常渲染这一屏');

// ===== 9. 老师端不写记录 =====
console.log('\n--- 9. 老师端不掺和 ---');
delete store[App._posKey(ALLQ)];
App.state.role = 'teacher';
App.state.stepIdx = 7;
App._savePos(ALLQ);
ok(!App._posStore()[App._posKey(ALLQ)], '老师端不写断点记录');
ok(App._resumeStepIdx(ALLQ) === 0, '老师端断点恒为第 1 步');
App.state.role = 'student';

// ===== 10. 走一遍真实渲染，位置确实落盘 =====
console.log('\n--- 10. 真实渲染链路：renderContent 会落盘 ---');
loginAs(V.day);
freshPos();
App.state.answers = {};
App.state.stepIdx = vIdx;
const realToday = App.getTodayWeekdayIdx;
App.getTodayWeekdayIdx = function () { return V.day; };   // 固定"今天"= 这一天
try {
  await App.renderContent();
  ok(App._getPos(App.state.currentDay) && App._getPos(App.state.currentDay).stepIdx === vIdx,
     'renderContent 之后位置已落盘（换屏即记住，不靠答题动作）');
} catch (e) {
  ok(false, 'renderContent 抛错：' + e.message);
}
App.getTodayWeekdayIdx = realToday;

console.log('\n' + (fail ? '❌ 有 ' + fail + ' 项不通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);

})();
