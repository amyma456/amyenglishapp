/* eslint-disable */
// 打卡记录上后台（v120）回归校验。
//
// 家长 2026-10-14 原话：「孩子们打卡的记录在孩子端这边显示都是未打卡。比如
// 以陈浩铭-优素福打卡的情况来看，他今天 10 月 14 号全部都打卡了，但是这个
// 显示的还是未打卡，完成时间、正确率、错题数都没有同步过来。这些是要写在
// 后台的吧，给我更新在后台。」
//
// 根因：answers / checkins 从来没上过后端 —— CloudSync.up() 的 payload 只带
// students / classes / 墓碑，打卡只写在各自手机的 localStorage 里。
//
// 这个脚本钉住四件事：
//   1. D1 有 checkins 表（一周一天一行，student_id + week_idx + day_idx 主键）
//   2. worker 有上报/读取接口，且 UPSERT **只增不减**（旧快照不能把已打卡抹回）
//   3. api.js 在 saveCheckin 之后上报，fetchCheckins 失败返回 null（不是 []）
//   4. app.js 的合并规则：云端更完整的覆盖本机，本机更完整的留住
//      并且 renderMyProgress / renderCompare 真的能据此显示"已打卡 / x/7 / 正确率"
//
// 用法：node tools/verify-checkin-cloud.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
const ROOT = path.join(__dirname, '..') + path.sep;

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FAIL ') + msg); if (!cond) fail++; };

const appSrc = fs.readFileSync(BASE + 'app.js', 'utf8');
const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');
const workerSrc = fs.readFileSync(ROOT + 'worker' + path.sep + 'src' + path.sep + 'index.js', 'utf8');
const schemaSrc = fs.readFileSync(ROOT + 'worker' + path.sep + 'schema.sql', 'utf8');

// =========================================================================
console.log('== 1) D1 表结构 ==');
ok(/CREATE TABLE IF NOT EXISTS checkins/.test(schemaSrc), 'schema.sql 里有 checkins 表');
ok(/PRIMARY KEY \(student_id, week_idx, day_idx\)/.test(schemaSrc),
  '主键是 (student_id, week_idx, day_idx) —— 一个学生一周一天一行');
['student_name', 'student_phone', 'student_class', 'done', 'completed', 'answered',
 'total', 'correct_rate', 'wrong_count', 'finish_time', 'updated_at'].forEach(c => {
  ok(new RegExp('\\b' + c + '\\b').test(schemaSrc), '列 ' + c + ' 在表里');
});
ok(/idx_checkins_class_week/.test(schemaSrc), '按班级+周建了索引（孩子端读全班要用）');

