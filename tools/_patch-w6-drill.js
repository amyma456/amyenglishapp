#!/usr/bin/env node
/**
 * 一次性脚本：给 W6 的周二~周日各加一个「作文跟读 · 背诵」模块（3 句），
 * 并从当天重复练习里匀出 3 个动作，保证每天仍然恰好 30 个真实动作。
 *
 * 家长 2026-11-01：
 *   「新的作文，增加朗读要求，机器系统能先带着读，学生能跟读……可以增加到
 *    每天都去跟读作文……总体的题量不要变的情况下去把这个加进去」
 *
 * 周一的作文跟读已经在「背诵作文」那一屏里（朗读全文 8 句），不重复加。
 * 用法：node tools/_patch-w6-drill.js   —— 跑完即删。
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'weekpacks', 'w6');
const dayFile = (n) => path.join(DIR, 'day' + n + '.json');

// 信的 7 句（和 day0 writing.template 一一对应，"Luca" 是署名不算一句）
const S = [
  "Dear Toni, I'm writing to you because I'm going swimming this Saturday.",
  'Would you like to come with me?',
  'It would be great to do some exercise at the weekend.',
  'The swimming pool is at the stadium downtown, and we can meet at the entrance.',
  'I will go there by bike because the weather will be good on Saturday.',
  'Let me know your idea.',
  'I hope to see you there.',
];
const C = [
  '亲爱的Toni，我写信给你是因为这周六我要去游泳。',
  '你愿意和我一起来吗？',
  '周末做些锻炼真是太好了。',
  '游泳池在市中心的体育馆里，我们可以在入口处碰面。',
  '我打算骑自行车去，因为周六天气会很好。',
  '告诉我你的想法吧。',
  '希望在那儿见到你。',
];

// 每天跟读哪 3 句：先把整封信念顺（周二~周四），周四五抽读，周六日复习
const DRILL = {
  1: { title: '第 1~3 句 · 开头与邀请', focus: "先把 I'm writing to you because… 读顺，再接住邀请句", idx: [1, 2, 3] },
  2: { title: '第 3~5 句 · 主体（锻炼 · 地点 · 交通）', focus: '这三句最长，读慢一点：at the stadium / by bike 别吞音', idx: [3, 4, 5] },
  3: { title: '第 5~7 句 · 结尾（回复与期待）', focus: 'Let me know your idea. 和 I hope to see you there. 要能脱口而出', idx: [5, 6, 7] },
  4: { title: '关键句抽读（开头 · 集合地点 · 结尾）', focus: '专挑长句：读到不打结，才算真的会了', idx: [1, 4, 7] },
  5: { title: '中段抽读（邀请 · 锻炼 · 回复）', focus: 'Would you like to come with me? 要说到不用看提示', idx: [2, 3, 6] },
  6: { title: '本周总复习（缘由 · 交通 · 期待）', focus: '这三句试着不看文字背出来', idx: [1, 5, 7] },
};

// 每天减 3 个动作：只动重复练过的知识点（some/any、there be、a/an、量词、词组）
const CUT = {
  1: { key: 'mc', drop: [0, 3, 5] },        // 周二：some/any 与 there be 一共 6 题，留 3 题（周四、周六还各有一套）
  2: { key: 'grammar', drop: [2, 3, 5] },   // 周三：a/an 7 题，留 4 题（周一 4 题 + 周四 there be 里还有 a/an）
  3: { key: 'mc', drop: [3, 4, 5] },        // 周四：there be 6 题，留 3 题（周二已练、周六还有）
  4: { key: 'mc2', drop: [1, 3, 5] },       // 周五：how much/many + 量词 6 题，留 3 题
  5: { key: 'mc2', drop: [0, 2, 6] },       // 周六：词组填空 7 题，留 4 题（be able to / be afraid of / agree with / a long time ago）
};

function reorder(obj) {
  const out = {};
  ['day_cn', 'day_en', 'theme_cn'].forEach((k) => { if (obj[k] !== undefined) out[k] = obj[k]; });
  if (obj.writing_drill) out.writing_drill = obj.writing_drill;
  Object.keys(obj).forEach((k) => { if (out[k] === undefined) out[k] = obj[k]; });
  return out;
}

// ---- 周二~周五：删题 ----
Object.keys(CUT).forEach((n) => {
  const f = dayFile(n);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const { key, drop } = CUT[n];
  const arr = d[key];
  if (!Array.isArray(arr)) throw new Error('day' + n + ' 没有 ' + key);
  const before = arr.length;
  d[key] = arr.filter((_, i) => drop.indexOf(i) < 0);
  console.log('day' + n + ' ' + key + ': ' + before + ' → ' + d[key].length + '（删 ' + drop.join(',') + '）');
  fs.writeFileSync(f, JSON.stringify(d, null, 1) + '\n');
});

// ---- 周日：完形 6 空 → 4 空（去掉第 5、6 个空），拼写 5 → 4 ----
(function cutSunday() {
  const f = dayFile(6);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const cz = d.cloze;
  cz.passage = cz.passage
    .replace('read aloud to 5___ children', 'read aloud to younger children')
    .replace('done a good 6___.', 'done a good job.');
  const before = cz.questions.length;
  cz.questions = cz.questions.slice(0, 4);
  console.log('day6 cloze: ' + before + ' → ' + cz.questions.length + ' 空');
  const sp = d.spell;
  if (sp.length !== 5) throw new Error('day6 spell 不是 5 道');
  d.spell = sp.slice(0, 4);
  console.log('day6 spell: 5 → 4');
  fs.writeFileSync(f, JSON.stringify(d, null, 1) + '\n');
})();

// ---- 周二~周日：加作文跟读 ----
Object.keys(DRILL).forEach((n) => {
  const f = dayFile(n);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const cfg = DRILL[n];
  d.writing_drill = {
    name_cn: '作文跟读 · 背诵',
    title: cfg.title,
    focus_cn: cfg.focus,
    sentences: cfg.idx.map((i) => ({ en: S[i - 1], cn: C[i - 1] })),
  };
  if (d.theme_cn.indexOf('作文跟读') < 0) d.theme_cn = '作文跟读 + ' + d.theme_cn;
  fs.writeFileSync(f, JSON.stringify(reorder(d), null, 1) + '\n');
  console.log('day' + n + ' 加作文跟读：' + cfg.idx.join('/') + ' 句');
});

console.log('\n完成。接下来：node tools/weekpack-apply.js w6 --dry');
