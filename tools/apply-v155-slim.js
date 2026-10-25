// v155：每天恰好 30 个**真实动作**（家长 2026-10-25 晚原话：
// 「每天30道，是真正的30道，中文翻译也是每个是真正的一道题，读英语也是
// 真正的一道题，不要把它放到一起做的，目的就是让孩子用30分钟左右的时间
// 全部做完，题量不要太大，孩子们做的有些累」）
//
// 真实动作的口径（app.js _unitsOfStep 同步改）：
//   跟读一句英语 = 1，翻译一句中文 = 1，答一道题 = 1，
//   一个词汇词 = 1，写作一个空 = 1，朗读作文一句 = 1。
// v154 之前文章是 6~14 句 + 10 道题，一个阅读模块就是 30+ 个动作，
// 每天真实动作 42~58 个 —— 这才是孩子累的根源。
//
// 裁法（全部保留原句，按句子下标裁，中英同下标，逐句翻译天然对齐）：
//   周一/三/六  口语5 + 词汇5 + 阅读(读6+译6+题4) + 单选4 = 30   删时态模块
//   周二        阅读(读6+译6+题4) + 语法6 + 单选8 = 30
//   周四        听力5 + 完形(读7+译7+空6) + 时态5 = 30
//   周五        写作5空 + 朗读全文5句 + KET12(W1-3)/5(W4) + 语法8(W1-3)/15(W4) = 30
//   周日        词汇5 + 完形(读7+译7+空6) + 听力5 = 30          删时态+语法模块
//
// 完形空位重编号：保留 6 个旧空，stem/id 重编为 1___..6___；被裁掉的空
// 若所在句子仍保留，则把课文里的标记替换成原答案（保证占位数=题数）。
// 用法：node tools/apply-v155-slim.js
const fs = require('fs');
const path = require('path');
const R = __dirname;
const P = path.join(R, '..', 'public', 'data.js');
const src = fs.readFileSync(P, 'utf8');

const fn = new Function(src + '; return { WEEKS: HOMEWORK_WEEKS, CN: (typeof CLOZE_SENTENCE_CN !== "undefined") ? CLOZE_SENTENCE_CN : {} };');
const loaded = fn();
const weeks = JSON.parse(JSON.stringify(loaded.WEEKS));
const cnOld = JSON.parse(JSON.stringify(loaded.CN));
if (weeks.length !== 4) { console.error('周数异常'); process.exit(1); }

// ---------- 切句（与 app.js _splitSentences 同口径的英文切分） ----------
function sentsEN(t) {
  return String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [String(t)];
}
// 中文按 。！？ 切（与 _pairSentences 内部一致）
function sentsCN(t) {
  return String(t).replace(/\s+/g, '').split(/(?<=[。！？])/).filter(x => x.length > 1);
}

function findMod(week, di, idSuffix) {
  return week[di].modules.find(x => x.id === idSuffix || x.id.endsWith('-' + idSuffix));
}
function must(cond, msg) { if (!cond) { console.error(msg); process.exit(1); } }

// ---------- 阅读：保留 6 句 + 4 题 ----------
const READING = {
  'mon-reading':   { s: [0, 1, 2, 3, 4, 5], q: [0, 1, 4, 9] },
  'tue-reading':   { s: [0, 1, 2, 3, 4, 5], q: [0, 1, 3, 9] },
  'wed-reading':   { s: [0, 1, 2, 4, 5, 7], q: [0, 1, 3, 5] },
  'sat-reading':   { s: [0, 1, 2, 3, 4, 5], q: [0, 2, 4, 9] },
  'w2-mon-reading':{ s: [0, 1, 2, 3, 4, 5], q: [0, 1, 8, 9] },
  'w2-tue-reading':{ s: [0, 1, 2, 3, 4, 5], q: [0, 2, 4, 9] },
  'w2-wed-reading':{ s: [0, 1, 2, 3, 4, 6], q: [0, 2, 4, 9] },
  'w2-sat-reading':{ s: [0, 1, 2, 5, 6, 7], q: [0, 1, 4, 9] },
  'w3-mon-reading':{ s: [0, 1, 2, 4, 5, 6], q: [0, 1, 3, 9] },
  'w3-tue-reading':{ s: [0, 2, 4, 5, 6, 7], q: [1, 3, 4, 9] },
  'w3-wed-reading':{ s: [0, 1, 3, 4, 5, 6], q: [0, 3, 5, 9] },
  'w3-sat-reading':{ s: [0, 3, 4, 5, 6, 8], q: [0, 2, 3, 9] },
  'w4-mon-reading':{ s: [0, 1, 2, 3, 4, 6], q: [0, 2, 4, 9] },
  'w4-tue-reading':{ s: [0, 1, 2, 3, 5, 6], q: [0, 1, 3, 9] },
  'w4-wed-reading':{ s: [0, 1, 2, 3, 4, 7], q: [0, 2, 4, 9] },
  'w4-sat-reading':{ s: [0, 1, 2, 3, 4, 7], q: [0, 1, 3, 9] },
};

