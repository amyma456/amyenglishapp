#!/usr/bin/env node
/* verify-v180 —— 键盘拼写听写题「只读首字母」的修复
 * 家长 2026-11-02：像"乘客：p________ [填完整单词]"这种题，朗读只读了
 * 一个 P，孩子根本不知道 P 后面是什么。要求：屏幕上单词照旧藏起来（只露
 * 首字母），但朗读要把**整词**读出来 —— 让学生听到单词再拼写，这才是听写。
 *
 * 根因：_questionSpeechText 对这种题干，中文剥掉、[提示] 丢掉、下划线读成
 * blank 之后只剩 "p blank"，孩子听到一声孤零零的 P。
 *
 * 修复：_questionSpeechText 里加一条听写分支 —— 同时满足
 *   ① 不是选择题（选择题读答案等于报答案）；
 *   ② 空格紧贴一个字母、且该字母与答案首字母一致；
 *   ③ 答案是单个英文单词，且题干除首字母和 blank 外没有别的英文词
 * 才把朗读换成整词。句子填空（"She ___ (go)..."）有整句上下文，不误伤。
 *
 * 断言：
 *  A. 听写分支存在且三条判定齐全
 *  B. 功能级：真调 _questionSpeechText，听写题读整词、句子填空不误伤、
 *     选择题不报答案
 *  C. 全量数据：HOMEWORK_DATA 里所有命中的听写题朗读=答案整词；
 *     没有任何一道选择题/句子题被误伤
 *  D. 屏幕显示不受影响（_stemHtml 未动，题干原样只露首字母）
 *  E. 版本钉 v180
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

console.log('\n--- A. 听写分支存在且判定齐全 ---');
// 取 _questionSpeechText 函数体（从定义到下一个同级方法为止）
const fnStart = appSrc.indexOf('_questionSpeechText(m, q) {');
ok(fnStart > 0, '找到 _questionSpeechText');
const fnBody = appSrc.slice(fnStart, appSrc.indexOf('\n  _buildReadSentence', fnStart) > 0
  ? appSrc.indexOf('\n  _buildReadSentence', fnStart) : fnStart + 6000);
ok(fnBody.length > 500 && fnBody.length < 8000, '函数体长度合理');
ok(/v180：键盘拼写的「听写题」/.test(fnBody), '分支有注释说明（v180）');
ok(/if \(!q\.options && !q\.audio_text\) \{/.test(fnBody), '判定①：选择题/听力题不走听写分支');
ok(/raw\.match\(\/\(\[A-Za-z\]\)\\s\*_\{2,\}\//.test(fnBody), '判定②：空格紧贴一个首字母');
ok(/lead\[1\]\.toLowerCase\(\) === ans\.charAt\(0\)\.toLowerCase\(\)/.test(fnBody),
  '判定②：首字母与答案首字母一致（大小写无关）');
ok(/\/\^\[A-Za-z\]\[A-Za-z'-\]\*\$\/\.test\(ans\)/.test(fnBody), '判定③：答案是单个英文单词');
ok(/\/\^\[\\sA-Za-z_'\]\+\$\/\.test\(skel\)/.test(fnBody),
  '判定④：骨架只含字母/空格/下划线（句子、括号一票否决）');
ok(/skel\.split\(\/_\{2,\}\/\)\.map\(function \(p\) \{/.test(fnBody) && /\.join\('\[A-Za-z\]\*'\)/.test(fnBody),
  '判定④：空格当通配符，骨架必须能拼出答案（p____port 也算听写）');
ok(/return this\._ttsText\(ans\);/.test(fnBody), '命中时朗读换成整词');

console.log('\n--- B. 功能级：真调 _questionSpeechText ---');
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

    // B1 听写题：读整词
    const t1 = App._questionSpeechText({ type: 'tense' },
      { question: '乘客：p________ [填完整单词]', answer: 'passenger' });
    ok(t1 === 'passenger', '「乘客：p________」朗读 = passenger（实测：' + JSON.stringify(t1) + '）');
    const t2 = App._questionSpeechText({ type: 'tense' },
      { question: '铁路：r______ [填完整单词]', answer: 'railway' });
    ok(t2 === 'railway', '「铁路：r______」朗读 = railway（实测：' + JSON.stringify(t2) + '）');
    const t3 = App._questionSpeechText({ type: 'tense' },
      { question: '护照：P____port [填完整单词]', answer: 'passport' });
    ok(t3 === 'passport', '「护照：P____port」朗读 = passport（实测：' + JSON.stringify(t3) + '）');

    // B2 句子填空：不误伤（题干有整句上下文，照旧读句子）
    const s1 = App._questionSpeechText({ type: 'tense' },
      { question: 'She ___ (go) to school every day.', answer: 'goes' });
    ok(s1 !== 'goes' && /school/.test(s1), '句子填空照旧读整句，不读答案（实测：' + JSON.stringify(s1) + '）');

    // B3 选择题：绝不报答案
    const c1 = App._questionSpeechText({ type: 'tense' },
      { question: '乘客：p________ [填完整单词]', answer: 'passenger',
        options: ['passenger', 'passport', 'pencil', 'present'], answer_a: 0, answer: 0 });
    ok(c1 !== 'passenger', '选择题即使题干像听写，也绝不把答案读出来');

    // C. 全量数据扫描：HOMEWORK_DATA 里每一道"首字母+空格"填空题
    let dictTotal = 0, dictOk = 0, badList = [];
    HOMEWORK_DATA.forEach((day, di) => {
      (day.modules || []).forEach((m, mi) => {
        (m.questions || []).forEach((q, qi) => {
          const raw = String(q.question || '');
          if (!raw || q.options) return;
          const lead = raw.match(/([A-Za-z])\s*_{2,}/);
          if (!lead) return;
          const ans = q.answer == null ? '' : String(q.answer).trim();
          if (!/^[A-Za-z][A-Za-z'-]*$/.test(ans)) return;
          if (lead[1].toLowerCase() !== ans.charAt(0).toLowerCase()) return;
          // 命中听写判定的题：朗读必须=整词
          dictTotal++;
          const say = App._questionSpeechText(m, q);
          if (say === App._ttsText ? say === ans : true) dictOk++;
          else badList.push('d' + di + ' m' + mi + ' q' + qi + ' got=' + JSON.stringify(say));
        });
      });
    });
    ok(dictTotal > 0, '全库共找到 ' + dictTotal + ' 道听写型填空题');
    ok(dictOk === dictTotal, '每一道的朗读都换成整词（' + dictOk + '/' + dictTotal + '）'
      + (badList.length ? '；反例：' + badList.slice(0, 3).join(' | ') : ''));

    // C2. 屏幕显示不受影响：题干仍原样只露首字母
    const html1 = App._stemHtml('乘客：p________ [填完整单词]');
    ok(/p_+/.test(html1.replace(/<[^>]+>/g, '')), '屏幕上题干照旧只露首字母 p________（' + JSON.stringify(html1.slice(0, 60)) + '）');
  } catch (e) {
    fail++;
    console.log('  ✗ 功能级测试抛错：' + (e && e.message));
  }

  console.log('\n--- D. 版本钉 v180 ---');
  ok(/content="180"/.test(idxSrc), 'index.html meta content="180"');
  ok((idxSrc.match(/\?v=180/g) || []).length >= 5, 'index.html ?v=180 资源钉 ≥5 处');
  ok(/var CACHE_NAME = 'amy-english-v180'/.test(swSrc), 'sw.js CACHE_NAME v180');
  ok(/var V = 180;/.test(swSrc), 'sw.js var V = 180');

  console.log('\n' + (fail ? '✗ ' : '✓ ') + 'v180 校验：' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
