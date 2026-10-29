#!/usr/bin/env node
/**
 * weekpack-apply.js —— 把一个「周包」合入 public/data.js 的 HOMEWORK_WEEKS
 *
 * 用法：
 *   node tools/weekpack-apply.js w6          # 合入（幂等，重复跑结果一致）
 *   node tools/weekpack-apply.js w6 --dry    # 只校验、不写文件
 *
 * 周包目录：tools/weekpacks/<pack>/meta.json + day0.json .. day6.json
 * 周包只写「素材」，模块骨架 / id / 词汇卡 stages 由本脚本按 v155 口径生成，
 * 保证每天动作数与 W1~W5 完全一致、结构永远过 verify-weeks。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'public', 'data.js');
// v167（家长 2026-10-30）：听力题干全部改英文（「所有这样的听力的问句都给写成英文」）。
// ECHO_STEM：听原句选原句的固定题干；LISTEN_STEM_EN：其余英文听力题干前缀。
const ECHO_STEM = /^(?:which sentence do you hear|听到的句子是什么)/i;
const LISTEN_STEM_EN = /^(?:which picture matches|listen to the dialogue|listen and fill)/i;
const MOD_ORDER = ['speaking', 'vocab', 'reading', 'mc', 'grammar', 'tense', 'tense2', 'mc2', 'cloze', 'listening', 'ket_pet', 'writing', 'spell'];
const MOD_META = {
  speaking: { type: 'speaking', name_cn: 'AI口语练习', duration: 30 },
  vocab: { type: 'vocabulary_game', name_cn: '高频词汇', duration: 5 },
  reading: { type: 'reading', name_cn: '阅读理解', duration: 10 },
  mc: { type: 'multiple_choice', name_cn: '单项选择', duration: 5 },
  mc2: { type: 'multiple_choice', name_cn: '单项选择（巩固）', duration: 5 },
  grammar: { type: 'grammar', name_cn: '语法练习', duration: 10 },
  tense: { type: 'tense', name_cn: '语法练习（打字）', duration: 10 },
  tense2: { type: 'tense', name_cn: '拼写打字', duration: 10 },
  // v165（家长 2026-10-29）：键盘拼写不再集中在周四，每天 3~5 道。
  spell: { type: 'tense', name_cn: '敲键盘拼写', duration: 6 },
  cloze: { type: 'cloze', name_cn: '完形填空', duration: 10 },
  listening: { type: 'listening', name_cn: '听力练习', duration: 5 },
  ket_pet: { type: 'ket_pet', name_cn: 'KET/PET题型', duration: 10 },
  writing: { type: 'writing_template', name_cn: '写作练习', duration: 15 },
};
const D3 = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/* ---------- 确定性洗牌（同参数永远同结果，避免每次加载跳序） ---------- */
function seedOf(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}
function rng(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, seed) {
  const a = arr.slice();
  const r = rng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ---------- 词卡 stages（8 个阶段，v155 口径） ---------- */
function splitSyllables(word, given) {
  if (Array.isArray(given) && given.length && given.join('') === word) return given;
  // 兜底：按元音边界粗切两段
  const m = word.match(/^([^aeiouy]*[aeiouy]+)(.+)$/i);
  if (m && m[2]) return [m[1], m[2]];
  return [word];
}
function buildSpellFill(word) {
  const len = word.length;
  const start = Math.max(1, Math.floor(len / 2) - 1);
  const cut = Math.min(2, Math.max(1, len - 2));
  const head = word.slice(0, start);
  const tail = word.slice(start + cut);
  return { type: 'spell_fill', prompt: '补全拼写: ' + head + '__' + tail, answer: word.slice(start, start + cut) };
}
function buildStages(wd, group) {
  const others = group.filter((x) => x.word !== wd.word);
  const emojis = others.map((x) => x.emoji);
  const meanings = others.map((x) => x.meaning);
  const pick3 = (pool, seedKey) => shuffle(pool, seedOf(seedKey)).slice(0, 3);
  const mk = (type, idx) => {
    const key = wd.word + ':' + type + ':' + idx;
    const isEmoji = type === 'image_choice';
    const correct = isEmoji ? wd.emoji : wd.meaning;
    const distract = pick3(isEmoji ? emojis : meanings, key);
    const opts = shuffle([correct].concat(distract), seedOf(key + ':opt'));
    return {
      type: type,
      prompt: isEmoji ? '听发音，选图片（' + (idx + 1) + '/2）' : wd.word + ' 是什么意思？（' + (idx + 1) + '/2）',
      options: opts,
      answer: opts.indexOf(correct),
    };
  };
  return [
    { type: 'learn', instruction: '看图学单词' },
    mk('image_choice', 0),
    mk('image_choice', 1),
    mk('meaning_choice', 0),
    mk('meaning_choice', 1),
    { type: 'letter_read', prompt: '跟读字母（每个字母读两遍）' },
    { type: 'syllable_blend', prompt: '拼合音标（每个音节读两遍）' },
    buildSpellFill(wd.word),
  ];
}

/* ---------- 把一周素材展开成完整 week 结构 ---------- */
function buildWeek(pack, meta) {
  const p = meta.id; // w6
  const days = pack.map((day, di) => {
    const d3 = D3[di];
    const prefix = p + '-' + d3;
    const modules = [];
    MOD_ORDER.forEach((key) => {
      const src = day[key];
      if (!src) return;
      const mm = MOD_META[key];
      const idKey = key === 'mc2' ? 'choice2' : (key === 'tense2' ? 'spell' : (key === 'spell' ? 'kb' : key));
      const base = { id: prefix + '-' + idKey, name_cn: day[key + '_name'] || mm.name_cn, type: mm.type, duration: mm.duration };
      // v165：标出「敲键盘」的模块，好让校验器按天统计拼写题（不再堆在同一天）
      if (key === 'spell' || key === 'tense' || key === 'tense2') base.skill = 'keyboard';

      if (key === 'vocab') {
        const words = src.map((wd, wi) => {
          const w = {
            word: wd.word,
            phonetic: wd.phonetic,
            meaning: wd.meaning,
            emoji: wd.emoji,
            example_en: wd.example_en,
            example_cn: wd.example_cn,
          };
          w.stages = buildStages(wd, src);
          w.letters = wd.word.split('');
          w.syllables = splitSyllables(wd.word, wd.syllables);
          w.hint_cn = wd.hint_cn;
          if (wd.image_note) w.image_note = wd.image_note;
          return w;
        });
        base.words = words;
        modules.push(base);
        return;
      }
      if (key === 'writing') {
        const w = src;
        base.title = w.title;
        base.requirement_cn = w.requirement_cn || '请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！';
        base.keywords = w.keywords;
        base.keywords_cn = w.keywords_cn;
        base.template = w.template;
        base.blanks = w.keywords.map((kw, i) => ({
          id: i + 1,
          hint_cn: w.keywords_cn[i],
          hint_en: kw,
          answer: kw,
        }));
        base.full_text = w.template.replace(/\{\{(\d+)\}\}/g, (m, n) => w.keywords[Number(n) - 1]);
        base.full_text_cn = w.full_text_cn;
        base.explanation_cn = w.explanation_cn;
        base.explanation_en = w.explanation_en;
        modules.push(base);
        return;
      }
      if (key === 'reading' || key === 'cloze') {
        base.passage = src.passage;
        if (src.passage_cn) base.passage_cn = src.passage_cn;
        base.questions = src.questions.map((q, qi) => {
          const o = {
            id: prefix + '-' + (key === 'reading' ? 'rd' : 'cz') + (qi + 1),
            type: q.type || 'choice',
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation_cn: q.explanation_cn,
          };
          if (q.explanation_en) o.explanation_en = q.explanation_en;
          return o;
        });
        modules.push(base);
        return;
      }
      // speaking / mc / grammar / tense / listening / ket_pet
      const short = { speaking: 'sp', mc: 'mc', mc2: 'mcq', grammar: 'gr', tense: 'tn', tense2: 'ten', listening: 'ls', ket_pet: 'kp', spell: 'kb' }[key];
      base.questions = src.map((q, qi) => {
        const defType = (key === 'tense' || key === 'tense2' || key === 'spell') ? 'fill' : 'choice';
        const o = { id: prefix + '-' + short + (qi + 1), type: q.type || defType };
        if (key === 'speaking') {
          o.sentence = q.sentence;
          o.sentence_cn = q.sentence_cn;
        } else {
          o.question = q.question;
        }
        if (q.audio_text) o.audio_text = q.audio_text;
        if (q.options) o.options = q.options;
        // v165：听力「听句子选图片」，选项是 emoji，前端排成 2×2 大图
        if (q.picture_options) o.picture_options = true;
        if (q.answer !== undefined) o.answer = q.answer;
        if (q.pronunciation_tips) o.pronunciation_tips = q.pronunciation_tips;
        if (q.explanation_cn) o.explanation_cn = q.explanation_cn;
        if (q.explanation_en) o.explanation_en = q.explanation_en;
        if (key === 'speaking') {
          o.answer_cn_hint = q.answer_cn_hint;
          o.options_cn = q.options_cn;
        }
        return o;
      });
      modules.push(base);
    });
    const d = {
      day_cn: day.day_cn,
      day_en: day.day_en,
      is_speaking_day: !!day.speaking,
      total_duration: modules.reduce((a, m) => a + (m.duration || 0), 0),
      theme_cn: day.theme_cn,
      modules: modules,
    };
    return d;
  });
  return { id: meta.id, varName: 'WEEK' + meta.week, days: days };
}

/* ---------- 校验 ---------- */
function validate(week, meta, allWeeks) {
  const errs = [];
  const ids = new Set();
  const qtexts = new Map(); // text -> week label
  const words = new Map();
  // v165：跨周查重只对 W1~W4（完整独立命题的周）强制，W5 起内容允许承接，
  // 新周（W6+）是全新题材、不必与过去逐字避让 —— 与 verify-weeks 口径一致。
  allWeeks.forEach((item) => {
    const wk = item.w || item, wi = (typeof item.i === 'number') ? item.i : -1;
    if (wi >= 4) return;
    (wk || []).forEach((d) =>
      (d.modules || []).forEach((m) => {
        (m.questions || []).forEach((q) => {
          const t = String(q.sentence || q.question || '').trim();
          if (!t || /^\d+___$/.test(t) || ECHO_STEM.test(t)) return;
          const key = t.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90);
          if (key) qtexts.set(key, 'W' + (wi + 1));
        });
        (m.words || []).forEach((w) => words.set(String(w.word).toLowerCase(), 'W' + (wi + 1)));
      })
    );
  });

  if (week.days.length !== 7) errs.push('必须 7 天，实际 ' + week.days.length);
  week.days.forEach((d, di) => {
    const tag = 'day' + di + '(' + d.day_cn + ')';
    if (!d.day_cn || !d.day_en) errs.push(tag + ' 缺 day_cn/day_en');
    if (!Array.isArray(d.modules) || d.modules.length < 2) errs.push(tag + ' 模块数异常');
    // 每天真实动作数（v155 口径）：词 + 题 + 空 + 课文句×2 + 作文句
    let units = 0;
    d.modules.forEach((m) => {
      const enS = m.passage ? (String(m.passage).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0;
      units += (m.words ? m.words.length : 0) + (m.questions ? m.questions.length : 0) +
        (m.blanks ? m.blanks.length : 0) + (m.passage ? 2 * enS : 0) +
        (m.type === 'writing_template' ? (String(m.full_text || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0);
    });
    if (units !== 30) errs.push(tag + ' 真实动作必须 30，实际 ' + units);
    // v165（家长 2026-10-29）：「敲键盘的拼写题不要在同一天，分布到每一天」
    // 每天 3~6 道：少于 3 道等于这天没练打字，多于 6 道又变成一天猛敲。
    let kb = 0;
    d.modules.forEach((m) => { if (m.skill === 'keyboard') kb += (m.questions || []).length; });
    if (kb < 3 || kb > 6) errs.push(tag + ' 键盘拼写题必须 3~6 道，实际 ' + kb);
    // 听力题型至少 2 种：不许一整套全是「听原句选原句」
    const lm = d.modules.filter((m) => m.type === 'listening');
    lm.forEach((m) => {
      const kinds = new Set();
      (m.questions || []).forEach((q) => {
        if (q.picture_options) kinds.add('选图');
        else if (q.type === 'fill') kinds.add('听写填空');
        else if (ECHO_STEM.test(String(q.question || ''))) kinds.add('复述');
        else kinds.add('问答');
      });
      if (kinds.size < 2) errs.push(tag + '/listening 题型至少 2 种，实际只有 ' + [...kinds].join('/'));
    });
    d.modules.forEach((m) => {
      const mt = tag + '/' + m.type;
      if (!m.id || ids.has(m.id)) errs.push(mt + ' 模块 id 重复或缺失: ' + m.id);
      ids.add(m.id);
      if (m.type === 'vocabulary_game') {
        if (m.words.length !== 5) errs.push(mt + ' 词汇必须 5 个，实际 ' + m.words.length);
        m.words.forEach((w) => {
          const wt = mt + '/' + w.word;
          ['word', 'phonetic', 'meaning', 'emoji', 'example_en', 'example_cn', 'hint_cn'].forEach((k) => {
            if (!w[k]) errs.push(wt + ' 缺 ' + k);
          });
          if (w.stages.length !== 8) errs.push(wt + ' stages 必须 8 个');
          if (w.letters.join('') !== w.word) errs.push(wt + ' letters 与单词不符');
          const sf = w.stages.filter((s) => s.type === 'spell_fill')[0];
          if (!sf) errs.push(wt + ' 缺 spell_fill');
          else {
            const blanks = (sf.prompt.match(/_{2,}/g) || []).length;
            const bare = sf.prompt.replace(/^补全拼写[:：]\s*/, '');
            const chunk = sf.answer.length / blanks;
            if (!Number.isInteger(chunk)) errs.push(wt + ' 答案长度不能均分');
            let used = 0;
            const rebuilt = bare.replace(/_{2,}/g, () => sf.answer.substr(used++ * chunk, chunk));
            if (rebuilt !== w.word) errs.push(wt + ' 拼写补全拼不回: ' + sf.prompt + ' → ' + rebuilt);
          }
          w.stages.forEach((s) => {
            if (s.type === 'image_choice' || s.type === 'meaning_choice') {
              if (!s.options || s.options.length !== 4) errs.push(wt + ' 选项不是 4 个');
              else if (s.answer < 0 || s.answer >= 4) errs.push(wt + ' answer 越界');
              else if (s.options.indexOf(s.options[s.answer]) !== s.answer) errs.push(wt + ' answer 异常');
            }
          });
          const wk = words.get(String(w.word).toLowerCase());
          if (wk) errs.push(wt + ' 单词与 ' + wk + ' 重复');
        });
      }
      if (m.type === 'multiple_choice' || m.type === 'grammar' || m.type === 'tense' || m.type === 'ket_pet' || m.type === 'listening' || m.type === 'speaking' || m.type === 'reading' || m.type === 'cloze') {
        if (!m.questions || m.questions.length < 3) errs.push(mt + ' 题目数 < 3');
        (m.questions || []).forEach((q) => {
          const qt = mt + '/' + q.id;
          if (!q.id || ids.has(q.id)) errs.push(qt + ' 题目 id 重复或缺失');
          ids.add(q.id);
          if (!q.explanation_cn && !q.explanation_en) errs.push(qt + ' 缺解析');
          const stem = q.question || q.sentence || '';
          if (!stem) errs.push(qt + ' 缺题干');
          // 与 verify-weeks 一致：完形 N___ 题干、听力固定题干不参与查重
          const isClozeStem = /^\d+___$/.test(String(stem).trim());
          const isListenStem = ECHO_STEM.test(String(stem)) || LISTEN_STEM_EN.test(String(stem));
          if (stem && !isClozeStem && !isListenStem) {
            const key = String(stem).toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 90);
            const dup = key && qtexts.get(key);
            if (dup) errs.push(qt + ' 题干与 ' + dup + ' 重复: ' + String(stem).slice(0, 50));
          }
          if (q.type === 'choice') {
            if (!q.options || q.options.length !== 4) errs.push(qt + ' 选项必须 4 个');
            else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errs.push(qt + ' answer 越界');
            else q.options.forEach((o) => { if (!String(o).trim()) errs.push(qt + ' 有空选项'); });
          } else if (q.type === 'fill') {
            if (!String(q.answer || '').trim()) errs.push(qt + ' fill 缺答案');
          }
          if (m.type === 'listening') {
            if (!q.audio_text) errs.push(qt + ' 听力缺 audio_text');
            // v165（家长 2026-10-29）：听力不再只有「听原句、选一模一样的原句」
            // 这一种。复述题才要求正确项逐字等于 audio_text；问答 / 选图 /
            // 听写填空各有各的正确项，一刀切会把新题型全判成错。
            const isEcho = ECHO_STEM.test(String(q.question || ''));
            if (isEcho && q.options && q.options[q.answer] !== q.audio_text) errs.push(qt + ' 复述题正确项必须等于 audio_text');
            if (q.picture_options && (!q.options || q.options.length !== 4)) errs.push(qt + ' 选图题必须 4 个图片选项');
            if (q.type === 'fill' && !String(q.answer || '').trim()) errs.push(qt + ' 听力填空缺答案');
            if (!q.options && q.type !== 'fill') errs.push(qt + ' 听力题既无选项也非填空');
          }
        });
      }
      if (m.type === 'reading' || m.type === 'cloze') {
        const enS = (String(m.passage || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
        if (!m.passage || m.passage.length <= 80) errs.push(mt + ' 文章过短');
        if (m.type === 'reading' && enS !== 6) errs.push(mt + ' 阅读课文必须 6 句，实际 ' + enS);
        if (m.type === 'cloze' && enS !== 7) errs.push(mt + ' 完形课文必须 7 句，实际 ' + enS);
        if (m.type === 'cloze') {
          const marks = (m.passage.match(/\d+___/g) || []).length;
          if (marks !== m.questions.length) errs.push(mt + ' 占位 ' + marks + ' 个 != 题目 ' + m.questions.length + ' 个');
          m.questions.forEach((q, i) => {
            if (!new RegExp('(^|\\s)' + (i + 1) + '___').test(m.passage)) errs.push(mt + ' 文章缺 ' + (i + 1) + '___');
          });
        }
      }
      if (m.type === 'reading' && !m.passage_cn) errs.push(mt + ' 缺 passage_cn');
      if (m.type === 'writing_template') {
        if ((m.keywords || []).length !== 5 || (m.blanks || []).length !== 5) errs.push(mt + ' 关键词/空必须 5 个');
        m.blanks.forEach((b) => {
          if (!b.answer) errs.push(mt + ' 空 ' + b.id + ' 缺答案');
          if (m.template.indexOf('{{' + b.id + '}}') < 0) errs.push(mt + ' 模板缺 {{' + b.id + '}}');
          const kw = m.keywords[b.id - 1];
          if (String(kw).toLowerCase() !== String(b.answer).toLowerCase()) errs.push(mt + ' 关键词与答案不一致: ' + kw + ' vs ' + b.answer);
        });
        const rebuilt = m.template.replace(/\{\{(\d+)\}\}/g, (x, n) => m.blanks[Number(n) - 1].answer);
        if (rebuilt.toLowerCase() !== String(m.full_text).toLowerCase()) errs.push(mt + ' full_text 与模板+答案不一致');
        if (!m.full_text_cn) errs.push(mt + ' 缺 full_text_cn');
      }
      if (m.type === 'speaking' && m.questions.length !== 5) errs.push(mt + ' 口语必须 5 题');
    });
  });
  return errs;
}

/* ---------- 完形逐句译文表（CLOZE_SENTENCE_CN） ---------- */
function injectClozeCn(src, pairs) {
  if (!pairs.length) return src;
  let body = '';
  pairs.forEach(([id, arr]) => {
    body += '  ' + JSON.stringify(id) + ': ' + JSON.stringify(arr) + ',\n';
  });
  const at = src.indexOf('const CLOZE_SENTENCE_CN = {');
  if (at < 0) throw new Error('找不到 CLOZE_SENTENCE_CN');
  let head = src.slice(0, at + 'const CLOZE_SENTENCE_CN = {\n'.length);
  let tail = src.slice(at + 'const CLOZE_SENTENCE_CN = {\n'.length);
  // 删掉同 id 的旧行（幂等）
  pairs.forEach(([id]) => {
    const re = new RegExp('^  "?' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"?\\s*:[^\\n]*\\n', 'm');
    tail = tail.replace(re, '');
  });
  return head + body + tail;
}

/* ---------- 写回 data.js ---------- */
function inject(src, varName, days) {
  const json = JSON.stringify(days);
  const decl = 'const ' + varName + ' = ' + json + ';\n';
  // 1) 已存在：替换整行声明
  const re = new RegExp('const ' + varName + ' = [\\s\\S]*?;\\n(?=const |\\n|$)', 'm');
  if (new RegExp('(^|\\n)const ' + varName + ' = ').test(src)) {
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('const ' + varName + ' = ') === 0) {
        let j = i;
        while (j < lines.length && lines[j].trim().slice(-1) !== ';') j++;
        lines.splice(i, j - i + 1, decl.replace(/\n$/, ''));
        break;
      }
    }
    src = lines.join('\n');
  } else {
    const at = src.indexOf('const HOMEWORK_WEEKS = [');
    if (at < 0) throw new Error('找不到 HOMEWORK_WEEKS 定义');
    src = src.slice(0, at) + decl + src.slice(at);
  }
  // 2) 重建 HOMEWORK_WEEKS 数组
  const m = src.match(/const HOMEWORK_WEEKS = \[([^\]]*)\];/);
  if (!m) throw new Error('HOMEWORK_WEEKS 格式不认识');
  const names = m[1].split(',').map((s) => s.trim()).filter(Boolean);
  if (names.indexOf(varName) < 0) names.push(varName);
  names.sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')));
  src = src.replace(/const HOMEWORK_WEEKS = \[[^\]]*\];/, 'const HOMEWORK_WEEKS = [' + names.join(', ') + '];');
  return src;
}

/* ---------- main ---------- */
function main() {
  const args = process.argv.slice(2);
  const packId = args.filter((a) => !a.startsWith('--'))[0];
  const dry = args.indexOf('--dry') >= 0;
  if (!packId) {
    console.error('用法: node tools/weekpack-apply.js <w6> [--dry]');
    process.exit(2);
  }
  const dir = path.join(ROOT, 'tools', 'weekpacks', packId);
  if (!fs.existsSync(dir)) {
    console.error('周包不存在: ' + dir);
    process.exit(2);
  }
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const pack = [];
  for (let i = 0; i < 7; i++) {
    const f = path.join(dir, 'day' + i + '.json');
    if (!fs.existsSync(f)) {
      console.error('缺 ' + f);
      process.exit(2);
    }
    pack.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }

  const week = buildWeek(pack, meta);

  // 现有周（用于跨周查重）
  const vm = require('vm');
  const sb = { window: {}, self: {}, console };
  vm.createContext(sb);
  const src = fs.readFileSync(DATA, 'utf8');
  let existing = [];
  try {
    vm.runInContext(src + ';globalThis.__D={weeks:HOMEWORK_WEEKS};', sb);
    existing = sb.__D.weeks.slice();
  } catch (e) {
    console.error('解析 data.js 失败: ' + e.message);
    process.exit(2);
  }
  const targetIdx = meta.week - 1;
  const others = existing.map((w, i) => ({ w: w, i: i })).filter((x) => x.i !== targetIdx);

  const errs = validate(week, meta, others);
  if (errs.length) {
    console.error('❌ 校验失败 ' + errs.length + ' 项：');
    errs.slice(0, 40).forEach((e) => console.error('   - ' + e));
    process.exit(1);
  }

  const counts = week.days.map((d) => d.modules.reduce((a, m) => a + (m.questions || m.words || []).length, 0));
  console.log('✅ 校验通过 ' + packId + ' → ' + week.varName);
  console.log('   每天条目数: ' + counts.join(' / ') + '（合计 ' + counts.reduce((a, b) => a + b, 0) + '）');
  console.log('   每天时长: ' + week.days.map((d) => d.total_duration + 'min').join(' / '));

  if (dry) {
    console.log('（--dry 未写入）');
    return;
  }
  const out0 = inject(src, week.varName, week.days);
  // 完形逐句译文表
  const pair = [];
  pack.forEach((day, di) => {
    if (day.cloze && Array.isArray(day.cloze.sentences_cn)) {
      const mid = meta.id + '-' + D3[di] + '-cloze';
      const enSents = String(day.cloze.passage || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [];
     if (enSents.length !== day.cloze.sentences_cn.length) {
        console.error('❌ ' + mid + ' 英文 ' + enSents.length + ' 句 / 译文 ' + day.cloze.sentences_cn.length + ' 句 不一致');
        process.exit(1);
      }
      pair.push([mid, day.cloze.sentences_cn]);
    }
  });
  const out = injectClozeCn(out0, pair);
  fs.writeFileSync(DATA, out);
  console.log('✅ 已写入 public/data.js（' + week.varName + '，HOMEWORK_WEEKS 已更新' + (pair.length ? '，完形译文表 ×' + pair.length : '') + '）');
}

if (require.main === module) main();
module.exports = { buildWeek, validate, inject };
