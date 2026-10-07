/* eslint-disable */
// 回归红线（v90）：高频词汇「逐字母跟读」阶段必须读完才能进下一个单词，
// 且按住格子时要有大字悬浮层（手指会挡住格子里的小字）。
//
//   1. 渲染 letter_read 阶段 → 底部「下一个单词」按钮锁死
//   2. 没读完点「下一个单词」→ 不跳（vocabWordIdx 不变）
//   3. 所有格子 + 整词读完（_spellProgress）→ 按钮就地解锁
//   4. 解锁后点「下一个单词」→ 正常跳到下一个词
//   5. 切到非拼读阶段（learn 等）→ _spell 清空、按钮不锁
//   6. 按住格子 → spell-peek 大字层出现，松手（回调触发）→ 消失
//
// 用法：node tools/verify-spell-stage.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub（同款，body 追踪子节点供 peek 测试） ----------
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
bodyEl.appendChild = (c) => {
  bodyEl.children.push(c);
  c.remove = () => bodyEl.removeChild(c);   // 让桩里的 remove() 有真实语义
};
bodyEl.removeChild = (c) => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };
const document = {
  getElementById: id => {
    const kid = bodyEl.children.find(c => c.id === id);
    if (kid) return kid;
    return (byId[id] = byId[id] || el('div'));
  },
  querySelector: () => null,
  querySelectorAll: () => [],
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

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS, IDX: HOMEWORK_WEEK_IDX };')();
const HOMEWORK_DATA = scope.WEEKS[0];   // 钉死第 1 周：断言引用具体单词

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
    document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
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
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test' }];
App.state.currentTab = 'today';
App.state.audioEnabled = true;
App.isTeacher = () => false;

// ---- 插桩 speak：只记录不播 ----
const spoken = [];
App.speak = function (text, opts) { spoken.push(String(text)); if (opts && opts.onDone) opts.onDone(); };

// ---- 找第 0 天第 1 个模块的 letter_read ----
const DAY = 0, MI = 1;
const m = HOMEWORK_DATA[DAY].modules[MI];
let wordIdx = -1, stageIdx = -1, word = null;
(m.words || []).forEach((w, wi) => w.stages.forEach((s, si) => {
  if (wordIdx < 0 && s.type === 'letter_read') { wordIdx = wi; stageIdx = si; word = w; }
}));
if (wordIdx < 0) { console.log('  FAIL 第 1 周没有 letter_read 阶段'); process.exit(1); }

function enterStage() {
  App.state.vocabWordIdx = wordIdx;
  App.state.vocabStage = stageIdx;
  App._spell = null;
  App.renderVocabStage(m, MI, DAY);
}

console.log('== 1) 渲染拼读阶段：_spell 就位、按钮锁死 ==');
enterStage();
ok(App._spell && App._spell.mi === MI && !App._spell.finished,
   '_spell 就位（mi=' + MI + '，未完成）');
ok(App._spell.total === word.word.length, '格子数 = 字母数（' + App._spell.total + '）');
const btn = getEl('stage-next-' + MI);
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === true, '「下一个单词」按钮未读完时是锁住的');

console.log('\n== 2) 没读完点「下一个单词」：不跳 ==');
App.nextVocabWord(MI, DAY);
ok(App.state.vocabWordIdx === wordIdx, 'vocabWordIdx 不变（' + App.state.vocabWordIdx + '）');

console.log('\n== 3) 全部格子 + 整词读完 → 按钮就地解锁 ==');
for (let i = 0; i < App._spell.total; i++) App._spell.takes[i] = {};
App._spell.wordTake = {};
App._spellProgress(MI);
ok(App._spell.finished === true, '读完判定 finished=true');
ok(btn.disabled === false, '按钮解锁');

console.log('\n== 4) 解锁后点「下一个单词」：正常跳 ==');
App.nextVocabWord(MI, DAY);
ok(App.state.vocabWordIdx === wordIdx + 1, '跳到下一个词（' + App.state.vocabWordIdx + '）');
ok(App._spell === null, '切词后 _spell 已清空');

