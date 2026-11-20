/* eslint-disable */
// v219 校验：读哪句哪句弹出来 + 字号自适应手机屏幕 + 作文屏按顺序不漏句。
//
// 家长 2026-11-21：「一共一个界面有五六个句子……尤其读到第三句第4句，你
// 一点开始录音，那个句子就哗得不见了。只有把那个句子记住才能读对」。
// 这条校验钉的是「句子脱离滚动容器常驻 + 长短句都完整可见」，不是某一处
// 滚动位置调好了。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  [' + extra + ']' : '')); }
}
function section(s) { console.log('\n' + s); }

section('[1] 顶层句子卡片：fixed、脱离所有滚动容器、不挡「结束」');
{
  ok(/<div id="rec-sentence" aria-hidden="true">/.test(htmlSrc), 'body 顶层有 rec-sentence 卡片');
  ok(/<div id="rec-sentence-text"><\/div>/.test(htmlSrc), '卡片里有一块专门放句子的文本区');
  ok(/#rec-sentence\{[^}]*position:fixed/.test(htmlSrc), '卡片 position:fixed（不受列表重排影响）');
  ok(/#rec-sentence\{[^}]*z-index:2100/.test(htmlSrc), 'z-index 2100，高于舞台内容');
  ok(/#rec-sentence\{[^}]*pointer-events:none/.test(htmlSrc), '卡片不拦截点击/滑动，结束按钮照常能点');
  ok(/body\.rec-sentence-on #rec-sentence\{display:flex\}/.test(htmlSrc), '由一个 body class 控制显隐');
  ok(/height:calc\(100vh - 92px/.test(htmlSrc), '卡片只占上方，底部 92px 留给录音控制条');
  ok(/height:calc\(100dvh - 92px/.test(htmlSrc), '新浏览器用 dvh，老浏览器有 100vh 兜底');
  ok(/#rec-sentence-box\{[^}]*max-height:100%/.test(htmlSrc), '卡片有高度上限，长句不会顶出屏幕');
  ok(/#rec-sentence-text\{[^}]*overflow:hidden/.test(htmlSrc), '文本区默认不裁切溢出（由 JS 缩字号解决）');
  ok(/id="rec-sentence-tools"/.test(htmlSrc)
    && /App\._rsFont\(-1\)/.test(htmlSrc) && /App\._rsFont\(1\)/.test(htmlSrc),
    '有 A- / A+ 两颗手动调字号按钮');
  ok(/#rec-sentence-tools\{[^}]*pointer-events:auto/.test(htmlSrc), '只有字号按钮接收点击');
}

section('[2] 作文屏：五六个句子按顺序读，不漏句');
{
  ok(/\.wr-item\.wr-now::before/.test(htmlSrc), '「现在读这一句」有醒目样式');
  ok(/var nextIdx = -1;[\s\S]{0,500}classList\.add\('wr-now'\)/.test(appSrc),
    '刷新进度时把第一句没读过的标成当前句');
  ok(/classList\.remove\('wr-now'\)/.test(appSrc), '每次刷新先清掉旧的当前句标记');
}

section('[3] 所有录音入口都把当前句带出来');
{
  ok(/_recDockShow\(stopFn, label, btnLabel, sentence, sentenceTag\)/.test(appSrc),
    '统一录音控制条接了「当前句」参数');
  ok(/this\._rsShow\(sentence \|\| this\._rsActiveText\(\), sentenceTag\)/.test(appSrc),
    '开录即弹句；老入口没传就就近抓一句');
  ok(/_recDockHide\(\) \{[\s\S]{0,300}this\._rsHide\(\)/.test(appSrc),
    '录音结束把弹出的句子一起收起来');
  ok(/var rsText = String\(asrHint \|\| ''\)\.slice\(0, 300\)[\s\S]{0,180}_rsFromDom\(statusEl, ev\)/.test(appSrc),
    '通用入口：目标句优先，DOM 兜底');
  ok(/rsText, rsTag\)/.test(appSrc), '通用入口把句子和第几句一起传下去');
  ok(/_rsTag\(key\)[\s\S]{0,220}第 /.test(appSrc), '作文/阅读逐句会标出「第几句」');
  ok(/_rsActiveText\(\)/.test(appSrc) && /_rsFromDom\(statusEl, ev\)/.test(appSrc),
    '口语/选择/填空/错词等老入口也有就近抓句子的兜底');
}

section('[4] 系统带读：读到哪句，哪句也弹出来');
{
  ok(/系统带读 · 第 /.test(appSrc) && /self\._rsShow\(sents\[idx\]/.test(appSrc),
    '带读每读一句就把那句弹到屏幕上');
  ok(/带读完了收起卡片/.test(appSrc) && /停带读就收起弹出的句子/.test(appSrc),
    '带读结束 / 手动停止都收起卡片');
  ok(/if \(!self\._holdKey\) \{[\s\S]{0,200}self\._rsShow\(sents\[idx\]/.test(appSrc),
    '孩子正在录音时带读不去抢那张卡片');
  ok(/if \(this\._leadReadRunning\) \{[\s\S]{0,300}_stopCurrentAudio\(\)/.test(appSrc),
    '带读没放完就开录：先掐掉示范、停掉队列');
  ok(/if \(self\._leadReadStop \|\| !self\._leadReadRunning\) return;/.test(appSrc),
    '带读队列看到录音开始就不再往下读、不再抢卡片');
}

section('[5] 字号自适应：短句放大、长句缩小、极长句不裁半句');
{
  ok(/for \(var i = 0; i < 48 && size > min; i\+\+\)[\s\S]{0,220}el\.scrollHeight <= el\.clientHeight/.test(appSrc),
    '按真实渲染高度逐级缩字号，直到整句放得下');
  ok(/30 \* fs \* Math\.min\(1\.12, vw \/ 390\)/.test(appSrc)
    && /Math\.min\(42/.test(appSrc), '起始字号按屏宽和全局字号倍率算，且有手机上限');
  ok(/var min = 14/.test(appSrc), '最小字号有下限，不会缩到看不清');
  ok(/el\.style\.overflowY = 'auto'/.test(appSrc), '极长句兜底：卡片内可上下滑，绝不裁掉半句');
  ok(/amy-rs-scale/.test(appSrc) && /_rsFont\(d\)/.test(appSrc), 'A- / A+ 手动微调按本机记住');
  ok(/addEventListener\('resize'[\s\S]{0,260}_rsFit\(selfR\._rsText\)/.test(appSrc),
    '横竖屏切换会重新算字号');
}

section('[6] 版本钉子（跟随当前发版滚动）');
{
  const ver = (htmlSrc.match(/name="app-version" content="(\d+)"/) || [])[1] || '0';
  ok(Number(ver) >= 219, 'index.html app-version >= 219（当前 ' + ver + '）');
  ok((htmlSrc.match(new RegExp('\\?v=' + ver + '\\b', 'g')) || []).length === 7,
    'index.html 7 处 ?v=' + ver);
  ok(swSrc.indexOf("'amy-english-v" + ver + "'") > 0
    && new RegExp('var V = ' + ver + ';').test(swSrc), 'sw.js 缓存名与 V 都是 ' + ver);
}

section('[7] 真跑状态机：显示 / 隐藏 / 长句缩字 / 第几句 / 手动字号');
{
  let src = appSrc;
  // app.js 是 CRLF，按字符串找调用点更稳（别在 vm 里真跑 App.init）
  const bootAt = src.lastIndexOf('App.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  const noop = function () {};
  const store = {};
  const bodyCls = {};
  const els = {};
  function mkEl(id) {
    const el = {
      id: id, textContent: '', innerHTML: '', value: '', style: {},
      classList: { add: noop, remove: noop, contains: function () { return false; } },
      addEventListener: noop, removeEventListener: noop,
      setAttribute: noop, getAttribute: function () { return null; },
      appendChild: noop, querySelector: function () { return null; },
      querySelectorAll: function () { return []; }, closest: function () { return null; },
      scrollIntoView: noop, focus: noop, scrollHeight: 0, clientHeight: 0,
    };
    if (id === 'rec-sentence-text') {
      // 模拟真实渲染：文本越长、字号越大，需要的高度越高
      Object.defineProperty(el, 'scrollHeight', {
        get: function () {
          const fs = parseFloat(el.style.fontSize) || 30;
          return Math.ceil((el.textContent.length / 11) * fs * 1.45);
        },
      });
      Object.defineProperty(el, 'clientHeight', { get: function () { return 300; } });
    }
    return el;
  }
  const getEl = function (id) { return els[id] || (els[id] = mkEl(id)); };
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    document: {
      getElementById: getEl,
      documentElement: {},
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      addEventListener: noop,
      createElement: function () { return mkEl('tmp'); },
      body: {
        classList: {
          add: function (c) { bodyCls[c] = true; },
          remove: function (c) { delete bodyCls[c]; },
          contains: function (c) { return !!bodyCls[c]; },
        },
      },
    },
    window: {
      addEventListener: noop, innerWidth: 390, innerHeight: 780,
      speechSynthesis: null, matchMedia: function () { return { matches: false }; },
    },
    navigator: { mediaDevices: null, userAgent: 'node', standalone: false },
    localStorage: {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); }, removeItem: noop,
    },
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: function () { return 0; }, clearTimeout: noop,
    setInterval: function () { return 0; }, clearInterval: noop,
    fetch: function () { return Promise.resolve({ ok: false, status: 500 }); },
    getComputedStyle: function () { return { getPropertyValue: function () { return '1'; } }; },
    Audio: function () { return { play: noop, pause: noop }; },
    URL: URL, Blob: function () {}, Date: Date, Math: Math, JSON: JSON,
    encodeURIComponent: encodeURIComponent, atob: atob, btoa: btoa,
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.globalThis = sandbox;
  let App = null;
  try {
    const ctx = vm.createContext(sandbox);
    vm.runInContext(src + '\n;globalThis.__App = App;', ctx, { filename: 'app.js' });
    App = sandbox.__App;
  } catch (e) {
    ok(false, 'app.js 能在最小 DOM 里加载', String(e && e.message));
  }
  if (App) {
    const textEl = getEl('rec-sentence-text');
    const tagEl = getEl('rec-sentence-tag');

    App._rsShow('I like apples.', '🎤 第 1 句 · 看着读');
    ok(!!bodyCls['rec-sentence-on'], '弹句后 body 挂上 rec-sentence-on');
    ok(textEl.textContent === 'I like apples.', '卡片里就是这一句');
    ok(tagEl.textContent === '🎤 第 1 句 · 看着读', '标签说明是第几句');
    const shortSize = parseFloat(textEl.style.fontSize);
    ok(shortSize >= 22, '短句用大字号（' + shortSize + 'px）');

    const longSent = 'My favorite festival is the Spring Festival because I can get together with my whole family and eat dumplings.';
    App._rsShow(longSent, '🎤 第 4 句 · 看着读');
    const longSize = parseFloat(textEl.style.fontSize);
    ok(textEl.textContent === longSent, '长句完整进了卡片，没有被截断');
    ok(longSize < shortSize, '长句自动缩小字号（' + shortSize + 'px → ' + longSize + 'px）');
    ok(textEl.scrollHeight <= 301, '缩完字号整句落在一屏里');

    const huge = new Array(60).fill('The quick brown fox jumps over the lazy dog.').join(' ');
    App._rsShow(huge);
    ok(textEl.style.overflowY === 'auto', '极长句开启卡片内滑动兜底，不裁半句');

    App._rsHide();
    ok(!bodyCls['rec-sentence-on'], '收起后卡片不再显示');
    ok(App._rsText === '', '收起时清掉当前句文本');

    ok(App._rsTag('wr-0-3') === '🎤 第 4 句 · 看着读', '作文第 4 句标签正确');
    ok(App._rsTag('sent-1-0') === '🎤 第 1 句 · 看着读', '阅读逐句同样标第几句');
    ok(App._rsTag('word-apple') === '🎤 现在读这一句', '单词类入口用通用标签');

    const words = { textContent: 'The quick brown fox jumps.' };
    const item = { parentElement: null, querySelector: function () { return words; } };
    const status = { parentElement: item, querySelector: function () { return null; } };
    ok(App._rsFromDom(status, null) === 'The quick brown fox jumps.',
      '没传目标句时能从 status 元素就近抓到句子');

    const before = App._rsScale;
    App._rsFont(1);
    ok(App._rsScale > before && store['amy-rs-scale'] === String(App._rsScale),
      'A+ 放大字号并记到本机');
    App._rsFont(-1);
    ok(Math.abs(App._rsScale - before) < 0.001, 'A- 能调回来');

    let stopped = 0;
    App._recDockShow(function () { stopped++; }, '🔴 录音中', '读完点我结束', 'Read this sentence.');
    ok(!!bodyCls['rec-dock-on'] && !!bodyCls['rec-sentence-on'],
      '开录时控制条和句子卡片同时出现');
    ok(getEl('rec-sentence-text').textContent === 'Read this sentence.', '开录弹的就是当前句');
    App._recDockTap({ preventDefault: noop });
    ok(stopped === 1, '点结束只结算一次');
    ok(!bodyCls['rec-dock-on'] && !bodyCls['rec-sentence-on'], '结束后控制条与卡片一起收起');
  }
}

console.log('\n' + (fail ? ('FAILED ' + fail + ' / ' + (pass + fail)) : ('ALL PASS ' + pass)));
if (fail) process.exit(1);
