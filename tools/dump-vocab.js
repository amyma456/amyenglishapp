const fs = require('fs');
const fn = new Function(fs.readFileSync('public/data.js', 'utf8') + '; return HOMEWORK_DATA;');
const D = fn();
D.forEach((d, i) => {
  d.modules.forEach(m => {
    if (m.type === 'vocabulary_game') console.log('day', i, 'words:', m.words.map(w => w.word).join(','));
  });
});
