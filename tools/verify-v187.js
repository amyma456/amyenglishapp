#!/usr/bin/env node
/**
 * verify-v187 —— 第 7 周（2026-11-09 起，京杭大运河 / 皮影戏 / 沙漠治沙 / 城市绿道 / 城市地铁）
 *
 * 家长口径没变：「每周围度必须是新题」。这一版把 W7 装进题库并升版本号，
 * 本脚本钉住的就是「新周真的按 v165 起的标准骨架出满了 30 个动作、且题型没退化」：
 *
 *   1) W7 就位、周号按锚点算得出来（2026-11-09 = idx 6）
 *   2) 每天恰好 30 个真实动作；每天键盘拼写 3~6 道、全周 ≥20 道、不许堆在同一天
 *   3) 听力每套 ≥2 种题型、全周 ≥3 类（问答 / 选图 / 听写），复述类 ≤40%
 *   4) 阅读 5 篇 × 6 句 4 题 + 中文逐句对齐；完形 1 篇 7 句 6 空 + 逐句译文表
 *   5) 20 个全新单词（与 W1~W6 零重复）、口语 15 题带中文提示、写作 5 空能拼回
 *   6) 版本号 187 全线一致；负向断言用字符类，下次批量升版不会把自己改坏
 */
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
const htmlSrc = read('public/index.html');
const swSrc = read('public/sw.js');
const ctx = new Function(dataSrc + '; return { W: HOMEWORK_WEEKS, EPOCH: HOMEWORK_EPOCH, CN: CLOZE_SENTENCE_CN };')();
const W = ctx.W;
const W7 = W[6];
const sentsEN = (t) => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [];
const sentsCN = (t) => String(t).replace(/\s+/g, '').split(/(?<=[。！？])/).filter((x) => x.length > 1);
const unitsOf = (m) => {
  let n = 0;
  if (m.words) n += m.words.length;
  if (m.questions) n += m.questions.length;
  if (m.blanks) n += m.blanks.length;
  if (m.passage) n += 2 * sentsEN(m.passage).length;
  if (m.type === 'writing_template' || m.type === 'writing_drill') n += sentsEN(m.full_text || '').length;
  return n;
};
const isKb = (m) => m.skill === 'keyboard' ||
  (m.type === 'tense' && (m.questions || []).some((q) => /填完整单词/.test(String(q.question || ''))));
const kbCount = (d) => d.modules.reduce((s, m) => s + (isKb(m) ? (m.questions || []).length : 0), 0);
const kindsOf = (q) => {
  if (q.picture_options) return '选图';
  if (q.type === 'fill') return '听写';
  if (/^(?:which sentence do you hear|听到的句子是什么)/i.test(String(q.question || ''))) return '复述';
  return '问答';
};

section('1. W7 就位，周号算得出来');
{
  ok(W.length === 7, '题库 7 周', W.length);
  ok(Array.isArray(W7) && W7.length === 7, 'W7 是 7 天数组', W7 && W7.length);
  ok(W7.every((d) => !!d.day_cn && !!d.day_en), 'W7 每天都有 day_cn / day_en');
  ok(/const HOMEWORK_WEEKS = \[[^\]]*WEEK7[^\]]*\];/.test(dataSrc), 'HOMEWORK_WEEKS 已包含 WEEK7');
  ok(/const WEEK7 = \[/.test(dataSrc), 'data.js 里有 WEEK7 声明');
  const dir = path.join(ROOT, 'tools', 'weekpacks', 'w7');
  let days = 0;
  for (let i = 0; i < 7; i++) if (fs.existsSync(path.join(dir, 'day' + i + '.json'))) days++;
  ok(days === 7, 'tools/weekpacks/w7 七天素材齐全', days);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  ok(meta.startDate === '2026-11-09', '周包起始日 = 2026-11-09（下周一）', meta.startDate);
  ok(meta.week === 7, '周包周号 = 7', meta.week);
  // 锚点 2026-09-28（周一）= 第 1 周 → 2026-11-09 应落在 idx 6
  const epoch = ctx.EPOCH instanceof Date ? ctx.EPOCH.getTime() : new Date(ctx.EPOCH).getTime();
  const idx1109 = Math.floor((new Date(2026, 10, 9, 12, 0, 0).getTime() - epoch) / (7 * 864e5));
  ok(idx1109 === 6, '2026-11-09 的周索引 = 6（0 基）', idx1109);
  ok(idx1109 < W.length, '下周索引没有越界（不会重放旧题）', idx1109 + ' < ' + W.length);
}

