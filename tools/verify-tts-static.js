/* eslint-disable */
// /api/tts 的静态预生成表校验（v97）。
//
// 固定课程的朗读音频被一次性合成成 public/tts/*.mp3，服务端命中清单就直接回
// 静态文件 —— 这是"朗读永久零成本"的全部实现。它的失效方式很隐蔽：清单和
// 请求文本对不上（归一化不一致）、静态文件没发出去、优先级排错，任何一条都会
// 让朗读悄悄回到计费通道，账单上看不出异常。所以逐条锁死。
//
//   1. 命中清单 → 回静态文件，一个上游都不碰、不记账
//   2. 清单里有、盘上没有 → 当没命中，走在线通道（不能 404 给客户端）
//   3. prefer=cf → 跳过清单（家长点名的 Cloudflare 音色，不能被顶掉）
//   4. engine=... → 跳过清单（线上排查开关，走静态就查不出来）
//   5. 清单里没有 → 走在线通道
//   6. ASSETS 绑定缺失 / 取文件抛错 → 不崩，走在线通道
//   7. 原型链上的键（constructor 等）不能被当成命中
//
// 用法：node tools/verify-tts-static.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../worker/src/index.js'), 'utf8')
  .replace("import TTS_STATIC from './tts-manifest.js';",
           'const TTS_STATIC = (typeof __TTS_STATIC === "object" && __TTS_STATIC) || {};')
  .replace('export default {', 'const __worker = {');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

const AUDIO_BYTES = new Uint8Array(2048).fill(0x61);
const STATIC_BYTES = new Uint8Array(4096).fill(0x62);   // 与在线通道不同，便于区分
const ALI_JSON = JSON.stringify({ output: { audio: { url: 'https://oss.test/a.wav' } } });

function load(opts) {
  opts = opts || {};
  const rec = { fetches: [], aiCalls: 0, cacheMatches: 0, cachePuts: 0, charsAdded: 0,
                assets: [], staticTable: opts.static || {} };
  const sandbox = {
    console, URL, Request, Response, Headers,
    AbortController, AbortSignal, btoa, atob, TextDecoder, TextEncoder,
    setTimeout, clearTimeout, ReadableStream,
    __TTS_STATIC: rec.staticTable,
    fetch: async (u, init) => {
      const url = String(u && u.url ? u.url : u);
      rec.fetches.push(url);
      if (init && init.body) (rec.bodies = rec.bodies || []).push(String(init.body));
      if (url.indexOf('dashscope.aliyuncs.com') >= 0) {
        return new Response(ALI_JSON, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.indexOf('oss.test') >= 0) {
        return new Response(AUDIO_BYTES, { status: 200, headers: { 'Content-Type': 'audio/wav' } });
      }
      return new Response(AUDIO_BYTES, { status: 200, headers: { 'Content-Type': 'audio/mp3' } });
    },
    caches: {
      default: {
        match: async () => { rec.cacheMatches++; return undefined; },
        put: async () => { rec.cachePuts++; },
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;__exports = { __worker };', sandbox);
  const worker = sandbox.__exports.__worker;

  const env = {
    AI: {
      run: async () => {
        rec.aiCalls++;
        return { audio: btoa(String.fromCharCode.apply(null, AUDIO_BYTES)) };
      },
    },
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ chars: 0 }),
          run: async () => { rec.charsAdded++; return {}; },
        }),
        run: async () => ({}),
        first: async () => ({ chars: 0 }),
      }),
    },
    ALIYUN_KEY: 'sk-test',
  };
  if (!opts.noAssets) {
    env.ASSETS = {
      fetch: async (assetReq) => {
        const u = String(assetReq && assetReq.url ? assetReq.url : assetReq);
        rec.assets.push(u);
        if (opts.assetsThrow) throw new Error('assets_down');
        if (opts.assetsHang) return new Promise(() => {});   // 永不返回：模拟实测遇到过的挂死
        if (opts.assets404) return new Response('not found', { status: 404 });
        return new Response(STATIC_BYTES, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
      },
    };
  }
  const ctx = { waitUntil: (p) => Promise.resolve(p).catch(() => {}) };
  return { worker, env, ctx, rec, call: (req) => worker.fetch(req, env, ctx) };
}

const req = (qs) => new Request('https://x.test/api/tts?' + qs, { method: 'GET' });
const ttsReq = (text) => req('text=' + encodeURIComponent(text));

