/* ===========================================================================
 * v198 校验：老师端刷新后仍停在游戏界面（不会再跳回「作业详情」）
 *   node tools/verify-v198.js
 *
 * 家长 2026-11-12：「老师端一刷新就又显示到作业详情这一页，还是停留在游戏
 *   界面不要动。如果还是在游戏界面上的话，点一下刷新。」
 *
 * 根因：v194 新增 'wordgame' 页签时，_restoreTab() 的白名单没跟着加，
 *   于是 _saveTab('wordgame') 存进去、刷新时被判成「不认识的页」→ 踢回
 *   老师默认的 weekly（周计划里的作业详情）。
 * 顺带修：game.js 读 window.App / window.Api / window.HOMEWORK_DATA /
 *   window.WordHelp，但顶层 const / let 不挂 window，四个一直是 undefined。
 *
 * 这里不是只查字符串：用 jsdom 真加载 game.js + app.js，模拟「切到游戏页 →
 *   刷新 → 在游戏界面上再刷新一次」，每次都重建整套脚本（等价于整页重载），
 *   共享同一份 localStorage，检查 currentTab、页签高亮、#wg-root 是否画出来。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const JSDOM = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom').JSDOM;

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const read = f => fs.readFileSync(path.join(PUB, f), 'utf8');
const appSrcFull = read('app.js');
const gameSrc = read('game.js');
const html = read('index.html');
const sw = read('sw.js');
// 测试里不跑真实 init（会自动登录 / 联网），showApp() 由本脚本手动触发
const appSrc = appSrcFull.replace(/\nApp\.init\(\);/, '\n/* init skipped in test */');
assert(appSrc !== appSrcFull, 'app.js 里得找得到 App.init()');

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };

console.log('v198 · 刷新后停在游戏界面 / 连续两次刷新 / 全局桥接 校验');

