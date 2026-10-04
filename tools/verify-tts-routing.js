/* eslint-disable */
// /api/tts 通道顺序校验（v89 阿里云 qwen3-tts-flash 接入）。
//
// 通道顺序错了要么账单失控、要么孩子没声音听。四条必须全部可测：
//   1. 缓存命中 → 一个上游都不碰
//   2. 正常路径 → 阿里云主通道，返回音频字节，写边缘缓存，记字符数
//   3. 当天字符超上限 → 跳过阿里云直接落 Cloudflare（账单封顶）
//   4. 阿里云挂 → 落 Cloudflare；Cloudflare 也挂 → 百度/有道兜底
// worker 源码原样装进 vm，stub 掉 fetch / env.AI / caches / env.DB。
//
// 用法：node tools/verify-tts-routing.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../worker/src/index.js'), 'utf8')
  .replace('export default {', 'const __worker = {');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

const AUDIO_BYTES = new Uint8Array(2048).fill(0x61);   // 伪音频，>500 字节
const ALI_JSON = JSON.stringify({
  output: { audio: { url: 'https://oss.test/audio/x.wav?sig=1' } },
  usage: { characters: 12 },
});

function load(opts) {
  opts = opts || {};
  const rec = { fetches: [], aiCalls: 0, cachePuts: 0, charsAdded: 0, aiModel: '' };
  const sandbox = {
    console, URL, Request, Response, Headers,
    AbortController, AbortSignal, btoa, atob, TextDecoder, TextEncoder,
    setTimeout, clearTimeout, ReadableStream,
    fetch: async (u, init) => {
      const url = String(u && u.url ? u.url : u);
      rec.fetches.push(url);
      if (init && init.body) (rec.bodies = rec.bodies || []).push(String(init.body));
      if (url.indexOf('dashscope.aliyuncs.com') >= 0) {
        if (opts.aliThrows) throw new Error('aliyun_down');
        return new Response(ALI_JSON, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.indexOf('oss.test') >= 0) {
        if (opts.ossThrows) throw new Error('oss_down');
        return new Response(AUDIO_BYTES, { status: 200, headers: { 'Content-Type': 'audio/wav' } });
      }
      if (opts.fbThrows) throw new Error('fallback_down');
      return new Response(AUDIO_BYTES, { status: 200, headers: { 'Content-Type': 'audio/mp3' } });
    },
    caches: {
      default: {
        match: async () => (opts.cacheHit ? new Response(AUDIO_BYTES) : undefined),
        put: async () => { rec.cachePuts++; },
      },
    },
  };
  vm.createContext(sandbox);
  sandbox.__exports = null;
  vm.runInContext(src + '\n;__exports = { __worker };', sandbox);
  const worker = sandbox.__exports.__worker;
  const env = {
    AI: {
      run: async (model, input) => {
        rec.aiCalls++; rec.aiModel = model;
        if (opts.aiThrows) throw new Error('4006: neurons exhausted');
        if (opts.aiEmpty) return { audio: '' };
        return { audio: btoa(String.fromCharCode.apply(null, AUDIO_BYTES)) };
      },
    },
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ chars: opts.usedChars || 0 }),
          run: async () => { rec.charsAdded++; return {}; },
        }),
        run: async () => ({}),
        first: async () => ({ chars: opts.usedChars || 0 }),
      }),
    },
    ALIYUN_KEY: 'sk-test',
  };
  const ctx = { waitUntil: p => Promise.resolve(p).catch(() => {}) };
  const call = (req) => worker.fetch(req, env, ctx);
  return { worker, env, ctx, rec, call };
}

function ttsReq(text) {
  return new Request('https://x.test/api/tts?text=' + encodeURIComponent(text), { method: 'GET' });
}

(async function main() {
  console.log('== 1) 缓存命中 ==');
  let r = load({ cacheHit: true });
  let res = await r.call(ttsReq('apple'));
  ok(r.rec.fetches.length === 0 && r.rec.aiCalls === 0, '命中缓存：不碰任何上游');
  ok(res.status === 200, '直接返回缓存音频');

  console.log('== 2) 正常路径：阿里云主通道 ==');
  r = load({});
  res = await r.call(ttsReq('apple'));
  ok(res.status === 200, '200 返回');
  ok(res.headers.get('X-TTS-Source') === 'aliyun', '响应头标明 aliyun 来源');
  ok(r.rec.fetches.some(u => u.indexOf('dashscope.aliyuncs.com') >= 0), '调了 dashscope 生成');
  ok(r.rec.fetches.some(u => u.indexOf('oss.test') >= 0), '把 OSS 直链音频取回字节');
  ok(r.rec.aiCalls === 0, '没烧 Cloudflare neurons');
  ok(r.rec.charsAdded === 1, '字符用量已记账');
  ok(r.rec.cachePuts === 1, '结果写边缘缓存');
  ok((r.rec.bodies || []).some(b => b.indexOf('"language_type":"English"') >= 0), '英文文本 → language_type=English');
  const body = new Uint8Array(await res.arrayBuffer());
  ok(body.length === 2048, '返回的是取回的音频字节（' + body.length + 'B）');

  console.log('== 3) 中文文本走 Chinese ==');
  r = load({});
  res = await r.call(ttsReq('苹果很好吃'));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'aliyun', '中文文本同样走阿里云');
  ok((r.rec.bodies || []).some(b => b.indexOf('"language_type":"Chinese"') >= 0), '含中文 → language_type=Chinese');

  console.log('== 4) 超日上限 → 落 Cloudflare ==');
  r = load({ usedChars: 30000 });
  res = await r.call(ttsReq('apple'));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'cf', '字符超 30000 → 直接走 Cloudflare');
  ok(r.rec.aiCalls === 1 && r.rec.aiModel === '@cf/deepgram/aura-2-en', '用的是 Deepgram aura');
  ok(!r.rec.fetches.some(u => u.indexOf('dashscope') >= 0), '没碰阿里云（账单封顶）');
  ok(r.rec.charsAdded === 0, '不记阿里云字符');

  console.log('== 5) 阿里云挂 → Cloudflare；Cloudflare 也挂 → 免费兜底 ==');
  r = load({ aliThrows: true });
  res = await r.call(ttsReq('apple'));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'cf', '阿里云挂 → Cloudflare 接住，孩子有声音听');
  r = load({ aliThrows: true, aiThrows: true });
  res = await r.call(ttsReq('apple'));
  ok(res.status === 200 && res.headers.get('X-TTS-Source') === 'fallback', '全挂 → 百度/有道兜底');
  r = load({ aliThrows: true, aiThrows: true, fbThrows: true });
  res = await r.call(ttsReq('apple'));
  ok(res.status === 502, '三条通道全挂 → 502（客户端走 speechSynthesis）');

  console.log('== 6) 防御 ==');
  r = load({});
  res = await r.call(ttsReq(''));
  ok(res.status === 400, '空文本 → 400');
  r = load({});
  res = await r.call(ttsReq('x'.repeat(901)));
  ok(res.status === 413, '超长文本 → 413');

  console.log(fail === 0 ? '\n全部通过（' + pass + ' 项）✅' : '\n有 ' + fail + ' 项失败 ❌');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('脚本异常：', e); process.exit(1); });
