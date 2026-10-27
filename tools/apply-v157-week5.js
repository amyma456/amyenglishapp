// tools/apply-v157-week5.js — v157 可重放生成器：新增 WEEK5
//
// 家长 2026-10-27：
//   ① 完形/阅读跟读连接的句子总体太长 → W5 文章全面砍短
//      （阅读每句 ≤14 词、完形每句 ≤13 词，不再搞逐周加长的难度爬坡）；
//   ② 本周（第 5 周，2026-10-26 起）周五写作和上周一模一样 → 写作换全新主题。
//      根因：HOMEWORK_WEEKS 只有 4 周，本周周号被夹回 WEEK4。
//
// 用法：node tools/apply-v157-week5.js
//   · 幂等：data.js 里已有 WEEK5 时直接跳过；
//   · 重放前先恢复备份：cp /tmp/data.js.v156.bak public/data.js
//     （脚本首次运行时自动落这份备份）。
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data.js');
let src = fs.readFileSync(file, 'utf8');

if (/const WEEK5 = /.test(src)) {
  console.log('WEEK5 已存在，跳过（幂等守卫）。');
  process.exit(0);
}

// 首次运行落备份（.bak 里有 v156 原始内容，重放前恢复它）
const bakFile = path.join(__dirname, 'data.js.v156.bak');
if (!fs.existsSync(bakFile)) {
  fs.writeFileSync(bakFile, src);
  console.log('已写备份 ' + bakFile);
}

const W4 = new Function(src + '; return WEEK4;')();
const week5 = JSON.parse(JSON.stringify(W4));

// —— 1) 全量改名：模块 id / 题目 id 的 w4- 前缀 → w5- ——
// verify-weeks 全局 id 查重要求 5 周之间 id 唯一。
(function renameIds(o) {
  if (Array.isArray(o)) return o.forEach(renameIds);
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string') {
        if (v.indexOf('w4-') >= 0) o[k] = v.replace(/w4-/g, 'w5-');
      } else {
        renameIds(v);
      }
    }
  }
})(week5);

// —— 2) 阅读课文砍短（EN 每句 ≤14 词；CN 与 EN 逐句一对一对应）——
// 问题选项不动，只换题干措辞避免和上周逐字重复；正确项下标不变。
const READING = {
  'w5-mon-reading': {
    en: 'The Palace Museum, or the Forbidden City, stands in the heart of Beijing. Emperors of the Ming and Qing dynasties lived there for almost 500 years. The palace has about 9000 rooms. Its buildings are made of wood, without a single nail. Red walls and golden roofs shine under the blue sky. Over seventeen million people visit this great museum every year.',
    cn: '故宫博物院，又叫紫禁城，坐落在北京市中心。明清两代的皇帝在这里生活了近五百年。故宫有大约九千间房。建筑全部用木头建成，不用一根钉子。红墙金瓦在蓝天下闪闪发光。每年有一千七百多万人来参观这座伟大的博物馆。',
    questions: [
      'What do people also call the Forbidden City?',
      'How many years did emperors live there?',
      'What are the palace buildings made of?',
      'The best title for this passage about the old palace is ___.'
    ]
  },
  'w5-tue-reading': {
    en: "Chang'e is the name of China's moon exploration programme. It comes from a goddess in an old Chinese story. In 2020, Chang'e-5 flew to the moon and brought soil back to the earth. In 2024, Chang'e-6 brought back soil from the far side of the moon. The soil helps scientists learn how the moon was born. Maybe Chinese astronauts will walk on the moon one day.",
    cn: '「嫦娥」是中国探月工程的名字。它来自古代神话里的仙女。2020年，嫦娥五号飞向月球，把土壤带回了地球。2024年，嫦娥六号带回了月球背面的土壤。月壤帮助科学家研究月球是怎样诞生的。也许有一天，中国航天员会踏上月球。',
    questions: [
      'What is the name Chang\'e taken from?',
      'What did Chang\'e-5 bring home in 2020?',
      'What was amazing about Chang\'e-6?',
      'The best title for this passage about going to the moon is ___.'
    ]
  },
  'w5-wed-reading': {
    en: "C919 is China's first big passenger plane. The letter C stands for China. It can carry about 160 passengers. It can fly over five thousand kilometres without stopping. Its first passenger flight was in May 2023, from Shanghai to Beijing. China's own big plane is flying higher and higher.",
    cn: 'C919是中国自主制造的第一架大型客机。字母C代表中国。它可以载约160名乘客。它不休息能飞五千多公里。它的首次商业飞行在2023年5月，从上海到北京。中国自己的大飞机正飞得越来越高。',
    questions: [
      'What does the letter C in C919 mean?',
      'How many passengers can the plane carry?',
      'When did C919 make its first passenger flight?',
      'The best title for this passage about the big plane is ___.'
    ]
  },
  'w5-sat-reading': {
    en: "Paper cutting is one of China's oldest folk arts. With a pair of scissors and red paper, artists make wonderful pictures. During the Spring Festival, people in the north put paper cuttings on windows. The red colour means good luck. In 2009, paper cutting entered the world heritage list. Today this red art is popular around the world.",
    cn: '剪纸是中国最古老的民间艺术之一。艺术家只用一把剪刀和红纸，就能剪出精彩的图画。春节时，中国北方的人们把剪纸贴在窗上。红色代表好运。2009年，剪纸被列入世界文化遗产名录。今天，这门红色的艺术在全世界流行。',
    questions: [
      'What do artists use to make paper cuttings?',
      'Where do people put paper cuttings at Spring Festival?',
      'In which year did paper cutting enter the world heritage list?',
      'The best title for this passage about red paper art is ___.'
    ]
  }
};

