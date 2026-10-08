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
console.log('（第 3 次才点名，而且最后那一下仍要孩子自己点）');

{
  const opts = ['I eat apples.', 'I go to school by bus.', 'She is my sister.', 'They are teachers.'];
  const answer = 2;
  const correctText = opts[answer];

  const h1 = App._wrongHintHtml({ attempt: 1, opts: opts, answer: answer, correctText: correctText, picked: 0 });
  ok(/不是这个/.test(h1), '第 1 次错：先明确"不是这个"');
  ok(/划掉 ?A/.test(h1), '第 1 次错：告诉他 A 已经划掉了（不是干说一句"错了"）');
  ok(/B、C、D/.test(h1), '第 1 次错：把范围缩小到剩下的 B、C、D');
  ok(h1.indexOf(correctText) < 0, '第 1 次错：**一个字都不提正确答案**（"一下提示答案"就是这里）');
  ok(h1.indexOf('C：') < 0 && !/答案是/.test(h1), '第 1 次错：不点字母、不说"答案是"');

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
  ok(/答案是 ?C/.test(h3) && h3.indexOf(correctText) >= 0, '第 3 次错：点名（字母 + 内容），孩子已经错了两次，再让他瞎猜没有意义');
  ok(/点它一下|点一下/.test(h3), '第 3 次错：仍然要求他自己点下去，脚本不代劳');
  ok(h3.indexOf('主谓一致') >= 0, '第 3 次错：点名之后把解析补上（讲明白为什么，收个尾）');
  const h4 = App._wrongHintHtml({ attempt: 9, opts: opts, answer: answer, correctText: correctText, picked: 1 });
  ok(/答案是 ?C/.test(h4), '再往下错也稳定在第 3 级的提示上，不会绕回模糊提示');
}

{
  // 词汇游戏的卡片没有 A/B/C/D，只能说"第几个"
  const opts = ['🪨', '⚽', '🏃', '🌸'];
  const h1 = App._wrongHintHtml({ attempt: 1, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0 });
  ok(/划掉 ?第 ?1 ?个/.test(h1), '卡片题第 1 次错：按"第几个"说，不说 A/B/C/D（卡片上根本没有字母）');
  ok(/剩下 ?3 ?个/.test(h1), '卡片题第 1 次错：只说还剩几个');
  ok(h1.indexOf('A') < 0, '卡片题第 1 次错：不出现字母 A（孩子在屏幕上找不到它）');

  const h2 = App._wrongHintHtml({
    attempt: 2, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0,
    clue2: '复习一下：beautiful 的意思是「美丽的，漂亮的」，挑和它对得上的那张图。',
  });
  ok(h2.indexOf('第一个字母是') < 0, '图片选项没有字可描述，不硬说"第一个字母是 🌸"');
  ok(h2.indexOf('美丽的，漂亮的') >= 0, '第 2 次错：给中文意思当线索');
  ok(h2.indexOf('🌸') < 0, '第 2 次错：不把表情本身（答案是哪张图）端出来');

  const h3 = App._wrongHintHtml({ attempt: 3, naming: 'index', opts: opts, answer: 3, correctText: '🌸', picked: 0 });
  ok(/第 ?4 ?个/.test(h3) && h3.indexOf('🌸') >= 0, '第 3 次错：点名第 4 个 🌸');
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
    ok(tipEl._cls.has('q-hint') && /不是这个/.test(tipEl.innerHTML), '口语选错：给出中文提示词');
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

    const resultDiv = getEl('spell-result-' + mi);
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
    ok(App.state.vocabScore === scoreBefore, '答错不加分');

    // 再错一次 → 提示升级到"复习一下：xxx 的意思是..."
    const wrongIdx2 = (stage.answer + 2) % stage.options.length;
    App.checkVocabAnswer(mi, wrongIdx2, stage.answer, dayIdx, words.length, word.stages.length);
    ok(String(resultDiv.innerHTML).indexOf(word.meaning) >= 0,
       '词汇第 2 次错：把中文意思端出来当线索（"' + word.meaning + '"）');
    ok(String(resultDiv.innerHTML).indexOf(String(stage.options[stage.answer])) < 0,
       '词汇第 2 次错：仍然没说答案是哪一张');

    // 第 3 次 → 点名
    const wrongIdx3 = (stage.answer + 3) % stage.options.length;
    App.checkVocabAnswer(mi, wrongIdx3, stage.answer, dayIdx, words.length, word.stages.length);
    ok(String(resultDiv.innerHTML).indexOf(String(stage.options[stage.answer])) >= 0,
       '词汇第 3 次错：点名是哪一张（' + stage.options[stage.answer] + '）');
    ok(!optEls[stage.answer]._cls.has('correct'), '点名了也没自动点亮，孩子还得自己点');

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
    ok(wrong.indexOf('_wrongHintHtml') >= 0, 'selectSpeakAnswer 的答错分支走的是中文提示');
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
    ok(/_retryTip|retryTip:/.test(body) || fn === 'checkVocabAnswer',
       name + ' 的提示里带了一句"该怎么办"的中文提醒');
  }

  // 三级阶梯在源码里是齐的（别被后人删掉中间那一级）
  ok(/_choiceShape/.test(src) && /attempt <= 1/.test(src) && /attempt === 2/.test(src),
     '_wrongHintHtml 的三个分级都在');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
