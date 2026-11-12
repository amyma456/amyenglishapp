// verify-v193 —— 两部分（v189 立的，v193 只补一条空班级兜底）：
//   A. 家长 2026-11-07 指定内容进 W7（v188 立的，原样保留）
//   B. 家长 2026-11-08：打卡表每天显示实际打卡人数，且永远是后台当下那一份
// 通用骨架（30 动作/拼写 3~6/听力题型）由 weekpack-apply 与 verify-weeks 把关。
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.log('  ✗ ' + msg); } }
const ROOT = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'public/sw.js'), 'utf8');

function weekSrc(n) {
  const tag = 'const WEEK' + n + ' = ';
  const i = data.indexOf(tag);
  if (i < 0) return null;
  const seg = data.slice(i + tag.length);
  const end = seg.indexOf('];');
  try { return JSON.parse(seg.slice(0, end + 1)); } catch (e) { return null; }
}
const w7 = weekSrc(7);
ok(!!w7, 'WEEK7 存在');
if (w7) {
  const modulesOf = (d) => (w7[d].modules || []);
  const find = (d, type) => modulesOf(d).filter((m) => m.type === type);

  // 1) 作文每天出现：7 天都有 writing_drill，句子取自 Dear Lucy
  const ESSAY = ['go shopping with you tomorrow', 'meet at your home', "Is 10 o'clock OK", 'take a taxi', 'football boots and some pairs of socks', 'See you tomorrow'];
  let drillDays = 0, drillUnits = 0;
  const allDrill = [];
  for (let d = 0; d < 7; d++) {
    const wd = find(d, 'writing_drill')[0];
    if (wd && wd.full_text) {
      drillDays++;
      drillUnits += (wd.full_text.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
      allDrill.push(wd.full_text);
      if (d === 0) ok(/Dear Lucy/.test(wd.full_text), '周一作文跟读带 Dear Lucy 称呼');
      if (d === 5) ok(/See you tomorrow|Tom/.test(allDrill.join(' ')), '周六跟读含结尾句或署名');
    }
  }
  ok(drillDays === 7, '作文跟读 7 天全勤，实际 ' + drillDays);
  ok(drillUnits === 16, '作文跟读每周 16 句次（每句 ≥2 遍），实际 ' + drillUnits);
  ESSAY.forEach((frag) => ok(allDrill.filter((t) => t.includes(frag)).length >= 2, '作文句「' + frag.slice(0, 24) + '」每周至少出现 2 次'));

  // 2) 周五背默：writing 模块 = Dear Lucy 全文 + 5 空
  const wri = find(4, 'writing_template')[0];
  ok(!!wri, '周五有写作模块');
  if (wri) {
    ok(wri.template.includes('Dear Lucy'), '周五作文是 Dear Lucy');
    ok((wri.keywords || []).length === 5 && wri.keywords.join(',') === 'shopping,home,taxi,football,socks', '周五作文关键词 5 个');
    const rebuilt = wri.template.replace(/\{\{(\d+)\}\}/g, (x, n) => wri.keywords[n - 1]);
    ok(rebuilt.toLowerCase() === String(wri.full_text).toLowerCase(), '背默模板 + 关键词 = 全文');
    const sents = (rebuilt.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
    ok(sents === 6, 'Dear Lucy 全文 6 句，实际 ' + sents);
    ok(!!wri.full_text_cn && wri.full_text_cn.includes('购物'), '背默模块带中文');
  }

  // 3) 代词 17 题（图1/2）
  const fillAns = (d) => find(d, 'grammar').flatMap((m) => (m.questions || []).filter((q) => q.type === 'fill').map((q) => q.answer));
  const tue = fillAns(1), thu = fillAns(3), fri = fillAns(4);
  ok(tue.join(',') === 'my,they,him,mine,himself,her', '周二代词变化 6 题：' + tue.join(','));
  ok(thu.join(',') === 'their,us,himself,ours,anyone,nothing', '周四代词+合成代词 6 题：' + thu.join(','));
  ok(fri.join(',') === 'someone,anywhere,anybody,everything,everyone', '周五合成代词 5 题：' + fri.join(','));
  ok(tue.length + thu.length + fri.length === 17, '代词题共 17 道');

  // 4) KET（图4 Exercise02 二 + 一）
  const ket = find(4, 'ket_pet')[0];
  ok(!!ket && ket.questions.length === 5, '周五 KET 5 题');
  if (ket) {
    const q0 = ket.questions[0];
    ok(q0.options[q0.answer] === 'appointment', 'KET 第 1 题考 appointment');
    ok(ket.questions[1].options[ket.questions[1].answer] === 'in', 'KET 第 2 题考 arrive in Beijing');
    ok(ket.questions[2].options[ket.questions[2].answer] === 'area', 'KET 第 3 题考 rural area');
    const ketText = ket.questions.map((q) => q.options[q.answer]).join(',');
    ok(ketText.includes('bathroom') && ketText.includes('assistant'), 'KET 覆盖连线词 bathroom/assistant');
  }

  // 5) Exercise02 词形进词汇（20 词，避开 W1(beautiful) / W3(beach) 重复）
  const words = [];
  for (const d of [0, 2, 5, 6]) { const v = find(d, 'vocabulary_game')[0]; (v ? v.words : []).forEach((x) => words.push(x.word)); }
  ok(words.length === 20, '本周词汇 20 个，实际 ' + words.length);
  ['bedroom', 'bathroom', 'assistant', 'article', 'arrow', 'barbecue', 'seaside', 'audience', 'balloon', 'basketball',
    'around', 'lovely', 'become', 'appointment', 'area', 'shopping', 'taxi', 'boots', 'socks', 'present']
    .forEach((w) => ok(words.includes(w), '词汇缺 ' + w));
  ok(!words.includes('beach') && !words.includes('beautiful'), 'beach(W3)/beautiful(W1) 不重复进 W7');
  const mon = find(0, 'vocabulary_game')[0];
  // 连线题知识点：bedroom=睡觉的房间（英文释义进 KET/词汇卡；hint 按 wrong-hint 规则不写释义原文）
  ok(mon && mon.words.some((x) => x.word === 'bedroom' && /睡觉/.test(x.hint_cn || '')), 'bedroom 词卡带「睡觉的房间」概念提示');

  // 6) 听力：周二/周四 3 题、周五 4 题（全周 10 道，v153/v165 红线 ≥10）；拼写 3/天
  for (const d of [1, 3]) {
    const ls = find(d, 'listening')[0];
    ok(ls && ls.questions.length === 3, 'day' + d + ' 听力 3 题');
  }
  const friLs = find(4, 'listening')[0];
  ok(friLs && friLs.questions.length === 4, 'day4 听力 4 题（全周凑足 10 道）');
  for (let d = 0; d < 7; d++) {
    const kb = find(d, 'tense').concat(find(d, 'tense2')).reduce((a, m) => a + (m.questions || []).length, 0);
    ok(kb >= 3 && kb <= 6, 'day' + d + ' 键盘拼写 3~6，实际 ' + kb);
  }
}

// 7) 版本钉子 190
ok((html.match(/\?v=199/g) || []).length === 7, 'index.html 七处 ?v=199');
ok(html.includes('app-version" content="199"'), 'index.html app-version=189');
ok(/var CACHE_NAME = 'amy-english-v199';/.test(sw), 'sw.js CACHE_NAME v193');
ok(/var V = 199;/.test(sw), 'sw.js V = 189');

// =========================================================================
// 8) v193：打卡表"每天几个人打卡" + 永远显示后台当下那份
//
// 家长 2026-11-08：「Gary 那一行周一到周日全是叉……无论他打没打卡都要显示
// 每天的实时数据，什么时候登录都和当下的数据对上。比如周一有 5 个学生打卡，
// 那就显示 5 个，和他打卡没打卡没关系、和他什么时候登录也没关系。」
//
// 查后台（D1 checkins，week_idx=5）的事实：Gary（张梓杨，名单编号
// s1792850539588）本周一条记录都没有 —— 他只有上周六一条做到一半的记录。
// 所以那一行全叉本身是真数据；真正的毛病是**表格只画一次就不管了**，加上
// 后台行的编号认领不上名单，于是"明明传了也看不到"。
// 这六条钉住修复：
// =========================================================================
const app = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');

// ① 表格要有「当天打卡 n/总人数」这一行，且分母来自本班名单
ok(/renderCheckin\(\)/.test(app) && /_ckCountRow\(roster/.test(app),
  '老师端打卡监控带「当天打卡」人数行');
ok(/_ckCountRow\(classStudents/.test(app),
  '学生端完成率对比带同一行（谁登录看到的都一样）');
ok(/_ckDayCounts\(roster, di\)/.test(app) && /done\+\+/.test(app),
  '人数按"已打卡"逐天统计');
ok(/class="ck-count-row"/.test(app),
  '这一行有独立样式类（表格最后一行高亮）');

// ② 还没到的日子不再画 ✗
ok(/_ckDayPhase\(di/.test(app) && /future/.test(app),
  '还没到的日子单独判定（周一登录时周二~周日不该是叉）');
ok(/\.checkin-dot\.future/.test(html) && /checkin-dot future/.test(app),
  '灰点样式：还没到的那一天');

// ③ 拉到"新的一版"就一定要重画，不再只看本机记录有没有变
ok(/_ckPullSeq/.test(app) && /_ckPaintedSeq/.test(app),
  '用拉取序号判断"屏幕上是第几版"（第一次拉一定补画）');
ok(!/if \(!changed\) return;/.test(app),
  '不再"数据没变就不重画"（第一屏的 ✗ 会一直留在屏幕上）');

// ④ 后台行的编号认不上名单时，按手机号 > 姓名（大小写不敏感）> 半截姓名认领
ok(/_rosterIdFor\(sid, name, klass, phone\)/.test(app),
  '_rosterIdFor 增加手机号参数');
ok(/digits\(s\.phone\) === ph \|\| digits\(s\.parentPhone\) === ph/.test(app),
  '先按手机号认领（换设备换编号也能对上）');
ok(/toLowerCase\(\)\.replace\(\/\\s\+\/g, ''\)/.test(app),
  '姓名比较大小写/空格不敏感（黄耀-york = 黄耀-York）');
ok(/partial-name/.test(app),
  '半截姓名（Gary ↔ 张梓杨-Gary）只在唯一命中时认领');

// ⑤ 同一个孩子多个编号的行落到同一个 key，保留"更完整"的那份
ok(/_ckRecBetter/.test(app) && /this\.state\.cloudCheckins\[k\] = rec;/.test(app),
  '同一 (孩子, 周, 天) 只留一份，不能让半截记录盖掉整天的 ✓');
ok(/r\.week_idx/.test(app),
  'key 用后台这一行自己的周号，不用"本机当前切到的那一周"');

// ⑥ 停在页面上要自动刷新：60 秒一次 + 回到前台一次
ok(/_ckTimer = setInterval/.test(app) && /60000/.test(app),
  '停留在打卡表上每 60 秒自动同步一次');
ok(/refreshLive/.test(app) && /实时数据/.test(app),
  '页面上有「实时数据 · 上次同步 HH:MM」和手动刷新按钮');

// ⑦ 班级还没分配时不能拿空串去查后台（只会 400，一台手机上全班空白）
ok(/const klass = who\.klass \|\| this\.state\.className \|\| '';/.test(app),
  '孩子端先算出一个非空班级名');
ok(/scope === 'class' && klass/.test(app),
  '班级为空时退回"只拉自己那一份"，不发空 class 请求');

// ⑧ v193：跟读评分死循环兜底（家长 2026-11-09，华为 nova 13 Pro）
// 填空跟读和选择题跟读的 noaudio 分支都要有"连续 3 次放行"
const noaudioStall = (app.match(/_stallBump\(hrStall2?\)/g) || []).length;
ok(noaudioStall >= 2,
  '跟读 noaudio 两处（填空/选择）都有连续 3 次放行保险，实测 2 处=' + noaudioStall);
ok(/wrep-' \+ R\.mi \+ '-' \+ R\.qi \+ '-'/.test(app),
  '错词修复的单词卡也有连续 3 次放行保险');
ok(/_stallClear\('hr-' \+ dayIdx \+ '-' \+ mi \+ '-' \+ qi\)/.test(app),
  '识别出字了要清掉连续失败计数，放行只留给真的不通的机器');

// ⑨ v193：旧华为浏览器滚动修复
ok(/\.stage\{height:calc\(100vh - var\(--nav-h\) - var\(--banner-h,0px\)\);[\s\S]{0,8}height:calc\(100dvh/.test(html),
  '.stage 先 100vh 兜底再 100dvh（dvh 不被认识时整条 height 作废 → 整页锁死）');
ok(/body\.preview-mode \.stage\{height:calc\(100vh[\s\S]{0,80}100dvh/.test(html),
  '老师预览舞台同样双写兜底');
ok(/body\.stage-mode\{overflow:hidden;overscroll-behavior:none\}/.test(html)
  && !/body\.stage-mode,html:has\(body\.stage-mode\)\{overflow/.test(html),
  'body.stage-mode 和 html:has(...) 拆成两条规则（:has 不被支持时整条规则会被丢掉）');

// ⑩ v193：短语加量 + 点词本地化（家长 2026-11-11）
const api2 = fs.readFileSync(path.join(ROOT, 'public/api.js'), 'utf8');
const app2 = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
ok(/const LOCAL_DICT = \{/.test(api2) && /题库全量单词的本地释义/.test(api2),
  'api.js 内置题库全量本地词典（点词不再联网）');
ok(/if \(typeof LOCAL_DICT !== 'undefined' && LOCAL_DICT\)/.test(api2),
  '_localDictBuild 合并静态词典，词汇卡释义仍优先');
ok(/dictLocal\(word\)/.test(api2), '提供同步查词入口 dictLocal');
ok(/const quick = quickPh \? null : \(Api\.dictLocal/.test(app2),
  '点词弹层在 await 前同步摆中文，不再出现「正在查…」');
ok(/phraseAtRich/.test(api2) && /collocAt\(tokens, i\)/.test(api2),
  '规则化搭配识别（手写表之外的常见组合）');
ok(/\['be close to', '靠近/.test(api2) && /\['large desert', '大沙漠'\]/.test(api2),
  '★ 家长点名的 is close to / large desert 都进了短语表');
ok(/const pick = rich \? 'phraseAtRich' : 'phraseAt';/.test(app2)
  && /_phraseMask\(words, true\)/.test(app2),
  '阅读材料启用规则搭配，跟读判分句仍只用手写表');
ok(/\.lk-phrase\{border-bottom:2px solid/.test(html), '短语横线加粗成实线');

// —— v193：AI 口语练习里一句要有两三个短语提示 ——
ok(/this\._wordSpans\(q\.sentence\)/.test(app2), '★ 口语题干不再是一整段纯文本，画了短语横线');
ok(/this\._wordSpans\(o, true\)/.test(app2),
  '★ 选项用 plain 模式：画短语但不包 .lk-word，点答案不会被查词抢走');
ok(/this\._spPhraseBar\(q\.sentence/.test(app2)
  && /this\._spPhraseBar\(o, '短语', 3\)/.test(app2),
  '★ 题干 + 每个选项下面都直接列出短语中文（不用点）');
ok(/this\._spPhraseBar\(parts \? parts\.q : sentence/.test(app2),
  '★ 口语跟读面板也加提示条，逐词判分的词盒一个没动');
ok(/_phraseHints\(text, limit\)/.test(app2) && /_spTapPhrase\(el\)/.test(app2),
  '提示条：重叠扫描补漏 + 点 chip 仍能听读音查中文');
ok(/\['close to', '靠近/.test(api2) && /_handPhraseFrom\(tokens, i \+ 1\)/.test(api2),
  '★ it is 不会把 is close to 切碎（家长上轮点名的搭配保住）');
ok(/\.sp-ph-bar\{/.test(html) && /\.sp-ph-chip\.sp-ph-word\{/.test(html),
  '提示条与重点词兜底的样式在位');

console.log(fail ? '✗ ' + fail + ' 项失败 / ' + (pass + fail) : '✅ verify-v193 全部 ' + pass + ' 项通过');
process.exit(fail ? 1 : 0);
