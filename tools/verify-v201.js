/* ===========================================================================
 * v201 校验：找回被吞的游戏分数 / 名单外登录拦截+通知 / 打卡名单分组
 *   node tools/verify-v201.js
 *
 * 家长 2026-11-12：
 *  「到底几个孩子有账号？我这边显示只有 9 个……多的孩子登录我也没有收到
 *    拦截通知……还是要拦截的，不要把这个功能给去掉了」
 *  「刚刚显示 YORK 的账号是第一名，得了 80 分。但是现在没有任何排名信息」
 *  「打卡的信息显示有几个同学打卡，但是名单是分散的，要求先显示打卡的同学」
 *
 * 真跑：① worker 的 buildBoardRows（active=0 但带分的老编号）；
 *       ② game.js 的 boardHtml / checkinCardHtml；
 *       ③ 完整 App 的 _needsApproval / _holdForApproval / _pollLoginAttempts。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const BASE = path.join(ROOT, 'public') + path.sep;
const html = fs.readFileSync(BASE + 'index.html', 'utf8');
const swSrc = fs.readFileSync(BASE + 'sw.js', 'utf8');
const gameSrc = fs.readFileSync(BASE + 'game.js', 'utf8');
const appSrcFull = fs.readFileSync(BASE + 'app.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const worker = fs.readFileSync(path.join(ROOT, 'worker/src/index.js'), 'utf8');

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };
console.log('v201 · 分数找回 / 账号拦截通知 / 打卡名单分组 校验');

const KLASS = '少儿英语A班';
const REAL = [
  ['哈俊武-jerry', 's1791896085117'], ['哈俊武-jerry', 's1791896146105'],
  ['张子皓-Harvey', 's1791931729388'], ['张子皓-Harvey', 's1792214883060'],
  ['张梓杨-Gary', 's1792850539588'], ['张梓苏-Sean', 's1791897541112'],
  ['田墨翰-Matt', 's1792308688122'], ['田墨翰-Matt', 's1791894975779'],
  ['薛懿格-Gina', 's1791895587995'], ['薛懿格-Gina', 's1791895720579'],
  ['陈皓正-Yunus', 's1789703358736'], ['马英凯-Steven', 's1791904742493'],
  ['黄耀-York', 's1791895377291'], ['黄耀-York', 's1792559812193'],
];

// ------------------------------------------------------------------ 源码约束
ok('版本钉子统一到 v202', () => {
  assert(/name="app-version" content="204"/.test(html));
  assert.strictEqual((html.match(/\?v=204/g) || []).length, 7, '首页 7 处脚本引用');
  assert(/var CACHE_NAME = 'amy-english-v204';/.test(swSrc) && /var V = 204;/.test(swSrc));
});
ok('后端不再把「已下线但带分」的账号整行丢掉', () => {
  const fn = worker.slice(worker.indexOf('async function buildBoardRows'),
    worker.indexOf('function serverBeijingDay('));
  assert(/active === 0 && !hasPoints/.test(fn), '下线行仍被无条件 return');
  assert(/const hasPoints =/.test(fn));
  assert(/if \(cls && klass && klass !== cls\) return;/.test(fn), '空班级的有分行仍会被过滤');
});
ok('后端补了只读体检口，分数归零时能查到 D1 原始数据', () => {
  assert(/url\.searchParams\.get\('diag'\) === '1'/.test(worker));
  assert(/FROM game_scores ORDER BY total DESC/.test(worker));
  assert(/diag: diag/.test(worker));
});
ok('后端有 approved_phones / login_attempts 两张表和四条接口', () => {
  assert(/CREATE TABLE IF NOT EXISTS approved_phones/.test(worker));
  assert(/CREATE TABLE IF NOT EXISTS login_attempts/.test(worker));
  ['/api/class/roster', '/api/class/login-attempt', '/api/class/login-attempts',
   '/api/class/login-attempt/resolve'].forEach(function (p) {
    assert(worker.indexOf("path === '" + p + "'") > 0, '缺接口 ' + p);
  });
  assert(/approved: rosterReady \? !!mine : null/.test(worker), 'approved 不是三态');
  assert(/pendingApproval: aStatus === 'pending'/.test(worker));
  assert(/DELETE FROM approved_phones WHERE phone = \?/.test(worker), '删人没同步摘白名单');
});
ok('前端 Api 补齐白名单 / 登录尝试 / 老师处理四个方法', () => {
  ['classApprovedRoster', 'classLoginAttempt', 'classLoginAttempts',
   'classResolveLoginAttempt'].forEach(function (m) {
    assert(new RegExp('async ' + m + '\\(').test(apiSrc), '缺 Api.' + m);
  });
});
ok('登录两条路径（新设备 / 老设备后台核对）都接上了名单外拦截', () => {
  const fn = appSrcFull.slice(appSrcFull.indexOf('  async registerStudent('),
    appSrcFull.indexOf('  // 核对一次删除状态'));
  assert.strictEqual((fn.match(/_needsApproval\(status\)/g) || []).length, 2,
    '漏了一条登录路径没拦');
  assert(/await this\._holdForApproval\(phone, name, status\)/.test(fn));
  assert(/self\._holdForApproval\(phone, name, status\)/.test(fn));
});
ok('拦截是三态：老师名册没同步上来一律放行，绝不误锁 9 个正式孩子', () => {
  const fn = appSrcFull.slice(appSrcFull.indexOf('  _needsApproval(status)'),
    appSrcFull.indexOf('  async _holdForApproval('));
  assert(/status\.approved === false/.test(fn));
  assert(/status\.pendingApproval === true/.test(fn));
  assert(/status\.denied === true/.test(fn));
  assert(/if \(!status \|\| status\.teacher\) return false/.test(fn));
});
ok('名单外孩子停在等待页，且老师同意后自动放行', () => {
  assert(/await Api\.classLoginAttempt\(phone, name\)/.test(appSrcFull));
  assert(/this\.showWaitingPage\(\)/.test(appSrcFull));
  assert(/this\.startApprovalPolling\(\)/.test(appSrcFull));
  const poll = appSrcFull.slice(appSrcFull.indexOf('  startApprovalPolling()'),
    appSrcFull.indexOf('  // ===== v201：老师端'));
  assert(/status\.approved === true && !status\.pendingApproval/.test(poll));
  assert(/this\.registerStudent\(this\.state\.phone, this\.state\.userName, true\)/.test(poll));
  assert(/id="waiting-card"/.test(html) && /id="waiting-subtitle"/.test(html));
});
ok('老师端每次轮询都查名单外登录，且首次不记静默基线', () => {
  const auto = appSrcFull.slice(appSrcFull.indexOf('  startAutoSync()'),
    appSrcFull.indexOf('  // Also sync whenever'));
  assert(/this\._syncApprovedRoster\(\); this\._pollLoginAttempts\(\)/.test(auto),
    '老师端没接上白名单同步与通知轮询');
  const poll = appSrcFull.slice(appSrcFull.indexOf('  async _pollLoginAttempts()'),
    appSrcFull.indexOf('  _alertOutsideLogins(fresh)'));
  assert(/if \(!this\._alertedAttemptPhones\) this\._alertedAttemptPhones = new Set\(\)/.test(poll));
  assert(!/_alertedAttemptPhones = new Set\(pending/.test(poll), '又把待办记成基线了');
  assert(/this\._alertOutsideLogins\(fresh\)/.test(poll));
  assert(/已被拦住，等你同意/.test(appSrcFull));
});
ok('学生管理页直接写明正式账号数 / 等同意数，并给出同意拒绝按钮', () => {
  assert(/📋 账号总览/.test(appSrcFull));
  assert(/正式账号 <b/.test(appSrcFull));
  assert(/等你同意 <b/.test(appSrcFull));
  assert(/名单外登录（/.test(appSrcFull));
  assert(/App\.resolveLoginAttempt/.test(appSrcFull), '没有同意/拒绝按钮');
  assert(/id="pending-card-top"/.test(appSrcFull), '横幅点了滚不到账号总览');
});
ok('打卡与积分已融合成一张按名次排的状态榜，CSS 也跟着加好了', () => {
  // v202：两张卡并成一张，按姓名把云端分数与后台错题数挂到同一行
  assert(/function mergedBoardRows/.test(gameSrc) && /function ckBoardMap/.test(gameSrc));
  assert(/wg-status/.test(gameSrc) && /wg-st-wrong/.test(gameSrc));
  assert(/wg-ck-group/.test(gameSrc) && /✅ 已打卡/.test(gameSrc));
  assert(/wg-ck-group-wait/.test(gameSrc) && /⏳ 还没打卡/.test(gameSrc));
  assert(/\.wg-ck-group\{/.test(html) && /\.wg-ck-group-wait\{/.test(html));
  assert(/\.wg-leader\{/.test(html) && /\.ck-today-tag\{/.test(html));
  assert(/\.wg-status\{/.test(html) && /\.wg-st-pos\{/.test(html));
});
ok('老师端打卡监控表也按今日是否打卡分组排序', () => {
  assert(/const roster = this\._classRoster\(\)\.slice\(\)\.sort\(/.test(appSrcFull));
  assert(/ck-today-tag\">今日已打卡/.test(appSrcFull));
});
ok('榜首单独显示第 1 名，全班 0 分也把话说清楚', () => {
  const bhAt = gameSrc.indexOf('  function boardHtml()');
  assert(bhAt > 0, 'game.js 里找不到 boardHtml');
  const fn = gameSrc.slice(bhAt, bhAt + 2200);
  assert(/wg-leader/.test(fn) && /🥇 第 1 名/.test(fn));
  assert(/第一名虚位以待/.test(fn));
});

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
        bind: function () { return this; }, run: async function () { return {}; },
      };
    },
  };
}
function row(name, id, total, active, klass) {
  return {
    student_id: id, student_name: name, student_class: klass === undefined ? KLASS : klass,
    total: total, best: total, rounds: total ? 3 : 0, today_score: total,
    day: '2026-11-12', updated_at: total ? '2026-11-12T10:00:00Z' : '',
    active: active,
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
const AppStub = {
  isTeacher: () => true,
  state: {
    students: REAL.map(r => ({ id: r[1], name: r[0], class: KLASS })),
    classes: [KLASS], className: KLASS, phone: 'teacher', userName: '老师',
    answers: {}, checkins: {}, cloudCheckins: cloudCk,
  },
  getTodayWeekdayIdx: () => 3,
  _weekTag: () => '', _myStudentId: () => 'teacher',
  _myWho: () => ({ name: '老师', klass: KLASS }),
  _clsCk: (sid, di) => cloudCk[sid + '_d' + di] || null,
  _pullCloudCheckins: () => Promise.resolve(0),
  _ckPullAt: Date.now(),
};
const win = {
  App: AppStub, Api: null, localStorage: ls,
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

// ------------------------------------------------------ 真跑完整 App（拦截）
const byId = {};
function mkEl(tag) {
  const e = { tagName: tag || 'div', style: {}, innerHTML: '', textContent: '',
    value: '', dataset: {}, _attrs: {} };
  e.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  e.setAttribute = (k, v) => { e._attrs[k] = v; };
  e.getAttribute = k => (k in e._attrs ? e._attrs[k] : null);
  e.appendChild = () => {}; e.remove = () => {}; e.focus = () => {}; e.click = () => {};
  e.querySelector = () => null; e.querySelectorAll = () => []; e.closest = () => null;
  e.addEventListener = () => {}; e.insertAdjacentHTML = () => {}; e.scrollIntoView = () => {};
  e.play = () => Promise.resolve();
  return e;
}
const documentStub = {
  getElementById: id => (byId[id] = byId[id] || mkEl('div')),
  querySelector: () => null, querySelectorAll: () => [], createElement: mkEl,
  addEventListener: () => {}, body: mkEl('body'), documentElement: mkEl('html'),
  hidden: false, visibilityState: 'visible', readyState: 'complete',
};
const mem2 = {};
const localStorageStub = {
  getItem: k => (k in mem2 ? mem2[k] : null),
  setItem: (k, v) => { mem2[k] = String(v); },
  removeItem: k => { delete mem2[k]; },
};
const windowStub = {
  addEventListener: () => {}, removeEventListener: () => {},
  location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  speechSynthesis: null,
};
let fakeAttempts = [];
let loginAttemptCalls = 0;
let resolveCalls = [];
function fakeFetch(url, opts) {
  const u = String(url);
  let body = {};
  if (u.indexOf('/api/class/login-attempts') >= 0) body = { attempts: fakeAttempts };
  else if (u.indexOf('/api/class/login-attempt/resolve') >= 0) {
    try { resolveCalls.push(JSON.parse(opts.body)); } catch (e) {}
    body = { ok: true, status: 'approved' };
  } else if (u.indexOf('/api/class/login-attempt') >= 0) {
    loginAttemptCalls++; body = { ok: true, status: 'pending' };
  } else if (u.indexOf('/api/class/roster') >= 0) body = { ok: true, count: 9 };
  else if (u.indexOf('/api/class/status') >= 0) body = { removed: false, approved: false };
  else body = { ok: true };
  return Promise.resolve({ ok: true, status: 200, json: async () => body,
    text: async () => JSON.stringify(body) });
}
const built = new Function('stubs', `
  const { document, window, location, navigator, localStorage, URL, fetch, Cloud,
          SpeechRecognition, Audio, alert, confirm, prompt, requestAnimationFrame } = stubs;
  ${dataSrc}
  ${apiSrc}
  ${appSrcFull.replace(/\nApp\.init\(\);/, '\n/* init skipped in v201 test */')}
  return { App: App };
