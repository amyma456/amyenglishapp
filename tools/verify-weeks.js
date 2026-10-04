// tools/verify-weeks.js — 多周题库全量校验（v87 起跑这个）。
// 校验 4 周 × 7 天 × 全部模块：结构、答案范围、完形填空占位、作文模板、
// 跨周文本重复（做过的题不能再出现）。任何一项失败都退出码 1。
const fs = require('fs');
const path = require('path');

let fails = 0, total = 0;
function ok(cond, msg) {
  total++;
  if (!cond) { fails++; console.log('  FAIL', msg); }
}

const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'data.js'), 'utf8');
const fn = new Function(src + '; return {HOMEWORK_WEEKS: HOMEWORK_WEEKS, HOMEWORK_WEEK_IDX: HOMEWORK_WEEK_IDX, HOMEWORK_DATA: HOMEWORK_DATA};');
const ctx = fn();
const WEEKS = ctx.HOMEWORK_WEEKS;

ok(WEEKS.length >= 4, '至少 4 周，实际 ' + WEEKS.length);
console.log('周数:', WEEKS.length, '· 当前周索引:', ctx.HOMEWORK_WEEK_IDX, '· 本周天数:', ctx.HOMEWORK_DATA.length);

// —— 当前周是合法 7 天数组，app.js 才能零改动 ——
ok(Array.isArray(ctx.HOMEWORK_DATA) && ctx.HOMEWORK_DATA.length === 7, 'HOMEWORK_DATA 必须是 7 天数组');

const allIds = new Set();
const questionTexts = {}; // key -> week，跨周查重
const PASSAGE_STEMS = /^[0-9]___$/; // 完形填空的空位桩，各周必然相同，不查重
const LISTEN_STEMS = [/听到的句子/, /听到的数字/];

