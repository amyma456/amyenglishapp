/* eslint-disable */
// 词汇题的中文提示必须"不用滑动就能看见"（v118）。
//
// 家长的原话（2026-10-14）：
//   「今天的高频词汇学习，听发音选图片。这里的如果没有选对，的确有中文提示，
//     提示的很不错，但是中文提示需要滑动屏幕才能看见，要求不用滑动，
//     题目就在这个图片的下方能够看到」
//
// 病根：提示原来是 append 到整张词汇卡片的**最末尾**（#vocab-game-<mi> 里、
// .vocab-stage 之后），而卡片本身在手机上已经差不多占满一屏（大图 +
// 2×2 选项），于是提示被挤到屏幕外面，孩子得往下滑才看得见。
//
// 改成：提示槽位直接埋在题目（图片）正下方 —— 图片 → 题目 → 提示 → 选项 ——
// 答错时原地"长出来"，一行也不用滑。为了让"图片 + 提示 + 选项"仍然同屏放得下，
// 提示一出现就把上面那张大图收小一圈（.hint-open）。
//
// 钉住的行为：
//   1. 选图片 / 选释义两屏的提示槽位都在**图片之后、选项之前**（全库 4 周逐题查）
//   2. 槽位首屏是藏着的（display:none），不会平白占地方
//   3. 答错：提示落在槽位里（q-hint + 显示出来），**不再往卡片末尾塞**
//   4. 提示内容一个字没变：第 1 次给"围绕意思"的提示，第 2 次给中文例句，
//      第 3 次给释义 —— 全程不提是哪一张图（不给答案）
//   5. 答对：槽位里显示"✅ 正确！"
//   6. 提示出现时大图收小（hint-open 规则比默认尺寸小），且提示本身是紧凑样式
//
// 用法：node tools/verify-vocab-hint.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub：getElementById 是"严格"的 —— 只有当前这屏 HTML 里真的画出来的
// id 才拿得到元素。这样"提示到底落在哪个容器里"才验得准（宽松 stub 会来一个
// 造一个，任何 id 都能拿到，等于没验）。
// ---------------------------------------------------------------------------
const byId = {};
const allEls = [];
let installedIds = new Set();

function mkEl(tag, attrs, cls) {
  const e = {
    tagName: tag || 'div', _cls: new Set(cls || []), _attrs: Object.assign({}, attrs || {}),
    style: {}, innerHTML: '', textContent: '', className: '', disabled: false,
    value: '', children: [],
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    toggle: (c, on) => { if (on) e._cls.add(c); else e._cls.delete(c); return e._cls.has(c); },
    contains: c => e._cls.has(c),
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = c => { e.children.push(c); };
  e.remove = () => {}; e.scrollIntoView = () => {}; e.focus = () => {}; e.click = () => {};
  e.addEventListener = () => {}; e.removeEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.closest = () => null;
  e.querySelector = () => null; e.querySelectorAll = () => [];
  e.play = () => Promise.resolve();
  allEls.push(e);
  return e;
}
const getEl = id => (byId[id] = byId[id] || mkEl('div', { id: id }));

// 把一屏渲染出来的 HTML "装进" DOM：只有 HTML 里出现过的 id 才存在。
function install(html) {
  installedIds = new Set();
  const re = /id="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) installedIds.add(m[1]);
  Object.keys(byId).forEach(k => { if (!installedIds.has(k)) delete byId[k]; });
}

const stageBox = mkEl('div', {}, ['vocab-stage']);
const document = {
  getElementById: id => (installedIds.has(id) ? getEl(id) : null),
  querySelector: sel => (/\.vocab-stage$/.test(String(sel)) ? stageBox : null),
  querySelectorAll: () => [],
  createElement: mkEl,
  addEventListener: () => {}, removeEventListener: () => {},
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
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };

const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  checkinKey: (sid, d) => sid + '_d' + d,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}), saveLearnedWords: () => {},
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: () => Promise.resolve({}),
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
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
// 固定用第 3 周（家长报的这一天就在这一周），不跟日历走
const WEEKS = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const WEEK = 2;
const HOMEWORK_DATA = WEEKS[WEEK];

