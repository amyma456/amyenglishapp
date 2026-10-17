/* eslint-disable */
// 回归红线（v119）：高频词汇「逐字母连读 + 整词」这一段，家长四条要求：
//
//   1. 逐字母这一屏**不要**「先听一遍（逐字母连读 + 整词）」这句、也不要它里面的
//      朗读 —— 全流程只留连读那一屏的「先听一遍（连起来读）」。
//   2. 单个字母不用每个都判分等分：只要标出"哪一格是错的、重读那一格"。
//      判定放宽到"只要不是明显的错都让过"。
//   3. 全部读对之后**弹出**「连续读一遍」。
//   4. 连起来读完一遍之前，底部「下一个单词」**永远是虚的**，点不动、也跳不过去。
//
// 用法：node tools/verify-spell-listen.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------- 极简 DOM stub（与 verify-spell-stage 同款） ----------
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false, id: '',
    classList: {
      add: (...c) => c.forEach(x => e._cls.add(x)),
      remove: (...c) => c.forEach(x => e._cls.delete(x)),
      toggle: (c, on) => on ? e._cls.add(c) : e._cls.delete(c),
      contains: c => e._cls.has(c),
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    insertAdjacentHTML: (pos, h) => { e.innerHTML += h; },
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    removeAttribute: k => { delete e._attrs[k]; },
    appendChild: () => {}, remove: () => {}, scrollIntoView: () => {},
    play: () => Promise.resolve(), focus: () => {}, click: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
  };
  return e;
}
const byId = {};
const getEl = id => (byId[id] = byId[id] || el('div'));
const bodyEl = el('body');
bodyEl.children = [];
bodyEl.appendChild = (c) => {
  bodyEl.children.push(c);
  c.remove = () => bodyEl.removeChild(c);
};
bodyEl.removeChild = (c) => { const i = bodyEl.children.indexOf(c); if (i >= 0) bodyEl.children.splice(i, 1); };
const document = {
  getElementById: id => {
    const kid = bodyEl.children.find(c => c.id === id);
    if (kid) return kid;
    return (byId[id] = byId[id] || el('div'));
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: el,
  addEventListener: () => {}, removeEventListener: () => {},
  body: bodyEl, documentElement: el('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const location = window.location;
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

// 记录每一次"上报分数"，用来验证字母格不再逐个交分
const scored = [];
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: (p) => { scored.push(p); return Promise.resolve({}); },
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
const scope = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS };')();
const HOMEWORK_DATA = scope.WEEKS[0];

process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location, navigator, localStorage, Api, Recorder, HOMEWORK_DATA,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

App.state.phone = '13800000000';
App.state.role = 'student';
App.state.students = [{ id: 'stu1', phone: '13800000000', name: 'test' }];
App.state.currentTab = 'today';
App.state.audioEnabled = true;
App.isTeacher = () => false;
App.speak = function (text, opts) { if (opts && opts.onDone) opts.onDone(); };

// ---- 定位：第 0 天第 1 个模块，第一个带 letter_read 的词 ----
const DAY = 0, MI = 1;
const m = HOMEWORK_DATA[DAY].modules[MI];
let wordIdx = -1, stageIdx = -1, word = null;
(m.words || []).forEach((w, wi) => w.stages.forEach((s, si) => {
  if (wordIdx < 0 && s.type === 'letter_read') { wordIdx = wi; stageIdx = si; word = w; }
}));
if (wordIdx < 0) { console.log('  FAIL 第 1 周没有 letter_read 阶段'); process.exit(1); }
const UNITS = word.word.split('');

function enterStage() {
  App.state.vocabWordIdx = wordIdx;
  // v136：底部按钮还要看「这个词学完了没有」
  App.state.vocabDoneIdx = wordIdx - 1;
  App.state.vocabReviewDone = true;
  App.state.vocabStage = stageIdx;
  App._spell = null;
  App.renderVocabStage(m, MI, DAY);
}
// 把 _holdStart 换成同步回放：读一次格子就拿到一条识别结果。
// 连读那一屏仍然保留"先听再读"的门禁（家长只要求去掉逐字母那屏的），
// 这里把门禁临时置开，专测读之后的判定与放行。
function withHold(fn) {
  const orig = App._holdStart;
  const origGate = App._gateOpen;
  let cb = null;
  App._holdStart = function () { cb = arguments[4]; };
  App._gateOpen = function () { return true; };
  const feed = (text, out) => { cb(out === undefined ? { blob: {}, samples: null } : out, text); };
  fn(feed);
  App._holdStart = orig;
  App._gateOpen = origGate;
}
const statusMsg = () => getEl('spell-status-' + MI).innerHTML;

// =====================================================================
console.log('== 1) 逐字母这一屏：不再有「先听一遍」、也没有门禁 ==');
{
  enterStage();
  const html = App._renderSpellRead(m, MI, DAY, word, UNITS, 'letter');
  ok(html.indexOf('data-say=') < 0 && html.indexOf('gate-listen') < 0,
     'v119：这一屏不再挂任何示范（家长：上面那个「先听一遍，逐字母连读加整词」不要了）');
  ok(html.indexOf('逐字母连读') < 0, '「逐字母连读 + 整词」这句文案已经不存在');
  ok(html.indexOf('gate-locked') < 0 && html.indexOf('data-gate=') < 0,
     '格子不再需要"先听完示范才让读"（点住就能读）');
  ok(html.indexOf('id="spell-row-') >= 0, '格子那一排还在（spell-row）');
  ok((html.match(/class="spell-box hold-target"/g) || []).length === UNITS.length,
     '字母格一个不少：' + UNITS.length + ' 格');
  ok(/id="spell-word-/.test(html), '整词格还在');
  ok(!/disabled/.test(html.split('id="spell-row-')[1].split('</div>')[0]),
     '格子没有 disabled（不用等任何前置条件）');
}

// =====================================================================
console.log('\n== 2) 连读那一段示范：唯一的一处听，且渲染时就预取 ==');
{
  const want = App._spellDemo('letter', UNITS, word.word);
  ok(want === 'Letters: ' + UNITS.map(x => x.toUpperCase()).join(', ') + ', ' + word.word,
     '示范串 = Letters + 逗号字母串 + 逗号整词（' + want.slice(0, 34) + '…）');
  const pre = [];
  const origPref = App.prefetchTts;
  App.prefetchTts = function (t) { pre.push(String(t)); };
  App._renderSpellRead(m, MI, DAY, word, UNITS, 'letter');
  ok(pre.indexOf(want) >= 0, '逐字母屏一渲染就把这段示范取回来（走到连读时"一点就出声音"）');
  App.prefetchTts = origPref;

  enterStage();
  App.startContinuous(MI);
  const contHtml = getEl('spell-result-area-' + MI).innerHTML;
  const gates = (contHtml.match(/gate-listen/g) || []).length;
  ok(gates === 1, '连读屏只有 1 个听入口（实际 ' + gates + ' 个）');
  ok(contHtml.indexOf('🔊 先听一遍（连起来读）') >= 0, '文案就是「先听一遍（连起来读）」');
  const sayM = contHtml.match(/data-say="([^"]*)"/);
  ok(!!sayM && sayM[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'") === want,
     '连读屏的示范与 _spellDemo 逐字相同');
  // 连读这一屏**保留**「先听完示范才能读」的门禁（家长只要求去掉逐字母那屏的）
  ok(contHtml.indexOf('class="cont-seq gate-locked"') >= 0
     && contHtml.indexOf('hold-target gate-locked') >= 0,
     '连读屏仍然要求"先听一遍再读"（门禁只删了逐字母那屏的）');
}

// =====================================================================
console.log('\n== 3) 单个字母不再逐个交分数：只标"哪一格错" ==');
{
  enterStage();
  scored.length = 0;
  withHold(feed => {
    getEl('spell-' + MI + '-0').textContent = UNITS[0].toUpperCase();
    App._readUnit({ preventDefault() {} }, MI, 0);
    feed(UNITS[0].toLowerCase());                       // 读对
  });
  ok(scored.length === 0, '读对一格 → 0 次分数上报（实际 ' + scored.length + '）');
  ok(App._spell.unitScores[0].ok === true, '仍然记下"这格读对了"');
  ok(statusMsg().indexOf('✅') >= 0 && statusMsg().indexOf('分') < 0,
     '提示里只有打勾、没有分数（' + statusMsg().replace(/<[^>]*>/g, '') + '）');

  withHold(feed => {
    getEl('spell-' + MI + '-1').textContent = UNITS[1].toUpperCase();
    App._readUnit({ preventDefault() {} }, MI, 1);
    feed(UNITS[1].toLowerCase());
    getEl('spell-' + MI + '-2').textContent = UNITS[2].toUpperCase();
    App._readUnit({ preventDefault() {} }, MI, 2);
    feed('');
  });
  ok(scored.length === 0, '再读两格（含一格没听清）→ 还是 0 次上报');

  // 反面：整词仍然上报（老师端看得到整词分）
  scored.length = 0;
  withHold(feed => {
    App._readFullWord({ preventDefault() {} }, MI);
    feed(word.word);
  });
  ok(scored.length === 1 && scored[0].type === 'word',
     '整词朗读仍然上报 1 条（type=word）');
  ok(scored.every(s => s.type !== 'letter' && s.type !== 'syllable'),
     '没有任何 letter / syllable 级别的分数上报（v119 起不再逐格交分）');
}

// =====================================================================
console.log('\n== 4) 判定放宽：不明显的错都让过，明显的错才判红 ==');
{
  const L = UNITS[0].toLowerCase();
  const cases = [
    ['', '识别端一个字都没回来'],
    ['N', '孤立单字母瞎猜（实测读 D 回来 N）'],
    ['Capitoli', '不像任何字母音的幻觉词'],
  ];
  cases.forEach(function (c) {
    enterStage();
    withHold(feed => {
      getEl('spell-' + MI + '-0').textContent = L.toUpperCase();
      App._readUnit({ preventDefault() {} }, MI, 0);
      feed(c[0]);
    });
    const u = App._spell.unitScores[0];
    const cell = getEl('spell-' + MI + '-0');
    ok(u.unclear === true && cell.classList.contains('read-miss') === false,
       c[1] + ' → 记「没听清」，格子不判红（' + JSON.stringify(c[0]) + '）');
  });
  // 读对
  enterStage();
  withHold(feed => {
    getEl('spell-' + MI + '-0').textContent = L.toUpperCase();
    App._readUnit({ preventDefault() {} }, MI, 0);
    feed(L);
  });
  ok(App._spell.unitScores[0].ok === true
     && getEl('spell-' + MI + '-0').classList.contains('read-miss') === false,
     '读对 → 过，不判红');
  // 明确读到另一个字母 → 判红、要点名重读
  const other = (App._MIX_PAIRS[L] ? App._LNAMES[App._MIX_PAIRS[L]].split(' ')[0] : 'bee');
  enterStage();
  withHold(feed => {
    getEl('spell-' + MI + '-0').textContent = L.toUpperCase();
    App._readUnit({ preventDefault() {} }, MI, 0);
    feed(other);
  });
  ok(App._spell.unitScores[0].ok === false
     && getEl('spell-' + MI + '-0').classList.contains('read-miss') === true,
     '读到别的字母（' + L + ' ← ' + other + '）→ 判红，这一格要重读');
  ok(App._finishSpell && true, '（判定梯度沿用 _letterOk / _letterNear，未改）');
}

// =====================================================================
console.log('\n== 5) 音节格子同样放宽 ==');
{
  ok(App._syllableUnclear('beau', 'bow and arrow') === true,
     '识别把音节写成一整串别的词 → 记「没听清」（不判红）');
  ok(App._syllableUnclear('beau', '') === true, '一个字都没回来 → 没听清');
  ok(App._syllableUnclear('beau', 'boo') === false, '短 token 且长度接近 → 算真的读错');
  ok(App._syllableUnclear('ti', 'tee') === false, 'ti ← tee 长度接近 → 判错（要重读）');

  const wS = m.words.find(w => w.stages.some(s => s.type === 'syllable_blend'));
  ok(!!wS, '模块里有 syllable_blend 阶段');
  if (wS) {
    const si = wS.stages.findIndex(s => s.type === 'syllable_blend');
    App.state.vocabWordIdx = m.words.indexOf(wS);
    App.state.vocabStage = si;
    App._spell = null;
    App.renderVocabStage(m, MI, DAY);
    const u0 = String(App._spell.units[0]);
    withHold(feed => {
      getEl('spell-' + MI + '-0').textContent = u0;
      App._readUnit({ preventDefault() {} }, MI, 0);
      feed('this is a long sentence returned by the recogniser');
    });
    ok(App._spell.unitScores[0].unclear === true
       && getEl('spell-' + MI + '-0').classList.contains('read-miss') === false,
       '端到端：音节格识别回一串词 → 不判红、不挡路');
  }
}

// =====================================================================
console.log('\n== 6) 全部读对 → 弹出「连续读一遍」 ==');
{
  enterStage();
  for (let i = 0; i < App._spell.total; i++) {
    App._spell.takes[i] = {};
    App._spell.unitScores[i] = { label: 'X', ok: true, heard: 'x' };
  }
  App._spell.wordTake = {}; App._spell.score = 100; App._spell.heard = word.word;
  App._spellProgress(MI);
  const pop = getEl('spell-result-area-' + MI).innerHTML;
  ok(App._spell.allOk === true, '全读对 → allOk=true');
  ok(pop.indexOf('class="spell-pop"') >= 0, '弹出卡片（.spell-pop）');
  ok(pop.indexOf('spell-pop-card') >= 0 && pop.indexOf('全部读对啦') >= 0,
     '卡片内容：🎉 全部读对啦 + 下一步说明');
  ok(pop.indexOf('onclick="App.startContinuous(' + MI + ')"') >= 0,
     '卡片里那颗按钮就是「连续读一遍」→ startContinuous');
  ok(/连续读一遍/.test(pop), '按钮文案「连续读一遍 →」');
  ok(htmlSrc.indexOf('.spell-pop{') >= 0 && htmlSrc.indexOf('.spell-pop-card{') >= 0,
     'index.html 里有 .spell-pop / .spell-pop-card 样式');
  ok(htmlSrc.indexOf('@keyframes popIn') >= 0 && htmlSrc.indexOf('@keyframes fadeIn') >= 0,
     '动画 keyframes 都在（fadeIn 以前只被引用、没定义，这次补上了）');
  ok(pop.indexOf('spell-retry-hint') < 0, '全读对时不再显示"要重读"的红条');
  // 有错时反过来：红条 + 不弹卡片
  enterStage();
  for (let i = 0; i < App._spell.total; i++) {
    App._spell.takes[i] = {};
    App._spell.unitScores[i] = { label: 'X', ok: true };
  }
  App._spell.unitScores[0] = { label: 'B', ok: false };
  App._spell.wordTake = {}; App._spell.score = 90;
  App._spellProgress(MI);
  const bad = getEl('spell-result-area-' + MI).innerHTML;
  ok(App._spell.allOk === false && bad.indexOf('spell-retry-hint') >= 0
     && bad.indexOf('spell-pop') < 0, '还有错字母 → 只显示重读提示、不弹卡片');
}

// =====================================================================
console.log('\n== 7) 连读没读完：「下一个单词」永远是虚的 ==');
{
  const btn = getEl('stage-next-' + MI);
  enterStage();
  for (let i = 0; i < App._spell.total; i++) App._spell.takes[i] = {};
  App._spell.wordTake = {}; App._spell.unitScores = {};
  for (let i = 0; i < App._spell.total; i++) App._spell.unitScores[i] = { label: 'X', ok: true };
  App._spellProgress(MI);
  App._syncVocabFootLabel(MI, DAY);
  ok(App._spell.allOk === true && btn.disabled === true,
     '逐格全读对、但还没连读 → 按钮仍然 disabled（家长："下一个单词还是仍然是虚的"）');
  const at = App.state.vocabWordIdx;
  App.nextVocabWord(MI, DAY);
  ok(App.state.vocabWordIdx === at, '这时点它也不跳（双保险挡回来）');

  // 走真实连读链路：识别只回整词也算过
  withHold(feed => {
    App.startContinuous(MI);
    ok(App._spell.contDone === false, 'startContinuous 一进来 contDone 清零（这一遍还没读）');
    App._readContinuous({ preventDefault() {} }, MI);
    feed(word.word);
  });
  ok(App._spell.contDone === true, '连读读全 → contDone=true');
  App._syncVocabFootLabel(MI, DAY);
  ok(btn.disabled === false, '连起来读过一遍 → 「下一个单词」才亮');
  App.nextVocabWord(MI, DAY);
  ok(App.state.vocabWordIdx === at + 1, '这时才跳得动（' + at + ' → ' + App.state.vocabWordIdx + '）');

  // 反面：连读读错 → 继续锁
  enterStage();
  for (let i = 0; i < App._spell.total; i++) App._spell.takes[i] = {};
  App._spell.wordTake = {};
  for (let i = 0; i < App._spell.total; i++) App._spell.unitScores[i] = { label: 'X', ok: true };
  App._spellProgress(MI);
  withHold(feed => {
    App.startContinuous(MI);
    App._readContinuous({ preventDefault() {} }, MI);
    feed('zzz zzz');
  });
  App._syncVocabFootLabel(MI, DAY);
  ok(App._spell.contDone === false && btn.disabled === true,
     '连读读成一串废话 → 仍然锁着，必须重读');
}

// =====================================================================
console.log('\n== 8) 三处放行条件一致 + 版本号 ==');
{
  const appSrc = src;
  // v136：判据收进了一个函数里（_vocabFootLocked），不再两处各写一遍 ——
  // 那正是以前"改了一处漏了一处"的病根。这里改成验"判据只有一份，且三处都走它"。
  const footCalls = (appSrc.match(/_vocabFootLocked\(/g) || []).length;
  ok(/sp\.contDone === true/.test(appSrc) || /contDone !== true/.test(appSrc),
     '连读通过（contDone）仍然是放行条件之一');
  ok(footCalls >= 4,
     '同一套判据被共用：定义 + nextVocabWord + _syncVocabFootLabel + renderStage（' + footCalls + ' 处）');
  ok(/先把字母和单词连着读一遍，才能到下一个单词/.test(appSrc),
     'nextVocabWord 里给孩子一句明确的提示语');
  ok(/还有字母没读对，按住红色的格子再读一次/.test(appSrc), '还有错字母时另有一句');
  ok(!/this\._gateNudge\(this\._gid\('spellg'/.test(appSrc), '逐字母那套门禁已经拆掉，不再 nudge');
  ok(/按住每个格子读一遍，再按住整词读一遍/.test(appSrc), '这一屏的指令同步改了');
  ok(/name="app-version" content="136"/.test(htmlSrc), '版本号升到 136');
  ok(/amy-english-v136/.test(swSrc), 'Service Worker 缓存名同步到 v136（不然手机上还是旧版）');
}

console.log('\n' + (fail ? ('有 ' + fail + ' 项失败 ❌') : '全部通过 ✅'));
process.exit(fail ? 1 : 0);
