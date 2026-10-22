// v149：把第 4 周周五的「语法复习」替换成家长 2026-10-22 发的 4 张图片里的
// 知识点（KET 核心语法 · 名词复数 / 量词 / 食物词），共 35 道，题型换成
// App 里的选择题 + 填空题形式。写作练习（w4-fri-writing）不动。
const fs = require('fs');
const P = 'public/data.js';
let s = fs.readFileSync(P, 'utf8');

const F = (q) => ({
  id: 'w4-fri-gr' + q.n,
  type: 'fill',
  question: q.q,
  answer: q.a,
  explanation_cn: q.cn,
  explanation_en: q.en,
});
const C = (n, q, opts, ans, cn, en) => ({
  id: 'w4-fri-gr' + n,
  type: 'choice',
  question: q,
  options: opts,
  answer: ans,
  explanation_cn: cn,
  explanation_en: en,
});

const qs = [];

// ---- A. 食物单词补全（图1 School café menu，10 题）----------------------
[
  ['b__rg__', 'burger', '汉堡',
   'burger：u 发 /ɜː/，注意别写成 burgur。b-u-r-g-e-r，6 个字母。',
   'Burger: the vowel is u, spelled b-u-r-g-e-r.'],
  ['ch__ps', 'chips', '薯条',
   'chips 是 chip 的复数，直接加 s。注意和 French fries 是同一种东西的不同说法。',
   'Chips is the plural of chip: just add -s.'],
  ['s__dw__ch__s', 'sandwiches', '三明治（复数）',
   'sandwich 以 ch 结尾，复数要加 -es：sandwiches。注意中间是 d-w-i。',
   'Sandwich ends in -ch, so the plural adds -es: sandwiches.'],
  ['f_sh __nd ch__ps', 'fish and chips', '炸鱼薯条',
   '英国名菜「炸鱼薯条」：fish and chips，三个词中间用 and 连接。',
   'Fish and chips: a famous British dish, three words joined by "and".'],
  ['ch_ck_n s_l_d', 'chicken salad', '鸡肉沙拉',
   'chicken 的 ck 在中间别漏；salad 的第二个 a 发 /ə/。',
   'Chicken salad: don\'t miss the -ck- in chicken.'],
  ['__pl_s', 'apples', '苹果（复数）',
   'apple 复数加 s：apples。开头是两个 p：a-p-p-l-e-s。',
   'Apples: apple with two p\'s, plural adds -s.'],
  ['b_n_n_s', 'bananas', '香蕉（复数）',
   'banana 有三个 a，复数直接加 s：bananas。',
   'Bananas: banana has three a\'s; plural just adds -s.'],
  ['__c__ cr__m', 'ice cream', '冰淇淋',
   'ice cream 是两个词，中间有空格：i-c-e c-r-e-a-m。',
   'Ice cream is two words: ice + cream.'],
  ['__r_ng_ j__c_', 'orange juice', '橙汁',
   'orange 和 juice 都是常见词，合起来是橙汁，中间空格。',
   'Orange juice: two words, orange + juice.'],
  ['l_m_n_d_', 'lemonade', '柠檬水',
   'lemonade 结尾是 -ade，重音在最后一个音节 /ˌleməˈneɪd/。',
   'Lemonade ends in -ade, stress on the last syllable.'],
].forEach((it, i) => qs.push(F({
  n: i + 1,
  q: 'School café menu: ' + it[0] + '（' + it[2] + '）',
  a: it[1], cn: it[3], en: it[4],
})));

