/* eslint-disable */
// ===========================================================================
// v138：AI 口语练习的门禁 —— 没做题，「下一题」就是灰的
//
// 家长 2026-10-17：「今天的 AI 口语练习，我还没做题呢，下一题就已经出现了，
// 已经可以点选了。这个还没有改，赶紧改。」
//
// 上一版（v136）只把锁写进了 HTML，判据仍旧是"那颗按钮当前长什么样"：
//  · 任何一处 next.disabled = false（上一题的打分回调、晚到的上传/纠错、
//    写作/填空的收尾）都能把**当前这一屏**点亮；
//  · 老师端「题库预览」干脆完全免锁，看到的就是"没做题也能点"。
//
// 这版把判据立成状态：_speakingGateOpen（选对 + 整句跟读通过）+ _stepBelongsTo
// （晚到的回调只许动自己那一屏）。nextStep() 只认状态，不认按钮。
// 下面逐条钉住，用真 DOM（jsdom）跑：
//   node tools/verify-speaking-gate.js
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

process.on('unhandledRejection', () => {});

let fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  OK   ' : '  FAIL ') + msg + (extra ? '  → ' + extra : ''));
  if (!cond) fail++;
};

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
const appSrc = fs.readFileSync(path.join(R, 'app.js'), 'utf8')
  .replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');

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
    const { document, window, location, navigator, localStorage, sessionStorage, Api, Recorder,
            URL, fetch, Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
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

// 假 TTS：立刻当作播完（口语屏靠这个回调解锁选项 / 端出跟读面板）
App.speak = function (text, opts) { opts = opts || {}; if (opts.onDone) opts.onDone(); };
App.showToast = noop;
App._playCorrectSound = noop;
App._playWrongSound = noop;
App._startClipCapture = noop;
App._finishClipCapture = () => Promise.resolve(null);

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
  App._spPassed = {};
  App._posStoreCache = null;
  try { window.localStorage.clear(); } catch (e) {}
}
function resetTeacher() {
  App.state.role = 'teacher';
  App.state.phone = '13259532991';
  App.state.currentTab = 'preview';
  App._lockNextOnRender = false;
  App._spPassed = {};
}
function paint(dayIdx) {
  App._lockNextOnRender = false;
  const html = App.renderStage(dayIdx);
  area.innerHTML = html;
  App._applyStepLock();
  return html;
}
const nextBtn = () => document.getElementById('stage-next-btn');
const skipBtn = () => document.getElementById('pv-skip-btn');

// 找到带口语模块的那一天
let SP_DAY = -1, SP_MI = -1;
for (let d = 0; d < DATA.length; d++) {
  const mods = DATA[d].modules || [];
  for (let i = 0; i < mods.length; i++) {
    if (mods[i].type === 'speaking' && mods[i].questions && mods[i].questions.length) {
      SP_DAY = d; SP_MI = i; break;
    }
  }
  if (SP_DAY >= 0) break;
}

const DAYS = DATA.map((d, i) => App._buildSteps(i));

// ---------------------------------------------------------------------------
console.log('\n--- 1. 每一道口语题，没做之前按钮必须是灰的（HTML + DOM）---');
{
  ok(SP_DAY >= 0, '题库里有口语模块（DAY' + SP_DAY + ' 模块' + SP_MI + '）');
  let n = 0, badHtml = 0, badDom = 0;
  for (let d = 0; d < DAYS.length; d++) {
    resetStudent();
    App.state.currentDay = d;
    for (let i = 0; i < DAYS[d].length; i++) {
      if (DAYS[d][i].kind !== 'speaking') continue;
      App.state.stepIdx = i;
      const html = paint(d);
      n++;
      const tag = (/<button[^>]*id="stage-next-btn"[^>]*>/.exec(html) || [''])[0];
      if (tag.indexOf('disabled') < 0) { badHtml++; console.log('      缺锁：DAY' + d + ' #' + i); }
      const b = nextBtn();
      if (!b || !b.disabled) { badDom++; console.log('      DOM 未锁：DAY' + d + ' #' + i); }
    }
  }
  ok(n > 0, '一共检查了 ' + n + ' 屏口语题');
  ok(badHtml === 0, '★ 这 ' + n + ' 屏的「下一题」在 HTML 里就带 disabled', badHtml ? badHtml + ' 屏缺锁' : '');
  ok(badDom === 0, '★ 插进 DOM 之后仍然是灰的（点不动）', badDom ? badDom + ' 屏没锁住' : '');
}