section('2. 每天 30 个真实动作 + 键盘拼写分散到每一天');
{
  const per = W7.map((d) => d.modules.reduce((s, m) => s + unitsOf(m), 0));
  ok(per.every((n) => n === 30), '7 天每天恰好 30 个真实动作', per.join(' / '));
  const kb = W7.map(kbCount);
  ok(kb.every((n) => n > 0), '7 天每天都有键盘拼写题', kb.join(' / '));
  ok(kb.every((n) => n >= 3 && n <= 6), '每天键盘拼写 3~6 道', kb.join(' / '));
  const sum = kb.reduce((a, b) => a + b, 0);
  ok(sum >= 20, '全周键盘拼写 ≥20 道', sum);
  ok(Math.max.apply(null, kb) / sum <= 0.25, '任何一天不超过全周拼写的 25%', Math.max.apply(null, kb) + '/' + sum);
  const bad = [];
  W7.forEach((d) => d.modules.forEach((m) => {
    if (!isKb(m)) return;
    (m.questions || []).forEach((q) => {
      if (!/^[a-z]+$/.test(String(q.answer || ''))) bad.push(m.id + ':' + q.answer);
      if (!q.explanation_cn) bad.push(m.id + ':缺解析');
      if (!/填完整单词/.test(String(q.question || ''))) bad.push(m.id + ':题干缺提示');
    });
  }));
  ok(bad.length === 0, '拼写题都是纯小写答案 + 有解析 + 带「填完整单词」', bad.slice(0, 4).join(' ') || '全部合格');
}

section('3. 听力题型不退化（问答 / 选图 / 听写）');
{
  const mods = [], allQ = [];
  W7.forEach((d) => d.modules.forEach((m) => {
    if (m.type !== 'listening') return;
    mods.push(m);
    (m.questions || []).forEach((q) => allQ.push(q));
  }));
  ok(mods.length >= 3, '全周听力套数 ≥3', mods.length);
  ok(allQ.length >= 10, '全周听力题 ≥10 道', allQ.length);
  const kinds = new Set(allQ.map(kindsOf));
  ok(kinds.size >= 3, '听力题型 ≥3 类', [...kinds].join('/'));
  ok(kinds.has('问答') && kinds.has('选图') && kinds.has('听写'), '问答 / 选图 / 听写 三类都在', [...kinds].join('/'));
  const thin = mods.filter((m) => new Set((m.questions || []).map(kindsOf)).size < 2).map((m) => m.id);
  ok(thin.length === 0, '每套听力至少 2 种题型', thin.join(' ') || '全部 ≥2');
  const echo = allQ.filter((q) => kindsOf(q) === '复述').length;
  ok(echo / allQ.length <= 0.4, '「听原句选原句」类不超过 40%', echo + '/' + allQ.length);
  const badPic = [];
  allQ.filter((q) => q.picture_options).forEach((q) => {
    if (!Array.isArray(q.options) || q.options.length !== 4) badPic.push(q.id + ':选项不是4个');
    else if (new Set(q.options).size !== 4) badPic.push(q.id + ':图片有重复');
    if (!/[^\x00-\x7F]/.test(String((q.options || []).join('')))) badPic.push(q.id + ':选项不是图形');
  });
  ok(badPic.length === 0, '选图题 4 张图各不相同且是图形', badPic.slice(0, 4).join(' ') || '全部合格');
  const badFill = [];
  allQ.filter((q) => q.type === 'fill').forEach((q) => {
    if (!q.audio_text) badFill.push(q.id + ':缺原文');
    else if (String(q.audio_text).toLowerCase().indexOf(String(q.answer).toLowerCase()) < 0) badFill.push(q.id + ':答案不在原文');
  });
  ok(badFill.length === 0, '听写填空的答案都能在音频原文里找到', badFill.slice(0, 4).join(' ') || '全部合格');
  const dlg = allQ.filter((q) => kindsOf(q) === '问答');
  const withRoles = dlg.filter((q) => {
    const at = String(q.audio_text || '');
    const re = /(?:^|[\s.!?])(boy|girl|man|woman|mum|mom|dad|grandma|grandpa|teacher|shopkeeper)\s*:/gi;
    const roles = []; let m;
    while ((m = re.exec(at))) roles.push(m[1].toLowerCase());
    const hasM = roles.some((r) => ['boy', 'man', 'dad', 'grandpa', 'shopkeeper'].indexOf(r) >= 0);
    const hasF = roles.some((r) => ['girl', 'woman', 'mum', 'mom', 'grandma', 'teacher'].indexOf(r) >= 0);
    return hasM && hasF;
  });
  ok(dlg.length > 0 && withRoles.length === dlg.length, '对话题都是一男一女两个角色（前端分声部）', withRoles.length + '/' + dlg.length);
  const stemEn = allQ.every((q) => /^(which picture matches|listen to the dialogue|listen and fill)/i.test(String(q.question || '')));
  ok(stemEn, '听力题干全部英文（v167 家长要求）');
}