// ---------------------------------------------------------------- 源码约束
ok('_restoreTab 的老师白名单里有 wordgame', () => {
  const rt = appSrc.slice(appSrc.indexOf('  _restoreTab() {'), appSrc.indexOf('  showApp() {'));
  assert(/var allowed = teacher[\s\S]{0,500}\['wordgame', 'weekly'/.test(rt),
    '老师白名单首项必须是 wordgame');
});
ok('_restoreTab 的学生白名单里也有 wordgame', () => {
  const rt = appSrc.slice(appSrc.indexOf('  _restoreTab() {'), appSrc.indexOf('  showApp() {'));
  assert(/: \['wordgame', 'today'/.test(rt), '学生白名单首项必须是 wordgame');
});
ok('showApp 仍用 _restoreTab 决定第一屏，switchTab 仍落盘', () => {
  const body = appSrc.slice(appSrc.indexOf('  showApp() {'), appSrc.indexOf('  // ===== TTS / Voice ====='));
  assert(/this\.state\.currentTab = this\._restoreTab\(\)/.test(body));
  assert(/_saveTab\(tab\)/.test(appSrc.slice(appSrc.indexOf('  async switchTab(tab) {'),
    appSrc.indexOf('  async switchTab(tab) {') + 2600)));
});
ok('四个全局都桥接到 window（game.js 才读得到）', () => {
  assert(/window\.App = App;/.test(appSrc));
  assert(/window\.Api = Api;/.test(appSrc));
  assert(/window\.WordHelp = WordHelp;/.test(appSrc));
  assert(/window\.HOMEWORK_DATA = HOMEWORK_DATA;/.test(appSrc));
  assert(/hwSetActiveWeek\(this\._previewWeekOffset\(\)\);[\s\S]{0,300}window\.HOMEWORK_DATA = HOMEWORK_DATA/.test(appSrc),
    '换周后也要把新的 HOMEWORK_DATA 同步给 window');
  const bridge = appSrcFull.indexOf('window.App = App;');
  assert(bridge > 0 && bridge < appSrcFull.indexOf('App.init();'), '桥接必须排在 init 之前');
});
ok('版本钉子统一到 v202', () => {
  assert(/name="app-version" content="205"/.test(html));
  assert.strictEqual((html.match(/\?v=205/g) || []).length, 7, '首页 7 处脚本引用');
  assert(/var CACHE_NAME = 'amy-english-v205';/.test(sw));
  assert(/var V = 205;/.test(sw));
});

// ------------------------------------------------------------- 模拟运行环境
const SHELL = `<!doctype html><html><body>
<div id="login-page"></div><div id="waiting-page"></div><div id="removed-page"></div>
<div id="main-app"><div id="header-name"></div><img id="header-photo">
<span id="class-badge"></span><button id="invite-btn-header"></button>
<button id="settings-btn-header"></button><div id="tab-bar"></div>
<div id="content-area"></div></div>
<div id="modal-overlay"><div id="modal-box"></div></div>
</body></html>`;

function makeMem() {
  const m = Object.create(null);
  return {
    getItem: k => (Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; },
    _dump: () => m,
  };
}
const noop = () => {};
function apiProxy() {
  return new Proxy({}, {
    get(t, k) {
      if (k === 'fetchGameScores' || k === 'reportGameScore' ||
          k === 'getSpeakingRecords' || k === 'getRecordings') return () => Promise.resolve(null);
      if (k === 'dictLocal') return () => null;
      if (k === 'cloudAvailable' || k === 'supported') return () => false;
      if (k === 'sessionSync') return (p, n) => ({ phone: p, name: n, role: 'student' });
      if (k === 'level') return () => 0;
      if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
      if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
      if (k === 'then') return undefined;
      return () => Promise.resolve({});
    },
  });
}

/** 重建整套脚本 = 一次整页刷新；mem 共享 = localStorage 还在。 */
async function boot(role, mem) {
  const dom = new JSDOM(SHELL, { url: 'https://amyeng.top/', pretendToBeVisual: true });
  const win = dom.window;
  Object.defineProperty(win, 'localStorage', { value: mem, configurable: true });
  Object.defineProperty(win, 'speechSynthesis', {
    value: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop }, configurable: true,
  });
  // jsdom 不实现这两个布局 API，真浏览器里都有
  if (win.Element) win.Element.prototype.scrollIntoView = noop;
  const sevenDays = [];
  for (let i = 0; i < 7; i++) sevenDays.push({ modules: [] });
  win.Api = apiProxy();
  win.WordHelp = { PHRASES: [] };
  win.HOMEWORK_DATA = sevenDays;
  const g = {
    document: win.document, window: win, location: win.location, navigator: win.navigator,
    localStorage: mem, sessionStorage: win.sessionStorage,
    Api: win.Api, Recorder: apiProxy(), URL: win.URL, fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: win.Audio,
    alert: noop, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0), cancelAnimationFrame: clearTimeout,
    SpeechSynthesisUtterance: function () {}, speechSynthesis: win.speechSynthesis,
    MutationObserver: win.MutationObserver, IntersectionObserver: win.IntersectionObserver,
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval: noop, console,
    indexedDB: undefined, performance, Blob: win.Blob, FormData: win.FormData,
    hwSetActiveWeek: noop, HOMEWORK_DATA: sevenDays,
  };
  const code = `
    const { document, window, location, navigator, localStorage, sessionStorage, Api, Recorder,
            URL, fetch, Cloud, SpeechRecognition, Audio, alert, confirm, prompt,
            requestAnimationFrame, cancelAnimationFrame, SpeechSynthesisUtterance,
            speechSynthesis, MutationObserver, IntersectionObserver, setTimeout,
            clearTimeout, setInterval, clearInterval, console, indexedDB, performance,
            Blob, FormData, hwSetActiveWeek, HOMEWORK_DATA } = g;
    ${gameSrc}
    const WordGame = window.WordGame;   // 浏览器里 window 属性会自动成为全局标识符
    ${appSrc}
    return { App: App, window: window };
  `;
  const built = new Function('g', code)(g);
  const App = built.App;
  // 这些会触网 / 起定时器，跟「刷新后停在哪一屏」无关，测试里替掉。
  App._backfillCheckins = noop;
  App._bindCheckinUpload = noop;
  App.syncFromCloud = () => new Promise(() => {});
  App.syncToCloud = noop;
  App.startAutoSync = noop;
  App._pullCloudCheckins = () => new Promise(() => {});
  App._updatePendingBadge = noop;
  App._resumeStepIdx = () => 0;
  App.state.role = role;
  App.state.phone = role === 'teacher' ? '13259532991' : '13800000001';
  App.state.className = role === 'teacher' ? '' : '四年级';
  App.state.students = [{ id: 's1', name: 'Kid1', phone: '13800000001', class: '四年级', approved: true }];
  return { App, win, doc: win.document };
}

