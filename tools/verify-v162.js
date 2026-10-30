// tools/verify-v162.js — 打卡数据一致性根治
// 家长 2026-10-28：「无论怎么更新，所有端口看到的打卡数据永远一样」。
// v162 三层加固：1) worker 端周号闸门（不许超前/越界）；2) 上报带 client_ver；
// 3) 班级视图只读云端纯档 state.cloudCheckins（_clsCk）。
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
const dSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');

// 从 app.js 抽方法体，绑到stub对象上独立跑。
// 注意：_previewMemoryKey 是单行方法（结尾没有独立的 \n  }, 行），
// 按「下一个方法名」切边界才不会被相邻方法吞掉。
function between(a, b) {
  const s = appSrc.indexOf(a) + a.length;
  return appSrc.slice(s, appSrc.indexOf(b, s));
}

section('1. 预览位置持久化（amy_last_preview）');
{
  ok(appSrc.includes("_previewMemoryKey() { return 'amy_last_preview'; }"), '存档 key = amy_last_preview');
  ok(appSrc.includes('_savePreviewPos()'), '有 _savePreviewPos');
  // openPreview / previewGo 都落存档；closePreview 清掉
  const open = appSrc.slice(appSrc.indexOf('openPreview(dayIdx, weekOffset) {'), appSrc.indexOf('closePreview() {'));
  ok(/_savePreviewPos\(\)/.test(open), 'openPreview 保存预览位置');
  const close = appSrc.slice(appSrc.indexOf('closePreview() {'), appSrc.indexOf('previewGo(dayIdx, weekOffset) {'));
  ok(/_savePreviewPos\(\)/.test(close), 'closePreview 也走 _savePreviewPos（清掉）');
  const go = appSrc.slice(appSrc.indexOf('previewGo(dayIdx, weekOffset) {'), appSrc.indexOf('previewStep(delta) {'));
  ok(/_savePreviewPos\(\)/.test(go), 'previewGo（含一键翻天）每次都保存');
}

section('2. 存/取逻辑独立跑（stub localStorage）');
{
  const saveBody = between('_savePreviewPos() {', '_restorePreviewPos() {');
  const restoreBody = between('_restorePreviewPos() {', '\n  },');
  function make(store) {
    const o = { state: {}, getTodayWeekdayIdx: () => 2 };
    // 剥掉方法自身收口的  },  /  ;  （saveBody 会带上，restoreBody 不会）
    const wrap = s => '{' + s.trim().replace(/\s*},?\s*$/, '').replace(/;$/, '') + '}';
    // _previewMemoryKey 是单行方法，源码抽取会带上结尾的  },，直接硬编码
    new Function('obj', 'localStorage',
      "obj._previewMemoryKey = function() { return 'amy_last_preview'; };\n" +
      'obj._savePreviewPos = function() ' + wrap(saveBody) + ';\n' +
      'obj._restorePreviewPos = function() ' + wrap(restoreBody) + ';\n' +
      'return obj;')(o, store);
    return o;
  }
  const mem = {};
  const store = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
  const a = make(store);
  a.state.previewDay = 5; a.state.previewWeek = 1;
  a._savePreviewPos();
  ok(mem['amy_last_preview'] === '1|5', '存的是「周|天」= 1|5', mem['amy_last_preview']);
  const b = make(store);
  const pos = b._restorePreviewPos();
  ok(pos.w === 1 && pos.d === 5, '取回 w=1 d=5', JSON.stringify(pos));
  // 退出预览：previewDay=null → removeItem
  a.state.previewDay = null;
  a._savePreviewPos();
  ok(!('amy_last_preview' in mem), 'previewDay 为空时清掉存档');
  // 空存档 / 坏数据 → 回退到今天
  const c = make(store);
  const fb = c._restorePreviewPos();
  ok(fb.d === 2 && fb.w === 0, '无存档时回退到「今天」', JSON.stringify(fb));
  mem['amy_last_preview'] = 'garbage';
  const bad = make(store)._restorePreviewPos();
  ok(bad.d === 2 && bad.w === 0, '坏数据也回退到「今天」', JSON.stringify(bad));
  mem['amy_last_preview'] = '3|9';   // 周 3 / 天 9 都越界
  const oob = make(store)._restorePreviewPos();
  ok(oob.d === 2 && oob.w === 0, '越界数据回退到「今天」', JSON.stringify(oob));
}

