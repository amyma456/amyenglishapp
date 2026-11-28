// v237：2026-11-29（周日）～ 12-06（下周日）题组
// 家长 2026-11-28 提供材料：小红帽（上）课文 + 每日默写 + 比较级最高级 + 代词/介词专项。
// 口径：
//   1. 下周每天的阅读/完形全部换成 Little Red Riding Hood 文本，挖空词取自书中橘色高频词；
//   2. 同一文本用「细节 / 词义 / 指代 / 排序 / 主旨 / 语法填空」轮换考法，不重复同一道题；
//   3. 图片里的语法题分到周二/周四/周五/周六/周日语法模块；音标默写与情境默写分到每天键盘拼写。
// 幂等：已有 w9sun-lrrh-cloze 就跳过。
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'public', 'data.js');
let src = fs.readFileSync(dataPath, 'utf8');
if (src.indexOf('w9sun-lrrh-cloze') >= 0 && src.indexOf('w10-fri-reading') >= 0) {
  console.log('已经是 v237 内容，跳过。');
  process.exit(0);
}

const WEEKS = new Function(src + '; return {HOMEWORK_WEEKS};')().HOMEWORK_WEEKS;
const sun = WEEKS[8][6];   // 2026-11-29 周日（明天）
const wk = WEEKS[9];       // 2026-11-30 ~ 12-06 下周

const STORY = 'Long, long ago, there was a lovely little girl. Everyone called her Little Red Riding Hood because she loved wearing a pretty red hood. One day, her grandmother was ill, so her mother asked her to take some cakes and milk to the old woman. Her grandmother lived alone in a small house deep in the forest. Her mother told her to go straight and never talk to strangers on the way. However, on her way, Little Red Riding Hood met a clever but bad wolf. The wolf asked where she was going, and the naive girl told him everything.';
const STORY_CN = '很久很久以前，有一个可爱的小女孩。大家都叫她小红帽，因为她喜欢戴一顶漂亮的红色兜帽。一天，她的外婆生病了，妈妈让她带一些蛋糕和牛奶给那位老人。外婆独自住在森林深处的一座小房子里。妈妈叫她一直往前走，路上千万不要和陌生人说话。可是，在路上，小红帽遇到了一只聪明却很坏的狼。狼问她要去哪里，天真的女孩把一切都告诉了它。';

function q(id, question, options, answer, expl, qtype) {
  return { id, type: 'choice', question, options, answer, explanation_cn: expl, qtype_cn: qtype };
}
function f(id, question, answer, expl) {
  return { id, type: 'fill', question, answer, explanation_cn: expl };
}
function set(day, type, mod) {
  const i = day.modules.findIndex(m => m.type === type);
  if (i < 0) throw new Error(day.day_cn + ' 缺少模块 ' + type);
  day.modules[i] = mod;
}
function add(day, mod) {
  if (day.modules.some(m => m.id === mod.id)) throw new Error('重复模块 id: ' + mod.id);
  day.modules.push(mod);
}
function cloze(id, name, passage, passageCn, questions) {
  return { id, name_cn: name, type: 'cloze', duration: 10, passage, passage_cn: passageCn, questions };
}
function reading(id, name, questions) {
  return { id, name_cn: name, type: 'reading', duration: 10, passage: STORY, passage_cn: STORY_CN, questions };
}
function grammar(id, name, questions) {
  return { id, name_cn: name, type: 'grammar', duration: 10, questions };
}
function keyboard(id, name, pairs) {
  return {
    id, name_cn: name, type: 'tense', duration: 6, skill: 'keyboard',
    questions: pairs.map((p, i) => f(id + i, p[0], p[1], p[2]))
  };
}

/* ---------------- 四篇完形：同一故事，挖不同橘色词 ---------------- */
const CLOZE_A = cloze('w9sun-lrrh-cloze', '完形填空 · 小红帽（上）· 名词与故事线',
  'Long, long ago, there was a lovely 1___ girl. Everyone called her Little Red Riding 2___ because she loved wearing a pretty red hood. One day, her 3___ was ill, so her mother asked her to take some cakes and milk to the old woman. Her grandmother lived alone in a small house deep in the 4___. Her mother told her to go straight and never talk to strangers on the way. However, on her way, Little Red Riding Hood met a clever but bad 5___. The wolf asked where she was going, and the naive girl told him 6___.',
  STORY_CN,
  [
    q('w9sun-cz1', '1___', ['little', 'tall', 'old', 'bad'], 0, '看空后是 girl，开篇介绍「一个可爱的小女孩」用 lovely little girl；little 表示「小的」，选 A。其余词和 lovely 不搭配。方法：完形先读空前后的词。', '语义搭配'),
    q('w9sun-cz2', '2___', ['hat', 'hood', 'bag', 'cake'], 1, '后文说她喜欢戴红色兜帽，所以大家叫她 Little Red Riding Hood（小红帽）；hood 是「兜帽」，选 B。', '专有名词'),
    q('w9sun-cz3', '3___', ['sister', 'friend', 'grandmother', 'teacher'], 2, '后半句说妈妈让她带蛋糕和牛奶，原因是外婆生病了；grandmother 外婆，选 C。', '因果定位'),
    q('w9sun-cz4', '4___', ['forest', 'school', 'room', 'shop'], 0, 'deep in the forest 意为「在森林深处」，外婆独自住在森林里的小房子；选 A。', '固定搭配'),
    q('w9sun-cz5', '5___', ['dog', 'wolf', 'cat', 'bird'], 1, '下一句 The wolf asked… 已经给出答案，遇到的是一只狼；选 B。方法：空后面的句子常常就是提示。', '上下文提示'),
    q('w9sun-cz6', '6___', ['something', 'nothing', 'anything', 'everything'], 3, 'naive 天真的女孩把「一切」都告诉了狼，told him everything；选 D。nothing 是什么都不说，和 naive 矛盾。', '语义搭配')
  ]);

