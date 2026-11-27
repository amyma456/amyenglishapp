/* eslint-disable */
// v236 校验：
//   A. 后台新增 /api/class/removed-clear（老师专用）：清空整张被删名单，
//      但不写白名单——清掉的号码变回普通号码，再登录走「名单外→老师同意」。
//   B. 前端有调用方法 + 老师端「一键清空」按钮 + 确认弹窗讲清后果。
//   C. 真跑接口：非老师 403；老师调用后 removed 清空、白名单一个不动。
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const apiSrc = fs.readFileSync(path.join(root, 'public/api.js'), 'utf8');
const swSrc = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const workerSrc = fs.readFileSync(path.join(root, 'worker/src/index.js'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ok   ' + msg); }
  else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? '  [' + extra + ']' : '')); }
}
function section(s) { console.log('\n' + s); }

section('[1] 后台新接口源码断言');
{
  ok(/path === '\/api\/class\/removed-clear' && request\.method === 'POST'/.test(workerSrc),
    '★ removed-clear 接口存在（POST）');
  ok(/if \(!isTeacher\(body\)\) return json\(\{ error: 'forbidden' \}, 403\)/.test(
      workerSrc.slice(workerSrc.indexOf("path === '/api/class/removed-clear'"),
                     workerSrc.indexOf("path === '/api/class/unblock'"))),
    '★ 新接口只认老师号');
  const seg = workerSrc.slice(workerSrc.indexOf("path === '/api/class/removed-clear'"),
                              workerSrc.indexOf("path === '/api/class/unblock'"));
  ok(/DELETE FROM removed_students/.test(seg) && !/WHERE phone/.test(seg.split('DELETE FROM removed_students')[1].slice(0,20)),
    '★ DELETE removed_students 无 WHERE（清整张表）');
  // 只查真正的 SQL 语句（注释里提到"不加白名单"不算）——真跑测试下面也会验。
  const segCode = seg.split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
  ok(!/(INSERT|UPDATE|DELETE)\s+(OR\s+IGNORE\s+)?INTO?\s*approved_phones|DELETE FROM approved_phones/.test(segCode),
    '★ 新接口不写白名单 approved_phones（关键：号码不会直接放行）');
  ok(/UPDATE join_requests SET status = 'denied'.*WHERE status = 'pending'/.test(seg),
    '作废旧申请，避免清完从旧申请冒出来');
}

section('[2] 前端：调用方法 + 老师端按钮');
{
  ok(/async classRemovedClear\(\)/.test(apiSrc)
    && /\/api\/class\/removed-clear/.test(apiSrc), '★ api.js 有 classRemovedClear 方法');
  ok(/clearRemovedAll\(\)/.test(appSrc), '★ app.js 有 clearRemovedAll 方法');
  ok(/一键清空全部/.test(appSrc), '★ 老师端有「一键清空全部」按钮');
  ok(/跟新号码一样：登录时会在「名单外登录」里提醒你/.test(appSrc),
    '★ 确认弹窗讲清：清掉后走名单外、需老师同意');
  ok(/不会直接放进来/.test(appSrc), '★ 确认弹窗明说不会直接放行');
  ok(/this\.state\.removedPhones = \[\]/.test(appSrc), '清空后本地名单也清空并重绘');
}