// ---------------------------------------------------------------------------
console.log('\n--- 2. 就算有人把按钮点亮了，nextStep() 也不许前进 ---');
{
  resetStudent();
  App.state.currentDay = SP_DAY;
  const base = DAYS[SP_DAY].findIndex(s => s.kind === 'speaking');
  App.state.stepIdx = base;
  paint(SP_DAY);

  // 模拟"别处的一个异步回调把按钮点亮了"
  const b = nextBtn();
  b.disabled = false;
  b.classList.add('nudge');
  ok(b.disabled === false, '（先把按钮强行点亮，模拟残留回调）');

  const before = App.state.stepIdx;
  App.nextStep();
  ok(App.state.stepIdx === before, '★ 状态门拦住：没做完，nextStep() 原地不动',
     'stepIdx=' + App.state.stepIdx);
  ok(nextBtn().disabled === true, '★ 拦下的同时把按钮重新置灰（不会留着"看着能点"）');

  App.nextStep(true);      // 学生传 force 也不算数
  ok(App.state.stepIdx === before, '★ 学生调用 nextStep(true) 一样被拦（force 只在老师预览生效）');
}

// ---------------------------------------------------------------------------
console.log('\n--- 3. 选对 + 整句跟读通过，才放行 ---');
{
  resetStudent();
  App.state.currentDay = SP_DAY;
  const stIdx = DAYS[SP_DAY].findIndex(s => s.kind === 'speaking');
  const step = DAYS[SP_DAY][stIdx];
  App.state.stepIdx = stIdx;
  paint(SP_DAY);

  const shuff = App._speakingShuffle[step.mi + '-' + step.qi];
  ok(!!shuff, '口语选项已经打乱并记下来了');
  // 只选对、不跟读
  App.selectSpeakAnswer(step.mi, step.qi, shuff.answer, SP_DAY);
  ok(nextBtn().disabled === true, '★ 只选对、一个字没读 → 还是灰的');
  ok(App._speakingGateOpen(step.mi, step.qi, SP_DAY) === false, '状态门：没读完 = 没做完');
  const before = App.state.stepIdx;
  App.nextStep();
  ok(App.state.stepIdx === before, '此时点「下一题」也翻不过去');

  // 跟读通过
  App._spReadUI(step.mi, step.qi, SP_DAY, 'passed', 88);
  ok(App._speakingGateOpen(step.mi, step.qi, SP_DAY) === true, '★ 跟读通过 → 状态门打开');
  ok(nextBtn().disabled === false, '★ 底部「下一题」亮起来');
  App.nextStep();
  ok(App.state.stepIdx === before + 1, '★ 这才真的进了下一题（' + App.state.stepIdx + '）');
}

// ---------------------------------------------------------------------------
console.log('\n--- 4. 上一题的打分晚到，不许点亮孩子正看着的下一题 ---');
{
  resetStudent();
  App.state.currentDay = SP_DAY;
  const spSteps = [];
  DAYS[SP_DAY].forEach((s, i) => { if (s.kind === 'speaking') spSteps.push({ i, s }); });
  ok(spSteps.length >= 2, '这一天有 ≥2 道口语题（' + spSteps.length + ' 道）');
  if (spSteps.length >= 2) {
    const s1 = spSteps[0], s2 = spSteps[1];
    App.state.stepIdx = s2.i;
    paint(SP_DAY);
    ok(nextBtn().disabled === true, '刚翻到第 2 题，按钮是灰的');
    // 第 1 题的打分这时候才回来
    App._spReadUI(s1.s.mi, s1.s.qi, SP_DAY, 'passed', 92);
    ok(App._stepBelongsTo(s1.s.mi, s1.s.qi) === false, '_stepBelongsTo：那已经不是当前这一屏');
    ok(nextBtn().disabled === true, '★ 晚到的「通过」没有点亮第 2 题的按钮');
    ok(App._speakingGateOpen(s2.s.mi, s2.s.qi, SP_DAY) === false, '★ 第 2 题的状态门也没被带开');
  }
}

