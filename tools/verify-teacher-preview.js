// ===========================================================================
// v134 回归红线：老师端「题库预览」
//
// 老师 2026-10-16 原话：
//   「老师端能够看到两周的作业题，并且每天的作业题显示的和学生界面是一样的。
//     这样的话，老师可以将做题做一遍，然后发现问题提前把后一天的题给更新一下
//     ……每天的题型和这个学生的题做题的界面给融合一下，这样的话，两个都不耽误」
//
// 本测试锁死四件事：
//   ① 老师能真的翻到**下周**的题（原来两个区块共用一份数据，"下周"显示的是本周）
//   ② 预览渲染的就是学生的 renderStage()，不是另做的一份预览版
//   ③ 老师在预览里**一个字节都写不进去**（答案/打卡/断点/口语留档）
//   ④ 学生端一点没被影响（学生永远看本周、永远走自己的路）
// ===========================================================================

const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label + (extra !== undefined ? '  → ' + extra : '')); }
}

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'data.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

// 静态扫描一律先剥注释 —— 我自己的说明里就引用了旧写法，不剥会假阳性。
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

// 用真 data.js 建一个可观察的沙箱：getData() 反映换周后的当前值
function loadData() {
  return new Function(dataSrc + `
    return {
      WEEKS: HOMEWORK_WEEKS,
      IDX: HOMEWORK_WEEK_IDX,
      LEN: HOMEWORK_WEEKS.length,
      getData: function () { return HOMEWORK_DATA; },
      hwWeekData: hwWeekData,
      hwSetActiveWeek: hwSetActiveWeek
    };`)();
}

// ===========================================================================
console.log('\n== ① data.js 必须提供"受控换周"，而不是让老师去改全局 ==');
{
  const D = loadData();

  ok(/\blet\s+HOMEWORK_DATA\b/.test(dataSrc),
     '★★ HOMEWORK_DATA 是 let（const 换不动，老师翻不了下周）');

  ok(!/\bconst\s+HOMEWORK_DATA\b/.test(dataSrc),
     '★ 不能同时留着 const 声明（会 SyntaxError）');

  ok(typeof D.hwWeekData === 'function', '★ 有 hwWeekData(offset)');
  ok(typeof D.hwSetActiveWeek === 'function', '★ 有 hwSetActiveWeek(offset)');

  // 78 处读取点不用改 —— 说明这不是"给老师复制一份数据"，而是换入换出同一个名字
  const reads = (appSrc.match(/HOMEWORK_DATA/g) || []).length;
  ok(reads > 50, '★ app.js 里 HOMEWORK_DATA 读取点仍是老样子（' + reads + ' 处，一处没改）');
}

