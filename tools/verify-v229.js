// verify-v229.js — 修「朗读点一下没声音，要读好几遍；刷新也没用」
//
// 家长 2026-11-26：York 反馈平台朗读还是卡，一句要读好几遍才出声，刷新也没用。
//
// 根因（本脚本静态锁死）：
//   ① speak() 里若这句音频还在预取队列，会用 setTimeout 轮询最多 2.5 秒再播；
//      play() 一旦离开用户手势的同步栈，iOS / 微信 / UC 直接按 autoplay 静音。
//      孩子点第二下时音频已缓存成本地 blob、变成同步起播才响 ——「读好几遍」。
//   ② 单词 / 逐字母拼读直连有道第三方域名，移动端跨域媒体常被整个拦掉；
//      只有句子走同源 /api/tts（响应 immutable 一年）。
//   ③ 读音 URL 把 app-version 当缓存键，每次发版整年有效的音频缓存全部作废，
//      刷新 / 更新后第一遍又得逐句重下 ——「刷新也没用」。
//
// 本脚本验证：起播同步化、全部朗读走同源、同源失败先重试一次、音频缓存键
// 冻结、以及版本号统一 229。
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '  (' + detail + ')' : '')); }
}
function section(t) { console.log('\n【' + t + '】'); }

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'public', 'app.js');
const app = fs.readFileSync(APP, 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

// 只取 speak() 函数体，避免别处的同名字符串误判
const speakStart = app.indexOf('  speak(text, opts) {');
const speakEnd = app.indexOf('\n  _stopCurrentAudio() {', speakStart);
const speak = speakStart >= 0 && speakEnd > speakStart ? app.slice(speakStart, speakEnd) : '';

section('1. 起播绝不等预取 —— play() 留在手势同步栈');
{
  ok(!!speak, '能定位到 speak() 函数体');
  ok(!/waitingForPrefetch/.test(speak), '★ 已删掉「等预取」分支');
  ok(!/function waitForPrefetch/.test(speak), '★ 已删掉 setTimeout 轮询');
  ok(!/_ttsPrioritize\(cleanText/.test(speak), '★ 起播前不再插队 / 等 blob');
  ok(/^    startPlayback\(\);\s*$/m.test(speak), '★ startPlayback 无条件同步调用');
  ok(/起播绝不等预取/.test(speak), '根因注释已写进代码');
}

section('2. 所有朗读统一走同源 /api/tts');
{
  ok(/var ttsUrl\s*= cachedTts \|\| ownTts;/.test(speak), '★ 单词/字母/句子都用同源地址');
  ok(/var fallbackUrl = baidu;/.test(speak), '第三方只作兜底');
  ok(!/isSentence \? ownTts : youdao/.test(speak), '★ 不再按句子/单词分流到有道');
  ok(!/var isSentence\s*=/.test(speak), '★ 已移除 isSentence 分流变量');
  ok(!/dict\.youdao\.com\/dictvoice/.test(speak), '★ speak 里不再拼有道 URL');
  ok(/\/api\/tts\?av=/.test(speak), '同源 /api/tts 仍在');
}

section('3. 同源失败先重试一次，再谈第三方兜底');
{
  ok(/sameOriginRetried/.test(speak), '有同源重试标记');
  ok(/attemptPlay\(ttsUrl\)/.test(speak), '★ play() 被拒时重试同一地址');
  ok(/function goFallback\(\)/.test(speak), '兜底链路独立成函数');
  const attempt = speak.slice(speak.indexOf('function attemptPlay(url)'), speak.indexOf('attemptPlay(ttsUrl);'));
  ok(!!attempt && !/setTimeout/.test(attempt), '★ attemptPlay 内绝不夹 setTimeout');
  ok(/\}, 7000\);/.test(speak), '失败提示从 12 秒提前到 7 秒');
}

section('4. 音频缓存键冻结，不再随发版失效');
{
  const ver = app.slice(app.indexOf('  ttsVer() {'), app.indexOf('  _ttsTrim() {'));
  ok(/return '228';/.test(ver), '★ av 固定为 228（沿用线上已有缓存）');
  ok(!/querySelector\('meta\[name="app-version"\]'\)/.test(ver), '★ 不再读 app-version 当缓存键');
  ok(/冻结/.test(ver), '冻结原因已注释');
  // 预取与起播用的是同一个 av，缓存不会分裂成两套
  const prefetch = app.slice(app.indexOf('  _ttsPump() {'), app.indexOf('  _ttsPrioritize('));
  ok(/self\.ttsVer\(\)/.test(prefetch), '预取仍复用同一个 ttsVer');
}

section('5. 版本号统一 229');
{
  ok(/<meta name="app-version" content="229">/.test(html), 'index.html meta = 229');
  const scriptVer = (html.match(/\?v=229/g) || []).length;
  ok(scriptVer === 10, '10 处脚本 URL 全是 ?v=229', '实测 ' + scriptVer);
  ok(!/\?v=228/.test(html), 'html 里没有残留 228');
  ok(/var CACHE_NAME = 'amy-english-v229';/.test(sw), 'sw.js CACHE_NAME = v229');
  ok(/var V = 229;/.test(sw), 'sw.js V = 229');
  ok(/amy_boot_recover_v229/.test(html), '刷新看门狗 key 随版滚动');
}

section('6. 语法与既有兜底仍在');
{
  let syntaxOk = true;
  try { execFileSync(process.execPath, ['--check', APP], { stdio: 'ignore' }); }
  catch (e) { syntaxOk = false; }
  ok(syntaxOk, 'app.js 通过 node --check');
  let swOk = true;
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'public', 'sw.js')], { stdio: 'ignore' }); }
  catch (e) { swOk = false; }
  ok(swOk, 'sw.js 通过 node --check');
  ok(/VOCAB_UNLOCK_MS:\s*4000/.test(app), 'v228 的 4 秒兜底解锁没被弄丢');
  ok(/_safeAutoSpeak\(text, onDone, prefer\)/.test(app), 'v228 的安全自动朗读还在');
  ok(/function trySynthFallback\(\)/.test(speak), '内建合成最后一层兜底还在');
}

console.log('\n========================================');
console.log('结果：' + passed + ' 通过 / ' + failed + ' 失败');
console.log('========================================');
process.exit(failed ? 1 : 0);
