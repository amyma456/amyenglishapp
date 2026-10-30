// tools/verify-v159.js — 题库预览顶栏标题带具体日期
// 老师 2026-10-27：换天时老师要知道"周几"到底是几号，标题里拼上 getDayDateLabel。
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}

const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

// 1. 顶栏带具体日期标签（v168 起拆两行：日期在第二行 pv-date，独占一行不被省略号吞）
const start = appSrc.indexOf('App.previewStep(-1)');
const bar = appSrc.slice(appSrc.indexOf("class=\"pv-bar\""), appSrc.indexOf('---- 换天浮层'));
ok(/pv-date[\s\S]*getDayDateLabel\(d, weekOff\)/.test(bar) || /pv-title[\s\S]*getDayDateLabel\(d, weekOff\)/.test(bar),
  '顶栏拼了 getDayDateLabel(d, weekOff)');
ok(bar.includes("（今天）"), '「（今天）」标记保留');

// 2. getDayDateLabel / getWeekDates 本体没动（还在，且参数不变）
ok(appSrc.includes('getDayDateLabel(dayIdx, weekOffset) {'), 'getDayDateLabel 函数仍在');
ok(appSrc.includes('getWeekDates(weekOffset || 0)[dayIdx]'), 'getWeekDates 取日期逻辑未动');

// 3. 版本号 v159
ok(htmlSrc.includes('app-version" content="174"'), 'index.html app-version=159');
ok(/\.js\?v=174/.test(htmlSrc), 'index.html 资源 ?v=159');
ok(swSrc.includes('amy-english-v174') && /var V = 174;/.test(swSrc), 'sw.js 版本 159');
ok(!/content="158"|\?v=158|amy-english-v158/.test(htmlSrc + swSrc), '无 158 残留');

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
