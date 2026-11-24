const fs = require('fs');
function patch(p, pairs) {
  let s = fs.readFileSync(p, 'utf8');
  const o = s;
  for (const [a, b] of pairs) s = s.split(a).join(b);
  if (s !== o) { fs.writeFileSync(p, s); console.log(p, 'patched'); }
  else console.log(p, 'NO CHANGE');
}

// v200 / v203：断言前剥注释（后续版本注释里提到 caches.delete / :has( / 100dvh）
patch('tools/verify-v200.js', [
  ["const probe = html.slice(html.indexOf('function __checkVersion()'),\n    html.indexOf(\"document.addEventListener('visibilitychange'\"));",
   "let probe = html.slice(html.indexOf('function __checkVersion()'),\n    html.indexOf(\"document.addEventListener('visibilitychange'\"));\n  probe = probe.replace(/\\/\\/[^\\n]*/g, '');"],
]);

patch('tools/verify-v203.js', [
  ["assert(block.indexOf(':has(') < 0 && block.indexOf('100dvh') < 0,",
   "const blockCssOnly = block.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');\n  assert(blockCssOnly.indexOf(':has(') < 0 && blockCssOnly.indexOf('100dvh') < 0,"],
]);

// v205 / v206：首页 ?v 计数 7 → 10
patch('tools/verify-v205.js', [
  ["assert.strictEqual((html.match(/\\?v=222/g) || []).length, 7);",
   "assert.strictEqual((html.match(/\\?v=222/g) || []).length, 10);"],
]);
patch('tools/verify-v206.js', [
  ["assert.strictEqual((html.match(/\\?v=222/g) || []).length, 7);",
   "assert.strictEqual((html.match(/\\?v=222/g) || []).length, 10);"],
]);

// v199：names 字号改为 v209 自适应
patch('tools/verify-v199.js', [
  ["assert(/\\.err-who \\.names\\{[^}]*font-size:15px/.test(css) && /font-weight:700/.test(css), '名字大字加粗');",
   "assert(/\\.err-who \\.names\\{[^}]*font-size:max\\(calc\\(15px\\*var\\(--fs\\)\\)/.test(css) && /font-weight:700/.test(css), '名字大字加粗（v209 自适应）');"],
]);
console.log('done');
