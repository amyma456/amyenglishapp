const fs = require('fs');
function patch(p, pairs) {
  let s = fs.readFileSync(p, 'utf8');
  const o = s;
  for (const [a, b] of pairs) s = s.split(a).join(b);
  if (s !== o) { fs.writeFileSync(p, s); console.log(p, 'patched'); }
  else console.log(p, 'NO CHANGE');
}

// v200：探针断言前剥行注释；setTimeout(go,1500)/__safeReload 已被 __amyReloadOnce 取代
patch('tools/verify-v200.js', [
  ["const probe = html.slice(html.indexOf('function __checkVersion()'),\n    html.indexOf('document.addEventListener(\\'visibilitychange\\''));",
   "const probe = html.slice(html.indexOf('function __checkVersion()'),\n    html.indexOf('document.addEventListener(\\'visibilitychange\\'')).replace(/\\/\\/[^\\n]*/g, '');"],
  ["assert(/setTimeout\\(go, 1500\\)/.test(probe), '清缓存卡住时没有兜底刷新');",
   "assert(/__amyReloadOnce/.test(probe), '刷新入口是 __amyReloadOnce');"],
  ["assert(/window\\.__safeReload\\(\\)/.test(probe), '没有触发刷新');",
   "assert(/window\\.__amyReloadOnce\\(\\)/.test(probe), '落后时确实触发刷新');"],
]);

// v202：v213 同行状态栏新格式
patch('tools/verify-v202.js', [
  ["assert(/wg-board-score/.test(s), '第 ' + (i + 1) + ' 行没有分数');",
   "assert(/wg-st-total/.test(s), '第 ' + (i + 1) + ' 行没有分数');"],
  ["assert(/错 <b>3<\\/b> 道/.test(segs[0]), '第 1 名错题数没显示');",
   "assert(/错<b>3<\\/b>/.test(segs[0]), '第 1 名错题数没显示');"],
  ["assert(/✅ 已打卡/.test(segs[0]), '第 1 名打卡状态没显示');",
   "assert(/✅打卡/.test(segs[0]), '第 1 名打卡状态没显示');"],
  ["/错 <b>1<\\/b> 道/.test(segs[1]),", "/错<b>1<\\/b>/.test(segs[1]),"],
  ["assert(/答了 12\\/30 题/.test(segs[3]), '半截进度没显示');",
   "assert(/◐12\\/30/.test(segs[3]), '半截进度没显示');"],
  ["assert(/按第 1 到第 9 名顺序排列/.test(board));",
   "assert(/第 1 名/.test(board));"],
  ["assert(/今日已打卡 <b>3<\\/b> \\/ 9 人/.test(board));",
   "assert(/9 位指挥官/.test(board));"],
  ["assert(/按第 1 到第 9 名顺序排列/.test(allZero));",
   "assert(/第一名虚位以待/.test(allZero));"],
]);

// v203：同上
patch('tools/verify-v203.js', [
  ["assert(/总 <b>\\d+<\\/b> 分/.test(s), '第 ' + (i + 1) + ' 行没有累计总分');",
   "assert(/总<b>\\d+<\\/b>/.test(s), '第 ' + (i + 1) + ' 行没有累计总分');"],
  ["assert(/错 <b>3<\\/b> 道/.test(s), '错题数不对');",
   "assert(/错<b>3<\\/b>/.test(s), '错题数不对');"],
  ["assert(/✅ 已打卡/.test(s), '打卡状态不对');",
   "assert(/✅打卡/.test(s), '打卡状态不对');"],
  ["assert(/错 <b>4<\\/b> 道/.test(s), '错题数不对');",
   "assert(/错<b>4<\\/b>/.test(s), '错题数不对');"],
  ["assert(/今日已打卡 <b>3<\\/b> \\/ 9 人/.test(board));",
   "assert(/9 位指挥官/.test(board));"],
  ["assert(/按第 1 到第 9 名顺序排列/.test(board));",
   "assert(/第 1 名/.test(board));"],
  ["assert(/总 <b>1899<\\/b> 分/.test(s), '名次或总分不对');",
   "assert(/总<b>1899<\\/b>/.test(s), '名次或总分不对');"],
]);

// v201：融合卡改用 boardHtml 的现行文案
patch('tools/verify-v201.js', [
  ["assert(/今日已打卡 <b>2<\\/b> \\/ 9 人/.test(ck));",
   "assert(/9 位指挥官/.test(ck));"],
  ["assert(/按第 1 到第 \\d+ 名顺序排列/.test(ck), '没写明按名次顺序排列');",
   "assert(/全班状态榜/.test(ck), '状态榜标题不见了');"],
  ["assert(/wg-st-wrong/.test(seg) && /wg-st-ck/.test(seg) && /wg-board-score/.test(seg),",
   "assert(/wg-st-wrong/.test(seg) && /wg-st-ck/.test(seg) && /wg-st-total/.test(seg),"],
]);
console.log('done');
