#!/usr/bin/env node
/* verify-v181 —— 填空题答对后的「完整句 + 跟读」一体化
 * 家长 2026-11-02（截图：用 is/isn't/are/aren't + a/an/some/any 填空:
 * There ___ apples.）：
 *   「像这种题，把正确的答案写上去，There are some apples。学生就顺便去
 *    跟着系统读，系统先读，学生再读，搞到同一道题里头，所有的题都是这样，
 *    以后的也都是这个逻辑。」
 *
 * 实现（全部做在代码里，不改题库 —— 以后的题自动同逻辑）：
 *  A. _fillReadSentence：题干按中文/[提示] 切块取含空段、剥括号提示、
 *     空用答案补上 → "There are some apples."；多空/无空不凑合
 *  B. qr-follow 容器所有题都渲染（以前只有选择题有）
 *  C. submitFill 答对：显示补好答案的完整句（答案标亮）+ 挂跟读面板 +
 *     系统先读示范 + 门直接开；学生侧**不**提前解锁下一题，读完才开；
 *     老师预览同款面板但不锁翻页（v172 同款）
 *  D. _showHoldReadResult 加 _fillReadPending 结算分支：60 分/确实出声
 *     放行解锁；错词原处重读（_fillRepairDone）；下一题保持锁住
 *  E. 面板提示语可换（填空不再说"问句和答案都读出来"）
 *  F. 版本钉 v181
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
const idxSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

console.log('\n--- A. _fillReadSentence / _fillSentenceHtml ---');
ok(/_fillReadSentence\(m, q\) \{/.test(appSrc), '存在 _fillReadSentence');
const frsStart = appSrc.indexOf('_fillReadSentence(m, q) {');
const frsBody = frsStart > 0 ? appSrc.slice(frsStart, appSrc.indexOf('_fillSentenceHtml', frsStart)) : '';
ok(frsBody && /\\u4e00-\\u9fff/.test(frsBody) && /\.split\(/.test(frsBody) && /\.filter\(function \(c\) \{ return \/_\{2,\}\/\.test\(c\); \}\)/.test(frsBody),
  '按中文和[提示]切块，只取含空的那段（不带词库）');
ok(/\(raw\.match\(\/_\{2,\}\/g\) \|\| \[\]\)\.length !== 1\) return ''/.test(appSrc),
  '多空的题不凑合（返回空走老流程）');
ok(/chunk\.replace\(\/\\\(\[\^\)\]\*\\\)\//g, '剥掉 (visit) 这类括号提示');
ok(/_fillSentenceHtml\(chunk, ans\)/.test(appSrc), '存在 _fillSentenceHtml（答案标亮）');

console.log('\n--- B/C. 渲染与接线 ---');
ok(/v181：跟读容器\*\*所有题都渲染\*\*[\s\S]{0,200}html \+= '<div id="qr-follow-' \+ mi \+ '-' \+ qi \+ '" class="qr-follow"><\/div>';/.test(appSrc),
  'qr-follow 容器无条件渲染（不再只有选择题有）');
const sfStart = appSrc.indexOf('submitFill(mi, qi, dayIdx) {');
const sfEnd = appSrc.indexOf('  _submitCloze', sfStart) > 0 ? appSrc.indexOf('  _submitCloze', sfStart) : sfStart + 9000;
const sfBody = appSrc.slice(sfStart, sfEnd);
ok(sfBody.length > 1000 && sfBody.length < 12000, '取到 submitFill 函数体');
ok(/_fillReadSentence\(m, q\)/.test(sfBody) && /_renderHoldReadPanel\(fillEl, mi, qi, dayIdx, fillSent, prompt\)/.test(sfBody),
  '答对后挂跟读面板（复用同一套 hrg 门禁）');
ok(/this\._fillReadPending\[mi \+ '-' \+ qi\] = true/.test(sfBody), '学生侧登记 _fillReadPending');
ok(/this\._gateUnlock\(this\._gid\('hrg', mi, qi\)\)/.test(sfBody), '示范自动放过，跟读门直接开');
ok(/setTimeout\(function \(\) \{\s*if \(selfSpeak\._holdReadActive\) return;\s*selfSpeak\.speak\(fillSent\);\s*\}, 260\)/.test(sfBody),
  '系统先读：260ms 后自动放示范（孩子已开录则让路）');
// 学生正确分支里不能再有 _unlockStep（走跟读解锁）；但兜底分支（凑不出完整句）保留
const stuCorrect = sfBody.slice(sfBody.indexOf('} else {'), sfBody.indexOf('} else if (this.isTeacher())'));
ok(/this\._unlockStep\(\)/.test(sfBody), '凑不出完整句的兜底分支保留老行为（直接放行）');
ok((sfBody.match(/_unlockStep\(\)/g) || []).length === 1, 'submitFill 里 _unlockStep 只剩兜底一处（正常路径交给跟读结算）');
ok(/isTeacher\(\)\)\s*\{[\s\S]{0,400}ansEl\.innerHTML = done;[\s\S]{0,300}_renderHoldReadPanel\(fillEl[\s\S]{0,300}_gateUnlock/.test(sfBody),
  '老师预览：同款面板 + 解锁，不锁翻页（v172 同款）');

console.log('\n--- D. 结算分支 ---');
ok(/if \(this\._fillReadPending && this\._fillReadPending\[mi \+ '-' \+ qi\]\) \{/.test(appSrc),
  '_showHoldReadResult 有 _fillReadPending 分支（在 _lastPick 之前）');
const hrIdx = appSrc.indexOf('_showHoldReadResult(mi, qi, dayIdx, sentence, spoken, source, verdict, voiceOk) {');
const hrBody = appSrc.slice(hrIdx, appSrc.indexOf('_fillRepairDone(mi, qi, dayIdx, score) {') > hrIdx
  ? appSrc.indexOf('  // v181：填空跟读的错词全部纠完') : hrIdx + 9000);
const fillBranchPos = hrBody.indexOf('_fillReadPending');
const lastPickPos = hrBody.indexOf('const lastPick');
ok(fillBranchPos > 0 && lastPickPos > fillBranchPos, '填空结算分支排在 _lastPick 之前（先接管）');
ok(/voiceOk\) \{[\s\S]{0,400}passed', null, true\)/.test(hrBody.slice(fillBranchPos, fillBranchPos + 2600)),
  '识别空手但确实出声 → 按通过放行（不让孩子重复读）');
ok(/_startWordRepair\(mi, qi, sentence, 'qr-status-' \+ mi \+ '-' \+ qi, function \(\) \{\s*selfFill\._fillRepairDone/.test(hrBody),
  '有错词 → 逐词原处重读，纠完走 _fillRepairDone');
ok(/_fillRepairDone\(mi, qi, dayIdx, score\) \{[\s\S]{0,600}next\.disabled = false; next\.classList\.add\('nudge'\)/.test(appSrc),
  '_fillRepairDone 纠完后解锁下一题');

console.log('\n--- E. 面板提示语可换 ---');
ok(/_renderHoldReadPanel\(followEl, mi, qi, dayIdx, sentence, promptText\) \{/.test(appSrc),
  '_renderHoldReadPanel 新增 promptText 参数');
ok(/const prompt = promptText \|\| '请朗读下面这句完整的话（问句和答案都读出来）：';/.test(appSrc),
  '默认文案不变（阅读/选择题不受影响）');
ok(/'这个单词你拼对了，请跟着读一遍：'/.test(appSrc) && /'请朗读你刚补好的完整句子：'/.test(appSrc),
  '填空题用新文案（单词/句子两种）');

console.log('\n--- F. 功能级：真调 _fillReadSentence 扫全库 ---');
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
    const Api = {
      warmup() {}, isFillerTranscript: () => false, dict: async () => null,
      transcribe: async () => null, asrResetBudget() {}, perfBegin() {}, perfEnd() {},
      asrCanRetry: () => false, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
      saveAnswer: async () => ({}), submitSpeakingScore: async () => ({}),
      uploadRecording: async () => ({ id: 'x', url: 'u' }), load: async () => ({}),
      flushCheckinQueue() {},
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
      requestAnimationFrame: fn => setTimeout(fn, 0),
      setTimeout, clearTimeout,
    });

    // 截图原题：完整句 = There are some apples.
    const t1 = App._fillReadSentence({ type: 'tense' },
      { question: "用 is / isn't / are / aren't + a / an / some / any 填空: There ___ apples.", answer: 'are some' });
    ok(t1 === 'There are some apples.', '截图原题 → "There are some apples."（实测：' + JSON.stringify(t1) + '）');

    // 括号提示剥掉
    const t2 = App._fillReadSentence({ type: 'tense' },
      { question: 'I ___ (visit) my grandma yesterday.', answer: 'visited' });
    ok(t2 === 'I visited my grandma yesterday.', '括号提示不进完整句（实测：' + JSON.stringify(t2) + '）');

    // 听写题（v180）：完整句就是单词本身
    const t3 = App._fillReadSentence({ type: 'tense' },
      { question: '乘客：p________ [填完整单词]', answer: 'passenger' });
    ok(t3 === 'passenger', '听写题完整句 = 单词本身（实测：' + JSON.stringify(t3) + '）');

    // 多空 / 无空 → 空
    ok(App._fillReadSentence({ type: 'tense' },
      { question: 'There ___ a book and ___ pens.', answer: 'is some' }) === '', '多空不凑合');
    ok(App._fillReadSentence({ type: 'tense' },
      { question: 'Who is your best friend?', answer: 'Li Lei' }) === '', '无空的题不凑合');

    // 全库扫描：填空题（无 options）有多少能产出完整句；不许抛错
    let fills = 0, sentOk = 0, multi = 0;
    HOMEWORK_DATA.forEach((day) => {
      (day.modules || []).forEach((m) => {
        (m.questions || []).forEach((q) => {
          if (!q || q.options || q.audio_text) return;
          const raw = String(q.question || '');
          if (!raw || (raw.match(/_{2,}/g) || []).length === 0) return;
          fills++;
          if ((raw.match(/_{2,}/g) || []).length > 1) { multi++; return; }
          const s = App._fillReadSentence(m, q);
          if (s && /[A-Za-z]/.test(s) && s.indexOf('___') < 0 && s.indexOf('_') < 0) sentOk++;
        });
      });
    });
    ok(fills > 0, '全库共 ' + fills + ' 道无选项填空题（多空 ' + multi + ' 道走老流程）');
    ok(sentOk === fills - multi, '每一道单空题都能产出无横线的完整句（' + sentOk + '/' + (fills - multi) + '）');

    // 完整句展示：答案标亮
    const html1 = App._fillSentenceHtml('There are some apples.', 'are some');
    ok(/<b[^>]*>are some<\/b>/.test(html1), '完整句展示里答案加粗标亮');
  } catch (e) {
    fail++;
    console.log('  ✗ 功能级测试抛错：' + (e && e.message));
  }

  console.log('\n--- G. 版本钉 v181 ---');
  ok(/content="198"/.test(idxSrc), 'index.html meta content="198"');
  ok((idxSrc.match(/\?v=198/g) || []).length >= 5, 'index.html ?v=198 资源钉 ≥5 处');
  ok(/var CACHE_NAME = 'amy-english-v198'/.test(swSrc), 'sw.js CACHE_NAME v181');
  ok(/var V = 198;/.test(swSrc), 'sw.js var V = 181');

  console.log('\n' + (fail ? '✗ ' : '✓ ') + 'v181 校验：' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
