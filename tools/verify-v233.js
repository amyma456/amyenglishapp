/* eslint-disable */
// v233 校验：老师端顶部栏改为「横排品牌名 + 拉满整屏 + 压矮固定」
//   用户 2026-11-27 反馈：「不好看……整个搞到最左边的框里头……右边的那几个
//   设置也搞到右边空白处……这个长方框变大，拉满整个界面。并且不要随着滑动，
//   读题的时候不要把题给挡住……滑题的时候这些字保持在这里是可以的，但是不要
//   把题给挡住。」
//   用户确认：① 品牌名横排、保留「Amy老师英语打卡」；② 固定顶部·压矮不挡题。
//
// 四处红线：
//   ① 品牌名横排（不再 writing-mode:vertical-rl），横排 CSS 用 horizontal-tb
//   ② 顶栏拉满整屏：外层 .nav-wrap/.container 也打 teacher-mode，CSS 解 max-width
//   ③ 压矮固定：nav-wrap padding-block 收窄 + navbar min-height 变小 + sticky 保留
//   ④ 学生端不加 teacher-mode，页签顺序仍是周计划→错题本→题库预览→打卡监控→游戏试玩…
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

section('[1] 顶栏 HTML：左品牌 / 中页签 / 右设置，顺序不变');
{
  const nav = htmlSrc.match(/<nav class="navbar">([\s\S]*?)<\/nav>/);
  ok(!!nav, 'navbar 区块存在');
  if (nav) {
    const b = nav[1];
    const iBrand = b.indexOf('class="nav-brand"');
    const iTabs = b.indexOf('id="tab-bar"');
    const iUser = b.indexOf('class="nav-user"');
    ok(iBrand >= 0 && iTabs > iBrand && iUser > iTabs,
      '★ 顺序＝左 nav-brand → 中 tab-bar → 右 nav-user');
    const brand = b.slice(iBrand, iTabs);
    ok(/id="header-name"/.test(brand), '品牌名在左侧品牌区（最左）');
    ok(/id="class-badge"/.test(brand), '班级徽章在左侧品牌区（横排紧随）');
    ok(/Amy老师英语打卡/.test(brand), '品牌名默认文案是 Amy老师英语打卡');
    const user = b.slice(iUser);
    ok(/id="invite-btn-header"/.test(user) && /id="settings-btn-header"/.test(user) && /App\.logout\(\)/.test(user),
      '★ 右侧用户区含 3 个按钮（邀请/设置/退出，贴最右）');
  }
}

section('[2] CSS：品牌名横排 + 顶栏拉满整屏 + 压矮固定');
{
  const v232block = htmlSrc.match(/\/\* ===== v233[\s\S]*?\*\/([\s\S]*?)(?=\/\* 图标)/);
  ok(!!v232block, 'v233 老师端排版 CSS 区块存在');
  const css = v232block ? v232block[1] : '';
  // 品牌名横排：不再竖排，改用 horizontal-tb
  ok(!/writing-mode\s*:\s*vertical-rl/.test(css),
    '★ 老师端不再用竖排 vertical-rl（竖排会撑高顶栏挡题）');
  ok(/writing-mode\s*:\s*horizontal-tb/.test(css), '★ 品牌名显式横排 horizontal-tb');
  // 拉满整屏：三层 teacher-mode + container 解 max-width
  ok(/\.nav-wrap\.teacher-mode/.test(css) && /\.container\.teacher-mode/.test(css)
    && /\.navbar\.teacher-mode/.test(css),
    '★ nav-wrap / container / navbar 三层都打 teacher-mode');
  ok(/\.container\.teacher-mode\{max-width:none/.test(css),
    '★ 老师端 container 解掉 max-width（拉满整屏）');
  ok(/padding-inline:\s*12px/.test(css), '老师端 container 左右留白收到 12px');
  // 压矮固定
  ok(/\.nav-wrap\.teacher-mode\{padding-block:6px\}/.test(css), '★ 顶栏上下留白压到 6px');
  ok(/min-height:42px/.test(css), '★ navbar 最小高度压到 42px');
  ok(/\.nav-wrap\{position:sticky;top:0/.test(htmlSrc),
    '★ 顶栏仍是 sticky top:0（钉住不随题目滚动）');
  // 页签一屏全显示
  ok(/\.navbar\.teacher-mode \.nav-tabs\{[^}]*flex-wrap:nowrap/.test(css),
    '老师页签不换行、一屏显示');
  ok(/\.navbar\.teacher-mode \.nav-tabs button \.icon\{display:none\}/.test(css),
    '老师页签隐藏图标省空间');
  ok(/\.navbar\.teacher-mode \.nav-user\{padding-right:2px\}/.test(css),
    '右侧设置区贴最右');
}

section('[3] app.js：三层 teacher-mode + 品牌名全称 + 页签顺序不变');
{
  ok(/classList\.toggle\('teacher-mode', isTeacher\)/.test(appSrc),
    'navbar 按 isTeacher 切 teacher-mode');
  ok(/const wrap = nav\.closest\('\.nav-wrap'\)/.test(appSrc)
    && /wrap\.classList\.toggle\('teacher-mode', isTeacher\)/.test(appSrc),
    '★ nav-wrap 也打 teacher-mode（拉满整屏的前提）');
  ok(/const ctr = nav\.closest\('\.container'\)/.test(appSrc)
    && /ctr\.classList\.toggle\('teacher-mode', isTeacher\)/.test(appSrc),
    '★ container 也打 teacher-mode（解 max-width 的前提）');
  ok(/headerName\.textContent = 'Amy老师英语打卡'/.test(appSrc),
    '老师品牌名给全称（横排）');
  const EXPECTED = ['weekly', 'errors', 'preview', 'checkin', 'wordgame', 'daily',
    'edit', 'scores', 'print', 'speaking', 'students', 'classmgmt'];
  let all = true, detail = [];
  for (const id of EXPECTED) {
    const re = new RegExp("\\{ id: '" + id + "'");
    if (!re.test(appSrc)) { all = false; detail.push(id); }
  }
  ok(all, '★ 12 个页签 id 都在（顺序沿用 v231 未改）', detail.join(','));
  // 骨架顺序与真实页签一致
  const skel = htmlSrc.match(/var TEACHER_TABS = \[([\s\S]*?)\];/);
  ok(!!skel && /\['weekly', '周计划'\], \['errors', '错题本'\]/.test(skel[1])
    && /\['preview', '题库预览'\]/.test(skel[1])
    && /\['checkin', '打卡监控'\], \['wordgame', '游戏试玩'\]/.test(skel[1]),
    '骨架 TEACHER_TABS 顺序与真实页签一致（打卡监控在游戏试玩左）');
}

section('[4] 版本号 233');
{
  ok(/app-version" content="233"/.test(htmlSrc), 'index.html app-version=233');
  ok((htmlSrc.match(/\?v=233/g) || []).length >= 1, '静态资源 ?v=233 已刷');
  ok(/amy_boot_recover_v233/.test(htmlSrc), '自愈键 v233');
  ok(/amy-english-v233/.test(swSrc) && /var V = 233;/.test(swSrc), 'sw.js 缓存版本 v233');
  ok(!/app-version" content="232"/.test(htmlSrc), '无残留 232 版本号');
}

console.log('\n========================================');
console.log('v233 校验结果：' + pass + ' 通过 / ' + fail + ' 失败');
console.log('========================================');
process.exit(fail ? 1 : 0);