// ---- B. 量词（图2，7 题）------------------------------------------------
[
  ['Pass me a ___ of bread.', 'loaf', '一条面包',
   '一条（条状的）面包用 a loaf of bread。复数 loaves：two loaves of bread。',
   'A loaf of bread. Plural: loaves (f → ves).'],
  ['She put a ___ of chocolate into her pocket.', 'bar', '一块巧克力',
   '一块（条状）巧克力用 a bar of chocolate，也可以 a bar of soap（一块肥皂）。',
   'A bar of chocolate.'],
  ['Please bring a ___ of water.', 'bottle', '一瓶水',
   '一瓶水 a bottle of water。瓶装水也叫 bottled water。',
   'A bottle of water.'],
  ['Cut a ___ of ham first.', 'slice', '一片火腿',
   '切下来的一片用 a slice of...：a slice of ham / bread / pizza。',
   'A slice of ham.'],
  ['Do you need two ___ of honey?', 'jars', '两罐蜂蜜',
   '蜂蜜是罐装的：a jar of honey，两罐 two jars of honey。蜂蜜不可数，变复数的是 jar。',
   'Honey is uncountable; the jar is countable: two jars of honey.'],
  ['There are two ___ of paper on the desk.', 'sheets', '两张纸',
   '纸不可数，一张纸 a sheet of paper，两张 two sheets of paper。',
   'Paper is uncountable: two sheets of paper.'],
  ['She used to drink two ___ of beer in the evening.', 'cans', '两罐啤酒',
   '罐装啤酒 a can of beer，两罐 two cans of beer。啤酒本身不可数。',
   'Beer is uncountable; two cans of beer.'],
].forEach((it, i) => qs.push(F({
  n: 11 + i,
  q: it[0] + '（' + it[2] + '）',
  a: it[1], cn: it[3], en: it[4],
})));

// ---- C. 名词复数选择（图3+图4 第 3~16 题，14 题）------------------------
qs.push(C(18, 'Look at the picture. Three ___ are on the floor.（玩具）',
  ['toy', 'toies', 'toys', 'toyies'], 2,
  'toy 直接加 s：toys。以「元音+y」结尾的词复数直接加 s，不变 ies。',
  'Toy ends in vowel + y, so the plural is just toys.'));
qs.push(C(19, 'The painter needs two ___ .（刷子）',
  ['brush', 'brushs', 'brushes', 'brushies'], 2,
  'brush 以 sh 结尾，复数加 -es：brushes。s/x/ch/sh 结尾都加 -es。',
  'Brush ends in -sh, so the plural is brushes.'));
qs.push(C(20, 'There are many ___ in the world.（国家）',
  ['countrys', 'country', 'countryes', 'countries'], 3,
  'country 是「辅音+y」结尾，变 y 为 i 加 es：countries。同类的还有 city→cities。',
  'Country: consonant + y becomes countries (y → i, add -es).'));
qs.push(C(21, 'Look! Two ___ are playing in the garden.（狐狸）',
  ['fox', 'foxes', 'foxs', 'foxies'], 1,
  'fox 以 x 结尾，复数加 -es：foxes。x 结尾的词都要加 es，不能只加 s。',
  'Fox ends in -x, so the plural is foxes.'));
qs.push(C(22, 'The story is about two ___ .（女巫）',
  ['witch', 'witchs', 'witchies', 'witches'], 3,
  'witch 以 tch 结尾，复数加 -es：witches。',
  'Witch ends in -tch, so the plural is witches.'));
qs.push(C(23, 'Put the toys into two ___ .（箱子）',
  ['boxs', 'boxes', 'box', 'boxies'], 1,
  'box 以 x 结尾，复数加 -es：boxes。和 fox 一样。',
  'Box ends in -x, so the plural is boxes.'));
qs.push(C(24, 'I can\'t find the ___ to my bike.（钥匙）',
  ['keyes', 'keys', 'keies', 'keyies'], 1,
  'key 是「元音+y」结尾，复数直接加 s：keys。不是 keyes 也不是 keies。',
  'Key ends in vowel + y: plural is keys.'));
qs.push(C(25, 'The forest is home to ___ .（狼）',
  ['wolfs', 'wolves', 'wolfes', 'wolfies'], 1,
  'wolf 是「f/fe」结尾，变 f 为 ves：wolves。同类：leaf→leaves，knife→knives。',
  'Wolf becomes wolves (f → ves). Same pattern: leaf → leaves.'));
qs.push(C(26, 'We grew two ___ in the garden.（土豆）',
  ['potatos', 'potato', 'potatoes', 'potatoies'], 2,
  'potato 复数加 -es：potatoes。注意：这是少数要加 es 的 o 结尾词，同类的还有 tomato→tomatoes。',
  'Potato becomes potatoes (add -es). Same as tomato → tomatoes.'));
qs.push(C(27, 'Pandas eat ___ every day.（竹子）',
  ['bamboos', 'bambooes', 'bamboo', 'bambools'], 2,
  'bamboo（竹子）是不可数名词，没有复数形式，就用 bamboo。',
  'Bamboo is uncountable — no plural form, just bamboo.'));
qs.push(C(28, 'The cake is made with ___ .（草莓）',
  ['strawberrys', 'strawberries', 'strawberryes', 'strawberry'], 1,
  'strawberry 是「辅音+y」结尾，变 y 为 i 加 es：strawberries。',
  'Strawberry: consonant + y becomes strawberries.'));
