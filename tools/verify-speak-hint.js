/* eslint-disable */
// ===========================================================================
// v137 口语提示回归测试：**答错时，要像老师一样用中文讲明白**
//
// 家长 2026-10-17：「今天的 AI 口语练习，选错了答案，它会提示，但是提示得
// 太傻了。他告诉不是 A 就是 B、就是 C，从逻辑上告诉大家是错的，但是他没有
// 告诉学生题是什么意思。比如说问句是什么意思、找的答句是什么意思，像老师
// 一步一步启发学生那样的中文给提示出来。」
//
// 同一条消息里还有第二件事：「按住中文来说的时候，之前呢，他是要点一下英文
// 听完，然后去说中文。他是不点也能听到，按中文必须要设置成先听完英文之后
// 才能点中文说。」→ 翻译屏的「按住说中文」必须挂门。
//
// 这个测试盯住三件事：
//   ① 60 道口语题，每道都有"问什么/答什么"的引导 + 四个选项的中文意思，
//      且中英一一对齐（错位比没有更糟）。
//   ② 三档提示的内容：第 1 档讲问句和所选那句的意思、第 2 档把剩下的翻成
//      中文让他自己对、第 3 档才点名 + 解析。前两档**不许**出现"答案是"。
//   ③ 逐句翻译屏（阅读理解 / 完形填空）的「按住说中文」在没听英文时被拦下。
//
// 用真 DOM（jsdom）跑。用法：
//   node tools/verify-speak-hint.js
// ===========================================================================
const fs = require('fs');
const path = require('path');

function loadJsdom() {
  const cands = [
    'jsdom',
    'C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom',
    path.join(__dirname, '..', 'node_modules', 'jsdom'),
  ];
  for (const c of cands) { try { return require(c); } catch (e) {} }
  return null;
}

process.on('unhandledRejection', () => {});

let fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  OK   ' : '  FAIL ') + msg + (extra ? '  → ' + extra : ''));
  if (!cond) fail++;
};

const jsdomMod = loadJsdom();
const JSDOM = jsdomMod && jsdomMod.JSDOM;
if (!JSDOM) {
  console.log('⚠️  没有 jsdom，跳过（装法：npm i jsdom）');
  process.exit(0);
}

const R = path.join(__dirname, '..', 'public');
const dom = new JSDOM('<!doctype html><body><div id="content-area"></div></body>', {
  url: 'https://amyeng.top/', pretendToBeVisual: true,
});
const { window } = dom;
const document = window.document;
Object.defineProperty(window.navigator, 'userAgent', { value: 'node', configurable: true });

const noop = () => {};
const Api = new Proxy({}, {
  get(t, k) {
    if (k === 'answerKey') return (a, b, c, d) => [a, b, c, d].join('_');
    if (k === 'checkinKey') return (a, b) => 'ck_' + a + '_' + b;
    if (k === 'cloudAvailable') return () => false;
    if (k === 'isFillerTranscript') return () => false;
    if (k === 'asrCanRetry') return () => true;
    if (k === 'load') return () => new Promise(() => {});
    if (k === 'classStatus') return () => Promise.resolve({ removed: false });
    if (typeof k === 'string' && /^(get|load|save|submit|upload|resolve|dict|transcribe|warmup|asr|perf|send|student|register|status|check|update|delete|fetch|create|remove|bind|verify|login|logout|can|has|find|query|pull|push)/.test(k)) {
      return () => Promise.resolve({});
    }
    return noop;
  },
});
const Recorder = new Proxy({}, {
  get(t, k) {
    if (k === 'supported') return () => true;
    if (k === 'join' || k === 'padForAsr') return () => null;
    if (k === 'level') return () => 0;
    if (k === 'recording') return () => false;
    if (k === 'start' || k === 'stop') return () => Promise.resolve({ blob: {}, samples: null });
    return noop;
  },
});

const dataSrc = fs.readFileSync(path.join(R, 'data.js'), 'utf8');
const appSrcRaw = fs.readFileSync(path.join(R, 'app.js'), 'utf8');
const appSrc = appSrcRaw.replace(/\nApp\.init\(\);/, '\n/* App.init() 测试里不启动 */');

