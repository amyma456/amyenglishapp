/* eslint-disable */
// 答错引导的校验（v104）。
//
// 家长的原话：「答错的练习题不要一下提示答案，有中文的提示，一步步告诉他
// 应该选哪个选项，用提示词来提醒他。不要一下告诉学生用绿框显示，直到点对
// 为止。取消这个功能，而是用中文的提示词来提示他。」
//
// 也就是把原来那套「答错 → 正确选项当场亮绿 → 孩子照着点绿框过关」改成：
// 答错只划掉他点错的那一项 + 一句中文提示，提示一次比一次具体，**绿框在
// 答对之前一次都不许出现**。
//
// 它动的是四个孩子每天都要走的入口（听力/阅读 ABCD、口语选择、高频词汇选词、
// 语法填空），所以四件事都钉住：
//   1. 提示阶梯：第 1 次只缩范围、第 2 次给"长相"+中文讲解、第 3 次才点名；
//   2. 四个答错入口都不许出现 green（correct 类 / clickable-correct）；
//   3. 点错的那一项要划掉（范围越选越小），没点过的还能再点；
//   4. 点对了才亮绿，且连错计数归零。
//
// 用法：node tools/verify-wrong-hint.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub（和 verify-answer-feedback.js 同一套路：只 stub 用得到的部分）
// ---------------------------------------------------------------------------
const allEls = [];
const byId = {};

