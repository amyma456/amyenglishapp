/* eslint-disable */
// 登录拦截是「永久规则」（v111）。家长的原话：
//   「只要老师删除，再次登进的话，都需要老师确认这个功能永远保留」
//   「只有 13259532909 这个老师的号可以无限制地登入登出，作为老师端用」
//   「任何人登录的时候都会收到一个…提醒，看是否要分配班级」
// 后来家长看到询问后更正：**909 是孩子的**（陈皓正-Yunus，在少儿英语A班做作业），
// 老师号只留 13259532991。所以这里钉的是"一个且只有一个老师号"，并且专门断言
// 909 不会被误当成老师（否则孩子会看到老师端，而且再也不会被拦截保护）。
//
// 这条规则以前只活在代码的默契里：移出名单在 D1（removed_students），
// 而老师能在别处把孩子加回名单、云端同步又可能把孩子并回来 —— 名单里有名字
// 不等于进得了门。任何一次重构只要把 gate 当成"可选的润色"，孩子就又能
// 靠重新注册溜进来。所以这里把规则钉死。
//
// 钉住的行为：
//   A. 被老师删除/移出的人 → 登录被拦，且**拒绝之后仍然拦着**（不会因为拒绝就放行）
//   B. 只有老师同意（学生申请→同意，或老师显式解除）才出得来
//   C. 老师号名单（当前只有 13259532991）两个文件一模一样；孩子号 909 不在名单里
//   D. 老师号即使被误删，也不会进拦截名单；后台 status 也永远说"没被拦"
//   E. 客户端登录流程真的按这套语义走（不是只有接口对）
//   F. 老师端看得见"谁被拦着"，并且能给一个显式放行的按钮
//
// 用法：node tools/verify-login-gate.js
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const BASE = path.join(ROOT, 'public') + path.sep;
const workerPath = path.join(ROOT, 'worker', 'src', 'index.js');

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
process.on('unhandledRejection', e => { console.log('  !! 未处理的异常：' + (e && e.message)); });

const cloudSrc = fs.readFileSync(BASE + 'cloud.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const workerSrc = fs.readFileSync(workerPath, 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();

const TEACHER = '13259532991';
// 家长确认过的孩子号：号码和老师号只差两位，最容易被误加进白名单的那一个。
const KID_909 = '13259532909';
const STUDENT = '15109549632';

// ===========================================================================
// D1 的替身：只实现 classApi 用到的那几条 SQL。故意按语句原样匹配 ——
// 一旦 worker 里换了写法，这里会立刻报错，而不是悄悄放过。
// ===========================================================================
function makeD1() {
  const T = { removed_students: [], join_requests: [] };
  const db = {
    tables: T,
    prepare(sql) {
      const q = String(sql).replace(/\s+/g, ' ').trim();
      let args = [];
      const run = () => {
        // ---- removed_students ----
        if (/^SELECT phone, name, removed_at FROM removed_students WHERE phone = \?$/.test(q)) {
          return { first: T.removed_students.find(r => r.phone === args[0]) || null };
        }
        if (/^SELECT phone, name, removed_at FROM removed_students ORDER BY removed_at DESC$/.test(q)) {
          return { rows: T.removed_students.slice().sort((a, b) => String(b.removed_at).localeCompare(String(a.removed_at))) };
        }
        if (/^INSERT INTO removed_students \(phone, name, removed_at\) VALUES \(\?, \?, \?\) ON CONFLICT\(phone\) DO UPDATE SET name = excluded\.name, removed_at = excluded\.removed_at$/.test(q)) {
          const [phone, name, at] = args;
          const hit = T.removed_students.find(r => r.phone === phone);
          if (hit) { hit.name = name; hit.removed_at = at; }
          else T.removed_students.push({ phone: phone, name: name, removed_at: at });
          return { changes: 1 };
        }
        if (/^DELETE FROM removed_students WHERE phone = \?$/.test(q)) {
          const before = T.removed_students.length;
          T.removed_students = T.removed_students.filter(r => r.phone !== args[0]);
          return { changes: before - T.removed_students.length };
        }
        // ---- join_requests ----
        if (/^SELECT id, status, created_at, resolved_at FROM join_requests WHERE phone = \? ORDER BY created_at DESC LIMIT 1$/.test(q)) {
          const rows = T.join_requests.filter(r => r.phone === args[0])
            .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
          return { first: rows[0] || null };
        }
        if (/^SELECT id, phone, name, status, created_at FROM join_requests WHERE status = 'pending' ORDER BY created_at ASC$/.test(q)) {
          return { rows: T.join_requests.filter(r => r.status === 'pending')
            .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))) };
        }
        if (/^SELECT (phone|id) FROM removed_students WHERE phone = \?$/.test(q)
            || /^SELECT id FROM join_requests WHERE phone = \? AND status = 'pending'$/.test(q)
            || /^SELECT id, phone FROM join_requests WHERE id = \?$/.test(q)) {
          if (/removed_students/.test(q)) return { first: T.removed_students.find(r => r.phone === args[0]) || null };
          if (/AND status = 'pending'/.test(q)) return { first: T.join_requests.find(r => r.phone === args[0] && r.status === 'pending') || null };
          return { first: T.join_requests.find(r => r.id === args[0]) || null };
        }
        if (/^INSERT INTO join_requests \(id, phone, name, status, created_at\) VALUES \(\?, \?, \?, 'pending', \?\)$/.test(q)) {
          T.join_requests.push({ id: args[0], phone: args[1], name: args[2], status: 'pending', created_at: args[3], resolved_at: null });
          return { changes: 1 };
        }
        if (/^UPDATE join_requests SET status = 'denied', resolved_at = \? WHERE phone = \? AND status = 'pending'$/.test(q)) {
          let n = 0;
          T.join_requests.forEach(r => { if (r.phone === args[1] && r.status === 'pending') { r.status = 'denied'; r.resolved_at = args[0]; n++; } });
          return { changes: n };
        }
        if (/^UPDATE join_requests SET status = 'approved', resolved_at = \? WHERE phone = \? AND status = 'pending'$/.test(q)) {
          let n = 0;
          T.join_requests.forEach(r => { if (r.phone === args[1] && r.status === 'pending') { r.status = 'approved'; r.resolved_at = args[0]; n++; } });
          return { changes: n };
        }
        if (/^UPDATE join_requests SET status = \?, resolved_at = \? WHERE id = \?$/.test(q)) {
          const row = T.join_requests.find(r => r.id === args[2]);
          if (row) { row.status = args[0]; row.resolved_at = args[1]; return { changes: 1 }; }
          return { changes: 0 };
        }
        throw new Error('D1 替身不认识的 SQL：' + q);
      };
      return {
        bind(...a) { args = a; return this; },
        async first() { return run().first || null; },
        async all() { const r = run(); return { results: r.rows || [] }; },
        async run() { return Object.assign({ success: true }, run()); },
      };
    },
  };
  return db;
}

