// Service Worker for Amy English Platform
//
// v135 策略大改：NETWORK-FIRST → STALE-WHILE-REVALIDATE（SWR）。
//
// 为什么必须改：网络优先意味着**每次**打开页面都要等网络把 index.html +
// 全部 JS 重新下完才显示。以前文件小（几百 KB）感觉不到；现在光
// app.js + data.js + index.html 就 1MB 出头，手机上登录页要转好几秒 ——
// 老师原话「输入手机号要转好久，以前不会」。
//
// SWR 的行为：
//   · 有缓存 → **立刻**用缓存（毫秒级开屏，离线也能开）
//   · 同时后台悄悄拉最新版写回缓存 → **下次**打开就是新版
//   · 页面里的版本探针（?vchk=）发现版本落后就静默刷新一次，
//     刷新本身也走缓存，所以是"闪一下"，不是"转圈圈"
//
// 为什么不会再出现"修复永远不生效"（当年被迫改网络优先的原因）：
//   1. 版本探针绕过 SW 直连网络比对版本号，落后即刷新（index.html 注册块）；
//   2. 发版时 CACHE_NAME / V 一起升，旧缓存整体作废，新 SW 的 install
//      会把带 ?v= 的新脚本**预存**进缓存 —— 更新后的第一次启动也是秒开；
//   3. skipWaiting + clients.claim 保证新 SW 立即接管。

var CACHE_NAME = 'amy-english-v164';
// 与 index.html 里 script src 的 ?v= 保持一致（发版时一起改这一个数字）。
var V = 164;

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // 脚本必须带 ?v= 预存：页面引用的是带版本号的 URL，
      // 只存裸文件名的话 SWR 查不到，发版后的第一次启动还是会等网络。
      return cache.addAll([
        './',
        './index.html',
        './cloud.js?v=' + V,
        './data.js?v=' + V,
        './recorder.js?v=' + V,
        './api.js?v=' + V,
        './app.js?v=' + V,
        './icon.svg',
        './photo.jpeg',
        './students.jpeg',
        './manifest.json',
        // PNG 图标：iOS 装到主屏幕后从这里取；不预存 512 那两张大图，
        // 首次安装的等待时间比"图标离线可用"重要。
        './icons/favicon-32.png',
        './icons/apple-touch-icon-180.png',
        './icons/icon-192.png',
        './icons/icon-maskable-192.png'
      ]);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  // Skip cross-origin requests (TTS APIs, cloud sync)
  if (url.origin !== location.origin) {
    return;
  }
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  // 动态接口绝不经手 —— 打卡、状态、成绩都是一次性的，缓存了就是事故。
  if (url.pathname.indexOf('/api/') === 0) {
    return;
  }
  // 版本探针（index.html 的 __checkVersion）：必须看到**线上最新**的首页，
  // 走缓存就没意义了。直连网络，也不写回缓存。
  if (url.search.indexOf('vchk=') !== -1 || event.request.cache === 'no-store') {
    event.respondWith(fetch(event.request));
    return;
  }

  // SWR：缓存先答，网络后台刷新。
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cached) {
        if (!cached) {
          // 兜底：裸文件名匹配。预存的是 ?v= 版本化 URL，而旧页面在
          // 新 SW 接管的瞬间还可能来要旧版本号的脚本 —— 用内容别让
          // 它等网络（同一代缓存里只有一份内容，不会串版本）。
          return cache.match(event.request, { ignoreSearch: true }).then(function(loose) {
            if (loose) { refresh(cache, event.request); return loose; }
            return fetch(event.request).then(function(res) {
              if (res && res.status === 200) {
                cache.put(event.request, res.clone());
              }
              return res;
            }).catch(function() {
              // 完全离线且什么都没有：页面导航退回首页，其余报错
              if (event.request.mode === 'navigate' || event.request.destination === 'document') {
                return cache.match('./index.html');
              }
              throw new Error('offline and not cached');
            });
          });
        }
        // 有缓存：马上返回，同时后台刷新（下次打开/刷新就是新版）。
        refresh(cache, event.request);
        return cached;
      });
    })
  );

  function refresh(cache, request) {
    fetch(request).then(function(res) {
      if (res && res.status === 200) {
        cache.put(request, res.clone());
      }
    }).catch(function() {}); // 后台刷新失败无所谓，缓存还在
  }
});