for (let w = 0; w < WEEKS.length; w++) {
  const days = WEEKS[w];
  ok(days.length === 7, 'W' + (w + 1) + ' 必须有 7 天，实际 ' + days.length);
  days.forEach((d, di) => {
    const tag = 'W' + (w + 1) + '-d' + di;
    ok(!!d.day_cn && !!d.day_en, tag + ' 缺 day_cn/day_en');
    ok(Array.isArray(d.modules) && d.modules.length >= 2, tag + ' 模块数异常');
    d.modules.forEach((m, mi) => {
      const mt = tag + '-m' + mi + '(' + m.type + ')';
      ok(!!m.id && !allIds.has(m.id), mt + ' 模块 id 缺失或重复: ' + m.id);
      if (m.id) allIds.add(m.id);

      const qs = m.questions || [];
      if (m.type !== 'vocabulary_game' && m.type !== 'writing_template') {
        ok(qs.length >= 3, mt + ' 题目数 < 3');
      }

      qs.forEach((q, qi) => {
        const qt = mt + '-q' + qi;
        ok(!!q.id && !allIds.has(q.id), qt + ' 题目 id 缺失或重复: ' + q.id);
        if (q.id) allIds.add(q.id);
        ok(!!(q.explanation_cn || q.explanation_en) || m.type === 'vocabulary_game', qt + ' 缺解析');

        if (q.options) {
          ok(Array.isArray(q.options) && q.options.length === 4, qt + ' 选项必须 4 个');
          ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, qt + ' answer 越界');
          q.options.forEach(o => ok(!!String(o).trim(), qt + ' 有空选项'));
        }
        if (q.type === 'fill' || (m.type === 'listening' && !q.options)) {
          ok(!!String(q.answer || '').trim(), qt + ' fill 题缺答案');
        }
        if (m.type === 'listening') {
          ok(!!q.audio_text, qt + ' 听力缺 audio_text');
          const stemHit = LISTEN_STEMS.some(r => r.test(q.question || ''));
          ok(stemHit || !q.options, qt + ' 听力题干异常');
        }
        if (m.type === 'cloze') {
          ok(PASSAGE_STEMS.test(q.question || ''), qt + ' 完形填空题干应为 N___');
        }
        // 跨周查重：同一道题的英文文本不该在两周里出现
        const txt = (q.question || '').trim();
        if (txt && !PASSAGE_STEMS.test(txt) && !LISTEN_STEMS.some(r => r.test(txt))) {
          const key = txt.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90);
          if (key) {
            if (questionTexts[key] !== undefined && questionTexts[key] !== w) {
              ok(false, '跨周重复题目 W' + (questionTexts[key] + 1) + ' ↔ W' + (w + 1) + ': ' + txt.slice(0, 70));
            } else {
              questionTexts[key] = w;
            }
          }
        }
      });

      if (m.type === 'vocabulary_game') {
        ok(Array.isArray(m.words) && m.words.length === 5, mt + ' 词汇必须 5 个，实际 ' + (m.words || []).length);
        (m.words || []).forEach((wd, wi) => {
          const wt = mt + '-w' + wi;
          ok(!!wd.word && !!wd.phonetic && !!wd.meaning && !!wd.emoji, wt + ' 词卡字段缺失');
          ok(Array.isArray(wd.stages) && wd.stages.length === 8, wt + ' 阶段必须 8 个，实际 ' + (wd.stages || []).length);
          ok(Array.isArray(wd.letters) && wd.letters.join('') === wd.word, wt + ' letters 与单词不符');
          ok(Array.isArray(wd.syllables) && wd.syllables.length >= 1, wt + ' 缺 syllables');
          const sf = (wd.stages || []).filter(s => s.type === 'spell_fill')[0];
          if (sf) {
            const blanks = (sf.prompt.match(/_{2,}/g) || []).length;
            ok(blanks >= 1, wt + ' 拼写补全至少 1 处空');
            ok(!!sf.answer, wt + ' 拼写补全缺答案');
            // 答案按空位均分填回（第 1 周是两处空、答案是两段拼接）
            const bare = sf.prompt.replace(/^补全拼写[:：]\s*/, '');
            const chunkLen = sf.answer.length / blanks;
            ok(Number.isInteger(chunkLen), wt + ' 答案长度必须能均分到各空');
            let rebuilt = bare, used = 0;
            rebuilt = rebuilt.replace(/_{2,}/g, () => sf.answer.substr(used++ * chunkLen, chunkLen));
            ok(rebuilt === wd.word, wt + ' 拼写补全拼不回原词: ' + sf.prompt);
          }
          (wd.stages || []).forEach(s => {
            if (s.type === 'image_choice' || s.type === 'meaning_choice') {
              ok(s.options.length === 4 && s.answer >= 0 && s.answer < 4, wt + ' 选择阶段选项异常');
            }
          });
          // 跨周查重：单词本身
          const wk = 'WORD:' + wd.word.toLowerCase();
          if (questionTexts[wk] !== undefined && questionTexts[wk] !== w) {
            ok(false, '跨周重复单词 W' + (questionTexts[wk] + 1) + ' ↔ W' + (w + 1) + ': ' + wd.word);
          } else {
            questionTexts[wk] = w;
          }
        });
      }

      if (m.type === 'cloze' || m.type === 'reading') {
        ok(!!m.passage && m.passage.length > 80, mt + ' 文章过短');
      }
      if (m.type === 'cloze') {
        // 完形填空占位符数量必须和题目数一致
        const marks = (m.passage.match(/[0-9]___/g) || []).length;
        ok(marks === qs.length, mt + ' 文章占位 ' + marks + ' 个 != 题目 ' + qs.length + ' 个');
        for (let n = 1; n <= qs.length; n++) {
          ok(m.passage.indexOf(n + '___') >= 0, mt + ' 文章缺 ' + n + '___');
        }
      }
      if (m.type === 'writing_template') {
        ok((m.keywords || []).length === 5 && (m.blanks || []).length === 5, mt + ' 关键词/空必须 5 个');
        (m.blanks || []).forEach(b => {
          ok(!!b.answer, mt + ' 空 ' + b.id + ' 缺答案');
          ok(m.template.indexOf('{{' + b.id + '}}') >= 0, mt + ' 模板缺 {{' + b.id + '}}');
          const kw = (m.keywords || [])[b.id - 1];
          ok(kw && String(kw).toLowerCase() === String(b.answer).toLowerCase(), mt + ' 关键词与答案不一致: ' + kw + ' vs ' + b.answer);
        });
        // full_text 应由模板+答案拼出（忽略首尾大小写差异，如句首 This/this）
        let t = m.template;
        (m.blanks || []).forEach(b => { t = t.split('{{' + b.id + '}}').join(b.answer); });
        ok(t.toLowerCase() === String(m.full_text).toLowerCase(), mt + ' full_text 与模板+答案不一致');
        ok(!!m.full_text_cn, mt + ' 缺 full_text_cn');
      }
      if (m.type === 'reading') {
        ok(!!m.passage_cn && m.passage_cn.length > 40, mt + ' 缺 passage_cn');
      }
      if (m.type === 'speaking') {
        ok(qs.length === 5, mt + ' 口语必须 5 题');
        qs.forEach((q, qi) => {
          ok(!!q.sentence_cn && !!q.pronunciation_tips, mt + '-q' + qi + ' 口语缺 sentence_cn/发音提示');
        });
      }
    });
  });
}

// —— 逐周难度应递增：文章长度逐周变长（均值） ——
for (let w = 1; w < WEEKS.length; w++) {
  const avg = week => {
    let n = 0, sum = 0;
    week.forEach(d => d.modules.forEach(m => {
      if (m.passage) { n++; sum += m.passage.length; }
    }));
    return n ? sum / n : 0;
  };
  const a = avg(WEEKS[w - 1]), b = avg(WEEKS[w]);
  console.log('W' + w + ' 平均文章长度 ' + Math.round(a) + ' 字符 → W' + (w + 1) + ' ' + Math.round(b) + ' 字符');
  ok(b > a * 0.98, '难度应递增：W' + (w + 1) + ' 平均文章长度不应明显低于 W' + w);
}

console.log(fails === 0 ? '✅ 全部 ' + total + ' 项通过' : '❌ ' + fails + '/' + total + ' 项失败');
process.exit(fails === 0 ? 0 : 1);
