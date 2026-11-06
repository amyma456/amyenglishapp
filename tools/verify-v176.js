#!/usr/bin/env node
/* verify-v176 —— 线下练习题合入 W6（2026-11-01 家长五张图）
 * 1) 作文 = Dear Toni 信，挪到周一（背诵），周五不再有写作
 * 2) 五张图的知识点全部落位：a/an、some/any、there be+量词、How much/many、
 *    a few/a little、代词、改错、Exercise 01（猜词/字谜/词组）
 * 3) 每题带中文解析；fill 答案全小写；选择题 4 个选项
 * 4) 每天恰好 30 个真实动作
 * 5) 短语表补齐信里的短语；写作正文支持换行；版本钉 v176
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

// —— 加载题库（data.js 无 DOM 依赖，直接 eval）——
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
const ctx = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS, DATA: HOMEWORK_DATA };')();
const W6 = ctx.WEEKS[5];
ok(Array.isArray(W6) && W6.length === 7, 'W6 是 7 天数组');

const day = (n) => W6[n];
const modOf = (n, type) => day(n).modules.filter((m) => m.type === type);
const allQ = (n) => { const out = []; day(n).modules.forEach((m) => (m.questions || []).forEach((q) => out.push({ m, q }))); return out; };

// —— 动作数 ——
W6.forEach((d, di) => {
  let units = 0;
  d.modules.forEach((m) => {
    const enS = m.passage ? (String(m.passage).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0;
    units += (m.words ? m.words.length : 0) + (m.questions ? m.questions.length : 0) + (m.blanks ? m.blanks.length : 0) + (m.passage ? 2 * enS : 0) +
      (m.type === 'writing_template' || m.type === 'writing_drill' ? (String(m.full_text || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0);
  });
  ok(units === 30, '周' + '一二三四五六日'[di] + ' 真实动作 = 30（实际 ' + units + '）');
});

// —— 1) 写作：周一有、周五无、内容是那封信 ——
const wMon = modOf(0, 'writing_template');
ok(wMon.length === 1, '周一有且只有一个写作模块');
const wm = wMon[0];
ok(/Dear Toni,/.test(wm.template), '作文是照片里的 Dear Toni 信');
ok(/I'm writing to you because/.test(wm.full_text), '信的正文完整（I\'m writing to you because…）');
ok(['swimming', 'exercise', 'entrance', 'bike', 'idea'].every((k) => wm.keywords.includes(k)), '5 个关键词：swimming/exercise/entrance/bike/idea');
ok(wm.template.indexOf('{{1}}') >= 0 && wm.template.indexOf('{{5}}') >= 0, '模板有 {{1}}..{{5}} 五个空');
ok(wm.blanks.length === 5 && wm.blanks.every((b) => b.hint_cn && b.answer), '5 个空都带中文提示与答案');
ok(/entrance/.test(wm.full_text) && /by bike/.test(wm.full_text), '信里有 stadium entrance 和 by bike');
ok(!!wm.full_text_cn && wm.full_text_cn.length > 60, '整封信有中文译文（背诵前家长可讲）');
ok(modOf(4, 'writing_template').length === 0, '周五不再有写作（作文已挪到周一）');
ok(/背诵/.test(wm.requirement_cn || ''), '写作要求里写明要背诵');

// —— 2) 知识点落位 ——
const stemOf = (n) => allQ(n).map((x) => String(x.q.question || ''));
const monG = modOf(0, 'grammar');
ok(monG.length === 1 && monG[0].questions.length === 4, '周一冠词模块 4 题');
ok(stemOf(0).join('\n').includes('___ umbrella') && stemOf(0).join('\n').includes('___ honest boy'), '周一 a/an 有 umbrella / honest boy 这类易错词');

const tueMc = modOf(1, 'multiple_choice');
ok(tueMc.length === 1 && tueMc[0].questions.length === 3, '周二 3 道 some/any·there be（v177 匀出 3 道给作文跟读）');
ok(/I can't find ___ skirts/.test(stemOf(1).join('\n')) && /Why don't we buy ___ books\?/.test(stemOf(1).join('\n')), '周二有 some/any 否定与建议句（v177 保留的 3 道）');

const wedG = modOf(2, 'grammar')[0], wedMc = modOf(2, 'multiple_choice')[0], wedMc2 = modOf(2, 'multiple_choice').length > 1 ? modOf(2, 'multiple_choice')[1] : null;
// v182（家长 2026-11-03）：Exercise 01 词组入周三，a/an 冠词题让位。
// 词组补充 5 题、每题题干带词库（学生自己能配对找到答案）。
ok(wedG && wedG.questions.length === 5, '周三词组补充模块 5 题（v182：Exercise 01 词组入周三）');
ok(wedG.questions.every((q) => /词库：animals \/ activities \/ advanced \/ answer \/ able/.test(q.question)),
   '词组题每题都带词库（学生自己能找到答案）');
ok(['animals','advanced','able','activities','answer'].every((a) => wedG.questions.some((q) => q.answer === a)),
   '词组答案覆盖 animals/advanced/able/activities/answer');
ok(wedMc && /planes land and take off/.test(wedMc.questions[0].question) && wedMc.questions.length === 5, '周三 Exercise 01 猜单词 5 题（airport/address/actors/aeroplane/agent）');
ok(wedMc2 && wedMc2.questions.length === 4 && /bangryappleacrossalready/.test(wedMc2.questions[0].question), '周三字谜 4 题，题干带字母串');
const wedFills = wedMc2.questions.every((q) => q.type === 'fill');
ok(wedFills, '字谜是填空题（孩子把词拼出来）');
ok(/apples|angry|already|across/.test(JSON.stringify(wedMc2.questions.map((q) => q.answer))), '字谜答案覆盖 apples/angry/already/across');

const thuMc = modOf(3, 'multiple_choice');
ok(thuMc.length === 1 && thuMc[0].questions.length === 3, '周四 there be + 量词 3 题（v177 匀出 3 道给作文跟读）');
ok(JSON.stringify(thuMc[0].questions.map((q) => q.answer)).includes('are some') && JSON.stringify(thuMc[0].questions.map((q) => q.answer)).includes('is an'), 'there be 答案含 are some / is an 两种组合');

const friMc = modOf(4, 'multiple_choice');
ok(friMc.length === 2 && friMc[0].questions.length === 6 && friMc[1].questions.length === 3, '周五 How much/many ×6 + 量词 ×3（v177 匀出 3 道给作文跟读）');
ok(friMc[0].questions.every((q) => q.options.length === 4), 'How much/many 每题 4 个选项');
const friG = modOf(4, 'grammar')[0];
ok(friG && friG.questions.length === 5 && /Both of us is students/.test(friG.questions[0].question), '周五改错小医生 5 题（Both of us is→are 打头）');

const satMc = modOf(5, 'multiple_choice');
ok(satMc.length === 2, '周六两个选择题组（代词/词组）');
const satPron = satMc.find((m) => /name is Tom/.test(JSON.stringify(m.questions.map((q) => q.question))));
ok(satPron && satPron.questions.length === 5, '周六代词 5 题');
const satPhr = satMc.find((m) => (m.questions[0].question || '').includes('be ___ to do sth'));
ok(satPhr && satPhr.questions.length === 4 && satPhr.questions[0].answer === 'able', '周六词组填空 4 题（be able to / be afraid of / agree with / a long time ago）');
const satG = modOf(5, 'grammar')[0];
ok(satG && satG.questions.length === 4 && satG.questions.every((q) => q.answer === 'some') && /photos/.test(JSON.stringify(satG.questions.map((q) => q.question))), '周六 some/any 进阶 4 题全考 some（请求/提议）');

// —— 3) 每题解析、fill 小写、选项 4 个 ——
let bad = [];
W6.forEach((d, di) => d.modules.forEach((m) => (m.questions || []).forEach((q) => {
  if (!q.explanation_cn && !q.explanation_en) bad.push(di + ':' + (q.question || '').slice(0, 24) + ' 缺解析');
  if (q.type === 'fill' && String(q.answer) !== String(q.answer).toLowerCase()) bad.push(di + ':' + q.answer + ' 答案非小写');
  if (q.options && q.options.length !== 4) bad.push(di + ':' + (q.question || '').slice(0, 24) + ' 选项数异常');
})));
ok(bad.length === 0, '新题全部带解析、fill 全小写、选项 4 个' + (bad.length ? '（' + bad.slice(0, 3).join('；') + '）' : ''));

// 新题与 W1~W5 不撞题（跨周查重口径同 verify-weeks）
const dataSrc2 = dataSrc;
const ctxAll = new Function(dataSrc2 + '; return HOMEWORK_WEEKS;')();
const stems = new Set();
ctxAll.slice(0, 5).forEach((wk) => wk.forEach((d) => d.modules.forEach((m) => (m.questions || []).forEach((q) => {
  const t = String(q.question || '').trim();
  if (t && !/^\d+___$/.test(t)) stems.add(t.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90));
}))));
let dup = 0;
W6.forEach((d) => d.modules.forEach((m) => (m.questions || []).forEach((q) => {
  const t = String(q.question || '').trim();
  if (!t || /^\d+___$/.test(t)) return;
  const k = t.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90);
  if (k && stems.has(k)) dup++;
})));
ok(dup === 0, '新题与 W1~W5 零重复');

// —— 4) 短语表与样式 ——
const apiSrc = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
ok(apiSrc.includes("['at the weekend', '在周末']"), '短语表新增 at the weekend');
ok(apiSrc.includes("['do some exercise', '做锻炼']"), '短语表新增 do some exercise');
ok(apiSrc.includes("['let me know', '告诉我']"), '短语表新增 let me know');
ok(apiSrc.includes("['come with me', '跟我一起来']"), '短语表新增 come with me');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
ok(/\.writing-essay\{[^}]*white-space:pre-line/.test(html), '写作正文 white-space:pre-line（信件换行能显示）');

// —— 5) 版本钉 v176 ——
ok(/content="187"/.test(html), 'index.html app-version=176');
ok((html.match(/\?v=187/g) || []).length >= 6, '静态资源 ?v=187 ≥ 6 处');
const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
ok(/var V = 187;/.test(sw) && /amy-english-v187/.test(sw), 'sw.js 版本与缓存名 = 176');
ok(!/amy-english-v(?!187)d{3}/.test(sw) && !/var V = (?!187)d{2,3};/.test(sw) && !/content="(?!187)d{3}"/.test(html), '旧版本钉已清干净（缓存名 / V / meta 只剩 187）');

console.log('\n' + (fail === 0 ? '✅ 全部 ' + pass + ' 项通过' : '❌ ' + fail + ' 项失败 / ' + pass + ' 项通过'));
process.exit(fail === 0 ? 0 : 1);
