const fs = require('fs');
const src = fs.readFileSync('public/data.js', 'utf8');
const fn = new Function(src + '; return HOMEWORK_DATA;');
const D = fn();
const seen = {};
for (const d of D) {
  for (const m of d.modules) {
    if (seen[m.type]) continue;
    seen[m.type] = 1;
    console.log('########', m.type);
    console.log(JSON.stringify(m, null, 1).slice(0, 3000));
    console.log('...');
  }
}
