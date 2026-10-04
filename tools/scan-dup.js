const fs = require('fs');
const src = fs.readFileSync('public/data.js', 'utf8');
global.window = {};
eval(src.replace(/^const HOMEWORK_DATA/, 'var HOMEWORK_DATA'));
const D = HOMEWORK_DATA;
const days = Object.keys(D).map(Number).sort((a, b) => a - b);
console.log('days:', days.length, 'from', days[0], 'to', days[days.length - 1]);
const seen = {};
for (const d of days) {
  for (const m of D[d].modules) {
    const qs = m.questions || [];
    qs.forEach((q, qi) => {
      const t = (q.question || q.text || q.sentence || '').trim();
      if (!t) return;
      const key = t.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      if (seen[key]) console.log('DUP day', d, 'q' + qi, '<-> day', seen[key], ':', t.slice(0, 90));
      else seen[key] = d + 'q' + qi;
    });
    const p = (m.passage || '').trim();
    if (p) {
      const key = 'P:' + p.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 100);
      if (seen[key]) console.log('DUP passage day', d, '<->', seen[key], ':', p.slice(0, 70));
      else seen[key] = 'day' + d;
    }
  }
}
console.log('scan done');
