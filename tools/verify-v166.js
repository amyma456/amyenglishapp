/* eslint-disable */
// verify-v166（家长 2026-10-29 晚）：
//   「听力题的确有更新，但是读出来了 girl woman boy 的这个谁读句子的这个人
//    的称谓。而且 Boy、girl 都是一个人读的，没有这种男女的区分，所以要求
//    男人读男人的，女人读女人的，要有两个读音的这样的发音。读的时候不要读
//    出来 boy、girl、woman 这些提示的人的发音的称谓，直接读就行」
//
// 钉住四件事：
//   1. 说话人标签永远不被念出来（_ttsText 兜底剥离，任何路径都读不到）
//   2. 对话按角色拆段，男女音色分开（Boy→m*、Girl→f*、Mum→f2、Grandma→f2）
//   3. 逐段串行播，一段读完才开下一段（中间不叠音、不哑）
//   4. Worker 真的按音色合成：?voice= 白名单 + 缓存键分流 + 两家的男女音色表
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

const appSrc = read('public/app.js');
const workerSrc = read('worker/src/index.js');
const dataSrc = read('public/data.js');
const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();

// ---------------------------------------------------------------------------
// 极简 DOM / 全局桩：只为把 app.js 装起来，取它的几个纯函数
// ---------------------------------------------------------------------------
const mkEl = () => ({
  style: {}, className: '', innerHTML: '', textContent: '', value: '',
  classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
  setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
  querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  insertAdjacentHTML() {}, focus() {}, scrollIntoView() {}, closest: () => null,
});
const byId = {};
const document = {
  getElementById: (id) => (byId[id] = byId[id] || mkEl()),
  querySelector: () => null, querySelectorAll: () => [],
  createElement: mkEl, addEventListener() {},
  body: mkEl(), documentElement: mkEl(), visibilityState: 'visible', hidden: false,
};
const lsData = {};
const localStorage = {
  getItem: (k) => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: (k) => { delete lsData[k]; },
};
const window = {
  addEventListener() {}, removeEventListener() {},
  location: { search: '', href: '', hash: '' },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const Api = {
  warmup() {}, answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
  getAllWrongQuestions: async () => [], load: async () => ({}), loadWrongCache: async () => {},
  dict: async () => null, submitSpeakingScore() {}, uploadRecording: () => Promise.resolve(),
};
const Recorder = {
  supported: () => true, warmUp() {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null, level: () => 0,
};
process.on('unhandledRejection', () => {});

let App;
try {
  App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, Recorder,
            HOMEWORK_DATA, CLOZE_SENTENCE_CN, VOCAB_HINTS, URL, fetch, Cloud,
            SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
    ${appSrc}
    return App;
  `)({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA: W[0],
    CLOZE_SENTENCE_CN: new Function(dataSrc + '; return CLOZE_SENTENCE_CN;')(),
    VOCAB_HINTS: new Function(dataSrc + '; return VOCAB_HINTS;')(),
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert() {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
  });
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}
ok(!!App && typeof App._dialogTurns === 'function', 'app.js 装载成功，_dialogTurns 存在');

// ---------------------------------------------------------------------------
// 1. 标签不许被念出来
// ---------------------------------------------------------------------------
section('1. 说话人标签不被朗读');
{
  const samples = [
    'Girl: Mum, why do we eat zongzi at the Dragon Boat Festival? Mum: Because we want to remember the poet Qu Yuan.',
    'Boy: How much is this story book? Woman: It is twenty yuan.',
    'Grandma: I learned it from my mother when I was ten.',
    'Boy: Can you make zongzi, Grandma?',
  ];
  const labels = /(girl|boy|woman|man|mum|mom|dad|grandma|grandpa|teacher)s?\s*:/i;
  samples.forEach((s) => {
    const spoken = App._ttsText(s);
    ok(!labels.test(spoken), '朗读文本里没有说话人标签', '"' + spoken.slice(0, 42) + '…"');
  });
  // 正文里的 Mum（"Mum, why ..."）不能被当成标签删掉
  const t = App._ttsText('Girl: Mum, why do we eat zongzi?');
  ok(/^Mum, why do we eat zongzi\?$/.test(t), '称呼语 Mum, 保留，只删「Girl:」标签', JSON.stringify(t));
  // 普通句子一个字节都不改
  const plain = 'The Great Wall is in the north of China.';
  ok(App._ttsText(plain) === plain, '没有标签的句子原样不动');
  // 句末标签（"… desk. Boy: …"）也要清掉
  const mid = App._ttsText('The book is on the desk. Boy: Thank you.');
  ok(!/Boy\s*:/i.test(mid) && /on the desk\./.test(mid), '句末标签也清掉、句号保留', JSON.stringify(mid));
}

// ---------------------------------------------------------------------------
// 2. 拆段 + 男女音色
// ---------------------------------------------------------------------------
section('2. 对话拆段与男女音色');
{
  const dlg = 'Girl: Mum, why do we eat zongzi? Mum: Because we remember Qu Yuan.';
  const turns = App._dialogTurns(dlg);
  ok(turns.length === 2, '两句对话拆成两段', turns.length);
  ok(turns[0].voice === 'f1', 'Girl → 女声 f1', turns[0].voice);
  ok(turns[1].voice === 'f2', 'Mum → 成年女声 f2', turns[1].voice);
  ok(!/^Girl/i.test(turns[0].text) && !/^Mum/i.test(turns[1].text), '每段台词不带标签');
  ok(/^Mum, why do we eat zongzi\?$/.test(turns[0].text), '第一段从称呼语开始（Mum, 不是标签）', JSON.stringify(turns[0].text));

  const b = App._dialogTurns('Boy: It is twenty yuan. Woman: Thank you.');
  ok(b[0].voice === 'm1', 'Boy → 男声 m1', b[0].voice);
  ok(b[1].voice === 'f2', 'Woman → 成年女声 f2', b[1].voice);

  const g = App._dialogTurns('Grandma: I learned it when I was ten. Boy: It looks difficult.');
  ok(g[0].voice === 'f2' && g[1].voice === 'm1', 'Grandma 女 / Boy 男', g.map((x) => x.voice).join(','));

  // 音色必须真的分得开：任何一个男女混合的对话，声音集合里至少两个不同的键
  const allVoices = new Set(g.map((x) => x.voice));
  ok(allVoices.size === 2, '同一段对话里至少两种音色', Array.from(allVoices).join('/'));

  // 没有标签 → 单段、空音色（照旧一个人读，不改变普通题的行为）
  const single = App._dialogTurns('The Great Wall is very long.');
  ok(single.length === 1 && single[0].voice === '', '普通句子单段、无角色', single.length);
  const empty = App._dialogTurns('   ');
  ok(empty.length === 0, '空串返回空数组');
}

// ---------------------------------------------------------------------------
// 3. 逐段串行播
// ---------------------------------------------------------------------------
section('3. 逐段串行播，一段读完再开下一段');
{
  const calls = [];
  const realSpeak = App.speak;
  App.speak = function (text, opts) { calls.push({ text: text, voice: (opts || {}).voice || '' }); };
  App.speakDialog('Girl: Hello. Boy: Hi.', {});
  App.speak = realSpeak;
  ok(calls.length === 1, '第一段立刻开播，不并发', calls.length);
  ok(calls[0].voice === 'f1' && calls[0].text === 'Hello.', '第一段用女声、只读台词', JSON.stringify(calls[0]));

  // 模拟第一段播完（onDone）→ 第二段才起来，且换成男声
  const seq = [];
  const orig = App.speak;
  App.speak = function (text, opts) {
    seq.push((opts || {}).voice || '-');
    if (opts && opts.onDone) setTimeout(opts.onDone, 0);
  };
  const done = new Promise((resolve) => {
    App.speakDialog('Boy: Hi. Girl: Hello. Mum: Bye.', { onDone: resolve });
  });
  done.then(() => {
    App.speak = orig;                       // 恢复真 speak 之前不能再让它跑
    ok(seq.join(',') === 'm1,f1,f2', '三段按 Boy→Girl→Mum 依次用 m1/f1/f2', seq.join(','));
    section('4. Worker 按音色合成');
    checkWorker();
    finish();
  });
}

function checkWorker() {
  ok(/TTS_VOICES_EN/.test(workerSrc), 'worker 里有角色音色表');
  ['f1', 'f2', 'm1', 'm2'].forEach((k) => {
    ok(new RegExp(k + ':\\s*\\{[^}]*aliyun:[^}]*cf:').test(workerSrc), '音色表有 ' + k + '（阿里云 + Cloudflare 双通道）');
  });
  const male = (workerSrc.match(/m1:\s*\{[^}]*aliyun:\s*'([^']+)'/) || [])[1];
  const female = (workerSrc.match(/f1:\s*\{[^}]*aliyun:\s*'([^']+)'/) || [])[1];
  ok(!!male && !!female && male !== female, '男声与女声是不同的音色', male + ' vs ' + female);
  ok(/get\('voice'\)/.test(workerSrc), 'worker 读 ?voice= 参数');
  ok(/hasOwnProperty\.call\(TTS_VOICES_EN, voiceQ\)/.test(workerSrc), 'voice 走白名单，不透任意字符串');
  ok(/voice \? '&voice=' \+ voice : ''/.test(workerSrc), '缓存键里带 voice（不同音色不串音频）');
  ok(/!preferCf && !forceTtsQ && !voice/.test(workerSrc), '带音色时绕开静态预生成表（那份是默认音色）');
  ok(/aliyunTtsAudio\(text, env, voice\)/.test(workerSrc), '阿里云合成收到音色参数');
  ok(/cfTtsAudio\(text, env, cfSpeaker\)/.test(workerSrc), 'Cloudflare 合成收到 speaker');
  ok(/speaker: speaker/.test(workerSrc), 'aura-2 传 speaker 字段');

  ok(/voice: opts\.voice \|\| ''/.test(appSrc) || /var voice = opts\.voice \|\| ''/.test(appSrc), 'speak() 接受 voice');
  ok(/voice \? '&voice=' \+ encodeURIComponent\(voice\)/.test(appSrc), 'speak() 请求带 voice');
  ok(/\(voice \? 'v:' \+ voice \+ '\|' : ''\)/.test(appSrc), '前端缓存键带 voice');
  ok(/autoplay|autoSpeakDialog/.test(appSrc) && /autoSpeakDialog\(dlgRaw, open\)/.test(appSrc), '听力自动朗读走对话通道');
  ok(/this\.speakDialog\(dlgRaw, \{ onDone: onDone \}\)/.test(appSrc), '「重新听」也走对话通道');
}

// ---------------------------------------------------------------------------
// 5. 题库里的真实对话都能拆开
// ---------------------------------------------------------------------------
function checkData() {
  section('5. 题库里的听力对话');
  let dlgCount = 0, bad = 0, mixed = 0;
  W.forEach((wk) => (wk || []).forEach((day) => (day.modules || []).forEach((m) => (m.questions || []).forEach((q) => {
    if (!q.audio_text) return;
    const raw = String(q.audio_text);
    if (!/(?:^|[\s.!?])(?:Boy|Girl|Man|Woman|Mum|Mom|Dad|Grandma|Grandpa|Teacher)\s*:/i.test(raw)) return;
    dlgCount++;
    const turns = App._dialogTurns(raw);
    if (turns.length < 2) bad++;
    const voices = new Set(turns.map((t) => t.voice).filter(Boolean));
    if (voices.size >= 2) mixed++;
  }))));
  ok(dlgCount >= 4, '题库里有对话型听力', dlgCount);
  ok(bad === 0, '每一段对话都能拆成 2 段以上', bad);
  ok(mixed === dlgCount, '每一段对话都有两种以上音色（男女真的分开）', mixed + '/' + dlgCount);
}

checkData();

function finish() {
  console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
}
