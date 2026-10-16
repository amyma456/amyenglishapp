// ===========================================================================
// v133 回归红线：删掉的学生**在任何列表里都不许再出现**
//
// 老师 2026-10-16 原话：
//   「这些学生名单删除了之后，还是存在少儿英语A班的田默涵，其中的118级登录的
//     这个账号，包括测试test这个账号，删除了仍然存在。我需要删除之后再也看不见。」
//
// 根因：renderStudents() 直接拿 this.state.students 渲染，**从不看拦截名单**。
// 删除做两件事 —— ①写后台拦截名单 ②从本机 students 摘掉。
// 只要 ② 因任何原因没落干净（另一台设备推回旧快照 / 本机 blob 残留 /
// 删除前刚注册过），记录就重新出现在页面上：后台明明拦着，老师眼里却"删不掉"。
//
// 本测试锁死：**拦截名单里有的手机号，一律不进任何学生列表。**
// ===========================================================================

const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label + (extra !== undefined ? '  → ' + extra : '')); }
}

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const appCode = appSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

function methodBody(src, name) {
  const cands = ['\n  async ' + name + '(', '\n  ' + name + '('];
  let start = -1;
  for (const t of cands) { const i = src.indexOf(t); if (i >= 0) { start = i; break; } }
  if (start < 0) return '';
  const rest = src.slice(start + 1);
  const re = /\n  (?:async )?[A-Za-z_$][\w$]*\s*\(/g;
  re.lastIndex = 1;
  const m = re.exec(rest);
  return m ? rest.slice(0, m.index) : rest;
}

// ===========================================================================
console.log('\n== ① renderStudents 必须按拦截名单做硬过滤 ==');
{
  const body = methodBody(appCode, 'renderStudents');
  ok(body.length > 400, '拿到 renderStudents 函数体', body.length + ' 字符');

  ok(/removedPhones/.test(body),
     '★★ renderStudents 读了拦截名单（removedPhones）');

  // 必须构造一个"已被删"的集合，并用它过滤
  ok(/gated/.test(body) && /new Set/.test(body),
     '★ 把拦截名单做成 Set（查找用）');

  ok(/filter\s*\(\s*s\s*=>[^)]*!\s*gated\.has/.test(body),
     '★★ 用 gated 做了 filter（把被删的人剔出去）');

  // all 必须是过滤后的结果，不能直接等于 state.students
  ok(!/const\s+all\s*=\s*this\.state\.students\s*\|\|\s*\[\]\s*;/.test(body),
     '★★ all 不再直接等于 state.students（必须经过过滤）');

  // pending / approved 都从过滤后的 all 来
  ok(/const\s+pending\s*=\s*all\.filter/.test(body),
     '★ 未分配区从过滤后的 all 出');
  ok(/const\s+approved\s*=\s*all\.filter/.test(body),
     '★ 已分配区从过滤后的 all 出');
}

// ===========================================================================
console.log('\n== ② 新学生横幅提醒也要过滤（否则"删了又弹提醒"） ==');
{
  const body = methodBody(appCode, '_currentPendingStudents');
  ok(body.length > 100, '拿到 _currentPendingStudents 函数体', body.length + ' 字符');
  ok(/removedPhones/.test(body), '★ 读了拦截名单');
  ok(/gated\.has/.test(body), '★ 做了过滤');
}

// ===========================================================================
console.log('\n== ③ 行为验证：被删的人不出现在任何一区 ==');
{
  // 复刻修复后的 renderStudents 过滤逻辑
  function partition(students, removedPhones) {
    const gated = new Set((removedPhones || []).map(g => g && g.phone).filter(Boolean));
    const all = (students || []).filter(s => s && s.phone && !gated.has(s.phone));
    return {
      all: all,
      pending: all.filter(s => !s.approved || !s.class),
      approved: all.filter(s => s.approved && s.class),
    };
  }

  const roster = [
    { id:'s1', name:'田默涵', phone:'118',        class:'少儿英语A班', approved:true },
    { id:'s2', name:'test',   phone:'13900000002', class:'少儿英语A班', approved:true },
    { id:'s3', name:'小明',   phone:'13900000003', class:'',            approved:false },
  ];

  // 情形 A：田默涵 和 test 已被删（在拦截名单里）
  const gatedA = [{ phone:'118', name:'田默涵' }, { phone:'13900000002', name:'test' }];
  const A = partition(roster, gatedA);
  ok(!A.all.some(s => s.phone === '118'),
     '★★ 田默涵 不在名单里', '还剩 ' + A.all.map(s=>s.name).join(','));
  ok(!A.all.some(s => s.phone === '13900000002'),
     '★★ test 不在名单里');
  ok(!A.approved.some(s => s.phone === '118'),
     '★ 田默涵 不在「已分配」区');
  ok(A.all.some(s => s.phone === '13900000003'),
     '★ 没被删的小明**还在**（没有误伤）');
  ok(A.approved.length === 0, '已分配区剩 0 人', A.approved.length);

  // 情形 B：拦截名单是空的 —— 谁都不该被过滤
  const B = partition(roster, []);
  ok(B.all.length === 3, '★ 拦截名单空 → 3 人都在', B.all.length);

  // 情形 C：拦截名单里有 null / 没 phone 的脏数据 —— 不许因此崩或误删
  const C = partition(roster, [null, { name:'没有手机号' }, undefined]);
  ok(C.all.length === 3, '★ 脏数据不会误伤任何人', C.all.length);

  // 情形 D：学生记录本身 phone 为空 —— 不许进任何列表（否则没法识别/删除）
  const D = partition([{ id:'x', name:'无号', phone:'', approved:false }], []);
  ok(D.all.length === 0, '★ 没有手机号的记录不进列表（免得不出来也删不掉）', D.all.length);

  // 情形 E：手机号是数字而不是字符串（118 这种）—— 类型不一致会导致 has() 失配
  const numRoster = [{ id:'n1', name:'数字号', phone:118, class:'A班', approved:true }];
  const E = partition(numRoster, [{ phone:118 }]);
  ok(!E.all.some(s => s.phone === 118),
     '★ 数字型手机号也能正确过滤（118 而非 "118"）',
     JSON.stringify(E.all));
}

// ===========================================================================
console.log('\n== ④ 拦截名单必须每轮同步都刷新（不然过滤用的是旧名单） ==');
{
  const body = methodBody(appCode, 'loadRemovedList');
  ok(body.length > 100, '拿到 loadRemovedList');
  ok(/classRemovedList/.test(body), '★ 从后台拉真名单');
  ok(/this\.state\.removedPhones\s*=/.test(body), '★ 写回 state.removedPhones');

  // 删除流程里必须再拉一次（删完立刻要看到效果）
  const dp = methodBody(appCode, 'deletePicked');
  ok(/await\s+this\.loadRemovedList\(\)/.test(dp),
     '★ deletePicked 删完立刻重拉名单');
  ok(/this\.renderContent\(\)/.test(dp),
     '★ deletePicked 删完立刻重绘');
}

// ===========================================================================
console.log('\n== ⑤ 删除仍然必须先落闸、再删人（不许退化成 fail-open） ==');
{
  const dp = methodBody(appCode, 'deletePicked');
  const gateIdx = dp.indexOf('classRemoveMany');
  const delIdx = dp.indexOf('Api.deleteStudent');
  ok(gateIdx > 0 && delIdx > gateIdx,
     '★★ 先写后台拦截，再动本机名单（顺序不许反过来）', 'gate@' + gateIdx + ' del@' + delIdx);
  ok(/verifyGated/.test(dp), '★ 写完回读核对');
  ok(/gateConfirmed/.test(dp), '★ 没坐实就不删（有 gateConfirmed 闸门）');
}

console.log('\n' + (fail === 0
  ? '全部通过 ✅  （' + pass + ' 项）'
  : pass + ' 项通过，' + fail + ' 项失败 ❌'));
process.exit(fail === 0 ? 0 : 1);
