// tools/verify-v157.js — WEEK5 题库 + 句子砍短 + 周号真实性 + 写作换新
// 家长 2026-10-27：①完形/阅读跟读句太长 → W5 全面砍短，难度不再逐周爬坡；
// ②本周五写作和上周一样 → WEEK5 周五写作全新主题；
// ③（2026-10-26 教训）打卡周号必须真实，不许随题库周数夹取。
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const ROOT = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const weeksSrc = fs.readFileSync(path.join(ROOT, 'tools', 'verify-weeks.js'), 'utf8');

const ctx = new Function(dataSrc + '; return {WEEKS: HOMEWORK_WEEKS, IDX: HOMEWORK_WEEK_IDX,'
  + ' CIDX: HOMEWORK_CONTENT_WEEK_IDX, DATA: HOMEWORK_DATA, CN: CLOZE_SENTENCE_CN};')();
const W = ctx.WEEKS;
const wc = s => String(s).trim().split(/\s+/).length;
const splitEN = t => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [String(t)];
const splitCN = t => String(t).replace(/\s+/g, '').split(/(?<=[。！？])/).filter(x => x.length > 1);

section('1. WEEK5 就位、周号真实');
{
  ok(W.length === 6, '题库 6 周（v164 起 W6 上线）', W.length);
  ok(ctx.IDX >= 4, '真实周号已到第 5 周或更后', ctx.IDX);
  ok(ctx.CIDX === Math.min(ctx.IDX, W.length - 1), '内容周号 = min(真实周号, 周数-1)', ctx.CIDX);
  ok(ctx.DATA === W[ctx.CIDX], 'HOMEWORK_DATA 指向内容周');
  // 源码级：真实周号不许夹取
  const idxBody = dataSrc.slice(dataSrc.indexOf('const HOMEWORK_WEEK_IDX'), dataSrc.indexOf('const HOMEWORK_CONTENT_WEEK_IDX'));
  ok(!/HOMEWORK_WEEKS\.length\s*-\s*1/.test(idxBody), 'HOMEWORK_WEEK_IDX 不再随题库周数夹取');
  ok(/HOMEWORK_CONTENT_WEEK_IDX = Math\.min\(HOMEWORK_WEEK_IDX/.test(dataSrc), '内容周号独立夹取');
  ok(dataSrc.indexOf('let HOMEWORK_DATA = HOMEWORK_WEEKS[HOMEWORK_CONTENT_WEEK_IDX];') >= 0, 'HOMEWORK_DATA 用内容周号');
  ok(appSrc.indexOf("return (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0;") >= 0,
     'app.js _weekIdx 读真实周号（打卡 week_idx 真实）');
  // W5 全部 id 无 w4- 残留
  const w5str = JSON.stringify(W[4]);
  ok(!/w4-/.test(w5str), 'W5 无 w4- 前缀 id 残留');
  // 模块 id 全库唯一
  const ids = new Set(); let dup = 0;
  W.forEach(week => week.forEach(d => (d.modules || []).forEach(m => {
    if (ids.has(m.id)) dup++; ids.add(m.id);
  })));
  ok(dup === 0, '5 周模块 id 全库唯一', dup);
}

section('2. 本周五写作换新（My Healthy Life）');
{
  const w4w = W[3][4].modules.find(m => m.type === 'writing_template');
  const w5w = W[4][4].modules.find(m => m.type === 'writing_template');
  ok(!!w5w && w5w.id === 'w5-fri-writing', 'W5 周五写作 id = w5-fri-writing');
  ok(w5w.title === 'My Healthy Life', 'W5 写作主题 = My Healthy Life', w5w.title);
  ok(w4w.title === 'Protecting Our Earth', 'W4 写作保持原样（历史周不动）', w4w.title);
  ok(w5w.title !== w4w.title, 'W5 写作 ≠ 上周写作');
  ok(w5w.keywords.length === 5 && w5w.blanks.length === 5, '关键词/空各 5 个');
  ok(w5w.blanks.every(b => b.answer === b.answer.toLowerCase() && !!b.answer.trim()), '答案全部小写非空');
  let t = w5w.template;
  w5w.blanks.forEach(b => { t = t.split('{{' + b.id + '}}').join(b.answer); });
  ok(t.toLowerCase() === String(w5w.full_text).toLowerCase(), 'full_text 与模板+答案拼回一致');
  ok(!!w5w.full_text_cn, '有 full_text_cn');
  ok(splitEN(w5w.full_text).length === 5, '作文全文 5 句（真实动作 30 口径不变）', splitEN(w5w.full_text).length);
}

section('3. W5 句子砍短（跟读不再长）');
{
  let readMax = 0, clozeMax = 0, bad = [];
  let readingCnt = 0, clozeCnt = 0;
  W[4].forEach(d => (d.modules || []).forEach(m => {
    if (m.type === 'reading') {
      readingCnt++;
      const lens = splitEN(m.passage).map(wc);
      if (lens.length !== 6) bad.push(m.id + ' 句数 ' + lens.length);
      if (splitEN(m.passage).length !== splitCN(m.passage_cn).length) bad.push(m.id + ' 中英句数不齐');
      readMax = Math.max(readMax, ...lens);
    }
    if (m.type === 'cloze') {
      clozeCnt++;
      const lens = splitEN(m.passage).map(wc);
      if (lens.length !== 7) bad.push(m.id + ' 句数 ' + lens.length);
      clozeMax = Math.max(clozeMax, ...lens);
      const marks = (m.passage.match(/[0-9]___/g) || []).length;
      if (marks !== 6) bad.push(m.id + ' 占位 ' + marks);
      const cn = ctx.CN[m.id];
      if (!cn || cn.length !== 7) bad.push(m.id + ' 完形逐句中文缺失或句数不对');
    }
  }));
  ok(readingCnt === 4 && clozeCnt === 1, 'W5 有 4 篇阅读 + 1 篇完形（周四完形被 v162 挪掉）', readingCnt + '/' + clozeCnt);
  ok(readMax <= 14, 'W5 阅读最长句 ≤ 14 词', readMax);
  ok(clozeMax <= 13, 'W5 完形最长句 ≤ 13 词', clozeMax);
  ok(bad.length === 0, '句数/对齐/占位/中文表全部正常', bad.join(' | ') || '全部正常');
  // W5 平均文章长度必须明显短于 W4（砍短生效）
  const avg = week => {
    let n = 0, sum = 0;
    week.forEach(d => d.modules.forEach(m => { if (m.passage) { n++; sum += m.passage.length; } }));
    return sum / n;
  };
  ok(avg(W[4]) < avg(W[3]) * 0.85, 'W5 平均文章长度比 W4 短至少 15%',
     Math.round(avg(W[3])) + ' → ' + Math.round(avg(W[4])));
}

section('4. 难度不再逐周爬坡');
{
  ok(!/难度应递增/.test(weeksSrc), 'verify-weeks 已取消「逐周递增」强制断言');
  ok(/家长 2026-10-27：难度不再逐周\/逐天上升/.test(weeksSrc), 'verify-weeks 记录新口径');
}

section('5. 版本号 v157');
{
  const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
  ok(/app-version" content="165"/.test(html), 'index.html app-version = 157');
  ok((html.match(/\?v=165/g) || []).length >= 4, 'index.html ?v=157 引用 ≥ 4 处', (html.match(/\?v=165/g) || []).length);
  ok(/amy-english-v165/.test(sw), 'sw.js CACHE_NAME = amy-english-v165');
  ok(/var V = 165;/.test(sw), 'sw.js var V = 157');
}

console.log('\n' + (fail === 0 ? '✅ 全部 ' + (pass + fail) + ' 项通过' : '❌ ' + fail + '/' + (pass + fail) + ' 项失败'));
process.exit(fail === 0 ? 0 : 1);
