/* eslint-disable */
// v143 的四件事，逐条钉死：
//   ① 登录：本机有凭据 → 开屏直进，登录页永不出现（index.html 的开屏脚本）
//   ② 周日不再同时出现「阅读理解 + 完形填空」
//   ③ 刷新冲不掉读错的词（判分台账，错词只增不减）
//   ④ 点词查义：felt 要说明是 feel 的过去式；giving up 要整体连成一个短语
//
// 用法：node tools/verify-v143.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// 带记忆的 localStorage —— 台账要真的跨"刷新"存活，桩必须能存。
function makeStorage() {
  const map = {};
  return {
    _map: map,
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
    setItem: function (k, v) { map[k] = String(v); },
    removeItem: function (k) { delete map[k]; },
  };
}

function loadApp(storage) {
  const noop = function () {};
  const fakeEl = {
    style: {}, classList: { add: noop, remove: noop, contains: function () { return false; }, toggle: noop },
    innerHTML: '', textContent: '', setAttribute: noop,
    getAttribute: function () { return null; },
    addEventListener: noop, appendChild: noop,
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    closest: function () { return null; },
  };
  const doc = {
    cookie: '',
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: noop,
    createElement: function () { return Object.assign({}, fakeEl); },
    body: fakeEl,
  };
  const sandbox = {
    console: console,
    document: doc,
    window: { addEventListener: noop, speechSynthesis: null, document: doc },
    navigator: { mediaDevices: null, userAgent: 'node' },
    localStorage: storage,
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    fetch: function () { return Promise.resolve({ ok: false, status: 500, json: function () { return {}; } }); },
    Audio: function () { return { play: noop, pause: noop }; },
    URL: URL, Blob: function () {}, Date: Date, Math: Math, JSON: JSON,
    encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    atob: atob, btoa: btoa, Promise: Promise, Object: Object, Array: Array, String: String, Number: Number,
    Recorder: { TARGET_RATE: 16000, padForAsr: function () { return 'B'; }, warmUp: noop },
    requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
  };
  sandbox.window.document = doc;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  // api.js 先跑：WordHelp 在里面（同一 realm 的顶层 const，app.js 能直接用）
  const apiSrc = fs.readFileSync(path.join(__dirname, '../public/api.js'), 'utf8');
  vm.runInContext(apiSrc + '\n;globalThis.__Api = Api; globalThis.__WH = WordHelp;', sandbox, { filename: 'api.js' });

  let src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  vm.runInContext(src + '\n;globalThis.__App = App;', sandbox, { filename: 'app.js' });
  return { App: sandbox.__App, Api: sandbox.__Api, WordHelp: sandbox.__WH, sandbox: sandbox };
}

const storage = makeStorage();
const loaded = loadApp(storage);
const App = loaded.App;
const WordHelp = loaded.WordHelp;
App.state.phone = '13800000000';
App.state.students = [];