week5.forEach(day => day.modules.forEach(m => {
  const r = READING[m.id];
  if (r) {
    m.passage = r.en;
    m.passage_cn = r.cn;
    if (Array.isArray(m.questions) && m.questions.length === r.questions.length) {
      m.questions.forEach((q, i) => { q.question = r.questions[i]; });
    }
  }
}));

// —— 3) 完形课文砍短（每句 ≤13 词；6 个空位桩和答案全部原样保留）——
const CLOZE = {
  'w5-thu-cloze': 'The Hong Kong-Zhuhai-Macao Bridge is a modern wonder. Its total 1___ is 55 kilometres. The bridge 2___ Hong Kong, Zhuhai and Macao like a dragon. Before, a trip 3___ about four hours by road. Now it takes only forty-five 4___. The tunnel runs 5___ the sea, so ships can pass above it. People say it 6___ the three cities into one family.',
  'w5-sun-cloze': 'Chinese characters are very old. People wrote on oracle bones 3000 years 1___. Early characters looked like the things they stood 2___. The character for mountain looked like three 3___. Today people write with pens and 4___. There are about 50000 characters, 5___ people only use a few thousand. These characters will keep 6___ for 5000 more years.'
};

week5.forEach(day => day.modules.forEach(m => {
  if (CLOZE[m.id]) m.passage = CLOZE[m.id];
}));

// —— 4) 周五写作全新主题（上周是 Protecting Our Earth）——
const day4 = week5[4];
const wi = day4.modules.findIndex(m => m.id === 'w5-fri-writing');
if (wi < 0) throw new Error('W5 周五写作模块未找到（应为 w5-fri-writing）');
day4.modules[wi] = {
  id: 'w5-fri-writing',
  name_cn: '写作练习',
  type: 'writing_template',
  duration: 15,
  title: 'My Healthy Life',
  requirement_cn: '请根据关键词提示完成作文，完成后请背诵全文。明天将进行挖空默写测试！',
  keywords: ['do morning exercises', 'eat more vegetables', 'drink milk', 'go to bed early', 'strong and healthy'],
  keywords_cn: ['做早操', '多吃蔬菜', '喝牛奶', '早点睡觉', '强壮又健康'],
  template: 'Every morning, I {{1}} in the park. At meals, I {{2}} and seldom eat junk food. Before school, I {{3}} with bread. I never stay up late, and I {{4}} every night. Good habits make me {{5}}.',
  blanks: [
    { id: 1, hint_cn: '做早操', hint_en: 'do morning exercises', answer: 'do morning exercises' },
    { id: 2, hint_cn: '多吃蔬菜', hint_en: 'eat more vegetables', answer: 'eat more vegetables' },
    { id: 3, hint_cn: '喝牛奶', hint_en: 'drink milk', answer: 'drink milk' },
    { id: 4, hint_cn: '早点睡觉', hint_en: 'go to bed early', answer: 'go to bed early' },
    { id: 5, hint_cn: '强壮又健康', hint_en: 'strong and healthy', answer: 'strong and healthy' }
  ],
  full_text: 'Every morning, I do morning exercises in the park. At meals, I eat more vegetables and seldom eat junk food. Before school, I drink milk with bread. I never stay up late, and I go to bed early every night. Good habits make me strong and healthy.',
  full_text_cn: '每天早上，我在公园里做早操。吃饭时，我多吃蔬菜，很少吃垃圾食品。上学前，我喝牛奶，配着面包。我从不熬夜，每天晚上都早点睡觉。好习惯让我强壮又健康。',
  explanation_cn: '这篇作文围绕健康生活展开，用了5个关键词：1) do morning exercises 做早操；2) eat more vegetables 多吃蔬菜；3) drink milk 喝牛奶；4) go to bed early 早点睡觉；5) strong and healthy 强壮又健康。全文用一般现在时，主语是 I，动词用原形。good habits make me + 形容词，意思是「好习惯让我……」。',
  explanation_en: 'This essay is about healthy living, using 5 keywords. Simple present tense with I. The pattern "good habits make me + adjective" means good habits bring you something.'
};