console.log('\n== 5) 非拼读阶段（learn）不锁按钮 ==');
App.state.vocabStage = 0;                     // learn 阶段
App._spell = { mi: MI, finished: false };     // 模拟上一阶段残留
App.renderVocabStage(m, MI, DAY);             // renderVocabStage 应清掉它
ok(App._spell === null, '残留 _spell 被清空');
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === false, 'learn 阶段按钮不锁');

console.log('\n== 6) 按住格子：大字悬浮层出现/消失 ==');
enterStage();
ok(bodyEl.children.length === 0, '初始无悬浮层');
App._spellPeekShow('B');
ok(bodyEl.children.length === 1 && bodyEl.children[0].className === 'spell-peek'
   && bodyEl.children[0].textContent === 'B', '按住 → spell-peek 显示「B」');
App._spellPeekHide();
ok(bodyEl.children.length === 0, '松手 → 悬浮层移除');
// 走真实 _readUnit 链路：需要 _holdStart 能同步回调。临时替换。
const origHold = App._holdStart;
let holdCb = null;
App._holdStart = function (ev, key, label, status, cb) { holdCb = cb; };
App._gateOpen = function(){ return true; };
getEl('spell-' + MI + '-0').textContent = 'B';   // 桩里格子的字要自己放
App._readUnit({ preventDefault(){} }, MI, 0);
ok(bodyEl.children.length === 1 && bodyEl.children[0].textContent === 'B'.toUpperCase(),
   '_readUnit 按下 → 悬浮层出现');
holdCb({}, '');                                // 松手（无识别结果）
ok(bodyEl.children.length === 0, '回调触发 → 悬浮层消失');
App._holdStart = origHold;

// ---------- v92 红线 ----------
// 7. 示范必须是单段连读（data-say），不许退回逐段串播（data-seq）
//    v94 起写法 = "Letters: G-U-I-T-A-R, guitar"（前置 Letters + 连字符连读
//    + 逗号接整词）；v102 起字母之间改成逗号 —— 连字符挡得住"整串拼成词"
//    （guitar），挡不住"中间几个字母恰好是真词"：panda 的 A-N-D、island 的
//    A-N-D 都会被读成英文单词 "and"，N 的字母名直接消失（家长实测反馈
//    「字母 N 发音不好，读成了 n」）。实测逗号版两句都读全：
//      "Letters: P, A, N, D, A, panda"      → "Letters P A N D"
//      "Letters: I, S, L, A, N, D, island"  → "Letters I S L A N D island."
console.log('== 7) 示范单段连读 ==');
App._spell = null;
document.body.innerHTML = '';
// 重新渲染 letter_read 阶段，抓 gate 按钮
const mod0 = HOMEWORK_DATA[0].modules.find(m => m.words && m.words[0] &&
  m.words[0].stages.some(s => s.type === 'letter_read'));
