/* eslint-disable */
// 回归红线（v131）：ASR 出分速度与稳定性 —— 统一重试预算。
//
// 背景：家长说"出分太慢"。读代码读到根子不是单趟慢，是**三层重试各自叠加**：
//
//   Worker runAliyun       while(tried<2)              → 最多 2 次阿里云
//   Worker runCloudflare   for(round<2) turbo + 默认   → 最多 3 次 CF
//   Api.transcribe         空则再来一趟                 → ×2
//   app._bestTranscript    再兜一趟（不带 hint）        → ×2
//   ————————————————————————————————————————————————————
//   最坏：云端 ASR 调用 20 次 / 客户端串行等 4×18s = 72 秒
//
// v131 给**整次朗读**（松手→出分）一个统一预算：最多 2 趟、总时长 ≤12 秒。
// 这条测试钉的就是这个预算真的生效，而且**没有把正常识别成功率搞坏**。
//
// 覆盖用户点名的场景：
//   ① 第一次识别成功        ② 第一次为空、第二次成功   ③ 连续两次为空
//   ④ 网络超时              ⑤ 有效文本但分数低         ⑥ 阿里云成功
//   ⑦ Cloudflare 兜底成功   ⑧ 空结果不重传（有效文本才不重传）
//   ⑨ 预算/趟数到顶就收     ⑩ 失败不等于 0 分
//   ⑪ ?perf=1 才有面板      ⑫ 普通页面没有面板
//
// 用法：node tools/verify-asr-budget.js
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public') + path.sep;
let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

const apiSrc = fs.readFileSync(BASE + 'api.js', 'utf8');

// ---------- 把 api.js 装进沙箱，fetch 完全由测试控制 ----------
function loadApi(opts) {
  opts = opts || {};
  const calls = [];                 // 每次 fetch 的记录
  let search = opts.search || '';
  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    performance: { now: () => Date.now() },
    AbortController: global.AbortController,
    AbortSignal: global.AbortSignal,
    setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: {
      _d: {},
      getItem(k) { return (k in this._d) ? this._d[k] : null; },
      setItem(k, v) { this._d[k] = String(v); },
      removeItem(k) { delete this._d[k]; },
    },
    location: { hostname: 'amyeng.top', search: search, href: 'https://amyeng.top/' + search },
    document: { getElementById: () => null, querySelector: () => null },
    fetch: async function (url, init) {
      const rec = { url: String(url), init: init || {}, at: Date.now() };
      calls.push(rec);
      const n = calls.length;                       // 第几次调用
      const plan = opts.plan || [];
      const step = plan[n - 1] || { kind: 'ok', text: '' };
      // 用 setTimeout 模拟真实耗时（默认 1ms，够快又不阻塞）
      await new Promise(r => setTimeout(r, opts.stepMs == null ? 1 : opts.stepMs));
      if (step.kind === 'throw') throw new Error(step.msg || 'network down');
      if (step.kind === 'abort') { const e = new Error('aborted'); e.name = 'AbortError'; throw e; }
      const h = new Map();
      if (step.channel) h.set('X-Asr-Channel', step.channel);
      if (step.timing) h.set('Server-Timing', step.timing);
      if (step.audioIn) h.set('X-Audio-In', step.audioIn);
      if (step.colo) h.set('X-Edge-Colo', step.colo);
      // 'badheaders'：模拟 headers.get 自己抛异常（极端的浏览器/代理行为）。
      // 这种情况 perfHop 必须自己吞掉，不许把识别带崩。
      const headers = step.kind === 'badheaders'
        ? { get: () => { throw new Error('headers exploded'); } }
        : { get: (k) => (h.has(k) ? h.get(k) : null) };
      return {
        ok: step.status ? (step.status < 400) : true,
        status: step.status || 200,
        headers: headers,
        json: async () => ({ text: step.text == null ? '' : step.text }),
      };
    },
  };
  const vm = require('vm');
  vm.createContext(sandbox);
  // api.js 是普通脚本（挂全局 Api），直接跑，然后取出来
  vm.runInContext(apiSrc + '\n;__api = (typeof Api !== "undefined") ? Api : (typeof api !== "undefined" ? api : null);', sandbox);
  const api = sandbox.__api;
  if (!api) throw new Error('api.js 里没找到 Api 对象');
  return { api, calls, sandbox };
}

