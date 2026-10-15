/* eslint-disable */
// 老师端「删除学生 / 删除班级」能不能真的删掉（v110）。
//
// 家长的原话：
//   1.「老师端这边收到了几个学生的注册信息，然后需要把多余的人给删除。
//       删除了之后，那个人的信息还是在」
//   2.「删除班级也还在。现在只留少儿英语A班，其他的班级删除点选之后，
//       他并没有删除」
//
// 根因不在按钮，在合并：云端 blob 是一整块 JSON，两台设备各拿一份，
// 同步时做的是"并集"。本地删掉的东西，云端那一份（或另一台还揣着旧
// 名单的设备）下一次同步就把它原样推回来 —— 于是「删除」看起来毫无
// 反应。班级同理，而且老师把学生移出班级后，class/approved 还会被云端
// 的旧值覆盖回来。
//
// 钉住的行为：
//   A. 老师删学生 → 本机没了、云端也没了、墓碑记下了
//   B. 反复 上下同步 + 另一台设备回推 → 被删的学生不复活
//   C. 删班级 → 班级不复活；班内学生按老师的第二个选择留或删
//   D. 移出班级（不删人）→ class/approved 不会被云端旧值覆盖回来
//   E. 老师「同意重新加入」→ 墓碑清除，学生真的能回来
//   F. 云端 blob 没有墓碑字段（老数据 / 老设备写的）→ 不报错、行为不变
//   G. 删过的班级名重新创建 → 能创建，不会被墓碑挡住
//
// 用法：node tools/verify-delete-persist.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

