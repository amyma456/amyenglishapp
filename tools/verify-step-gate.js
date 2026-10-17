/* eslint-disable */
// ===========================================================================
// v136 门禁回归测试：**没做完，就不能点下一题**
//
// 家长 2026-10-17：「现在又成了题没做完，下一题又能开始做了。只有读完写完
// 全部正确，下一题才能点开，否则都是虚的，显示不能点开。这个不要再出错了。」
//
// 这条要求以前修过两次（v93 提笔顺、v119 连读），每次都只补了"当时那个题型"，
// 下一处又从别的缝里漏出来。所以这里不再逐条追着补，而是把它变成一条可执行
// 的规矩：
//
//   ① 渲染即带锁 —— renderStage 输出的 HTML 里，该锁的按钮必须自带 disabled。
//      以前只在 innerHTML 落地之后由 _applyStepLock() 补一次，任何一次重绘
//      （切 tab、静默更新、局部刷新）都会把它还原成"亮的"。
//   ② 全部题型都在射程内 —— 7 天所有屏，未做题时按钮一律灰。
//   ③ 行为级验证 —— 真的把词汇游戏走一遍、完形填空选一遍，看按钮什么时候亮。
//   ④ 程序化绕不过去 —— 按钮灰着时直接调 nextStep()，位置不许动。
//
// 用真 DOM（jsdom）跑，不用字符串猜。用法：
//   node tools/verify-step-gate.js
// ===========================================================================
const fs = require('fs');
const path = require('path');

function loadJsdom() {
  const cands = [
    'jsdom',
    'C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom',
    path.join(__dirname, '..', 'node_modules', 'jsdom'),
  ];
  for (const c of cands) { try { return require(c); } catch (e) {} }
  return null;
}

// app.js 末尾自带 App.init()，它会异步去拉云端数据；测试里没有真后端，
// 那一路的失败与本文件无关，吞掉即可（不然进程会被它带崩）。
process.on('unhandledRejection', () => {});

let fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  OK   ' : '  FAIL ') + msg + (extra ? '  → ' + extra : ''));
  if (!cond) fail++;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const jsdomMod = loadJsdom();
const JSDOM = jsdomMod && jsdomMod.JSDOM;
if (!JSDOM) {
  console.log('⚠️  没有 jsdom，跳过（装法：npm i jsdom）');
  process.exit(0);
}

const R = path.join(__dirname, '..', 'public');
const dom = new JSDOM('<!doctype html><body><div id="content-area"></div></body>', {
  url: 'https://amyeng.top/', pretendToBeVisual: true,
});
const { window } = dom;
const document = window.document;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
Object.defineProperty(window.navigator, 'userAgent', { value: 'node', configurable: true });

const noop = () => {};
const Api = new Proxy({}, {
  get(t, k) {
    if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
    if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
    if (k === 'cloudAvailable') return () => false;
    if (k === 'isFillerTranscript') return () => false;
    if (k === 'asrCanRetry') return () => true;
    // app.js 末尾会自己调 App.init()；让它卡在第一次云拉取上，
    // 免得异步初始化跑到一半来改写我们正在测的 DOM 和 state。
    if (k === 'load') return () => new Promise(() => {});
    if (k === 'classStatus') return () => Promise.resolve({ removed: false });
    if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push)/.test(k)) {
      return () => Promise.resolve({});
    }
    return noop;
  },
});
const Recorder = new Proxy({}, {
  get(t, k) {
    if (k === 'supported') return () => true;
    if (k === 'join' || k === 'padForAsr') return () => null;
    if (k === 'level') return () => 0;
    if (k === 'start' || k === 'stop') return () => Promise.resolve({ blob: {}, samples: null });
    return noop;
  },
});

const dataSrc = fs.readFileSync(path.join(R, 'data.js'), 'utf8');
const appSrcRaw = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
// app.js 末尾自带 `App.init();`，一装载就会去拉云端会话、注册学生，把
// 测试的 state 和 DOM 搅乱。门禁逻辑跟启动流程无关，这里只把它关掉。
const appSrc = appSrcRaw.replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');

const sandbox = {
  document, window, location: window.location, navigator: window.navigator,
  localStorage: window.localStorage, sessionStorage: window.sessionStorage,
  Api, Recorder, URL: window.URL, fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: window.Audio,
  alert: noop, confirm: () => true, prompt: () => '',
  requestAnimationFrame: (cb) => setTimeout(cb, 0), cancelAnimationFrame: clearTimeout,
  SpeechSynthesisUtterance: function () {},
  speechSynthesis: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop },
  MutationObserver: window.MutationObserver, IntersectionObserver: window.IntersectionObserver,
  setTimeout, clearTimeout, setInterval, clearInterval, console,
  indexedDB: undefined, performance, Blob: window.Blob, FormData: window.FormData,
};

