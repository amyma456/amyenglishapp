/* eslint-disable */
// 打卡汇总与历史补录（v122）回归校验。
//
// 家长 2026-10-14 晚原话：「我现在重新登录了Yusuf账号，但是仍然这边显示没有
// 任何反应……孩子打卡仍然是空的。完成率对比里头，所有的学生完成率都是0，
// 包括自己这边也是0。」
//
// 前两版（v120 建表上报、v121 推全部周）都只修了"通道"，没查"源头"。真病根是
// **答案汇总这一步本地就断了**：
//   Api.answerKey()      → studentId + _weekTag() + '_d' + day + '_m'...  （带周标记）
//   Api.getAnswers()     → studentId +            '_d' + day + '_'        （漏了！）
// 第 2 周（2026-10-05 周一）起两者对不上，getAnswers 恒返回 []，saveCheckin
// 在"一条答案都没有"那步直接 return null —— 打卡再也没被写下来过。于是：
//   孩子端 清一色未打卡 / 完成率对比全员 0 / 每日状态全叉，
//   后台 checkins 表一条也没有（没东西可报，v120/v121 的通道其实是好的）。
//
// 这个脚本**装载真的 public/api.js**（不是 stub），用真的 localStorage 文档跑：
//   1. getAnswers 认周标记（就是上面那个 bug）
//   2. saveCheckin 真的会写下来，数字对得上
//   3. 完成时间 = 这天最后一次答题的时刻（不是"现在"）
//   4. repairCheckins 能把历史几天补回来，且只增不减、可重复调用
//   5. app.js 打开 App 时会调它
//
// 用法：node tools/verify-checkin-repair.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };
const pad = n => String(n).padStart(2, '0');
const hhmm = iso => { const d = new Date(iso); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
const HOMEWORK_WEEK_IDX = new Function(dataSrc + '; return HOMEWORK_WEEK_IDX;')();
const TAG = HOMEWORK_WEEK_IDX > 0 ? '_w' + HOMEWORK_WEEK_IDX : '';
const SID = 's1791948066153';
const OTHER = 's1791895720579';

// 一天有几道题（与 App._countDayQuestions 同一口径：跳过 vocab 练习）
function countDay(di) {
  const day = HOMEWORK_DATA[di];
  if (!day || !day.modules) return 0;
  let n = 0;
  day.modules.forEach(m => {
    if (m.type === 'vocab') return;
    if (m.questions) n += m.questions.length;
    if (m.blanks) n += m.blanks.length;
  });
  return n;
}
function mkAnswers(sid, weekTag, dayIdx, n, wrong, at) {
  const out = {};
  for (let i = 0; i < n; i++) {
    const k = sid + weekTag + '_d' + dayIdx + '_m0_q' + i;
    out[k] = { id: 'a' + i, studentId: sid, dayIdx: dayIdx, moduleIdx: 0, qIdx: i,
      value: 'x', correct: i >= wrong, at: at };
  }
  return out;
}

// =========================================================================
console.log('== 1) 源码：周标记两边必须一致（这就是 v122 的病根）==');
ok(/return studentId \+ this\._weekTag\(\) \+ '_d' \+ dayIdx \+ '_';/.test(apiSrc),
  '_answerPrefix 带 _weekTag()');
ok(/return studentId \+ this\._weekTag\(\) \+ '_d' \+ dayIdx \+ '_m' \+ moduleIdx/.test(apiSrc),
  'answerKey 也带 _weekTag()（两边对齐了）');
ok(/const prefix = studentId \+ '_d' \+ dayIdx \+ '_'/.test(apiSrc) === false,
  '再也没有"漏周标记"的那种前缀（v122 之前的那行已删）');

// =========================================================================
console.log('== 2) 装载真的 api.js，用真文档跑 ==');
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
  key: i => Object.keys(lsData)[i] || null,
  get length() { return Object.keys(lsData).length; },
};
const calls = [];
const fetchStub = (url, opt) => {
  calls.push({ url: String(url), body: opt && opt.body ? JSON.parse(opt.body) : null });
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
};