// ---------- 完形：保留 7 句 + 6 空（keep = 旧空号，须与 q 升序一一对应） ----------
const CLOZE = {
  'thu-cloze':  { s: [0, 1, 2, 4, 5, 7, 10], keep: [1, 2, 4, 5, 7, 10], q: [0, 1, 3, 4, 6, 9] },
  'sun-cloze':  { s: [0, 1, 2, 3, 5, 6, 10], keep: [1, 2, 3, 5, 6, 10], q: [0, 1, 2, 4, 5, 9] },
  'w2-thu-cloze':{ s: [0, 1, 2, 3, 4, 5, 10], keep: [1, 2, 3, 4, 5, 10], q: [0, 1, 2, 3, 4, 9] },
  'w2-sun-cloze':{ s: [0, 1, 2, 3, 4, 7, 10], keep: [1, 2, 3, 4, 6, 10], q: [0, 1, 2, 3, 5, 9] },
  'w3-thu-cloze':{ s: [0, 1, 2, 3, 4, 8, 9], keep: [1, 2, 3, 4, 5, 10], q: [0, 1, 2, 3, 4, 9] },
  'w3-sun-cloze':{ s: [0, 1, 4, 5, 7, 9, 11], keep: [1, 3, 4, 6, 8, 10], q: [0, 2, 3, 5, 7, 9] },
  'w4-thu-cloze':{ s: [0, 1, 2, 3, 4, 7, 10], keep: [1, 2, 3, 4, 7, 10], q: [0, 1, 2, 3, 6, 9] },
  'w4-sun-cloze':{ s: [0, 1, 2, 3, 5, 6, 13], keep: [1, 2, 3, 4, 5, 10], q: [0, 1, 2, 3, 4, 9] },
};

const cnNew = {};