const sandbox = {
  document, window, location: window.location, navigator: window.navigator,
  localStorage: window.localStorage, sessionStorage: window.sessionStorage,
  Api, Recorder, URL: window.URL, fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: window.Audio,
  alert: noop, confirm: () => true, prompt: () => '',
  requestAnimationFrame: (cb) => setTimeout(cb, 0), cancelAnimationFrame: clearTimeout,
  SpeechSynthesisUtterance: function () {},
  speechSynthesis: { getVoices: () => [], speak: noop, cancel: noop, addEventListener: noop },
  MutationObserver: window.MutationObserver, IntersectionObserver: window.IntersectionObserver,
  setTimeout, clearTimeout, setInterval, clearInterval, console,
  indexedDB: undefined, performance, Blob: window.Blob, FormData: window.FormData,
};

let App, WEEKS;
try {
  const out = new Function('g', `
    const { document, window, location, navigator, localStorage, Api, Recorder, URL, fetch,
            Cloud, SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame,
            cancelAnimationFrame, SpeechSynthesisUtterance, speechSynthesis, MutationObserver,
            IntersectionObserver, setTimeout, clearTimeout, setInterval, clearInterval, console,
            indexedDB, performance, Blob, FormData } = g;
    ${dataSrc}
    ${appSrc}
    return { App: App, WEEKS: HOMEWORK_WEEKS, HINTS: (typeof SPEAK_HINTS !== 'undefined' ? SPEAK_HINTS : null) };
  `)(sandbox);
  App = out.App; WEEKS = out.WEEKS;
  sandbox.__hints = out.HINTS;
} catch (e) {
  console.log('app.js 装载失败：' + e.stack.split('\n').slice(0, 3).join(' | '));
  process.exit(1);
}

App.speak = noop;
App.showToast = noop;
App._playCorrectSound = noop;
App._playWrongSound = noop;

const plain = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ===== 1) 数据：60 道口语题的中文坐标齐不齐 =====
console.log('== 1) 每道口语题都要有"问什么 / 答什么"和四个选项的中文意思 ==');
let qTotal = 0, qMiss = 0, badLen = 0, dupCn = 0, emptyCn = 0;
WEEKS.forEach((wk) => {
  wk.forEach((d) => {
    (d.modules || []).forEach((m) => {
      if (m.type !== 'speaking') return;
      (m.questions || []).forEach((q) => {
        qTotal++;
        if (!q.options_cn || !q.answer_cn_hint) { qMiss++; console.log('  缺提示：' + q.id); return; }
        if (q.options_cn.length !== q.options.length) { badLen++; console.log('  条数对不上：' + q.id); }
        const set = new Set();
        q.options_cn.forEach((cn, i) => {
          const t = String(cn || '').trim();
          if (!t) { emptyCn++; console.log('  空译文：' + q.id + ' #' + i); }
          if (set.has(t)) { dupCn++; console.log('  译文重复：' + q.id + ' #' + i + ' ' + t); }
          set.add(t);
        });
        if (!String(q.answer_cn_hint || '').trim()) { emptyCn++; console.log('  空引导：' + q.id); }
      });
    });
  });
});
ok(qTotal === 90, '口语题一共 90 道（W1-W4 每周 15 道 + W5 承接 + W6 新增 15，当前 ' + qTotal + '）');
ok(qMiss === 0, '90 道全部有中文提示', '缺 ' + qMiss + ' 道');
ok(badLen === 0, '每道题的译文条数 = 选项条数', '错位 ' + badLen + ' 道');
ok(emptyCn === 0, '没有空白的引导 / 译文', '空 ' + emptyCn + ' 处');
ok(dupCn === 0, '同一题里四句译文互不相同', '重复 ' + dupCn + ' 处');

