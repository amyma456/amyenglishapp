// v152 验证：荣耀 / 华为自带浏览器上「打了卡却显示没打卡」的根治
//
// 症状（家长 2026-10-23）：用荣耀 70 自带浏览器的那位同学，打卡记录总是
// "才更新上来"；老师当晚查打卡监控，看到的是"没打卡"，第二天才冒出来。
//
// 病根：这类浏览器切后台 / 锁屏 / 划掉页面时会直接掐掉还在飞的 fetch，
// keepalive 不认、后台定时器被节流 → 那次上报死在路上，只能等孩子下次
// 打开 App 由持久队列补发。
//
// 修法：fetch 失败立刻 sendBeacon 一发 + 页内 2/6/15/40 秒短重试 +
// pagehide / 页面转后台时 beacon 一轮。
const fs = require('fs');
const path = require('path');
const jsdom = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom');

let pass = 0, failN = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' —— ' + extra : '')); }
};

const R = __dirname;
const apiSrc = fs.readFileSync(path.join(R, '..', 'public', 'api.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(R, '..', 'public', 'app.js'), 'utf8')
  .replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */');
const htmlSrc = fs.readFileSync(path.join(R, '..', 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(R, '..', 'public', 'sw.js'), 'utf8');
const cloudSrc = fs.readFileSync(path.join(R, '..', 'public', 'cloud.js'), 'utf8');

// 造一台"假手机"：fetch 可编程失败，sendBeacon 记账，定时器只记账不真跑
function makeDevice() {
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
  const w = dom.window;
  const beacons = [];
  const timers = [];
  const state = { fetchMode: 'fail', fetchCalls: 0 };
  const nav = {
    userAgent: 'Mozilla/5.0 (Linux; Android 12; ELZ-AN10) HonorBrowser/8.0',
    sendBeacon(url, data) { beacons.push({ url: url, data: data }); return true; },
  };
  const fetchStub = () => {
    state.fetchCalls++;
    if (state.fetchMode === 'fail') return Promise.reject(new Error('network error'));
    return Promise.resolve({ ok: true, json: async () => ({ ok: true }), text: async () => '{"ok":true}' });
  };
  const built = new Function('document', 'window', 'localStorage', 'navigator', 'location',
    'fetch', 'console', 'setTimeout', 'Blob', 'performance',
    cloudSrc + ';' + apiSrc + ';return { Api, Store };')(
    w.document, w, w.localStorage, nav, w.location, fetchStub, console,
    (fn, ms) => { timers.push(ms); return timers.length; },
    w.Blob, { now: () => Date.now() });
  return { Api: built.Api, Store: built.Store, beacons, timers, state, window: w };
}

const rec = {
  studentId: 's1', dayIdx: 2, done: true, completed: 'full',
  answered: 12, total: 12, correctRate: 83, wrongCount: 2, time: '20:31',
};

async function beaconPayload(b) {
  const d = b && b.data;
  if (!d) return '';
  if (typeof d === 'string') return d;
  if (typeof d.text === 'function') {
    try { return await d.text(); } catch (e) { /* 继续试 parts */ }
  }
  try { return (d.parts || []).join(''); } catch (e) { return ''; }
}

(async () => {
  console.log('== 1. fetch 被掐掉时，立刻 beacon 一发 ==');
  {
    const dev = makeDevice();
    const res = await dev.Api.reportCheckin(rec, { name: '张子皓-Harvey', phone: '15109549632', klass: '少儿英语A班' });
    ok(res === null, 'reportCheckin 失败返回 null（调用方照旧）');
    ok(dev.beacons.length === 1, 'sendBeacon 被调用 1 次', dev.beacons.length + ' 次');
    ok(/\/api\/checkins\/report$/.test(dev.beacons[0].url), 'beacon 打到打卡上报接口');
    const p = await beaconPayload(dev.beacons[0]);
    ok(p.indexOf('"student_id":"s1"') >= 0, 'beacon 带着学生 id');
    ok(p.indexOf('"day_idx":2') >= 0 && p.indexOf('"week_idx"') >= 0, 'beacon 带着周次 + 天次');
    ok(p.indexOf('"correct_rate":83') >= 0, 'beacon 带着正确率');
    ok(dev.Api._loadCkQueue().length === 1, '同一条打卡也进了持久队列（下次打开 App 还会补）');
    ok(dev.timers.length >= 1 && dev.timers[0] === 2000, '页内短重试第 1 轮排在 2 秒后', JSON.stringify(dev.timers));
  }

  console.log('\n== 2. 上报成功时不打扰（不发 beacon、不进队列）==');
  {
    const dev = makeDevice();
    dev.state.fetchMode = 'ok';
    const res = await dev.Api.reportCheckin(rec, {});
    ok(res && res.ok === true, '成功返回后台结果');
    ok(dev.beacons.length === 0, '成功时不发 beacon（不浪费流量）');
    ok(dev.Api._loadCkQueue().length === 0, '成功时不进重试队列');
    ok(dev.timers.length === 0, '成功时不排重试');
  }

  console.log('\n== 3. 页面离场：只能 beacon，不能 fetch ==');
  {
    const dev = makeDevice();
    dev.state.fetchMode = 'fail';
    await dev.Api.reportCheckin(rec, {});
    const before = dev.state.fetchCalls;
    dev.state.fetchMode = 'ok';                 // 就算网络好了也不该在这时起 fetch
    const sent = await dev.Api.flushCheckinQueue({ beacon: true });
    ok(dev.state.fetchCalls === before, '页面离场时不起 fetch（起了也必被掐）');
    ok(dev.beacons.length === 2, '队列里的那条又 beacon 了一次', dev.beacons.length + ' 次');
    ok(sent === 0, 'beacon 没有回执，不算"已发送成功"');
    ok(dev.Api._loadCkQueue().length === 1, '条目保留在队列里（下次打开 App 再确认发一遍）');
  }

  console.log('\n== 4. 回到前台 / 联网恢复：fetch 补发成功才出队 ==');
  {
    const dev = makeDevice();
    dev.state.fetchMode = 'fail';
    await dev.Api.reportCheckin(rec, {});
    ok(dev.Api._loadCkQueue().length === 1, '前提：失败后队列里有 1 条');
    dev.state.fetchMode = 'ok';
    const sent = await dev.Api.flushCheckinQueue();
    ok(sent === 1, '补发成功 1 条');
    ok(dev.Api._loadCkQueue().length === 0, '成功后出队');
    dev.state.fetchMode = 'fail';
    await dev.Api.reportCheckin(Object.assign({}, rec, { dayIdx: 3 }), {});
    const sent2 = await dev.Api.flushCheckinQueue();
    ok(sent2 === 0 && dev.Api._loadCkQueue().length === 1, '还是失败就留在队列里，一条都不丢');
  }

  console.log('\n== 5. 页面侧：切后台 / 关闭时也要 beacon ==');
  {
    const sa = appSrc.indexOf('  _bindCheckinUpload() {');
    const body = appSrc.slice(sa, appSrc.indexOf('  // 进「孩子打卡 / 完成率对比」之前拉一次后台', sa));
    ok(/_bindCheckinUpload/.test(body), '取到了 _bindCheckinUpload');
    ok(/visibilityState === 'hidden'[\s\S]{0,160}flushCheckinQueue\(\{ beacon: true \}\)/.test(body),
       '切到后台时 beacon 一轮（不再直接 return 丢掉）');
    ok(/addEventListener\('pagehide'[\s\S]{0,160}flushCheckinQueue\(\{ beacon: true \}\)/.test(body),
       '页面关闭（pagehide）时 beacon 一轮');
    ok(/visibilityState === 'visible'[\s\S]{0,80}flushCheckinQueue\(\)/.test(body),
       '回到前台立刻补发，不用等 60 秒');
    ok(/setInterval/.test(body) && /60000/.test(body), '可见时每分钟重发一轮的旧通道还在');
    ok(!/if \(document\.visibilityState === 'hidden'\) return;/.test(body),
       '旧的"切到后台就什么都不做"已移除');
  }

  console.log('\n== 6. beacon 的写法是「简单请求」（不会因预检被丢）==');
  {
    const bStart = apiSrc.indexOf('  _ckBeacon(body) {');
    const b = apiSrc.slice(bStart, apiSrc.indexOf('  _ckRetryLater(', bStart));
    ok(/navigator\.sendBeacon/.test(b), '用 navigator.sendBeacon');
    ok(/text\/plain/.test(b), 'body 用 text/plain（跨域也不触发预检）');
    ok(/Blob\(/.test(b), '包成 Blob 发（避免字符串被当成 URL）');
    ok(/request\.json\(\)/.test(fs.readFileSync(path.join(R, '..', 'worker', 'src', 'index.js'), 'utf8')),
       '服务端用 request.json() 解析，不看 Content-Type（text/plain 也读得懂）');
    ok(/UPSERT|ON CONFLICT/i.test(fs.readFileSync(path.join(R, '..', 'worker', 'src', 'index.js'), 'utf8')),
       '服务端是 UPSERT（beacon + fetch 重复发也不会写坏数据）');
  }

  console.log('\n== 7. 版本号 = 152 ==');
  {
    ok(/app-version" content="171"/.test(htmlSrc), 'index.html meta = 152');
    ok((htmlSrc.match(/\?v=171/g) || []).length >= 5, '脚本引用 ?v=171（' + (htmlSrc.match(/\?v=171/g) || []).length + ' 处）');
    ok(/amy-english-v171/.test(swSrc) && /var V = 171;/.test(swSrc), 'sw.js 缓存名与 V = 152');
  }

  console.log('');
  console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
  process.exit(failN === 0 ? 0 : 1);
})();
