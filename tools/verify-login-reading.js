/* eslint-disable */
// v140 回归红线：登录要有反应、隔天默认已登录；阅读理解点选项先读后选、
// 答错走"老师式引导"。
//
// 家长 2026-10-18：
//   「隔天在登录的时候点了登录没有任何反应……不需要重新登录，直接默认输
//    入手机号和姓名，直接进入到做题的状态。点了登录就要有反应，点登录有
//    颜色变化，甚至有触感。」
//   「阅读理解题，点了 ABCD 就先得让系统读出来这个句子，然后才能做选择。
//    如果点错了，进行老师式的引导，问句和答句让系统先读，然后学生再读。」
//
// 用法：node tools/verify-login-reading.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub ----------
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false, id: '',
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
const bodyEl = el('body');
// 极简 cookie 模拟：支持 a=b; path=/ 和 Max-Age=0（删除）
let cookieJar = {};
const document = {
  getElementById: id => (byId[id] = byId[id] || el('div')),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: bodyEl, documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
  get cookie() {
    return Object.keys(cookieJar).map(k => k + '=' + cookieJar[k]).join('; ');
  },
  set cookie(v) {
    const pair = String(v).split(';')[0];
    const eq = pair.indexOf('=');
    if (eq < 0) return;
    const k = pair.slice(0, eq).trim(), val = pair.slice(eq + 1).trim();
    const dead = /Max-Age=0/i.test(String(v));
    if (dead) delete cookieJar[k]; else cookieJar[k] = val;
  },
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '', hostname: 'amyeng.top', protocol: 'https:' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN', vibrate: () => true };

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS };')();
const HOMEWORK_DATA = scope.WEEKS[0];

process.on('unhandledRejection', () => {});

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  asrResetBudget: () => {}, perfBegin: () => {}, perfEnd: () => {},
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({ id: 'x', url: 'blob:x' }),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [],
  login: () => new Promise(() => {}),        // 永不 resolve：只验证按钮反馈
  classStatus: async () => ({ removed: false }),
  fetchMyAssignment: async () => null,
  saveParentStudent: async () => ({}),
  saveStudent: async () => true,
  saveStudents: async () => true,
  getSavedLogin: async () => null,
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0, TARGET_RATE: 16000,
  trimSilence: s => s,
};

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App, Recorder };
`);
const sandbox = factory({
  document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: () => '',
  requestAnimationFrame: fn => setTimeout(fn, 0),
});
const App = sandbox.App;

// ---------- api.js 沙箱（只为了拿 Store）----------
const apiFactory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, fetch } = stubs;
  ${apiSrc}
  return { Store, Api };
`);
const apiSandbox = apiFactory({
  document, window, location, navigator, localStorage,
  fetch: () => new Promise(() => {}),
});
const Store = apiSandbox.Store;

console.log('\n[1] 登录凭据：localStorage + cookie 双写互兜');
Store.writeLogin('13259532991', '马慧-Amy');
ok(JSON.parse(lsData['amy_saved_login']).phone === '13259532991', '写进了 localStorage');
ok(document.cookie.indexOf('amy_login=') >= 0, '同时写进了一年 cookie');
delete lsData['amy_saved_login'];                 // 模拟 localStorage 被系统清掉
const back = Store.readLogin();
ok(back && back.phone === '13259532991' && back.name === '马慧-Amy',
  'localStorage 没了 → 从 cookie 恢复登录凭据');
ok(!!lsData['amy_saved_login'], '恢复时顺手写回 localStorage');
Store.clearLogin();
ok(!lsData['amy_saved_login'] && document.cookie.indexOf('amy_login=') < 0,
  '退出登录 → 两边一起清');

console.log('\n[2] 点登录的第一瞬间就要有反应');
App.state = App.state || {};
const lbtn = document.getElementById('login-btn');
document.getElementById('login-phone').value = '';
document.getElementById('login-name').value = '';
App.login();                                       // 空表单 → 校验失败，但按钮要先亮再恢复
ok(lbtn.innerHTML === '登录', '校验失败 → 按钮恢复「登录」');
document.getElementById('login-phone').value = '13259532991';
document.getElementById('login-name').value = '马慧-Amy';
App.login();                                       // 合法输入 → 卡在永不 resolve 的 Api.login 上
ok(lbtn.innerHTML.indexOf('正在进入') >= 0, '点了登录 → 按钮立刻变成「正在进入…」');
ok(lbtn._cls.has('logging-in'), '按钮进入 logging-in 态（半透明 + 禁点）');

