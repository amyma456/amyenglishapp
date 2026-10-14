/* eslint-disable */
// 运维脚本：直接管后台的「登录拦截名单」（D1 removed_students）。
//
// 名单里的人，登录一律被拦住，必须老师同意才能进来 —— 这是家长定的永久规则，
// 所以这个脚本是给运维/助手用的，日常请让老师在老师端做（学生管理页点
// 「🔓 解除拦截」，或同意学生的入班申请）。
//
// 用法（默认只演练，打印要改什么，不动数据）：
//   node tools/ops-login-gate.js dump
//   node tools/ops-login-gate.js gate   11840843943 "田墨翰-Matt"  [--apply]
//   node tools/ops-login-gate.js ungate 11840843943               [--apply]
//
// 老师身份默认用 api.js 里白名单的第一个号；要换加 --teacher=1xxxxxxxxxx
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const apiSrc = fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8');
const TEACHER_PHONES = JSON.parse(
  (apiSrc.match(/const TEACHER_PHONES\s*=\s*(\[[^\]]*\])/) || [null, '[]'])[1].replace(/'/g, '"')
);
const BASE = 'https://amyeng.top';
const BACKUP_DIR = path.join('C:', 'Users', 'amyma', 'amy-backup', new Date().toISOString().slice(0, 10));

const args = process.argv.slice(2);
const cmd = args[0];
const apply = args.indexOf('--apply') >= 0;
const teacherArg = args.find(a => a.indexOf('--teacher=') === 0);
const teacher = teacherArg ? teacherArg.split('=')[1] : TEACHER_PHONES[0];
const rest = args.slice(1).filter(a => a.indexOf('--') !== 0);
const phone = rest[0];
const name = rest[1] || '';

const j = async (url, opts) => {
  const res = await fetch(BASE + url, opts);
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch (e) {}
  return { status: res.status, data: data };
};
const list = async () => (await j('/api/class/removed-list?teacher=' + teacher + '&t=' + Date.now())).data;
const status = async (p) => (await j('/api/class/status?phone=' + p + '&t=' + Date.now())).data;

(async function main() {
  if (cmd === 'dump') {
    const r = await list();
    if (!r) { console.log('拉取失败：老师号 ' + teacher + ' 没有权限或网络不通'); process.exit(1); }
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, 'login-gate-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
    fs.writeFileSync(file, JSON.stringify(r, null, 2));
    console.log('后台拦截名单共 ' + r.removed.length + ' 条，已备份到：\n  ' + file);
    r.removed.forEach(x => console.log('  🚫 ' + x.phone + '  ' + (x.name || '-') + '  ' + x.removed_at));
    return;
  }

  if (!phone) { console.log('缺手机号'); process.exit(1); }

  if (cmd === 'gate') {
    const before = await status(phone);
    console.log((apply ? '【执行】' : '【演练】') + '把 ' + phone + ' ' + (name || '') + ' 写进后台拦截名单');
    console.log('  当前 removed = ' + (before && before.removed));
    if (!apply) { console.log('  加 --apply 才会真的写'); return; }
    const r = await j('/api/class/remove', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, name: name, teacher: teacher }),
    });
    const after = await status(phone);
    console.log('  写入结果：' + JSON.stringify(r.data));
    console.log('  写入后 removed = ' + (after && after.removed) + (after && after.teacher ? '（老师号，后台拒绝记录）' : ''));
    if (!(after && after.removed)) console.log('  ⚠️ 没拦上，检查号码是不是老师号，或网络是否失败');
    return;
  }

  if (cmd === 'ungate') {
    const before = await status(phone);
    console.log((apply ? '【执行】' : '【演练】') + '把 ' + phone + ' 从后台拦截名单里去掉（= 放行）');
    console.log('  当前 removed = ' + (before && before.removed));
    if (!apply) { console.log('  加 --apply 才会真的写'); return; }
    const r = await j('/api/class/unblock', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone, teacher: teacher }),
    });
    const after = await status(phone);
    console.log('  写入结果：' + JSON.stringify(r.data));
    console.log('  写入后 removed = ' + (after && after.removed));
    return;
  }

  console.log('用法：dump | gate <phone> [name] [--apply] | ungate <phone> [--apply]');
})();
