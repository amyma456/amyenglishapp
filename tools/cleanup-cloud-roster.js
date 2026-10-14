/* eslint-disable */
// 运维脚本：把云端名单清成"只留指定的人 + 指定班级"（v110 建的墓碑机制）。
// ⚠️ 下面的 KEEP_PHONES / KEEP_CLASSES 是 2026-10-14 那一次家长确认过的名单，
//    重跑前先按当次的确认结果改掉，别照着旧名单删人。
//
// 原本是：把云端 textdb blob 清理成"只留少儿英语A班 + 真实学生"。
// 家长 2026-10-14 确认：帮我把测试号清掉；马慧-AMy / 马帅-ms / 龚天超-ame 保留。
//
// 关键：被删的手机号必须同时写进 deletedPhones（墓碑），否则任何一台还揣着
// 旧名单的设备下一次同步就会把它们推回来（这正是 v110 要修的 bug）。
// 另外给每个被删的号写一条 D1 黑名单，免得孩子那边一登录又注册回来。
//
// 用法：node .tmp/cleanup-cloud.js            （只看，不改）
//       node .tmp/cleanup-cloud.js --apply    （真改，改前备份）
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.indexOf('--apply') >= 0;
const PRIMARY = 'https://textdb.dev/api/data/amy-eng-1fb05e57eb5c6d6b';
const BACKUP = 'https://textdb.dev/api/data/amy-eng-bk-803bdfd024b45483';
const TEACHER = '13259532991';
const API = 'https://amyeng.top';
const BK_DIR = 'C:/Users/amyma/amy-backup/2026-10-14/cleanup-before-v110';

// 家长点名要留的 12 个人
const KEEP_PHONES = [
  '15109549632', // 张子皓-Harvey（少儿英语A班）
  '18995138675', // 马英凯-Steven
  '13895622034', // 薛懿格-Gina
  '13895176872', // 黄耀-York
  '18408439432', // 田墨翰-Matt
  '11840843943', // 田墨翰-Matt（号码疑似录错，家长要求都留）
  '13649509453', // 哈俊武-jerry
  '18252856357', // 张梓苏-Sean
  '13259532909', // 陈皓正-Yunus
  '13260938622', // 马慧-AMy（家长要求保留）
  '17763891729', // 马帅-ms（家长要求保留）
  '18295196812', // 龚天超-ame（家长要求保留）
  '13259532902', // 陈皓铭-Yusuf（今天 11:21 新注册，家长确认保留、先不分班）
];
const KEEP_CLASSES = ['少儿英语A班'];

const getJson = async (url) => {
  const res = await fetch(url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
  return JSON.parse(await res.text());
};
const putJson = async (url, obj) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(obj),
  });
  if (!res.ok) throw new Error('POST ' + url + ' -> ' + res.status);
  return true;
};

(async function main() {
  const before = await getJson(PRIMARY);
  let beforeBk = null;
  try { beforeBk = await getJson(BACKUP); } catch (e) { console.log('备用 key 读取失败：' + e.message); }

  console.log('== 现状 ==');
  console.log('班级：' + JSON.stringify(before.classes));
  console.log('学生：' + (before.students || []).length + ' 人');
  console.log('备用 key 学生：' + (beforeBk ? (beforeBk.students || []).length + ' 人' : '读取失败'));

  const keepSet = new Set(KEEP_PHONES);
  const survivors = [];
  const dropped = [];
  (before.students || []).forEach(s => {
    if (s && s.phone && keepSet.has(s.phone)) survivors.push(s);
    else dropped.push(s);
  });

  const missing = KEEP_PHONES.filter(p => !survivors.find(s => s.phone === p));
  if (missing.length) {
    console.log('\n!! 保留名单里这几个号在云端找不到，先停下：' + missing.join(', '));
    process.exit(1);
  }

  console.log('\n== 保留（' + survivors.length + ' 人）==');
  survivors.forEach(s => console.log('  + ' + s.name + '  ' + s.phone + '  class=' + JSON.stringify(s.class) + ' approved=' + s.approved));
  console.log('\n== 删除（' + dropped.length + ' 人）==');
  dropped.forEach(s => console.log('  - ' + (s.name || '?') + '  ' + (s.phone || '?') + '  class=' + JSON.stringify(s.class || '')));

  const tombPhones = Array.from(new Set(
    [].concat(before.deletedPhones || [], dropped.map(s => s.phone)).filter(Boolean)
  ));
  const tombClasses = Array.from(new Set(
    [].concat(before.deletedClasses || [], (before.classes || []).filter(c => KEEP_CLASSES.indexOf(c) < 0))
  ));

  const after = {
    students: survivors,
    classes: KEEP_CLASSES.slice(),
    deletedPhones: tombPhones,
    deletedClasses: tombClasses,
    revivedPhones: [],
    revivedClasses: [],
    lastUpdated: new Date().toISOString(),
  };

  console.log('\n== 清理后 ==');
  console.log('班级：' + JSON.stringify(after.classes));
  console.log('学生：' + after.students.length + ' 人');
  console.log('墓碑：' + tombPhones.length + ' 个手机号 / ' + JSON.stringify(tombClasses));

  if (!APPLY) {
    console.log('\n（演练模式，没有改任何东西。加 --apply 真改）');
    return;
  }

  fs.mkdirSync(BK_DIR, { recursive: true });
  fs.writeFileSync(path.join(BK_DIR, 'primary-before.json'), JSON.stringify(before, null, 2));
  if (beforeBk) fs.writeFileSync(path.join(BK_DIR, 'backup-before.json'), JSON.stringify(beforeBk, null, 2));
  console.log('\n备份已写入 ' + BK_DIR);

  await putJson(PRIMARY, after);
  await putJson(BACKUP, after);
  console.log('云端已写入（主 + 备）');

  // D1 黑名单：被删的号要申请才能回来
  let gated = 0, gateFail = 0;
  for (let i = 0; i < dropped.length; i += 4) {
    const batch = dropped.slice(i, i + 4);
    const rs = await Promise.all(batch.map(s => fetch(API + '/api/class/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: s.phone, name: s.name, teacher: TEACHER }),
    }).then(r => r.ok).catch(() => false)));
    rs.forEach(ok => { if (ok) gated++; else gateFail++; });
  }
  console.log('后台黑名单：成功 ' + gated + ' 个，失败 ' + gateFail + ' 个');

  // 校验
  const check = await getJson(PRIMARY);
  const checkBk = await getJson(BACKUP);
  console.log('\n== 校验 ==');
  console.log('主 key：' + (check.students || []).length + ' 人 / 班级 ' + JSON.stringify(check.classes) + ' / 墓碑 ' + (check.deletedPhones || []).length);
  console.log('备 key：' + (checkBk.students || []).length + ' 人 / 班级 ' + JSON.stringify(checkBk.classes) + ' / 墓碑 ' + (checkBk.deletedPhones || []).length);
})().catch(e => { console.log('出错：' + e.message); process.exit(1); });
