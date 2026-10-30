// v153 验证：
//  1) 华为 nova 14「正在出分」卡死根治：Recorder.start 每个 await 有超时，
//     两条打分链路有 25 秒总看门狗，_finishClipCapture 3 秒兜底
//  2) 每天 30 道题（_countDayQuestions 口径），28 天全部一致
//  3) 阅读/完形/写作主题 = 中国文化 / 科学技术 / 现代热点
const fs = require('fs');
const path = require('path');
const jsdom = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom');

let pass = 0, failN = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' —— ' + extra : '')); }
};

const R = __dirname;
const recSrc = fs.readFileSync(path.join(R, '..', 'public', 'recorder.js'), 'utf8');
const appSrc = fs.readFileSync(path.join(R, '..', 'public', 'app.js'), 'utf8')
  .replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */');
const htmlSrc = fs.readFileSync(path.join(R, '..', 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(R, '..', 'public', 'sw.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(R, '..', 'public', 'data.js'), 'utf8');

console.log('== 1. 华为卡死根治：三层保险 ==');
{
  // ① recorder.js：三个 await 都套了 _raceTimeout
  ok(/_raceTimeout\(streamP, 6000, 'getUserMedia'\)/.test(recSrc), 'getUserMedia 最多等 6 秒');
  ok(/_raceTimeout\(ctx\.resume\(\), 2000, 'ctx\.resume'\)/.test(recSrc), 'AudioContext.resume 最多等 2 秒');
  ok(/ctx\.audioWorklet\.addModule\([\s\S]*?\), 4000, 'addModule'\)/.test(recSrc), 'addModule 最多等 4 秒');
  // 超时后放弃的真 promise 若事后成功，必须把麦克风流关掉
  ok(/getTracks\(\)\.forEach/.test(recSrc) && /gaveUp/.test(recSrc), '被放弃的流事后会被关掉（麦克风不常亮）');

  // ② app.js：两条打分链路都有 25 秒看门狗 + settled 防二刷
  ok(/const watchdog = setTimeout\(function \(\) \{\s*if \(settled\) return;[\s\S]{0,120}force settle/.test(appSrc), '口语出分有 25 秒总看门狗');
  ok((appSrc.match(/settle\(null, null, null, true\)/g) || []).length === 2, '看门狗强制按「确实读了」结算（两条链路）');
  ok((appSrc.match(/let settled = false;/g) || []).length >= 2, '晚到的正常结果被 settled 挡住，不会二刷');
  ok(/clearTimeout\(watchdog\)/.test(appSrc), '正常出分后看门狗被摘掉');

  // ③ _finishClipCapture：起录最多再等 3 秒
  const fc = appSrc.slice(appSrc.indexOf('  async _finishClipCapture() {'),
                          appSrc.indexOf('  async _finishClipCapture() {') + 1200);
  ok(/Promise\.race\(\[starting, new Promise\(function \(r\) \{ setTimeout\(r, 3000\);? ?\}\)\]\)/.test(fc.replace(/\s+/g, ' ')),
     '起录最多再等 3 秒，等不到就放弃这条音频');
}

console.log('\n== 2. _raceTimeout 行为级：挂着不回来的 promise 会被超时掐断 ==');
{
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
  const w = dom.window;
  const built = new Function('navigator', 'window', 'localStorage', 'location', 'console',
    recSrc + ';return { Recorder };')(
    w.navigator, w, w.localStorage, w.location, console);
  const Recorder = built.Recorder;
  const never = new Promise(function () {});            // 永远不回来（华为浏览器的样子）
  const t0 = Date.now();
  Recorder._raceTimeout(never, 80, 'test').then(
    () => ok(false, '挂死 promise 应被超时拒绝'),
    (e) => {
      const dt = Date.now() - t0;
      ok(/timeout: test/.test(String(e.message)), '超时拒绝并带原因（' + String(e.message).slice(-20) + '）');
      ok(dt >= 60 && dt < 500, '在设定时间附近掐断（' + dt + 'ms）');
      // 正常完成的 promise 不受影响
      return Recorder._raceTimeout(Promise.resolve('ok'), 80, 'fine');
    }
  ).then(v => {
    ok(v === 'ok', '正常 promise 照常通过');
    console.log('');
    console.log(failN === 0 ? '（第 1 部分完成）' : '（第 1 部分有失败）');
    part2();
  });
}

function part2() {
  console.log('\n== 3. 每天恰好 30（v155 起口径 = 真实动作）==');
  {
    const fn = new Function(dataSrc + '; return { W: HOMEWORK_WEEKS };');
    const W = fn().W;
    const sentsEN = t => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [String(t)];
    const sentsCN = t => String(t).replace(/\s+/g, '').split(/(?<=[。！？])/).filter(x => x.length > 1);
    let allOk = true, detail = [];
    W.forEach((week, wi) => week.forEach(d => {
      let n = 0;
      (d.modules || []).forEach(m => {
        if (m.questions) n += m.questions.length;
        if (m.blanks) n += m.blanks.length;
        if (m.words) n += m.words.length;
        if (m.passage) n += 2 * sentsEN(m.passage).length;   // 读一句 + 译一句
        if (m.type === 'writing_template') n += sentsEN(m.full_text).length; // 朗读作文逐句
      });
      if (n !== 30) { allOk = false; detail.push('W' + (wi + 1) + d.day_cn + '=' + n); }
    }));
    ok(allOk, '35 天每天真实动作（读/译/题/词）都是 30（W5 起承接退化）', detail.join(' '));
    // 阅读中英句数必须一致（裁剪是同下标裁的）
    let pairOk = true;
    W.forEach(week => week.forEach(d => (d.modules || []).forEach(m => {
      if (m.type === 'reading' && sentsEN(m.passage).length !== sentsCN(m.passage_cn).length) pairOk = false;
    })));
    ok(pairOk, '16 篇阅读课文裁剪后中英句数仍逐句对齐');
    // 时长也写回去了
    let durOk = true;
    W.forEach(week => week.forEach(d => {
      const sum = d.modules.reduce((s, m) => s + (m.duration || 0), 0);
      if (sum !== d.total_duration) durOk = false;
    }));
    ok(durOk, '每天 total_duration = 各模块之和');
  }

  console.log('\n== 4. 主题方向：中国文化 / 科学技术 / 现代热点 ==');
  {
    const fn = new Function(dataSrc + '; return { W: HOMEWORK_WEEKS };');
    const W = fn().W;
    const find = (w, day, suf) => W[w][day].modules.find(m => m.id.endsWith(suf));
    const txt = m => (m.passage || '') + ' ' + (m.questions || []).map(q => q.question).join(' ');
    // W1 中国文化
    ok(/Spring Festival/i.test(txt(find(0, 0, 'mon-reading'))), 'W1 周一阅读 = 春节');
    ok(/Great Wall/i.test(txt(find(0, 1, 'tue-reading'))), 'W1 周二阅读 = 长城');
    ok(/panda/i.test(txt(find(0, 2, 'wed-reading'))), 'W1 周三阅读 = 大熊猫');
    ok(/Mid-Autumn/i.test(txt(find(0, 5, 'sat-reading'))), 'W1 周六阅读 = 中秋节');
    ok(/tea/i.test(find(0, 3, 'thu-cloze').passage) && /Opera|actors/.test(find(0, 6, 'sun-cloze').passage),
       'W1 完形 = 中国茶 + 京剧');
    ok(find(0, 4, 'fri-writing').title === 'Making Dumplings', 'W1 写作 = 包饺子');
    // W2 科学技术
    ok(/high-speed/i.test(txt(find(1, 0, 'mon-reading'))), 'W2 周一阅读 = 高铁');
    ok(/Tiangong|space station/i.test(txt(find(1, 1, 'tue-reading'))), 'W2 周二阅读 = 天宫空间站');
    ok(/Mobile payment|QR/i.test(txt(find(1, 2, 'wed-reading'))), 'W2 周三阅读 = 移动支付');
    ok(/AI|artificial/i.test(txt(find(1, 5, 'sat-reading'))), 'W2 周六阅读 = 人工智能');
    ok(/electric|energy/i.test(find(1, 3, 'thu-cloze').passage) && /[Dd]rones/i.test(find(1, 6, 'sun-cloze').passage),
       'W2 完形 = 新能源汽车 + 无人机');
    ok(find(1, 4, 'fri-writing').title === 'My Favorite Invention', 'W2 写作 = 我最喜欢的发明');
    // W3 现代热点
    ok(/[Oo]nline shopping/i.test(txt(find(2, 0, 'mon-reading'))), 'W3 周一阅读 = 网上购物');
    ok(/bikes/i.test(txt(find(2, 1, 'tue-reading'))), 'W3 周二阅读 = 共享单车');
    ok(/videos/i.test(txt(find(2, 2, 'wed-reading'))), 'W3 周三阅读 = 短视频');
    ok(/museums?/i.test(txt(find(2, 5, 'sat-reading'))), 'W3 周六阅读 = 博物馆热');
    ok(/garbage/i.test(find(2, 3, 'thu-cloze').passage) && /marathon/i.test(find(2, 6, 'sun-cloze').passage),
       'W3 完形 = 垃圾分类 + 城市马拉松');
    ok(find(2, 4, 'fri-writing').title === 'Shopping Online', 'W3 写作 = 网上购物');
    // W4 综合（文化+科技+热点，文章最长）
    ok(/Palace|Forbidden/i.test(txt(find(3, 0, 'mon-reading'))), 'W4 周一阅读 = 故宫');
    ok(/Chang'e|moon/i.test(txt(find(3, 1, 'tue-reading'))), 'W4 周二阅读 = 嫦娥探月');
    ok(/C919|plane/i.test(txt(find(3, 2, 'wed-reading'))), 'W4 周三阅读 = 国产大飞机');
    ok(/[Pp]aper cutting/i.test(txt(find(3, 5, 'sat-reading'))), 'W4 周六阅读 = 剪纸');
    ok(/Bridge/i.test(find(3, 3, 'thu-cloze').passage) && /characters/i.test(find(3, 6, 'sun-cloze').passage),
       'W4 完形 = 港珠澳大桥 + 汉字');
    ok(find(3, 4, 'fri-writing').title === 'Protecting Our Earth', 'W4 写作 = 环保热点（保留）');
  }

  console.log('\n== 5. 新模块结构与质量抽查 ==');
  {
    const fn = new Function(dataSrc + '; return { W: HOMEWORK_WEEKS };');
    const W = fn().W;
    // 单项选择 / 时态 / 语法 / 听力模块都在
    let mcCount = 0;
    W.forEach(week => week.forEach(d => (d.modules || []).forEach(m => {
      if (m.type === 'multiple_choice') mcCount++;
    })));
    ok(mcCount >= 16, '各天新增了单项选择模块（共 ' + mcCount + ' 个）');
    function find(w, day, suf) { return W[w][day].modules.find(m => m.id === suf || m.id.endsWith(suf)); }
    // v155：周一/三/六的时态模块、周日的时态+语法模块已删除（真实动作=30）
    ok(!find(0, 0, 'mon-tense2') && !find(0, 6, 'sun-tense') && !find(0, 6, 'sun-grammar'),
       'v155 已删掉补量的时态/语法模块（周一三六 + 周日）');
    ok(!!find(0, 6, 'sun-listening'), '周日保留听力模块');
    // 每个 choice 4 选项、每个题有解析、听力有原文（抽查 W1-W2 全部）
    let badOpt = 0, noCn = 0, noAudio = 0, dupId = 0;
    const ids = {};
    W.forEach(week => week.forEach(d => (d.modules || []).forEach(m => {
      (m.questions || []).forEach(q => {
        if (ids[q.id]) dupId++;
        ids[q.id] = 1;
        if (q.type === 'choice' && (!Array.isArray(q.options) || q.options.length !== 4)) badOpt++;
        if (!q.explanation_cn) noCn++;
        if (m.type === 'listening' && !q.audio_text) noAudio++;
      });
    })));
    ok(badOpt === 0, '所有选择题恰好 4 个选项', badOpt + ' 处');
    ok(noCn === 0, '所有题目都有中文解析', noCn + ' 处');
    ok(noAudio === 0, '所有听力题都有原文', noAudio + ' 处');
    ok(dupId === 0, '题目 ID 全局无重复', dupId + ' 处');
    // 填空题答案全部小写（家长红线）
    let upper = [];
    W.forEach(week => week.forEach(d => (d.modules || []).forEach(m =>
      (m.questions || []).forEach(q => {
        if (q.type === 'fill' && /[A-Z]/.test(String(q.answer || ''))) upper.push(q.id);
      }))));
    ok(upper.length === 0, '所有填空答案都是小写', upper.slice(0, 5).join(','));
  }

  console.log('\n== 6. 版本号 = 153 ==');
  {
    ok(/app-version" content="173"/.test(htmlSrc), 'index.html meta = 153');
    ok((htmlSrc.match(/\?v=173/g) || []).length >= 5, '脚本引用 ?v=173（' + (htmlSrc.match(/\?v=173/g) || []).length + ' 处）');
    ok(/amy-english-v173/.test(swSrc) && /var V = 173;/.test(swSrc), 'sw.js 缓存名与 V = 153');
  }

  console.log('');
  console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
  process.exit(failN === 0 ? 0 : 1);
}
