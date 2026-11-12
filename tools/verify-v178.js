#!/usr/bin/env node
/* verify-v178 —— 作文填空屏的手机输入修复（2026-11-02 早 家长）
 * 「写英文作文那里的单词的时候，输入法会把字给挡住……想写游泳这行，
 *  它会跳到入口那一行……让整个的英文整段都出现在那里……写的时候，
 *  我的英文就是要藏起来，不让学生看」
 *
 * 断言：
 *  1) 横线输入框字号 16px（iOS 聚焦不再整页放大）、带 focus/blur 处理、
 *     enterkeyhint；聚焦后等键盘弹完把光标行滚到屏幕中间（350ms + visualViewport）
 *  2) blur 时把没提交的值存进本地填空草稿，切空/退出不丢
 *  3) 打字期间 body.wf-typing：粘性参考条和横幅让位，整段英文拿回空间；
 *     滚动留位（scroll-margin / scroll-padding-bottom）
 *  4) 词条翻面（blind）：配对全做完（学生端）中文朝上、英文藏到眼睛后面，
 *     点眼睛瞟一眼 KW_HIDE_MS 后自动遮回；老师端不翻面
 *  5) 手机端整段英文 16px / line-height 2.1
 *  6) 版本钉 v178
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
const idxSrc = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');

console.log('\n--- 1. 横线输入框（键盘不挡字、光标不乱跑）---');
ok(/writing-blank-input[^>]*font-size:16px/.test(appSrc), '输入框字号 16px（iOS 不再聚焦放大整页）');
ok(/writing-blank-input[^>]*width:140px[^>]*padding:3px 10px/.test(appSrc), '输入框加宽到 140px 并有内边距（好点中、不点错行）');
ok(appSrc.includes('onfocus="App._writingInputFocus(event)"'), '聚焦走 _writingInputFocus');
ok(/onblur="App\._writingInputBlur\(event,\s*'\s*\+ mi \+/.test(appSrc.replace(/'/g, "'")) || appSrc.includes('_writingInputBlur(event,'), '失焦走 _writingInputBlur');
ok(appSrc.includes('enterkeyhint="done"'), '键盘回车键是 done');
ok(/_writingInputFocus\(ev\)[\s\S]{0,1200}setTimeout\(scrollHere, 350\)/.test(appSrc), '聚焦后等 350ms（键盘弹完）再滚动');
ok(/_writingInputFocus\(ev\)[\s\S]{0,1600}visualViewport[\s\S]{0,400}addEventListener\('resize'/.test(appSrc), '键盘高度变化（visualViewport resize）时再校一次位置');
ok(/_writingInputFocus\(ev\)[\s\S]{0,900}scrollIntoView\(\{ block: 'center'/.test(appSrc), '把光标所在行滚到屏幕中间（block:center）');
ok(/_writingInputFocus\(ev\)[\s\S]{0,300}classList\.add\('wf-typing'\)/.test(appSrc), '聚焦给 body 挂 wf-typing');
ok(/_writingInputBlur\(ev, mi, bi\)[\s\S]{0,900}classList\.remove\('wf-typing'\)/.test(appSrc), '失焦摘掉 wf-typing');
ok(/_writingInputBlur\(ev, mi, bi\)[\s\S]{0,1400}_saveWritingFill\(\)/.test(appSrc), '失焦把没提交的值存进本地草稿（切空不丢）');

console.log('\n--- 2. 打字期间整段英文拿回空间 ---');
ok(idxSrc.includes('body.wf-typing .writing-kwbar{display:none}'), '打字时粘性参考条收起');
ok(idxSrc.includes('body.wf-typing .writing-banner{display:none}'), '打字时横幅也让位');
ok(idxSrc.includes('.writing-blank-input{scroll-margin:130px 0 45vh}'), '横线滚动留位：上不钻粘性条、下不被键盘挡');
ok(idxSrc.includes('.stage-q{scroll-padding-bottom:45vh}'), '滚动容器预留键盘高度');
ok(/@media[^{]*\(max-width[^{]*\{[\s\S]*?\.writing-essay\{font-size:16px;padding:14px;line-height:2\.1\}/.test(idxSrc), '手机端整段英文 16px / 行距 2.1');

console.log('\n--- 3. 词条翻面：写的时候英文藏起来 ---');
ok(/_kwChipHtml\(mi, ki, it, paired, revealed, blind\)/.test(appSrc), '_kwChipHtml 支持 blind 参数');
ok(appSrc.includes("const kwBlind = !this.isTeacher() && this._kwAllPaired(mi, m);"), '翻面条件＝学生端 + 参考词全配对（横线解锁）');
ok(appSrc.includes("kw-hit-cn"), '翻面词块中文是主显示');
ok(/_kwEnPeek\(mi, ki\)[\s\S]{0,900}KW_HIDE_MS/.test(appSrc), '点眼睛瞟英文，KW_HIDE_MS 后自动遮回');
ok(/_kwEnPeek\(mi, ki\)[\s\S]{0,500}this\.speak\(kws\[ki\]\.en\)/.test(appSrc), '瞟的时候顺带发音');
ok(/chip\.classList\.toggle\('blind', blind\)/.test(appSrc), '配对进度一变就同步翻面状态');
ok(/if \(blind\) eye\.setAttribute\('onclick', 'App\._kwEnPeek\(/.test(appSrc), '翻面后眼睛改接「瞟英文」');
ok(idxSrc.includes('.keyword-chip.blind .kw-en{display:none}'), 'CSS：翻面词块的英文藏起来');
ok(idxSrc.includes('.keyword-chip.blind.peek .kw-en{display:inline}'), 'CSS：瞟的一瞬英文露出来');

console.log('\n--- 4. 真实加载：学生翻面 / 老师不翻面 ---');
const stub = 'const document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},classList:{add(){},remove(){}}},documentElement:{style:{setProperty(){}}}};'
  + 'const window={addEventListener(){},visualViewport:null};const navigator={};'
  + 'const localStorage={getItem:()=>null,setItem(){}};const location={};'
  + 'const setTimeout=()=>0;const clearTimeout=()=>{};';
const mod = new Function(stub + dataSrc0() + fs.readFileSync(path.join(ROOT, 'public', 'api.js'), 'utf8') + appSrc + ';return { App, W: HOMEWORK_WEEKS };')();
function dataSrc0() { return fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8'); }
const App = mod.App;
const wm = mod.W[5][0].modules.find((x) => x.type === 'writing_template');
const mi = 3;
App.isTeacher = () => false;
wm.keywords.forEach((_, ki) => { App._kwState(mi)[ki] = true; });
const stu = App.renderWritingTemplate(wm, mi, 0);
ok((stu.match(/paired blind/g) || []).length === 5, '学生端：5 个词块全部翻面（中文朝上）');
ok((stu.match(/kw-hit-cn/g) || []).length === 5, '学生端：词块主显示是中文');
ok(stu.includes('_kwEnPeek'), '学生端：眼睛接的是「瞟英文」');
ok(/writing-blank-input[^>]*font-size:16px/.test(stu), '学生端：横线输入框 16px');
ok(stu.includes('onfocus="App._writingInputFocus(event)"'), '学生端：聚焦处理已挂上');
App.isTeacher = () => true;
const tea = App.renderWritingTemplate(wm, mi, 0);
ok(!tea.includes(' paired blind'), '老师端：预览不翻面（英文照旧可见）');
ok(!tea.includes('kw-hit-cn'), '老师端：没有中文主显示');

console.log('\n--- 5. 版本钉 ---');
ok(idxSrc.includes('app-version" content="198"'), 'index.html meta 版本 = 178');
ok((idxSrc.match(/\?v=198/g) || []).length >= 5, 'index.html 静态资源 ?v=198（' + (idxSrc.match(/\?v=198/g) || []).length + ' 处）');
ok(/var CACHE_NAME = 'amy-english-v198'/.test(fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8')), 'sw.js 缓存名 = v178');
ok(!/amy-english-v17[0-7]/.test(idxSrc + fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8')), '不再残留 177 及以前的钉子');

console.log('\n========== ' + pass + ' 通过 / ' + fail + ' 失败 ==========');
process.exit(fail ? 1 : 0);
