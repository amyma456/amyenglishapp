const fs = require('fs');

function patch(p, pairs) {
  let s = fs.readFileSync(p, 'utf8');
  const o = s;
  for (const [a, b] of pairs) s = s.split(a).join(b);
  if (s !== o) { fs.writeFileSync(p, s); console.log(p, 'patched'); }
  else console.log(p, 'NO CHANGE');
}

// v198~v203：首页 ?v 计数 7 → 10
for (const f of ['verify-v198', 'verify-v199', 'verify-v200', 'verify-v201', 'verify-v202', 'verify-v203']) {
  patch('tools/' + f + '.js', [
    ["(html.match(/\\?v=222/g) || []).length, 7, '首页 7 处脚本引用'", "(html.match(/\\?v=222/g) || []).length, 10, '首页 10 处脚本引用'"],
  ]);
}

// v197：断言前剥掉 CSS 注释（后来版本的注释里提到 :has( 字样，被误判）
patch('tools/verify-v197.js', [
  ["assert(block.indexOf(':has(') < 0, '新样式用了老浏览器不认的选择器');",
   "const blockCssOnly = block.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');\n  assert(blockCssOnly.indexOf(':has(') < 0, '新样式用了老浏览器不认的选择器');"],
]);

// v168：字号断言跟着 v209 自适应字号体系走
patch('tools/verify-v168.js', [
  ["ok(/\\.pv-bar button\\{flex:none;padding:3px 8px;font-size:11px\\}/.test(htmlSrc), '按钮字号压到 11px');",
   "ok(/\\.pv-bar button\\{flex:none;padding:3px 8px;font-size:max\\(calc\\(11px\\*var\\(--fs-sm\\)\\)/.test(htmlSrc), '按钮字号 ≥11px（v209 自适应）');"],
  ["ok(/\\.pv-bar \\.pv-date\\{[^}]*font-size:12px/.test(htmlSrc), '日期字号 12px');",
   "ok(/\\.pv-bar \\.pv-date\\{[^}]*font-size:max\\(calc\\(12px\\*var\\(--fs-sm\\)\\)/.test(htmlSrc), '日期字号 ≥12px（v209 自适应）');"],
  ["ok(/\\.pv-bar \\.pv-title\\{[^}]*font-size:12px/.test(htmlSrc), '标题字号 12px');",
   "ok(/\\.pv-bar \\.pv-title\\{[^}]*font-size:max\\(calc\\(12px\\*var\\(--fs-sm\\)\\)/.test(htmlSrc), '标题字号 ≥12px（v209 自适应）');"],
  ["(htmlSrc.match(/\\?v=222/g) || []).length === 7", "(htmlSrc.match(/\\?v=222/g) || []).length === 10"],
  ["index.html 7 处 ?v=222", "index.html 10 处 ?v=222"],
]);

// v178：输入框 / 整段英文 16px 改成自适应最小值断言
patch('tools/verify-v178.js', [
  ["ok(/writing-blank-input[^>]*font-size:16px/.test(appSrc), '输入框字号 16px（iOS 不再聚焦放大整页）');",
   "ok(/writing-blank-input[^>]*font-size:max\\(calc\\(16px\\*var\\(--fs\\)\\)/.test(appSrc), '输入框字号 ≥16px（v209 自适应，iOS 不再聚焦放大整页）');"],
  ["ok(/@media[^{]*\\(max-width[^{]*\\{[\\s\\S]*?\\.writing-essay\\{font-size:16px;padding:14px;line-height:2\\.1\\}/.test(idxSrc), '手机端整段英文 16px / 行距 2.1');",
   "ok(/@media[^{]*\\(max-width[^{]*\\{[\\s\\S]*?\\.writing-essay\\{font-size:max\\(calc\\(16px\\*var\\(--fs\\)\\),var\\(--fs-min\\)\\);padding:14px;line-height:2\\.1\\}/.test(idxSrc), '手机端整段英文 ≥16px / 行距 2.1（v209 自适应）');"],
  ["ok(/writing-blank-input[^>]*font-size:16px/.test(stu), '学生端：横线输入框 16px');",
   "ok(/writing-blank-input[^>]*font-size:max\\(calc\\(16px\\*var\\(--fs\\)\\)/.test(stu), '学生端：横线输入框 ≥16px（v209 自适应）');"],
]);
console.log('done');