ok(!!mod0, '第 1 天有 letter_read 词卡模块');
const wi0 = mod0.words.findIndex(w => w.stages.some(s => s.type === 'letter_read'));
const stageHtml = App._renderSpellRead(mod0, 0, 0, mod0.words[wi0], mod0.words[wi0].word.split(''), 'letter');
ok(stageHtml.indexOf('data-seq=') < 0, '示范按钮不再用 data-seq 逐段串播');
const sayM = stageHtml.match(/data-say="([^"]*)"/);
ok(!!sayM, '示范按钮带 data-say');
let say = '';
if (sayM) {
  say = sayM[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  ok(/^Letters: /.test(say), '前置 Letters 声明，挡住阿里的"智能拼读"（' + say.slice(0, 32) + '…）');
  ok(/[A-Z], [A-Z]/.test(say), '字母之间用逗号分隔（v102：连字符会让 A-N-D 被读成 and）');
  ok(!/[A-Z]-[A-Z]/.test(say), '字母之间不能再出现连字符（局部真词会被读掉）');
  ok(/, [A-Za-z]+$/.test(say), '整词用逗号接在字母串后面（' + say.slice(-14) + '）');
  ok(/\. [A-Za-z]+$/.test(say) === false,
     '不用句号分隔字母串和整词（句号会让阿里云把字母读成单词）');
  ok(/ - \S+$/.test(say) === false, '不再用破折号接整词（camera 会被读成 CAMERA CAMERA）');
  ok(say.toUpperCase().indexOf(mod0.words[wi0].word.toUpperCase()) >= 0, '整词在示范里');
} else {
  ok(false, '示范按钮带 data-say');
}
// _spellDemo 直接单测：camera 是实测最坑的词（C-A-M-E-R-A 正好拼出 camera）
ok(App._spellDemo('letter', ['c', 'a', 'm', 'e', 'r', 'a'], 'camera')
   === 'Letters: C, A, M, E, R, A, camera', '_spellDemo(letter) 文本正确');
ok(App._spellDemo('letter', 'guitar'.split(''), 'guitar')
   === 'Letters: G, U, I, T, A, R, guitar', '_spellDemo 大小写归一（guitar）');
// v102 专项：局部真词的三类代表词，示范串里都不许出现连字符
[['panda', 'and'], ['island', 'and'], ['camera', 'am/me'], ['breakfast', 'as']]
  .forEach(function (pair) {
    var w = pair[0];
    var s = App._spellDemo('letter', w.split(''), w);
    ok(s.indexOf('-') < 0, w + ' 的示范串不含连字符（避开局部真词 ' + pair[1] + '）→ ' + s);
  });
ok(App._spellDemo('syllable', ['beau', 'ti', 'ful'], 'beautiful')
   === 'beau, ti, ful. beautiful', '音节阶段保持逗号 + 句号（拼起来就是词的读音）');
// v94：连读阶段的示范必须与逐字母那屏**逐字相同**，否则孩子听到两种串法
enterStage();
App.startContinuous(MI);
{
  const contHtml = getEl('spell-result-area-' + MI).innerHTML;
  const cm = contHtml.match(/data-say="([^"]*)"/);
  ok(!!cm, '连读示范带 data-say');
  if (cm) {
    const csay = cm[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    ok(/^Letters: /.test(csay) && /, [A-Za-z]+$/.test(csay),
       '连读示范同样是 Letters + 逗号字母串 + 逗号整词（' + csay.slice(0, 42) + '…）');
    ok(csay === say, '连读示范与逐字母示范完全一致（避免两种串法）');
  }
}
// 音节拼读同理
const wiS = mod0.words.findIndex(w => w.stages.some(s => s.type === 'syllable_read'));
if (wiS >= 0) {
  const wS = mod0.words[wiS];
  const sy = wS.stages.find(s => s.type === 'syllable_read');
  const unitsS = (sy.units || sy.pieces || wS.word.match(/[^aeiou]*[aeiou]+(?:[^aeiou]+)?/g) || [wS.word]);
  const h2 = App._renderSpellRead(mod0, 0, 0, wS, unitsS, 'syllable');
  ok(h2.indexOf('data-seq=') < 0 && /data-say="/.test(h2), '音节示范同为单段连读');
}

// 8. 整词判分：字符级放宽 —— "break fast" 必须拿满分（v91 前是 0 分）
console.log('== 8) 整词判分放宽（字符级）==');
ok(App._wordTakeScore('breakfast', 'break fast', null) === 100,
   '识别拆词（break fast）→ 100 分');
ok(App._wordTakeScore('breakfast', 'breakfast', null) === 100, '完全一致 → 100 分');
ok(App._wordTakeScore('apple', 'apples', null) >= 70, '多一个音素（apples）→ 不重罚（' + App._wordTakeScore('apple', 'apples', null) + '）');
ok(App._wordTakeScore('apple', 'appo', null) < 60, '读错音（appo）→ 不过关');
ok(App._wordTakeScore('apple', 'okay thank you', null) < 60, '幻觉词 → 不过关');
ok(App._wordTakeScore('apple', '', null) === 0, '没识别出 → 0 分');
// 逐词对齐更严的结果也取 max（句子路径不受影响）
const alignDemo = App.alignSpeech('I like apples', 'I like apples');
ok(App._wordTakeScore('apples', 'I like apples', alignDemo) >= alignDemo.score, '取两把尺子的较高分');

// 9. 连续读：整词被拆词时字符级兜底
console.log('== 9) 连续读整词兜底 ==');
const seqRes = App._scoreSequence(['b', 'k', 'f', 'a', 's', 't', 'breakfast'], 'b k f a s t break fast');
ok(seqRes.hits[6] === true, '整词被拆词 → 仍判读到');
ok(seqRes.ok === 7 && seqRes.score === 100, '全部读到 → 100 分（' + seqRes.score + '）');
const seqRes2 = App._scoreSequence(['b', 'k', 'f', 'a', 's', 't', 'breakfast'], 'b k f a s t okay');
ok(seqRes2.hits[6] === false, '整词没读 → 不放水');

// ---------- v93 红线 ----------
// 10. _letterOk：严格到能区分 b/p，又不把字母名拼写（bee）当错
console.log('== 10) 字母判定 _letterOk ==');
ok(App._letterOk('b', 'b') === true, '读 B、识别 "b" → 判对');
ok(App._letterOk('B', 'B.') === true, '大小写与句点不影响（"B."）');
ok(App._letterOk('b', 'bee') === true, '识别成字母名 "bee" → 判对');
ok(App._letterOk('b', 'be') === true, '识别成 "be" → 判对');
ok(App._letterOk('w', 'double u') === true, 'W 的字母名 "double u" → 判对');
ok(App._letterOk('u', 'you') === true, 'U 的字母名 "you" → 判对');
ok(App._letterOk('b', 'p') === false, '读成 P → 判错（关键：不能拿 _soundAlike 判单字母）');
ok(App._letterOk('b', 'd') === false, '读成 D → 判错');
ok(App._letterOk('e', 'sea') === false, 'C 的字母名不会反过来算成 E 读对');
ok(App._letterOk('b', 'breakfast') === false, '整串不会蒙混过关');
ok(App._letterOk('b', '') === false, '没识别出 → 判错，要求重读');
ok(App._soundAlike('b', 'p') === true,
   '反证：_soundAlike 认为 b 和 p 相同 —— 所以单字母必须走 _letterOk');

// 11. 有字母没读对 → 汇总后按钮仍锁；重读读对 → 解锁
console.log('\n== 11) 字母没全读对就不放行 ==');
enterStage();
const totUnit = App._spell.total;
for (let i = 0; i < totUnit; i++) {
  App._spell.takes[i] = {};
  App._spell.unitScores[i] = { label: 'X', ok: true, heard: 'x' };
}
App._spell.unitScores[0] = { label: 'B', ok: false, heard: 'p' };   // 第 1 个读错了
App._spell.wordTake = {}; App._spell.score = 90; App._spell.heard = 'beautiful';
App._spellProgress(MI);
ok(App._spell.finished === true, '读完仍然触发汇总（finished=true）');
ok(App._spell.allOk === false, 'allOk=false（有字母没读对）');
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === true, '还有错字母 → 「下一个单词」保持锁住');
App.nextVocabWord(MI, DAY);
ok(App.state.vocabWordIdx === wordIdx, '没全读对时点它也不跳（双保险）');
// 孩子重读那个字母、这次读对了
App._spell.finished = false;                 // 重读把 finished 打回 false
App._spell.unitScores[0] = { label: 'B', ok: true, heard: 'b' };
App._spellProgress(MI);
App._syncVocabFootLabel(MI, DAY);
ok(App._spell.allOk === true, '重读读对 → allOk=true');
ok(btn.disabled === false, '全读对 → 解锁');

// 12. 字母跟读全程静音（家长："读 B 就不要读出来 B，学生自己说"）
console.log('\n== 12) 字母跟读不放机器音 ==');
enterStage();
App._gateOpen = function () { return true; };
const origHold2 = App._holdStart;
let cb2 = null;
App._holdStart = function (ev, key, label, status, cb) { cb2 = cb; };
getEl('spell-' + MI + '-0').textContent = 'B';
spoken.length = 0;
App._readUnit({ preventDefault(){} }, MI, 0);
cb2({}, 'b');
ok(spoken.indexOf('B') < 0 && spoken.indexOf('b') < 0,
   '字母读完后没有机器回放音（spoken=' + JSON.stringify(spoken) + '）');
ok(!!(App._spell.unitScores[0] && App._spell.unitScores[0].ok === true),
   '同一个回调里字母被判定为读对');
App._holdStart = origHold2;

// 13. 连续读漏字母 → contMiss 把按钮重新按下
console.log('\n== 13) 连续读漏了也不放行 ==');
const seq2 = ['b', 'k', 'f', 'a', 's', 't', 'breakfast'];
ok(App._scoreSequence(seq2, 'b k f a s t').ok === 6, '整词没读到 → 只中 6/7');
ok(App._scoreSequence(seq2, 'b k f a s t breakfast').ok === 7, '整串读全 → 7/7');
ok(App._scoreSequence(seq2, 'b k f a s breakfast').ok === 6, '中间漏一个字母 → 不放水');
enterStage();
App._spell.finished = true; App._spell.allOk = true; App._spell.contMiss = true;
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === true, '连读没读全 → 按钮重新锁住');
App._spell.contMiss = false;
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === false, '读全了 → 解锁');

