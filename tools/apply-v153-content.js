// v153：题库大改版
//   1) 每天题量统一为 30 道（家长 2026-10-25：「每天的练习题不超过30道，
//      每天都30道，试一下」）。口语恒 5 题、词汇恒 5 词（verify-weeks 硬约束，
//      不动），其余模块扩量/新增模块补到 30。
//   2) 所有阅读理解、完形填空、写作题全部改成三个方向：中国文化、科学技术、
//      现代热点（家长 2026-10-25 原话）。
//      W1=中国文化  W2=科学技术  W3=现代热点  W4=综合（文章最长）
// 用法：node tools/apply-v153-content.js
const fs = require('fs');
const path = require('path');
const R = __dirname;
const P = path.join(R, '..', 'public', 'data.js');
const src = fs.readFileSync(P, 'utf8');

// ---------- 1. 载入现有题库（深拷贝，原地改） ----------
const fn = new Function(src + '; return { WEEKS: HOMEWORK_WEEKS };');
const weeks = JSON.parse(JSON.stringify(fn().WEEKS));
if (weeks.length !== 4) { console.error('周数异常'); process.exit(1); }

// ---------- 2. 内容 ----------
const w12 = require(path.join(R, 'v153-content-w12.js'))();
const w34 = require(path.join(R, 'v153-content-w34.js'))();
const weekContent = [w12.w1, w12.w2, w34.w3, w34.w4];
const PREFIX = ['', 'w2-', 'w3-', 'w4-'];
const DAYI = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
let nq = 0;

// ---------- 3. 题目构建 ----------
const C = (id, q) => {
  nq++;
  return { id: id, type: 'choice', question: q[0], options: [q[1], q[2], q[3], q[4]],
           answer: q[5], explanation_cn: q[6] };
};
const F = (id, stem, ans, cn) => { nq++; return { id: id, type: 'fill', question: stem, answer: ans, explanation_cn: cn }; };
const L = (id, q) => {   // 听力：q = [audio_text, [4 选项], ans, cn]
  nq++;
  return { id: id, type: 'choice', question: '听到的句子是什么？', audio_text: q[0],
           options: q[1], answer: q[2], explanation_cn: q[3] };
};
// 模块 id → 题目 id：w2-tue-choice → w2-tue-mc3；tue-choice → tue-mc3
function qid(modId, tag, n) {
  const parts = modId.split('-');
  const p = /^w\d$/.test(parts[0]) ? parts.shift() + '-' : '';
  return p + tag + n;
}
function findMod(week, di, idSuffix) {
  const m = week[di].modules.find(x => x.id === idSuffix || x.id.endsWith('-' + idSuffix));
  if (!m) { console.error('找不到模块 ' + idSuffix); process.exit(1); }
  return m;
}
function insertAfterMod(week, di, idSuffix, newMod) {
  const mods = week[di].modules;
  const i = mods.findIndex(x => x.id === idSuffix || x.id.endsWith('-' + idSuffix));
  if (i < 0) { console.error('插入锚点找不到 ' + idSuffix); process.exit(1); }
  mods.splice(i + 1, 0, newMod);
}

