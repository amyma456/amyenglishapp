// v145 验证：中途不再因网络查不到而踢人 + 核对失败页自动重试 + 草稿三重存储
// 家长 2026-10-19：①「登进去没多久就显示暂时无法进入/你已被移出班级，
// 重新核对很久也登不进去」②「一刷新还是没有手机号和姓名」
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(ROOT, 'public/api.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');

let fail = 0;
const ok = (cond, msg, extra) => {
  console.log((cond ? '  OK   ' : '  FAIL ') + msg + (cond || extra == null ? '' : ' —— ' + extra));
  if (!cond) fail++;
};

// 去注释后的源码（防断言被注释误伤）
const appCode = appSrc.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
  .map(l => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

console.log('== 1. 中途网络查不到：只挂横幅，绝不踢人 ==');
{
  const idx = appCode.indexOf('const st = await Api.classStatus(this.state.phone);');
  ok(idx > 0, '找到周期核对调用');
  const near = appCode.slice(idx, idx + 900);
  ok(!/_netBanner\(true\)/.test(near),
     'v146：查不到时**什么都不显示**（家长不要"网络不太稳定"那句话）');
  ok(!/showGateCheckFailed/.test(near), '不再把孩子请到核对页');
  ok(!/_gateMissStreak/.test(appCode), '连败计数踢人逻辑已整体删除');
  ok(/st\.removed\)\s*\{\s*this\.showRemovedPage\(st\)/.test(near),
     '只有服务器明确 removed 才请出');
}

console.log('== 2. 核对失败页：不再顶着"被移出"的标题 ==');
{
  ok(/id="removed-title"/.test(htmlSrc) && /id="removed-subtitle"/.test(htmlSrc),
     '标题/副标题改为动态元素');
  const gcf = appCode.slice(appCode.indexOf('showGateCheckFailed(phone, name) {'),
                            appCode.indexOf('showGateCheckFailed(phone, name) {') + 2200);
  ok(/连不上服务器/.test(gcf), '标题改成"连不上服务器"');
  ok(/这不是被移出班级/.test(gcf), '副标题明确"别担心，这不是被移出班级"');
  ok(/_gateAutoRetry\(phone, name, 6\)/.test(gcf), '进入页面即启动自动重试（6 次）');
  ok(/_deviceKnows\(phone\)\) this\.registerStudent\(phone, name, true\)/.test(gcf),
     '设备认识这个号 → 重试秒回 App（不等网络）');
  ok(!/你已被移出班级/.test(gcf), '核对失败路径里不再出现"你已被移出班级"');
}

console.log('== 3. 自动重试的安全边界（v132 红线仍守着） ==');
{
  const ar = appCode.slice(appCode.indexOf('_gateAutoRetry(phone, name, left) {'),
                           appCode.indexOf('_gateAutoRetry(phone, name, left) {') + 900);
  ok(/_deviceKnows\(phone\)\) \{ self\.registerStudent\(phone, name, true\); return; \}/.test(ar),
     '自动重试也只对"认识的设备"走免核对');
  const s = await0(ar);
  function await0(){ return ar; }
  ok(/const s = await Api\.classStatus\(phone\);/.test(ar), '不认识的设备仍走网络核对');
  ok(/s !== null && !s\.removed/.test(ar) && /s !== null && s\.removed/.test(ar),
     'null 一律继续重试，绝不放行也绝不误判');
  const rp = appCode.slice(appCode.indexOf('_gateAutoRetry(phone, name, left) {'),
                           appCode.indexOf('_gateAutoRetry(phone, name, left) {') + 900);
  ok(/removed-page'\)\;?\s*$/.test('') || /classList\.contains\('hidden'\)/.test(rp),
     '页面被接走就停止重试');
}

console.log('== 4. 横幅彻底消失（v146） ==');
{
  ok(appSrc.indexOf('网络不太稳定') < 0 && appSrc.indexOf('不用管它') < 0,
     '★ app.js 里已经没有"网络不太稳定…不用管它"字样');
  const fn = appCode.slice(appCode.indexOf('_netBanner(show) {'),
                            appCode.indexOf('_netBanner(show) {') + 320);
  ok(!/appendChild/.test(fn) && !/createElement/.test(fn),
     '★ _netBanner 不再新建任何横幅元素');
  ok(appCode.indexOf('_netBanner(false)') !== -1 && /logout\(\)[\s\S]{0,200}_netBanner\(false\)/.test(appSrc),
     '退出登录仍会摘掉可能残留的横幅');
}

console.log('== 5. 草稿三重存储（localStorage + sessionStorage + cookie） ==');
{
  ok(/sessionStorage\.setItem\(this\.DRAFT_KEY/.test(apiSrc), '写入 sessionStorage');
  ok(/sessionStorage\.getItem\(this\.DRAFT_KEY/.test(apiSrc), '读取时 sessionStorage 兜底');
  const body = apiSrc.slice(apiSrc.indexOf('readLoginDraft() {'),
                            apiSrc.indexOf('writeLoginDraft(phone, name, known) {'));
  const i1 = body.indexOf('localStorage.getItem(this.DRAFT_KEY');
  const i2 = body.indexOf('sessionStorage.getItem(this.DRAFT_KEY');
  const i3 = body.indexOf('this._draftCookieRead()');
  const i4 = body.indexOf('this.readLogin()');
  ok(i1 >= 0 && i1 < i2 && i2 < i3 && i3 < i4,
     '兜底顺序：localStorage → sessionStorage → cookie → 正式凭据',
     [i1, i2, i3, i4].join(','));
}

console.log('== 6. 版本号 147 三处同步 ==');
{
  ok(/app-version" content="168"/.test(htmlSrc), 'index.html meta = 145');
  ok((htmlSrc.match(/\?v=168/g) || []).length >= 5, '脚本引用 ?v=168（' + (htmlSrc.match(/\?v=168/g) || []).length + ' 处）');
  ok(/amy-english-v168/.test(swSrc) && /var V = 168;/.test(swSrc), 'sw.js 缓存名与 V = 145');
}

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