`)({
  document: documentStub, window: windowStub, location: windowStub.location,
  navigator: { userAgent: 'node', onLine: true, language: 'zh-CN' },
  localStorage: localStorageStub,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
  fetch: fakeFetch, Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
  alert: () => {}, confirm: () => true, prompt: () => '',
  requestAnimationFrame: cb => setTimeout(cb, 0),
});
const App = built.App;
let bannerText = '';
App.showAlertBanner = function (title) { bannerText = title; };
App.showToast = function () {};
App.renderContent = function () {};
App._updatePendingBadge = function () {};

// ------------------------------------------------------------------- 跑起来
(async function main() {
  // ① 已下线但带分的老编号：v197/v200 预热名册时正是这样把 80 分吞掉的
  const mixed = REAL.map(function (r, i) {
    return row(r[0], r[1], 0, 1);
  });
  mixed.push(row('黄耀-York', 's1791895604043', 80, 0, ''));   // 下线 + 空班级 + 有分
  let rows = await boardApi.buildBoardRows(fakeDb(mixed), KLASS, '2026-11-12');
  ok('后端：下线且班级为空的 80 分老账号不再被吞，York 回到第一名', () => {
    const york = rows.filter(r => r.student_name.indexOf('York') >= 0);
    assert.strictEqual(york.length, 1, 'York 又出现两行');
    assert.strictEqual(york[0].total, 80, '80 分没找回来，实际 ' + york[0].total);
    assert.strictEqual(rows[0].student_name.indexOf('York') >= 0, true, '第一名不是 York');
    assert.strictEqual(rows.length, 9, '9 个正式孩子不能变多');
  });
  ok('后端：没有分数的下线行仍然不出现在榜上', () => {
    const noScore = REAL.map(r => row(r[0], r[1], 0, 1));
    noScore.push(row('测试-多余账号', 's999', 0, 0));
    return boardApi.buildBoardRows(fakeDb(noScore), KLASS, '2026-11-12').then(function (r2) {
      assert.strictEqual(r2.length, 9);
      assert(!/多余账号/.test(r2.map(x => x.student_name).join(',')));
    });
  });

  // ② 游戏页：榜首第一名 + 打卡名单分组
  setBoard(mixed);
  let board = WordGame._test.boardHtml();
  ok('游戏页：榜首单独显示「第 1 名 黄耀-York · 80 分」', () => {
    assert(/wg-leader/.test(board));
    assert(/第 1 名/.test(board) && /黄耀-York/.test(board) && /80<\/b>/.test(board));
    assert(/🥇/.test(board), '有分却没给第一名奖牌');
  });
  setBoard(REAL.map(r => row(r[0], r[1], 0, 1)));
  board = WordGame._test.boardHtml();
  ok('游戏页：全班 0 分时也写清「第一名虚位以待」，不是一片空白', () => {
    assert(/第一名虚位以待/.test(board));
    assert(!/🥇|🥈|🥉/.test(board));
    assert(/wg-leader-empty/.test(board));
  });

  cloudCk['s1791896085117_d3'] = { done: true, wrongCount: 1, answered: 30, total: 30 };
  cloudCk['s1791895377291_d3'] = { done: true, wrongCount: 0, answered: 30, total: 30 };
  cloudCk['s1792850539588_d3'] = { done: false, answered: 6, total: 30 };
  const ck = WordGame._test.checkinCardHtml();
  ok('融合榜：按第 1~9 名顺序排列，每行同时列出分数、错题数与打卡状态', () => {
    assert(/✅ 已打卡 2 人/.test(ck), '已打卡人数不对');
    assert(/⏳ 还没打卡 7 人/.test(ck), '未打卡人数不对');
    assert(/今日已打卡 <b>2<\/b> \/ 9 人/.test(ck));
    assert(/按第 1 到第 \d+ 名顺序排列/.test(ck), '没写明按名次顺序排列');
    const first = ck.indexOf('wg-board-row wg-ck-row');
    assert(first > 0, '融合状态行没渲染出来');
    const next = ck.indexOf('wg-board-row wg-ck-row', first + 10);
    const seg = ck.slice(first, next > 0 ? next : undefined);
    assert(/wg-st-wrong/.test(seg) && /wg-st-ck/.test(seg) && /wg-board-score/.test(seg),
      '分数、错题数、打卡状态没放在同一条状态栏里');
    assert(/第 1 名|还没出击/.test(seg), '第一行没有名次标识');
  });

  // ③ 登录拦截与老师通知
  ok('三态判定：明确不在名单才拦，名册未就绪 / 已批准 / 老师号一律放行', () => {
    assert.strictEqual(App._needsApproval({ approved: false }), true);
    assert.strictEqual(App._needsApproval({ pendingApproval: true }), true);
    assert.strictEqual(App._needsApproval({ denied: true }), true);
    assert.strictEqual(App._needsApproval({ approved: null }), false, '名册没同步却把孩子锁了');
    assert.strictEqual(App._needsApproval({ approved: true }), false);
    assert.strictEqual(App._needsApproval({ teacher: true }), false);
    assert.strictEqual(App._needsApproval(null), false);
  });
  App.state.phone = '13800009999';
  App.state.userName = '测试-多余孩子';
  await App._holdForApproval('13800009999', '测试-多余孩子', { approved: false });
  ok('名单外登录：后台留下待同意记录，孩子停在等待页、没进作业页', () => {
    assert.strictEqual(loginAttemptCalls, 1, '没上报登录尝试，老师不会收到通知');
    assert(/已经通知老师了/.test(byId['waiting-card'].innerHTML));
    assert.strictEqual(byId['removed-page'].classList.contains('hidden'), false);
    assert(App._approvalTimer, '没启动等待轮询');
    clearInterval(App._approvalTimer); App._approvalTimer = null;
  });

  fakeAttempts = [
    { phone: '13800009999', name: '测试-多余孩子', status: 'pending' },
    { phone: '13800008888', name: '测试-另一个', status: 'pending' },
  ];
  App.isTeacher = () => true;
  App._alertedAttemptPhones = null;
  await App._pollLoginAttempts();
  ok('老师上线：即使当时不在线，也会汇总弹出「2 个名单外孩子尝试登录」', () => {
    assert(/2 个名单外的孩子尝试登录/.test(bannerText), '横幅内容=' + bannerText);
    assert(/已被拦住，等你同意/.test(bannerText));
    assert(/测试-多余孩子/.test(bannerText) && /测试-另一个/.test(bannerText));
    assert.strictEqual((App.state.loginAttempts || []).length, 2);
  });
  bannerText = '';
  await App._pollLoginAttempts();
  ok('同一批待办不会被 15 秒轮询反复吵，新增的才会再提醒', () => {
    assert.strictEqual(bannerText, '', '重复弹了通知');
    fakeAttempts.push({ phone: '13800007777', name: '测试-第三个', status: 'pending' });
    return App._pollLoginAttempts().then(function () {
      assert(/名单外的孩子「测试-第三个」尝试登录/.test(bannerText), '新增没提醒');
    });
  });
  await App.resolveLoginAttempt('13800009999', 'approve');
  ok('老师点同意：后台放行、名单从待办里去掉，孩子那边下一轮就能进', () => {
    assert.strictEqual(resolveCalls.length, 1);
    assert.strictEqual(resolveCalls[0].action, 'approve');
    assert(!/13800009999/.test(JSON.stringify(App.state.loginAttempts)), '待办没消掉');
    assert.strictEqual(App.state.loginAttempts.length, 2);
  });

  console.log('\nv201 · ' + pass + ' 项全部通过 ✅');
  process.exit(0);
})().catch(e => { console.error('\n❌ ' + (e && e.stack || e)); process.exit(1); });
