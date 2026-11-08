#!/usr/bin/env node
/**
 * v190 校验：跟读门禁「每次看到这道题都要重新听」。
 *
 * 家长 2026-11-05：「孩子们不用听就能自己跟读，这个不太稳，有的必须听完，
 * 有的不用听完也能读下一句。」
 *
 * 病根：门禁状态记在 App._gates 里整场会话有效，_syncGates 每次重渲染都把
 * 已解锁的门重新打开 —— 退出一道题再进来就能跳过示范直接读。
 *
 * 修复：所有挂门禁的渲染入口先 _gateReset（摘旧锁）；开门只剩
 *   ① 听完示范 onDone（点 🔊 或落屏自动播）
 *   ② 调用方明确的立即开门（示范刚播过，如选择题引导/填空自动示范）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

console.log('== 1) _gateReset 助手 ==');
const appSrc = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
ok(/_gateReset\(gid\) \{\s*\r?\n\s*if \(!gid\) return;\s*\r?\n\s*delete this\._gates\[gid\];/.test(appSrc),
   '_gateReset 从 _gates 里摘掉这道题的锁');
ok(/_gateUnlock\(gid\) \{[\s\S]{0,120}this\._gates\[gid\] = true;/.test(appSrc),
   '_gateUnlock 行为不变（解锁仍然记状态）');

console.log('== 2) 七个渲染入口都先摘旧锁 ==');
ok(/_renderHoldReadPanel\(followEl, mi, qi, dayIdx, sentence, promptText\) \{[\s\S]{0,300}_gateReset\(gid\)/.test(appSrc),
   '① 跟读面板（阅读逐句/选择题引导/填空/作文跟读共用）');
ok(/startReadAlong\(mi, qi, dayIdx\) \{[\s\S]{0,900}_gateReset\(gid\)/.test(appSrc),
   '② 口语问答题面板');
ok(/_autoSpeakTranslate\(kind, m, mi, si, dayIdx\) \{[\s\S]{0,400}_gateReset\(gid\)/.test(appSrc),
   '③ 翻译屏（trsg/cqtrsg 两用，自动示范播完才开门）');
ok(/_gid\('sentg', mi, si\);\s*\r?\n\s*this\._gateReset\(gid\)/.test(appSrc),
   '④ 阅读逐句跟读屏');
ok(/_gid\('contg', mi\);\s*\r?\n\s*this\._gateReset\(cgid\)/.test(appSrc),
   '⑤ 单词连读屏');
ok(/_gid\('wrg', mi, si\);\s*\r?\n\s*\/\/\s*v1\d\d[\s\S]{0,160}if \(!ok\) this\._gateReset\(gid\);/.test(appSrc),
   '⑥ 作文跟读列表（已读过的句子不重新上锁）');
ok(/_gid\('wrep', R\.mi, R\.qi, word\);\s*\r?\n\s*this\._gateReset\(wgid\)/.test(appSrc),
   '⑦ 错词纠错卡');

console.log('== 3) 开锁路径没被破坏 ==');
ok(/gate \? \{ onDone: function\(\) \{ self\._gateUnlock\(gate\); \} \}/.test(appSrc),
   '落屏自动示范播完 → 开门（_flushSpeakOnRender）');
ok(/onDone: function \(\) \{[\s\S]{0,400}self\._gateUnlock\(self\._gid\('wrg', mi, idx\)\);/.test(appSrc),
   '作文跟读带读：每句示范播完 → 那句的麦克风解锁');
ok((appSrc.match(/_gateUnlock\(this\._gid\('hrg', mi, qi\)\)/g) || []).length >= 3,
   '示范刚播过的立即开门路径保留（选择题引导/填空自动示范/老师预览）');
ok(/_flushSpeakOnRender\(\) \{[\s\S]{0,600}if \(this\._ttsUnlocked\) this\.speak\(sent, opts\);\s*\r?\n\s*else \{ this\._pendingSpeak = sent; this\._pendingSpeakGate = gate; \}/.test(appSrc),
   '音频没解锁时示范挂起、第一次点按补播（不会永久锁死）');
ok(/_gateFallbackMs\(say\)/.test(appSrc),
   '断网/静音兜底计时器仍在（听不到声也不会把孩子锁死）');

console.log('== 4) 运行级：重进同一道题，门必须重新锁上 ==');
const document = {
  _els: {},
  getElementById: function (id) { return this._els[id] || null; },
  createElement: function () { return { style: {}, setAttribute() {}, appendChild() {}, addEventListener() {} }; },
  body: { appendChild() {} },
  addEventListener() {},
  documentElement: { style: {} },
  querySelectorAll: function () { return []; },
  querySelector: function () { return null; },
};
const window = {
  addEventListener() {}, location: { protocol: 'https:', host: 'x' },
  navigator: {}, matchMedia: function () { return { matches: false, addEventListener() {} }; },
  MutationObserver: null, speechSynthesis: { getVoices: function () { return []; } },
};
const localStorage = { getItem: function () { return null; }, setItem() {}, removeItem() {} };
const Api = {
  isFillerTranscript: function () { return false; },
  prefetchTts: function () {},
};
// 沙箱题库：第 6 天（idx 6）挂一个假模块，给 _renderHoldReadPanel 的
// _buildReadParts 查表用。
const HOMEWORK_DATA = [null, null, null, null, null, null,
  { modules: [] }];   // HOMEWORK_DATA[6] = 第 6 天，modules 按 mi 查
let App = null;
try {
  // 裁掉结尾的 App.init()（CRLF 通吃，见 pregen-tts.js 的教训）：我们只要纯函数。
  let loadSrc = appSrc;
  const tail = appSrc.search(/\/\/ Init\s*\r?\n\s*App\.init\(\);/);
  if (tail > 0) loadSrc = appSrc.slice(0, tail);
  App = new Function('stubs',
    'const { document, window, localStorage, Api, HOMEWORK_DATA } = stubs;\n' + loadSrc + '\nreturn App;'
  )({ document: document, window: window, localStorage: localStorage, Api: Api, HOMEWORK_DATA: HOMEWORK_DATA });
} catch (e) { console.log('  载入失败: ' + e.message); }
ok(!!App, 'app.js 能在沙箱里载入（运行级测试真的跑起来了）');

if (App) {
  // 跟读面板是最常用的门禁，拿它做生命周期实测。
  const el = { innerHTML: '', _html: '' };
  Object.defineProperty(el, 'innerHTML', {
    get: function () { return this._html; },
    set: function (v) { this._html = v; },
  });
  document._els['hr-9-0'] = { addEventListener() {}, classList: { add() {}, remove() {}, contains: function () { return false; } } };
  document._els['qr-status-9-0'] = { style: {} };
  const fakeM = { type: 'reading', questions: [{ question: 'Test.', answer: 0, options: [] }] };
  try {
    App.state = App.state || {};
    App.state.currentDay = 6;
    // 第一遍渲染（首次看到这道题）
    App._renderHoldReadPanel(el, 9, 0, 6, 'There are some apples.');
    const g1 = App._gid('hrg', 9, 0);
    ok(!App._gateOpen(g1), '首次渲染：门是锁着的');
    // 孩子听完示范 → 开门
    App._gateUnlock(g1);
    ok(App._gateOpen(g1), '听完示范后：门开了');
    // 退出去再进来 → 重新渲染
    App._renderHoldReadPanel(el, 9, 0, 6, 'There are some apples.');
    ok(!App._gateOpen(g1), '重进这道题（重新渲染）：门又锁上了 —— 必须重新听完才能读');
    // 听完 → 再开门 → 老师预览立即开门路径仍然有效
    App._gateUnlock(g1);
    ok(App._gateOpen(g1), '再听完：又开了');
  } catch (e) { fail++; console.log('  ✗ 运行级测试异常: ' + e.message); }
}

console.log('\n' + (fail ? '✗ ' : '✓ ') + 'v190 校验：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
