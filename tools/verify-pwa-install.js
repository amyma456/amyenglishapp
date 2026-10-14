/* PWA 可安装性红线（v108）。
 *
 * 背景：图标原本只有一张 SVG。iOS 的"添加到主屏幕"不认 SVG —— 家长装出来
 * 是白板或网页截图，这是"网页版不像 APP"的直接原因之一。v108 补了 PNG
 * 图标组 + iOS 启动图 + manifest 的 id/scope。本测试把这套东西钉住：
 * 以后谁把 apple-touch-icon 改回 SVG、把 manifest 图标删了、或删了启动图，
 * 这里直接报错。
 *
 * Run: node tools/verify-pwa-install.js
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  OK', msg); }
  else { fail++; console.log('  FAIL', msg); }
}

const html = fs.readFileSync(BASE + 'index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync(BASE + 'manifest.json', 'utf8'));
const sw = fs.readFileSync(BASE + 'sw.js', 'utf8');

console.log('=== 1. manifest：PNG 图标 + 双端必要字段 ===');
const icons = manifest.icons || [];
ok(icons.some(i => i.sizes === '192x192' && i.type === 'image/png'), '有 192x192 PNG 图标（Chrome 可安装性要求）');
ok(icons.some(i => i.sizes === '512x512' && i.type === 'image/png'), '有 512x512 PNG 图标');
ok(icons.some(i => i.purpose === 'maskable'), '有 maskable 图标（安卓圆形裁切不吃掉人像）');
ok(!icons.some(i => /svg/.test(i.type || '')), 'manifest 里不再有 SVG 图标');
ok(manifest.display === 'standalone', 'display=standalone（装后无浏览器地址栏）');
ok(!!manifest.id, 'manifest 有 id（安装后身份稳定，升级不丢桌面图标）');
ok(!!manifest.scope, 'manifest 有 scope（站内跳转不逃出 APP 窗口）');
ok(manifest.background_color === '#FFF9F5' && manifest.theme_color === '#FF8C42', '启动/主题色与页面一致');

console.log('=== 2. index.html：iOS 图标与启动图 ===');
ok(/rel="apple-touch-icon"[^>]*sizes="180x180"[^>]*href="icons\/apple-touch-icon-180\.png"/.test(html.replace(/\s+/g, ' ')),
   'apple-touch-icon 指向 180px PNG（iOS 唯一认的格式）');
ok(!/rel="apple-touch-icon"[^>]*href="icon\.svg"/.test(html.replace(/\s+/g, ' ')), 'apple-touch-icon 不再指向 SVG');
ok((html.match(/apple-touch-startup-image/g) || []).length >= 15, 'iOS 启动图 ≥15 台设备（覆盖主流 iPhone/iPad）');
ok(/iphone-15\.png/.test(html) && /ipad-pro129\.png/.test(html), '新机型（15/16 系）与 iPad Pro 都有');
ok(/name="mobile-web-app-capable"/.test(html), '有 mobile-web-app-capable（安卓 Chrome 的全屏声明）');

console.log('=== 3. 文件真实存在（部署少了文件 = 装出来白图标）===');
for (const f of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png',
                 'icons/icon-maskable-512.png', 'icons/apple-touch-icon-180.png', 'icons/favicon-32.png']) {
  ok(fs.existsSync(BASE + f), f + ' 存在');
}
const splashMissing = [];
for (const m of html.matchAll(/href="splash\/([a-z0-9-]+\.png)"/g)) {
  if (!fs.existsSync(BASE + 'splash' + path.sep + m[1])) splashMissing.push(m[1]);
}
ok(splashMissing.length === 0, '启动图全部在盘上' + (splashMissing.length ? '（缺 ' + splashMissing.join(',') + '）' : ''));

console.log('=== 4. service worker：缓存版本已推进 ===');
const v = (sw.match(/CACHE_NAME = 'amy-english-v(\d+)'/) || [])[1];
const hv = (html.match(/app-version" content="(\d+)"/) || [])[1];
ok(!!v, 'sw.js 有版本号（v' + v + '）');
ok(v === hv, 'sw 缓存版本与页面 app-version 一致（v' + v + ' = v' + hv + '）');
ok(/icons\/apple-touch-icon-180\.png/.test(sw), 'SW 预缓存里有 PNG 图标（离线启动也不白屏）');

console.log('=== 5. 安装引导仍在（v94 已有，不许顺手删）===');
ok(/beforeinstallprompt/.test(html), '安卓 beforeinstallprompt 横幅还在');
ok(/ios-install-guide|添加到主屏幕/.test(html), 'iOS「添加到主屏幕」引导还在');
ok(/display-mode: standalone/.test(html), '已安装（standalone）时不再打扰的判断还在');

console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ ' + pass + ' 项全部通过'));
process.exit(fail ? 1 : 0);
