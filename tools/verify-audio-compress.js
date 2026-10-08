/* eslint-disable */
// 校验脚本：跟读上传的 8-bit µ-law 压缩（v103）。
//
// 为什么要有它：这是"评分慢"里最大的一块 —— 孩子松手后等的时间，主要不是
// 模型算得慢，而是音频从手机爬到边缘这段跨境上行。16k/16-bit 的 WAV 压不动，
// µ-law 砍半。但它动的是**孩子每次朗读都要走的那条路**，一旦编解码有偏差，
// 表现就是"读对了却判错"（本项目的头号红线）。所以三件事都要钉住：
//
//   1. 客户端编码器：输出必须是合法 µ-law WAV（fmt tag 7 / 8-bit / mono），
//      体积恰好一半，量化值与 G.711 标准逐字节对齐。
//   2. 服务端解码器：解回来的 PCM 误差在 µ-law 理论范围内（≤2% 满幅），
//      形状不认识的一律返回 null（让调用方原样透传，不许瞎猜）。
//   3. 路由：阿里云那条拿到的还是**压缩后**的字节（体积小 = 那一跳也快），
//      Cloudflare 那条拿到的是解好的 16-bit PCM（Whisper 不认 µ-law）。
//      老客户端发 PCM 时行为必须和 v103 之前完全一致。
//
// 用法：node tools/verify-audio-compress.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

// ---------------------------------------------------------------------------
// 客户端：public/recorder.js 原样装进 vm（它是个普通脚本，只定义 Recorder）。
// ---------------------------------------------------------------------------
function loadRecorder() {
  const src = fs.readFileSync(path.join(__dirname, '../public/recorder.js'), 'utf8');
  const sandbox = {
    console: console,
    Blob: Blob, URL: URL, Uint8Array: Uint8Array, Float32Array: Float32Array,
    Math: Math, navigator: {}, window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;__exports = { Recorder };', sandbox);
  return sandbox.__exports.Recorder;
}

// ---------------------------------------------------------------------------
// 服务端：worker 源码装进 vm，只 stub 掉 env.AI 与 fetch。
// ---------------------------------------------------------------------------
function loadWorker(sandboxExtra) {
  const src = fs.readFileSync(path.join(__dirname, '../worker/src/index.js'), 'utf8')
    .replace("import TTS_STATIC from './tts-manifest.js';",
             'const TTS_STATIC = (typeof __TTS_STATIC === "object" && __TTS_STATIC) || {};')
    .replace('export default {', 'const __worker = {');
  const sandbox = Object.assign({
    console: console,
    URL: URL, Request: Request, Response: Response, Headers: Headers,
    AbortController: AbortController, AbortSignal: AbortSignal,
    btoa: btoa, atob: atob, TextDecoder: TextDecoder, TextEncoder: TextEncoder,
    setTimeout: setTimeout, clearTimeout: clearTimeout,
  }, sandboxExtra || {});
  vm.createContext(sandbox);
  vm.runInContext(src + '\n;__exports = { fetch: __worker.fetch, ulawWavToPcmWav, trimWavSilence };', sandbox);
  return sandbox.__exports;
}

function b64ToBytes(b64) {
  const bin = Buffer.from(b64, 'base64');
  return new Uint8Array(bin);
}

function riffInfo(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    riff: dv.getUint32(0, true) === 0x46464952,
    wave: dv.getUint32(8, true) === 0x45564157,
    fmtTag: dv.getUint16(20, true),
    channels: dv.getUint16(22, true),
    rate: dv.getUint32(24, true),
    byteRate: dv.getUint32(28, true),
    blockAlign: dv.getUint16(32, true),
    bits: dv.getUint16(34, true),
    dataSize: dv.getUint32(40, true),
    total: bytes.length,
  };
}

const RATE = 16000;