// ---------- v99 红线（家长：读 panda 的时候，单个字母识别很久、还老过不去） ----------
// 14. _letterOk 放宽：识别端换了写法（读音、重复字母）不该冤枉孩子
console.log('\n== 14) 字母判定放宽（v99） ==');
ok(App._letterOk('p', 'puh') === true, '读 P、识别成读音 "puh" → 判对');
ok(App._letterOk('p', 'peee') === true, '识别把音写长（"peee"）→ 判对');
ok(App._letterOk('n', 'enn') === true, '识别成 "enn" → 判对');
ok(App._letterOk('d', 'duh') === true, '识别成 "duh" → 判对');
ok(App._letterOk('a', 'uh') === true, 'A 的模糊读音 "uh" → 判对');
ok(App._letterOk('m', 'm') === true, '纯辅音音 "m" → 判对');
ok(App._letterOk('s', 'sss') === true, '重复辅音 "sss" → 判对');
ok(App._letterOk('c', 'see') === true, 'C 的字母名 "see" 仍然判对（压重复字母不能压坏它）');
// 放宽之后判别力不能丢：易混的那几对还是错的
ok(App._letterOk('b', 'puh') === false, 'P 的读音不会算成 B 读对');
ok(App._letterOk('d', 'buh') === false, 'B 的读音不会算成 D 读对');
ok(App._letterOk('n', 'muh') === false, 'M 的读音不会算成 N 读对');
ok(App._letterOk('m', 'n') === false, '读成 N → 仍判错');

