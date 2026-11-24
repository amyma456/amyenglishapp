// verify-v223 校验：第 10 周题库（2026-11-30 起）按 v165 标准骨架上线
//   node tools/verify-v223.js
// 内容来源：tools/weekpacks/w10（国家公园雪豹 / 国产大飞机 C919 / 三星堆 / 海绵城市 /
//   大熊猫野化放归 / 乡村直播助农完形 / 糖画庙会邀请信作文）。
//   - 周数：题库 10 周；每天恰好 30 个真实动作；每天 keyboard 拼写 3~6 道、全周 ≥20；
//   - 听力 ≥3 类题型（问答 / 选图 / 填空），复述类 ≤40%；
//   - 阅读每篇 6 句 + passage_cn；完形 7 句 + sentences_cn 7 句；
//   - 版本钉子：index.html / sw.js 统一 v223（残留检查用字符类，防批量升版自相矛盾）。

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  OK  ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' → ' + extra : '')); }
}
function section(t) { console.log('\n[' + t + ']'); }

function sentsEN(p) {
  return String(p).split(/(?<=[.!?]["'』」]?)\s+(?=[A-Z"'])/).filter(s => s.trim());
}

// 从 data.js 里截取 WEEK1..HOMEWORK_WEEKS 的定义段，直接求值（data.js 其余部分可能有 DOM 依赖）
const start = dataSrc.indexOf('const WEEK1');
let end = dataSrc.indexOf('const HOMEWORK_EPOCH');
const clozeCNIdx = dataSrc.indexOf('const CLOZE_SENTENCE_CN');
if (clozeCNIdx >= 0) end = dataSrc.indexOf('};', clozeCNIdx) + 2;
ok(start >= 0 && end > start, 'data.js 里能截出 WEEK 定义段');
const WEEKS = new Function(dataSrc.slice(start, end) + '\nreturn HOMEWORK_WEEKS;')();
const CLOZE_CN = new Function(dataSrc.slice(start, end) + '\nreturn CLOZE_SENTENCE_CN;')();
const W10 = WEEKS[9];

section('1] 周数与骨架');
ok(WEEKS.length === 10, '题库 10 周（W10 于 v223 上线）', WEEKS.length);
ok(Array.isArray(W10) && W10.length === 7, 'WEEK10 有 7 天');

const mod = (d, type) => d.modules.filter(m => m.type === type);
const kbSpell = (d) => d.modules.filter(m => m.type === 'tense' && m.skill === 'keyboard');

function dayActions(d) {
  let n = 0;
  for (const m of d.modules) {
    if (m.questions) n += m.questions.length;
    if (m.words) n += m.words.length;
    if (m.type === 'reading') n += sentsEN(m.passage).length * 2;
    if (m.type === 'cloze') n += sentsEN(m.passage).length * 2;
    if (m.type === 'writing_template') n += m.keywords.length * 2;
  }
  return n;
}

section('2] 每天 30 动作 + 键盘拼写 3~6 道');
W10.forEach((d, i) => {
  const n = dayActions(d);
  ok(n === 30, 'day' + i + '（' + d.day_cn + '）恰好 30 个真实动作', n);
  const sp = kbSpell(d).reduce((s, m) => s + m.questions.length, 0);
  ok(sp >= 3 && sp <= 6, 'day' + i + ' 键盘拼写 ' + sp + ' 道（3~6）');
});
const spellTotal = W10.reduce((s, d) => s + kbSpell(d).reduce((x, m) => x + m.questions.length, 0), 0);
ok(spellTotal >= 20, '全周键盘拼写 ≥20 道', spellTotal);
ok(W10.every(d => kbSpell(d).length > 0), '任何一天都没有空拼写');

section('3] 听力题型（≥3 类，复述 ≤40%）');
const listenItems = W10.flatMap(d => mod(d, 'listening')).flatMap(m => m.questions);
ok(listenItems.length === 12, '听力共 12 题', listenItems.length);
const hasDialogue = listenItems.filter(x => /listen to the dialogue/i.test(x.question || '')).length;
const hasPicture = listenItems.filter(x => x.picture_options).length;
const hasFill = listenItems.filter(x => x.type === 'fill').length;
const hasRepeat = listenItems.filter(x => /which sentence do you hear/i.test(x.question || '')).length;
ok(hasDialogue === 6 && hasPicture === 3 && hasFill === 3, '问答 6 + 选图 3 + 填空 3', hasDialogue + '/' + hasPicture + '/' + hasFill);
ok(hasRepeat === 0, '「听原句选原句」复述题 0 道（≤40%）', hasRepeat);
W10.filter(d => mod(d, 'listening').length).forEach((d, k) => {
  const kinds = new Set(mod(d, 'listening').flatMap(m => m.questions).map(x => x.picture_options ? 'pic' : x.type === 'fill' ? 'fill' : 'qa'));
  ok(kinds.size >= 2, '第 ' + (k + 1) + ' 套听力 ≥2 种题型', [...kinds].join('+'));
});
// 对话必须一男一女
const dlgBad = [];
listenItems.forEach(x => {
  const t = x.audio_text || '';
  const roles = new Set((t.match(/(Boy|Girl|Man|Woman|Mum|Dad|Grandma|Grandpa|Teacher|Shopkeeper):/g) || []).map(s => s.slice(0, -1)));
  if (!roles.size) return;
  const male = ['Boy', 'Man', 'Dad', 'Grandpa'].some(r => roles.has(r));
  const female = ['Girl', 'Woman', 'Mum', 'Grandma', 'Teacher'].some(r => roles.has(r));
  if (!(male && female)) dlgBad.push(t.slice(0, 30));
});
ok(dlgBad.length === 0, '每段对话至少一男一女两个声部', dlgBad.join(' | '));
// 听力题干全英文（不许出现中文）
const cnBad = listenItems.filter(x => /[\u4e00-\u9fff]/.test(x.question || ''));
ok(cnBad.length === 0, '听力题干全部是英文', cnBad.length);

section('4] 阅读（6 句 + 4 题 + passage_cn）');
const readings = W10.flatMap(d => mod(d, 'reading'));
ok(readings.length === 5, 'W10 有 5 篇阅读', readings.length);
readings.forEach((r, i) => {
  ok(sentsEN(r.passage).length === 6, '第 ' + (i + 1) + ' 篇阅读 6 句', sentsEN(r.passage).length);
  ok(r.questions.length === 4, '第 ' + (i + 1) + ' 篇阅读 4 题', r.questions.length);
  ok(!!r.passage_cn && r.passage_cn.length > 50, '第 ' + (i + 1) + ' 篇有 passage_cn');
});

section('5] 完形（7 句 6 空 + sentences_cn 7 句）');
const clozeMods = W10.flatMap(d => mod(d, 'cloze'));
ok(clozeMods.length === 1, '完形只有 1 篇', clozeMods.length);
const cloze = clozeMods[0];
const sents = sentsEN(cloze.passage);
ok(sents.length === 7, '完形 7 句', sents.length);
ok(cloze.questions.length === 6, '完形 6 个空', cloze.questions.length);
ok(CLOZE_CN && Array.isArray(CLOZE_CN[cloze.id]) && CLOZE_CN[cloze.id].length === 7, '完形译文表 sentences_cn 有 7 句', CLOZE_CN ? (CLOZE_CN[cloze.id] || []).length : '表缺失');

section('6] 词汇 20 词全新 + 口语 5 题/天');
const vocab = W10.flatMap(d => mod(d, 'vocabulary_game')).flatMap(m => m.words.map(w => w.word));
ok(vocab.length === 20, '本周词汇 20 个', vocab.length);
const other = WEEKS.slice(0, 9).flatMap(w => w.flatMap(d => d.modules.filter(m => m.type === 'vocabulary_game')).flatMap(m => m.words.map(x => x.word)));
const dup = vocab.filter(w => other.includes(w));
ok(dup.length === 0, 'W10 单词与 W1~W9 零重复', dup.join(','));
const speaks = W10.flatMap(d => mod(d, 'speaking')).flatMap(m => m.questions);
ok(speaks.length === 15, '口语 3 天 × 5 题 = 15 道', speaks.length);
ok(speaks.every(x => Array.isArray(x.options_cn) && x.options_cn.length === 4 && !!x.answer_cn_hint), '口语每题 options_cn ×4 + answer_cn_hint');

section('7] 版本钉子 v223');
ok(/name="app-version" content="223"/.test(htmlSrc), 'index.html app-version = 223');
const scriptPins = (htmlSrc.match(/src="[^"]+\.js\?v=\d+"/g) || []);
  const preloadPins = (htmlSrc.match(/href="[^"]+\.js\?v=\d+"/g) || []);
  ok(scriptPins.length === 7 && preloadPins.length === 3 && scriptPins.concat(preloadPins).every(x => x.endsWith('?v=223"')), '全部 10 个脚本钉子（7 src + 3 preload）都是 ?v=223', scriptPins.length + '+' + preloadPins.length);
ok(/var CACHE_NAME = 'amy-english-v223';/.test(swSrc) && /var V = 223;/.test(swSrc), 'sw.js CACHE_NAME / V = 223');
ok(!/\?v=2(0[0-9]|1[0-9]|2[01])(?![0-9])/.test(htmlSrc), '没有残留旧 ?v=（字符类 v200~v221）');
ok(!/amy-english-v2(0[0-9]|1[0-9]|2[01])(?![0-9])/.test(swSrc), '没有残留旧缓存名（字符类 v200~v221）');

console.log('\nv223 · ' + (fail ? '❌ ' + fail + ' 项失败（通过 ' + pass + '）' : pass + ' 项全部通过'));
process.exit(fail ? 1 : 0);
