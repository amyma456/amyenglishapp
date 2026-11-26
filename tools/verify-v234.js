/* eslint-disable */
// v234 校验：老师端顶栏「品牌名全字 + 班级下移 + 页签放大铺满」
//   用户 2026-11-27 原话：「把艾米少儿英语老师这几个字全部显示全，少儿英语A班
//   呢，显示在艾米少儿英语老师的下边。周计划到班级管理这些选项卡字再拉大一点，
//   占满上面的所有空白处。」
//
// 四处红线：
//   ① app.js：老师品牌名 = 「艾米少儿英语老师」（全字，不再 Amy 缩写）
//   ② CSS：#header-name 解掉 max-width 截断（ID+class 高特异性）
//   ③ CSS：nav-brand 上下两行（品牌上/班级下），class-badge 全字不截断
//   ④ CSS：页签字号放大(13px 档)、justify-content:space-between 铺满；学生端不受影响
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

section('[1] 品牌名全字：艾米少儿英语老师');
{
  ok(/headerName\.textContent = '艾米少儿英语老师'/.test(appSrc),
    '★ 老师品牌名＝「艾米少儿英语老师」（全字）');
  ok(!/headerName\.textContent = 'Amy老师英语打卡'/.test(appSrc),
    '旧的 Amy 缩写文案已移除');
  ok(/id="header-name"[^>]*class="brand-name"/.test(htmlSrc)
    || /class="brand-name"[^>]*id="header-name"/.test(htmlSrc),
    'header-name 带 brand-name 类');
}

section('[2] 品牌名不截断：ID+class 高特异性解除 max-width');
{
  const block = htmlSrc.match(/\/\* ===== v234[\s\S]*?\*\/([\s\S]*?)(?=\/\* 图标)/);
  ok(!!block, 'v234 老师端排版 CSS 区块存在');
  const css = block ? block[1] : '';
  ok(/\.navbar\.teacher-mode #header-name\{max-width:none;overflow:visible;text-overflow:clip\}/.test(css),
    '★ 用 ID+class 高特异性解掉 #header-name 的 max-width:120px 截断');
  ok(/writing-mode:horizontal-tb/.test(css), '品牌名横排');
  ok(/font-size:max\(calc\(15px\*var\(--fs-sm\)\),var\(--fs-sm-min\)\)/.test(css),
    '品牌名字号放大到 15px 档');
}

section('[3] 班级下移：nav-brand 上下两行，班级全字');
{
  const block = htmlSrc.match(/\/\* ===== v234[\s\S]*?\*\/([\s\S]*?)(?=\/\* 图标)/);
  const css = block ? block[1] : '';
  ok(/\.navbar\.teacher-mode \.nav-brand\{flex-direction:column/.test(css),
    '★ nav-brand 改上下两行排列（品牌上/班级下）');
  ok(/\.navbar\.teacher-mode \.class-badge\{max-width:none/.test(css),
    '★ 班级徽章 max-width:none，全字不截断');
  const nav = htmlSrc.match(/<nav class="navbar">([\s\S]*?)<\/nav>/);
  ok(!!nav && /id="class-badge"/.test(nav[1]), '班级徽章仍在左侧品牌区内');
}

section('[4] 页签放大铺满 + 顶栏拉满固定 + 学生端不受影响');
{
  const block = htmlSrc.match(/\/\* ===== v234[\s\S]*?\*\/([\s\S]*?)(?=\/\* 图标)/);
  const css = block ? block[1] : '';
  ok(/\.navbar\.teacher-mode \.nav-tabs\{[^}]*justify-content:space-between/.test(css),
    '★ 页签 space-between 均匀铺满顶部空白');
  ok(/\.navbar\.teacher-mode \.nav-tabs button\{[^}]*font-size:max\(calc\(13px/.test(css),
    '★ 页签字号放大到 13px 档（v233 是 11px）');
  ok(/flex-wrap:nowrap/.test(css), '页签不换行，一屏显示');
  ok(/\.container\.teacher-mode\{max-width:none/.test(css), '顶栏仍拉满整屏');
  ok(/\.nav-wrap\{position:sticky;top:0/.test(htmlSrc), '顶栏仍 sticky 钉顶');
  // 三层 teacher-mode 结构仍在
  ok(/wrap\.classList\.toggle\('teacher-mode'/.test(appSrc)
    && /ctr\.classList\.toggle\('teacher-mode'/.test(appSrc),
    'nav-wrap/container 三层 teacher-mode 保留（拉满前提）');
  // 学生端：无 teacher-mode 时不触发这些规则——断言规则都带 .teacher-mode 前缀
  const tbrules = css.match(/\.navbar\.teacher-mode[^{]*\{/g) || [];
  ok(tbrules.length >= 5, '排版规则都限定在 .teacher-mode 下（学生端不受影响）', tbrules.length);
  // 页签顺序不变
  const EXPECTED = ['weekly', 'errors', 'preview', 'checkin', 'wordgame', 'daily',
    'edit', 'scores', 'print', 'speaking', 'students', 'classmgmt'];
  let all = true, detail = [];
  for (const id of EXPECTED) {
    if (!new RegExp("\\{ id: '" + id + "'").test(appSrc)) { all = false; detail.push(id); }
  }
  ok(all, '★ 12 个页签顺序未改', detail.join(','));
}

section('[5] 版本号 234');
{
  ok(/app-version" content="234"/.test(htmlSrc), 'index.html app-version=234');
  ok((htmlSrc.match(/\?v=234/g) || []).length >= 1, '静态资源 ?v=234 已刷');
  ok(/amy_boot_recover_v234/.test(htmlSrc), '自愈键 v234');
  ok(/amy-english-v234/.test(swSrc) && /var V = 234;/.test(swSrc), 'sw.js 缓存版本 v234');
  ok(!/app-version" content="233"/.test(htmlSrc), '无残留 233');
}

console.log('\n========================================');
console.log('v234 校验结果：' + pass + ' 通过 / ' + fail + ' 失败');
console.log('========================================');
process.exit(fail ? 1 : 0);