// ===========================================================================
// 云端替身：textdb blob + 真 worker 处理 /api/class/*
// ===========================================================================
function makeNet(blob) {
  return { blob: blob || null, d1: makeD1(), worker: null };
}

function classJsonRes() {}

const jsonRes = obj => ({
  ok: true, status: 200,
  json: async () => obj,
  text: async () => JSON.stringify(obj),
});

function makeFetch(net) {
  return async function (url, opts) {
    opts = opts || {};
    const u = String(url);
    if (u.indexOf('textdb.dev') >= 0) {
      if (opts.method === 'POST') { net.blob = JSON.parse(opts.body); return { ok: true, status: 200, text: async () => 'ok' }; }
      return { ok: true, status: 200, text: async () => (net.blob ? JSON.stringify(net.blob) : 'null') };
    }
    if (u.indexOf('/api/class') >= 0) {
      // 走真的 worker 代码，不是重写一遍语义
      const res = await net.worker.fetch(new Request('https://amyeng.top' + u, {
        method: opts.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: opts.method === 'POST' ? (opts.body || '{}') : undefined,
      }), { DB: net.d1, ALLOWED_ORIGIN: '*' }, {});
      return { ok: res.ok, status: res.status, json: async () => JSON.parse(await res.text()), text: async () => res.text() };
    }
    return jsonRes({});
  };
}