(async function main() {
  const TABLE = { "What's your favorite subject at school?": 'a1b2c3.mp3' };

  console.log('== 1) 命中清单 → 直出静态文件 ==');
  let r = load({ static: TABLE });
  let res = await r.call(ttsReq("What's your favorite subject at school?"));
  ok(res.status === 200, '200 返回');
  ok(res.headers.get('X-TTS-Source') === 'static', '响应头标明 static 来源',
     res.headers.get('X-TTS-Source'));
  ok(r.rec.assets.length === 1 && r.rec.assets[0] === 'https://assets.local/tts/a1b2c3.mp3',
     '取的是清单里那个文件（用假域名，不能用自家域名 —— 会绕回本 Worker 挂死）',
     r.rec.assets.join(','));
  const bytes = new Uint8Array(await res.arrayBuffer());
  ok(bytes.length === STATIC_BYTES.length && bytes[0] === 0x62, '回的是静态文件字节，不是在线通道的');
  ok(r.rec.fetches.length === 0, '一个上游都不碰', r.rec.fetches.join(','));
  ok(r.rec.aiCalls === 0, '不烧 Cloudflare neurons');
  ok(r.rec.charsAdded === 0, '不记字符用量（账单零）');
  ok(r.rec.cacheMatches === 0 && r.rec.cachePuts === 0, '静态优先于边缘缓存，缓存都不用查');
  ok(/immutable/.test(res.headers.get('Cache-Control') || ''), '静态文件带长缓存头');

  console.log('== 2) 清单里有、盘上没有 → 静默回落 ==');
  r = load({ static: TABLE, assets404: true });
  res = await r.call(ttsReq("What's your favorite subject at school?"));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'aliyun',
     '404 时走在线通道（阿里云）', res.status + ' ' + res.headers.get('X-TTS-Source'));
  ok(r.rec.charsAdded === 1, '这条是计费的 —— 但至少孩子有声音');

  console.log('== 3) prefer=cf 必须跳过清单 ==');
  r = load({ static: TABLE });
  res = await r.call(req('text=' + encodeURIComponent("What's your favorite subject at school?")
    + '&prefer=cf'));
  ok(res.headers.get('X-TTS-Source') === 'cf', 'prefer=cf 仍走 Cloudflare 音色',
     res.headers.get('X-TTS-Source'));
  ok(r.rec.assets.length === 0, '没去碰静态文件');
  ok(r.rec.aiCalls === 1, '确实调了 Cloudflare');

  console.log('== 4) engine=... 必须跳过清单 ==');
  r = load({ static: TABLE });
  res = await r.call(req('text=' + encodeURIComponent("What's your favorite subject at school?")
    + '&engine=ali'));
  ok(r.rec.assets.length === 0, 'engine=ali 是排查开关，不走静态');
  ok(res.headers.get('X-TTS-Source') === 'aliyun', '照常走阿里云', res.headers.get('X-TTS-Source'));
  r = load({ static: TABLE });
  res = await r.call(req('text=' + encodeURIComponent("What's your favorite subject at school?")
    + '&engine=cf'));
  ok(r.rec.assets.length === 0 && res.headers.get('X-TTS-Source') === 'cf', 'engine=cf 同理');

  console.log('== 5) 清单里没有的文本 → 走在线通道 ==');
  r = load({ static: TABLE });
  res = await r.call(ttsReq('A sentence nobody pre-generated.'));
  ok(r.rec.assets.length === 0, '不去翻静态目录');
  ok(res.headers.get('X-TTS-Source') === 'aliyun', '照旧阿里云');

  console.log('== 6) ASSETS 缺失 / 抛错 → 不能崩 ==');
  r = load({ static: TABLE, noAssets: true });
  res = await r.call(ttsReq("What's your favorite subject at school?"));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'aliyun',
     '没有 ASSETS 绑定也不影响朗读', res.status + ' ' + res.headers.get('X-TTS-Source'));
  r = load({ static: TABLE, assetsThrow: true });
  res = await r.call(ttsReq("What's your favorite subject at school?"));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'aliyun',
     '静态取文件抛错也不影响朗读', res.status + ' ' + res.headers.get('X-TTS-Source'));

  console.log('== 6b) 静态取文件挂死 → 不能拖住朗读 ==');
  r = load({ static: TABLE, assetsHang: true });
  const hangT0 = Date.now();
  res = await r.call(ttsReq("What's your favorite subject at school?"));
  const hangMs = Date.now() - hangT0;
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'aliyun',
     '挂死的静态请求被超时兜住，照常出音', res.headers.get('X-TTS-Source'));
  ok(hangMs < 3000, '在预算内返回（实测 ' + hangMs + 'ms）');

  console.log('== 7) 原型链上的键不能被误命中 ==');  r = load({ static: TABLE });
  res = await r.call(ttsReq('constructor'));
  ok(r.rec.assets.length === 0, 'text=constructor 不当作命中',
     r.rec.assets.join(','));
  r = load({ static: TABLE });
  res = await r.call(ttsReq('toString'));
  ok(r.rec.assets.length === 0, 'text=toString 不当作命中', r.rec.assets.join(','));

  console.log('== 8) 空清单 = 行为不变 ==');
  r = load({ static: {} });
  res = await r.call(ttsReq('apple'));
  ok(res.headers.get('X-TTS-Source') === 'aliyun' && r.rec.assets.length === 0,
     '还没跑预生成时，一切照旧');

  console.log('\n' + (fail ? '❌ ' + fail + ' 项未通过' : '✅ 全部通过') + '（' + pass + ' 项）');
  process.exit(fail ? 1 : 0);
})();