const CLOZE_B = cloze('w10-tue-cloze', '完形填空 · 小红帽（上）· 连词与句子成分',
  'Long, long 1___, there was a lovely little girl. Everyone called her Little Red Riding Hood 2___ 3___ loved 4___ a pretty red hood. One day, her grandmother was ill, so her mother asked her to take some cakes and milk to the 5___ woman. Her grandmother lived alone in a small house deep in the forest. Her mother told her to go 6___ and never talk to strangers on the way. However, on her way, Little Red Riding Hood met a clever but bad wolf. The wolf asked where she was going, and the naive girl told him everything.',
  STORY_CN,
  [
    q('w10-tue-cz1', '1___', ['now', 'ago', 'later', 'soon'], 1, 'long, long ago 是讲故事的固定开头，意为「很久很久以前」；选 B。', '固定搭配'),
    q('w10-tue-cz2', '2___', ['but', 'and', 'so', 'because'], 3, '后面解释大家为什么叫她小红帽，要用 because 引出原因；选 D。', '连词逻辑'),
    q('w10-tue-cz3', '3___', ['he', 'she', 'they', 'it'], 1, '这里代指前面那个小女孩，作从句主语用 she；选 B。', '代词指代'),
    q('w10-tue-cz4', '4___', ['wear', 'wears', 'wearing', 'wore'], 2, 'loved 后面用动名词：love doing sth. 喜欢做某事；wearing 选 C。', '动词形式'),
    q('w10-tue-cz5', '5___', ['young', 'pretty', 'old', 'new'], 2, 'the old woman 指前面生病的外婆，old 与前文 ill 对应；选 C。', '上下文提示'),
    q('w10-tue-cz6', '6___', ['slowly', 'back', 'straight', 'around'], 2, '妈妈叮嘱「一直往前走」用 go straight；straight 选 C。', '固定搭配')
  ]);

const CLOZE_C = cloze('w10-thu-cloze', '完形填空 · 小红帽（上）· 动词与句式',
  'Long, long ago, 1___ was a lovely little girl. Everyone called 2___ Little Red Riding Hood because she loved wearing a pretty red hood. One day, her grandmother was ill, so her mother 3___ her to take some cakes and milk 4___ the old woman. Her grandmother 5___ alone in a small house deep in the forest. Her mother 6___ her to go straight and never talk to strangers on the way. However, on her way, Little Red Riding Hood met a clever but bad wolf. The wolf asked where she was going, and the naive girl told him everything.',
  STORY_CN,
  [
    q('w10-thu-cz1', '1___', ['here', 'there', 'it', 'they'], 1, 'there was 表示「以前有」，故事开头用 there was a lovely little girl；选 B。', 'there be 句型'),
    q('w10-thu-cz2', '2___', ['him', 'them', 'her', 'us'], 2, 'called 后面用宾格，代指小女孩用 her；选 C。', '代词格'),
    q('w10-thu-cz3', '3___', ['ask', 'asks', 'asked', 'asking'], 2, '讲故事都用过去式，ask sb. to do sth. 的过去式是 asked；选 C。', '时态一致'),
    q('w10-thu-cz4', '4___', ['for', 'with', 'to', 'at'], 2, 'take sth. to sb. 把某物带给某人，to 表方向；选 C。', '介词搭配'),
    q('w10-thu-cz5', '5___', ['live', 'lives', 'lived', 'living'], 2, '全文是过去时，live 的过去式 lived alone 独自生活；选 C。', '时态一致'),
    q('w10-thu-cz6', '6___', ['tell', 'tells', 'told', 'telling'], 2, 'tell sb. to do sth. 告诉某人做某事，过去式 told；选 C。', '动词搭配')
  ]);