weeks.forEach((week, w) => {
  // 本周的模块 id 前缀：W1 无前缀，W2 起是 w2- / w3- / w4-
  const prefix = w === 0 ? '' : 'w' + (w + 1) + '-';
  const mine = id => id.startsWith(prefix) && (prefix !== '' || !/^w\d-/.test(id));

  // ---- 阅读 ----
  Object.keys(READING).filter(mine).forEach(id => {
    const m = week.flatMap(d => d.modules).find(x => x.id === id || x.id.endsWith('-' + id));
    must(m && m.type === 'reading', '找不到阅读模块 ' + id);
    const cfg = READING[id];
    const enAll = sentsEN(m.passage);
    const cnAll = sentsCN(m.passage_cn);
    must(enAll.length === cnAll.length, id + ' 原文中英句数不一致 ' + enAll.length + '/' + cnAll.length);
    must(cfg.s.length === 6 && cfg.s.every(i => i < enAll.length), id + ' 句子下标越界');
    must(cfg.q.length === 4 && cfg.q.every(i => i < m.questions.length), id + ' 题目下标越界');
    m.passage = cfg.s.map(i => enAll[i].trim()).join(' ');
    m.passage_cn = cfg.s.map(i => cnAll[i].trim()).join('');
    m.questions = cfg.q.map(i => m.questions[i]);
  });

  // ---- 完形 ----
  Object.keys(CLOZE).filter(mine).forEach(id => {
    const m = week.flatMap(d => d.modules).find(x => x.id === id || x.id.endsWith('-' + id));
    must(m && m.type === 'cloze', '找不到完形模块 ' + id);
    const cfg = CLOZE[id];
    const oldQs = m.questions;
    must(oldQs.length === 10, id + ' 原完形不是 10 空');
    const enAll = sentsEN(m.passage);
    const cnAll = cnOld[m.id] || sentsCN(m.passage_cn || '');
    must(enAll.length === cnAll.length, id + ' 原文中英句数不一致 ' + enAll.length + '/' + cnAll.length);
    must(cfg.keep.length === 6 && cfg.q.length === 6, id + ' keep/q 必须 6 个');
    // 旧空号 → 旧题
    const oldByNum = {};
    oldQs.forEach((q, qi) => {
      const mm = String(q.question).match(/(\d+)\s*_{2,}/);
      must(mm, id + ' 题 ' + qi + ' 无空位标记');
      oldByNum[Number(mm[1])] = q;
    });
    const keepSet = new Set(cfg.keep);
    const newNumOf = {};   // 旧空号 → 新空号
    cfg.keep.forEach((oldNum, i) => { newNumOf[oldNum] = i + 1; });
    // 重建课文：保留句 + 空位重编号 / 被裁空位填原答案
    m.passage = cfg.s.map(si => {
      let sent = enAll[si].trim();
      sent = sent.replace(/(\d+)\s*_{2,}/g, (full, num) => {
        const n = Number(num);
        if (keepSet.has(n)) return newNumOf[n] + '___';
        const q = oldByNum[n];
        must(q, id + ' 句 ' + si + ' 的空 ' + n + ' 找不到原题');
        return q.options[q.answer];
      });
      return sent;
    }).join(' ');
    // 题目：保留 + 重编号 stem/id
    m.questions = cfg.q.map((qi, i) => {
      const q = JSON.parse(JSON.stringify(oldQs[qi]));
      q.question = (i + 1) + '___';
      const base = String(q.id || '').replace(/\d+$/, '');
      q.id = base + (i + 1);
      return q;
    });
    // 逐句中文：同下标保留
    cnNew[m.id] = cfg.s.map(i => cnAll[i].trim());
  });

  // ---- 普通题目模块裁剪（保留前 N 题）----
  function trimBy(mod, keep) {
    must(mod && mod.questions && mod.questions.length >= keep, mod ? (mod.id + ' 题数不足 ' + keep) : '模块缺失');
    mod.questions = mod.questions.slice(0, keep);
  }
  [0, 2, 5].forEach(di => {
    trimBy(findMod(week, di, 'mc'), 4);                       // 单项选择 5 → 4
    const t = week[di].modules.find(x => x.type === 'tense');
    if (t) week[di].modules = week[di].modules.filter(x => x !== t);   // 删时态模块
  });
  trimBy(findMod(week, 1, 'tue-choice'), 8);                  // 周二单选 10 → 8
  trimBy(week[1].modules.find(x => x.type === 'grammar'), 6); // 周二语法 10 → 6
  trimBy(week[3].modules.find(x => x.type === 'listening'), 5); // 周四听力 10 → 5
  trimBy(week[3].modules.find(x => x.type === 'tense'), 5);   // 周四时态 10 → 5
  trimBy(week[4].modules.find(x => x.type === 'ket_pet'), w < 3 ? 12 : 5); // KET 保持
  // 周五语法：W1-3 13→8（按原顺序裁）、W4 20→15。W4 的 3 道选择在原 20 题
  // 尾部，直接 slice(0,15) 会全裁掉（verify-fill-unlock 要用选择题验证跟读
  // 门槛）—— 所以 W4 保留全部选择题 + 按顺序补填空题。
  const fg = week[4].modules.find(x => x.id.endsWith('fri-grammar') || x.type === 'grammar');
  must(fg && fg.questions.length >= (w < 3 ? 8 : 15), 'fri-grammar 题数不足');
  if (w < 3) {
    fg.questions = fg.questions.slice(0, 8);
  } else {
    const wantG = 15;
    const choices = fg.questions.filter(q => Array.isArray(q.options));
    const fills = fg.questions.filter(q => !Array.isArray(q.options));
    fg.questions = choices.concat(fills).slice(0, Math.max(wantG, choices.length));
  }
  // 周日：删时态 + 语法
  week[6].modules = week[6].modules.filter(x => x.type !== 'tense' && x.type !== 'grammar');

  // 总时长 = 各模块之和
  week.forEach(d => {
    d.total_duration = d.modules.reduce((s, m) => s + (m.duration || 0), 0);
  });
});

