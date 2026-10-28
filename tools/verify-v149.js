// v149 验证：
//  1) W4 周五语法复习（v153 起裁到 20 道：30 = 写作5 + 语法20 + KET5），写作保留
//  2) 打卡上报持久重试队列（失败入队、flush 出队、keepalive）
//  3) 重发触发器（每分钟 / online / 打开 App）
const fs = require('fs');
let pass = 0, failN = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' —— ' + extra : '')); }
}

console.log('== 1. 周五语法复习（v153 裁到 20 道）==');
{
  const src = fs.readFileSync('public/data.js', 'utf8');
  const d = new Function(src + ';return WEEK4;')();
  const fri = d[4];
  ok(fri.day_cn === '周五', '取到的是周五');
  ok(fri.total_duration === 45, '周五 total_duration = 45（写作15 + KET10 + 语法20）', String(fri.total_duration));
  const w = fri.modules.find(m => m.id === 'w4-fri-writing');
  ok(!!w, '写作练习模块保留');
  ok(w && w.title === 'Protecting Our Earth', '写作题目未变');
  const k = fri.modules.find(m => m.id === 'w4-fri-ket');
  ok(!!k && k.questions.length === 5, 'KET/PET 模块保留 5 题');
  const g = fri.modules.find(m => m.id === 'w4-fri-grammar');
  ok(!!g && g.type === 'grammar', '语法复习模块存在');
  ok(g.questions.length === 15, '语法复习 = 15 道题（v155：周五真实动作 30）', String(g.questions.length));
  const fills = g.questions.filter(q => q.type === 'fill').length;
  const choices = g.questions.filter(q => q.type === 'choice').length;
  ok(fills + choices === 15, '题型只有 fill/choice：填 ' + fills + ' + 选 ' + choices);
  // 每题结构
  let bad = 0, noCn = 0, dup = 0;
  const ids = {};
  g.questions.forEach(q => {
    if (ids[q.id]) dup++;
    ids[q.id] = 1;
    if (q.type === 'choice') {
      if (!Array.isArray(q.options) || q.options.length < 3) bad++;
      else if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) bad++;
    } else if (q.type === 'fill') {
      if (!String(q.answer || '').trim()) bad++;
    } else bad++;
    if (!q.explanation_cn) noCn++;
  });
  ok(bad === 0, '每题答案/选项结构完整', bad + ' 题');
  ok(noCn === 0, '每题都有中文解析', noCn + ' 题缺');
  ok(dup === 0, '题目 ID 无重复');
  // 知识点抽查（v155 裁剪后按内容找，不再写死下标）
  const ansOf = q => (q.type === 'choice' ? q.options[q.answer] : q.answer);
  const loafQ = g.questions.find(q => /loaf/i.test(String(q.answer) + String(q.explanation_cn || '') + String(q.question || '')));
  const cansQ = g.questions.find(q => /cans/i.test(String(q.answer)) || (q.type === 'choice' && q.options[q.answer] === 'cans'));
  ok(!!loafQ && /loaf/i.test(ansOf(loafQ)), '量词题 loaf 还在');
  ok(!!loafQ, '量词知识点仍在（v155 裁剪后抽查 loaf）');
  const choiceList = g.questions.filter(q => q.type === 'choice');
  const ansIdx = choiceList.map(q => q.answer);
  ok(new Set(ansIdx).size >= 2, '选择题正确位置不扎堆', JSON.stringify(ansIdx));
  // 家长的红线：所有答案小写
  const upper = g.questions.filter(q => /[A-Z]/.test(String(q.answer)));
  ok(upper.length === 0, '所有答案都是小写', upper.map(q => q.id).join(','));
}

console.log('== 2. 打卡上报持久重试队列 ==');
{
  const api = fs.readFileSync('public/api.js', 'utf8');
  ok(/_ckQueueKey\(\)\s*\{\s*return 'amy_checkin_retry_v1'/.test(api), '队列持久化 key');
  ok(/_queueCheckin\(body\)/.test(api), '失败入队 _queueCheckin');
  ok(/async flushCheckinQueue\(opts\)/.test(api), 'flushCheckinQueue 重发（opts.beacon 支持离场 beacon）');
  ok(/q\.slice\(-200\)/.test(api), '队列封顶 200 条');
  ok(/_flushingCheckins/.test(api), '防并发重入');
  const rcAt = api.indexOf('\n  reportCheckin(rec, who) {');
  const rc = api.slice(rcAt, rcAt + 2600);
  ok(/keepalive:\s*true/.test(rc), '上报请求带 keepalive（答完锁屏也能发出去）');
  ok(/fail\('http '/.test(rc), '非 200 也入队');
  ok(/\.catch\(e => fail\(/.test(rc), '网络错误入队');
  ok(/_ckQueueId\(body\)/.test(api) && /student_id, body\.week_idx, body\.day_idx/.test(api), '队列按 学生/周/天 去重');
}

console.log('== 3. 重发触发器 ==');
{
  const app = fs.readFileSync('public/app.js', 'utf8');
  const _bs = app.indexOf('_bindCheckinUpload() {');
  // v152 起函数变长（beacon + pagehide），取窗按下一个函数边界算，别写死长度
  const b = app.slice(_bs, app.indexOf('// 进「孩子打卡 / 完成率对比」之前拉一次后台', _bs));
  ok(/setInterval/.test(b) && /60000/.test(b), '页面可见时每 60 秒重发');
  ok(/addEventListener\('online'/.test(b), '网络恢复立即重发');
  ok(/Api\.flushCheckinQueue\(\)/.test(b), '触发器调用 flush');
  const bf = app.slice(app.indexOf('_backfillCheckins() {'), app.indexOf('_backfillCheckins() {') + 500);
  ok(/Api\.flushCheckinQueue\(\)/.test(bf), '打开 App 先补发一轮队列');
}

console.log('');
console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
process.exit(failN === 0 ? 0 : 1);