const CLOZE_D = cloze('w10-sun-cloze', '完形填空 · 小红帽（上）· 形容词与情节',
  '1___, long ago, there was a lovely little 2___. Everyone called her Little Red Riding Hood because she loved wearing a pretty red hood. One day, her grandmother was ill, so her mother asked her to take some 3___ and 4___ to the old woman. Her grandmother lived 5___ in a small house deep in the forest. Her mother told her to go straight and never talk to strangers on the way. However, on her way, Little Red Riding Hood met a 6___ but bad wolf. The wolf asked where she was going, and the naive girl told him everything.',
  STORY_CN,
  [
    q('w10-sun-cz1', '1___', ['short', 'long', 'late', 'again'], 1, '固定开头 Long, long ago「很久很久以前」；选 B。', '固定搭配'),
    q('w10-sun-cz2', '2___', ['boy', 'girl', 'woman', 'teacher'], 1, 'a lovely little girl 一个可爱的小女孩，下一句 her 也提示是女孩；选 B。', '上下文提示'),
    q('w10-sun-cz3', '3___', ['books', 'shoes', 'cakes', 'flowers'], 2, '外婆生病，妈妈让她带蛋糕和牛奶；cakes 选 C。', '细节定位'),
    q('w10-sun-cz4', '4___', ['water', 'milk', 'tea', 'juice'], 1, 'cakes and milk 蛋糕和牛奶，是原文搭配；选 B。', '固定搭配'),
    q('w10-sun-cz5', '5___', ['alone', 'together', 'quickly', 'happily'], 0, 'lived alone 独自居住，外婆一个人住在森林的小房子里；选 A。', '词义辨析'),
    q('w10-sun-cz6', '6___', ['kind', 'clever', 'slow', 'little'], 1, 'a clever but bad wolf 一只聪明却很坏的狼，but 前后形成转折；选 B。', '语义搭配')
  ]);

/* ---------------- 三篇阅读：同一文本，换三种考法 ---------------- */
const READ_MON = reading('w10-mon-reading', '阅读理解 · 小红帽（上）· 找细节', [
  q('w10-mon-rd1', 'Who asked Little Red Riding Hood to take cakes and milk?', ['her mother', 'her grandmother', 'the wolf', 'a stranger'], 0, '第一段说 so her mother asked her to take some cakes and milk，是妈妈让她去的，选 A。方法：Who 题在原文里找人名。', '细节定位'),
  q('w10-mon-rd2', 'Why did the girl take cakes and milk?', ['Because she was hungry.', 'Because the wolf asked her.', 'Because her grandmother was ill.', 'Because she liked cakes.'], 2, '原文 her grandmother was ill, so her mother asked her to take…，so 前就是原因，选 C。', '因果定位'),
  q('w10-mon-rd3', 'In "she loved wearing a pretty red hood", what does "hood" mean?', ['a kind of cake', 'a cover for the head', 'a small house', 'a wild animal'], 1, '小红帽因为总戴红色兜帽而得名，hood 是「兜帽、头罩」，选 B。', '词义猜测'),
  q('w10-mon-rd4', 'What did the mother tell the girl to do on the way?', ['Talk to strangers', 'Run to the forest', 'Go straight and never talk to strangers', 'Take the wolf home'], 2, '原文 told her to go straight and never talk to strangers on the way，选 C。', '细节定位')
]);

const READ_WED = reading('w10-wed-reading', '阅读理解 · 小红帽（上）· 看指代', [
  q('w10-wed-rd1', 'Where did the grandmother live?', ['In a small house deep in the forest', 'In a big city', 'Near the school', 'On a busy street'], 0, '原文 lived alone in a small house deep in the forest，选 A。', '细节定位'),
  q('w10-wed-rd2', 'Who is "her" in "Everyone called her Little Red Riding Hood"?', ['the mother', 'the grandmother', 'the little girl', 'the wolf'], 2, '前一句说 there was a lovely little girl，紧接着 everyone called her…，her 指这个小女孩，选 C。', '指代理解'),
  q('w10-wed-rd3', 'What did the wolf ask the girl?', ['Where she was going', 'What she was eating', 'How old she was', 'Where her school was'], 0, '结尾 The wolf asked where she was going，选 A。', '细节定位'),
  q('w10-wed-rd4', 'Which word describes the girl in the last sentence?', ['clever', 'naive', 'bad', 'old'], 1, '结尾说 the naive girl told him everything：天真的女孩把一切都告诉了狼。clever 和 bad 是形容狼的，选 B。', '人物判断')
]);

const READ_SAT = reading('w10-sat-reading', '阅读理解 · 小红帽（上）· 排序与主旨', [
  q('w10-sat-rd1', 'What did the girl love wearing?', ['a pretty red hood', 'a black coat', 'a blue hat', 'a long dress'], 0, '原文 she loved wearing a pretty red hood，这也是「小红帽」名字的来历，选 A。', '细节定位'),
  q('w10-sat-rd2', 'What did the girl tell the wolf?', ['Only her name', 'Nothing at all', 'Everything', 'Just the way home'], 2, '结尾 the naive girl told him everything，选 C。', '细节定位'),
  q('w10-sat-rd3', 'Which happened first in the story?', ['The girl met the wolf.', 'The grandmother was ill.', 'The mother told her the way.', 'The wolf asked her a question.'], 1, '先有外婆生病，才有妈妈叫她送东西，再才有路上的叮嘱和遇到狼；选 B。', '事件排序'),
  q('w10-sat-rd4', 'What can we learn from the mother’s words?', ['Always talk to strangers', 'Never talk to strangers on the way', 'Never visit grandmother', 'Always take a wolf with you'], 1, '妈妈说 never talk to strangers on the way，是在提醒路上别和陌生人说话，选 B。', '主旨理解')
]);

