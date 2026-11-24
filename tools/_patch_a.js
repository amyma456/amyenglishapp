const fs = require('fs');
const files = ['verify-v164','verify-v165','verify-v167','verify-v169','verify-v179','verify-v182','verify-v186','verify-v193','verify-v204','verify-v207','verify-v155','verify-v156','verify-phrases'];
for (const f of files) {
  const p = 'tools/' + f + '.js';
  let s = fs.readFileSync(p, 'utf8');
  const o = s;
  s = s.split("(html.match(/\\?v=222/g) || []).length === 7").join("(html.match(/\\?v=222/g) || []).length === 10");
  s = s.split("(htmlSrc.match(/\\?v=222/g) || []).length === 7").join("(htmlSrc.match(/\\?v=222/g) || []).length === 10");
  s = s.split("(idxSrc.match(/\\?v=222/g) || []).length === 7").join("(idxSrc.match(/\\?v=222/g) || []).length === 10");
  s = s.split("refs === 7").join("refs === 10");
  s = s.split("7 处 ?v=222").join("10 处 ?v=222");
  s = s.split("七处 ?v=222").join("十处 ?v=222");
  s = s.split("7 个脚本引用").join("10 个脚本引用");
  s = s.split("7 处脚本引用").join("10 处脚本引用");
  s = s.split("7 个 script 引用").join("10 个 script 引用");
  s = s.split("7 个脚本引用都是 v164").join("10 个脚本引用都是 v164");
  if (s !== o) fs.writeFileSync(p, s);
  console.log(f, s !== o ? 'patched' : 'unchanged');
}
