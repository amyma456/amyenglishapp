/* ===========================================================================
 * v197 校验：全班每人一行（玩没玩都出现）+ 清掉内部逻辑文案
 *   node tools/verify-v197.js
 *
 * 家长 2026-11-12：「游戏上目前还是看不到其他小朋友的数据，无论他玩没玩，
 *   多少分，不要因为他没有今天玩游戏就不出现，而是玩没玩都出现。实时更新。
 *   不要在右上角显示所有手机同步，这句话属于内部逻辑，不要显示。」
 *
 * 用 vm 真加载 game.js：造一个 15 人的班，只有 3 人玩过，检查渲染出来的
 * 排行榜是不是 15 行都在、0 分有没有、名次分母对不对、有没有偷偷截断。
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

const html = read('index.html');
const game = read('game.js');
const apiSrc = read('api.js');
const appSrc = read('app.js');
const sw = read('sw.js');
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

console.log('v197 · 玩没玩都在榜 / 全员名单 / 不显示内部话术 校验');

// -------------------------------------------------------------- 模拟环境
/** 造 n 个同班学生，前 3 个玩过（有分），其余全是从没玩过的 0 分。 */
function makeEnv(n) {
  n = n || 15;
  const students = [];
  for (let i = 1; i <= n; i++) {
    students.push({
      id: 's' + i, name: 'Kid' + i, phone: '138000000' + (i < 10 ? '0' + i : i),
      class: '四年级', approved: true
    });
  }
  // 没分班的测试号不许混进榜
  students.push({ id: 'test0', name: '测试号', phone: '139', class: '', approved: false });

  const rows = students.filter(s => s.id !== 'test0').map(function (s, i) {
    const played = i < 3;
    return {
      student_id: s.id, student_name: s.name, student_class: '四年级',
      total: played ? (300 - i * 100) : 0,
      best: played ? 120 : 0,
      rounds: played ? 4 : 0,
      today_score: played ? 40 : 0,
      updated_at: played ? '2026-11-12T00:00:00Z' : '',
      played: played
    };
  });
  rows.sort((a, b) => b.total - a.total);

  const calls = [];
  const Api = {
    reportGameScore: function () { return Promise.resolve(true); },
    fetchGameScores: function (payload) {
      calls.push(payload);
      return Promise.resolve({
        rows: rows, server_day: '2026-11-12', server_time: 'now',
        roster_count: payload && payload.students ? payload.students.length : 0
      });
    }
  };
  const App = {
    isTeacher: function () { return false; },
    _myStudentId: function () { return 's2'; },
    _myWho: function () { return { name: 'Kid2', klass: '四年级' }; },
    _weekTag: function () { return 'w7'; },
    getTodayWeekdayIdx: function () { return 3; },
    state: { phone: '13800000002', answers: {}, checkins: {}, students: students },
    switchTab: function () {}
  };
  const doc = {
    addEventListener: function () {},
    getElementById: function () { return null; },
    visibilityState: 'visible'
  };
  const store = {};
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
  const ctx = vm.createContext({
    window: win, document: doc, localStorage: win.localStorage,
    App: App, Api: Api, WordHelp: { PHRASES: [] }, console: console,
    setTimeout: function (fn, ms) { return setTimeout(fn, 0); },
    clearTimeout: clearTimeout,
    setInterval: function () { return 0; }, clearInterval: function () {},
    Date: Date, Math: Math, JSON: JSON, navigator: {}, Blob: function () {}
  });
  vm.runInContext(game, ctx);
  return { WG: win.WordGame, App: App, Api: Api, calls: calls, rows: rows, n: n };
}

const INTERNAL = ['所有手机同步', '每台手机', '存在后台', '送到后台',
                  '同一份', '同学手机上也能看到', '来自后台'];
function assertNoInternal(out, label) {
  INTERNAL.forEach(function (w) {
    assert(out.indexOf(w) < 0, label + ' 还在显示内部话术：' + w);
  });
}