// ---------- 4. 按周套内容 ----------
weekContent.forEach((wc, w) => {
  const week = weeks[w];
  const pid = PREFIX[w];

  // ---- 阅读（mon/tue/wed/sat）：换主题 + 每篇 10 题 ----
  ['mon', 'tue', 'wed', 'sat'].forEach(day => {
    const m = findMod(week, DAYI[day], day + '-reading');
    m.passage = wc.reading[day][0];
    m.passage_cn = wc.reading[day][1];
    m.questions = wc.reading[day][2].map((q, i) => C(qid(m.id, day + '-rd', i + 1), q));
    m.duration = 10;
  });

  // ---- 新增单项选择（mon/wed/sat）：10 题，插在阅读后面 ----
  ['mon', 'wed', 'sat'].forEach(day => {
    const id = pid + day + '-mc';
    insertAfterMod(week, DAYI[day], day + '-reading', {
      id: id, name_cn: '单项选择', type: 'multiple_choice', duration: 10,
      questions: wc.mc[day].map((q, i) => C(id + (i + 1), q)),
    });
    // 再补一个 5 题的时态小模块（词汇的 5 个词不计入题数，这里补齐到 30）
    insertAfterMod(week, DAYI[day], day + '-mc', {
      id: pid + day + '-tense2', name_cn: '时态练习', type: 'tense', duration: 5,
      questions: wc.tense5[day].map((q, i) =>
        F(pid + day + '-tn2' + (i + 1), q[0] + ' [填入正确形式]', q[1], q[2])),
    });
  });

  // ---- 周二：单项选择 5→10、语法 5→10 ----
  {
    const mc = findMod(week, 1, 'tue-choice');
    mc.questions = wc.tueMc.map((q, i) => C(qid(mc.id, 'tue-mc', i + 1), q));
    mc.duration = 10;
    const g = findMod(week, 1, 'tue-grammar');
    g.questions = wc.tueGrammar.map((q, i) => C(qid(g.id, 'tue-gr', i + 1), q));
    g.duration = 10;
  }

  // ---- 周四：听力 10、完形 10、时态 10 ----
  {
    const ls = findMod(week, 3, 'thu-listening');
    ls.questions = wc.thuListening.map((q, i) => L(qid(ls.id, 'thu-ls', i + 1), q));
    ls.duration = 10;
    const cz = findMod(week, 3, 'thu-cloze');
    cz.passage = wc.thuCloze[0];
    cz.questions = wc.thuCloze[1].map((q, i) => C(qid(cz.id, 'thu-cz', i + 1), [(i + 1) + '___'].concat(q)));
    cz.duration = 10;
    const tn = findMod(week, 3, 'thu-tense');
    tn.questions = wc.thuTense.map((q, i) => F(qid(tn.id, 'thu-tn', i + 1), q[0] + ' [填入正确形式]', q[1], q[2]));
    tn.duration = 10;
  }

  // ---- 周五：KET 12（W4 保留原 5 题）、语法 13（W4 保留家长点名的 20 道）、写作换主题 ----
  {
    const ket = findMod(week, 4, 'fri-ket');
    if (w < 3) {
      ket.questions = wc.ket.map((q, i) => C(qid(ket.id, 'fri-kp', i + 1), q));
      ket.duration = 12;
    }
    const g = findMod(week, 4, 'fri-grammar');
    if (wc.friGrammar) {
      g.questions = wc.friGrammar.map((q, i) => C(qid(g.id, 'fri-gr', i + 1), q));
      g.duration = 13;
    } else {
      // W4：v149 家长点名的 35 道语法题裁到 20（30 = 写作5 + 语法20 + KET5）
      g.questions = g.questions.slice(0, 20);
      g.duration = 20;
    }
    if (wc.friWriting) {
      const wr = findMod(week, 4, 'fri-writing');
      wr.title = wc.friWriting.title;
      wr.requirement_cn = wc.friWriting.req || wr.requirement_cn;
      wr.keywords = wc.friWriting.kw;
      wr.keywords_cn = wc.friWriting.kwCn;
      wr.template = wc.friWriting.tpl;
      wr.blanks = wc.friWriting.kw.map((k, i) => ({ id: i + 1, hint_cn: wc.friWriting.kwCn[i], hint_en: k, answer: k }));
      wr.full_text = wc.friWriting.tpl.replace(/\{\{(\d)\}\}/g, (_, n) => wc.friWriting.kw[parseInt(n, 10) - 1]);
      wr.full_text_cn = wc.friWriting.fullCn;
      wr.explanation_cn = wc.friWriting.cn;
    }
  }

  // ---- 周日：完形 10、新增时态 10 + 语法 5 + 听力 5 ----
  {
    const cz = findMod(week, 6, 'sun-cloze');
    cz.passage = wc.sunCloze[0];
    cz.questions = wc.sunCloze[1].map((q, i) => C(qid(cz.id, 'sun-cz', i + 1), [(i + 1) + '___'].concat(q)));
    cz.duration = 10;
    insertAfterMod(week, 6, 'sun-cloze', {
      id: pid + 'sun-tense', name_cn: '时态练习', type: 'tense', duration: 10,
      questions: wc.sunTense.map((q, i) => F(pid + 'sun-tn' + (i + 1), q[0] + ' [填入正确形式]', q[1], q[2])),
    });
    insertAfterMod(week, 6, 'sun-tense', {
      id: pid + 'sun-grammar', name_cn: '语法练习', type: 'grammar', duration: 5,
      questions: wc.sunGrammar.map((q, i) => C(pid + 'sun-gr' + (i + 1), q)),
    });
    insertAfterMod(week, 6, 'sun-grammar', {
      id: pid + 'sun-listening', name_cn: '听力练习', type: 'listening', duration: 5,
      questions: wc.sunListening.map((q, i) => L(pid + 'sun-ls' + (i + 1), q)),
    });
  }

  // ---- 每天总时长 = 各模块之和 ----
  week.forEach(d => {
    d.total_duration = d.modules.reduce((s, m) => s + (m.duration || 0), 0);
  });
});