// 15. 识别端没回内容 ≠ 读错：不判红、不挡路
console.log('\n== 15) 没听清不算读错（不挡路） ==');
enterStage();
App._gateOpen = function () { return true; };
const origHold3 = App._holdStart;
const holdArgs = [];
let cb3 = null;
App._holdStart = function () { holdArgs.push([].slice.call(arguments)); cb3 = arguments[4]; };
getEl('spell-' + MI + '-0').textContent = 'b';
App._readUnit({ preventDefault(){} }, MI, 0);
cb3({}, null);                                  // 识别端一个字都没回来
ok(App._spell.unitScores[0].unclear === true, 'unitScores[0].unclear=true');
ok(App._spell.unitScores[0].ok === undefined, 'ok=undefined（既不算对也不算错）');
ok(getEl('spell-' + MI + '-0').classList.contains('read-miss') === false, '格子不判红');
ok(getEl('spell-' + MI + '-0').classList.contains('read-unclear') === true, '格子标为「没听清」');
App._holdStart = origHold3;

// 全是"没听清" → 也不该挡住孩子（否则识别失败就成了孩子的错）
enterStage();
for (let i = 0; i < App._spell.total; i++) {
  App._spell.takes[i] = {};
  App._spell.unitScores[i] = { label: 'X', unclear: true, heard: null };
}
App._spell.wordTake = {}; App._spell.score = 80; App._spell.heard = 'beautiful';
App._spellProgress(MI);
ok(App._spell.allOk === true, '全是「没听清」→ allOk=true（不把识别失败算成孩子的错）');
App._syncVocabFootLabel(MI, DAY);
ok(btn.disabled === false, '不挡路：按钮解锁');

