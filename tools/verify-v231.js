/* eslint-disable */
// v231 校验：老师端页签顺序重排（老师 2026-11-27 要求）
//   原话：「把老师端的游戏试玩，还有打卡监控这两个页面放在题库预览的右边，
//          紧挨着，这样老师好查。错题本放在题库预览的左边。第一页仍然还是周计划」
//   （中途更正过一次：第一页是「周计划」，不是「每日详情」）
//
// 目标顺序（12 个，不多不少）：
//   周计划 → 错题本 → 题库预览 → 打卡监控 → 游戏试玩 → 每日详情
//   → 作业编辑 → 成绩分析 → 错题卷打印 → 口语记录 → 学生管理 → 班级管理
//   注：2026-11-27 用户二次更正「打卡监控放在游戏试玩的左边」。
//
// 三处必须完全一致：app.js renderTabs() / index.html 骨架 TEACHER_TABS / 版本号 231。
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  [' + extra + ']' : '')); }
}
function section(s) { console.log('\n' + s); }

// 从 app.js 的 renderTabs() 里抠出老师端 tabs 数组的 id 顺序
function teacherIdsFromApp() {
  const m = appSrc.match(/if \(isTeacher\) \{\s*tabs = \[([\s\S]*?)\];\s*\} else \{/);
  if (!m) return null;
  const ids = [];
  const re = /\{ id: '([a-z]+)', icon:/g;
  let x;
  while ((x = re.exec(m[1])) !== null) ids.push(x[1]);
  return ids;
}

// 从 index.html 的 TEACHER_TABS 抠出 id 顺序（骨架屏首帧用的那份）
function teacherIdsFromHtml() {
  const m = htmlSrc.match(/var TEACHER_TABS = \[([\s\S]*?)\];/);
  if (!m) return null;
  const ids = [];
  const re = /\['([a-z]+)', '[^']+'\]/g;
  let x;
  while ((x = re.exec(m[1])) !== null) ids.push(x[1]);
  return ids;
}

const EXPECTED = ['weekly', 'errors', 'preview', 'checkin', 'wordgame', 'daily',
  'edit', 'scores', 'print', 'speaking', 'students', 'classmgmt'];

section('[1] app.js renderTabs()：老师端页签顺序');
const appIds = teacherIdsFromApp();
ok(!!appIds, '能从 app.js 解析出老师端 tabs 数组');
if (appIds) {
  ok(appIds.length === 12, '老师端共 12 个页签（不多不少）', appIds.length);
  ok(appIds[0] === 'weekly', '★ 第一页仍是「周计划」', appIds[0]);
  const iErr = appIds.indexOf('errors'), iPre = appIds.indexOf('preview');
  const iGame = appIds.indexOf('wordgame'), iCheck = appIds.indexOf('checkin');
  ok(iErr === iPre - 1, '★ 错题本紧挨在题库预览左边', 'errors=' + iErr + ' preview=' + iPre);
  ok(iCheck === iPre + 1 && iGame === iPre + 2,
    '★ 打卡监控、游戏试玩紧挨在题库预览右边（监控在前、试玩在后）',
    'preview=' + iPre + ' checkin=' + iCheck + ' wordgame=' + iGame);
  ok(JSON.stringify(appIds) === JSON.stringify(EXPECTED),
    '★ app.js 页签顺序与 v231 目标完全一致', appIds.join(' > '));
}

section('[2] index.html 骨架 TEACHER_TABS：首帧页签顺序与 app.js 一致');
const htmlIds = teacherIdsFromHtml();
ok(!!htmlIds, '能从 index.html 解析出 TEACHER_TABS');
if (htmlIds && appIds) {
  ok(JSON.stringify(htmlIds) === JSON.stringify(appIds),
    '★ 骨架页签顺序 = app.js 真页签顺序（首帧不会先闪一版旧顺序）',
    htmlIds.join(' > '));
  ok(htmlIds.length === 12, '骨架也是 12 个页签', htmlIds.length);
}

section('[3] 学生端不受影响');
{
  const m = appSrc.match(/\} else \{\s*\/\/ Non-teacher:[\s\S]*?tabs = \[([\s\S]*?)\];\s*\}/);
  ok(!!m, '学生端 tabs 分支仍在');
  if (m) {
    const ids = []; const re = /\{ id: '([a-z]+)', icon:/g; let x;
    while ((x = re.exec(m[1])) !== null) ids.push(x[1]);
    ok(JSON.stringify(ids) === JSON.stringify(['today', 'wordgame', 'myprogress', 'compare', 'myerrors']),
      '学生端 5 个页签顺序原样未动', ids.join(' > '));
  }
}

section('[4] 版本号 231：meta / preload / defer / SW / 恢复键');
{
  ok(/<meta name="app-version" content="231">/.test(htmlSrc), 'meta app-version=231');
  ok(!/app-version" content="230"/.test(htmlSrc), '没有残留 230 的 meta');
  const preloads = (htmlSrc.match(/<link rel="preload" as="script" href="[^"]+\?v=231">/g) || []).length;
  const defers = (htmlSrc.match(/<script defer src="[^"]+\?v=231"><\/script>/g) || []).length;
  ok(preloads === 3, '3 个 preload 都带 ?v=231（preload 与 defer 同版本才不会重复下载）', preloads);
  ok(defers >= 7, 'defer 脚本都带 ?v=231', defers);
  ok(/amy_boot_recover_v231/.test(htmlSrc) && !/amy_boot_recover_v230/.test(htmlSrc),
    '自愈恢复键升到 v231');
  ok(/var CACHE_NAME = 'amy-english-v231'/.test(swSrc) && /var V = 231;/.test(swSrc),
    'SW 缓存名与版本常数都升到 231（旧缓存整体作废）');
  ok(!/230/.test(swSrc), 'sw.js 没有残留 230');
}

console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
process.exit(fail ? 1 : 0);