const BLOB = { size: 1234, type: 'audio/wav' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async function main() {
  // =======================================================================
  console.log('== ① 第一次识别成功：只打一趟，不做任何多余重试 ==');
  {
    const { api, calls } = loadApi({ plan: [{ kind: 'ok', text: 'i like apples', channel: 'aliyun' }] });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('拿到文本', r && r.text === 'i like apples', r && r.text);
    ok('★ 只打了 1 次网络请求', calls.length === 1, '实际 ' + calls.length);
    ok('没浪费预算', api._asrTrips === 1, '趟数 ' + api._asrTrips);
  }

  // =======================================================================
  console.log('\n== ② 第一次为空、第二次成功：允许重试，共 2 趟 ==');
  {
    const { api, calls } = loadApi({
      plan: [{ kind: 'ok', text: '' }, { kind: 'ok', text: 'hello world', channel: 'aliyun' }],
    });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('重试后拿到文本', r && r.text === 'hello world', r && r.text);
    ok('★ 正好 2 趟（空返回才重试）', calls.length === 2, '实际 ' + calls.length);
  }

  // =======================================================================
  console.log('\n== ③ 连续两次为空：收手，不再无限重试 ==');
  {
    const { api, calls } = loadApi({
      plan: [{ kind: 'ok', text: '' }, { kind: 'ok', text: '' },
             { kind: 'ok', text: '' }, { kind: 'ok', text: '' }],
    });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('拿不到文本（空）', !r || !r.text);
    ok('★ 最多 2 趟就停（不是打 4 趟）', calls.length <= api.ASR_MAX_TRIPS,
       '实际 ' + calls.length + ' 趟，上限 ' + api.ASR_MAX_TRIPS);
  }

  // =======================================================================
  console.log('\n== ④ 网络超时：可重试一次，但总趟数仍受预算约束 ==');
  {
    const { api, calls } = loadApi({
      plan: [{ kind: 'abort' }, { kind: 'abort' }, { kind: 'abort' }, { kind: 'abort' }],
    });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('超时返回空（不是抛错到上层）', !r || !r.text);
    ok('★ 超时也最多 2 趟', calls.length <= api.ASR_MAX_TRIPS, '实际 ' + calls.length);
  }

  // =======================================================================
  console.log('\n== ⑤ 有效文本但分数低：绝不因为分数低就重传同一段音频 ==');
  {
    // 关键：这是我们**唯一**能观测"有没有因为低分而重试"的地方 ——
    // 低分是上层 _readVerdict 判的，Api 层只看得到"有没有文本"。
    // 只要有文本就必须立刻返回，一趟都不能多打。
    const { api, calls } = loadApi({
      plan: [{ kind: 'ok', text: 'wrong words here', channel: 'aliyun' },
             { kind: 'ok', text: 'correct sentence', channel: 'aliyun' }],
    });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('拿到的就是第一次的结果', r && r.text === 'wrong words here', r && r.text);
    ok('★ 有文本就只打 1 趟 —— 分数低不重传', calls.length === 1, '实际 ' + calls.length);
  }

  // =======================================================================
  console.log('\n== ⑥⑦ 通道标识：阿里云成功 / Cloudflare 兜底都能读出来 ==');
  {
    // 要看样本就必须开 ?perf=1 —— 普通页面是不采集的（⑬ 单独验证这一点）
    const a = loadApi({ search: '?perf=1',
      plan: [{ kind: 'ok', text: 'aliyun answered', channel: 'aliyun' }] });
    a.api.asrResetBudget(); a.api.perfBegin('t');
    await a.api.transcribe(BLOB, null, { fast: true, budgeted: true });
    a.api.perfEnd({ kind: 'pass' });
    const s1 = a.api.perfSamples()[0];
    ok('阿里云通道被记进样本', s1 && s1.hops[0].channel === 'aliyun',
       s1 && JSON.stringify(s1.hops[0]));

    const c = loadApi({ search: '?perf=1',
      plan: [{ kind: 'ok', text: '', channel: 'aliyun' },
             { kind: 'ok', text: 'cf rescued me', channel: 'cloudflare' }] });
    c.api.asrResetBudget(); c.api.perfBegin('t');
    const r2 = await c.api.transcribe(BLOB, null, { fast: true, budgeted: true });
    c.api.perfEnd({ kind: 'pass' });
    ok('CF 兜底拿回文本', r2 && r2.text === 'cf rescued me', r2 && r2.text);
    const s2 = c.api.perfSamples()[0];
    ok('★ 两趟的通道都被记下来（第 2 趟是 Cloudflare）',
       s2 && s2.hops.length === 2 && s2.hops[1].channel === 'cloudflare',
       s2 && JSON.stringify(s2.hops.map(h => h.channel)));
  }

  // =======================================================================
  console.log('\n== ⑧ 响应头缺失 / 跨域被剥：不许报错 ==');
  {
    // 一个头都没有（老 Worker / 被 CORS 剥光）
    const { api, calls } = loadApi({ search: '?perf=1',
      plan: [{ kind: 'ok', text: 'no headers here' }] });
    api.asrResetBudget(); api.perfBegin('t');
    let threw = null;
    try { await api.transcribe(BLOB, null, { fast: true, budgeted: true }); }
    catch (e) { threw = e; }
    api.perfEnd({ kind: 'pass' });
    ok('★ 没有响应头也不抛错', threw === null, threw && threw.message);
    const s = api.perfSamples()[0];
    ok('缺的头留空（不是 undefined、不是崩）',
       s && s.hops[0].channel === '' && s.hops[0].colo === '',
       s && JSON.stringify(s.hops[0]));
    ok('文本照样拿到', calls.length === 1);

    // headers.get 本身炸掉（极端情况）也不能让识别挂
    const bad = loadApi({ search: '?perf=1',
      plan: [{ kind: 'badheaders', text: 'x' }] });
    bad.api.asrResetBudget(); bad.api.perfBegin('t');
    let threw2 = null;
    try { await bad.api.transcribe(BLOB, null, { fast: true, budgeted: true }); }
    catch (e) { threw2 = e; }
    bad.api.perfEnd({ kind: 'pass' });
    ok('★ headers.get 异常也不影响识别', threw2 === null, threw2 && threw2.message);
    ok('headers.get 异常时头字段留空', bad.api.perfSamples()[0].hops[0].channel === '');
  }

  // =======================================================================
  console.log('\n== ⑨ 预算：趟数到顶 / 时间超预算就不再打 ==');
  {
    const { api, calls } = loadApi({
      plan: Array.from({ length: 8 }, () => ({ kind: 'ok', text: '' })),
    });
    api.asrResetBudget();
    // 先打满趟数
    await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    const afterTrips = calls.length;
    ok('★ 打满趟数就收（' + afterTrips + ' 趟 = 上限 ' + api.ASR_MAX_TRIPS + '）',
       afterTrips === api.ASR_MAX_TRIPS, '实际 ' + afterTrips);
    ok('asrCanRetry() 说不能再打', api.asrCanRetry() === false);

    // 时间超预算也一样
    const b = loadApi({ plan: Array.from({ length: 8 }, () => ({ kind: 'ok', text: '' })) });
    b.api.asrResetBudget();
    b.api._asrSpent = b.api.ASR_BUDGET_MS + 1;      // 假装已经花光了
    b.api._asrTrips = 0;                            // 但趟数还有余
    ok('★ 时间超预算 → 也不许再打（两条件都要满足）', b.api.asrCanRetry() === false);
    ok('剩余超时 ≤0 时 trip timeout 也是 0', b.api.asrTripTimeout() === 0,
       '实际 ' + b.api.asrTripTimeout());
  }

  // =======================================================================
  console.log('\n== ⑩ 单趟超时不许超过总预算剩余量（免得一趟吃光全程） ==');
  {
    const { api } = loadApi({ plan: [] });
    api.asrResetBudget();
    const t0 = api.asrTripTimeout();
    ok('刚开始时 = 总预算', t0 === api.ASR_BUDGET_MS, '实际 ' + t0);
    api._asrSpent = 5000;
    const t1 = api.asrTripTimeout();
    ok('花掉 5s 后只剩 7s', t1 === api.ASR_BUDGET_MS - 5000, '实际 ' + t1);
    ok('★ 且不超过 TRANSCRIBE_TIMEOUT 兜底上限',
       t1 <= api.TRANSCRIBE_TIMEOUT, 't1=' + t1 + ' cap=' + api.TRANSCRIBE_TIMEOUT);
  }

  // =======================================================================
  console.log('\n== ⑪ 失败 ≠ 0 分：空结果必须能被上层认出来 ==');
  {
    const { api } = loadApi({ plan: [{ kind: 'ok', text: '' }, { kind: 'ok', text: '' }] });
    api.asrResetBudget();
    const r = await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    ok('★ 失败返回"没有文本"，不是 0 分、不是假文本',
       !r || r.text === '', r && JSON.stringify(r));
  }

  // =======================================================================
  console.log('\n== ⑫ 性能样本：只记数字，不记内容 ==');
  {
    const { api } = loadApi({
      search: '?perf=1',
      plan: [{ kind: 'ok', text: 'my secret sentence', channel: 'aliyun',
               timing: 'aliyun;dur=800', audioIn: '12345', colo: 'LAX' }],
    });
    api.asrResetBudget(); api.perfBegin('sentence');
    await api.transcribe(BLOB, null, { fast: true, budgeted: true });
    api.perfEnd({ kind: 'pass' });
    const s = api.perfSamples()[0];
    ok('样本记到了', !!s);
    ok('★ 只记文本**长度**，不记文本内容',
       s && s.hops[0].text === 'my secret sentence'.length,
       s && String(s.hops[0].text));
    const blob = JSON.stringify(s);
    ok('★ 样本里搜不到原句文字', blob.indexOf('my secret sentence') < 0);
    ok('★ 样本里没有手机号形态的串', !/\b1[3-9]\d{9}\b/.test(blob));
    ok('★ 样本里没有 key/token 字段',
       !/api[_-]?key|token|secret|password/i.test(blob));
    ok('读到了 Server-Timing', s && s.hops[0].timing === 'aliyun;dur=800');
    ok('读到了 X-Audio-In', s && s.hops[0].audioIn === '12345');
    ok('读到了 X-Edge-Colo', s && s.hops[0].colo === 'LAX');
  }

  // =======================================================================
  console.log('\n== ⑬ 面板开关：只有 ?perf=1 才开 ==');
  {
    const off = loadApi({ search: '' });
    ok('★ 普通页面 PERF_ENABLED()=false', off.api.PERF_ENABLED() === false);
    ok('普通页面 perfBegin 返回 null（不采集）', off.api.perfBegin('x') === null);

    const on = loadApi({ search: '?perf=1' });
    ok('★ ?perf=1 时 PERF_ENABLED()=true', on.api.PERF_ENABLED() === true);
    ok('?perf=1 时 perfBegin 有对象', !!on.api.perfBegin('x'));

    const on2 = loadApi({ search: '?a=1&perf=1&b=2' });
    ok('★ 参数在中间也认得出来', on2.api.PERF_ENABLED() === true);

    const fake = loadApi({ search: '?perf=10' });
    ok('perf=10 不算（边界 \b）', fake.api.PERF_ENABLED() === false);
    const fake2 = loadApi({ search: '?perfx=1' });
    ok('perfx=1 不算', fake2.api.PERF_ENABLED() === false);
  }

  // =======================================================================
  console.log('\n== ⑭ 汇总数字：p50/p90/趟数/空结果都要有 ==');
  {
    const { api } = loadApi({
      search: '?perf=1',
      plan: [
        { kind: 'ok', text: 'a', channel: 'aliyun' },
        { kind: 'ok', text: 'a', channel: 'aliyun' },
        { kind: 'ok', text: 'a', channel: 'aliyun' },
      ],
    });
    for (let i = 0; i < 3; i++) {
      api.asrResetBudget(); api.perfBegin('t');
      await api.transcribe(BLOB, null, { fast: true, budgeted: true });
      api.perfEnd({ kind: 'pass' });
    }
    const s = api.perfSummary();
    ok('样本数 3', s && s.n === 3, s && s.n);
    ok('有均值/p50/p90/max', s && s.avg >= 0 && s.p50 >= 0 && s.p90 >= 0 && s.max >= 0);
    ok('趟数合计 3（每次都 1 趟）', s && s.attempts === 3, s && s.attempts);
    ok('平均趟数 = 1', s && s.avgAttempts === 1, s && s.avgAttempts);
    ok('没有重试', s && s.retried === 0, s && s.retried);
    api.perfClear();
    ok('清空后没有样本', api.perfSummary() === null);
  }

  console.log('\n' + (fail === 0
    ? '全部通过 ✅  （' + pass + ' 项）'
    : pass + ' 项通过，' + fail + ' 项失败 ❌'));
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('  !! 测试自身崩了：' + (e && e.stack || e)); process.exit(1); });