section('[3] 真跑接口：抠 classApi 出来，用 D1 mock 验证');
{
  // 抠出 classApi 函数（从函数声明到文件里它结束的位置：下一个顶层注释块）
  const start = workerSrc.indexOf('async function classApi(');
  const end = workerSrc.indexOf('// ---------------------------------------------------------------------------', start);
  const fnSrc = workerSrc.slice(start, end > 0 ? end : undefined);
  ok(fnSrc.length > 1000, '成功抠出 classApi 函数体', fnSrc.length);

  // D1 mock：只实现新接口跑到的几条 SQL
  function makeD1() {
    const T = {
      removed: [{ phone: '13900139002', name: '小刚-Ken' }, { phone: '13259532902', name: '陈皓铭-Yusuf' }],
      approved: [{ phone: '15109549632', name: '正式学生' }],
      joinReq: [{ id: 'x1', phone: '13900139002', status: 'pending' }],
    };
    const db = {
      tables: T,
      prepare(sql) {
        const q = String(sql).replace(/\s+/g, ' ').trim();
        let args = [];
        const run = () => {
          if (/^CREATE TABLE IF NOT EXISTS (approved_phones|login_attempts)/.test(q)) return { changes: 0 };
          if (/^SELECT COUNT\(\*\) AS n FROM removed_students$/.test(q)) return { first: { n: T.removed.length } };
          if (/^DELETE FROM removed_students$/.test(q)) { const n = T.removed.length; T.removed = []; return { changes: n }; }
          if (/^UPDATE join_requests SET status = 'denied', resolved_at = \? WHERE status = 'pending'$/.test(q)) {
            let n = 0; T.joinReq.forEach(r => { if (r.status === 'pending') { r.status = 'denied'; n++; } });
            return { changes: n };
          }
          throw new Error('D1 替身不认识的 SQL：' + q);
        };
        return {
          bind(...a) { args = a; return this; },
          async first() { return run().first || null; },
          async all() { return { results: run().rows || [] }; },
          async run() { return Object.assign({ success: true }, run()); },
        };
      },
    };
    return db;
  }

  const json = (o, s) => ({ status: s || 200, body: o });
  const readJsonBody = async (req) => req._body;
  const isTeacher = (b) => b && b.teacher === '13259532991';
  const isTeacherPhone = (p) => p === '13259532991';
  const ensureRosterTables = async () => {};

  const classApi = new Function('json', 'readJsonBody', 'isTeacher', 'isTeacherPhone', 'ensureRosterTables',
    fnSrc + '; return classApi;')(json, readJsonBody, isTeacher, isTeacherPhone, ensureRosterTables);

  const mkEnv = () => {
    const db = makeD1();
    return { db, env: { DB: db } };
  };
  const mkUrl = () => ({ pathname: '/api/class/removed-clear', searchParams: new URLSearchParams() });

  (async () => {
    // 非老师 → 403
    {
      const { env } = mkEnv();
      const req = { method: 'POST', _body: { teacher: '13900139002', phone: 'x' } };
      const r = await classApi(req, mkUrl(), env);
      ok(r.status === 403, '★ 非老师调 removed-clear → 403', r.status);
    }
    // 老师 → 清空，白名单不动
    {
      const { db, env } = mkEnv();
      const req = { method: 'POST', _body: { teacher: '13259532991' } };
      const r = await classApi(req, mkUrl(), env);
      ok(r.status === 200 && r.body.ok, '老师调用成功', JSON.stringify(r.body));
      ok(db.tables.removed.length === 0, '★ 被删名单已清空', db.tables.removed.length);
      ok(db.tables.approved.length === 1 && db.tables.approved[0].phone === '15109549632',
        '★ 白名单一个没动（号码变回普通，不直接放行）');
      ok(db.tables.joinReq.every(x => x.status === 'denied'), '★ 旧的待申请已作废');
      ok(r.body.cleared === 2, '返回清掉的记录数', r.body.cleared);
    }
    finish();
  })().catch(e => { console.error('真跑接口异常:', e); fail++; finish(); });
}

function finish() {
  section('[4] 版本号 236');
  ok(/app-version" content="236"/.test(htmlSrc), 'index.html app-version=236');
  ok((htmlSrc.match(/\?v=236/g) || []).length >= 1, '静态资源 ?v=236 已刷');
  ok(/amy-english-v236/.test(swSrc) && /var V = 236;/.test(swSrc), 'sw.js 缓存版本 v236');
  ok(!/app-version" content="235"/.test(htmlSrc), '无残留 235');
  console.log('\n========================================');
  console.log('v236 校验结果：' + pass + ' 通过 / ' + fail + ' 失败');
  console.log('========================================');
  process.exit(fail ? 1 : 0);
}
