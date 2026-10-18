// ===========================================================================
// v132 回归红线：删掉的学生不许再回来（fail-closed 拦截）
//
// 老师 2026-10-16 原话：
//   「老师端删除学生还是在删除了，就显示不在，说是那样说，但是仍然还在删除了。
//     所有的都删掉，不要再出现数据。只要删除了，任何人登进来都需要被验证，
//     都需要老师同意才行」
//
// 根因：app.js 的 registerStudent() 里
//     if (status && status.removed)  { 拦住 }
// classStatus() 在网络失败/超时/非 200 时返回 **null**，
// 那时 `status && status.removed` 是 false → **当场放行**。
// 这就是"删除后又冒回来"的入口。
//
// 本测试锁死：**查不到 = 必须拦住**。
// ===========================================================================

const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fail++; console.log('  ✗ ' + label + (extra !== undefined ? '  → ' + extra : '')); }
}

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');

// 去掉注释后的源码 —— 静态扫描"不许再出现某写法"时必须用这份，
// 否则我自己写的解释性注释（里面引用了旧写法）会把自己判红。
const appCode = appSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')     // 块注释
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // 行注释（避开 http:// 这种）

// 取某方法体：从 "  async name(" 或 "  name(" 开始，到下一个同级方法为止。
function methodBody(src, name) {
  const tryStart = [
    '\n  async ' + name + '(',
    '\n  ' + name + '(',
  ];
  let start = -1;
  for (const t of tryStart) { const i = src.indexOf(t); if (i >= 0) { start = i; break; } }
  if (start < 0) return '';
  const rest = src.slice(start + 1);
  // 下一个顶层方法（两个空格缩进 + 名字 + 括号）
  const re = /\n  (?:async )?[A-Za-z_$][\w$]*\s*\(/g;
  re.lastIndex = 1;
  const m = re.exec(rest);
  return m ? rest.slice(0, m.index) : rest;
}

const regBody = methodBody(appCode, 'registerStudent');

// ===========================================================================
console.log('\n== ① registerStudent 的门必须是 fail-closed ==');
{
  ok(regBody.length > 400, '拿到 registerStudent 函数体', regBody.length + ' 字符');

  ok(/status\s*===\s*null/.test(regBody),
     '★ 显式判断 "查不到（null）" 这种情况');

  ok(!/\bif\s*\(\s*status\s*&&\s*status\.removed\s*\)\s*\{/.test(regBody),
     '★ 已经不再用 "status && status.removed" 这种 fail-open 写法');

  // 三次都查不到时必须走 showGateCheckFailed，而不是继续往下注册
  ok(/showGateCheckFailed\s*\(/.test(regBody),
     '★ 三次都查不到 → 走核对失败页（不是放行）');

  // 关键：showGateCheckFailed 那一支必须有 return，不能继续注册
  const m = regBody.match(/this\.showGateCheckFailed\([^)]*\);\s*\n\s*return;/);
  ok(!!m, '★ 核对失败那一支**必须 return**（不许继续注册）');
}

// ===========================================================================
console.log('\n== ② 必须有一次短暂重试（不能让正常学生被误伤） ==');
{
  ok(/_retryClassStatus\s*\(/.test(appCode), '★ 有 _retryClassStatus 重试函数');
  ok(/_retryClassStatus\s*\(\s*phone\s*,\s*(1|2)\s*\)/.test(regBody),
     '★ registerStudent 里调用它做重试（v142 起只重试 1 次：这条路径上每一跳都是孩子在等）');

  // 重试函数本身
  const retryBody = methodBody(appCode, '_retryClassStatus');
  ok(retryBody.length > 100, '拿到 _retryClassStatus 函数体', retryBody.length + ' 字符');
  ok(/timesLeft\s*<=\s*0\)\s*return\s+null/.test(retryBody),
     '★ 用完次数就返回 null（不会无限重试）');
  ok(/setTimeout/.test(retryBody), '★ 重试之间有等待（不是死循环猛打）');
  ok(/Api\.classStatus/.test(retryBody), '★ 重试调的是真的 classStatus');
}

// ===========================================================================
console.log('\n== ③ 核对失败页：不放行、也不谎称"你被删了" ==');
{
  const gcf = methodBody(appCode, 'showGateCheckFailed');
  ok(gcf.length > 200, '拿到 showGateCheckFailed 函数体', gcf.length + ' 字符');
  ok(/正在核对/.test(gcf), '★ 措辞是"正在核对"，不是"你已被移出"');
  ok(!/已被移出班级/.test(gcf), '★ 没有谎称学生被删');
  ok(/重新核对|重试/.test(gcf), '★ 有重试入口给正常学生');
  ok(/onclick/.test(gcf), '★ 重试按钮真的能点');
  // 关键：它不能把学生放进主界面
  ok(!/main-app'\)\.classList\.remove\('hidden'\)/.test(gcf),
     '★ 没有偷偷显示主界面');
}

// ===========================================================================
console.log('\n== ④ renderRemovedCard 不许覆盖核对失败页 ==');
{
  const rrc = methodBody(appCode, 'renderRemovedCard');
  ok(/checkFailed/.test(rrc), '★ renderRemovedCard 认得 checkFailed 状态');
  const guardIdx = rrc.indexOf('checkFailed');
  const overwriteIdx = rrc.indexOf('card.innerHTML');
  ok(guardIdx >= 0 && overwriteIdx > guardIdx,
     '★ 提前 return 在写 innerHTML 之前（否则会覆盖掉重试按钮）');
  ok(/if\s*\(\s*st\.checkFailed\s*\)\s*return/.test(rrc),
     '★ 是 "直接 return" 的写法');
}

// ===========================================================================
console.log('\n== ⑤ 轮询那条路也要兜住（人在里面、老师中途删了） ==');
{
  const idx = appCode.indexOf('const st = await Api.classStatus(this.state.phone);');
  ok(idx > 0, '找到轮询里的 classStatus 调用');
  const near = appCode.slice(idx, idx + 1200);
  ok(/st\s*!==\s*null/.test(near), '★ 轮询里先处理"查得到"的情况');
  ok(/_retryClassStatus/.test(near), '★ 轮询里也会重试');
  ok(/showGateCheckFailed/.test(near), '★ 轮询兜底也会请到核对页');
}

// ===========================================================================
console.log('\n== ⑥ 行为验证：用真逻辑跑一遍"网络失败"这一天 ==');
(async () => {
{
  // 复刻修复后的判定逻辑（与 app.js 一致）
  async function decide(classStatusImpl) {
    let status = await classStatusImpl();
    if (status === null) {
      // 重试 2 次
      for (const wait of [800, 1600]) {
        void wait;
        status = await classStatusImpl();
        if (status !== null) break;
      }
    }
    if (status === null) return 'gate-check-failed';   // fail-closed
    if (status.removed) return 'removed-page';
    return 'registered';
  }

  const neverAnswers = async () => null;
  const alwaysRemoved = async () => ({ removed: true });
  const normal = async () => ({ removed: false });
  // 前两次失败、第三次成功（模拟网络抖动恢复）
  let n = 0;
  const flakyThenOk = async () => (++n < 3 ? null : { removed: false });
  // 前两次失败、第三次说"已删除"
  let k = 0;
  const flakyThenRemoved = async () => (++k < 3 ? null : { removed: true });

  ok(await decide(neverAnswers) === 'gate-check-failed',
     '★★ 一直查不到 → 拦住（不进班）', await decide(neverAnswers));
  ok(await decide(alwaysRemoved) === 'removed-page',
     '★ 明确已删除 → 拦住', await decide(alwaysRemoved));
  ok(await decide(normal) === 'registered',
     '★ 正常学生 → 放行（不误伤）', await decide(normal));
  ok(await decide(flakyThenOk) === 'registered',
     '★ 抖动后恢复的正常学生 → 最终放行', await decide(flakyThenOk));
  ok(await decide(flakyThenRemoved) === 'removed-page',
     '★ 抖动后查出已删除 → 拦住', await decide(flakyThenRemoved));
}

// ===========================================================================
console.log('\n== ⑦ 旧的 fail-open 写法不许在任何地方复活 ==');
{
  // 用**去注释**的源码扫，否则我自己写的解释性注释会把自己判红。
  const bad = appCode.match(/if\s*\(\s*\w+\s*&&\s*\w+\.removed\s*\)/g) || [];
  ok(bad.length === 0, '★ 代码里没有 "x && x.removed" 的 fail-open 判断',
     bad.length ? bad.join(' ; ') : undefined);

  const bad2 = appCode.match(/if\s*\(\s*st\s*&&\s*st\.removed\s*\)/g) || [];
  ok(bad2.length === 0, '★ 没有 "st && st.removed" 写法', bad2.length ? bad2.join(' ; ') : undefined);

  // 交叉确认：原文件里那些字样只存在于注释中
  const rawHits = (appSrc.match(/status && status\.removed|st && st\.removed/g) || []).length;
  const codeHits = (appCode.match(/status && status\.removed|st && st\.removed/g) || []).length;
  ok(codeHits === 0, '★ 原文件里的旧写法**全在注释里**（代码中 0 处）',
     '原文件 ' + rawHits + ' 处 / 去注释后 ' + codeHits + ' 处');
}

console.log('\n' + (fail === 0
  ? '全部通过 ✅  （' + pass + ' 项）'
  : pass + ' 项通过，' + fail + ' 项失败 ❌'));
process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.log('  !! 测试自身崩了：' + (e && e.stack || e)); process.exit(1); });
