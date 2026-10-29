// v154 验证：
//  1) 每天恰好 30 个单元（题 + 词）：带词汇的日子 25 题 + 5 词，
//     不带词汇的日子 30 题（家长：所有题加单词加起来 30 道）
//  2) 做题进度按"题"计数：sh-count 显示「第 X / 30 题」，逐句翻译过程屏
//     不涨数，错题巩固显示「🎯 巩固」
//  3) 太简单的词不进修复/巩固、不挡整句（_isSimpleWord）
//  4) 单词跟读放宽：修复词 40 分线，错词巩固 40 分线 + 连试 3 次自动放行
const fs = require('fs');
const path = require('path');
const jsdom = require('C:/Users/amyma/.workbuddy/binaries/node/workspace/node_modules/jsdom');

let pass = 0, failN = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { failN++; console.log('  FAIL ' + name + (extra ? ' —— ' + extra : '')); }
};

const R = __dirname;
const appSrc = fs.readFileSync(path.join(R, '..', 'public', 'app.js'), 'utf8')
  .replace(/\nApp\.init\(\);/, '\n/* 测试里不启动 */');
const htmlSrc = fs.readFileSync(path.join(R, '..', 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(R, '..', 'public', 'sw.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(R, '..', 'public', 'data.js'), 'utf8');

console.log('== 1. 每天恰好 30 个真实动作（v155 口径：读/译/题/词）==');
{
  const W = new Function(dataSrc + '; return HOMEWORK_WEEKS;')();
  const sentsEN = t => String(t).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || [String(t)];
  let allOk = true, detail = [];
  W.forEach((week, wi) => week.forEach(d => {
    let n = 0;
    (d.modules || []).forEach(m => {
      if (m.questions) n += m.questions.length;
      if (m.blanks) n += m.blanks.length;
      if (m.words) n += m.words.length;
      if (m.passage) n += 2 * sentsEN(m.passage).length;   // 读一句 + 译一句
      if (m.type === 'writing_template') n += sentsEN(m.full_text || '').length;
    });
    if (n !== 30) { allOk = false; detail.push('W' + (wi + 1) + d.day_cn + '=' + n); }
  }));
  ok(allOk, '28 天每天真实动作恰好 30', detail.join(' '));
  let durOk = true;
  W.forEach(week => week.forEach(d => {
    const sum = d.modules.reduce((s, m) => s + (m.duration || 0), 0);
    if (sum !== d.total_duration) durOk = false;
  }));
  ok(durOk, '每天 total_duration = 各模块之和');
}

console.log('\n== 2. 做题进度按"题"计数 ==');
{
  // app.js 里 _buildSteps 会用到 Api / Recorder（错题巩固段），给最小桩
  const ApiStub = {
    answerKey: (a, b, c, d) => [a, b, c, d].join('_'),
    checkinKey: (a, b) => a + '_' + b,
    load: async () => ({ answers: {}, checkins: {} }),
  };
  const makeApp = () => {
    const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
    return new Function('stubs', `
      const { document, window, location, navigator, localStorage, Api, HOMEWORK_DATA,
              HOMEWORK_WEEK_IDX, URL, fetch } = stubs;
      ${appSrc}
      return { App };
    `)({
      document: dom.window.document, window: dom.window, location: dom.window.location,
      navigator: dom.window.navigator, localStorage: dom.window.localStorage,
      Api: ApiStub,
      HOMEWORK_DATA: new Function(dataSrc + '; return HOMEWORK_WEEKS[0];')(),
      HOMEWORK_WEEK_IDX: 0,
      URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
      fetch: () => new Promise(() => {}),
    }).App;
  };
  ok(/_dayUnits\(dayIdx\) \{/.test(appSrc), '_dayUnits 有定义（真实动作 = 单元）');
  ok(/_unitsOfStep\(step, day\) \{/.test(appSrc), '_unitsOfStep 有定义');
  ok(/_unitsBeforeStep\(steps, idx, dayIdx\) \{/.test(appSrc), '_unitsBeforeStep 有定义');
  // v155：读一句 / 译一句都是真实的一道题
  ok(/2 \* this\._splitSentences\(m\.passage\)\.length/.test(appSrc), '文章逐句读+逐句译都计入单元数');
  ok(/step\.kind === 'sentence' \|\| step\.kind === 'translate'/.test(appSrc), '读一句/译一句各占 1 个单元');
  ok(/step\.kind === 'writingread'\) return this\._writingSentences\(m\)\.length/.test(appSrc), '朗读作文逐句计入单元数');
  // 词汇模块的词全算单元
  ok(/if \(m\.words\) n \+= m\.words\.length;/.test(appSrc), '词汇的词计入单元数');
  // sh-count 不再显示步骤下标
  ok(!/sh-count">' \+ \(this\.state\.stepIdx \+ 1\) \+ ' \//.test(appSrc),
     'sh-count 不再显示「第 X / 步骤总数」');
  ok(/第 ' \+ curU \+ ' \/ ' \+ totalU \+ ' 题/.test(appSrc), 'sh-count 显示「第 X / 30 题」');
  ok(/isConsolid \? '🎯 巩固'/.test(appSrc), '错题巩固步骤显示「🎯 巩固」，不占 30');
  // 行为级：单元计数对得上
  const App = makeApp();
  const day0 = new Function(dataSrc + '; return HOMEWORK_WEEKS[0][0];')();
  // v155：W1 周一 = 口语5 + 词汇5 + 阅读(读6+译6+题4) + 单选4 = 30
  ok(App._dayUnits(0) === 30, 'W1 周一真实动作 = 30（' + App._dayUnits(0) + '）');
  const steps = App._buildSteps(0);
  ok(steps[0].kind === 'speaking', '第 1 步是口语题');
  const units0 = App._unitsBeforeStep(steps, 0, 0);
  const u0 = App._unitsOfStep(steps[0], day0);
  ok(units0 === 0 && u0 === 1, '口语第 1 题之前 0 个单元、本步占 1 个');
  // 阅读逐句翻译那一步：每句翻译本身是一道题（占 1）
  const tIdx = steps.findIndex(s => s.kind === 'translate');
  ok(tIdx > 0, '存在阅读逐句翻译步骤');
  if (tIdx > 0) {
    const before = App._unitsBeforeStep(steps, tIdx, 0);
    ok(before === 16, '逐句翻译开始前已完成 16 个动作（口语5 + 词汇5 + 读6句）（' + before + '）');
    ok(App._unitsOfStep(steps[tIdx], day0) === 1, '每句翻译占 1 个单元（真的一道题）');
  }
  // 读句子那一步也占 1
  const sIdx = steps.findIndex(s => s.kind === 'sentence');
  if (sIdx > 0) ok(App._unitsOfStep(steps[sIdx], day0) === 1, '读一句英语占 1 个单元');
  // 巩固步骤（retry/review）占 0
  const rStep = { kind: 'review', word: 'test' };
  ok(App._unitsOfStep(rStep, null) === 0, '错词巩固步骤占 0 个单元');
}

console.log('\n== 3. 太简单的词不进修复/巩固 ==');
{
  ok(/_isSimpleWord\(raw\) \{/.test(appSrc), '_isSimpleWord 有定义');
  ok(/if \(this\._isSimpleWord\(word\)\) return;\s*\/\/ v154/.test(appSrc.replace(/\n\s*\/\/ v154[^\n]*/g, '\n')),
     '_reviewAdd 过滤太简单的词');
  ok((appSrc.match(/!self\._isSimpleWord\(x\.target\)/g) || []).length === 2,
     '两处错词收集（阅读逐句 + 写作逐句）都过滤太简单的词');
  // 行为级
  const dom = new jsdom.JSDOM('<div></div>', { url: 'https://amyeng.top/' });
  const App = new Function('stubs', `
    const { document, window, location, navigator, localStorage, Api, HOMEWORK_DATA,
            HOMEWORK_WEEK_IDX, URL, fetch } = stubs;
    ${appSrc}
    return { App };
  `)({
    document: dom.window.document, window: dom.window, location: dom.window.location,
    navigator: dom.window.navigator, localStorage: dom.window.localStorage,
    Api: { answerKey: (a, b, c, d) => [a, b, c, d].join('_'), checkinKey: (a, b) => a + '_' + b },
    HOMEWORK_DATA: new Function(dataSrc + '; return HOMEWORK_WEEKS[0];')(),
    HOMEWORK_WEEK_IDX: 0,
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} },
    fetch: () => new Promise(() => {}),
  }).App;
  ok(App._isSimpleWord('the') === true, 'the → 太简单');
  ok(App._isSimpleWord('cat') === true, 'cat（3 字母）→ 太简单');
  ok(App._isSimpleWord('and') === true, 'and → 太简单');
  ok(App._isSimpleWord('123') === true, '数字 → 太简单');
  ok(App._isSimpleWord('vegetables') === false, 'vegetables → 要修');
  ok(App._isSimpleWord('dumplings') === false, 'dumplings → 要修');
  // 行为级：_reviewAdd 对简单词不入队
  App._reviewAdd('the');
  App._reviewAdd('cat');
  App._reviewAdd('delicious');
  const list = App._reviewLoad();
  ok(list.length === 1 && list[0].w === 'delicious',
     '错词队列只收真正读错的词（the/cat 不入队）');
}

console.log('\n== 4. 单词跟读放宽（说了就过）==');
{
  ok(/a\.ok >= 1 && a\.score >= 40\) \|\| self\._heardAny\(word, text\)/.test(appSrc),
     '修复词分数线 60 → 40');
  ok(/hit = voiceOk \|\| \(a\.ok >= 1 && a\.score >= 40\) \|\| self\._heardAny\(word, text\)/.test(appSrc),
     '错词巩固分数线 60 → 40');
  ok(/ctx\.attempts >= 3/.test(appSrc), '错词巩固连试 3 次自动放行');
  ok((appSrc.match(/ctx\.attempts = \(ctx\.attempts \|\| 0\) \+ 1;/g) || []).length === 2,
     '两条路径（有识别结果 / 没录到声音）都计入尝试次数');
  ok(/这一轮先算过，明天再巩固一次/.test(appSrc), '放行时有明确的"先算过"话术');
  ok(/attempts: 0 \}/.test(appSrc), '_reviewCtx 初始化 attempts');
}

console.log('\n== 5. 版本号 = 154 ==');
{
  ok(/app-version" content="167"/.test(htmlSrc), 'index.html meta = 154');
  ok((htmlSrc.match(/\?v=167/g) || []).length >= 5, '脚本引用 ?v=167（' + (htmlSrc.match(/\?v=167/g) || []).length + ' 处）');
  ok(/amy-english-v167/.test(swSrc) && /var V = 167;/.test(swSrc), 'sw.js 缓存名与 V = 154');
}

console.log('');
console.log(failN === 0 ? '全部 ' + pass + ' 项通过 ✅' : '有 ' + failN + ' 项失败 ❌');
process.exit(failN === 0 ? 0 : 1);
