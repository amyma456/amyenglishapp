// 2026-10-23 云端名单彻底清理（老师要求：只留 少儿英语A班 的 9 个学生，
// 测试-Test、MATT 11840843943 以及 46 个未分配测试号全部永久移出）。
//
// 做法：直接改写 textdb 那个 blob（前后端共用的唯一真源）：
//   · students 只留 9 人
//   · 被删的 48 个号码写入 deletedPhones（墓碑，随 blob 传到每台设备）
//   · revivedPhones 清空 —— 正是这个列表把墓碑一次次翻回去，才导致"删了又回来"
// 写入前把原 doc 备份到 tools/backup-doc-2026-10-23.json。
const fs = require('fs');
const os = require('os');
const path = require('path');

const SRC = path.join(os.tmpdir(), 'doc_now.json');
const BACKUP = path.join(__dirname, 'backup-doc-2026-10-23.json');
const PRIMARY = 'https://textdb.dev/api/data/amy-eng-1fb05e57eb5c6d6b';
const BACKUP_KEY = 'https://textdb.dev/api/data/amy-eng-bk-803bdfd024b45483';

const KEEP_CLASS = '少儿英语A班';
const JUNK_NAMES = ['测试-Test'];

(async () => {
  const doc = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  fs.writeFileSync(BACKUP, JSON.stringify(doc, null, 2));
  console.log('已备份原 doc →', BACKUP, '（学生', doc.students.length, '人）');

  const isKeeper = (s) => s && s.class === KEEP_CLASS && JUNK_NAMES.indexOf(s.name) < 0;
  const keep = doc.students.filter(isKeeper);
  const drop = doc.students.filter(s => !isKeeper(s));

  const oldTomb = (doc.deletedPhones || []).slice();
  const dropPhones = drop.map(s => s.phone).filter(Boolean);
  const deletedPhones = Array.from(new Set(oldTomb.concat(dropPhones)));

  const next = {
    students: keep,
    classes: doc.classes || [KEEP_CLASS],
    // 关键：只留真正还需要复活的号码（这里一个都不需要）
    deletedPhones: deletedPhones,
    revivedPhones: [],
    deletedClasses: doc.deletedClasses || [],
    revivedClasses: doc.revivedClasses || [],
    lastUpdated: new Date().toISOString(),
  };

  console.log('保留', keep.length, '人；删除', drop.length, '人；墓碑共', deletedPhones.length, '个');

  const body = JSON.stringify(next);
  for (const url of [PRIMARY, BACKUP_KEY]) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body });
    console.log(url === PRIMARY ? '主存储' : '备份', 'HTTP', res.status, res.ok ? 'OK' : 'FAIL');
  }

  // 回读核对
  const check = await (await fetch(PRIMARY + '?cb=' + Date.now())).json();
  console.log('回读：学生', check.students.length, '人 →', check.students.map(s => s.name).join('、'));
  console.log('回读：deletedPhones', check.deletedPhones.length, '个；revivedPhones', check.revivedPhones.length, '个');
  const left = check.students.filter(s => !isKeeper(s));
  console.log(left.length === 0 && check.students.length === 9 ? '✅ 清理完成' : '❌ 还有残留：' + left.map(s => s.name).join(','));
})();
