// tools/verify-v193.js —— 短语密度 + 点词本地化
// 家长 2026-11-11：① 每个句子尽量标出 3~6 个常见短语 ② 点词解释不许再等网络
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const api = fs.readFileSync(path.join(ROOT, 'public/api.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const data = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
let pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }

// ---- 把 api.js 里的 LOCAL_DICT + WordHelp 单独跑起来 ----
const sandbox = { console, window: {}, document: {}, location: { hostname: 'amyeng.top' },
  localStorage: { getItem() { return null; }, setItem() {} }, fetch() {}, setTimeout, clearTimeout };
vm.createContext(sandbox);
// 只取 LOCAL_DICT 常量与 WordHelp 对象，避免 Api 里的全局初始化
const ldStart = api.indexOf('// ===== LOCAL_DICT BEGIN');
const ldEnd = api.indexOf('// ===== LOCAL_DICT END');
const whStart = api.indexOf('const WordHelp = {');
const whEnd = api.indexOf('\n};', whStart) + 3;
ok(ldStart > 0 && ldEnd > ldStart, 'api.js 里有 LOCAL_DICT 生成段');
ok(whStart > ldEnd, 'LOCAL_DICT 定义在 WordHelp 之前');
vm.runInContext(api.slice(ldStart, whStart) + '\n' + api.slice(whStart, whEnd)
  + '\n;this.__WH = WordHelp; this.__LD = LOCAL_DICT;', sandbox);
const WH = sandbox.__WH, LD = sandbox.__LD;

// ---- ① 本地词典覆盖 ----
const nDict = Object.keys(LD).length;
ok(nDict >= 2400, '本地词典 ≥2400 词，实得 ' + nDict);
ok(LD['large'] && /^大的/.test(LD['large']), 'large 的释义已清洗成「大的」（实得 ' + LD['large'] + '）');
ok(LD['desert'] && /沙漠/.test(LD['desert']), 'desert 的释义是「沙漠」');
ok(/Api\.dictLocal/.test(app) || /dictLocal\(word\)/.test(api), '提供同步查词入口');
ok(/this\._localDictBuild\(\)\[w\]/.test(api), 'Api.dict 仍优先查本地表');
ok(/if \(typeof LOCAL_DICT !== 'undefined' && LOCAL_DICT\)/.test(api), '_localDictBuild 合并静态词典');
ok(/const quick = quickPh \? null : \(Api\.dictLocal \? Api\.dictLocal\(word\) : null\);/.test(app),
  '点词弹层在 await 之前同步摆上中文（不再显示「正在查…」）');

// ---- ② 短语表覆盖家长点名的例子 ----
function maskOf(text, rich) {
  const toks = (text.match(/[A-Za-z][A-Za-z'\-]*/g) || []).map(w => w.toLowerCase());
  const out = [];
  let i = 0;
  while (i < toks.length) {
    const p = rich ? WH.phraseAtRich(toks, i) : WH.phraseAt(toks, i);
    if (p) { out.push({ en: p.en, zh: p.zh }); i += p.len; } else i++;
  }
  return out;
}
const sample = 'Kubuqi is a large desert in Inner Mongolia, and it is close to the Yellow River.';
const m1 = maskOf(sample, true);
console.log('  样例短语:', m1.map(x => x.en + '=' + x.zh).join(' / '));
ok(m1.some(x => /large desert/.test(x.en)), '★ 家长点名 large desert 被标出');
ok(m1.some(x => /close to/.test(x.en)), '★ 家长点名 is close to 被标出');
ok(m1.length >= 3, '这句至少 3 个短语，实得 ' + m1.length);
ok(m1.every(x => x.zh && x.zh.length <= 18), '每个短语都有短中文解释');
const m2 = maskOf('Many people plant trees in the park every spring to make the air clean.', true);
console.log('  样例2:', m2.map(x => x.en + '=' + x.zh).join(' / '));
ok(m2.length >= 3, '普通句子也能标出 ≥3 个短语，实得 ' + m2.length);

// ---- ③ 全题库覆盖率（改前后对比锚点：v193 是 23.9% / 平均 0.35）----
const ds = { console, window: {}, document: {}, localStorage: { getItem() { return null; }, setItem() {} } };
vm.createContext(ds);
vm.runInContext(data + '\n;this.__W = (typeof HOMEWORK_WEEKS !== "undefined") ? HOMEWORK_WEEKS : null;', ds);
const texts = [];
(function walk(o) {
  if (o == null) return;
  if (typeof o === 'string') { if (/[a-z]/.test(o) && !/^https?:|^data:/.test(o)) texts.push(o); return; }
  if (Array.isArray(o)) { o.forEach(walk); return; }
  if (typeof o === 'object') Object.keys(o).forEach(k => walk(o[k]));
})(ds.__W);
const sents = texts.filter(t => (t.match(/[A-Za-z]+/g) || []).length >= 3);
let withP = 0, total = 0;
sents.forEach(t => {
  const n = maskOf(t, true).length;
  if (n) withP++;
  total += n;
});
const pct = withP / sents.length * 100, avg = total / sents.length;
console.log('  全题库 ' + sents.length + ' 句：有短语 ' + withP + ' 句 (' + pct.toFixed(1) + '%)，平均 ' + avg.toFixed(2) + ' 个/句');
ok(pct >= 55, '★ 覆盖率从 23.9% 提到 ≥55%，实得 ' + pct.toFixed(1) + '%');
ok(avg >= 1.2, '★ 平均短语数从 0.35 提到 ≥1.2，实得 ' + avg.toFixed(2));

// ---- ④ 点短语能查到中文 ----
ok(WH.phraseInfo('large desert') && /沙漠/.test(WH.phraseInfo('large desert').zh), '点 large desert 出中文');
ok(WH.phraseInfo('is close to') && /靠近/.test(WH.phraseInfo('is close to').zh), '点 is close to 出中文');
const c = WH.collocAt('in the desert'.split(' '), 0);
ok(c && c.zh && /沙漠/.test(c.zh), '规则短语 in the desert 自动拼中文（' + (c && c.zh) + '）');

// ---- ⑤ 排版与版本 ----
ok(/_phraseMask\(words, true\)/.test(app), '阅读材料/作文启用规则搭配');
ok(/const pick = rich \? 'phraseAtRich' : 'phraseAt';/.test(app), '跟读判分句仍只用手写表（不切碎词盒）');
ok(/\.lk-phrase\{border-bottom:2px solid/.test(html), '短语横线改成粗实线，跟单词虚线区分');
ok((html.match(/\?v=202/g) || []).length === 7, 'index.html 七处 ?v=202（v195 保留 game.js）', (html.match(/\?v=202/g) || []).length);
ok(html.includes('app-version" content="202"'), 'index.html app-version=192');
ok(/var CACHE_NAME = 'amy-english-v202';/.test(fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8')), 'sw.js CACHE_NAME v193');

console.log(fail ? '✗ ' + fail + ' 项失败 / ' + (pass + fail) : '✅ verify-phrases 全部 ' + pass + ' 项通过');
process.exit(fail ? 1 : 0);