const api = {};
try {
  const factory = new Function('stubs',
    'with (stubs) { ' + apiSrc + '\n return { Api: Api, Store: Store }; }');
  Object.assign(api, factory({
    localStorage: localStorage, fetch: fetchStub, console: console,
    HOMEWORK_WEEK_IDX: HOMEWORK_WEEK_IDX, HOMEWORK_DATA: HOMEWORK_DATA,
    navigator: { onLine: true, userAgent: 'node' },
    location: { origin: 'https://amyeng.top', href: 'https://amyeng.top/' },
    window: {}, Cloud: null, setTimeout: setTimeout, clearTimeout: clearTimeout,
    crypto: { randomUUID: () => 'u' + Math.random().toString(36).slice(2, 10) },
    Date: Date, Math: Math, JSON: JSON, Object: Object,
  }));
} catch (e) {
  ok(false, '装载 api.js 失败：' + e.message);
}
const Api = api.Api;
const Store = api.Store;
ok(!!Api && typeof Api.getAnswers === 'function' && !!Store, 'api.js 装载成功（真 Api + 真 Store）');

// 重开一次"手机"：丢掉内存里的文档，逼 Store 从 localStorage 重新读。
const reopen = () => { Store._doc = null; };
// 渲染读的就是这份 map（App.state.checkins 指向它）
const ck = di => Store.doc().checkins[SID + TAG + '_d' + di] || null;
const allKeys = () => Object.keys(Store.doc().checkins);

// 孩子手机上的那份本机数据：本周第 0 天全做完（错 1 题）、第 1 天做了一半
// 另外塞一条别的学生的、一条上周的 —— 都不该被算进来。
const day0Total = countDay(0);
const day0LastISO = '2026-10-12T11:00:00.000Z';
const day1LastISO = '2026-10-13T12:30:00.000Z';
const seed = Object.assign({},
  mkAnswers(SID, TAG, 0, day0Total, 1, day0LastISO),
  mkAnswers(SID, TAG, 1, 3, 0, day1LastISO),
  mkAnswers(OTHER, TAG, 0, 2, 0, day0LastISO),
  mkAnswers(SID, '_w1', 0, 2, 0, '2026-10-08T10:00:00.000Z'));
const writeDevice = (answers, checkins) => {
  lsData['eng_hw_v6'] = JSON.stringify({
    answers: answers, checkins: checkins || {}, errorBook: [], students: [],
    parentStudents: {}, classes: [], deletedPhones: [], deletedClasses: [],
    revivedPhones: [], revivedClasses: [],
  });
  reopen();
};
writeDevice(seed, {});
ok(day0Total > 0, '本周第 0 天有 ' + day0Total + ' 道题（口径与 App._countDayQuestions 一致）');

console.log('== 3) getAnswers 认周标记（v122 之前恒返回 []）==');
Api.getAnswers(SID, 0).then(rows => {
  ok(rows.length === day0Total,
    '第 0 天取到 ' + rows.length + ' 条本机答案（应 ' + day0Total + '）—— 不再是一条都没有');
  ok(rows.every(r => r.studentId === SID), '取到的都是这个学生的');
}).catch(() => ok(false, 'getAnswers 抛错'));
Api.getAnswers(SID, 5).then(rows => {
  ok(rows.length === 0, '没做过的那天仍然是 0 条（别的学生的记录不会被算进来）');
});