// 16. 字母/音节跟读必须让 Cloudflare 先认（v96 的注释写了，v99 才真正落到代码）
console.log('\n== 16) 孤立音先给 Cloudflare 认 ==');
ok(holdArgs.length === 1, '捕获到一次字母跟读（' + holdArgs.length + '）');
ok(holdArgs[0] && holdArgs[0][8] === 'cf',
   "asrPrefer='cf'（实际：" + (holdArgs[0] && holdArgs[0][8]) + '）');
ok(holdArgs[0] && holdArgs[0][7] && holdArgs[0][7].indexOf('b') >= 0,
   '仍然带上字母串提示词（hint=' + (holdArgs[0] && holdArgs[0][7]) + '）');

// 17. 配色对比（v99）：家长"读错的词和橘黄太接近，孩子看不出来"。
//     这条不钉具体色值，只钉关系 —— 读错 / 读对 / 录音中三态必须拉得开，
//     而且读错不能只靠颜色区分。以后调色板随便改，只要还分得开就过。
console.log('\n== 17) 读错和橘黄的对比度 ==');
{
  const css = fs.readFileSync(BASE + 'index.html', 'utf8');
  const blockOf = (sel) => {
    const i = css.indexOf(sel + '{');
    if (i < 0) return null;
    return css.slice(i, css.indexOf('}', i));
  };
  const declOf = (sel, prop) => {
    const b = blockOf(sel);
    if (!b) return null;
    const m = b.match(new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;}]+)'));
    return m ? m[1].trim() : null;
  };
  const cssVar = (name) => {
    const m = css.match(new RegExp('--' + name + '\\s*:\\s*(#[0-9a-fA-F]{3,6})'));
    return m ? m[1] : null;
  };
  const bgOf = (sel) => {
    const v = declOf(sel, 'background');
    if (!v) return null;
    const vm = v.match(/var\(\s*--([a-z-]+)\s*\)/);
    if (vm) return cssVar(vm[1]);
    const hm = v.match(/#[0-9a-fA-F]{3,6}/);
    return hm ? hm[0] : null;
  };
  const rgb = (hex) => {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const dist = (a, b) => {
    const x = rgb(a), y = rgb(b);
    return Math.round(Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2)));
  };

  const missBg = bgOf('.spell-box.read-miss');
  const doneBg = bgOf('.spell-box.read-done');
  const recBg = bgOf('.spell-box.reading');
  const badBg = bgOf('.rd-w.rd-bad');
  const curBg = bgOf('.rd-w.rd-cur');

  ok(!!missBg && !!doneBg, '读错 / 读对两态都有底色（' + missBg + ' / ' + doneBg + '）');
  ok(missBg !== doneBg, '读错 ≠ 读对的底色（' + missBg + ' vs ' + doneBg + '）');
  ok(!!recBg && recBg !== missBg, '「录音中」不再和「读错」同为红色（' + recBg + '）');
  ok(!!missBg && !!doneBg && dist(missBg, doneBg) >= 100,
     '读错与读对的底色距离够大（' + dist(missBg, doneBg) + '）');
  ok(!!missBg && !!recBg && dist(missBg, recBg) >= 100,
     '读错与录音中的底色距离够大（' + dist(missBg, recBg) + '）');
  ok(!!badBg && !!curBg && dist(badBg, curBg) >= 100,
     '跟读面板：读错与「正在读」橘黄光标的距离够大（' + dist(badBg, curBg) + '）');
  ok(!/underline\s+wavy/.test(blockOf('.rd-w.rd-bad') || ''),
     '读错不再只靠红色波浪线');
  ok(css.indexOf('.rd-w.rd-bad::after') >= 0
     && /content\s*:\s*'.{1,3}'/.test(css.slice(css.indexOf('.rd-w.rd-bad::after'),
                                              css.indexOf('.rd-w.rd-bad::after') + 120)),
     '读错的词带一个符号标记（不靠颜色也能认出来）');
  ok(css.indexOf('.sc-cell.bad{border-color:#C62828;color:#fff;background:#C62828}') >= 0
     || dist(bgOf('.sc-cell.bad') || '#FFFFFF', doneBg || '#FFF4EA') >= 100,
     '汇总格子里的「读错」同样拉得开');
}

