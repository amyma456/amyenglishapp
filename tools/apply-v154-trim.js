// v154：每天题量 30 → 25 题 + 5 词 = 30 单元
//
// 家长 2026-10-25 原话：「每天的练习题都是四五十道，并不是总题30道，
// 所有题加起来30道，把单词读上也是加起来30道。」
//
// 做题界面右上角的计数以前是"步骤数"（阅读逐句翻译每句占一步，所以显示
// 四五十）。v154 两处一起改：
//   ① 本脚本把每天 questions+blanks 从 30 裁到 25（词汇 5 词不计入题数），
//      这样 25 题 + 5 词 = 恰好 30 个单元；
//   ② app.js 的 sh-count 改成按单元计数（见 verify-v154.js 第 2 节）。
//
// 裁法（只动带词汇模块的日子；周二/四/五没有词汇，本来就是 30 题，不动）：
//   周一/三/六  单项选择 10 → 5（25 题 + 5 词 = 30）
//   周日        时态 10 → 5（25 题 + 5 词 = 30）
// 用法：node tools/apply-v154-trim.js
const fs = require('fs');
const path = require('path');
const R = __dirname;
const P = path.join(R, '..', 'public', 'data.js');
const src = fs.readFileSync(P, 'utf8');

const fn = new Function(src + '; return { WEEKS: HOMEWORK_WEEKS };');
const weeks = JSON.parse(JSON.stringify(fn().WEEKS));
if (weeks.length !== 4) { console.error('周数异常'); process.exit(1); }

function findMod(week, di, idSuffix) {
  return week[di].modules.find(x => x.id === idSuffix || x.id.endsWith('-' + idSuffix));
}
function trim(week, di, idSuffix, keep, dur) {
  const m = findMod(week, di, idSuffix);
  if (!m || !m.questions) { console.error('找不到模块 ' + idSuffix); process.exit(1); }
  if (m.questions.length < keep) { console.error(m.id + ' 只有 ' + m.questions.length + ' 题，裁不到 ' + keep); process.exit(1); }
  m.questions = m.questions.slice(0, keep);
  m.duration = dur;
}

weeks.forEach((week) => {
  // 周一/三/六：单项选择 10 → 5
  [0, 2, 5].forEach(di => trim(week, di, 'mc', 5, 5));
  // 周日：时态 10 → 5
  trim(week, 6, 'sun-tense', 5, 5);
  // 总时长 = 各模块之和
  week.forEach(d => {
    d.total_duration = d.modules.reduce((s, m) => s + (m.duration || 0), 0);
  });
});

// ---------- 校验：有词汇的日子 25 题 + 5 词 = 30，没词汇的日子 30 题 ----------
let bad = [];
weeks.forEach((week, w) => week.forEach((d, di) => {
  let q = 0, words = 0;
  (d.modules || []).forEach(m => {
    if (m.questions) q += m.questions.length;
    if (m.blanks) q += m.blanks.length;
    if (m.words) words += m.words.length;
  });
  const want = words > 0 ? 25 : 30;
  if (q !== want || q + words !== 30) bad.push('W' + (w + 1) + d.day_cn + ' 题' + q + ' 词' + words);
}));
if (bad.length) { console.error('裁剪后不对：' + bad.join(' ')); process.exit(1); }

// ---------- 重写 data.js（沿用 v153 生成器的整文件重写模式） ----------
const tailStart = src.indexOf('const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];');
const clozeStart = src.indexOf('const CLOZE_SENTENCE_CN = {');
const vocabComment = src.indexOf('// ===== 词卡的中文提示');
if (tailStart < 0 || clozeStart < 0 || vocabComment < 0) { console.error('data.js 结构定位失败'); process.exit(1); }
const tail = src.slice(tailStart, clozeStart) + src.slice(clozeStart, vocabComment) + src.slice(vocabComment);

const header = '// 题库数据 —— v153 由 tools/apply-v153-content.js 生成，v154 由 tools/apply-v154-trim.js 裁量。\n'
  + '// 每天 30 个单元：带词汇的日子 25 题 + 5 词，不带词汇的日子 30 题（家长：所有题加单词加起来 30 道）。\n'
  + '// 阅读/完形/写作主题 = 中国文化 · 科学技术 · 现代热点。\n'
  + '// 改题库：改 tools/v153-content-*.js 重跑 v153 脚本，再跑本脚本，最后 node tools/verify-weeks.js。\n\n';
const body = ['WEEK1', 'WEEK2', 'WEEK3', 'WEEK4']
  .map((n, i) => 'const ' + n + ' = ' + JSON.stringify(weeks[i], null, 2) + ';\n')
  .join('\n');
fs.writeFileSync(P, header + body + '\n' + tail);

console.log('✅ v154 裁剪完成：28 天每天恰好 30 个单元（题 + 词）');