const READ_FRI = reading('w10-fri-reading', '阅读理解 · 小红帽（上）· 判断与标题', [
  q('w10-fri-rd1', 'Which sentence is true about the girl?', ['She lived with the wolf.', 'She loved wearing a pretty red hood.', 'She was ill one day.', 'She had no mother.'], 1, '原文 she loved wearing a pretty red hood；生病的是外婆，女孩没有和狼住在一起，妈妈也出场了。选 B。', '细节判断'),
  q('w10-fri-rd2', 'What was she asked to take to the old woman?', ['cakes and milk', 'books and milk', 'cakes and tea', 'flowers and milk'], 0, '原文 take some cakes and milk to the old woman，选 A。', '细节定位'),
  q('w10-fri-rd3', 'Why did the girl tell the wolf everything?', ['Because she was clever.', 'Because she was naive.', 'Because she was ill.', 'Because she was old.'], 1, '结尾 the naive girl told him everything：天真（naive）的女孩把一切都说了；clever 和 bad 是狼的特点。选 B。', '因果推断'),
  q('w10-fri-rd4', 'What is the best title for this part of the story?', ['A clever wolf', 'Little Red Riding Hood (I)', 'A small house in the city', 'A busy mother'], 1, '这一段讲的是小红帽出门看外婆、路上遇到狼的上半部分故事，标题就是 Little Red Riding Hood (I)。选 B。', '标题归纳')
]);

/* ---------------- 语法：图片里的六类题 ---------------- */
const G_TUE = grammar('w10-tue-grammar', '语法 · 比较级和最高级（一）', [
  f('w10-tue-gr1', '写出比较级：easy → ___', 'easier', '以辅音字母 + y 结尾，把 y 改成 i 再加 -er：easy → easier。'),
  f('w10-tue-gr2', '写出最高级：little → ___', 'least', 'little 是不规则变化：less - least，不能加 -er/-est。'),
  f('w10-tue-gr3', '用括号里形容词的正确形式填空：The T-shirt is much ___ (cheap) than the coat.', 'cheaper', 'than 前面用比较级，cheap 直接加 -er 变 cheaper；much 用来加强比较级。'),
  f('w10-tue-gr4', '用括号里形容词的正确形式填空：The book is the ___ (interesting) book I have ever read.', 'most interesting', '多音节形容词前加 most 构成最高级，前面有 the 和 I have ever read 的范围提示。'),
  f('w10-tue-gr5', '用括号里形容词的正确形式填空：The Nile is the ___ (long) river in the world.', 'longest', 'in the world 给出范围，用最高级；long 加 -est 变 longest。'),
  q('w10-tue-gr6', 'Which word has the forms "worse - worst"?', ['good', 'bad', 'little', 'much'], 1, 'bad/ill 的比较级和最高级是不规则变化 worse - worst；good 是 better - best，little 是 less - least，much 是 more - most。', '不规则变化')
]);

const G_THU = grammar('w10-thu-grammar', '语法 · both / either / neither / every', [
  q('w10-thu-gr1', 'There are two books on the desk. ___ of them are English books.', ['All', 'Both', 'Every', 'Neither'], 1, '两本书「都」是英语书，两者都用 both；all 用于三者以上，every 后面直接接单数名词。', '不定代词'),
  q('w10-thu-gr2', 'You can take ___ of the two school bags. They are both nice.', ['neither', 'every', 'either', 'none'], 2, '两个书包都很好，可以拿「任意一个」，两者取一用 either；neither 是两个都不。', '不定代词'),
  q('w10-thu-gr3', '___ of the two boys likes swimming. They both prefer running.', ['Both', 'Neither', 'Each', 'None'], 1, '两个男孩都喜欢跑步、都不喜欢游泳，用 neither of the two；动词 likes 用单数也提示是 neither。', '不定代词'),
  q('w10-thu-gr4', '___ student must finish his or her homework on time.', ['All', 'Every', 'Each', 'Both'], 1, 'every + 单数名词，表示「每个学生」；all 后面要接复数 students。', '不定代词'),
  q('w10-thu-gr5', 'There is ___ water in the glass. It is completely empty.', ['none', 'both', 'neither', 'no'], 3, '空格后面是名词 water，要用形容词 no 修饰：no water；none 后面不直接接名词。', '词性辨析'),
  q('w10-thu-gr6', '___ my parents are teachers. They work in different schools.', ['Either', 'Both', 'All', 'Neither'], 1, '父母是两个人，「都」是老师用 both；后面 different schools 说明两人分开工作。', '不定代词')
]);

