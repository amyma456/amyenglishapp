/* eslint-disable */
// v220 校验：进入系统更快 + 一进去所有界面马上能看见。
//
// 家长 2026-11-21 两条原话：
//   ①「学生总体反应进入这个系统还是太久了，速度再加快一点进入就进入到里头」
//   ②「陈浩转 UN 的账号……刚开始只能看见玩游戏这个界面做题，其他的界面都
//      看不到。只要一进去，所有界面马上能看见，要等好久」
//
// 这条校验钉的是「首帧就有完整界面 + 启动路径上不再有等待」，不是某处
// 按钮调好了。四条根因各自有断言：
//   A. 页签栏要等 2MB JS 下载解析完才画 → 首帧骨架屏（解析期同步填好）
//   B. 换号继承上个账号的 wordgame 页签 → 记忆按账号隔离 + 新会话不落游戏页
//   C. 发版后清缓存 + 双重刷新 → 共用闸门、不清缓存、让出首帧
//   D. 一堆后台同步挤在首帧前 → preload + SW 补预存 + _bootDeferred 让位
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(root, 'public/api.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  [' + extra + ']' : '')); }
}
function section(s) { console.log('\n' + s); }

section('[1] 首帧骨架屏：解析期就把「所有界面」画出来');
{
  ok(/<div id="boot-splash"[^>]*flex-direction:column/.test(htmlSrc),
    '开屏不是一块白板，而是主界面骨架（竖向：导航 + 内容）');
  ok(/<div id="boot-tabs"[^>]*overflow-x:auto/.test(htmlSrc),
    '骨架顶部有一整排可横滑的页签容器');
  ok(/id="boot-name"/.test(htmlSrc) && /id="boot-photo"/.test(htmlSrc),
    '骨架头部有姓名与头像，看着就是「已经进到里头」');
  ok(/id="boot-splash-hint"[^>]*>正在打开今天的作业…/.test(htmlSrc),
    '提示是「正在打开今天的作业…」，不是干等的「正在进入…」');
  ok(/<div class="content-area" id="content-area">[\s\S]{0,80}id="boot-content"/.test(htmlSrc),
    '内容区也预置占位，骨架摘掉到真内容之间不空白');
  ok(/case 'today': area\.innerHTML = this\.renderToday\(\)/.test(appSrc),
    'renderContent 整体覆盖 innerHTML，占位会被自动清掉');
  ok(/<link rel="preload" as="script" href="data\.js\?v=220">/.test(htmlSrc) &&
     /<link rel="preload" as="script" href="api\.js\?v=220">/.test(htmlSrc) &&
     /<link rel="preload" as="script" href="app\.js\?v=220">/.test(htmlSrc),
    '三个最重的脚本在 <head> 就 preload，提前并行下载');
  // preload 与 defer 的 URL 必须完全一致，否则会重复下载 2MB（反而更慢）
  const preloads = (htmlSrc.match(/<link rel="preload" as="script" href="([^"]+)"/g) || [])
    .map(function (s) { return (s.match(/href="([^"]+)"/) || [])[1]; });
  ok(preloads.length === 3 && preloads.every(function (u) {
    return htmlSrc.indexOf('<script defer src="' + u + '"') > 0;
  }), 'preload 与 defer 脚本 URL 完全一致（不会重复下载）', preloads.join(','));
}

section('[2] 开屏脚本：解析期同步填页签，孩子点得动');
{
  ok(/var STUDENT_TABS = \[/.test(htmlSrc) && /var TEACHER_TABS = \[/.test(htmlSrc),
    '学生端 5 个 / 老师端 12 个页签都写成常量，解析期就能用');
  ok(/var BOOT_TEACHER_PHONES = \['13259532991'\]/.test(htmlSrc),
    '骨架判断老师号用与 api.js 相同的常量');
  const apiPhones = (apiSrc.match(/const TEACHER_PHONES = \[([^\]]+)\]/) || [])[1];
  const bootPhones = (htmlSrc.match(/var BOOT_TEACHER_PHONES = \[([^\]]+)\]/) || [])[1];
  ok(!!apiPhones && !!bootPhones && apiPhones.trim() === bootPhones.trim(),
    '两处老师号一致（骨架不会把学生画成老师界面）');
  ok(/tabsBox\.innerHTML = th/.test(htmlSrc) && /data-tab="/.test(htmlSrc),
    '页签 HTML 在解析期就写进 #boot-tabs');
  ok(/window\.__bootTab = function \(id\)/.test(htmlSrc) &&
     /window\.__bootPendingTab = id/.test(htmlSrc),
    'App 未就绪时点页签先记下来 + 立刻高亮（不是点不动）');
  ok(/window\.__bootTabs = bootTabs\.map/.test(htmlSrc),
    '把合法页签表挂到 window，供后续校验/消费');
  ok(/if \(window\.__appReady\) return;\s*/.test(htmlSrc) || /__appReady\) return/.test(htmlSrc),
    '兜底逃生口在脚本已就绪时不误踢回登录页');
  ok(/var hint = document\.getElementById\('boot-splash-hint'\)/.test(htmlSrc) &&
     /网络有点慢，正在努力打开/.test(htmlSrc),
    '脚本慢时只改提示继续等，绝不闪登录页 / 白屏');
  ok(/\}, 14000\)/.test(htmlSrc), '真出错才在 20 秒后露登录页当逃生口');
  ok(!/}, 8000\);/.test(htmlSrc), '旧的 8 秒「踢回登录页」兜底已移除');
}

