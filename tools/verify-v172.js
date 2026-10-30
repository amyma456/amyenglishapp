#!/usr/bin/env node
// ===========================================================================
// verify-v172 —— 单项选择题：选对后系统先读整句，孩子跟读 ≥60 才过；
//                 短语点开就出声，不等网络
//
// 家长原话（2026-10-30 中午 12:04）：
//   「单项选择题生成正确答案之后，也是需要去朗读的，跟之前的阅读理解和完形
//    填空一样，点一下去录音，说完了之后再点一下读完评分。只要有这种跟读的，
//    就进行评分。系统低于60分过不了。看到有这个短语，点了之后能马上出来结果
//    很好。但是点开之后还需要等英文的发音，不需要的，一点之后它就自己主动
//    说出来，不要受网络延时的影响。」
//
// 两件事：
//   A. 单项选择（含语法/KET 这些有 ABCD 的题）：选对 → 系统先把「填好正确
//      答案的整句」读一遍 → 跟读面板（点一下开录、再点一下结束打分）→
//      ≥60 分才解锁下一题。老师预览同样能看到/试这个面板，但不锁翻页。
//   B. 短语点开：意思是本地的（一直很快），读音以前要现场合成 → 现在这一屏
//      渲染时就把短语音频预取好，点下去命中本地音频秒播；万一来不及，先用
//      本机语音立刻读，同时把这条排到队首。
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
const decSeg = appSrc.slice(appSrc.indexOf('  _readingDecide(m, mi, qi, oi, dayIdx) {'),
                            appSrc.indexOf('  _readingDecide(m, mi, qi, oi, dayIdx) {') + 4200);
const selSeg = appSrc.slice(appSrc.indexOf('  selectAnswer(mi, qi, oi, dayIdx) {'),
                            appSrc.indexOf('  selectAnswer(mi, qi, oi, dayIdx) {') + 3000);
const hrSeg = appSrc.slice(appSrc.indexOf('  _holdReadStart(mi, qi, dayIdx, sentence) {'),
                           appSrc.indexOf('  _holdReadStart(mi, qi, dayIdx, sentence) {') + 1400);
const spSeg = appSrc.slice(appSrc.indexOf('  _wordSpans(text) {'),
                           appSrc.indexOf('  _wordSpans(text) {') + 4200);
const npSeg = appSrc.slice(appSrc.indexOf('  _notePhrases(list) {'),
                           appSrc.indexOf('  _notePhrases(list) {') + 1600);
const wsSeg = appSrc.slice(appSrc.indexOf('async _openWordSheet(word) {'),
                           appSrc.indexOf('async _openWordSheet(word) {') + 2600);
const phSeg = appSrc.slice(appSrc.indexOf('App._speakPhraseNow = function (text) {'),
                           appSrc.indexOf('App._speakPhraseNow = function (text) {') + 900);

