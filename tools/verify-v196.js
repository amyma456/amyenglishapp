/* ===========================================================================
 * v196 校验：想好了再点 · 防乱点 · 连续点对才高分
 *   node tools/verify-v196.js
 *
 * 家长 2026-11-12：「玩游戏点单词不能乱点，要想一下才能点，就是连续点出
 *   正确答案，这种得分上面受影响。」
 *
 * 这份校验不只读代码文本 —— 用 vm 把 game.js 真加载起来，手动点按钮，
 * 检查分数、连击、乱点计数和轮末结算是不是真的按新规则走。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const read = f => fs.readFileSync(path.join(PUB, f), 'utf8');

const html = read('index.html');
const game = read('game.js');
const sw = read('sw.js');
const pass = [];
function ok(name, fn) {
  fn();
  pass.push(name);
  console.log('  ✓ ' + name);
}

console.log('v196 · 想好了再点 / 防乱点 / 连续点对才高分 校验');

// ---------------------------------------------------------------- 模拟环境
function makeEnv() {
  const store = {};
  const Api = {
    reportGameScore: function () { return Promise.resolve(true); },
    fetchGameScores: function () { return Promise.resolve({ rows: [], server_day: '2026-11-12' }); }
  };
  const App = {
    isTeacher: function () { return false; },
    _myStudentId: function () { return 's1'; },
    _myWho: function () { return { name: 'Yunus', klass: '四年级' }; },
    _weekTag: function () { return 'w7'; },
    getTodayWeekdayIdx: function () { return 3; },
    state: { phone: '138', answers: {}, checkins: {}, students: [] },
    switchTab: function () {}
  };
  const doc = {
    addEventListener: function () {},
    getElementById: function () { return null; },
    visibilityState: 'visible'
  };
  const win = {
    localStorage: {
      getItem: function (k) { return store[k] || null; },
      setItem: function (k, v) { store[k] = v; }
    },
    addEventListener: function () {},
    WordHelp: { PHRASES: [] },
    App: App, Api: Api, document: doc
  };
  win.window = win;
  // setTimeout 故意做成「只登记不执行」：断言自己控制换题时机，
  // 不让真实的 330ms / 900ms 回调在测试中途重置题目。
  const ctx = vm.createContext({
    window: win, document: doc, localStorage: win.localStorage,
    App: App, Api: Api, WordHelp: { PHRASES: [] }, console: console,
    setTimeout: function () { return 0; }, clearTimeout: function () {},
    setInterval: function () { return 0; }, clearInterval: function () {},
    Date: Date, Math: Math, JSON: JSON, navigator: {}, Blob: function () {}
  });
  vm.runInContext(game, ctx);
  const WG = win.WordGame;
  const G = WG._test.state;
  G.pool = WG._test.buildPool(WG.todayInfo());
  return { WG: WG, G: G, S: WG._test.save(), store: store, CFG: WG.config() };
}

function idxOf(G, wantCorrect) {
  for (let i = 0; i < G.q.options.length; i++) {
    if (!!G.q.options[i].correct === wantCorrect) return i;
  }
  return -1;
}

/** 出一道新题，并把它伪装成「ageMs 毫秒前出现」 */
function arm(env, ageMs) {
  const G = env.G;
  G.phase = 'playing';
  G.locked = false;
  G.answered = false;
  G.hint = '';
  env.WG._test.armQuestion();
  G.qShownAt = Date.now() - ageMs;
  G.q.star = false;                 // 星题会额外加分，基础分测试统一关掉
  G.roundMs = 30000;
  G.roundEndAt = Date.now() + 30000;
  G.allowanceMs = 180000;
}

function resetRound(G) {
  G.score = 0; G.combo = 0; G.maxCombo = 0; G.correct = 0; G.starHit = 0;
  G.misses = 0; G.rush = 0; G.lastTapAt = 0; G.roundNo = 1;
}