console.log('\n[3] 阅读理解：点选项先读句子，读完才结算');
// 找周一的阅读理解模块（HOMEWORK_DATA 是"天"的数组，第 0 天 = 周一）
let rmi = -1;
HOMEWORK_DATA[0].modules.forEach((m, i) => { if (rmi < 0 && m.type === 'reading' && m.questions && m.questions.length) rmi = i; });
ok(rmi >= 0, '数据里找得到阅读理解模块');
const rq = HOMEWORK_DATA[0].modules[rmi].questions[0];
const wrongOi = (rq.answer + 1) % rq.options.length;

App.state.role = 'user';
App.state.audioEnabled = true;
App.state.currentDay = 0;
App.isTeacher = () => false;
const spoken = [];
App.speak = function(text, opts) { spoken.push(String(text)); if (opts && opts.onDone) opts.onDone(); };

spoken.length = 0;
App._lastPick = {};
// v141：给「点下弹动」准备真实的选项元素桩（harness 的 querySelectorAll 默认空）
const optStubs = rq.options.map(() => {
  const e = el('div'); e._cls.add('q-option'); return e;
});
const realQSA = document.querySelectorAll;
document.querySelectorAll = sel => (sel === '#q-' + rmi + '-0 .q-option' ? optStubs : realQSA(sel));
App.selectAnswer(rmi, 0, wrongOi, 0);
const joinedSent = App._buildReadSentence(HOMEWORK_DATA[0].modules[rmi], rq);
ok(spoken.length >= 1 && spoken[0] === joinedSent,
  '点选项 → 系统先读「问句 + 答句」连起来的整句（不是只读选项）');
ok(App._lastPick[rmi + '-0'] && App._lastPick[rmi + '-0'].oi === wrongOi,
  '读完 → 才真正"选了"（_lastPick 落下）');
// v141：点下的第一瞬间就要有"弹动"反馈
const wrongOptEl = optStubs[wrongOi];
ok(wrongOptEl && wrongOptEl._cls.has('picking'), '点下的选项立刻挂上弹动动画（picking）');
if (wrongOptEl) wrongOptEl.classList.remove('picking');
document.querySelectorAll = realQSA;

console.log('\n[4] 阅读理解答错：老师式引导（不再说"在 B、C 里面挑一个"）');
const ansEl = document.getElementById('ans-' + rmi + '-0');
const expEl = document.getElementById('exp-' + rmi + '-0');
ok(ansEl.innerHTML.indexOf('跟着读') >= 0, '提示是「点下方按钮跟着读，读完再选一次」');
ok(ansEl.innerHTML.indexOf('里面挑') < 0 && ansEl.innerHTML.indexOf('再想想') < 0,
  '不再出现"挑一个/再想想"式的老提示');
ok(expEl._cls.has('show'), '中文讲解摆出来（引导式解释保留）');
ok(App._guidedPick === rmi + '-0', '跟读面板挂上了"引导"标记');
const followEl = document.getElementById('qr-follow-' + rmi + '-0');
ok(followEl.innerHTML.indexOf('speak-record') >= 0 && followEl.innerHTML.indexOf('点我读') >= 0,
  '跟读面板已渲染（问句+答句 一起读）');
ok(spoken.length === 1, '示范只放一遍（点选时已整句读过，引导里不再重复朗读）');
// v141 关键：引导面板的门禁必须当场打开，否则「点我读」灰着点不动
const gGid = App._gid('hrg', rmi, 0);
ok(App._gateOpen(gGid), '引导面板的门禁当场解锁（点我读不灰）');
const gBtn = document.getElementById('hr-' + rmi + '-0');
ok(gBtn && !gBtn._cls.has('gate-locked'), '「点我读」按钮不带 gate-locked');
const optsAll = [];
for (let i = 0; i < rq.options.length; i++) optsAll.push(document.getElementById('qo-' + rmi + '-0'));
// 选项容器在引导期间整体锁住
ok(optsAll.length >= 0, '选项容器存在（引导期间由容器锁控制）');

console.log('\n[5] 引导跟读读完：解锁选项让孩子自己再选，不记答案、不进下一题');
let recordCalls = 0;
App._recordAnswer = function() { recordCalls++; };
App._playCorrectSound = App._playCorrectSound || function() {};
spoken.length = 0;
App._showHoldReadResult(rmi, 0, 0, 'Do you like apples? Yes I do.', 'do you like apples yes i do', 'asr', { passed: true, score: 88, align: [], badWords: [] }, false);
ok(App._guidedPick == null, '引导标记用完即清');
ok(ansEl.innerHTML.indexOf('再选一次') >= 0, '提示孩子自己再选一次');
ok(followEl.innerHTML === '', '跟读面板收掉');
ok(recordCalls === 0, '引导跟读**不记答案**（不进下一题）');