// ===== 2) 打乱后中英必须还对得上 =====
console.log('\n== 2) 选项打乱之后，中文意思跟着走（不能错位） ==');
const q1 = WEEKS[0][0].modules.filter((m) => m.type === 'speaking')[0].questions[0];
let shuffOk = 0, shuffBad = 0;
for (let t = 0; t < 40; t++) {
  const sh = App._getShuffledSpeakingOptions(q1);
  let good = !!sh.cn && sh.cn.length === sh.options.length;
  if (good) {
    sh.options.forEach((en, i) => {
      // 用数据里原始的一一对应关系反查：这句英文在原文里的下标，
      // 必须正好是这句中文在原文里的下标。
      const enIdx = q1.options.indexOf(en);
      const cnIdx = q1.options_cn.indexOf(sh.cn[i]);
      if (enIdx !== cnIdx) good = false;
    });
  }
  if (good) shuffOk++; else shuffBad++;
}
ok(shuffBad === 0, '随机打乱 40 次，中英始终一一对应', '错位 ' + shuffBad + ' 次');
ok(shuffOk === 40, '打乱 40 次全部通过', '通过 ' + shuffOk + ' 次');

// ===== 3) 三档提示的内容 =====
console.log('\n== 3) 三档提示：讲意思 → 让他自己对 → 才点名 ==');
function hintAt(attempt, opts) {
  const sh = {
    options: q1.options.slice(),
    answer: q1.answer,
    cn: q1.options_cn.slice(),
  };
  const picked = 1;                                  // 故意点错：第 2 句
  return plain(App._speakWrongHintHtml(Object.assign({
    attempt: attempt,
    q: q1,
    opts: sh.options,
    cns: sh.cn,
    answer: sh.answer,
    picked: picked,
    dead: [picked],
  }, opts || {})));
}

const h1 = hintAt(1);
ok(h1.indexOf(q1.sentence_cn) >= 0, '第 1 档说出了问句的中文意思', q1.sentence_cn);
ok(h1.indexOf(q1.answer_cn_hint) >= 0, '第 1 档说出了这道题要答什么');
ok(h1.indexOf(q1.options_cn[1]) >= 0, '第 1 档把他点的那句翻成了中文', q1.options_cn[1]);
ok(h1.indexOf(q1.options_cn[0]) < 0, '第 1 档不提前露出正确答案的中文');
ok(h1.indexOf('答案是') < 0, '第 1 档不提"答案是"');

const h2 = hintAt(2);
ok(h2.indexOf(q1.options_cn[0]) >= 0, '第 2 档把还没划掉的句子翻出来给他对');
ok(h2.indexOf(q1.options_cn[1]) < 0, '第 2 档不再啰嗦已经划掉的那句');
ok(h2.indexOf('答案是') < 0, '第 2 档仍然不点名');
ok(/哪一句在回答/.test(h2), '第 2 档问回他"哪一句在回答这个问题"');

const h3 = hintAt(3);
ok(h3.indexOf('答案是') >= 0, '第 3 档才点名');
ok(h3.indexOf(String.fromCharCode(65 + q1.answer)) >= 0, '第 3 档给出正确选项字母');
ok(h3.indexOf(q1.options[q1.answer]) >= 0, '第 3 档给出正确选项的英文');
ok(h3.indexOf(q1.options_cn[q1.answer]) >= 0, '第 3 档给出正确选项的中文意思');
ok(h3.indexOf(q1.explanation_cn.slice(0, 12)) >= 0, '第 3 档带上题库里的中文解析');

// 没有中文数据时不许瞎编 —— 要退回通用提示
const noCn = plain(App._speakWrongHintHtml({ attempt: 1, q: q1, opts: q1.options, cns: null, answer: q1.answer, picked: 1 }));
ok(noCn.indexOf(q1.options_cn[0]) < 0, '没有译文数据时不编造中文意思');
ok(noCn.length > 0, '没有译文数据时仍然给出一条提示');

// ===== 4) 逐句翻译屏：没听英文，不许按住说中文 =====
console.log('\n== 4) 「按住说中文」必须先听完英文 ==');
App.state.role = 'student';
App.state.phone = '13800000000';
App.state.userName = '测试学生';
App.state.currentTab = 'today';
App.state.audioEnabled = true;
App.state.currentDay = 0;
App._gates = {};

// 找一篇有逐句译文（passage_cn）的阅读理解模块
let rdM = null, rdMi = -1, rdDay = -1;
for (let di = 0; di < WEEKS[0].length && !rdM; di++) {
  const mods = WEEKS[0][di].modules || [];
  for (let i = 0; i < mods.length; i++) {
    if (mods[i].passage && mods[i].passage_cn && App._pairSentences(mods[i])) {
      rdM = mods[i]; rdMi = i; rdDay = di; break;
    }
  }
}
ok(!!rdM, '找到一篇带逐句译文的阅读理解课文', rdM && rdM.id);