const G_FRI = grammar('w10-fri-grammar', '语法 · 比较级最高级（二）不规则变化与同义句', [
  f('w10-fri-gr1', 'well 的比较级是 ___', 'better', 'good/well 的比较级是 better，最高级是 best，属于不规则变化。'),
  f('w10-fri-gr2', 'many/much 的最高级是 ___', 'most', 'many/much 的比较级是 more，最高级是 most。'),
  f('w10-fri-gr3', 'far 的比较级除了 farther，还可以是 ___', 'further', 'far 有两个比较级：farther（距离更远）/ further（程度更深），最高级 farthest / furthest。'),
  f('w10-fri-gr4', '同义句转换：This house is bigger than that one. → That house is not as ___ as this one.', 'big', 'A bigger than B = B not as big as A；as … as 中间用形容词原级 big。'),
  f('w10-fri-gr5', '同义句转换：I’m taller than my little brother. → My little brother isn’t as/so ___ as me.', 'tall', '比较级转换：我比弟弟高 = 弟弟不如我高，as/so … as 中间用原级 tall。'),
  q('w10-fri-gr6', 'Which word forms its comparative by doubling the last letter?', ['smart', 'thin', 'nice', 'wide'], 1, '重读闭音节且末尾一个辅音字母，双写再加 -er：thin → thinner；nice/wide 只加 -r，smart 直接加 -er。', '变化规则'),
  q('w10-fri-gr7', 'Which word changes y to i before -er / -est?', ['happy', 'fat', 'large', 'good'], 0, '辅音字母 + y 结尾，变 y 为 i 再加 -er/-est：happy → happier → happiest；其余三个都不符合。', '变化规则')
]);

const G_MON = grammar('w10-mon-grammar', '语法 · 方位介词', [
  f('w10-mon-gr1', '根据题意填空：The school bag is ___ the two desks.', 'between', '在两者之间用 between：between the two desks。'),
  f('w10-mon-gr2', '根据题意填空：The teacher’s desk is ___ the blackboard.', 'in front of', '讲台在黑板前面，用 in front of。'),
  f('w10-mon-gr3', '根据题意填空：The children are walking ___ the river. They can see trees on both sides.', 'along', '沿着河走用 along the river；on both sides 两岸都有树是提示。'),
  f('w10-mon-gr4', '根据题意填空：The bird is flying ___ the trees.', 'above', '鸟在树的上方飞，用 above（不接触）表示「在……上方」。'),
  f('w10-mon-gr5', '根据题意填空：The bank is ___ the school, on the other side of the road.', 'opposite', '在马路另一边、学校对面，用 opposite。'),
  f('w10-mon-gr6', '根据题意填空：The boy walked ___ the tunnel, from one end to the other.', 'through', '从隧道内部穿过用 through；across 是横过表面。')
]);

const G_WED = grammar('w10-wed-grammar', '语法 · 句子改错', [
  f('w10-wed-gr1', '改错：Every students must bring a schoolbag to school. → Every ___ must bring a schoolbag to school.', 'student', 'every 后面接单数名词：every student，不加 -s。'),
  f('w10-wed-gr2', '改错：Neither of the two boys are mine. → Neither of the two boys ___ mine.', 'is', 'neither of + 复数名词作主语，谓语动词用单数 is。'),
  f('w10-wed-gr3', '改错：Each of the boys have a new desk. → Each of the boys ___ a new desk.', 'has', 'each of + 复数名词作主语，谓语用单数 has。'),
  f('w10-wed-gr4', '改错：The boy walked across the tunnel. → The boy walked ___ the tunnel.', 'through', '从隧道里面穿过要用 through；across 只表示从表面横过。'),
  f('w10-wed-gr5', '改错（只有一名学生）：The teacher is standing between the students. → The teacher is standing ___ the students.', 'among', '三者以上「在……中间」用 among；between 只用于两者之间。'),
  f('w10-wed-gr6', '改错：The ball fell down the desk（想说从桌上掉下来）. → The ball fell ___ the desk.', 'off', '从某物表面掉下来用 fall off；fall down 是不及物短语，后面不能直接接名词。')
]);

const G_SAT = grammar('w10-sat-grammar', '语法 · 形容词比较级分类', [
  q('w10-sat-gr1', 'Which word takes -er / -est directly?', ['ugly', 'smart', 'beautiful', 'good'], 1, 'smart 是单音节词，直接加 -er/-est：smarter - smartest；ugly 要变 y 为 i，beautiful 用 more/most，good 是不规则变化。', '变化规则'),
  q('w10-sat-gr2', 'Which word takes -r / -st?', ['thin', 'fat', 'nice', 'sunny'], 2, 'nice 以不发音的 e 结尾，只加 -r/-st：nicer - nicest；thin/fat 要双写，sunny 变 y 为 i。', '变化规则'),
  q('w10-sat-gr3', 'Which word doubles its last letter before -er?', ['hot', 'late', 'large', 'wide'], 0, 'hot 是重读闭音节、末尾一个辅音字母，双写 t 变 hotter；late/large/wide 都只加 -r。', '变化规则'),
  q('w10-sat-gr4', 'Which word changes y to i before -est?', ['funny', 'smart', 'strong', 'fast'], 0, 'funny 是辅音字母 + y 结尾，变 y 为 i 再加 -est：funniest；其余三个直接加 -er/-est。', '变化规则'),
  q('w10-sat-gr5', 'Which word takes more / most?', ['little', 'enjoyable', 'bad', 'old'], 1, 'enjoyable 是多音节形容词，比较级和最高级用 more/most；little 和 bad 是不规则变化，old 直接加 -er/-est。', '变化规则'),
  q('w10-sat-gr6', 'Which one is irregular?', ['cheap', 'happy', 'little', 'pretty'], 2, 'little 是不规则变化：less - least；cheap 加 -er，happy/pretty 变 y 为 i 加 -er。', '不规则变化')
]);