// =========================================================================
console.log('== 2) worker 接口 ==');
ok(/async function checkinsApi\(/.test(workerSrc), 'checkinsApi 存在');
ok(/path === '\/api\/checkins\/report' && request\.method === 'POST'/.test(workerSrc),
  'POST /api/checkins/report（学生上报）');
ok(/path === '\/api\/checkins' && request\.method === 'GET'/.test(workerSrc),
  'GET /api/checkins（读取）');
ok(/url\.pathname\.startsWith\('\/api\/checkins'\)/.test(workerSrc), '路由已挂到 fetch 上');
ok(/ensureCheckinsTable\(db\)/.test(workerSrc),
  'worker 运行时会自建表（与 tts_usage 同一套路，漏跑 migration 也不会 500）');
// 只增不减：这是"旧快照把已打卡抹回未打卡"的唯一防线
ok(/done\s*=\s*MAX\(checkins\.done, excluded\.done\)/.test(workerSrc),
  'done 取两者较大值 —— 已打卡不会被旧快照抹回"未打卡"');
ok(/answered\s*=\s*MAX\(checkins\.answered, excluded\.answered\)/.test(workerSrc),
  'answered 取较大值');
ok(/excluded\.answered >= checkins\.answered[\s\S]{0,120}correct_rate/.test(workerSrc),
  '正确率/错题数取"答题数更多"的那一份（更完整的那次）');
// 读取要带过滤，且不能把手机号发回去
ok(/if \(!cls && !sid\) return json\(\{ error: 'missing_filter' \}, 400\)/.test(workerSrc),
  '读取必须指定 class 或 student_id，不支持无条件全表扫');
const checkinCols = workerSrc.match(/const CHECKIN_COLS =[\s\S]*?;/);
ok(checkinCols && checkinCols[0].indexOf('student_phone') < 0,
  '返回的列里没有 student_phone —— 页面上本来就只展示姓名+完成情况');
ok(/student_phone: row\.student_phone/.test(workerSrc) === false,
  '映射后的 row 里也没把手机号透出去');
// 读列表和写列表必须分开：共用一份"不含 phone"的列表时 INSERT 直接报
// "14 values for 13 columns: SQLITE_ERROR"（v120 实测踩过）。
const writeCols = workerSrc.match(/const CHECKIN_WRITE_COLS =[\s\S]*?;/);
ok(writeCols && writeCols[0].indexOf('student_phone') >= 0,
  '写入列含 student_phone（要存进去，只是读的时候不给）');
ok(/INSERT INTO checkins \(\$\{CHECKIN_WRITE_COLS\}\)/.test(workerSrc),
  'INSERT 用的是写入列（不与读取列共用）');
const nWrite = (writeCols[0].match(/,/g) || []).length + 1;
const nVals = (workerSrc.match(/const CHECKIN_WRITE_VALUES =[\s\S]*?;/) || [''])[0]
  .split('?').length - 1;
ok(nWrite === nVals, '写入列数 ' + nWrite + ' == 占位符数 ' + nVals + '（SQL 不会报列数不符）');

// =========================================================================
console.log('== 3) api.js 上报与读取 ==');
ok(/this\.reportCheckin\(rec, who\);/.test(apiSrc), 'saveCheckin 之后会上报（fire-and-forget）');
ok(/async saveCheckin\(studentId, dayIdx, totalQuestions, who\)/.test(apiSrc),
  'saveCheckin 接受 who（姓名/手机号/班级）');
ok(/reportCheckin\(rec, who\) \{/.test(apiSrc), 'reportCheckin 存在');
['student_id', 'student_name', 'student_phone', 'student_class', 'week_idx', 'day_idx',
 'done', 'answered', 'total', 'correct_rate', 'wrong_count', 'finish_time'].forEach(f => {
  ok(new RegExp('\\b' + f + ':').test(apiSrc), '上报字段 ' + f + ' 带上');
});
ok(/\/api\/checkins\/report/.test(apiSrc), '打到 /api/checkins/report');
ok(/catch\(e => \{ console\.warn\('reportCheckin failed:', e\); return null; \}\)/.test(apiSrc),
  '上报失败吞掉 —— 打卡上报不能影响孩子答题');
// fetchCheckins：失败必须返回 null，不能返回 []（"没读到"≠"没打卡"）
ok(/async fetchCheckins\(opts\)/.test(apiSrc), 'fetchCheckins 存在');
ok(/else return null;/.test(apiSrc) && /if \(!res\.ok\) return null;/.test(apiSrc),
  'fetchCheckins 失败返回 null（不是 []），调用方能区分"没读到"和"没打卡"');
ok(/Array\.isArray\(data\.rows\)\) \? data\.rows : null/.test(apiSrc),
  '响应不是 rows 数组时也返回 null');

// =========================================================================
// 装载 app.js，验证合并与渲染
function el(tag) {
  const e = {
    tagName: tag || 'div', _cls: new Set(), style: {}, _attrs: {}, value: '',
    innerHTML: '', textContent: '', disabled: false,
    classList: { add: (...c) => c.forEach(x => e._cls.add(x)),
                 remove: (...c) => c.forEach(x => e._cls.delete(x)),
                 toggle: (c, on) => (on ? e._cls.add(c) : e._cls.delete(c)),
                 contains: c => e._cls.has(c) },
    querySelector: () => null, querySelectorAll: () => [], appendChild: () => {},
    insertAdjacentHTML: (p, h) => { e.innerHTML += h; }, removeChild: () => {},
    setAttribute: (k, v) => { e._attrs[k] = String(v); },
    getAttribute: k => (k in e._attrs ? e._attrs[k] : null),
    removeAttribute: k => { delete e._attrs[k]; },
    remove: () => {}, scrollIntoView: () => {}, play: () => Promise.resolve(),
    focus: () => {}, click: () => {}, addEventListener: () => {}, removeEventListener: () => {},
  };
  return e;
}
const byId = {};
const getEl = id => (byId[id] = byId[id] || el('div'));
const document = {
  getElementById: getEl, querySelector: () => null, querySelectorAll: () => [],
  createElement: el, addEventListener: () => {}, removeEventListener: () => {},
  body: el('body'), documentElement: el('html'), hidden: false,
  visibilityState: 'visible', readyState: 'complete',
};
const lsData = {};
const localStorage = {
  getItem: k => (k in lsData ? lsData[k] : null),
  setItem: (k, v) => { lsData[k] = String(v); },
  removeItem: k => { delete lsData[k]; },
};
const window = {
  addEventListener: () => {}, removeEventListener: () => {},
  speechSynthesis: null, location: { search: '', href: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
const navigator = { userAgent: 'node', onLine: true, language: 'zh-CN' };
const posted = [];
const Api = {
  answerKey: (sid, d, m, q) => sid + '_d' + d + '_m' + m + '_q' + q,
  checkinKey: (sid, d) => sid + '_d' + d,
  warmup: () => {}, isFillerTranscript: () => false,
  saveAnswer: async () => ({ recorded: true }),
  saveCheckin: async () => ({}),
  reportCheckin: (rec, who) => { posted.push({ rec: rec, who: who }); return Promise.resolve({ ok: true }); },
  reportWrongQuestion: async () => ({}),
  submitSpeakingScore: () => Promise.resolve({}),
  uploadRecording: () => Promise.resolve({}),
  dict: async () => null, transcribe: async () => ({ text: '' }),
  load: async () => ({ answers: {}, checkins: {} }),
  getAnswers: async () => [], loadWrongCache: async () => {},
  saveLearnedWords: async () => ({}),
  fetchCheckins: async () => null,
};
const Recorder = {
  supported: () => true, warmUp: () => {}, start: async () => {},
  stop: async () => ({ blob: {}, samples: null }), join: () => null,
  padForAsr: () => null, level: () => 0,
};

const dataSrc = fs.readFileSync(BASE + 'data.js', 'utf8');
const HOMEWORK_DATA = new Function(dataSrc + '; return HOMEWORK_DATA;')();
// 周序号也一起注入 —— 不注入的话沙箱里 _weekTag() 恒为空串，本机 key 永远长
// 成 <sid>_dM 的"第 1 周"形状，_wN 那条路（第 2 周起）就一次都没被跑过。
const HOMEWORK_WEEK_IDX = new Function(dataSrc + '; return HOMEWORK_WEEK_IDX;')();
process.on('unhandledRejection', () => {});

const factory = new Function('stubs', `
  const { document, window, location, navigator, localStorage, Api, Recorder,
          HOMEWORK_DATA, HOMEWORK_WEEK_IDX, URL, fetch, Cloud, SpeechRecognition, Audio, alert,
          confirm, prompt, requestAnimationFrame } = stubs;
  ${appSrc}
  return { App };
`);
let App;
try {
  App = factory({
    document, window, location: window.location, navigator, localStorage, Api, Recorder,
    HOMEWORK_DATA, HOMEWORK_WEEK_IDX,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
    Cloud: undefined, SpeechRecognition: undefined, Audio: undefined,
    alert: () => {}, confirm: () => true, prompt: () => '',
    requestAnimationFrame: cb => setTimeout(cb, 0),
  }).App;
} catch (e) {
  console.log('app.js 装载失败：' + e.message);
  process.exit(1);
}

const SID = 'stu-yusuf';
App.state.role = 'student';
App.state.phone = '13259532902';
App.state.userName = '陈皓铭-Yusuf';
App.state.className = '少儿英语A班';
App.state.students = [
  { id: SID, phone: '13259532902', name: '陈皓铭-Yusuf', class: '少儿英语A班' },
  { id: 'stu2', phone: '13900000002', name: '田墨翰-Matt', class: '少儿英语A班' },
];
App.state.checkins = {};
App.isTeacher = function () { return this.state.role === 'teacher'; };
App.showToast = () => {};

const TAG = App._weekTag();
const kOf = (sid, di) => sid + TAG + '_d' + di;

console.log('== 4) 合并规则：云端更完整的覆盖本机 ==');
let n = App._mergeCloudCheckins([
  { student_id: SID, day_idx: 0, done: true, completed: 'full', answered: 12, total: 12,
    correct_rate: 92, wrong_count: 1, finish_time: '19:20' },
  { student_id: SID, day_idx: 1, done: true, completed: 'full', answered: 10, total: 10,
    correct_rate: 80, wrong_count: 2, finish_time: '20:05' },
]);
ok(n === 2, '两条云端记录被采纳（合并 ' + n + ' 条）');
ok(App.state.checkins[kOf(SID, 0)].done === true, 'day0 → done=true');
ok(App.state.checkins[kOf(SID, 0)].correctRate === 92, 'day0 正确率 92 带过来');
ok(App.state.checkins[kOf(SID, 0)].wrongCount === 1, 'day0 错题数 1 带过来');
ok(App.state.checkins[kOf(SID, 0)].time === '19:20', 'day0 完成时间 19:20 带过来');

console.log('== 5) 不能把已打卡抹回未打卡 ==');
// 本机已经 done=true，云端来一条"进行中"的旧快照
App.state.checkins[kOf(SID, 2)] = { studentId: SID, dayIdx: 2, done: true, answered: 9,
  correctRate: 88, wrongCount: 1, time: '18:00' };
const before = App.state.checkins[kOf(SID, 2)].correctRate;
App._mergeCloudCheckins([
  { student_id: SID, day_idx: 2, done: false, completed: 'partial', answered: 3,
    total: 9, correct_rate: 33, wrong_count: 2, finish_time: '17:00' },
]);
ok(App.state.checkins[kOf(SID, 2)].done === true, '云端旧快照（未完成）压不掉本机的已打卡');
ok(App.state.checkins[kOf(SID, 2)].correctRate === before,
  '正确率也保持本机那份（本机答题数更多：9 > 3）');

console.log('== 6) 失败不能污染本机数据 ==');
const snapshot = JSON.stringify(App.state.checkins);
ok(App._mergeCloudCheckins(null) === 0, 'null（拉取失败）→ 合并 0 条');
ok(App._mergeCloudCheckins(undefined) === 0, 'undefined → 合并 0 条');
ok(JSON.stringify(App.state.checkins) === snapshot, '两边数据一字未动');

console.log('== 7) 渲染：孩子打卡页真的显示已打卡 ==');
const prof = App.renderMyProgress();
const doneDays = HOMEWORK_DATA.filter((d, di) => {
  const ck = App.state.checkins[kOf(SID, di)];
  return ck && ck.done;
}).length;
ok(doneDays >= 2, '统计出 ' + doneDays + ' 天已完成');
ok(prof.indexOf('已打卡') >= 0, '页面上出现"已打卡"（不再是清一色"未打卡"）');
ok(prof.indexOf('92%') >= 0 || prof.indexOf('88%') >= 0, '正确率显示出来了');
ok(prof.indexOf('19:20') >= 0, '完成时间显示出来了');
ok(prof.indexOf('badge-danger">未打卡') >= 0 || doneDays === HOMEWORK_DATA.length,
  '剩下的天数仍然老实显示"未打卡"（没全绿）');

console.log('== 8) 渲染：完成率对比的 x/7 与平均正确率 ==');
const cmp = App.renderCompare();
ok(cmp.indexOf('/' + HOMEWORK_DATA.length) >= 0, '完成天数按 x/' + HOMEWORK_DATA.length + ' 显示');
// 只看优素福那一行 —— 另一个学生确实没打卡，显示 0/7 是对的。
const yusufRow = cmp.split('<tr').find(r => r.indexOf('陈皓铭-Yusuf') >= 0) || '';
ok(yusufRow.indexOf('0/' + HOMEWORK_DATA.length) < 0,
  '优素福那一行不再出现 0/' + HOMEWORK_DATA.length + '（这正是家长看到的"完成天数都是 0-7"）');
ok(yusufRow.indexOf(doneDays + '/' + HOMEWORK_DATA.length) >= 0,
  '优素福那一行显示 ' + doneDays + '/' + HOMEWORK_DATA.length);
ok(/\d+%/.test(cmp), '平均正确率有具体数字');
// 每日打卡状态：应出现打勾
ok(cmp.indexOf('checkin-dot done') >= 0 || cmp.indexOf('checkin-dot  done') >= 0
   || /checkin-dot [^"]*done/.test(cmp),
  '每日打卡状态里出现 ✓（原来从 10-13 到 10-14 全是 ✗）');

console.log('== 9) 拉取时机与历史补录 ==');
ok(/_pullCloudCheckins\(/.test(appSrc), '_pullCloudCheckins 存在');
ok(/const needsCheckins = \['myprogress', 'compare', 'daily', 'checkin', 'scores'\]/.test(appSrc),
  '孩子端 myprogress/compare 与老师端 daily/checkin/scores 都会先拉后台');
ok(/await this\._pullCloudCheckins\(tab === 'myprogress' \? 'me' : 'class'\)/.test(appSrc),
  '进 tab 时同步拉一次（渲染函数是同步的，不先拉就只能看到本机那份）');
ok(/_backfillCheckins\(\)/.test(appSrc), '历史补录存在');
ok(/this\._backfillCheckins\(\);/.test(appSrc), 'showApp 里会补报一次');
// 真跑一次补录
App._backfilled = false;
posted.length = 0;
App.state.checkins = {};
App.state.checkins[kOf(SID, 0)] = { studentId: SID, dayIdx: 0, done: true, answered: 12,
  total: 12, correctRate: 92, wrongCount: 1, time: '19:20' };
const bn = App._backfillCheckins();
ok(bn === 1 && posted.length === 1, '本机那 1 条历史打卡被推到后台');
ok(posted[0] && posted[0].who && posted[0].who.name === '陈皓铭-Yusuf',
  '补报带上姓名（D1 里能对上人）');
ok(posted[0] && posted[0].who.klass === '少儿英语A班', '补报带上班级');
ok(App._backfillCheckins() === 0, '一次会话只补一次，不反复发请求');

console.log('== 10) 回到"孩子打卡"页能从后台拿回数据 ==');
App._mergeCloudCheckins([{ student_id: SID, day_idx: 3, done: true, answered: 8,
  total: 8, correct_rate: 100, wrong_count: 0, finish_time: '21:10' }]);
ok(App.state.checkins[kOf(SID, 3)].done === true, '新拉到的第 4 天也是已打卡');

// =========================================================================
// v121：家长 2026-10-14 又说「我看没有改善……我也下拉刷新了」。
// 真正的原因不是代码没生效，而是**后台一条打卡都没有**：孩子的手机还没
// 打开过新版。所以这一节钉两件事：
//   A. 孩子只要打开一次 App，本机**所有周**的打卡都得推上去（不能只推本周）
//   B. 老师端要能一眼看出"后台收到几条 / 还有谁没上传"，并且有刷新按钮
// =========================================================================
console.log('== 11) key 解析：<sid>_wN_dM 与 <sid>_dM 两种形状 ==');
App.state.checkins = {};
const slot1 = App._checkinKeySlot(SID + '_w2_d3', SID);
ok(slot1 && slot1.weekIdx === 2 && slot1.dayIdx === 3, '第 2 周第 3 天 → {week:2, day:3}');
const slot0 = App._checkinKeySlot(SID + '_d0', SID);
ok(slot0 && slot0.weekIdx === 0 && slot0.dayIdx === 0,
  '第 1 周不写 _w（_weekTag 对 0 返回空串）→ {week:0, day:0}');
ok(App._checkinKeySlot('someone-else_w2_d1', SID) === null, '别人的 key → null（不报别人的卡）');
ok(App._checkinKeySlot(SID + '_w2_d', SID) === null, '形状不认识 → null（宁可不报也不报错数据）');
ok(App._checkinKeySlot('', SID) === null && App._checkinKeySlot(SID + '_w2_d1', '') === null,
  '空 key / 空 sid → null');

console.log('== 12) 补报历史：本机所有周都推上去，周序号跟着 key 走 ==');
App.state.role = 'student';
App.state.checkins = {};
App.state.checkins[SID + '_d0'] = { studentId: SID, dayIdx: 0, done: true, answered: 5,
  total: 5, correctRate: 100, wrongCount: 0, time: '18:00' };
App.state.checkins[SID + '_w1_d2'] = { studentId: SID, dayIdx: 2, done: true, answered: 7,
  total: 7, correctRate: 86, wrongCount: 1, time: '19:30' };
App.state.checkins[kOf(SID, 1)] = { studentId: SID, dayIdx: 1, done: true, answered: 9,
  total: 9, correctRate: 88, wrongCount: 1, time: '20:10' };
// 别人的卡混进来 —— 一条都不许报
App.state.checkins['stu2' + TAG + '_d0'] = { studentId: 'stu2', dayIdx: 0, done: true,
  answered: 4, total: 4, correctRate: 75, wrongCount: 1, time: '21:00' };
App._backfilled = false;
posted.length = 0;
const bn2 = App._backfillCheckins();
ok(bn2 === 3 && posted.length === 3,
  '本机 3 条（跨两个历史周 + 本周）全部补报，别人的那条被跳过');
// 直接把"报上去的 (周,天) 集合"和本机那三条对齐 —— 一条不多、一条不少、
// 一条不错位。别人那条要是漏进来就会多出第 4 个元素。
const got = posted.map(p => p.rec.weekIdx + ':' + p.rec.dayIdx).sort();
const want = ['0:0', '1:2', App._weekIdx() + ':1'].sort();
ok(got.join(' ') === want.join(' '),
  '报上去的 (周,天) 正好是本机那 3 条：' + got.join(' ') + '（应 ' + want.join(' ') + '）');
ok(posted.every(p => p.rec.studentId === SID), '三条都用孩子自己的 student_id');
ok(!posted.some(p => p.rec.studentId === 'stu2'), '没把别人的卡记到自己名下');

console.log('== 13) reportCheckin 必须认 rec.weekIdx（这一条是 v121 的真 bug） ==');
const bodyWeek = apiSrc.match(/week_idx:\s*\(typeof rec\.weekIdx === 'number'\)[\s\S]{0,80}/);
ok(!!bodyWeek, '上报体的 week_idx 优先取 rec.weekIdx');
ok(/const curWeek = \(typeof HOMEWORK_WEEK_IDX === 'number'\)/.test(apiSrc),
  '没有 rec.weekIdx 时退回当前周（saveCheckin 的实时上报还走这条）');

console.log('== 14) 回到前台会再补一次（孩子不用做任何操作） ==');
ok(/_bindCheckinUpload\(\)/.test(appSrc), '_bindCheckinUpload 存在');
ok(/this\._bindCheckinUpload\(\);/.test(appSrc), 'showApp 里绑上');
['visibilitychange', 'focus', 'pageshow'].forEach(ev => {
  ok(new RegExp("addEventListener\\('" + ev + "'").test(appSrc),
    '监听 ' + ev + '（切出去又切回来，上一次没发成的补一次）');
});
ok(/_checkinKeeperBound/.test(appSrc), '只绑一次，不重复挂监听');
ok(/Date\.now\(\) - last < 60000/.test(appSrc), '60 秒节流，不在 App 里切来切去就狂发请求');
ok(/this\._backfilled = false;[\s\S]{0,60}this\._backfillCheckins\(\);/.test(appSrc),
  '重进前台先把"补过一次"的闸门打开再补');

console.log('== 15) 老师端：一个账号看全班 + 看得见谁还没上传 ==');
App.state.role = 'teacher';
App.state.checkins = {};
// 只有优素福上传了（fromCloud 由 _mergeCloudCheckins 打）
App._mergeCloudCheckins([
  { student_id: SID, day_idx: 0, done: true, answered: 10, total: 10, correct_rate: 90,
    wrong_count: 1, finish_time: '19:20', updated_at: '2026-10-14T11:20:00.000Z' },
  { student_id: SID, day_idx: 1, done: true, answered: 10, total: 10, correct_rate: 80,
    wrong_count: 2, finish_time: '20:05', updated_at: '2026-10-14T12:05:00.000Z' },
]);
const strip = App._checkinSyncStrip();
ok(strip.indexOf('数据来自后台') >= 0, '说明数据来自后台（不是老师本机攒的）');
ok(/收到 <b>2<\/b> 条/.test(strip), '报出后台本周实际收到 2 条');
ok(strip.indexOf('还没上传的 <b>1</b> 位') >= 0, '点名"还没上传的 1 位"');
ok(strip.indexOf('田墨翰-Matt') >= 0, '把没上传的孩子名字列出来（家长知道该找谁）');
ok(strip.indexOf('打开一次 App') >= 0, '说清补救动作：打开一次 App 就自动上传');
ok(strip.indexOf('重新拉取') >= 0, '有「🔄 重新拉取」按钮（不用下拉刷新）');
// 老师本机自己点出来的记录不算"已上传"
App.state.checkins['stu2' + TAG + '_d0'] = { studentId: 'stu2', dayIdx: 0, done: true,
  answered: 3, correctRate: 100, wrongCount: 0, time: '10:00' };
ok(App._checkinSyncStrip().indexOf('田墨翰-Matt') >= 0,
  '本机非云端记录不算"已上传"（否则会假报全班都传了）');
// 全班都上传了就直说
App._mergeCloudCheckins([
  { student_id: 'stu2', day_idx: 0, done: true, answered: 6, total: 6, correct_rate: 100,
    wrong_count: 0, finish_time: '18:30', updated_at: '2026-10-14T13:00:00.000Z' },
]);
const strip2 = App._checkinSyncStrip();
ok(strip2.indexOf('都已有记录') >= 0 && strip2.indexOf('还没上传') < 0,
  '全班都有记录时显示"都已有记录"，不再吓人');
// 渲染整页要带上这条
const checkinPage = App.renderCheckin();
ok(checkinPage.indexOf('数据来自后台') >= 0, '「打卡监控」整页里带上了这条');
ok(checkinPage.indexOf('重新拉取') >= 0, '整页里也有刷新按钮');

console.log('== 16) 刷新按钮 ==');
ok(/async refreshCheckins\(btn\)/.test(appSrc), 'refreshCheckins 存在');
ok(/await this\._pullCloudCheckins\('class'\)/.test(appSrc),
  '点刷新会重新拉后台（老师端按班级拉，遍历所有班）');
ok(/btn\.disabled = true[\s\S]{0,120}正在拉取/.test(appSrc), '拉的过程中按钮禁用 + 提示，防连点');
ok(/catch \(e\) \{[\s\S]{0,200}btn\.disabled = false/.test(appSrc),
  '拉失败要把按钮恢复（断网不能把界面卡死）');
ok(appSrc.indexOf('for (const c in App)') < 0, '（无副作用检查）');

console.log(fail === 0 ? '\n全部通过 ✅' : '\n有 ' + fail + ' 项失败 ❌');
process.exit(fail === 0 ? 0 : 1);
