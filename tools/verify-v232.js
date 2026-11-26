/* eslint-disable */
// v232 校验：老师端顶部栏左中右重排（老师 2026-11-27 要求）
//   原话：「师端上面的题目选项，那些题卡字太大了，要求一个界面里头全部
//          显示出来，而不用鼠标左滑右滑才能看见右边的。艾米老师打卡平台，
//          挪到左边来，挪到左边的空白处，竖着显示。少儿英语A班那些都显示在
//          左边，横着显示。右边那3个小设置，挪到右边的空白处，横着显示。」
//   用户确认：顶部仍排一行；品牌名文字竖排（对联那样一个字一个字往下）。
//
// 三处红线：
//   ① 顶栏 HTML 结构：左 nav-brand(竖排标题+横排班级) / 中 nav-tabs / 右 nav-user(头像+3按钮)
//   ② CSS：老师模式写 vertical-rl / 页签缩小去图标可换行 / 学生端不受影响
//   ③ app.js：renderTabs 给顶栏加 teacher-mode；老师标题给全称；版本号 232
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

section('[1] 顶栏 HTML 结构：左品牌 / 中页签 / 右设置');
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
    ok(/id="header-name"[^>]*class="brand-name"/.test(brand) || /class="brand-name"[^>]*id="header-name"/.test(brand),
      '左侧品牌名带 brand-name 类（供竖排 CSS 命中）');
    ok(/id="class-badge"/.test(brand), '班级徽章在左侧品牌区（横排）');
    ok(!/class-badge/.test(b.slice(iTabs, iUser)), '班级徽章没有留在页签/用户区');
    const user = b.slice(iUser);
    ok(/id="invite-btn-header"/.test(user) && /id="settings-btn-header"/.test(user) && /App\.logout\(\)/.test(user),
      '右侧用户区含 3 个按钮（邀请/设置/退出）');
    ok(/id="header-photo"/.test(user), '头像在右侧');
  }
}

section('[2] CSS：老师模式竖排标题 + 页签缩小一屏 + 学生端不受影响');
{
  ok(/writing-mode:vertical-rl/.test(htmlSrc) && /text-orientation:upright/.test(htmlSrc),
    '★ 品牌名竖排（对联式，一个字一个字往下）');
  ok(/\.navbar\.teacher-mode \.brand-name\{[^}]*writing-mode:vertical-rl/.test(htmlSrc),
    '竖排规则只在 .teacher-mode 下生效');
  ok(/flex-wrap:wrap/.test(htmlSrc.match(/\.navbar\.teacher-mode \.nav-tabs\{[^}]*\}/)?.[0] || ''),
    '页签可换行兜底：窄窗口折行也不裁切、不左右滑');
  ok(/overflow-x:visible/.test(htmlSrc.match(/\.navbar\.teacher-mode \.nav-tabs\{[^}]*\}/)?.[0] || ''),
    '老师端页签去掉横向滚动');
  ok(/\.navbar\.teacher-mode \.nav-tabs button \.icon\{display:none\}/.test(htmlSrc),
    '老师端页签去掉图标省宽度');
  ok(/max\(calc\(10px\*var\(--fs-sm\)\),var\(--fs-sm-min\)\)/.test(htmlSrc),
    '老师端页签字号缩小（10px 档）');
  ok(/@media\(min-width:769px\)/.test(htmlSrc), '竖排/缩小规则限定桌面，手机端不撑坏');
  ok(/\.nav-brand\{display:flex;align-items:center;gap:8px;flex:none\}/.test(htmlSrc),
    '左品牌区 flex 横排（标题竖排 + 班级横排并排）');
}

section('[3] app.js：老师模式标记 + 全称标题');
{
  ok(/nav\.classList\.toggle\('teacher-mode', isTeacher\)/.test(appSrc),
    '★ renderTabs 给顶栏标记 teacher-mode（学生端不加）');
  ok(/headerName\.textContent = 'Amy老师英语打卡'/.test(appSrc),
    '★ 老师端标题给全称（竖排招牌），非缩写');
  ok(/headerName\.textContent = this\.state\.userName \|\| '同学'/.test(appSrc),
    '学生端标题仍是孩子姓名，未受影响');
}

section('[4] 版本号 232：meta / preload / defer / SW / 恢复键');
{
  ok(/<meta name="app-version" content="232">/.test(htmlSrc), 'meta app-version=232');
  ok(!/app-version" content="231"/.test(htmlSrc), '没有残留 231 的 meta');
  const preloads = (htmlSrc.match(/<link rel="preload" as="script" href="[^"]+\?v=232">/g) || []).length;
  const defers = (htmlSrc.match(/<script defer src="[^"]+\?v=232"><\/script>/g) || []).length;
  ok(preloads === 3, '3 个 preload 都带 ?v=232', preloads);
  ok(defers >= 7, 'defer 脚本都带 ?v=232', defers);
  ok(/amy_boot_recover_v232/.test(htmlSrc) && !/amy_boot_recover_v231/.test(htmlSrc),
    '自愈恢复键升到 v232');
  ok(/var CACHE_NAME = 'amy-english-v232'/.test(swSrc) && /var V = 232;/.test(swSrc),
    'SW 缓存名与版本常数升到 232');
}

console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
process.exit(fail ? 1 : 0);