// ===========================================================================
console.log('\n== ② 周次换算：本周 ≠ 下周（这就是老师看不到下周题目的那个 bug） ==');
{
  const D = loadData();
  const thisWeek = D.hwWeekData(0);
  const nextWeek = D.hwWeekData(1);

  ok(thisWeek === D.WEEKS[D.IDX], '★★ hwWeekData(0) 就是本周（第 '
     + (D.IDX + 1) + ' 周，共 ' + D.LEN + ' 周）');

  if (D.IDX + 1 < D.LEN) {
    ok(nextWeek === D.WEEKS[D.IDX + 1],
       '★★ hwWeekData(1) 真的是**下一周**（WEEK' + (D.IDX + 2) + '），不是本周的复制品');
    ok(thisWeek !== nextWeek,
       '★★ 本周和下周必须是两份不同的题库（原来两栏都指向同一份 → 老师查错了题）');

    // 两份题库的**主题标签**是刻意复用的（同一天的题型排布一样，都叫
    // "AI口语 + 高频词汇 + 阅读理解"），所以拿 theme_cn 当"是不是同一份"的
    // 判据会假阳性。要比就比真正的内容：课文 / 题目。
    const a = thisWeek[0], b = nextWeek[0];
    const pick = (d) => {
      const m = ((d && d.modules) || []).find(x => x.passage || (x.questions && x.questions.length));
      if (!m) return '';
      return String(m.passage
        || (m.questions[0] && (m.questions[0].question || m.questions[0].sentence)) || '');
    };
    const ta = pick(a), tb = pick(b);
    ok(ta && tb && ta !== tb,
       '★★ 两份题库的周一**内容**真的不同（不是同一份贴了两个标题）',
       ta && tb ? ('本周「' + ta.slice(0, 26) + '…」 vs 下周「' + tb.slice(0, 26) + '…」') : '取不到内容');
    ok(a && b && a !== b, '★ 两份题库是不同的对象（不是同一个数组的引用）');
  } else {
    ok(nextWeek === D.WEEKS[D.LEN - 1], '★ 已是最后一周 → 下周夹取到最后一周（不越界）');
  }

  ok(D.hwWeekData(-9) === D.WEEKS[0], '★ offset 为负 → 夹取到第 1 周（不 undefined）');
  ok(D.hwWeekData(999) === D.WEEKS[D.LEN - 1], '★ offset 过大 → 夹取到最后一周');
  ok(D.hwWeekData(0) === D.WEEKS[0] || D.hwWeekData(0) === thisWeek, '★ offset 0 稳定');
}

// ===========================================================================
console.log('\n== ③ 换入 / 换出：切到下周，再切回来必须一模一样 ==');
{
  const D = loadData();
  const week0 = D.getData();

  const swapped = D.hwSetActiveWeek(1);
  ok(swapped === D.getData(), '★ hwSetActiveWeek(1) 之后读到的就是下周数据');
  ok(D.getData() !== week0, '★ 确实换过去了（不是原地没动）');

  const back = D.hwSetActiveWeek(0);
  ok(back === D.getData(), '★★ 切回 0 之后恢复成本周');
  ok(D.getData() === week0, '★★ 恢复的是**同一份**（同一个数组引用，没被克隆/污染）');
}

// ===========================================================================
console.log('\n== ④ 什么时候才允许切周：只有"老师 + 正停在预览页" ==');
{
  let obj;
  try {
    obj = new Function('return {' + methodBody(appCode, '_previewWeekOffset') + '}')();
  } catch (e) { obj = null; }
  ok(!!obj && typeof obj._previewWeekOffset === 'function',
     '拿到可执行的 _previewWeekOffset（真实代码，非重写）');

  if (obj) {
    // 老师 + 停在预览页 → 跟随 previewWeek
    obj.isTeacher = () => true;
    obj.state = { currentTab: 'preview', previewWeek: 1 };
    ok(obj._previewWeekOffset() === 1, '★★ 老师停在预览页看下周 → 生效周 = 下周');

    obj.state = { currentTab: 'preview', previewWeek: 0 };
    ok(obj._previewWeekOffset() === 0, '★ 老师停在预览页看本周 → 生效周 = 本周');

    // 老师切走标签 → 必须回到本周
    obj.state = { currentTab: 'weekly', previewWeek: 1 };
    ok(obj._previewWeekOffset() === 0,
       '★★ 老师切回「周计划」→ 立刻回到本周（否则周计划会把下周的题当本周显示）');

    obj.state = { currentTab: 'edit', previewWeek: 1 };
    ok(obj._previewWeekOffset() === 0, '★ 切到「作业编辑」也回到本周');

    // 学生永远 0，跟 state 怎么摆无关
    obj.isTeacher = () => false;
    obj.state = { currentTab: 'preview', previewWeek: 1 };
    ok(obj._previewWeekOffset() === 0, '★★ 学生端永远是本周（学生怎么都看不到下周题）');

    obj.state = { currentTab: 'today', previewWeek: 1 };
    ok(obj._previewWeekOffset() === 0, '★ 学生的「今日作业」永远是本周');
  }

  ok(/previewDay\s*:\s*null/.test(appCode), '★ state 里有 previewDay（默认 null = 没在预览）');
  ok(/previewWeek\s*:\s*0/.test(appCode), '★ state 里有 previewWeek（默认 0 = 本周）');
}

