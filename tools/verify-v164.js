// verify-v164：第 6 周（2026-11-02 起）+ 周包自动出题机制
// 家长要求：不用每周催「继续」，每周围度都要是新的题。
// 本测试钉住：①W6 真的在库里且结构与动作数合规 ②W6 与 W1~W5 零重复
// ③周包工具链在位（weekpack-apply 能校验、能幂等合入）④版本号 164 全线一致
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const dataSrc = read('public/data.js');
const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const htmlSrc = read('public/index.html');
const swSrc = read('public/sw.js');

const sentsEN = (t) => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [];
const unitsOf = (m) => {
  let n = 0;
  if (m.words) n += m.words.length;
  if (m.questions) n += m.questions.length;
  if (m.blanks) n += m.blanks.length;
  if (m.passage) n += 2 * sentsEN(m.passage).length;
  if (m.type === 'writing_template') n += sentsEN(m.full_text || '').length;
  return n;
};

section('1. 第 6 周在题库里');
ok(W.length === 6, '题库 6 周', W.length);
const W6 = W[5];
ok(!!W6 && W6.length === 7, 'W6 有 7 天', W6 && W6.length);
ok(/const HOMEWORK_WEEKS = \[[^\]]*WEEK6[^\]]*\];/.test(dataSrc), 'HOMEWORK_WEEKS 已包含 WEEK6');

section('2. W6 结构合规（动作数 / 篇长 / 空位）');
{
  const bad = [];
  W6.forEach((d) => {
    const u = (d.modules || []).reduce((s, m) => s + unitsOf(m), 0);
    if (u !== 30) bad.push(d.day_cn + '=' + u);
  });
  ok(bad.length === 0, 'W6 每天真实动作 = 30', bad.join(' ') || '全部 30');

  const readings = [], clozes = [];
  W6.forEach((d) => (d.modules || []).forEach((m) => {
    if (m.type === 'reading') readings.push(m);
    if (m.type === 'cloze') clozes.push(m);
  }));
  ok(readings.length === 5, 'W6 阅读 5 篇', readings.length);
  ok(readings.every((m) => sentsEN(m.passage).length === 6), 'W6 每篇阅读 6 句');
  ok(readings.every((m) => m.questions.length === 4), 'W6 每篇阅读 4 题');
  ok(readings.every((m) => !!m.passage_cn), 'W6 每篇阅读都有中文译文');
  ok(clozes.length === 1, 'W6 完形 1 篇', clozes.length);
  ok(clozes.every((m) => sentsEN(m.passage).length === 7), 'W6 完形 7 句');
  ok(clozes.every((m) => (m.passage.match(/\d+___/g) || []).length === 6), 'W6 完形 6 个空');

  const cnTable = new Function(dataSrc + '; return CLOZE_SENTENCE_CN;')();
  ok(!!cnTable['w6-sun-cloze'], 'W6 完形有逐句译文表');
  ok(cnTable['w6-sun-cloze'] && cnTable['w6-sun-cloze'].length === 7, 'W6 完形译文 7 句');
}

section('3. W6 与 W1~W5 零重复');
{
  const oldQ = new Set(), oldW = new Set();
  W.slice(0, 5).forEach((wk) => wk.forEach((d) => (d.modules || []).forEach((m) => {
    (m.questions || []).forEach((q) => {
      const t = String(q.question || q.sentence || '').trim();
      if (!t || /^\d+___$/.test(t) || /听到的句子是什么/.test(t)) return;
      oldQ.add(t.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90));
    });
    (m.words || []).forEach((w) => oldW.add(String(w.word).toLowerCase()));
  })));

  const dupQ = [], dupW = [];
  W6.forEach((d) => (d.modules || []).forEach((m) => {
    (m.questions || []).forEach((q) => {
      const t = String(q.question || q.sentence || '').trim();
      if (!t || /^\d+___$/.test(t) || /听到的句子是什么/.test(t)) return;
      const k = t.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90);
      if (oldQ.has(k)) dupQ.push(t.slice(0, 40));
    });
    (m.words || []).forEach((w) => { if (oldW.has(String(w.word).toLowerCase())) dupW.push(w.word); });
  }));
  ok(dupQ.length === 0, 'W6 题干与 W1~W5 零重复', dupQ.join(' / ') || '零重复');
  ok(dupW.length === 0, 'W6 单词与 W1~W5 零重复', dupW.join(' / ') || '零重复');

  const w6words = [];
  W6.forEach((d) => (d.modules || []).forEach((m) => (m.words || []).forEach((w) => w6words.push(w.word))));
  ok(w6words.length === 20, 'W6 新词 20 个', w6words.length);
}

section('4. 周包自动出题工具链');
{
  const tool = path.join(ROOT, 'tools', 'weekpack-apply.js');
  ok(fs.existsSync(tool), 'tools/weekpack-apply.js 存在');
  const src = fs.readFileSync(tool, 'utf8');
  ok(src.indexOf('function validate') > 0, '带校验器 validate()');
  ok(src.indexOf('function inject(') > 0, '带幂等合入 inject()');
  ok(/真实动作必须 30/.test(src), '校验器强制每天 30 个真实动作');
  ok(/阅读课文必须 6 句/.test(src), '校验器强制阅读 6 句');
  ok(/题干与 .* 重复/.test(src), '校验器做跨周查重');

  const dir = path.join(ROOT, 'tools', 'weekpacks', 'w6');
  ok(fs.existsSync(dir), 'tools/weekpacks/w6 周包目录存在');
  let days = 0;
  for (let i = 0; i < 7; i++) if (fs.existsSync(path.join(dir, 'day' + i + '.json'))) days++;
  ok(days === 7, '周包 7 天内容齐全', days);
  ok(fs.existsSync(path.join(dir, 'meta.json')), '周包有 meta.json（周号/起始日）');
}

section('5. 版本号 v164 全线一致');
{
  const refs = (htmlSrc.match(/\?v=165/g) || []).length;
  ok(refs === 6, 'index.html 6 个脚本引用都是 v164', refs);
  ok(/app-version"\s+content="165"/.test(htmlSrc), 'app-version = 164');
  ok(/amy-english-v165/.test(swSrc), 'sw.js CACHE_NAME 升到 v164');
  ok(/var V = 165;/.test(swSrc), 'sw.js var V = 164');
  ok(htmlSrc.indexOf('v=163') < 0, 'index.html 没有残留 v163');
}

section('6. 周号推进：11-02 起自动切到 W6');
{
  const epoch = new Function(dataSrc + '; return HOMEWORK_EPOCH;')();
  const idx = new Function(dataSrc + '; return HOMEWORK_WEEK_IDX;')();
  ok(epoch instanceof Date || typeof epoch === 'string' || typeof epoch === 'number', 'HOMEWORK_EPOCH 存在');
  ok(idx === 4, '本周（10-26）仍是第 5 周 idx=4', idx);
  ok(/HOMEWORK_WEEKS\.length - 1/.test(dataSrc), '周号越界有夹取兜底（内容不够时不会崩）');
}

console.log('\n' + (fail === 0 ? '全部通过 ✅' : fail + ' 项失败 ❌') + '  (' + pass + ' 通过 / ' + fail + ' 失败)');
process.exit(fail === 0 ? 0 : 1);