// ---------------------------------------------------------------- 版本钉子
ok('版本钉子一致（meta / 7 处 ?v= / SW / game.js 预缓存）', () => {
  assert(/<meta name="app-version" content="203">/.test(html), 'index.html meta 没升');
  const vs = html.match(/<script defer src="[^"]+\?v=(\d+)"/g) || [];
  assert.strictEqual(vs.length, 7, '脚本引用应是 7 处，实际 ' + vs.length);
  vs.forEach(s => assert(/\?v=203"/.test(s), '还有旧版本：' + s));
  assert(/var CACHE_NAME = 'amy-english-v203'/.test(sw), 'SW CACHE_NAME 没升');
  assert(/var V = 203;/.test(sw), 'SW V 没升');
  assert(/\.\/game\.js\?v=' \+ V/.test(sw), 'SW 没预缓存 game.js');
});

// ------------------------------------------------------------ 新规则的配置
ok('防乱点参数全部集中在 CFG，家长以后能一处调整', () => {
  const env = makeEnv();
  ['thinkMs', 'rushMs', 'rushScore', 'wrongPauseMs', 'tapGapMs',
   'chainFrom', 'chainBonus', 'missPenalty', 'rushPenalty', 'penaltyCap'
  ].forEach(k => assert(typeof env.CFG[k] === 'number', 'CFG 缺 ' + k));
  assert(env.CFG.thinkMs > 0 && env.CFG.thinkMs < env.CFG.rushMs,
    '思考闸门必须短于抢点判定');
  assert(env.CFG.rushScore < env.CFG.baseScore, '抢点得分必须低于稳稳点对');
  assert(env.CFG.penaltyCap < 1, '扣罚上限必须小于 1，不能扣到 0 分');
});

// -------------------------------------------------------------- 真跑答题
ok('① 出题后思考闸门内点击无效：不加分、不计乱点、题目还能再答', () => {
  const env = makeEnv(), G = env.G;
  resetRound(G);
  arm(env, 0);                                   // 刚出现就点
  env.WG._test.pickOption(idxOf(G, true));
  assert.strictEqual(G.score, 0, '闸门内竟然加分了');
  assert.strictEqual(G.answered, false, '闸门内点击不该算作答');
  assert.strictEqual(G.rush, 0, '闸门内点击不该记成抢点');
  assert.strictEqual(G.combo, 0, '闸门内点击不该涨连击');
});

ok('② 抢着点答对：只拿 rushScore、连击冻结、记一次乱点', () => {
  const env = makeEnv(), G = env.G;
  resetRound(G);
  arm(env, env.CFG.thinkMs + 80);                // 过了闸门，但仍是抢点
  env.WG._test.pickOption(idxOf(G, true));
  assert.strictEqual(G.score, env.CFG.rushScore, '抢点不该拿满分');
  assert.strictEqual(G.combo, 0, '抢点不该涨连击');
  assert.strictEqual(G.rush, 1, '抢点没记进乱点次数');
  assert.strictEqual(G.answered, true, '一题只能答一次');
});

ok('③ 稳稳点对：拿满基础分，连对 3 题起每题再加链奖励', () => {
  const env = makeEnv(), G = env.G;
  resetRound(G);
  const gains = [];
  for (let n = 1; n <= 3; n++) {
    const before = G.score;
    G.lastTapAt = 0;
    arm(env, env.CFG.rushMs + 700);              // 想过了才点
    env.WG._test.pickOption(idxOf(G, true));
    gains.push(G.score - before);
  }
  assert.strictEqual(G.combo, 3, '连击应该涨到 3');
  assert.strictEqual(G.rush, 0, '稳点不该记抢点');
  assert.strictEqual(gains[0], env.CFG.baseScore, '第一题应拿基础分');
  assert.strictEqual(gains[1], env.CFG.baseScore + env.CFG.comboStep, '第二题应有连击加成');
  assert.strictEqual(gains[2],
    env.CFG.baseScore + 2 * env.CFG.comboStep + env.CFG.chainBonus,
    '第三题应有连击加成 + 链奖励');
  assert(gains[2] > gains[1] && gains[1] > gains[0], '连续点对必须越点越值钱');
  assert(gains[2] > env.CFG.rushScore * 3, '稳点三题必须明显高过乱点三题');
});

ok('④ 一题只有一次机会：点错 0 分、连击清零，再点正确答案也蒙不到分', () => {
  const env = makeEnv(), G = env.G;
  resetRound(G);
  G.combo = 2;
  arm(env, env.CFG.rushMs + 700);
  const wi = idxOf(G, false), ci = idxOf(G, true);
  assert(wi >= 0 && ci >= 0 && wi !== ci, '题目必须有对有错');
  env.WG._test.pickOption(wi);
  assert.strictEqual(G.score, 0, '点错不该得分');
  assert.strictEqual(G.combo, 0, '点错必须断连击');
  assert.strictEqual(G.misses, 1, '点错没记进乱点次数');
  env.WG._test.pickOption(ci);                   // 旧版这里就能蒙到分
  assert.strictEqual(G.score, 0, '点错后还能点出分 = 乱点漏洞没堵住');
  assert.strictEqual(G.misses, 1, '后续点击不该重复计数');
});

ok('⑤ 连点保护：两下挨太近，后一下直接忽略', () => {
  const env = makeEnv(), G = env.G;
  resetRound(G);
  G.lastTapAt = Date.now();
  arm(env, env.CFG.rushMs + 700);
  env.WG._test.pickOption(idxOf(G, true));
  assert.strictEqual(G.score, 0, '连点竟然被受理了');
  assert.strictEqual(G.answered, false, '连点不该算作答');
});

ok('⑥ 轮末补给随乱点递减，且永远不扣成负数', () => {
  const env = makeEnv(), G = env.G;
  function settle(misses, rush) {
    G.phase = 'playing';
    resetRound(G);
    G.roundMs = 30000; G.roundEndAt = Date.now() + 30000; G.allowanceMs = 180000;
    G.correct = 10; G.maxCombo = 5; G.starHit = 0;
    G.misses = misses; G.rush = rush;
    env.WG._test.endRound('manual');
    return G.last;
  }
  const clean = settle(0, 0);
  const twoMiss = settle(2, 0);
  const threeRush = settle(0, 3);
  const many = settle(9, 9);
  assert.strictEqual(clean.bonus, 10 * 2 + 5 * 3 + 20, '全稳作答应全额发补给');
  assert(twoMiss.bonus < clean.bonus && twoMiss.lost > 0, '点错没让补给变少');
  assert(threeRush.bonus < clean.bonus && threeRush.lost > 0, '抢点没让补给变少');
  assert(many.bonus > 0, '扣罚封顶不能把补给扣成 0');
  assert(many.bonus <= twoMiss.bonus, '乱点越多，补给必须越少（或持平）');
  assert.strictEqual(clean.slip, 0, '全稳作答不该记乱点');
  assert.strictEqual(twoMiss.slip, 2, '乱点次数要如实写进结算');
});

ok('⑦ 结算页把「少发多少分」直接显示给孩子看', () => {
  const env = makeEnv(), G = env.G;
  G.phase = 'round';
  G.last = { score: 40, bonus: 20, correct: 5, combo: 3, star: 0,
             slip: 3, lost: 22, rawBonus: 42 };
  const h = env.WG.render();
  assert(/少发/.test(h) && /22/.test(h), '结算页没显示少发的补给');
  assert(/稳一点/.test(h), '结算页没给"稳一点"的引导');
  env.G.last = { score: 60, bonus: 55, correct: 10, combo: 5, star: 0,
                 slip: 0, lost: 0, rawBonus: 55 };
  const h2 = env.WG.render();
  assert(/全额发放/.test(h2), '全稳作答没有正反馈');
});

// ------------------------------------------------------- 页面样式与老浏览器
ok('⑧ 思考条 / 等待态 / 正确答案高亮都有样式，且不引入新选择器', () => {
  // 注释里写了「不用 :has() / 100dvh」，先去掉注释再查真实 CSS，
  // 否则会把说明文字当成选择器误报。
  const block = html.slice(html.indexOf('v196 · 想好了再点'), html.indexOf('</style>'))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  assert(block.length > 100, 'v196 样式块不见了');
  ['.wg-think', '.wg-think-wait', '.wg-think-go', '.wg-think-hint',
   '.wg-opts-wait', '.wg-opt-answer', '.wg-opt-rush', '.wg-slip', '.wg-good'
  ].forEach(s => assert(block.indexOf(s) >= 0, '缺样式 ' + s));
  assert(!/:has\(/.test(block), '新样式不许用 :has()');
  assert(!/100dvh/.test(block), '新样式不许单写 100dvh');
});

ok('⑨ 游戏仍是纯 ES5，老华为浏览器 / 平板自带浏览器不受影响', () => {
  assert(!/=>/.test(game), 'game.js 里出现了箭头函数');
  assert(!/(^|[^\w])(let|const)\s+\w/.test(game), 'game.js 里出现 let / const');
  assert(!/`/.test(game), 'game.js 里出现模板字符串');
  assert(!/\?\./.test(game), 'game.js 里出现可选链');
});

ok('⑩ 玩法手册说清了新规则，时长曲线一个数字没动', () => {
  assert(/一题只有一次机会/.test(game), '手册没说明一题一次');
  assert(/抢着点只拿/.test(game), '手册没说明抢点低分');
  assert(/不能挨个蒙/.test(game), '手册没点明防蒙');
  const env = makeEnv();
  assert.strictEqual(env.WG.rule(0), 180, '全对仍应是 3:00');
  assert.strictEqual(env.WG.rule(5), 120, '错 5 道仍应是 2:00');
  assert.strictEqual(env.WG.rule(30), 45, '保底仍应是 45 秒');
});

console.log('\n全部通过，共 ' + pass.length + ' 项。');
