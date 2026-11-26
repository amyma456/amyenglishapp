// verify-v230.js — 点词对上号 + 查词换音色
//
// 家长 2026-11-26：
//   ① 「点单词查询不能对上号，点了 Over 出现 the」
//   ② 「翻译的这个语音不好听，换成别的语音」
//
// 根因：
//   ① 词典本身没错（Over→向下、the→这），错在取词：跟读句子里的普通
//      词盒只有 .rd-w、没有 .lk-word，只能靠 caretRangeFromPoint 按坐标猜，
//      移动端 caret 偏一格就取到相邻词；词盒带标点时还会校验失败掉回这条路。
//   ② 点词「点开就响」用的是设备内建 speechSynthesis，机械平硬；
//      🔊 重听又点名 prefer:'cf' 走现场合成，两条路音色不一致。
//
// 本脚本静态锁死上述修复，并验证版本 230 与音频缓存键未被误改。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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

const wordAt = app.slice(app.indexOf('  _wordAtPoint(x, y) {'), app.indexOf('  // 同一个文本节点里'));
const lookup = app.slice(app.indexOf('  _initWordLookup() {'), app.indexOf('  _eventPoint(ev) {'));

section('1. 点词对上号：不再只信 caret 坐标');
{
  ok(/elementFromPoint/.test(wordAt), '★ _wordAtPoint 先用 elementFromPoint 找真正命中的元素');
  ok(/\.rd-w\[data-w\]/.test(wordAt), '★ 逐词判分的普通词盒也纳入命中范围');
  ok(/\.lk-word,\.lk-phrase/.test(wordAt), '原有短语 / 词盒仍认');
  ok(/replace\(\/\^\[\^A-Za-z\]\+\|\[\^A-Za-z\]\+\$\/g, ''\)/.test(lookup),
    '★ ① 分支先削掉词盒首尾标点（"Over," 不再掉回 caret 路径）');
  ok(/closest\('\.lk-word,\.lk-phrase'\)/.test(lookup), '① 分支原有词盒逻辑保留');
  // caret 兜底仍在，别把老路径删断
  ok(/caretRangeFromPoint|caretPositionFromPoint/.test(wordAt), 'caret 兜底仍在（非词盒文本照样可点）');
  ok(/_phraseAround\(text, a, b\)/.test(wordAt), '固定搭配识别未受影响');
}

section('2. 查词读音：去掉内建合成，统一同源高质量音色');
{
  const wsSpeak = app.slice(app.indexOf("wrap.querySelector('#ws-speak')"), app.indexOf('    this._lookupEl = wrap;'));
  ok(/self\.speak\(self\._lookupWord\)/.test(wsSpeak), '★ 🔊 重听不再点名 cf');
  ok(!/prefer/.test(wsSpeak), '★ 🔊 重听走默认（Azure / 静态 mp3）音色');

  const instant = app.slice(app.indexOf('App._speakWordInstant = function'), app.indexOf('App._speakPhraseNow = function'));
  ok(!!instant && /App\.speak\(w\)/.test(instant), '★ 点开自动读改为同源 /api/tts');
  ok(!/speechSynthesis/.test(instant) && !/SpeechSynthesisUtterance/.test(instant),
    '★ 设备内建 speechSynthesis 已从点词链路移除');
  ok(!/prefer/.test(instant), '★ 不再有 1.2 秒后落回 cf 的拐弯');

  const phrase = app.slice(app.indexOf('App._speakPhraseNow = function'), app.indexOf('// 点词查义：全局代理'));
  ok(!!phrase && /App\.speak\(t\)/.test(phrase), '★ 短语点开同样统一音色');
  ok(!/prefer|_speakWordInstant|_ttsPrioritize/.test(phrase), '★ 不再本机凑一声 / 现场排队预取');

  const sheet = app.slice(app.indexOf('  async _openWordSheet(word) {'), app.indexOf('\n};', app.indexOf('  async _openWordSheet(word) {')));
  ok(!/prefer:\s*'cf'/.test(sheet), '★ 整个查词弹层没有残留 cf 音色');
  // 兜底不能误删：speak() 里的内建合成是最后一层保险
  ok(/_speakWithSynthesis/.test(app), 'speak() 的内建合成最后兜底仍在');
}

section('3. 音频缓存键仍冻结（别被升版误改）');
{
  const ver = app.slice(app.indexOf('  ttsVer() {'), app.indexOf('  _ttsTrim() {'));
  ok(/return '228';/.test(ver), '★ av 仍固定 228，发版不作废音频缓存');
  ok(!/querySelector\('meta\[name="app-version"\]'\)/.test(ver), '★ 没退回读 app-version');
  ok(/var ttsUrl\s*= cachedTts \|\| ownTts;/.test(app), 'v229 的同源起播仍在');
  ok(/^    startPlayback\(\);\s*$/m.test(app), 'v229 的同步起播仍在');
}

section('4. 版本统一 230');
{
  ok(/<meta name="app-version" content="230">/.test(html), 'index.html meta = 230');
  const n = (html.match(/\?v=230/g) || []).length;
  ok(n === 10, '10 处脚本 URL 全是 ?v=230', '实测 ' + n);
  ok(!/\?v=229/.test(html), 'html 无残留 229');
  ok(/var CACHE_NAME = 'amy-english-v230';/.test(sw), 'sw.js CACHE_NAME = v230');
  ok(/var V = 230;/.test(sw), 'sw.js V = 230');
  ok(/amy_boot_recover_v230/.test(html), '刷新看门狗 key 随版滚动');
}

section('5. 词典本体回归 + 语法');
{
  // 用沙箱真跑一次查词：点 Over 必须拿到「向下」，不能是 the 的「这」
  let probe = null;
  try {
    const src = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
    const ctx = { console, setTimeout, clearTimeout, Date, Math, JSON, RegExp, String, Object,
      Array, Number, Promise, encodeURIComponent, decodeURIComponent,
      window: {}, document: {}, navigator: {}, location: { href: 'x' },
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      fetch: () => Promise.reject(new Error('offline')), HOMEWORK_DATA: [], HOMEWORK_WEEKS: [] };
    vm.createContext(ctx);
    vm.runInContext(src + '\n;globalThis.__p = { wh: WordHelp, api: Api };', ctx);
    probe = ctx.__p;
  } catch (e) { /* 下面按失败计 */ }
  ok(!!probe, 'api.js 可在沙箱加载');
  if (probe) {
    const over = probe.api.dictLocal('Over');
    const the = probe.api.dictLocal('the');
    ok(over && /向下/.test(over.zh), '★ Over → 向下（词典没串到 the）', over && over.zh);
    ok(the && /这/.test(the.zh), '★ the → 这，两条释义各自独立', the && the.zh);
    ok(probe.wh.phraseInfo('Over') === null, '★ Over 不被误判成固定搭配');
  }
  let syntaxOk = true;
  try { execFileSync(process.execPath, ['--check', APP], { stdio: 'ignore' }); }
  catch (e) { syntaxOk = false; }
  ok(syntaxOk, 'app.js 通过 node --check');
  let swOk = true;
  try { execFileSync(process.execPath, ['--check', path.join(ROOT, 'public', 'sw.js')], { stdio: 'ignore' }); }
  catch (e) { swOk = false; }
  ok(swOk, 'sw.js 通过 node --check');
}

console.log('\n========================================');
console.log('结果：' + passed + ' 通过 / ' + failed + ' 失败');
console.log('========================================');
process.exit(failed ? 1 : 0);
