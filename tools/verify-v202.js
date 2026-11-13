/* ===========================================================================
 * v202 校验：把「答错几题」栏和「得多少分」栏融成一张按名次排的状态榜
 *   node tools/verify-v202.js
 *
 * 家长 2026-11-12：
 *  「老师端和学生端的单词打卡界面，有一个答错了几题的一个栏，还有一个得了
 *    多少分的栏。把这两栏给融合到一起，也就是说，学生得了多少分，错了几道
 *    题，用同一个状态栏显示。这样下面没有那么复杂。同样按照排名第一到第九
 *    的顺序来排列，比如说第一名他答错几道。第二名，分门别类的都给他列出来」
 *
 * 这里真加载 public/game.js：喂一份 9 人云端积分榜 + 后台打卡记录，
 * 调 mergedBoardRows / boardHtml / hallHtml，检查是不是一行一个孩子、
 * 分数和错题数在同一条状态栏里、按第 1~9 名顺序排、0 分排最后。
 * 不是只 grep 代码文本。
 * ======================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
const gameSrc = fs.readFileSync(path.join(PUB, 'game.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(PUB, 'sw.js'), 'utf8');

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('  ✓ ' + name); };
console.log('v202 · 分数 / 错题 / 打卡融合成按第 1~9 名排列的一张状态榜 校验');

const KLASS = '少儿英语A班';
// 线上真实名册：9 个孩子，其中几个有重复注册编号
const REAL = [
  ['哈俊武-jerry', 's1791896085117', 352],
  ['哈俊武-jerry', 's1791896146105', 0],
  ['张子皓-Harvey', 's1791931729388', 1899],
  ['张子皓-Harvey', 's1792214883060', 0],
  ['张梓杨-Gary', 's1792850539588', 0],
  ['张梓苏-Sean', 's1791897541112', 0],
  ['田墨翰-Matt', 's1792308688122', 0],
  ['田墨翰-Matt', 's1791894975779', 0],
  ['薛懿格-Gina', 's1791895587995', 0],
  ['薛懿格-Gina', 's1791895720579', 0],
  ['陈皓正-Yunus', 's1789703358736', 489],
  ['马英凯-Steven', 's1791904742493', 0],
  ['黄耀-York', 's1791895377291', 80],
  ['黄耀-York', 's1792559812193', 0],
];

// ------------------------------------------------------------- 加载 game.js
const rootEl = { innerHTML: '', style: {} };
const mem = Object.create(null);
const ls = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const cloudCk = Object.create(null);
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
  _pullCloudCheckins: () => Promise.resolve(0),
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
assert(WordGame && WordGame._test && WordGame._test.mergedBoardRows,
  'game.js 没挂出融合榜把手');

// 云端积分榜（已按姓名合并好的 9 行）+ 后台打卡记录
function setBoard() {
  WordGame.board().rows = WordGame._test.normalizeBoardRows(REAL.map(function (r) {
    return {
      student_id: r[1], student_name: r[0], student_class: KLASS,
      total: r[2], best: r[2], rounds: r[2] ? 3 : 0,
      today_score: r[2] ? 20 : 0, played: !!r[2],
      updated_at: r[2] ? '2026-11-12T10:00:00Z' : '',
    };
  }));
  WordGame.board().at = Date.now();
}
cloudCk['s1791931729388_d3'] = { done: true, wrongCount: 3, answered: 30, total: 30 };
cloudCk['s1789703358736_d3'] = { done: true, wrongCount: 1, answered: 30, total: 30 };
cloudCk['s1791896085117_d3'] = { done: true, wrongCount: 2, answered: 30, total: 30 };
cloudCk['s1791895377291_d3'] = { done: false, wrongCount: 4, answered: 12, total: 30 };
setBoard();

// ------------------------------------------------------------------ 源码约束
ok('大厅只渲染一张融合榜，原来的独立打卡卡不再叠在下面', () => {
  assert.strictEqual((gameSrc.match(/h \+= boardHtml\(\);/g) || []).length, 1,
    '大厅没渲染融合榜，或渲染了不止一次');
  assert(!/h \+= checkinCardHtml\(\);/.test(gameSrc), '独立的打卡卡还叠在下面');
  assert(/function checkinCardHtml\(\)[\s\S]{0,120}return boardHtml\(\);/.test(gameSrc),
    '旧打卡卡函数没委托给融合榜');
});
ok('老师端「游戏试玩」与学生端「单词乐园」共用这一个渲染函数', () => {
  assert(/'wordgame'/.test(fs.readFileSync(path.join(PUB, 'app.js'), 'utf8')));
  assert.strictEqual((gameSrc.match(/function boardHtml\(\)/g) || []).length, 1);
  assert(/function mergedBoardRows\(/.test(gameSrc) && /function ckBoardMap\(/.test(gameSrc));
});
ok('CSS 给同一条状态栏加了名次、姓名、错题、打卡的样式', () => {
  ['.wg-status{', '.wg-st-pos{', '.wg-board-main{', '.wg-board-line{',
   '.wg-st-wrong b{', '.wg-board-row.wg-ck-row{'].forEach(function (sel) {
    assert(html.indexOf(sel) > 0, '少了 ' + sel);
  });
  // 新增样式只用普通类选择器，不引入新选择器语法（老华为浏览器兼容由 v191 管）
  const block = html.slice(html.indexOf('v202 · 分数 / 错题 / 打卡'), html.length);
  assert(!/:has\(/.test(block) && !/100dvh/.test(block), '融合样式用了老浏览器不支持的语法');
});
ok('版本钉子统一到 v202', () => {
  assert(/name="app-version" content="204"/.test(html));
  assert.strictEqual((html.match(/\?v=204/g) || []).length, 7, '首页 7 处脚本引用');
  assert(/var CACHE_NAME = 'amy-english-v204';/.test(swSrc) && /var V = 204;/.test(swSrc));
});

// ------------------------------------------------------------- 真跑融合数据
const rows = WordGame._test.mergedBoardRows(3);
ok('融合后 9 个孩子一人一行，同名重复编号不再出现两次', () => {
  assert.strictEqual(rows.length, 9, '不是 9 行');
  const names = rows.map(r => r.student_name);
  assert.strictEqual(new Set(names).size, 9, '还有重复姓名');
  assert.strictEqual(names.filter(n => n.indexOf('York') >= 0).length, 1, 'York 出现两次');
});
ok('按第 1 到第 9 名顺序排：有分的按分数降序在前，0 分的排后面', () => {
  assert.strictEqual(rows[0].student_name, '张子皓-Harvey', '第 1 名不对');
  assert.strictEqual(rows[1].student_name, '陈皓正-Yunus', '第 2 名不对');
  assert.strictEqual(rows[2].student_name, '哈俊武-jerry', '第 3 名不对');
  assert.strictEqual(rows[3].student_name, '黄耀-York', '第 4 名不对');
  let seenZero = false;
  for (let i = 0; i < rows.length; i++) {
    const scored = rows[i].total > 0 || rows[i].rounds > 0;
    if (!scored) seenZero = true;
    else assert(!seenZero, '0 分的人排到有分的人前面了');
  }
  assert(seenZero, '没有 0 分的人');
});
ok('云端分数与后台错题数按姓名挂到了同一行上', () => {
  const byName = {};
  rows.forEach(r => { byName[r.student_name] = r; });
  assert.strictEqual(byName['张子皓-Harvey'].total, 1899, '第 1 名分数没带过来');
  assert.strictEqual(byName['张子皓-Harvey']._ck.wrong, 3, '第 1 名错题数没挂上');
  assert.strictEqual(byName['陈皓正-Yunus']._ck.wrong, 1, '第 2 名错题数没挂上');
  assert.strictEqual(byName['哈俊武-jerry']._ck.wrong, 2, '重复编号的打卡没认到');
  assert.strictEqual(byName['黄耀-York']._ck.done, false, '半截进度被当成已打卡');
  assert.strictEqual(byName['张梓杨-Gary']._ck.wrong, null, '没记录却假装错 0 道');
});

// ------------------------------------------------------------- 真跑页面渲染
const board = WordGame._test.boardHtml();
function rowSegments(h) {
  const parts = [], tag = 'wg-board-row wg-ck-row';
  let at = h.indexOf(tag), next;
  while (at > 0) {
    next = h.indexOf(tag, at + tag.length);
    parts.push(h.slice(at, next > 0 ? next : h.length));
    at = next;
  }
  return parts;
}
ok('一张状态榜 9 行：每行同时有分数、错题数、打卡状态、名次', () => {
  const segs = rowSegments(board);
  assert.strictEqual(segs.length, 9, '状态行不是 9 条');
  segs.forEach(function (s, i) {
    assert(/wg-board-score/.test(s), '第 ' + (i + 1) + ' 行没有分数');
    assert(/wg-st-wrong/.test(s), '第 ' + (i + 1) + ' 行没有错题数');
    assert(/wg-st-ck/.test(s), '第 ' + (i + 1) + ' 行没有打卡状态');
    assert(/wg-st-pos/.test(s), '第 ' + (i + 1) + ' 行没有名次标识');
  });
});
ok('「第一名答错几道」一眼看得到，第二名分门别类也列出来', () => {
  const segs = rowSegments(board);
  assert(/第 1 名/.test(segs[0]) && /1899/.test(segs[0]), '第 1 名分数不对');
  assert(/错 <b>3<\/b> 道/.test(segs[0]), '第 1 名错题数没显示');
  assert(/✅ 已打卡/.test(segs[0]), '第 1 名打卡状态没显示');
  assert(/第 2 名/.test(segs[1]) && /489/.test(segs[1]) && /错 <b>1<\/b> 道/.test(segs[1]),
    '第 2 名的分数 / 错题数没分门别类列出来');
  assert(/答了 12\/30 题/.test(segs[3]), '半截进度没显示');
});
ok('0 分不再占名次、不挂奖牌，统一排在最后并写明「还没出击」', () => {
  const segs = rowSegments(board);
  for (let i = 4; i < segs.length; i++) {
    assert(/还没出击/.test(segs[i]), '第 ' + (i + 1) + ' 行没写还没出击');
    assert(!/🥇|🥈|🥉/.test(segs[i]), '0 分挂了奖牌');
    assert(/wg-board-idle/.test(segs[i]), '0 分行没有淡色');
  }
  assert(!/第 1 名/.test(segs[8]), '0 分被算成第 1 名');
});
ok('打卡人数汇总、第 1 名摘要、按名次排列的说明都在这一张卡里', () => {
  assert(/📋 今日打卡记录/.test(board), '打卡信息没并进来');
  assert(/按第 1 到第 9 名顺序排列/.test(board));
  assert(/🥇 第 1 名 <b>张子皓-Harvey<\/b> · <b>1899<\/b> 分/.test(board));
  assert(/✅ 已打卡 3 人/.test(board) && /⏳ 还没打卡 6 人/.test(board));
  assert(/今日已打卡 <b>3<\/b> \/ 9 人/.test(board));
  assert(/wg-board-scroll/.test(board), '一屏全展开的榜单容器不见了');
});
ok('旧打卡卡入口与融合榜返回同一张卡，大厅里不重复出现', () => {
  assert.strictEqual(WordGame._test.checkinCardHtml(), WordGame._test.boardHtml());
  const hall = WordGame._test.hallHtml();
  assert.strictEqual((hall.match(/wg-board wg-ck-card/g) || []).length, 1,
    '大厅里融合卡出现了不止一次');
  assert(!/<div class="wg-card wg-ck-card">/.test(hall), '还有独立的打卡记录卡');
  assert(/今日打卡记录/.test(hall), '融合后打卡信息不见了');
});
ok('学生端同样是这 9 行，自己那一行照样高亮', () => {
  App.isTeacher = () => false;
  App._myStudentId = () => 's1791895377291';
  App._myWho = () => ({ name: '黄耀-York', klass: KLASS });
  const stu = WordGame._test.boardHtml();
  assert.strictEqual(rowSegments(stu).length, 9, '学生端行数不对');
  assert(/wg-board-me/.test(stu), '孩子找不到自己那一行');
  assert(/第 4 名/.test(rowSegments(stu)[3]), 'York 不是第 4 名');
  App.isTeacher = () => true;
  App._myStudentId = () => 'teacher';
  App._myWho = () => ({ name: '老师', klass: KLASS });
});
ok('全班都 0 分时也按 9 行列出，不挂奖牌、不一片空白', () => {
  REAL.forEach(function (r) { r[2] = 0; });
  setBoard();
  const allZero = WordGame._test.boardHtml();
  assert.strictEqual(rowSegments(allZero).length, 9);
  assert(/第一名虚位以待/.test(allZero));
  assert(!/🥇|🥈|🥉/.test(allZero), '全班 0 分却挂了奖牌');
  assert(/按第 1 到第 9 名顺序排列/.test(allZero));
});

console.log('\nv202 · ' + pass + ' 项全部通过');
