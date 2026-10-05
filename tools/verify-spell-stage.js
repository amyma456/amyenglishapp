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
if (sayM) {
  const say = sayM[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  ok(/[A-Z], [A-Z]/.test(say), '字母用逗号连读（' + say.slice(0, 30) + '…）');
  ok(/ - \S+$/.test(say), '字母串与整词之间是破折号（' + say.slice(-18) + '）');
  ok(/\. [A-Za-z]+$/.test(say) === false,
     '不再用句号分隔字母串和整词（句号会让阿里云把字母读成单词）');
  ok(say.toUpperCase().indexOf(mod0.words[wi0].word.toUpperCase()) >= 0, '整词在示范里');
}
// v93：连读阶段的示范也必须用破折号，同一个坑
enterStage();
App.startContinuous(MI);
{
  const contHtml = getEl('spell-result-area-' + MI).innerHTML;
  const cm = contHtml.match(/data-say="([^"]*)"/);
  ok(!!cm, '连读示范带 data-say');
  if (cm) {
    const csay = cm[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    ok(/ - \S+$/.test(csay), '连读示范字母串与整词之间也是破折号（' + csay.slice(0, 42) + '…）');
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

console.log('\n' + (fail ? ('有 ' + fail + ' 项失败 ❌') : '全部通过 ✅'));
process.exit(fail ? 1 : 0);
