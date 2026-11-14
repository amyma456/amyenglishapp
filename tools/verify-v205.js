/* ===========================================================================
 * v205 校验：11/15（周日）~ 11/20（周五）按家长 2026-11-14 五张图重编题库
 *   node tools/verify-v205.js
 *
 * 家长 2026-11-14：
 *  「把这些题更新在明天到下周五的题库上，要求练习的题数还是 30 道，每天
 *    合适的去排列，尤其加重方位介词的训练。题型你来设置考察到知识点即可」
 *
 * 真加载 public/data.js，逐天核对：
 *   - 6 天日期（W7 周日 + W8 周一~周五）、每天恰好 30 个真实动作；
 *   - 方位介词权重最高（词卡 10 个、语法 15 题、完形 6 空、作文 5 空）；
 *   - 五张图的知识点都在：方位介词图示、in/on/at、一般现在 vs 现在进行时、
 *     购物听力、Exercise02 词汇与隐藏词、Dear Lucy 作文跟读不丢；
 *   - 听力题干全英文、对话一男一女；W8 周六/周日仍是 v204 原内容。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
const sb = { window: {}, self: {}, console };
vm.createContext(sb);
vm.runInContext(dataSrc +
  ';globalThis.__D={weeks:HOMEWORK_WEEKS, epoch:HOMEWORK_EPOCH, clozeCn:CLOZE_SENTENCE_CN};', sb);
const W = sb.__D.weeks;
const CN = sb.__D.clozeCn;
const W7 = W[6], W8 = W[7];

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };
// data.js 在 vm 沙箱里跑，取出来的数组属于另一个 realm；用 JSON 比较内容，
// 不然 deepStrictEqual 会因为原型不同误报「值一样但不相等」。
const eq = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
console.log('v205 · 11/15~11/20 方位介词专项题库 校验');

const meta7 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/weekpacks/w7/meta.json'), 'utf8'));
const meta8 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/weekpacks/w8/meta.json'), 'utf8'));
const DAYS = [
  { label: '11/15 周日', day: W7[6] },
  { label: '11/16 周一', day: W8[0] },
  { label: '11/17 周二', day: W8[1] },
  { label: '11/18 周三', day: W8[2] },
  { label: '11/19 周四', day: W8[3] },
  { label: '11/20 周五', day: W8[4] },
];
const SENT = /[^.!?]+[.!?]+["']?(?=\s|$)/g;
function units(d) {
  let n = 0;
  (d.modules || []).forEach(m => {
    const enS = m.passage ? (String(m.passage).match(SENT) || []).length : 0;
    n += (m.words ? m.words.length : 0) + (m.questions ? m.questions.length : 0)
      + (m.blanks ? m.blanks.length : 0) + (m.passage ? 2 * enS : 0)
      + (m.full_text ? (String(m.full_text).match(SENT) || []).length : 0);
  });
  return n;
}
const mod = (d, t) => (d.modules || []).filter(m => m.type === t)[0];
const texts = d => JSON.stringify(d);
const PREP = /\b(over|under|between|behind|across|through|above|below|among|beside|opposite|against|along|past|towards|in front of|next to|around|near|into|onto|across from|straight ahead|on the left|on the right)\b/gi;

// ------------------------------------------------------------------ 日期与骨架
ok('周包日期对得上「明天到下周五」：W7 周日 11/15 + W8 周一~周五 11/16~11/20', () => {
  assert.strictEqual(meta7.startDate, '2026-11-09');
  assert.strictEqual(meta8.startDate, '2026-11-16');
  assert.strictEqual(W7[6].day_cn, '周日');
  ['周一', '周二', '周三', '周四', '周五'].forEach((dc, i) =>
    assert.strictEqual(W8[i].day_cn, dc, 'W8 day' + i + ' 不是 ' + dc));
  assert.strictEqual(W8[5].day_cn, '周六');
  assert.strictEqual(W8[6].day_cn, '周日');
});
ok('6 天每天恰好 30 道练习动作，键盘拼写每天 3~6 道', () => {
  DAYS.forEach(({ label, day }) => {
    assert.strictEqual(units(day), 30, label + ' 不是 30 道');
    const kb = (day.modules || []).filter(m => m.skill === 'keyboard')
      .reduce((a, m) => a + (m.questions || []).length, 0);
    assert(kb >= 3 && kb <= 6, label + ' 键盘拼写 ' + kb + ' 道');
  });
});
ok('版本钉子统一到 v205', () => {
  assert(/name="app-version" content="205"/.test(html));
  assert.strictEqual((html.match(/\?v=205/g) || []).length, 7);
  assert(/var CACHE_NAME = 'amy-english-v205';/.test(swSrc) && /var V = 205;/.test(swSrc));
});

// ------------------------------------------------------------------ 方位介词权重
ok('方位介词是这 6 天绝对主角：每天 ≥30 处、6 天合计 ≥250 处', () => {
  let total = 0;
  DAYS.forEach(({ label, day }) => {
    const n = (texts(day).match(PREP) || []).length;
    assert(n >= 30, label + ' 方位介词只出现 ' + n + ' 处');
    total += n;
  });
  assert(total >= 250, '方位介词合计只有 ' + total + ' 处');
});
ok('周日完形 6 个空全部考方位介词，译文表也换成了商场那篇', () => {
  const cz = mod(W7[6], 'cloze');
  assert(cz && /new mall/.test(cz.passage), '周日完形没换成商场找店铺');
  const right = (cz.questions || []).map(q => q.options[q.answer]);
  eq(right, ['near', 'between', 'over', 'behind', 'across', 'under']);
  const row = CN['w7-sun-cloze'];
  assert(Array.isArray(row) && row.length === 7, '完形译文表不是 7 句');
  assert(/商场/.test(row[0]) && !/运河/.test(row.join('')), '译文表还是旧的大运河');
});
ok('周日 3 道拼写也是方位介词；词汇与 Dear Lucy 作文跟读按家长旧要求保留', () => {
  const kb = mod(W7[6], 'tense');
  eq((kb.questions || []).map(q => q.answer), ['over', 'under', 'between']);
  const v = mod(W7[6], 'vocabulary_game');
  eq((v.words || []).map(w => w.word),
    ['shopping', 'taxi', 'boots', 'socks', 'present']);
  const wd = mod(W7[6], 'writing_drill');
  assert(wd && /take a taxi/.test(wd.full_text) && /football boots/.test(wd.full_text));
});
ok('W8 周一/周三 10 个新词全是方位 / 运动介词，且是前 7 周没学过的', () => {
  const w0 = (mod(W8[0], 'vocabulary_game').words || []).map(w => w.word);
  const w2 = (mod(W8[2], 'vocabulary_game').words || []).map(w => w.word);
  eq(w0, ['over', 'under', 'between', 'behind', 'across']);
  eq(w2, ['opposite', 'against', 'along', 'past', 'towards']);
  const used = new Set();
  W.slice(0, 7).forEach(wk => wk.forEach(d => (d.modules || []).forEach(m =>
    (m.words || []).forEach(w => used.add(String(w.word).toLowerCase())))));
  w0.concat(w2).forEach(w => assert(!used.has(w), w + ' 前 7 周已经学过'));
});
ok('语法 19 题：方位介词 10 题 + 时间/地点介词 5 题 + 时态 4 题', () => {
  const g1 = mod(W8[1], 'grammar').questions;
  eq(g1.map(q => q.answer),
    ['over', 'under', 'through', 'in', 'under', 'between']);
  const g3 = mod(W8[3], 'grammar').questions;
  eq(g3.slice(0, 4).map(q => q.options[q.answer]),
    ['in the front of', 'above', 'between', 'under']);
  eq(g3.slice(4).map(q => q.answer), ['on', 'in']);
  const g4 = mod(W8[4], 'grammar').questions;
  eq(g4.slice(0, 4).map(q => q.options[q.answer]),
    ['plays', 'is watching', 'have', 'know']);
  eq(g4.slice(4).map(q => q.answer), ['at', 'on', 'in']);
  assert.strictEqual(g1.length + g3.length + g4.length, 19);
});
ok('周五作文 5 个空全是方位介词，KET 5 题覆盖 Exercise02 与图1 改错', () => {
  const wr = mod(W8[4], 'writing_template');
  eq(wr.keywords, ['between', 'above', 'behind', 'under', 'beside']);
  const kp = mod(W8[4], 'ket_pet').questions.map(q => q.options[q.answer]);
  eq(kp, ['bedroom', 'appointment', 'area', 'likes', 'around']);
  assert(/around the world/.test(kp.join(' ') + texts(mod(W8[4], 'ket_pet'))));
});
ok('周四阅读与拼写覆盖购物听力的人物物品表（dress/suit/jeans/watch…）', () => {
  const rd = mod(W8[3], 'reading');
  ['Tom went shopping', 'a dress', 'a suit', 'jeans', 'watch', 'beside the bookshop']
    .forEach(s => assert(rd.passage.indexOf(s) >= 0, '阅读少了 ' + s));
  eq(mod(W8[3], 'tense').questions.map(q => q.answer),
    ['jeans', 'shirt', 'shoes', 'watch']);
});

// ------------------------------------------------------------------ 题型红线
ok('6 天所有听力题干都是英文，对话一男一女，题型不单一', () => {
  const EN = [/^Listen to the dialogue\./, /^Which picture matches the sentence you hear\?/,
    /^Listen and fill in the blank:/];
  const roleRe = /(?:^|[\s.!?])(boy|girl|man|woman|mum|mom|dad|grandma|grandpa|teacher|shopkeeper)\s*:/gi;
  const kinds = new Set();
  DAYS.forEach(({ label, day }) => {
    const ls = mod(day, 'listening');
    if (!ls) return;
    const local = new Set();
    (ls.questions || []).forEach(q => {
      assert(!!q.audio_text, label + ' 听力缺音频文本');
      assert(EN.some(r => r.test(q.question || '')), label + ' 题干不是英文固定句式：' + q.question);
      if (q.picture_options) { local.add('选图'); kinds.add('选图'); }
      else if (q.type === 'fill') { local.add('听写'); kinds.add('听写'); }
      else {
        local.add('问答'); kinds.add('问答');
        const roles = [];
        let m;
        roleRe.lastIndex = 0;
        while ((m = roleRe.exec(q.audio_text))) roles.push(m[1].toLowerCase());
        const male = roles.some(r => ['boy', 'man', 'dad', 'grandpa', 'shopkeeper'].indexOf(r) >= 0);
        const female = roles.some(r => ['girl', 'woman', 'mum', 'mom', 'grandma', 'teacher'].indexOf(r) >= 0);
        assert(male && female, label + ' 对话不是一男一女：' + q.audio_text);
      }
    });
    assert(local.size >= 2, label + ' 一套听力只有一种题型');
  });
  assert(kinds.size >= 3, '全周听力题型不足 3 类');
});
ok('阅读 4 篇新短文都围绕位置与方位，且各有中文译文', () => {
  [0, 1, 2, 3].forEach(i => {
    const rd = mod(W8[i], 'reading');
    assert(rd && rd.passage_cn && rd.passage_cn.length > 40, 'day' + i + ' 阅读没译文');
    assert((rd.passage.match(SENT) || []).length === 6, 'day' + i + ' 阅读不是 6 句');
    assert(rd.questions.length === 4, 'day' + i + ' 阅读不是 4 题');
    assert((rd.passage.match(PREP) || []).length >= 3, 'day' + i + ' 阅读没方位介词');
  });
});
ok('只重编了这 6 天：W8 周六 / 周日仍是 v204 原内容', () => {
  const w5 = (mod(W8[5], 'vocabulary_game').words || []).map(w => w.word);
  assert(w5.indexOf('ocean') >= 0, '周六深海词汇被误改');
  const cz = mod(W8[6], 'cloze');
  assert(cz && /museum|science/i.test(cz.passage), '周日科技馆完形被误改');
});

console.log('\nv205 · ' + pass + ' 项全部通过');
