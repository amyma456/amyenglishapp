// v150 验证：
//  1) 刷新 / 下拉刷新后回到原来那一屏（老师：打卡监控 → 刷新 → 还是打卡监控）
//  2) 打卡监控 / 错题卷只显示本班学生（不再有 小舟-Zoe 这些测试号）
//  3) 「删了又回来」的根因：清拦截不能复活已删除学生；云端删除名单压过本机旧复活记录
const fs = require('fs');
const path = require('path');
const jsdom = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom');

let pass = 0, failN = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' —— ' + extra : '')); }
};

const R = __dirname;
const dataSrc = fs.readFileSync(path.join(R, '..', 'public', 'data.js'), 'utf8');
const appSrcRaw = fs.readFileSync(path.join(R, '..', 'public', 'app.js'), 'utf8');
const appSrc = appSrcRaw.replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */');
const cloudSrc = fs.readFileSync(path.join(R, '..', 'public', 'cloud.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(R, '..', 'public', 'api.js'), 'utf8');

const noop = () => {};
function proxy(lenient) {
  return new Proxy({}, {
    get(t, k) {
      if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
      if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
      if (k === 'cloudAvailable') return () => false;
      if (k === 'load') return () => new Promise(() => {});
      if (k === 'supported') return () => true;
      if (k === 'level') return () => 0;
      if (k === 'join' || k === 'padForAsr') return () => null;
      if (k === 'start' || k === 'stop') return () => Promise.resolve({ blob: {}, samples: null });
      if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push|flush)/.test(k)) {
        return lenient ? () => Promise.resolve({}) : noop;
      }
      return noop;
    },
  });
}

// ---------------------------------------------------------------------------
console.log('== 1. 刷新后回到原来那一屏 ==');
{
  const dom = new jsdom.JSDOM('<div id="content-area"></div>', { url: 'https://amyeng.top/', pretendToBeVisual: true });
  const { window } = dom;
  const document = window.document;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

  const sandbox = {
    document, window, location: window.location, navigator: window.navigator,
    localStorage: window.localStorage, sessionStorage: window.sessionStorage,
    Api: proxy(true), Recorder: proxy(true), URL: window.URL,
    fetch: () => new Promise(() => {}), Cloud: undefined, SpeechRecognition: undefined,
    Audio: window.Audio, alert: noop, confirm: () => true, prompt: () => '',
    requestAnimationFrame: (cb) => setTimeout(cb, 0), cancelAnimationFrame: clearTimeout,
    SpeechSynthesisUtterance: function () {},
    speechSynthesis: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop },
    MutationObserver: window.MutationObserver, IntersectionObserver: window.IntersectionObserver,
    setTimeout, clearTimeout, setInterval, clearInterval, console,
    indexedDB: undefined, performance, Blob: window.Blob, FormData: window.FormData,
  };
  const built = new Function('g', `
    const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
            Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
            cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
            IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
            indexedDB, performance, Blob, FormData } = g;
    ${dataSrc}
    ${appSrc}
    return { App };
  `)(sandbox);
  const App = built.App;

  App.state.role = 'teacher';
  App.state.phone = '13259532991';
  App._saveTab('checkin');
  ok(App._restoreTab() === 'checkin', '老师存了「打卡监控」，刷新后还原成打卡监控');
  App._saveTab('students');
  ok(App._restoreTab() === 'students', '老师存了「学生管理」，刷新后还原');
  App._saveTab('preview');
  ok(App._restoreTab() === 'preview', 'v160：老师存了「题库预览」，刷新后还原（天/周另有 amy_last_preview 接回）');
  App._saveTab('checkin');
  App.state.role = '';
  App.state.phone = '13800000000';
  ok(App._restoreTab() === 'today', '角色不符（学生号）不还原成老师的页，回今日作业');
  App._saveTab('myprogress');
  ok(App._restoreTab() === 'myprogress', '学生存了「孩子打卡」，刷新后还原');

  const _sa = appSrc.indexOf('  showApp() {');
  const showAppBody = appSrc.slice(_sa, appSrc.indexOf('  // ===== TTS / Voice =====', _sa));
  ok(/_restoreTab\(\)/.test(showAppBody), 'showApp 用 _restoreTab 决定进哪一屏（不再写死 weekly）');
  ok(!/currentTab = this\.isTeacher\(\) \? 'weekly'/.test(appSrc), '写死回首页的旧代码已移除');
  const swBody = appSrc.slice(appSrc.indexOf('  async switchTab(tab) {'), appSrc.indexOf('  async switchTab(tab) {') + 2600);
  ok(/_saveTab\(tab\)/.test(swBody), '每次切页都记下当前 tab');
  ok(/restore[\s\S]{0,80}_pullCloudCheckins|_pullCloudCheckins[\s\S]{0,200}renderContent/.test(showAppBody),
     '恢复到数据页后会补拉云端再重画（刷新后看到的是新数据）');

  // -------------------------------------------------------------------------
  console.log('\n== 2. 只显示本班学生 ==');
  App.state.classes = ['少儿英语A班'];
  App.state.students = [
    { id: 'a1', name: '陈皓正-Yunus', phone: '13259532909', class: '少儿英语A班' },
    { id: 'a2', name: '张子皓-Harvey', phone: '15109549632', class: '少儿英语A班' },
    { id: 'j1', name: '小舟-Zoe', phone: '13900139300', class: '' },
    { id: 'j2', name: '小舟-Zoe', phone: '13900139210', class: '' },
    { id: 'j3', name: '测试-Test', phone: '13800138000', class: '' },
    { id: 'j4', name: '田墨翰-Matt', phone: '11840843943', class: '' },
  ];
  App.state.className = '';
  let roster = App._classRoster();
  ok(roster.length === 2, '没设 className 时也只取已分班的 2 人（不是 6 人）', roster.length + ' 人');
  ok(roster.every(s => s.class === '少儿英语A班'), '未分配的测试号全部排除');
  App.state.className = '少儿英语A班';
  roster = App._classRoster();
  ok(roster.length === 2 && roster.every(s => s.class === '少儿英语A班'), '指定班级后只取该班学生');

  const rcStart = appSrc.indexOf('  renderCheckin() {');
  const rc = appSrc.slice(rcStart, appSrc.indexOf('  renderScores() {', rcStart));
  ok(/_classRoster\(\)/.test(rc), '打卡监控的表和统计都走 _classRoster');
  ok(!/this\.state\.students\.forEach/.test(rc), '打卡监控不再遍历全部学生');
  const rp = appSrc.slice(appSrc.indexOf('  renderPrint() {'), appSrc.indexOf('  renderPrint() {') + 800);
  ok(/_classRoster\(\)/.test(rp), '错题卷打印也只列本班学生');
}

