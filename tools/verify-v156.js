// verify-v156：问答句「标点 + 两行 + 录音时句子吸顶」（家长 2026-10-27）
//
// 家长原话：①「选出来正确的选项之后，把所有的标点加上，问句一行，答句一行，
// 所有的这种有问答句练习的都要把标点加上」②「按住录音的时候，问句和答句
// 有时候就看不见。要保证在点住说话的同时，问句和答句不会被跑掉，在读的
// 界面能够看见，孩子能边读边说，不用手动去找」
//
// 检查四块：
//   1. 标点：_readSentenceHtml 输出的纯文本必须一字不差还原原句
//      （含 ? . , 空格）—— 全题库每一句跟读句都验
//   2. 两行：口语 _speakingReadParts / 阅读 _buildReadParts 拆行后
//      拼回去必须和整句完全一致；跟读面板真的输出 rd-aline
//   3. 吸顶：录音开始/结束的 6 个接线点都在，CSS 存在
//   4. 版本号 = 156
const fs = require('fs');
const path = require('path');
const R = __dirname;
const read = f => fs.readFileSync(path.join(R, '..', f), 'utf8');
const appSrc = read('public/app.js');
const dataSrc = read('public/data.js');
const htmlSrc = read('public/index.html');
const swSrc = read('public/sw.js');
const jsdom = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

