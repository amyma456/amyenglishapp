/* eslint-disable */
// 真实语音验证：Azure TTS 合成 → Azure 发音评估，看分数是否随"读得对不对"变化，
// 以及耗时随句子长度的增长。这是判断「微软能不能直接给分」的关键证据。
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(process.env.USERPROFILE || process.env.HOME, '.workbuddy/secrets/azure.env'), 'utf8')
  .split(/\r?\n/).forEach(function (l) {
    const m = l.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
const KEY = env.AZURE_TTS_KEY, REGION = env.AZURE_TTS_REGION;

async function tts(text, rate) {
  const ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
    + '<voice name="en-US-JennyNeural"><prosody rate="' + (rate || '0%') + '">'
    + text + '</prosody></voice></speak>';
  const res = await fetch('https://' + REGION + '.tts.speech.microsoft.com/cognitiveservices/v1', {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error('tts ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function pa(audio, ref, label) {
  const header = Buffer.from(JSON.stringify({
    ReferenceText: ref, GradingSystem: 'HundredMark', Granularity: 'Word', EnableMiscue: true,
  })).toString('base64');
  const t0 = Date.now();
  const res = await fetch('https://' + REGION + '.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed', {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'audio/wav; codec=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': header,
    },
    body: audio,
  });
  const ms = Date.now() - t0;
  const d = await res.json();
  const best = (d.NBest && d.NBest[0]) || {};
  const words = Array.isArray(best.Words) ? best.Words : [];
  return {
    label: label, ms: ms, status: d.RecognitionStatus, snr: d.SNR,
    text: best.Display || d.DisplayText || '',
    accuracy: best.AccuracyScore, confidence: best.Confidence,
    perWord: words.map(function (w) { return w.Word + ':' + w.AccuracyScore + (w.ErrorType ? '/' + w.ErrorType : ''); }),
  };
}

(async function () {
  const cases = [
    { ref: 'thank you for watching', say: 'thank you for watching', label: '① 4词 读对' },
    { ref: 'i like to read books after school', say: 'i like to read books after school', label: '② 7词 读对' },
    { ref: 'the quick brown fox jumps over the lazy dog', say: 'the quick brown fox jumps over the lazy dog', label: '③ 9词 读对' },
    { ref: 'i like to read books after school', say: 'i like to eat books before school', label: '④ 7词 读错(对照)' },
    { ref: 'i like to read books after school', say: 'i like to read books', label: '⑤ 读一半(对照)' },
  ];
  for (const c of cases) {
    const audio = await tts(c.say);
    const r = await pa(audio, c.ref, c.label);
    console.log('\n' + r.label + '  audio=' + audio.length + 'B  RTT=' + r.ms + 'ms  status=' + r.status + '  SNR=' + r.snr);
    console.log('  text=' + JSON.stringify(r.text) + '  AccuracyScore=' + r.accuracy + '  conf=' + r.confidence);
    console.log('  words=' + r.perWord.join(' '));
  }
})();
