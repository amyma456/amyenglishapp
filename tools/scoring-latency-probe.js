/* eslint-disable */
// 跟读评分的"延迟体检"（v103）。
//
// 家长反复说"评分速度还是很慢"。这句话靠读代码没法证实也没法证伪 ——
// 慢在哪一段只有把时间切开看：孩子松手后等的那几秒 =
//   ① 音频从手机爬到边缘（upload）
//   ② 边缘 → 阿里云 / 边缘 → Cloudflare 的模型往返（ali / cf）
//   ③ 边缘 → 手机把分数送回（响应下行）
// 服务端把 ①② 都放在 Server-Timing 响应头里了，这个工具就是把它们跑成
// 分布（p50/p90），顺便比一比同一个句子用 16-bit PCM 和 8-bit µ-law 上传差多少。
//
// 做法：拿真实句式用阿里云 TTS 合成一版"标准读音"，转成 16kHz 单声道，
// 生成 pcm / µ-law 两个版本，交错发到线上 /api/transcribe，读响应头。
//
// 用法：
//   ALIYUN_KEY=sk-xxx node tools/scoring-latency-probe.js [--rounds=3] [--engine=ali]
//
// 说明：客户端那一段（①③）跟跑这个脚本的机器到边缘的链路强相关，
// 出差值有参考意义，绝对值别当成孩子手机上的数。
const fs = require('fs');
const path = require('path');

const KEY = process.env.ALIYUN_KEY || process.env.DASHSCOPE_API_KEY || '';
if (!KEY) { console.error('缺少 ALIYUN_KEY'); process.exit(1); }

const ENDPOINT = process.env.PRON_ENDPOINT || 'https://amyeng.top/api/transcribe';
const TTS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const VOICE = 'Jennifer';

const argv = process.argv.slice(2);
function arg(name, dflt) {
  const hit = argv.find(function (a) { return a.indexOf('--' + name + '=') === 0; });
  return hit ? hit.split('=').slice(1).join('=') : dflt;
}
const ROUNDS = Number(arg('rounds', 3));
const ENGINE = arg('engine', '');

const TEXTS = [
  "What's your favorite subject at school?",          // 短句
  "I usually have breakfast at seven o'clock.",       // 中句
  "The library is next to the post office.",          // 复合词
  "My sister likes reading storybooks before bed.",   // 长句
];

// ---------- WAV 小工具（纯 JS，不引依赖）----------------------------------
function parseWav(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46464952) throw new Error('not RIFF');
  let pos = 12, fmt = null, dataOff = -1, dataLen = -1;
  while (pos + 8 <= buf.length) {
    const id = dv.getUint32(pos, true);
    const size = dv.getUint32(pos + 4, true);
    if (id === 0x20746d66) {
      fmt = { ch: dv.getUint16(pos + 10, true), rate: dv.getUint32(pos + 12, true), bits: dv.getUint16(pos + 22, true) };
    } else if (id === 0x61746164) {
      dataOff = pos + 8; dataLen = Math.min(size, buf.length - dataOff); break;
    }
    pos += 8 + size + (size % 2);
  }
  if (!fmt || dataOff < 0 || fmt.bits !== 16) throw new Error('unsupported wav');
  const n = Math.floor(dataLen / 2);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) out[i] = dv.getInt16(dataOff + i * 2, true);
  if (fmt.ch === 2) { const m = new Int16Array(Math.floor(n / 2)); for (let i = 0; i < m.length; i++) m[i] = out[i * 2]; return { rate: fmt.rate, samples: m }; }
  return { rate: fmt.rate, samples: out };
}

function resample(samples, from, to) {
  if (from === to) return samples;
  const ratio = from / to;
  const n = Math.round(samples.length / ratio);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * ratio, i0 = Math.floor(p), i1 = Math.min(i0 + 1, samples.length - 1), f = p - i0;
    out[i] = Math.round(samples[i0] * (1 - f) + samples[i1] * f);
  }
  return out;
}

function header(bytes) {
  const b = Buffer.alloc(44);
  b.write('RIFF', 0, 'ascii'); b.writeUInt32LE(36 + bytes, 4);
  b.write('WAVE', 8, 'ascii'); b.write('fmt ', 12, 'ascii'); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(16000, 24);
  b.writeUInt32LE(16000 * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36, 'ascii'); b.writeUInt32LE(bytes, 40);
  return b;
}

function pcmWav(samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  header(samples.length * 2).copy(b, 0);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(samples[i], 44 + i * 2);
  return b;
}

function ulawByte(v) {
  let s = v < -32768 ? -32768 : v > 32767 ? 32767 : v;
  let sign = 0;
  if (s < 0) { sign = 0x80; s = -s; }
  if (s > 32635) s = 32635;
  s += 0x84;
  let e = 7, m = 0x4000;
  while (e > 0 && !(s & m)) { e--; m >>= 1; }
  return (~(sign | (e << 4) | ((s >> (e + 3)) & 0x0f))) & 0xff;
}

