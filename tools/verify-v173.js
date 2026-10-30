#!/usr/bin/env node
// ===========================================================================
// verify-v173 —— 翻译屏（阅读理解逐句 / 完形填空逐句 / 整篇）进屏就自动读英文，
//                 孩子不用再点「听整句英文」，读完自动解锁「说中文」
//
// 家长原话（2026-10-30 下午）：
//   「阅读理解完形填空里头有中文翻译吗？这个只要到这个界面里呢，系统就直接先
//    读出来系统的音，不要让学生来点，减少时滞。学生直接可以听完就说……」
//
// 以前这一屏：先点「🔊 听整句英文」→ 等音频 → 那句「🎤 点一下说中文」才摘锁。
// 多一次点击、多一次等待，孩子还得先明白"要先去点它"。现在：
//   A. 落屏 180ms 后自动读这一句（音频一般是预取好的，基本"落屏即响"）；
//   B. 播完立刻 _gateUnlock；断网/静音时按 _gateFallbackMs 兜底放行，
//      绝不把孩子锁死在这一屏；
//   C. 那颗按钮留着，改名「🔊 再听一遍」，想重听随时点；
//   D. 整篇翻译屏同样自动读全文，一按「开始翻译录音」就把朗读掐掉。
// ===========================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, msg, detail) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg + (detail ? ' —— ' + detail : '')); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const fnAt = (sig, len) => {
  const i = appSrc.indexOf(sig);
  return i < 0 ? '' : appSrc.slice(i, i + (len || 1200));
};
const trSeg = fnAt('  renderTranslateStep(m, mi, si, dayIdx) {', 3000);
const cqSeg = fnAt('  renderClozeTransStep(m, mi, si, dayIdx) {', 3000);
const autoSeg = fnAt('  _autoSpeakTranslate(kind, m, mi, si, dayIdx) {', 1800);
const passSeg = fnAt('  renderPassageStep(m, mi, dayIdx) {', 1200);
const toggleSeg = fnAt('async toggleTranslate(mi) {', 5200);