App.state.currentDay = rdDay;
// 门禁的全局拦截是在 init() 里绑的，测试里把 init 关掉了，这里单独绑一次
// （线上就是 init 里的这一下，行为一致）。
App._bindGateGuard();
const htmlRd = App.renderTranslateStep(rdM, rdMi, 0, rdDay);
const gidRd = App._gid('trsg', rdMi, 0);

// 全部用真 DOM 验，不拿正则猜 HTML 长相：把这一屏贴进去，然后直接问节点。
document.getElementById('content-area').innerHTML = htmlRd;
const btnRd = document.getElementById('trs-btn-' + rdMi + '-0');
const listenRd = document.querySelector('.gate-listen[data-gate="' + gidRd + '"]');
ok(!!listenRd, '这一屏有「听整句英文」的入口（' + gidRd + '）');
ok(!!btnRd, '「按住说中文」真的渲染出来了');
ok(btnRd && btnRd.getAttribute('data-gate') === gidRd,
   '两者用的是同一个门', btnRd && btnRd.getAttribute('data-gate'));
ok(btnRd && btnRd.classList.contains('gate-locked'), '「按住说中文」渲染出来就是锁着的');
ok(btnRd && btnRd.getAttribute('data-nudge') && /先听一遍/.test(btnRd.getAttribute('data-nudge')),
   '拦下来时说的话是"先听英文"', btnRd && btnRd.getAttribute('data-nudge'));

if (btnRd) {
  const ev = new window.Event('pointerdown', { bubbles: true, cancelable: true });
  btnRd.dispatchEvent(ev);
  ok(ev.defaultPrevented === true, '没听英文就按住 → 被拦下（不会开录）');
  ok(!App._holdKey, '没听英文就按住 → 确实没有开始录音');
  ok(btnRd.classList.contains('gate-locked'), '锁的样式还挂着');
}

// 听完之后门开了，按钮要自动摘锁
App._gateUnlock(gidRd);
ok(btnRd && !btnRd.classList.contains('gate-locked'), '听完英文 → 「按住说中文」自动解锁');
if (btnRd) {
  const ev2 = new window.Event('pointerdown', { bubbles: true, cancelable: true });
  btnRd.dispatchEvent(ev2);
  ok(ev2.defaultPrevented === false, '听完英文后按住不再被拦');
}

// 完形填空逐句翻译同样要挂门
let czM = null, czMi = -1, czDay = -1;
for (let di = 0; di < WEEKS[0].length && !czM; di++) {
  const mods = WEEKS[0][di].modules || [];
  for (let i = 0; i < mods.length; i++) {
    if (mods[i].type === 'cloze' && mods[i].passage) { czM = mods[i]; czMi = i; czDay = di; break; }
  }
}
if (czM) {
  App.state.currentDay = czDay;
  const htmlCz = App.renderClozeTransStep(czM, czMi, 0, czDay);
  const gidCz = App._gid('cqtrsg', czMi, 0);
  document.getElementById('content-area').innerHTML = htmlCz;
  const btnCz = document.getElementById('cqtrs-btn-' + czMi + '-0');
  ok(!!btnCz && btnCz.getAttribute('data-gate') === gidCz,
     '完形填空的「按住说中文」也挂了同一个门（' + gidCz + '）');
  ok(!!btnCz && btnCz.classList.contains('gate-locked'), '完形填空的「按住说中文」渲染出来也是锁的');
  if (btnCz) {
    const ev3 = new window.Event('pointerdown', { bubbles: true, cancelable: true });
    btnCz.dispatchEvent(ev3);
    ok(ev3.defaultPrevented === true, '完形填空：没听英文就按住 → 一样被拦下');
  }
} else {
  console.log('  （本周没有完形填空模块，跳过）');
}

// ===== 汇总 =====
console.log('\n' + (fail ? '✗ ' + fail + ' 项失败' : '✓ 全部通过'));
process.exit(fail ? 1 : 0);
