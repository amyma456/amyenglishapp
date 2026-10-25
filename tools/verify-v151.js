// v151 验证：
//  1) 打卡监控顶部的「数据来自后台」横幅：还没上传的名单只点名本班学生
//     （家长 2026-10-23：小舟-Zoe 这些已删除的测试号不许再出现）
//  2) 成绩分析 / 班级错题本的统计也只算本班学生
//  3) 版本号升到 151
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
const htmlSrc = fs.readFileSync(path.join(R, '..', 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(R, '..', 'public', 'sw.js'), 'utf8');

const noop = () => {};
function proxy(lenient) {
  return new Proxy({}, {
    get(t, k) {
      if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
      if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
      if (k === 'cloudAvailable') return () => false;
      if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push|flush)/.test(k)) {
        return lenient ? () => Promise.resolve({}) : noop;
      }
      return noop;
    },
  });
}

console.log('== 1. 「数据来自后台」横幅只点名本班 ==');
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
  App.state.classes = ['少儿英语A班'];
  App.state.className = '少儿英语A班';
  App.state.students = [
    { id: 'a1', name: '陈皓正-Yunus', phone: '13259532909', class: '少儿英语A班' },
    { id: 'a2', name: '张子皓-Harvey', phone: '15109549632', class: '少儿英语A班' },
    { id: 'j1', name: '小舟-Zoe', phone: '13900139300', class: '' },
    { id: 'j2', name: '小舟-Zoe', phone: '13900139210', class: '' },
    { id: 'j3', name: '测试-Test', phone: '13800138000', class: '' },
    { id: 'j4', name: '乐乐-Leo', phone: '13900139111', class: '' },
    { id: 'j5', name: '田墨翰-Matt', phone: '11840843943', class: '' },
  ];
  App.state.checkins = {};

  // Yunus 周一已从后台上传，Harvey 什么都没传
  const tag = App._weekTag();
  App.state.checkins['a1' + tag + '_d0'] = { done: true, fromCloud: true, at: '2026-10-23T09:33:00', time: '09:33', correctRate: 90 };

  const html = App._checkinSyncStrip();
  ok(/数据来自后台/.test(html), '横幅正常渲染');
  ok(/还没上传的 <b>1<\/b> 位/.test(html), '没上传的只点名 1 位（不是 5、6 个测试号）',
     (html.match(/还没上传的 <b>(\d+)<\/b>/) || [])[1]);
  ok(html.indexOf('张子皓-Harvey') >= 0, '点名名单里是本班的 Harvey');
  ok(html.indexOf('小舟-Zoe') < 0, '小舟-Zoe 不再出现');
  ok(html.indexOf('测试-Test') < 0, '测试-Test 不再出现');
  ok(html.indexOf('乐乐-Leo') < 0, '乐乐-Leo 不再出现');
  ok(html.indexOf('田墨翰-Matt') < 0, '田墨翰-Matt 不再出现');
  ok(/本周从后台收到 <b>1<\/b> 条/.test(html), '后台记录条数只按本班学生统计');

  // 全班都传过 → 显示「全班都已有记录」
  App.state.checkins['a2' + tag + '_d0'] = { done: true, fromCloud: true, at: '2026-10-23T08:00:00', time: '08:00', correctRate: 80 };
  const html2 = App._checkinSyncStrip();
  ok(/全班 2 位本周都已有记录/.test(html2), '本班 2 人都有记录时显示全班已齐（按本班人数算）');
}

console.log('\n== 2. 成绩分析 / 错题本也只算本班 ==');
{
  const rsStart = appSrc.indexOf('  renderScores() {');
  const rs = appSrc.slice(rsStart, appSrc.indexOf('  // ===== Teacher: Error Book', rsStart));
  ok(/_classRoster\(\)/.test(rs), '成绩分析的正确率统计走 _classRoster');
  ok(!/this\.state\.students\.forEach/.test(rs), '成绩分析不再遍历全部学生');

  const ebStart = appSrc.indexOf('  async renderErrorBook() {');
  const eb = appSrc.slice(ebStart, appSrc.indexOf('  // ===== Teacher: Error sheet', ebStart));
  ok(/_classRoster\(\)/.test(eb), '班级错题本只找本班学生的错题');
  ok(!/this\.state\.students\.forEach/.test(eb), '错题本不再遍历全部学生');

  const stripStart = appSrc.indexOf('  _checkinSyncStrip() {');
  const strip = appSrc.slice(stripStart, appSrc.indexOf('  async refreshCheckins', stripStart));
  ok(/_classRoster\(\)/.test(strip), '「还没上传的」点名走 _classRoster');
  ok(!/const students = this\.state\.students/.test(strip), '横幅不再用全量学生列表');
}

console.log('\n== 3. 版本号 = 151 ==');
{
  ok(/app-version" content="153"/.test(htmlSrc), 'index.html meta = 151');
  ok((htmlSrc.match(/\?v=153/g) || []).length >= 5, '脚本引用 ?v=153（' + (htmlSrc.match(/\?v=153/g) || []).length + ' 处）');
  ok(/amy-english-v153/.test(swSrc) && /var V = 153;/.test(swSrc), 'sw.js 缓存名与 V = 151（旧缓存整体作废）');
  ok(!/content="150"|amy-english-v150|\?v=150/.test(htmlSrc + swSrc), '没有残留 150 的引用');
}

console.log('');
console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
process.exit(failN === 0 ? 0 : 1);
