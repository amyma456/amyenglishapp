// ===========================================================================
// v134 集成验证：老师端「题库预览」的换周真的换得动、也真的收得回来
//
// 和 verify-teacher-preview.js 的分工：
//   · verify-teacher-preview.js 查"代码写对没有"（静态 + 判定函数行为）
//   · 本文件建一个真 vm 上下文，按 index.html 的顺序先跑 data.js、再跑 app.js
//     的两个真函数，检验**跨脚本能不能改到那个 let**
//
// 为什么要单独验这一条：`HOMEWORK_DATA` 从 const 改成了 let，靠的是"顶层
// let 在全局词法作用域里、跨 <script> 可读可写"。这是整个方案唯一没有先例的
// 假设 —— 纸面推断不算数，必须真跑一遍。跑不通的话，老师翻下周就是死路。
// ===========================================================================
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = 'C:/Users/amyma/WorkBuddy/2026-08-23-12-39-49/AmyEnglishApp';
const dataSrc = fs.readFileSync(path.join(R, 'public/data.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(R, 'public/app.js'), 'utf8');

function methodBody(src, name) {
  const cands = ['\n  async ' + name + '(', '\n  ' + name + '('];
  let start = -1;
  for (const t of cands) { const i = src.indexOf(t); if (i >= 0) { start = i; break; } }
  if (start < 0) return '';
  const rest = src.slice(start + 1);
  const re = /\n  (?:async )?[A-Za-z_$][\w$]*\s*\(/g; re.lastIndex = 1;
  const m = re.exec(rest);
  return m ? rest.slice(0, m.index) : rest;
}

const ctx = vm.createContext({ console });
// ① 先加载 data.js（和 index.html 里的顺序一致）
vm.runInContext(dataSrc, ctx, { filename: 'data.js' });

// ② app.js 的片段：只用真实代码里的两个函数，拼一个最小 App
const snippet = `
const App = {
  state: { currentTab: 'weekly', previewWeek: 0, previewDay: null },
  _teacher: false,
  isTeacher() { return this._teacher; },
  ${methodBody(appSrc, '_previewWeekOffset')}
  ${methodBody(appSrc, '_syncWeekData')}
};
globalThis.App = App;
globalThis.snap = function () { return HOMEWORK_DATA; };
globalThis.setTab = function (t) { App.state.currentTab = t; };
globalThis.setTeacher = function (v) { App._teacher = v; };
`;
vm.runInContext(snippet, ctx, { filename: 'app-snippet.js' });

const W = vm.runInContext('HOMEWORK_WEEKS', ctx);
const IDX = vm.runInContext('HOMEWORK_WEEK_IDX', ctx);
const snap = () => vm.runInContext('snap()', ctx);
const call = (expr) => vm.runInContext(expr, ctx);

let bad = 0;
function ck(cond, label, extra) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label + (extra ? '  → ' + extra : ''));
  if (!cond) bad++;
}

console.log('当前周索引 IDX =', IDX, '（第', IDX + 1, '周，共', W.length, '周）');

// ---- 场景 1：老师停在周计划 → 必须是本周 ----
call("setTeacher(true); setTab('weekly');");
call('App._syncWeekData();');
ck(snap() === W[IDX], '★ 老师停在「周计划」→ 生效周 = 本周');

// ---- 场景 2：老师进预览看下周 → 必须是下周（核心需求）----
call("setTab('preview'); App.state.previewWeek = 1; App.state.previewDay = 3;");
call('App._syncWeekData();');
ck(snap() === W[Math.min(IDX + 1, W.length - 1)],
  '★★ 老师预览「下周周三」→ 生效周真的变成下周',
  '生效 WEEK' + (W.indexOf(snap()) + 1));
ck(snap() !== W[IDX] || IDX + 1 >= W.length, '★★ 此时读到的不再是本周题库（这才是"看得到下周"）');

// 真正渲染一下舞台用的步骤，确认拿到的是下周的题
const nextMon = snap()[0];
ck(nextMon && nextMon.modules && nextMon.modules.length > 0,
  '★ 换到下周后拿到的是一份完整的日数据（' + (nextMon && nextMon.day_cn) + '）');

// ---- 场景 3：老师切回周计划 → 必须立刻还原 ----
call("setTab('weekly');");
call('App._syncWeekData();');
ck(snap() === W[IDX], '★★ 老师切回「周计划」→ 立刻还原成本周（不会把下周题当本周显示）');

// ---- 场景 4：老师退出预览（切到别的页）----
call("setTab('edit'); App.state.previewWeek = 1; App.state.previewDay = 5;");
call('App._syncWeekData();');
ck(snap() === W[IDX], '★★ 停在「作业编辑」→ 仍是本周');

// ---- 场景 5：学生端无论怎样都必须是本周 ----
call("setTeacher(false); setTab('today'); App.state.previewWeek = 1; App.state.previewDay = 2;");
call('App._syncWeekData();');
ck(snap() === W[IDX], '★★ 学生端 → 永远是本周（学生看不到下周题）');

call("setTeacher(false); setTab('preview'); App.state.previewWeek = 1;");
call('App._syncWeekData();');
ck(snap() === W[IDX], '★★ 就算把学生的 currentTab 硬设成 preview → 仍是本周（双保险）');

// ---- 场景 6：反复横跳 50 次，不许漂移 ----
let drift = false;
for (let i = 0; i < 50; i++) {
  call("setTeacher(true); setTab('preview'); App.state.previewWeek = " + (i % 2) + ";");
  call('App._syncWeekData();');
  const want = W[Math.min(IDX + (i % 2), W.length - 1)];
  if (snap() !== want) { drift = true; break; }
  call("setTab('weekly');");
  call('App._syncWeekData();');
  if (snap() !== W[IDX]) { drift = true; break; }
}
ck(!drift, '★★ 老师/周计划来回切 50 轮，周次不漂移、句点总是还原');

console.log(bad === 0 ? '\n集成验证全部通过 ✅' : '\n集成验证有失败 ❌ (' + bad + ')');
process.exit(bad === 0 ? 0 : 1);
