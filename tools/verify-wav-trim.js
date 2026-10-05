/* eslint-disable */
// v92 红线：/api/transcribe 的 WAV 静音裁剪。
//   1. 首尾静音被裁掉，保留 120ms 缓冲
//   2. 全程有声 → 原样返回（不重编码）
//   3. 整段无声 → 原样返回（交给模型说"没识别出"）
//   4. 非 RIFF / 多声道 / 8-bit / 太短 → 原样返回
//   5. 裁剪后 RIFF/data 块大小字段正确（改坏了识别端会 400）
//
// 用法：node tools/verify-wav-trim.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

const src = fs.readFileSync(path.join(__dirname, '..', 'worker', 'src', 'index.js'), 'utf8');
const m = src.match(/const TRIM_SILENCE_LEVEL[\s\S]*?\nfunction trimWavSilence[\s\S]*?\n\}/);
if (!m) { console.log('FAIL 找不到 trimWavSilence'); process.exit(1); }
const sandbox = { Math, DataView, Uint8Array };
vm.createContext(sandbox);
vm.runInContext(m[0] + '; this.trimWavSilence = trimWavSilence; this.LVL = TRIM_SILENCE_LEVEL; this.PAD = TRIM_PAD_SAMPLES;', sandbox);
const trim = sandbox.trimWavSilence;
const PAD = sandbox.PAD;

function makeWav(samples, ch = 1, bits = 16) {
  const bytesPer = bits / 8;
  const dataLen = samples.length * bytesPer * ch;
  const buf = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(buf);
  const w = (off, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + dataLen, true); w(8, 'WAVE');
  w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
  dv.setUint16(22, ch, true); dv.setUint32(24, 16000, true);
  dv.setUint32(28, 16000 * ch * bytesPer, true); dv.setUint16(32, ch * bytesPer, true);
  dv.setUint16(34, bits, true);
  w(36, 'data'); dv.setUint32(40, dataLen, true);
  for (let i = 0; i < samples.length; i++) {
    for (let c = 0; c < ch; c++) dv.setInt16(44 + (i * ch + c) * bytesPer, samples[i], true);
  }
  return new Uint8Array(buf);
}

console.log('== 1) 首尾静音裁剪 ==');
const RATE = 16000;
const quiet = new Array(Math.floor(RATE * 0.5)).fill(0);
const loud = [];
for (let i = 0; i < Math.floor(RATE * 0.8); i++) loud.push(Math.round(8000 * Math.sin(i / 6)));
const wav = makeWav(quiet.concat(loud, quiet));
const out = trim(wav);
ok(out.length < wav.length, '变小了（' + wav.length + 'B → ' + out.length + 'B）');
const outDv = new DataView(out.buffer);
const outDataLen = outDv.getUint32(40, true);
const keptSamples = outDataLen / 2;
ok(keptSamples <= loud.length + PAD * 2 + 1, '保留长度 = 语音 + 2×120ms 缓冲（' + keptSamples + ' ≈ ' + (loud.length + PAD * 2) + '）');
ok(keptSamples >= loud.length + 1, '语音本体没被削');
ok(outDv.getUint32(4, true) === out.length - 8, 'RIFF 大小字段正确');
ok(outDv.getUint32(40, true) === out.length - 44, 'data 块大小字段正确');
// 裁出来的音频开头应该已经是响的（缓冲之后）
const firstLoud = loud[0];
const outFirst = outDv.getInt16(44 + PAD * 2, true);
ok(Math.abs(outFirst) > sandbox.LVL, '缓冲后就是语音起点');

console.log('== 2) 全程有声 ==');
const allLoud = makeWav(loud);
ok(trim(allLoud) === allLoud || trim(allLoud).length === allLoud.length, '不重编码、不变小');

console.log('== 3) 整段无声 ==');
const allQuiet = makeWav(quiet);
ok(trim(allQuiet) === allQuiet, '原样返回（交给模型去说没识别出）');

console.log('== 4) 形状不对 → 原样返回 ==');
const junk = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
ok(trim(junk) === junk, '非 WAV 原样返回');
const stereo = makeWav(loud, 2, 16);
ok(trim(stereo) === stereo, '立体声原样返回');
const tiny = makeWav(loud.slice(0, 100));
ok(trim(tiny) === tiny, '过短原样返回');

console.log('\n' + (fail ? ('有 ' + fail + ' 项失败 ❌') : '全部通过 ✅'));
process.exit(fail ? 1 : 0);
