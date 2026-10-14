/* eslint-disable */
// 「字母跟读示范里不要念出 Letters 这个词」—— 先量一量再改（v109）。
//
// 家长反馈：字母跟读那一屏，系统音会把 "letters" 这个字念出来。
// 但 `Letters:` 前缀不是装饰：v94 的实测结论是它挡着 TTS 的"智能拼读"
// （不加前缀时 C-A-M-E-R-A 会被读成 CAMERA CAMERA，孩子根本没听到字母）。
//
// 所以先做 A/B 往返实测：同一批词，两种写法各合成一遍，再用 ASR 反听回来，
// 看字母串还在不在。数据说话，不靠猜。
//
// 用法：node tools/bench-spell-demo-prefix.js
const fs = require('fs');
const path = require('path');

const ENDPOINT = process.env.PREVIEW_ENDPOINT || 'https://amyeng.top';

const WORDS = (process.env.BENCH_WORDS ? process.env.BENCH_WORDS.split(',') :
  ['camera', 'guitar', 'panda', 'island', 'museum', 'dinosaur',
   'beautiful', 'breakfast', 'library', 'healthy',
   'pencil', 'window', 'rabbit', 'orange', 'elephant']);

const norm = s => String(s || '').toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();

async function tts(text) {
  const r = await fetch(ENDPOINT + '/api/tts?text=' + encodeURIComponent(text));
  if (!r.ok) throw new Error('tts HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

async function asr(buf, hint) {
  const r = await fetch(ENDPOINT + '/api/transcribe?model=turbo&prefer=cf&prompt=' + encodeURIComponent(hint), {
    method: 'POST',
    headers: { 'Content-Type': 'audio/mpeg' },
    body: buf,
  });
  const t = await r.text();
  try { return JSON.parse(t).text || ''; } catch (e) { return ''; }
}

// 字母串"保住了没有"：每个字母名都要在转写里出现（按出现次数算，重复字母要求重复数）
function letterRecall(units, transcript) {
  const got = norm(transcript).split(' ').filter(Boolean);
  const need = units.map(u => u.toLowerCase());
  const pool = got.slice();
  let hit = 0;
  for (const n of need) {
    const i = pool.indexOf(n);
    if (i >= 0) { pool.splice(i, 1); hit++; }
  }
  return { hit: hit, total: need.length, rate: need.length ? hit / need.length : 0 };
}

(async () => {
  const variants = {
    'A · Letters: C, A, M, E, R, A, camera  ': u => 'Letters: ' + u.join(', ') + ', ',
    'I · 前导逗号 ", C, A, M, E, R, A, camera"': u => ', ' + u.join(', ') + ', ',
    'J · 双逗号 "C, A, M, E, R, A,, camera"  ': u => u.join(', ') + ',, ',
    'K · 前导破折号 "— C, A, M, E, R, A, camera"': u => '\u2014 ' + u.join(', ') + ', ',
  };
  if (process.env.BENCH_VARIANTS) {
    const keep = process.env.BENCH_VARIANTS.split(',');
    Object.keys(variants).forEach(k => { if (keep.indexOf(k[0]) < 0) delete variants[k]; });
  }
  const keys = Object.keys(variants);
  const rows = [];

  for (const w of WORDS) {
    const units = w.toUpperCase().split('');
    const hint = units.join(', ');
    const row = { word: w, units: units.join('') };
    for (const k of keys) {
      const text = variants[k](units) + w;
      try {
        const buf = await tts(text);
        const said = await asr(buf, hint);
        const rec = letterRecall(units, said);
        // "字母被合并" = 整词在转写里出现了不止一次（TTS 把字母串直接读成那个词，
        // 字母名一个都没读出来）。注意不能只看"出现过" —— 末尾那个整词本来就会出现。
        const occ = (norm(said).match(new RegExp('(^| )' + w + '( |$)', 'g')) || []).length;
        row[k] = { text: text, bytes: buf.length, heard: said, rec: rec, occ: occ, merged: occ > 1 };
      } catch (e) {
        row[k] = { error: String(e.message) };
      }
    }
    rows.push(row);
    process.stdout.write('.');
  }
  console.log('\n');

  let worst = {};
  for (const k of keys) worst[k] = { sum: 0, n: 0, merged: 0, fail: [] };
  for (const r of rows) {
    for (const k of keys) {
      const v = r[k];
      if (!v || v.error) { worst[k].fail.push(r.word + '(请求失败)'); continue; }
      worst[k].sum += v.rec.rate; worst[k].n++;
      if (v.merged) { worst[k].merged++; worst[k].fail.push(r.word + '(字母被合并)'); }
      else if (v.rec.rate < 0.8) worst[k].fail.push(r.word + '(' + Math.round(v.rec.rate * 100) + '%)');
    }
  }
  for (const k of keys) {
    const w = worst[k];
    console.log('【' + k + '】字母识别到 ' + Math.round(w.sum / Math.max(1, w.n) * 100) + '%'
      + '，字母被合并 ' + w.merged + '/' + w.n
      + (w.fail.length ? '  问题：' + w.fail.slice(0, 8).join(' ') : '  ✅ 全部正常'));
  }
  console.log('\n--- 逐条明细 ---');
  for (const r of rows) {
    console.log('\n' + r.word.toUpperCase() + ' (' + r.units + ')');
    for (const k of keys) {
      const v = r[k];
      console.log('  ' + k + ' → ' + (v.error ? 'ERROR ' + v.error
        : Math.round(v.rec.rate * 100) + '%  “' + v.heard + '”'));
    }
  }
  fs.writeFileSync(path.join(__dirname, 'bench-spell-demo-prefix.json'), JSON.stringify(rows, null, 1));
})();