let App, DATA;
try {
  const out = new Function('g', `
    const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
            Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
            cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
            IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
            indexedDB, performance, Blob, FormData } = g;
    ${dataSrc}
    ${appSrc}
    return { App: App, HOMEWORK_DATA: HOMEWORK_DATA };
  `)(sandbox);
  App = out.App; DATA = out.HOMEWORK_DATA;
} catch (e) {
  console.log('app.js 装载失败：' + e.stack.split('\n').slice(0, 3).join(' | '));
  process.exit(1);
}

App.speak = noop;
App.showToast = noop;
App._playCorrectSound = noop;
App._playWrongSound = noop;

const area = document.getElementById('content-area');

function resetStudent() {
  App.state.role = 'student';
  App.state.phone = '13800000000';
  App.state.userName = '测试学生';
  App.state.currentTab = 'today';
  App.state.audioEnabled = true;
  App.state.answers = {};
  App.state.checkins = {};
  App.state.vocabDoneIdx = -1;
  App.state.vocabWordIdx = 0;
  App.state.vocabStage = 0;
  App.state.vocabReviewDone = true;
  App._lockNextOnRender = false;
  App._spell = null;
  App._posStoreCache = null;            // 断点位置有内存缓存，一起清
  try { window.localStorage.clear(); } catch (e) {}
}
function resetTeacher() {
  App.state.role = 'teacher';
  App.state.phone = '13259532991';
  App.state.currentTab = 'preview';
  App._lockNextOnRender = false;
}

function paint(dayIdx) {
  App._lockNextOnRender = false;
  const html = App.renderStage(dayIdx);
  area.innerHTML = html;
  App._applyStepLock();          // 模拟 renderContent 末尾那一下补锁
  return html;
}
function footBtn(mi) {
  return document.getElementById('stage-next-btn')
      || (mi !== undefined ? document.getElementById('stage-next-' + mi) : null);
}
function btnTag(html) {
  const m1 = /<button[^>]*id="stage-next-btn"[^>]*>/.exec(html);
  const m2 = /<button[^>]*id="stage-next-\d+"[^>]*>/.exec(html);
  return (m1 && m1[0]) || (m2 && m2[0]) || '';
}

const DAYS = DATA.map((d, i) => App._buildSteps(i));

