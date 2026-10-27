/* eslint-disable */
// v144：刷新不许再丢手机号和姓名，且停在登录页时一点就进。
//
// 家长 2026-10-19：「网页里孩子避免不了刷新，刷新之后他需要输入手机号和孩子的
// 姓名。即使刷新了，也不要丢失这两个部分的东西，继续保留。刷新了之后，哪怕
// 停留在登录界面，孩子一点登录、有反应登进去就行，快速的登录进去就可以。」
//
// 钉死四件事：
//   ① 草稿双写（localStorage + 一年 cookie），localStorage 被清也能捞回来
//   ② 解析期就回填输入框（首帧之前，不闪）
//   ③ 本机认得的号 → 点登录走"不等网络"那条；改了号仍然要核对（v132 红线）
//   ④ 脚本没就绪时点的登录不会白点，就绪后自动补上
//
// 用法：node tools/verify-v144.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// ---------- 带记忆的 localStorage ----------
function makeStorage() {
  const map = {};
  return {
    _map: map,
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; },
  };
}

// ---------- 真会解析的 cookie jar（Max-Age=0 就删）----------
function makeCookieJar() {
  const jar = {};
  return {
    get cookie() {
      return Object.keys(jar).map(function (k) { return k + '=' + jar[k]; }).join('; ');
    },
    set cookie(v) {
      const s = String(v);
      const pair = s.split(';')[0];
      const eq = pair.indexOf('=');
      if (eq < 0) return;
      const k = pair.slice(0, eq).trim();
      const val = pair.slice(eq + 1).trim();
      if (/Max-Age=0/i.test(s) || !val) delete jar[k];
      else jar[k] = val;
    },
    _jar: jar,
  };
}

function makeEl(id) {
  const classes = {};
  return {
    id: id, value: '', innerHTML: '', textContent: '',
    style: {},
    classList: {
      add: function (c) { classes[c] = 1; },
      remove: function (c) { delete classes[c]; },
      contains: function (c) { return !!classes[c]; },
      toggle: function (c) { if (classes[c]) delete classes[c]; else classes[c] = 1; },
    },
    _cls: classes,
    addEventListener: function () {},
    removeEventListener: function () {},
    setAttribute: function () {},
    getAttribute: function () { return null; },
    appendChild: function () {}, remove: function () {}, removeChild: function () {},
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
    scrollIntoView: function () {},
    focus: function () {}, click: function () {},
    play: function () { return Promise.resolve(); },
    pause: function () {},
  };
}

function loadApp(storage, els) {
  const noop = function () {};
  const doc = makeCookieJar();
  doc.getElementById = function (id) {
    if (!els[id]) els[id] = makeEl(id);
    return els[id];
  };
  doc.querySelector = function () { return null; };
  doc.querySelectorAll = function () { return []; };
  doc.createElement = function () { return makeEl('new'); };
  doc.addEventListener = noop;
  doc.removeEventListener = noop;
  doc.body = makeEl('body');
  doc.documentElement = makeEl('html');
  doc.visibilityState = 'visible';
  doc.hidden = false;

  const win = {
    addEventListener: noop, removeEventListener: noop,
    speechSynthesis: null, location: null,
    navigator: null, document: doc,
  };
  const sandbox = {
    console: console,
    document: doc,
    window: win,
    navigator: { userAgent: 'node', onLine: true, vibrate: function () { return true; } },
    localStorage: storage,
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/', protocol: 'https:' },
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    fetch: function () { return Promise.resolve({ ok: false, status: 500, json: function () { return {}; } }); },
    requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
    alert: function (m) { console.log('  [alert] ' + m); },
    confirm: function () { return true; },
    prompt: function () { return ''; },
    URL: URL, Blob: function () {}, Date: Date, Math: Math, JSON: JSON,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    atob: atob, btoa: btoa,
    Recorder: { TARGET_RATE: 16000, padForAsr: function () { return 'B'; }, warmUp: noop },
  };
  win.location = sandbox.location;
  win.navigator = sandbox.navigator;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const apiSrc = fs.readFileSync(path.join(__dirname, '../public/api.js'), 'utf8');
  vm.runInContext(apiSrc + '\n;globalThis.__Api = Api; globalThis.__Store = Store;', sandbox, { filename: 'api.js' });

  let src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  vm.runInContext(src + '\n;globalThis.__App = App;', sandbox, { filename: 'app.js' });
  return { App: sandbox.__App, Api: sandbox.__Api, Store: sandbox.__Store, doc: doc, win: win, sandbox: sandbox };
}