// ===========================================================================
// 一台设备 = 一份 localStorage + 一份独立的 app.js/api.js 实例
// ===========================================================================
function makeDevice(net, label) {
  const lsData = {};
  const confirmQueue = [];
  const confirms = [];                     // 每条弹窗的原文，用来验「点了是否」和警告文案
  const byId = {};

  const mkEl = (tag) => {
    const e = {
      tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {},
      innerHTML: '', textContent: '', className: '', value: '', disabled: false, dataset: {},
    };
    e.classList = {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => { if (on) e._cls.add(c); else e._cls.delete(c); return e._cls.has(c); },
      contains: c => e._cls.has(c),
    };
    e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
    e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
    e.appendChild = () => {}; e.removeChild = () => {}; e.remove = () => {};
    e.scrollIntoView = () => {}; e.focus = () => {}; e.click = () => {};
    e.play = () => Promise.resolve();
    e.addEventListener = () => {}; e.removeEventListener = () => {};
    e.insertAdjacentHTML = (pos, h) => { e.innerHTML += h; };
    e.closest = () => null;
    // 元素级的 querySelector 要给回一个替身：老师端的提醒横幅就是靠
    // b.querySelector('.ab-action').onclick = … 挂点击的，返回 null 会直接把
    // 「有新学生申请加入」这条路炸掉（而炸掉的位置正好是这次要验的功能）。
    e._q = {};
    e.querySelector = sel => (e._q[sel] = e._q[sel] || mkEl('div'));
    e.querySelectorAll = () => [];
    return e;
  };
  const getEl = id => (byId[id] = byId[id] || mkEl('div'));

  const document = {
    getElementById: getEl,
    querySelector: () => null, querySelectorAll: () => [],
    createElement: mkEl,
    addEventListener: () => {}, removeEventListener: () => {},
    body: mkEl('body'), documentElement: mkEl('html'),
    hidden: false, visibilityState: 'visible', readyState: 'complete',
  };
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
  const Recorder = {
    supported: () => true, warmUp: () => {}, start: async () => {},
    stop: async () => ({ blob: {}, samples: null }), join: () => null,
    padForAsr: () => null, level: () => 0,
  };
  const toasts = [];

  const built = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Recorder,
            HOMEWORK_DATA, URL, fetch, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${cloudSrc}
    ${apiSrc}
    ${appSrc}
    return { App: App, Api: Api, Store: Store, CloudSync: CloudSync, Cloud: Cloud, isTeacherPhone: isTeacherPhone };
  `)({
    document, window, location: { hostname: 'amyeng.top', href: '', search: '' },
    navigator, localStorage, Recorder, HOMEWORK_DATA,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: makeFetch(net),
    SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, prompt: () => '',
    confirm: msg => {
      const a = confirmQueue.length ? confirmQueue.shift() : true;
      confirms.push({ msg: String(msg == null ? '' : msg), answer: a });
      return a;
    },
    requestAnimationFrame: cb => setTimeout(cb, 0),
  });

  const dev = {
    label, net,
    App: built.App, Api: built.Api, Store: built.Store, CloudSync: built.CloudSync,
    isTeacherPhone: built.isTeacherPhone,
    ask: (...answers) => { answers.forEach(a => confirmQueue.push(a)); },
    toasts, ls: lsData,
    confirms,
    lastConfirm: () => confirms[confirms.length - 1] || { msg: '', answer: null },
    el: getEl,
    hidden: id => getEl(id).classList.contains('hidden'),
  };
  dev.App.showToast = msg => { toasts.push(String(msg)); };
  dev.App.renderContent = () => {};
  dev.ready = (async () => {
    await new Promise(r => setTimeout(r, 60));
    await dev.App.loadData();
  })();
  return dev;
}

const tick = (ms) => new Promise(r => setTimeout(r, ms || 30));

const asTeacher = async (dev, phone) => {
  await dev.ready;
  // 走真的登录：老师端的后台写操作（删人/审批/解除）都靠 Api.session.phone
  // 带老师身份，只手写 App.state 会让这些接口全部 403 —— 那测的就不是真流程了。
  const s = await dev.Api.login(phone || TEACHER, 'AMy');
  dev.App.state.role = s.role;
  dev.App.state.phone = phone || TEACHER;
  dev.App.state.name = 'AMy';
  dev.App.state.userName = 'AMy';
  dev.App.state.currentTab = 'students';
  return dev;
};
const asStudent = async (dev, phone, name) => {
  await dev.ready;
  const s = await dev.Api.login(phone, name);
  dev.App.state.role = s.role;
  dev.App.state.phone = phone;
  dev.App.state.name = name;
  dev.App.state.userName = name;
  return dev;
};

function seedCloud() {
  return {
    lastUpdated: '2026-10-14T03:03:55.417Z',
    classes: ['少儿英语A班'],
    students: [
      { id: 's1', name: '张子皓-Harvey', phone: STUDENT, class: '少儿英语A班', approved: true, registeredAt: '2026-10-13T23:26:47.056Z' },
      { id: 's2', name: '马帅-ms', phone: '17763891729', class: '', approved: false, registeredAt: '2026-08-21T08:01:57.331Z' },
    ],
  };
}

(async function main() {

// ===========================================================================
console.log('=== 0. 老师号名单：两个文件必须一模一样 ===');
{
  const grab = (src, label) => {
    const m = src.match(/const TEACHER_PHONES\s*=\s*(\[[^\]]*\])/);
    if (!m) { console.log('  FAIL ' + label + ' 里找不到 TEACHER_PHONES'); fail++; return null; }
    return JSON.parse(m[1].replace(/'/g, '"'));
  };
  const inApi = grab(apiSrc, 'public/api.js');
  const inWorker = grab(workerSrc, 'worker/src/index.js');
  ok(!!inApi && !!inWorker, '两个文件都定义了老师号名单');
  ok(JSON.stringify(inApi) === JSON.stringify(inWorker),
     '两边的老师号名单一致（api=' + JSON.stringify(inApi) + ' worker=' + JSON.stringify(inWorker) + '）');
  ok(inApi.indexOf(TEACHER) >= 0, '名单含 ' + TEACHER);
  ok(inApi.indexOf(KID_909) < 0,
     '孩子号 ' + KID_909 + '（陈皓正-Yunus）不在名单里 —— 家长确认过他是孩子，进了名单就会直接看到老师端');
  ok(inApi.length === 1, '名单就只有老师本人一个号（多一个都等于让那个人免拦截）');
  ok(!/const TEACHER_PHONE\s*=/.test(apiSrc) && !/const TEACHER_PHONE\s*=/.test(workerSrc),
     '旧的单号常量 TEACHER_PHONE 已经不存在（不会再出现"只认一个号"的暗坑）');
}

// ===========================================================================
const workerMod = await import(pathToFileURL(workerPath).href);
const worker = workerMod.default;

const call = async (db, method, url, body) => {
  const res = await worker.fetch(new Request('https://amyeng.top' + url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }), { DB: db, ALLOWED_ORIGIN: '*' }, {});
  let data = null;
  try { data = JSON.parse(await res.text()); } catch (e) {}
  return { status: res.status, data: data };
};

console.log('=== 1. 老师删人 → 那个号从此登录被拦 ===');
let db1 = makeD1();
{
  let r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data && r.data.removed === false, '删之前：' + STUDENT + ' 没被拦');

  r = await call(db1, 'POST', '/api/class/remove', { phone: '17763891729', name: '马帅-ms', teacher: TEACHER });
  ok(r.status === 200 && r.data.ok === true, '老师删除学生 → ok');

  r = await call(db1, 'GET', '/api/class/status?phone=17763891729');
  ok(r.data.removed === true, '删之后：登录被拦');

  r = await call(db1, 'POST', '/api/class/remove', { phone: STUDENT, name: '小明-Ming' });
  ok(r.status === 403, '不带老师号调删人接口 → 403（学生无法自己写拦截名单）');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === false, '403 那次没有留下拦截记录');
}

console.log('=== 2. 老师号：可以无限登入登出，谁也别想拦 ===');
{
  let r = await call(db1, 'POST', '/api/class/remove', { phone: TEACHER, name: 'AMy', teacher: TEACHER });
  ok(r.status === 200 && r.data.skipped === 'teacher_phone', '老师删到老师自己的号 → 直接跳过，不记拦截');

  r = await call(db1, 'GET', '/api/class/status?phone=' + TEACHER);
  ok(r.data.removed === false && r.data.teacher === true, TEACHER + ' 后台明确回答"没被拦"');

  // 就算有人绕过接口、直接往表里塞一行，也必须拦不住老师
  db1.tables.removed_students.push({ phone: TEACHER, name: 'x', removed_at: new Date().toISOString() });
  r = await call(db1, 'GET', '/api/class/status?phone=' + TEACHER);
  ok(r.data.removed === false, '表里被塞了脏数据，老师号照样不被拦（防御性判断）');
  db1.tables.removed_students = db1.tables.removed_students.filter(x => x.phone !== TEACHER);

  r = await call(db1, 'GET', '/api/class/removed-list?teacher=' + TEACHER);
  ok(r.status === 200 && Array.isArray(r.data.removed), '老师号有老师权限（能查拦截名单）');

  r = await call(db1, 'GET', '/api/class/removed-list?teacher=13900139000');
  ok(r.status === 403, '普通号码查拦截名单 → 403');
}

console.log('=== 2b. 孩子号 13259532909：按普通学生处理，没有半点老师特权 ===');
{
  let r = await call(db1, 'GET', '/api/class/status?phone=' + KID_909);
  ok(r.data.removed === false, KID_909 + ' 现在没被拦（孩子照常做作业）');
  ok(!r.data.teacher, KID_909 + ' 后台不认他是老师（家长确认：909 是孩子的）');

  r = await call(db1, 'GET', '/api/class/removed-list?teacher=' + KID_909);
  ok(r.status === 403, KID_909 + ' 查不到拦截名单（孩子碰不到老师那一套）');

  r = await call(db1, 'POST', '/api/class/remove', { phone: KID_909, name: '陈皓正-Yunus', teacher: TEACHER });
  ok(r.status === 200 && r.data.skipped === undefined,
     '老师能删/移出 ' + KID_909 + '（他是学生，不该有豁免）');
  r = await call(db1, 'GET', '/api/class/status?phone=' + KID_909);
  ok(r.data.removed === true, '被删除后 ' + KID_909 + ' 也要老师同意才能进 —— 和每个孩子同一条规则');

  // 收尾：解开，别影响后面几节
  await call(db1, 'POST', '/api/class/unblock', { phone: KID_909, teacher: TEACHER });
  r = await call(db1, 'GET', '/api/class/status?phone=' + KID_909);
  ok(r.data.removed === false, '解除后 ' + KID_909 + ' 恢复登录');
}

console.log('=== 3. 学生申请 → 老师拒绝 → 仍然是拦着的；同意才放行 ===');
{
  let r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.notRemoved === true, '没被拦的人申请 → 不产生申请（不刷老师的屏）');

  db1.tables.removed_students = [];
  await call(db1, 'POST', '/api/class/remove', { phone: STUDENT, name: '小明-Ming', teacher: TEACHER });
  r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.ok === true, '被拦的学生申请重新加入 → ok');
  r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.duplicate === true, '重复点申请 → 不会堆出多条');

  r = await call(db1, 'GET', '/api/class/join-requests?teacher=' + TEACHER);
  ok(r.data.requests.length === 1 && r.data.requests[0].phone === STUDENT, '老师端收到这条申请（孩子一登不进来就能被提醒）');
  const reqId = r.data.requests[0].id;

  r = await call(db1, 'POST', '/api/class/join-request/resolve', { id: reqId, action: 'deny', teacher: TEACHER });
  ok(r.data.ok === true && r.data.action === 'deny', '老师拒绝');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === true, '拒绝之后：再次登录**仍然**要老师同意（这条规则永远不变）');
  ok(r.data.request && r.data.request.status === 'denied', '学生端能看到"上次申请未通过"，可以再申请');

  r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.ok === true, '被拒绝后可以再申请一次');
  r = await call(db1, 'GET', '/api/class/join-requests?teacher=' + TEACHER);
  const reqId2 = r.data.requests[0].id;
  r = await call(db1, 'POST', '/api/class/join-request/resolve', { id: reqId2, action: 'approve', teacher: TEACHER });
  ok(r.data.ok === true, '老师同意');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === false, '同意之后：门开了，能进去了');

  r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.notRemoved === true, '已经放行的人再点申请 → 后端回答"你不需要申请"');

  // 老师再删一次：门重新关上，上一次的"同意"不能当通行证
  await call(db1, 'POST', '/api/class/remove', { phone: STUDENT, name: '小明-Ming', teacher: TEACHER });
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === true, '再被删除一次：立刻又进不去');
  await tick(5);                          // 两次申请别落在同一毫秒（真人做不到）
  r = await call(db1, 'POST', '/api/class/join-request', { phone: STUDENT, name: '小明-Ming' });
  ok(r.data.ok === true && r.data.notRemoved !== true, '必须重新提交申请（不能骑着上次的批条进门）');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === true && r.data.request && r.data.request.status === 'pending',
     '这次是「等老师同意」，不是已放行');
}

console.log('=== 4. 老师端看得见被拦的人，并能显式放行 ===');
{
  let r = await call(db1, 'GET', '/api/class/removed-list?teacher=' + TEACHER);
  ok(r.data.removed.some(x => x.phone === STUDENT), '拦截名单里能看到 ' + STUDENT);

  r = await call(db1, 'POST', '/api/class/unblock', { phone: STUDENT, teacher: '13900139000' });
  ok(r.status === 403, '非老师调解除 → 403');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === true, '403 那次没有解开拦截');

  r = await call(db1, 'POST', '/api/class/unblock', { phone: STUDENT, teacher: TEACHER });
  ok(r.data.ok === true, '老师点了"解除拦截" → ok');
  r = await call(db1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(r.data.removed === false, '解除后立刻能登录');

  const lst = await call(db1, 'GET', '/api/class/removed-list?teacher=' + TEACHER);
  ok(!lst.data.removed.some(x => x.phone === STUDENT), '解除后名单里不再有他');
}

// ===========================================================================
console.log('=== 5. 客户端：登录流程真的按这套语义走 ===');
{
  const net = makeNet(seedCloud());
  net.worker = worker;

  // ---- 老师自己的号 → 老师端 ----
  const TT = await asStudent(makeDevice(net, '老师'), TEACHER, 'AMy');
  ok(TT.App.state.role === 'teacher', TEACHER + ' 登录 → 老师端（role=teacher）');
  ok(TT.isTeacherPhone(TEACHER) === true, 'isTeacherPhone(' + TEACHER + ') === true');
  const st = await TT.Api.classStatus(TEACHER);
  ok(st && st.removed === false, '老师号的 classStatus 永远不是"被拦"');

  // ---- 909（陈皓正-Yunus）→ 学生端。家长确认他是孩子；role 每次登录实时算，
  // 所以从旧版本升上来也不用清缓存，重新登录就是学生端 ----
  const K = await asStudent(makeDevice(net, '孩子909'), KID_909, '陈皓正-Yunus');
  ok(K.App.state.role === 'student', KID_909 + ' 登录 → 学生端（不是老师端）');
  ok(K.isTeacherPhone(KID_909) === false, 'isTeacherPhone(' + KID_909 + ') === false');
  await K.App.registerStudent(KID_909, '陈皓正-Yunus');
  ok(K.hidden('main-app') === false, KID_909 + ' 能正常进学生端做作业（没被拦）');

  // ---- 被拦的学生：进不去 ----
  const S = await asStudent(makeDevice(net, '学生'), STUDENT, '张子皓-Harvey');
  ok(S.App.state.role === 'student', '学生号登录 → role=student');
  await call(net.d1, 'POST', '/api/class/remove', { phone: STUDENT, name: '张子皓-Harvey', teacher: TEACHER });
  await S.App.registerStudent(STUDENT, '张子皓-Harvey');
  ok(S.hidden('main-app') === true, '被拦的学生：进不去主界面');
  ok(S.hidden('removed-page') === false, '被拦的学生：看到"你已被移出班级"页');
  ok(S.el('removed-btn').textContent.indexOf('申请重新加入') >= 0, '页面上有"申请重新加入"按钮');

  // ---- 申请 → 老师端出现 ----
  await S.App.applyRejoin();
  const T = await asTeacher(makeDevice(net, '老师A'), TEACHER);
  await T.App.fetchJoinRequests();
  ok((T.App.state.joinRequests || []).length === 1, '老师端收到 1 条入班申请');
  const id = T.App.state.joinRequests[0].id;

  // ---- 老师拒绝 → 学生还是进不去 ----
  await T.App.denyJoin(id);
  await S.App.registerStudent(STUDENT, '张子皓-Harvey');
  ok(S.hidden('main-app') === true, '老师拒绝后：再登录**还是**被拦');
  ok(S.el('removed-card').innerHTML.indexOf('未通过') >= 0, '学生端告知"上次申请未通过"');

  // ---- 老师端看得见拦截名单，并显式放行 ----
  await T.App.syncFromCloud();            // 老师进页面第一件事就是同步
  await T.App.loadRemovedList();
  ok((T.App.state.removedPhones || []).some(g => g.phone === STUDENT), '老师端拉到了拦截名单');
  const html = T.App.renderStudents();
  ok(html.indexOf('已被拦截登录') >= 0, '学生管理页显示「已被拦截登录」区块');
  ok(html.indexOf('🔓 放行') >= 0 && html.indexOf('🗑️ 删除') >= 0,
     '区块里每行都有「🔓 放行」和「🗑️ 删除」两个按钮');
  ok(html.indexOf('需你同意才能登录') >= 0, '写清了规则：需老师同意才能登录');

  // 早年被清掉的测试号（不在老师当前名单里）不该铺满页面，但要翻得到
  net.d1.tables.removed_students.push({ phone: '13900139000', name: '小舟-Zoe', removed_at: '2026-08-23T05:13:36.599Z' });
  await T.App.loadRemovedList();
  const htmlFold = T.App.renderStudents();
  ok(htmlFold.indexOf('13900139000') < 0, '不在名单里的旧拦截号默认折叠（页面不被几十个测试号铺满）');
  ok(htmlFold.indexOf('显示其它 1 个已拦截号码') >= 0, '给了「显示其它 N 个」的入口');
  T.App.toggleGatedRest();
  const htmlOpen = T.App.renderStudents();
  ok(htmlOpen.indexOf('13900139000') >= 0, '点开后能看到并放行那个号');
  T.App.toggleGatedRest();
  // 收尾：把这个临时号码从后台清掉，别影响后面的断言
  net.d1.tables.removed_students = net.d1.tables.removed_students.filter(r => r.phone !== '13900139000');
  await T.App.loadRemovedList();

  T.ask(true);
  await T.App.unblockStudent(STUDENT, '张子皓-Harvey');
  await S.App.registerStudent(STUDENT, '张子皓-Harvey');
  ok(S.hidden('main-app') === false, '老师放行后：学生进得去主界面');
  ok(S.hidden('removed-page') === true, '被拦页收起来了');

  // ---- 同意申请这条正路也通 ----
  await call(net.d1, 'POST', '/api/class/remove', { phone: STUDENT, name: '张子皓-Harvey', teacher: TEACHER });
  await S.App.registerStudent(STUDENT, '张子皓-Harvey');
  ok(S.hidden('main-app') === true, '又被删掉：立刻再次进不去');
  await S.App.applyRejoin();
  await T.App.fetchJoinRequests();
  await T.App.approveJoin(T.App.state.joinRequests[0].id);
  await S.App.registerStudent(STUDENT, '张子皓-Harvey');
  ok(S.hidden('main-app') === false, '老师同意申请后：学生进来了');

  // ---- 名单干净时不显示那块（不制造噪音） ----
  await T.App.loadRemovedList();
  const html2 = T.App.renderStudents();
  ok((T.App.state.removedPhones || []).length === 0 && html2.indexOf('已被拦截登录') < 0,
     '没人被拦时，老师端不显示这一块');
}

// ===========================================================================
console.log('=== 6. 新学生注册：老师会收到"是否要分配班级"的提醒 ===');
{
  const net = makeNet(seedCloud());
  net.worker = worker;
  const T = await asTeacher(makeDevice(net, '老师A'), TEACHER);
  await T.App.syncFromCloud();          // 第一次：只记基线
  const S = await asStudent(makeDevice(net, '新学生'), '13500135000', '新同学-New');
  await S.App.registerStudent('13500135000', '新同学-New');
  await S.App.syncToCloud();
  await T.App.syncFromCloud();
  const pending = T.App._currentPendingStudents().map(s => s.phone);
  ok(pending.indexOf('13500135000') >= 0, '新注册的人出现在「待分配」里（老师一刷新就能看到）');
  ok(T.toasts.some(t => t.indexOf('申请加入') >= 0) || T.el('student-alert-banner').innerHTML.indexOf('申请加入') >= 0,
     '老师端弹出了「学生「新同学-New」申请加入」的提醒');
  await T.App.loadRemovedList();
  ok((T.App.state.removedPhones || []).length === 0, '新人不会被自动拦（只有老师删过的人才拦）');
}

// ===========================================================================
console.log('=== 7. 老师端批量管理：全选 / 反选 / 一键删除（学生删除仍=拦截；「收起」仍=只是不显示） ===');
{
  const net = makeNet(seedCloud());
  net.worker = worker;
  const T = await asTeacher(makeDevice(net, '老师'), TEACHER);
  T.App.state.classes = ['少儿英语A班'];
  // ready 之后 state.students 与 Store.doc().students 是同一个数组，push 即落库
  [
    { id: 's9',  name: '新同学-New',    phone: '13500135000', class: '', approved: false, registeredAt: '2026-10-14T03:00:00.000Z' },
    { id: 's10', name: '张子皓-Harvey', phone: STUDENT,       class: '少儿英语A班', approved: true,  registeredAt: '2026-10-13T23:26:47.056Z' },
    { id: 's11', name: '马帅-ms',       phone: '17763891729', class: '', approved: false, registeredAt: '2026-08-21T08:01:57.331Z' },
  ].forEach(s => T.App.state.students.push(s));
  // 后台塞五个"早年的测试号"（老师已经不记得他们是谁了）
  ['13900141001', '13900141002', '13900141003', '13900141004', '13900141005'].forEach((p, i) => {
    net.d1.tables.removed_students.push({ phone: p, name: '测试-' + i, removed_at: '2026-08-23T05:13:36.599Z' });
  });
  await T.App.loadRemovedList();
  ok(T.App.state.removedPhones.length === 5, '后台拉到 5 个被拦号码');

  // ---- 全选 / 取消全选 ----
  T.App.pickAll(true);
  let picked = T.App.state.picked || [];
  ok(picked.filter(k => k.indexOf('s:') === 0).length === 3, '全选学生 → 3 个学生都打上勾');
  ok(picked.filter(k => k.indexOf('g:') === 0).length === 0,
     '「全选学生」不顺手把那批旧号码也勾上（老师想删孩子时不该误动几十个旧记录）');
  let html = T.App.renderStudents();
  ok((html.match(/pick-box[^>]*checked/g) || []).length >= 3, '学生的勾选框都进到选中态（全选真的生效了）');
  ok(html.indexOf('全选学生（3）') >= 0, '批量条写清了这次会全选几个学生');
  T.App.pickAll(false);
  ok((T.App.state.picked || []).length === 0, '再点一次全选 → 全部取消');

  // ---- 多选两个学生，一次删掉（老师要的"一次性多删几个"）----
  T.App.togglePick('s', '13500135000');
  T.App.togglePick('s', '17763891729');
  ok(T.App.state.picked.length === 2, '勾两个人 → 选中 2 项');
  T.ask(true);
  await T.App.deletePicked();
  await tick(60);                        // syncToCloud 是异步不 await 的
  ok(T.App.state.students.filter(s => s.phone === '13500135000' || s.phone === '17763891729').length === 0,
     '两个学生一次性从名单里消失');
  ok((T.App.state.picked || []).length === 0, '删完自动清空勾选');
  const lr = await call(net.d1, 'GET', '/api/class/removed-list?teacher=' + TEACHER);
  ok(lr.data.removed.some(x => x.phone === '13500135000') && lr.data.removed.some(x => x.phone === '17763891729'),
     '两个人都进了后台拦截名单（删除 = 拦截）');
  for (const p of ['13500135000', '17763891729']) {
    const s2 = await call(net.d1, 'GET', '/api/class/status?phone=' + p);
    ok(s2.data.removed === true, p + ' 再次登录被拦，必须经老师同意');
  }
  ok(T.toasts.some(t => t.indexOf('已删除 2 名学生') >= 0), '弹出了删除结果提示');

  // ---- 拦截区的批量条：全选 / 反选 / 一键删除（老师要的就是这三样）----
  T.App.toggleGatedRest();                 // 先展开，让那批旧号码真的渲染出来
  // 这时拦截名单里除了 5 个旧测试号，还有刚被删掉的 2 个学生（删除 = 进拦截名单）
  const N = (T.App.state.removedPhones || []).length;
  ok(N === 7, '拦截名单此刻 7 条（5 个旧测试号 + 刚删掉的 2 个学生）');
  const gatedPicked = () => (T.App.state.picked || []).filter(k => k.indexOf('g:') === 0);
  html = T.App.renderStudents();
  ok(html.indexOf('全选（' + N + '）') >= 0, '拦截区有「全选」，并写明这一区一共几个号码');
  ok(html.indexOf('🔄 反选') >= 0, '拦截区有「反选」按钮');
  ok(html.indexOf('一键删除（0）') >= 0, '还没勾的时候「一键删除（0）」就摆在那里');
  ok((html.match(/App\.deleteGatedOne\(/g) || []).length === N,
     '★ 这 ' + N + ' 个号码每个都自带一个「🗑️ 删除」按钮');

  // 全选 = 整区（含默认折叠的、以及老师收起的），不是"当前看得见的那些"
  T.App.pickAllGated(true);
  ok(gatedPicked().length === N, '全选 → 这一区 ' + N + ' 个号码全勾上');
  html = T.App.renderStudents();
  ok(html.indexOf('一键删除（' + N + '）') >= 0, '全选之后按钮变成「一键删除（' + N + '）」');
  ok((html.match(/pick-box[^>]*checked/g) || []).length >= N, '勾选框真的进到选中态（全选生效）');

  // 「全选之后把不用的给反选」
  T.App.togglePick('g', '13900141005');
  ok(gatedPicked().length === N - 1, '把不想删的那一个点掉 → 剩 ' + (N - 1) + ' 个');
  T.App.invertGated();
  ok(gatedPicked().length === 1 && gatedPicked()[0] === 'g:13900141005',
     '反选 → 只剩刚被点掉的那一个（勾上的取消、没勾的勾上）');
  T.App.invertGated();
  ok(gatedPicked().length === N - 1, '再反选一次 → 回到 ' + (N - 1) + ' 个');

  // ---- 一键删除：弹窗点「否」= 什么都不做 ----
  T.ask(false);
  await T.App.deletePicked();
  ok((T.App.state.removedPhones || []).length === N, '★ 弹窗选了「否」→ 一个都没删（确认真的是二选一）');
  ok(T.lastConfirm().msg.indexOf('确认删除选中的 ' + (N - 1) + ' 项') >= 0, '弹窗先说清楚这次要删几项');

  // ---- 点「是」→ 真的删掉，不再存在 ----
  T.ask(true);
  await T.App.deletePicked();
  const lr2 = await call(net.d1, 'GET', '/api/class/removed-list?teacher=' + TEACHER);
  ok(!lr2.data.removed.some(x => ['13900141001', '13900141002', '13900141003', '13900141004'].indexOf(x.phone) >= 0),
     '★★ 一键删除：勾中的 4 个真的从后台拦截名单里没了');
  ok(lr2.data.removed.some(x => x.phone === '13900141005'), '没勾的那一个原样留着（反选时点掉的就是它）');
  let s3 = await call(net.d1, 'GET', '/api/class/status?phone=13900141001');
  ok(s3.data.removed === false, '★★ 删掉的号码不再被拦 ——「删除了之后就不要再存在了」');
  html = T.App.renderStudents();
  ok(html.indexOf('13900141001') < 0 && html.indexOf('全选（1）') >= 0,
     '删掉的号码从页面上消失，这一区只剩没勾的那 1 个');
  ok((T.App.state.picked || []).length === 0, '删完自动清空勾选');

  // ---- 单个「🗑️ 删除」：不用先打勾，点一下就删这一个 ----
  T.ask(true);
  await T.App.deleteGatedOne('13900141005', '测试-4');
  let s4 = await call(net.d1, 'GET', '/api/class/status?phone=13900141005');
  ok(s4.data.removed === false, '单个删除：他也不再被拦了');
  ok((T.App.state.removedPhones || []).length === 0, '这一区被清空了');

  // ---- 名单里的孩子也在拦截区时：删除必须点名警告 ----
  net.d1.tables.removed_students.push({ phone: STUDENT, name: '张子皓-Harvey', removed_at: new Date().toISOString() });
  ['13900141011', '13900141012'].forEach((p, i) => {
    net.d1.tables.removed_students.push({ phone: p, name: '旧测试-' + i, removed_at: '2026-08-23T05:13:36.599Z' });
  });
  await T.App.loadRemovedList();
  T.App.pickAllGated(true);
  T.ask(false);                                  // 先点「否」，只看弹窗写了什么
  await T.App.deletePicked();
  const warn = T.lastConfirm().msg;
  ok(warn.indexOf('还在你的学生名单里') >= 0 && warn.indexOf('张子皓-Harvey') >= 0,
     '★ 勾到名单里的孩子时，弹窗点名警告"删掉拦截后他能直接进来"');
  ok((T.App.state.removedPhones || []).length === 3, '点「否」→ 3 个都还在');

  // ---- 「🧹 收起不删」是另一条路：只是不显示，拦截一点没松 ----
  T.ask(true);
  await T.App.hideAllGated();
  html = T.App.renderStudents();
  ok(html.indexOf('13900141011') < 0, '收起后旧号码不再占页面');
  ok(T.App._hiddenGated().indexOf('13900141011') >= 0, '它进了「已收起」名单（随时能找回来）');
  ok(html.indexOf(STUDENT) >= 0,
     '★ 还在你名单里的被拦学生，收起也藏不住（否则你只会看到"这孩子怎么进不来"）');
  for (const p of ['13900141011', '13900141012']) {
    s4 = await call(net.d1, 'GET', '/api/class/status?phone=' + p);
    ok(s4.data.removed === true, p + ' 仍然被拦着（收起 ≠ 删除，规则一点没松）');
  }
  ok(T.toasts.some(t => t.indexOf('仍然被拦着') >= 0), '收起时也明确告诉老师"他们仍然被拦着"');

  // ---- 展开找回 + 批量放行 ----
  T.App.toggleHiddenGated();
  html = T.App.renderStudents();
  ok(html.indexOf('13900141011') >= 0, '「展开已收起的号码」能把它们显示回来');
  ok(html.indexOf('他们仍然被拦着') >= 0, '并且页面上讲清楚了：被收起 ≠ 放行');
  T.App.togglePick('g', '13900141011');
  T.App.togglePick('g', '13900141012');
  T.ask(true);
  await T.App.unblockPicked();
  let s5 = await call(net.d1, 'GET', '/api/class/status?phone=13900141011');
  ok(s5.data.removed === false, '批量放行：13900141011 能登录了');
  s5 = await call(net.d1, 'GET', '/api/class/status?phone=13900141012');
  ok(s5.data.removed === false, '批量放行：13900141012 能登录了');
  s5 = await call(net.d1, 'GET', '/api/class/status?phone=' + STUDENT);
  ok(s5.data.removed === true, '没勾的那个照样拦着（批量只作用于勾选的）');
  ok(T.App._hiddenGated().indexOf('13900141011') < 0, '放行后不再留在"已收起"里（否则以后你又找不到人）');

  T.ask(true);
  T.App.restoreHiddenGated();
  ok(T.App._hiddenGated().length === 0, '「全部放回页面」把已收起名单清空');
  ok((T.App.state.picked || []).length === 0, '一轮操作下来勾选状态是干净的');
}

console.log('');
console.log(fail === 0 ? '✅ 全部通过（登录拦截是永久规则，已钉住）' : '❌ 有 ' + fail + ' 项没通过');
process.exit(fail === 0 ? 0 : 1);

})().catch(e => { console.log('  !! 测试自身崩了：' + (e && e.stack || e)); process.exit(1); });