// —— 5) 完形逐句中文（CLOZE_SENTENCE_CN 按 _splitSentences 顺序 7 句）——
const CLOZE_CN = {
  'w5-thu-cloze': [
    '港珠澳大桥是现代的奇迹。',
    '它全长55公里。',
    '大桥像一条巨龙，把香港、珠海和澳门连接起来。',
    '从前，坐车走公路要大约四个小时。',
    '现在只需要四十五分钟。',
    '海底隧道在海面之下穿行，船只可以从上方通过。',
    '人们说它把三座城市连成了一个大家庭。'
  ],
  'w5-sun-cloze': [
    '汉字非常古老。',
    '三千多年前，人们把字刻在甲骨上。',
    '古时候，汉字长得像它们所代表的东西。',
    '「山」字就像三个山峰。',
    '今天，人们用笔和键盘写字。',
    '汉字大约有五万个，但人们日常只用几千个。',
    '这些字还会在未来五千年继续生长。'
  ]
};

const cnAnchor = '"汉字承载着五千年的历史，还会在未来五千年继续生长。"\n  ]\n};';
if (src.indexOf(cnAnchor) < 0) throw new Error('CLOZE_SENTENCE_CN 尾部锚点没找到（w4-sun-cloze 最后一句）');
const cnAdd = '"' + '汉字承载着五千年的历史，还会在未来五千年继续生长。' + '"\n  ],\n'
  + '  "w5-thu-cloze": ' + JSON.stringify(CLOZE_CN['w5-thu-cloze'], null, 2).replace(/\n/g, '\n  ') + ',\n'
  + '  "w5-sun-cloze": ' + JSON.stringify(CLOZE_CN['w5-sun-cloze'], null, 2).replace(/\n/g, '\n  ') + '\n};';
src = src.replace(cnAnchor, cnAdd);

// —— 6) 注入 WEEK5 字面量并挂进 HOMEWORK_WEEKS ——
const weekMark = 'const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4];';
if (src.indexOf(weekMark) < 0) throw new Error('HOMEWORK_WEEKS 行没找到');
const week5Literal = '// ===== v157：WEEK5（2026-10-26 起）======================================\n'
  + '// 由 tools/apply-v157-week5.js 生成：W4 骨架 + 砍短的文章 + 全新周五写作。\n'
  + '// 家长红线：跟读句子要短（阅读每句 ≤14 词、完形 ≤13 词），难度不再逐周爬坡。\n'
  + 'const WEEK5 = ' + JSON.stringify(week5) + ';\n\n';
src = src.replace(weekMark, week5Literal + 'const HOMEWORK_WEEKS = [WEEK1, WEEK2, WEEK3, WEEK4, WEEK5];');

fs.writeFileSync(file, src);
console.log('WEEK5 注入完成：'
  + week5.reduce((s, d) => s + d.modules.length, 0) + ' 个模块 / '
  + week5.length + ' 天。跑 node tools/verify-v157.js 校验。');
