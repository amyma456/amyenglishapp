/* eslint-disable */
// v216 校验：统一录音控制条 + 录音时文本可见可滚 + 点停止必定停。
//
// 家长 2026-11-19 晚：「第 15 题点了正在录音就看不到按钮，看见按钮时字又
// 划不动，不知道文本，点停止也不能停止，类似这种情况很多」。
// 这条校验要钉住的是「所有入口都覆盖」，不是某一颗按钮被改好了。
const fs = require('fs');
const path = require('path');

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

section('[1] 顶层浮条：脱离一切滚动/裁切/隐藏容器');
{
  ok(/<div id="rec-dock" class="rec-dock"/.test(htmlSrc), 'body 里有 rec-dock 容器');
  ok(/<button id="rec-dock-stop" class="rec-dock-stop"/.test(htmlSrc), '有独立的结束按钮');
  ok(/\.rec-dock\{[^}]*position:fixed/.test(htmlSrc), '浮条 position:fixed');
  ok(/\.rec-dock\{[^}]*z-index:2000/.test(htmlSrc), 'z-index 2000（高于 rd-end-pin 的 1500）');
  ok(/body\.rec-dock-on \.rec-dock\{display:block\}/.test(htmlSrc), '由 body.rec-dock-on 控制显隐');
  ok(/\.rec-dock\{[^}]*pointer-events:none/.test(htmlSrc), '浮条容器不拦截滑动手势');
  ok(/\.rec-dock-stop\{[^}]*pointer-events:auto/.test(htmlSrc), '只有按钮本身接收点击');
  ok(/\.rec-dock-stop\{[^}]*min-height:50px/.test(htmlSrc), '按钮 ≥50px，手指点得到');
  ok(/env\(safe-area-inset-bottom/.test(htmlSrc), '给全面屏底部留了安全区');
}

section('[2] 录音时文本看得见、划得动');
{
  ok(!/\.speaking-card\.is-recording>\*\{display:none\}/.test(htmlSrc),
    '删掉了「录音时隐藏卡片全部子元素」那条（曾把题干/中文一起藏掉）');
  ok(/\.speaking-card\.is-recording > \.speak-options/.test(htmlSrc), '只收起选项等干扰项');
  ok(!/\.speaking-card\.is-recording > \.speak-sentence/.test(htmlSrc), '题干 .speak-sentence 不再被隐藏');
  ok(!/\.speaking-card\.is-recording > \.speak-sentence-cn/.test(htmlSrc), '中文释义不再被隐藏');
  ok(/body\.rec-dock-on \.stage-body\{overflow-y:auto!important/.test(htmlSrc),
    '录音时舞台整体可滚（长句不再被 overflow:hidden 裁掉）');
  ok(/body\.rec-dock-on \.stage-body > \.module-card[\s\S]*?overflow:visible!important/.test(htmlSrc),
    '录音时卡片不再自己裁切内容');
  ok(/body\.rec-dock-on \.rd-sentence\.rd-rec\{max-height:none;overflow:visible/.test(htmlSrc),
    '句子不再嵌套滚动（双层滚动会吞掉上下滑手势）');
  ok(/body\.rec-dock-on \.stage-body\{[^}]*padding-bottom:100px!important/.test(htmlSrc),
    '底部留白，浮条不压住最后一行');
}

section('[3] 所有录音入口都挂了浮条');
{
  // 四个「开始」出口
  const shows = (appSrc.match(/_recDockShow\(/g) || []).length;
  ok(shows >= 4, '至少 4 处开录挂浮条（口语整句/阅读跟读/错词重读/通用按住）', shows);
  ok(/this\._spReadUI\(mi, qi, dayIdx, 'recording'\);[\s\S]{0,200}_recDockShow\(\(\) => this\._spReadEnd/.test(appSrc),
    '口语整句跟读：开录 → 浮条');
  ok(/this\._setHoldReadUI\(mi, qi, 'recording', null, false\);[\s\S]{0,200}_recDockShow\(\(\) => this\._holdReadEnd/.test(appSrc),
    '阅读理解/选择/填空跟读：开录 → 浮条');
  ok(/this\._pinReadEndBtn\(btn, true\);[\s\S]{0,200}_recDockShow\(\(\) => this\._wordRepairStop/.test(appSrc),
    '错词重读：开录 → 浮条');
  ok(/this\._holdKey = key;[\s\S]{0,300}_recDockShow\(function \(\) \{ self\._holdEnd\(\); \}/.test(appSrc),
    '通用 _holdStart（点一下说中文/翻译/写作/复习词等）→ 浮条');
  // 结束出口
  ok(/_spReadEnd\(mi, qi, dayIdx\) \{\s*this\._recDockHide\(\);/.test(appSrc), '口语整句跟读结束收浮条');
  ok(/_holdReadEnd\(mi, qi, dayIdx\) \{\s*this\._recDockHide\(\);/.test(appSrc), '阅读跟读结束收浮条');
  ok(/_wordRepairStop\(\) \{\s*this\._recDockHide\(\);/.test(appSrc), '错词重读结束收浮条');
  ok(/async _holdEnd\(ev\) \{\s*this\._recDockHide\(\);/.test(appSrc), '通用 _holdEnd 收浮条');
  // 异常出口
  ok(/不支持录音[\s\S]{0,160}_recDockHide\(\)/.test(appSrc), '浏览器不支持录音时收浮条');
  ok(/无法访问麦克风[\s\S]{0,200}_recDockHide\(\)/.test(appSrc), '麦克风权限失败时收浮条');
  ok(/_pinReadEndBtn\(btn, on\)[\s\S]{0,500}_recDockHide\(\)/.test(appSrc), '吸底关闭时同步收浮条');
  ok(/_recDockTimer = setTimeout\(function \(\) \{ self\._recDockHide\(\); \}, 130000\)/.test(appSrc),
    '130 秒兜底，任何异常都不许把浮条留在屏幕上');
}

section('[4] 点停止一定能停');
{
  ok(/var tap = function \(e\) \{ if \(e && e\.preventDefault\) e\.preventDefault\(\); App\._recDockTap\(e\); \};/.test(appSrc),
    '浮条按钮统一绑定');
  ok(/stop\.addEventListener\('touchstart', tap[\s\S]{0,200}stop\.addEventListener\('click', tap\)/.test(appSrc),
    'touchstart + mousedown + click 三重保险');
  ok(/_recDockTap\(e\) \{[\s\S]{0,300}var fn = this\._recDockStop;[\s\S]{0,120}this\._recDockHide\(\);[\s\S]{0,120}if \(!fn\) return;/.test(appSrc),
    '先收回调再执行，重复触发只会停一次');
  ok(/Date\.now\(\) - this\._holdStartedAt > 1000[\s\S]{0,120}this\._holdEnd\(ev\);/.test(appSrc),
    '隔了 1 秒以上的「第二次按下」直接收尾，不再被误判成双击锁在录音里');
  ok(/var busy = !!this\._holdKey \|\| !!this\._holdReadActive \|\| !!this\._spReadActive/.test(appSrc),
    '录音中重渲染不会把浮条弄丢');
}

section('[5] 版本钉子（>= 216 且各处一致，后续发版不误报）');
{
  const cur216 = (htmlSrc.match(/name="app-version" content="(\d+)"/) || [])[1] || '0';
  ok(Number(cur216) >= 216, 'index.html app-version >= 216（当前 ' + cur216 + '）');
  ok((htmlSrc.match(new RegExp('\\?v=' + cur216 + '\\b', 'g')) || []).length === 7,
    'index.html 7 处 ?v=' + cur216);
  ok((htmlSrc.match(/\?v=214/g) || []).length === 0, '无残留 ?v=214');
  ok(swSrc.indexOf("var CACHE_NAME = 'amy-english-v" + cur216 + "';") >= 0,
    'sw.js CACHE_NAME = v' + cur216);
  ok(new RegExp('var V = ' + cur216 + ';').test(swSrc), 'sw.js V = ' + cur216);
}

section('[6] 真跑状态机：点浮条确实停、且只停一次');
{
  // 正则只能证明代码长那样，证明不了点下去会发生什么。这里把真正的
  // app.js 塞进 vm，用一个最小 DOM 跑一遍 _recDockShow / _recDockTap。
  const vm = require('vm');
  let src = appSrc;
  const bootAt = src.lastIndexOf('\n// Init\nApp.init();');
  if (bootAt > 0) src = src.slice(0, bootAt);
  const noop = function () {};
  function mkEl(id) {
    return {
      id: id, textContent: '', innerHTML: '', value: '', style: {},
      classList: { add: noop, remove: noop, contains: function () { return false; } },
      addEventListener: noop, removeEventListener: noop,
      setAttribute: noop, getAttribute: function () { return null; },
      appendChild: noop, querySelector: function () { return null; },
      querySelectorAll: function () { return []; }, closest: function () { return null; },
      scrollIntoView: noop, focus: noop,
    };
  }
  const els = {};
  const getEl = function (id) { return els[id] || (els[id] = mkEl(id)); };
  const bodyCls = {};
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    document: {
      getElementById: getEl,
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
    window: { addEventListener: noop, speechSynthesis: null, matchMedia: function () { return { matches: false }; } },
    navigator: { mediaDevices: null, userAgent: 'node', standalone: false },
    localStorage: { getItem: function () { return null; }, setItem: noop, removeItem: noop },
    location: { hostname: 'amyeng.top', search: '', href: 'https://amyeng.top/' },
    setTimeout: function () { return 0; }, clearTimeout: noop,
    setInterval: function () { return 0; }, clearInterval: noop,
    fetch: function () { return Promise.resolve({ ok: false, status: 500 }); },
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
    let stopped = 0;
    App._recDockShow(function () { stopped++; }, '🔴 录音中', '读完点我结束');
    ok(!!bodyCls['rec-dock-on'], '开录后 body 挂上 rec-dock-on（浮条显示）');
    ok(getEl('rec-dock-stop').textContent === '读完点我结束', '结束按钮文案就位');
    ok(getEl('rec-dock-label').textContent === '🔴 录音中', '录音状态文案就位');
    App._recDockTap({ preventDefault: noop });
    ok(stopped === 1, '点浮条 → 结束函数被调用了一次', stopped);
    ok(!bodyCls['rec-dock-on'], '点完浮条立刻收起');
    ok(App._recDockStop === null, '回调已清空，不会二次结算');
    App._recDockTap({ preventDefault: noop });
    ok(stopped === 1, '再点一次不会重复结算', stopped);
    App._recDockShow(function () { stopped++; });
    App._recDockHide();
    ok(!bodyCls['rec-dock-on'] && App._recDockStop === null, '主动收起是幂等的');
  }
}

console.log('\n' + (fail ? ('FAILED ' + fail + ' / ' + (pass + fail)) : ('ALL PASS ' + pass)));
process.exit(fail ? 1 : 0);