// ---------- v100 红线（家长：学生读得很好，还是读了好几次，十几分） ----------
// 18. 连续读的分数不能只看「逐格听到几个」—— 孤立字母识别不到不是孩子的错
console.log('\n== 18) 连续读：读对了不能只有十几分（v100） ==');
{
  const L = ['p', 'a', 'n', 'd', 'a', 'panda'];
  const sc = (e, t) => App._scoreSequence(e, t);
  const only = sc(L, 'panda');                     // 历史 bug：这句 17 分
  ok(only.score >= 60, '只听到整词 → 过线（' + only.score + ' 分；旧版 17 分）');
  ok(only.wordHit === true, 'wordHit=true：整词被听到 → 连读成立');
  ok(only.hits[L.length - 1] === true, '整词格标为「听到」（孩子看得见哪一格过了）');
  ok(sc(L, 'pandapanda').score >= 60, '串读被黏成一个词 → 过线');
  ok(sc(L, 'panda panda').score >= 60, '整词被听成两遍 → 过线');
  ok(sc(L, 'p a n d a panda').score === 100, '整串都听到 → 满分');
  // 判松之后判别力不能丢
  ok(sc(L, 'p e n d a').score < 60, '整词读成 penda → 仍不过线');
  ok(sc(L, 'apple').score < 60, '读成别的词 → 仍不过线');
  ok(sc(L, '').score === 0, '没识别到 → 0 分');
  ok(sc(L, 'p a n').score < 60, '只读了三个字母 → 仍不过线');
  ok(sc(['pan', 'da', 'panda'], 'panda').score >= 60, '音节型只听到整词 → 也过线');

  // 端到端：连续读回调里的 contMiss 必须认 wordHit，别把孩子锁在门外
  enterStage();
  App._gateOpen = function () { return true; };
  const origHoldC = App._holdStart;
  let cbC = null;
  App._holdStart = function () { cbC = arguments[4]; };
  App.startContinuous(MI);
  const WORD_C = App._spell.word;                  // 这个阶段实际要读的词
  App._spell.contMiss = true;
  App._readContinuous({ preventDefault() {} }, MI);
  cbC({ blob: {}, samples: null }, WORD_C);        // 孩子读对，识别只回了整词
  ok(App._spell.contMiss === false, '只听到整词 → contMiss=false（不锁「下一个单词」）');
  ok(App._spell.contScore >= 60, '连续读得分 ≥60（' + App._spell.contScore + ' 分）');
  // 反面：整词读错，仍然锁住
  App._spell.contMiss = false;
  App._readContinuous({ preventDefault() {} }, MI);
  cbC({ blob: {}, samples: null }, 'zzz zzz');     // 反面：读的完全不是这个词
  ok(App._spell.contMiss === true, '整词读错 → contMiss=true（重读）');
  App._holdStart = origHoldC;
}

