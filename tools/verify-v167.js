/* eslint-disable */
// verify-v167（家长 2026-10-30）：
//   「听力对话改得非常好，但是听力的问句是中文的，比如说有一句是听对话，
//    奶奶后来觉得这个软件怎么样？所有这样的听力的问句都给写成英文。」
//
// 钉住四件事：
//   1. 全部 6 周所有听力题干都是纯英文（一个中文字都不许有）
//   2. 复述题（听原句选原句）换成英文题干后，正确项仍逐字等于 audio_text
//   3. 校验器认识英文题干（weekpack-apply / verify-weeks 的题干识别已升级）
//   4. 版本钉子全部升到 167（老版本负向断言用字符类，不许被批量替换误伤）
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const dataSrc = read('public/data.js');
const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();

// ---------------------------------------------------------------------------
section('1. 听力题干全部英文');
{
  let total = 0, cn = [];
  W.forEach((days, w) => days.forEach((d) => (d.modules || []).forEach((m) => {
    if (m.type !== 'listening') return;
    (m.questions || []).forEach((q) => {
      total++;
      if (/[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/.test(String(q.question || ''))) {
        cn.push('W' + (w + 1) + '/' + (q.question || '').slice(0, 24));
      }
    });
  })));
  ok(total >= 50, '听力题总数 ≥50', total);
  ok(cn.length === 0, '没有任何中文听力题干', cn.length ? cn.slice(0, 3).join(' | ') : '0 句中文');
  // 三类英文题干都在题库里
  const all = W.flat().flatMap((d) => (d.modules || []).filter((m) => m.type === 'listening')
    .flatMap((m) => (m.questions || []).map((q) => String(q.question || ''))));
  ok(all.some((s) => /^Which sentence do you hear\?$/i.test(s)), '复述题干：Which sentence do you hear?');
  ok(all.some((s) => /^Which picture matches the sentence you hear\?$/i.test(s)), '选图题干：Which picture matches…');
  ok(all.some((s) => /^Listen to the dialogue\./i.test(s)), '对话问答题干：Listen to the dialogue.…');
  ok(all.some((s) => /^Listen and fill in the blank:/i.test(s)), '听写填空题干：Listen and fill in the blank:…');
  // 家长点名的原句必须变成英文
  ok(all.some((s) => /What does Grandma think of the app/i.test(s)), '「奶奶后来觉得软件怎么样」已改英文');
}

// ---------------------------------------------------------------------------
section('2. 复述题换题干后答案对位不乱');
{
  let echo = 0, mismatch = [];
  W.forEach((days, w) => days.forEach((d) => (d.modules || []).forEach((m) => {
    if (m.type !== 'listening') return;
    (m.questions || []).forEach((q) => {
      if (!/^Which sentence do you hear\?$/i.test(String(q.question || ''))) return;
      echo++;
      if (q.options && q.options[q.answer] !== q.audio_text) mismatch.push('W' + (w + 1) + '/' + q.id);
    });
  })));
  ok(echo >= 40, '复述题（W1~W5 全部）都在', echo);
  ok(mismatch.length === 0, '正确项仍逐字等于 audio_text', mismatch.join(' ') || '全部对位');
}

// ---------------------------------------------------------------------------
section('3. 校验器认识英文题干');
{
  const applySrc = read('tools/weekpack-apply.js');
  ok(/ECHO_STEM = \/\^\(\?:which sentence do you hear\|听到的句子是什么\)\//.test(applySrc), 'weekpack-apply 识别英文复述题干');
  ok(/LISTEN_STEM_EN = \/\^\(\?:which picture matches\|listen to the dialogue\|listen and fill\)\//.test(applySrc), 'weekpack-apply 识别英文问答/选图/填空题干');
  const weeksSrc = read('tools/verify-weeks.js');
  ok(/which picture matches/i.test(weeksSrc) && /listen to the dialogue/i.test(weeksSrc), 'verify-weeks LISTEN_STEMS 已加英文题干');
  const v165Src = read('tools/verify-v165.js');
  ok(/which sentence do you hear/i.test(v165Src), 'verify-v165 题型识别兼容英文题干');
}

// ---------------------------------------------------------------------------
section('4. 版本钉子 = 167');
{
  const html = read('public/index.html');
  const sw = read('public/sw.js');
  ok(/name="app-version" content="171"/.test(html), 'index.html app-version = 167');
  ok((html.match(/\?v=171/g) || []).length === 6, 'index.html 6 处 ?v=171', (html.match(/\?v=171/g) || []).length);
  ok(!/\?v=16[0-6]\b/.test(html), 'index.html 没有残留旧 ?v=');
  ok(/var V = 171;/.test(sw), 'sw.js var V = 167');
  ok(/amy-english-v171/.test(sw), 'sw.js CACHE_NAME = amy-english-v171');
  ok(!/amy-english-v16[0-6]\b/.test(sw), 'sw.js 没有残留旧缓存名');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