// ===========================================================================
console.log('\n== ⑤ 每次渲染都重新对齐周次（中途异常也不会卡在"下周题库"） ==');
{
  const rc = methodBody(appCode, 'renderContent');
  ok(/this\._syncWeekData\(\)/.test(rc),
     '★★ renderContent 开头就调 _syncWeekData()（每次渲染重新宣告一次）');

  // 调用必须发生在渲染分发之前 —— 否则渲染读到的还是上一轮的周
  const iSync = rc.indexOf('_syncWeekData');
  const iSwitch = rc.indexOf('switch(tab)');
  ok(iSync >= 0 && iSwitch > iSync,
     '★★ _syncWeekData 在渲染分发**之前**（否则渲染读到的周是上一轮的）');

  const sw = methodBody(appCode, '_syncWeekData');
  ok(/hwSetActiveWeek/.test(sw), '★ _syncWeekData 真的调用了换周函数');
  ok(/typeof\s+hwSetActiveWeek\s*!==\s*'function'/.test(sw),
     '★ 老缓存（没有 hwSetActiveWeek）时安全跳过，不抛错');
}

// ===========================================================================
console.log('\n== ⑥ 预览渲染的就是学生的 renderStage，不是另做一份 ==');
{
  const pv = methodBody(appCode, 'renderPreview');
  ok(pv.length > 500, '拿到 renderPreview 函数体', pv.length + ' 字符');

  ok(/this\.renderStage\s*\(/.test(pv),
     '★★ renderPreview 调用了 renderStage（学生那一屏本体）');

  // 反证：不能在预览里自己拼一套题目界面
  ok(!/renderQuestionsStudent\s*\(/.test(pv),
     '★★ 没有自己拼一套题目界面（那就会和学生的慢慢走样）');
  ok(!/renderSentenceStep\s*\(/.test(pv), '★★ 没有自己拼跟读界面');

  ok(/hwWeekData\s*\(/.test(pv), '★ 按当前周偏移取题库');

  // 舞台样式：必须和学生的 today 一样进 stage-mode，否则长得不一样
  const rc = methodBody(appCode, 'renderContent');
  ok(/stage-mode/.test(rc) && /preview/.test(rc),
     '★ 预览也进 stage-mode（不然同一个界面在老师这儿长得不一样）');
  ok(/preview-mode/.test(rc),
     '★ 预览另加 preview-mode（给顶栏让出一行高度，舞台本体不动）');
  ok(/--pv-h/.test(htmlSrc),
     '★ index.html 里 pv-bar 用 --pv-h 让位，不覆盖 .stage 的高度公式');

  const iBar = htmlSrc.indexOf('.pv-bar');
  const iStage = htmlSrc.indexOf('body.preview-mode .stage');
  ok(iBar > 0 && iStage > 0, '★ pv-bar 与 preview-mode 样式都在 index.html');
}

// ===========================================================================
console.log('\n== ⑦ 老师在预览里一个字节都写不进去 ==');
{
  // ① 答案 / 打卡 / 错题上报的唯一汇集点
  const ra = methodBody(appCode, '_recordAnswer');
  ok(/isTeacher\(\)/.test(ra.slice(0, 400)),
     '★★ _recordAnswer 开头就有老师豁免（所有写入的唯一漏斗）');
  ok(/if\s*\(\s*this\.isTeacher\(\)\s*\|\|\s*!this\.state\.phone\s*\)\s*return/.test(ra.slice(0, 400)),
     '★★ 而且是直接 return，不是只跳过某一步');

  // ② 断点续做位置
  const sp = methodBody(appCode, '_savePos');
  ok(/isTeacher\(\)/.test(sp.slice(0, 300)),
     '★★ _savePos 也有老师豁免（不会污染断点位置）');

  // ③ 口语录音 —— v134 新补的一道闸
  const ps = methodBody(appCode, '_persistSpeakingClip');
  ok(ps.length > 300, '拿到 _persistSpeakingClip 函数体');
  if (ps.length > 300) {
    ok(/isTeacher\(\)/.test(ps),
       '★★ 口语留档加了老师分支（原来没有 → 老师录一遍就多一条假记录）');
    ok(/createObjectURL/.test(ps),
       '★ 老师走本机 blob 播放（能听到自己读的，但不上传）');
    // 用下标比较，别再用 slice 做区间判断 —— 上次 slice 的 end 正好切在
    // createObjectURL 上，把它自己排除掉了，断言必然失败（自摆乌龙）。
    const iG = ps.indexOf('isTeacher()');
    const iBlob = ps.indexOf('createObjectURL');
    const iSub = ps.indexOf('submitSpeakingScore');
    ok(iG >= 0 && iBlob > iG,
       '★★ 老师分支里才建本机 url（老师在前、blob 在后）',
       'isTeacher@' + iG + ' createObjectURL@' + iBlob);
    ok(iSub > iBlob && iSub > iG,
       '★★ 提交评分排在老师分支之后（老师根本走不到这一步）');
  }

  // ④ 写作朗读门禁：v138 起老师也不再豁免（预览要和学生一模一样），
  //    老师翻不过去时用那颗明说的「跳过本题（老师）」。
  const wg = methodBody(appCode, '_writingReadGateOpen');
  ok(!/if\s*\(\s*this\.isTeacher\(\)\s*\)\s*return\s+true/.test(wg),
     '★★ 写作朗读门禁不再给老师开口子（预览照锁）');

  // ⑤ 预览里的门禁和学生同一套：renderStage 的"锁下一题"不再带 !isTeacher，
  //    改由底部那颗「跳过本题（老师）」给老师留出口。
  const rs = methodBody(appCode, 'renderStage');
  const teacherGuards = (rs.match(/!this\.isTeacher\(\)/g) || []).length;
  ok(teacherGuards <= 2,
     '★★ renderStage 里"锁下一题"不再带 !isTeacher（预览照锁，只剩错题/错词两处）',
     '实际 ' + teacherGuards + ' 处');
  ok(/跳过本题（老师）/.test(rs) && /nextStep\(true\)/.test(rs),
     '★★ 锁着的时候给老师一颗明说的「跳过本题（老师）」→ nextStep(true)');
  ok(/isTeacher\(\)\s*&&\s*this\.state\.currentTab\s*===\s*'preview'/.test(rs),
     '★ 这颗跳过键只在「题库预览」里出现（学生端看不到）');
}

// ===========================================================================
console.log('\n== ⑧ 周计划两栏各取自己那周 + 两个入口都在 ==');
{
  const rw = methodBody(appCode, 'renderWeekly');

  ok(/hwWeekData\s*\(\s*weekOffset\s*\)/.test(rw),
     '★★ renderWeekly 按 weekOffset 取对应周的题库');

  // 反证：renderWeekBlock 里不许再出现裸的 HOMEWORK_DATA.forEach
  const blockStart = rw.indexOf('renderWeekBlock');
  const block = blockStart >= 0 ? rw.slice(blockStart) : '';
  ok(!/HOMEWORK_DATA\.forEach/.test(block),
     '★★ 周区块里不再裸用 HOMEWORK_DATA.forEach（原来两栏共用一份 → 下周显示本周题）');
  ok(/weekDays\.forEach/.test(block), '★★ 改成遍历 weekDays（自己那一周）');

  ok(/openPreview/.test(rw), '★ 周计划每天卡片有「学生界面」入口');
  ok(/stopPropagation/.test(rw),
     '★ 入口按钮拦了冒泡（否则会同时触发卡片的 viewDay，两个都开）');

  // viewDay 也要按周取，不然点"下周五"展开的是本周五
  const vd = methodBody(appCode, 'viewDay');
  ok(/hwWeekData\s*\(\s*weekOffset\s*\)/.test(vd),
     '★★ viewDay 按 weekOffset 取题库（点下周五不该展开本周五）');
  ok(!/const\s+day\s*=\s*HOMEWORK_DATA\[idx\]/.test(vd),
     '★★ 不再固定取 HOMEWORK_DATA[idx]');
  ok(/openPreview/.test(vd), '★ 每日详情里也有进入学生界面的按钮');

  // 标签本身
  ok(/id:\s*'preview'/.test(appCode), '★ 老师端多了一个 preview 标签');
  ok(/题库预览/.test(appCode), '★ 标签名叫「题库预览」');
  ok(/case\s+'preview'/.test(appCode), '★ renderContent 里分发了 preview');

  // 入口动作
  const op = methodBody(appCode, 'openPreview');
  ok(/previewDay\s*=/.test(op) && /previewWeek\s*=/.test(op), '★ openPreview 设好天与周');
  ok(/stepIdx\s*=\s*0/.test(op), '★ 进预览从头看（老师是查题，不是续做）');
  ok(/switchTab\('preview'\)/.test(op), '★ 真的切到预览页');

  const cp = methodBody(appCode, 'closePreview');
  ok(/previewDay\s*=\s*null/.test(cp), '★ 退出时清掉 previewDay');
  ok(/switchTab\('weekly'\)/.test(cp),
     '★ 退出走 switchTab（会改 currentTab，于是周次立刻还原）');
}

// ===========================================================================
console.log('\n== ⑨ 学生端一点没被影响 ==');
{
  const rt = methodBody(appCode, 'renderToday');
  ok(/if\s*\(\s*!this\.isTeacher\(\)\s*\)\s*return\s+this\.renderStage/.test(rt),
     '★★ 学生仍然走 renderStage（今日作业那一屏没变）');

  // 学生端仍然强制回到真实今天
  ok(/this\.state\.currentDay\s*=\s*todayIdx/.test(rt),
     '★ 学生端每次渲染都回到真实的今天（隔夜不卡在旧的一天）');

  // stage-mode 的判定里，学生的 today 依然在
  const rc = methodBody(appCode, 'renderContent');
  ok(/!isTeacher\s*&&\s*tab\s*===\s*'today'/.test(rc),
     '★ 学生 today 依然进 stage-mode');

  // 学生端标签里没有 preview
  const tabsBlock = appCode.slice(appCode.indexOf("id: 'today'"), appCode.indexOf("id: 'today'") + 500);
  ok(!/preview/.test(tabsBlock),
     '★★ 学生端标签列表里没有 preview（学生看不到题库预览）');

  // renderStage 自己的逻辑没被改动成"老师专用"
  const rs = methodBody(appCode, 'renderStage');
  ok(/const\s+steps\s*=\s*this\._buildSteps\s*\(\s*dayIdx\s*\)/.test(rs),
     '★ renderStage 仍是按传入的 dayIdx 建步骤（预览和上课同一条路）');
}

// ===========================================================================
console.log('\n== ⑩ 错词巩固 / 错题重练不许混进老师预览 ==');
{
  const bs = methodBody(appCode, '_buildSteps');
  ok(/if\s*\(\s*!this\.isTeacher\(\)\s*\)\s*\{[\s\S]*_retryWrongQuestions/.test(bs),
     '★★ 错题重练只给学生（老师预览不掺"学生自己的账"）');
  ok(/if\s*\(\s*!this\.isTeacher\(\)\s*\)\s*\{[\s\S]*_reviewDue/.test(bs),
     '★★ 错词跟读也只给学生');
}

// ===========================================================================
console.log('\n' + (fail === 0 ? '全部通过 ✅' : '有失败 ❌') + '  （' + pass + ' 项通过 / ' + fail + ' 项失败）');
process.exit(fail === 0 ? 0 : 1);
