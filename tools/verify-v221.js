/* eslint-disable */
// v226 校验：Harvey 平板 2026-11-21 卡在「第 19 题」的修复。
//
// 根因：今天（WEEK8 周六）第 19 题 = 阅读理解逐句翻译第 3 句
// 「在那里，海水用非常大的重量压着潜水器，就像一头大象站在一张小桌上。」
// 这一屏 _lockNextOnRender=true，底部「下一句」只有 _gateStep(score>=60)
// 才亮。长比喻句的 LCS 覆盖率天然偏低，孩子反复说也过不了 60 分；
// 完形填空那套逐句翻译早就有 soft(40~60) 放行，阅读理解这套却没有，
// 于是整天的打卡停在一屏上，刷新回来还是它。
//
// 三道修复（都不改第一次的作答要求）：
//   ① 阅读理解逐句翻译与完形填空统一三档口径，soft 放行；
//   ② 同一屏连续两次判分不通过 → 自动放行，设备/识别问题不算孩子的账；
//
// v226 家长要求：学生端不再出现「这道题不做了 / 过」这类话，零跳过出口；
// 老师预览仍保留「跳过本题（老师）」用于快速翻题。
//
// 用法：node tools/verify-v221.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public') + path.sep;
const htmlSrc = fs.readFileSync(PUB + 'index.html', 'utf8');
const appSrc = fs.readFileSync(PUB + 'app.js', 'utf8');
const swSrc = fs.readFileSync(PUB + 'sw.js', 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg + (extra && !cond ? '  → ' + extra : ''));
  cond ? pass++ : fail++;
};
const section = (t) => console.log('\n' + t);

section('[1] 版本号 226 四处一致（平板必须拿到新代码）');
{
  const ver = (htmlSrc.match(/name="app-version" content="(\d+)"/) || [])[1];
  ok(Number(ver) === 226, 'app-version = 226（当前 ' + ver + '）');
  const pins = htmlSrc.match(/\.js\?v=(\d+)/g) || [];
  ok(pins.length >= 10 && pins.every(x => x === '.js?v=226'),
    '全部 10 个脚本钉子都是 ?v=226', pins.join(','));
  ok((htmlSrc.match(/href="[^"]+\?v=226"/g) || []).length === 3,
    '3 个 preload 也跟到 226');
  ok(/var CACHE_NAME = 'amy-english-v226';/.test(swSrc) && /var V = 226;/.test(swSrc),
    'sw CACHE_NAME / V = 226');
  ok(!/\.js\?v=220|amy-english-v220\b/.test(htmlSrc + swSrc), '没有 220 残留');
}

section('[2] 逐句翻译不再「不到 60 分就永远锁死」');
{
  const at = appSrc.indexOf('_translateSentence(ev, mi, si)');
  const body = appSrc.slice(at, at + 7000);
  ok(/self\._transBand\(heard \? r\.score : 0, !!heard\)/.test(body),
    '阅读理解逐句翻译改用三档 band 判定');
  ok(/band !== 'hard'/.test(body), 'soft（40~60 分，意思差一点）放行');
  ok(/self\._trFail\[failKey\] >= 2/.test(body), '同一句连续两次不通过自动放行');
  ok(/voiceOk \? true/.test(body), '出声了但识别端没回话仍放行（v148 不破）');
  // 完形填空那套本来就是 soft 放行，别被改坏
  ok(/const passed = voiceOk \? true : \(!canScore \? !!heard : \(band !== 'hard'\)\);/.test(appSrc),
    '完形填空逐句翻译的既有口径没被破坏');
}

section('[3] 全局防卡死：连续两次不过 → 解锁「下一题」');
{
  ok(/_gateFail\[key\] >= 2/.test(appSrc), '_gateStep 有连续失败兜底');
  ok(/delete this\._gateFail\[key\]/.test(appSrc), '通过时清掉失败计数');
  ok(!/st-stuck-btn|_bailStep|这题做不了/.test(appSrc),
    '★ 学生端「这题做不了？先跳过」按钮及入口已彻底删除');
  ok(/id="pv-skip-btn"/.test(appSrc)
    && /isTeacher\(\) && this\.state\.currentTab === 'preview'/.test(appSrc),
    '★ v226：老师预览有跳过键，且严格限定 isTeacher + preview（学生端看不到）');
  ok(/lockNextOnRender/.test(appSrc) && /stage-next-btn/.test(appSrc),
    '锁定屏仍由「下一题」按钮的 disabled 控制，必须做完才能走');
}

section('[4] 真跑沙箱：卡两次能过、学生端跳过入口仍为零');
{
  let src = appSrc;
  const bootAt = src.lastIndexOf('App.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  const noop = function () {};
  const mkEl = function (id) {
    return {
      id: id, textContent: '', innerHTML: '', value: '', style: {}, disabled: false,
      classList: { add: noop, remove: noop, toggle: noop, contains: function () { return false; } },
      addEventListener: noop, removeEventListener: noop, setAttribute: noop,
      getAttribute: function () { return null; }, appendChild: noop,
      querySelector: function () { return null; }, querySelectorAll: function () { return []; },
      insertAdjacentHTML: noop, offsetLeft: 0, offsetWidth: 60, scrollLeft: 0,
      clientWidth: 360, scrollHeight: 0, clientHeight: 0,
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
    localStorage: { getItem: function () { return null; }, setItem: noop, removeItem: noop },
    sessionStorage: { getItem: function () { return null; }, setItem: noop, removeItem: noop },
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
    App.state.currentDay = 5;
    App.state.stepIdx = 14;          // 今天第 19 题所在的步骤
    App.showToast = noop;
    const btn = getEl('stage-next-btn');
    btn.disabled = true;
    const first = App._gateStep(0, false);
    ok(first === false && btn.disabled === true, '第一次没过：仍按老规矩锁着');
    const second = App._gateStep(0, false);
    ok(second === true && btn.disabled === false, '第二次没过：自动放行，不再锁死');
    // 通过一次要清计数
    App._gateStep(App.PASS_SCORE, true);
    ok(!App._gateFail['5:14'], '下一次通过会清掉失败计数');

    // v226：跳过函数已不存在，孩子不能再靠额外出口翻页
    ok(typeof App._bailStep !== 'function', '★ 沙箱里 _bailStep 已不存在');
  }
}

console.log('\nv226: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
