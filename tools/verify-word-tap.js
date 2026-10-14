/* eslint-disable */
// 点词查义 + 舞台滚动 + 读错单词修复的校验（v109）。
//
// 家长的原话：
//   1.「阅读理解，这里读错的单词识别的不准，然后界面不能滑动」
//   2.「比如说，读错的单词点出错的单词来读，整个界面要好看，能看见单词」
//   3.「只要是有单词句子的地方，点单词就能够出现单词的意思，这个界面里头
//      点单词是不行的，因为一点就是整个句子的发音」
//
// 于是要钉住四件事：
//   A. 有英文单词/句子的地方，词都可点（.lk-word），且句子本体不再兼任
//      "听示范"入口（data-listen / data-nolookup 必须从这些地方消失）；
//   B. 听整句改由独立的 .gate-listen 按钮承担，示范内容（data-say）就是整句；
//   C. 舞台里会变长的几块必须能滚（stage-body 是 overflow:hidden，子元素
//      不收缩就被整块裁掉 —— "界面不能滑动"就是这个）；
//   D. 读错的单词：判得更宽（转写里任意位置命中即算过）、孤立单词走 CF、
//      连错 3 次自动放行（识别不准不能把孩子锁死）。
//
// 用法：node tools/verify-word-tap.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub（与 verify-wrong-hint.js 同一套路）
// ---------------------------------------------------------------------------
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
  e.appendChild = () => {}; e.remove = () => {};
  e.scrollIntoView = function () { e.scrolled = true; };
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = function (pos, html) { e.innerHTML += html; e._inserted = (e._inserted || '') + html; };
  e.focus = () => {}; e.click = () => {}; e.play = () => Promise.resolve();
  e.closest = () => null; e.querySelector = () => null; e.querySelectorAll = () => [];
  allEls.push(e);
  return e;
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
  AudioContext: function () { return null; },
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
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
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

// 找一屏阅读和一份写作
const READ = { day: 0, mi: HOMEWORK_DATA[0].modules.findIndex(m => m.passage && m.type === 'reading') };
const WRITE = { day: 4, mi: HOMEWORK_DATA[4].modules.findIndex(m => m.type === 'writing_template') };

// ---------------------------------------------------------------------------
console.log('=== 1. _wordSpans：把词包成可点的盒子，标点留在外面 ===');
{
  const h = App._wordSpans("Sam's grandfather lives in a lighthouse.");
  const words = (h.match(/class="lk-word"/g) || []).length;
  ok(words === 6, '6 个词各自一个词盒（实际 ' + words + ' 个）');
  ok(h.indexOf('<span class="lk-word">Sam\'s</span>') >= 0, "撇号属于词本身（Sam's 整块）");
  ok(h.indexOf('</span>.') >= 0, '句末的句号留在词盒外面（不能拿 "lighthouse." 去查词）');
  ok(h.indexOf('<span class="lk-word">a</span>') >= 0, '单个字母的词（a）也包 —— 孩子点了也能听到读音');
  ok(h.indexOf('  ') < 0 || /<\/span>\s<span/.test(h), '词间保留空格，排版不粘在一起');

  // HTML 转义：数据里有 & < > 也不能变成标签
  const esc = App._wordSpans('Tom & Jerry <b>ok</b>');
  ok(esc.indexOf('<b>') < 0 && esc.indexOf('&amp;') >= 0, '词里的特殊字符被转义（不会注入标签）');
}

console.log('\n=== 2. 阅读逐句屏：词可点，听整句是独立按钮 ===');
{
  const m = HOMEWORK_DATA[READ.day].modules[READ.mi];
  const sents = App._splitSentences(m.passage);
  App.state.currentDay = READ.day;
  const html = App.renderSentenceStep(m, READ.mi, 0, READ.day);

  ok(html.indexOf('data-nolookup') < 0, '不再屏蔽点词查义（data-nolookup 移除）');
  ok(html.indexOf('data-listen="1"') < 0, '句子本体不再兼任听入口（data-listen 移除）');
  ok(html.indexOf('class="sent-text sent-words"') >= 0, '句子块带上 sent-words（词盒容器）');
  ok((html.match(/class="lk-word"/g) || []).length >= 5, '句子里的词都包成了可点词盒');

  const say = /class="gate-listen"[^>]*data-say="([^"]*)"/.exec(html);
  ok(!!say && say[1].replace(/&amp;/g, '&') === sents[0], '有一颗独立 🔊 按钮，示范内容就是这一整句');
  ok(/data-gate="sentg@/.test(html), '🔊 按钮挂着门禁 id（先听后读照旧成立）');
  const gate = /data-gate="(sentg@[^"]*)"/.exec(html);
  ok(html.indexOf('gate-locked" data-gate="' + gate[1] + '"') >= 0, '跟读按钮仍然锁着，等这一句听完才解锁');
  ok(html.indexOf('点单词看中文意思') >= 0, '界面上写明了"点单词看意思"（孩子不用猜）');
}

