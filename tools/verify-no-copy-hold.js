/* eslint-disable */
// 回归红线（v129）：长按朗读不能被浏览器的「复制 / 选中」抢走。
//
// 家长 2026-10-16 原话：「英语打卡平台按住说中文这里，因为在浏览器1点它就会显示
// 复制，导致很多次点了之后并不能读，而是一直点复制，导致进程加慢。有的浏览器不会
// 这样，但是有的就是这样。这块给改进一下。」
//
// 这条 bug 的机理（三层，缺一层都治不好）：
//   ① 长按那一下浏览器**先**发 selectstart / 开始选词，**再**弹「复制」菜单。
//   ② 菜单一出来，指针被系统接管 → 我们的 pointerup 永远收不到 →
//      录音一直挂着，孩子得等看门狗超时才恢复（这就是"进程加慢"）。
//   ③ 家长按的是**句子**（那句英文就在按钮正上方），而句子当时可被选中。
//
// 所以这条测试钉四件事：
//   A. CSS：整页不可选中；输入框/可编辑区**必须**还能选中（否则登录、填词、作文全废）。
//   B. CSS：句子、单词、格子、朗读按钮这些"朗读区"显式钉死 user-select / touch-callout。
//   C. JS：selectstart / dragstart / contextmenu 三个入口都真的挂上了拦截，
//      而且**放行输入框**（别一刀切）。
//   D. JS：指针被抢走时能自愈 —— pointercancel / blur / visibilitychange /
//      lostpointercapture 任一发生都要收尾；非自动收的屏超时上限也要收紧。
//
// 用法：node tools/verify-no-copy-hold.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub（照 verify-fast-hold 的写法，够用就好） ----------
function el(tag) {
  const e = {
    tagName: (tag || 'div').toUpperCase(), _cls: new Set(), style: {}, _attrs: {},
    innerHTML: '', textContent: '', disabled: false, id: '', isContentEditable: false,
    classList: {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => on ? e._cls.add(c) : e._cls.delete(c),
      contains: c => e._cls.has(c),
    },
    querySelector: () => null, querySelectorAll: () => [],
    closest: () => null,
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
bodyEl.appendChild = c => { bodyEl.children.push(c); c.remove = () => bodyEl.removeChild(c); };
bodyEl.removeChild = c => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };

// 记录所有挂到 document / window 上的监听器，后面直接叫它们
const docListeners = {};
const winListeners = {};
const document = {
  getElementById: id => {
    const kid = bodyEl.children.find(c => c.id === id);
    if (kid) return kid;
    return (byId[id] = byId[id] || el('div'));
  },
  querySelector: () => null, querySelectorAll: () => [],
  createElement: el,
  addEventListener: (t, fn) => { (docListeners[t] = docListeners[t] || []).push(fn); },
  removeEventListener: () => {},
  body: bodyEl, documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const window = {
  addEventListener: (t, fn) => { (winListeners[t] = winListeners[t] || []).push(fn); },
  removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: t => !t,
  saveAnswer: async () => ({ recorded: true }), saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}), submitSpeakingScore: async () => ({}),
  uploadRecording: () => Promise.resolve({}), dict: async () => null,
  transcribe: async () => ({ text: 'x' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
};
let lastLevelCb = null, stopCalls = 0;
const Recorder = {
  supported: () => true, warmUp: () => {},
  start: async (opts) => { lastLevelCb = (opts && opts.onLevel) || null; return {}; },
  stop: async () => { stopCalls++; return { blob: { size: 1 }, samples: null }; },
  join: () => null, padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS, CN: CLOZE_SENTENCE_CN };')();
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, CLOZE_SENTENCE_CN, VOCAB_HINTS, URL, fetch, Cloud,
          SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA: scope.WEEKS[2], CLOZE_SENTENCE_CN: scope.CN, VOCAB_HINTS: {},
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
App.isTeacher = () => false;
App.speak = (t, o) => { if (o && o.onDone) o.onDone(); };

// 取 CSS 里某条规则**整条**（选择器 + 声明块）。
// 注意：源码里的选择器列表可能是**折行**写的（如"朗读区"那条，逗号后换行），
// 所以要连同选择器一起比对、并且把换行压平，否则 indexOf 会漏。
const htmlFlat = htmlSrc.replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');
function cssRule(sel) {
  const key = String(sel).replace(/\s*\n\s*/g, '').replace(/\s{2,}/g, ' ');
  const i = htmlFlat.indexOf(key);
  if (i < 0) return null;
  const j = htmlFlat.indexOf('{', i);
  const k = htmlFlat.indexOf('}', j);
  if (j < 0 || k < 0) return null;
  return { sel: htmlFlat.slice(i, j), body: htmlFlat.slice(j + 1, k) };
}
function cssBlock(sel) {
  const r = cssRule(sel);
  return r ? r.body : null;
}

(async function main() {
  // =========================================================================
  console.log('\n=== A. 整页默认不可选中，但输入框必须还能选（别一刀切） ===');
  {
    const htmlBody = cssBlock('html,body{');
    ok(htmlBody !== null, '找到了 html,body 的禁选规则');
    ok(/user-select:none/.test(htmlBody || ''), 'html,body 关掉了 user-select');
    ok(/-webkit-user-select:none/.test(htmlBody || ''), '带 -webkit- 前缀（iOS Safari / 微信内核要用）');
    ok(/-webkit-touch-callout:none/.test(htmlBody || ''), '关掉了长按呼出菜单（iOS 的 touch-callout）');

    // 关键的负例：输入框 / 可编辑区必须放行
    const editBlock = cssBlock('input,textarea,[contenteditable="true"]{');
    ok(editBlock !== null, '有 input/textarea/contenteditable 的例外规则');
    ok(/user-select:text/.test(editBlock || ''), '★ 输入框仍然可以选中文字（登录、填词、作文都靠它）');
    ok(/-webkit-touch-callout:default/.test(editBlock || ''), '输入框恢复系统长按菜单（要能粘贴）');
  }

  // =========================================================================
  console.log('\n=== B. 朗读区（句子 / 单词 / 格子 / 按钮）显式钉死 ===');
  {
    const rule = cssRule('.hold-zone,.sent-text,');
    const zone = rule ? rule.body : null;
    // 选择器本身就是折行的 —— 断言必须看"选择器 + 声明块"，不能只看第一行
    const sel = rule ? rule.sel : '';
    ok(rule !== null, '找到了"朗读区"这一组选择器');
    ok(/user-select:none/.test(zone || ''), '朗读区不可选中');
    ok(/-webkit-touch-callout:none/.test(zone || ''), '朗读区不弹长按菜单');
    // 家长是按在**句子**上出的问题 —— 句子必须在名单里
    ok(/\.sent-text/.test(sel) && /\.sent-words/.test(sel),
       '★ 句子（.sent-text / .sent-words）在朗读区名单里 —— 家长按的就是这里');
    ok(/\.word-read-btn/.test(sel), '「按住说中文」按钮本身也在名单里');
    ok(/\.spell-box/.test(sel), '拼读格子（div 按钮）也在名单里');
    ok(/\.hold-zone/.test(sel), '★ .hold-zone 这个整片容器也在名单里（翻译屏靠它罩住句子）');

    const word = cssBlock('.sent-words .lk-word,.rd-w,.lk-word{');
    ok(word !== null && /user-select:none/.test(word),
       '★ 可点单词（.lk-word / .rd-w）不可选中 —— 点一下给意思，长按不能变选词');
  }

  // =========================================================================
  console.log('\n=== C. JS 拦截 selectstart / dragstart / contextmenu，且放行输入框 ===');
  {
    // init() 里要真的绑上
    ok(typeof App._bindNoCopy === 'function', '_bindNoCopy 方法存在');
    App._noCopyBound = false;
    docListeners.selectstart = []; docListeners.dragstart = []; docListeners.contextmenu = [];
    docListeners.pointercancel = []; winListeners.blur = []; docListeners.visibilitychange = [];
    App._bindNoCopy();

    ok((docListeners.selectstart || []).length >= 1,
       '★ 挂了 selectstart 拦截（"复制"菜单真正的入口）');
    ok((docListeners.dragstart || []).length >= 1, '挂了 dragstart 拦截（拖选）');
    ok((docListeners.contextmenu || []).length >= 1, '挂了 contextmenu 拦截（长按菜单）');
    ok(App._noCopyBound === true, '重复调用只绑一次（_noCopyBound 置位）');

    // 普通元素：必须被拦
    const mkEv = (target) => ({ target, preventDefault() { this.killed = true; }, killed: false });
    let ev = mkEv(el('div'));
    docListeners.selectstart[0](ev);
    ok(ev.killed === true, '普通元素上 selectstart 被 preventDefault（选词掐掉了）');

    ev = mkEv(el('div'));
    docListeners.contextmenu[0](ev);
    ok(ev.killed === true, '普通元素上 contextmenu 被掐掉（不弹复制菜单）');

    // 输入框：必须放行
    const input = el('input');
    ev = mkEv(input);
    docListeners.selectstart[0](ev);
    ok(ev.killed === false, '★ input 上 selectstart 不拦（否则登录框选不了字）');

    const ta = el('textarea');
    ev = mkEv(ta);
    docListeners.selectstart[0](ev);
    ok(ev.killed === false, '★ textarea 上 selectstart 不拦（作文/填词要能选）');

    // contenteditable
    const ce = el('div');
    ce.isContentEditable = true;
    ev = mkEv(ce);
    docListeners.selectstart[0](ev);
    ok(ev.killed === false, '★ contenteditable 上 selectstart 不拦');

    // 包在输入框里的子元素（真实 DOM 里 target 常是内层节点）
    const wrap = el('div');
    wrap.closest = (sel) => /input|textarea|select|contenteditable/.test(sel) ? el('input') : null;
    ev = mkEv(wrap);
    docListeners.selectstart[0](ev);
    ok(ev.killed === false, '★ 输入框内部的子元素也被放行（靠 closest 判断）');

    ev = mkEv(wrap);
    docListeners.contextmenu[0](ev);
    ok(ev.killed === false, '★ 输入框内部的子元素不拦 contextmenu（要能粘贴）');
  }

  // =========================================================================
  console.log('\n=== D. 指针被系统抢走时能自愈（否则红按钮一直挂着 = "进程加慢"） ===');
  {
    ok((docListeners.pointercancel || []).length >= 1, '挂了 pointercancel → 收尾');
    ok((winListeners.blur || []).length >= 1, '挂了 window blur → 收尾（切了应用）');
    ok((docListeners.visibilitychange || []).length >= 1, '挂了 visibilitychange → 收尾（页面被切走）');

    ok(typeof App.HOLD_MAX_MS === 'number' && App.HOLD_MAX_MS <= 10000,
       '★ 非自动收的屏超时上限收到 10 秒以内（原来 15 秒），实际 ' + App.HOLD_MAX_MS + 'ms');
    ok(App.HOLD_MAX_MS > App.AUTO_STOP_CAP_MS,
       '但要比"自动收"上限长（自动收那几屏本来就短）');

    // 真跑一遍：录音中 → 触发 bail → 应该收尾（_holdKey 清空 + 调了 stop）
    const press = () => ({ preventDefault() {}, pointerId: 1,
      currentTarget: { setPointerCapture() {}, addEventListener() {}, removeEventListener() {}, _cls: new Set() } });
    App._holdKey = null; stopCalls = 0;
    App._holdStart(press(), 'unit-t-0', '测试句', getEl('h-status'), function () {}, true, 'zh');
    ok(App._holdKey === 'unit-t-0', '按下后进入录音态（_holdKey 有值）');

    // 模拟"弹了复制菜单 / 切了应用"——指针被抢走
    docListeners.pointercancel[0]({ preventDefault() {} });
    await new Promise(r => setTimeout(r, 30));
    ok(App._holdKey === null, '★ pointercancel 之后录音态被清掉（红按钮不会一直挂着）');

    // visibilitychange 那条路
    document.hidden = true;
    App._holdKey = null; stopCalls = 0;
    App._holdStart(press(), 'unit-t-1', '测试句2', getEl('h-status-2'), function () {}, true, 'zh');
    ok(App._holdKey === 'unit-t-1', '第二次按下进入录音态');
    docListeners.visibilitychange[0]({});
    await new Promise(r => setTimeout(r, 30));
    ok(App._holdKey === null, '★ 页面被切走（visibilitychange）也会收尾');
    document.hidden = false;

    // blur 那条路
    App._holdKey = null;
    App._holdStart(press(), 'unit-t-2', '测试句3', getEl('h-status-3'), function () {}, true, 'zh');
    winListeners.blur[0]({});
    await new Promise(r => setTimeout(r, 30));
    ok(App._holdKey === null, '★ 失焦（blur）也会收尾');
  }

  // =========================================================================
  console.log('\n=== E. lostpointercapture：指针被接管的最直接信号 ===');
  {
    // 这一条挂在被按的元素上（不是 document），所以直接看 _holdStart 有没有装
    const src2 = fs.readFileSync(BASE + 'app.js', 'utf8');
    ok(src2.indexOf('lostpointercapture') >= 0,
       '★ 代码里装了 lostpointercapture 监听（capture 被系统收走 = 收不到 pointerup）');
    ok(/_holdCapEl/.test(src2), '记住了被按元素，收尾时要解绑（别越积越多）');

    // 行为层验证：给一个会记录监听的按钮，按下后必须挂上 lostpointercapture
    let gotLost = null, removed = false;
    const btn = {
      preventDefault() {}, _cls: new Set(),
      style: {}, dataset: {},
      setPointerCapture() {},
      addEventListener: (t, fn) => { if (t === 'lostpointercapture') gotLost = fn; },
      removeEventListener: (t) => { if (t === 'lostpointercapture') removed = true; },
      classList: { add() {}, remove() {}, contains: () => false },
      getAttribute: () => null, setAttribute() {},
    };
    App._holdKey = null;
    App._holdStart({ preventDefault() {}, pointerId: 7, currentTarget: btn },
      'unit-t-3', '测试句4', getEl('h-status-4'), function () {}, true, 'zh');
    ok(typeof gotLost === 'function', '★ 按下时给按钮挂上了 lostpointercapture');
    ok(App._holdKey === 'unit-t-3', '此时在录音态');

    gotLost({ preventDefault() {} });
    await new Promise(r => setTimeout(r, 30));
    ok(App._holdKey === null, '★ 一旦丢了 pointer capture 就收尾（最直接的那条路）');
    ok(removed === true, '收尾时把 lostpointercapture 监听解掉了');
  }

  // =========================================================================
  console.log('\n=== F. 回归：正常松手仍然是"收尾"的唯一主路 ===');
  {
    const btn = {
      preventDefault() {}, _cls: new Set(), style: {}, dataset: {},
      setPointerCapture() {}, addEventListener() {}, removeEventListener() {},
      classList: { add() {}, remove() {}, contains: () => false },
      getAttribute: () => null, setAttribute() {},
    };
    let done = null;
    App._holdKey = null; stopCalls = 0;
    App._holdStart({ preventDefault() {}, pointerId: 9, currentTarget: btn },
      'unit-t-4', 'B', getEl('h-status-5'),
      function (out, text) { done = { out, text }; }, true, 'en', 'B', 'cf');
    await new Promise(r => setTimeout(r, 180));      // 过掉 140ms 的"太快"门槛
    await App._holdEnd({ preventDefault() {} });
    await new Promise(r => setTimeout(r, 30));
    ok(App._holdKey === null, '松手后录音态清空（主路没被新逻辑破坏）');
    ok(done !== null, '★ 松手仍然会出结果回调（评分主路完好）');
    ok(stopCalls >= 1, '★ 松手真的调了 Recorder.stop（录音被正常收走）');
  }

  // =========================================================================
  console.log('\n=== G. 翻译屏的标题容器带上了 hold-zone（句子被包进禁选区） ===');
  {
    App.state.currentDay = 0;
    App.isTeacher = () => false;
    App.state.answers = {};
    const m = { id: 'x-cloze', type: 'cloze', passage: 'Grandpa Wang lives near a small lake.',
                questions: [], passage_cn: null };
    const h1 = App.renderClozeTransStep(m, 0, 0, 0);
    ok(/hold-zone/.test(h1), '★ 完形填空翻译屏的容器带 hold-zone');
    ok(/点一下说中文/.test(h1), '这屏确实有「点一下说中文」按钮');
  }

  console.log('\n' + (fail === 0 ? '全部通过 ✅' : (fail + ' 项没通过 ❌')));
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('  !! 测试自身崩了：' + (e && e.stack || e)); process.exit(1); });