console.log('\n[6] 阅读理解选对：跟读门槛不变，但门必须当场打开');
App._lastPick = {};
App._guidedPick = null;
App._readingDecide(HOMEWORK_DATA[0].modules[rmi], rmi, 0, rq.answer, 0);
ok(App._lastPick[rmi + '-0'] && App._lastPick[rmi + '-0'].isCorrect === true, '选对落入 _lastPick');
ok(App._guidedPick !== rmi + '-0', '正选题**不挂**引导标记（照常记答案）');
ok(followEl.innerHTML.indexOf('点我读') >= 0, '跟读面板照常出现（读够 60 分才进下一题）');
// v141 关键：第一次就选对时（前面没有引导流程开过门），跟读门禁也必须开
const okGid = App._gid('hrg', rmi, 0);
ok(App._gateOpen(okGid), '选对后跟读门禁当场解锁（示范在点选时已放过）');
const okBtn = document.getElementById('hr-' + rmi + '-0');
ok(okBtn && !okBtn._cls.has('gate-locked'), '「点我读」不灰 —— 孩子不会卡死在这屏');
const okAns = document.getElementById('ans-' + rmi + '-0');
ok(okAns.innerHTML.indexOf('解锁下一题') >= 0, '提示里写清楚：读完就解锁下一题');

console.log('\n[6b] 做对过的题：重进/重渲染不得再把下一题锁灰');
App._recordAnswer = function() {};   // 恢复桩不落记录，手工落一条 correct
App.state.answers = App.state.answers || {};
App.state.answers[Api.answerKey(App._myStudentId(), 0, rmi, 0)] = { correct: true, value: rq.answer };
ok(App._questionSolved(rmi, 0, 0), '答案记录里 correct → _questionSolved');
{
  const blanked = !rq.options;
  const qHasRead = !!App._buildReadSentence(HOMEWORK_DATA[0].modules[rmi], rq);
  const willLock = blanked ? !App._questionSolved(rmi, 0, 0)
                           : (qHasRead && !App._questionSolved(rmi, 0, 0));
  ok(!willLock, '切走再切回 / 隔天重进：下一题不再变灰（v141 渲染锁判据）');
}

console.log('\n[7] 非阅读理解题型：答错流程保持原样');
// 用语法/单选类的题验证老的三档提示仍在
let gmi = -1;
HOMEWORK_DATA[0].modules.forEach((m, i) => {
  if (gmi < 0 && m.type !== 'reading' && m.type !== 'vocab' && m.questions && m.questions.length && m.questions[0].options) gmi = i;
});
if (gmi >= 0) {
  const gq = HOMEWORK_DATA[0].modules[gmi].questions[0];
  const gWrong = (gq.answer + 1) % gq.options.length;
  App._lastPick = {};
  App.speak = function() {};
  App._readingDecide(HOMEWORK_DATA[0].modules[gmi], gmi, 0, gWrong, 0);
  const gAns = document.getElementById('ans-' + gmi + '-0');
  ok(gAns.innerHTML.indexOf('再想想') >= 0 || gAns.innerHTML.indexOf('不是这个') >= 0,
    '语法/单选仍走原来的三档文字提示');
  ok(App._guidedPick !== gmi + '-0', '非阅读理解不挂引导标记');
} else {
  console.log('  SKIP 找不到可测的非阅读理解选择题');
}

console.log('\n[8] 版本与关键代码');
ok(src.indexOf("_readingDecide(m, mi, qi, oi, dayIdx)") >= 0, 'selectAnswer 拆出结算段');
ok(src.indexOf("_readingWrongFlow(m, mi, qi, oi, dayIdx)") >= 0, '阅读理解答错走老师式引导');
ok(src.indexOf('loadData failed (auto-login continues)') >= 0, 'loadData 出错不再挡住自动登录');
ok(apiSrc.indexOf('_LOGIN_COOKIE') >= 0, '登录凭据 cookie 兜底');
ok(src.indexOf("btn.innerHTML = '⏳ 正在进入…'") >= 0, '登录按钮即时反馈');
ok(src.indexOf('registerStudent(phone, name, knownDevice)') >= 0 && src.indexOf('_commitStudent(phone, name)') >= 0,
  '学生登录进 App 后网络收尾挪到后台（v142：先进入，_commitStudent 才上云）');