const PHONE = '13800000001';   // 学生号（13259532991 是老师端，走的是另一条路）
const NAME = '马慧-Amy';

// =========================================================================
console.log('\n1. 草稿双写：localStorage + 一年 cookie，谁也丢不了');
{
  const storage = makeStorage();
  const els = {};
  const L = loadApp(storage, els);
  const Api = L.Api, Store = L.Store;

  Api.writeLoginDraft(PHONE, NAME, true);
  ok('写进 localStorage', (storage.getItem('amy_login_draft') || '').indexOf(PHONE) >= 0, storage.getItem('amy_login_draft'));
  ok('同时写进 cookie（localStorage 被清时的保命符）',
    String(L.doc.cookie).indexOf('amy_login_draft=') >= 0);
  let d = Api.readLoginDraft();
  ok('读回来是同一组', d && d.phone === PHONE && d.name === NAME, JSON.stringify(d));
  ok('known 标记跟着走', d && d.known === true);

  // 模拟 iOS/微信把 localStorage 整个清掉
  storage.removeItem('amy_login_draft');
  d = Api.readLoginDraft();
  ok('localStorage 没了 → 从 cookie 恢复草稿', d && d.phone === PHONE && d.name === NAME, JSON.stringify(d));

  // 只敲了一半（刷新前还没输完）
  Api.writeLoginDraft('1325', '', false);
  d = Api.readLoginDraft();
  ok('只输了半截手机号也记住（刷新后不用从头敲）', d && d.phone === '1325' && d.name === '', JSON.stringify(d));

  // 正式凭据写入时，草稿跟着标记 known
  Store.writeLogin(PHONE, NAME, true);
  d = Api.readLoginDraft();
  ok('登录成功 → 草稿 known=true（这台设备认识这个号）', d && d.known === true && d.phone === PHONE);

  // 退出登录不清草稿
  Store.clearLogin();
  d = Api.readLoginDraft();
  ok('退出登录 → 草稿仍在（返回登录只要再点一下）', d && d.phone === PHONE && d.name === NAME, JSON.stringify(d));

  Api.writeLoginDraft('', '', false);
  ok('两个框都清空 → 草稿一起清掉（不留垃圾）',
    !storage.getItem('amy_login_draft') && String(L.doc.cookie).indexOf('amy_login_draft=') < 0);
}

// =========================================================================
console.log('\n2. 刷新后：输入框已经填好，一点就进（不等网络）');
{
  const storage = makeStorage();
  storage.setItem('amy_login_draft', JSON.stringify({ phone: PHONE, name: NAME, known: true, ts: 1 }));
  const els = {};
  const L = loadApp(storage, els);
  const App = L.App;

  App._hydrateLoginForm();
  ok('手机号已回填', els['login-phone'].value === PHONE, els['login-phone'].value);
  ok('姓名已回填', els['login-name'].value === NAME, els['login-name'].value);
  ok('认出"这台设备登录过这个号"', App._loginDraftKnown === true);
  ok('登录按钮下面明说「已记住」', els['login-remember-hint'].style.display === 'block');

  // 拦截注册，看它走哪条路
  const calls = [];
  App.registerStudent = function (p, n, fast) { calls.push({ p: p, n: n, fast: fast }); };
  App.login();
  ok('一个字没改直接点登录 → 走"立刻进"那条（fast=true）',
    calls.length === 1 && calls[0].fast === true, JSON.stringify(calls));
  ok('点下去按钮立刻变成「正在进入…」（有反应）',
    String(els['login-btn'].innerHTML).indexOf('正在进入') >= 0, els['login-btn'].innerHTML);
}

