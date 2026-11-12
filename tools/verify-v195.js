/* ===========================================================================
 * v195 校验：星际基地 · 全班实时积分榜 · 更快出分 · Azure AI 合分
 *   node tools/verify-v195.js
 *
 * 家长 2026-11-12 的四条：
 *   ① 游戏多来点「基地」这样有趣的话；
 *   ② 每个学生积分透明、能排名，跟打卡同步一样每台手机看同一份实时数据；
 *   ③ 「网络有些慢 / 正在上传 / 最多等待 10 秒」这类话不要再出现；
 *   ④ 核对查分时间更短；微软 Azure 能不能做 AI 合分。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const read = f => fs.readFileSync(path.join(PUB, f), 'utf8');
const worker = fs.readFileSync(path.join(ROOT, 'worker', 'src', 'index.js'), 'utf8');
const pass = [];
function ok(name, fn) {
  fn();
  pass.push(name);
  console.log('  ✓ ' + name);
}
async function okAsync(name, fn) {
  await fn();
  pass.push(name);
  console.log('  ✓ ' + name);
}

const html = read('index.html');
const app = read('app.js');
const api = read('api.js');
const game = read('game.js');
const sw = read('sw.js');
const appCode = app.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

console.log('v195 · 基地 / 实时榜 / 快出分 / AI 合分校验');

async function main() {
// ---------------------------------------------------------------- 版本钉子
ok('版本钉子一致（meta / 7 处 ?v= / SW / game.js 预缓存）', () => {
  assert(/<meta name="app-version" content="202">/.test(html), 'index.html meta 没升');
  const vs = html.match(/<script defer src="[^"]+\?v=(\d+)"/g) || [];
  assert.strictEqual(vs.length, 7, '脚本引用应是 7 处，实际 ' + vs.length);
  vs.forEach(s => assert(/\?v=202"/.test(s), '还有旧版本：' + s));
  assert(/var CACHE_NAME = 'amy-english-v202'/.test(sw), 'SW CACHE_NAME 没升');
  assert(/var V = 202;/.test(sw), 'SW V 没升');
  assert(/\.\/game\.js\?v=' \+ V/.test(sw), 'SW 没预缓存 game.js');
  const gi = html.indexOf('src="game.js?v=202"');
  const ai = html.indexOf('src="app.js?v=202"');
  assert(gi > 0 && ai > gi, 'game.js 必须排在 app.js 之前');
});

// ------------------------------------------------------------ 无用提示清零
ok('面向孩子的「网络慢 / 上传中 / 最多等 10 秒」全部删干净', () => {
  ['核对中，最多 10 秒', '网络有点慢，还在核对', '网络一直没核对上',
   '这次没核对上（网络不稳）', '请检查网络后重试', '正在重新连接，稍等几秒',
   '正在上传', '最多等待 10 秒'].forEach(s => {
    assert(appCode.indexOf(s) < 0, '还留着没用的提示：' + s);
  });
  assert(/出分中…/.test(appCode), '出分中的极简状态不见了');
  assert(/这句先通过啦/.test(appCode) || /这句先通过，录音/.test(appCode),
    '兜底文案没改成结果导向');
});

ok('核对查分链路整体变短（预算 4s / 硬墙 7s / 单趟 6s / 看门狗 5.5s）', () => {
  assert(/ASR_BUDGET_MS:\s*4000/.test(api), '总预算没压到 4 秒');
  assert(/ASR_HARD_CAP_MS:\s*7000/.test(api), '硬墙没压到 7 秒');
  assert(/TRANSCRIBE_TIMEOUT:\s*6000/.test(api), '单趟超时没压到 6 秒');
  assert(/HOLD_MAX_MS:\s*9000/.test(app), '录音上限没压到 9 秒');
  assert(/\},\s*5500\)/.test(app), '出分看门狗不是 5.5 秒');
});

// -------------------------------------------------------------- Azure AI 合分
ok('worker 接入 Azure 语音 AI 与边缘 AI 合分，且失败可回落', () => {
  assert(/gameScoresApi/.test(worker), '积分榜接口没接');
  assert(/azureTranscribe/.test(worker), '没有 Azure 识别通道');
  assert(/aiCombineScore/.test(worker), '没有 AI 合分');
  assert(/aiScore:\s*ai\s*\?/.test(worker), '合分结果没随转写一起返回');
  assert(/azure-stt/.test(worker), 'Azure 通道标记缺失');
  assert(/AZURE_ASR_TIMEOUT_MS/.test(worker), 'Azure 没设超时');
  assert(/return cfP;\s*\/\/ Azure 空手/.test(worker),
    'Azure 失败必须静默落回 Cloudflare，不能让孩子卡住');
  assert(/runBackup\(\)/.test(worker), '兜底没有并行抢跑');
  assert(/aiBy:\s*ai\s*\?/.test(worker), '合分来源没标注');
});

ok('AI 合分真的会算分：读全对比漏读高，空文本 0 分', () => {
  // 把 worker 源码变成可在 vm 里加载的普通脚本，直接测真实函数，
  // 不在校验脚本里另写一份「看起来一样」的实现。
  const src = worker
    .replace(/^import .*$/m, 'const TTS_STATIC = {};')
    .replace(/^export default \{/m, 'const __app = {')
    + '\n;globalThis.__AI = aiCombineScore; globalThis.__ROUTES = __app;';
  const box = { console, Date, Math, JSON, Promise, setTimeout, clearTimeout,
                AbortController: function () { this.signal = {}; this.abort = () => {}; },
                btoa: s => Buffer.from(s, 'binary').toString('base64'),
                fetch: () => Promise.reject(new Error('offline')) };
  vm.createContext(box);
  vm.runInContext(src, box, { filename: 'worker-index.js' });
  const AI = box.__AI;
  assert.strictEqual(typeof AI, 'function', '拿不到真实的合分函数');
  const target = 'the large desert is close to the park';
  const full = AI(target, target, null, 0.9);
  const half = AI(target, 'the large desert', null, 0.9);
  const none = AI(target, '', null, 0);
  assert(full.score >= 85, '读全了却没给高分：' + full.score);
  assert(full.score > half.score + 20, '漏读没明显扣分：' + full.score + ' / ' + half.score);
  assert.strictEqual(none.score, 0, '没声音不该给分');
  assert.strictEqual(full.total, 8, '目标词数算错了');
  assert.strictEqual(full.hit, 8, '命中词数算错了');
  // Azure 的词级置信度也要参与合分
  const words = target.split(' ').map(w => ({ Word: w, Confidence: 1 }));
  const hi = AI(target, target, words, 0);
  const lo = AI(target, target,
    target.split(' ').map(w => ({ Word: w, Confidence: 0.1 })), 0);
  assert(hi.score > lo.score, '词级置信度没进合分');
  assert.strictEqual(AI(target, target, words, 0).by, 'edge-ai');
});

ok('前端把 AI 合分随识别结果透传，不多打一趟网络', () => {
  assert(/aiScore:\s*\(typeof data\.aiScore/.test(api), 'api.js 没透传 aiScore');
  assert(/lastAiScore/.test(api), '没记合分快照');
  assert(/out\.aiScore\s*=\s*res\.aiScore/.test(app), '判分层没拿到合分');
});

// ------------------------------------------------------------ 云端积分榜接口
ok('D1 积分榜：上报做加法、读榜按总分排序、今日分按后台的钟', () => {
  assert(/CREATE TABLE IF NOT EXISTS game_scores/.test(worker), '没建表');
  assert(/\/api\/game-scores\/report/.test(worker), '缺上报路由');
  assert(/\/api\/game-scores'\)/.test(worker), '缺读榜路由');
  assert(/url\.pathname\.startsWith\('\/api\/game-scores'\)/.test(worker), '主入口没注册');
  assert(/ON CONFLICT\(student_id\) DO UPDATE/.test(worker), '重复上报会覆盖而不是累加');
  assert(/total\s*=\s*game_scores\.total \+ excluded\.total/.test(worker), '总分没做加法');
  assert(/ORDER BY total DESC/.test(worker), '榜单没按分数排序');
  assert(/serverBeijingDay/.test(worker), '今日分没用后台日期');
  assert(/row\.day === serverDay/.test(worker), '跨天的今日分没归零');
  assert(!/student_phone/.test(worker.slice(worker.indexOf('async function gameScoresApi'),
    worker.indexOf('// ---------------------------------------------------------------------------\n// /api/wrong-questions'))),
    '读榜不该返回手机号');
});

ok('api.js 提供上报/读榜，且断网返回 null 而不是空榜', () => {
  assert(/async reportGameScore\(body\)/.test(api), '缺上报方法');
  // v199：读榜改成 POST 带全班名册，方法签名多了一个 payload。
  assert(/async fetchGameScores\(payload\)/.test(api), '缺读榜方法');
  // v199：读榜改 POST + 超时兜底 + 老接口回退，方法体比 v195 长，
  // 窗口放宽到能同时看到主请求和回退请求。
  assert(/cache: 'no-store'/.test(api.slice(api.indexOf('async fetchGameScores'),
    api.indexOf('async fetchGameScores') + 1400)), '读榜必须绕过缓存');
  assert(/keepalive: true/.test(api.slice(api.indexOf('async reportGameScore'),
    api.indexOf('async reportGameScore') + 900)), '上报要用 keepalive');
});

// ---------------------------------------------------------- 游戏：基地与榜单
const mem = {};
const localStorage = {
  getItem: k => (mem[k] === undefined ? null : mem[k]),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; }
};
const dict = {};
('apple river cloud pencil market window planet ticket desert camel sand storm ' +
 'oasis travel happy bright little school teacher friend family water flower').split(' ')
  .forEach((w, i) => { dict[w] = '意思' + (i + 1) + '|ˈtest'; });
const phrases = [
  ['large desert', '大沙漠'], ['be close to', '靠近…'], ['is close to', '靠近…'],
  ['go swimming', '去游泳'], ['look after', '照顾'], ['in the park', '在公园里'],
  ['many people', '许多人'], ['like swimming', '喜欢游泳'], ['get up early', '早起']
];
const hd = [];
for (let d = 0; d < 7; d++) {
  hd.push({
    day_cn: '周' + d,
    modules: d === 2 ? [
      { type: 'vocab', words: [{ word: 'desert', meaning: '沙漠', emoji: '🏜️' }] },
      { type: 'questions', questions: [{ question: 'the large desert is close to the park',
        options: ['desert', 'river', 'cloud'] }] }
    ] : []
  });
}

const boardRows = [
  { student_id: 's1', student_name: 'Yunus', student_class: '四年级',
    total: 880, best: 190, rounds: 12, today_score: 120, updated_at: '' },
  { student_id: 's2', student_name: 'Gary', student_class: '四年级',
    total: 640, best: 170, rounds: 10, today_score: 80, updated_at: '' },
  { student_id: 's3', student_name: 'Amy', student_class: '四年级',
    total: 120, best: 90, rounds: 4, today_score: 30, updated_at: '' }
];
let online = true;
const reported = [];
let teacherMode = false;
const ApiStub = {
  dictLocal: w => (dict[w] ? { word: w, zh: '意思' } : null),
  reportGameScore: b => { reported.push(b); return Promise.resolve(online); },
  fetchGameScores: () => online
    ? Promise.resolve({ rows: boardRows, server_day: '2026-11-12', server_time: 'now' })
    : Promise.resolve(null)
};
const AppStub = {
  isTeacher: () => teacherMode,
  getTodayWeekdayIdx: () => 2,
  _myStudentId: () => 's2',
  _myWho: () => ({ name: 'Gary', klass: '四年级' }),
  _weekTag: () => '_w3',
  switchTab: () => {},
  state: {
    phone: '13800000000',
    answers: { 's2_w3_d2_m1_q0': { correct: false, value: 'the large desert' } },
    checkins: { 's2_w3_d2': { done: true, wrongCount: 5 } }
  }
};
const sandbox = {
  console, Date, Math, JSON, Promise, setTimeout, clearTimeout,
  setInterval: () => 1, clearInterval: () => {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    createElement: () => ({ className: '', innerHTML: '', appendChild: () => {} }),
    visibilityState: 'visible'
  },
  localStorage
};
sandbox.window = {
  localStorage,
  addEventListener: () => {},
  App: AppStub,
  Api: ApiStub,
  HOMEWORK_DATA: hd,
  WordHelp: { PHRASES: phrases },
  LOCAL_DICT: dict
};
vm.createContext(sandbox);
vm.runInContext(game, sandbox, { filename: 'game.js' });
const WG = sandbox.window.WordGame;
assert(WG, 'WordGame 没挂到 window');

ok('时长规则没被改坏：0 道 3:00、5 道 2:00、12 道以上 0:45', () => {
  assert.strictEqual(WG.rule(0), 180);
  assert.strictEqual(WG.rule(5), 120);
  assert.strictEqual(WG.rule(12), 45);
  assert.strictEqual(WG.rule(50), 45);
  let prev = 181;
  for (let w = 0; w <= 40; w++) {
    const s = WG.rule(w);
    assert(s <= prev && s <= 180 && s >= 45, '时长曲线被改坏了 w=' + w);
    prev = s;
  }
});

ok('基地主题：6 级建筑 + 40 句以上播报，升级真的会变', () => {
  const counts = {
    BASES: (game.match(/\{ min: \d+, +name: '/g) || []).length,
    START: (game.slice(game.indexOf('var START_CALLS'), game.indexOf('var CHEERS'))
      .match(/^\s*'/gm) || []).length,
    CHEERS: (game.slice(game.indexOf('var CHEERS'), game.indexOf('var COMBO_CALLS'))
      .match(/^\s*'/gm) || []).length,
    LINES: (game.slice(game.indexOf('var BASE_LINES'), game.indexOf('var MILESTONES'))
      .match(/^\s*'/gm) || []).length
  };
  assert(counts.BASES >= 6, '基地等级太少：' + counts.BASES);
  assert(counts.START >= 8, '出发播报太少：' + counts.START);
  assert(counts.CHEERS >= 8, '返航播报太少：' + counts.CHEERS);
  assert(counts.LINES >= 8, '基地播报太少：' + counts.LINES);
  assert(/var COMBO_CALLS/.test(game) && /var MILESTONES/.test(game), '缺连击/里程碑话术');
  assert.notStrictEqual(WG.baseOf(0).name, WG.baseOf(2000).name, '基地没升级');
  assert(WG._test.baseCardHtml().indexOf('我的星际基地') > 0, '基地卡没渲染');
  assert(game.indexOf('星际基地') > 0 && html.indexOf('wg-base-card') > 0, '主题/样式没落地');
});

ok('CSS 新样式齐备、仍不碰 :has() / 100dvh', () => {
  ['.wg-rank-strip', '.wg-board-row', '.wg-board-me', '.wg-base-card',
   '.wg-base-ic', '.wg-call', '.wg-cheer'].forEach(c =>
    assert(html.indexOf(c) > 0, '缺样式 ' + c));
  const block = html.slice(html.indexOf('v195 · 星际基地 + 全班实时积分榜'),
                           html.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert(!/:has\(/.test(block), '新样式不许用 :has()');
  assert(!/100dvh/.test(block), '新样式不许单写 100dvh');
});

ok('game.js 仍是纯 ES5（华为 / 平板自带浏览器）', () => {
  assert(!/=>/.test(game), '出现箭头函数');
  assert(!/`/.test(game), '出现模板字符串');
  const bare = game.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  assert(!/\bconst\b|\blet\b/.test(bare), '出现 const/let');
  assert(!/\?\./.test(bare), '出现可选链');
});

await okAsync('云端实时榜：能看到同学分数、自己那一行高亮、名次正确', () => {
  assert.strictEqual(typeof WG.pullScores, 'function', '没拉榜');
  assert.strictEqual(typeof WG.myRank, 'function', '没名次');
  WG.pullScores();
  return new Promise(resolve => setTimeout(resolve, 40)).then(() => {
    assert.strictEqual(WG.board().rows.length, 3, '没拉到全班数据');
    assert.strictEqual(WG.myRank().rank, 2, 'Gary 应该第 2 名');
    const out = WG.render();
    assert(out.indexOf('Yunus') > 0, '看不到别的同学的积分');
    assert(out.indexOf('wg-board-me') > 0, '自己那行没高亮');
    // v199：家长明确要求「所有手机同步」这类内部逻辑不要显示在界面上。
    assert(out.indexOf('所有手机同步') < 0, '还在显示内部同步话术');
    assert(out.indexOf('全班实时') > 0, '没写明实时');
    assert(WG._test.boardHtml().indexOf('🥇') > 0, '榜首没奖牌');
  });
});

await okAsync('每轮结算立刻上报「增量」，断网排队不丢分，老师试玩不进榜', () => {
  const st = WG._test.state;
  reported.length = 0;
  online = true;
  WG._test.reset();
  const sv = WG._test.save();          // reset 换了新的存档对象，必须重新取
  st.phase = 'lobby'; st.html = ''; st.info = null;
  WG._test.startRound();
  st.score = 100; st.correct = 5; st.maxCombo = 4; st.starHit = 1;
  WG._test.endRound('time');
  assert.strictEqual(sv.total, 127, '本轮分算错了');
  return new Promise(r => setTimeout(r, 40)).then(() => {
    assert.strictEqual(reported.length, 1, '结算没上报');
    assert.strictEqual(reported[0].delta, 127, '上报的必须是本轮增量，不是本机总分');
    assert.strictEqual(reported[0].rounds, 1, '轮数没报');
    assert.strictEqual(reported[0].student_id, 's2', '学生 id 不对');
    assert.strictEqual(JSON.parse(mem['amy_wordgame_sync_v1']).length, 0,
      '上报成功后队列没清空（会重复计分）');

    // 断网：分数留在队列里，不丢也不假装成功
    online = false;
    WG._test.startRound();
    st.score = 50; st.correct = 2; st.maxCombo = 2; st.starHit = 0;
    WG._test.endRound('time');
    return new Promise(r => setTimeout(r, 40));
  }).then(() => {
    assert(JSON.parse(mem['amy_wordgame_sync_v1']).length > 0,
      '断网时分数没进待发队列');
    // 老师试玩：不占全班名次，也不能把队列塞进排行榜
    teacherMode = true;
    st.info = null;
    const before = JSON.parse(mem['amy_wordgame_sync_v1']).length;
    WG._test.startRound();
    st.score = 30; st.correct = 1; st.maxCombo = 1; st.starHit = 0;
    WG._test.endRound('time');
    assert.strictEqual(JSON.parse(mem['amy_wordgame_sync_v1']).length, before,
      '老师试玩不该进排行榜');
    teacherMode = false;
    online = true;
  });
});

ok('同步节奏：进页面 / 每 10 秒 / 回前台 / 离场都自动补', () => {
  assert(/startBoardSync\(\)/.test(game), 'mount 没启动同步');
  // v199：家长要「实时更新」，15 秒缩到 10 秒。
  assert(/,\s*10000\)/.test(game), '不是 10 秒一同步');
  assert(/visibilitychange/.test(game), '回前台没补同步');
  assert(/pagehide/.test(game), '离场没补发');
  assert(/G\.phase !== 'playing'/.test(game), '答题时不能重画打断连击');
});

} // end main

main().then(() => {
  console.log('\n全部通过，共 ' + pass.length + ' 项。');
}).catch(e => {
  console.error('\n✗ v195 校验失败：', (e && e.message) || e);
  process.exit(1);
});
