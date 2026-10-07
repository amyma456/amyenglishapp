/* eslint-disable */
// 阿里云 qwen3-tts-flash 英文音色选型工具（v95）。
//
// 平台原来统一用 Cherry（中英双语音色）。家长反馈"发音太烂了"，所以要挑一个
// 专门读英文更自然的音色做兜底。音色"好不好听"主观，但"读得准不准"可以量：
// 同一句话让每个音色读一遍，再用 qwen3-asr-flash 反听回来逐词比对，
// 命中率低的音色至少在清晰度上不过关 —— 这是能自动跑的那一半。
// 另一半（顺耳不顺耳）靠 tools/ 里产出的试听样本，人耳拍板。
//
// 用法：
//   ALIYUN_KEY=sk-xxx node tools/tts-voice-bench.js [--save]
//   --save 会把每个音色的第一句写到 public/voicetest/ 供试听页使用。
const fs = require('fs');
const path = require('path');

const KEY = process.env.ALIYUN_KEY || process.env.DASHSCOPE_API_KEY || '';
if (!KEY) { console.error('缺少 ALIYUN_KEY'); process.exit(1); }

const TTS_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const ASR_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const VOICES = ['Cherry', 'Jennifer', 'Ryan', 'Serena', 'Ethan', 'Katerina', 'Aiden', 'Maia'];
const LINES = [
  "What's your favorite subject at school?",
  'My favorite subject is English.',
  'The children are playing football in the park.',
  "I usually have breakfast at seven o'clock.",
  'Can you tell me how to get to the library, please?',
];

const norm = (s) => String(s || '')
  .toLowerCase()
  .replace(/[^a-z0-9' ]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function wordDiff(a, b) {
  const x = norm(a).split(' ').filter(Boolean);
  const y = norm(b).split(' ').filter(Boolean);
  const m = x.length, n = y.length;
  if (!m && !n) return 1;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = x[i - 1] === y[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcs = dp[m][n];
  return 1 - (lcs * 2) / (m + n);   // 0 = 完全一致
}

async function synth(text, voice) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3-tts-flash',
      input: { text: text, voice: voice, language_type: 'English' },
    }),
  });
  if (!res.ok) throw new Error('tts_http_' + res.status + ' ' + (await res.text()).slice(0, 120));
  const data = await res.json();
  const url = data && data.output && data.output.audio && data.output.audio.url;
  if (!url) throw new Error('tts_no_url ' + JSON.stringify(data).slice(0, 160));
  const wav = await fetch(url);
  if (!wav.ok) throw new Error('oss_http_' + wav.status);
  return Buffer.from(await wav.arrayBuffer());
}

async function transcribe(buf) {
  const res = await fetch(ASR_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3-asr-flash',
      messages: [{ role: 'user', content: [{
        type: 'input_audio',
        input_audio: { data: 'data:audio/wav;base64,' + buf.toString('base64') },
      }] }],
    }),
  });
  if (!res.ok) throw new Error('asr_http_' + res.status);
  const data = await res.json();
  const c = data && data.choices && data.choices[0];
  let out = c && c.message ? c.message.content : '';
  if (Array.isArray(out)) out = out.map((p) => (typeof p === 'string' ? p : (p && p.text) || '')).join('');
  return String(out || '').trim();
}

(async function main() {
  const save = process.argv.indexOf('--save') >= 0;
  const outDir = path.join(__dirname, '../public/voicetest');
  if (save) fs.mkdirSync(outDir, { recursive: true });

  const rows = [];
  for (const voice of VOICES) {
    let sum = 0, worst = '', ok = 0;
    const detail = [];
    for (let i = 0; i < LINES.length; i++) {
      const line = LINES[i];
      try {
        const wav = await synth(line, voice);
        if (save && i === 0) {
          fs.writeFileSync(path.join(outDir, 'ali-' + voice.toLowerCase() + '.wav'), wav);
        }
        const heard = await transcribe(wav);
        const d = wordDiff(line, heard);
        sum += d;
        if (d <= 0.02) ok++;
        else if (!worst) worst = line + '  →  ' + heard;
        detail.push((d * 100).toFixed(0));
      } catch (e) {
        detail.push('ERR');
        sum += 1;
      }
    }
    rows.push({
      voice,
      avgDiff: sum / LINES.length,
      perfect: ok,
      detail: detail.join('/'),
      worst,
    });
    process.stdout.write('.');
  }
  console.log('\n');
  rows.sort((a, b) => a.avgDiff - b.avgDiff);
  console.log('音色        平均偏差   完全一致   逐句偏差%');
  rows.forEach((r) => {
    console.log(
      r.voice.padEnd(11) +
      (r.avgDiff * 100).toFixed(1).padStart(6) + '%' +
      ('  ' + r.perfect + '/' + LINES.length).padEnd(11) +
      r.detail
    );
  });
  console.log('\n偏差 = 逐词 LCS 距离（0% 表示 ASR 反听逐字一致，越小越清楚）');
  const errs = rows.filter((r) => r.worst);
  if (errs.length) {
    console.log('\n偏差最大的句子：');
    errs.forEach((r) => console.log('  ' + r.voice + ': ' + r.worst));
  }
  if (save) console.log('\n试听样本已写入 public/voicetest/');
})().catch((e) => { console.error('脚本异常：', e); process.exit(1); });