qs.push(C(29, 'Two ___ passed on the road.（卡车）',
  ['lorrys', 'lorry', 'lorries', 'lorryes'], 2,
  'lorry 是「辅音+y」结尾，变 y 为 i 加 es：lorries。英式英语的卡车。',
  'Lorry: consonant + y becomes lorries.'));
qs.push(C(30, 'In the story, two ___ helped the boy.（精灵）',
  ['elfs', 'elfes', 'elf', 'elves'], 3,
  'elf 变 f 为 ves：elves。和 wolf→wolves 同一类。',
  'Elf becomes elves (f → ves).'));
qs.push(C(31, 'The library has many ___ .（词典）',
  ['dictionarys', 'dictionaries', 'dictionaryes', 'dictionary'], 1,
  'dictionary 是「辅音+y」结尾，变 y 为 i 加 es：dictionaries。',
  'Dictionary: consonant + y becomes dictionaries.'));

// ---- D. 不规则名词复数（图4 分类题，4 题）--------------------------------
[
  ['child', 'children', '孩子们',
   'child 的复数是不规则的：children。不加 s，也不能写 childs。',
   'Child has the irregular plural children — never childs.'],
  ['foot', 'feet', '脚（复数）',
   'foot 的复数是 feet（元音变化）：one foot, two feet。',
   'Foot becomes feet (vowel change).'],
  ['mouse', 'mice', '老鼠（复数）',
   'mouse 的复数是 mice，不规则的，不能写 mouses。',
   'Mouse becomes mice — irregular.'],
  ['sheep', 'sheep', '绵羊（单复数同形）',
   'sheep 的单数和复数长得一样：one sheep, two sheep。千万不要写 sheeps！',
   'Sheep is the same in singular and plural — never sheeps.'],
].forEach((it, i) => qs.push(F({
  n: 32 + i,
  q: 'Write the plural form: ' + it[0] + ' → ___（' + it[2] + '）',
  a: it[1], cn: it[3], en: it[4],
})));

console.log('questions:', qs.length);
if (qs.length !== 35) { console.error('必须 35 道'); process.exit(1); }

// 找到 w4-fri-grammar 模块的 questions 数组并整块替换。
const anchor = '"id": "w4-fri-grammar"';
const ai = s.indexOf(anchor);
if (ai < 0) { console.error('找不到 w4-fri-grammar'); process.exit(1); }
const qStart = s.indexOf('"questions": [', ai);
const qEnd = s.indexOf('\n        ]', qStart);       // questions 数组的结束
if (qStart < 0 || qEnd < 0) { console.error('找不到 questions 边界'); process.exit(1); }
const before = s.slice(0, qStart);
const after = s.slice(qEnd + '\n        ]'.length);

// duration 5 → 15（35 道题 5 分钟做不完）
let mod = s.slice(ai, qStart);
mod = mod.replace('"duration": 5,', '"duration": 15,');

const body = JSON.stringify(qs, null, 2)
  // JSON.stringify 的缩进是 2 空格；data.js 的层级是 10 空格起，逐行补齐
  .split('\n').map((l, i) => (i === 0 ? l : '          ' + l.trim() === l.trim() && l ? l : l)).join('\n');

// 直接按层级重排：把 stringify 的结果整体缩进到与原来一致（原 questions 内是 10 空格）
const indented = JSON.stringify(qs, null, 2)
  .split('\n')
  .map((line, i) => i === 0 ? '"questions": ' + line : '        ' + line.replace(/^ {2}/, '  '))
  .join('\n')
  .replace(/^"questions": \[/, '"questions": [');

s = before + mod + indented + after;

// 周五 total_duration 30 → 40（写作15 + KET 10 + 语法15）
const fi = s.indexOf(anchor);
const dayStart = s.lastIndexOf('{', s.lastIndexOf('"day_cn": "周五"'));
// 简单可靠：只替换 w4-fri 区块附近最近的 total_duration
const seg = s.slice(fi - 3000, fi);
const segNew = seg.replace('"total_duration": 30,', '"total_duration": 40,');
s = s.slice(0, fi - 3000) + segNew + s.slice(fi);

fs.writeFileSync(P, s);
console.log('w4-fri-grammar 已替换为 35 道新题，duration 15，周五 total 40');
