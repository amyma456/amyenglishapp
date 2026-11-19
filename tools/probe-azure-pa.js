/* eslint-disable */
// 探针：Azure Speech 发音评估（Pronunciation Assessment）能不能一次拿到分数。
// 用法：node tools/probe-azure-pa.js [wav路径] ["参考文本"]
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(process.env.USERPROFILE || process.env.HOME, '.workbuddy/secrets/azure.env'), 'utf8')
  .split(/\r?\n/).forEach(function (l) {
    const m = l.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
const KEY = env.AZURE_TTS_KEY;
const REGION = env.AZURE_TTS_REGION;
if (!KEY || !REGION) { console.error('缺少 AZURE key/region'); process.exit(1); }

const wav = process.argv[2] || './.tmp/azure_probe.wav';
const ref = process.argv[3] || 'thank you for watching';
const bytes = fs.readFileSync(wav);
console.log('audio:', wav, bytes.length, 'bytes');
console.log('ref  :', ref);

const pa = {
  ReferenceText: ref,
  GradingSystem: 'HundredMark',
  Granularity: 'Word',
  EnableMiscue: true,
  Dimension: 'Comprehensive',
};

async function run(label, paHeader, extraQ) {
  const url = 'https://' + REGION + '.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1'
    + '?language=en-US&format=detailed' + (extraQ || '');
  const headers = {
    'Ocp-Apim-Subscription-Key': KEY,
    'Content-Type': 'audio/wav; codec=audio/pcm; samplerate=16000',
    'Accept': 'application/json',
  };
  if (paHeader) headers['Pronunciation-Assessment'] = Buffer.from(JSON.stringify(paHeader)).toString('base64');
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'POST', headers, body: bytes });
    const ms = Date.now() - t0;
    const txt = await res.text();
    console.log('\n=== ' + label + ' === http=' + res.status + ' ' + ms + 'ms');
    if (!res.ok) { console.log(txt.slice(0, 300)); return; }
    const d = JSON.parse(txt);
    console.log('RecognitionStatus:', d.RecognitionStatus, '| DisplayText:', d.DisplayText);
    const best = (d.NBest && d.NBest[0]) || {};
    if (best.PronunciationAssessment) {
      const p = best.PronunciationAssessment;
      console.log('PA:', JSON.stringify({
        Accuracy: p.AccuracyScore, Fluency: p.FluencyScore,
        Completeness: p.CompletenessScore, Pron: p.PronScore,
      }));
    } else {
      console.log('PA: (无 — 这个接口没返回发音评估)');
    }
    if (Array.isArray(best.Words)) {
      console.log('words:', best.Words.slice(0, 12).map(function (w) {
        const a = w.PronunciationAssessment || {};
        return w.Word + '(' + (a.AccuracyScore != null ? a.AccuracyScore : '-') + '/' + (a.ErrorType || '-') + ')';
      }).join(' '));
    }
  } catch (e) {
    console.log('\n=== ' + label + ' === ERROR ' + (Date.now() - t0) + 'ms: ' + (e && e.message));
  }
}

(async function () {
  await run('A 现有做法：无 PA 头', null);
  await run('B 发音评估 PA', pa);
  await run('C 发音评估 PA（第二次，看稳定性）', pa);
})();