section('[3] showApp：无缝交接，骨架在真页签栏画好后才摘');
{
  ok(/showApp\(\) \{[\s\S]{0,400}不在开头摘/.test(appSrc),
    'showApp 开头不再摘骨架（避免真页签栏画好前白闪一帧）');
  ok(/this\.renderTabs\(\);\s*\n\s*\/\/ v220：真页签栏已经画好[\s\S]{0,120}this\._dropBootSplash\(\)/.test(appSrc),
    'renderTabs() 之后立刻 _dropBootSplash()');
  ok(/_dropBootSplash\(\) \{\s*\n\s*var s = document\.getElementById\('boot-splash'\)/.test(appSrc),
    '_dropBootSplash 有实现，且幂等（重复调用无害）');
  ok(/window\.__bootPendingTab/.test(appSrc) && /validBoot/.test(appSrc),
    'showApp 消费骨架上点过的页签，并做白名单校验');
  ok(/sessionStorage\.setItem\('amy_session_opened', '1'\)/.test(appSrc),
    '标记本次会话已打开（供「新会话不落游戏页」判断）');
}

section('[4] 页签记忆按账号隔离 + 新会话不落在游戏页');
{
  ok(/_tabMemoryKey\(\) \{[\s\S]{0,260}amy_last_tab_/.test(appSrc),
    '页签记忆 key 带手机号（换号不再继承别人的页签）');
  ok(/var p = \(this\.state && this\.state\.phone\)/.test(appSrc),
    'key 从当前账号取，没登录时退回旧 key');
  ok(/if \(t === 'wordgame'\) \{[\s\S]{0,320}amy_session_opened/.test(appSrc),
    '新的一次打开若记着游戏页，回落到首页');
  ok(/if \(fresh\) return fallback;/.test(appSrc),
    '只有新会话回落；同会话下拉刷新仍停在原页（v150 不破）');
  ok(/\['wordgame', 'today', 'myprogress', 'compare', 'myerrors'\]/.test(appSrc),
    '学生端页签白名单完整（wordgame 仍在，只是不作为落地页）');
}

section('[5] 换号登录不再等网络核对');
{
  ok(/\|\| this\._deviceKnows\(phone\);/.test(appSrc),
    'login 的 knownDevice 认「本机认识的号」，换号直接进');
  ok(/Api\.bookList === 'function'[\s\S]{0,220}e\.phone === phone/.test(appSrc),
    '_deviceKnows 查账号簿（这台设备登录成功过的号）');
  ok(/bookAdd\(phone, name\)/.test(appSrc),
    '登录成功仍写账号簿，下次换回来也认得');
}

section('[6] 启动路径：后台活儿一律让出首帧');
{
  ok(/_bootDeferred\(this\.state\.currentTab\)/.test(appSrc),
    'showApp 把后台任务统一交给 _bootDeferred');
  ok(/_bootDeferred\(wantTab\) \{/.test(appSrc) && /setTimeout\(run, 0\)/.test(appSrc),
    '后台任务排在 setTimeout(0)，首帧先画界面');
  ['_backfillCheckins()', '_bindCheckinUpload()', '_reportDevice()',
   'startAutoSync()', '_pullCloudCheckins('].forEach(function (fn) {
    const inDeferred = new RegExp('_bootDeferred\\(wantTab\\) \\{[\\s\\S]*?' +
      fn.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')).test(appSrc);
    ok(inDeferred, '后台任务在 _bootDeferred 里：' + fn);
  });
  // 首帧路径上（renderTabs 之前）不该还有这些同步调用
  const showHead = appSrc.slice(appSrc.indexOf('showApp() {'), appSrc.indexOf('this.renderTabs();', appSrc.indexOf('showApp() {')));
  ok(!/_backfillCheckins\(\)/.test(showHead) && !/_reportDevice\(\)/.test(showHead),
    'renderTabs() 之前不再有补报/设备上报的同步调用');
}

section('[7] 页签栏不再被 scrollIntoView 滚到只剩一格');
{
  // 注释里留着「以前用 active.scrollIntoView」的说明，只检查非注释代码行。
  const codeLines = appSrc.split('\n').filter(function (l) {
    const t = l.trim();
    return t.indexOf('//') !== 0 && t.indexOf('/*') !== 0 && t.indexOf('*') !== 0;
  }).join('\n');
  ok(!/active\.scrollIntoView/.test(codeLines),
    'renderTabs 不再用 scrollIntoView（会连带滚动整页 + 把前 11 个页签挤出屏幕）');
  ok(/bar\.scrollLeft = target/.test(appSrc) && /activeBtn\.offsetLeft/.test(appSrc),
    '改成只动 tab-bar 自己的 scrollLeft，且仅 active 真出界才滚一点');
}

section('[8] 发版 / 刷新：只刷一次、不清缓存、让出首帧');
{
  ok(/window\.__amyReloadDone = false/.test(htmlSrc) &&
     /window\.__amyReloadOnce = function/.test(htmlSrc),
    'SW 接管与版本自检共用一个「只刷一次」闸门');
  ok(/controllerchange[\s\S]{0,220}window\.__amyReloadOnce\(\)/.test(htmlSrc),
    '新 SW 接管走闸门');
  ok(/window\.__amyReloadOnce\(\);\s*\n\s*\}\)\.catch/.test(htmlSrc),
    '版本落后也走同一个闸门（不会连刷两遍）');
  ok(!/caches\.delete\(n\)/.test(htmlSrc),
    '版本落后不再清空全部缓存（会删掉新 SW 刚预存的 2MB 脚本）');
  ok(/if \(window\.__amyReloadDone\) return false/.test(htmlSrc) &&
     /window\.__safeReload\(\)/.test(htmlSrc),
    '闸门内部仍走 __safeReload（录音中绝不刷新的保护没丢）');
  ok(/setTimeout\(__checkVersion, 8000\)/.test(htmlSrc),
    '开屏自检从 3 秒推到 8 秒，不在孩子刚落地时整页刷新');
  ok(/\.\/data-shuffle\.js\?v=' \+ V/.test(swSrc),
    'SW 补预存 data-shuffle.js（defer 链里漏它就要多等一趟网络）');
}

section('[9] 版本号四处一致');
{
  const ver = (htmlSrc.match(/name="app-version" content="(\d+)"/) || [])[1] || '0';
  ok(Number(ver) === 220, 'app-version = 220（当前 ' + ver + '）');
  const scripts = (htmlSrc.match(new RegExp('<script[^>]+src="[^"]+\\.js\\?v=' + ver + '\\b', 'g')) || []).length;
  ok(scripts === 7, '7 个 defer 脚本都带 ?v=' + ver, scripts);
  const preloads = (htmlSrc.match(new RegExp('<link rel="preload" as="script" href="[^"]+\\?v=' + ver + '"', 'g')) || []).length;
  ok(preloads === 3, '3 个 preload 也跟到 ' + ver, preloads);
  ok(swSrc.indexOf("'amy-english-v" + ver + "'") > 0 &&
     new RegExp('var V = ' + ver + ';').test(swSrc), 'sw CACHE_NAME / V = ' + ver);
  const stale = (htmlSrc.match(/\.js\?v=(\d+)/g) || []).filter(function (x) {
    return x !== '.js?v=' + ver;
  });
  ok(stale.length === 0, '没有旧版本脚本残留', stale.join(','));
}

section('[10] 真跑沙箱：页签记忆按账号隔离、新会话不落游戏页');
{
  let src = appSrc;
  const bootAt = src.lastIndexOf('App.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);   // 别在 vm 里真跑启动
  const noop = function () {};
  const store = {}, sess = {};
  const mkEl = function (id) {
    return {
      id: id, textContent: '', innerHTML: '', value: '', style: {},
      classList: { add: noop, remove: noop, contains: function () { return false; } },
      addEventListener: noop, removeEventListener: noop, setAttribute: noop,
      getAttribute: function () { return null; }, appendChild: noop,
      querySelector: function () { return null; }, querySelectorAll: function () { return []; },
      scrollIntoView: noop, focus: noop, offsetLeft: 0, offsetWidth: 60,
      scrollLeft: 0, clientWidth: 360, scrollHeight: 0, clientHeight: 0,
    };
  };
  const els = {};
  const getEl = function (id) { return els[id] || (els[id] = mkEl(id)); };
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    document: {
      getElementById: getEl, documentElement: {}, querySelector: function () { return null; },
      querySelectorAll: function () { return []; }, addEventListener: noop,
      createElement: function () { return mkEl('tmp'); },
      body: { classList: { add: noop, remove: noop, contains: function () { return false; } } },
    },
    window: {
      addEventListener: noop, innerWidth: 390, innerHeight: 780,
      speechSynthesis: null, matchMedia: function () { return { matches: false }; },
    },
    navigator: { mediaDevices: null, userAgent: 'node', standalone: false },
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); }, removeItem: noop,
    },
    sessionStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(sess, k) ? sess[k] : null; },
      setItem: function (k, v) { sess[k] = String(v); }, removeItem: noop,
    },
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: function () { return 0; }, clearTimeout: noop,
    setInterval: function () { return 0; }, clearInterval: noop,
    fetch: function () { return Promise.resolve({ ok: false, status: 500 }); },
    getComputedStyle: function () { return { getPropertyValue: function () { return '1'; } }; },
    Audio: function () { return { play: noop, pause: noop }; },
    URL: URL, Blob: function () {}, Date: Date, Math: Math, JSON: JSON,
    encodeURIComponent: encodeURIComponent, atob: atob, btoa: btoa,
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  let App = null;
  try {
    const ctx = vm.createContext(sandbox);
    vm.runInContext(src + '\n;globalThis.__App = App;', ctx, { filename: 'app.js' });
    App = sandbox.__App;
  } catch (e) {
    ok(false, 'app.js 能在最小 DOM 里加载', String(e && e.message));
  }
  if (App) {
    // 学生 A 停在单词乐园
    App.state.role = 'user';
    App.state.phone = '13800000001';
    App._saveTab('wordgame');
    ok(store['amy_last_tab_13800000001'] === 'wordgame',
      '账号 A 的页签记在自己名下');
    ok(!store['amy_last_tab'] || store['amy_last_tab'] !== 'wordgame',
      '不再写全局 key（换号不会串）');

    // 换到账号 B：它什么都没存过 → 回首页 today
    App.state.phone = '13800000002';
    delete sess['amy_session_opened'];
    ok(App._restoreTab() === 'today',
      '换号登录后回自己的首页（不是继承 A 的游戏页）');

    // 同一账号、同一会话内刷新：仍停在原页（v150 不破）
    App.state.phone = '13800000001';
    sess['amy_session_opened'] = '1';
    ok(App._restoreTab() === 'wordgame',
      '同账号、同会话刷新仍停在原页（老师要的「刷新不跳页」保留）');

    // 同一账号但全新会话：不落在游戏页
    delete sess['amy_session_opened'];
    ok(App._restoreTab() === 'today',
      '同账号但新的一次打开，也不落在全屏游戏页');

    // _deviceKnows：账号簿里有的号 = 老设备
    const bookKey = 'amy_login_book_v2';
    store[bookKey] = JSON.stringify([{ phone: '13800000009', name: '陈浩-UN', ts: 1 }]);
    App.state.students = [];
    App.state.parentStudents = {};
    // Api 在沙箱里是 undefined，_deviceKnows 会走 try/catch；这里验证它不抛错
    let threw = false;
    try { App._deviceKnows('13800000009'); } catch (e) { threw = true; }
    ok(!threw, '_deviceKnows 在缺 Api 的环境里也不抛错（换号登录不会卡死）');

    // _dropBootSplash 幂等
    let threw2 = false;
    try { App._dropBootSplash(); App._dropBootSplash(); } catch (e) { threw2 = true; }
    ok(!threw2, '_dropBootSplash 重复调用不抛错');
  }
}

console.log('\nv220: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