const KP_FRI = {
  id: 'w10-fri-ket_pet', name_cn: 'KET/PET题型 · 代词与介词', type: 'ket_pet', duration: 10,
  questions: [
    q('w10-fri-kp1', 'There are two doors in the classroom, but ___ of them is open.', ['both', 'neither', 'either', 'all'], 1, '两扇门都没开，动词 is 是单数，neither of them 表示「两个都不」；选 B。', '代词'),
    q('w10-fri-kp2', 'You can sit on ___ side of the desk. There are two empty seats.', ['neither', 'every', 'either', 'all'], 2, '两边都可以坐，表示「两者中任一」用 either；选 C。', '代词'),
    q('w10-fri-kp3', 'There are many books on the desk. ___ of them are about English.', ['Both', 'Neither', 'All', 'Each'], 2, 'many books 是三者以上，「全都」用 All；选 C。', '代词'),
    q('w10-fri-kp4', 'The cat is hiding ___ the door. You can’t see it.', ['above', 'behind', 'across', 'between'], 1, '藏在门后面才看不见，用 behind；选 B。', '介词'),
    q('w10-fri-kp5', 'The school bag is ___ the desk, not on it.', ['under', 'between', 'through', 'among'], 0, 'not on it 说明书包不在桌上，而是在桌子下面，用 under；选 A。', '介词')
  ]
};

/* ---------------- 写作模板：小红帽（上）复述，五个空全是橘色词 ---------------- */
const WRITE_FRI = {
  id: 'w10-fri-writing', name_cn: '背诵作文 · 小红帽（上）故事复述', type: 'writing_template', duration: 15,
  title: 'Little Red Riding Hood（上）· 全文背默',
  requirement_cn: '先把故事复述读三遍，再把 5 个橘色重点词填回去，最后背下全文。',
  keywords: ['ago', 'little', 'girl', 'hood', 'forest'],
  keywords_cn: ['以前', '小的', '女孩', '兜帽', '森林'],
  template: 'Long, long {{1}}, there was a lovely {{2}} {{3}}. Everyone called her Little Red Riding Hood because she loved wearing a pretty red {{4}}. One day, her grandmother was ill, so her mother asked her to take some cakes and milk to the old woman. Her grandmother lived alone in a small house deep in the {{5}}.',
  blanks: [
    { id: 1, hint_cn: '以前', hint_en: 'ago', answer: 'ago' },
    { id: 2, hint_cn: '小的', hint_en: 'little', answer: 'little' },
    { id: 3, hint_cn: '女孩', hint_en: 'girl', answer: 'girl' },
    { id: 4, hint_cn: '兜帽', hint_en: 'hood', answer: 'hood' },
    { id: 5, hint_cn: '森林', hint_en: 'forest', answer: 'forest' }
  ],
  full_text: 'Long, long ago, there was a lovely little girl. Everyone called her Little Red Riding Hood because she loved wearing a pretty red hood. One day, her grandmother was ill, so her mother asked her to take some cakes and milk to the old woman. Her grandmother lived alone in a small house deep in the forest.',
  full_text_cn: '很久很久以前，有一个可爱的小女孩。大家都叫她小红帽，因为她喜欢戴一顶漂亮的红色兜帽。一天，她的外婆生病了，妈妈让她带一些蛋糕和牛奶给那位老人。外婆独自住在森林深处的一座小房子里。',
  explanation_cn: '复述故事按「人物出场 → 名字来历 → 妈妈交代任务 → 外婆住处」的顺序；五个空正是书里的橘色高频词 ago、little、girl、hood、forest。',
  explanation_en: 'Retell the story in order: who, why she got the name, the mother’s task, and where the grandmother lived.'
};

