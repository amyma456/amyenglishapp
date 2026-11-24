// tools/verify-speaking-phrases.js —— AI 口语练习短语（v193 → v225）
// 家长 2026-11-11 要「一句里两三个短语的提示」，v193 做了题干/选项的短语
// 横线 + 句子下面的中文提示条。家长 2026-11-25 改口径：中文提示条直接把
// 意思摆在眼前，既占地方又让孩子不用自己想，撤掉；改回「画横线、自己点，
// 点了才听到读音、才看到中文」。本脚本用**真实渲染源码**验证：横线在、
// 提示条没了、短语横线点得开、选项其余文字仍然点得动。
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const api = fs.readFileSync(path.join(ROOT, 'public/api.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const data = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
let pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }

// ---- 把 LOCAL_DICT + WordHelp 跑起来 ----
const ws = { console }; vm.createContext(ws);
const ld = api.indexOf('// ===== LOCAL_DICT BEGIN');
const whA = api.indexOf('const WordHelp = {');
const whB = api.indexOf('\n};', whA) + 3;
vm.runInContext(api.slice(ld, whA) + '\n' + api.slice(whA, whB)
  + '\n;this.WH = WordHelp;', ws);
const WH = ws.WH;
const db = {}; vm.createContext(db);
vm.runInContext(data + '\n;this.W = HOMEWORK_WEEKS;', db);

// ---- 从 app.js 里抠出真实方法（不复制实现，源码改了这里立刻会红）----
const ctx = { console, WordHelp: WH }; vm.createContext(ctx);
function grab(sig) {
  const st = app.indexOf('  ' + sig);
  if (st < 0) throw new Error('app.js 找不到方法: ' + sig);
  const en = app.indexOf('\n  },', st);
  if (en < 0) throw new Error('app.js 方法没结尾: ' + sig);
  return app.slice(st + 2, en + 5).replace(/,\s*$/, '');
}
const A = {
  state: { audioEnabled: true },
  _escHtml(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
  _notePhrases() {},
  _shuffle(a) { return a.slice(); },
  autoSpeak() {},
};
const sigs = {
  _phraseMask: '_phraseMask(words, rich) {',
  _phraseHints: '_phraseHints(text, limit) {',
  _spPhraseBar: '_spPhraseBar(text, label, limit, extraText) {',
  _wordSpans: '_wordSpans(text, plain) {',
  _getShuffledSpeakingOptions: '_getShuffledSpeakingOptions(q) {',
  renderSpeakingQuestion: 'renderSpeakingQuestion(m, mi, qi, dayIdx) {',
};
Object.keys(sigs).forEach(k => { A[k] = vm.runInContext('(function ' + grab(sigs[k]) + ')', ctx); });

// ---- ① 真实渲染：第一道口语题 ----
let mod = null;
db.W.forEach(wk => wk.forEach(d => (d.modules || []).forEach(m => {
  if (!mod && m.type === 'speaking') mod = m;
})));
ok(!!mod, '题库里有 speaking 模块');
const q = mod.questions[0];
const out = A.renderSpeakingQuestion.call(A, mod, 0, 0, 0);
console.log('  例题:', q.sentence);
ok((out.match(/lk-word lk-phrase/g) || []).length >= 2,
  '★ 题干画了 ≥2 个短语横线（以前是纯文本，一个都没有）');
ok((out.match(/class="sp-ph-bar/g) || []).length === 0,
  '★ v225：题干和每个选项下面都不再有「短语+中文」提示条');
ok(!/sp-ph-chip|📌 本句短语|短语中文/.test(out),
  '★ v225：屏幕上不再有不用点就能看到的中文释义');
ok((out.match(/class="speak-option" onclick=/g) || []).length === q.options.length,
  '四个选项的 onclick 全在，孩子仍然点得动答案');
ok(!/class="lk-word"/.test(out.split('class="speak-options"')[1] || ''),
  '★ 选项里不出现 .lk-word（点其余文字才会选答案）');
ok((out.match(/sp-opt-ph" data-phrase=/g) || []).length >= 2,
  '★ v225：选项里的短语横线带 data-phrase，点一下出整块短语的读音和中文');
ok(/closest\('\.lk-word,\.lk-phrase'\)/.test(app),
  '★ v225：点词捕获器认 .lk-phrase，选项里的短语横线点得开');

// ---- ② 全口语题库覆盖率 ----
const sents = [];
db.W.forEach(wk => wk.forEach(d => (d.modules || []).forEach(m => {
  if (m.type !== 'speaking') return;
  (m.questions || []).forEach(x => {
    sents.push({ cap: 4, t: x.sentence });
    (x.options || []).forEach(o => sents.push({ cap: 3, t: o }));
  });
})));
let sum = 0, ge2 = 0, ge3 = 0, dirty = 0;
sents.forEach(x => {
  const hs = A._phraseHints.call(A, x.t, x.cap);
  sum += hs.length;
  if (hs.length >= 2) ge2++;
  if (hs.length >= 3) ge3++;
  hs.forEach(h => {
    // 重点词 chip 是单词释义，形容词本来就写成「大的 / 英国的」，
    // 只有短语 chip 才要求不能半截挂在「…的」上。
    const bad = !h.zh || /[\[\]【】A-Za-z]/.test(h.zh)
      || (!h.word && (/的$/.test(h.zh)
        || /一个[一二三四五六七八九十百]|像游泳|毛发/.test(h.zh)));
    if (bad) {
      dirty++;
      if (dirty <= 12) console.log('    脏:', x.t, '::', h.en, '=', h.zh);
    }
  });
});
const avg = sum / sents.length, r2 = ge2 / sents.length * 100;
console.log('  口语题库', sents.length, '句 · 平均', avg.toFixed(2),
  '条/句 · ≥2 条', r2.toFixed(1) + '% · ≥3 条', (ge3 / sents.length * 100).toFixed(1) + '%',
  '· 脏中文', dirty);
ok(avg >= 2.0, '★ 平均每句 ≥2 条提示（改前 0 条：整屏没标过短语）');
ok(r2 >= 70, '★ ≥70% 的句子有 2 条以上提示');
ok(dirty === 0, '★ 提示条里没有脏中文（有道标签 / 「一个一百万」之类）');

// ---- ③ 中文质量：本轮修掉的几个具体错译 ----
const zhBad = [
  ['I like swimming.', '像游泳'],
  ['What\'s the weather like today?', '像今天'],
  ['I have a book.', '一个书'],
  ['It was rainy yesterday.', '很多雨'],
  ['What would you do if you had a million dollars?', '一个一百万'],
];
zhBad.forEach(pair => {
  const hs = A._phraseHints.call(A, pair[0], 4);
  ok(!hs.some(h => String(h.zh).indexOf(pair[1]) >= 0),
    '不再出现错译「' + pair[1] + '」（' + pair[0] + '）');
});

// ---- ④ 短语表无重复 + 样式在位 ----
const seen = {};
let dup = 0;
WH.PHRASES.forEach(p => {
  const k = p[0].toLowerCase().trim();
  if (seen[k]) dup++; else seen[k] = 1;
});
ok(dup === 0, '短语表无重复条目（实得 ' + dup + '）');
ok(/\.sp-ph-bar\{/.test(html) && /\.sp-ph-chip\{/.test(html),
  '提示条样式保留在 index.html（v225 起停用，留作回退，不渲染）');
ok(/\.sp-ph-chip\.sp-ph-word\{/.test(html), '短句兜底的重点词有区分样式');
ok(!/this\._spPhraseBar\(/.test(app),
  '★ v225：题干 / 选项 / 跟读面板都不再调用短语提示条');
ok(/_readSentenceHtml\(parts\.q\)/.test(app), '跟读判分仍用原来的逐词词盒，完全不受影响');
ok(/closest\('\.lk-word,\.lk-phrase'\)/.test(app),
  '★ v225：跟读/选项里的短语横线点一下就有读音和中文');

console.log(fail ? '✗ ' + fail + ' 项失败 / ' + (pass + fail)
  : '✅ verify-speaking-phrases 全部 ' + pass + ' 项通过');
process.exit(fail ? 1 : 0);
