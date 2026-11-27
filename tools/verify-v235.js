/* eslint-disable */
// v235 校验：
//   A. 后台 /api/device/report 去重把 standalone 纳入比较 —— 孩子"添加到桌面"
//      后 standalone 0→1 能落库（之前被当成"没变化"吞掉，Yunus 就是这样丢的）
//   B. 老师端设备表加「添加到桌面」列，任一设备 standalone=1 就显示已添加
//   C. 品牌名换「Amy英语打卡平台」
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const workerSrc = fs.readFileSync(path.join(root, 'worker/src/index.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  [' + extra + ']' : '')); }
}
function section(s) { console.log('\n' + s); }

section('[1] 后台去重 bug 修复：standalone 变化必须写库');
{
  ok(workerSrc.indexOf("path === '/api/device/report'") > 0, '上报接口存在');
  // SELECT 里要带上 standalone
  ok(/SELECT ua, model, browser, is_stock, standalone, updated_at FROM student_devices/.test(workerSrc),
    '★ 去重查询 SELECT 带上 standalone 字段');
  // 比较条件里要含 standalone
  ok(/Number\(prev\.standalone \|\| 0\) === v\.standalone/.test(workerSrc),
    '★ 去重条件比较 prev.standalone 与本次 standalone');
  // 保留原有的省写入逻辑
  ok(/unchanged: true/.test(workerSrc), '原有 unchanged 省写入逻辑保留');
  ok(/updated_at.*< 86400000/.test(workerSrc), '24 小时窗口保留');
  // 写入时 standalone 仍落库
  ok(/standalone\s*=\s*excluded\.standalone/.test(workerSrc), 'ON CONFLICT 更新 standalone 字段');
}

section('[2] 老师端设备表：新增「添加到桌面」列');
{
  ok(/<span>姓名<\/span><span>手机型号<\/span>/.test(appSrc)
    && /<span>系统<\/span><span>添加到桌面<\/span>/.test(appSrc),
    '★ 表头新增「添加到桌面」列');
  ok(/addedDesktop \? '✅ 已添加' : '—'/.test(appSrc),
    '★ standalone=1 显示「✅ 已添加」，否则「—」');
  ok(/devs\.some\(function \(x\)/.test(appSrc),
    '★ 同一学生多台设备按"任一已添加即算已添加"聚合（Yunus 两台小米的情况）');
  ok(/Number\(x\.standalone \|\| 0\) === 1/.test(appSrc), '聚合按 standalone===1 判定');
  // grid 从 5 列改 6 列
  ok(/grid-template-columns:1fr 1\.5fr 1fr 1\.3fr \.9fr \.9fr/.test(htmlSrc),
    '★ 设备表 grid 从 5 列改成 6 列');
  ok(/\.dev-head\{display:none\}/.test(htmlSrc), '窄屏隐藏表头规则保留');
}

section('[3] 品牌名 Amy英语打卡平台');
{
  ok(/headerName\.textContent = 'Amy英语打卡平台'/.test(appSrc),
    '★ 老师品牌名＝Amy英语打卡平台');
  ok(/class="brand-name">Amy英语打卡平台</.test(htmlSrc),
    '首帧骨架默认文案同步为 Amy英语打卡平台');
  ok(!/headerName\.textContent = '艾米少儿英语老师'/.test(appSrc), '旧"艾米少儿英语老师"已移除');
  ok(!/class="brand-name">艾米少儿英语老师</.test(htmlSrc), 'HTML 里无残留旧文案');
}

section('[4] 既有约定不破坏');
{
  ok(/flex-direction:column/.test(htmlSrc) && /\.navbar\.teacher-mode #header-name\{max-width:none/.test(htmlSrc),
    'v234 班级下移 + 品牌名不截断规则保留');
  ok(/\.container\.teacher-mode\{max-width:none/.test(htmlSrc), '顶栏拉满整屏保留');
  const EXPECTED = ['weekly', 'errors', 'preview', 'checkin', 'wordgame', 'daily',
    'edit', 'scores', 'print', 'speaking', 'students', 'classmgmt'];
  let all = true;
  for (const id of EXPECTED) if (!new RegExp("\\{ id: '" + id + "'").test(appSrc)) all = false;
  ok(all, '12 个页签顺序未改');
}

section('[5] 版本号 235');
{
  ok(/app-version" content="235"/.test(htmlSrc), 'index.html app-version=235');
  ok((htmlSrc.match(/\?v=235/g) || []).length >= 1, '静态资源 ?v=235 已刷');
  ok(/amy_boot_recover_v235/.test(htmlSrc), '自愈键 v235');
  ok(/amy-english-v235/.test(swSrc) && /var V = 235;/.test(swSrc), 'sw.js 缓存版本 v235');
  ok(!/app-version" content="234"/.test(htmlSrc), '无残留 234');
}

console.log('\n========================================');
console.log('v235 校验结果：' + pass + ' 通过 / ' + fail + ' 失败');
console.log('========================================');
process.exit(fail ? 1 : 0);