section('4. 阅读 5 篇 6 句 4 题 + 完形 7 句 6 空');
{
  const rd = [], cz = [];
  W7.forEach((d) => d.modules.forEach((m) => {
    if (m.type === 'reading') rd.push(m);
    if (m.type === 'cloze') cz.push(m);
  }));
  ok(rd.length === 5, 'W7 阅读 5 篇', rd.length);
  ok(rd.every((m) => sentsEN(m.passage).length === 6), '每篇阅读课文 6 句', rd.map((m) => sentsEN(m.passage).length).join('/'));
  ok(rd.every((m) => m.questions.length === 4), '每篇阅读 4 道题', rd.map((m) => m.questions.length).join('/'));
  ok(rd.every((m) => !!m.passage_cn), '每篇阅读都有 passage_cn');
  ok(rd.every((m) => sentsCN(m.passage_cn).length === sentsEN(m.passage).length),
    '每篇阅读中英句数逐句对齐', rd.map((m) => sentsEN(m.passage).length + ':' + sentsCN(m.passage_cn).length).join(' '));
  ok(cz.length === 1, 'W7 完形 1 篇', cz.length);
  ok(cz.every((m) => sentsEN(m.passage).length === 7), '完形课文 7 句', cz.map((m) => sentsEN(m.passage).length).join('/'));
  ok(cz.every((m) => m.questions.length === 6), '完形 6 个空', cz.map((m) => m.questions.length).join('/'));
  ok(cz.every((m) => (m.passage.match(/\d+___/g) || []).length === 6), '完形占位 6 个 = 题数');
  ok(cz.every((m) => m.questions.every((q, i) => q.question === (i + 1) + '___')), '完形题号 1___…6___ 连续');
  const cn = ctx.CN['w7-sun-cloze'];
  ok(!!cn, 'W7 完形有逐句译文表 CLOZE_SENTENCE_CN');
  ok(Array.isArray(cn) && cn.length === 7, '完形译文 7 句', cn && cn.length);
}