console.log('== 4) saveCheckin 真的会写下来，数字对得上 ==');
Api.saveCheckin(SID, 0, day0Total, { name: '陈皓铭-Yusuf', phone: '13259532902', klass: '少儿英语A班' })
  .then(rec => {
    ok(!!rec, 'saveCheckin 返回了记录（以前这里 return null —— 打卡永远写不下来）');
    if (!rec) return;
    ok(rec.done === true && rec.completed === 'full',
      day0Total + ' 题全答完 → 已打卡（done=true）');
    ok(rec.answered === day0Total, 'answered = ' + rec.answered);
    ok(rec.wrongCount === 1, '错题数 = 1');
    ok(rec.correctRate === Math.round((day0Total - 1) / day0Total * 100),
      '正确率 = ' + rec.correctRate + '%（按本机答案算）');
    ok(rec.time === hhmm(day0LastISO),
      '完成时间 = 最后一次答题的时刻 ' + hhmm(day0LastISO) + '（不是"现在"）');
    ok(!!ck(0) && ck(0).done === true, '确实写进了本机 checkins（渲染读的就是这份）');
    const posted = calls.filter(c => c.url.indexOf('/api/checkins/report') >= 0);
    ok(posted.length === 1, '同步报了一次后台');
    ok(posted[0].body.student_id === SID && posted[0].body.day_idx === 0,
      '上报的是这个学生这一天的');
    ok(posted[0].body.finish_time === hhmm(day0LastISO), '上报里带上了真实完成时间');
    ok(posted[0].body.student_name === '陈皓铭-Yusuf' && posted[0].body.student_class === '少儿英语A班',
      '上报里带上姓名与班级（D1 里能对上人）');
    ok(posted[0].body.week_idx === HOMEWORK_WEEK_IDX,
      '上报的周序号 = ' + HOMEWORK_WEEK_IDX + '（当前周）');
  })
  .catch(e => ok(false, 'saveCheckin 抛错：' + e.message))
  .then(() => {
    console.log('== 5) 没做完的天：partial，不能算已打卡 ==');
    return Api.saveCheckin(SID, 1, countDay(1), { name: '陈皓铭-Yusuf' });
  })
  .then(rec => {
    ok(!!rec && rec.done === false && rec.completed === 'partial',
      '只答了 3 题 → 进行中，不是已打卡');
    ok(!!rec && rec.answered === 3, 'answered = 3');
  })
  .catch(e => ok(false, '第 1 天 saveCheckin 抛错：' + e.message))
  .then(() => {
    console.log('== 6) repairCheckins：把历史几天补回来 ==');
    // 模拟"第 2 周起打卡一次都没写下来过"：清掉 checkins，只留答案
    writeDevice(seed, {});
    calls.length = 0;
    const totals = HOMEWORK_DATA.map((d, di) => countDay(di));
    const n = Api.repairCheckins(SID, totals, { name: '陈皓铭-Yusuf', klass: '少儿英语A班' });
    ok(n === 2, '补出 2 天（第 0 天、第 1 天），没答案的天不管：实际 ' + n);
    ok(!!ck(0) && ck(0).done === true && ck(0).answered === day0Total, '第 0 天补成已打卡');
    ok(!!ck(0) && ck(0).time === hhmm(day0LastISO),
      '第 0 天的完成时间仍是 10-12 那天答完的时刻 ' + hhmm(day0LastISO) + '（没用"现在"覆盖）');
    ok(!!ck(1) && ck(1).done === false && ck(1).answered === 3, '第 1 天补成进行中');
    ok(calls.filter(c => c.url.indexOf('/api/checkins/report') >= 0).length === 2,
      '补出来的 2 天各报了一次后台');
    ok(!allKeys().some(k => k.indexOf(OTHER) === 0), '别人的答案不会被补成自己的打卡');
    ok(!allKeys().some(k => k.indexOf('_w1') >= 0),
      '上周的答案不会被补成本周的打卡（周标记隔离）');

    console.log('== 7) repairCheckins 幂等、且只增不减 ==');
    calls.length = 0;
    ok(Api.repairCheckins(SID, totals, {}) === 0, '再补一次：0 天（已经对的不动）');
    ok(calls.length === 0, '也不会重复上报');
    // 本机答案被清掉一半（换设备的常见情况）：已打过的卡不能退回未打卡
    const half = {};
    Object.keys(seed).forEach(k => { if (k.indexOf('_q0') >= 0 || k.indexOf('_q1') >= 0) return; half[k] = seed[k]; });
    writeDevice(half, JSON.parse(JSON.stringify(Store.doc().checkins)));
    ok(Api.repairCheckins(SID, HOMEWORK_DATA.map((d, di) => countDay(di)), {}) === 0,
      '答案变少时不重写、更不降级');
    ok(!!ck(0) && ck(0).done === true, '已打卡仍然是已打卡（只增不减）');
  })
  .catch(e => ok(false, 'repairCheckins 抛错：' + e.message))
  .then(() => {
    console.log('== 8) app.js：打开 App 会调用补录 ==');
    ok(/_dayTotals\(\) \{/.test(appSrc), 'App._dayTotals 存在（算每天题数）');
    ok(/Api\.repairCheckins\(sid, this\._dayTotals\(\), who\)/.test(appSrc),
      '_backfillCheckins 里先按本机答案重算打卡');
    ok(/repairCheckins failed:/.test(appSrc), '补录失败不会影响孩子答题（try/catch 吞掉）');
    const iRepair = appSrc.indexOf('Api.repairCheckins(sid');
    const iUp = appSrc.indexOf('Api.reportCheckin(Object.assign({}, rec');
    ok(iRepair > 0 && iUp > 0 && iRepair < iUp, '先补算再上报（顺序不能反）');

    console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
    process.exit(fail === 0 ? 0 : 1);
  });
