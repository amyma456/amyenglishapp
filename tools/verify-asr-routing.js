/* eslint-disable */
// 一次性校验脚本：/api/transcribe 的双通道路由（v88 阿里云接入）。
//
// 这块逻辑错一点点就是"孩子这次朗读白读"：中文该优先走阿里云、英文该留在
// Cloudflare、只有 Cloudflare 报错（额度耗尽 4006）时才兜底到阿里云，而且
// 兜底结果里的英文数字词要还原成数字（否则 "11-year-old" 会被判成读错）。
// 四种组合都必须在没有真网络、没有真额度的情况下测出来，所以这里把 worker
// 源码原样装进 vm，只 stub 掉 env.AI 和 fetch。
//
// 用法：node tools/verify-asr-routing.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../worker/src/index.js'), 'utf8')
  .replace('export default {', 'const __worker = {');

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// --- 沙箱：只需要 worker 用到的那几个全局 -------------------------------------
function load(sandboxExtra) {
  const sandbox = Object.assign({
    console: console,
    URL: URL, Request: Request, Response: Response, Headers: Headers,
    AbortController: AbortController, AbortSignal: AbortSignal,
    btoa: btoa, atob: atob, TextDecoder: TextDecoder, TextEncoder: TextEncoder,
    setTimeout: setTimeout, clearTimeout: clearTimeout,
  }, sandboxExtra || {});
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;__exports = { fetch: __worker.fetch, restoreDigits, aliyunPayload, aliyunSystem, aliyunTranscribe };', sandbox);
  return sandbox.__exports;
}