/* ---------------- 每天键盘拼写：音标默写 + 情境默写 ---------------- */
const KB = {
  sun: [
    ['音标 /əˈɡəʊ/ 以前：a___ [填完整单词]', 'ago', 'ago 以前；long, long ago 是很久很久以前。'],
    ['音标 /lɒŋ/ 长的；久的：l___ [填完整单词]', 'long', 'long 长的；long ago 很久以前。'],
    ['音标 /ɡɜːl/ 女孩：g___ [填完整单词]', 'girl', 'girl 女孩，a lovely little girl 一个可爱的小女孩。'],
    ['音标 /lɪtl/ 小的：l___ [填完整单词]', 'little', 'little 小的；little girl 小女孩。'],
    ['音标 /hʊd/ 兜帽：h___ [填完整单词]', 'hood', 'hood 兜帽；Red Riding Hood 小红帽。']
  ],
  mon: [
    ['音标 /ˈmʌðə(r)/ 母亲；妈妈：m______ [填完整单词]', 'mother', 'mother 妈妈；her mother asked her… 她妈妈叫她……'],
    ['她（主格）：s__ [填完整单词]', 'she', 'she 她，作主语：she loved wearing…'],
    ['她（宾格）/她的：h___ [填完整单词]', 'her', 'her 既可作宾格「她」，也可作形容词性物主代词「她的」。'],
    ['音标 /red/ 红色的：r___ [填完整单词]', 'red', 'red 红色的；a pretty red hood 一顶漂亮的红兜帽。'],
    ['音标 /weə(r)/ 穿；戴：w___ [填完整单词]', 'wear', 'wear 穿戴；loved wearing a red hood 喜欢戴红兜帽。']
  ],
  tue: [
    ['there ___ a lovely little girl（there be 过去式）：w___ [填完整单词]', 'was', 'there was 表示过去「有」；is 的过去式是 was。'],
    ['音标 /haʊs/ 房子：h____ [填完整单词]', 'house', 'house 房子；a small house 一座小房子。'],
    ['音标 /ˈfɒrɪst/ 森林：f_____ [填完整单词]', 'forest', 'forest 森林；deep in the forest 在森林深处。'],
    ['外婆：g__________ [填完整单词]', 'grandmother', 'grandmother 外婆；外婆住在森林里。'],
    ['生病的：i__ [填完整单词]', 'ill', 'ill 生病的；her grandmother was ill 外婆生病了。']
  ],
  wed: [
    ['音标 /mɪlk/ 牛奶：m___ [填完整单词]', 'milk', 'milk 牛奶；cakes and milk 蛋糕和牛奶。'],
    ['音标 /streɪt/ 直地：s______ [填完整单词]', 'straight', 'straight 直地；go straight 一直往前走。'],
    ['音标 /əˈləʊn/ 独自地：a____ [填完整单词]', 'alone', 'alone 独自地；lived alone 独自居住。'],
    ['在深处：d___ [填完整单词]', 'deep', 'deep 深深地；deep in the forest 在森林深处。'],
    ['陌生人：s_______ [填完整单词]', 'stranger', 'stranger 陌生人；never talk to strangers 别和陌生人说话。']
  ],
  thu: [
    ['音标 /wʊlf/ 狼：w___ [填完整单词]', 'wolf', 'wolf 狼；a clever but bad wolf 一只聪明却很坏的狼。'],
    ['聪明的：c_____ [填完整单词]', 'clever', 'clever 聪明的；clever but bad 聪明但很坏。'],
    ['坏的：b___ [填完整单词]', 'bad', 'bad 坏的，与 clever 用 but 转折。'],
    ['天真的：n____ [填完整单词]', 'naive', 'naive 天真的；the naive girl 天真的女孩。'],
    ['每件事；一切：e________ [填完整单词]', 'everything', 'everything 一切；told him everything 把一切都告诉了他。']
  ],
  fri: [
    ['音标 /ɡəʊ/ 去：g__ [填完整单词]', 'go', 'go 去；go straight 一直往前走。'],
    ['告诉（过去式）：t___ [填完整单词]', 'told', 'tell 的过去式是 told；told her to go straight。'],
    ['问（过去式）：a____ [填完整单词]', 'asked', 'ask 的过去式是 asked；asked where she was going。'],
    ['从不：n____ [填完整单词]', 'never', 'never 从不；never talk to strangers。'],
    ['路；方法：w__ [填完整单词]', 'way', 'way 路；on her way 在她路上。']
  ],
  sat: [
    ['情境默写：Long, long ago, there ___ (is) a lovely little girl.', 'was', 'there be 的过去式：单数用 there was。'],
    ['情境默写：One day, her ___ (外婆) was ill.', 'grandmother', '外婆是 grandmother；整个故事用过去时 was。'],
    ['情境默写：___ (她) lived alone in a small house deep in the forest.', 'she', '作主语的「她」用 she，句首大写是句子格式，词本身是 she。'],
    ['情境默写：She loved wearing a pretty ___ (红色的) hood.', 'red', '红色的用 red；red hood 红色兜帽。'],
    ['情境默写：Her mother told her to go ___ (直地) and never talk to strangers.', 'straight', 'go straight 一直走； straight 也可以作形容词「直的」。']
  ],
  sun2: [
    ['情境默写：Her mother asked her to take some cakes and ___ (牛奶) to the old woman.', 'milk', '牛奶是 milk；cakes and milk 是原文搭配。'],
    ['情境默写：Her grandmother lived alone in a small house deep in the ___ (森林).', 'forest', '森林是 forest；deep in the forest 森林深处。'],
    ['情境默写：The wolf asked where she was ___ (go) .', 'going', 'was + 动词 -ing 构成过去进行时：where she was going。'],
    ['情境默写：The naive girl told him ___ (所有事情).', 'everything', 'everything 所有事情；tell sb. everything 把一切告诉某人。'],
    ['情境默写：Little Red Riding Hood met a clever but bad ___ (狼).', 'wolf', '狼是 wolf；a clever but bad wolf。']
  ]
};