process.on('unhandledRejection', () => {});

const App = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, HOMEWORK_EPOCH, HOMEWORK_WEEK_IDX, URL, fetch, Cloud,
          SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
  ${src}
  return { App };
`)({
  document, window, location: window.location, navigator, localStorage, Api, Recorder,
  HOMEWORK_DATA, HOMEWORK_EPOCH: new Date(2026, 8, 28), HOMEWORK_WEEK_IDX: WEEK,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: () => new Promise(() => {}),
  Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: '',
  requestAnimationFrame: cb => setTimeout(cb, 0),
}).App;

const PHONE = '13800000000';
const SID = 'stu1';
App.speak = function () {};
App.autoSpeak = function () {};
App._playCorrectSound = function () {};
App._playWrongSound = function () {};

function loginAs() {
  App.state.role = 'student';
  App.state.phone = PHONE;
  App.state.students = [{ id: SID, phone: PHONE, name: '优诺-Uno' }];
  App.state.answers = {};
  App.state.vocabScore = 0;
  App._wrongTry = {};
}

// ===========================================================================
console.log('\n=== 1. 提示槽位埋在"图片正下方"（全库 4 周逐题查） ===');
{
  const imgTag = 'vocab-emoji-card';
  const slotTag = 'vocab-hint-';
  const optTag = 'vocab-options';
  let checked = 0;
  let badPos = 0;
  let badHidden = 0;
  const perType = { image_choice: 0, meaning_choice: 0 };

  WEEKS.forEach(function (wk, wi) {
    wk.forEach(function (day, di) {
      (day.modules || []).forEach(function (m, mi) {
        if (m.type !== 'vocabulary_game') return;
        (m.words || []).forEach(function (word, w) {
          (word.stages || []).forEach(function (stage, s) {
            if (stage.type !== 'image_choice' && stage.type !== 'meaning_choice') return;
            App.state.vocabWordIdx = w;
            App.state.vocabStage = s;
            const html = App.renderVocabStage(m, mi, di);
            const iImg = html.indexOf(imgTag);
            const iSlot = html.indexOf(slotTag + mi + '"');
            const iOpt = html.indexOf(optTag + '" id="vo-');   // 选项容器（不是单张卡片）
            checked++;
            perType[stage.type]++;
            if (!(iImg >= 0 && iSlot > iImg && iOpt > iSlot)) {
              badPos++;
              if (badPos <= 3) {
                console.log('    ✗ 第 ' + (wi + 1) + ' 周 ' + (di + 1) + ' 天 模块' + mi
                  + ' 词' + w + ' 阶段' + s + '：图 ' + iImg + ' / 槽 ' + iSlot + ' / 选项 ' + iOpt);
              }
            }
            // 槽位首屏必须是藏着的
            if (html.indexOf('id="vocab-hint-' + mi + '" style="display:none"') < 0) badHidden++;
          });
        });
      });
    });
  });

  ok(checked > 100, '扫过 ' + checked + ' 个"选图片 / 选释义"阶段（选图片 ' + perType.image_choice
     + ' 个、选释义 ' + perType.meaning_choice + ' 个）');
  ok(badPos === 0, '★ 每一屏的提示槽位都在**图片之后、选项之前**（违规 ' + badPos + ' 处）');
  ok(badHidden === 0, '槽位首屏是 display:none，不平白占地方（违规 ' + badHidden + ' 处）');
}

// ===========================================================================
console.log('\n=== 2. 答错：提示就落在图片下方那个槽位里 ===');
let dayIdx = -1, mi = -1, word = null, sIdx = -1;
WEEKS[WEEK].forEach(function (day, d) {
  if (dayIdx >= 0) return;
  (day.modules || []).forEach(function (m, i) {
    if (dayIdx >= 0) return;
    (m.words || []).forEach(function (w, wi2) {
      if (dayIdx >= 0) return;
      (w.stages || []).forEach(function (s, si) {
        if (dayIdx < 0 && s.type === 'image_choice' && s.options && s.options.length) {
          dayIdx = d; mi = i; word = w; sIdx = si;
        }
      });
    });
  });
});
const GM = HOMEWORK_DATA[dayIdx].modules[mi];
const WORDS = GM.words;
const STAGE = word.stages[sIdx];
{
  ok(dayIdx >= 0, '找到"听发音，选图片"这一屏：第 ' + (WEEK + 1) + ' 周 ' + (dayIdx + 1)
     + ' 天·' + GM.name_cn + '，单词 ' + word.word + '（' + STAGE.prompt + '）');

  loginAs();
  App.state.vocabWordIdx = WORDS.indexOf(word);
  App.state.vocabStage = sIdx;
  const html = App.renderVocabStage(GM, mi, dayIdx);
  install(html);

  const game = getEl('vocab-game-' + mi);
  const appended = [];
  game.appendChild = c => { appended.push(c); };

  const wrongIdx = (STAGE.answer + 1) % STAGE.options.length;
  App.checkVocabAnswer(mi, wrongIdx, STAGE.answer, dayIdx, WORDS.length, word.stages.length);

  const slot = byId['vocab-hint-' + mi];
  ok(!!slot, '槽位元素就在这一屏里（id=vocab-hint-' + mi + '）');
  const h = slot ? String(slot.innerHTML) : '';
  ok(slot && slot.style.display === 'block', '答错后槽位显示出来了（display:block）');
  ok(slot && slot.classList.contains('q-hint'), '槽位带上了 q-hint（橙底提示样式）');
  ok(/不是这个/.test(h), '第一句话还是"不是这个，再想想"：' + h.replace(/<[^>]*>/g, ' ').slice(0, 40));
  ok(word.hint_cn && h.indexOf(String(word.hint_cn)) >= 0,
     '★ 中文提示（围绕意思）就在槽位里，不用滑动就能看见（"' + word.hint_cn + '"）');
  ok(appended.length === 0,
     '★ 不再往整张卡片的最末尾塞提示（那正是"要滑一屏才看得见"的病根）');
  ok(h.indexOf(String(STAGE.options[STAGE.answer])) < 0, '仍然不提答案是哪张图');
  ok(!/第 ?[0-9] ?个/.test(h), '词汇题不点名"第几个"');
  ok(App.state.vocabScore === 0, '答错不加分');
}

// ===========================================================================
console.log('\n=== 3. 提示阶梯没被改动：第 2 次中文例句、第 3 次给释义（仍不给答案图） ===');
{
  const slot = byId['vocab-hint-' + mi];
  const wrongIdx2 = (STAGE.answer + 2) % STAGE.options.length;
  App.checkVocabAnswer(mi, wrongIdx2, STAGE.answer, dayIdx, WORDS.length, word.stages.length);
  const h2 = String(slot.innerHTML);
  ok(h2.indexOf(String(word.example_cn)) >= 0, '第 2 次错：补上"我们学过的一句话"（' + word.example_cn + '）');
  ok(h2.indexOf(String(word.hint_cn)) >= 0, '第 2 次错：原来的中文提示还挂着');
  ok(h2.indexOf(String(STAGE.options[STAGE.answer])) < 0, '第 2 次错：还是不说答案是哪张图');

  const wrongIdx3 = (STAGE.answer + 3) % STAGE.options.length;
  App.checkVocabAnswer(mi, wrongIdx3, STAGE.answer, dayIdx, WORDS.length, word.stages.length);
  const h3 = String(slot.innerHTML);
  ok(h3.indexOf(String(word.meaning)) >= 0, '第 3 次错：给释义帮他对着意思挑图（' + word.meaning + '）');
  ok(h3.indexOf(String(STAGE.options[STAGE.answer])) < 0, '第 3 次错：图还是他自己挑，不代点');
  ok(!/答案是/.test(h3), '第 3 次错：不出现"答案是……"这种直给');
}

// ===========================================================================
console.log('\n=== 4. 答对：槽位里显示"✅ 正确！" ===');
{
  const slot = byId['vocab-hint-' + mi];
  App.checkVocabAnswer(mi, STAGE.answer, STAGE.answer, dayIdx, WORDS.length, word.stages.length);
  ok(/✅ 正确/.test(String(slot.innerHTML)), '★ 答对的反馈也落在图片下方，不再"看不见"');
  ok(slot.style.display === 'block', '答对时槽位也是显示出来的');
  ok(!slot.classList.contains('q-hint'), '答对后橙色提示底色撤掉（只剩绿色的"正确"）');
}

// ===========================================================================
console.log('\n=== 5. 图片收小 + 提示紧凑：保证"图片 + 提示 + 选项"同屏 ===');
{
  // 提示出现时给 .vocab-stage 挂 hint-open，让上面那张大图收一圈
  App._vocabTightenForHint(mi);
  ok(stageBox.classList.contains('hint-open'),
     '答错后给舞台加了 hint-open（图片收小、给提示腾地方）');

  // 默认尺寸与 hint-open 尺寸都从真 CSS 里抠出来比（默认那条写在
  // .vocab-emoji-card 的主规则里，手机那条写在 @media(max-width:768px) 里）
  const num = (re) => { const m = htmlSrc.match(re); return m ? parseFloat(m[1]) : NaN; };
  const defDesktop = num(/\.vocab-emoji-card\{display:inline-flex[^}]*?width:(\d+)px/);
  const defMobile = num(/\.vocab-emoji-card\{width:(\d+)px;height:90px/);
  const openDesktop = num(/\.vocab-stage\.hint-open \.vocab-emoji-card\{width:(\d+)px;height:64px/);
  const openMobile = num(/\.vocab-stage\.hint-open \.vocab-emoji-card\{width:(\d+)px;height:58px/);
  ok(isFinite(defDesktop) && isFinite(openDesktop) && openDesktop < defDesktop,
     '桌上尺寸：默认 ' + defDesktop + 'px → 提示出现 ' + openDesktop + 'px（省下 ' + (defDesktop - openDesktop) + 'px）');
  ok(isFinite(defMobile) && isFinite(openMobile) && openMobile < defMobile,
     '手机尺寸：默认 ' + defMobile + 'px → 提示出现 ' + openMobile + 'px（省下 ' + (defMobile - openMobile) + 'px）');

  ok(/\.vocab-hint-slot\{display:none\}/.test(htmlSrc), '槽位默认隐藏的规则在 CSS 里');
  const fs13 = num(/\.vocab-hint-slot\.q-hint\{[^}]*font-size:([\d.]+)px/);
  const lh = num(/\.vocab-hint-slot\.q-hint\{[^}]*line-height:([\d.]+)/);
  ok(isFinite(fs13) && fs13 <= 13, '提示字号压到 ' + fs13 + 'px（≤13，尽量少占地方）');
  ok(isFinite(lh) && lh <= 1.6, '提示行高 ' + lh + '（≤1.6，紧凑）');
  ok(/\.vocab-hint-slot\.q-hint\{[^}]*text-align:left/.test(htmlSrc), '提示左对齐（好读）');
}

// ===========================================================================
console.log('\n=== 6. 版本与缓存名 ===');
{
  ok(/name="app-version" content="120"/.test(htmlSrc), '版本号升到 120');
  ok(/amy-english-v120/.test(swSrc), 'Service Worker 缓存名同步到 v120（不然手机上还是旧版）');
}

console.log('\n' + (fail === 0 ? '全部通过' : (fail + ' 项失败')));
process.exit(fail === 0 ? 0 : 1);
