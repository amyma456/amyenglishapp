// verify-reading-pairs.js — v135 阅读理解逐句翻译配对回归
//
// 背景（老师 2026-10-16 反馈）：明天的阅读理解退化成"一口气翻全文"，
// 学生压力太大。要求：还是像以前一样一句一句翻；点单词能查意思；
// 差距太大必须重读。根因是 _pairSentences 要求中英句数严格相等，
// 而真实课文里有一堆"差一句"的情况，一对不上整篇就退回全文翻译。
//
// 本测试做三层验证：
//   ① 用 app.js 里的**真** _splitSentences/_pairSentences 跑遍四周全部
//      带 passage_cn 的课文 —— 必须全部配对成功（一篇都不少）；
//   ② 切分器的单元行为：缩写点（Mr.）、引号结尾+大写开头、
//      引号后小写（同句延续）、"coast." 不许被当成缩写 St.；
//   ③ 中文并句启发式：海豚课文的「海豚！」「她喊道。」并回一句。
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '  (' + detail + ')' : '')); }
}
function section(t) { console.log('\n【' + t + '】'); }

const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');

// —— 从 app.js 抽出真函数（按大括号配平截取，不复述逻辑）——
function grab(name) {
  const re = new RegExp('\\n  ' + name + '\\([^)]*\\) \\{');
  const m = appSrc.match(re);
  if (!m) throw new Error('app.js 里找不到 ' + name);
  let i = m.index + m[0].length, depth = 1, j = i;
  while (depth > 0) {
    if (appSrc[j] === '{') depth++;
    else if (appSrc[j] === '}') depth--;
    j++;
  }
  return appSrc.slice(m.index + 1, j);
}
const ctx = {};
vm.createContext(ctx);
vm.runInContext('globalThis.fns = {' + grab('_splitSentences') + ',' + grab('_pairSentences') + '};', ctx);
const fns = ctx.fns;
const D = new Function(dataSrc + ';return { W: HOMEWORK_WEEKS };')();

// ① 全量配对
section('① 四周全部课文逐句配对（真算法）');
let total = 0, pairOk = 0;
const failures = [];
D.W.forEach((week, wi) => {
  week.forEach((day, di) => {
    (day.modules || []).forEach((m, mi) => {
      if (!m.passage || !m.passage_cn) return;
      total++;
      if (fns._pairSentences(m)) pairOk++;
      else failures.push('WEEK' + (wi + 1) + ' ' + day.day_cn + ' 模块' + mi);
    });
  });
});
// v143：周日的阅读理解去掉了（一天只留完形填空，见 data.js 顶部的
// slimHeavyReadingModules），所以 4 周从 20 篇变成 16 篇。这里只保证
// "还有足够多的课文"，不再钉死 20。
ok(total >= 16, '课文总数符合预期（≥16 篇，v143 去掉周日那 4 篇）', '实际 ' + total + ' 篇');
ok(pairOk === total, '★ 全部课文都能逐句配对（不再退化成全文翻译）',
   pairOk + '/' + total + (failures.length ? '，配不上：' + failures.join('、') : ''));
ok(fns._pairSentences(D.W[2][5].modules.find(m => m.type === 'reading')),
   '★ 明天（WEEK3 周六博物馆课文，v153 主题改版）走逐句翻译');

// 这一篇的逐句参考答案要与系统中文对得上：抽查配对数与含主题词的句子
const tmPairs = fns._pairSentences(D.W[2][5].modules.find(m => m.type === 'reading'));
ok(tmPairs.length >= 6 && tmPairs.some(p => p.cn.indexOf('博物馆') !== -1),
   '★ 逐句配对完整且参考答案是本课中文', '共 ' + tmPairs.length + ' 句');
ok(tmPairs.every(p => p.en && p.cn), '每一句都有英文原句和中文参考');

// 逐句步骤里词可点（点单词看中文意思）+ 参考答案就是系统里那句中文
// v171：标签会随"要不要背"变（参考答案 / 参考译文（先背一背）），所以按
// "标签后面紧跟 pair.cn 的译文块"来认，不再死认某一种标签文字。
ok(/_wordSpans\(pair\.en\)/.test(appSrc), '逐句翻译页英文按词切分（可点查意思）');
ok(/tr-label">'\s*[\s\S]{0,160}pair\.cn|tr-label">参考答案/.test(appSrc),
   '逐句翻译的参考答案用的是 passage_cn 里对应的那句（和听力/中文对得上）');

// ② 切分器单元行为
section('② 英文切分器单元行为');
const S = function (t) { return fns._splitSentences(t); };
ok(S('His science teacher, Mr. Brown, encourages him to study hard. He saw rockets.').length === 2,
   'Mr. 缩写点不当句号', JSON.stringify(S('His science teacher, Mr. Brown, encourages him to study hard. He saw rockets.')));
ok(S('She said, "Keep practising." Amy went home.').length === 2,
   '引号结尾+大写开头要切开', JSON.stringify(S('She said, "Keep practising." Amy went home.')));
ok(S('"Dolphins!" she shouted. Three dolphins swam.').length === 2,
   '引号后小写=同一句延续，不切开', JSON.stringify(S('"Dolphins!" she shouted. Three dolphins swam.')));
ok(S('The boat sailed along the coast. The sea was calm.').length === 2,
   '"coast." 不许被当成缩写 St.（回归）', JSON.stringify(S('The boat sailed along the coast. The sea was calm.')));
ok(S('He ran fast. Then he slept.').length === 2, '普通句号正常切');
ok(S('It costs five dollars. 300 people came.').length === 2, '数字开头的下一句也切');

// ③ 中文并句启发式
section('③ 中文"说话尾缀"并句');
const fake = {
  passage: '"Dolphins!" she shouted. Three dolphins swam next to the boat.',
  passage_cn: '海豚！她喊道。三只海豚在船边游了十分钟。',
};
const p = fns._pairSentences(fake);
ok(!!p, '尾缀并句后 2 句对 2 句');
ok(p && p[0].cn === '海豚！她喊道。', '「海豚！」「她喊道。」并成一句', p && JSON.stringify(p[0].cn));
ok(p && p[1].cn === '三只海豚在船边游了十分钟。', '正常句不受影响');
const noMerge = fns._pairSentences({
  passage: 'Tom ran fast. He won the race.',
  passage_cn: '汤姆跑得快，他赢了比赛。',
});
ok(noMerge === null, '普通的中英句数不齐不硬凑（宁可退回全文也不配错位）');

console.log('\n=========================================');
console.log(failed === 0
  ? '全部通过 ✅ （' + passed + ' 项）'
  : '有失败 ❌ （通过 ' + passed + ' / 失败 ' + failed + '）');
process.exit(failed === 0 ? 0 : 1);