const html = fs.readFileSync(BASE + 'index.html', 'utf8');
ok(html.indexOf('app-version" content="159"') >= 0, 'index.html 版本 = 144');
ok(html.indexOf('id="login-btn"') >= 0, '登录按钮有 id（反馈要挂在它身上）');
ok(html.indexOf('.login-btn:active') >= 0, '登录按钮有按压反馈样式');
const sw = fs.readFileSync(BASE + 'sw.js', 'utf8');
ok(sw.indexOf("amy-english-v159") >= 0, 'sw.js 缓存名 = v144');

console.log('\n[9] v142：登录不等网络；阅读整句不等朗读');

// (a) 接口层：class/status 必须自己掐表 —— fetch 不会超时，Worker 冷启动
//     实测挂过 20 秒，那就是孩子登录时的那段干等。
ok(/CLASS_TIMEOUT_MS:\s*\d+/.test(apiSrc), 'class/status 有硬超时常量');
ok(/AbortController/.test(apiSrc) && /ctrl\.abort\(\)/.test(apiSrc), 'class/status 到点 abort');

// (b) 行为：这台设备登录过（fast=true）时，网络一直不回也要立刻进 App。
{
  let shown = 0;
  App.showApp = function() { shown++; };
  App.syncToCloud = function() {};
  App.state.students = [];
  App.state.parentStudents = {};
  const realClassStatus = Api.classStatus;
  Api.classStatus = () => new Promise(() => {});      // 永远不返回（最坏情况）
  App.registerStudent('13800000001', '测试-Kid', true);
  ok(shown === 1, '网络一直挂着，老设备也已经进了 App（不再站在登录页等）');
  App.registerStudent('13800001111', '新-Kid', false);   // 新设备：必须等核对
  ok(shown === 1, '新设备仍走核对（不会凭 fast 缺省值绕过删除拦截）');
  Api.classStatus = realClassStatus;
}

// (c) 老师端：点击到跳转之间不再同步渲染整张周报
ok(src.indexOf('requestAnimationFrame(function() { self.renderContent(); })') >= 0,
  'showApp 先切界面，内容挪到下一帧（点击不再像"没反应"）');

// (d) 阅读题：选项一进屏就能点，不用等题干读完
{
  const day0 = (HOMEWORK_DATA[0] && HOMEWORK_DATA[0].modules) ? HOMEWORK_DATA[0] : HOMEWORK_DATA;
  const mods0 = day0.modules || [];
  const mR = mods0.find(function(mm) {
    return mm.type === 'reading' && mm.questions && mm.questions.length;
  });
  const rmi2 = mods0.indexOf(mR);
  const htmlR = App._renderOneQuestion(mR, rmi2, 0, 0);
  const qoTag = (htmlR.match(/<div class="q-options"[^>]*>/) || [''])[0];
  ok(qoTag && qoTag.indexOf('pointer-events') < 0,
    '阅读题选项渲染即可点（不再 opacity .4 + pointer-events:none）');
  ok(htmlR.indexOf('请先听完整朗读') < 0, '不再挂「请先听完整朗读」的等待条');
  ok(/prefetchTts\(say/.test(src), '整句（问句+答句）在渲染时就预取音频');
}
ok(/setTimeout\(decide, 3500\)/.test(src), '点选项的兜底从 8 秒收到 3.5 秒');
ok(/if \(!self\._audioStarted\) decide\(\)/.test(src), '1.2 秒还没出声就直接结算（不干等）');

// (e) 脚本 defer 之后，登录页会先于 app.js 出现 —— 按钮必须能接住"还没就绪"
//     的那一下点击，不能抛 ReferenceError（那看着就是"点了没反应"）。
{
  const h = fs.readFileSync(BASE + 'index.html', 'utf8');
  ok(/defer src="app\.js\?v=159"/.test(h), '脚本改成 defer（登录页不再等 1MB JS 下载）');
  ok(h.indexOf('window.__appReady = false') >= 0, '页面先立一个"未就绪"标记');
  ok(/onclick="if\(window\.__appReady\)\{App\.login\(\)\}/.test(h),
    '登录按钮先看标记再调 App.login（未就绪不会报错）');
  ok(/window\.__appReady = true/.test(src), 'app.js 初始化后把标记置为就绪');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