function assertGameScreen(ctx, label, tabName) {
  const { App, win, doc } = ctx;
  assert.strictEqual(App.state.currentTab, 'wordgame', label + '：currentTab 必须是 wordgame');
  const active = doc.querySelector('#tab-bar button.active');
  assert(active && active.textContent.indexOf(tabName) >= 0,
    label + '：高亮的页签必须是「' + tabName + '」');
  const root = doc.querySelector('#content-area #wg-root');
  assert(root, label + '：内容区必须画出 #wg-root（游戏大厅）');
  assert(root.innerHTML.indexOf('单词星球') >= 0, label + '：大厅内容要真的画出来');
  assert(doc.querySelector('#content-area').innerHTML.indexOf('作业详情') < 0,
    label + '：不许再跳回作业详情那一页');
  assert.strictEqual(win.App, App, label + '：window.App 桥接生效');
  assert(win.Api && typeof win.Api.fetchGameScores === 'function', label + '：window.Api 桥接生效');
  assert(Array.isArray(win.HOMEWORK_DATA) && win.HOMEWORK_DATA.length === 7,
    label + '：window.HOMEWORK_DATA 桥接生效');
  assert(win.WordHelp, label + '：window.WordHelp 桥接生效');
}

(async () => {
  // ---- 老师：切到游戏试玩 → 刷新 → 在游戏界面上再点一次刷新 -------------
  const mem = makeMem();
  const first = await boot('teacher', mem);
  await first.App.switchTab('wordgame');           // 用户点「游戏试玩」
  ok('老师点了「游戏试玩」后，amy_last_tab 记下 wordgame', () => {
    assert.strictEqual(mem.getItem('amy_last_tab'), 'wordgame');
    assert.strictEqual(first.App._restoreTab(), 'wordgame');
  });
  const r1 = await boot('teacher', mem);            // 第一次刷新（整页重载）
  r1.App.showApp();
  await new Promise(r => setTimeout(r, 30));       // 等 showApp 的 rAF 渲染
  ok('老师第 1 次刷新：仍停在游戏界面（不是作业详情）',
    () => assertGameScreen(r1, '第 1 次刷新', '游戏试玩'));
  const r2 = await boot('teacher', mem);            // 「还是在游戏界面上，再点一下刷新」
  r2.App.showApp();
  await new Promise(r => setTimeout(r, 30));
  ok('老师第 2 次刷新：依旧停在游戏界面',
    () => assertGameScreen(r2, '第 2 次刷新', '游戏试玩'));

  // ---- 学生端同样要能还原（v194 两端都有这个页签） ------------------------
  const mem2 = makeMem();
  const s0 = await boot('user', mem2);
  await s0.App.switchTab('wordgame');
  const s1 = await boot('user', mem2);
  s1.App.showApp();
  await new Promise(r => setTimeout(r, 30));
  ok('学生端刷新：仍停在「单词乐园」',
    () => assertGameScreen(s1, '学生刷新', '单词乐园'));

  // ---- 老规矩不能被改坏：无效页 / 换角色登录仍回默认 ----------------------
  ok('白名单之外的页签不还原，角色不符也不串页', () => {
    mem.setItem('amy_last_tab', 'print');
    assert.strictEqual(r2.App._restoreTab(), 'weekly', '老师不认识的页回周计划');
    mem2.setItem('amy_last_tab', 'checkin');   // 学生用的是另一份 localStorage
    assert.strictEqual(s1.App._restoreTab(), 'today', '老师存的值学生登录要回今日作业');
    mem.removeItem('amy_last_tab');
    mem2.removeItem('amy_last_tab');
    assert.strictEqual(r2.App._restoreTab(), 'weekly');
    assert.strictEqual(s1.App._restoreTab(), 'today');
  });

  console.log('\n全部 ' + pass + ' 项通过 ✅');
  process.exit(0);
})().catch(e => { console.error('\n❌ ' + (e && e.stack || e)); process.exit(1); });
