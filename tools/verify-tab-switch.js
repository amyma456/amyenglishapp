/* eslint-disable */
// 回归红线（v130）：点一下选项卡就要**立刻**切屏。
//
// 家长 2026-10-16 原话：「手机上打卡的时候，会有一个今日作业 / 孩子打卡 /
// 完成率对比 / 错题改错这几个选项卡。但是点的时候反应太慢了，再完成的精准
// 一些，一点就切换选项卡。」
//
// 病根在 switchTab：它在 renderContent() **之前** await 了一次云端拉取
// （_pullCloudCheckins），于是从手指落下到内容变样要等一整趟网络往返 ——
// 大陆手机数据下 300ms~2s。页签高亮瞬间变了、内容却停在上一屏，看起来就像
// 卡死；孩子会连点好几下。
//
// 这条测试钉四件事：
//   A. ★ 云端**没返回**之前，内容区就必须已经画好了（同步渲染，不等网络）。
//      这是整条红线的核心 —— 也是唯一能证明"一点就切"的断言。
//   B. 云端数据**真的变了** → 补渲染一次（否则老师永远看不到别人新打的卡）。
//   C. 云端数据**没变** → 不补渲染（白刷一遍会闪，比慢更难受）。
//   D. 拉的过程中用户已经切走了 → 旧数据的补渲染必须作废
//      （否则人站在新页上，被旧页的数据刷掉）。
//   E. CSS 层面：页签有按下态、去掉了 300ms 点击延迟。
//
// 用法：node tools/verify-tab-switch.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
const getEl = id => (byId[id] = byId[id] || el('div'));
const bodyEl = el('body');
bodyEl.children = [];
bodyEl.appendChild = (c) => { bodyEl.children.push(c); c.remove = () => bodyEl.removeChild(c); };
bodyEl.removeChild = (c) => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };
const document = {
  getElementById: id => {
    const kid = bodyEl.children.find(c => c.id === id);
    if (kid) return kid;
    return (byId[id] = byId[id] || el('div'));
  },
  querySelector: () => null, querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: bodyEl, documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
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
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

// ---------- 云端替身：拉取要能被**手动卡住** ----------
// 这是整条测试的关键：要证明"网络还没回来，屏幕就已经换了"，
// 就必须有一个能停在半空中的 fetchCheckins。
let pendingFetch = null;
let fetchCalls = 0;
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: (t) => !t,
  saveAnswer: async () => ({ recorded: true }), saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}), submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({}), dict: async () => null,
  transcribe: async () => ({ text: 'x' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
  getSpeakingRecords: async () => [], getRecordings: async () => [],
  // 挂起，直到测试自己 resolve
  fetchCheckins: () => {
    fetchCalls++;
    return new Promise(resolve => { pendingFetch = resolve; });
  },
};

const Recorder = {
  supported: () => true, warmUp: () => {},
  start: async () => ({}), stop: async () => ({ blob: { size: 1 }, samples: null }),
  join: () => null, padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS };')();

process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA: scope.WEEKS[0],
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

App.state.phone = '13800000000';
App.state.role = 'student';
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test', class: 'A班', approved: true }];
App.state.className = 'A班';
App.state.currentDay = 0;
App.isTeacher = () => false;
App.speak = function (t, o) { if (o && o.onDone) o.onDone(); };

// 数一下 renderContent 被调了几次（补渲染的判据）
const area = getEl('content-area');
let renders = 0;
const origRender = App.renderContent.bind(App);
App.renderContent = function () { renders++; return origRender(); };

(async function main() {
  // =====================================================================
  console.log('== A) ★ 网络没回来之前，内容区就必须已经画好了 ==');
  {
    // 先落到一个已知页，再切到「孩子打卡」
    App.state.currentTab = 'today';
    App._tabPainted = false;                 // 模拟"应用刚起来"
    renders = 0;
    pendingFetch = null;
    fetchCalls = 0;

    let settled = false;
    const p = App.switchTab('myprogress').then(() => { settled = true; });

    // 关键：**一个 tick 都不等网络**，此刻就该已经画完。
    // （switchTab 仍然是 async 函数，它的同步段跑完后 promise 要等一个 microtask
    //   才 resolve —— 所以这里不能断言 settled，要看"画没画"。）
    ok(area.innerHTML.length > 0,
       '切完的一瞬间内容区就非空了（不是空白等着）');
    ok(renders >= 1,
       '★ renderContent 已经跑过（同步渲染，没被 await 卡在后面）');
    ok(App.state.currentTab === 'myprogress', 'currentTab 已经指向新页签');
    ok(settled === false,
       '★ 网络还挂着、promise 也还没 resolve —— 渲染确实发生在网络之前');

    // 网络这时候才回来
    if (pendingFetch) pendingFetch([]);
    await p;
    ok(settled === true, '网络回来之后 switchTab 正常收尾');
    await sleep(20);
  }

  // =====================================================================
  console.log('\n== B) 云端数据【变了】→ 必须补渲染一次 ==');
  {
    App.state.checkins = {};
    App._tabPainted = false;
    renders = 0;
    pendingFetch = null;
    fetchCalls = 0;

    const p = App.switchTab('compare');
    const afterFirst = renders;
    ok(afterFirst >= 1, '第一遍（本机数据）已渲染');
    ok(fetchCalls === 1, '同时发出了云端拉取（并行，不在渲染前面）');

    // 云端回来一条真实打卡
    ok(!!pendingFetch, '拉取已发出并挂起中');
    pendingFetch([{ student_id: 'stu1', student_name: 'test', student_class: 'A班',
                    day_idx: 0, done: true, answered: 10, total: 10,
                    correct_rate: 90, wrong_count: 1, finish_time: '19:30' }]);
    await p;
    await sleep(30);

    ok(renders > afterFirst,
       '★ 数据真的变了 → 补渲染了一次（老师才看得到别人新打的卡）');
    ok(!!App.state.checkins['stu1_d0'],
       '云端那条确实并进了 state.checkins');
  }

  // =====================================================================
  console.log('\n== C) 云端数据【没变】→ 不许白刷（会闪） ==');
  {
    // 上一条已经并进去了；这次云端再给一模一样的一条
    App._tabPainted = false;
    renders = 0;
    pendingFetch = null;

    const p = App.switchTab('compare');
    const afterFirst = renders;
    pendingFetch([{ student_id: 'stu1', student_name: 'test', student_class: 'A班',
                    day_idx: 0, done: true, answered: 10, total: 10,
                    correct_rate: 90, wrong_count: 1, finish_time: '19:30' }]);
    await p;
    await sleep(30);

    ok(renders === afterFirst,
       '★ 一条都没变 → 不补渲染（屏幕上不会闪一下）');
  }

  // =====================================================================
  console.log('\n== D) 拉取途中用户已经切走 → 旧数据的补渲染必须作废 ==');
  {
    App._tabPainted = false;
    renders = 0;
    pendingFetch = null;

    const p1 = App.switchTab('compare');
    const stale = pendingFetch;              // 这一趟的 resolve 握在手里
    // 还没回来，人就切到别处了
    App._tabPainted = false;
    const p2 = App.switchTab('today');
    const afterSecond = renders;

    // 现在那条**过期的**响应才回来
    stale([{ student_id: 'stu1', student_name: 'test', student_class: 'A班',
             day_idx: 1, done: true, answered: 5, total: 5, correct_rate: 100,
             wrong_count: 0, finish_time: '20:00' }]);
    await p1; await p2;
    await sleep(30);

    ok(App.state.currentTab === 'today', '人站在「今日作业」上，没被拽回去');
    ok(renders === afterSecond,
       '★ 过期响应没有触发补渲染（新页面不会被旧数据刷掉）');
  }

  // =====================================================================
  console.log('\n== E) 连点同一个页签：不重复重画（免得滚动条被顶回去） ==');
  {
    App.state.currentTab = 'today';
    App._tabPainted = true;
    renders = 0;
    await App.switchTab('today');
    await sleep(20);
    ok(renders === 0, '★ 已经是这一页 → 连点不再重画');
  }

  // =====================================================================
  console.log('\n== F) CSS：页签一碰就有反应 ==');
  {
    const html = fs.readFileSync(BASE + 'index.html', 'utf8');
    const flat = html.replace(/\s*\n\s*/g, '');

    const rule = (sel) => {
      const i = flat.indexOf(sel);
      if (i < 0) return null;
      const j = flat.indexOf('{', i);
      const k = flat.indexOf('}', j);
      return (j < 0 || k < 0) ? null : flat.slice(j + 1, k);
    };

    const btn = rule('.nav-tabs button{');
    ok(btn !== null, '找到了 .nav-tabs button 规则');
    ok(/touch-action:manipulation/.test(btn || ''),
       '★ touch-action:manipulation —— 去掉手机上那 300ms 的"等双击"延迟');
    ok(/-webkit-tap-highlight-color:transparent/.test(btn || ''),
       '关掉系统蓝框（会盖住我们自己的按下态，看起来像没反应）');
    ok(/user-select:none/.test(btn || ''),
       '页签文字不能被选中（长按弹复制菜单同样会吃掉点击）');

    const act = rule('.nav-tabs button:active{');
    ok(act !== null && /background:/.test(act),
       '★ 有 :active 按下态 —— 手指一落就有色，不等 JS 跑完');
    ok(/transition:none/.test(act || ''),
       '按下态不过渡（过渡会让反馈"慢半拍"）');
  }

  console.log('\n' + (fail === 0 ? '全部通过 ✅' : (fail + ' 项没通过 ❌')));
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('  !! 测试自身崩了：' + (e && e.stack || e)); process.exit(1); });
