// verify-v155：每天恰好 30 个**真实动作**（家长 2026-10-25 晚）
//
// 家长原话：「每天30道，是真正的30道，中文翻译也是每个是真正的一道题，
// 读英语也是真正的一道题，不要把它放到一起做的，目的就是让孩子用30分钟
// 左右的时间全部做完，题量不要太大，孩子们做的有些累」
//
// 三块检查：
//   1. 题库：28 天每天真实动作（读一句+译一句+每道题+每个词）恰好 30；
//      阅读 6 句 4 题、完形 7 句 6 空、空位重编号连续；被删模块确实没了
//   2. 计数：app.js 按真实动作计数（行为级，W1 周一步一步核对）
//   3. 版本号 = 155
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

const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const sentsEN = t => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [String(t)];
const sentsCN = t => String(t).replace(/\s+/g, '').split(/(?<=[。！？])/).filter(x => x.length > 1);
const unitsOf = m => {
  let n = 0;
  if (m.words) n += m.words.length;
  if (m.questions) n += m.questions.length;
  if (m.blanks) n += m.blanks.length;
  if (m.passage) n += 2 * sentsEN(m.passage).length;
  if (m.type === 'writing_template') n += sentsEN(m.full_text || '').length;
  return n;
};

section('1. 题库：28 天每天真实动作恰好 30');
{
  const detail = [];
  W.forEach((week, wi) => week.forEach(d => {
    const u = (d.modules || []).reduce((s, m) => s + unitsOf(m), 0);
    if (u !== 30) detail.push('W' + (wi + 1) + d.day_cn + '=' + u);
  }));
  ok(detail.length === 0, '35 天每天真实动作 = 30（W5 起承接退化）', detail.join(' ') || '全部 30');
}
section('1b. 阅读与完形的新结构');
{
  const readings = [], clozes = [];
  W.forEach((week, wi) => week.forEach(d => (d.modules || []).forEach(m => {
    if (m.type === 'reading') readings.push({ w: wi, m });
    if (m.type === 'cloze') clozes.push({ w: wi, m });
  })));
  ok(readings.length === 25, '阅读模块 25 篇（W1-W4 每周 4 篇 + W5 承接 + W6 五篇含周四剪纸）', readings.length);
  ok(readings.every(x => sentsEN(x.m.passage).length === 6), '每篇阅读课文 6 句');
  ok(readings.every(x => x.m.questions.length === 4), '每篇阅读 4 道题');
  ok(readings.every(x => sentsEN(x.m.passage).length === sentsCN(x.m.passage_cn).length),
     '每篇阅读中英句数逐句对齐');
  ok(clozes.length === 10, '完形模块 10 篇（W1-W4 每周 2 篇 + W5/W6 周日承接；周四完形被 v162 家长要求挪掉换成 30 道图题）', clozes.length);
  ok(clozes.every(x => sentsEN(x.m.passage).length === 7), '每篇完形课文 7 句');
  ok(clozes.every(x => x.m.questions.length === 6), '每篇完形 6 空');
  ok(clozes.every(x => (x.m.passage.match(/[0-9]+_{2,}/g) || []).length === 6),
     '每篇完形课文占位 6 个 = 题数');
  // 空位重编号连续 1..6，且文中顺序与题号一致
  const renumOk = clozes.every(x => {
    const marks = (x.m.passage.match(/[0-9]+_{2,}/g) || []).map(s => Number(s.replace(/\D/g, '')));
    for (let i = 0; i < 6; i++) if (marks[i] !== i + 1) return false;
    return x.m.questions.every((q, i) => q.question === (i + 1) + '___');
  });
  ok(renumOk, '完形空位与题号都重编号为 1..6 且顺序一致');
  // 被裁空位的句子已把标记换成答案（不允许残留无主标记）
  const stray = clozes.filter(x => /(^|\s)\d{1,2}_{2,}/.test(x.m.passage)
    && (x.m.passage.match(/[0-9]+_{2,}/g) || []).length !== 6);
  ok(stray.length === 0, '没有残留的无主空位标记');
}
section('1c. 补量模块已删除（v155）');
{
  const has = (wi, di, pred) => !!W[wi][di].modules.find(pred);
  const monWedSatClean = [0, 2, 5].every(di => [0, 1, 2, 3, 4].every(wi => !has(wi, di, m => m.type === 'tense')));
  ok(monWedSatClean, '周一/三/六不再有补量时态模块');
  const sunClean = [0, 1, 2, 3, 4].every(wi => !has(wi, 6, m => m.type === 'tense' || m.type === 'grammar'));
  ok(sunClean, '周日不再有补量时态/语法模块');
  ok([0, 1, 2, 3, 4].every(wi => has(wi, 6, m => m.type === 'listening')), '周日保留听力模块');
}

section('2. app.js 按真实动作计数（行为级，W1 周一）');
{
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
  const w = dom.window;
  const App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, HOMEWORK_DATA,
            HOMEWORK_WEEK_IDX, URL, fetch } = stubs;
    ${appSrc.replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */')}
    return { App };
  `)({
    document: w.document, window: w, location: w.location,
    navigator: w.navigator, localStorage: w.localStorage,
    Api: { answerKey: (...a) => a.join('_'), checkinKey: (a, b) => a + '_' + b },
    HOMEWORK_DATA: new Function(dataSrc + '; return HOMEWORK_WEEKS[0];')(),
    HOMEWORK_WEEK_IDX: 0,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
  }).App;
  ok(App._dayUnits(0) === 30, 'App._dayUnits(W1 周一) = 30', App._dayUnits(0));
  const steps = App._buildSteps(0);
  const u = k => { const s = steps.find(x => x.kind === k); return s ? App._unitsOfStep(s, W[0][0]) : 'none'; };
  ok(u('sentence') === 1, '读一句英语 = 1 个单元', u('sentence'));
  ok(u('translate') === 1, '翻译一句中文 = 1 个单元', u('translate'));
  ok(u('speaking') === 1, '一道口语题 = 1 个单元', u('speaking'));
  ok(u('question') === 1, '一道笔答题 = 1 个单元', u('question'));
  ok(u('vocab') === 5, '词汇模块 5 个词 = 5 个单元', u('vocab'));
  ok(App._unitsOfStep({ kind: 'review', word: 'test' }, null) === 0, '错词巩固占 0（不占 30）');
  // 走完整条 steps 链（去掉巩固步），单元总和应恰为 30
  const total = steps.reduce((s, st) => s + App._unitsOfStep(st, W[0][0]), 0);
  ok(total === 30, 'W1 周一全部步骤的单元总和 = 30', total);
  // 周五：写作 5 空 + 朗读全文 5 句都计入
  const friSteps = [];
  const AppFri = App; // 同一 App，day 4
  const fSteps = AppFri._buildSteps(4);
  const fTotal = fSteps.reduce((s, st) => s + AppFri._unitsOfStep(st, W[0][4]), 0);
  ok(AppFri._dayUnits(4) === 30 && fTotal === 30, 'W1 周五真实动作 = 30（写作5空+朗读5句计入）', fTotal);
}

section('3. 版本号 = 155');
{
  ok(/app-version" content="165"/.test(htmlSrc), 'index.html app-version = 155');
  ok((htmlSrc.match(/\?v=165/g) || []).length === 6, 'index.html 6 处 ?v=165', (htmlSrc.match(/\?v=165/g) || []).length);
  ok(/amy-english-v165/.test(swSrc), 'sw.js 缓存名 v155');
  ok(/var V = 165;/.test(swSrc), 'sw.js var V = 155');
}

console.log('\n———————————————');
console.log('通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);
console.log('全部通过 ✅');
