/* eslint-disable */
// 错题卷填空横线的校验（v115）。
//
// 家长的原话：「生成的错题卷的横杠太短了，不够写单词。根据所写单词的长度来把
// 横线的长度一一对应上，有多长的单词留多长的横线。」
//
// 原来题目里的空位一律写成三个下划线（She ___ to school every day.），不管
// 答案是 goes 还是 was reading，横线都是那么长 —— 长一点的词根本写不下。
// 现在改成按标准答案的字数算宽度：一个字母 1.6em，短答案保底 4 个字母，
// 一道题多个空就按标准答案（"Two-thirds; are"）一一对应。
//
// 用法：node tools/verify-a4-blanks.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

// ---------------------------------------------------------------------------
// DOM stub：这个脚本只关心"生成的卷子长什么样"，所以只 stub 打印区
// ---------------------------------------------------------------------------
const byId = {};
function mkEl(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), _attrs: {}, style: {},
    innerHTML: '', textContent: '', className: '', dataset: {}, value: '',
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
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null, level: () => 0,
};

const src = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const htmlSrc = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
const weeks = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const HOMEWORK_DATA = weeks[weeks.length - 1];
process.on('unhandledRejection', () => {});

let App;
try {
  App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
            confirm, prompt, requestAnimationFrame } = stubs;
    ${src}
    return { App };
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA,
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

// 卷子里每一条横线的宽度（em）。顺带断言横线里没夹着别的东西。
const widths = html => (String(html).match(/class="a4-blank" style="width:([\d.]+)em"/g) || [])
  .map(s => parseFloat(/([\d.]+)em/.exec(s)[1]));
const PER = 1.6;
const w = letters => +(letters * PER).toFixed(1);

// ===========================================================================
console.log('\n=== 1. 标准答案怎么取：选择题取选项文字，填空题取答案本身 ===');
{
  ok(App._a4AnswerText({ options: ['go', 'goes', 'going', 'went'], answer: 1 }) === 'goes',
     '选择题 answer 是下标，取的是选项文字 goes（不是那个数字 1）');
  ok(App._a4AnswerText({ options: ['are', 'is'], answer: 0 }) === 'are', '选择题下标 0 取第一项');
  ok(App._a4AnswerText({ answer: 'are' }) === 'are', '填空题直接就是答案文本');
  ok(App._a4AnswerText({ answer: ['have', 'been'] }) === 'have; been', '答案是数组时用分号拼起来');
  ok(App._a4AnswerText({ options: ['a', 'b'], answer: 'b' }) === 'b',
     '少数题有选项但答案直接写了文本，照文本用');
  ok(App._a4AnswerText({}) === '' && App._a4AnswerText(null) === '', '没答案时不炸，返回空串');
}

// ===========================================================================
console.log('\n=== 2. 横线宽度：有多长的单词，留多长的横线 ===');
{
  const h = App._a4QuestionHtml({ question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'went'], answer: 1 });
  ok(h.indexOf('___') < 0, '题目里的 ___ 已经换成横线元素了');
  ok(widths(h).length === 1, '一个空 → 一条横线');
  ok(widths(h)[0] === w(4), 'goes（4 个字母）→ 横线是 4 个字母的宽度（' + w(4) + 'em）');

  const long = App._a4QuestionHtml({ question: 'The boy ___ (talk) to his teacher now is my brother. [填入正确形式]', answer: 'talking' });
  ok(widths(long)[0] === w(7), 'talking（7 个字母）→ 横线跟着变长（' + w(7) + 'em）');
  ok(widths(long)[0] > widths(h)[0], '长词那条横线**确实比短词的长**（原来两条一样长，这是这次的病根）');

  const two = App._a4QuestionHtml({ question: '___ of the students in our class ___ girls.', options: ['Two-third; are', 'Two-thirds; are', 'Two-thirds; is', 'Two-third; is'], answer: 1 });
  const tw = widths(two);
  ok(tw.length === 2, '两个空 → 两条横线');
  ok(tw[0] === w(10) && tw[1] === w(4),
     '两个空各按自己的词给长度：Two-thirds（10 个字母）→ ' + w(10) + 'em，are 只有 3 个字母 → 保底 ' + w(4) + 'em（实际 ' + tw[0] + ' / ' + tw[1] + '）');
  ok(tw[0] !== tw[1], '同一题里两个空不再一样长');

  const spaced = App._a4QuestionHtml({ question: 'How long ___ you ___ (learn) English? — For five years. [填入正确形式]', answer: 'have learned' });
  const sw = widths(spaced);
  ok(sw.length === 2 && sw[0] === w(4) && sw[1] === w(7),
     '答案是空格分开的两截（have learned）时按空格对上：' + sw.join(' / '));
}