/* ---------------- 写入：明天 + 下周 7 天 ---------------- */
set(sun, 'cloze', CLOZE_A);
set(sun, 'tense', keyboard('w9sun-lrrh-kb', '小红帽重点词 · 音标默写', KB.sun));

set(wk[0], 'reading', READ_MON);
set(wk[0], 'tense', keyboard('w10-mon-kb', '小红帽重点词 · 音标默写', KB.mon));
add(wk[0], G_MON);

set(wk[1], 'reading', CLOZE_B);
set(wk[1], 'grammar', G_TUE);
set(wk[1], 'tense', keyboard('w10-tue-kb', '小红帽重点词 · 音标默写', KB.tue));

set(wk[2], 'reading', READ_WED);
set(wk[2], 'tense', keyboard('w10-wed-kb', '小红帽重点词 · 音标默写', KB.wed));
add(wk[2], G_WED);

set(wk[3], 'reading', CLOZE_C);
set(wk[3], 'grammar', G_THU);
set(wk[3], 'tense', keyboard('w10-thu-kb', '小红帽重点词 · 音标默写', KB.thu));

add(wk[4], READ_FRI);
set(wk[4], 'grammar', G_FRI);
set(wk[4], 'ket_pet', KP_FRI);
set(wk[4], 'writing_template', WRITE_FRI);
set(wk[4], 'tense', keyboard('w10-fri-kb', '小红帽重点词 · 音标默写', KB.fri));

set(wk[5], 'reading', READ_SAT);
set(wk[5], 'tense', keyboard('w10-sat-kb', '小红帽重点词 · 情境默写', KB.sat));
add(wk[5], G_SAT);

set(wk[6], 'cloze', CLOZE_D);
set(wk[6], 'tense', keyboard('w10-sun-kb', '小红帽重点词 · 情境默写', KB.sun2));

/* ---------------- 序列化 WEEK9 / WEEK10，不动其他周 ---------------- */
const start = src.indexOf('const WEEK9 = ');
const end = src.indexOf('const HOMEWORK_WEEKS = ');
if (start < 0 || end < 0 || end <= start) throw new Error('找不到 WEEK9 / HOMEWORK_WEEKS 边界');
let rebuilt = src.slice(0, start)
  + 'const WEEK9 = ' + JSON.stringify(WEEKS[8]) + ';\n'
  + 'const WEEK10 = ' + JSON.stringify(WEEKS[9]) + ';\n\n'
  + src.slice(end);

// 完形填空题：逐句译文表（app.js 的逐句翻译屏按模块 id 取这张表，句数必须与课文一致）
const transOld = 'const CLOZE_SENTENCE_CN = ';
const transStart = rebuilt.indexOf(transOld);
const transClose = rebuilt.indexOf('\n};', transStart);
if (transStart < 0 || transClose < 0) throw new Error('找不到 CLOZE_SENTENCE_CN');
const table = new Function(rebuilt + '; return CLOZE_SENTENCE_CN;')();
const LRRH_SENT_CN = [
  '很久很久以前，有一个可爱的小女孩。',
  '大家都叫她小红帽，因为她喜欢戴一顶漂亮的红色兜帽。',
  '一天，她的外婆生病了，妈妈让她带一些蛋糕和牛奶给那位老人。',
  '外婆独自住在森林深处的一座小房子里。',
  '妈妈叫她一直往前走，路上千万不要和陌生人说话。',
  '可是，在路上，小红帽遇到了一只聪明却很坏的狼。',
  '狼问她要去哪里，天真的女孩把一切都告诉了它。'
];
['w9sun-lrrh-cloze', 'w10-tue-cloze', 'w10-thu-cloze', 'w10-sun-cloze']
  .forEach(id => { table[id] = LRRH_SENT_CN.slice(); });
const blockEnd = transClose + 3; // 含原来的 `};`
rebuilt = rebuilt.slice(0, transStart) + transOld + JSON.stringify(table) + ';' + rebuilt.slice(blockEnd);
fs.writeFileSync(dataPath, rebuilt, 'utf8');
console.log('data.js 已写入：WEEK9 周日 + WEEK10 七天');

/* ---------------- 版本号 236 → 237（缓存刷新） ---------------- */
for (const rel of ['index.html', 'sw.js']) {
  const p = path.join(__dirname, '..', 'public', rel);
  let s = fs.readFileSync(p, 'utf8');
  if (s.indexOf('236') < 0) throw new Error(rel + ' 没找到版本号 236');
  s = s.split('236').join('237');
  fs.writeFileSync(p, s, 'utf8');
  console.log(rel + ' 版本 237');
}
