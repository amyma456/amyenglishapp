/* eslint-disable */
// 完形填空两条改动的回归（v126）。
//
// 家长原话：
//  「今天的完形填空，所有句子主读完了之后，要翻译每个句子……就像之前做阅读
//   理解一样，每个句子点出来去翻译，然后每个句子的单词可以点一下出来中文
//   意思，让学生自己先翻译。如果他翻译错了，就出来听力，就出来翻译的原文。
//   错的不多的话，就错放过。如果错的太多，出入太大的话，就要重新读。」
//  「并且，完形填空今天的第四空和第五空是同一个句子，挖了两个空。也就是说，
//   在做题的时候，一次性把 4 和 5 一次性在选择里头做完，以至于后面他跟着系统
//   读的时候，系统不会再说 4 blank 或者 5 blank，而是一起会把这个 blank 的
//   空词给真正的写出来，成为一个完整的句子。以后再遇到类似的完形填空或者是
//   选择，都要这样处理，不要再出现 blank。」
//
// 这个脚本守三件事：
//   ① 完形填空的朗读 / 跟读里**永远不再出现 blank**，而且同句多个空一起补全；
//   ② 同一句挖了多个空 → 在步骤表里合成一屏，一题不漏、顺序不乱；
//   ③ 整篇逐句翻译的步骤在"主读之后、填空之前"，参考译文取得到。
//
// 用法：node tools/verify-cloze-flow.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub
// ---------------------------------------------------------------------------
const byId = {};
function mkEl(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), _attrs: {}, style: {},
    innerHTML: '', textContent: '', className: '', dataset: {}, value: '',
    disabled: false,
  };
  e.classList = {
    add: (...c) => c.forEach(x => e._cls.add(x)),
    remove: (...c) => c.forEach(x => e._cls.delete(x)),
    contains: c => e._cls.has(c),
    toggle: () => false,
  };
  e.setAttribute = (k, v) => { e._attrs[k] = String(v); };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.querySelector = () => null;
  e.querySelectorAll = () => []; e.addEventListener = () => {};
  e.insertAdjacentHTML = () => {}; e.focus = () => {}; e.scrollIntoView = () => {};
  e.closest = () => null;
  return e;
}
const document = {
  getElementById: id => (byId[id] = byId[id] || mkEl('div')),
  querySelector: () => null, querySelectorAll: () => [],
  createElement: mkEl, addEventListener: () => {},
  body: mkEl('body'), documentElement: mkEl('html'),
  visibilityState: 'visible', readyState: 'complete', hidden: false,
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  location: { search: '', href: '', hash: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const Api = {
  warmup: () => {}, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
  getAllWrongQuestions: async () => [], load: async () => ({}),
  loadWrongCache: async () => {}, dict: async () => null,
  submitSpeakingScore: () => {}, uploadRecording: () => Promise.resolve(),
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');

// 把四周数据都拿出来，逐个模块检查（不只测今天）。
const weeks = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
process.on('unhandledRejection', () => {});

let App;
// HOMEWORK_DATA 是全局常量，绑死一个周。测试里要用哪一周的数据，就直接把
// 那一周塞进去 —— 否则 _buildSteps 读的是 A 周、我断言的是 B 周，句数对不上。
function loadApp(week) {
  return new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${src}
    return { App };
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA: week,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
}
try {
  App = loadApp(weeks[0]);
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

// 收集所有周、所有天的所有完形填空模块
const ALL_CLOZE = [];
weeks.forEach(function (wk, wi) {
  (wk || []).forEach(function (day, di) {
    (day.modules || []).forEach(function (m, mi) {
      if (m.type === 'cloze') ALL_CLOZE.push({ wk: wi, day: di, mi, m });
    });
  });
});
const TODAY = ALL_CLOZE.filter(function (x) { return x.m.id === 'w3-thu-cloze'; })[0];
const hasBlank = function (s) { return /blank/i.test(String(s || '')); };
const hasUnderscore = function (s) { return /_{2,}/.test(String(s || '')); };
// 把 class / on* 等属性抹掉再看正文 —— CSS 类名和函数名里带 blank
// （.cq-blank / selectClozeBlank），那是标记不是给孩子看的字，别误判。
const stripAttrs = function (s) {
  return String(s || '')
    .replace(/class="[^"]*"/g, '')
    .replace(/on[a-z]+="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, '');
};

// ===========================================================================
console.log('\n=== 1. 完形填空的题干朗读：再也不出现 blank，且同句所有空一起补全 ===');
{
  ok(ALL_CLOZE.length > 0, '数据里找得到完形填空模块（共 ' + ALL_CLOZE.length + ' 个）');

  let badBlank = [];
  let badUnder = [];
  ALL_CLOZE.forEach(function (x) {
    const m = x.m;
    m.questions.forEach(function (q, qi) {
      const t = App._questionSpeechText(m, q);
      const r = App._buildReadSentence(m, q);
      if (hasBlank(t)) badBlank.push(m.id + ' 空' + (qi + 1) + ' 朗读: ' + t);
      if (hasBlank(r)) badBlank.push(m.id + ' 空' + (qi + 1) + ' 跟读: ' + r);
      if (hasUnderscore(t)) badUnder.push(m.id + ' 空' + (qi + 1) + ' 朗读: ' + t);
      if (hasUnderscore(r)) badUnder.push(m.id + ' 空' + (qi + 1) + ' 跟读: ' + r);
    });
  });
  ok(badBlank.length === 0, '全部完形填空的朗读/跟读里没有一个 blank'
     + (badBlank.length ? '\n         ' + badBlank.slice(0, 4).join('\n         ') : ''));
  ok(badUnder.length === 0, '朗读/跟读里也没有残留的 ___ 下划线'
     + (badUnder.length ? '\n         ' + badUnder.slice(0, 4).join('\n         ') : ''));

  if (TODAY) {
    const m = TODAY.m;
    // 第 4 空和第 5 空同句：两个都必须补全，读出来是同一句完整的话。
    const t4 = App._questionSpeechText(m, m.questions[3]);
    const t5 = App._questionSpeechText(m, m.questions[4]);
    ok(t4 === t5, '今天的第 4 空和第 5 空朗读的是同一句（因为它们在同一个句子里）');
    ok(/must take care of it/.test(t4), '第 4 空补上了 must：' + t4.slice(0, 60));
    ok(/make you happy/.test(t4), '第 5 空补上了 happy（同句一起补全）');
    ok(!hasBlank(t4) && !hasUnderscore(t4), '这一句里既没有 blank 也没有下划线');
  } else {
    ok(false, '找不到 w3-thu-cloze（今天这周的完形填空），检查数据 id 是否变了');
  }
}

// ===========================================================================
console.log('\n=== 2. 同句多空合并成一屏：一题不漏、顺序不乱 ===');
{
  let allCovered = true;
  let orderKept = true;
  let groupCount = 0;
  const detail = [];

  ALL_CLOZE.forEach(function (x) {
    const m = x.m;
    const groups = App._clozeQuestionGroups(m);
    groupCount += groups.length;
    // 每个空恰好出现一次
    const flat = [].concat.apply([], groups);
    if (flat.length !== m.questions.length) allCovered = false;
    const sorted = flat.slice().sort(function (a, b) { return a - b; });
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i) allCovered = false;
      if (flat[i] !== sorted[i]) orderKept = false;
    }
    groups.forEach(function (g) {
      if (g.length > 1) {
        // 同组的空必须真的落在同一句课文里
        const s0 = App._clozeSentenceOf(m, m.questions[g[0]]);
        g.forEach(function (qi) {
          const s = App._clozeSentenceOf(m, m.questions[qi]);
          if (s !== s0) allCovered = false;
        });
        detail.push(m.id + ' 空' + g.map(function (i) { return i + 1; }).join('+'));
      }
    });
  });

  ok(allCovered, '每个空都被分到某一组，且同组的空确实在同一句课文里');
  ok(orderKept, '分组顺序和题号一致（不会跳号、不会倒序）');
  ok(groupCount > 0, '总共分出了 ' + groupCount + ' 个填空屏');
  ok(detail.indexOf('w3-thu-cloze 空4+5') >= 0,
     '今天第 4、5 空被合成了一组：' + (detail.join(' / ') || '（没有同句多空）'));

  if (TODAY) {
    const groups = App._clozeQuestionGroups(TODAY.m);
    ok(JSON.stringify(groups) === JSON.stringify([[0], [1], [2], [3, 4]]),
       '今天的完整分组是 1/2/3/(4+5)：' + JSON.stringify(groups));
  }

  // 同句多空这一屏，跟读的是把两个空都填好的完整句子
  if (TODAY) {
    const fq = TODAY.m.questions[3];
    const rd = App._buildReadSentence(TODAY.m, fq);
    ok(rd === '"You must take care of it, and it will make you happy."',
       '第 4+5 空这一屏跟读的是填满两个空的完整句');
  }
}

// ===========================================================================
console.log('\n=== 3. 整篇逐句翻译：步骤在主读之后、填空之前，且取得到参考译文 ===');
{
  if (TODAY) {
    const A = loadApp(weeks[TODAY.wk]);
    const m = TODAY.m;
    const sents = A._splitSentences(m.passage);
    ok(sents.length > 1, '今天这篇课文有 ' + sents.length + ' 句');

    // 跨过 cloze 模块，直接看步骤表。位置从数据里推出来，别写死 ——
    // 周几/第几个模块都可能变。
    A.state.currentDay = TODAY.day;
    A.state.studentId = 'test-stu';
    A.state.phone = '13000000000';
    const steps = A._buildSteps(TODAY.day);
    const kinds = steps.filter(function (s) { return s.mi === TODAY.mi; })
                        .map(function (s) { return s.kind; });
    const nSent = kinds.filter(function (k) { return k === 'sentence'; }).length;
    const nTrans = kinds.filter(function (k) { return k === 'cqtrans'; }).length;
    const iLastSent = kinds.lastIndexOf('sentence');
    const iFirstTrans = kinds.indexOf('cqtrans');
    const iFirstGroup = kinds.indexOf('clozegroup');
    const iLastTrans = kinds.lastIndexOf('cqtrans');

    ok(nSent === sents.length, '主读逐句屏 = ' + sents.length + ' 屏（每句一屏），实际 ' + nSent);
    ok(nTrans === sents.length, '逐句翻译屏 = ' + sents.length + ' 屏（整篇每句都翻译），实际 ' + nTrans);
    ok(iFirstTrans === iLastSent + 1, '翻译紧跟主读之后（没有插在中间）');
    ok(iFirstGroup > iLastTrans, '填空排在全部翻译之后（先读、再译、后填）');
    ok(kinds.indexOf('translate') < 0 && kinds.indexOf('passage') < 0,
       '完形填空不再走阅读理解的 passage/passage_cn 配对路线');

    // 参考译文：至少挖了空的那几句都取得到
    let refOk = 0;
    sents.forEach(function (s, i) {
      const ref = A._clozeSentenceRefCn(m, i, s);
      const blanksHere = A._clozeBlanks(m).filter(function (b) { return s.indexOf(b.raw) >= 0; });
      if (blanksHere.length && ref) refOk++;
      if (blanksHere.length) {
        ok(!!ref, '第 ' + (i + 1) + ' 句（含第 ' + blanksHere.map(function (b) { return b.num; }).join('、')
           + ' 空）取得到参考中文');
      }
    });
    ok(refOk > 0, '含空的句子共拿到 ' + refOk + ' 条参考中文');

    // 翻译时看到的是填满空之后的完整句，不是 "4___"
    const shown = sents.map(function (s) { return A._clozeFillSentence(m, s, false) || s; });
    ok(shown.every(function (s) { return !hasUnderscore(s) && !hasBlank(s); }),
       '翻译屏上显示的每一句都是完整的（没有 ___ / blank）');
  } else {
    ok(false, '找不到今天的完形填空模块，跳过这一步');
  }
}

// ===========================================================================
console.log('\n=== 4. 翻译三档判定：小错放过、大错重读 ===');
{
  ok(App.TRANS_PASS === 60, '及格线还是 60（和阅读理解同一把尺）');
  ok(App.TRANS_SOFT === 40, '小错线是 40');
  ok(App._transBand(80, true) === 'pass', '80 分 → 过');
  ok(App._transBand(60, true) === 'pass', '刚好 60 → 过');
  ok(App._transBand(59, true) === 'soft', '59 分 → 小错（亮原文但放行）');
  ok(App._transBand(40, true) === 'soft', '刚好 40 → 小错');
  ok(App._transBand(39, true) === 'hard', '39 分 → 出入太大，要重说');
  ok(App._transBand(0, false) === 'hard', '完全没听清 → 也要重来（但不叫"错"）');
}

// ===========================================================================
console.log('\n=== 5. 幂等与边界：空标记写法不一时也不崩、不漏 ===');
{
  // 数据里偶尔出现 "3 ____"（空格），也要能对上
  const fake = {
    type: 'cloze', passage: 'Tom is 1___ boy. He 2 ____ here.',
    questions: [
      { question: '1___', options: ['a', 'an'], answer: 0 },
      { question: '2 ____', options: ['live', 'lives'], answer: 1 },
    ],
  };
  const t1 = App._questionSpeechText(fake, fake.questions[0]);
  const t2 = App._questionSpeechText(fake, fake.questions[1]);
  ok(!hasBlank(t1) && !hasUnderscore(t1), '带空格的 "2 ____" 也能补全（第 2 空）：' + t2);
  ok(/a boy/.test(t1), '第 1 空补上了 a');
  ok(/lives here/.test(t2), '第 2 空补上了 lives');

  // 一句话里三个空
  const three = {
    type: 'cloze', passage: 'She 1___ to 2___ every 3___.',
    questions: [
      { question: '1___', options: ['go', 'goes'], answer: 1 },
      { question: '2___', options: ['school', 'park'], answer: 0 },
      { question: '3___', options: ['day', 'week'], answer: 0 },
    ],
  };
  ok(App._clozeQuestionGroups(three).length === 1, '一句话三个空 → 合成一屏');
  const t3 = App._buildReadSentence(three, three.questions[0]);
  ok(t3 === 'She goes to school every day.', '三个空全部补全：' + t3);

  // 有些题和课文对不上（编号缺失）→ 各自成组，不能丢
  const orphan = {
    type: 'cloze', passage: 'Only one sentence here.',
    questions: [
      { question: '1___', options: ['a', 'b'], answer: 0 },
      { question: '9___', options: ['c', 'd'], answer: 0 },
    ],
  };
  const og = App._clozeQuestionGroups(orphan);
  const oflat = [].concat.apply([], og);
  ok(oflat.length === 2, '课文里找不到的题也不丢（各自成组）');

  // 非 cloze 模块不能被这套逻辑碰到
  const reading = {
    type: 'reading', passage: 'I like apples.',
    questions: [{ question: 'Choose the correct answer. What do I like?', options: ['apples', 'pears'], answer: 0 }],
  };
  ok(App._clozeQuestionGroups(reading).length === 0, '非完形填空模块不参与分组');
  ok(/What do I like/.test(App._questionSpeechText(reading, reading.questions[0])),
     '阅读理解题的朗读不受影响');
}

// ===========================================================================
console.log('\n=== 6. 渲染出来的屏里也没有 blank（抓真实 HTML）===');
{
  if (TODAY) {
    const A = loadApp(weeks[TODAY.wk]);
    A.state.currentDay = TODAY.day;
    A.state.studentId = 'test-stu';
    A.state.phone = '13000000000';
    A.isTeacher = function () { return false; };
    const m = TODAY.m;
    const groups = A._clozeQuestionGroups(m);
    let groupHtml = '';
    groups.forEach(function (g) {
      groupHtml += A.renderClozeGroupStep(m, TODAY.mi, g, TODAY.day);
    });
    ok(!hasBlank(stripAttrs(groupHtml)),
       '填空屏的 HTML 里没有 blank 字样（正文，不含 class/函数名）');
    ok(/cq-slot/.test(groupHtml), '空位渲染成槽位（.cq-slot）而不是裸的 ___');
    ok(/第 ?4 ?空/.test(groupHtml) && /第 ?5 ?空/.test(groupHtml),
       '第 4、5 空都在同一屏里（两个槽位标签都在）');
    ok((groupHtml.match(/cq-blank"/g) || []).length === m.questions.length,
       '每个空都有一组自己的选项（共 ' + m.questions.length + ' 组）');

    const transHtml = A.renderClozeTransStep(m, TODAY.mi, 3, TODAY.day);
    ok(!hasBlank(stripAttrs(transHtml)) && !hasUnderscore(transHtml),
       '翻译屏的 HTML 里也没有 blank / ___');
    ok(/按住说中文/.test(transHtml), '翻译屏有"按住说中文"按钮');
    ok(/sent-words/.test(transHtml), '翻译屏的句子是可点单词（点词看中文意思）');
  } else {
    ok(false, '找不到今天的完形填空模块，跳过渲染检查');
  }
}

// ===========================================================================
console.log('\n' + (fail === 0 ? '全部通过 ✅' : (fail + ' 项没通过 ❌')));
process.exit(fail === 0 ? 0 : 1);
