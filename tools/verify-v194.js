/* ===========================================================================
 * v194 校验：单词星球 · 能量收集站
 *   node tools/verify-v194.js
 * 重点验家长 2026-11-11 的两条硬要求：
 *   ① 按每个孩子今天的错题数发时长，错得多玩得少，硬上限 3 分钟；
 *   ② 每一轮单独结算，赢的分数可以一直累计。
 * 顺便把版本钉子、SW 预缓存、页签接线、英文全小写一起锁死。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..', 'public');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const pass = [];
function ok(name, fn) {
  fn();
  pass.push(name);
  console.log('  ✓ ' + name);
}

const html = read('index.html');
const app  = read('app.js');
const game = read('game.js');
const sw   = read('sw.js');

console.log('v194 · 单词星球校验');

// ---------------------------------------------------------------- 版本钉子
ok('meta / 全部 script ?v= / SW 版本都是 194', () => {
  assert(/<meta name="app-version" content="206">/.test(html), 'index.html meta 不是 194');
  const vs = html.match(/<script defer src="[^"]+\?v=(\d+)"/g) || [];
  assert(vs.length >= 7, '脚本版本钉子数量不对：' + vs.length);
  vs.forEach(s => assert(/\?v=206"/.test(s), '还有旧版本：' + s));
  assert(/var CACHE_NAME = 'amy-english-v206'/.test(sw), 'SW CACHE_NAME 没升');
  assert(/var V = 206;/.test(sw), 'SW V 没升');
});

ok('game.js 在 app.js 之前加载，且被 SW 预缓存', () => {
  const gi = html.indexOf('src="game.js?v=206"');
  const ai = html.indexOf('src="app.js?v=206"');
  assert(gi > 0 && ai > gi, 'game.js 必须排在 app.js 前面（app.js 顶层有同步渲染）');
  assert(/\.\/game\.js\?v=' \+ V/.test(sw), 'SW install 没预缓存 game.js');
});

ok('学生端 + 老师端都有页签、渲染分支、离开结算、打卡页入口', () => {
  assert((app.match(/id: 'wordgame'/g) || []).length === 2, '两端页签各要一个');
  assert((app.match(/case 'wordgame':/g) || []).length === 2, '两端 renderContent 分支');
  assert(/WordGame\.mount\(\)/.test(app), 'renderContent 末尾没挂载游戏');
  assert(/WordGame\.onLeave\(\)/.test(app), 'switchTab 切走没结算');
  assert(/App\.switchTab\(\\'wordgame\\'\)/.test(app), '打卡页没有游戏入口');
  assert(/<symbol id="i-game"/.test(html), '缺手柄图标');
});

ok('CSS 齐备且不用 :has() / 单写 100dvh', () => {
  ['.wg-root', '.wg-opt{', '.wg-opt-correct', '.wg-opt-wrong', '.wg-ladder',
   '.wg-qcard-star', '.wg-float', '.wg-btn{'].forEach(c =>
    assert(html.indexOf(c) > 0, '缺样式 ' + c));
  const cssStart = html.lastIndexOf('/*', html.indexOf('v194 · 单词星球 · 能量收集站'));
  const cssBlock = html.slice(cssStart, html.indexOf('</style>'));
  const cssOnly = cssBlock.replace(/\/\*[\s\S]*?\*\//g, '');
  assert(!/:has\(/.test(cssOnly), '新样式里不许用 :has()');
  assert(!/100dvh/.test(cssOnly), '新样式不碰视口高度，游戏页正常滚动');
});

ok('game.js 是 ES5（老华为浏览器 / 平板自带浏览器）', () => {
  assert(!/=>/.test(game), '出现箭头函数');
  assert(!/\?\./.test(game), '出现可选链');
  assert(!/`/.test(game), '出现模板字符串');
  assert(!/\bconst\b|\blet\b/.test(game.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')), '出现 const/let');
});

// ------------------------------------------------------- 在沙箱里跑游戏逻辑
const mem = {};
const localStorage = {
  getItem: k => (mem[k] === undefined ? null : mem[k]),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; }
};

const dict = {};
('apple river cloud pencil market window planet ticket desert camel sand storm ' +
 'oasis travel happy bright little school teacher friend family water flower ' +
 'morning evening summer winter mountain village bridge garden forest').split(' ')
  .forEach((w, i) => { dict[w] = '意思' + (i + 1) + '|ˈtest'; });

const phrases = [
  ['large desert', '大沙漠'], ['be close to', '靠近…'], ['is close to', '靠近…'],
  ['go swimming', '去游泳'], ['look after', '照顾'], ['in the park', '在公园里'],
  ['many people', '许多人'], ['like swimming', '喜欢游泳'], ['get up early', '早起'],
  ['take care of', '照顾']
];

const hd = [];
for (let d = 0; d < 7; d++) {
  hd.push({
    day_cn: '周' + d,
    modules: d === 2 ? [
      { type: 'vocab', words: [{ word: 'desert', meaning: '沙漠', emoji: '🏜️' },
                               { word: 'camel', meaning: '骆驼', emoji: '🐫' }] },
      { type: 'questions', questions: [{ question: 'the large desert is close to the park',
        options: ['desert', 'river', 'cloud'] }] }
    ] : []
  });
}

const AppStub = {
  isTeacher: () => false,
  getTodayWeekdayIdx: () => 2,
  _myStudentId: () => 's1',
  _weekTag: () => '_w3',
  switchTab: () => {},
  state: {
    phone: '13800000000',
    answers: {
      's1_w3_d2_m1_q0': { correct: false, value: 'the large desert' },
      's1_w3_d2_m1_q1': { correct: false, value: 'be close to' },
      's1_w3_d2_m1_q2': { correct: true, value: 'yes' }
    },
    checkins: { 's1_w3_d2': { done: true, wrongCount: 5 } }
  }
};

const sandbox = {
  console,
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ className: '', innerHTML: '', appendChild: () => {} })
  },
  localStorage
};
sandbox.window = {
  localStorage,
  addEventListener: () => {},
  App: AppStub,
  HOMEWORK_DATA: hd,
  WordHelp: { PHRASES: phrases },
  LOCAL_DICT: dict,
  Api: { dictLocal: w => (dict[w] ? { word: w, zh: '意思' } : null) }
};
vm.createContext(sandbox);
vm.runInContext(game, sandbox, { filename: 'game.js' });
const WG = sandbox.window.WordGame;
assert(WG, 'WordGame 没挂到 window');

// ------------------------------------------------------------------ 时长规则
ok('错题数 → 时长：0 道 3:00、5 道 2:00、12 道以上 0:45，硬上限 3 分钟', () => {
  assert.strictEqual(WG.rule(0), 180, '全对必须 3 分钟');
  assert.strictEqual(WG.rule(1), 168);
  assert.strictEqual(WG.rule(5), 120);
  assert.strictEqual(WG.rule(11), 48);
  assert.strictEqual(WG.rule(12), 45);
  assert.strictEqual(WG.rule(50), 45);
  let prev = 181;
  for (let w = 0; w <= 40; w++) {
    const s = WG.rule(w);
    assert(s <= prev, '错题变多但时长变长了，w=' + w);
    assert(s <= 180 && s >= 45, '越过上限/保底，w=' + w);
    prev = s;
  }
});

ok('可调整：时长参数集中在 CFG，改数值不需要改玩法', () => {
  const c = WG.config();
  assert.strictEqual(c.maxSec, 180);
  assert.strictEqual(c.secPerWrong, 12);
  assert.strictEqual(c.minSec, 45);
  assert.strictEqual(c.roundMs, 30000);
  assert(c.reviewPerWrong > 0, '错题回炉权重也要可调');
  assert(/var CFG = \{/.test(game));
});

ok('没打卡只给 30 秒试玩；老师试玩按满额；已打卡按错题数', () => {
  assert.strictEqual(WG.grantSec({ done: false, wrong: 0, teacher: false }), 30);
  assert.strictEqual(WG.grantSec({ done: true, wrong: 3, teacher: false }), 144);
  assert.strictEqual(WG.grantSec({ done: true, wrong: 5, teacher: false }), 120);
  assert.strictEqual(WG.grantSec({ done: false, wrong: 9, teacher: true }), 180);
});

ok('实时取的是这个孩子今天的错题（答题记录 + 打卡记录取更完整的）', () => {
  const i = WG.todayInfo();
  assert.strictEqual(i.wrong, 5, '应认到 5 道错题，实际 ' + i.wrong);
  assert.strictEqual(i.done, true);
  assert.strictEqual(WG.grantSec(i), 120);
});

// -------------------------------------------------------------------- 出题
ok('200 道题：4 个选项、恰好 1 个正确、不重复、英文一律小写', () => {
  const st = WG._test.state;
  st.info = WG.todayInfo();
  st.pool = WG._test.buildPool(st.info);
  assert(st.pool.all.length > 10, '题库太小：' + st.pool.all.length);
  assert(st.pool.wrong.length > 0, '错题回炉池是空的');
  assert(st.pool.phrases.length > 0, '短语池是空的');
  const kinds = {};
  for (let n = 0; n < 200; n++) {
    const q = WG._test.makeQuestion();
    kinds[q.kind] = (kinds[q.kind] || 0) + 1;
    assert.strictEqual(q.options.length, 4, '选项不是 4 个');
    assert.strictEqual(q.options.filter(o => o.correct).length, 1, '正确答案不唯一');
    const texts = q.options.map(o => o.text);
    assert.strictEqual(new Set(texts).size, 4, '选项重复：' + texts.join('/'));
    [q.title, q.sub].concat(texts).forEach(t => {
      assert(!/[A-Z]/.test(String(t)), '出现大写英文：' + t);
    });
  }
  assert(Object.keys(kinds).length >= 2, '题型没轮换：' + JSON.stringify(kinds));
});

// ------------------------------------------------------------- 轮次结算 / 累计
ok('每轮单独结算，分数逐轮累计到总账，重复结算不会 double count', () => {
  WG._test.reset();
  const st = WG._test.state;
  st.phase = 'lobby';
  st.html = '';
  const sv = WG._test.save();

  WG._test.startRound();
  assert.strictEqual(st.phase, 'playing');
  st.score = 100; st.correct = 5; st.maxCombo = 4; st.starHit = 1;
  WG._test.endRound('time');
  // 100 + (5*2 + 4*3 + 0 + 1*5) = 127
  assert.strictEqual(sv.total, 127, '第一轮累计不对：' + sv.total);
  assert.strictEqual(sv.rounds, 1);
  assert.strictEqual(sv.history[0].s, 127);
  assert.strictEqual(sv.todayScore, 127);
  assert.strictEqual(sv.usedMs, 30000, '一轮应扣 30 秒');

  WG._test.endRound('time'); // 已不是 playing，必须直接忽略
  assert.strictEqual(sv.total, 127, '重复结算把分算了两遍');

  WG._test.startRound();
  assert.strictEqual(st.roundNo, 2);
  st.score = 50; st.correct = 2; st.maxCombo = 2; st.starHit = 0;
  WG._test.endRound('time');
  // 50 + (2*2 + 2*3) = 60
  assert.strictEqual(sv.total, 187, '第二轮没累加上去：' + sv.total);
  assert.strictEqual(sv.rounds, 2);
  assert.strictEqual(sv.history.length, 2);
  assert.strictEqual(sv.usedMs, 60000);
});

ok('一天最多 3 分钟：额度用完后只能看结算，不能再开一轮', () => {
  const st = WG._test.state;
  const sv = WG._test.save();
  sv.usedMs = 180000;
  st.phase = 'round';
  WG._test.startRound();
  assert.strictEqual(st.phase, 'finish', '超过 3 分钟还在开新轮');
});

ok('累计积分不清零、等级随总分升级', () => {
  const lv0 = WG.levelOf(0), lv1 = WG.levelOf(500), lv2 = WG.levelOf(9999);
  assert(lv0.name && lv1.name && lv2.name);
  assert.notStrictEqual(lv0.name, lv2.name);
  assert.strictEqual(lv2.name, '银河词王');
  assert(lv1.next > 0, '中间等级要有下一级目标');
});

ok('存档跨天只清当天额度，累计积分保留', () => {
  assert(/d\.day !== todayStr\(\)/.test(game), '缺跨天处理');
  assert(/S\.usedMs = 0/.test(game) && /S\.todayScore = 0/.test(game));
  assert(!/S\.total = 0/.test(game), '累计总积分不许清零');
});

console.log('\n全部通过，共 ' + pass.length + ' 项。');