// =========================================================================
console.log('\n3. 换了手机号：草稿跟着换，但仍要核对（v132 红线）');
{
  const storage = makeStorage();
  storage.setItem('amy_login_draft', JSON.stringify({ phone: PHONE, name: NAME, known: true, ts: 1 }));
  const els = {};
  const L = loadApp(storage, els);
  const App = L.App;
  App._hydrateLoginForm();

  els['login-phone'].value = '13900000000';
  App._saveLoginDraft();           // 输入事件调的就是它
  const d = JSON.parse(storage.getItem('amy_login_draft'));
  ok('新号码立刻写进草稿', d && d.phone === '13900000000', JSON.stringify(d));
  ok('换号 → 不再算老设备', App._loginDraftKnown === false);

  const calls = [];
  App.registerStudent = function (p, n, fast) { calls.push(fast); };
  App.login();
  ok('换号登录 → 仍然先核对（fast=false）', calls.length === 1 && calls[0] === false, JSON.stringify(calls));
}

// =========================================================================
console.log('\n4. 页面结构：首帧前回填 + 点的登录不会白点');
{
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  ok('解析期读草稿（不依赖 defer 脚本）', /localStorage\.getItem\('amy_login_draft'\)/.test(html));
  ok('读不到就退到 cookie', /amy_login_draft=\(\[\^;\]\+\)/.test(html));
  ok('没有任何登录痕迹时也不报错（返回 null）', /__bootDraft = \(draft && \(draft\.phone \|\| draft\.name\)\) \? draft : null/.test(html));
  ok('开屏脚本里就把输入框填好', /getElementById\('login-phone'\)[\s\S]{0,200}?\.value = window\.__bootDraft\.phone/.test(html));
  ok('姓名同样回填', /getElementById\('login-name'\)[\s\S]{0,200}?\.value = window\.__bootDraft\.name/.test(html));
  ok('回填发生在登录页 DOM 之后（拿得到输入框）',
    html.indexOf('id="login-phone"') < html.indexOf("localStorage.getItem('amy_login_draft')"));
  ok('「已记住」那行提示存在', /id="login-remember-hint"/.test(html));
  ok('脚本没就绪时点登录 → 记住这一下（__pendingLogin）', /window\.__pendingLogin=true/.test(html));

  const appSrc = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  ok('init 里先回填表单、再自动登录',
    /_hydrateLoginForm\(\);[\s\S]{0,200}?tryAutoLogin\(\)/.test(appSrc));
  ok('就绪后把之前点的那一下补上', /__pendingLogin[\s\S]{0,400}?this\.login\(\)/.test(appSrc));
  ok('输入框每变一次就存草稿', /phoneEl\.addEventListener\('input', save\)/.test(appSrc) &&
    /nameEl\.addEventListener\('input', save\)/.test(appSrc));
  ok('关页面/切后台再补存一次（最后几个字不丢）',
    /addEventListener\('pagehide', save\)/.test(appSrc) && /visibilitychange/.test(appSrc));
  ok('核对通过才把设备标成"认识"', /_markDeviceKnown\(phone, name\)/.test(appSrc));
  ok('退出登录不再清空输入框', !/login-phone'\)\.value = ''/.test(appSrc));
  ok('退出后按草稿回填', /readLoginDraft\(\)[\s\S]{0,400}?pEl\.value = d\.phone/.test(appSrc));
}

// =========================================================================
console.log('\n5. 版本号');
{
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf8');
  ok('index.html 版本 = 144', /app-version" content="160"/.test(html));
  ok('所有脚本都带 ?v=144', /app\.js\?v=160/.test(html) && !/\?v=143/.test(html));
  ok('sw 缓存名 = v144', /amy-english-v160/.test(sw) && /var V = 160;/.test(sw));
}

console.log('\n' + (fail === 0 ? '全部通过' : '失败 ' + fail + ' 项') + '：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