// ---------------------------------------------------------------------------
console.log('\n== 3. 删掉的学生不会再回来 ==');
{
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/', pretendToBeVisual: true });
  const w = dom.window;
  let cloudFetch = () => new Promise(() => {});   // 默认：一直挂着（模拟离线）
  const built = new Function('document', 'window', 'localStorage', 'navigator', 'location', 'fetch', 'console',
    cloudSrc + ';' + apiSrc + ';return { CloudSync, Api, Store };')(
    w.document, w, w.localStorage, w.navigator, w.location, (...a) => cloudFetch(...a), console);
  const { CloudSync } = built;

  // ① 历史遗留的「复活名单」在下次打开 App 时一次性清空（v150 迁移）
  ok(/amy_revived_reset_v150/.test(apiSrc), '有一次性的复活名单清理标记');
  {
    // 行为：localStorage 的文档里还留着旧的 revivedPhones → 读出来必须已经是空
    const d2 = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
    const w2 = d2.window;
    w2.localStorage.setItem('eng_hw_v6', JSON.stringify({
      students: [], classes: [], answers: {}, checkins: {},
      deletedPhones: ['13800138000'],
      revivedPhones: ['13800138000', '11840843943'],
    }));
    const b2 = new Function('document', 'window', 'localStorage', 'navigator', 'location', 'fetch', 'console',
      cloudSrc + ';' + apiSrc + ';return { Store };')(
      w2.document, w2, w2.localStorage, w2.navigator, w2.location, () => new Promise(() => {}), console);
    const d = b2.Store.doc();
    ok(d.revivedPhones.length === 0, '旧的复活名单被清空（test / MATT 不再被放回来）', JSON.stringify(d.revivedPhones));
    ok(d.deletedPhones.indexOf('13800138000') >= 0, '删除名单本身保留');
    ok(w2.localStorage.getItem('amy_revived_reset_v150') === '1', '清理只做一次（有标记）');
  }

  // ② 老师真的点过「放行」：revived 有、tombstone 没有 → 允许复活（老流程不变）
  const tomb2 = CloudSync._tombstones(
    { deletedPhones: [], revivedPhones: ['13900000001'] },
    { phones: [], classes: [], revivedPhones: [] });
  ok(!tomb2.phones.has('13900000001'), '老师放行过的号码正常回到名单');

  // ③ down()：本机名单里还留着 47 个测试号，云端合并后必须被删掉
  const local = [
    { id: 'a1', name: '陈皓正-Yunus', phone: '13259532909', class: '少儿英语A班' },
    { id: 'j1', name: '小舟-Zoe', phone: '13900139300', class: '' },
    { id: 'j2', name: '测试-Test', phone: '13800138000', class: '少儿英语A班' },
    { id: 'j3', name: '田墨翰-Matt', phone: '11840843943', class: '' },
  ];
  const classes = ['少儿英语A班'];
  // 把 Cloud.loadAll 换成返回我们造的"云端 blob"
  const fakeCloud = {
    students: [{ id: 'a1', name: '陈皓正-Yunus', phone: '13259532909', class: '少儿英语A班' }],
    classes: ['少儿英语A班'],
    deletedPhones: ['13900139300', '13800138000', '11840843943'],
    revivedPhones: [],
  };
  (async () => {
    // 用真实 down()：Cloud.loadAll 走 sandbox 里的 fetch，这里换成返回 blob
    cloudFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify(fakeCloud),
      json: async () => fakeCloud,
    });
    try {
      const res = await CloudSync.down(local, classes, {
        tombstones: { phones: [], classes: [], revivedPhones: [] },
      });
      ok(res.ok === true, '云端下行成功');
    } catch (e) {
      ok(false, '云端下行成功', e.message);
    }
    ok(local.length === 1 && local[0].phone === '13259532909',
       '本机那 3 个测试号被删掉，只剩本班学生', local.map(s => s.name).join(','));
    ok(classes.length === 1, '班级列表不受影响');

    // ---------------------------------------------------------------------
    console.log('\n--- 4. 清拦截不再复活删除（源码约束）---');
    const dg = appSrc.slice(appSrc.indexOf('  async _dropGates(phones) {'), appSrc.indexOf('  async _dropGates(phones) {') + 1600);
    ok(/hasTombstonePhone\(p\)/.test(dg), '_dropGates 跳过带墓碑的号码（清拦截 ≠ 复活学生）');
    ok(!/for \(const p of list\) await Api\.untombstonePhone\(p\);/.test(dg), '不再无脑 untombstonePhone');

    console.log('');
    console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
    process.exit(failN === 0 ? 0 : 1);
  })();
}