// ===========================================================================
console.log('\n=== 3. 太短的保底、太长的封顶，但都不许短过单词本身 ===');
{
  const short = App._a4QuestionHtml({ question: 'There ___ many books on the shelf.', answer: 'are' });
  ok(widths(short)[0] === w(4), 'are（3 个字母）也不少于 4 个字母的宽度，别缩成一小截');
  const tiny = App._a4QuestionHtml({ question: '___ of them ___ here.', answer: 'a; b' });
  ok(widths(tiny).every(x => x === w(4)), '只有 1、2 个字母的答案也保底 ' + w(4) + 'em');

  const longAns = 'x'.repeat(40);
  const capped = App._a4QuestionHtml({ question: 'He ___ here.', answer: longAns });
  ok(widths(capped)[0] === w(20), '超长答案封顶在一行以内（' + w(20) + 'em），不会把 A4 版心撑破');

  // 空位多于答案截数时，后面的空沿用最后一截，不能变成没有横线
  const more = App._a4QuestionHtml({ question: '___ and ___ and ___.', answer: 'apple; pear' });
  ok(widths(more).length === 3 && widths(more)[2] === widths(more)[1],
     '空位比答案截数多的时候，多出来的空沿用最后一截（不会空着没线）');
}

// ===========================================================================
console.log('\n=== 4. 题目原文不动：没空的题、特殊字符都照旧 ===');
{
  const noBlank = App._a4QuestionHtml({ question: "What's your favorite subject at school?", options: ['a'], answer: 0 });
  ok(noBlank === "What&#39;s your favorite subject at school?".replace('&#39;', "'"),
     '没有空的题原样打印，不会被动手脚');
  ok(noBlank.indexOf('a4-blank') < 0, '没空的题不会多出横线');
  const esc = App._a4QuestionHtml({ question: 'a < b & c > d ___ e', answer: 'x' });
  ok(esc.indexOf('&lt;') >= 0 && esc.indexOf('&amp;') >= 0 && esc.indexOf('&gt;') >= 0,
     '题目里的 < & > 做了转义，不会把卷子结构弄坏');
  ok(App._a4QuestionHtml(null) === '', '题目为空时不炸');
  ok(App._a4QuestionHtml('He ___ here.') !== '' && widths(App._a4QuestionHtml('He ___ here.'))[0] === w(4),
     '只给字符串（相似题那种）也能画横线，宽度保底 4 个字母');
}

