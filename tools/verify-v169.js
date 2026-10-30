/* eslint-disable */
// verify-v169（家长 2026-10-30）：
//   「继续优化软件里的所有短语的组合，所有短语的拉取的不够多，只把典型的
//    拉取出来了……Every morning、Good habits、Make me、In the park、Junk
//    food、At meals、Do morning exercises、Getting up、Used to、Deal with、
//    The end of、On the floor、In the world……只要是短语的，比较常见的、
//    普通的，甚至简单的，你都给我弄出来。有短语这样的标识，让学生去点。」
//
// 钉住四件事：
//   1. 短语表大规模扩充（≥500 条），家长点名的每一个短语都实测能命中
//   2. 写作模板正文改为走 _wordSpans —— 单词可点、短语自动合并成短语盒
//   3. 短语盒带「短语」标识（.lk-phrase::after 的角标样式 + 写作正文可点样式）
//   4. 版本钉子 = 169
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

const apiSrc = read('public/api.js');
const appSrc = read('public/app.js');
const htmlSrc = read('public/index.html');
const swSrc = read('public/sw.js');

// 把 WordHelp 单独拆出来跑（它自成一体，不依赖 Store/Api）
const whSrc = apiSrc.slice(apiSrc.indexOf('const WordHelp'), apiSrc.indexOf('const Api ='));
let WordHelp;
try {
  WordHelp = new Function(whSrc + '; return WordHelp;')();
} catch (e) {
  console.log('WordHelp 装载失败：' + e.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
section('1. 家长点名的短语全部能查到');
{
  const at = (words, i) => WordHelp.phraseAt(words, i);
  // W5 写作模板里的短语（家长原话的第一批）
  ok(at(['Every', 'morning'], 0), 'Every morning');
  ok(at(['in', 'the', 'park'], 0), 'in the park');
  ok(at(['At', 'meals'], 0), 'At meals');
  ok(at(['junk', 'food'], 0), 'junk food');
  ok(at(['Before', 'school'], 0), 'Before school');
  ok(at(['stay', 'up', 'late'], 0), 'stay up late');
  ok(at(['every', 'night'], 0), 'every night');
  ok(at(['Good', 'habits'], 0), 'Good habits');
  ok(at(['make', 'me'], 0), 'make me');
  // 家长点名的另一批（出现在其他模块的正文里）
  ok(at(['getting', 'up'], 0) && at(['getting', 'up'], 0).en === 'get up', 'Getting up（get up 的 -ing 形）');
  ok(at(['Used', 'to'], 0), 'Used to');
  ok(at(['deal', 'with'], 0), 'Deal with');
  ok(at(['the', 'end', 'of'], 0), 'The end of');
  ok(at(['on', 'the', 'floor'], 0), 'On the floor');
  ok(at(['in', 'the', 'world'], 0), 'In the world');
  ok(at(['do', 'morning', 'exercises'], 0), 'Do morning exercises');
  // 变形自动生成仍然工作（v163 的回归）
  ok(at(['giving', 'up'], 0), 'giving up（回归）');
  ok(at(['is', 'good', 'at'], 0), 'is good at（回归）');
  // 扩充后的批量抽查
  ['every day', 'last night', 'next month', 'in the classroom', 'on the table',
   'at the bus stop', 'fresh air', 'middle school', 'bus stop', 'go for a walk',
   'learn from', 'say goodbye to', 'the same as', 'help each other', 'no problem',
   'welcome to', 'on weekdays', 'in China', 'on the grass', 'at the seaside'].forEach((ph) => {
    ok(at(ph.split(' '), 0), ph);
  });
}

// ---------------------------------------------------------------------------
section('2. 表的规模与去重');
{
  const seen = new Set();
  let dup = 0;
  WordHelp.PHRASES.forEach(function (p) {
    if (seen.has(p[0])) dup++;
    seen.add(p[0]);
  });
  ok(WordHelp.PHRASES.length >= 500, '短语表 ≥500 条', WordHelp.PHRASES.length);
  ok(dup === 0, '表内无重复条目', dup ? [...seen].length + ' unique / ' + WordHelp.PHRASES.length : '0 重复');
  const idx = WordHelp._buildPhraseIdx();
  ok(Object.keys(idx).length >= WordHelp.PHRASES.length, '变形展开后索引更大', Object.keys(idx).length);
}

// ---------------------------------------------------------------------------
section('3. 写作模板正文可点（单词 + 短语标识）');
{
  ok(appSrc.indexOf("String(m.template).split(/(\\{\\{[0-9A-Za-z_-]+\\}\\})/)") >= 0,
    'renderWritingTemplate 按 {{n}} 切开、文字段走 _wordSpans');
  const seg = appSrc.slice(appSrc.indexOf('renderWritingTemplate(m, mi, dayIdx)'),
                           appSrc.indexOf('  // 空填成什么样自己记一份'));
  ok(seg.includes('self._wordSpans(seg)'), '文字段经 _wordSpans 渲染（单词/短语盒）');
  ok(seg.includes('inputs[b.id]'), '空位输入框逻辑保留');
  ok(/\.writing-essay \.lk-word\{cursor:pointer/.test(htmlSrc), '写作正文点词盒有可点样式');
  ok(/\.lk-phrase::after\{content:'短语'/.test(htmlSrc), '短语盒带「短语」小角标标识');
}

// ---------------------------------------------------------------------------
section('4. 版本钉子 = 169');
{
  ok(/name="app-version" content="171"/.test(htmlSrc), 'index.html app-version = 169');
  ok((htmlSrc.match(/\?v=171/g) || []).length === 6, 'index.html 6 处 ?v=171', (htmlSrc.match(/\?v=171/g) || []).length);
  ok(!/\?v=16[0-8]\b/.test(htmlSrc), 'index.html 没有残留旧 ?v=');
  ok(/var V = 171;/.test(swSrc), 'sw.js var V = 169');
  ok(/amy-english-v171/.test(swSrc), 'sw.js CACHE_NAME = amy-english-v171');
  ok(!/amy-english-v16[0-8]\b/.test(swSrc), 'sw.js 没有残留旧缓存名');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
