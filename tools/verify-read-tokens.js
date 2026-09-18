/* eslint-disable */
// 一次性校验脚本：验证 _readTokens 的显示片段和 alignSpeech 用的 _tokens
// 在顺序与数量上完全一致。错位的话，孩子读对的词会被标红，功能就废了。
//
// 做法：把 app.js 原样加载进来（只 stub 掉 document/window 之类的浏览器
// 环境，并砍掉结尾的启动调用），这样测的就是线上真正会跑的那份代码。
//
// 用法：node .workbuddy-test-tokens.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const dir = __dirname;
const appSrc = fs.readFileSync(path.join(dir, '../public/app.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(dir, '../public/data.js'), 'utf8');

// 砍掉结尾的启动代码（App.init / _initWordLookup / 语音预热），只保留定义。
let body = appSrc;
const bootAt = body.lastIndexOf('\n// Init\nApp.init();');
if (bootAt > 0) body = body.slice(0, bootAt);

// 够用的浏览器 stub：app.js 在"定义阶段"只碰这几个全局。
const noop = function() {};
const fakeEl = {
  style: {}, classList: { add: noop, remove: noop, contains: function() { return false; } },
  innerHTML: '', textContent: '', setAttribute: noop, getAttribute: function() { return null; },
  addEventListener: noop, appendChild: noop, querySelector: function() { return null; },
  querySelectorAll: function() { return []; }, closest: function() { return null; },
};
const sandbox = {
  console: console,
  document: {
    getElementById: function() { return null; },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    addEventListener: noop,
    createElement: function() { return Object.assign({}, fakeEl); },
    body: fakeEl,
  },
  window: { addEventListener: noop, speechSynthesis: null },
  navigator: { mediaDevices: null, userAgent: 'node' },
  localStorage: { getItem: function() { return null; }, setItem: noop, removeItem: noop },
  location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
  setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
  fetch: function() { return Promise.resolve({ ok: false, status: 500 }); },
  Audio: function() { return { play: noop, pause: noop }; },
  URL: URL, Blob: function() {}, Date: Date, Math: Math, JSON: JSON,
  encodeURIComponent: encodeURIComponent, atob: atob, btoa: btoa,
};
sandbox.window.document = sandbox.document;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.location = sandbox.location;
sandbox.globalThis = sandbox;

const ctx = vm.createContext(sandbox);
// app.js 顶层用的是 const App，够不到 sandbox 上；显式导出一次。
vm.runInContext(body + '\n;globalThis.__App = App;', ctx, { filename: 'app.js' });
const App = sandbox.__App;
if (!App || typeof App._readTokens !== 'function') throw new Error('App 没加载起来');

// ---- 1. 令牌一致性：逐个显示片段拼起来的归一化词 == 整句的归一化词 --------
const cases = [
  'I go to school.',
  'She is playing the piano in the music room.',
  "Don't worry, I can help you.",
  'There are 21 students in our class.',
  'The cinema is next to the bank.',
  'What is 3D printing?',
  'KET: Choose the correct answer. I ___ to school.',
  'He said: "Hello!"',
];

let fail = 0;
console.log('--- 1. 分词一致性 ---');
cases.forEach(function(s) {
  const whole = App._tokens(s);
  const t = App._readTokens(s);
  // 真正的不变量只有一条：逐个显示片段拼出来的归一化词，必须和整句
  // 归一化后的词，逐个一一对应。顺序或数量错了，上色就会整体错位。
  const same = whole.length === t.words.length
    && whole.every(function(w, i) { return w === t.words[i]; });
  if (!same) {
    fail++;
    console.log('FAIL  ' + JSON.stringify(s));
    console.log('  whole   :', JSON.stringify(whole));
    console.log('  display :', JSON.stringify(t.words));
  } else {
    console.log('ok    ' + JSON.stringify(s) + '  -> ' + whole.length + ' 个归一化词，'
      + t.wordCount + ' 个可点词');
  }
});

// ---- 2. 逐词标记：用和 _markReadProgress 相同的映射走一遍 -----------------
console.log('\n--- 2. 逐词标记 ---');
const sentence = 'She is playing the piano.';
const t2 = App._readTokens(sentence);

function mark(spoken) {
  const a = App.alignSpeech(sentence, spoken);
  const targets = a.items.filter(function(x) { return x.target; });
  let k = 0;
  const out = [];
  t2.display.forEach(function(d) {
    if (!d.word) return;
    let bad = 0;
    for (let i = 0; i < d.n; i++) {
      const it = targets[k++];
      if (!it) break;
      if (it.status !== 'ok') bad++;
    }
    out.push(d.text + (bad ? ':红' : ':绿'));
  });
  return out.join(' ');
}

const full = mark('she is playing the piano');
console.log('全读对      :', full, '| 分数', App.alignSpeech(sentence, 'she is playing the piano').score);
if (full.indexOf('红') >= 0) { fail++; console.log('  FAIL 全读对却标红了'); }

const miss = mark('she is the piano');
console.log('漏读 playing:', miss, '| 分数', App.alignSpeech(sentence, 'she is the piano').score);
if (miss.indexOf('playing:红') < 0) { fail++; console.log('  FAIL 漏读的词没标红'); }
if (miss.indexOf('piano:绿') < 0) { fail++; console.log('  FAIL 读对的词没标绿'); }

const wrong = mark('she is playing a piano');
console.log('读错 the    :', wrong, '| 分数', App.alignSpeech(sentence, 'she is playing a piano').score);

// ---- 3. 从真实题库里抽句子跑一遍，确认没有错位 ---------------------------
console.log('\n--- 3. 真实题库 ---');
const sentences = [];
let m;
const re = /"sentence":\s*"((?:[^"\\]|\\.)*)"/g;
while ((m = re.exec(dataSrc))) sentences.push(m[1]);
const re2 = /'sentence':\s*'((?:[^'\\]|\\.)*)'/g;
while ((m = re2.exec(dataSrc))) sentences.push(m[1]);

let checked = 0, bad = 0;
sentences.forEach(function(s) {
  if (!/[A-Za-z]/.test(s)) return;
  checked++;
  const whole = App._tokens(s);
  const t = App._readTokens(s);
  const same = whole.length === t.words.length && whole.every(function(w, i) { return w === t.words[i]; });
  if (!same) {
    bad++;
    if (bad <= 5) console.log('MISMATCH:', JSON.stringify(s), '\n  whole  :', JSON.stringify(whole), '\n  display:', JSON.stringify(t.words));
  }
});
console.log('题库句子 ' + checked + ' 条，错位 ' + bad + ' 条');
if (bad) fail++;

console.log('\n' + (fail ? '结果：有 ' + fail + ' 项失败' : '结果：全部通过'));
process.exit(fail ? 1 : 0);
