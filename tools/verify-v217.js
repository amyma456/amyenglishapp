/* eslint-disable */
/* ===========================================================================
 * v217 校验：iPad 桌面版网页的机型识别 + 「先听完整句才能跟读」
 *   node tools/verify-v217.js
 *
 * 家长 2026-11-20 两条：
 *   ① 张子皓（Harvey）那台 iPad 在「学生设备」里显示「型号未读到 / 待确认 /
 *      macOS」—— 因为 iPadOS 的 Safari 默认请求桌面网站，UA 里没有 iPad。
 *   ② 「没有听完系统的发音是不能自己跟读的，全部听完才能亮起来」；
 *      以及「点我跟读要多点几次才动」。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = f => path.join(ROOT, f);
const apiSrc = fs.readFileSync(P('public/api.js'), 'utf8');
const appSrc = fs.readFileSync(P('public/app.js'), 'utf8');
const html = fs.readFileSync(P('public/index.html'), 'utf8');
const swSrc = fs.readFileSync(P('public/sw.js'), 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
};

// ---------------------------------------------------------------------------
console.log('\n[1] 真跑 deviceInfo：iPad（桌面版网页 UA）');
const apiGlobals = {
  navigator: { userAgent: 'node', userAgentData: null, language: 'zh-CN',
               standalone: false, maxTouchPoints: 0 },
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
} catch (e) { ok(false, 'api.js 能在沙箱里加载：' + String(e).slice(0, 140)); }

if (Api) {
  ok(true, 'api.js 能在沙箱里加载');

  // 张子皓那台：iPad + Safari 16.6 + 请求桌面网站 + 11 英寸（834×1194 点）
  apiGlobals.navigator.userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/16.6 Safari/605.1.15';
  apiGlobals.navigator.maxTouchPoints = 5;
  apiGlobals.navigator.userAgentData = null;
  apiGlobals.window.screen = { width: 834, height: 1194 };

  const ipad = Api.deviceInfo();
  ok(ipad.brand === '苹果', '品牌认成「苹果」而不是「电脑」（实际 ' + ipad.brand + '）');
  ok(/iPad/.test(ipad.model), '机型写的是 iPad（实际 ' + ipad.model + '）');
  ok(/iPad Pro 11/i.test(ipad.model_label), '由屏幕推出具体型号：' + ipad.model_label);
  ok(/iPadOS/.test(ipad.os) && !/macOS/.test(ipad.os), '系统不再是 macOS：' + ipad.os);
  ok(/桌面版网页/.test(ipad.os), '标明是桌面版网页，老师一眼知道为什么 UA 像 Mac');
  ok(ipad.browser === 'Safari', '浏览器是 Safari（实际 ' + ipad.browser + '）');
  ok(ipad.is_stock === 1, '判定「是自带浏览器」（实际 ' + ipad.stock_text + '）');

  // 同一条 UA，但真的是一台 Mac（没有触摸屏）—— 不能被误判成 iPad
  apiGlobals.navigator.maxTouchPoints = 0;
  apiGlobals.window.screen = { width: 2560, height: 1440 };
  const mac = Api.deviceInfo();
  ok(mac.brand === '电脑', '真 Mac 仍是「电脑」，没被 iPad 规则误伤（实际 ' + mac.brand + '）');

  // 屏幕不在表里的 iPad：至少把分辨率写出来，别只写「型号未读到」
  apiGlobals.navigator.userAgent =
    'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
  apiGlobals.navigator.maxTouchPoints = 5;
  apiGlobals.window.screen = { width: 700, height: 900 };
  const odd = Api.deviceInfo();
  ok(/iPad（屏 700×900）/i.test(odd.model_label), '推不出的 iPad 写分辨率：' + odd.model_label);

  // 安卓读不到型号的老问题：也留分辨率线索
  apiGlobals.navigator.userAgent =
    'Mozilla/5.0 (Linux; Android 11; wv) AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36';
  apiGlobals.navigator.maxTouchPoints = 5;
  apiGlobals.window.screen = { width: 720, height: 1600 };
  const droid = Api.deviceInfo();
  ok(/屏 720×1600/.test(droid.model_label), '安卓读不到型号时留分辨率：' + droid.model_label);
}

// ---------------------------------------------------------------------------
console.log('\n[2] 「全部听完才能亮起来」：门禁与按钮文案');
ok(appSrc.indexOf("data-read-label=\"🎤 点一下跟读\"") > 0, '阅读逐句的跟读按钮带亮起后的文案');
ok(appSrc.indexOf('data-lock-label="先听一遍，再跟读"') > 0, '没听完时文案是「先听一遍，再跟读」');
ok(appSrc.indexOf('_gatePaintPlaying(gid') > 0 || appSrc.indexOf('this._gatePaintPlaying(gid') > 0,
  '示范播放中把跟读按钮写成「正在读…」');
ok(/if \(el\.textContent !== want\) el\.textContent = want/.test(appSrc),
  '只在文案真的变了时才写 DOM（避免 MutationObserver 自激死循环）');
ok(appSrc.indexOf("if (el.getAttribute('data-gate-painting') === '1') return;") > 0,
  '播放中不被 _syncGates 改回去');

// 锁着的时候点跟读 = 当场放示范（点一下就走完"先听"，不用点第二次）
const guardBlock = appSrc.slice(appSrc.indexOf('const guard = function(ev)'),
                                appSrc.indexOf("['pointerdown', 'touchstart', 'mousedown']"));
ok(/playAndUnlock\(ls, gid\)/.test(guardBlock),
  '没听完就点跟读时，顺手把示范放出来（不吞这一下）');
ok(appSrc.indexOf('_gateFallbackMs(sent) + 2000') > 0,
  '自动示范一个音都没响时有兜底放行，孩子不会锁死在灰按钮前');

// 解锁只认"播完"：onDone 才 _gateUnlock
ok(/onDone: function\(\) \{ self\._gateUnlock\(gate\); \}/.test(appSrc),
  '落屏自动示范只在播完后解锁');
ok(appSrc.indexOf('_gateReset(gid)') > 0, '重进一屏重新要求先听');

// ---------------------------------------------------------------------------
console.log('\n[3] 大字体之后按钮还看得见、点得到');
ok(/\.word-read-btn\.gate-locked\{/.test(html), '锁着的跟读按钮有自己的样式（不是一片灰）');
ok(/\.stage-body > \.sent-step > \.word-read-btn\{position:sticky/.test(html),
  '跟读按钮在句子卡里吸底，长句也划得到');

// ---------------------------------------------------------------------------
console.log('\n[4] 发版号一致');
const ver = (html.match(/name="app-version" content="(\d+)"/) || [])[1];
ok(ver === '217', 'app-version = ' + ver);
ok(html.indexOf('app.js?v=217') > 0 && html.indexOf('api.js?v=217') > 0, '脚本都带 ?v=217');
ok(swSrc.indexOf("'amy-english-v217'") > 0 && /var V = 217/.test(swSrc), 'sw 缓存名与 V 都升到 217');

console.log('\n通过 ' + pass + ' 项，失败 ' + fail + ' 项');
process.exit(fail ? 1 : 0);
