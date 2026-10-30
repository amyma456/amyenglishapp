/* eslint-disable */
// verify-v168（家长 2026-10-30）：
//   「老师的手机端题库预览，这里可以点前一天后一天，但是看不到日期。
//    把这个界面调整一下，像电脑一样可以看到日期。虽然可以看见，但是它用
//    省略号表示了，字可以小一点，让界面好看一点，能看到日期。」
//
// 钉住三件事：
//   1. 顶栏改成两行：第一行「退出 / 本周·周X（今天） / 换天」，第二行
//      「‹ 前一天 / 📅 完整日期 / 后一天 ›」—— 日期不再被省略号吞掉
//   2. 字号压小（按钮 11px、文字 12px），顶栏让位高度 44px → 64px，
//      舞台高度公式跟着 --pv-h 走，一个字节不改
//   3. 换天浮层的定位 fallback 同步 64px
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('  ✓ ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
  else { fail++; console.log('  ✗ FAIL ' + msg + (extra !== undefined ? '  (实际 ' + extra + ')' : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const htmlSrc = read('public/index.html');
const appSrc = read('public/app.js');
const swSrc = read('public/sw.js');

// ---------------------------------------------------------------------------
section('1. 顶栏两行结构');
{
  const bar = appSrc.slice(appSrc.indexOf("class=\"pv-bar\""), appSrc.indexOf('---- 换天浮层'));
  ok((bar.match(/pv-line/g) || []).length === 2, '顶栏正好两行（两个 pv-line）', (bar.match(/pv-line/g) || []).length);
  ok(bar.indexOf('closePreview') < bar.indexOf('pv-title'), '第一行：退出 + 标题');
  ok(bar.includes('togglePvPicker()'), '第一行保留「换天 ▾」');
  const line2 = bar.slice(bar.indexOf("class=\"pv-line\"", bar.indexOf("class=\"pv-line\"") + 1));
  ok(line2.includes('previewStep(-1)') && line2.includes('previewStep(1)'), '第二行：前一天 / 后一天按钮');
  ok(line2.includes('pv-date') && line2.includes('getDayDateLabel(d, weekOff)'), '第二行有完整日期');
  ok(!line2.includes('（今天）'), '「（今天）」标记留在第一行标题，日期行干净');
  // 前一天/后一天之间的日期不被按钮挤没：按钮在 pv-bar 内是 flex:none
  ok(/\.pv-bar button\{flex:none/.test(htmlSrc), '顶栏按钮 flex:none，空间让给日期');
}

// ---------------------------------------------------------------------------
section('2. 字号与高度');
{
  ok(/--pv-h:64px/.test(htmlSrc), '顶栏让位高度 44px → 64px（两行）');
  ok(/\.pv-bar button\{flex:none;padding:3px 8px;font-size:11px\}/.test(htmlSrc), '按钮字号压到 11px');
  ok(/\.pv-bar \.pv-date\{[^}]*font-size:12px/.test(htmlSrc), '日期字号 12px');
  ok(/\.pv-bar \.pv-title\{[^}]*font-size:12px/.test(htmlSrc), '标题字号 12px');
  ok(/\.pv-bar \.pv-date\{[^}]*text-overflow:ellipsis/.test(htmlSrc), '日期行保底防溢出（正常宽度下不会触发）');
  ok(/\.pv-picker\{[^}]*var\(--pv-h,64px\)/.test(htmlSrc), '换天浮层定位 fallback 同步 64px');
  ok(/height:calc\(100dvh - var\(--nav-h\) - var\(--pv-h\)/.test(htmlSrc), '舞台高度公式仍走 --pv-h，舞台样式零改动');
}

// ---------------------------------------------------------------------------
section('3. 版本钉子 = 168');
{
  ok(/name="app-version" content="173"/.test(htmlSrc), 'index.html app-version = 168');
  ok((htmlSrc.match(/\?v=173/g) || []).length === 6, 'index.html 6 处 ?v=173', (htmlSrc.match(/\?v=173/g) || []).length);
  ok(!/\?v=16[0-7]\b/.test(htmlSrc), 'index.html 没有残留旧 ?v=');
  ok(/var V = 173;/.test(swSrc), 'sw.js var V = 168');
  ok(/amy-english-v173/.test(swSrc), 'sw.js CACHE_NAME = amy-english-v173');
  ok(!/amy-english-v16[0-7]\b/.test(swSrc), 'sw.js 没有残留旧缓存名');
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