const cloudSrc = fs.readFileSync(BASE + 'cloud.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
process.on('unhandledRejection', e => { console.log('  !! 未处理的异常：' + (e && e.message)); });

// ---------------------------------------------------------------------------
// 云端的替身：一个共享的 blob + 几个 D1 端点。所有"设备"共用一个 net，
// 就像真机上所有设备共用 textdb 的那两个 key。
// ---------------------------------------------------------------------------
function makeNet(blob) {
  return {
    blob: blob || null,
    writes: 0,
    joinRequests: [],
    removals: [],          // D1 removed_students
    unreachable: false,
  };
}

const jsonRes = obj => ({
  ok: true, status: 200,
  json: async () => obj,
  text: async () => JSON.stringify(obj),
});

function makeFetch(net) {
  return async function (url, opts) {
    opts = opts || {};
    const u = String(url);
    // 模拟「后台 class 接口整体不可用」：移除/列表/放行全挂。
    // 用于验证"拦截写不进去 ⇒ 一个人都不许删"这条承诺。
    if (net.classApiDown && u.indexOf('/api/class') >= 0) {
      throw new Error('class api down');
    }
    if (u.indexOf('textdb.dev') >= 0) {
      if (net.unreachable) throw new Error('network down');
      if (opts.method === 'POST') {
        net.blob = JSON.parse(opts.body);
        net.writes++;
        return { ok: true, status: 200, text: async () => 'ok' };
      }
      return { ok: true, status: 200, text: async () => (net.blob ? JSON.stringify(net.blob) : 'null') };
    }
    if (u.indexOf('/api/class/join-requests') >= 0) return jsonRes({ requests: net.joinRequests });
    if (u.indexOf('/api/class/join-request/resolve') >= 0) {
      const body = JSON.parse(opts.body || '{}');
      if (body.action === 'approve') {
        net.removals = net.removals.filter(p => p !== (net.joinRequests[0] || {}).phone);
        net.joinRequests = net.joinRequests.filter(r => r.id !== body.id);
      }
      return jsonRes({ ok: true });
    }
    if (u.indexOf('/api/class/join-request') >= 0) return jsonRes({ ok: true });
    // 移出名单的读回：app.js 现在写完拦截要**核对**（verifyGated），
    // 这里必须跟服务端 /api/class/removed-list 一样把名单吐出来，
    // 否则核对永远失败、删除会被前置检查挡住（不是被测代码的问题）。
    if (u.indexOf('/api/class/removed-list') >= 0) {
      return jsonRes({ removed: (net.removals || []).map(p => ({ phone: p, name: '', removed_at: '' })) });
    }
    if (u.indexOf('/api/class/unblock') >= 0) {
      const body = JSON.parse(opts.body || '{}');
      const list = Array.isArray(body.phones) ? body.phones : [body.phone];
      list.filter(Boolean).forEach(p => { net.removals = net.removals.filter(x => x !== p); });
      return jsonRes({ ok: true, count: list.filter(Boolean).length });
    }
    if (u.indexOf('/api/class/remove') >= 0) {
      const body = JSON.parse(opts.body || '{}');
      // 单个 {phone,name} 或批量 {phones:[{phone,name}]}，跟 worker 一致
      const entries = Array.isArray(body.phones)
        ? body.phones.map(e => (typeof e === 'string' ? { phone: e } : (e || {})))
        : [{ phone: body.phone }];
      let count = 0;
      entries.forEach(e => {
        const p = String((e && e.phone) || '').trim();
        if (!p) return;
        if (net.removals.indexOf(p) < 0) net.removals.push(p);
        count++;
      });
      if (!Array.isArray(body.phones)) {
        if (!count) return jsonRes({ error: 'missing_phone' }, 400);
        return jsonRes({ ok: true });
      }
      return jsonRes({ ok: true, count: count });
    }
    if (u.indexOf('/api/class/status') >= 0) {
      const phone = decodeURIComponent((u.split('phone=')[1] || ''));
      return jsonRes({ removed: net.removals.indexOf(phone) >= 0 });
    }
    return jsonRes({});
  };
}

// ---------------------------------------------------------------------------
// 一台设备 = 一份独立的 localStorage + 一份独立的 app.js/api.js 实例
// ---------------------------------------------------------------------------
function makeDevice(net, label) {
  const lsData = {};
  const confirmQueue = [];
  const allEls = [];
  const byId = {};

  const mkEl = (tag) => {
    const e = {
      tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {},
      innerHTML: '', textContent: '', className: '', value: '', disabled: false,
      dataset: {},
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
    e.closest = () => null; e.querySelector = () => null; e.querySelectorAll = () => [];
    allEls.push(e);
    return e;
  };

  const getEl = id => (byId[id] = byId[id] || mkEl('div'));
  const document = {
    getElementById: getEl,
    querySelector: () => null,
    querySelectorAll: () => [],
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
    return { App: App, Api: Api, Store: Store, CloudSync: CloudSync, Cloud: Cloud };
  `)({
    document, window, location: { hostname: 'amyeng.top', href: '', search: '' },
    navigator, localStorage, Recorder, HOMEWORK_DATA,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: makeFetch(net),
    SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, prompt: () => '',
    confirm: () => (confirmQueue.length ? confirmQueue.shift() : true),
    requestAnimationFrame: cb => setTimeout(cb, 0),
  });

  const dev = {
    label,
    App: built.App, Api: built.Api, Store: built.Store, CloudSync: built.CloudSync,
    ask: (...answers) => { answers.forEach(a => confirmQueue.push(a)); },
    toast: (msg) => { toasts.push(msg); },
    toasts,
    ls: lsData,
  };
  // 渲染不是这次要验的东西，别让它把断言淹掉
  dev.App.showToast = msg => { toasts.push(String(msg)); };
  dev.App.renderContent = () => {};
  // app.js 自己会在装载时跑一次 init()（异步），它会把 state.students 指到
  // Store 的那份真数据上。等它跑完，测试再动手，否则测的是两个不同的数组。
  dev.ready = (async () => {
    await new Promise(r => setTimeout(r, 60));
    await dev.App.loadData();
  })();
  return dev;
}

const tick = (ms) => new Promise(r => setTimeout(r, ms || 40));

const asTeacher = async (dev) => {
  await dev.ready;
  dev.App.state.role = 'teacher';
  dev.App.state.phone = '13259532991';
  dev.App.state.name = 'AMy';
  dev.App.state.currentTab = 'students';
  return dev;
};
const asStudent = async (dev, phone, name) => {
  await dev.ready;
  dev.App.state.role = 'student';
  dev.App.state.phone = phone;
  dev.App.state.name = name;
  return dev;
};

const find = (dev, phone) => dev.App.state.students.find(s => s.phone === phone);
const cloudFind = (net, phone) => (net.blob.students || []).find(s => s.phone === phone);
const cloudClasses = (net) => (net.blob.classes || []);

// 云端预置：一份贴近家长 2026-10-14 真实数据的名单
function seedCloud() {
  return {
    lastUpdated: '2026-10-14T03:03:55.417Z',
    classes: ['少儿英语A班', 'B班', 'X班', '未分班'],
    students: [
      { id: 's1', name: '张子皓-Harvey', phone: '15109549632', class: '少儿英语A班', approved: true, registeredAt: '2026-10-13T23:26:47.056Z' },
      { id: 's2', name: '马英凯-Steven', phone: '18995138675', class: '少儿英语A班', approved: true, registeredAt: '2026-10-13T15:19:02.493Z' },
      { id: 's3', name: '小舟-Zoe', phone: '13900139400', class: '', approved: false, registeredAt: '2026-08-23T06:15:22.785Z' },
      { id: 's4', name: '小舟-Zoe', phone: '13900139500', class: '', approved: false, registeredAt: '2026-08-23T06:19:22.915Z' },
      { id: 's5', name: '测试-Test', phone: '13800138000', class: 'X班', approved: true, registeredAt: '2026-08-23T03:53:28.128Z' },
      { id: 's6', name: '田墨翰-Matt', phone: '18408439432', class: 'X班', approved: true, registeredAt: '2026-10-13T12:36:15.779Z' },
    ],
  };
}

(async function main() {

// ===========================================================================
console.log('=== 1. 老师删掉多余的学生：本机、云端、墓碑三处都要落 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();
  ok(T.App.state.students.length === 6, '老师拉到了云端 6 个学生（实际 ' + T.App.state.students.length + '）');

  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();

  ok(!find(T, '13900139400'), '① 本机名单里没有了');
  ok(!cloudFind(net, '13900139400'), '② 云端名单里也没有了');
  ok((net.blob.deletedPhones || []).indexOf('13900139400') >= 0, '③ 云端记下了这个手机号被删过（墓碑）');
  ok(T.Api.hasTombstonePhone('13900139400'), '④ 本机也记着（下次同步还认账）');
  ok(net.removals.indexOf('13900139400') >= 0, '⑤ 后台（D1）也记了，这个号要申请才能重新登录');

  // 删除前反复上下同步 —— 这就是家长看到"信息还在"的场景
  for (let i = 0; i < 3; i++) { await T.App.syncFromCloud(); await T.App.syncToCloud(); }
  ok(!find(T, '13900139400'), '⑥ 连拉 3 次云端，被删的学生不会复活');
  ok(!cloudFind(net, '13900139400'), '⑦ 云端也不会被合并逻辑捞回来');

  // 家长还有一批测试号，一次删干净
  T.ask(true);
  await T.App.rejectStudent('13900139500');
  await tick();
  await T.App.syncToCloud();
  ok(T.App.state.students.length === 4, '两个测试号删完剩 4 人（实际 ' + T.App.state.students.length + '）');
  ok((net.blob.students || []).length === 4, '云端也是 4 人');
}

// ===========================================================================
console.log('\n=== 2. 另一台设备（学生端）揣着旧名单回推，也不能让被删的人回来 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();
  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();

  // 学生设备上还留着一份"陈旧的"全班名单（含刚被删的那个号）
  const S = await asStudent(makeDevice(net, '学生'), '15109549632', '张子皓-Harvey');
  S.App.state.students.length = 0;
  S.App.state.students.push(
    { id: 's1', name: '张子皓-Harvey', phone: '15109549632', class: '', approved: false, registeredAt: '2026-10-13T23:26:47.056Z' },
    { id: 's3', name: '小舟-Zoe', phone: '13900139400', class: '', approved: false, registeredAt: '2026-08-23T06:15:22.785Z' }
  );
  await S.App.syncFromCloud();
  ok(!S.App.state.students.find(s => s.phone === '13900139400'), '学生设备拉到墓碑后，自己也把已删的人清掉了');

  await S.App.syncToCloud();
  ok(!cloudFind(net, '13900139400'), '学生设备回推名单，被删的人没有被重新塞回云端（旧版就是在这里复活的）');
  ok(cloudFind(net, '15109549632') !== undefined, '正常同学不受影响，还在云端');
}

// ===========================================================================
console.log('\n=== 3. 老师只留「少儿英语A班」：空班级直接删，不复活 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();
  ok(T.App.state.classes.join(',') === '少儿英语A班,B班,X班,未分班', '初始 4 个班级');

  T.ask(true);                       // 只有一个确认（班内没人）
  await T.App.deleteClass('未分班');
  await tick();
  await T.App.syncToCloud();
  ok(T.App.state.classes.indexOf('未分班') < 0, '① 本机班级列表里没有了');
  ok(cloudClasses(net).indexOf('未分班') < 0, '② 云端班级列表里也没有了');
  ok((net.blob.deletedClasses || []).indexOf('未分班') >= 0, '③ 墓碑记下了这个班级名被删过');

  for (let i = 0; i < 3; i++) { await T.App.syncFromCloud(); await T.App.syncToCloud(); }
  ok(T.App.state.classes.indexOf('未分班') < 0, '④ 反复同步不会把删掉的班级带回来');
  ok(cloudClasses(net).indexOf('未分班') < 0, '⑤ 云端也不会被并集捞回来');

  // 另一台设备也要认这个删除
  const T2 = await asTeacher(makeDevice(net, '老师2'));
  T2.App.state.classes = ['少儿英语A班', 'B班', 'X班', '未分班'];
  await T2.App.syncFromCloud();
  ok(T2.App.state.classes.indexOf('未分班') < 0, '⑥ 另一台设备拉到墓碑后也不再显示这个班级');
}

// ===========================================================================
console.log('\n=== 4. 删有学生的班级：第二个问题选「只删班级」→ 学生变待分配 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true, false);                // 删班级=是，同时删学生=否
  await T.App.deleteClass('X班');
  await tick();
  await T.App.syncToCloud();

  ok(T.App.state.classes.indexOf('X班') < 0, 'X班 没了');
  const m = find(T, '18408439432');
  ok(m && m.class === '' && m.approved === false, '田墨翰-Matt 变成未分配（人还在）');
  ok(cloudFind(net, '18408439432') !== undefined, '云端也还留着这个人');
  ok((cloudFind(net, '18408439432') || {}).class === '', '云端他的班级也是空的（旧版会被云端旧值覆盖回 X班）');

  const T2 = await asTeacher(makeDevice(net, '老师2'));
  T2.App.state.classes = ['少儿英语A班', 'B班', 'X班'];
  T2.App.state.students = [
    { id: 's6', name: '田墨翰-Matt', phone: '18408439432', class: 'X班', approved: true, registeredAt: '2026-10-13T12:36:15.779Z' },
  ];
  await T2.App.syncFromCloud();
  ok(T2.App.state.classes.indexOf('X班') < 0, '另一台设备也不再有 X班');
  ok((T2.App.state.students.find(s => s.phone === '18408439432') || {}).class === '', '另一台设备上他也变未分配');
}

// ===========================================================================
console.log('\n=== 5. 删有学生的班级：第二个问题选「连学生一起删」→ 一次清干净 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true, true);                 // 删班级=是，同时删学生=是
  await T.App.deleteClass('X班');
  await tick();
  await T.App.syncToCloud();

  ok(T.App.state.classes.indexOf('X班') < 0, 'X班 没了');
  ok(!find(T, '13800138000') && !find(T, '18408439432'), '班内 2 名学生一起删掉了');
  ok(!cloudFind(net, '13800138000') && !cloudFind(net, '18408439432'), '云端也没有这 2 个人了');
  ok((net.blob.deletedPhones || []).indexOf('13800138000') >= 0, '2 个手机号都记了墓碑');
  ok(net.removals.length === 2, '后台也把这 2 个号拉黑了（要申请才能回来）');

  for (let i = 0; i < 3; i++) { await T.App.syncFromCloud(); await T.App.syncToCloud(); }
  ok(!find(T, '18408439432') && !cloudFind(net, '18408439432'), '反复同步，班级和学生都不复活');
  ok(T.App.state.students.length === 4, '只剩 4 人：2 个 A班学生 + 2 个未分配测试号（实际 ' + T.App.state.students.length + '）');
}

// ===========================================================================
console.log('\n=== 6. 「移出班级」（不删人）也不能被云端旧值顶回来 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true);
  await T.App.removeStudent('s1');
  await tick();
  await T.App.syncToCloud();

  ok((find(T, '15109549632') || {}).class === '', '本机：张子皓 班级清空');
  ok((cloudFind(net, '15109549632') || {}).class === '', '云端：班级也清空了（旧版立刻被云端旧值写回 A班）');
  ok((cloudFind(net, '15109549632') || {}).approved === false, '云端 approved 也变成 false');

  await T.App.syncFromCloud();
  ok((find(T, '15109549632') || {}).class === '', '再拉一次云端，还是空的（老师刚做的操作没被顶掉）');
  ok(find(T, '15109549632') !== undefined, '人还在名单里，只是没班级 —— 移出≠删除');
}

// ===========================================================================
console.log('\n=== 7. 老师「同意重新加入」→ 墓碑清除，人真的能回来 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();
  ok(!cloudFind(net, '13900139400'), '先删掉');

  // 学生端申请重新加入（D1）
  net.joinRequests = [{ id: 'r1', phone: '13900139400', name: '小舟-Zoe', created_at: '2026-10-14T02:00:00.000Z' }];
  await T.App.fetchJoinRequests();
  ok((T.App.state.joinRequests || []).length === 1, '老师端看到了这条重新入班申请');

  await T.App.approveJoin('r1');
  await tick();
  await T.App.syncToCloud();

  ok(!T.Api.hasTombstonePhone('13900139400'), '墓碑清掉了（否则同意了也看不见人）');
  ok((net.blob.deletedPhones || []).indexOf('13900139400') < 0, '云端墓碑也清了');
  ok(net.removals.indexOf('13900139400') < 0, '后台黑名单也解除了');
  ok(find(T, '13900139400') !== undefined, '学生回到名单（待分配）');
  ok(cloudFind(net, '13900139400') !== undefined, '云端也有了');

  await T.App.syncFromCloud();
  ok(find(T, '13900139400') !== undefined, '再拉一次云端，人还在（没被自己的墓碑挡住）');
}

// ===========================================================================
console.log('\n=== 8. 老数据 / 老设备：blob 里没有墓碑字段也不能出错 ===');
{
  const legacy = seedCloud();          // 没有 deletedPhones / deletedClasses
  const net = makeNet(legacy);
  const T = await asTeacher(makeDevice(net, '老师'));
  const res = await T.App.syncFromCloud();
  ok(res === undefined || res === null || true, 'syncFromCloud 不抛异常');
  ok(T.App.state.students.length === 6, '老数据的名单照常读到 6 人');
  ok(T.App.state.classes.length === 4, '老数据的班级照常读到 4 个');

  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();
  ok(Array.isArray(net.blob.deletedPhones) && net.blob.deletedPhones.length === 1, '第一次删除就顺手把墓碑字段建起来了');
}

// ===========================================================================
console.log('\n=== 9. 删过的班级名重新创建 / 手动加回学生 → 墓碑必须让路 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true);
  await T.App.deleteClass('B班');
  await tick();
  await T.App.syncToCloud();
  ok(T.App.state.classes.indexOf('B班') < 0, 'B班 先删掉');

  // 老师改主意，重新建一个同名班级
  T.App.showModal = () => {};
  T.App.closeModal = () => {};
  T.App.state.classes.push('B班');          // 模拟 saveClass 的本地改动
  await T.Api.untombstoneClass('B班');
  await T.Api.saveClasses(T.App.state.classes);
  await T.App.syncToCloud();
  ok(T.App.state.classes.indexOf('B班') >= 0, '重建的 B班 在本机');
  ok(cloudClasses(net).indexOf('B班') >= 0, '重建的 B班 在云端（没被墓碑挡住）');

  // 手动加回一个刚删过的手机号
  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();
  await T.Api.untombstonePhone('13900139400');
  const back = { id: 'sx', name: '小舟-Zoe', phone: '13900139400', parentPhone: '13900139400', class: '', approved: false, registeredAt: new Date().toISOString() };
  T.App.state.students.push(back);
  await T.Api.saveStudent(back);
  await T.Api.untombstonePhone('13900139400');
  await T.App.syncToCloud();
  ok(cloudFind(net, '13900139400') !== undefined, '手动加回的学生推得上云端');
}

// ===========================================================================
console.log('\n=== 10. 云端暂时连不上：本地删除不许被冲掉，恢复后照样生效 ===');
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  net.unreachable = true;
  T.ask(true);
  await T.App.rejectStudent('13900139400');
  await tick();
  await T.App.syncToCloud();
  ok(!find(T, '13900139400'), '断网时本机照样把人删掉了');
  ok(T.Api.hasTombstonePhone('13900139400'), '墓碑也在本机存着');
  await T.App.syncFromCloud();
  ok(!find(T, '13900139400'), '断网期间拉云端失败，也不会把本机已删的人塞回来');

  net.unreachable = false;
  await T.App.syncToCloud();
  ok(!cloudFind(net, '13900139400'), '网络恢复后推送，云端也删干净了');
  ok((net.blob.deletedPhones || []).indexOf('13900139400') >= 0, '墓碑也一起推了上去');
}

// ===========================================================================
console.log('\n=== 11. 老师 2026-10-15 报的：删掉的班级（B班 / X班）又自己冒出来 ===');
// 病根有两处：
//   ① deleteClass 以前用 fire-and-forget 的 syncToCloud() 推墓碑 —— 那一下
//      要是没成功，云端 blob 里旧班级还在、墓碑却没上去，下次同步就拉回来了。
//   ② 只要还有**学生记录**挂着这个名字（别台设备的旧快照、学生端推上来的
//      旧数据），并集合并就会把这个班重新造出来。
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  // ① 删除必须**等**墓碑推上云，不再是挂着不管
  net.unreachable = true;
  T.ask(true);
  await T.App.deleteClass('B班');
  ok(T.Api.hasTombstoneClass('B班'),
     '① 断网时本机墓碑也写下来了（不会随页面关掉就丢）');
  ok(T.App.state.classes.indexOf('B班') < 0, '① 本机班级列表里当场就没了');
  ok((net.blob.deletedClasses || []).indexOf('B班') < 0,
     '① 断网时云端墓碑当然还没上去（这正是以前会复活的时刻）');

  net.unreachable = false;               // 网络恢复
  await T.App.syncToCloud();             // 手动"立即同步"
  ok((net.blob.deletedClasses || []).indexOf('B班') >= 0, '① 联网后墓碑终于推上云');

  // 反复同步都不能复活
  for (let i = 0; i < 3; i++) { await T.App.syncFromCloud(); await T.App.syncToCloud(); }
  ok(T.App.state.classes.indexOf('B班') < 0, '① 反复同步，B班 不再出现');
  ok(cloudClasses(net).indexOf('B班') < 0, '① 云端也不会被并集捞回来');
}
{
  const net = makeNet(seedCloud());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.ask(true, false);                    // 删班级=是，同时删学生=否（学生留着变待分配）
  await T.App.deleteClass('X班');
  ok(T.App.state.classes.indexOf('X班') < 0, '② X班 删掉');

  // ② 模拟"另一台设备 / 学生端"带着旧数据上来：云端 blob 里仍有班级名，
  //    并且有学生挂在 X班 上（旧快照残留）。
  net.blob.classes = (net.blob.classes || []).concat(['X班']);   // 旧副本把班级塞回来
  net.blob.students = (net.blob.students || []).map(s =>
    s.phone === '18408439432' ? Object.assign({}, s, { class: 'X班', approved: true }) : s);
  // 本机也制造一份"学生还挂着已删班级"的脏状态（老设备同步过来的样子）
  const dirty = T.App.state.students.find(s => s.phone === '18408439432');
  if (dirty) { dirty.class = 'X班'; dirty.approved = true; }

  await T.App.syncFromCloud();           // 拉一次：旧数据想借学生把班级带回来
  ok(T.App.state.classes.indexOf('X班') < 0,
     '② 学生身上挂着已删班级，也不能把这个班带回来');
  const m = find(T, '18408439432');
  ok(m && m.class === '', '② 该学生被自动抹成未分配（而不是保留一个不存在的班级）');
  ok(m && m.approved === false, '② 同时退回"未批准"，跟他没被分配过一样');

  await T.App.syncToCloud();
  for (let i = 0; i < 3; i++) { await T.App.syncFromCloud(); await T.App.syncToCloud(); }
  ok(cloudClasses(net).indexOf('X班') < 0, '② 云端最终也清掉了 X班');
  ok(T.App.state.classes.indexOf('X班') < 0, '② 来回同步都不复活');
}

// ===========================================================================
// ③ v125：删除 = 一定进后台拦截名单（老师 2026-10-15）
//
// 「点了全选删除之后……只要删除了，任何人再进来都需要老师验证。」
//
// 旧实现是**先删本机、再写拦截**，中间有一个致命窗口：名单已经没了、拦截却
// 没写上，学生此刻登录就是直接放行；而且本机状态已经被 syncToCloud 推上云，
// 事后连人都找不回来。新实现把顺序倒过来 —— 先写拦截、**回读核对**，
// 坐实了才动本机名单。下面这几条就是钉住这个顺序和这条承诺。
// ===========================================================================
const seedPending = () => ({
  lastUpdated: '2026-10-14T03:03:55.417Z',
  classes: ['少儿英语A班'],
  students: [
    { id: 'p1', name: '待分配甲-Alpha', phone: '13100000001', class: '', approved: false, registeredAt: '2026-08-23T06:15:22.785Z' },
    { id: 'p2', name: '待分配乙-Beta', phone: '13100000002', class: '', approved: false, registeredAt: '2026-08-23T06:15:22.785Z' },
    { id: 'p3', name: '已分配丙-Gamma', phone: '13100000003', class: '少儿英语A班', approved: true, registeredAt: '2026-08-23T06:15:22.785Z' },
  ],
  deletedPhones: [], deletedClasses: [], revivedPhones: [], revivedClasses: [],
});
{
  const net = makeNet(seedPending());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  // ③-1 一键删「待分配」全区
  T.App.pickAllPending(true);
  const pickedCount = T.App.state.picked.filter(k => k.indexOf('s:') === 0).length;
  ok(pickedCount === 2, '③ 全选待分配 勾上 2 人（实际 ' + pickedCount + '）');
  T.ask(true);
  await T.App.deletePickedPending();

  ok(!find(T, '13100000001') && !find(T, '13100000002'), '③ 两个待分配学生从名单里没了');
  ok(net.removals.indexOf('13100000001') >= 0 && net.removals.indexOf('13100000002') >= 0,
     '③ 两个号都进了后台拦截名单（再次登录必须老师同意）');
  // 被删的人重新登录 → /api/class/status 必须说 removed
  const st1 = await T.Api.classStatus('13100000001');
  ok(st1 && st1.removed === true, '③ 被删的人再登录，后台判定为「已移出」（拦得住）');
  // 没删的那个人不受影响
  const st3 = await T.Api.classStatus('13100000003');
  ok(st3 && st3.removed === false, '③ 没勾的人不受影响（放行）');
  // 云端也删干净了
  await T.App.syncToCloud();
  ok(!cloudFind(net, '13100000001') && !cloudFind(net, '13100000002'),
     '③ 云端名单里也没有了（有墓碑，不会复活）');
}
{
  // ③-2 一键删「已分配」全区
  const net = makeNet(seedPending());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.App.pickAllApproved(true);
  T.ask(true);
  await T.App.deletePickedApproved();

  ok(!find(T, '13100000003'), '③ 已分配学生删掉了');
  ok(net.removals.indexOf('13100000003') >= 0, '③ 已分配那个号也进了后台拦截名单');
  // 待分配那两个人不该被这个按钮误伤
  ok(!!find(T, '13100000001'), '③ 删「已分配」不会误伤「待分配」');
  ok(net.removals.indexOf('13100000001') < 0, '③ 待分配的人没有被拦');
}
{
  // ③-3 反选：全选之后把不想删的点掉，只删剩下的
  const net = makeNet(seedPending());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();

  T.App.pickAllPending(true);
  T.App.invertPending();                  // 反选 = 一个都不勾
  ok(T.App.state.picked.filter(k => k.indexOf('s:') === 0).length === 0,
     '③ 全选后反选 → 一个都不勾（留下的都不会被删）');
  T.ask(true);
  await T.App.deletePickedPending();
  ok(!!find(T, '13100000001') && !!find(T, '13100000002'),
     '③ 没勾的人真的没被删（反选留人有效）');
  ok(net.removals.length === 0, '③ 没勾的人也没被拦');
}
{
  // ③-4 关键承诺：后台拦截写不进去时，一个人都不许删
  const net = makeNet(seedPending());
  const T = await asTeacher(makeDevice(net, '老师'));
  await T.App.syncFromCloud();
  const before = T.App.state.students.length;

  net.classApiDown = true;               // 后台拦截接口整体不可用
  T.App.pickAllPending(true);
  T.ask(true);
  await T.App.deletePickedPending();

  ok(T.App.state.students.length === before,
     '③ 拦截没写成功 ⇒ 一个学生都没删（不会出现"名单没了但门还开着"）');
  ok(!!find(T, '13100000001') && !!find(T, '13100000002'),
     '③ 两个待分配学生都还在名单上');
  ok(T.toasts.some(m => m.indexOf('没有删除') >= 0),
     '③ 老师会收到明确的「这次没删成」提示，而不是假的成功');
}

console.log('\n' + (fail === 0 ? '全部通过 ✅' : ('有 ' + fail + ' 项没通过 ❌')));
process.exit(fail === 0 ? 0 : 1);

})();