// -------------------------------------------------------------- 版本钉子
ok('版本钉子一致（meta / 7 处 ?v= / SW / game.js 预缓存）', () => {
  assert(/<meta name="app-version" content="198">/.test(html), 'index.html meta 没升');
  const vs = html.match(/<script defer src="[^"]+\?v=(\d+)"/g) || [];
  assert.strictEqual(vs.length, 7, '脚本引用应是 7 处，实际 ' + vs.length);
  vs.forEach(s => assert(/\?v=198"/.test(s), '还有旧版本：' + s));
  assert(/var CACHE_NAME = 'amy-english-v198'/.test(sw), 'SW CACHE_NAME 没升');
  assert(/var V = 198;/.test(sw), 'SW V 没升');
  assert(/\.\/game\.js\?v=' \+ V/.test(sw), 'SW 没预缓存 game.js');
});

// -------------------------------------------------------------- 后端
ok('后端新建云端名册 game_roster，读榜会把没玩过的人补成 0 分', () => {
  assert(/CREATE TABLE IF NOT EXISTS game_roster/.test(worker), '没有云端名册表');
  assert(/student_id\s+TEXT PRIMARY KEY/.test(worker), '名册表结构不对');
  assert(/async function buildBoardRows/.test(worker), '没有组榜函数');
  assert(/LEFT JOIN game_scores/.test(worker), '没把积分挂到名册上');
  assert(/COALESCE\(g\.total, 0\)/.test(worker), '没玩过的没补 0 分');
  assert(/NOT EXISTS \(SELECT 1 FROM game_roster/.test(worker), '历史积分行没兜底');
});

ok('POST /api/game-scores/board 收名册并整班返回；GET 旧接口也走完整榜', () => {
  assert(/path === '\/api\/game-scores\/board'/.test(worker), '没有 board 接口');
  assert(/ON CONFLICT\(student_id\) DO UPDATE SET/.test(worker), '名册没做 upsert');
  assert(/UPDATE game_roster SET active = 0/.test(worker), '老师端没做整班覆盖');
  assert(/body\.authoritative/.test(worker), '没区分老师端/孩子端');
  // GET 分支必须也用 buildBoardRows，否则没刷新的旧手机还是看不到没玩的同学
  const getAt = worker.indexOf("path === '/api/game-scores' && request.method === 'GET'");
  assert(getAt > 0, 'GET 旧接口不见了');
  assert(worker.slice(getAt, getAt + 500).indexOf('buildBoardRows') > 0,
    'GET 还在只读 game_scores');
});

ok('前端读榜走 board 接口并把本班名册交上去，POST 挂了还能退回 GET', () => {
  const at = apiSrc.indexOf('async fetchGameScores(');
  assert(at > 0, 'fetchGameScores 不见了');
  const body = apiSrc.slice(at, at + 1400);
  assert(/POST/.test(body) && /\/api\/game-scores\/board/.test(body), '没走 board 接口');
  assert(/roster: payload\.students/.test(body), '没带名册');
  assert(/class: payload\.klass/.test(body), '没带班级');
  assert(/authoritative: !!payload\.authoritative/.test(body), '没带老师端标记');
  assert(/\/api\/game-scores'\)/.test(body), '没有老接口兜底');
});

// -------------------------------------------------------------- 前端真跑
ok('本班名册只收分过班的学生，测试号不进榜', () => {
  const e = makeEnv(15);
  const r = e.WG._test.classRoster();
  assert.strictEqual(r.klass, '四年级', '班级没取到');
  assert.strictEqual(r.students.length, 15, '名册人数不对：' + r.students.length);
  assert(r.students.every(s => s.class === '四年级'), '混进了别班/未分班的');
  assert(!r.students.some(s => s.id === 'test0'), '测试号混进榜了');
  assert.strictEqual(r.authoritative, false, '孩子端不该做整班覆盖');
});

ok('右上角「所有手机同步」和所有后台/同步话术都不再显示', () => {
  const e = makeEnv(15);
  const hall = e.WG._test.hallHtml();
  assertNoInternal(hall, '大厅');
  assert(hall.indexOf('wg-rank-strip') > 0, '名次条不见了');
  assert(hall.indexOf('📡 所有手机同步') < 0, '右上角还挂着内部话术');
  // 基地播报那句也不能再说「共用一个后台」
  assert(game.indexOf('全班共用一个后台') < 0, '基地播报里还有内部话术');
  assert(game.indexOf('分数已送到后台') < 0, '结算页还有内部话术');
  assert(appSrc.indexOf('换一台手机登录看到的也是同一份') < 0, '打卡页还有内部话术');
});

ok('刷新间隔收紧到 10 秒，且仍在切回前台时补拉', () => {
  assert(/}, 10000\);\s*\/\/ v197/.test(game), '定时刷新不是 10 秒');
  assert(/visibilitychange/.test(game), '切回前台没补拉');
});

ok('v197 样式给长榜加了可滚动窗口，老浏览器选择器没退化', () => {
  const at = html.indexOf('v197 · 全班每人一行');
  assert(at > 0, 'v197 样式块不见了');
  const block = html.slice(at, html.indexOf('</style>'));
  assert(/\.wg-board-scroll\{/.test(block), '没有滚动容器');
  assert(/\.wg-board-row\.wg-board-idle\{/.test(block), '0 分行没有视觉区分');
  assert(block.indexOf(':has(') < 0, '新样式用了老浏览器不认的选择器');
  assert(block.indexOf('100dvh') < 0, '新样式单写了 100dvh');
});

(async function () {
  await okAsync('拉榜时确实把全班名册交给了后台', async () => {
    const e = makeEnv(15);
    e.WG.pullScores();
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(e.calls.length, 1, '没拉榜');
    assert.strictEqual(e.calls[0].students.length, 15, '没把全班名单带上去');
    assert.strictEqual(e.WG.board().rows.length, 15, '后台返回的行数不对');
  });

  await okAsync('15 人全班一行不少：3 个玩过 + 12 个没玩过全在榜上', async () => {
    const e = makeEnv(15);
    e.WG.pullScores();
    await new Promise(r => setTimeout(r, 30));
    const out = e.WG._test.boardHtml();
    const rowCount = (out.match(/wg-board-row/g) || []).length;
    assert.strictEqual(rowCount, 15, '榜单被截断了，实际只有 ' + rowCount + ' 行');
    assert(out.indexOf('wg-board-scroll') > 0, '长榜没有滚动容器');
    assert(out.indexOf('Kid4') > 0 && out.indexOf('Kid15') > 0,
      '从没玩过的同学没有出现');
    assert((out.match(/wg-board-idle/g) || []).length >= 12,
      '没玩过的 0 分行没标出来');
    assert(/\<b\>0\<\/b\> 分/.test(out), '没玩过的不显示 0 分');
    assertNoInternal(out, '排行榜');
  });

  await okAsync('名次分母是全班人数（含 0 分同学），自己那行照旧高亮', async () => {
    const e = makeEnv(5);
    e.WG.pullScores();
    await new Promise(r => setTimeout(r, 30));
    const rk = e.WG.myRank();
    assert.strictEqual(rk.total, 5, '名次分母漏掉了没玩的同学');
    assert.strictEqual(rk.rank, 2, 'Kid2 应该第 2 名');
    const out = e.WG._test.boardHtml();
    assert(out.indexOf('wg-board-me') > 0, '自己那行没高亮');
    assert(out.indexOf('共 <b>5</b> 人') > 0 || out.indexOf('共 5 人') > 0,
      '页脚没写全班人数');
  });

  console.log('\n全部通过，共 ' + pass.length + ' 项。');
})().catch(e => {
  console.error('\n✗ 校验失败：', e && e.message || e);
  process.exit(1);
});