section('3. 恢复名单与 showApp 接线');
{
  ok(/_restoreTab\(\) \{[\s\S]*?'students', 'classmgmt', 'preview'\]/.test(appSrc),
     '老师恢复名单加了 \'preview\'');
  // 学生名单不含 preview；print 仍不恢复（注释声明）
  const rt = appSrc.slice(appSrc.indexOf('// 登录不会跑到不存在的页'), appSrc.indexOf('showApp() {'));
  ok(/: \['today', 'myprogress', 'compare', 'myerrors'\]/.test(rt), '学生恢复名单不含 preview');
  // showApp 里接回来
  const sa = appSrc.slice(appSrc.indexOf('showApp() {'), appSrc.indexOf('showApp() {') + 3000);
  ok(/currentTab === 'preview' && this\.isTeacher\(\)/.test(sa), 'showApp：仅老师且停在预览时恢复');
  ok(/_restorePreviewPos\(\)/.test(sa), 'showApp 调 _restorePreviewPos');
  ok(/previewDay = pv\.d[\s\S]*previewWeek = pv\.w[\s\S]*currentDay = pv\.d/.test(sa),
     'previewDay/previewWeek/currentDay 三者都接回');
  ok(/'print' 仍然不恢复/.test(rt) || rt.includes("'print'"), 'print 仍不恢复（注释声明）');
}

section('4. 版本号 v162');
{
  ok(htmlSrc.includes('app-version" content="173"'), 'index.html app-version=161');
  ok(/\.js\?v=173/.test(htmlSrc), 'index.html 资源 ?v=173');
  ok(swSrc.includes('amy-english-v173') && /var V = 173;/.test(swSrc), 'sw.js 版本 161');
  ok(!/content="160"|\?v=160|amy-english-v160/.test(htmlSrc + swSrc), '无 160 残留');
}

