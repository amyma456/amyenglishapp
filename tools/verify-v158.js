// tools/verify-v158.js — 老师题库预览「一键翻天」
// 老师 2026-10-27：查题时一天一天翻太费劲，顶栏加「‹ 前一天 / 后一天 ›」，
// 点一下直接走，跨周自动切本周/下周；「换天 ▾」浮层保留给直接跳。
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const weeks = new Function(
  fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8') + '; return HOMEWORK_WEEKS;')();

// ===== 1. previewStep 逻辑（函数体原样抽出，独立跑） ========================
function makeStep(weekLen) {
  const key = 'previewStep(delta) {';
  const start = appSrc.indexOf(key);
  const end = appSrc.indexOf('\n  },', start);
  const body = appSrc.slice(start + key.length, end);
  return new Function('HOMEWORK_WEEKS', 'return function(delta) {' + body + '};')(weeks.slice(0, weekLen));
}
function runStep(weekOff, day, delta) {
  const calls = [];
  const step = makeStep(5);
  const ctx = {
    state: { previewDay: day },
    _previewWeekOffset: () => weekOff,
    getTodayWeekdayIdx: () => 2,
    previewGo: (d, w) => calls.push([d, w]),
  };
  step.call(ctx, delta);
  return calls;
}

section('1. 一键翻天：点一下走一天，跨周自动切');
{
  let c = runStep(0, 2, 1);
  ok(c.length === 1 && c[0][0] === 3 && c[0][1] === 0, '本周·周三 +1 → 本周·周四', JSON.stringify(c[0]));
  c = runStep(0, 6, 1);
  ok(c[0][0] === 0 && c[0][1] === 1, '本周·周日 +1 → 下周·周一（自动换周）', JSON.stringify(c[0]));
  c = runStep(1, 0, -1);
  ok(c[0][0] === 6 && c[0][1] === 0, '下周·周一 -1 → 本周·周日（往回跨周）', JSON.stringify(c[0]));
  c = runStep(0, 0, -1);
  ok(c[0][0] === 0 && c[0][1] === 0, '本周·周一再往前 → 停在本周·周一（不越界）', JSON.stringify(c[0]));
  c = runStep(1, 6, 1);
  ok(c[0][0] === 6 && c[0][1] === 1, '下周·周日再往后 → 停在原地（预览只覆盖两周）', JSON.stringify(c[0]));
  c = runStep(0, 5, 1);
  ok(c[0][0] === 6 && c[0][1] === 0, '本周·周六 +1 → 本周·周日', JSON.stringify(c[0]));
  // previewDay 缺省时取今天
  const step = makeStep(5);
  const calls = [];
  step.call({ state: { previewDay: null }, _previewWeekOffset: () => 0,
    getTodayWeekdayIdx: () => 4, previewGo: (d, w) => calls.push([d, w]) }, 1);
  ok(calls[0][0] === 5 && calls[0][1] === 0, 'previewDay 为空时从「今天」起算', JSON.stringify(calls[0]));
}

section('2. 顶栏渲染：三个按钮都在，边界置灰');
{
  const start = appSrc.indexOf('App.previewStep(-1)');
  const bar = appSrc.slice(start, appSrc.indexOf('换天 ▾', start) + 8);
  ok(bar.includes('App.previewStep(-1)'), '顶栏有「‹ 前一天」按钮');
  ok(bar.includes('App.previewStep(1)'), '顶栏有「后一天 ›」按钮');
  ok(bar.includes("' disabled'"), '边界置灰（disabled 属性）');
  ok(bar.includes('togglePvPicker()'), '「换天 ▾」浮层保留（直接跳某天）');
  ok(bar.includes('pv-title'), '标题「本周/下周 · 周X」保留');
}

section('3. previewGo 收口干净（不污染学生状态）');
{
  const go = appSrc.slice(appSrc.indexOf('previewGo(dayIdx, weekOffset) {'), appSrc.indexOf('previewStep(delta) {'));
  ok(/previewDay = dayIdx/.test(go) && /currentDay = dayIdx/.test(go), 'previewGo 同步 previewDay 与 currentDay');
  ok(/stepIdx = 0/.test(go), 'previewGo 重置 stepIdx（老师从头看）');
  ok(/_pvPickerOpen = false/.test(go), 'previewGo 收起换天浮层');
  ok(/renderContent\(\)/.test(go), 'previewGo 触发重绘');
}

section('4. 版本号 v158');
{
  ok(htmlSrc.includes('app-version" content="159"'), 'index.html app-version=158');
  ok(/\.js\?v=159/.test(htmlSrc), 'index.html 资源 ?v=158');
  ok(swSrc.includes('amy-english-v159'), 'sw.js CACHE_NAME=v158');
  ok(/var V = 159;/.test(swSrc), 'sw.js var V = 158');
  ok(!/\?v=157/.test(htmlSrc) && !/amy-english-v157/.test(swSrc), '无 157 残留');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