// ---------- v101 红线（家长：发音不准就给过 60 分以上；单字母读错了该错就错） ----------
// 19. 字母判定分四档：读对 / 发音不准（算过）/ 没听清（不判红）/ 读错（重读）
console.log('\n== 19) 发音不准算过，读错才重读（v101） ==');
{
  // 发音不准 → 给过
  ok(App._letterOk('b', 'buh') === true, '读 B、识别成读音 "buh" → 读对');
  ok(App._letterNear('d', 'deek') === true, '识别拖长（"deek"）→ 算「发音不准」给过');
  ok(App._letterNear('x', 'ks') === true, 'X 被写成 "ks"（同音换拼法）→ 给过');
  ok(App._letterNear('w', 'dabble') === true, 'W 的 "double" 被听走形 → 给过');
  ok(App._letterNear('o', 'ow') === true, '"ow" ≈ "oh" → 给过');
  // 读到别的字母 → 该错就错，仍然锁按钮
  ok(App._letterOk('b', 'puh') === false && App._letterNear('b', 'puh') === false,
     'B 读成 P 的读音 → 判错（清浊对不放行）');
  ok(App._letterNear('d', 'tee') === false, 'D 读成 T 的字母名 → 判错');
  ok(App._letterNear('m', 'nuh') === false, 'M 读成 N → 判错');
  ok(App._letterNear('c', 'kay') === false, 'C 读成 K 的字母名 → 判错');
  ok(App._letterNear('g', 'jay') === false, 'G 读成 J 的字母名 → 判错');
  ok(App._letterOk('l', 'hello') === false && App._letterNear('l', 'hello') === false,
     '整词里的 "l" 不会算成字母 L 读对（不许子串兜底）');
  // 定不了性的 → 没听清，不判红
  ok(App._singleLetterGuess('N') === true, '孤立单字母 "N" = 识别端在猜，判「没听清」');
  ok(App._letterish('Capitoli') === false, '幻觉词 "Capitoli" 不像任何字母音');

  // 端到端：发音不准的字母既要给过（不判红），又不能污染"读错"那条路
  enterStage();
  App._gateOpen = function () { return true; };
  const origHoldN = App._holdStart;
  let cbN = null;
  App._holdStart = function () { cbN = arguments[4]; };
  const L0 = String(App._spell.units[0]).toLowerCase();
  const nearish = [L0 + 'eek', L0 + 'uh', L0 + 'ah', L0 + 'ee']
    .find(x => App._letterNear(L0, x) && !App._letterOk(L0, x));
  ok(!!nearish, '造出一个「发音不准」的识别结果（' + L0 + ' ← ' + nearish + '）');
  App._readUnit({ preventDefault() {} }, MI, 0);
  cbN({}, nearish);
  ok(App._spell.unitScores[0].near === true, 'unitScores[0].near=true');
  ok(App._spell.unitScores[0].ok === true, '发音不准记成「过」（不挡路）');
  ok(getEl('spell-' + MI + '-0').classList.contains('read-miss') === false, '不判红');
  ok(getEl('spell-' + MI + '-0').classList.contains('read-near') === true, '格子标为「发音不准算过」');
  // 读错仍然要红
  const wrong = App._MIX_PAIRS[L0] ? App._LNAMES[App._MIX_PAIRS[L0]].split(' ')[0] : 'bee';
  App._readUnit({ preventDefault() {} }, MI, 0);
  cbN({}, wrong);
  ok(App._spell.unitScores[0].ok === false, '读到别的字母（' + L0 + ' ← ' + wrong + '）→ 判错');
  ok(getEl('spell-' + MI + '-0').classList.contains('read-miss') === true, '读错仍然判红');
  App._holdStart = origHoldN;
}

console.log('\n' + (fail ? ('有 ' + fail + ' 项失败 ❌') : '全部通过 ✅'));
process.exit(fail ? 1 : 0);
