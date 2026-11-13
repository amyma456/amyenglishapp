/* ===========================================================================
 * v204 校验：第 8 周题库（2026-11-16 起）按 v165 标准骨架上线
 *   node tools/verify-v204.js
 *
 * 钉住本周关键约束：
 *   - 题库 8 周，HOMEWORK_WEEKS 含 WEEK8
 *   - 每天 30 个真实动作；键盘拼写每天 3~6 道（全周 29 道）
 *   - 听力 3 套、≥3 类题型（对话问答/选图/听写填空），复述 0%
 *   - 阅读 5 篇（6 句 4 题 + passage_cn）；完形 1 篇（7 句 6 空 + 7 句译文）
 *   - 20 个全新单词；口语 3 天 × 5 题（options_cn + answer_cn_hint）
 *   - 写作 5 空模板能拼回 full_text
 *   - 版本钉子：index.html / sw.js 统一 v204
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

const sb = { window: {}, self: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8')
  + ';globalThis.__D={weeks:HOMEWORK_WEEKS, epoch:HOMEWORK_EPOCH, clozeCn:CLOZE_SENTENCE_CN};', sb);
const WEEKS = sb.__D.weeks;
const W8 = WEEKS[7];

let pass = 0, fail = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
};

console.log('v204 · 第 8 周题库（2026-11-16）校验');

ok(WEEKS.length === 8, '题库 8 周', WEEKS.length);
ok(!!W8, 'HOMEWORK_WEEKS 含 WEEK8');

// ---- 骨架：每天 30 动作、键盘拼写 3~6 道 ----
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
let unitsBad = [], kbInfo = [], kbBad = [];
W8.forEach((d, di) => {
  let units = 0, kb = 0;
  (d.modules || []).forEach(m => {
    const enS = m.passage ? (String(m.passage).match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0;
    units += (m.words ? m.words.length : 0) + (m.questions ? m.questions.length : 0)
      + (m.blanks ? m.blanks.length : 0) + (m.passage ? 2 * enS : 0)
      + (m.full_text ? (String(m.full_text).match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0);
    if (m.skill === 'keyboard') kb += (m.questions || []).length;
  });
  kbInfo.push(kb);
  if (units !== 30) unitsBad.push('day' + di + '=' + units);
  if (kb < 3 || kb > 6) kbBad.push('day' + di + '=' + kb);
});
ok(unitsBad.length === 0, '每天恰好 30 个真实动作', unitsBad.join(','));
ok(kbBad.length === 0 && kbInfo.reduce((a, b) => a + b, 0) >= 20,
  '键盘拼写每天 3~6 道且全周 ≥20（' + kbInfo.join('/') + '）', kbBad.join(','));

// ---- 听力：3 套、每套 ≥2 类、全周 ≥3 类、复述 0% ----
const kindsAll = new Set();
let listenSets = 0, echoCount = 0, setBad = [];
W8.forEach((d, di) => (d.modules || []).forEach(m => {
  if (m.type !== 'listening') return;
  listenSets++;
  const kinds = new Set();
  (m.questions || []).forEach(q => {
    if (q.picture_options) kinds.add('选图');
    else if (q.type === 'fill') kinds.add('听写填空');
    else if (/^which sentence do you hear/i.test(String(q.question || ''))) { kinds.add('复述'); echoCount++; }
    else kinds.add('对话问答');
  });
  kinds.forEach(k => kindsAll.add(k));
  if (kinds.size < 2) setBad.push('day' + di + ' 只有 ' + [...kinds].join('/'));
}));
ok(listenSets === 3, '听力 3 套（周二/周四/周五）', listenSets);
ok(setBad.length === 0, '每套听力 ≥2 种题型', setBad.join(','));
ok(kindsAll.size >= 3, '全周听力 ≥3 类题型（' + [...kindsAll].join('/') + '）', kindsAll.size);
ok(echoCount === 0, '「听原句选原句」复述题 0 道（≤40% 上限）', echoCount);

// ---- 阅读：5 篇、6 句、4 题、passage_cn ----
let reads = [], readBad = [];
W8.forEach((d, di) => (d.modules || []).forEach(m => {
  if (m.type !== 'reading') return;
  reads.push(m);
  const enS = (String(m.passage || '').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
  if (enS !== 6 || (m.questions || []).length !== 4 || !m.passage_cn) {
    readBad.push('day' + di + ' 句' + enS + ' 题' + (m.questions || []).length + (m.passage_cn ? '' : ' 无译文'));
  }
}));
ok(reads.length === 5, '阅读 5 篇（周一/二/三/四/周六）', reads.length);
ok(readBad.length === 0, '每篇阅读 6 句、4 题、带 passage_cn', readBad.join(','));
ok(reads.every(m => (m.questions || []).every(q => q.explanation_cn)),
  '每道阅读题都有中文解析');

// ---- 完形：1 篇、7 句、6 空、译文表 7 句 ----
const clozes = [];
W8.forEach(d => (d.modules || []).forEach(m => { if (m.type === 'cloze') clozes.push(m); }));
ok(clozes.length === 1, '完形 1 篇（周日）', clozes.length);
const cz = clozes[0];
const czS = (String(cz.passage || '').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
ok(czS === 7 && (cz.questions || []).length === 6, '完形 7 句 6 空', czS + '/' + (cz.questions || []).length);
ok(/(^|\s)1___/.test(cz.passage) && /6___/.test(cz.passage), '完形占位 1___…6___ 齐全');
const czKey = DAY_KEYS.reduce((acc, d3, di) => {
  const m = W8[di].modules.filter(x => x.type === 'cloze')[0];
  if (m) acc.push('w8-' + d3 + '-cloze');
  return acc;
}, [])[0];
const cnRow = sb.__D.clozeCn[czKey];
ok(Array.isArray(cnRow) && cnRow.length === 7, 'CLOZE_SENTENCE_CN 有完形逐句译文 7 句', cnRow && cnRow.length);

// ---- 词汇：20 个全新单词 ----
const words = [];
W8.forEach(d => (d.modules || []).forEach(m => { if (m.type === 'vocabulary_game') (m.words || []).forEach(w => words.push(w)); }));
ok(words.length === 20, '本周 20 个单词（周一/三/六/周日 各 5）', words.length);
const lower = new Set();
WEEKS.slice(0, 7).forEach(wk => wk.forEach(d => (d.modules || []).forEach(m => (m.words || []).forEach(w => lower.add(String(w.word).toLowerCase())))));
const dup = words.filter(w => lower.has(String(w.word).toLowerCase()));
ok(dup.length === 0, '20 个单词全部是全新（前 7 周未出现）', dup.map(w => w.word).join(','));
ok(words.every(w => w.phonetic && w.meaning && w.emoji && w.example_en && w.example_cn && w.hint_cn && w.syllables && w.stages && w.stages.length === 8),
  '每个词卡字段齐全、8 个阶段');
const leakSegs = w => String(w.meaning).split(/[，,；;、\/]/).filter(Boolean);
const hintLeak = words.filter(w => leakSegs(w).some(p => String(w.hint_cn || '').indexOf(p) >= 0));
ok(hintLeak.length === 0, 'hint_cn 不含释义原文（不剧透）', hintLeak.map(w => w.word).join(','));
const maskBad = words.filter(w => {
  let out = String(w.example_cn || '');
  leakSegs(w).forEach(p => { if (p.length >= 2) out = out.split(p).join('○○'); });
  return leakSegs(w).some(p => out.indexOf(p) >= 0);
});
ok(maskBad.length === 0, '例句挖掉释义后不残留释义原文', maskBad.map(w => w.word).join(','));

// ---- 口语：3 天 × 5 题 ----
let spDays = 0, spBad = [];
W8.forEach(d => (d.modules || []).forEach(m => {
  if (m.type !== 'speaking') return;
  spDays++;
  if ((m.questions || []).length !== 5 || (m.questions || []).some(q => !q.options_cn || !q.answer_cn_hint)) {
    spBad.push(d.day_cn);
  }
}));
ok(spDays === 3, '口语 3 天（周一/三/周六）各 5 题', spDays);
ok(spBad.length === 0, '口语题都带 options_cn 与 answer_cn_hint', spBad.join(','));

// ---- 写作：5 空模板拼回 full_text ----
const wr = W8[4].modules.filter(m => m.type === 'writing_template')[0];
ok(!!wr && (wr.keywords || []).length === 5, '周五写作 5 个关键词');
const rebuilt = wr ? wr.template.replace(/\{\{(\d+)\}\}/g, (x, n) => wr.keywords[Number(n) - 1]) : '';
ok(wr && rebuilt.toLowerCase() === String(wr.full_text).toLowerCase(), '写作模板 + 答案能拼回 full_text');
ok(wr && String(wr.full_text).match(/[^.!?]+[.!?]+["']?(?=\s|$)/g).length === 5, '写作全文 5 句（10 动作口径）');

// ---- 版本钉子 ----
ok(/name="app-version" content="204"/.test(html), 'index.html app-version = 204');
ok((html.match(/\?v=204/g) || []).length === 7, 'index.html 7 处 ?v=204', (html.match(/\?v=204/g) || []).length);
ok(/var CACHE_NAME = 'amy-english-v204';/.test(swSrc), 'sw.js CACHE_NAME = amy-english-v204');
ok(/var V = 204;/.test(swSrc), 'sw.js var V = 204');
ok(!/\.js\?v=(?!204)\d{2,3}/.test(html), '没有残留旧 ?v=（负向前瞻）');
ok(!/amy-english-v(?!204)\d{3}/.test(swSrc), '没有残留旧缓存名（负向前瞻）');

console.log('\nv204 · ' + (fail ? '❌ ' + fail + ' 项失败（通过 ' + pass + '）' : pass + ' 项全部通过'));
process.exit(fail ? 1 : 0);
