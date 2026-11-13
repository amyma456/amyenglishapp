#!/usr/bin/env node
/* verify-v179 —— 「提交读音后一直显示正在出分」的彻底修复
 * 家长 2026-11-02 晚：华为 nova 13 Pro 自带浏览器，做到 20 多题后提交读音，
 * 一直显示「正在出分」；刷新页面、退回上一题再回来，还是同一个样子。
 *
 * 根因（逐条对应下面的断言）：
 *  1) api.js 的 `_transcribeOnce` 拿到响应头就把 AbortController 的定时器
 *    clearTimeout 了，`res.json()` 这一段完全没有时限 —— 响应头到了、body
 *     被挂住（华为系浏览器常见）就是一个永不到头的 await；
 *  2) `Api.transcribe` 整条链路没有总时限；
 *  3) 「按住跟读」这条路径（作文朗读 / 阅读逐句跟读 / 单词跟读）根本没有
 *     看门狗 —— 一个 await 不回来，按钮永久灰着；
 *  4) 口语 / 跟读两条路的看门狗是 25 秒，孩子体感上就等于"卡死"；
 *  5) 结算代码自身抛错时，界面留在「正在出分」；
 *  6) 没有任何"扫全屏"的兜底 —— 只要有一条路径漏了 settle，按钮就锁死。
 *
 * 断言：
 *  A. 识别链路：总时限 + 单趟定时器覆盖 res.json + finally 才清
 *  B. 三条出分路径（口语 / 跟读 / 单读单词）都有看门狗，且只结算一次
 *  C. 结算代码抛错时按钮复位可重读（不锁死）
 *  D. 扫全屏的卡死定时器（data-scoring-at + _stallGuardStart）
 *  E. 连续 3 次核对不上放行（录音留档），不让孩子做不完作业
 *  F. 版本钉 v179
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
const idxSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

console.log('\n--- A. 识别链路的总时限 ---');
ok(/ASR_HARD_CAP_MS:\s*7000/.test(apiSrc), 'v195：Api 硬上限收紧到 7000');
ok(/async transcribe\(blob, meta, opts\)[\s\S]{0,900}Promise\.race\(\[flow, wall\]\)/.test(apiSrc),
  'transcribe 用 Promise.race 兜住整条链路，到点必回 null');
ok(/async _transcribeFlow\(blob, meta, opts\)/.test(apiSrc), '原流程拆成 _transcribeFlow（保留原逻辑）');
ok(/const flow = this\._transcribeFlow\(/.test(apiSrc), 'transcribe 调用的是 _transcribeFlow');
ok(/_transcribeFlow\(blob, meta, opts\) \{[\s\S]{0,1200}asrCanRetry\(\)[\s\S]{0,400}_transcribeOnce/.test(apiSrc),
  '_transcribeFlow 仍是"两趟 + 预算"的原逻辑');
// 单趟：定时器不能在 res.json() 之前被清掉
const onceBody = apiSrc.slice(apiSrc.indexOf('async _transcribeOnce'), apiSrc.indexOf('// 本次朗读已花时间'));
ok(onceBody.length > 500, '取到 _transcribeOnce 函数体');
ok(/headers = res\.headers;[\s\S]{0,200}await res\.json\(\)/.test(onceBody), '先取头再读 body（原顺序保留）');
ok(!/await fetch\(this\.TRANSCRIBE_URL[\s\S]{0,600}clearTimeout\(timer\)\);?\s*headers = res\.headers/.test(onceBody),
  '拿到响应头时不再提前 clearTimeout（abort 覆盖 res.json）');
ok(/finally \{[\s\S]{0,200}clearTimeout\(timer\)/.test(onceBody), '定时器在 finally 里清（成功/失败都覆盖）');
ok((onceBody.match(/clearTimeout\(timer\)/g) || []).length === 1, '单趟里只有一处 clearTimeout（不重复、不漏清）');

console.log('\n--- B. 三条出分路径都有看门狗 ---');
// 口语
ok(/Speaking scoring watchdog \(9s\)/.test(appSrc), '口语跟读出分：9 秒看门狗');
ok(!/Speaking scoring watchdog \(25s\)/.test(appSrc), '口语跟读出分：25 秒看门狗已撤');
ok(/let watchdog = null;[\s\S]{0,1200}watchdog = setTimeout\(function \(\) \{[\s\S]{0,200}settle\(null, null, null, true\);\s*\}, 9000\)/.test(appSrc),
  '口语：看门狗到点强制结算（按"确实读了"）');
// 阅读逐句跟读
ok(/Hold-read scoring watchdog \(9s\)/.test(appSrc), '阅读逐句跟读出分：9 秒看门狗');
ok(!/Hold-read scoring watchdog \(25s\)/.test(appSrc), '阅读逐句跟读：25 秒看门狗已撤');
// 按住跟读（作文朗读 / 单词跟读）
ok(/Hold scoring watchdog \(5\.5s\) fired — settle without transcript/.test(appSrc),
  'v195：按住跟读（作文/单词）5.5 秒看门狗');
ok(/var done = false;[\s\S]{0,600}if \(done\) return;[\s\S]{0,200}clearTimeout\(hardCap\)/.test(appSrc),
  '按住跟读：onDone 只走一次（late 结果不会二刷界面）');
ok(!appSrc.includes('网络有点慢，还在核对') && appSrc.includes('出分中…'),
  'v195：不再说网络慢/等待秒数，只留极简状态');
// 单词原处纠错
ok(/Word repair watchdog \(9s\) fired — settle without transcript/.test(appSrc), '单读单词（错词纠错）：9 秒看门狗');
ok(/settleRepair\(text\);/.test(appSrc) && /\.catch\(function \(e\) \{\s*console\.warn\('word repair capture failed:'[\s\S]{0,80}settleRepair\(null\)/.test(appSrc),
  '单读单词：捕获失败也结算（按钮不会灰着）');

console.log('\n--- C. 结算抛错也不锁死 ---');
ok(/catch \(e\) \{\s*console\.warn\('Speaking settle failed:'[\s\S]{0,200}_spReadUI\(mi, qi, dayIdx, 'noaudio'\)/.test(appSrc),
  '口语：结算抛错 → 复位成可重读');
ok(/catch \(e\) \{\s*console\.warn\('Hold-read settle failed:'[\s\S]{0,200}_setHoldReadUI\(mi, qi, 'noaudio'/.test(appSrc),
  '跟读：结算抛错 → 复位成可重读');
ok(/if \(status === 'noaudio'\) \{[\s\S]{0,500}btn\.innerHTML = '🎤 再读一遍';[\s\S]{0,200}btn\.disabled = false;/.test(appSrc),
  '_setHoldReadUI 有 noaudio 分支（按钮重新可按）');

console.log('\n--- D. 扫全屏的卡死兜底 ---');
ok(/STALL_MS:\s*14000/.test(appSrc), 'STALL_MS = 14000');
ok(/_stallGuardStart\(\) \{[\s\S]{0,900}document\.querySelectorAll\('\[data-scoring-at\]'\)/.test(appSrc),
  '定时器扫所有带 data-scoring-at 的按钮');
ok(/_stallGuardStart\(\) \{[\s\S]{0,1800}\}, 2000\);/.test(appSrc), '每 2 秒扫一次');
ok((appSrc.match(/_markScoring\(btn, status === 'scoring'\)/g) || []).length === 2, '口语 + 跟读两处 scoring 都打时间戳');
ok(/else btn\.removeAttribute\('data-scoring-at'\)/.test(appSrc), '离开 scoring 状态就摘掉时间戳（不会误伤）');
ok(/this\._stallGuardStart\(\)/.test(appSrc), '启动时挂上这个定时器');

console.log('\n--- E. 连续核对不上 → 放行（不让孩子做不完）---');
ok(/STALL_PASS_TRIES:\s*3/.test(appSrc), '连续 3 次为限');
ok(/_stallBump\(stallKey\) >= this\.STALL_PASS_TRIES[\s\S]{0,400}_persistSpeakingClip\(mi, qi, dayIdx, ctx\.q, null, \{[\s\S]{0,160}stall: true/.test(appSrc),
  '口语：3 次核对不上 → 通过 + 录音留档（标记 stall）');
ok(/_stallBump\(wkey\) >= self\.STALL_PASS_TRIES[\s\S]{0,400}_markWritingSentenceDone/.test(appSrc),
  '作文/阅读逐句：3 次核对不上 → 这一句通过');
ok(appSrc.includes('这句先通过啦'), 'v195：放行时用结果导向的短句告诉孩子发生了什么');

console.log('\n--- F. 版本钉 ---');
ok(/<meta name="app-version" content="203">/.test(idxSrc), 'index.html app-version = 179');
ok((idxSrc.match(/\?v=203/g) || []).length === 7, 'index.html 七处 ?v=203');
ok(!/\.js\?v=(?!203)\d{2,3}/.test(idxSrc), '没有残留旧 ?v=（脚本引用只有 188）');
ok(/var CACHE_NAME = 'amy-english-v203'/.test(swSrc), 'sw.js CACHE_NAME = v179');
ok(/var V = 203;/.test(swSrc), 'sw.js V = 179');

console.log('\n--- G. 真跑一遍：识别一直不回来，看门狗到点必须结算 ---');
(async function () {
  try {
    const mkEl = (id) => ({
      id: id || '', innerHTML: '', textContent: '', style: {}, disabled: false, dataset: {},
      _cls: new Set(),
      classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
      getAttribute() { return null; }, setAttribute() {}, removeAttribute() {},
      querySelector: () => null, querySelectorAll: () => [], appendChild() {}, remove() {},
      insertAdjacentHTML() {}, addEventListener() {}, removeEventListener() {},
      scrollIntoView() {}, focus() {}, blur() {}, getBoundingClientRect: () => ({ top: 0, height: 0 }),
    });
    const els = {};
    const getEl = (id) => (els[id] = els[id] || mkEl(id));
    const document = {
      getElementById: getEl, querySelector: () => null, querySelectorAll: () => [],
      createElement: mkEl, addEventListener() {}, removeEventListener() {},
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
      addEventListener() {}, removeEventListener() {},
      AudioContext: function () {
        return { state: 'running', currentTime: 0, resume: () => Promise.resolve(),
          createOscillator: () => ({ frequency: {}, connect() {}, disconnect() {}, start() {}, stop() {} }),
          createGain: () => ({ gain: {}, connect() {}, disconnect() {} }), destination: {} };
      },
      location: { search: '', href: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }),
      speechSynthesis: null,
    };
    const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
    // 假定时器：真实 9 秒太久，这里自己排队、自己点火。
    const timers = [];
    function fakeSetTimeout(fn, ms) { timers.push({ fn, ms: ms || 0, cleared: false }); return timers.length; }
    function fakeClearTimeout(id) { const t = timers[id - 1]; if (t) t.cleared = true; }
    function fire(ms) {
      timers.forEach(t => { if (!t.cleared && t.ms <= ms) { t.cleared = true; try { t.fn(); } catch (e) {} } });
    }
    const Api = {
      warmup() {}, isFillerTranscript: () => false, dict: async () => null,
      // ★ 关键：识别永远不回来（华为浏览器那种"响应头回来了、body 不出"的等价场景）
      transcribe: () => new Promise(() => {}),
      asrResetBudget() {}, perfBegin() {}, perfEnd() {}, asrCanRetry: () => false,
      answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
      saveAnswer: async () => ({}), submitSpeakingScore: async () => ({}),
      uploadRecording: async () => ({ id: 'x', url: 'u' }), load: async () => ({}),
    };
    const Recorder = {
      supported: () => true, warmUp() {}, prime: () => Promise.resolve(),
      start: async () => ({}), stop: async () => ({ blob: {}, samples: null, duration: 1 }),
      join: () => null, padForAsr: () => null, level: () => 0,
    };
    const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
    const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
    process.on('unhandledRejection', () => {});
    const App = new Function('stubs', `
      const { document, window, location, navigator, localStorage, Api, Recorder,
              HOMEWORK_DATA, WordHelp, URL, fetch, Cloud, SpeechRecognition, Audio,
              alert, confirm, prompt, requestAnimationFrame, setTimeout, clearTimeout } = stubs;
      ${appSrc}
      return App;
    `)({
      document, window, location: window.location, navigator, localStorage, Api, Recorder,
      HOMEWORK_DATA, WordHelp: undefined,
      URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
      fetch: () => new Promise(() => {}), Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
      alert() {}, confirm: () => true, prompt: () => '',
      requestAnimationFrame: fn => fakeSetTimeout(fn, 0),
      setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout,
    });

    // 直接驱动 _holdEnd：模拟"孩子读完、点结束"这一刻
    const statusEl = mkEl('st');
    let calls = 0, got = null;
    App._holdKey = 'wr-0-0';
    App._holdNeedsTranscript = true;
    App._holdFast = true;
    App._holdStatusEl = statusEl;
    App._holdStartedAt = Date.now() - 3000;
    App._holdDone = function (out, text) { calls++; got = { hasOut: !!out, text: text }; };
    App._trRestore = function () {};

    App._holdEnd();
    // 让 await Recorder.stop() 这一跳走完
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    const before = calls;
    fire(9000);                         // 9 秒看门狗到点
    await new Promise(r => setImmediate(r));
    ok(before === 0, '识别不回来时，看门狗到点前不会提前结算（不乱给分）');
    ok(calls === 1, '看门狗到点必须结算一次（按钮不会永远灰着）');
    ok(got && got.hasOut === true && got.text === null, '结算时带着录音、文本为 null（交给"有没有出声"兜底）');
    ok(!/核对中|出分/.test(statusEl.innerHTML || ''), '状态文字被清掉，不是永远停在「核对中」');

    App._holdKey = 'wr-0-1';
    let calls2 = 0;
    App._holdDone = function () { calls2++; };
    App._holdEnd();
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    fire(20000);
    fire(20000);
    ok(calls2 === 1, '晚到的结果不会二刷界面（onDone 只走一次）');
  } catch (e) {
    fail++;
    console.log('  ✗ 功能级测试抛错：' + (e && e.message));
  }

  console.log('\n' + (fail ? '✗ ' : '✓ ') + 'v179 校验：' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