const WAV = new Uint8Array([82, 73, 70, 70, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const EN = 'Sarah is an 11-year-old girl who loves music.';
const EN_ALI = 'Sarah is an eleven-year-old girl who loves music.';
const ZH = '这只熊猫非常可爱，它最喜欢吃竹子。';

function makeRequest(qs) {
  return new Request('https://x.test/api/transcribe' + qs, {
    method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: WAV,
  });
}

// env.AI 的替身：record 记录被怎么调用，behave 决定返回还是抛错。
function fakeEnv(opts) {
  opts = opts || {};
  const rec = { aiCalls: 0, aiModels: [], fetches: [] };
  const env = {
    AI: {
      run: async function (model, input) {
        rec.aiCalls++;
        rec.aiModels.push(model);
        if (opts.aiThrows) throw new Error('4006: Neurons exhausted for the day');
        if (opts.allEmpty) return { text: '' };
        if (opts.turboEmpty && model.indexOf('turbo') >= 0) {
          return { text: '' };
        }
        return { text: opts.text === undefined ? 'hi there' : opts.text };
      },
    },
    ALLOWED_ORIGIN: 'https://amyeng.top',
  };
  if (opts.withKey !== false) env.ALIYUN_KEY = 'test-key';
  const realFetch = globalThis.fetch;
  // worker 只对阿里云发 fetch；stub 掉它，把请求记下来。
  globalThis.__stub = async function (url, init) {
    rec.fetches.push({ url: String(url), init: init });
    if (opts.aliThrows) throw new Error('aliyun down');
    if (opts.aliHttp) return new Response('nope', { status: opts.aliHttp });
    const body = JSON.parse(init.body);
    return new Response(JSON.stringify({
      choices: [{ message: { content: opts.aliText === undefined ? EN_ALI : opts.aliText } }],
      echo: body,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  vm.__realFetch = realFetch;
  return { env: env, rec: rec };
}

// fetch 在沙箱里要指向 stub，所以每个用例单独装一次沙箱。
async function run(qs, opts) {
  const holder = fakeEnv(opts);
  const ctx = load({ fetch: holder.env.ALIYUN_KEY === undefined ? globalThis.fetch : globalThis.__stub });
  const res = await ctx.fetch(makeRequest(qs), holder.env, {});
  let body = {};
  try { body = await res.json(); } catch (e) {}
  return { status: res.status, body: body, rec: holder.rec };
}

(async function main() {
  // ---- 1. restoreDigits：兜底路径的数字还原 --------------------------------
  console.log('\n1. 数字还原（兜底路径专用）');
  const t = load({ fetch: globalThis.fetch });
  ok('eleven-year-old → 11-year-old',
    t.restoreDigits(EN_ALI, EN).indexOf('11-year-old') > 0,
    t.restoreDigits(EN_ALI, EN));
  ok('目标句写 "three" 时不乱改',
    t.restoreDigits('I have three cats.', 'I have three cats.') === 'I have three cats.');
  ok('twenty-one → 21',
    t.restoreDigits('She has twenty-one books.', 'She has 21 books.') === 'She has 21 books.');
  ok('two → 2（目标句是数字形式）',
    t.restoreDigits('I have two dogs.', 'I have 2 dogs.') === 'I have 2 dogs.');
  ok('目标句没有数字时原样返回',
    t.restoreDigits('I have two dogs.', 'I have a pet.') === 'I have two dogs.');
  ok('11-year-old 本身不被改坏',
    t.restoreDigits('an 11-year-old girl', EN) === 'an 11-year-old girl');

  // ---- 2. 提示词与入参形状 ------------------------------------------------
  console.log('\n2. 阿里云入参');
  ok('zh 模式用简体中文提示词', t.aliyunSystem('zh', 'IGNORED') === '以下是普通话的句子，请用简体中文输出。');
  ok('zh 模式忽略客户端 bias', t.aliyunSystem('zh', 'hi').indexOf('hi') < 0);
  ok('英文偏置带上目标句', t.aliyunSystem('sentence', EN).indexOf(EN) > 0);
  ok('无偏置时不给 system', t.aliyunSystem('sentence', '') === '');
  const pl = t.aliyunPayload(WAV, 'zh', '', 'audio/wav');
  ok('模型名是 qwen3-asr-flash', pl.model === 'qwen3-asr-flash');
  ok('音频以 data URI 传', pl.messages[1].content[0].input_audio.data.indexOf('data:audio/wav;base64,') === 0);
  const pl2 = t.aliyunPayload(WAV, 'sentence', EN, 'audio/webm');
  ok('mime 跟随请求头', pl2.messages[1].content[0].input_audio.data.indexOf('data:audio/webm;base64,') === 0);

  // ---- 3. 路由：中文 -----------------------------------------------------
  console.log('\n3. 路由 · 中文优先阿里云');
  let r = await run('?model=turbo&mode=zh', {});
  ok('走阿里云', r.body.model === 'qwen3-asr-flash', JSON.stringify(r.body));
  ok('没打 Cloudflare（省额度）', r.rec.aiCalls === 0, 'aiCalls=' + r.rec.aiCalls);
  ok('返回阿里云的文本', r.body.text === EN_ALI);

  r = await run('?model=turbo&mode=zh', { aliThrows: true, text: '中文兜底' });
  ok('阿里云挂了 → 落回 turbo', r.body.model === '@cf/openai/whisper-large-v3-turbo', JSON.stringify(r.body));
  ok('落回后文本仍拿得到', r.body.text === '中文兜底');

  r = await run('?model=turbo&mode=zh&engine=cf', {});
  ok('engine=cf 强制 Cloudflare', r.body.model === '@cf/openai/whisper-large-v3-turbo');
  ok('强制 cf 时一次阿里云都不打', r.rec.fetches.length === 0);

  // ---- 4. 路由：英文 -----------------------------------------------------
  console.log('\n4. 路由 · 英文留 Cloudflare + 额度兜底');
  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN), { text: EN });
  ok('正常走 turbo', r.body.model === '@cf/openai/whisper-large-v3-turbo', JSON.stringify(r.body));
  ok('文本逐字一致', r.body.text === EN);
  ok('不浪费阿里云调用', r.rec.fetches.length === 0, 'fetches=' + r.rec.fetches.length);

  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN), { aiThrows: true });
  ok('额度耗尽 → 阿里云兜底出分', r.body.model === 'qwen3-asr-flash', JSON.stringify(r.body));
  ok('兜底带偏置（目标句）', r.rec.fetches[0].init.body.indexOf('11-year-old') > 0);
  ok('兜底结果数字已还原', r.body.text === EN, r.body.text);

  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN), { turboEmpty: true });
  ok('turbo 返回空 → 默认模型接住', r.rec.aiModels[1] === '@cf/openai/whisper', r.rec.aiModels.join(','));
  ok('默认模型接住后不再打阿里云', r.rec.fetches.length === 0);

  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN), { allEmpty: true, aliText: EN_ALI });
  ok('两个 CF 模型都没声 → 阿里云兜底', r.body.model === 'qwen3-asr-flash', JSON.stringify(r.body));
  ok('兜底文本数字同样还原', r.body.text === EN, r.body.text);

  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN), { allEmpty: true, aliText: '' });
  ok('连阿里云也没声 → 返回空文本而不是报错', r.status === 200 && r.body.text === '',
    'status=' + r.status + ' ' + JSON.stringify(r.body));

  r = await run('?model=turbo&prompt=' + encodeURIComponent(EN) + '&engine=ali', { text: EN });
  ok('engine=ali 强制走阿里云（= 兜底自查）', r.body.model === 'qwen3-asr-flash');
  ok('强制 ali 时不打 Cloudflare', r.rec.aiCalls === 0);

  // ---- 5. 没有 Key 时的退路 ----------------------------------------------
  console.log('\n5. 未配置 ALIYUN_KEY（部署漏了 secret 的情况）');
  r = await run('?model=turbo&mode=zh', { withKey: false, aliThrows: true });
  ok('中文照旧走 Cloudflare', r.body.model === '@cf/openai/whisper-large-v3-turbo', JSON.stringify(r.body));
  ok('不打阿里云', r.rec.fetches.length === 0);

  r = await run('?model=turbo', { withKey: false, aiThrows: true });
  ok('Cloudflare 挂了且无 Key → 502 失败码', r.status === 502, 'status=' + r.status + ' ' + JSON.stringify(r.body));
  ok('错误里带上原因', !!r.body.detail, JSON.stringify(r.body));

  // ---- 6. 空音频 / 超长 ---------------------------------------------------
  console.log('\n6. 边界');
  const ctx = load({ fetch: globalThis.fetch });
  const emptyRes = await ctx.fetch(new Request('https://x.test/api/transcribe?model=turbo&mode=zh', {
    method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: new Uint8Array([]),
  }), { AI: { run: async function () { return { text: '' }; } }, ALLOWED_ORIGIN: 'x' }, {});
  ok('空音频返回 400', emptyRes.status === 400, 'status=' + emptyRes.status);

  console.log('\n' + pass + ' 项通过, ' + fail + ' 项失败');
  process.exit(fail ? 1 : 0);
})();
