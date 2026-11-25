// verify-v227.js — 修「麦克风出错后重进一直进不去 / 页面无响应」
//
// 家长 2026-11-25：Gary 打卡几分钟后提示麦克风有问题，重进一直停在开屏，
// Chrome 弹「页面无响应」，点恢复也没用。
//
// 根因链（静态锁死，防止回归）：
//   ① 麦克风异常时 Recorder._active 可能一直不落 → recording() 永远 true；
//   ② __safeReload 只在 recording() 为假时才 reload，且没有次数上限 →
//      版本更新永远刷不动，旧页面一直挂着；
//   ③ 残留 worklet / 流继续往主线程灌音频帧，手机上Renderer被拖到无响应；
//   ④ showApp() 中途出错时开屏没人摘，孩子只能反复重进。
//
// 本脚本验证：刷新看门狗有上限且会强制收尾、Recorder 有 forceStop 和
// 看门狗、启动/切后台都会清理、开屏有 22 秒自愈兜底、版本号统一 227。
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '  (' + detail + ')' : '')); }
}
function section(t) { console.log('\n【' + t + '】'); }

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const rec = fs.readFileSync(path.join(ROOT, 'public', 'recorder.js'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');

section('1. 刷新看门狗：不再无限等录音');
const reloadAt = html.indexOf('window.__safeReload = function');
const reloadBody = html.slice(reloadAt, reloadAt + 1200);
ok(/__safeReloadTries = \(window\.__safeReloadTries \|\| 0\) \+ 1/.test(reloadBody),
  '★ 重试有计数，不会无限 5 秒循环');
ok(/window\.__safeReloadTries <= 3/.test(reloadBody), '★ 最多等 3 次就放行');
ok(/setTimeout\(window\.__safeReload, 5000\)/.test(reloadBody), '录音中仍先等 5 秒（保护不丢）');
ok(/Recorder\.forceStop\(\)/.test(reloadBody), '★ 强制刷新前先收掉残留录音');
ok(/window\.location\.reload\(\)/.test(reloadBody), '到点确实刷新');

section('2. Recorder：任何出口都不留半条管道');
ok(/forceStop\(\) \{/.test(rec), '★ 有无条件收尾的 forceStop()');
ok(/_dispose\(a\) \{/.test(rec) && /clearTimeout\(a\.watchT\)/.test(rec),
  '★ 拆管道时连看门狗一起清，轨道也关掉');
ok(/stream\.getTracks\(\)\.forEach\(t => t\.stop\(\)\)/.test(rec), '麦克风轨道确实关闭');
ok(/if \(this\._active && options\.pre === true\) this\.forceStop\(\)/.test(rec),
  '★ 新一路录音前先收掉旧的，杜绝两条流同时灌主线程');
ok(/a\.watchT = setTimeout[\s\S]{0,160}180000/.test(rec), '★ 3 分钟兜底看门狗');
ok(/window\.addEventListener\('pagehide', bye\)/.test(rec)
  && /visibilitychange[\s\S]{0,120}document\.hidden\) bye\(\)/.test(rec),
  '★ 关页面 / 切后台强制收尾');

section('3. 启动与开屏自愈');
ok(/window\.Recorder = Recorder/.test(app),
  '★ Recorder 挂到 window（否则 __safeReload 的录音判断永远为假）');
ok(/async init\(\) \{[\s\S]{0,520}Recorder\.forceStop\(\)/.test(app),
  '★ 启动时先清掉上次残留录音');
ok(/amy_boot_recover_v227/.test(html) &&
   /location\.replace\(location\.pathname \+ '\?recover=1'\)/.test(html) &&
   /\}, 10000\);/.test(html),
  '★ 脚本没加载出来时清缓存硬刷一次（只一次）');
ok(/\}, 22000\);/.test(html) && /window\.App\.showApp\(\)/.test(html.slice(html.indexOf('}, 22000)') - 900)),
  '★ 22 秒开屏兜底会补一次 showApp');
ok(/var s5 = document\.getElementById\('boot-splash'\)/.test(html)
  && /lp2\.classList\.remove\('hidden'\)/.test(html),
  '★ 补不回来就摘开屏露登录页，不再无限等');

section('4. 版本统一 v227');
ok(/app-version" content="227"/.test(html), 'index.html meta 227');
ok((html.match(/\?v=227/g) || []).length === 10, '10 处脚本 ?v=227');
ok(/amy-english-v227/.test(sw) && /var V = 227;/.test(sw), 'sw.js 缓存版本 227');

console.log('\n结果: ' + passed + ' 通过 / ' + failed + ' 失败');
if (failed) process.exit(1);
