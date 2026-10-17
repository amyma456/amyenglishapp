/* eslint-disable */
// 一次性诊断脚本：用真 DOM（jsdom）把学生端每一屏渲染出来，逐屏检查
// 「底部前进按钮」到底是灰的（disabled）还是亮的（可点）。
//
// 目的：把「题没做完就能点下一题」的漏洞一次性全找出来，而不是靠读代码猜。
// 用法：
//   NODE_PATH=.../node_modules node tools/_gate-audit.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const R = path.join(__dirname, '..', 'public');
const dom = new JSDOM('<!doctype html><body><div id="content-area"></div><div id="tab-bar"></div></body>', {
  url: 'https://amyeng.top/', pretendToBeVisual: true,
});
const { window } = dom;
const document = window.document;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
Object.defineProperty(window.navigator, 'userAgent', { value: 'node', configurable: true });

// ---- 最小 stub ----
const noop = () => {};
const Api = new Proxy({}, {
  get(t, k) {
    if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
    if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
    if (k === 'cloudAvailable') return () => false;
    if (k === 'isFillerTranscript') return () => false;
    if (k === 'asrCanRetry') return () => true;
    // app.js 末尾会自己调 App.init()；让它卡在第一次云拉取上，
    // 免得异步初始化跑到一半来改写我们正在测的 DOM 和 state。
    if (k === 'load') return () => new Promise(() => {});
    if (k === 'classStatus') return () => Promise.resolve({ removed: false });
    if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push)/.test(k)) {
      return () => Promise.resolve({});
    }
    return noop;
  },
});
const Recorder = new Proxy({}, {
  get(t, k) {
    if (k === 'supported') return () => true;
    if (k === 'join') return () => null;
    if (k === 'padForAsr') return () => null;
    if (k === 'level') return () => 0;
    if (k === 'start' || k === 'stop') return () => Promise.resolve({ blob: {}, samples: null });
    return noop;
  },
});

const dataSrc = fs.readFileSync(path.join(R, 'data.js'), 'utf8');
const appSrcRaw = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
// app.js 末尾自带 `App.init();`，一装载就会去拉云端会话、注册学生，把
// 测试的 state 和 DOM 搅乱。门禁逻辑跟启动流程无关，这里只把它关掉。
const appSrc = appSrcRaw.replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');

const sandbox = {
  document, window, location: window.location, navigator: window.navigator,
  localStorage: window.localStorage, sessionStorage: window.sessionStorage,
  Api, Recorder, URL: window.URL, fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: window.Audio,
  alert: noop, confirm: () => true, prompt: () => '',
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  cancelAnimationFrame: clearTimeout,
  SpeechSynthesisUtterance: function () {},
  speechSynthesis: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop },
  MutationObserver: window.MutationObserver, IntersectionObserver: window.IntersectionObserver,
  setTimeout, clearTimeout, setInterval, clearInterval, console,
  indexedDB: undefined, performance, Blob: window.Blob, FormData: window.FormData,
  Intl, Date, Math, JSON, Promise, Object, Array, String, Number, Boolean, Error, RegExp,
};

let App, DATA;
try {
  const fn = new Function('g', `
    const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
            Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
            cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
            IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
            indexedDB, performance, Blob, FormData } = g;
    ${dataSrc}
    ${appSrc}
    return { App, HOMEWORK_DATA, HOMEWORK_WEEKS };
  `);
  const out = fn(sandbox);
  App = out.App;
  DATA = out.HOMEWORK_DATA;
} catch (e) {
  console.log('装载失败：' + e.stack.split('\n').slice(0, 4).join('\n'));
  process.exit(1);
}

App.speak = noop;
App.showToast = noop;
App._playCorrectSound = noop;
App._playWrongSound = noop;

const area = document.getElementById('content-area');

function btnState(mi) {
  const b = document.getElementById('stage-next-btn')
        || (mi !== undefined ? document.getElementById('stage-next-' + mi) : null);
  if (!b) return '(无按钮)';
  const label = (b.textContent || '').trim();
  return (b.disabled ? '🔒 禁用' : '🔓 可点') + ' 「' + label + '」';
}

App.state.role = 'student';
App.state.phone = '13800000000';
App.state.userName = '测试学生';
App.state.currentTab = 'today';
App.state.audioEnabled = true;

console.log('周库：' + (DATA ? DATA.length : '?') + ' 天\n');
let problems = 0;

for (let d = 0; d < DATA.length; d++) {
  const day = DATA[d];
  const steps = App._buildSteps(d);
  console.log('===== DAY ' + d + ' · ' + day.day_cn + ' · ' + day.theme_cn + ' · ' + steps.length + ' 屏 =====');
  App.state.currentDay = d;
  for (let i = 0; i < steps.length; i++) {
    App.state.stepIdx = i;
    App.state.answers = {};
    App._lockNextOnRender = false;
    let html = '';
    try { html = App.renderStage(d); } catch (e) { html = ''; console.log('  [' + i + '] 渲染异常 ' + steps[i].kind + ': ' + e.message); continue; }
    area.innerHTML = html;
    try { App._applyStepLock(); } catch (e) {}
    const st = steps[i];
    const tag = st.kind + (st.mi !== undefined ? '@m' + st.mi : '') + (st.qi !== undefined ? '.q' + st.qi : '') + (st.si !== undefined ? '.s' + st.si : '');
    const bs = btnState(st.mi);
    const bad = bs.indexOf('可点') === 0;
    if (bad) problems++;
    console.log('  [' + String(i).padStart(2) + '] ' + (bad ? '✗' : ' ') + ' ' + tag.padEnd(16) + ' → ' + bs);
  }
  console.log('');
}
console.log('未做任何题就能点的屏：' + problems + ' 屏');
