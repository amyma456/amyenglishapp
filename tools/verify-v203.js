/* ===========================================================================
 * v203 校验：全班状态榜一屏全展开，去掉要下拉的进度条
 *   node tools/verify-v203.js
 *
 * 家长 2026-11-13：
 *  「手机和电脑端、老师和学生端，学生所有的信息需要划下拉进度条，不需要
 *    下拉，一个页面就能看见所有学生错了几道题、剩几道题、得了多少分、
 *    总分是多少、排名是多少，就把进度条去掉」
 *
 * 这里真加载 public/game.js：喂 9 人云端积分榜 + 后台打卡记录，
 * 调 boardHtml / hallHtml / mergedBoardRows，检查 9 行全渲染、每行五项
 * 信息都在、剩余题数算得对、榜在首屏最上面，以及 CSS 里确实没有滚动窗口。
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
console.log('v203 · 全班状态榜一屏全展开 / 无进度条 / 每行五项信息 校验');

// ------------------------------------------------------------------ 源码约束
ok('榜单容器不再有内部滚动窗口，进度条彻底去掉', () => {
  const rules = html.match(/\.wg-board-scroll\{[^}]*\}/g) || [];
  assert(rules.length >= 1, '找不到 .wg-board-scroll 定义');
  rules.forEach(function (r) {
    assert(!/max-height:\s*\d+px/.test(r), '还有最大高度限制：' + r);
    assert(!/overflow-y:\s*auto/.test(r), '还有纵向滚动：' + r);
  });
  assert(/overflow:visible/.test(rules.join('')), '没有显式全展开');
  assert(/\.wg-board-scroll::-webkit-scrollbar\{display:none\}/.test(html),
    '滚动条样式没隐藏');
});
ok('v203 紧凑样式：汇总并排、状态行不换行、剩余题数有强调色', () => {
  const at = html.indexOf('v203 · 全班状态榜一屏全展开');
  assert(at > 0, 'v203 样式块不见了');
  const block = html.slice(at, html.indexOf('</style>', at));
  assert(/\.wg-ck-groups\{display:flex/.test(block), '两条汇总没并排');
  assert(/\.wg-status\{flex-wrap:nowrap/.test(block), '状态行还会折行撑高');
  assert(/\.wg-st-left b\{/.test(block), '剩余题数没有强调');
  assert(/\.wg-board-row\.wg-ck-row\{align-items:center;padding:3px 5px;min-height:0\}/.test(block),
    '状态行没压紧');
  assert(block.indexOf(':has(') < 0 && block.indexOf('100dvh') < 0,
    '紧凑样式用了老浏览器不支持的语法');
});
ok('全班状态榜挪到游戏大厅首屏最上面，时长卡排在后面', () => {
  const at = gameSrc.indexOf('function hallHtml()');
  assert(at > 0, '找不到 hallHtml');
  const fn = gameSrc.slice(at, at + 4200);
  const boardAt = fn.indexOf('h += boardHtml();');
  const timeAt = fn.indexOf('wg-time-card');
  assert(boardAt > 0 && timeAt > boardAt, '榜没排在时长卡前面，还要往下拉');
  assert.strictEqual((gameSrc.match(/h \+= boardHtml\(\);/g) || []).length, 1,
    '大厅渲染融合榜不是一次');
});
ok('老师端与学生端共用同一个渲染函数，旧打卡卡仍委托给融合榜', () => {
  assert(/'wordgame'/.test(fs.readFileSync(path.join(PUB, 'app.js'), 'utf8')));
  assert.strictEqual((gameSrc.match(/function boardHtml\(\)/g) || []).length, 1);
  assert(/function checkinCardHtml\(\)[\s\S]{0,120}return boardHtml\(\);/.test(gameSrc));
});
ok('版本钉子统一到 v203', () => {
  assert(/name="app-version" content="203"/.test(html));
  assert.strictEqual((html.match(/\?v=203/g) || []).length, 7, '首页 7 处脚本引用');
  assert(/var CACHE_NAME = 'amy-english-v203';/.test(swSrc) && /var V = 203;/.test(swSrc));
});

// ------------------------------------------------------------- 加载 game.js
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

function setBoard() {
  WordGame.board().rows = WordGame._test.normalizeBoardRows(REAL.map(function (r) {
    return {
      student_id: r[1], student_name: r[0], student_class: KLASS,
      total: r[2], best: r[2], rounds: r[2] ? 3 : 0,
      today_score: r[2] ? 20 : 0, played: !!r[2],
      updated_at: r[2] ? '2026-11-13T10:00:00Z' : '',
    };
  }));
  WordGame.board().at = Date.now();
}
cloudCk['s1791931729388_d3'] = { done: true, wrongCount: 3, answered: 30, total: 30 };
cloudCk['s1789703358736_d3'] = { done: true, wrongCount: 1, answered: 30, total: 30 };
cloudCk['s1791896085117_d3'] = { done: true, wrongCount: 2, answered: 30, total: 30 };
cloudCk['s1791895377291_d3'] = { done: false, wrongCount: 4, answered: 12, total: 30 };
setBoard();

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

// ------------------------------------------------------------- 真跑页面渲染
const board = WordGame._test.boardHtml();
const segs = rowSegments(board);
ok('9 个孩子 9 行，一行不少，榜单不再被裁掉', () => {
  assert.strictEqual(segs.length, 9, '只有 ' + segs.length + ' 行');
  assert.strictEqual((board.match(/wg-board-scroll/g) || []).length, 1,
    '榜单容器不止一个');
});
ok('每行都写清：第几名 / 错几道 / 剩几道 / 今日得分 / 累计总分 / 打卡', () => {
  segs.forEach(function (s, i) {
    assert(/wg-st-pos/.test(s), '第 ' + (i + 1) + ' 行没有名次');
    assert(/wg-st-wrong/.test(s), '第 ' + (i + 1) + ' 行没有错题数');
    assert(/wg-st-left/.test(s), '第 ' + (i + 1) + ' 行没有剩余题数');
    assert(/wg-st-today/.test(s), '第 ' + (i + 1) + ' 行没有今日得分');
    assert(/总 <b>\d+<\/b> 分/.test(s), '第 ' + (i + 1) + ' 行没有累计总分');
    assert(/wg-st-ck/.test(s), '第 ' + (i + 1) + ' 行没有打卡状态');
  });
});
ok('第 1 名 Harvey：错 3 / 剩 0 / 今日 +20 / 总 1899 分 / 第 1 名 / 已打卡', () => {
  const s = segs[0];
  assert(/第 1 名/.test(s) && /总 <b>1899<\/b> 分/.test(s), '名次或总分不对');
  assert(/错 <b>3<\/b> 道/.test(s), '错题数不对');
  assert(/剩 <b>0<\/b> 道/.test(s), '全做完了却还显示剩题');
  assert(/今日 <b>\+20<\/b>/.test(s), '今日得分不对');
  assert(/✅ 已打卡/.test(s), '打卡状态不对');
});
ok('第 4 名 York 答了 12/30：剩 18 道，错 4 道，总分 80', () => {
  const s = segs[3];
  assert(/第 4 名/.test(s) && /总 <b>80<\/b> 分/.test(s));
  assert(/错 <b>4<\/b> 道/.test(s), '错题数不对');
  assert(/剩 <b>18<\/b> 道/.test(s), '剩余题数没按 30-12 算');
  assert(/答了 12\/30 题/.test(s), '半截进度不对');
});
ok('没打卡记录的孩子不假装成「错 0 道 / 剩 0 道」', () => {
  const gary = segs.filter(s => /Gary/.test(s))[0];
  assert(gary, 'Gary 不在榜上');
  assert(/错题待同步/.test(gary) && /剩题待同步/.test(gary), '把没记录当成 0');
});
ok('mergedBoardRows 的剩余题数 = 当天总题数 - 已答题数', () => {
  const rows = WordGame._test.mergedBoardRows(3), by = {};
  rows.forEach(r => { by[r.student_name] = r; });
  assert.strictEqual(by['张子皓-Harvey']._ck.left, 0);
  assert.strictEqual(by['陈皓正-Yunus']._ck.left, 0);
  assert.strictEqual(by['黄耀-York']._ck.left, 18);
  assert.strictEqual(by['张梓杨-Gary']._ck.left, null);
});
ok('两条打卡汇总并排一行，脚注和按名次排列的说明都还在', () => {
  assert(/wg-ck-groups/.test(board), '汇总没并排');
  assert(/✅ 已打卡 3 人/.test(board) && /⏳ 还没打卡 6 人/.test(board));
  assert(/今日已打卡 <b>3<\/b> \/ 9 人/.test(board));
  assert(/按第 1 到第 9 名顺序排列/.test(board));
  assert(/错=错题 \/ 剩=剩余题 \/ 今日=今日得分 \/ 总=累计总分/.test(board),
    '没写清每一列是什么');
});
ok('老师端与学生端游戏页都是这一张 9 行全展开的榜，自己那行照样高亮', () => {
  const hallT = WordGame._test.hallHtml();
  assert.strictEqual((hallT.match(/wg-board-row wg-ck-row/g) || []).length, 9,
    '老师端行数不对');
  assert(hallT.indexOf('wg-board wg-ck-card') < hallT.indexOf('wg-time-card'),
    '老师端榜不在时长卡前面');
  App.isTeacher = () => false;
  App._myStudentId = () => 's1791895377291';
  App._myWho = () => ({ name: '黄耀-York', klass: KLASS });
  const hallS = WordGame._test.hallHtml();
  assert.strictEqual((hallS.match(/wg-board-row wg-ck-row/g) || []).length, 9,
    '学生端行数不对');
  assert(/wg-board-me/.test(hallS), '孩子找不到自己那一行');
  assert(hallS.indexOf('wg-board wg-ck-card') < hallS.indexOf('wg-time-card'),
    '学生端榜不在时长卡前面');
  App.isTeacher = () => true;
  App._myStudentId = () => 'teacher';
  App._myWho = () => ({ name: '老师', klass: KLASS });
});
ok('0 分仍排最后、不挂奖牌、写明「还没出击」', () => {
  for (let i = 4; i < segs.length; i++) {
    assert(/还没出击/.test(segs[i]), '第 ' + (i + 1) + ' 行没写还没出击');
    assert(!/🥇|🥈|🥉/.test(segs[i]), '0 分挂了奖牌');
  }
});

console.log('\nv203 · ' + pass + ' 项全部通过');