// ---------------------------------------------------------------------------
console.log('\n--- 5. 老师端「题库预览」：同一套门禁 + 一颗明说的跳过键 ---');
{
  resetTeacher();
  App.state.previewDay = SP_DAY;
  App.state.currentDay = SP_DAY;
  App.state.previewWeekOffset = 0;
  const stIdx = DAYS[SP_DAY].findIndex(s => s.kind === 'speaking');
  App.state.stepIdx = stIdx;
  const html = paint(SP_DAY);

  ok(nextBtn() && nextBtn().disabled === true, '★ 预览里口语屏同样是灰的（家长看到的那一屏）');
  ok(!!skipBtn(), '★ 预览里有一颗「跳过本题（老师）」');
  if (skipBtn()) {
    const before = App.state.stepIdx;
    App.nextStep();
    ok(App.state.stepIdx === before, '老师直接点「下一题」也翻不过去');
    App.nextStep(true);
    ok(App.state.stepIdx === before + 1, '★ 老师点「跳过本题」能翻过去（不会被卡死）');
  }
}

// ---------------------------------------------------------------------------
console.log('\n--- 6. 学生端没有任何"跳过"的口子 ---');
{
  resetStudent();
  App.state.currentDay = SP_DAY;
  const stIdx = DAYS[SP_DAY].findIndex(s => s.kind === 'speaking');
  App.state.stepIdx = stIdx;
  paint(SP_DAY);
  ok(!skipBtn(), '★ 学生端没有「跳过本题」按钮');
  const html = App.renderStage(SP_DAY);
  ok(html.indexOf('跳过本题') < 0, '★ 学生端的 HTML 里根本没有这几个字');
}

// ---------------------------------------------------------------------------
console.log('\n--- 7. 老师预览的词汇那一屏也锁 + 也能跳过 ---');
{
  resetTeacher();
  let vDay = -1, vIdx = -1;
  DAYS.forEach((steps, d) => { steps.forEach((s, i) => { if (vDay < 0 && s.kind === 'vocab') { vDay = d; vIdx = i; } }); });
  if (vDay >= 0) {
    App.state.currentDay = vDay; App.state.previewDay = vDay; App.state.stepIdx = vIdx;
    paint(vDay);
    const vb = document.getElementById('stage-next-' + DAYS[vDay][vIdx].mi);
    ok(!!vb && vb.disabled === true, '★ 预览里「下一个单词」也是灰的');
    ok(!!skipBtn(), '★ 词汇屏同样给老师留了跳过键');
  } else {
    console.log('  （题库里没有词汇闯关，跳过）');
  }
}

// ---------------------------------------------------------------------------
console.log('\n--- 8. 代码层面：判据只有一处，按钮不再是判据 ---');
{
  const src = appSrc;
  ok(/_speakingGateOpen\s*\(/.test(src), '_speakingGateOpen 存在（选对 + 整句跟读通过）');
  ok(/_stepBelongsTo\s*\(/.test(src), '_stepBelongsTo 存在（晚到回调只动自己那一屏）');
  ok(/_stepGateOpen\s*\(\s*st0/.test(src), 'nextStep 里第一道就是状态门（先看做完没有）');
  // 老师预览不得再整体免锁
  ok(!/if\s*\(\s*this\.isTeacher\(\)\s*\)\s*\{\s*this\._lockNextOnRender\s*=\s*false;\s*return;\s*\}/.test(src),
     '★ _applyStepLock 里不再有"老师整体免锁"');
  ok(!/_vocabFootLocked\(mi, dayIdx\)\s*\{\s*if\s*\(this\.isTeacher\(\)\)\s*return false;/.test(src),
     '★ 词汇门禁也不再给老师开口子');
  // 跳过键只挂在预览
  const skips = (src.match(/pv-skip-btn/g) || []).length;
  ok(skips >= 2, '跳过键只出现在预览分支里（' + skips + ' 处：普通底部 + 词汇底部）');
  ok(/isTeacher\(\)\s*&&\s*this\.state\.currentTab\s*===\s*'preview'/.test(src),
     '跳过键带 isTeacher + preview 双重条件');
}

console.log('\n===========================================');
console.log(fail === 0 ? '全部通过 ✅' : (fail + ' 项失败 ❌'));
console.log('===========================================');
process.exitCode = fail ? 1 : 0;
setTimeout(() => process.exit(fail ? 1 : 0), 30);