// ---------- 校验：每天真实动作恰好 30 ----------
function unitsOf(m) {
  let n = 0;
  if (m.words) n += m.words.length;
  if (m.questions) n += m.questions.length;
  if (m.blanks) n += m.blanks.length;
  if (m.passage) n += 2 * sentsEN(m.passage).length;
  if (m.type === 'writing_template') n += sentsEN(m.full_text).length;
  return n;
}
const bad = [];
weeks.forEach((week, w) => week.forEach((d, di) => {
  const u = (d.modules || []).reduce((s, m) => s + unitsOf(m), 0);
  if (u !== 30) bad.push('W' + (w + 1) + d.day_cn + '=' + u);
}));
if (bad.length) { console.error('真实动作数不是 30：' + bad.join(' ')); process.exit(1); }

// 完形占位数 = 题数；阅读中英句数一致
weeks.forEach((week, w) => week.forEach((d, di) => (d.modules || []).forEach(m => {
  if (m.type === 'cloze') {
    const marks = (m.passage.match(/[0-9]+_{2,}/g) || []).length;
    must(marks === m.questions.length, m.id + ' 占位 ' + marks + ' != 题 ' + m.questions.length);
    must(cnNew[m.id].length === sentsEN(m.passage).length, m.id + ' 中文句数不匹配');
  }
  if (m.type === 'reading') {
    must(sentsEN(m.passage).length === sentsCN(m.passage_cn).length, m.id + ' 裁后中英句数不一致');
  }
})));

// ---------- 重写 data.js（沿用 v153/v154 的整文件重写模式） ----------
const tailStart = src.indexOf('const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];');
const clozeStart = src.indexOf('const CLOZE_SENTENCE_CN = {');
const vocabComment = src.indexOf('// ===== 词卡的中文提示');
must(tailStart >= 0 && clozeStart >= 0 && vocabComment >= 0, 'data.js 结构定位失败');
const tailBefore = src.slice(tailStart, clozeStart);
const tailAfter = src.slice(vocabComment);
const cnBlock = 'const CLOZE_SENTENCE_CN = ' + JSON.stringify(cnNew, null, 2) + ';\n\n';

const header = '// 题库数据 —— v153 生成主题，v154/v155 裁量（tools/apply-v154-trim.js / apply-v155-slim.js）。\n'
  + '// v155 口径：每天恰好 30 个真实动作 —— 读一句英语算一道、翻译一句算一道、\n'
  + '// 答一道题算一道、一个词算一道（家长 2026-10-25：让孩子 30 分钟左右做完）。\n'
  + '// 阅读/完形/写作主题 = 中国文化 · 科学技术 · 现代热点。\n'
  + '// 改题库：改 tools/v153-content-*.js 重跑 v153 脚本，再依次跑 v154/v155 脚本，最后 node tools/verify-weeks.js。\n\n';
const body = ['WEEK1', 'WEEK2', 'WEEK3', 'WEEK4']
  .map((n, i) => 'const ' + n + ' = ' + JSON.stringify(weeks[i], null, 2) + ';\n')
  .join('\n');
fs.writeFileSync(P, header + body + '\n' + tailBefore + cnBlock + tailAfter);

// ---------- 摘要 ----------
const lens = weeks.map(week => {
  const ps = week.flatMap(d => d.modules).filter(m => m.passage);
  return Math.round(ps.reduce((s, m) => s + m.passage.length, 0) / ps.length);
});
console.log('✅ v155 裁剪完成：28 天每天真实动作恰好 30 个');
console.log('每周文章平均长度：' + lens.map((l, i) => 'W' + (i + 1) + '=' + l).join(' → '));
