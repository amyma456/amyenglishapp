/* eslint-disable */
/* ===========================================================================
 * v218 校验：微软首发快判 + 不贴合时阿里云「第二意见」复核
 *   node tools/verify-v218.js
 *
 * 家长 2026-11-20：「时间又短，判分又准」。
 * 本脚本干三件别的事替代不了的事：
 *   ① 从 worker/src/index.js 里把 v218 的纯函数**真跑**起来；
 *   ② 从 public/app.js 里把 alignSpeech 那一坨判分方法**真跑**起来，
 *      用真实句子逐条对两边分数 —— 门控只许低估、不许高估（高估=漏救）；
 *   ③ 回放 Harvey 那类「微软听岔」的故障，确认复核能把更贴的转写挑出来，
 *      而且最终那条转写真的能过前端 60 分的线。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = f => path.join(ROOT, f);
const wsrc = fs.readFileSync(P('worker/src/index.js'), 'utf8');
const appSrc = fs.readFileSync(P('public/app.js'), 'utf8');
const html = fs.readFileSync(P('public/index.html'), 'utf8');
const swSrc = fs.readFileSync(P('public/sw.js'), 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
};

// ---------------------------------------------------------------------------
console.log('\n[1] 真加载 worker 的 v218 纯函数');
const pureStart = wsrc.indexOf('// v218-pure-start');
const pureEnd = wsrc.indexOf('// v218-pure-end');
let W = null;
try {
  const pure = wsrc.slice(pureStart, pureEnd);
  W = new Function(pure + '\nreturn {v218TargetMatch, v218NeedRecheck, v218ChooseAsr, ' +
    'v218WordSame, v218Tokens, V218_FAST_PASS, V218_RECHECK_WAIT_MS};')();
} catch (e) { console.log('    加载失败：' + String(e).slice(0, 200)); }
ok(!!W, 'worker 纯函数块能在沙箱里加载');
if (!W) { console.log('\n通过 ' + pass + ' 项，失败 ' + fail + ' 项'); process.exit(1); }

// ---------------------------------------------------------------------------
console.log('\n[2] 真加载前端 alignSpeech，口径对账（门控只许低估）');
let AppMini = null;
try {
  const a1 = appSrc.indexOf('  // ===== Speech-recognition comparison =====');
  const a2 = appSrc.indexOf('  // Old speak() removed');
  const k1 = appSrc.indexOf('  _soundKey(w) {');
  const k2 = appSrc.indexOf('  // Lenient on purpose');
  const seg = appSrc.slice(a1, a2) + '\n' + appSrc.slice(k1, k2);
  AppMini = new Function('return {' + seg + '\n};')();
} catch (e) { console.log('    加载失败：' + String(e).slice(0, 200)); }
ok(!!AppMini && typeof AppMini.alignSpeech === 'function', '前端 alignSpeech 能真跑');

const cases = [
  ['完全读对', 'the cat is sleeping on the mat', 'the cat is sleeping on the mat'],
  ['虚词被吞', 'the cat is sleeping on the mat', 'the cat sleeping on mat'],
  ['复合词拆合', 'I read the story books yesterday', 'I read the storybooks yesterday'],
  ['数字读成词', 'Sarah is an 11-year-old girl', 'Sarah is an eleven-year-old girl'],
  ['缩写摊平', "we don't like it", 'we do not like it'],
  ['词形变化', 'she helped the old man', 'she help the old man'],
  ['明显读错', 'knowledge is power', 'no ledge is power'],
  ['整句听岔', 'the children are playing in the garden', 'it is a sunny day today'],
];
if (AppMini) {
  let allConservative = true, allReadRightFast = true;
  for (let i = 0; i < cases.length; i++) {
    const [name, target, spoken] = cases[i];
    const front = AppMini.alignSpeech(target, spoken).score;
    const edge = W.v218TargetMatch(target, spoken);
    const cons = edge <= front;
    if (!cons) allConservative = false;
    console.log('    · ' + name + '：前端 ' + front + ' / 门控 ' + edge + (cons ? '' : '  ← 高估了!'));
    // 前六组是「读对了」的场景，门控必须判为贴得住（>=60），否则会白等复核
    if (i < 6 && edge < W.V218_FAST_PASS) allReadRightFast = false;
  }
  ok(allConservative, '门控贴合度从不高于前端判分（不会把该救的漏掉）');
  ok(allReadRightFast, '读对的句子全部走 0.9s 快路径，不白等复核');
  const wrong = W.v218TargetMatch(cases[7][1], cases[7][2]);
  ok(wrong < W.V218_FAST_PASS, '整句听岔时门控判为对不上（实际 ' + wrong + '）');
}

console.log('\n[3] 快路径 / 复核触发条件');
ok(W.V218_FAST_PASS === 60, '快判门槛 60，与前端 PASS_SCORE 一致');
const passScore = (appSrc.match(/PASS_SCORE:\s*(\d+)/) || [])[1];
ok(String(W.V218_FAST_PASS) === String(passScore), '两边门槛真的相等（前端 ' + passScore + '）');
ok(W.V218_RECHECK_WAIT_MS === 1200 && W.V218_RECHECK_WAIT_MS <= 1500,
  '第二意见最多等 1.2 秒，不会把孩子拖回 6.4 秒');
const bias = 'the children are playing in the garden';
ok(W.v218NeedRecheck('az', 100, bias, 'sentence') === false, '微软读对了 → 不复核，0.9s 直接判过');
ok(W.v218NeedRecheck('az', 30, bias, 'sentence') === true, '微软明显对不上 → 触发第二意见');
ok(W.v218NeedRecheck('ali', 30, bias, 'sentence') === false, '阿里云本来就带目标句提示 → 不复核');
ok(W.v218NeedRecheck('cf', 30, bias, 'sentence') === false, 'CF 兜底那条不参与门控');
ok(W.v218NeedRecheck('az', 30, '', 'sentence') === false, '自由说（没有目标句）不复核');
ok(W.v218NeedRecheck('az', 30, bias, 'zh') === false, '中文不复核');
ok(W.v218NeedRecheck('az', 30, bias, 'letter') === false, '孤立字母不复核');

console.log('\n[4] 第二意见择优（纯函数真跑）');
const primary = { who: 'az', r: { text: 'it is a sunny day today', model: 'azure-stt' } };
const good = { who: 'ali', r: { text: 'the children are playing in the garden', model: 'qwen3-asr-flash' } };
const bad = { who: 'ali', r: { text: 'it was a rainy night', model: 'qwen3-asr-flash' } };
const empty = { who: 'ali', r: { text: '' } };
const c1 = W.v218ChooseAsr(primary, good, bias);
ok(c1.decision === 'recheck' && c1.win === good, '阿里云更贴 → 换用第二意见救回来');
ok(c1.match >= 60, '换过来的转写贴合度达标（' + c1.match + '）');
if (AppMini) {
  ok(AppMini.alignSpeech(bias, c1.win.r.text).score >= 60,
    '回放：换过来的转写真的能过前端 60 分（Harvey 那类问题被救回）');
}
const c2 = W.v218ChooseAsr(primary, bad, bias);
ok(c2.decision === 'keep' && c2.win === primary, '第二意见更差 → 保留原结果，不越改越糟');
const c3 = W.v218ChooseAsr(primary, empty, bias);
ok(c3.decision === 'recheck-empty' && c3.win === primary, '第二意见空手 → 原样返回');

console.log('\n[5] 主流程接线与超时兜底');
ok(/v218NeedRecheck\(win\.who, primaryMatch, bias, mode\)/.test(wsrc),
  '门控接在拿到首发结果之后、所有赋值之前');
ok(/aliP\.then\(function \(r\) \{ return \{ who: 'ali', r: r \}; \}\)/.test(wsrc),
  '复核等的是「本来就在路上」的阿里云，不新发一趟请求');
ok(/setTimeout\(function \(\) \{ r\(null\); \}, V218_RECHECK_WAIT_MS\)/.test(wsrc),
  '复核有硬超时，等不到就走');
ok(/decision: 'timeout'/.test(wsrc), '超时时用原结果，绝不把孩子卡在转圈里');
ok(/const azP = \(azureReady && bias/.test(wsrc) && /\{ first: true \}/.test(wsrc),
  '首发仍是普通识别，没引入会「读错也满分」的发音评估对齐');
ok(/v218ChooseAsr\(win, second, bias\)/.test(wsrc), '择优用纯函数，可测');
ok(/asrDecision: asrDecision/.test(wsrc) && /asrAltMatch: asrAltMatch/.test(wsrc),
  '决策留在响应 JSON 里，线上能核对');
ok(/X-Asr-Decision/.test(wsrc) && /X-Asr-Match/.test(wsrc), '决策头写进响应');
ok(/'X-Asr-Decision', 'X-Asr-Match'/.test(wsrc) || /X-Asr-Decision, X-Asr-Match/.test(wsrc),
  '跨域也 expose 了决策头');
ok(/verify;dur=/.test(wsrc), 'Server-Timing 里能看出复核等了多久');
ok(/recheckMs = Date\.now\(\) - r0/.test(wsrc), '复核耗时有埋点');

console.log('\n[6] 发版号一致');
const ver = (html.match(/name="app-version" content="(\d+)"/) || [])[1];
ok(ver === '218', 'app-version = ' + ver);
ok(html.indexOf('app.js?v=218') > 0 && html.indexOf('api.js?v=218') > 0, '脚本都带 ?v=218');
ok(swSrc.indexOf("'amy-english-v218'") > 0 && /var V = 218/.test(swSrc), 'sw 缓存名与 V 都升到 218');

console.log('\n通过 ' + pass + ' 项，失败 ' + fail + ' 项');
process.exit(fail ? 1 : 0);