// ---------- 5. 重写 CLOZE_SENTENCE_CN（完形逐句译文，句数必须对上） ----------
function splitSentences(text) {
  return String(text || '').replace(/\s+/g, ' ')
    .split(/(?<=[.!?]["']?)\s+(?=[A-Z0-9"“'])/)
    .map(x => x.trim()).filter(x => x.length > 1);
}
const clozeCn = {};
weekContent.forEach((wc, w) => {
  [['thu', 3], ['sun', 6]].forEach(([d, di]) => {
    const mod = weeks[w][di].modules.find(m => m.id === PREFIX[w] + d + '-cloze');
    const cn = wc[d + 'ClozeCn'];
    if (splitSentences(mod.passage).length !== cn.length) {
      console.error(mod.id + ' 译文句数不符 en=' + splitSentences(mod.passage).length + ' cn=' + cn.length);
      process.exit(1);
    }
    clozeCn[mod.id] = cn;
  });
});
const clozeCnJs = 'const CLOZE_SENTENCE_CN = ' + JSON.stringify(clozeCn, null, 2) + ';\n';

// ---------- 6. 重写 data.js ----------
const tailStart = src.indexOf('const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];');
const clozeStart = src.indexOf('const CLOZE_SENTENCE_CN = {');
const vocabComment = src.indexOf('// ===== 词卡的中文提示');
if (tailStart < 0 || clozeStart < 0 || vocabComment < 0) { console.error('data.js 结构定位失败'); process.exit(1); }
const tail = src.slice(tailStart, clozeStart) + clozeCnJs + '\n' + src.slice(vocabComment);

const header = '// 题库数据 —— v153 起由 tools/apply-v153-content.js 生成。\n'
  + '// 每天恒 30 道；阅读/完形/写作主题 = 中国文化 · 科学技术 · 现代热点。\n'
  + '// 改题库：改 tools/v153-content-*.js 后重跑该脚本，再跑 node tools/verify-weeks.js。\n\n';
const body = ['WEEK1', 'WEEK2', 'WEEK3', 'WEEK4']
  .map((n, i) => 'const ' + n + ' = ' + JSON.stringify(weeks[i], null, 2) + ';\n')
  .join('\n');
fs.writeFileSync(P, header + body + '\n' + tail);

console.log('完成：新增/替换题目 ' + nq + ' 道');
weeks.forEach((w, i) => {
  w.forEach(d => {
    let n = 0;
    d.modules.forEach(m => { if (m.questions) n += m.questions.length; if (m.blanks) n += m.blanks.length; });
    console.log('W' + (i + 1) + ' ' + d.day_cn + ' 题数=' + n + ' 时长=' + d.total_duration);
  });
});
