// verify-fast-update.js — v135 秒开 + 静默更新回归
//
// 背景（老师 2026-10-16 反馈）：手机上登录页要转好久，"以前不会"。
// 根因：sw.js 一直是 NETWORK-FIRST —— 每次开屏都等网络重新下 1MB+ 的
// index.html + app.js + data.js；文件随版本越长越大，等待越来越长。
// 另一个要求：版本更新要"后台直接更新，感受不到刷新的动作"。
//
// 本测试用源码静态断言锁住这几个关键行为（SW 行为无法在 node 里真跑，
// 断言源码语义 + 用 new Function 校验语法可解析）：
//   ① sw.js 是 SWR：缓存先答 + 后台刷新；/api/* 与版本探针 ?vchk= 绕过
//   ② install 预存的是带 ?v= 版本号的脚本（发版后首次启动也秒开）
//   ③ skipWaiting + clients.claim 还在（新版本立刻接管）
//   ④ 自动刷新走 __safeReload：正在录音绝不刷新（不能掐断孩子跟读）
//   ⑤ 版本探针 URL 带 ?vchk=（走缓存永远和自己比，白查）
//   ⑥ api.amyeng.top preconnect（登录首调省握手）
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function ok(cond, name, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '  (' + detail + ')' : '')); }
}
function section(t) { console.log('\n【' + t + '】'); }

const ROOT = path.join(__dirname, '..');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');

// 语法可解析（SW 在真浏览器里跑，这里至少保证不是坏的）
section('⓪ 语法');
try { new Function(swSrc); ok(true, 'sw.js 语法可解析'); }
catch (e) { ok(false, 'sw.js 语法可解析', e.message); }
try { new Function(htmlSrc.match(/<script>\r?\n\/\/ Register Service Worker[\s\S]*?<\/script>/)[0].replace(/<\/?script>/g, '')); ok(true, '注册块语法可解析'); }
catch (e) { ok(false, '注册块语法可解析', e.message); }

section('① sw.js 缓存策略（SWR）');
ok(/caches\.open\(CACHE_NAME\)\.then\(function\(cache\) \{\s*return cache\.match/.test(swSrc),
   'fetch 先查缓存（缓存优先 = 秒开）');
ok(/function refresh\(cache, request\)/.test(swSrc) && /cache\.put\(request, res\.clone\(\)\)/.test(swSrc),
   '后台刷新写回缓存（下次打开就是新版）');
ok(/url\.pathname\.indexOf\('\/api\/'\) === 0/.test(swSrc),
   '★ /api/* 绕过 SW（打卡/状态/成绩绝不缓存）');
ok(/url\.search\.indexOf\('vchk='\) !== -1/.test(swSrc),
   '★ 版本探针 ?vchk= 绕过 SW（必须看到线上最新版）');
ok(/NETWORK-FIRST strategy: always fetch/i.test(swSrc) === false, '网络优先的旧策略正文已删');
ok(/STALE-WHILE-REVALIDATE/.test(swSrc), '新策略注释在位（SWR）');

section('② 版本化预存');
ok(/'\.\/app\.js\?v=' \+ V/.test(swSrc) && /'\.\/data\.js\?v=' \+ V/.test(swSrc),
   '★ install 预存带 ?v= 的脚本（发版后首次启动也秒开）');
// v220：改为跟随当前发版版本（以前写死 208，每次回归都误报）。
const curV = (swSrc.match(/var V = (\d+);/) || [])[1] || '';
const curMeta = (htmlSrc.match(/name="app-version" content="(\d+)"/) || [])[1] || '';
ok(!!curV && curV === curMeta, 'sw.js V 与 index.html app-version 一致', curV + ' / ' + curMeta);
ok(/cache\.match\(event\.request, \{ ignoreSearch: true \}\)/.test(swSrc),
   '裸文件名兜底匹配（新旧版本号交接瞬间不等网络）');

section('③ 新版接管');
ok(/self\.skipWaiting\(\)/.test(swSrc), 'skipWaiting 还在');
ok(/self\.clients\.claim\(\)/.test(swSrc), 'clients.claim 还在');
ok(/caches\.delete\(name\)/.test(swSrc), 'activate 清旧缓存还在');

section('④ 静默更新 + 录音保护');
ok(/window\.__safeReload = function/.test(htmlSrc), '★ 自动刷新统一走 __safeReload');
ok(/if \(window\.Recorder && Recorder\.recording && Recorder\.recording\(\)\)/.test(htmlSrc),
   '★ 正在录音绝不刷新（推迟 5 秒）', '掐断孩子跟读是事故');
ok(/setTimeout\(window\.__safeReload, 5000\)/.test(htmlSrc), '录音中推迟 5 秒重试');
// v220：SW 接管与版本自检**共用一个闸门**，避免发版当天连刷两次。
// 两条路都收敛到 __amyReloadOnce() → 内部仍走 __safeReload()（录音保护不丢）。
ok(/controllerchange[\s\S]{0,220}__amyReloadOnce\(\)/.test(htmlSrc) &&
   /__amyReloadOnce = function[\s\S]{0,220}__safeReload\(\)/.test(htmlSrc),
   '新 SW 接管与版本自检共用闸门，仍走 __safeReload（不是裸 reload）');
// v220 反转了 v200 的做法：以前版本落后先 caches.delete 清掉全部缓存再刷，
// 结果把新 SW 刚预存的 2MB 脚本也删了，reload 全部重新下载 —— 发版当天
// 每个学生第一次打开都白等好几秒。现在导航本来就网络优先，直接刷即可。
ok(/if \(!live \|\| live === __myVersion\) return;/.test(htmlSrc) &&
   /window\.__amyReloadOnce\(\)/.test(htmlSrc) &&
   !/caches\.delete\(n\)/.test(htmlSrc) &&
   !/var go = function/.test(htmlSrc),
   '版本落后只刷一次、不再清空缓存（脚本命中新 SW 预存）');
ok(/__amyReloadDone/.test(htmlSrc), '防刷新循环的守卫还在');
// 开屏自检从 3 秒推到 8 秒，别在孩子刚落地时整页刷新。
ok(/setTimeout\(__checkVersion, 8000\)/.test(htmlSrc),
   '开屏版本自检让出首帧（8 秒后）');

section('⑤ 版本探针');
ok(/fetch\('\.\/\?vchk=' \+ Date\.now\(\), \{ cache: 'no-store' \}\)/.test(htmlSrc),
   '探针 URL 带 ?vchk=（SW 直连网络）');
ok(/setInterval\(function\(\) \{ __swCheck\(\); __checkVersion\(\); \}, 10 \* 60 \* 1000\)/.test(htmlSrc),
   '挂着不动也每 10 分钟查一次');

section('⑥ 登录提速');
ok(/<link rel="preconnect" href="https:\/\/api\.amyeng\.top" crossorigin>/.test(htmlSrc),
   '★ api.amyeng.top preconnect（登录首调省 DNS+握手）');

console.log('\n=========================================');
console.log(failed === 0
  ? '全部通过 ✅ （' + passed + ' 项）'
  : '有失败 ❌ （通过 ' + passed + ' / 失败 ' + failed + '）');
process.exit(failed === 0 ? 0 : 1);