// ---------------------------------------------------------------------------
section('A1. 单项选择选对 → 系统先把整句读一遍');
{
  ok(/selfSpeak\.speak\(sentence\)/.test(decSeg), '正确分支里会朗读整句（speak(sentence)）');
  ok(/setTimeout\(function\(\) \{[\s\S]{0,200}selfSpeak\.speak\(sentence\)/.test(decSeg) === false ||
     decSeg.indexOf('selfSpeak.speak(sentence)') > decSeg.indexOf('_renderHoldReadPanel'),
     '朗读发生在跟读面板端出来之后（先有面板，再出声）');
  ok(/if \(selfSpeak\._holdReadActive\) return;/.test(decSeg),
     '孩子手快先按了跟读：不再放示范（不会盖住他读的声音）');
  // 只有"选对"才读整句 —— 选错必须 return 在朗读之前（否则等于念答案）
  const wrongRet = decSeg.indexOf("if (!isCorrect) {");
  const rightSpeak = decSeg.indexOf('selfSpeak.speak(sentence)');
  ok(wrongRet >= 0 && wrongRet < rightSpeak, '选错分支在朗读整句之前就返回（不会把答案念出来）');
  ok(/if \(pickedText && this\.state\.audioEnabled\) \{\s*this\.speak\(pickedText\)/.test(decSeg),
     '选错照旧只读他点错的那一项');
}

// ---------------------------------------------------------------------------
section('A2. 跟读打分：点一下开录、再点一下结束、低于 60 分过不了');
{
  ok(appSrc.indexOf("'🎤 点我读'") >= 0, '跟读面板有「🎤 点我读」按钮');
  ok(/if \(self\._holdReadActive\) self\._holdReadEnd\(mi, qi, dayIdx\);\s*else self\._holdReadStart\(mi, qi, dayIdx, sentence\)/.test(appSrc),
     '点一下开录、正在录时再点一下就结束（一键录音）');
  ok(/passed: a\.score >= 60 && badWords\.length === 0/.test(appSrc),
     '判定口径：分数 ≥60 且没有读错的词才算过');
  // 低分不放行
  const lowSeg = appSrc.slice(appSrc.indexOf("    // 没通过：有读错的词"),
                             appSrc.indexOf("    // 没通过：有读错的词") + 900);
  ok(/next\.disabled = true/.test(lowSeg), '没通过：底部「下一题」继续锁着');
  ok(/if \(passed\) \{[\s\S]{0,1500}next\.disabled = false/.test(
      appSrc.slice(appSrc.indexOf('  _showHoldReadResult('), appSrc.indexOf('  _showHoldReadResult(') + 5000)),
     '只有通过才解锁「下一题」');
  ok(/_stopCurrentAudio\(\);\s*\n\s*this\._showSpeakingIndicator\(false\);\s*\n\s*Recorder\.warmUp\(\);/.test(hrSeg),
     '开录前先掐掉示范声（示范不会被录进去）');
}

// ---------------------------------------------------------------------------
section('A3. 老师预览也端出跟读面板，但不锁翻页');
{
  const tSeg = selSeg.slice(selSeg.indexOf('if (this.isTeacher())'), selSeg.indexOf('// Student path'));
  ok(tSeg.indexOf("_renderHoldReadPanel(fEl, mi, qi, dayIdx, fsent)") >= 0,
     '老师点对选项：跟读面板照常端出来');
  ok(tSeg.indexOf('_gateUnlock') >= 0, '老师那份面板的门禁当场打开（能直接点读）');
  ok(tSeg.indexOf('stage-next-btn') < 0, '老师预览不碰「下一题」的锁（照样自由翻页）');
}

// ---------------------------------------------------------------------------
section('A4. 短语：渲染时预取音频，点开就出声');
{
  ok(/phrases\.push\(p\.en\)/.test(spSeg), '_wordSpans 把这一屏的短语收集起来');
  ok(/if \(phrases\.length\) this\._notePhrases\(phrases\)/.test(spSeg), '渲染完交给 _notePhrases 去预取');
  ok(/prefetchTts\(arr\[i\], st, 'cf'\)/.test(npSeg), '预取用的是短语母语音色（prefer=cf，和 speak 的键一致）');
  ok(/_spanPhraseTimer/.test(npSeg), '同一屏多次调用攒 120ms 只发一次');
  ok(/_spanPhraseBudget = 24/.test(npSeg), '每一步最多预取 24 条短语（老师预览不会一口气发上百个请求）');
  ok(/if \(this\._speakPhraseNow\) this\._speakPhraseNow\(ph\.en\)/.test(wsSeg),
     '短语弹层走 _speakPhraseNow（先本地音频/本机语音，不等网络）');
}

// ---------------------------------------------------------------------------
section('A5. _speakPhraseNow：命中就播，没命中先出声再补好音色');
{
  ok(!!phSeg, '有 App._speakPhraseNow');
  ok(/if \(App\._ttsBlobs && App\._ttsBlobs\[key\]\) \{ App\.speak\(t, \{ prefer: 'cf' \}\); return; \}/.test(phSeg),
     '本地已有音频 → 直接播（零网络）');
  ok(App_safe('_ttsPrioritize(t, \'cf\', \'\')'), '没命中 → 把这条排到预取队头');
  ok(App_safe('App._speakWordInstant(t)'), '没命中 → 本机语音立刻读（点下去就响）');
}

function App_safe(s) { return appSrc.indexOf(s) >= 0; }

// ---------------------------------------------------------------------------
// 下面是真的跑一遍（DOM 用桩子代替）
section('B. 真跑：单选答对 → 读整句 → 跟读 40 分锁着 / 80 分解锁');
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
    querySelectorAll: sel => (/\.q-option$/.test(sel) ? allEls.filter(e => e._cls.has('q-option')) : []),
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
  // 短语表在 api.js 的 WordHelp 里 —— 不加载它，_wordSpans 认不出短语。
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

  // 找一道单选题
  let mi = -1, day = -1, m = null;
  HOMEWORK_DATA.forEach(function (d, di) {
    (d.modules || []).forEach(function (mm, i) {
      if (!m && mm.type === 'multiple_choice' && mm.questions) { m = mm; mi = i; day = di; }
    });
  });
  if (!m) throw new Error('没有单选题可测');
  App.state = App.state || {};
  App.state.currentDay = day;
  App.state.answers = {};
  App.state.students = [];
  App.state.audioEnabled = true;
  App.state.stepIdx = 0;
  App.isTeacher = () => false;
  // 把"当前屏"对到这道单选题上 —— 解锁逻辑只认"这一屏还是这道题"。
  const steps = App._buildSteps(day);
  const stepAt = steps.findIndex(function (s) { return s.mi === mi && s.qi === 0 && s.kind === 'question'; });
  if (stepAt >= 0) App.state.stepIdx = stepAt;

  const q = m.questions[0];
  const sentence = App._buildReadSentence(m, q);
  ok(!!sentence && /\s/.test(sentence), '单选题能拼出一句完整的跟读句：' + JSON.stringify(sentence));

  for (let k = 0; k < 4; k++) mkEl('div', {}, ['q-option']);
  const follow = getEl('qr-follow-' + mi + '-0');
  const next = getEl('stage-next-btn');
  next.disabled = true;

  let spoken = [];
  const realSpeak = App.speak.bind(App);
  App.speak = function (t, o) { spoken.push(String(t)); if (o && o.onDone) o.onDone(); };

  App.selectAnswer(mi, 0, q.answer, day);
  ok(follow.innerHTML.indexOf('点我读') >= 0, '选对后跟读面板真的出现了');
  ok(next.disabled === true, '选对但还没跟读：底部「下一题」是灰的');

  // 等 260ms 自动朗读
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await wait(360);
  ok(spoken.indexOf(sentence) >= 0, '选对后系统自动朗读了整句（' + JSON.stringify(spoken) + '）');

  // 跟读 40 分 → 仍然锁着
  App._markReadProgress = function () {};
  App._clearReadMarks = function () {};
  App._setSentenceSticky = function () {};
  App._playWrongSound = function () {};
  App._playCorrectSound = function () {};
  App._startWordRepair = function () {};
  App._lastPick = App._lastPick || {};
  App._lastPick[mi + '-0'] = { oi: q.answer, isCorrect: true };
  App._showHoldReadResult(mi, 0, day, sentence, 'something else', 'asr',
    { score: 40, passed: false, badWords: [], align: { items: [] } }, false);
  ok(next.disabled === true, '跟读 40 分：底部「下一题」还是灰的（过不了）');

  App._showHoldReadResult(mi, 0, day, sentence, sentence, 'asr',
    { score: 88, passed: true, badWords: [], align: { items: [] } }, false);
  ok(next.disabled === false, '跟读 88 分：解锁，可以进下一题');

  // 老师预览：同一道题，答对之后也要有面板，且不锁翻页
  App.isTeacher = () => true;
  next.disabled = false;
  const fEl2 = getEl('qr-follow-' + mi + '-0');
  App.selectAnswer(mi, 0, q.answer, day);
  ok(fEl2.innerHTML.indexOf('点我读') >= 0, '老师预览：单选题答对后也端出跟读面板');
  ok(next.disabled === false, '老师预览：不锁「下一题」，照样自由翻页');

  // —— 短语预取真的发得出去：渲染一句话，短语进预取队列 ——
  const pf = [];
  App.prefetchTts = function (t, st, prefer) { pf.push({ t: t, prefer: prefer || '' }); };
  App._spanPhrases = [];
  App._spanPhraseStep = -1;
  App._wordSpans('Every morning I get up early and run in the park.');
  await wait(200);
  const names = pf.map(function (x) { return x.t; });
  ok(names.some(function (t) { return /^get up$/i.test(t); }), '渲染时把短语 get up 排队预取（' + names.join(' / ') + '）');
  ok(names.some(function (t) { return /^in the park$/i.test(t); }), '渲染时把短语 in the park 排队预取');
  ok(pf.every(function (x) { return x.prefer === 'cf'; }), '预取统一用母语音色（键和点开时一致，才能命中）');

  functionalOk = true;
} catch (e) {
  ok(false, '真跑这一段抛错：' + e.message, e.stack && e.stack.split('\n')[1]);
}
}

// ---------------------------------------------------------------------------
runFunctional().then(function () {
  section('C. 短语分支：命中直接播，没命中先出声再补好音色');
  if (functionalOk) {
    ok(/prefer: 'cf' \}\); return; \}/.test(phSeg), '命中本地音频：直接播，不再请求');
    ok(phSeg.indexOf('_speakWordInstant') > phSeg.indexOf('_ttsPrioritize'),
       '没命中：先排预取、再本机语音（下一次点就是母语音色）');
  } else {
    ok(false, 'B 段没跑通，C 段跳过');
  }

  console.log('\n---------------------------------------------');
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
});
