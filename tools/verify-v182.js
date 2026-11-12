#!/usr/bin/env node
/* verify-v182 —— Exercise 01（Unit 01 第 7 页）整页入周三 + 「学生自己能找到答案」
 *
 * 家长 2026-11-03：把这张图片里的所有题嵌入明天（周三 2026-11-04）的练习，
 * 还是 30 道合理分配，但要让学生能自己找到答案（学生反映自己不会做）。
 *
 * 改动（全部在 W6 day2，data 由 weekpack-apply 重建）：
 *   A. 猜单词 5 题：选项全部加中文注释（an airport 机场）→ 读描述就能配上；
 *   B. 字谜 4 题：题干给四个隐藏词的中文注释（angry 生气…）→ 按词义选词变形；
 *   C. 词组 8 题全部入周三：3 道进键盘拼写（纯听写格式，朗读读整词，
 *      v180 分支命中：afraid/agree/ago），5 道进「词组补充」模块、
 *      每题题干带词库（animals/activities/advanced/answer/able）自己配对；
 *   D. 口语 5 / 词汇 5 / 作文跟读 3 不动，30 动作恰好卡满。
 *
 * 校验：A 静态断言（构成/词库/中文注释/30 动作/键盘 3 道/周六复习保留）；
 *       B 功能级：真调 App._questionSpeechText（拼写题朗读=整词）和
 *         App._fillReadSentence（词组题产出干净完整句，v181 跟读链路可用）。
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
const idxSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const day2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'weekpacks', 'w6', 'day2.json'), 'utf8'));
const day5 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'weekpacks', 'w6', 'day5.json'), 'utf8'));

console.log('--- A. 静态断言 ---');

// 1) 周三构成：17 道 booklet 题全在，30 动作卡满
ok(day2.mc && day2.mc.length === 5, '周三猜单词 5 题（Exercise 01 第一大题）');
ok(day2.mc2 && day2.mc2.length === 4, '周三字谜 4 题（Exercise 01 第二大题）');
ok(day2.grammar && day2.grammar.length === 5, '周三词组补充 5 题（Exercise 01 第三大题·前半）');
ok(day2.spell && day2.spell.length === 3, '周三键盘拼写 3 题（Exercise 01 第三大题·后半）');
ok(day2.speaking.length === 5 && day2.vocab.length === 5, '口语 5 题 / 词汇 5 词不动');
ok((day2.writing_drill.sentences || []).length === 3, '作文跟读 3 句不动');
let units = (day2.writing_drill.sentences || []).length + day2.speaking.length + day2.vocab.length +
  day2.spell.length + day2.grammar.length + day2.mc.length + day2.mc2.length;
ok(units === 30, '周三真实动作恰好 30（实际 ' + units + '）');
ok(/词组/.test(day2.spell_name) && /词组/.test(day2.grammar_name), '拼写/词组模块名都标明 Exercise 01 词组');

// 2) 「自己能找到答案」：中文注释 + 词库
const glossed = day2.mc.every((q) => q.options && q.options.length === 4 &&
  q.options.every((o) => /[\u4e00-\u9fff]/.test(o)));
ok(glossed, '猜单词 5 题的 20 个选项全部带中文注释');
ok(day2.mc.every((q) => q.options[q.answer] && /[\u4e00-\u9fff]/.test(q.options[q.answer])), '正确项同样带注释（不是只装饰干扰项）');
const mc2Gloss = day2.mc2.every((q) => /angry 生气/.test(q.question) && /apple 苹果/.test(q.question) &&
  /across 穿过/.test(q.question) && /already 已经/.test(q.question));
ok(mc2Gloss, '字谜 4 题题干都带四个隐藏词的中文注释');
const BANK = 'animals / activities / advanced / answer / able';
ok(day2.grammar.every((q) => q.question.indexOf('词库：' + BANK) >= 0), '词组 5 题每题题干带词库');
ok(['animals', 'advanced', 'able', 'activities', 'answer'].every((a) => day2.grammar.some((q) => q.answer === a)),
   '词组 5 题答案覆盖 5 个词库词');
ok(['afraid', 'agree', 'ago'].every((a) => day2.spell.some((q) => q.answer === a)), '键盘拼写 3 题是词组词 afraid/agree/ago');
ok(day2.spell.every((q) => /：a_{2,} \[填完整单词\]/.test(q.question)), '拼写题是纯听写格式（首字母 a + 空，v180 朗读分支能命中）');

// 3) 周六的 4 道词组复习题保留（周三学、周六复习）
const d5ph = (day5.mc2 || []).filter((q) => /able|afraid|agree|ago/.test(String(q.answer)));
ok(d5ph.length === 4, '周六保留 4 道词组题作复习（周三学、周六再练）');

// 4) data.js 已重建、版本钉子 182
ok(dataSrc.indexOf('选词补全词组（词库：' + BANK + '）') >= 0, 'data.js 已重建（词组题入 WEEK6）');
ok(/content="198"/.test(idxSrc) && !/content="18[01]"/.test(idxSrc), 'index.html meta 版本钉在 182');
ok((idxSrc.match(/\?v=198/g) || []).length === 7, 'index.html 7 处 ?v=198');
ok(/var V = 198;/.test(swSrc) && /amy-english-v198/.test(swSrc), 'sw.js 版本钉在 182');

console.log('\n--- B. 功能级：真调 App 的朗读与补句 ---');
const document = { getElementById: () => null, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), body: { appendChild() {} }, addEventListener() {}, documentElement: { style: {} }, querySelectorAll: () => [] };
const window = { addEventListener() {}, location: { protocol: 'https:', host: 'x' }, navigator: {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const Api = { isFillerTranscript: () => false };
process.on('unhandledRejection', () => {});
const HOMEWORK_WEEKS = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const App = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api } = stubs;
  ${appSrc}
  return App;
`)({ document, window, location: window.location, navigator, localStorage, Api });

const wed = HOMEWORK_WEEKS[5][2];
const modByType = (t) => wed.modules.filter((m) => m.type === t);

// 5) 键盘拼写题朗读 = 整词（v180 听写分支命中）
const spellMods = modByType('tense').filter((m) => m.skill === 'keyboard');
ok(spellMods.length === 1 && spellMods[0].questions.length === 3, '学生端周三有 1 个键盘拼写模块（3 题）');
const spellReads = spellMods[0].questions.map((q) => App._questionSpeechText(spellMods[0], q));
ok(JSON.stringify(spellReads) === JSON.stringify(['afraid', 'agree', 'ago']),
   '拼写题朗读读整词：' + JSON.stringify(spellReads));

// 6) 词组题（词库填空）能产出干净完整句 —— v181「答对后跟读」链路可用
const gMod = modByType('grammar')[0];
const expect = ['wild animals', 'advanced course', 'be able to do sth', 'classroom activities', 'answer questions'];
const got = gMod.questions.map((q) => App._fillReadSentence(gMod, q));
ok(JSON.stringify(got) === JSON.stringify(expect), '词组题完整句逐题正确：' + JSON.stringify(got));

// 7) 字谜题朗读带四个隐藏词（听力支撑）且完整句正确
const mc2Mod = modByType('multiple_choice').find((m) => /bangryapple/.test((m.questions[0] || {}).question || ''));
ok(!!mc2Mod, '学生端周三有字谜模块');
const mc2Read = App._questionSpeechText(mc2Mod, mc2Mod.questions[0]);
ok(/already/.test(mc2Read) && /apple/.test(mc2Read), '字谜朗读带隐藏词（听力支撑）');
const mc2Sent = mc2Mod.questions.map((q) => App._fillReadSentence(mc2Mod, q));
ok(mc2Sent[0] === 'I like apples, but I don\'t like oranges.', '字谜①完整句：I like apples, ...');
ok(mc2Sent[3] === 'The library is across from the cinema.', '字谜④完整句：The library is across from the cinema.');

// 8) 猜单词模块题数与正确项（选项加注释后 answer 索引不漂移）
const mcMod = modByType('multiple_choice').find((m) => /planes land/.test((m.questions[0] || {}).question || ''));
ok(mcMod && mcMod.questions.length === 5 &&
   mcMod.questions.every((q) => q.options[q.answer] && /[\u4e00-\u9fff]/.test(q.options[q.answer])),
   '猜单词 5 题正确项索引有效且带注释');

console.log('\n' + (fail ? '✗ ' : '✓ ') + 'v182 校验：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
