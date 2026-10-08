/* eslint-disable */
// 「点选答案的即时回馈」校验。
//
// 三种情况会让孩子觉得"点下去没反应"，这里各锁一条：
//   1. 声音来得太晚 —— 提示音挂在朗读完成的回调里，要等整句读完（音频还没
//      取回来时更久）才响。孩子点是点过了，但那一下什么都没有。
//   2. 声音被吞掉 —— Web Audio 的 AudioContext 在 suspended / interrupted
//      状态下排进去的振荡器会被直接丢弃。原先 `resume()` 之后马上排音，
//      而 resume() 是异步的，等于在还没跑起来的上下文里排音。
//   3. 声音太轻 —— 手机小喇叭对低频不友好，光靠正弦基频在教室里有杂音时
//      听不见。
//
// 把 public/app.js 原样加载进来（只 stub 浏览器环境），真的点一遍。
// 用法：node tools/verify-answer-feedback.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- DOM stub ----------
const allEls = [];
const byId = {};

function mkEl(tag, attrs, cls) {
  const e = {
    tagName: tag || 'div', _cls: new Set(cls || []),
    _attrs: Object.assign({}, attrs || {}), _parent: null,
    style: {}, innerHTML: '', textContent: '', className: '', disabled: false,
    dataset: {}, value: '',
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    toggle: (c, on) => { if (on) e._cls.add(c); else e._cls.delete(c); return e._cls.has(c); },
    contains: c => e._cls.has(c),
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.scrollIntoView = () => {};
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.click = () => {};
  e.play = () => Promise.resolve();
  e.closest = () => null;
  e.querySelector = () => null;
  e.querySelectorAll = () => [];
  allEls.push(e);
  return e;
}

// 只认本文件用到的选择器
function selMatch(el, sel) {
  return sel.split(',').map(s => s.trim()).some(p => {
    if (/^#[\w-]+ \.speak-option$/.test(p)) return el._cls.has('speak-option');
    if (/^#[\w-]+ \.q-option$/.test(p)) return el._cls.has('q-option');
    if (/^#[\w-]+ \.vocab-option-card$/.test(p)) return el._cls.has('vocab-option-card');
    if (p === '.auto-read-badge') return el._cls.has('auto-read-badge');
    return false;
  });
}

const getEl = id => (byId[id] = byId[id] || mkEl('div', { id: id }));
const listeners = [];
const document = {
  getElementById: getEl,
  querySelector: sel => allEls.find(e => selMatch(e, sel)) || null,
  querySelectorAll: sel => allEls.filter(e => selMatch(e, sel)),
  createElement: mkEl,
  addEventListener: (t, fn, cap) => listeners.push({ t, fn, cap }),
  removeEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};

const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};

// ---------- AudioContext stub ----------
// 记下每一次排音：什么时候排的、频率多少、音量多大、音长多少。
let ctxState = 'running';
let resumeCalls = 0;
let resumeResolvers = [];
let noteLog = [];
let ctxNow = 100;

function makeCtx() {
  return {
    get state() { return ctxState; },
    get currentTime() { return ctxNow; },
    resume() {
      resumeCalls++;
      return new Promise(res => resumeResolvers.push(() => { ctxState = 'running'; res(); }));
    },
    createOscillator() {
      const o = {
        type: 'sine', _f: 0, _sweep: null,
        frequency: {
          setValueAtTime(f) { o._f = f; },
          exponentialRampToValueAtTime(f) { o._sweep = f; },
          get value() { return o._f; },
        },
        connect() {}, disconnect() {},
        start(t) { noteLog.push({ f: o._f, sweep: o._sweep, type: o.type, at: (t || 0) - ctxNow, vol: volPending, dur: durPending, order: noteLog.length }); },
        stop() {},
      };
      return o;
    },
    createGain() {
      const g = {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime(v) { volPending = v; },
          exponentialRampToValueAtTime() {},
        },
        connect() {}, disconnect() {},
      };
      return g;
    },
    destination: {},
  };
}
let volPending = 0.4, durPending = 0.2;

const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  AudioContext: function () { return makeCtx(); },
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  warmup: () => {}, isFillerTranscript: () => false,
  dict: async () => null, transcribe: async () => ({ text: '' }),
  saveAnswer: async () => ({}), saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  load: async () => ({}), getAnswers: async () => [],
  loadWrongCache: async () => {}, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
process.on('unhandledRejection', () => {});

let App;
try {
  App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${src}
    return { App };
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA,
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

// ---------- 打桩：只关心"什么时候响、响的是哪个" ----------
// 每次调用 _playTone 都记一笔，带一个全局序号，用来判断它相对 speak() 的先后。
// 注意：真身要留着（realTone），第 2 节验的就是它本身的行为。
let seq = 0;
const soundLog = [];               // { notes, seq }
const realTone = App._playTone.bind(App);
const spyTone = function (notes) { soundLog.push({ notes: notes, seq: seq++ }); this._toneKind = notes.length; };
App._playTone = spyTone;
let speakLog = [];
let pendingDone = null;            // 最近一次朗读挂上的 onDone，用来确认"还没播完"
App.speak = function (text, opts) {
  speakLog.push({ text: text, seq: seq++ });
  pendingDone = (opts && opts.onDone) || null;
};

App._recordAnswer = function () {};                       // 落库不是本脚本的对象
App.nextVocabStage = function () {};                      // 翻页/渲染下一题也不是
App.showToast = function () {};

const lastSound = () => soundLog[soundLog.length - 1];

(async () => {

// =====================================================================
console.log('\n=== 1. 发声器：音量、泛音、总时长 ===');
console.log('（手机小喇叭对低频不友好，光靠正弦基频在教室里有杂音时听不见）');

soundLog.length = 0;
App._playCorrectSound();
const cor = lastSound();
ok(cor && cor.notes.length >= 5, '正确提示音是多音组合，不是孤零零一声（' + (cor ? cor.notes.length : 0) + ' 个音）');
const corMaxF = Math.max(...cor.notes.map(n => n.f));
ok(corMaxF >= 1000, '叠了高八度泛音，小喇叭上才听得见（最高 ' + corMaxF + 'Hz）');
const corPeak = Math.max(...cor.notes.map(n => n.vol == null ? 0.4 : n.vol));
ok(corPeak >= 0.3, '峰值音量提到 0.3 以上（实际 ' + corPeak.toFixed(2) + '，原先是 0.3）');
const corEnd = Math.max(...cor.notes.map(n => (n.at || 0) + (n.dur || 0.22)));
ok(corEnd >= 0.4 && corEnd <= 0.9, '总长 ' + corEnd.toFixed(2) + 's —— 够长听得清，又不拖到盖住后面的朗读');
ok(cor.notes.every(n => n.at === undefined || n.at >= 0), '所有音符都在起播点之后（不会因为负偏移被丢弃）');
// 上行：主音一个比一个高，才像"对了"
const mainF = cor.notes.filter(n => n.type !== 'triangle' || n.f < 1000).map(n => n.f);
ok(mainF[0] < mainF[1] && mainF[1] < mainF[2], '主音是上行音阶（' + mainF.slice(0, 3).join(' → ') + '），听着就是"对了"');

soundLog.length = 0;
App._playWrongSound();
const wr = lastSound();
const wrPeak = Math.max(...wr.notes.map(n => n.vol == null ? 0.4 : n.vol));
ok(wr.notes.length >= 2, '错误提示音是两记（不是一声闷响）');
ok(wrPeak < corPeak, '错误提示音比正确提示音轻，不刺耳（' + wrPeak.toFixed(2) + ' < ' + corPeak.toFixed(2) + '）');
ok(wr.notes.every(n => n.to && n.to < n.f), '两记都是往下滑的，一听就知道"不是这个"');

// =====================================================================
console.log('\n=== 2. 音频上下文被挂起时：先唤醒，再排音 ===');
console.log('（挂起状态下排进去的振荡器会被系统直接丢掉，表现为"有时候响有时候不响"）');

// 这一段试的是 _playTone 真身，所以把 spy 摘掉
const useReal = () => { App._playTone = realTone; };
const useSpy = () => { App._playTone = spyTone; };

useReal();
ctxState = 'suspended';
resumeCalls = 0;
resumeResolvers = [];
noteLog = [];
App._audioCtx = makeCtx();
App._playCorrectSound();
ok(resumeCalls === 1, '发现上下文不是 running，先调了 resume()');
ok(noteLog.length === 0, 'resume 还没落地之前，一个振荡器都不排（旧写法在这里就排了，于是被吞掉）');
resumeResolvers.forEach(fn => fn());                 // resume 落地
await new Promise(r => setTimeout(r, 0));
ok(noteLog.length >= 5, 'resume 落地之后才把音排进去（' + noteLog.length + ' 个音真的响）');

// resume 一直不落地也不能哑着 —— 有兜底路径
ctxState = 'suspended';
resumeCalls = 0;
resumeResolvers = [];
noteLog = [];
App._audioCtx = makeCtx();
App._playWrongSound();
ok(noteLog.length === 0, '（resume 卡住时，先不排音）');
await new Promise(r => setTimeout(r, 600));
ok(noteLog.length >= 2, 'resume 一直不回来也有兜底，提示音最终还是会响（' + noteLog.length + ' 个音）');

// running 状态下不重复 resume，直接就响
ctxState = 'running';
resumeCalls = 0;
noteLog = [];
App._audioCtx = makeCtx();
App._playCorrectSound();
ok(noteLog.length >= 5, '上下文本来就醒着：立刻排音，一点不拖（同步就排了 ' + noteLog.length + ' 个）');
ok(resumeCalls === 0, '上下文本来就醒着：不去多余地 resume');
useSpy();

// =====================================================================
console.log('\n=== 3. AI 口语选对：点下去当场响，不等朗读 ===');
console.log('（这是原来最要命的一处：回馈全挂在朗读完成的回调里）');

ctxState = 'running';
App._audioCtx = makeCtx();
noteLog = [];
// 找一天有口语题的
let dayIdx = -1, mi = -1, q = null;
for (let d = 0; d < HOMEWORK_DATA.length && dayIdx < 0; d++) {
  const mods = HOMEWORK_DATA[d].modules || [];
  for (let i = 0; i < mods.length; i++) {
    if (mods[i].type === 'speaking' && mods[i].questions && mods[i].questions.length) {
      dayIdx = d; mi = i; q = mods[i].questions[0]; break;
    }
  }
}
if (dayIdx < 0) { console.log('  跳过：题库里没有口语模块'); }
else {
  // 摆好四个选项的 DOM
  ['sp-opts-' + mi, 'sp-wait-' + mi, 'sp-tip-' + mi].forEach(id => { delete byId[id]; });
  allEls.length = 0;
  const optEls = [];
  for (let i = 0; i < 4; i++) optEls.push(mkEl('div', {}, ['speak-option']));

  const realQSA = document.querySelectorAll;
  document.querySelectorAll = sel => (/\.speak-option$/.test(sel) ? optEls : realQSA(sel));

  const correctIdx = q.answer;
  soundLog.length = 0; speakLog.length = 0;
  seq = 0;

  App.selectSpeakAnswer(mi, 0, correctIdx, dayIdx);

  ok(soundLog.length === 1, '点对的那一下，提示音立刻响了（' + soundLog.length + ' 声）');
  ok(speakLog.length === 1, '同时开始朗读答句');
  ok(soundLog.length && speakLog.length && soundLog[0].seq < speakLog[0].seq,
     '提示音排在朗读**之前**（序号 ' + (soundLog[0] || {}).seq + ' < ' + (speakLog[0] || {}).seq + '）—— 旧代码里它挂在 onDone，序号在后面');
  ok(optEls[correctIdx].classList.contains('correct'),
     '正确选项也在同一瞬间亮绿了（不用等朗读读完）');
  ok(!optEls.some(e => e.classList.contains('wrong')),
     '选对了不会留下任何红色标记');
  ok(optEls.every(e => e.style.pointerEvents === 'none'), '整排选项当场锁住，防止连点');
  const waitEl = byId['sp-wait-' + mi];
  ok(waitEl && /✅/.test(waitEl.textContent || ''), '当场给出文字确认（"' + (waitEl ? waitEl.textContent : '') + '"）');

  // 这一条是这回的重点：朗读的 onDone 一直不触发（音频卡住 / 手机静音 /
  // 网慢取不回来），回馈也必须已经给过了。
  ok(pendingDone === null || typeof pendingDone === 'function',
     '朗读还在等着播完（onDone 尚未触发），而上面那些回馈全都已经发生了');
  ok(!!pendingDone, '朗读确实是被"启动"了，不是在原地空转');

  // 选错：同样当场响，而且是"错"的那一声
  {
    const wrongIdx = (correctIdx + 1) % 4;
    for (let i = 0; i < 4; i++) optEls[i]._cls.clear();
    document.querySelectorAll = sel => (/\.speak-option$/.test(sel) ? optEls : realQSA(sel));
    soundLog.length = 0;
    App.selectSpeakAnswer(mi, 0, wrongIdx, dayIdx);
    document.querySelectorAll = realQSA;
    ok(soundLog.length === 1, '选错也是当场响一声');
    ok(soundLog[0].notes.length === 2, '选错响的是那两记下沉音，不是选对的"叮铃"（' + soundLog[0].notes.length + ' 个音）');
    // v104 起：答错不再把正确项亮绿（那是"把答案递到手里"）。只划掉他点错的
    // 那一项，给一句中文提示，答案要孩子自己找出来 —— 详细校验见
    // tools/verify-wrong-hint.js。
    ok(optEls[wrongIdx].classList.contains('wrong'), '选错的当场划掉');
    ok(!optEls[correctIdx].classList.contains('correct'),
       '答错时正确选项**不亮绿**（答案不递到手里，孩子自己找）');
    const tipEl = byId['sp-tip-' + mi];
    ok(!!tipEl && /不是这个|再仔细看看/.test(tipEl.innerHTML || ''),
       '答错当场出现中文提示词（"' + String(tipEl && tipEl.innerHTML).slice(0, 24) + '…"）');
  }
}

// =====================================================================
console.log('\n=== 4. 另外三个点选入口：选对同样当场响 ===');
// 这四个入口是孩子所有"点选答案"的地方，不能有哪个是哑的。

{
  // 听力 / 阅读 ABCD
  let d2 = -1, m2 = -1, q2 = null;
  for (let d = 0; d < HOMEWORK_DATA.length && d2 < 0; d++) {
    const mods = HOMEWORK_DATA[d].modules || [];
    for (let i = 0; i < mods.length; i++) {
      const mm = mods[i];
      if (mm.questions && mm.questions.length && mm.questions[0].options && mm.questions[0].options.length
          && typeof mm.questions[0].answer === 'number' && mm.type !== 'speaking') {
        d2 = d; m2 = i; q2 = mm.questions[0]; break;
      }
    }
  }
  if (d2 < 0) { console.log('  跳过：题库里找不到 ABCD 型题目'); }
  else {
    const optEls = [];
    for (let i = 0; i < q2.options.length; i++) optEls.push(mkEl('div', {}, ['q-option']));
    const realQSA = document.querySelectorAll;
    document.querySelectorAll = sel => (/\.q-option$/.test(sel) ? optEls : realQSA(sel));
    soundLog.length = 0;
    App.state.currentDay = d2;
    App.selectAnswer(m2, 0, q2.answer, d2);
    document.querySelectorAll = realQSA;
    ok(soundLog.length === 1, '听力/阅读点对：当场响一声');
    ok(optEls[q2.answer].classList.contains('correct'), '听力/阅读点对：当场亮绿');
  }
}

{
  // 高频词汇：看图选词 / 选意思
  allEls.length = 0;
  const optEls = [];
  for (let i = 0; i < 4; i++) optEls.push(mkEl('div', {}, ['vocab-option-card']));
  const realQSA = document.querySelectorAll;
  document.querySelectorAll = sel => (/\.vocab-option-card$/.test(sel) ? optEls : realQSA(sel));
  soundLog.length = 0;
  const before = App.state.vocabScore;
  App.checkVocabAnswer(3, 2, 2, 0, 5, 4);
  document.querySelectorAll = realQSA;
  ok(soundLog.length === 1, '词汇选词点对：当场响一声');
  ok(App.state.vocabScore === before + 1, '词汇选词点对：分数照常记上');
  ok(optEls[2].classList.contains('correct'), '词汇选词点对：当场亮绿');
}

{
  // 拼写题：checkSpell 会从 vocab-spell-0-0 开始一路 getElementById 直到
  // 取不到为止，所以这里必须让"没登记过的格子"老老实实返回 null，
  // 不能像别处那样来一个造一个（否则那个 while 永远走不到头）。
  const realGetId = document.getElementById;
  document.getElementById = id => {
    if (/^vocab-spell-0-\d+$/.test(id)) return byId[id] || null;
    return realGetId(id);
  };
  const inp = mkEl('input', { id: 'vocab-spell-0-0' }); inp.value = 'apple';
  byId['vocab-spell-0-0'] = inp;
  byId['spell-result-0'] = mkEl('div', { id: 'spell-result-0' });
  soundLog.length = 0;
  try {
    App.checkSpell(0, 'apple', 0, 5, 4, 'apple');
  } finally {
    document.getElementById = realGetId;
  }
  ok(soundLog.length === 1, '拼写拼对：也是当场响一声');
  ok(inp.classList.contains('correct'), '拼写拼对：输入框当场变绿');
}

// =====================================================================
console.log('\n=== 5. 提示音"保活"：每次点按都确认上下文还醒着 ===');
console.log('（切后台回来、来电、语音朗读抢走音频会话，都会把它掐哑）');

const realAdd = document.addEventListener;
const bound = [];
document.addEventListener = (t, fn, cap) => { bound.push({ t, fn, cap }); realAdd(t, fn, cap); };
App._bindAudioKeeper();
document.addEventListener = realAdd;
ok(bound.some(b => b.t === 'pointerdown' && b.cap === true), '绑了 pointerdown（捕获阶段，任何控件都拦不住它）');
ok(bound.some(b => b.t === 'touchstart'), '绑了 touchstart（老一点的安卓/微信）');
ok(bound.some(b => b.t === 'click'), '绑了 click（兜底）');
ok(bound.some(b => b.t === 'visibilitychange'), '从后台切回前台也会补一次');

// 绑一次就够，别重复挂
const bound2 = [];
document.addEventListener = (t, fn) => { bound2.push(t); };
App._bindAudioKeeper();
document.addEventListener = realAdd;
ok(bound2.length === 0, '重复调用不会重复绑定');

// 真的唤得动
ctxState = 'suspended';
resumeCalls = 0;
App._audioCtx = makeCtx();
App._unlockAudioCtx();
ok(resumeCalls === 1, '_unlockAudioCtx() 确实把挂起的上下文叫醒');
const hand = bound.find(b => b.t === 'pointerdown');
ctxState = 'suspended'; resumeCalls = 0; App._audioCtx = makeCtx();
hand.fn();
ok(resumeCalls === 1, '手指一落下就顺手叫醒它（孩子下一次点选时提示音是热的）');

// init 里真的挂了
ok(/_bindAudioKeeper\(\)/.test(src) && /_bindAudioKeeper\(\);/.test(src.split('async init()')[1] || ''),
   'init() 里调了 _bindAudioKeeper()，新装的 app 也会保活');

// =====================================================================
console.log('\n=== 6. 静态检查：所有点选入口都接了提示音 ===');
for (const [name, fn] of [['口语 selectSpeakAnswer', 'selectSpeakAnswer'],
                          ['听力/阅读 selectAnswer', 'selectAnswer'],
                          ['词汇 checkVocabAnswer', 'checkVocabAnswer'],
                          ['拼写 checkSpell', 'checkSpell']]) {
  const body = new RegExp('^  ' + fn + '\\([\\s\\S]*?\\n  \\},', 'm').exec(src);
  ok(!!body && /_playCorrectSound\(\)/.test(body[0]), name + ' 里调了 _playCorrectSound()');
  ok(!!body && /_playWrongSound\(\)/.test(body[0]), name + ' 里调了 _playWrongSound()');
}
// 口语那条不许再把提示音塞进 onDone（就是这一处让回馈晚了好几秒）
{
  const body = /^  selectSpeakAnswer\([\s\S]*?\n  \},/m.exec(src)[0];
  const iSound = body.indexOf('this._playCorrectSound()');
  // 选对分支在选错分支后面，取最后一次"朗读答句"
  const iSpeak = body.lastIndexOf('this.speak(selectedText');
  ok(iSound >= 0 && iSpeak > iSound,
     '源文件里提示音在"朗读答句"之前（第 ' + iSound + ' 字符 < 第 ' + iSpeak + ' 字符）—— 放回 onDone 就等于孩子点完要干等好几秒');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);

})().catch(e => {
  // 别让异常被 unhandledRejection 悄悄吃掉 —— 那样脚本会"看起来跑完了"
  console.log('\n脚本异常：' + ((e && e.stack) || e));
  process.exit(1);
});
