#!/usr/bin/env node
// ===========================================================================
// verify-v175 —— 错题本补上"上下文 + 每个选项 + 为什么"
//
// 家长原话（2026-11-01）：
//   「改错本里缺少上下文联系。第一题是听力题，听不出来原文是什么，当然不用
//    写出来 —— 听力不用把听力原文放出来，但是要把听力的内容给展现出来。
//    为什么要选这个空？比如说听数字就用单词把这个数字写出来：数字是三千，
//    就要把 3000 的英文单词写出来，让孩子去把这个 3000 往上填。」
//   「完形填空、阅读理解，你列给我都只有选项 B、A，没有 B 和 A 的具体解释。
//    A 为什么选，也要有一个适当的提示，让老师知道这个题是怎么回事。」
//
// 这里锁住四件事：
//   A. 听力：给关键信息（数字转英文）+ 挖空骨架 + 再听一遍，但不摊原文；
//   B. 阅读/完形：原文摆出来，依据句标黄；
//   C. 选项：A/B/C/D 全列，正确的打勾、选错的标出来，每项都写清差在哪；
//   D. 老师端 / 打印卷同一套逻辑，打印卷不给答案、只给上下文。
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

const BASE = path.join(ROOT, 'public') + path.sep;
const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');

// ---------------------------------------------------------------------------
// 把 app.js 真的跑起来（只桩浏览器环境），纯函数直接调
// ---------------------------------------------------------------------------
const byId = {};
function mkEl(tag) {
  const e = {
    tagName: tag || 'div', style: {}, innerHTML: '', textContent: '', value: '', dataset: {},
    _cls: new Set(), _attrs: {},
  };
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
const ls = {};
const localStorageStub = {
  getItem: k => (k in ls ? ls[k] : null),
  setItem: (k, v) => { ls[k] = String(v); },
  removeItem: k => { delete ls[k]; },
};
const windowStub = {
  addEventListener: () => {}, removeEventListener: () => {},
  location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  speechSynthesis: null,
};

let App = null, DATA = null, loadErr = '';
try {
  const mod = new Function('stubs', `
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
  App = mod.App;
  DATA = mod.HOMEWORK_DATA;
} catch (e) {
  loadErr = e.message;
}
process.on('unhandledRejection', () => {});

// ---------------------------------------------------------------------------
section('0. 版本与装载');
ok(/content="187"/.test(htmlSrc), 'index.html 版本钉子 = 175');
ok(/amy-english-v187/.test(swSrc) && /var V = 187;/.test(swSrc), 'sw.js 缓存名与 V = 175');
ok(!loadErr, 'app.js 能完整装载（含 data.js / api.js）', loadErr);
ok(App && DATA && DATA.length === 7, '拿到 7 天题库');

if (!App || !DATA) {
  console.log('\n装载失败，后面的断言全部跳过');
  process.exit(1);
}

// ---------------------------------------------------------------------------
section('A. 听力：给内容、不给原文');

ok(typeof App._numToEnglish === 'function', '有 _numToEnglish（数字转英文）');
ok(App._numToEnglish(3000) === 'three thousand', '3000 → three thousand（家长点名的这个）',
  App._numToEnglish(3000));
ok(App._numToEnglish(20) === 'twenty', '20 → twenty');
ok(App._numToEnglish(100) === 'one hundred', '100 → one hundred');
ok(App._numToEnglish(1500) === 'one thousand five hundred', '1500 → one thousand five hundred',
  App._numToEnglish(1500));
ok(App._numToEnglish(203040) === 'two hundred and three thousand and forty'
  || App._numToEnglish(203040).indexOf('two hundred') === 0, '六位数能拆开念', App._numToEnglish(203040));

// 找一道"听数字"的听力题：正确项里带 3000
// v178 注：原来只在「当前周」里找 —— 11-02 起当前周切到 W6，W5 的那道
// oracle bones 听力题就不在 DATA 里了，断言会随日期假死。改成跨全部周找。
const ALL_WEEKS = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
let listenQ = null, listenM = null, listenDi = -1;
ALL_WEEKS.forEach(wk => wk.forEach((day, di) => day.modules.forEach(m => {
  if (m.type !== 'listening' || listenQ) return;
  (m.questions || []).forEach(q => {
    if (listenQ) return;
    if (!Array.isArray(q.options)) return;
    const correct = q.options[Number(q.answer)] || '';
    if (/\b3000\b/.test(correct)) { listenQ = q; listenM = m; listenDi = di; }
  });
})));
ok(!!listenQ, '题库里找到一道"听数字"的听力题');

if (listenQ) {
  const keys = App._errListenKeys(listenQ);
  ok(keys.some(k => k.en === 'three thousand'), '关键信息里把 3000 写成 three thousand',
    JSON.stringify(keys.map(k => k.en)));
  ok(keys.some(k => /3000/.test(k.cn || '')), '中文提示里标了"数字 3000"（孩子知道要填哪个数）',
    JSON.stringify(keys.map(k => k.cn)));

  const frame = App._errListenFrame(listenQ);
  ok(!!frame && /ef-blank/.test(frame.html), '骨架句把关键信息挖成了空');
  ok(!!frame && frame.html.indexOf('3000') < 0, '骨架句里不出现 3000（不白送答案）');
  ok(!!frame && /years ago/.test(frame.html), '骨架句保留句子主干（孩子能顺着回想）');

  const ctx = App._errContextHtml(listenM, listenQ);
  ok(/🎧 再听一遍/.test(ctx), '错题卡上有「再听一遍」');
  // data-say 是给播放用的属性，不是给孩子看的字 —— 掰掉它再判断有没有摊原文
  ok(!/People wrote on oracle bones more than 3000 years ago/.test(ctx.replace(/data-say="[^"]*"/g, '')),
    '卡面上不摊听力原文整句（只有挖空的骨架）');
  ok(/err-key/.test(ctx) && /three thousand/.test(ctx), '关键信息以词条形式给出（可点发音）');

  // 带角色标签的对话：念之前要剥掉 Boy: / Woman:
  const strip = App._errNoSpeakers('Boy: How much is it? Woman: Twenty yuan.');
  ok(!/Boy:/.test(strip) && !/Woman:/.test(strip) && /How much is it/.test(strip),
    '「再听一遍」会先剥掉 Boy:/Woman: 这种角色标签', strip);
}

// ---------------------------------------------------------------------------
section('B. 阅读/完形：原文在，依据句标黄');

let readQ = null, readM = null;
let clozeQ = null, clozeM = null;
DATA.forEach(day => day.modules.forEach(m => {
  if (m.type === 'reading' && !readQ && m.passage && m.questions && m.questions.length) {
    readQ = m.questions[0]; readM = m;
  }
  if (m.type === 'cloze' && !clozeQ && m.passage && m.questions && m.questions.length) {
    clozeQ = m.questions[0]; clozeM = m;
  }
}));

ok(!!readQ, '题库里找到阅读理解题');
if (readQ) {
  const ctx = App._errPassageHtml(readM, readQ);
  ok(/📄 原文/.test(ctx), '阅读错题卡带原文块');
  ok(/<mark>/.test(ctx), '依据句用 <mark> 标出来了');
  ok(/依据在/.test(ctx), '标题直接写出"依据在第几句"');
  ok(ctx.length > 200, '原文是整段摆出来的，不是一句摘要');
}

ok(!!clozeQ, '题库里找到完形填空题');
if (clozeQ) {
  const ctx = App._errPassageHtml(clozeM, clozeQ);
  const no = (String(clozeQ.question).match(/^\s*(\d+)/) || [])[1];
  ok(/<mark>/.test(ctx), '完形错题卡也把空格所在的句子标出来了');
  ok(!!no && new RegExp(no + '\\s*_+').test(ctx.replace(/<[^>]+>/g, '')), '标黄的句子里就是第 ' + no + ' 空那一句');
  ok(clozeM.passage.length <= 480 ? /err-para/.test(ctx) : /err-more/.test(ctx),
    '整段原文要么直接摊开，要么能展开看全（不留半截）');
}

// ---------------------------------------------------------------------------
section('C. 选项：A/B/C/D 全列 + 每项都说清');

const q4 = { question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'went'], answer: 1, explanation_cn: '第三人称单数用 goes。' };
const optHtml = App._errOptionsHtml(q4, 0);
ok(/<span class="k">A<\/span>/.test(optHtml) && /<span class="k">D<\/span>/.test(optHtml),
  '四个选项 A/B/C/D 全部列出来了');
ok(/goes/.test(optHtml) && /going/.test(optHtml) && /went/.test(optHtml), '每个选项的文字都在（不再只给一个字母）');
ok(/✔ 正确答案/.test(optHtml), '正确项标了 ✔');
ok(/✗ 你选的/.test(optHtml), '孩子选错的那一项标了「你选的」');
ok((optHtml.match(/err-opt-note/g) || []).length >= 4, '每一项下面都有说明（含正确项）');
ok(/依据：/.test(optHtml), '正确项写了"依据"——为什么是它');
ok(/go<\/b> → <b>goes|goes<\/b>/.test(optHtml), '错项写了"差在哪"（go → goes）');

const pairs = App._errDiffPairs('The Palace Museum', 'The Summer Palace');
ok(pairs.length >= 1, '_errDiffPairs 能对齐两个选项');
const cut = App._errTrimPair('The Palace Museum', 'The Summer Palace');
ok(cut.from === 'Palace Museum' && cut.to === 'Summer Palace',
  '多处差异会剥掉共同的头尾（Palace Museum → Summer Palace）', JSON.stringify(cut));

ok(/<em class="dif">paper<\/em>/.test(App._errMarkOther(
  'People wrote on oracle bones more than 3000 years ago.',
  'People wrote on paper more than 3000 years ago.').html), '错项里不同的词标红了');

const hint = App._errWordHint('wrote');
ok(/write 的过去式/.test(hint), '能查到词形的直接说清（wrote 是 write 的过去式）', hint);

// ---------------------------------------------------------------------------
section('D. 讲题提示：每种题型一句能照着说的话');

const tips = {};
['listening', 'reading', 'cloze', 'tense', 'grammar', 'speaking'].forEach(t => {
  tips[t] = App._errTeachTip({ type: t }, { explanation_cn: '这里是考点。后面还有解释。' });
  ok(!!tips[t] && tips[t].length > 20, t + ' 有讲题提示');
});
const uniq = new Set(Object.values(tips));
ok(uniq.size >= 5, '不同题型给的是不同的话（不是一句套所有）');
ok(/考点：/.test(tips.grammar), '提示里先说考点');
ok(/先让孩子|带孩子|让孩子/.test(tips.grammar), '提示里给的是动作，不是空话');

// ---------------------------------------------------------------------------
section('E. 一张完整的错题卡');

const card = App._errCard({
  day: '周日', module: listenM.name_cn, m: listenM, q: listenQ, dayIdx: listenDi,
  picked: 1, allowPractice: true,
}, 0);
ok(/err-head/.test(card) && /err-ctx/.test(card) && /err-stem/.test(card)
  && /err-opts/.test(card) && /err-why/.test(card), '卡片结构：出处 / 上下文 / 题目 / 选项 / 讲解');
ok(/2026-|\[周/.test(card), '卡片上带着具体日期，能对应到是哪天的作业');
ok(!/正确答案：B</.test(card), '不再出现原来那种只有「正确答案：B」的一行');
ok(/讲题提示/.test(card), '卡片带讲题提示');

// 学生端：整页都用这套卡
const myErrSeg = appSrc.slice(appSrc.indexOf('  renderMyErrors() {'), appSrc.indexOf('  practiceSimilar(idx) {'));
ok(/_errCard\(/.test(myErrSeg), '我的错题本用 _errCard 渲染');
ok(!/正确答案：' \+ \(e\.q\.options \? String\.fromCharCode/.test(myErrSeg), '旧的「只给答案字母」写法已经删掉');
ok(/picked: a\.value/.test(myErrSeg), '把"孩子选的哪一项"传进卡片');

// 老师端：同一套
const tErrSeg = appSrc.slice(appSrc.indexOf('  async renderErrorBook() {'), appSrc.indexOf('  // ===== Teacher: Error sheet'));
ok(/_errCard\(/.test(tErrSeg), '老师端班级错题本也用同一套卡片');
ok(/students: wrongStudents/.test(tErrSeg), '老师端保留"哪几个学生错了"');

// 打印卷：给上下文，不给答案
const a4Listen = App._errA4ContextHtml(listenM, listenQ);
ok(!!a4Listen && /听力/.test(a4Listen), '打印卷上听力题带上下文');
ok(a4Listen.indexOf('three thousand') < 0, '打印卷不印英文答案（孩子自己写）');
ok(/数字 3000/.test(a4Listen), '打印卷给中文提示，孩子把英文填回去');
const a4Read = App._errA4ContextHtml(readM, readQ);
ok(/原文/.test(a4Read) && a4Read.indexOf(readM.passage.slice(0, 30)) > 0, '打印卷把原文印在题目前面');
const printSeg = appSrc.slice(appSrc.indexOf('  async genErrorSheet(sid) {'), appSrc.indexOf('  toggleAnswers(sid, errCount, simCount) {'));
ok(/_errA4ContextHtml\(/.test(printSeg), '错题卷打印真的调了这一套');

// ---------------------------------------------------------------------------
section('F. 样式');

['.err-ctx', '.err-frame', '.ef-blank', '.err-key', '.err-opt.ok', '.err-opt.picked',
  '.err-opt-note', '.err-tip', '.a4-ctx'].forEach(sel => {
  ok(htmlSrc.indexOf(sel) >= 0, '样式里有 ' + sel);
});
ok(/v175/.test(htmlSrc), 'index.html 有 v175 的样式注释块');

// ---------------------------------------------------------------------------
console.log('\n' + (fail === 0 ? '✅ 全部通过' : '❌ 失败 ' + fail + ' 条') + '  (' + pass + ' passed, ' + fail + ' failed)');
process.exit(fail === 0 ? 0 : 1);
