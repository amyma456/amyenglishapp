// verify-v228.js — 修「看图听音的题就页面无响应、重进进不去」
//
// 家长 2026-11-25：Gary 一到「看图片听语音」的题就卡，Chrome 弹「页面无响应」，
// 重进回到同一题，反复进不去。
//
// 根因（本脚本静态锁死）：
//   ① 词汇 learn/image_choice/meaning_choice、口语选择题是唯一在 renderContent 的
//      **同步渲染栈**里直接 autoSpeak → speak 的界面；
//   ② speak → _stopCurrentAudio 以前每次都无条件 speechSynthesis.cancel()（同步
//      浏览器级调用），音频栈卡住就把主线程拖死 → 页面无响应、开屏摘不掉；
//   ③ 选项解锁只靠 TTS 的 onDone，音频一哑火就永远灰着 → "进不去"。
//
// 本脚本验证：出声已移到落帧后、解锁有独立兜底、cancel 只在真起过合成时调、
// 以及版本号统一 228。
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '  (' + detail + ')' : '')); }
}
function section(t) { console.log('\n【' + t + '】'); }

const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

function fnAt(sig, max) {
  const i = app.indexOf(sig);
  if (i < 0) return '';
  return app.slice(i, i + (max || 1200));
}

section('1. 安全自动朗读：出声落到帧后，解锁有独立兜底');
{
  const seg = fnAt('  _safeAutoSpeak(text, onDone, prefer) {', 1200);
  ok(!!seg, '有 _safeAutoSpeak 安全朗读入口');
  ok(/VOCAB_UNLOCK_MS:\s*4000/.test(app), '★ 有 4 秒绝对兜底常量');
  ok(/setTimeout\(open,\s*this\.VOCAB_UNLOCK_MS\)/.test(seg),
    '★ 选项解锁挂独立计时器（朗读不回调也放行）');
  ok(/var opened = false/.test(seg) && /if \(opened\) return/.test(seg),
    'onDone 与兜底只放行一次（幂等）');
  ok(/setTimeout\(function \(\) \{[\s\S]{0,200}self\.autoSpeak\(text, open, prefer/.test(seg),
    '★ 真正出声放进 setTimeout，render 同步栈里不碰浏览器音频 API');
  ok(/catch \(e\) \{ open\(\); \}/.test(seg), '音频 API 抛错也放行，绝不锁死');
}

section('2. 看图听音三阶段都走安全入口');
{
  const seg = fnAt('  renderVocabStage(m, mi, dayIdx) {', 9000);
  const n = (seg.match(/_safeAutoSpeak\(/g) || []).length;
  ok(n >= 3, '★ learn / image_choice / meaning_choice 三处都换成安全入口（' + n + ' 处）');
  ok(!/this\.autoSpeak\(word\.word/.test(seg),
    '★ 词汇屏里没有残留的同步 autoSpeak(word.word)');
}

section('3. 口语选择题同样不再同步朗读');
{
  const seg = fnAt('  renderSpeakingQuestion(m, mi, qi, dayIdx) {', 4200);
  ok(/_safeAutoSpeak\(q\.sentence/.test(seg), '口语题朗读也走安全入口');
  ok(!/this\.autoSpeak\(q\.sentence/.test(seg), '口语题没有残留同步 autoSpeak');
}

section('4. speechSynthesis.cancel 只在真起过合成时调');
{
  const seg = fnAt('  _stopCurrentAudio() {', 1000);
  ok(/if \(this\._synthActive && window\.speechSynthesis\)/.test(seg),
    '★ cancel 受 _synthActive 标记约束（不再每次 speak 都同步 cancel）');
  ok(/this\._synthActive = false;/.test(seg), 'cancel 后标记复位');

  const syn = fnAt('  _speakWithSynthesis(text, opts, token) {', 3200);
  ok(/this\._synthActive = true/.test(syn), '只有真起内建合成时才置标记');
  const clears = (syn.match(/_synthActive = false/g) || []).length;
  ok(clears >= 3, 'onend / onerror / 超时 / catch 都会清标记（' + clears + ' 处）');
}

section('5. 版本统一 v228');
ok(/app-version" content="228"/.test(html), 'index.html meta 228');
ok((html.match(/\?v=228/g) || []).length === 10, '10 处脚本 ?v=228');
ok(/amy-english-v228/.test(sw) && /var V = 228;/.test(sw), 'sw.js 缓存版本 228');

console.log('\n========================================');
console.log('结果：' + passed + ' 通过 / ' + failed + ' 失败');
console.log('========================================\n');
process.exit(failed ? 1 : 0);