// ===========================================================================
console.log('\n=== 5. 整张卷子跑一遍：卷面上再没有三个下划线的短横杠 ===');
{
  // 造 6 道错题，涵盖填空（长答案/短答案）、选择、双空
  const picks = [];
  weeks.forEach((wk, wi) => wk.forEach((d, di) => (d.modules || []).forEach((m, mi) => {
    (m.questions || []).forEach((q, qi) => {
      const t = String(q.question || '');
      if (/_{2,}/.test(t)) picks.push({ wi, di, mi, qi, q, t, m });
    });
  })));
  ok(picks.length > 100, '题库里找到 ' + picks.length + ' 道带空的题');

  // 按**真正的答案文字**长短排（选择题的 answer 是下标，直接取长度会算错）
  const aLen = p => App._a4AnswerText(p.q).length;
  const byLen = picks.slice().sort((a, b) => aLen(b) - aLen(a));
  const sample = [byLen[0], byLen[Math.floor(byLen.length / 2)], byLen[byLen.length - 1]]
    .filter((p, i, arr) => arr.indexOf(p) === i);

  App.state.students = [{ id: 's1', name: '测试同学', phone: '13000000000' }];
  App.state.answers = {};
  App.state.cloudWrongCache = {};
  App._loadCloudWrongCache = async () => {};
  const want = {};
  sample.forEach((p, k) => {
    want[Api.answerKey('s1', p.di, p.mi, p.qi)] = { value: 'zzz', correct: false };
  });
  App._lookupWrongAnswer = (sid, di, mi, qi) => want[Api.answerKey(sid, di, mi, qi)] || null;

  App.genErrorSheet('s1').then(() => {
    const sheet = byId['print-area'].innerHTML;
    ok(sheet.indexOf('a4-sheet') >= 0, '卷子生成了');
    // 卷首「姓名：____ 日期：____」那几条下划线是固定的填空位，不算题目里的横杠，
    // 只查题目行（a4-q-num）里还有没有裸露的 ___。
    const qLines = sheet.split('a4-q-num').slice(1).map(s => s.split('</div>')[0]);
    // 错题只有 3 道 < 5，卷子会自动补"相似题型"，所以题目行不止 3 条
    ok(qLines.length >= sample.length, '卷面上有 ' + qLines.length + ' 道题（错题 + 自动补的相似题）');
    ok(qLines.every(l => l.indexOf('___') < 0),
       '题目行里再没有裸露的 ___（三个下划线的短横杠）');
    ok((sheet.match(/a4-blank/g) || []).length >= sample.length, '抽样那几道题都画上了可写的横线');
    // 每一条横线的宽度都要 >= 它自己答案的长度（封顶 20 个字母之内）
    const all = widths(sheet);
    ok(all.every(x => x >= w(4) && x <= w(20)), '所有横线宽度都落在保底和封顶之间：' + Array.from(new Set(all)).join('、'));
    ok(new Set(all).size > 1, '同一张卷子上横线长度是**不一样**的（按各自的单词来的）');

    // 选择项的 A/B/C/D 还在，答案区还在（没被这次改动碰坏）
    ok(/A\. /.test(sheet), '选择题的 A./B./C./D. 选项照旧打印');
    ok(sheet.indexOf('正确答案：') >= 0, '答案区照旧（老师可切换显示）');
    ok(sheet.indexOf('a4-write-area') >= 0, '答题用的横线区域还在');

    // 逐题核算：宽窄必须跟答案长度一一对应
    const mismatched = [];
    sample.forEach((p, k) => {
      const frag = String(p.t);
      const n = (frag.match(/_{2,}/g) || []).length;
      const got = widths(App._a4QuestionHtml(p.q));
      const ansText = App._a4AnswerText(p.q);
      const parts = App._a4BlankLetters(p.q, n);
      for (let i = 0; i < got.length; i++) {
        const raw = parts.length ? parts[Math.min(i, parts.length - 1)] : '';
        let letters = raw ? raw.length : 4;
        if (letters < 4) letters = 4;
        if (letters > 20) letters = 20;
        if (got[i] !== w(letters)) mismatched.push(p.t + ' → ' + ansText);
      }
    });
    ok(mismatched.length === 0, '每一道题的横线宽度 = 它的答案长度'
       + (mismatched.length ? '（对不上的：' + mismatched.join('；') + '）' : ''));

    checkAll();
  }).catch(e => {
    ok(false, '生成卷子时抛异常：' + e.message);
    checkAll();
  });

  function checkAll() {
    // =======================================================================
    console.log('\n=== 6. 全题库扫一遍：132 道带空的题，横线一律不短于单词 ===');
    {
      let short = [], wrong = 0, noLine = 0, total = 0;
      picks.forEach(p => {
        const t = String(p.q.question || '');
        const n = (t.match(/_{2,}/g) || []).length;
        const got = widths(App._a4QuestionHtml(p.q));
        if (got.length !== n) { noLine++; return; }
        const parts = App._a4BlankLetters(p.q, n);
        for (let i = 0; i < n; i++) {
          total++;
          const raw = parts.length ? parts[Math.min(i, parts.length - 1)] : '';
          const need = raw ? raw.length : 0;
          // 横线要能写下一个词：宽度对应的字母数 >= 单词长度（封顶 20 之外另说）
          if (got[i] + 0.001 < w(Math.min(need, 20))) short.push(t + ' → ' + raw);
          if (got[i] !== w(Math.max(4, Math.min(20, need || 4)))) wrong++;
        }
      });
      ok(noLine === 0, '每道题画出的横线条数和题目里的空位数一致（' + picks.length + ' 道全部对上）');
      ok(short.length === 0, total + ' 个空位，没有一条横线短过它要写的单词'
         + (short.length ? '：' + short.slice(0, 3).join('；') : ''));
      ok(wrong === 0, '宽度算法和预期一字不差（' + total + ' 个空位全部核对）');

      // 覆盖度：短词和长词都出现过，说明"一一对应"确实生效了
      const lens = picks.map(p => {
        const n = (String(p.q.question || '').match(/_{2,}/g) || []).length;
        const parts = App._a4BlankLetters(p.q, n);
        return parts.length ? parts[0].length : 0;
      });
      ok(Math.min.apply(null, lens) <= 4 && Math.max.apply(null, lens) >= 12,
         '题库里答案短到 2 个字母、长到 17 个字母都有（' + Math.min.apply(null, lens) + '~' + Math.max.apply(null, lens) + '），横线跟着变化');
    }

    // =======================================================================
    console.log('\n=== 7. 静态检查：卷子真的走的是新写法，样式也定了 ===');
    {
      ok(/class="a4-blank"/.test(src), 'app.js 里确实会输出 a4-blank 横线');
      ok(src.indexOf('_a4QuestionHtml(e.q)') >= 0, '错题重做那一段用的是新写法');
      ok(src.indexOf('_a4QuestionHtml(sq)') >= 0, '相似题型那一段也用的是新写法');
      ok(!/a4-q-num">' \+ \(i\+1\) \+ '\. \[[^\n]*e\.q\.question/.test(src),
         '原来那种"原样塞题目文本"的写法已经没有了');
      ok(/\.a4-sheet \.a4-blank\{/.test(htmlSrc), 'index.html 里定义了 .a4-blank 的样子');
      const css = /.a4-sheet \.a4-blank\{[^}]*\}/.exec(htmlSrc);
      ok(css && /border-bottom:/.test(css[0]), '横线是画出来的下划线（border-bottom）');
      ok(css && /display:inline-block/.test(css[0]), '横线是行内元素，能跟在句子中间');
      ok(/name="app-version" content="121"/.test(htmlSrc), '版本号升到 121');
      ok(/amy-english-v121/.test(swSrc), 'Service Worker 缓存名同步到 v121（不然手机上还是旧版）');
    }

    console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过'));
    process.exit(fail ? 1 : 0);
  }
}