(async () => {

// ---------------------------------------------------------------------------
console.log('\n--- 1. 7 天每一屏：没做题，按钮必须自带 disabled（不能靠事后补）---');
let screens = 0, badHtml = 0, badDom = 0;
for (let d = 0; d < DAYS.length; d++) {
  resetStudent();
  App.state.currentDay = d;
  for (let i = 0; i < DAYS[d].length; i++) {
    App.state.stepIdx = i;
    const html = paint(d);
    const tag = btnTag(html);
    screens++;
    if (!tag || tag.indexOf('disabled') < 0) {
      badHtml++;
      console.log('      缺锁：DAY' + d + ' #' + i + ' ' + DAYS[d][i].kind);
    }
    const b = footBtn(DAYS[d][i].mi);
    if (!b || !b.disabled) {
      badDom++;
      console.log('      DOM 未锁：DAY' + d + ' #' + i + ' ' + DAYS[d][i].kind);
    }
  }
}
ok(badHtml === 0, '★ 全部 ' + screens + ' 屏的按钮在 HTML 里就带 disabled', badHtml ? badHtml + ' 屏没带' : '');
ok(badDom === 0, '★ 全部 ' + screens + ' 屏渲染完 DOM 里确实是灰的', badDom ? badDom + ' 屏是亮的' : '');

// ---------------------------------------------------------------------------
console.log('\n--- 2. 重绘不丢锁（切 tab / 静默更新后仍然是灰的）---');
resetStudent();
App.state.currentDay = 0; App.state.stepIdx = 6;
paint(0);
const okFirst = footBtn(0) && footBtn(0).disabled;
area.innerHTML = '';                                   // 模拟一次全量重绘
paint(0);
const okSecond = footBtn(0) && footBtn(0).disabled;
ok(okFirst && okSecond, '★ 连画两遍都是灰的（锁在 HTML 里，不是事后补丁）');

// ---------------------------------------------------------------------------
// v138：老师端「题库预览」改成和学生同一套门禁。
// 家长 2026-10-17 就是在预览里看到"我还没做题呢，下一题已经可以点了" ——
// 预览免锁，等于验不出学生那边的问题。老师要快进有「跳过本题（老师）」。
console.log('\n--- 3. 老师端「题库预览」和学生同一套门禁（另给一颗跳过键）---');
let teacherOpen = 0, teacherScreens = 0, teacherNoSkip = 0;
resetTeacher();
for (let d = 0; d < Math.min(3, DAYS.length); d++) {
  App.state.previewDay = d; App.state.currentDay = d;
  for (let i = 0; i < DAYS[d].length; i++) {
    App.state.stepIdx = i;
    paint(d);
    teacherScreens++;
    const b = footBtn(DAYS[d][i].mi);
    if (b && !b.disabled) teacherOpen++;
    if (b && b.disabled && !document.getElementById('pv-skip-btn')) teacherNoSkip++;
  }
}
ok(teacherOpen === 0, '★★ 老师预览 ' + teacherScreens + ' 屏，该锁的都锁着', teacherOpen ? teacherOpen + ' 屏是亮的' : '');
ok(teacherNoSkip === 0, '★★ 锁着的每一屏都给老师留了「跳过本题」（不会被卡死）', teacherNoSkip ? teacherNoSkip + ' 屏没有出口' : '');
// 学生端永远看不到这颗键
resetStudent();
App.state.currentDay = 0; App.state.stepIdx = 0;
paint(0);
ok(!document.getElementById('pv-skip-btn'), '★ 学生端没有「跳过本题」');

// ---------------------------------------------------------------------------
console.log('\n--- 4. 词汇闯关：一个词没学完，就不能点「下一个单词」---');
let vDay = -1, vStep = -1, vMi = -1, vMod = null;
for (let d = 0; d < DAYS.length && vDay < 0; d++) {
  const i = DAYS[d].findIndex(s => s.kind === 'vocab');
  if (i >= 0) { vDay = d; vStep = i; vMi = DAYS[d][i].mi; vMod = DATA[d].modules[vMi]; }
}
if (vDay < 0) {
  console.log('  (周库里没有词汇模块，跳过)');
} else {
  const wordCount = vMod.words.length;
  const stageCount = vMod.words[0].stages.length;
  console.log('  （DAY' + vDay + ' 词汇模块：' + wordCount + ' 个词 × ' + stageCount + ' 个阶段）');

  resetStudent();
  App.state.currentDay = vDay; App.state.stepIdx = vStep;
  paint(vDay);
  await sleep(10);
  ok(footBtn(vMi) && footBtn(vMi).disabled, '☆ 刚进词汇游戏（一张图都没选）→「下一个单词」是灰的');

  const beforeIdx = App.state.vocabWordIdx;
  App.nextVocabWord(vMi, vDay);
  ok(App.state.vocabWordIdx === beforeIdx, '☆ 灰着的时候直接调 nextVocabWord → 词序不动');

  for (let s = 0; s < stageCount; s++) App.nextVocabStage(vMi, vDay, wordCount, stageCount);
  await sleep(10);
  ok(App.state.vocabWordIdx === 1, '  第 1 个词走完 → 自动进入第 2 个词');
  ok(footBtn(vMi) && footBtn(vMi).disabled, '☆ 第 2 个词刚开始 → 又变回灰的（不能连跳）');

  for (let w = 1; w < wordCount; w++) {
    for (let s = 0; s < stageCount; s++) App.nextVocabStage(vMi, vDay, wordCount, stageCount);
  }
  await sleep(20);
  ok(App.state.vocabWordIdx >= wordCount, '  全部词走完 → 停在完成页');
  ok(footBtn(vMi) && !footBtn(vMi).disabled, '☆ 完成页的「下一题」可以点（出口必须留着）');
}

// ---------------------------------------------------------------------------
console.log('\n--- 5. 完形填空：整组选对还不够，读完才放行 ---');
let cDay = -1, cStep = -1, cMi = -1, cQis = null;
for (let d = 0; d < DAYS.length && cDay < 0; d++) {
  const s = DAYS[d].find(x => x.kind === 'clozegroup');
  if (s) { cDay = d; cStep = DAYS[d].indexOf(s); cMi = s.mi; cQis = s.qis || [s.qi]; }
}
if (cDay < 0) {
  console.log('  (周库里没有完形填空，跳过)');
} else {
  const mod = DATA[cDay].modules[cMi];
  resetStudent();
  App.state.currentDay = cDay; App.state.stepIdx = cStep;
  paint(cDay);
  ok(footBtn(cMi) && footBtn(cMi).disabled, '☆ 一个空都没选 → 按钮是灰的');

  let threw = '';
  try {
    cQis.forEach(qi => App.selectClozeBlank(cMi, qi, mod.questions[qi].answer, cDay));
  } catch (e) { threw = e.message; }
  ok(!threw, '  整组空都选对了（无异常）', threw);
  ok(footBtn(cMi) && footBtn(cMi).disabled, '☆ 选完 ABCD、一个字没读 → 按钮仍然是灰的（家长报的就是这一步）');

  App._gateStep(90, true);
  ok(footBtn(cMi) && !footBtn(cMi).disabled, '☆ 跟读 90 分通过 → 按钮才亮');
}

// ---------------------------------------------------------------------------
console.log('\n--- 6. 程序化绕过也挡得住（按钮灰着调 nextStep，位置不许动）---');
resetStudent();
App.state.currentDay = 0; App.state.stepIdx = 0;
paint(0);
const posBefore = App.state.stepIdx;
App.nextStep();
ok(App.state.stepIdx === posBefore, '★ 第 1 屏没做完 → 调 nextStep() 原地不动', '仍在第 ' + App.state.stepIdx + ' 屏');

if (vDay >= 0) {
  resetStudent();
  App.state.currentDay = vDay; App.state.stepIdx = vStep;
  paint(vDay);
  await sleep(5);
  const pv = App.state.stepIdx;
  App.nextVocabWord(vMi, vDay);
  App.nextStep();
  ok(App.state.stepIdx === pv, '★ 词汇屏没做完 → 调 nextStep() 也原地不动');
}

// ---------------------------------------------------------------------------
console.log('\n--- 7. 写完才能走：作文模板 ---');
let wDay = -1, wStep = -1, wMi = -1;
for (let d = 0; d < DAYS.length && wDay < 0; d++) {
  const i = DAYS[d].findIndex(s => s.kind === 'writing');
  if (i >= 0) { wDay = d; wStep = i; wMi = DAYS[d][i].mi; }
}
if (wDay < 0) {
  console.log('  (周库里没有写作模板，跳过)');
} else {
  resetStudent();
  App.state.currentDay = wDay; App.state.stepIdx = wStep;
  paint(wDay);
  ok(footBtn(wMi) && footBtn(wMi).disabled, '☆ 作文一个空都没填 → 按钮是灰的');
  ok(App._writingAllBlanksRight(DATA[wDay].modules[wMi], wMi, wDay) === false,
    '  判定口径：一个空都没填 → _writingAllBlanksRight = false');
}

// ---------------------------------------------------------------------------
console.log('\n--- 8. 断点续做：上次学到一半的词，回来还是灰的 ---');
if (vDay >= 0) {
  resetStudent();
  App.state.vocabDoneIdx = 2; App.state.vocabWordIdx = 3;
  ok(App._vocabFootLocked(vMi, vDay) === true, '☆ 正学第 4 个词、这个词还没学完 → 锁');
  App.state.vocabDoneIdx = 3; App.state.vocabWordIdx = 4;
  ok(App._vocabFootLocked(vMi, vDay) === true, '☆ 第 4 个词刚学完、还没做第 5 个 → 锁');
  App.state.vocabWordIdx = vMod.words.length;
  ok(App._vocabFootLocked(vMi, vDay) === false, '☆ 全部学完的完成页 → 放行');
  App.state.vocabDoneIdx = -1; App.state.vocabWordIdx = 0; App.state.vocabReviewDone = false;
  ok(App._vocabFootLocked(vMi, vDay) === true, '☆ 「复习昨日单词」那一屏没点完成 → 锁');
}

// ---------------------------------------------------------------------------
console.log('\n--- 9. 与既有门禁不冲突：写完的题要能解锁，口语屏不给它开口子 ---');
resetStudent();
// _unlockStep 是给填空/写作收尾用的，挑一屏普通题目来验
let _qD = -1, _qI = -1;
DAYS.forEach((steps, d) => steps.forEach((s, i) => {
  if (_qD < 0 && s.kind === 'question') { _qD = d; _qI = i; }
}));
App.state.currentDay = _qD; App.state.stepIdx = _qI;
paint(_qD);
App._unlockStep();
ok(footBtn(DAYS[_qD][_qI].mi) && !footBtn(DAYS[_qD][_qI].mi).disabled,
   '★ 完成动作调用 _unlockStep() → 按钮立刻变亮');
// v138：口语屏不能被它点亮（它自己的门是"选对 + 整句读完"）
let _sD = -1, _sI = -1;
DAYS.forEach((steps, d) => steps.forEach((s, i) => {
  if (_sD < 0 && s.kind === 'speaking') { _sD = d; _sI = i; }
}));
if (_sD >= 0) {
  resetStudent();
  App.state.currentDay = _sD; App.state.stepIdx = _sI;
  paint(_sD);
  App._unlockStep();
  ok(footBtn(DAYS[_sD][_sI].mi) && footBtn(DAYS[_sD][_sI].mi).disabled,
     '★★ 口语屏：_unlockStep() 点不亮（状态门先拦一道）');
}

console.log(fail === 0
  ? '\n✅ 全部 ' + screens + ' 屏门禁 + 行为用例通过'
  : '\n❌ ' + fail + ' 项失败');
process.exit(fail ? 1 : 0);

})().catch(e => {
  console.log('\n💥 测试自身异常（不是断言失败）：' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join('\n') : e));
  process.exit(1);
});
