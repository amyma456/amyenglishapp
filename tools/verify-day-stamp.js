/* eslint-disable */
// 错题标签上的"具体日期"的校验（v116）。
//
// 家长的原话：「错题卷上没有具体的日期，只显示周几周几，要把具体的日期写上，
// 具体周几写上，方便跟踪。」
//
// 题库按自然周轮换（data.js 里 HOMEWORK_EPOCH = 第 1 周的周一 2026-09-28），
// 所以「第几周的第几天」能唯一换算成一个具体日期：
//     日期 = HOMEWORK_EPOCH + 本周序号 × 7 + 第几天
// 卷面标签从「[周一·语法]」变成「[2026-10-12 周一·语法]」，
// 老师端班级错题本、学生端我的错题本同样带上日期。
//
// 用法：node tools/verify-day-stamp.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub：只关心"生成的卷面长什么样"
// ---------------------------------------------------------------------------
const byId = {};
function mkEl(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), _attrs: {}, style: {},
    innerHTML: '', textContent: '', className: '', dataset: {}, value: '',
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    contains: c => e._cls.has(c),
    toggle: () => false,
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.querySelector = () => null;
  e.querySelectorAll = () => []; e.addEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.scrollIntoView = () => {};
  e.closest = () => null;
  return e;
}
const document = {
  getElementById: id => (byId[id] = byId[id] || mkEl('div')),
  querySelector: () => null, querySelectorAll: () => [],
  createElement: mkEl, addEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
  visibilityState: 'visible', readyState: 'complete', hidden: false,
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  location: { search: '', href: '', hash: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const Api = {
  warmup: () => {}, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
  getAllWrongQuestions: async () => [], load: async () => ({}),
  loadWrongCache: async () => {}, dict: async () => null,
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null, level: () => 0,
};
process.on('unhandledRejection', () => {});

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
const weeks = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const WEEK_FIRST_MONDAY = [2026, 8, 28];   // data.js 的锚点：2026-09-28（月份 0 基）

// 装载一次 app.js，注入指定的"第几周"。app.js 的 _weekDayYmd 靠全局
// HOMEWORK_EPOCH / HOMEWORK_WEEK_IDX，所以每次测换周都要重新装载。
function loadApp(weekIdx, noEpoch) {
  const wkData = weeks[Math.min(weekIdx, weeks.length - 1)];
  return new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, HOMEWORK_EPOCH, HOMEWORK_WEEK_IDX, URL, fetch, Cloud,
            SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
    ${src}
    return { App };
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA: wkData,
    HOMEWORK_EPOCH: noEpoch ? undefined : new Date(WEEK_FIRST_MONDAY[0], WEEK_FIRST_MONDAY[1], WEEK_FIRST_MONDAY[2]),
    HOMEWORK_WEEK_IDX: weekIdx,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
}

const App = loadApp(0);

// 2026-10-12 是周一 —— 用 Date 自己算，别信手推
function ymd(y, m, d) { const p = n => (n < 10 ? '0' : '') + n; return y + '-' + p(m) + '-' + p(d); }
function dow(y, m, d) { return new Date(y, m - 1, d).getDay(); }  // 1=周一
const DAY_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// ===========================================================================
console.log('\n=== 1. 第几天 → 具体日期：锚点 2026-09-28（周一）往后推 ===');
{
  const a0 = loadApp(0);
  ok(a0._weekDayYmd(0) === '2026-09-28', '第 1 周第 1 天 = 2026-09-28（题库锚点）');
  ok(a0._weekDayYmd(6) === '2026-10-04', '第 1 周第 7 天 = 2026-10-04（周日，一周七天不串）');
  ok(a0._weekDayYmd(1) === '2026-09-29', '第 1 周第 2 天 = 2026-09-29');

  const a2 = loadApp(2);
  ok(a2._weekDayYmd(0) === '2026-10-12', '第 3 周第 1 天 = 2026-10-12（今天 10-14 就在这一周）');
  ok(a2._weekDayYmd(2) === '2026-10-14', '第 3 周第 3 天 = 2026-10-14（就是今天）');

  const a3 = loadApp(3);
  ok(a3._weekDayYmd(0) === '2026-10-19', '第 4 周第 1 天 = 2026-10-19');
  ok(a3._weekDayYmd(6) === '2026-10-25', '第 4 周第 7 天 = 2026-10-25');

  // 每个日期都得跟题库写的 day_cn 是同一天
  let mix = [];
  [0, 1, 2, 3].forEach(wi => {
    const a = loadApp(wi);
    const wk = weeks[wi];
    for (let di = 0; di < 7; di++) {
      const got = a._weekDayYmd(di);
      const [y, m, d] = got.split('-').map(Number);
      if (DAY_CN[dow(y, m, d)] !== wk[di].day_cn) mix.push(wi + '/' + di + ' → ' + got + ' 是' + DAY_CN[dow(y, m, d)] + '，题库写的是' + wk[di].day_cn);
    }
  });
  ok(mix.length === 0, '4 周 × 7 天 = 28 个日期，算出来的星期几和题库里的 day_cn 全部对得上'
     + (mix.length ? '（错位：' + mix.join('；') + '）' : ''));
  ok(dow(2026, 9, 28) === 1, '顺带钉一下锚点本身：2026-09-28 确实是周一（不然整条推算都是歪的）');
}

// ===========================================================================
console.log('\n=== 2. 卷面标签格式：[2026-10-12 周一·语法] ===');
{
  const a2 = loadApp(2);
  ok(a2._dayTag('周一', '语法', 0) === '[2026-10-12 周一·语法]',
     '日期 + 周几 + 模块，中间空格分隔：' + a2._dayTag('周一', '语法', 0));
  ok(a2._dayTag('周三', '阅读理解', 2) === '[2026-10-14 周三·阅读理解]',
     '换一天也跟着换：' + a2._dayTag('周三', '阅读理解', 2));
  ok(/^\[\d{4}-\d{2}-\d{2} 周[一二三四五六日]·/.test(a2._dayTag('周五', '听力', 4)),
     '日期一律是 YYYY-MM-DD 补零格式，周几是"周一…周日"');
  ok(a2._dayTag('周一', '语法', 0).indexOf('undefined') < 0
     && a2._dayTag('周一', '语法', 0).indexOf('NaN') < 0, '不会冒出 undefined / NaN');

  // 拿不到周锚点时退回旧写法，且不能留下多余的空格
  const noEp = loadApp(2, true);
  ok(noEp._weekDayYmd(0) === '', '没有周锚点时不硬编一个日期出来');
  ok(noEp._dayTag('周一', '语法', 0) === '[周一·语法]',
     '兜底退回原来的 [周一·语法]，不出现"[ 周一"这种空格：' + noEp._dayTag('周一', '语法', 0));
}

// ===========================================================================
console.log('\n=== 3. 整张错题卷跑一遍：每道题都带具体日期 ===');
{
  const a2 = loadApp(2);
  a2.state.students = [{ id: 's1', name: '测试同学', phone: '13000000000' }];
  a2.state.answers = {};
  a2.state.cloudWrongCache = {};
  a2._loadCloudWrongCache = async () => {};
  // 每周挑两天各挑一道带空的题当"做错了"
  const want = {};
  const picks = [];
  [0, 2, 4].forEach(di => {
    const m = weeks[2][di].modules.find(x => (x.questions || []).length);
    want[Api.answerKey('s1', di, weeks[2][di].modules.indexOf(m), 0)] = { value: 'zzz', correct: false };
    picks.push({ di, m: weeks[2][di].modules.indexOf(m) });
  });
  a2._lookupWrongAnswer = (sid, di, mi, qi) => want[Api.answerKey(sid, di, mi, qi)] || null;

  a2.genErrorSheet('s1').then(() => {
    const sheet = byId['print-area'].innerHTML;
    ok(sheet.indexOf('a4-sheet') >= 0, '卷子生成了');
    const qLines = sheet.split('a4-q-num').slice(1).map(s => s.split('</div>')[0]);
    const stamped = qLines.filter(l => /\d{4}-\d{2}-\d{2} 周[一二三四五六日]·/.test(l));
    ok(stamped.length >= picks.length,
       qLines.length + ' 道题里有 ' + stamped.length + ' 道带了具体日期（至少 3 道错题都带）');
    ok(qLines.every(l => l.indexOf('周一·') < 0 || /\d{4}-\d{2}-\d{2} 周一·/.test(l)),
       '再没有"只写周几"的题目行了');
    // 抽样：第 3 周的周一题必须写 2026-10-12，周三题必须写 2026-10-14
    const byDay = { 0: '2026-10-12', 2: '2026-10-14', 4: '2026-10-16' };
    let bad = [];
    picks.forEach(p => {
      const want2 = byDay[p.di];
      const line = qLines.find(l => l.indexOf(want2) >= 0);
      if (!line) bad.push(weeks[2][p.di].day_cn + '（应写 ' + want2 + '）');
    });
    ok(bad.length === 0, '每个学习日的日期都对上了（周一→2026-10-12、周三→2026-10-14、周五→2026-10-16）'
       + (bad.length ? '：缺 ' + bad.join('、') : ''));
    ok(sheet.indexOf('a4-blank') >= 0, '上一版的横线改动没被碰坏');
    ok(sheet.indexOf('正确答案：') >= 0, '答案区照旧');
    checkOthers();
  }).catch(e => {
    ok(false, '生成卷子时抛异常：' + e.message);
    checkOthers();
  });

  function checkOthers() {
    // =======================================================================
    console.log('\n=== 4. 老师端班级错题本 / 学生端我的错题本，也都带上日期 ===');
    {
      const a = loadApp(2);
      // v151 起错题本只认本班学生（_classRoster），测试学生必须带班级
      a.state.classes = ['测试班'];
      a.state.className = '测试班';
      a.state.students = [{ id: 's1', name: '测试同学', phone: '13000000000', class: '测试班' }];
      a.state.answers = {};
      a.state.cloudWrongCache = {};
      a._loadCloudWrongCache = async () => {};
      const mi = weeks[2][2].modules.findIndex(x => (x.questions || []).length);
      const want = {};
      want[Api.answerKey('s1', 2, mi, 0)] = { value: 'zzz', correct: false };
      a._lookupWrongAnswer = (sid, di, m, qi) => want[Api.answerKey(sid, di, m, qi)] || null;

      a.renderErrorBook().then(h => {
        ok(h.indexOf('[2026-10-14 周三·') >= 0, '老师端班级错题本带上了具体日期（2026-10-14 周三）');
        ok(h.indexOf('做错学生') >= 0, '其它信息照旧');

        const b = loadApp(2);
        b._myStudentId = () => 's1';
        b.state.answers = {};
        b.state.answers[Api.answerKey('s1', 2, mi, 0)] = { value: 'zzz', correct: false };
        const h2 = b.renderMyErrors();
        ok(h2.indexOf('[2026-10-14 周三·') >= 0, '学生端我的错题本也带上了具体日期');
        ok(h2.indexOf('正确答案：') >= 0, '学生端的正确答案照旧');

        finalChecks();
      }).catch(e => {
        ok(false, '老师端错题本渲染抛异常：' + e.message);
        finalChecks();
      });
    }

    function finalChecks() {
      // =====================================================================
      console.log('\n=== 5. 静态检查：三处渲染都走新写法 ===');
      {
        const tags = src.match(/_dayTag\(/g) || [];
        ok(tags.length >= 4, '_dayTag 的定义 + 三处调用都在（实际出现 ' + tags.length + ' 次）');
        ok(/this\._dayTag\(e\.day, e\.module, e\.dayIdx\)/.test(src), '调用点传的是 dayIdx（才能定位到具体哪天）');
        ok(/errors\.push\(\{ day: day\.day_cn, module: m\.name_cn, q: q, type: m\.type, dayIdx: di \}\)/.test(src),
           '错题卷的错题条目里带上了 dayIdx');
        ok(/students: wrongStudents, dayIdx: di \}\)/.test(src), '老师端错题本的条目里带上了 dayIdx');
        ok(/errors\.push\(\{ day: day\.day_cn, module: m\.name_cn, q: q, dayIdx: di \}\)/.test(src),
           '学生端错题本的条目里带上了 dayIdx');
        ok(!/strong>' \+ e\.day \+ '·' \+ e\.module \+ '<\/strong>/.test(src),
           '原来"只写周几周几"的写法已经全部换掉了');
        ok(/HOMEWORK_EPOCH/.test(src) && /HOMEWORK_EPOCH/.test(dataSrc),
           'app.js 推算日期用的是 data.js 里的周锚点，不是另写一份');

        ok(/name="app-version" content="169"/.test(htmlSrc), '版本号升到 144');
        ok(/amy-english-v169/.test(swSrc), 'Service Worker 缓存名同步到 v144（不然手机上还是旧版）');
      }

      console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
      process.exit(fail ? 1 : 0);
    }
  }
}
