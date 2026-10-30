// tools/verify-v160.js — 题库预览刷新后停在预览页（原样回到同一天同一周）
// 老师 2026-10-27：原来 'preview' 被排除在 _restoreTab 名单外，刷新被踢回周计划。
// v160：previewDay/previewWeek 持久化到 amy_last_preview，showApp 里接回来。
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

section('4. 版本号 v160');
{
  ok(htmlSrc.includes('app-version" content="171"'), 'index.html app-version=160');
  ok(/\.js\?v=171/.test(htmlSrc), 'index.html 资源 ?v=171');
  ok(swSrc.includes('amy-english-v171') && /var V = 171;/.test(swSrc), 'sw.js 版本 160');
  ok(!/content="159"|\?v=159|amy-english-v159/.test(htmlSrc + swSrc), '无 159 残留');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