// ---------------------------------------------------------------------------
section('A1. 阅读逐句翻译屏：不再要求孩子点，按钮改成「再听一遍」');
{
  ok(/🔊 再听一遍/.test(trSeg), '听入口按钮写的是「🔊 再听一遍」（不再叫"听整句英文"）');
  ok(/英文会自动读/.test(trSeg), '提示语告诉孩子"英文会自动读"');
  ok(trSeg.indexOf('英文已经自动读过') >= 0, '底部提示改成"英文已经自动读过，听完再点按钮说中文"');
  ok(!/先点上面「听整句英文」/.test(trSeg), '旧提示「先点上面『听整句英文』」已经删掉');
  // 门禁本身保留（仍然要求"听过"，只是听过由系统自己完成）
  ok(/data-gate="/.test(trSeg) && /gate-locked/.test(trSeg), '「说中文」按钮的门禁仍然挂着（没读过不让说）');
}

// ---------------------------------------------------------------------------
section('A2. 完形填空逐句翻译屏：同样自动读');
{
  ok(/🔊 再听一遍/.test(cqSeg), '完形逐句：按钮也是「🔊 再听一遍」');
  ok(/英文会自动读/.test(cqSeg), '完形逐句：提示"英文会自动读"');
  ok(cqSeg.indexOf('英文已经自动读过') >= 0, '完形逐句：底部提示同样改口');
  ok(!/先听一遍英文，自己想清楚意思/.test(cqSeg), '完形逐句：旧提示已删掉');
}

// ---------------------------------------------------------------------------
section('A3. 进入这一屏就触发自动朗读（renderStep 的两个分支）');
{
  const t = appSrc.indexOf("} else if (step.kind === 'translate') {");
  const tSeg2 = appSrc.slice(t, t + 700);
  ok(t >= 0 && /_autoSpeakTranslate\('translate'/.test(tSeg2), 'translate 分支：渲染后调用 _autoSpeakTranslate');
  ok(tSeg2.indexOf("document.getElementById('trs-btn-'") >= 0,
     'translate 分支：先确认这一屏还在（已经翻走就不念）');

  const c = appSrc.indexOf("} else if (step.kind === 'cqtrans') {");
  const cSeg2 = appSrc.slice(c, c + 800);
  ok(c >= 0 && /_autoSpeakTranslate\('cqtrans'/.test(cSeg2), 'cqtrans 分支：渲染后调用 _autoSpeakTranslate');
  ok(cSeg2.indexOf("document.getElementById('cqtrs-btn-'") >= 0,
     'cqtrans 分支：同样先确认这一屏还在');

  ok(/setTimeout\(function\(\) \{[\s\S]{0,260}_autoSpeakTranslate/.test(tSeg2),
     '朗读放在 setTimeout 里（等 DOM 落定再出声）');
}

// ---------------------------------------------------------------------------
section('A4. _autoSpeakTranslate 的实现要点');
{
  ok(!!autoSeg, '有 App._autoSpeakTranslate');
  ok(/const isCq = kind === 'cqtrans'/.test(autoSeg), '按 kind 分阅读 / 完形两条路');
  ok(/this\._clozeFillSentence\(m, sent, false\) \|\| sent/.test(autoSeg),
     '完形：读的是填满空之后的完整句（和屏上显示的一致）');
  ok(/const pair = \(this\._pairSentences\(m\) \|\| \[\]\)\[si\]/.test(autoSeg),
     '阅读：读的是这一句原文（和 _stepSpeechText 预取的同一份，才能命中缓存）');
  ok(/if \(!say\) \{ this\._gateUnlock\(gid\); return; \}/.test(autoSeg),
     '这句没有可读英文：直接解锁，不把孩子卡住');
  ok(/setTimeout\(open, this\._gateFallbackMs\(say\) \+ 600\)/.test(autoSeg),
     '兜底：断网/静音时到点也放行');
  ok(/this\.autoSpeak\(say, open\)/.test(autoSeg), '真正朗读走 autoSpeak，播完回调 open');
  ok(autoSeg.indexOf('let opened = false') >= 0, '只解锁一次（onDone 和兜底谁先到都行）');
}

// ---------------------------------------------------------------------------
section('A5. 整篇翻译屏：自动读全文，一按录音就掐掉朗读');
{
  ok(passSeg.indexOf('在线') === -1, 'passage 屏结构未受影响');
  const p = appSrc.indexOf("} else if (step.kind === 'passage') {");
  const pSeg = appSrc.slice(p, p + 700);
  ok(p >= 0 && /autoSpeak\(m\.passage\)/.test(pSeg), 'passage 分支：落屏自动读全文');
  ok(/m\.passage_cn && m\.passage/.test(pSeg), '只有这一屏真有整篇翻译任务时才读');
  ok(/this\._stopCurrentAudio\(\);\s*\n\s*\/\/ v171：开录先把参考翻译/.test(toggleSeg),
     '点「开始翻译录音」先掐掉朗读（示范声不会被录进去）');
}

// ---------------------------------------------------------------------------
// 真跑一段：造一屏逐句翻译，看自动朗读与解锁是不是真发生了
section('B. 真跑：自动朗读 → 播完解锁；没声也有兜底；没句子直接放行');
let functionalOk = false;

async function runFunctional() {
try {
  const allEls = [], byId = {};
  function mkEl(tag, attrs, cls) {
    const e = {
      tagName: tag || 'div', _cls: new Set(cls || []),
      _attrs: Object.assign({}, attrs || {}),
      style: {}, innerHTML: '', textContent: '', className: '', disabled: false,
      dataset: {}, value: '',
    };
    e.classList = {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => { if (on) e._cls.add(c); else e._cls.delete(c); },
      contains: c => e._cls.has(c),
    };
    e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
    e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
    e.appendChild = () => {}; e.remove = () => {}; e.scrollIntoView = () => {};
    e.addEventListener = () => {}; e.removeEventListener = () => {};
    e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.click = () => {};
    e.play = () => Promise.resolve(); e.closest = () => null;
    e.querySelector = () => null; e.querySelectorAll = () => [];
    allEls.push(e); return e;
  }
  const getEl = id => (byId[id] = byId[id] || mkEl('div', { id: id }));
  const document = {
    getElementById: getEl,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: mkEl,
    addEventListener: () => {}, removeEventListener: () => {},
    body: mkEl('body'), documentElement: mkEl('html'),
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
    AudioContext: function () {
      return {
        state: 'running', currentTime: 0, resume: () => Promise.resolve(),
        createOscillator: () => ({ frequency: {}, connect() {}, disconnect() {}, start() {}, stop() {} }),
        createGain: () => ({ gain: {}, connect() {}, disconnect() {} }),
        destination: {},
      };
    },
    speechSynthesis: null, location: { search: '', href: '' },
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  };
  const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
  const Api = {
    warmup: () => {}, isFillerTranscript: () => false, dict: async () => null,
    transcribe: async () => ({ text: '' }), saveAnswer: async () => ({}),
    saveCheckin: async () => ({}), reportWrongQuestion: async () => ({}),
    submitSpeakingScore: async () => ({}), load: async () => ({}),
    getAnswers: async () => [], loadWrongCache: async () => {},
    answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
  };
  const Recorder = {
    supported: () => true, warmUp: () => {}, start: async () => {},
    stop: async () => ({ blob: {}, samples: null }), join: () => null,
    padForAsr: () => null, level: () => 0,
  };
  const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
  const apiSrc = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
  const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
  const WordHelp = new Function('window', 'document', 'navigator', 'localStorage', 'location', 'fetch',
    apiSrc + '; return (typeof WordHelp !== "undefined") ? WordHelp : null;')(
    window, document, navigator, localStorage, window.location, () => new Promise(() => {}));
  process.on('unhandledRejection', () => {});

  const App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, WordHelp, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${appSrc}
    return App;
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA, WordHelp,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  });

  App.state = App.state || {};
  App.state.answers = {};
  App.state.students = [];
  App.state.audioEnabled = true;
  App.state.stepIdx = 0;
  App.isTeacher = () => false;

  // ---- ① 阅读逐句翻译 ----
  let mi = -1, day = -1, m = null, pairs = null;
  HOMEWORK_DATA.forEach(function (d, di) {
    (d.modules || []).forEach(function (mm, i) {
      if (m) return;
      if (mm.type === 'reading' && App._pairSentences(mm) && App._pairSentences(mm).length > 1) {
        m = mm; mi = i; day = di; pairs = App._pairSentences(mm);
      }
    });
  });
  if (!m) throw new Error('找不到能测的阅读逐句翻译');

  App.state.currentDay = day;
  App._gates = {};

  const said = [];
  App.speak = function (t, o) { said.push(String(t)); if (o && o.onDone) o.onDone(); };

  const gidRd = App._gid('trsg', mi, 0);
  App._autoSpeakTranslate('translate', m, mi, 0, day);
  ok(said.length === 1 && said[0] === pairs[0].en,
     '阅读逐句：自动读的就是这一句英文', JSON.stringify(said));
  ok(App._gates[gidRd] === true, '阅读逐句：播完立刻解锁（「说中文」可以点了）');

  // 换一句：读的是那一句，不是第一句
  said.length = 0;
  const gidRd2 = App._gid('trsg', mi, 1);
  App._autoSpeakTranslate('translate', m, mi, 1, day);
  ok(said[0] === pairs[1].en, '换到第 2 句：读的是第 2 句（不会一直念第一句）');
  ok(App._gates[gidRd2] === true, '第 2 句也自动解锁');

  // ---- ② 播不出声（onDone 永远不来）→ 兜底放行 ----
  App.speak = function () { /* 永远不回调，模拟断网 / 静音 */ };
  const gidStuck = App._gid('trsg', mi, 2);
  delete App._gates[gidStuck];
  App._gateFallbackMs = function () { return 0; };
  App._autoSpeakTranslate('translate', m, mi, 2, day);
  ok(App._gates[gidStuck] !== true, '刚进屏：还没放行（正在读）');
  await new Promise(r => setTimeout(r, 700));
  ok(App._gates[gidStuck] === true, '兜底到点：就算一直没声也放行，孩子不会被锁死');

  // ---- ③ 完形填空逐句翻译 ----
  let cm = -1, cmi = -1;
  HOMEWORK_DATA.forEach(function (d, di) {
    (d.modules || []).forEach(function (mm, i) {
      if (cm < 0 && mm.type === 'cloze' && mm.passage) { cm = di; cmi = i; }
    });
  });
  if (cm >= 0) {
    const czm = HOMEWORK_DATA[cm].modules[cmi];
    App.state.currentDay = cm;
    App._gates = {};
    const said2 = [];
    App.speak = function (t, o) { said2.push(String(t)); if (o && o.onDone) o.onDone(); };
    const sents = App._splitSentences(czm.passage);
    App._autoSpeakTranslate('cqtrans', czm, cmi, 0, cm);
    const expect = App._clozeFillSentence(czm, sents[0], false) || sents[0];
    ok(said2[0] === expect, '完形逐句：自动读的是"空都填好"的完整句', JSON.stringify(said2));
    ok(App._gates[App._gid('cqtrsg', cmi, 0)] === true, '完形逐句：同样自动解锁');
  } else {
    ok(false, '找不到完形填空模块');
  }

  // ---- ④ 这一句没有英文 → 直接放行，不朗读 ----
  App.state.currentDay = day;
  App._gates = {};
  let spoke = 0;
  App.speak = function () { spoke++; };
  App._autoSpeakTranslate('translate', { id: 'x', passage: '', passage_cn: '' }, 0, 9, day);
  ok(spoke === 0, '没有可读英文：一声不吭');
  ok(App._gates[App._gid('trsg', 0, 9)] === true, '没有可读英文：照样放行（不会把孩子卡住）');

  functionalOk = true;
} catch (e) {
  ok(false, '真跑这一段抛错：' + e.message, e.stack && e.stack.split('\n')[1]);
}
}

// ---------------------------------------------------------------------------
runFunctional().then(function () {
  section('C. 回归：原来的门禁还在，别被这套自动朗读架空');
  if (functionalOk) {
    ok(/if \(btn && btn\.classList\.contains\('gate-locked'\)\) return;/.test(
        fnAt('  _translateSentence(ev, mi, si) {', 900)) ||
       /contains\('gate-locked'\)\) return;/.test(appSrc),
       '没解到锁之前点「说中文」仍然会被拦（门没被拆掉）');
    ok(/_gateNudge/.test(appSrc), '忘了听就开口：仍有轻提示（_gateNudge）');
    ok(!/this\._trTried/.test(appSrc), 'v170 那套"试过就常驻译文"没有回来（不会剧透）');
  } else {
    ok(false, 'B 段没跑通，C 段跳过');
  }

  console.log('\n---------------------------------------------');
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
});
