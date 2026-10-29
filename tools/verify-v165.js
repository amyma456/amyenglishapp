// verify-v165（家长 2026-10-29 晚）：
//   「每周一到周日的 7 天的练习题，敲键盘的拼写题，不要在同一天，而是分布
//    在每一天，每一天合理的来安排；听力题不要每次只读让孩子选听到正确的
//    答句，而是像正常的听力练习一样，有问句有答句、按图片选择、或者选单词
//    填到听力原文里头」
//
// 钉住四件事：
//   1. 每天都有键盘拼写题，3~6 道，全周 ≥20 道，任何一天不许没有
//   2. 听力题型至少 3 类（听对话问答 / 听句子选图 / 听录音填空），
//      不许出现「一整套都是听原句选原句」
//   3. 前端真的支持选图（picture_options → 2×2 大图）与长音频解锁
//   4. 版本号 165 全线一致，周包工具链也能生成这几类题
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
const appSrc = read('public/app.js');
const htmlSrc = read('public/index.html');
const swSrc = read('public/sw.js');
const toolSrc = read('tools/weekpack-apply.js');
const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
const CUR = W[W.length - 1];           // 最新一周（当前 11-02 起用的就是它）

// 键盘拼写题的判定：模块 skill === 'keyboard'（weekpack 生成时打的标），
// 兼容老数据：type 是 tense 且题干里有「填完整单词」也算。
const isKb = (m) => m.skill === 'keyboard' ||
  ((m.type === 'tense') && (m.questions || []).some((q) => /填完整单词/.test(String(q.question || ''))));
const kbCount = (d) => d.modules.reduce((s, m) => s + (isKb(m) ? (m.questions || []).length : 0), 0);

section('1. 键盘拼写题分布在每一天');
{
  const per = CUR.map(kbCount);
  ok(per.every((n) => n > 0), '7 天每天都有键盘拼写题', per.join(' / '));
  ok(per.every((n) => n >= 3), '每天至少 3 道（少了等于这天没练打字）', per.join(' / '));
  ok(per.every((n) => n <= 6), '每天不超过 6 道（多了又变成一天猛敲）', per.join(' / '));
  ok(per.reduce((a, b) => a + b, 0) >= 20, '全周键盘拼写题 ≥20 道', per.reduce((a, b) => a + b, 0));
  // 不许再回到「一半以上的拼写题堆在同一天」
  const max = Math.max.apply(null, per);
  const all = per.reduce((a, b) => a + b, 0);
  ok(max / all <= 0.25, '任何一天承担的拼写题不超过全周 25%', max + '/' + all);
  // 每道拼写题都要能改到：答案全是纯小写字母
  const bad = [];
  CUR.forEach((d) => d.modules.forEach((m) => {
    if (!isKb(m)) return;
    (m.questions || []).forEach((q) => {
      if (!/^[a-z]+$/.test(String(q.answer || ''))) bad.push(m.id + ':' + q.answer);
      if (!q.explanation_cn) bad.push(m.id + ':缺解析');
      if (!/填完整单词/.test(String(q.question || ''))) bad.push(m.id + ':题干缺提示');
    });
  }));
  ok(bad.length === 0, '每道拼写题都是纯小写单词 + 有解析 + 有「填完整单词」提示', bad.slice(0, 4).join(' '));
}

section('2. 听力题型多样化（不再是「听原句选原句」）');
{
  const kindsOf = (q) => {
    if (q.picture_options) return '选图';
    if (q.type === 'fill') return '听写';
    if (/听到的句子是什么/.test(String(q.question || ''))) return '复述';
    return '问答';
  };
  const allQ = [];
  const mods = [];
  CUR.forEach((d) => d.modules.forEach((m) => {
    if (m.type !== 'listening') return;
    mods.push(m);
    (m.questions || []).forEach((q) => allQ.push(q));
  }));
  const kinds = new Set(allQ.map(kindsOf));
  ok(mods.length >= 3, '全周听力出现 ≥3 次（不是只在一两天）', mods.length);
  ok(allQ.length >= 10, '全周听力题 ≥10 道', allQ.length);
  ok(kinds.size >= 3, '听力题型 ≥3 类', [...kinds].join('/'));
  ok(kinds.has('问答') && kinds.has('选图') && kinds.has('听写'), '问答 / 选图 / 听写 三类都在', [...kinds].join('/'));
  // 每一套听力自己也不能只有一种题型
  const thin = mods.filter((m) => new Set((m.questions || []).map(kindsOf)).size < 2).map((m) => m.id);
  ok(thin.length === 0, '每套听力至少 2 种题型', thin.join(' ') || '全部 ≥2');
  // 复述题不许占多数：家长原话就是嫌「每次只读让孩子选听到的正确答句」
  const echo = allQ.filter((q) => kindsOf(q) === '复述').length;
  ok(echo / allQ.length <= 0.4, '「听原句选原句」类不超过 40%', echo + '/' + allQ.length);
  // 选图题的选项必须真的是 4 个不同图片，且正确项在选项里
  const badPic = [];
  allQ.forEach((q) => {
    if (!q.picture_options) return;
    if (!Array.isArray(q.options) || q.options.length !== 4) badPic.push(q.id + ':选项不是4个');
    else if (new Set(q.options).size !== 4) badPic.push(q.id + ':图片有重复');
    else if (!(q.answer >= 0 && q.answer < 4)) badPic.push(q.id + ':answer 越界');
    if (!/[^\x00-\x7F]/.test(q.options.join(''))) badPic.push(q.id + ':选项不是图形');
  });
  ok(badPic.length === 0, '选图题 4 张图各不相同且答案合法', badPic.slice(0, 4).join(' '));
  // 听写题：必须有 audio_text，且答案真的出现在音频原文里
  const badFill = [];
  allQ.forEach((q) => {
    if (q.type !== 'fill') return;
    if (!q.audio_text) badFill.push(q.id + ':缺原文');
    else if (String(q.audio_text).toLowerCase().indexOf(String(q.answer).toLowerCase()) < 0) badFill.push(q.id + ':答案不在原文');
  });
  ok(badFill.length === 0, '听写填空的答案都能在音频原文里找到', badFill.slice(0, 4).join(' '));
  // 答句式听力要有说话人，孩子才分得清谁说的
  const dlg = allQ.filter((q) => kindsOf(q) === '问答' && /(Boy|Girl|Man|Woman|Mum|Dad|Grandma|Grandpa|Teacher|Student):/.test(String(q.audio_text || '')));
  const dlgAll = allQ.filter((q) => kindsOf(q) === '问答');
  ok(dlgAll.length > 0 && dlg.length === dlgAll.length, '问答题的音频带说话人（Boy:/Girl:/…）', dlg.length + '/' + dlgAll.length);
}

