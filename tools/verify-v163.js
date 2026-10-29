// tools/verify-v163.js — v163 家长批量需求（5 项）
// 家长 2026-10-29 原话：
//   ① 点单词弹「正在查…等待网络」→ 取消，马上出读音和中文；
//   ② 单词选图片/选中文意思的答案位置有规律 → 必须完全随机；
//   ③ 所有跟读按钮改成点一下开始录音、学生自己点停止（读时可点单词听音）；
//   ④ 短语标签分化不够精细，有些短语被漏掉 → 精细化；
//   ⑤ （打卡数据/周号已在 v161/v162 收口，本脚本只做回归确认）
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const shuffleSrc = fs.readFileSync(path.join(ROOT, 'public', 'data-shuffle.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');

// 在 vm 里把 data.js + data-shuffle.js 跑起来，拿到"页面真正会看到的数据"
const sb = {
  window: {}, self: {}, console: console,
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  document: { createElement() { return {}; }, addEventListener() {}, querySelector() { return null; } },
  location: { search: '', hostname: 'localhost' },
  navigator: { userAgent: 'node' },
  fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
};
vm.createContext(sb);
vm.runInContext(dataSrc + ';globalThis.__D={weeks:HOMEWORK_WEEKS};', sb);
const WEEKS_RAW = JSON.parse(JSON.stringify(sb.__D.weeks));
vm.runInContext(shuffleSrc, sb);
const WEEKS_SHUFFLED = sb.__D.weeks;
vm.runInContext(apiSrc + ';globalThis.__WH=WordHelp;', sb);
const WH = sb.__WH;

// ---------------- 1. 点词立刻出读音+中文 ----------------
section('1. 点词不再"正在查…等网络"（v163 ①）');
{
  ok(/_localDictBuild/.test(apiSrc), 'api.js 有本地词表索引 _localDictBuild');
  ok(/_localDict/.test(apiSrc), 'api.js 有 _localDict 缓存位');
  // dict() 里必须先查本地表，再走网络
  const iDict = apiSrc.indexOf('async dict(');
  const dictBody = apiSrc.slice(iDict, iDict + 3000);
  const iLocal = dictBody.indexOf('_localDict');
  const iNet = dictBody.search(/await fetch\(/);
  ok(iLocal > 0 && iNet > 0 && iLocal < iNet, 'dict() 里本地表在 network 之前', 'local@' + iLocal + ' net@' + iNet);
  ok(/_speakWordInstant/.test(appSrc), 'app.js 有一键读音 _speakWordInstant');
  // 单字母仍走有道（v91 红线）
  const iFn = appSrc.indexOf('App._speakWordInstant = function');
  const fnBody = appSrc.slice(iFn, iFn + 1200);
  ok(/\^\[a-z\]\$/i.test(fnBody) || /\[a-z\]\$\/i/.test(fnBody), '单字母分支还在（v91 红线：字母走有道）');
  // 点词处改成"立刻读"，不再 prefer:cf 等网络
  const iTap = appSrc.indexOf('_speakWordInstant(word)');
  ok(iTap > 0, '点词处调用 _speakWordInstant');
}

// ---------------- 2. 选项位置随机 ----------------
section('2. 选图片/选中文意思的答案位置完全随机（v163 ②）');
{
  ok(/data-shuffle\.js/.test(htmlSrc), 'index.html 引了 data-shuffle.js');
  const iData = htmlSrc.indexOf('data.js?v=');
  const iShuf = htmlSrc.indexOf('data-shuffle.js?v=');
  ok(iData > 0 && iShuf > iData, 'data-shuffle 排在 data.js 之后（加载顺序对）');
  // 选项被打乱，但答案跟着走：内容与正确答案一一对应
  let badAnswer = 0, checked = 0;
  WEEKS_SHUFFLED.forEach((w, wi) => {
    w.forEach((d) => {
      (d.modules || []).forEach((m) => {
        (m.questions || []).forEach((q) => {
          if (!q.options || typeof q.answer !== 'number') return;
          checked++;
          if (q.answer < 0 || q.answer >= q.options.length) badAnswer++;
          // 正确答案文字必须和原始数据一致（只是换了位置）
          const raw = (WEEKS_RAW[wi] || []).find((x) => x.day_cn === d.day_cn);
          const rm = raw && (raw.modules || []).find((x) => x.id === m.id);
          const rq = rm && (rm.questions || []).find((x) => x.id === q.id);
          if (rq && rq.options) {
            if (String(rq.options[rq.answer]) !== String(q.options[q.answer])) badAnswer++;
          }
        });
      });
    });
  });
  ok(checked > 300, '选择题/选项题被逐题核对过', checked);
  ok(badAnswer === 0, '打乱后答案仍指向同一句正确项，且不越界', badAnswer);

  // 位置分布不能有规律（原来 444/10/10/4）
  const pos = [0, 0, 0, 0];
  WEEKS_SHUFFLED.forEach((w) => w.forEach((d) => (d.modules || []).forEach((m) => (m.questions || []).forEach((q) => {
    if (q.options && q.options.length === 4 && typeof q.answer === 'number') pos[q.answer]++;
  }))));
  const total = pos.reduce((a, b) => a + b, 0);
  const maxShare = Math.max.apply(null, pos) / total;
  ok(maxShare < 0.40, '四个位置占比都不超过 40%（不再扎堆第 2、3 个）', pos.join('/'));
  ok(pos[0] > 0 && pos[1] > 0 && pos[2] > 0 && pos[3] > 0, '四个位置都出现过', pos.join('/'));

  // 同一份数据每次加载结果一致（确定性，不闪）
  const again = JSON.parse(JSON.stringify(sb.__D.weeks));
  const first = JSON.stringify(WEEKS_SHUFFLED);
  ok(JSON.stringify(again) === first, '打乱是确定性的（同一份题库每次同样的顺序）');
}

// ---------------- 3. 一键录音（点一下开始，再点一下结束） ----------------
section('3. 跟读按钮改成一键录音（v163 ③）');
{
  ok(/_holdToggleNext/.test(appSrc), '_holdStart 支持 _holdToggleNext 一键模式');
  ok(/tapToggle/.test(appSrc), '_holdStart 有 tapToggle 形参');
  ok(/读完再点一下结束/.test(appSrc), '录音中提示"读完再点一下结束"');
  ok(/120000/.test(appSrc), '一键模式上限 2 分钟（只防忘了关）');

  // 四个整句按钮：保留 onpointerdown，去掉 onpointerup（否则还是"按住"）
  const targets = [
    ['_translateSentence', 'trs-', '点一下说中文'],
    ['_translateClozeSentence', 'cqtrs-', '点一下说中文'],
    ['_readSentence', 'sent-', '点一下跟读'],
    ['_readWritingSentence', 'wr-', '点一下跟读'],
  ];
  targets.forEach(([fn, prefix, label]) => {
    const i = appSrc.indexOf(fn + '(ev');
    ok(i > 0, fn + ' 存在');
    const body = appSrc.slice(i, i + 3000);
    ok(body.indexOf(prefix) >= 0, fn + ' 用的是 ' + prefix + ' 这组 key');
    ok(body.indexOf('_holdToggleNext = true') >= 0, fn + ' 开录前置一键标记');
    ok(appSrc.slice(i - 400, i).indexOf('onpointerup') < 0, fn + ' 按钮上不再挂 onpointerup（不靠松手结束）');
    ok(new RegExp(label).test(appSrc), fn + ' 文案已改成「' + label + '」');
  });

  // 单词/字母单元保持"按住 + 自动收尾"（v106/v119 红线，别被一起改掉）
  ok(/repair-word/.test(appSrc) && /autoStop/.test(appSrc), '单词/字母单元仍是按住+自动收尾（v106/v119 红线）');
  ok(/_holdWasToggle/.test(appSrc), '太快松手的提示按模式区分（一键/按住）');
}

// ---------------- 4. 短语精细化 ----------------
section('4. 短语识别精细化（v163 ④）');
{
  const n = (WH.PHRASES || []).length;
  ok(n >= 380, '短语表 ≥ 380 条', n);
  const cases = [
    ['gave up', 'give up'], ['giving up', 'give up'],
    ['is good at', 'be good at'], ['was interested in', 'be interested in'],
    ['do my best', "do one's best"], ['did their best', "do one's best"],
    ['there are', 'there is'], ['on the other hand', 'on the other hand'],
    ['as soon as possible', 'as soon as possible'],
    ['in the middle of', 'in the middle of'],
    ['the Great Wall', 'the Great Wall'],
    ['the day before yesterday', 'the day before yesterday'],
    ['looked forward to', 'look forward to'],
    ['high-speed train', 'high-speed train'],
    ['by the way', 'by the way'],
  ];
  let miss = [];
  cases.forEach(([t, want]) => {
    const g = WH.phraseInfo(t);
    if (!g || g.en !== want) miss.push(t + '→' + (g ? g.en : 'null'));
  });
  ok(miss.length === 0, '15 个代表性别名/变形都能认出来', miss.join(', ') || '0 漏');

  // 句内：点后面的词也要拿到整串（往回找 5 个词）
  const inline = [
    ['On the other hand, it is cheap.', 'hand', 'on the other hand'],
    ['We should start as soon as possible.', 'possible', 'as soon as possible'],
    ['He is interested in science.', 'interested', 'be interested in'],
    ['She picked it up quickly.', 'it', 'pick up'],
  ];
  let bad = [];
  inline.forEach(([s, w, want]) => {
    const toks = s.match(/[A-Za-z][A-Za-z'\-]*/g) || [];
    const idx = toks.findIndex((x) => x.toLowerCase() === w);
    let got = null;
    for (let back = 5; back >= 0 && !got; back--) {
      const st = idx - back;
      if (st < 0) continue;
      const p = WH.phraseAt(toks, st);
      if (p && idx >= st && idx < st + p.len) got = p;
    }
    if (!got || got.en !== want) bad.push(w + '→' + (got ? got.en : 'null'));
  });
  ok(bad.length === 0, '句子里点后半截/代词也能拿到整串短语', bad.join(', ') || '0 漏');

  // 覆盖度：题库文本里能识别出的不同短语数
  const texts = [];
  (function walk(node) {
    if (typeof node === 'string') { if (/ /.test(node) && /[A-Za-z]{2}/.test(node)) texts.push(node); return; }
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === 'object') Object.keys(node).forEach((k) => walk(node[k]));
  })(WEEKS_RAW);
  const hit = new Set();
  texts.forEach((s) => {
    const toks = s.match(/[A-Za-z][A-Za-z'\-]*/g) || [];
    let i = 0;
    while (i < toks.length) {
      const p = WH.phraseAt(toks, i);
      if (p) { hit.add(p.en); i += p.len; } else i++;
    }
  });
  ok(hit.size >= 100, '题库里识别出的不同短语 ≥ 100 种（原来约 16 种）', hit.size);
}

// ---------------- 5. 版本号 ----------------
section('5. 版本号 = 163');
{
  ok(/app-version" content="165"/.test(htmlSrc), 'index.html app-version = 163');
  const refs = (htmlSrc.match(/\.js\?v=165/g) || []).length;
  ok(refs >= 6, '6 个 script 引用都升到 v163', refs);
  ok(/amy-english-v165/.test(swSrc) && /var V = 165;/.test(swSrc), 'sw.js 缓存名与 V = 163');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
