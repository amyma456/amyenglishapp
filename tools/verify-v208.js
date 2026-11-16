/* eslint-disable */
/* ===========================================================================
 * v208 校验：双击不能跳过朗读直接满分 + 老师端能看到每个学生的设备
 *   node tools/verify-v208.js
 *
 * 家长 2026-11-16 两条要求：
 *   ① 「孩子在听系统发音的时候，双击两次系统就不用读，并且直接弹出来
 *      正确答案 100 分，直接就可以做下一题」—— 所有机型 / 浏览器都不许再出现。
 *      （已确认机型：华为 nova 14 + 后来下载的头条浏览器）
 *   ② 「读取每个学生型号，备注到后台，让我老师端能看到每个学生的手机
 *      型号、是否用自带的浏览器；不是自带的，用的是哪个浏览器」。
 *
 * 这里不是只查字符串：手势守卫、判分兜底、设备 UA 解析、老师端表格
 * 都在沙箱里真跑一遍。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = f => path.join(ROOT, f);
const appSrc = fs.readFileSync(P('public/app.js'), 'utf8');
const apiSrc = fs.readFileSync(P('public/api.js'), 'utf8');
const html = fs.readFileSync(P('public/index.html'), 'utf8');
const swSrc = fs.readFileSync(P('public/sw.js'), 'utf8');
const workerSrc = fs.readFileSync(P('worker/src/index.js'), 'utf8');

let pass = 0, fail = 0;
process.on('unhandledRejection', () => {});
const ok = (cond, msg) => {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
};

console.log('v208 · 双击防刷分 + 学生设备档案校验');

// ---------------------------------------------------------------------------
console.log('\n[1] 双击 / 连点的三道闸都在代码里');
ok(/TAP_GUARD_MS:\s*420/.test(appSrc), '全局手势去重窗口 420ms');
ok(/MIN_READ_MS:\s*900/.test(appSrc), '点一下开始→读完再点一下结束，最少 900ms');
ok(!/Date\.now\(\) - ctx\.startedAt < 250/.test(appSrc), '两处 250ms 误触门槛已抬高');
ok(!/Date\.now\(\) - R\.startedAt < 250/.test(appSrc), '错词修复那处 250ms 也抬高了');
ok(/addEventListener\('dblclick'/.test(appSrc), '明确吞掉 dblclick（头条浏览器会缩放并补一次 click）');
ok(/stopImmediatePropagation/.test(appSrc), '第二次手势连后续监听器一起挡掉');
ok(/if \(this\._holdKey\) \{[\s\S]{0,400}_holdAttemptBad = true/.test(appSrc),
  '_holdStart 在重设指针捕获之前就挡掉第二次按下');
ok(/if \(this\._holdAttemptBad\) \{[\s\S]{0,400}onDone\(null, null\)/.test(appSrc),
  '被污染的那一遍直接丢掉录音，不交给判分层');
ok(/out\._holdBad = !!this\._holdAttemptBad/.test(appSrc), '录音对象带上凭据标记');
ok(/if \(this\._holdAttemptBad\) return 0;/.test(appSrc), '连点刷不出「三次核对不上就放行」');
ok((appSrc.match(/voiceOk && !self\._holdAttemptBad/g) || []).length === 2,
  '口语 / 跟读两条结算链都不再把 voiceOk=true 交给假录音');
ok(/status === 'passed' && this\._holdAttemptBad/.test(appSrc),
  '界面最后一道闸：假录音不许画成「已通过」');
ok(html.indexOf('user-scalable=no') > 0 && html.indexOf('touch-action:manipulation') > 0,
  '首页禁掉双击缩放 + 交互控件禁掉长按选中');

// ---------------------------------------------------------------------------
console.log('\n[2] 后台设备档案接口');
ok(workerSrc.indexOf("pathname.startsWith('/api/device')") > 0, 'Worker 挂了 /api/device 路由');
ok(workerSrc.indexOf('CREATE TABLE IF NOT EXISTS student_devices') > 0, 'D1 建 student_devices 表');
ok(workerSrc.indexOf("path === '/api/device/report'") > 0, '上报接口存在');
ok(workerSrc.indexOf("path === '/api/device/list'") > 0, '老师端读榜接口存在');
ok(/isTeacherPhone\(url\.searchParams\.get\('teacher'\)\)/.test(workerSrc), '读接口只认老师号');
ok(workerSrc.indexOf('unchanged: true') > 0, '同一台设备反复开屏不重复写库');
ok(apiSrc.indexOf('async reportDevice(payload)') > 0 && apiSrc.indexOf('async fetchDevices(teacherPhone)') > 0,
  '前端有上报 / 读取两个方法');
ok(appSrc.indexOf('_deviceCardHtml(approved)') > 0 && html.indexOf('.dev-table{') > 0,
  '老师端学生管理页有设备表与样式');

// ---------------------------------------------------------------------------
console.log('\n[3] 真跑：设备 UA 解析（家长给的 nova 14 + 头条浏览器）');
// api.js 顶层只有定义，给足 stub 就能整份加载，不用把函数抠出来。
const apiGlobals = {
  navigator: { userAgent: 'node', userAgentData: null, language: 'zh-CN', standalone: false },
  window: { screen: { width: 1080, height: 2400 }, devicePixelRatio: 3,
            matchMedia: () => ({ matches: false }), ontouchstart: null,
            addEventListener() {}, location: { search: '', href: '' } },
  document: { querySelector: () => null, addEventListener() {}, getElementById: () => null },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  fetch: () => new Promise(() => {}),
  location: { search: '', href: '' },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  indexedDB: null,
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: f => setTimeout(f, 0),
  URL: { createObjectURL: () => 'blob:x' },
  alert() {}, confirm: () => true, prompt: () => '',
};
let Api = null;
try {
  const keys = Object.keys(apiGlobals);
  const factory = new Function('stubs',
    'const {' + keys.join(',') + '} = stubs;\n' + apiSrc + '\nreturn Api;');
  Api = factory(apiGlobals);
} catch (e) { ok(false, 'api.js 能在沙箱里加载：' + String(e).slice(0, 120)); }
if (Api) {
  ok(true, 'api.js 能在沙箱里加载');
  const probe = (ua, model) => {
    apiGlobals.navigator.userAgent = ua;
    apiGlobals.navigator.userAgentData = model ? { model: model } : null;
    return Api.deviceInfo();
  };
  const nova14 = probe(
    'Mozilla/5.0 (Linux; Android 14; FOA-AL00 Build/HUAWEIFOA-AL00; wv) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36 ' +
    'NewsArticle/9.3.0 Toutiao/9.3.0');
  ok(nova14.brand === '华为', 'nova 14 品牌识别为华为（实际 ' + nova14.brand + '）');
  ok(/nova 14|FOA-AL00/i.test(nova14.model_label), '机型读到了：' + nova14.model_label);
  ok(nova14.browser === '头条浏览器', '浏览器识别为头条浏览器（实际 ' + nova14.browser + '）');
  ok(nova14.is_stock === 0, '判定「不是自带浏览器」');
  ok(/否/.test(nova14.stock_text), '文案写明是自己下载的：' + nova14.stock_text);
  ok(nova14.os.indexOf('Android 14') === 0, '系统版本读到：' + nova14.os);
  ok(nova14.screen === '1080x2400', '屏幕尺寸读到');

  const huaweiStock = probe(
    'Mozilla/5.0 (Linux; Android 12; NOVA-14 Build/HUAWEINOVA-14) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Version/4.0 Chrome/99.0.4844.58 Mobile Safari/537.36 HuaweiBrowser/12.0.3');
  ok(huaweiStock.brand === '华为' && huaweiStock.browser === '华为浏览器',
    '华为自带浏览器识别正确');
  ok(huaweiStock.is_stock === 1, '华为 + 华为浏览器 = 自带');

  const wechat = probe(
    'Mozilla/5.0 (Linux; Android 13; PGT-AN00 Build/HUAWEIPGT-AN00) AppleWebKit/537.36 ' +
    'Chrome/110.0 Mobile Safari/537.36 MicroMessenger/8.0.40');
  ok(wechat.browser === '微信内置浏览器' && wechat.is_stock === 0,
    '微信内置浏览器也标成「不是自带」');

  const iphone = probe(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1');
  ok(iphone.brand === '苹果' && iphone.is_stock === 1 && iphone.os.indexOf('iOS 17.2') === 0,
    'iPhone + Safari 识别为自带');

  const nodata = probe('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
  ok(nodata.is_stock === -1, '读不出来的不乱猜，标「待确认」');
}

// ---------------------------------------------------------------------------
console.log('\n[4] 真跑：双击守卫与判分兜底');
function el() {
  const e = {
    _cls: new Set(), style: {}, _attrs: {}, innerHTML: '', textContent: '',
    disabled: false, id: '', dataset: {}, children: [],
    classList: { add: (...c) => c.forEach(x => e._cls.add(x)),
                 remove: (...c) => c.forEach(x => e._cls.delete(x)),
                 contains: c => e._cls.has(c) },
    querySelector: () => null, querySelectorAll: () => [],
    insertAdjacentHTML: (p, h) => { e.innerHTML += h; },
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    appendChild() {}, remove() {}, scrollIntoView() {}, focus() {}, click() {},
    addEventListener() {}, removeEventListener() {},
  };
  return e;
}
const listeners = {};
const doc = {
  getElementById: () => el(), querySelector: () => null, querySelectorAll: () => [],
  createElement: el, body: el(), documentElement: el(),
  addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  removeEventListener() {}, hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const byId = {};
doc.getElementById = id => (byId[id] = byId[id] || el());
const win = { addEventListener() {}, removeEventListener() {}, speechSynthesis: null,
              location: { search: '', href: '' }, matchMedia: () => ({ matches: false }) };
const store = {};
const ApiStub = {
  answerKey: (sid, d, m, q) => sid + '_' + d + '_' + m + '_' + q,
  warmup() {}, isFillerTranscript: () => false, asrResetBudget() {},
  perfBegin() {}, perfEnd() {}, saveAnswer: async () => ({}),
  saveCheckin: async () => ({}), reportWrongQuestion: async () => ({}),
  submitSpeakingScore: async () => ({}), uploadRecording: async () => ({ id: 'x' }),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }), getAnswers: async () => [],
  deviceInfo: () => ({}), reportDevice: async () => ({}), fetchDevices: async () => [],
  _weekTag: () => 'w1',
};
const RecorderStub = {
  supported: () => true, warmUp() {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0, TARGET_RATE: 16000, trimSilence: s => s,
};
let App = null;
try {
  const dataSrc = fs.readFileSync(P('public/data.js'), 'utf8');
  const weeks = new Function(dataSrc + ';return HOMEWORK_WEEKS;')();
  const factory = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${appSrc.replace('App.init();', '/* verifier: skip auto-init */')}
    return { App };
  `);
  App = factory({
    document: doc, window: win, location: win.location,
    navigator: { userAgent: 'node', onLine: true, language: 'zh-CN' },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); },
                    removeItem: k => { delete store[k]; } },
    Api: ApiStub, Recorder: RecorderStub, HOMEWORK_DATA: weeks[0],
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    fetch: () => new Promise(() => {}), Cloud: undefined,
    SpeechRecognition: undefined, Audio: undefined, alert() {}, confirm: () => true,
    prompt: () => '', requestAnimationFrame: f => setTimeout(f, 0),
  }).App;
} catch (e) { ok(false, 'app.js 能在沙箱里加载：' + String(e).slice(0, 140)); }

if (App) {
  ok(true, 'app.js 能在沙箱里加载');
  ok(App.MIN_READ_MS >= 900, 'MIN_READ_MS ≥ 900（双击最快也过不了）');

  // 手势守卫：同一按钮 420ms 内的第二次 pointerdown / click 必须被吞掉
  App._bindDoubleTapGuard();
  ok((listeners.pointerdown || []).length >= 1 && (listeners.dblclick || []).length >= 1,
    '守卫注册了 pointerdown 与 dblclick');
  const btn = el();
  btn.closest = () => btn;
  let blocked = 0;
  const fire = (type, at) => {
    const ev = { type: type, target: btn,
      preventDefault() { blocked++; }, stopImmediatePropagation() { blocked++; },
      stopPropagation() { blocked++; } };
    (listeners[type] || []).forEach(fn => fn(ev));
  };
  fire('pointerdown');            // 第一次：正常放行
  const firstBlocked = blocked;
  fire('pointerdown');            // 第二次（双击）：必须吞掉
  ok(blocked > firstBlocked, '同一按钮 420ms 内第二次按下被吞掉');
  ok(!!App._dupGestureAt, '双击被记进 _dupGestureAt');
  fire('dblclick');
  ok(!!App._dupGestureAt, 'dblclick 也被记录');

  // 假录音不许换到「有声音就算过」
  const voice = new Float32Array(16000 * 1.5);
  for (let i = 0; i < voice.length; i++) voice[i] = Math.sin(i / 6) * 0.25;
  ok(App._judgeSilence({ samples: voice, _holdBad: true }).voiceOk === false,
    '被双击污染的录音：有声音也不算读过');
  ok(App._judgeSilence({ samples: voice }).voiceOk === true,
    '正常朗读：有声音仍按老规矩放行（不误伤孩子）');
  App._spClipMeta = { peak: 0.3, duration: 1.5, bad: true };
  App._spClipSamples = null;
  ok(App._lastClipVoiceOk() === false, '整句跟读那条链也不认假录音');
  App._spClipMeta = { peak: 0.3, duration: 1.5 };
  ok(App._lastClipVoiceOk() === true, '整句跟读正常的录音仍放行');
  App._holdAttemptBad = true;
  ok(App._stallBump('x') === 0, '连点不会累积「三次放行」');
  App._holdAttemptBad = false;
  ok(App._stallBump('y') === 1, '正常朗读仍会累积（老规则没坏）');

  // 界面：假录音不许出现「已通过 / 100 分 / 正确答案」
  const hb = byId['hr-0-0'] = el();
  const hs = byId['qr-status-0-0'] = el();
  App._holdAttemptBad = true;
  App._setHoldReadUI(0, 0, 'passed', 100, true);
  ok(!/已通过|100 分|正确答案/.test(hb.innerHTML + hs.innerHTML),
    '双击后不显示「已通过 / 100 分 / 正确答案」');
  ok(/再读一遍/.test(hb.innerHTML) && hb.disabled === false,
    '双击后按钮回到「再读一遍」，孩子可以重来');
  App._holdAttemptBad = false;
  App._setHoldReadUI(0, 0, 'passed', 100, true);
  ok(/已通过/.test(hb.innerHTML), '正常读对仍显示「已通过」（不误伤）');

  // 老师端设备表：全班一人一行，明确写出不是自带以及用的是哪个浏览器
  App.state.devices = [{
    student_id: 's1', student_name: 'Yunus', student_class: '少儿英语A班',
    model_label: '华为 nova 14', browser: '头条浏览器', browser_ver: '9.3',
    is_stock: 0, stock_text: '否（自己下载）', os: 'Android 14',
    updated_at: '2026-11-16T09:00:00Z',
  }];
  const card = App._deviceCardHtml([
    { id: 's1', name: 'Yunus', phone: '13649509453' },
    { id: 's2', name: 'Gary', phone: '18408439432' },
  ]);
  ok(/自带浏览器/.test(card) && /使用浏览器/.test(card), '表头写清「是否自带 / 哪个浏览器」');
  ok(/华为 nova 14/.test(card) && /头条浏览器/.test(card), 'nova 14 + 头条浏览器显示在同一行');
  ok(/还没记录/.test(card), '没上报过的孩子也在表里，不会凭空消失');
  ok((card.match(/class="dev-row/g) || []).length === 2, '两个孩子两行，全量展开');
  ok(card.indexOf('max-height') < 0 && card.indexOf('overflow-y') < 0,
    '设备表没有内部滚动条（家长要求一屏看全）');
}

// ---------------------------------------------------------------------------
console.log('\n[5] 版本钉子');
ok(/<meta name="app-version" content="208">/.test(html), 'index.html meta = 208');
ok((html.match(/\?v=208/g) || []).length === 7, '7 处脚本引用都升到 208');
ok(/var V = 208;/.test(swSrc) && /amy-english-v208/.test(swSrc), 'sw.js V / CACHE_NAME = 208');

console.log('\nv208: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