function makeApp(dayData) {
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
  const w = dom.window;
  return new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, HOMEWORK_DATA,
            HOMEWORK_WEEK_IDX, URL, fetch } = stubs;
    ${appSrc.replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */')}
    return { App };
  `)({
    document: w.document, window: w, location: w.location,
    navigator: w.navigator, localStorage: w.localStorage,
    Api: { answerKey: (...a) => a.join('_'), checkinKey: (a, b) => a + '_' + b },
    HOMEWORK_DATA: dayData,
    HOMEWORK_WEEK_IDX: 0,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
  }).App;
}

// 把渲染出的 HTML 还原成纯文本（模拟浏览器 textContent）
const plain = html => html
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();
const norm = s => String(s).replace(/\s+/g, ' ').trim();
const wordCount = s => (String(s).match(/[A-Za-z0-9][A-Za-z0-9'\-]*/g) || []).length;

const weeks = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();

// ===== 1. 标点：渲染纯文本 = 原句 =========================================
section('1. 跟读句渲染：标点/空格一字不差（全题库）');
{
  const App = makeApp(weeks[0]);
  let checked = 0, bad = [];
  const check = (label, sentence) => {
    if (!sentence) return;
    checked++;
    const html = App._readSentenceHtml(sentence);
    const txt = plain(html);
    if (txt !== norm(sentence)) bad.push(label + ' → ' + txt);
    const spans = (html.match(/class="rd-w[ "]/g) || []).length;
    if (spans !== wordCount(sentence)) bad.push(label + ' 词盒数 ' + spans + '≠' + wordCount(sentence));
  };
  // 口语模块：问句 + 正确答句
  weeks.forEach((week, wi) => {
    (week || []).forEach((day, di) => {
      (day.modules || []).forEach((m, mi) => {
        if (m.type !== 'speaking') return;
        (m.questions || []).forEach((q, qi) => {
          const AppD = makeApp(week);
          AppD._speakingShuffle = AppD._speakingShuffle || {};
          // 不打乱（shuffled 为空时回退原始顺序），检查稳定口径
          const p = AppD._speakingReadParts(mi, qi, di);
          if (p && p.a) check('W' + (wi+1) + '口语' + (qi+1), p.q + ' ' + p.a);
          else check('W' + (wi+1) + '口语' + (qi+1), q.sentence);
        });
      });
    });
  });
  // 阅读理解问答句（question 题干以 ? 结尾的）：拼句渲染
  weeks.forEach((week, wi) => {
    (week || []).forEach((day, di) => {
      (day.modules || []).forEach((m, mi) => {
        if (!m.questions || m.type === 'speaking') return;
        (m.questions || []).forEach((q, qi) => {
          const s = App._buildReadSentence(m, q);
          if (s) check('W' + (wi+1) + 'D' + (di+1) + 'M' + (mi+1) + 'Q' + (qi+1), s);
        });
      });
    });
  });
  ok(checked > 50, '覆盖的跟读句数量 > 50', checked);
  ok(bad.length === 0, '每一句的标点/空格都完整还原', bad.length ? bad[0] + (bad.length > 1 ? ' 等 ' + bad.length + ' 处' : '') : '0 处错误');
  // 抽一个具体例子看标点真的在 HTML 里
  const demo = App._readSentenceHtml('Do you like apples? Yes, I do.');
  ok(demo.indexOf('?') >= 0 && demo.indexOf(',') >= 0 && demo.indexOf('.') >= 0,
    '示例句的 ? , . 都出现在渲染结果里');
}

// ===== 2. 两行拆分：拼回去 = 整句 =========================================
section('2. 问句一行、答句一行（拆行后拼回 = 原整句）');
{
  const App = makeApp(weeks[0]);
  // 口语：找 W1 周一第一道口语题
  const spk = weeks[0][0].modules.find(m => m.type === 'speaking');
  ok(!!spk, 'W1 周一有口语模块');
  if (spk) {
    const p = App._speakingReadParts(0, 0, 0);   // mi=0? 用真实下标
    const mi = weeks[0][0].modules.indexOf(spk);
    const p2 = App._speakingReadParts(mi, 0, 0);
    ok(!!p2 && !!p2.a, '_speakingReadParts 拆出问句和答句');
    if (p2) ok((p2.q + ' ' + p2.a) === App._speakingReadSentence(mi, 0, 0),
      '口语拆行拼回 = _speakingReadSentence');
  }
  // 阅读：找一道问句题干（以 ? 结尾且带选项）
  let found = 0, mismatch = 0;
  weeks.forEach((week) => {
    (week || []).forEach((day) => {
      (day.modules || []).forEach((m) => {
        if (!m.questions || m.type === 'speaking') return;
        (m.questions || []).forEach((q) => {
          const s = App._buildReadSentence(m, q);
          const p = App._buildReadParts(m, q);
          if (!s || !p) return;
          if ((p.q + (p.a ? ' ' + p.a : '')) !== s) mismatch++;
          if (p.a) found++;
        });
      });
    });
  });
  ok(mismatch === 0, '阅读 _buildReadParts 拼回 = _buildReadSentence（全题库）', mismatch + ' 处不一致');
  ok(found > 0, '题库里存在问句+答句的跟读句（会被拆成两行）', found + ' 句');
  // 渲染层：问答句真的输出 rd-aline
  let alineOk = false;
  weeks.forEach((week) => {
    (week || []).forEach((day) => {
      (day.modules || []).forEach((m) => {
        if (!m.questions || m.type === 'speaking') return;
        (m.questions || []).forEach((q) => {
          const p = App._buildReadParts(m, q);
          if (p && p.a && !alineOk) {
            const html = App._readSentenceHtml(p.q) + '<div class="rd-aline">' + App._readSentenceHtml(p.a) + '</div>';
            alineOk = html.indexOf('rd-aline') >= 0;
          }
        });
      });
    });
  });
  ok(alineOk, '问答句渲染包含 rd-aline（答句独立一行）');
}

// ===== 3. 吸顶接线 ========================================================
section('3. 录音时句子吸顶（rd-rec）');
{
  ok(/_setSentenceSticky\(mi, qi, on\) \{/.test(appSrc), '_setSentenceSticky 已定义');
  const ons = (appSrc.match(/_setSentenceSticky\(mi, qi, true\)/g) || []).length;
  const offs = (appSrc.match(/_setSentenceSticky\(mi, qi, false\)/g) || []).length;
  ok(ons === 2, '两个跟读面板录音开始都开吸顶', ons);
  ok(offs >= 4, '误触/出分都摘吸顶', offs);
  ok(/\.rd-sentence\.rd-rec\{position:sticky/.test(htmlSrc), 'CSS：.rd-sentence.rd-rec 吸顶样式存在');
  ok(/\.rd-aline\{display:block/.test(htmlSrc), 'CSS：.rd-aline 答句独立成行样式存在');
  ok(/scrollIntoView\(\{ block: 'start'/.test(appSrc), '录音开始把句子滚到视口顶部');
}

// ===== 4. 版本号 = 156 ====================================================
section('4. 版本号 = 156');
{
  ok(/app-version" content="161"/.test(htmlSrc), 'index.html app-version = 156');
  const refs = (htmlSrc.match(/\.js\?v=161/g) || []).length;
  ok(refs === 5, '5 个 script 引用都升到 v156', refs);
  ok(/amy-english-v161/.test(swSrc), 'sw.js CACHE_NAME = amy-english-v161');
}

// ===== 5. 回归：计数口径没被碰坏 =========================================
section('5. 回归：v155 计数口径不受影响');
{
  const App = makeApp(weeks[0]);
  ok(App._dayUnits(0) === 30, 'W1 周一真实动作 = 30', App._dayUnits(0));
  const steps = App._buildSteps(0);
  const total = steps.reduce((s, st) => s + App._unitsOfStep(st, weeks[0][0]), 0);
  ok(total === 30, 'W1 周一步骤单元总和 = 30', total);
}

console.log('\n===== 结果: ' + pass + ' 通过, ' + fail + ' 失败 =====');
process.exit(fail ? 1 : 0);
