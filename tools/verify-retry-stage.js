/* eslint-disable */
// 错题重练（v120）回归校验。
//
// 家长原话：「错题巩固的话，在最后面进行一个巩固，把错题再给返回练一下。
// 这个部分可以相对快一点，例如多加一些中文翻译，比如说之前没有中文翻译的，
// 这下加上中文翻译，或者变一个题型，题型不变，把题的类型给变一下，知识点
// 考察是同样的，让孩子们觉得做错题也是一种快乐，不要太死板，而且还要快速
// 一些。」
//
// 做法：把当天**答错的题**收进来，统一改成**三选一**（比原来的填空/长选项
// 快得多），每题配一句中文（题目自带的中文优先，否则用解析）。重练**不碰**
// 原始答题记录与打卡统计 —— 那是"补考"，回填会让正确率虚高。
//
// 这个脚本钉住：
//   1. 只收答错的题；上限 6；今天练对的当天不再出现（换天重新出现）
//   2. 三选一：含正确答案、位置由题目 id 定序（同一题每次渲染一致）
//   3. 渲染出题干 + 中文说明 + 三个选项，且"还剩 N 题"会数
//   4. 答对记"已练对"、答错不记 —— 但**两种都放行**（补考不卡人）
//   5. 步骤顺序：正课 → 错题重练 → 错词跟读，两段都在最末尾
//   6. 正课全做完时，上次的落点停在错题巩固第一屏（不是直接跳完成页）
//
// 用法：node tools/verify-retry-stage.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false,
    classList: { add: (...c) => c.forEach(x => e._cls.add(x)),
                 remove: (...c) => c.forEach(x => e._cls.delete(x)),
                 toggle: (c, on) => (on ? e._cls.add(c) : e._cls.delete(c)),
                 contains: c => e._cls.has(c) },
    querySelector: () => null, querySelectorAll: () => [], appendChild: () => {},
    insertAdjacentHTML: (p, h) => { e.innerHTML += h; }, remove: () => {},
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    removeAttribute: k => { delete e._attrs[k]; },
    scrollIntoView: () => {}, play: () => Promise.resolve(), focus: () => {},
    click: () => {}, addEventListener: () => {}, removeEventListener: () => {},
  };
  return e;
}
const byId = {};
const getEl = id => (byId[id] = byId[id] || el('div'));
const document = {
  getElementById: getEl, querySelector: () => null, querySelectorAll: () => [],
  createElement: el, addEventListener: () => {}, removeEventListener: () => {},
  body: el('body'), documentElement: el('html'), hidden: false,
  visibilityState: 'visible', readyState: 'complete',
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
  saveCheckin: async () => ({}),
  reportCheckin: () => Promise.resolve({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: () => Promise.resolve({}),
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
  saveLearnedWords: async () => ({}),
  fetchCheckins: async () => null,
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${appSrc}
  return { App };
`);
let App;
try {
  App = factory({
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

const SID = 'stu1';
App.state.role = 'student';
App.state.phone = '13900000001';
App.state.userName = '测试-Uno';
App.state.className = '少儿英语A班';
App.state.students = [{ id: SID, phone: '13900000001', name: '测试-Uno', class: '少儿英语A班' }];
App.state.answers = {};
App.state.checkins = {};
App.isTeacher = function () { return this.state.role === 'teacher'; };
App.speak = () => {};
App._playCorrectSound = () => {};
App._playWrongSound = () => {};
App.showToast = () => {};
App._showCelebration = () => {};

const akey = (d, m, q) => Api.answerKey(SID, d, m, q);
// 找一个"有题、且题里有选项、且有解析"的日子，测试数据最完整
let DAY = -1, MI = -1;
HOMEWORK_DATA.forEach((d, di) => {
  if (DAY >= 0) return;
  (d.modules || []).forEach((m, mi) => {
    if (DAY >= 0) return;
    if (mi >= 0 && m.questions && m.questions.length >= 3 && m.questions[0].options) {
      DAY = di; MI = mi;
    }
  });
});
ok(DAY >= 0, '找到测试用的一天（day ' + DAY + ' module ' + MI + '）');

// =========================================================================
console.log('== 1) 只收答错的题 ==');
const mod = HOMEWORK_DATA[DAY].modules[MI];
// 0 对、1 错、2 错 —— 只应收回 1 和 2
App.state.answers[akey(DAY, MI, 0)] = { correct: true };
App.state.answers[akey(DAY, MI, 1)] = { correct: false };
App.state.answers[akey(DAY, MI, 2)] = { correct: false };
let list = App._retryWrongQuestions(DAY);
ok(list.length === 2, '两道错题被收回（' + list.length + '）');
ok(list.every(s => s.kind === 'retry' && s.mi === MI), '都是 retry 步骤、指向同一模块');
ok(list.map(s => s.qi).sort().join(',') === '1,2', '收的是第 2、3 题（答对的第 1 题不收）');

console.log('== 2) 上限与"今天练过" ==');
// 把当天所有题都标成错，看上限
App.state.answers = {};
let totalQ = 0;
HOMEWORK_DATA[DAY].modules.forEach((m, mi) => {
  if (!m.questions) return;
  m.questions.forEach((q, qi) => { App.state.answers[akey(DAY, mi, qi)] = { correct: false }; totalQ++; });
});
ok(totalQ > App.RETRY_MAX, '这一天共有 ' + totalQ + ' 道题（多于上限 ' + App.RETRY_MAX + '）');
ok(App._retryWrongQuestions(DAY).length === App.RETRY_MAX,
  '最多收 ' + App.RETRY_MAX + ' 题（一次练太多孩子会烦）');
// 标记第 1 个已练对 → 下次不再出现
const first = App._retryWrongQuestions(DAY)[0];
App._retryMarkDone(DAY, first.mi, first.qi);
const after = App._retryWrongQuestions(DAY);
ok(!after.some(s => s.mi === first.mi && s.qi === first.qi),
  '今天练对过的题不再出现（mi' + first.mi + ' q' + first.qi + '）');
const otherDay = (DAY + 1) % HOMEWORK_DATA.length;
ok(App._retryDone(otherDay).length === 0, '换一天重新出现（按天分 key）');

console.log('== 3) 三选一 ==');
const q1 = mod.questions[1];
const pack = App._retryOptions(mod, q1, DAY, 1);
ok(!!pack && pack.options.length === 3, '凑出三个选项');
ok(pack.options[pack.answerIdx] === App._a4AnswerText(q1),
  'answerIdx 指的就是正确答案（' + App._a4AnswerText(q1) + '）');
ok(new Set(pack.options).size === 3, '三个选项互不相同（不会出现两个一样的）');
const pack2 = App._retryOptions(mod, q1, DAY, 1);
ok(JSON.stringify(pack) === JSON.stringify(pack2),
  '同一题两次调用结果一致（题目 id 定序，不会每次换位置）');

console.log('== 4) 渲染 ==');
const html = App.renderRetryStep({ kind: 'retry', mi: MI, qi: 1, dayIdx: DAY }, DAY, 3);
ok(html.indexOf('错题重练') >= 0, '标题是"错题重练"');
ok(html.indexOf('还剩 3 题') >= 0, '显示"还剩 N 题"');
ok(html.indexOf('retry-option') >= 0, '渲染出选项');
ok((html.match(/class="retry-option"/g) || []).length === 3, '正好三个选项');
const zh = App._retryZh(q1);
ok(zh.length > 0, '配了中文说明：' + zh.slice(0, 30) + '…');
ok(html.indexOf('retry-zh') >= 0, '中文说明渲染出来了（家长："多加一些中文翻译"）');
ok(html.indexOf('你之前做错过') >= 0, '说清楚这是"做错过"的题');
ok(html.indexOf('retry-hint') < 0 && html.indexOf('retry-verdict') >= 0,
  '判定文案用 retry-verdict，不占用既有的 retry-hint（那个类名第 252 行已有别处在用，复用会串样式）');

console.log('== 5) 选完放行（对错都走） ==');
function optBox(mi, qi, n) {
  const opts = [];
  for (let i = 0; i < n; i++) opts.push(el('div'));
  const box = { id: 'retry-opts-' + mi + '-' + qi, dataset: {}, querySelectorAll: () => opts };
  opts.forEach(o => { o.parentElement = box; });
  return { box, opts };
}
const nextBtn = getEl('stage-next-btn');
const s = { kind: 'retry', mi: MI, qi: 1 };
const pk = App._retryOptions(mod, q1, DAY, 1);
// 5a 答对
lsData['amyRetryV1_' + SID + App._weekTag() + '_d' + DAY] && delete lsData['amyRetryV1_' + SID + App._weekTag() + '_d' + DAY];
lsData['amyRetryV1_' + SID + '_d' + DAY] && delete lsData['amyRetryV1_' + SID + '_d' + DAY];
let box1 = optBox(MI, 1, 3);
nextBtn.disabled = true;
App.retryPick(box1.opts[pk.answerIdx], pk.answerIdx, pk.answerIdx, MI, 1, DAY);
ok(box1.box.dataset.done === '1', '选完就锁定，不会重复点');
ok(box1.opts[pk.answerIdx].classList.contains('correct'), '正确项标绿');
ok(nextBtn.disabled === false, '答对 → 底部「下一题」亮起来');
ok(App._retryDone(DAY).indexOf(MI + '_1') >= 0, '答对 → 记进"今天练过了"');
ok(getEl('retry-verdict-' + MI + '-1').innerHTML.indexOf('对了') >= 0, '给了肯定反馈');
// 5b 答错
const wrongIdx = (pk.answerIdx + 1) % 3;
let box2 = optBox(MI, 2, 3);
nextBtn.disabled = true;
App.retryPick(box2.opts[wrongIdx], wrongIdx, pk.answerIdx, MI, 2, DAY);
ok(box2.opts[wrongIdx].classList.contains('wrong'), '选错的那项标红');
ok(box2.opts[pk.answerIdx].classList.contains('correct'), '同时把正确答案标出来');
ok(nextBtn.disabled === false, '答错也放行 —— 补考不卡人（看一遍答案就走）');
ok(App._retryDone(DAY).indexOf(MI + '_2') < 0, '答错不记"练过了"，下次还得再来');

console.log('== 6) 步骤顺序：正课 → 错题重练 → 错词跟读 ==');
App.state.answers = {};
HOMEWORK_DATA[DAY].modules.forEach((m, mi) => {
  if (m.questions) m.questions.forEach((q, qi) => { App.state.answers[akey(DAY, mi, qi)] = { correct: false }; });
});
lsData[App._reviewKey()] && delete lsData[App._reviewKey()];
App._reviewAdd('tiger');
App.state.currentDay = DAY;
const steps = App._buildSteps(DAY);
const retryIdx = steps.findIndex(x => x.kind === 'retry');
const reviewIdx = steps.findIndex(x => x.kind === 'review');
ok(retryIdx > 0, '错题重练排在各模块之后（第 ' + retryIdx + ' 步）');
ok(reviewIdx > retryIdx, '错词跟读排在错题重练之后（第 ' + reviewIdx + ' 步）');
ok(reviewIdx === steps.length - 1, '错词跟读是最后一步');
const firstQ = steps.findIndex(x => x.kind === 'question' || x.kind === 'speaking');
ok(retryIdx === -1 || firstQ < retryIdx, '巩固环节永远在正课后面，不会插在中间');

console.log('== 7) 全做完后落点停在错题巩固 ==');
// 先把这一天**所有**模块都标成"做完了"：词汇闯关、作文挖空、作文朗读也都要
// 算做完，否则落点会停在那些模块上（那是既有正确行为，不是这条要测的东西）。
App._getLearnedWords = () => ({ ok: true });
App._writingAllBlanksRight = () => true;
App._writingAllRead = () => true;
App.state.answers = {};
HOMEWORK_DATA[DAY].modules.forEach((m, mi) => {
  if (m.questions) m.questions.forEach((q, qi) => { App.state.answers[akey(DAY, mi, qi)] = { correct: false }; });
});
const stepsFull = App._buildSteps(DAY);
const retryIdxFull = stepsFull.findIndex(x => x.kind === 'retry');
const resume = App._resumeStepIdxFromAnswers(DAY, stepsFull);
ok(resume === retryIdxFull,
  '正课全做完 → 停在错题重练第 ' + retryIdxFull + ' 步（v120 之前直接跳到完成页，孩子再也见不到错题）');
// 换一天没有错题时，应该回到完成页
App.state.answers = {};
App._getLearnedWords = () => null;
const stepsB = App._buildSteps(DAY);
lsData[App._reviewKey()] && delete lsData[App._reviewKey()];
const resumeB = App._resumeStepIdxFromAnswers(DAY, stepsB);
ok(resumeB < stepsB.length, '没有错题也没错词时不会卡在空屏（落点 ' + resumeB + '，共 ' + stepsB.length + ' 步）');

console.log('== 8) 全库覆盖：每道题都能凑出三选一或优雅退化 ==');
let cannot = 0, cannotDay = '';
HOMEWORK_DATA.forEach((d, di) => {
  (d.modules || []).forEach((m, mi) => {
    if (!m.questions) return;
    m.questions.forEach((q, qi) => {
      if (!App._a4AnswerText(q)) return;               // 本身没有答案文本的跳过
      const p = App._retryOptions(m, q, di, qi);
      if (!p || p.options.length !== 3 || p.options[p.answerIdx] !== App._a4AnswerText(q)) {
        cannot++; if (!cannotDay) cannotDay = 'day' + di + ' m' + mi + ' q' + qi;
      }
    });
  });
});
ok(cannot === 0,
  '全库 ' + HOMEWORK_DATA.length + ' 天的题全部能凑出三选一' + (cannot ? '（凑不出 ' + cannot + ' 道，首例 ' + cannotDay + '）' : ''));
// 同模块凑不出干扰项时，要从当天其它模块兜底（不是直接放弃）
const fakeMod = { questions: [{ id: 'x', question: 'Q', answer: 'ONLY' }] };
const fallback = App._retryOptions(fakeMod, fakeMod.questions[0], DAY, 0);
ok(!!fallback && fallback.options.length === 3
   && fallback.options[fallback.answerIdx] === 'ONLY',
  '同模块凑不出干扰项 → 从当天其它模块兜底');
// 连兜底都凑不出（整份作业只有这一道题）才返回 null
const nonePack = App._retryOptions(fakeMod, fakeMod.questions[0], 9999, 0);
ok(nonePack === null, '实在凑不出干扰项时返回 null（调用方退化处理）');
const degHtml = App.renderRetryStep({ kind: 'retry', mi: 999, qi: 0 }, DAY, 1);
ok(typeof degHtml === 'string' && degHtml.length > 0 && degHtml.indexOf('retry-option') < 0,
  '题目找不到时不炸，退化成一句提示');

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