function mkEl(tag, attrs, cls) {
  const e = {
    tagName: tag || 'div', _cls: new Set(cls || []),
    _attrs: Object.assign({}, attrs || {}), _parent: null,
    style: {}, innerHTML: '', textContent: '', className: '', disabled: false,
    dataset: {}, value: '',
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    toggle: (c, on) => { if (on) e._cls.add(c); else e._cls.delete(c); return e._cls.has(c); },
    contains: c => e._cls.has(c),
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.scrollIntoView = () => {};
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.click = () => {};
  e.play = () => Promise.resolve();
  e.closest = () => null;
  e.querySelector = () => null;
  e.querySelectorAll = () => [];
  allEls.push(e);
  return e;
}

function selMatch(el, sel) {
  return sel.split(',').map(s => s.trim()).some(p => {
    if (/^#[\w-]+ \.speak-option$/.test(p)) return el._cls.has('speak-option');
    if (/^#[\w-]+ \.q-option$/.test(p)) return el._cls.has('q-option');
    if (/^#[\w-]+ \.vocab-option-card$/.test(p)) return el._cls.has('vocab-option-card');
    if (p === '.auto-read-badge') return el._cls.has('auto-read-badge');
    return false;
  });
}

const getEl = id => (byId[id] = byId[id] || mkEl('div', { id: id }));
const document = {
  getElementById: getEl,
  querySelector: sel => allEls.find(e => selMatch(e, sel)) || null,
  querySelectorAll: sel => allEls.filter(e => selMatch(e, sel)),
  createElement: mkEl,
  addEventListener: () => {}, removeEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
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
  AudioContext: function () { return null; },
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  warmup: () => {}, isFillerTranscript: () => false,
  dict: async () => null, transcribe: async () => ({ text: '' }),
  saveAnswer: async () => ({}), saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  load: async () => ({}), getAnswers: async () => [],
  loadWrongCache: async () => {}, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
// 第 7 节要跨周查全部 80 张词卡，所以两样都取出来
const dataScope = new Function(dataSrc + '; return { weeks: HOMEWORK_WEEKS, today: HOMEWORK_DATA };')();
const HOMEWORK_WEEKS = dataScope.weeks;
const HOMEWORK_DATA = dataScope.today;
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

// 不落库、不翻页、不发声 —— 本脚本只关心"提示词写了什么、谁被点亮了"
App._recordAnswer = function () {};
App.nextVocabStage = function () {};
App.showToast = function () {};
App._playCorrectSound = function () {};
App._playWrongSound = function () {};
App.speak = function () {};
App._stopCurrentAudio = function () {};
App._renderHoldReadPanel = function () {};
App._showSpeakingIndicator = function () {};

// 只 stub 用得到的部分（和 verify-answer-feedback.js 同一套路）
const seqEvents = [];
App.selectAnswer = App.selectAnswer.bind(App);

// ===========================================================================
console.log('\n=== 1. 提示阶梯：一次比一次具体，但前两次都不报答案 ===');
console.log('（v107：第 1 次错就给"围绕意思"的提示，不再念"划掉了哪个、还剩几个"）');

{
  const opts = ['I eat apples.', 'I go to school by bus.', 'She is my sister.', 'They are teachers.'];
  const answer = 2;
  const correctText = opts[answer];
  const clue1 = '想一想：这句话是在说自己怎么去上学。';

  const h1 = App._wrongHintHtml({
    attempt: 1, opts: opts, answer: answer, correctText: correctText, picked: 0,
    clue1: clue1, retryTip: '先听完问题再选。',
  });
  ok(/不是这个/.test(h1), '第 1 次错：先明确"不是这个"');
  ok(h1.indexOf(clue1) >= 0, '第 1 次错：直接端出"围绕意思"的中文提示（v107）');
  ok(!/已经划掉|剩下 ?[0-9]|再选一次/.test(h1),
     '第 1 次错：不再说"已经划掉 X 了，答案就在剩下 N 个里面，再选一次"（家长原话：这句话没有用）');
  ok(h1.indexOf(correctText) < 0, '第 1 次错：**一个字都不提正确答案**（"一下提示答案"就是这里）');
  ok(!/答案是/.test(h1), '第 1 次错：不说"答案是"');
  ok(!/A、B、C、D|在 ?[ABCD]、/.test(h1), '第 1 次错：不再列"在哪几个字母里挑"');

  const h2 = App._wrongHintHtml({
    attempt: 2, opts: opts, answer: answer, correctText: correctText, picked: 0,
    clue3: '这是主谓一致：第三人称单数要用 is。',
  });
  ok(/正确答案/.test(h2) && /第一个字母是/.test(h2), '第 2 次错：描述正确答案的"长相"（首字母），让他自己能认出来');
  ok(h2.indexOf('主谓一致') < 0, '第 2 次错：解析还没端出来（题库里的解析常常就是答案，提前给等于报答案）');
  ok(h2.indexOf('📖') < 0, '第 2 次错：不带"📖 解析"那一段');
  ok(h2.indexOf(correctText) < 0, '第 2 次错：仍然不整句报答案');

  const h3 = App._wrongHintHtml({
    attempt: 3, opts: opts, answer: answer, correctText: correctText, picked: 0,
    clue3: '这是主谓一致：第三人称单数要用 is。',
  });
  ok(/答案是 ?C/.test(h3) && h3.indexOf(correctText) >= 0, '第 3 次错：非词汇题点名（字母 + 内容），孩子已经错了两次，再让他瞎猜没有意义');
  ok(/点它一下|点一下/.test(h3), '第 3 次错：仍然要求他自己点下去，脚本不代劳');
  ok(h3.indexOf('主谓一致') >= 0, '第 3 次错：点名之后把解析补上（讲明白为什么，收个尾）');
  const h4 = App._wrongHintHtml({ attempt: 9, opts: opts, answer: answer, correctText: correctText, picked: 1 });
  ok(/答案是 ?C/.test(h4), '再往下错也稳定在第 3 级的提示上，不会绕回模糊提示');
}

{
  // 词汇游戏的卡片没有 A/B/C/D，只能说"第几个"
  const opts = ['🪨', '⚽', '🏃', '🌸'];
  const clue1 = '看到花、看到晚霞，心里觉得“真好看”的那种感觉';
  const h1 = App._wrongHintHtml({
    attempt: 1, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0,
    clue1: clue1, neverReveal: true,
  });
  ok(h1.indexOf(clue1) >= 0, '卡片题第 1 次错：给的是围绕词义的中文提示');
  ok(!/已经划掉|剩下 ?[0-9]|再选一次/.test(h1),
     '卡片题第 1 次错：不再说"已经划掉第 1 个了 / 答案就在剩下 3 个里面"（家长点名要删的那句）');
  ok(h1.indexOf('A') < 0, '卡片题第 1 次错：不出现字母 A（孩子在屏幕上找不到它）');
  ok(h1.indexOf('🌸') < 0, '卡片题第 1 次错：绝不出现答案那张表情');

  const h2 = App._wrongHintHtml({
    attempt: 2, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0,
    neverReveal: true, clue1: clue1,
    clue2: '我们学过的一句话：「日落很美丽。」',
  });
  ok(h2.indexOf('第一个字母是') < 0, '图片选项没有字可描述，不硬说"第一个字母是 🌸"');
  ok(h2.indexOf('日落很美丽') >= 0, '第 2 次错：给"我们学过的一句话"当线索');
  ok(h2.indexOf('🌸') < 0, '第 2 次错：不把表情本身（答案是哪张图）端出来');
  ok(!/第 ?[0-9] ?个|剩下/.test(h2), '第 2 次错：不提"第几个 / 还剩几个"');

  // 第 3 次起：词汇题永不点名（v107）
  const h3 = App._wrongHintHtml({
    attempt: 3, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0,
    neverReveal: true, clue1: clue1,
    revealStrong: '💡 beautiful 的意思是「美丽的，漂亮的」。对着这个意思，挑出配得上的那张图。',
    finalTail: '把对上意思的那张，自己点下去。',
  });
  ok(h3.indexOf('🌸') < 0, '第 3 次错：**仍然不点名是哪一张**（家长原话：没有提示正确答案，让学生自己思考）');
  ok(!/第 ?4 ?个/.test(h3) && !/答案是/.test(h3), '第 3 次错：不说"答案就是第 4 个"、也不出现"答案是"');
  ok(/自己/.test(h3), '第 3 次错：明确要求他自己找、自己点');
  const h9 = App._wrongHintHtml({
    attempt: 9, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 1, neverReveal: true,
  });
  ok(h9.indexOf('🌸') < 0 && !/第 ?4 ?个/.test(h9), '再往下错也不会绕回点名 —— 词汇题全程不报答案');
}

{
  // 填空题：没有选项，靠"第一个字母 + 几个字母 + 几个单词"
  const h1 = App._wrongHintHtml({ attempt: 1, correctText: 'was reading', retryTip: '先想缺的是什么词。' });
  ok(/不是这个/.test(h1) && h1.indexOf('was reading') < 0, '填空题第 1 次错：不报答案');
  const h2 = App._wrongHintHtml({ attempt: 2, correctText: 'was reading', clue3: '……用 was reading。' });
  ok(/第一个字母是“w”/.test(h2) && /10 ?个字母/.test(h2), '填空题第 2 次错：给首字母 + 字母数（真正的"一步步"）');
  ok(h2.indexOf('was reading') < 0, '填空题第 2 次错：仍不给整词');
  ok(h2.indexOf('用 was reading') < 0, '填空题第 2 次错：解析也不给 —— 题库里的解析写着答案（"……用 is"），提前端出来跟报答案没区别');
  const h3 = App._wrongHintHtml({ attempt: 3, correctText: 'was reading', finalTail: '照着打进上面的框里就对了。' });
  ok(h3.indexOf('was reading') >= 0 && /打进/.test(h3), '填空题第 3 次错：给全答案，并要求他自己打进去');
}

// ===========================================================================
console.log('\n=== 2. 听力/阅读 ABCD：答错只划错项 + 中文提示，绝不亮绿 ===');

let d2 = -1, m2 = -1, q2 = null;
for (let d = 0; d < HOMEWORK_DATA.length && d2 < 0; d++) {
  const mods = HOMEWORK_DATA[d].modules || [];
  for (let i = 0; i < mods.length; i++) {
    const mm = mods[i];
    if (mm.questions && mm.questions.length && mm.questions[0].options
        && typeof mm.questions[0].answer === 'number' && mm.type !== 'speaking') {
      d2 = d; m2 = i; q2 = mm.questions[0]; break;
    }
  }
}

if (d2 < 0) { console.log('  跳过：题库里找不到 ABCD 型题目'); }
else {
  App.state.currentDay = d2;
  const optEls = [];
  for (let i = 0; i < q2.options.length; i++) optEls.push(mkEl('div', {}, ['q-option']));
  const realQSA = document.querySelectorAll;
  document.querySelectorAll = sel => (/\.q-option$/.test(sel) ? optEls : realQSA(sel));

  const ansEl = getEl('ans-' + m2 + '-0');
  const qText = String(q2.options[q2.answer]);
  const wrongIdx = (q2.answer + 1) % q2.options.length;

  // --- 第 1 次错 ---
  App.selectAnswer(m2, 0, wrongIdx, d2);
  ok(!optEls[q2.answer]._cls.has('correct'), '答错时正确选项不亮绿（这就是被取消的那个功能）');
  ok(optEls[wrongIdx]._cls.has('wrong'), '点错的那一项当场标红');
  ok(optEls[wrongIdx].style.pointerEvents === 'none', '点错的那一项就地划掉（不再让它重复点）');
  ok(optEls[q2.answer].style.pointerEvents === 'auto', '没点过的选项还能再点（他要自己选出来）');
  ok(ansEl._cls.has('q-hint') && /不是这个/.test(ansEl.innerHTML), '页面上的提示容器换成了提示样式，并写出中文提示');
  ok(ansEl.innerHTML.indexOf(qText) < 0, '第 1 次错的现场提示里没有正确答案的内容');
  ok(!/点绿色/.test(ansEl.innerHTML), '不再出现"点绿色的正确选项"这句话');

  // --- 第 2 次错：换一个错项 ---
  const wrongIdx2 = (q2.answer + 2) % q2.options.length;
  App.selectAnswer(m2, 0, wrongIdx2, d2);
  ok(ansEl.innerHTML.indexOf('第一个字母是') >= 0 || /正确答案/.test(ansEl.innerHTML),
     '第 2 次错的现场提示升级为"正确答案长什么样"');
  ok(ansEl.innerHTML.indexOf(qText) < 0, '第 2 次错的现场提示里仍然没有完整答案');
  {
    const exp = String(q2.explanation_cn || '');
    ok(!exp || ansEl.innerHTML.indexOf(exp.slice(0, 12)) < 0,
       '第 2 次错的现场提示里没有解析原文（解析里常常就写着答案）');
  }

  // --- 第 3 次错：点名，但不代点 ---
  const wrongIdx3 = (q2.answer + 3) % q2.options.length;
  App.selectAnswer(m2, 0, wrongIdx3, d2);
  ok(ansEl.innerHTML.indexOf(qText) >= 0, '第 3 次错才把答案内容说出来');
  ok(!optEls[q2.answer]._cls.has('correct'),
     '就算提示里点名了，正确项也没有被脚本点亮 —— 仍然要孩子自己点（"直到点对为止"）');

  // --- 点对：这时才亮绿，且计数归零 ---
  App.selectAnswer(m2, 0, q2.answer, d2);
  ok(optEls[q2.answer]._cls.has('correct'), '点对了才亮绿');
  ok(!ansEl._cls.has('q-hint'), '点对后提示样式撤掉（不再显示黄色提示）');
  ok(/✅/.test(ansEl.innerHTML), '点对后给的是成功反馈');
  ok(App._wrongTries('q-' + m2 + '-0') === 0, '点对后连错计数归零（这题不再背着前面的错）');

  // --- 再错一次：又从"缩范围"开始（不会一上来就报答案）---
  App.selectAnswer(m2, 0, wrongIdx, d2);
  ok(/不是这个/.test(ansEl.innerHTML) && ansEl.innerHTML.indexOf(qText) < 0,
     '计数归零后重新答错，提示又从第 1 级开始（不会直接甩答案）');

  document.querySelectorAll = realQSA;
}

// ===========================================================================
console.log('\n=== 3. 口语选择题：答错同样只给中文提示 ===');

{
  let dayIdx = -1, mi = -1, q = null;
  for (let d = 0; d < HOMEWORK_DATA.length && dayIdx < 0; d++) {
    const mods = HOMEWORK_DATA[d].modules || [];
    for (let i = 0; i < mods.length; i++) {
      if (mods[i].type === 'speaking' && mods[i].questions && mods[i].questions.length) {
        dayIdx = d; mi = i; q = mods[i].questions[0]; break;
      }
    }
  }
  if (dayIdx < 0) { console.log('  跳过：题库里没有口语模块'); }
  else {
    const optEls = [];
    for (let i = 0; i < 4; i++) optEls.push(mkEl('div', {}, ['speak-option']));
    const realQSA = document.querySelectorAll;
    document.querySelectorAll = sel => (/\.speak-option$/.test(sel) ? optEls : realQSA(sel));
    const tipEl = getEl('sp-tip-' + mi);
    const wrongIdx = (q.answer + 1) % 4;

    App.selectSpeakAnswer(mi, 0, wrongIdx, dayIdx);
    document.querySelectorAll = realQSA;
    ok(!optEls[q.answer]._cls.has('correct'), '口语选错：正确选项不亮绿');
    ok(optEls[wrongIdx]._cls.has('wrong'), '口语选错：点错的那句标红划掉');
    // v137（家长 2026-10-17）：口语的提示不再说"不是这个、在剩下的里挑 A/B/C"，
    // 改成老师那样讲意思 —— 问句什么意思、你选的那句什么意思、答句该说什么。
    ok(tipEl._cls.has('q-hint') && /这句回答不了这个问题/.test(tipEl.innerHTML),
       '口语选错：给出中文提示词');
    ok(String(tipEl.innerHTML).indexOf(String(q.sentence_cn)) >= 0,
       '口语第 1 次错：先讲问句的中文意思');
    ok(String(tipEl.innerHTML).indexOf(String((q.options_cn || [])[wrongIdx])) >= 0,
       '口语第 1 次错：把他点的那句翻成中文告诉他');
    ok(String(tipEl.innerHTML).indexOf(String(q.options[q.answer])) < 0, '口语第 1 次错：提示里没有正确答案的内容');
    ok(!/点绿色/.test(tipEl.innerHTML), '口语里也不再出现"点绿色"');
  }
}

// ===========================================================================
console.log('\n=== 4. 高频词汇：卡片不亮绿、不代点，只有第一次就对才计分 ===');

{
  // 找一个带 image_choice 阶段的词汇模块
  let dayIdx = -1, mi = -1, word = null, sIdx = -1;
  for (let d = 0; d < HOMEWORK_DATA.length && dayIdx < 0; d++) {
    const mods = HOMEWORK_DATA[d].modules || [];
    for (let i = 0; i < mods.length; i++) {
      const ws = mods[i].words;
      if (!ws || !ws.length) continue;
      for (let w = 0; w < ws.length; w++) {
        const ss = ws[w].stages || [];
        for (let s = 0; s < ss.length; s++) {
          if (ss[s].type === 'image_choice' && ss[s].options && ss[s].options.length) {
            dayIdx = d; mi = i; word = ws[w]; sIdx = s; break;
          }
        }
        if (dayIdx >= 0) break;
      }
      if (dayIdx >= 0) break;
    }
  }

  if (dayIdx < 0) { console.log('  跳过：题库里找不到"选图片"阶段'); }
  else {
    App.state.vocabWordIdx = 0;
    App.state.vocabStage = sIdx;
    // 上面的遍历里 word 可能不是第 0 个 —— 对齐一下
    const words = HOMEWORK_DATA[dayIdx].modules[mi].words;
    App.state.vocabWordIdx = words.indexOf(word);
    const stage = word.stages[sIdx];
    const optEls = [];
    for (let i = 0; i < stage.options.length; i++) optEls.push(mkEl('div', {}, ['vocab-option-card']));
    const realQSA = document.querySelectorAll;
    document.querySelectorAll = sel => (/\.vocab-option-card$/.test(sel) ? optEls : realQSA(sel));

    // v118 起提示落在"题目正下方的内嵌槽位"（vocab-hint-<mi>）里，
    // 不再是卡片末尾那个容器 —— 用 App._vocabHintEl(mi) 跟代码保持一致。
    const resultDiv = App._vocabHintEl(mi);
    resultDiv.innerHTML = '';
    const wrongIdx = (stage.answer + 1) % stage.options.length;
    const scoreBefore = App.state.vocabScore;

    App.selectVocabWrong = null;
    App.checkVocabAnswer(mi, wrongIdx, stage.answer, dayIdx, words.length, word.stages.length);
    ok(!optEls[stage.answer]._cls.has('correct'), '词汇答错：正确卡片不亮绿');
    ok(!optEls[stage.answer]._cls.has('clickable-correct'), '词汇答错：不再把正确卡片变成"可点击过关"（那个功能已取消）');
    ok(optEls[wrongIdx]._cls.has('wrong') && optEls[wrongIdx].style.pointerEvents === 'none',
       '词汇答错：选错的那张划掉');
    ok(optEls[stage.answer].style.pointerEvents === 'auto', '词汇答错：正确卡片仍然等着孩子自己点');
    ok(String(resultDiv.innerHTML).indexOf('点亮绿色正确答案') < 0, '不再出现"点亮绿色正确答案，继续学习"');
    ok(resultDiv._cls.has('q-hint') && /不是这个/.test(resultDiv.innerHTML), '词汇答错：给出中文提示词');
    ok(String(resultDiv.innerHTML).indexOf(String(word.hint_cn)) >= 0,
       '词汇第 1 次错：立刻给出这个单词"围绕意思"的中文提示（"' + word.hint_cn + '"）');
    ok(!/已经划掉|剩下 ?[0-9]|再选一次/.test(resultDiv.innerHTML),
       '词汇第 1 次错：不再说"已经划掉第 N 个了，答案就在剩下 3 个里面，再选一次"（家长点名要删）');
    ok(String(resultDiv.innerHTML).indexOf(String(stage.options[stage.answer])) < 0,
       '词汇第 1 次错：不提答案是哪一张');
    ok(App.state.vocabScore === scoreBefore, '答错不加分');

    // 再错一次 → 提示升级：选图给"我们学过的一句话"，选意思给"这几个字有多长"
    const wrongIdx2 = (stage.answer + 2) % stage.options.length;
    App.checkVocabAnswer(mi, wrongIdx2, stage.answer, dayIdx, words.length, word.stages.length);
    const h2 = String(resultDiv.innerHTML);
    ok(h2.indexOf(word.hint_cn) >= 0, '词汇第 2 次错：原来的"围绕意思"提示还挂着（不擦掉重来）');
    ok(h2.indexOf(String(word.example_cn)) >= 0, '词汇第 2 次错：再给"我们学过的一句话"当线索');
    ok(h2.indexOf(String(stage.options[stage.answer])) < 0, '词汇第 2 次错：仍然没说答案是哪一张');
    if (stage.type === 'meaning_choice') {
      ok(h2.indexOf(String(word.meaning)) < 0,
         '选意思那题第 2 次错：**绝不把释义原文端出来**（选项就是释义，写上等于答案）');
    }

    // 第 3 次：词汇题也不点名（v107 家长原话"没有提示正确答案，让学生自己思考"）
    const wrongIdx3 = (stage.answer + 3) % stage.options.length;
    App.checkVocabAnswer(mi, wrongIdx3, stage.answer, dayIdx, words.length, word.stages.length);
    const h3 = String(resultDiv.innerHTML);
    ok(h3.indexOf(String(stage.options[stage.answer])) < 0,
       '词汇第 3 次错：仍然不点名是哪一张（' + stage.options[stage.answer] + '）');
    ok(!/第 ?[0-9] ?个[，。]|答案是/.test(h3), '词汇第 3 次错：不出现"答案是第 N 个"这种直给');
    ok(h3.indexOf(String(word.example_cn)) >= 0 || h3.indexOf(String(word.hint_cn)) >= 0,
       '词汇第 3 次错：给的是最强的"围绕意思"的提示，让他自己推');
    ok(!optEls[stage.answer]._cls.has('correct'), '不点名、不自动点亮，孩子还得自己点');

    // 自己点对 → 亮绿；但试错后点对不计分（星级不被刷高）
    const score2 = App.state.vocabScore;
    App.checkVocabAnswer(mi, stage.answer, stage.answer, dayIdx, words.length, word.stages.length);
    document.querySelectorAll = realQSA;
    ok(optEls[stage.answer]._cls.has('correct'), '自己点对了才亮绿');
    ok(App.state.vocabScore === score2, '试错之后点对的不计分（和原来"错的那张不计分"口径一致）');
    ok(App._wrongTries('v-' + mi + '-' + App.state.vocabWordIdx + '-' + sIdx) === 0, '点对后计数归零');

    // 第一次就对（换个阶段）照样计分
    App.state.vocabStage = 0;
    const score3 = App.state.vocabScore;
    App.checkVocabAnswer(mi, 0, 0, dayIdx, words.length, word.stages.length);
    ok(App.state.vocabScore === score3 + 1, '第一次就点对仍然正常计分');
  }
}

// ===========================================================================
console.log('\n=== 4b. 选意思那题：连错三次也不许出现释义原文（选项就是释义） ===');
{
  let dayIdx = -1, mi = -1, word = null, sIdx = -1;
  for (let d = 0; d < HOMEWORK_DATA.length && dayIdx < 0; d++) {
    const mods = HOMEWORK_DATA[d].modules || [];
    for (let i = 0; i < mods.length && dayIdx < 0; i++) {
      const ws = mods[i].words || [];
      for (let w = 0; w < ws.length && dayIdx < 0; w++) {
        const ss = ws[w].stages || [];
        for (let s = 0; s < ss.length; s++) {
          if (ss[s].type === 'meaning_choice' && ss[s].options && ss[s].options.length) {
            dayIdx = d; mi = i; word = ws[w]; sIdx = s; break;
          }
        }
      }
    }
  }
  if (dayIdx < 0) { console.log('  跳过：题库里找不到"选意思"阶段'); }
  else {
    const words = HOMEWORK_DATA[dayIdx].modules[mi].words;
    App.state.vocabWordIdx = words.indexOf(word);
    App.state.vocabStage = sIdx;
    const stage = word.stages[sIdx];
    const optEls = [];
    for (let i = 0; i < stage.options.length; i++) optEls.push(mkEl('div', {}, ['vocab-option-card']));
    const realQSA = document.querySelectorAll;
    document.querySelectorAll = sel => (/\.vocab-option-card$/.test(sel) ? optEls : realQSA(sel));
    const resultDiv = App._vocabHintEl(mi);
    resultDiv.innerHTML = '';

    // 三个错项各错一次，再重复错一次（共 4 次），全程都不许出现释义原文
    const wrongIdxs = [];
    for (let k = 1; k < stage.options.length; k++) wrongIdxs.push((stage.answer + k) % stage.options.length);
    wrongIdxs.push(wrongIdxs[0]);
    for (let i = 0; i < wrongIdxs.length; i++) {
      App.checkVocabAnswer(mi, wrongIdxs[i], stage.answer, dayIdx, words.length, word.stages.length);
      const h = String(resultDiv.innerHTML);
      ok(h.indexOf(String(word.meaning)) < 0,
         '第 ' + (i + 1) + ' 次错：提示里没有释义原文（"' + word.meaning + '"）');
      ok(h.indexOf(String(stage.options[stage.answer])) < 0,
         '第 ' + (i + 1) + ' 次错：提示里没有那张卡片的文字');
      ok(h.indexOf(String(word.hint_cn)) >= 0, '第 ' + (i + 1) + ' 次错：给的是"围绕意思"的提示，不是空话');
    }
    // 他照着提示自己找出来 → 亮绿
    App.checkVocabAnswer(mi, stage.answer, stage.answer, dayIdx, words.length, word.stages.length);
    document.querySelectorAll = realQSA;
    ok(optEls[stage.answer]._cls.has('correct'), '自己点对了才亮绿');
  }
}

// ===========================================================================
console.log('\n=== 5. 语法填空：不报答案，首字母 → 全词逐级给 ===');

{
  let dayIdx = -1, mi = -1, qi = -1, q = null;
  for (let d = 0; d < HOMEWORK_DATA.length && dayIdx < 0; d++) {
    const mods = HOMEWORK_DATA[d].modules || [];
    for (let i = 0; i < mods.length; i++) {
      const qs = mods[i].questions;
      if (!qs) continue;
      for (let j = 0; j < qs.length; j++) {
        if (!qs[j].options && qs[j].answer != null) { dayIdx = d; mi = i; qi = j; q = qs[j]; break; }
      }
      if (dayIdx >= 0) break;
    }
  }
  if (dayIdx < 0) { console.log('  跳过：题库里找不到填空题'); }
  else {
    HOMEWORK_DATA[dayIdx].modules[mi].questions = HOMEWORK_DATA[dayIdx].modules[mi].questions || [];
    const inp = mkEl('input', { id: 'fill-' + mi + '-' + qi });
    inp.value = 'xxxxx';
    byId['fill-' + mi + '-' + qi] = inp;
    const ansEl = getEl('ans-' + mi + '-' + qi);
    const ans = String(q.answer);

    App.submitFill(mi, qi, dayIdx);
    ok(ansEl.innerHTML.indexOf(ans) < 0, '填空第 1 次错：不显示正确答案（原来是一上来就"正确答案：xxx"）');
    ok(!/正确答案：/.test(ansEl.innerHTML), '填空里不再出现"正确答案："这句直给');
    ok(/不是这个/.test(ansEl.innerHTML), '填空第 1 次错：给中文提示');
    ok(inp.value === '', '错的那一版清掉，就在原框里重打（不用找第二个框）');

    inp.value = 'yyyyy';
    App.submitFill(mi, qi, dayIdx);
    ok(ansEl.innerHTML.indexOf(ans) < 0, '填空第 2 次错：仍然不给整词');
    ok(/第一个字母是/.test(ansEl.innerHTML), '填空第 2 次错：给首字母（能自己往下猜了）');
    {
      const exp = String(q.explanation_cn || '');
      ok(!exp || ansEl.innerHTML.indexOf(exp.slice(0, 12)) < 0,
         '填空第 2 次错：不给解析 —— 题库里填空的解析直接写着答案（"……用 is"）');
    }

    inp.value = 'zzzzz';
    App.submitFill(mi, qi, dayIdx);
    ok(ansEl.innerHTML.indexOf(ans) >= 0, '填空第 3 次错：给全答案，并要求自己打进去');
    ok(/打进/.test(ansEl.innerHTML), '填空第 3 次错：提示他"照着打进框里"，而不是替他填');

    inp.value = ans;
    App.submitFill(mi, qi, dayIdx);
    ok(!ansEl._cls.has('q-hint') && /✅/.test(ansEl.innerHTML), '打对了给成功反馈并撤掉提示样式');
  }
}

// ===========================================================================
console.log('\n=== 6. 静态检查：那套"点绿框过关"的代码真的删干净了 ===');

{
  ok(src.indexOf('clickable-correct') < 0, 'app.js 里再也没有 clickable-correct');
  ok(htmlSrc.indexOf('clickable-correct') < 0, 'index.html 里对应的样式定义也删了');

  const grab = (fn) => {
    const re = new RegExp('^  ' + fn + '\\([\\s\\S]*?\\n  \\},', 'm');
    const m = re.exec(src);
    return m ? m[0] : '';
  };

  // 四个入口的"答错分支"里都不许再点亮正确项
  {
    const body = grab('checkVocabAnswer');
    const i = body.indexOf('} else {');
    const wrong = i >= 0 ? body.slice(i) : body;
    ok(wrong.indexOf("add('correct'") < 0 && wrong.indexOf('add("correct"') < 0,
       'checkVocabAnswer 的答错分支里没有 add(correct)');
  }
  {
    const body = grab('selectAnswer');
    const i = body.indexOf('if (!isCorrect) {');
    const j = body.indexOf('// Correct pick', i);
    const wrong = (i >= 0 && j > i) ? body.slice(i, j) : '';
    ok(!!wrong, 'selectAnswer 里找得到答错分支');
    ok(wrong.indexOf("add('correct'") < 0, 'selectAnswer 的答错分支里没有 add(correct)');
    ok(wrong.indexOf('_wrongHintHtml') >= 0, 'selectAnswer 的答错分支走的是中文提示');
    ok(wrong.indexOf('_wrongTryBump') >= 0, 'selectAnswer 的答错分支记了连错次数');
  }
  {
    const body = grab('selectSpeakAnswer');
    const i = body.indexOf('if (!isCorrect) {');
    const j = body.indexOf('// 选对', i);
    const wrong = (i >= 0 && j > i) ? body.slice(i, j) : '';
    ok(!!wrong, 'selectSpeakAnswer 里找得到答错分支');
    ok(wrong.indexOf("add('correct'") < 0, 'selectSpeakAnswer 的答错分支里没有 add(correct)');
    // v137：口语改走自己的老师式中文提示（_speakWrongHintHtml）
    ok(wrong.indexOf('_speakWrongHintHtml') >= 0, 'selectSpeakAnswer 的答错分支走的是老师式中文提示');
  }
  {
    const body = grab('submitFill');
    const i = body.indexOf('} else {');
    const j = body.indexOf('Auto-speak the next question', i);
    const wrong = (i >= 0 && j > i) ? body.slice(i, j) : '';
    ok(!!wrong, 'submitFill 里找得到答错分支');
    ok(wrong.indexOf('_wrongHintHtml') >= 0, 'submitFill 的答错分支走的是中文提示');
    ok(!/正确答案：/.test(wrong), 'submitFill 的答错分支不再写"正确答案："');
  }

  // 提示文本必须都是中文提示词（不给孩子甩英文解释）
  for (const [name, fn] of [['selectAnswer', 'selectAnswer'], ['selectSpeakAnswer', 'selectSpeakAnswer'],
                            ['checkVocabAnswer', 'checkVocabAnswer'], ['submitFill', 'submitFill']]) {
    const body = grab(fn);
    // selectSpeakAnswer 从 v137 起不再带 retryTip —— 它整段换成了
    // 「问句什么意思 → 你选的那句什么意思 → 答句该说什么」的引导，
    // "该怎么办"就写在引导里（再听一遍、一句一句翻成中文再选）。
    ok(/_retryTip|retryTip:|_speakWrongHintHtml/.test(body) || fn === 'checkVocabAnswer',
       name + ' 的提示里带了一句"该怎么办"的中文提醒');
  }

  // 三级阶梯在源码里是齐的（别被后人删掉中间那一级）
  ok(/_choiceShape/.test(src) && /attempt <= 1/.test(src) && /attempt === 2/.test(src),
     '_wrongHintHtml 的三个分级都在');
}

// ===========================================================================
console.log('\n=== 7. 80 张词卡：每张都有一条"围绕意思"的提示，且没有一条泄露答案 ===');
console.log('（含跨周检查 —— 第 2-4 周的词卡是 vocabWord() 生成的，别只查当周）');

{
  const words = [];
  HOMEWORK_WEEKS.forEach(wk => wk.forEach(d => (d.modules || []).forEach(m => {
    if (m.type === 'vocabulary_game') (m.words || []).forEach(w => words.push(w));
  })));
  ok(words.length >= 80, '跨周找到 ' + words.length + ' 张词卡');

  const noHint = words.filter(w => !w.hint_cn);
  ok(noHint.length === 0, '每张词卡都挂了 hint_cn（缺的：' + (noHint.map(w => w.word).join('、') || '无') + '）');

  const segs = w => String(w.meaning).split(/[，,；;、\/]/).filter(Boolean);
  const leak = words.filter(w => segs(w).some(p => String(w.hint_cn || '').indexOf(p) >= 0));
  ok(leak.length === 0,
     '没有一条提示直接写出释义原文（写出来＝"选意思"那题直给答案）：' + (leak.map(w => w.word).join('、') || '无'));

  const tooLong = words.filter(w => String(w.hint_cn || '').length > 30);
  ok(tooLong.length === 0, '提示都不超过 30 字（太长孩子不看）：' + (tooLong.map(w => w.word).join('、') || '无'));

  // "选意思"用的中文例句：挖掉释义之后不能再出现释义原文
  const badMask = words.filter(w => {
    const r = App._maskMeanings(w.example_cn, w.meaning);
    return !r.text || segs(w).some(p => r.text.indexOf(p) >= 0);
  });
  ok(badMask.length === 0,
     '例句挖空后不泄露释义（' + (badMask.map(w => w.word).join('、') || '无') + '）');

  // 跨周逐张走一遍完整链路：错 4 次都不能出现任何一张卡片的文字里的答案
  let leaks = [];
  words.forEach(w => {
    w.stages.forEach((st, si) => {
      if (st.type !== 'image_choice' && st.type !== 'meaning_choice') return;
      const keep = [];
      for (let a = 1; a <= 4; a++) {
        keep.push(App._wrongHintHtml({
          attempt: a, naming: 'index', opts: st.options, answer: st.answer,
          correctText: String(st.options[st.answer]), picked: (st.answer + 1) % st.options.length,
          clue1: w.hint_cn,
          clue2: (a === 2 && st.type === 'image_choice' && w.example_cn)
            ? '我们学过的一句话：「' + w.example_cn + '」' : '',
          revealStrong: a >= 3
            ? (st.type === 'image_choice'
                ? '💡 ' + w.word + ' 的意思是「' + w.meaning + '」。对着这个意思，挑出配得上的那张图。'
                : '我们学过的一句话：「' + App._maskMeanings(w.example_cn, w.meaning).text + '」')
            : '',
          neverReveal: true, finalTail: '自己点下去。',
        }));
      }
      const all = keep.join('\n');
      // 去掉每行行首的界面图标（🤔/🔎/👉/💡/📖）再查 —— 有几张卡片的答案就是
      // 💡（clever / invent），跟提示行首的图标撞脸，那是误报，不是真泄露。
      const body = all.split('<br>').map(l => l.replace(/^(🤔|🔎|👉|💡|📖|❌)\s*/, '')).join('<br>');
      if (body.indexOf(String(st.options[st.answer])) >= 0) leaks.push(w.word + '(' + st.type + ' 报出了答案)');
      if (st.type === 'meaning_choice' && body.indexOf(String(w.meaning)) >= 0) {
        leaks.push(w.word + '(选意思报出了释义)');
      }
    });
  });
  ok(leaks.length === 0, '跨周 80 张 × 选图/选意思 × 连错 4 次，提示里都没有出现答案'
     + (leaks.length ? '：' + leaks.slice(0, 5).join('、') : ''));
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
