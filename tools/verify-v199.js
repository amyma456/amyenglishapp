/* ===========================================================================
 * v199 校验：老师端错题本 —— 谁做错了写在卡片第一行
 *   node tools/verify-v199.js
 *
 * 家长 2026-11-12：「英语打卡平台里头的错题本，老师端的错题本，答错题的
 *   同学的名字出现在题目的第一行，让老师能够第一眼看出来谁做错了，而不是
 *   最后一行需要去找。」
 *
 * 不只看代码文本：真把 data.js + api.js + app.js 跑起来，调 _errCard 和
 * renderErrorBook()，检查「姓名条」是不是整张卡的第一个元素、名字在不在这
 * 一行、末尾还有没有重复名单要翻。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const html = fs.readFileSync(BASE + 'index.html', 'utf8');
const sw = fs.readFileSync(BASE + 'sw.js', 'utf8');

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };

console.log('v199 · 老师端错题本：做错学生姓名在第一行 校验');

// ------------------------------------------------------- 把 App 真跑起来
const byId = {};
function mkEl(tag) {
  const e = { tagName: tag || 'div', style: {}, innerHTML: '', textContent: '',
    value: '', dataset: {}, _attrs: {} };
  e.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  e.setAttribute = (k, v) => { e._attrs[k] = v; };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.focus = () => {}; e.click = () => {};
  e.querySelector = () => null; e.querySelectorAll = () => []; e.closest = () => null;
  e.addEventListener = () => {}; e.insertAdjacentHTML = () => {}; e.scrollIntoView = () => {};
  e.play = () => Promise.resolve();
  return e;
}
const documentStub = {
  getElementById: id => (byId[id] = byId[id] || mkEl('div')),
  querySelector: () => null, querySelectorAll: () => [], createElement: mkEl,
  addEventListener: () => {}, body: mkEl('body'), documentElement: mkEl('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const mem = {};
const localStorageStub = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const windowStub = {
  addEventListener: () => {}, removeEventListener: () => {},
  location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  speechSynthesis: null,
};
const built = new Function('stubs', `
  const { document, window, location, navigator, localStorage, URL, fetch, Cloud,
          SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
  ${dataSrc}
  ${apiSrc}
  ${appSrc}
  return { App: App, HOMEWORK_DATA: HOMEWORK_DATA };
`)({
  document: documentStub, window: windowStub, location: windowStub.location,
  navigator: { userAgent: 'node', onLine: true, language: 'zh-CN' },
  localStorage: localStorageStub,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: () => '',
  requestAnimationFrame: cb => setTimeout(cb, 0),
});
const App = built.App;
const DATA = built.HOMEWORK_DATA;
process.on('unhandledRejection', () => {});

// 找一道真实的题（带选项）当样题
let sample = null;
for (let di = 0; di < DATA.length && !sample; di++) {
  for (let mi = 0; mi < (DATA[di].modules || []).length && !sample; mi++) {
    const m = DATA[di].modules[mi];
    if ((m.questions || []).length) sample = { di, mi, m, q: m.questions[0], day: DATA[di].day_cn };
  }
}
assert(sample, '题库里得有一道题');

const NAMES = ['陈皓正-Yunus', '张子皓-Harvey', '田墨翰-Matt'];
const e = { day: sample.day, module: sample.m.name_cn, m: sample.m, q: sample.q,
  dayIdx: sample.di, students: NAMES };
const card = App._errCard(e, 0);

// ------------------------------------------------------------ 卡片第一行
ok('姓名条就是整张错题卡的第一个元素（第一行）', () => {
  assert(/^<div class="error-item err-card"><div class="err-who"/.test(card),
    '卡片开头必须是 err-who，实际：' + card.slice(0, 120));
});
ok('姓名条排在出处标签、题干、选项、讲题提示之前', () => {
  const at = card.indexOf('class="err-who"');
  assert(at >= 0);
  ['err-head', 'err-stem', 'err-opts', 'err-why', '讲题提示'].forEach(k => {
    const p = card.indexOf(k);
    if (p >= 0) assert(at < p, '姓名条必须排在 "' + k + '" 前面');
  });
});
ok('第一行写清人数和全部做错学生的名字', () => {
  const line = card.slice(card.indexOf('class="err-who"'), card.indexOf('</div>', card.indexOf('class="err-who"')));
  assert(/做错学生/.test(line), '这一行要有「做错学生」');
  assert(/3 人/.test(line), '这一行要有 3 人');
  NAMES.forEach(n => assert(line.indexOf(n) >= 0, '第一行缺名字：' + n));
  assert(line.indexOf(NAMES.join('、')) >= 0, '姓名要连着列在这一行里');
});
ok('卡片末尾不再重复一份名单，不用往下翻着找', () => {
  assert(!/class="e-students"/.test(card), '末尾的 e-students 块还在');
  assert.strictEqual((card.match(/做错学生/g) || []).length, 1, '整张卡只出现一次名单');
  const at = card.indexOf('class="err-who"');
  assert(at < card.length / 2, '名单必须在卡片前半部分（第一行）');
});
ok('姓名条有醒目样式（红底 / 大字加粗 / 自动换行）', () => {
  const css = html.slice(html.indexOf('/* v199 · 谁做错了放在第一眼'), html.indexOf('.err-head{'));
  assert(/\.err-who\{[^}]*background:#FFF1F0/.test(css), '浅红底');
  assert(/\.err-who\{[^}]*flex-wrap:wrap/.test(css), '人多自动换行');
  assert(/\.err-who \.names\{[^}]*font-size:15px/.test(css) && /font-weight:700/.test(css), '名字大字加粗');
  assert(/\.err-who \.n\{/.test(css), '人数徽标');
});
ok('学生端「我的错题本」没有名单字段时，卡片结构照旧', () => {
  const mine = App._errCard({ day: sample.day, module: sample.m.name_cn, m: sample.m,
    q: sample.q, dayIdx: sample.di, picked: 'zzz', allowPractice: true }, 0);
  assert(!/err-who/.test(mine), '学生端不该冒出「做错学生」姓名条');
  assert(/^<div class="error-item err-card"><div class="err-head"/.test(mine),
    '学生端第一行仍是出处标签');
  assert(/err-stem/.test(mine) && /err-why/.test(mine), '题干和讲题提示都还在');
});

// ------------------------------------------------- 真跑整页「班级错题本」
(async () => {
  const students = [
    { id: 's1', name: NAMES[0], phone: '13800000001', class: '四年级', approved: true },
    { id: 's2', name: NAMES[1], phone: '13800000002', class: '四年级', approved: true },
    { id: 's3', name: NAMES[2], phone: '13800000003', class: '四年级', approved: true },
  ];
  App.state.students = students;
  App.state.classes = ['四年级'];
  App.state.className = '四年级';
  App.state.cloudWrongCache = {};
  App._classRoster = () => students;
  App._loadCloudWrongCache = async () => {};
  // 只有 s1 / s2 答错样题，s3 全对 —— 名单里应是 2 人、不含 s3
  App._lookupWrongAnswer = (sid, di, mi, qi) =>
    (di === sample.di && mi === sample.mi && qi === 0 && sid !== 's3')
      ? { correct: false, value: 'zzz' } : null;
  const page = await App.renderErrorBook();
  ok('老师端整页真的渲染出姓名条，且排在卡片其它内容之前', () => {
    assert(/class="err-who"/.test(page));
    assert(page.indexOf('class="err-who"') < page.indexOf('class="err-head"'));
    assert(!/class="e-students"/.test(page), '整页里也没有末尾重复名单');
  });
  ok('整页名单只写真正答错的那几个（2 人，不含全对的同学）', () => {
    const line = page.slice(page.indexOf('class="err-who"'), page.indexOf('</div>', page.indexOf('class="err-who"')));
    assert(/2 人/.test(line), '人数应是 2');
    assert(line.indexOf(NAMES[0]) >= 0 && line.indexOf(NAMES[1]) >= 0, '两个做错的名字都在');
    assert(line.indexOf(NAMES[2]) < 0, '全对的 Matt 不该出现在做错名单里');
  });
  ok('版本钉子统一到 v202', () => {
    assert(/name="app-version" content="205"/.test(html));
    assert.strictEqual((html.match(/\?v=205/g) || []).length, 7, '首页 7 处脚本引用');
    assert(/var CACHE_NAME = 'amy-english-v205';/.test(sw) && /var V = 205;/.test(sw));
  });
  console.log('\n全部 ' + pass + ' 项通过 ✅');
  process.exit(0);
})().catch(e => { console.error('\n❌ ' + (e && e.stack || e)); process.exit(1); });