console.log('\n=== 3. 翻译句 / 整篇 / 题干阅读材料 / 写作朗读：一样能点词 ===');
{
  const m = HOMEWORK_DATA[READ.day].modules[READ.mi];
  const tr = App.renderTranslateStep(m, READ.mi, 0, READ.day);
  ok((tr.match(/class="lk-word"/g) || []).length >= 5, '翻译句里的词可点');
  ok(tr.indexOf('onclick="App.speak(') < 0, '翻译句不再整块绑 onclick（那会挡掉查词）');
  ok(/class="gate-listen"[^>]*data-say="/.test(tr), '翻译句另给一颗「听整句英文」按钮');

  const ps = App.renderPassageStep(m, READ.mi, READ.day);
  ok((ps.match(/class="lk-word"/g) || []).length >= 20, '整篇范文每个词都可点');

  // 题干页的阅读材料（p 标签里的正文）
  App.state.stepIdx = App._buildSteps(READ.day)
    .findIndex(s => s.kind === 'question' && s.mi === READ.mi);
  const stage = App.renderStage(READ.day);
  ok(/stage-passage[\s\S]*?class="lk-word"/.test(stage), '做题页的"阅读材料"里的词也可点');

  if (WRITE.mi >= 0) {
    const wm = HOMEWORK_DATA[WRITE.day].modules[WRITE.mi];
    App.state.currentDay = WRITE.day;
    const wr = App.renderWritingRead(wm, WRITE.mi, WRITE.day);
    const wSents = App._writingSentences(wm);
    ok((wr.match(/class="lk-word"/g) || []).length >= wSents.length, '写作朗读每句的词都可点');
    ok((wr.match(/class="gate-listen"/g) || []).length === wSents.length, '每句一颗 🔊（' + wSents.length + ' 句）');
    ok(wr.indexOf('data-nolookup') < 0 && wr.indexOf('data-listen="1"') < 0, '写作朗读也不再用句子当听入口');
  } else {
    ok(false, '这一周没有写作模块，无法验证写作朗读');
  }
}

console.log('\n=== 4. 逐词判分结果里的词也可点（红色那个尤其） ===');
{
  const a = App.alignSpeech('Sam lives in a lighthouse.', 'sam lives in a lighthouse');
  // 录音回调是异步的，直接盯"渲染时给逐词标记加了 lk-word"这条源码契约
  const seg = /align-sentence[\s\S]{0,400}?lk-word/.test(src);
  ok(seg, '逐词标记渲染时给每个词加了 lk-word（点红色词能看意思/听读音）');
  ok(a.items.length > 0, '（顺带：对齐结果本身正常，' + a.score + ' 分）');

  // 词盒这条路要"直接命中"，不能只靠 caretRangeFromPoint：
  // 那个 API 在 iOS / 微信里取不到落点时会静默失败，孩子点了没反应。
  const look = src.slice(src.indexOf('_initWordLookup()'));
  const lkAt = look.indexOf("closest('.lk-word')");
  const caretAt = look.indexOf('_wordAtPoint(pt.x, pt.y)');
  ok(lkAt > 0, '点词查义先认 .lk-word 词盒（明确目标）');
  ok(lkAt > 0 && caretAt > lkAt, '词盒没命中才退回按落点取词（两条路并存）');
  ok(/closest\('\.lk-word'\)[\s\S]{0,300}?_openWordSheet\(w\)/.test(look), '命中词盒 → 直接开查词弹层');

  // 家长："读错的单词点出错的单词来读" —— 点红词要能直接找到下面那颗芯片
  ok((src.match(/data-repair-word=/g) || []).length >= 2, '逐词判分里读错/漏读的词带 data-repair-word（阅读 + 写作两处）');
  ok(/data-repair-word[\s\S]{0,200}?_focusRepairChip/.test(look), '点红词 → 顺手点亮修复框里对应的芯片');
  ok(/\.repair-word\.repair-focus\{/.test(htmlSrc), '被点亮的芯片有明确的视觉标记（repair-focus）');
  ok(/chipIds/.test(src) && /REPAIR_GIVE_UP/.test(src), '修复框记下每颗芯片的 id，供红词联动定位');
}

console.log('\n=== 5. 舞台能滚：会变长的块自己滚，不被裁掉 ===');
{
  const rule = /\.stage-body > \.sent-step,\s*\.stage-body > \.passage-full\{[^}]*\}/.exec(htmlSrc);
  ok(!!rule, '.stage-body > .sent-step / .passage-full 有独立规则');
  if (rule) {
    ok(/flex:1 1 auto/.test(rule[0]), '能伸能缩（flex:1 1 auto）');
    ok(/min-height:0/.test(rule[0]), 'min-height:0 —— 不写这一条 flex 子元素不会收缩，照样溢出');
    ok(/overflow-y:auto/.test(rule[0]), 'overflow-y:auto —— 内容多时这一块自己滚');
  }
  ok(/\.stage-body\{[^}]*overflow:hidden/.test(htmlSrc), '（背景）stage-body 本身仍是 overflow:hidden，页面整体不滚');
  ok(/\.stage-passage\{[^}]*overflow-y:auto/.test(htmlSrc), '阅读材料框仍可滚');
  ok(/scrollIntoView/.test(src) && /repair-box/.test(src), '修复框出现时自动滚进视野');
}

console.log('\n=== 6. 修复框：外观状态 + 词看得见 ===');
{
  ok(/\.repair-word\.repair-locked\{[^}]*dashed/.test(htmlSrc), '虚框 = 还没听过（点一下听读音）');
  ok(/\.repair-word\{[^}]*border:2px solid #D6321F/.test(htmlSrc), '实框 = 可以按住读了');
  ok(/\.repair-word\.repair-done\{[^}]*1F9D55/.test(htmlSrc), '绿框 = 这个读对了');
  ok(/\.repair-word\{[^}]*min-height:46px/.test(htmlSrc), '芯片够大，孩子点得到');
  ok(/\.repair-title\{[^}]*font-weight:600/.test(htmlSrc), '标题加粗，一眼看清要干嘛');
}

console.log('\n=== 7. 读错的单词：判得更宽、不把孩子锁死 ===');
{
  // 7a 判分容差：转写里任意位置出现即算读对（对齐偶尔把词吃进"多余的词"）
  ok(App._heardAny('lighthouse', 'sam lives in a lighthouse') === true, '整段转写里出现过 → 算读对');
  ok(App._heardAny('museum', 'music') === false, '真的读成别的词仍然不放过');
  ok(App.alignSpeech('museum', 'um museum uh').ok >= 1, '识别多吐了词也不算读错');
  ok(App.alignSpeech('storybooks', 'story books').ok >= 1, '识别把词拆开了也认（story books ≈ storybooks）');
  ok(App.alignSpeech('lighthouse', 'lighthouse').ok === 1, '原样读对 → 满分');

  // 7b 孤立单词走 CF（和字母/音节同一类，短、没有上下文）
  const seg = src.slice(src.indexOf('_repairWordStart(ev, prefix, mi, si, idx)'));
  const call = /_holdStart\([\s\S]{0,2500}?'en',\s*word,\s*'cf',\s*(\d+)\s*\)/.exec(seg);
  ok(!!call, '单词跟读带了 asrPrefer="cf"（孤立短音只有 CF 认得出）');
  ok(!!call && +call[1] >= 800, '自动收尾窗口 ≥800ms（比字母宽，别切掉词尾辅音）');

  // 7c 连错 3 次放行 —— 机器判不准不能把孩子永远锁在这一屏
  ok(App.REPAIR_GIVE_UP === 3, '同一个词连错 3 次就放行（REPAIR_GIVE_UP = 3）');
  ok(/r\.tries\[idx\]/.test(src) && /tries >= self\.REPAIR_GIVE_UP/.test(src), '每次失败计数，到 3 次走"先算过"分支');
  ok(/这次先算过/.test(src), '放行时告诉孩子"这次先算过"，不假装他读对了');
  ok(/r\.listened\[idx\]/.test(src) && /现在按住/.test(src), '听过之后提示改成"现在按住它读一遍"（下一步说清楚）');
}

console.log('\n=== 8. 一致性：app.js 里不该再有"句子当听入口"的老写法 ===');
{
  const bad = [];
  src.split('\n').forEach((line, i) => {
    if (/data-nolookup/.test(line) && !/data-nolookup','1'\]/.test(line) && !/'button,input/.test(line)
        && !/data-nolookup/.test(line.split('//')[0].trim())) {
      // 只关心渲染函数里往元素上挂 data-nolookup 的写法
      if (/html \+=|'\+|"\+/.test(line)) bad.push((i + 1) + ': ' + line.trim().slice(0, 70));
    }
  });
  ok(bad.length === 0, '渲染代码里不再有元素挂 data-nolookup' + (bad.length ? '：' + bad.join(' | ') : ''));
  ok((src.match(/data-listen="1"/g) || []).length <= 1, 'data-listen 只剩门禁守卫里的兜底判断（渲染处已清零）');
}

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);