section('5. 20 个全新单词 / 口语 15 题 / 写作 5 空');
{
  const words = [];
  W7.forEach((d) => d.modules.forEach((m) => (m.words || []).forEach((w) => words.push(w.word))));
  ok(words.length === 20, 'W7 新词 20 个', words.length);
  const old = new Set();
  W.slice(0, 6).forEach((wk) => wk.forEach((d) => d.modules.forEach((m) => (m.words || []).forEach((w) => old.add(String(w.word).toLowerCase())))));
  const dup = words.filter((w) => old.has(String(w).toLowerCase()));
  ok(dup.length === 0, '与 W1~W6 零重复', dup.join(' ') || '零重复');
  ok(new Set(words.map((w) => w.toLowerCase())).size === 20, 'W7 内部 20 词互不重复');
  const badW = [];
  W7.forEach((d) => d.modules.forEach((m) => (m.words || []).forEach((w) => {
    ['word', 'phonetic', 'meaning', 'emoji', 'example_en', 'example_cn', 'hint_cn'].forEach((k) => { if (!w[k]) badW.push(w.word + ':缺' + k); });
    if (!Array.isArray(w.syllables) || !w.syllables.length) badW.push(w.word + ':缺syllables');
    if (!w.letters || w.letters.join('') !== w.word) badW.push(w.word + ':letters不符');
    if (!w.stages || w.stages.length !== 8) badW.push(w.word + ':stages不是8');
  })));
  ok(badW.length === 0, '词卡字段 / 音节 / 字母 / 8 阶段齐全', badW.slice(0, 4).join(' ') || '全部合格');

  const sp = [];
  W7.forEach((d) => d.modules.forEach((m) => { if (m.type === 'speaking') sp.push.apply(sp, m.questions || []); }));
  ok(sp.length === 15, 'W7 口语 15 题', sp.length);
  ok(sp.every((q) => Array.isArray(q.options_cn) && q.options_cn.length === 4), '每题 4 条中文译文');
  ok(sp.every((q) => !!q.answer_cn_hint && !!q.pronunciation_tips && !!q.sentence_cn), '每题都有答题引导 / 发音提示 / 中文问句');

  const wr = [];
  W7.forEach((d) => d.modules.forEach((m) => { if (m.type === 'writing_template') wr.push(m); }));
  ok(wr.length === 1, 'W7 写作模板 1 篇（周五）', wr.length);
  const w = wr[0] || {};
  ok((w.keywords || []).length === 5 && (w.blanks || []).length === 5, '写作 5 个关键词 = 5 个空');
  const rebuilt = String(w.template || '').replace(/\{\{(\d+)\}\}/g, (x, n) => (w.blanks || [])[Number(n) - 1].answer);
  ok(rebuilt.toLowerCase() === String(w.full_text || '').toLowerCase(), '模板 + 答案能拼回 full_text');
  ok(sentsEN(w.full_text).length === 5, '作文 5 句（5 空 + 5 句 = 10 个动作）', sentsEN(w.full_text).length);
}

section('6. 版本号 187 全线一致');
{
  const refs = (htmlSrc.match(/\?v=187/g) || []).length;
  ok(refs === 6, 'index.html 6 处 ?v=187', refs);
  ok(/name="app-version" content="187"/.test(htmlSrc), 'index.html meta app-version = 187');
  ok(/var CACHE_NAME = 'amy-english-v187';/.test(swSrc), 'sw.js CACHE_NAME = v187（旧缓存整体作废）');
  ok(/var V = 187;/.test(swSrc), 'sw.js var V = 187');
  // 负向断言一律用字符类：以后批量升版不会把这几句自己也改掉
  ok(!/\?v=18[0-6]\b/.test(htmlSrc), 'index.html 没有残留旧 ?v=（18[0-6]）');
  ok(!/amy-english-v18[0-6]/.test(swSrc), 'sw.js 没有残留旧缓存名（v18[0-6]）');
  ok(!/amy-english-v1[5-7][0-9]\b/.test(swSrc), 'sw.js 没有残留更早的缓存名');
}

section('7. 题材：本周五个方向都在，且与 W6 不撞');
{
  const txt = [];
  W7.forEach((d) => d.modules.forEach((m) => { if (m.passage) txt.push(m.passage); }));
  const body = txt.join(' ').toLowerCase();
  [['canal', '京杭大运河'], ['puppet', '皮影戏'], ['desert', '沙漠治沙'], ['greenway', '城市绿道'], ['subway', '城市地铁']]
    .forEach(([kw, cn]) => ok(body.indexOf(kw) >= 0, '本周题材含「' + cn + '」'));
  ok(body.indexOf('dragon boat') < 0 && body.indexOf('zongzi') < 0, '不再重复 W6 的端午/粽子题材');
  ok(body.indexOf('shadow puppet') >= 0 && body.indexOf('greenway') >= 0, '阅读里既有非遗也有现代城市（题材跨度够）');
}

console.log('\n' + (fail === 0 ? '✅ 全部 ' + pass + ' 项通过' : '❌ ' + fail + ' / ' + (pass + fail) + ' 项失败'));
process.exit(fail === 0 ? 0 : 1);
