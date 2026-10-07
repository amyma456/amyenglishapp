/* eslint-disable */
// 跟读评分的容错口径（v96）—— 防止"读对了却判错"再退化。
//
// 背景：家长反复反馈「学生明明读得好好的，系统判错」。根子有两处：
//   ① 判词要求逐字相同，识别端把 "I'm" 吐成 "I am"、subjects 写成 subject
//      就判读错；
//   ② 一个虚词（the / to / is）被识别吞掉，整句就因为"有一个红词"被卡死。
// 这个脚本把这两类全部钉死，同时守住另一边 —— 真的读错必须还是判错，
// 不然就变成"人人都能过"。
//
// 用法：node tools/verify-pron-tolerance.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// ---- 载入 app.js 里真正跑的那份判定代码 ----
function loadApp() {
  let src = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
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
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;globalThis.__App = App;', sandbox, { filename: 'app.js' });
  return sandbox.__App;
}

const App = loadApp();

// 判分口径的两把尺子，跟线上一致：
//   通过 = 分数 ≥60 且一个错词都没有（_spShowResult 里的 passed）
function verdict(sentence, heard) {
  const a = App.alignSpeech(sentence, heard);
  const bad = a.items.filter(function(x) { return x.target && x.status !== 'ok'; }).map(function(x) { return x.target; });
  return { score: a.score, bad: bad, passed: a.score >= 60 && bad.length === 0 };
}
function shouldPass(sentence, heard, label) {
  const v = verdict(sentence, heard);
  ok('读对判过 · ' + label, v.passed,
    '分=' + v.score + ' 错词=[' + v.bad.join(',') + ']');
}
function shouldFail(sentence, heard, label) {
  const v = verdict(sentence, heard);
  ok('读错拦下 · ' + label, !v.passed,
    '分=' + v.score + ' 却没拦住');
}

console.log('\n1. 缩写写法差异（识别端最常见的改写）');
shouldPass("What's your favorite subject at school?", 'What is your favorite subject at school?', "what's → what is");
shouldPass("I don't like milk.", 'I do not like milk.', "don't → do not");
shouldPass("I'm a student.", 'I am a student.', "i'm → i am");
shouldPass("It's sunny today.", 'It is sunny today.', "it's → it is");
shouldPass("Let's go to school.", 'let us go to school', "let's → let us");
shouldPass("I can't swim.", 'I cannot swim', "can't → cannot");
shouldPass("I can't swim.", 'I can not swim', "can't → can not");
shouldPass("That's my book.", 'that is my book', "that's → that is");
shouldPass("We're good friends.", 'we are good friends', "we're → we are");

console.log('\n2. 拼写变体（同一句话，识别端写法不同）');
shouldPass('My favorite subject is English.', 'My favourite subject is English.', 'favorite/favourite');
shouldPass('I go to the library.', 'i go to the libary', 'library/libary');
shouldPass('I have two cats.', 'I have two cat.', 'cats/cat（词尾 -s 被吞）');
shouldPass('I helped my mother.', 'I help my mother', 'helped/help（-ed 被吞）');
shouldPass('I usually play basketball.', 'I usualy play basketball', 'usually/usualy');
shouldPass('We visited Beijing last year.', 'We visit Beijing last year', 'visited/visit');
shouldPass('The children are playing.', 'the children is playing', 'are/is（虚词，按豁免）');
shouldPass('I read storybooks in my free time.', 'I read story book in my free time', 'storybooks 被拆成两个词');

console.log('\n3. 虚词被吞（一个 the/to 不该卡住整句）');
shouldPass('I went to the zoo with my parents.', 'I went zoo with my parents', '吞掉 to / the 与介词短语');
shouldPass('What do you usually do on weekends? I usually play basketball with my friends on weekends.',
           'What do you usually do on weekends I usually play basketball with my friends on weekends', '吞掉句末 on');
shouldPass('The best gift I have got is a bike.', 'best gift I have got is bike', '吞掉 the / a');

console.log('\n4. 真的读错必须还是判错（不能变成人人都过）');
shouldFail('My favorite subject is English.', 'My favorite subject is math.', '答句内容整个不对');
shouldFail('I go to school by bus.', 'I go to school by car.', '关键词 bus → car');
shouldFail('My favorite animal is the panda.', 'My favorite fruit is the apple.', '整句张冠李戴');
shouldFail('I want to think about it.', 'I want to sink about it', 'think → sink（等长换字母）');
shouldFail('The cat is on the mat.', 'The cut is on the mut', 'cat/cut（短词等长换字母）');
shouldFail('I run every morning.', 'I ran every morning', 'run → ran（时态读错）');
shouldFail('I have a pen.', 'I have a pan', 'pen → pan');
shouldFail('She is my sister.', 'She is my seat', 'sister → seat（完全不同的词）');

console.log('\n5. 单词纠错（红色词原处重读）同一把尺子');
ok('subjects 认成 subject', App._wordSame('subject', 'subjects'));
ok('favourite 认成 favorite', App._wordSame('favourite', 'favorite'));
ok('读对了能过（_heardAny）', App._heardAny('subjects', 'i like subjects very much'));
ok('think 不认 sink', !App._wordSame('think', 'sink'));
ok('pen 不认 pan', !App._wordSame('pen', 'pan'));
ok('fifteen 不认 fifty', !App._wordSame('fifteen', 'fifty'));
ok('完全无关不认', !App._wordSame('library', 'yellow'));

console.log('\n6. 显示与判分必须用同一套分词（否则整句高亮错位）');
{
  const cases = [
    "What's your favorite subject at school? My favorite subject is English.",
    "I don't know what to do.",
    "What time do you usually get up in the morning? I usually get up at 6:30 in the morning.",
    "We're going to the zoo, aren't we?",
    "Let's read it again.",
  ];
  let bad = null;
  cases.forEach(function(s) {
    const rt = App._readTokens(s);
    const direct = App._tokens(s);
    if (rt.words.length !== direct.length || rt.words.join('|') !== direct.join('|')) {
      bad = s + '\n      显示=' + rt.words.join('|') + '\n      判分=' + direct.join('|');
    }
  });
  ok('_readTokens 与 _tokens 词序、词数完全一致', !bad, bad);

  // 缩写摊平后，"What's" 这个格子要占两个词位（data-n=2），高亮才不会串位
  const t = App._readTokens("What's your name?");
  const first = t.display.filter(function(d) { return d.word; })[0];
  ok('"What\'s" 摊成两个词位（data-n=2）', first && first.n === 2, JSON.stringify(first));
}

console.log('\n' + pass + ' 项通过, ' + fail + ' 项失败');
process.exit(fail ? 1 : 0);