section('5. v162 专项：云端纯档 + 班级视图只认后台');
{
  ok(appSrc.includes('state.cloudCheckins'), '有云端纯档 state.cloudCheckins');
  ok(appSrc.includes('this.state.cloudCheckins[k] = rec;'), '_mergeCloudCheckins 往云端纯档写原样记录');
  ok(appSrc.includes('_clsCk(sid, di)'), '有统一读取口 _clsCk');
  // 班级视图四处全部走 _clsCk
  const rc = appSrc.slice(appSrc.indexOf('renderCheckin() {'), appSrc.indexOf('// ===== Teacher: Score Analysis'));
  ok((rc.match(/_clsCk\(/g) || []).length >= 3, '打卡监控（统计+表格）走 _clsCk');
  const rs = appSrc.slice(appSrc.indexOf('renderScores() {'), appSrc.indexOf('// ===== Teacher: Error Book'));
  ok(/_clsCk\(s\.id, di\)/.test(rs), '成绩分析走 _clsCk');
  const cmp = appSrc.slice(appSrc.indexOf('renderCompare() {'), appSrc.indexOf('// ===== Invite ====='));
  ok((cmp.match(/_clsCk\(/g) || []).length >= 2, '完成率对比（排名+每日状态）走 _clsCk');
  const strip = appSrc.slice(appSrc.indexOf('_checkinSyncStrip() {'), appSrc.indexOf('// 老师版"刷新"'));
  ok(/_clsCk\(s\.id, di\)/.test(strip), '同步横幅数的是云端纯档');
  // _clsCk 必须只读云端档，绝不从混合的 checkins 里挑
  const clsCk = appSrc.slice(appSrc.indexOf('_clsCk(sid, di) {'), appSrc.indexOf('_clsCk(sid, di) {') + 600);
  ok(/cloudCheckins/.test(clsCk) && !/state\.checkins\[/.test(clsCk), '_clsCk 只读云端档');
}

section('6. v162 专项：worker 周号闸门 + client_ver');
{
  const wSrc = fs.readFileSync(path.join(ROOT, 'worker', 'src', 'index.js'), 'utf8');
  ok(wSrc.includes('serverHomeworkWeek'), 'worker 有自己的真实周号计算');
  ok(/CK_EPOCH_MS = Date\.UTC\(2026, 8, 27, 16, 0, 0\)/.test(wSrc),
     '锚点 = 2026-09-28 北京时间（=UTC 9-27 16:00），和 data.js 的 HOMEWORK_EPOCH 一致');
  ok(/weekIdx > serverWeek\) weekIdx = serverWeek/.test(wSrc), '报未来的周 → 按本周收（时钟错也不写歪）');
  ok(/dayIdx > 6\) return json\(\{ error: 'bad_day_idx' \}/.test(wSrc), '天数越界直接拒绝');
  ok(/client_ver/.test(wSrc) && /clientVer \|\| null/.test(wSrc), 'worker 存 client_ver');
  const apiSrc2 = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
  ok(/client_ver:\s*clientVer/.test(apiSrc2), '上报体带 client_ver');
  ok(/app-version/.test(apiSrc2), 'client_ver 取自 meta app-version');
}


section('7. v162 专项：周四 30 题（复数 / a-an / How much-many）');
{
  const fn = new Function(dSrc + '; return HOMEWORK_WEEKS;');
  const WEEKS = fn();
  const thu = WEEKS[4][3];
  ok(thu.day_en === 'Thursday', 'WEEK5[3] 是周四');
  const mids = thu.modules.map(m => m.id);
  ok(mids.join(',') === 'w5-thu-articles,w5-thu-muchmany,w5-thu-plural-fill,w5-thu-plural-choice',
     '周四 4 个新模块（旧听力/完形/时态已挪掉）');
  ok(!thu.modules.some(m => m.type === 'cloze' || m.type === 'reading'),
     '周四没有课文型模块 —— 30 题 = 30 真实动作（v155 约定）');
  const counts = thu.modules.map(m => (m.questions || []).length);
  ok(counts.reduce((a, b) => a + b, 0) === 30, '总题数 30（实际 ' + counts.reduce((a,b)=>a+b,0) + '）');
  ok(JSON.stringify(counts) === '[5,6,14,5]', '模块题数 5/6/14/5（实际 ' + counts.join('/') + '）');
  // 打字题：14 个复数答案全部小写、且都在预期清单里
  const expect = ['feet','teeth','children','mice','women','knives','leaves','shelves','countries','families','dishes','boxes','watches','sandwiches'];
  const fills = thu.modules[2].questions.map(q => q.answer);
  ok(JSON.stringify(fills) === JSON.stringify(expect), '14 个复数答案与清单一致');
  ok(fills.every(a => a === a.toLowerCase()), '打字题答案全部小写');
  // How much/many 打字题：6 题答案序列 many/much 对应 6 个名词
  const mm = thu.modules[1].questions;
  ok(JSON.stringify(mm.map(q => q.answer)) === JSON.stringify(['many','many','much','much','much','many']),
     'much/many 6 题答案序列正确');
  ok(mm.every(q => q.type === 'fill'), 'much/many 全部是打字题');
  // a/an 与复数选择题：每题 4 选项、answer 在范围内
  [0, 3].forEach(mi => thu.modules[mi].questions.forEach(q => {
    ok(q.options.length === 4 && q.answer >= 0 && q.answer < 4, q.id + ' 选项 4 个且 answer 越界检查');
  }));
}


console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