function ulawWav(samples) {
  const b = Buffer.alloc(44 + samples.length);
  const h = header(samples.length);
  h.writeUInt16LE(7, 20); h.writeUInt32LE(16000, 28); h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34);
  h.copy(b, 0);
  for (let i = 0; i < samples.length; i++) b[44 + i] = ulawByte(samples[i]);
  return b;
}

// ---------- 合成 ----------
async function synth(text) {
  const r = await fetch(TTS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen3-tts-flash', input: { text: text, voice: VOICE, language_type: 'English' } }),
  });
  if (!r.ok) throw new Error('tts http ' + r.status);
  const d = await r.json();
  const url = d && d.output && d.output.audio && d.output.audio.url;
  const a = await fetch(url);
  if (!a.ok) throw new Error('oss http ' + a.status);
  const wav = parseWav(new Uint8Array(await a.arrayBuffer()));
  return resample(wav.samples, wav.rate, 16000);
}

// ---------- 打点 ----------
async function probe(body, hint) {
  const qs = '?model=turbo' + (ENGINE ? '&engine=' + ENGINE : '') + (hint ? '&prompt=' + encodeURIComponent(hint) : '');
  const t = Date.now();
  const res = await fetch(ENDPOINT + qs, { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: body });
  const clientMs = Date.now() - t;
  const st = res.headers.get('Server-Timing') || '';
  const pick = (k) => { const m = st.match(new RegExp(k + ';dur=(\\d+)')); return m ? Number(m[1]) : null; };
  let text = '';
  try { text = (await res.json()).text || ''; } catch (e) {}
  return {
    client: clientMs, status: res.status,
    upload: pick('upload'), ali: pick('ali'), cf: pick('cf'), total: pick('total'),
    channel: res.headers.get('X-Asr-Channel') || '', audioIn: res.headers.get('X-Audio-In') || '', text: text,
  };
}

function stats(list) {
  const v = list.filter(function (x) { return typeof x === 'number'; }).sort(function (a, b) { return a - b; });
  if (!v.length) return { n: 0, p50: null, p90: null, min: null, max: null };
  const at = function (q) { return v[Math.min(v.length - 1, Math.floor(v.length * q))]; };
  return { n: v.length, p50: at(0.5), p90: at(0.9), min: v[0], max: v[v.length - 1] };
}

function fmt(s) { return s.n ? ('p50 ' + s.p50 + 'ms / p90 ' + s.p90 + 'ms / ' + s.min + '~' + s.max) : '（无样本）'; }

(async function main() {
  console.log('目标：' + ENDPOINT + (ENGINE ? '（强制 engine=' + ENGINE + '）' : '') + '，每句 ' + ROUNDS + ' 轮，交错发 PCM / µ-law\n');
  const acc = { pcm: [], ulaw: [] };
  for (const text of TEXTS) {
    let samples;
    try { samples = await synth(text); } catch (e) { console.log('跳过（合成失败）：' + text + ' — ' + e.message); continue; }
    const variants = { pcm: pcmWav(samples), ulaw: ulawWav(samples) };
    console.log('· ' + text);
    console.log('  音频 ' + (samples.length / 16000).toFixed(2) + 's  PCM ' + variants.pcm.length + 'B  µ-law ' + variants.ulaw.length + 'B');
    for (let r = 0; r < ROUNDS; r++) {
      for (const name of ['pcm', 'ulaw']) {
        let out;
        try { out = await probe(variants[name], text); } catch (e) { console.log('    ' + name + ' 请求失败：' + e.message); continue; }
        acc[name].push(out);
        const echo = out.text.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '') === text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
        console.log('    ' + (name === 'pcm' ? 'PCM  ' : 'µ-law') + '  status ' + out.status +
          '  upload ' + out.upload + 'ms  ali ' + out.ali + 'ms  cf ' + out.cf + 'ms  total ' + out.total +
          'ms  客户端 ' + out.client + 'ms  ' + out.channel + '  ' + out.audioIn +
          '  ' + (echo ? '转写一致' : '转写不一致 → ' + out.text.slice(0, 50)));
      }
    }
    console.log('');
  }

  console.log('================ 汇总 ================');
  ['pcm', 'ulaw'].forEach(function (name) {
    const rows = acc[name];
    if (!rows.length) return;
    console.log((name === 'pcm' ? 'PCM  (16-bit，v103 之前)' : 'µ-law (8-bit，v103 起)').padEnd(26) +
      ' n=' + rows.length);
    console.log('  服务端 upload ' + fmt(stats(rows.map(function (r) { return r.upload; }))));
    console.log('  阿里云   ali    ' + fmt(stats(rows.map(function (r) { return r.ali; }))));
    console.log('  CF       cf     ' + fmt(stats(rows.map(function (r) { return r.cf; }))));
    console.log('  服务端   total  ' + fmt(stats(rows.map(function (r) { return r.total; }))));
    console.log('  客户端整程      ' + fmt(stats(rows.map(function (r) { return r.client; }))));
    const bad = rows.filter(function (r) { return r.status !== 200; }).length;
    if (bad) console.log('  非 200 响应：' + bad + ' 次');
  });
  console.log('\n注：客户端整程跟本机到边缘的链路强相关，看 PCM/µ-law 的差值，别看绝对值。');
})().catch(function (e) { console.error(e); process.exit(1); });
