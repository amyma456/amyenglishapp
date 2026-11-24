const fs = require('fs');
function patch(p, pairs) {
  let s = fs.readFileSync(p, 'utf8');
  const o = s;
  for (const [a, b] of pairs) s = s.split(a).join(b);
  if (s !== o) { fs.writeFileSync(p, s); console.log(p, 'patched'); }
  else console.log(p, 'NO CHANGE');
}

// v197：v213 起分数改成「总<b>0</b>」同行展示
patch('tools/verify-v197.js', [
  ["assert(/\\<b\\>0\\<\\/b\\> 分/.test(out), '没玩过的不显示 0 分');",
   "assert(/总<b>0<\\/b>/.test(out), '没玩过的不显示 0 分（v213 同行状态栏格式）');"],
]);

// v202：同样的注释误判问题（后续版本注释里提到 :has(/100dvh）
patch('tools/verify-v202.js', [
  ["assert(!/:has\\(/.test(block) && !/100dvh/.test(block), '融合样式用了老浏览器不支持的语法');",
   "const blockCssOnly = block.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');\n  assert(!/:has\\(/.test(blockCssOnly) && !/100dvh/.test(blockCssOnly), '融合样式用了老浏览器不支持的语法');"],
]);

// v200：v220 反转了清缓存做法 —— 落后只 reload 一次，不再 caches.delete
patch('tools/verify-v200.js', [
  ["assert(/caches\\.keys\\(\\)/.test(probe) && /caches\\.delete\\(n\\)/.test(probe), '没清旧缓存');",
   "assert(!/caches\\.delete/.test(probe) && /__amyReloadOnce/.test(probe) && /amy_ver_reload_/.test(probe), '版本落后只 reload 一次（v220 起不清缓存，导航走网络优先）');"],
]);
console.log('done');