console.log('\n1. 登录：本机有凭据就直进（开屏脚本 + 自动登录不等网络）');
{
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  ok('index.html 有开屏层', /id="boot-splash"/.test(html));
  ok('开屏层在登录页之前（首帧就盖住）',
    html.indexOf('id="boot-splash"') < html.indexOf('id="login-page"'));
  ok('解析期同步读凭据（不依赖 defer 脚本）',
    /localStorage\.getItem\('amy_saved_login'\)/.test(html));
  ok('有凭据时先把登录页藏起来', /lp\.classList\.add\('hidden'\)/.test(html));
  ok('有 8 秒兜底，不会白屏卡死', /8000/.test(html) && /boot-splash/.test(html));
  const appSrc = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  ok('showApp 负责摘掉开屏', /function[\s\S]{0,120}?boot-splash/.test(appSrc) ||
    /getElementById\('boot-splash'\)[\s\S]{0,80}?removeChild/.test(appSrc));
  ok('自动登录不再等 Promise 拿凭据', /__bootSavedLogin/.test(appSrc));
  ok('登录按钮上不再写「正在核对…」', !/gateBtn\.innerHTML = '⏳ 正在核对/.test(appSrc));
  ok('init 先同步读数据再自动登录', /loadDataSync\(\)[\s\S]{0,600}?tryAutoLogin\(\)/.test(appSrc));
}

console.log('\n2. 周日不再同时出现阅读理解 + 完形填空');
{
  const dataSrc = fs.readFileSync(path.join(__dirname, '../public/data.js'), 'utf8');
  const fn = new Function(dataSrc + '\n;return { HOMEWORK_WEEKS: HOMEWORK_WEEKS };');
  const weeks = fn().HOMEWORK_WEEKS;
  let bad = [];
  weeks.forEach(function (week, wi) {
    (week || []).forEach(function (day, di) {
      if (!day || !Array.isArray(day.modules)) return;
      const types = day.modules.map(function (m) { return m.type; });
      const hasR = types.indexOf('reading') >= 0;
      const hasC = types.indexOf('cloze') >= 0;
      if (hasR && hasC) bad.push('W' + (wi + 1) + 'D' + di);
      if (types.filter(function (x) { return x === 'reading'; }).length > 1) bad.push('dup-reading W' + (wi + 1) + 'D' + di);
    });
  });
  ok('没有任何一天同时有 reading + cloze', bad.length === 0, bad.join(','));
  const sun = weeks[0][6].modules.map(function (m) { return m.type; });
  ok('周日保留完形填空、去掉阅读理解', sun.indexOf('cloze') >= 0 && sun.indexOf('reading') < 0, sun.join(','));
}

console.log('\n3. 刷新冲不掉读错的词（判分台账）');
{
  const D = 3, MI = 1, QI = 0;
  ok('一开始没有记录', App.readLedgerGet(MI, QI, D) === null);
  App.readLedgerSave(MI, QI, D, { pass: false, score: 48, bad: ['felt', 'up'] });
  let rec = App.readLedgerGet(MI, QI, D);
  ok('读错后记下了红词', rec && rec.bad.indexOf('felt') >= 0 && rec.score === 48, JSON.stringify(rec));

  // "刷新一次、又读一遍还是错（但这次识别成别的词）" —— 旧错词不能丢
  App.readLedgerSave(MI, QI, D, { pass: false, score: 72, bad: ['feeling'] });
  rec = App.readLedgerGet(MI, QI, D);
  ok('再读一遍错了 → 旧错词还在', rec.bad.indexOf('felt') >= 0, JSON.stringify(rec.bad));
  ok('新错词也进来了', rec.bad.indexOf('feeling') >= 0, JSON.stringify(rec.bad));
  ok('分数只会更低，不会因为刷新变好', rec.score === 48, 'score=' + rec.score);

  // 假"通过"（识别端没回话那种）不允许清零：pass=false 时哪怕 bad 为空
  App.readLedgerSave(MI, QI, D, { pass: false, score: 90, bad: [] });
  rec = App.readLedgerGet(MI, QI, D);
  ok('空 bad 的"低分轮"不能把错词冲掉', rec.bad.length >= 2, JSON.stringify(rec.bad));
  ok('分数仍取历史最低', rec.score === 48, 'score=' + rec.score);

  // 真的读对了 → 清零（唯一清零路径）
  App.readLedgerSave(MI, QI, D, { pass: true, score: 100, bad: [] });
  rec = App.readLedgerGet(MI, QI, D);
  ok('真读对了才清零', rec && rec.pass === true && rec.bad.length === 0, JSON.stringify(rec));

  // 台账要真的写进 localStorage（刷新后读得到）
  ok('台账落在 localStorage 里', !!storage._map['amy_read_ledger_v1']);
  const reloaded = loadApp(storage);
  reloaded.App.state.phone = '13800000000';
  ok('换一个 App 实例（=刷新页面）仍读得到', !!reloaded.App.readLedgerGet(MI, QI, D));
}

console.log('\n4. "偷懒"混不过去：本地出声判定的门槛');
{
  const rate = 16000;
  function clip(peak, sec, len) {
    const n = len || rate * 3;
    const s = new Float32Array(n);
    const voicedN = Math.round(sec * rate);
    for (let i = 0; i < voicedN && i < n; i++) s[i] = peak;
    return { samples: s, peak: peak };
  }
  ok('一声轻响（峰值 0.03）不算读过', App._voiceOk(clip(0.03, 1.0)) === false);
  ok('时间太短（0.3 秒）不算读过', App._voiceOk(clip(0.2, 0.3)) === false);
  ok('正常说话（峰值 0.15，1.2 秒）算读过', App._voiceOk(clip(0.15, 1.2)) === true);
  ok('整句门槛随词数抬高', App._minVoiceSec('I give up') < App._minVoiceSec('I never give up trying to help my friends'));
  ok('短句门槛至少 0.5 秒', App._minVoiceSec('Hi') >= 0.5);
  ok('长句门槛不超过 2.5 秒', App._minVoiceSec(Array(60).join('word ')) <= 2.5);
}

console.log('\n5. 点词查义：词形变化 + 固定搭配');
{
  const inf = WordHelp.inflectionOf('felt');
  ok('felt 认得出是 feel 的过去式', inf && inf.base === 'feel' && inf.labels.indexOf('过去式') >= 0, JSON.stringify(inf));
  ok('felt 同时是过去分词', inf && inf.labels.indexOf('过去分词') >= 0, JSON.stringify(inf && inf.labels));
  ok('went → go', (WordHelp.inflectionOf('went') || {}).base === 'go');
  ok('children → child（复数）', (WordHelp.inflectionOf('children') || {}).base === 'child');
  ok('better → good（比较级）', (WordHelp.inflectionOf('better') || {}).base === 'good');
  const forms = WordHelp.formsOf('feel').map(function (f) { return f.word; });
  ok('点 feel 能列出 felt / feeling / feels / will feel',
    forms.indexOf('felt') >= 0 && forms.indexOf('feeling') >= 0 && forms.indexOf('feels') >= 0
    && forms.indexOf('will feel') >= 0, forms.join(','));
  ok('不会把 look 写成 lookked', WordHelp.formsOf('look').every(function (f) { return f.word.indexOf('lookk') < 0; }),
    JSON.stringify(WordHelp.formsOf('look')));

  const ph = WordHelp.phraseInfo('giving up');
  ok('giving up 认得是 give up 的固定搭配', ph && ph.en === 'give up', JSON.stringify(ph));
  ok('gave up 也认得', (WordHelp.phraseInfo('gave up') || {}).en === 'give up');
  ok('look after 认得', (WordHelp.phraseInfo('look after') || {}).en === 'look after');

  // 渲染：两个词必须合成一个盒子（孩子点哪一半都是查这个短语）
  const html = App._readSentenceHtml('He never gave up.');
  ok('句子里 gave up 合成一个短语盒子', /class="rd-w lk-word lk-phrase"[^>]*data-phrase="give up"/.test(html), html);
  ok('短语盒子的 data-n 是 2（逐词判分不会错位）', /data-phrase="give up"/.test(html) &&
    /data-n="2"[^>]*data-phrase="give up"|data-phrase="give up"[^>]*data-n="2"/.test(html), html);
  ok('不是短语的词还是单独一个盒子', /<span class="rd-w" data-w="0"/.test(html), html);

  const spans = App._wordSpans('Never give up and look after her.');
  ok('范文/课文里 give up 也连成一体', /lk-phrase" data-phrase="give up"/.test(spans), spans);
  ok('范文里 look after 也连成一体', /lk-phrase" data-phrase="look after"/.test(spans), spans);
  ok('短语里的词不再各自一个盒子', (spans.match(/lk-phrase/g) || []).length === 2, spans);
}

console.log('\n6. 弹层真的会写上「谁的过去式」');
{
  const src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  ok('弹层里有 note 行（词形 / 短语说明）', /ws-note/.test(src));
  ok('弹层里有 forms 行（各种变化）', /ws-forms/.test(src));
  ok('变形词优先用原型的中文意思', /baseZh \|\| \(info && info\.zh\)/.test(src));
  ok('短语整体读、整体解释', /WordHelp\.phraseInfo\(word\)/.test(src));
}

console.log('\n----------------------------------------');
console.log((fail === 0 ? '全部通过' : '有失败项') + '：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail === 0 ? 0 : 1);
