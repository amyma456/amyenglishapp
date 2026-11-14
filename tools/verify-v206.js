/* ===========================================================================
 * v206 校验：下周完形 / 阅读「原文不动、题型换新」
 *   node tools/verify-v206.js
 *
 * 家长 2026-11-14：
 *  「下周的完形填空和阅读理解内容不变，但是题型有所变化，就是问答上面
 *    ABCD 上面是都不太一样，让学生在复习的同时能够学到新的东西。」
 *
 * 真加载 public/data.js，逐天核对：
 *   - 7 篇原文 + 中文译文的指纹一字未改（复习用的还是原来那篇）；
 *   - 32 道问答全部换成新题型，每题带可见考点徽标与「方法」解析；
 *   - ABCD 选项 4 个互不相同、32 组选项两两不重样；
 *   - 正确答案不再全压在 A：分散到 A/B/C/D，每篇至少 3 个不同位置；
 *   - 每天仍恰好 30 个真实动作；版本钉子统一 v206。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('public/index.html');
const swSrc = read('public/sw.js');
const appSrc = read('public/app.js');
const applySrc = read('tools/weekpack-apply.js');
const dataSrc = read('public/data.js');

const sb = { window: {}, self: {}, console };
vm.createContext(sb);
vm.runInContext(dataSrc +
  ';globalThis.__D={weeks:HOMEWORK_WEEKS, cn:CLOZE_SENTENCE_CN};', sb);
const W = sb.__D.weeks, CN = sb.__D.cn;

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };
const sha = s => crypto.createHash('sha256').update(String(s || '')).digest('hex').slice(0, 16);
console.log('v206 · 下周阅读 / 完形换题型校验');

// 7 篇：W7 周日完形 + W8 周一/二/三/四/六阅读 + W8 周日完形
const TARGET = [
  { key: 'w7-sun', label: '11/15 周日完形', w: 6, d: 6, kind: 'cloze', pHash: 'd83ada6b738b5f02', cHash: '30a4d8e715f5738e' },
  { key: 'w8-mon', label: '11/16 周一阅读', w: 7, d: 0, kind: 'reading', pHash: '61a4ba92ed1a6a21', cHash: 'aca4f3adf7ddce2a' },
  { key: 'w8-tue', label: '11/17 周二阅读', w: 7, d: 1, kind: 'reading', pHash: 'e572bb78849ab5f5', cHash: '49a67d9c9fb04525' },
  { key: 'w8-wed', label: '11/18 周三阅读', w: 7, d: 2, kind: 'reading', pHash: '8614bdd5d980a8a3', cHash: '56e473deded6de69' },
  { key: 'w8-thu', label: '11/19 周四阅读', w: 7, d: 3, kind: 'reading', pHash: 'd0deeea870f42379', cHash: '4de627d2c4319c69' },
  { key: 'w8-sat', label: '11/21 周六阅读', w: 7, d: 5, kind: 'reading', pHash: '0575632aca7b4504', cHash: '01176e7df0cf7911' },
  { key: 'w8-sun', label: '11/22 周日完形', w: 7, d: 6, kind: 'cloze', pHash: '9474ea7d779a5ea0', cHash: 'e5623671799175ee' },
];
const mod = (t, kind) => (W[t.w][t.d].modules || []).filter(m => m.type === kind)[0];
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

// ------------------------------------------------------------------ 原文不变
ok('7 篇完形 / 阅读的英文原文指纹一字未改（内容不变）', () => {
  TARGET.forEach(t => {
    const m = mod(t, t.kind);
    assert(m, t.label + ' 找不到模块');
    assert.strictEqual(sha(m.passage), t.pHash, t.label + ' 英文原文被改动');
  });
});
ok('7 篇中文译文 / 完形逐句译文也未改动', () => {
  TARGET.forEach(t => {
    const m = mod(t, t.kind);
    const cn = m.passage_cn || (t.kind === 'cloze' ? JSON.stringify(CN[t.key + '-cloze']) : '');
    assert.strictEqual(sha(cn), t.cHash, t.label + ' 译文被改动');
  });
});
ok('周包源文件里的 passage 与线上题库一致', () => {
  const files = { 'w7-sun': 'tools/weekpacks/w7/day6.json' };
  for (let i = 0; i < 7; i++) files['w8-' + ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i]] = 'tools/weekpacks/w8/day' + i + '.json';
  TARGET.forEach(t => {
    const src = JSON.parse(read(files[t.key]));
    const key = t.kind;
    assert.strictEqual(src[key].passage, mod(t, t.kind).passage, t.label + ' 源包与题库原文不一致');
  });
});

// ------------------------------------------------------------------ 题型换新
ok('32 道问答全部带考点标签，7 篇合计 ≥20 种不同题型', () => {
  const kinds = new Set();
  let n = 0;
  TARGET.forEach(t => {
    const m = mod(t, t.kind);
    (m.questions || []).forEach(q => {
      assert(q.qtype_cn && q.qtype_cn.length >= 2, t.label + ' 有题没写考点标签');
      kinds.add(q.qtype_cn);
      n++;
    });
  });
  assert.strictEqual(n, 32, '题目总数不是 32，实际 ' + n);
  assert(kinds.size >= 20, '题型只有 ' + kinds.size + ' 种');
});
ok('每篇 4~6 题都不重样：同一篇里题型至少 3 种', () => {
  TARGET.forEach(t => {
    const kinds = new Set((mod(t, t.kind).questions || []).map(q => q.qtype_cn));
    assert(kinds.size >= 3, t.label + ' 题型只有 ' + kinds.size + ' 种');
  });
});
ok('题型真的换了：细节/推理/主旨/词义/正误/指代/匹配/路线/目的/语法等都在', () => {
  const all = new Set();
  TARGET.forEach(t => (mod(t, t.kind).questions || []).forEach(q => all.add(q.qtype_cn)));
  ['细节定位', '词义猜测', '推理判断', '标题选择', '正误判断', '指代关系',
    '数字细节', '同义替换', '路线顺序', '位置关系', '写作目的', '人物匹配',
    '主旨大意', '句意理解', '作者意图', '语法形式', '固定搭配', '上下文线索']
    .forEach(k => assert(all.has(k), '少了题型 ' + k));
});
ok('每题解析都带「方法」：复习同一篇的同时教新的解题思路', () => {
  TARGET.forEach(t => (mod(t, t.kind).questions || []).forEach(q => {
    assert(/方法：/.test(q.explanation_cn || ''), t.label + ' 解析没给解题方法：' + q.question);
    assert((q.explanation_cn || '').length >= 40, t.label + ' 解析太短');
  }));
});

// ------------------------------------------------------------------ ABCD 全不一样
ok('32 组 ABCD 选项两两不重样，每组 4 项互不相同', () => {
  const seen = new Map();
  TARGET.forEach(t => (mod(t, t.kind).questions || []).forEach(q => {
    assert(Array.isArray(q.options) && q.options.length === 4, t.label + ' 选项不是 4 个');
    assert.strictEqual(new Set(q.options).size, 4, t.label + ' 选项有重复：' + q.question);
    q.options.forEach(o => assert(String(o).trim(), t.label + ' 有空选项'));
    const key = q.options.slice().sort().join('|');
    assert(!seen.has(key), t.label + ' 与 ' + seen.get(key) + ' 用了同一组 ABCD');
    seen.set(key, t.label);
  }));
  assert.strictEqual(seen.size, 32);
});
ok('正确答案不再全压在 A：A/B/C/D 都出现，每篇 ≥3 个不同位置', () => {
  const tally = [0, 0, 0, 0];
  TARGET.forEach(t => {
    const qs = mod(t, t.kind).questions || [];
    const idx = qs.map(q => q.answer);
    idx.forEach(i => { assert(Number.isInteger(i) && i >= 0 && i <= 3); tally[i]++; });
    assert(new Set(idx).size >= 3, t.label + ' 答案位置只有 ' + new Set(idx).size + ' 种');
    assert(!idx.every(i => i === 0), t.label + ' 又是全部选 A');
  });
  tally.forEach((n, i) => assert(n >= 4, '答案 ' + 'ABCD'[i] + ' 只出现 ' + n + ' 次'));
});
ok('原来的「一水儿 Where is…」问法已被换掉', () => {
  const stems = [];
  TARGET.forEach(t => (mod(t, t.kind).questions || []).forEach(q => {
    if (t.kind === 'reading') stems.push(q.question);
  }));
  assert(stems.length === 20);
  assert(stems.filter(s => /^Where /i.test(s)).length <= 3, '还在一水儿 Where is 细节题');
  assert(stems.filter(s => /^(Which|What|Why|How|In )/i.test(s)).length >= 15, '新问法不够多');
  assert.strictEqual(new Set(stems).size, 20, '阅读题干有重复');
});

// ------------------------------------------------------------------ 页面与版本
ok('学生界面能看见考点徽标：数据 → 周包透传 → app.js 两处渲染 → CSS', () => {
  assert((dataSrc.match(/qtype_cn/g) || []).length >= 32, '题库没带考点标签');
  assert(/o\.qtype_cn = q\.qtype_cn/.test(applySrc), '周包合入没透传考点标签');
  assert((appSrc.match(/q\.qtype_cn/g) || []).length >= 3, '阅读题/完形空位没渲染考点徽标');
  assert(/\.q-qtype\{/.test(html) && /\.cq-blank-num \.q-qtype\{/.test(html), '缺徽标样式');
});
ok('版本钉子统一到 v206', () => {
  assert(/name="app-version" content="206"/.test(html));
  assert.strictEqual((html.match(/\?v=206/g) || []).length, 7);
  assert(/var CACHE_NAME = 'amy-english-v206';/.test(swSrc) && /var V = 206;/.test(swSrc));
});
ok('8 天（含下周整周）每天仍恰好 30 个真实动作', () => {
  assert.strictEqual(units(W[6][6]), 30, '11/15 周日不是 30 道');
  for (let i = 0; i < 7; i++) assert.strictEqual(units(W[7][i]), 30, 'W8 day' + i + ' 不是 30 道');
});

console.log('\nv206 · ' + pass + ' 项全部通过');
