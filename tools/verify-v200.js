/* ===========================================================================
 * v200 校验：游戏榜去重 / 0 分不占前三 / 打卡记录进游戏页 / 手机刷新拿新版
 *   node tools/verify-v200.js
 *
 * 家长 2026-11-12：
 *  「老师刚刚看到学生游戏页面有 14 个学生，比如说像 YOK 这个学生出现了两次。
 *    不对呀，有些学生置顶一二三名，但是他的分数仍然显示是零分，还是没有通过」
 *  「老师手机端页面仍然还没有更新，点到游戏界面时候一刷新，它还是会弹到
 *    周计划里头。并且游戏界面里没有学生的打卡的记录，和老师端的电脑上的
 *    不太一样，还没完全同步下来。」
 *
 * 这里真跑：① 从 worker 源码里抽出 buildBoardRows，喂线上那份 14 行名册，
 * 看是不是合并成 9 人、分数有没有丢；② 真加载 game.js，调 boardHtml /
 * todayInfo / checkinCardHtml；③ 真触发 sw.js 的 fetch handler 看导航是不是
 * 网络优先。不是只 grep 代码文本。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');
const gameSrc = fs.readFileSync(path.join(PUB, 'game.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(PUB, 'app.js'), 'utf8');
const worker = fs.readFileSync(path.join(ROOT, 'worker/src/index.js'), 'utf8');

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };

console.log('v200 · 榜上不重复 / 0 分不占名次 / 打卡记录 / 手机刷新 校验');

// ---------------------------------------------------------------- 线上原始名册
// 2026-11-12 从 GET /api/game-scores 拉到的真实 14 行：9 个孩子，其中
// jerry / Harvey / Matt / Gina / York 各留了两个注册编号。
const REAL = [
  ['哈俊武-jerry', 's1791896085117'], ['哈俊武-jerry', 's1791896146105'],
  ['张子皓-Harvey', 's1791931729388'], ['张子皓-Harvey', 's1792214883060'],
  ['张梓杨-Gary', 's1792850539588'], ['张梓苏-Sean', 's1791897541112'],
  ['田墨翰-Matt', 's1792308688122'], ['田墨翰-Matt', 's1791894975779'],
  ['薛懿格-Gina', 's1791895587995'], ['薛懿格-Gina', 's1791895720579'],
  ['陈皓正-Yunus', 's1789703358736'], ['马英凯-Steven', 's1791904742493'],
  ['黄耀-York', 's1791895377291'], ['黄耀-York', 's1792559812193'],
];
const KLASS = '少儿英语A班';
function rawRows(withScore) {
  return REAL.map(function (r, i) {
    // York 的两个账号各攒了分；jerry 只有一个账号有分 —— 合并后一分不丢。
    let total = 0;
    if (withScore && r[0].indexOf('York') >= 0) total = (i === 12 ? 120 : 80);
    if (withScore && i === 0) total = 60;
    return {
      student_id: r[1], student_name: r[0], student_class: KLASS,
      total: total, best: total, rounds: total ? 3 : 0,
      today_score: total, day: '2026-11-12',
      updated_at: total ? '2026-11-12T10:00:00Z' : '', active: 1,
    };
  });
}

// ------------------------------------------------- 真跑后端 buildBoardRows
const wStart = worker.indexOf('function boardNameKey(name)');
const wEnd = worker.indexOf('function serverBeijingDay(');
assert(wStart > 0 && wEnd > wStart, 'worker 里找不到 buildBoardRows');
const boardApi = new Function('ensureGameScoresTable',
  worker.slice(wStart, wEnd) +
  '\nreturn { buildBoardRows: buildBoardRows, boardNameKey: boardNameKey };'
)(async function () {});

function fakeDb(rows) {
  return {
    prepare: function (sql) {
      const isRoster = sql.indexOf('FROM game_roster') >= 0;
      return {
        all: async function () { return { results: isRoster ? rows : [] }; },
        bind: function () { return this; },
        run: async function () { return {}; },
      };
    },
  };
}

// ------------------------------------------------------- 真跑前端 game.js
const rootEl = { innerHTML: '', style: {} };
const mem = Object.create(null);
const ls = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const cloudCk = Object.create(null);
let pulled = 0, pulledScope = '', pullResult = 0;
const App = {
  isTeacher: () => true,
  state: {
    students: REAL.map(r => ({ id: r[1], name: r[0], class: KLASS })),
    classes: [KLASS], className: KLASS, phone: 'teacher', userName: '老师',
    answers: {}, checkins: {}, cloudCheckins: cloudCk,
  },
  getTodayWeekdayIdx: () => 3,
  _weekTag: () => '',
  _myStudentId: () => 'teacher',
  _myWho: () => ({ name: '老师', klass: KLASS }),
  _clsCk: (sid, di) => cloudCk[sid + '_d' + di] || null,
  _pullCloudCheckins: scope => { pulled++; pulledScope = scope; return Promise.resolve(pullResult); },
  _ckPullAt: Date.now(),
};
const win = {
  App: App, Api: null, localStorage: ls,
  document: {
    getElementById: id => (id === 'wg-root' ? rootEl : null),
    addEventListener: () => {}, visibilityState: 'visible',
  },
  addEventListener: () => {}, removeEventListener: () => {},
};
const WordGame = new Function(
  'window', 'document', 'localStorage', 'setInterval', 'clearInterval',
  'setTimeout', 'clearTimeout',
  gameSrc + '\nreturn window.WordGame;'
)(win, win.document, ls, () => 0, () => {}, () => 0, () => {});
assert(WordGame && WordGame._test, 'game.js 没挂出 WordGame');

function setBoard(rows) {
  WordGame.board().rows = WordGame._test.normalizeBoardRows(rows);
  WordGame.board().at = Date.now();
}

// ------------------------------------------------------------------ 源码约束
ok('版本钉子统一到 v202', () => {
  assert(/name="app-version" content="204"/.test(html));
  assert.strictEqual((html.match(/\?v=204/g) || []).length, 7, '首页 7 处脚本引用');
  assert(/var CACHE_NAME = 'amy-english-v204';/.test(swSrc) && /var V = 204;/.test(swSrc));
  assert(/^<meta name="app-version" content="204">/m.test(html));
});
ok('游戏页 tab 仍在刷新恢复白名单里（v198 的修复没被覆盖）', () => {
  const rt = appSrc.slice(appSrc.indexOf('  _restoreTab() {'), appSrc.indexOf('  showApp() {'));
  assert(/\['wordgame', 'weekly'/.test(rt), '老师白名单丢了 wordgame');
  assert(/\['wordgame', 'today'/.test(rt), '学生白名单丢了 wordgame');
});
ok('版本探针发现落后会先清缓存再刷新，且同一版本只刷一次', () => {
  const probe = html.slice(html.indexOf('function __checkVersion()'),
    html.indexOf('document.addEventListener(\'visibilitychange\''));
  assert(/caches\.keys\(\)/.test(probe) && /caches\.delete\(n\)/.test(probe), '没清旧缓存');
  assert(/sessionStorage\.setItem\(key, '1'\)/.test(probe), '没有防重复刷新标记');
  assert(/setTimeout\(go, 1500\)/.test(probe), '清缓存卡住时没有兜底刷新');
  assert(/window\.__safeReload\(\)/.test(probe), '没有触发刷新');
});
ok('CSS 里有 0 分名次与打卡卡的样式（老浏览器可用的普通选择器）', () => {
  assert(/\.wg-rank-none\{/.test(html));
  assert(/\.wg-ck-scroll\{/.test(html) && /\.wg-ck-row\{/.test(html));
  assert(/v200 · 0 分不占前三名 \+ 今日打卡记录卡/.test(html));
});

// ------------------------------------------------------------- 后端合并真跑
(async function main() {
  let rows = await boardApi.buildBoardRows(fakeDb(rawRows(false)), KLASS, '2026-11-12');
  ok('后端：线上 14 行名册合并成 9 个孩子，一个名字只出现一次', () => {
    assert.strictEqual(rows.length, 9, '实际 ' + rows.length + ' 行');
    const names = rows.map(r => r.student_name);
    assert.strictEqual(new Set(names).size, 9, '还有重名行');
    assert.strictEqual(names.filter(n => n.indexOf('York') >= 0).length, 1, 'York 还是两行');
  });
  ok('后端：全班 9 人都还在榜上，没玩过的是 0 分 / played=false', () => {
    assert.strictEqual(rows.filter(r => r.total === 0 && r.played === false).length, 9);
    assert(/少儿英语A班/.test(rows.map(r => r.student_class).join(',')));
  });

  rows = await boardApi.buildBoardRows(fakeDb(rawRows(true)), KLASS, '2026-11-12');
  ok('后端：同一孩子几个账号的积分相加，一分不丢，且有分的排在最前', () => {
    const york = rows.filter(r => r.student_name.indexOf('York') >= 0)[0];
    assert.strictEqual(york.total, 200, 'York 两账号应是 120+80');
    assert.strictEqual(york.rounds, 6);
    assert.strictEqual(rows[0].student_name.indexOf('York') >= 0, true, '第一名不是 York');
    assert.strictEqual(rows[1].student_name.indexOf('jerry') >= 0, true, '第二名不是 jerry');
    assert.strictEqual(rows.length, 9);
  });

  // ------------------------------------------------------------ 前端合并真跑
  const merged = WordGame._test.normalizeBoardRows(rawRows(true));
  ok('前端：旧手机拿到 14 行原始榜也会合并成 9 行，同分不加错', () => {
    assert.strictEqual(merged.length, 9);
    assert.strictEqual(merged[0].total, 200);
    assert.strictEqual(merged.filter(r => r.student_name.indexOf('York') >= 0).length, 1);
  });

  setBoard(rawRows(false));
  let board = WordGame._test.boardHtml();
  ok('0 分全班：前三名不再挂奖牌，每一行都标「还没出击」', () => {
    assert(!/🥇|🥈|🥉/.test(board), '0 分还挂着奖牌');
    assert.strictEqual((board.match(/wg-rank-none/g) || []).length, 9);
    assert.strictEqual((board.match(/还没出击/g) || []).length, 9);
    assert(/wg-board-scroll/.test(board), '没有全量展开的榜单容器');
    assert(/9 位指挥官/.test(board), '人数没显示成 9');
  });

  setBoard(rawRows(true));
  board = WordGame._test.boardHtml();
  ok('有人得分：奖牌只给有分的前两名，0 分的 7 行排后面且不占名次', () => {
    assert(/🥇/.test(board) && /🥈/.test(board));
    assert(!/🥉/.test(board), '第三名是 0 分却给了铜牌');
    assert.strictEqual((board.match(/wg-rank-none/g) || []).length, 7);
    const gold = board.indexOf('🥇'), idle = board.indexOf('wg-rank-none');
    assert(gold > 0 && idle > gold, '0 分行排到有分行前面了');
    assert(/200<\/b> 分/.test(board), 'York 合并后的分数没显示');
  });

  // -------------------------------------------------- 自己 0 分不算第 1 名
  App.isTeacher = () => false;
  App._myStudentId = () => 's1791895377291';   // York 的主账号
  App._myWho = () => ({ name: '黄耀-York', klass: KLASS });
  setBoard(rawRows(false));
  ok('自己 0 分时不再被算成全班第 1 名', () => {
    const rk = WordGame.myRank();
    assert.strictEqual(rk.rank, 0, '0 分拿到了第 ' + rk.rank + ' 名');
    assert(rk.row && rk.row.student_name.indexOf('York') >= 0, '没找到自己那一行');
    assert(/wg-board-me/.test(WordGame._test.boardHtml()), '0 分自己的那行没高亮');
  });
  setBoard(rawRows(true));
  ok('自己有分时正常拿第 1 名并显示 200 分', () => {
    const rk = WordGame.myRank();
    assert.strictEqual(rk.rank, 1);
    assert.strictEqual(rk.row.total, 200);
  });
  App.isTeacher = () => true;
  App._myStudentId = () => 'teacher';
  App._myWho = () => ({ name: '老师', klass: KLASS });

  // ------------------------------------------------------------ 打卡记录卡
  cloudCk['s1791895377291_d3'] = { done: true, wrongCount: 2, time: '19:40', answered: 30, total: 30 };
  cloudCk['s1791896146105_d3'] = { done: true, wrongCount: 1, time: '19:50', answered: 30, total: 30 };
  cloudCk['s1792850539588_d3'] = { done: false, answered: 8, total: 30 };
  let ckHtml = WordGame._test.checkinCardHtml();
  ok('游戏页有「今日打卡记录」卡：同名只一行，全班 9 人一个不少', () => {
    assert(/📋 今日打卡记录/.test(ckHtml));
    assert.strictEqual((ckHtml.match(/wg-ck-row/g) || []).length, 9);
    assert(/今日已打卡 <b>2<\/b> \/ 9 人/.test(ckHtml), '打卡人数统计不对');
  });
  ok('融合状态栏读的是后台确认记录：重复账号的另一编号也能认到，状态与错题数一致', () => {
    assert(/错 <b>2<\/b> 道/.test(ckHtml), 'York 的错题数没显示');
    assert(/错 <b>1<\/b> 道/.test(ckHtml), 'jerry 第二个编号的打卡没认到');
    assert(/答了 8\/30 题/.test(ckHtml), '半截进度没显示');
    assert(/还没打卡/.test(ckHtml));
    // v202：分数和错题数在同一条状态栏里，不用再翻另一张卡
    assert(/wg-st-wrong/.test(ckHtml) && /wg-board-score/.test(ckHtml));
  });
  App.isTeacher = () => false;
  App._myStudentId = () => 's1791895377291';
  App._myWho = () => ({ name: '黄耀-York', klass: KLASS });
  ok('手机游戏页的时长判定改用云端打卡，不再误判「还没打卡」只给 30 秒', () => {
    const info = WordGame.todayInfo();
    assert.strictEqual(info.done, true, '云端已打卡却显示未打卡');
    assert.strictEqual(info.wrong, 2, '云端错题数没读到');
    const cfg = WordGame.config();
    assert.strictEqual(WordGame.grantSec(info), WordGame.rule(2));
    assert(WordGame.grantSec(info) > cfg.trialSec, '还是只给了试玩时长');
    assert(/老师电脑端|_clsCk/.test(gameSrc));
  });
  App.isTeacher = () => true;
  App._myStudentId = () => 'teacher';
  App._myWho = () => ({ name: '老师', klass: KLASS });

  pulled = 0; pullResult = 2; rootEl.innerHTML = '';
  WordGame._test.pullCheckins();
  ok('进入游戏页 / 回前台会主动拉后台打卡（本班口径）', () => {
    assert.strictEqual(pulled, 1, '没有调用 _pullCloudCheckins');
    assert.strictEqual(pulledScope, 'class', '拉的不是本班');
  });
  await new Promise(r => setTimeout(r, 0));
  ok('拉到新打卡数据后重画大厅，游戏页真的显示出来了', () => {
    assert(/今日打卡记录/.test(rootEl.innerHTML), '拉到新数据后没重画大厅');
  });
  ok('老师端班级为空时会从名册推断班级，不会把别班混进榜', () => {
    const saved = App.state.className;
    App.state.className = '';
    const r = WordGame._test.classRoster();
    assert.strictEqual(r.klass, KLASS);
    App.state.className = saved;
  });

  // --------------------------------------------------------- SW 真跑 fetch
  const listeners = {};
  let navFetches = 0;
  const selfStub = {
    addEventListener: (t, fn) => { listeners[t] = fn; },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
  };
  const cachesStub = {
    open: () => Promise.resolve({
      put: () => Promise.resolve(), match: () => Promise.resolve(null),
    }),
    keys: () => Promise.resolve([]), delete: () => Promise.resolve(true),
    match: () => Promise.resolve(null),
  };
  const fetchStub = () => { navFetches++; return Promise.resolve({ status: 200, clone: () => ({}) }); };
  new Function('self', 'caches', 'location', 'fetch', 'URL', 'Promise', swSrc)(
    selfStub, cachesStub, { origin: 'https://amyeng.top' }, fetchStub, URL, Promise
  );
  let captured = null;
  ok('SW：页面导航（下拉刷新）网络优先，一次刷新就拿到新首页', () => {
    assert(listeners.fetch, 'SW 没注册 fetch handler');
    listeners.fetch({
      request: { url: 'https://amyeng.top/', method: 'GET', mode: 'navigate',
        destination: 'document', cache: 'default' },
      respondWith: p => { captured = p; },
    });
    assert(captured && typeof captured.then === 'function', '导航没走 respondWith');
    assert.strictEqual(navFetches, 1, '导航没先走网络');
  });
  await captured;
  ok('SW：导航响应正常完成，离线才回退缓存', () => {
    assert.strictEqual(navFetches, 1, '导航被重复请求');
    assert(/cache\.match\('\.\/index\.html'\)/.test(swSrc));
  });
  ok('SW：脚本请求仍走 SWR 缓存，开屏速度不受影响', () => {
    assert(/SWR：缓存先答，网络后台刷新/.test(swSrc));
    assert(/cache\.match\(event\.request\)/.test(swSrc));
    assert(/refresh\(cache, event\.request\)/.test(swSrc));
  });

  console.log('\nv200 · ' + pass + ' 项全部通过');
})().catch(e => { console.error('\nFAIL: ' + (e && e.stack || e)); process.exit(1); });
