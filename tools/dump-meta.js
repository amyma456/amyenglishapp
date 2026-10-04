const fs = require('fs');
const fn = new Function(fs.readFileSync('public/data.js', 'utf8') + '; return HOMEWORK_DATA;');
const D = fn();
D.forEach((d, i) => {
  console.log(i, d.day_cn, 'speaking_day:', d.is_speaking_day, 'total:', d.total_duration, 'dur:', d.modules.map(m => m.duration).join(','));
});