(function () {
  const R = loadRecorder();

  // ---- 1. 客户端 µ-law 编码器：格式 --------------------------------------
  console.log('\n1. 客户端 µ-law 编码器 · 格式与体积');
  const n = 24000;                                  // 1.5 秒
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = i % 2 ? 0.5 : -0.5;
  const ulawBlob = R._encodeUlawWav(samples, RATE);

  let pending = [];
  const done = (v) => { pending.push(v); };

  ulawBlob.arrayBuffer().then(async (ab) => {
    const ub = new Uint8Array(ab);
    const info = riffInfo(ub);
    ok('是合法 RIFF/WAVE', info.riff && info.wave);
    ok('fmt tag = 7（µ-law）', info.fmtTag === 7, 'tag=' + info.fmtTag);
    ok('mono / 8-bit', info.channels === 1 && info.bits === 8,
      'ch=' + info.channels + ' bits=' + info.bits);
    ok('byteRate = rate×1（不是 ×2）', info.byteRate === RATE, 'byteRate=' + info.byteRate);
    ok('blockAlign = 1', info.blockAlign === 1, 'align=' + info.blockAlign);
    ok('data 长度 = 采样数', info.dataSize === n, 'dataSize=' + info.dataSize);
    ok('总长 = 44 + n', info.total === 44 + n, 'total=' + info.total);

    // 同一批采样，µ-law 必须正好是 16-bit PCM 的一半（44 字节头相同）
    const pcmBlob = R._encodeWav(samples, RATE);
    const pb = new Uint8Array(await pcmBlob.arrayBuffer());
    ok('体积正好是 16-bit PCM 的一半（含 44 字节头）',
      ub.length * 2 - 44 === pb.length, 'ulaw=' + ub.length + ' pcm=' + pb.length);

    // ---- 2. 客户端 µ-law 编码器：量化值对齐 G.711 标准 -------------------
    console.log('\n2. 客户端 µ-law 编码器 · 量化值与 G.711 标准对齐');
    // 期望值由标准 G.711 算法独立算得（tools 之外用 python 复算过）。
    const VEC = [
      [0, 0xFF], [1e-9, 0xFF], [0.0001, 0xFF], [-0.0001, 0x7F],
      [0.01, 0xE3], [-0.01, 0x63], [0.1, 0xB5], [-0.1, 0x35],
      [0.25, 0x9F], [0.5, 0x8F], [-0.5, 0x0F], [0.9, 0x83],
      [-0.9, 0x03], [1.0, 0x80], [-1.0, 0x00], [2.0, 0x80], [-2.0, 0x00],
      [0.333333, 0x9A],
    ];
    let bad = [];
    VEC.forEach(function (v) {
      const got = R._ulawByte(v[0]);
      if (got !== v[1]) bad.push(v[0] + '→0x' + got.toString(16) + '(期望0x' + v[1].toString(16) + ')');
    });
    ok('18 个参考向量逐字节一致', bad.length === 0, bad.join(' '));
    ok('超范围输入被夹住（±2.0 不越界）', R._ulawByte(9) === 0x80 && R._ulawByte(-9) === 0x00);

    // ---- 3. padForAsr 的开关 --------------------------------------------
    console.log('\n3. padForAsr 走的是哪条路');
    ok('ULAW_ENABLED 默认开', R.ULAW_ENABLED === true);
    const asrBlob = R.padForAsr(samples);
    const asrBytes = new Uint8Array(await asrBlob.arrayBuffer());
    ok('padForAsr 输出 µ-law（fmt 7）', riffInfo(asrBytes).fmtTag === 7,
      'tag=' + riffInfo(asrBytes).fmtTag);
    R.ULAW_ENABLED = false;
    const asrPcm = new Uint8Array(await R.padForAsr(samples).arrayBuffer());
    ok('关掉开关能退回 16-bit PCM（fmt 1）', riffInfo(asrPcm).fmtTag === 1);
    R.ULAW_ENABLED = true;
    ok('退回 PCM 时体积是 µ-law 的两倍左右', asrPcm.length > asrBytes.length * 1.9);

    // 本地留档那份不能被压：stop() / join() 产出的仍然是 16-bit PCM
    console.log('\n4. 本地留档 / 播放那一份保持 16-bit PCM');
    const j = R.join([samples, samples], 0.25);
    const jb = new Uint8Array(await j.blob.arrayBuffer());
    ok('join() 输出 fmt 1 / 16-bit', riffInfo(jb).fmtTag === 1 && riffInfo(jb).bits === 16);

    // ---- 5. 服务端解码器：保真度 ----------------------------------------
    console.log('\n5. 服务端解码器 · 保真度');
    const W = loadWorker({ fetch: globalThis.fetch });

    // 用一条扫频正弦验保真度：µ-law 的理论量化误差是满幅的 2% 以内。
    const M = 20000;
    const wave = new Float32Array(M);
    for (let i = 0; i < M; i++) wave[i] = 0.6 * Math.sin(i / 7);
    const wb = new Uint8Array(await R._encodeUlawWav(wave, RATE).arrayBuffer());
    const pcm = W.ulawWavToPcmWav(wb);
    ok('解码出 16-bit PCM WAV', !!pcm && riffInfo(pcm).fmtTag === 1 && riffInfo(pcm).bits === 16,
      pcm ? JSON.stringify(riffInfo(pcm)) : 'null');
    ok('采样数一致', pcm && riffInfo(pcm).dataSize === M * 2,
      pcm ? 'dataSize=' + riffInfo(pcm).dataSize : 'null');
    let maxErr = 0;
    const pv = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    for (let i = 0; i < M; i++) {
      const want = Math.round(wave[i] < 0 ? wave[i] * 0x8000 : wave[i] * 0x7FFF);
      const got = pv.getInt16(44 + i * 2, true);
      const e = Math.abs(got - want);
      if (e > maxErr) maxErr = e;
    }
    ok('量化误差 ≤ 2% 满幅（µ-law 理论极限）', maxErr <= 655,
      'maxErr=' + maxErr + ' (' + (maxErr / 32768 * 100).toFixed(2) + '%)');
    ok('不是原样返回（确实解过）', maxErr > 0);

    // ---- 6. 服务端解码器：形状不认识就返回 null -------------------------
    console.log('\n6. 服务端解码器 · 形状守卫（认不出来必须返回 null）');
    const pcmWav = new Uint8Array(await R._encodeWav(samples, RATE).arrayBuffer());
    ok('16-bit PCM WAV → null（不该被当 µ-law 解）', W.ulawWavToPcmWav(pcmWav) === null);
    ok('随机字节 → null', W.ulawWavToPcmWav(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) === null);
    ok('空数组 → null', W.ulawWavToPcmWav(new Uint8Array(0)) === null);
    ok('只有 44 字节头（无采样）→ null', W.ulawWavToPcmWav(wb.subarray(0, 44)) === null);
    const stereo = new Uint8Array(wb);
    stereo[22] = 2;                                  // channels = 2
    ok('双声道 µ-law → null', W.ulawWavToPcmWav(stereo) === null);
    const fake16 = new Uint8Array(wb);
    fake16[34] = 16;                                 // bits = 16
    ok('标称 16-bit 的 µ-law → null', W.ulawWavToPcmWav(fake16) === null);
    // data 块被截断：**容忍**，按实际收到的采样数解，不返回 null。返回 null 的
    // 话这一段就要拿 µ-law 去喂 Whisper（它不认），孩子这次朗读直接没分 ——
    // 解一半出来出分，比整段丢掉强。
    const cut = W.ulawWavToPcmWav(wb.subarray(0, wb.length - 10));
    ok('data 块被截断 → 按实际字节数解出来（不整段丢弃）',
      !!cut && riffInfo(cut).dataSize === (M - 10) * 2,
      cut ? 'dataSize=' + riffInfo(cut).dataSize + ' 期望' + (M - 10) * 2 : 'null');
    ok('PCM 那条路不受影响：trimWavSilence 仍然工作',
      W.trimWavSilence(pcmWav).length === pcmWav.length);

    // ---- 7. 路由：两条通道各拿到什么 ------------------------------------
    console.log('\n7. 路由 · 阿里云拿压缩的、Cloudflare 拿解开的');
    const ULAW_BODY = wb;                            // 上面那条正弦的 µ-law
    const rec = { aiInputs: [], fetches: [] };
    const env = {
      ALIYUN_KEY: 'test-key',
      ALLOWED_ORIGIN: 'https://amyeng.top',
      AI: {
        run: async function (model, input) { rec.aiInputs.push({ model: model, input: input }); return { text: 'ok' }; },
      },
    };
    const stubFetch = async function (url, init) {
      rec.fetches.push({ url: String(url), init: init });
      return new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), { status: 200 });
    };

    async function callWorker(body, qs, mime) {
      rec.aiInputs = []; rec.fetches = [];
      const W2 = loadWorker({ fetch: stubFetch });
      const req = new Request('https://x.test/api/transcribe' + (qs || '?model=turbo'),
        { method: 'POST', headers: { 'Content-Type': mime || 'audio/wav' }, body: body });
      const res = await W2.fetch(req, env, {});
      return { res: res, body: await res.json() };
    }

    let out = await callWorker(ULAW_BODY, '?model=turbo&engine=ali');
    ok('阿里云通道真的被调用', rec.fetches.length === 1, 'fetches=' + rec.fetches.length);
    let sent = b64ToBytes(JSON.parse(rec.fetches[0].init.body).messages.slice(-1)[0].content[0].input_audio.data.split(',')[1]);
    ok('阿里云拿到的是压缩后的字节（没有被解开）', sent.length === ULAW_BODY.length,
      sent.length + ' vs ' + ULAW_BODY.length);
    ok('阿里云那份仍是 µ-law（fmt 7）', riffInfo(sent).fmtTag === 7);
    ok('X-Audio-In 标出 ulaw 与字节数',
      (out.res.headers.get('X-Audio-In') || '').indexOf('ulaw;bytes=' + ULAW_BODY.length) === 0,
      out.res.headers.get('X-Audio-In'));

    out = await callWorker(ULAW_BODY, '?model=turbo&engine=cf');
    ok('Cloudflare 通道真的被调用', rec.aiInputs.length === 1, 'calls=' + rec.aiInputs.length);
    let cfBytes = b64ToBytes(rec.aiInputs[0].input.audio);
    ok('Cloudflare 拿到的是解开的 16-bit PCM', riffInfo(cfBytes).fmtTag === 1 && riffInfo(cfBytes).bits === 16,
      JSON.stringify(riffInfo(cfBytes)));
    ok('Cloudflare 那份的采样数与原采样数一致',
      riffInfo(cfBytes).dataSize === M * 2, 'dataSize=' + riffInfo(cfBytes).dataSize);
    ok('PCM 那份比 µ-law 大一倍（说明确实解开了）', cfBytes.length > ULAW_BODY.length);

    // 默认模型那条（非 turbo）走的是整数数组，形状也不能错
    out = await callWorker(ULAW_BODY, '?engine=cf');
    const arr = rec.aiInputs[0].input.audio;
    ok('非 turbo 的入参仍是整数数组', Array.isArray(arr) && arr.length === cfBytes.length,
      'len=' + (arr && arr.length));
    ok('整数数组那份也是 PCM（fmt tag 1）', arr && arr[44 * 0 + 20] === 1 && arr[22] === 1);

    // ---- 8. 老客户端发 PCM：行为必须和 v103 之前一模一样 ----------------
    console.log('\n8. 老客户端（16-bit PCM）行为不变');
    out = await callWorker(pcmWav, '?model=turbo&engine=ali');
    sent = b64ToBytes(JSON.parse(rec.fetches[0].init.body).messages.slice(-1)[0].content[0].input_audio.data.split(',')[1]);
    ok('阿里云拿到 PCM（fmt 1）', riffInfo(sent).fmtTag === 1);
    ok('X-Audio-In 标 pcm', (out.res.headers.get('X-Audio-In') || '').indexOf('pcm;bytes=') === 0,
      out.res.headers.get('X-Audio-In'));
    out = await callWorker(pcmWav, '?model=turbo&engine=cf');
    cfBytes = b64ToBytes(rec.aiInputs[0].input.audio);
    ok('Cloudflare 拿到的还是同一份 PCM', riffInfo(cfBytes).fmtTag === 1);

    // ---- 9. 空音频 / 超限 的早退路径没被改坏 ----------------------------
    console.log('\n9. 早退路径');
    out = await callWorker(new Uint8Array(0), '?model=turbo');
    ok('空 body → 400 empty_audio', out.res.status === 400 && out.body.error === 'empty_audio',
      out.res.status + ' ' + JSON.stringify(out.body));

    // ---- 10. 解出来的 PCM 真的能被识别（形状层面） ----------------------
    console.log('\n10. 解出来的 PCM 头部数值自洽');
    const dh = riffInfo(cfBytes);
    ok('byteRate = rate×2', dh.byteRate === RATE * 2, 'byteRate=' + dh.byteRate);
    ok('blockAlign = 2', dh.blockAlign === 2, 'align=' + dh.blockAlign);
    ok('RIFF 长度 = 文件长 - 8',
      new DataView(cfBytes.buffer, cfBytes.byteOffset).getUint32(4, true) === cfBytes.length - 8,
      'riff=' + new DataView(cfBytes.buffer, cfBytes.byteOffset).getUint32(4, true) +
      ' file=' + cfBytes.length);

    console.log('\n' + (fail === 0 ? '全部通过' : '有失败') + '：' + pass + ' 项通过 / ' + fail + ' 项失败');
    process.exit(fail === 0 ? 0 : 1);
  }).catch(function (e) {
    console.error('脚本自身出错：', e);
    process.exit(1);
  });
})();