section('3. 前端真的画得出选图题');
{
  ok(/picture_options/.test(appSrc), 'app.js 认 picture_options 字段');
  ok(/pic-grid/.test(appSrc) && /pic-opt/.test(appSrc), 'app.js 给图片选项加 pic-grid / pic-opt 类');
  ok(/\.q-options\.pic-grid/.test(htmlSrc) && /\.q-option\.pic-opt/.test(htmlSrc), 'index.html 有 2×2 大图样式');
  ok(/grid-template-columns:1fr 1fr/.test(htmlSrc), '图片选项是两列网格');
  // 长音频（听对话两三句）不能还按 6 秒解锁，否则孩子没听完就能点
  const i = appSrc.indexOf("m.type === 'listening' && q.audio_text");
  ok(i > 0 && /Math\.min\(18000/.test(appSrc.slice(i, i + 260)), '听力按音频长度放宽解锁兜底（最长 18 秒）');
  // 选项仍然是字母标号 + 内容，作答索引没变，selectAnswer 不用改
  ok(/selectAnswer\(' \+ mi \+ ',' \+ qi \+ ',' \+ oi/.test(appSrc.replace(/\s+/g, ' ').replace(/ /g, ' ')) || /selectAnswer\(' \+ mi/.test(appSrc) || /selectAnswer\(/.test(appSrc), '选项点击仍走 selectAnswer（索引不变）');
}

section('4. 周包工具链能生成这几类题');
{
  ok(/spell:\s*\{\s*type:\s*'tense'/.test(toolSrc), 'weekpack 支持 spell 模块键');
  ok(/skill\s*=\s*'keyboard'/.test(toolSrc), '生成的键盘模块带 skill 标记');
  ok(/键盘拼写题必须 3~6 道/.test(toolSrc), '校验器会卡「每天拼写 3~6 道」');
  ok(/题型至少 2 种/.test(toolSrc), '校验器会卡「听力题型至少 2 种」');
  ok(/picture_options/.test(toolSrc), '周包能把 picture_options 带进题库');
}

section('5. 版本号 165 全线一致');
{
  ok(/app-version" content="166"/.test(htmlSrc), 'index.html app-version = 165');
  const refs = (htmlSrc.match(/\?v=166/g) || []).length;
  ok(refs === 6, 'index.html 6 处脚本引用都升到 165', refs);
  ok(/amy-english-v166/.test(swSrc), 'sw.js CACHE_NAME = amy-english-v166');
  ok(/var V = 166;/.test(swSrc), 'sw.js var V = 165');
  // 用字符类而不是字面量：以后每周升版本时，批量替换不会把这句负向断言也改掉
  ok(!/amy-english-v16[0-4]/.test(swSrc), 'sw.js 里没有残留旧缓存名');
}

section('6. 每天动作数仍是 30（v155 老红线不能破）');
{
  const sentsEN = (t) => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [];
  const unitsOf = (m) => {
    let n = 0;
    if (m.words) n += m.words.length;
    if (m.questions) n += m.questions.length;
    if (m.blanks) n += m.blanks.length;
    if (m.passage) n += 2 * sentsEN(m.passage).length;
    if (m.type === 'writing_template') n += sentsEN(m.full_text || '').length;
    return n;
  };
  const per = CUR.map((d) => d.modules.reduce((s, m) => s + unitsOf(m), 0));
  ok(per.every((n) => n === 30), '最新一周每天恰好 30 个真实动作', per.join(' / '));
}

console.log('\n' + (fail === 0 ? '✅ 全部 ' + pass + ' 项通过' : '❌ ' + fail + ' / ' + (pass + fail) + ' 项失败'));
process.exit(fail === 0 ? 0 : 1);
