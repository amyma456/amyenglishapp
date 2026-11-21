/* eslint-disable */
// verify-v214（家长 2026-11-19）：
//   1)「遇到长句子，读完了要再点一下结束，这个按钮是看不见的，只能被动地
//      等系统评分，时间很久」→ 录音中的结束按钮 fixed 吸底，长句限高可滚。
//   2)「现在老师和学生的字体都变大了，该大的大、该小的小」→ 字号分层，
//      >=14px 继续放大，<=13px 的辅助小字回落。
//
// 除了静态钉子，还用 vm 真跑一遍 _pinReadEndBtn / _unpinAllReadBtns，
// 确认开录、结束、兜底三条路径的 class 增删都正确。
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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
section('1. 录音中的「结束」按钮固定吸底');
{
  ok(/\.rd-end-pin\{[\s\S]*?position:fixed!important/.test(htmlSrc),
    '按钮 position:fixed，脱离 stage-mode 的不滚动容器');
  ok(/\.rd-end-pin\{bottom:14px\}/.test(htmlSrc),
    '老内核不认识 env() 时仍有 bottom 兜底');
  ok(/\.rd-end-pin\{[\s\S]*?env\(safe-area-inset-bottom/.test(htmlSrc),
    '全面屏手机给底部安全区让位');
  ok(/\.rd-end-pin\{[\s\S]*?left:0;right:0/.test(htmlSrc)
     && /\.rd-end-pin\{[\s\S]*?margin:0 auto!important/.test(htmlSrc),
    'left/right + margin auto 居中，不靠 transform（按下动画不跑偏）');
  const pinMain = htmlSrc.slice(htmlSrc.lastIndexOf('.rd-end-pin{'),
    htmlSrc.indexOf('}', htmlSrc.lastIndexOf('.rd-end-pin{')));
  ok(!/transform\s*:/.test(pinMain),
    '吸底规则里没有 transform，避免与 :active scale 冲突（只看这一条规则）');
  ok(/\.rd-end-pin\{[\s\S]*?z-index:1500/.test(htmlSrc)
     && /\.rd-end-pin\{[\s\S]*?width:88vw;max-width:380px/.test(htmlSrc),
    '按钮够大、层级够高，长句子也盖不住');
  ok(/body\.rd-end-on \.stage-body\{padding-bottom:78px\}/.test(htmlSrc),
    '吸底按钮不压住舞台最后一行');
  ok(/body\.rd-end-on \.rd-sentence\.rd-rec\{max-height:38vh;overflow-y:auto/.test(htmlSrc),
    '长句在限高区里自己滚，不再无限撑高把按钮顶出屏幕');
}

section('2. 所有录音出口都挂上 / 摘掉吸底');
{
  ok(/_pinReadEndBtn\(btn, on\) \{/.test(appSrc), 'helper 存在');
  ok(/_unpinAllReadBtns\(\) \{/.test(appSrc), '兜底清理函数存在');
  const spStart = appSrc.indexOf('  _spReadUI(mi, qi, dayIdx, status');
  const sp = appSrc.slice(spStart, spStart + 700);
  ok(/_pinReadEndBtn\(btn, status === 'recording'\)/.test(sp),
    '_spReadUI（口语整句跟读）按状态开关');
  const hd = appSrc.slice(appSrc.indexOf('  _setHoldReadUI(mi, qi, status'),
    appSrc.indexOf('  _setHoldReadUI(mi, qi, status') + 600);
  ok(/_pinReadEndBtn\(btn, status === 'recording'\)/.test(hd),
    '_setHoldReadUI（阅读理解/选择/填空跟读）按状态开关');
  const ex = appSrc.slice(appSrc.indexOf('  _exitRecordingMode(mi) {'),
    appSrc.indexOf('  _exitRecordingMode(mi) {') + 300);
  ok(/_unpinAllReadBtns\(\)/.test(ex), '统一退出录音模式时兜底清理');
  ok(/_wordRepairRec\(\)[\s\S]{0,500}_pinReadEndBtn\(btn, true\)/.test(appSrc),
    '错词重读开录也吸底');
  ok(/_wordRepairStop\(\)[\s\S]{0,400}_unpinAllReadBtns\(\)/.test(appSrc),
    '错词重读结束撤掉吸底');
  const labels = (appSrc.match(/🔴 录音中 · 读完点我结束/g) || []).length;
  ok(labels === 3, '3 处录音中文案都点明「结束」', labels);
  ok(appSrc.indexOf('读完了点我') < 0, '旧文案「读完了点我」已全部替换');
}

section('3. 真跑：开录 / 结束 / 兜底三条路径');
{
  const start = appSrc.indexOf('  _pinReadEndBtn(btn, on) {');
  const end = appSrc.indexOf('  _exitRecordingMode(mi) {');
  const helperSrc = appSrc.slice(start, end);
  function cls() {
    const s = {};
    return { add(c) { s[c] = 1; }, remove(c) { delete s[c]; },
      has(c) { return !!s[c]; } };
  }
  const btn = { classList: cls() };
  const pins = [btn];
  const doc = {
    body: { classList: cls() },
    querySelectorAll(sel) {
      if (sel !== '.rd-end-pin') return [];
      return pins.filter((e) => e.classList.has('rd-end-pin'));
    }
  };
  let obj = null;
  try {
    // v216：_pinReadEndBtn / _unpinAllReadBtns 现在会顺手收统一录音浮条。
    // 这段只截了 helper 本身，补一个桩让三条老路径照样能真跑。
    const stub = '\n  _recDockHide: function () {},\n';
    obj = vm.runInNewContext('({' + helperSrc + stub + '})', { document: doc });
  } catch (e) {
    ok(false, 'helper 可被解析执行', e.message);
  }
  if (obj) {
    obj._pinReadEndBtn(btn, true);
    ok(btn.classList.has('rd-end-pin') && doc.body.classList.has('rd-end-on'),
      '开录：按钮加吸底类 + body 让位');
    obj._pinReadEndBtn(btn, false);
    ok(!btn.classList.has('rd-end-pin') && !doc.body.classList.has('rd-end-on'),
      '结束（出分/误触/看门狗）：两处都复位');
    obj._pinReadEndBtn(btn, true);
    obj._unpinAllReadBtns();
    ok(!btn.classList.has('rd-end-pin') && !doc.body.classList.has('rd-end-on'),
      '兜底：残留的吸底按钮被清干净');
    obj._pinReadEndBtn(null, true);
    ok(!doc.body.classList.has('rd-end-on'), 'btn 为空时不误开 body 标记');
  }
}

section('4. 字号分层：大字继续放大，小字回落');
{
  ok(/--fs:1\.26;/.test(htmlSrc) && /--fs-min:15px;/.test(htmlSrc),
    '大字令牌 --fs / --fs-min 保持 v209 的放大档');
  ok(/--fs-sm:1\.06;/.test(htmlSrc) && /--fs-sm-min:11px;/.test(htmlSrc),
    '新增小字令牌 --fs-sm / --fs-sm-min');
  const smallRe = /font-size:\s*max\(calc\((\d+(?:\.\d+)?)px\s*\*\s*var\(--fs-sm\)\),var\(--fs-sm-min\)\)/g;
  const bigRe = /font-size:\s*max\(calc\((\d+(?:\.\d+)?)px\s*\*\s*var\(--fs\)\),var\(--fs-min\)\)/g;
  function nums(src, re) {
    const out = []; let m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) out.push(parseFloat(m[1]));
    return out;
  }
  const hSmall = nums(htmlSrc, smallRe), hBig = nums(htmlSrc, bigRe);
  const aSmall = nums(appSrc, smallRe), aBig = nums(appSrc, bigRe);
  ok(hSmall.length + aSmall.length >= 250,
    '辅助小字确实改用小倍率（index + app）', hSmall.length + aSmall.length);
  ok(hBig.length + aBig.length >= 150,
    '句子/标题/分数仍在用大倍率', hBig.length + aBig.length);
  ok(hSmall.every((n) => n <= 13) && aSmall.every((n) => n <= 13),
    '走小倍率的都是 <=13px 的说明/标签');
  ok(hBig.every((n) => n >= 14) && aBig.every((n) => n >= 14),
    '走大倍率的都是 >=14px 的正文/标题');
  ok(!/font-size:\s*max\(calc\((?:9|10|11|12|13)(?:\.\d+)?px\s*\*\s*var\(--fs\)\),var\(--fs-min\)\)/
    .test(htmlSrc + appSrc), '没有 <=13px 的小字残留用大倍率');
  // 老师端和学生端共用同一份 index.html/app.js，令牌落在 :root 上全局生效
  ok(/:root\{[\s\S]*?--fs-sm:1\.06/.test(htmlSrc), '令牌定义在 :root，老师/学生端同时生效');
}

section('5. 版本钉子四处一致（随发版滚动，不再写死 214）');
{
  // v216 起改成「一致性」而不是「等于某个数字」：以后每次升版本，这套
  // 校验都该继续通过，而不是把上一次的版本号当圣旨。
  const mv = htmlSrc.match(/name="app-version" content="(\d+)"/);
  const ver = mv ? mv[1] : '';
  ok(!!ver, 'index.html 有 app-version', ver);
  // v220 起 <head> 有 3 条 preload 也带 ?v=，全文计数会从 7 变 10。
  // 这里钉的是「7 个 defer 脚本引用都跟当前版本一致」，只数 <script src>。
  const hits = (htmlSrc.match(new RegExp('<script[^>]+src="[^"]+\\.js\\?v=' + ver + '(?![0-9])', 'g')) || []).length;
  ok(hits === 7, 'index.html 7 处脚本引用 ?v=' + ver, hits);
  // 只看脚本资源：图片/图标也带 ?v= 做缓存 bust（如 ?v=65），那不是版本钉子。
  const stale = (htmlSrc.match(/\.js\?v=\d+/g) || []).filter(function (x) { return x !== '.js?v=' + ver; });
  ok(stale.length === 0, 'index.html 没有旧版本脚本 ?v= 残留', stale.join(','));
  ok(swSrc.indexOf("var CACHE_NAME = 'amy-english-v" + ver + "';") >= 0,
    'sw.js CACHE_NAME = v' + ver);
  ok(swSrc.indexOf('var V = ' + ver + ';') >= 0, 'sw.js V = ' + ver);
}

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
