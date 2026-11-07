// verify-v188 —— 家长 2026-11-07 指定内容进 W7（v188 重写）：
// 图1/2 代词 17 题、图3 Dear Lucy 每日跟读+周五背默、图4 Exercise02 词汇/KET。
// 通用骨架（30 动作/拼写 3~6/听力题型）由 weekpack-apply 与 verify-weeks 把关，这里钉本周专属约束。
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.log('  ✗ ' + msg); } }
const ROOT = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');

function weekSrc(n) {
  const tag = 'const WEEK' + n + ' = ';
  const i = data.indexOf(tag);
  if (i < 0) return null;
  const seg = data.slice(i + tag.length);
  const end = seg.indexOf('];');
  try { return JSON.parse(seg.slice(0, end + 1)); } catch (e) { return null; }
}
const w7 = weekSrc(7);
ok(!!w7, 'WEEK7 存在');
if (w7) {
  const modulesOf = (d) => (w7[d].modules || []);
  const find = (d, type) => modulesOf(d).filter((m) => m.type === type);

  // 1) 作文每天出现：7 天都有 writing_drill，句子取自 Dear Lucy
  const ESSAY = ['go shopping with you tomorrow', 'meet at your home', "Is 10 o'clock OK", 'take a taxi', 'football boots and some pairs of socks', 'See you tomorrow'];
  let drillDays = 0, drillUnits = 0;
  const allDrill = [];
  for (let d = 0; d < 7; d++) {
    const wd = find(d, 'writing_drill')[0];
    if (wd && wd.full_text) {
      drillDays++;
      drillUnits += (wd.full_text.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
      allDrill.push(wd.full_text);
      if (d === 0) ok(/Dear Lucy/.test(wd.full_text), '周一作文跟读带 Dear Lucy 称呼');
      if (d === 5) ok(/See you tomorrow|Tom/.test(allDrill.join(' ')), '周六跟读含结尾句或署名');
    }
  }
  ok(drillDays === 7, '作文跟读 7 天全勤，实际 ' + drillDays);
  ok(drillUnits === 16, '作文跟读每周 16 句次（每句 ≥2 遍），实际 ' + drillUnits);
  ESSAY.forEach((frag) => ok(allDrill.filter((t) => t.includes(frag)).length >= 2, '作文句「' + frag.slice(0, 24) + '」每周至少出现 2 次'));

  // 2) 周五背默：writing 模块 = Dear Lucy 全文 + 5 空
  const wri = find(4, 'writing_template')[0];
  ok(!!wri, '周五有写作模块');
  if (wri) {
    ok(wri.template.includes('Dear Lucy'), '周五作文是 Dear Lucy');
    ok((wri.keywords || []).length === 5 && wri.keywords.join(',') === 'shopping,home,taxi,football,socks', '周五作文关键词 5 个');
    const rebuilt = wri.template.replace(/\{\{(\d+)\}\}/g, (x, n) => wri.keywords[n - 1]);
    ok(rebuilt.toLowerCase() === String(wri.full_text).toLowerCase(), '背默模板 + 关键词 = 全文');
    const sents = (rebuilt.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
    ok(sents === 6, 'Dear Lucy 全文 6 句，实际 ' + sents);
    ok(!!wri.full_text_cn && wri.full_text_cn.includes('购物'), '背默模块带中文');
  }

  // 3) 代词 17 题（图1/2）
  const fillAns = (d) => find(d, 'grammar').flatMap((m) => (m.questions || []).filter((q) => q.type === 'fill').map((q) => q.answer));
  const tue = fillAns(1), thu = fillAns(3), fri = fillAns(4);
  ok(tue.join(',') === 'my,they,him,mine,himself,her', '周二代词变化 6 题：' + tue.join(','));
  ok(thu.join(',') === 'their,us,himself,ours,anyone,nothing', '周四代词+合成代词 6 题：' + thu.join(','));
  ok(fri.join(',') === 'someone,anywhere,anybody,everything,everyone', '周五合成代词 5 题：' + fri.join(','));
  ok(tue.length + thu.length + fri.length === 17, '代词题共 17 道');

  // 4) KET（图4 Exercise02 二 + 一）
  const ket = find(4, 'ket_pet')[0];
  ok(!!ket && ket.questions.length === 5, '周五 KET 5 题');
  if (ket) {
    const q0 = ket.questions[0];
    ok(q0.options[q0.answer] === 'appointment', 'KET 第 1 题考 appointment');
    ok(ket.questions[1].options[ket.questions[1].answer] === 'in', 'KET 第 2 题考 arrive in Beijing');
    ok(ket.questions[2].options[ket.questions[2].answer] === 'area', 'KET 第 3 题考 rural area');
    const ketText = ket.questions.map((q) => q.options[q.answer]).join(',');
    ok(ketText.includes('bathroom') && ketText.includes('assistant'), 'KET 覆盖连线词 bathroom/assistant');
  }

  // 5) Exercise02 词形进词汇（20 词，避开 W1(beautiful) / W3(beach) 重复）
  const words = [];
  for (const d of [0, 2, 5, 6]) { const v = find(d, 'vocabulary_game')[0]; (v ? v.words : []).forEach((x) => words.push(x.word)); }
  ok(words.length === 20, '本周词汇 20 个，实际 ' + words.length);
  ['bedroom', 'bathroom', 'assistant', 'article', 'arrow', 'barbecue', 'seaside', 'audience', 'balloon', 'basketball',
    'around', 'lovely', 'become', 'appointment', 'area', 'shopping', 'taxi', 'boots', 'socks', 'present']
    .forEach((w) => ok(words.includes(w), '词汇缺 ' + w));
  ok(!words.includes('beach') && !words.includes('beautiful'), 'beach(W3)/beautiful(W1) 不重复进 W7');
  const mon = find(0, 'vocabulary_game')[0];
  // 连线题知识点：bedroom=睡觉的房间（英文释义进 KET/词汇卡；hint 按 wrong-hint 规则不写释义原文）
  ok(mon && mon.words.some((x) => x.word === 'bedroom' && /睡觉/.test(x.hint_cn || '')), 'bedroom 词卡带「睡觉的房间」概念提示');

  // 6) 听力：周二/周四 3 题、周五 4 题（全周 10 道，v153/v165 红线 ≥10）；拼写 3/天
  for (const d of [1, 3]) {
    const ls = find(d, 'listening')[0];
    ok(ls && ls.questions.length === 3, 'day' + d + ' 听力 3 题');
  }
  const friLs = find(4, 'listening')[0];
  ok(friLs && friLs.questions.length === 4, 'day4 听力 4 题（全周凑足 10 道）');
  for (let d = 0; d < 7; d++) {
    const kb = find(d, 'tense').concat(find(d, 'tense2')).reduce((a, m) => a + (m.questions || []).length, 0);
    ok(kb >= 3 && kb <= 6, 'day' + d + ' 键盘拼写 3~6，实际 ' + kb);
  }
}

// 7) 版本钉子 187
ok((html.match(/\?v=188/g) || []).length === 6, 'index.html 六处 ?v=188');
ok(html.includes('app-version" content="188"'), 'index.html app-version=187');
ok(/var CACHE_NAME = 'amy-english-v188';/.test(sw), 'sw.js CACHE_NAME v188');
ok(/var V = 188;/.test(sw), 'sw.js V = 188');

console.log(fail ? '✗ ' + fail + ' 项失败 / ' + (pass + fail) : '✅ verify-v188 全部 ' + pass + ' 项通过');
process.exit(fail ? 1 : 0);
