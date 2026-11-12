#!/usr/bin/env node
/* verify-v177 —— 每天作文跟读（2026-11-01 晚 家长）
 * 「新的作文，增加朗读要求，机器系统能先带着读，学生能跟读……周一到周日
 *  可以增加到每天都去跟读作文……总体的题量不要变」
 *
 * 断言：
 *  1) W6 周二~周日每天一个 writing_drill（周一的跟读在背诵作文屏里）
 *  2) 每天 30 个真实动作不变；drill 句数 3/3/3/3/3/2，全部来自 Dear Toni 信
 *  3) 每天读的句子合并起来覆盖全信 7 句，每句一周至少读 3 次（含周一全文）
 *  4) 前端：writing_drill 走「朗读全文」那套屏；带读按钮、逐句解锁门禁、
 *     60 分过关、署名（Luca）不占一句
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

// —— 题库 ——
const dataSrc = fs.readFileSync(path.join(ROOT, 'public', 'data.js'), 'utf8');
const ctx = new Function(dataSrc + '; return { WEEKS: HOMEWORK_WEEKS, DATA: HOMEWORK_DATA };')();
const W6 = ctx.WEEKS[5];
ok(Array.isArray(W6) && W6.length === 7, 'W6 是 7 天数组');

// —— 每天动作数（含 writing_drill 口径）——
W6.forEach((d, di) => {
  let units = 0;
  d.modules.forEach((m) => {
    const enS = m.passage ? (String(m.passage).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0;
    units += (m.words ? m.words.length : 0) + (m.questions ? m.questions.length : 0) + (m.blanks ? m.blanks.length : 0) + (m.passage ? 2 * enS : 0) +
      (m.type === 'writing_template' || m.type === 'writing_drill' ? (String(m.full_text || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length : 0);
  });
  ok(units === 30, '周' + '一二三四五六日'[di] + ' 真实动作 = 30（实际 ' + units + '）');
});

// —— drill 模块本身 ——
const drillDays = [1, 2, 3, 4, 5, 6];
const wantCounts = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2 };
const LETTER = [
  "Dear Toni, I'm writing to you because I'm going swimming this Saturday.",
  'Would you like to come with me?',
  'It would be great to do some exercise at the weekend.',
  'The swimming pool is at the stadium downtown, and we can meet at the entrance.',
  'I will go there by bike because the weather will be good on Saturday.',
  'Let me know your idea.',
  'I hope to see you there.',
];
const sentCount = (t) => (String(t || '').replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["']?(?=\s|$)/g) || []).length;
const covered = {};
drillDays.forEach((di) => {
  const ds = W6[di].modules.filter((m) => m.type === 'writing_drill');
  ok(ds.length === 1, '周' + '一二三四五六日'[di] + ' 有且只有一个作文跟读模块');
  const d = ds[0];
  ok(d.full_text && sentCount(d.full_text) === wantCounts[di],
    '周' + '一二三四五六日'[di] + ' 跟读 ' + wantCounts[di] + ' 句（实际 ' + sentCount(d.full_text) + '）');
  ok(Array.isArray(d.cn_list) && d.cn_list.length === wantCounts[di], '周' + '一二三四五六日'[di] + ' 每句带中文对照');
  ok(!!d.title && !!d.focus_cn, '周' + '一二三四五六日'[di] + ' 带标题和今天重点提示');
  const en = String(d.full_text || '');
  LETTER.forEach((s, i) => {
    const frag = s.replace(/[.!?]$/, '');
    if (en.indexOf(frag) >= 0) covered[i] = (covered[i] || 0) + 1;
  });
});
ok(modOf0HasNoDrill(), '周一不加跟读模块（背诵作文屏里已读全文 7 句）');
function modOf0HasNoDrill() { return W6[0].modules.every((m) => m.type !== 'writing_drill'); }
LETTER.forEach((_, i) => {
  ok((covered[i] || 0) + 1 >= 3, '第 ' + (i + 1) + ' 句一周至少读 3 次（跟读 ' + (covered[i] || 0) + ' 次 + 周一全文 1 次）');
});

// —— 前端 ——
const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');
ok(/if \(m\.type === 'writing_drill'\) n \+= this\._writingSentences\(m\)\.length/.test(appSrc),
  '_dayUnits 把作文跟读逐句计入动作数');
ok(/if \(m\.type === 'writing_drill'\) \{[\s\S]{0,200}kind: 'writingread'/.test(appSrc),
  '_buildSteps 给作文跟读排「朗读」这一屏');
ok(/} else if \(m\.type === 'writing_drill'\) \{\s*return this\.renderWritingRead/.test(appSrc),
  '学生端渲染走「朗读全文」同一套屏（先听示范 → 跟读 → 打分）');
ok(/▶ 系统先带读一遍/.test(appSrc), '有「系统先带读一遍」按钮');
ok(/_leadReadDrill\(mi\) \{/.test(appSrc), '_leadReadDrill 已实现（逐句带读）');
ok(/_gateUnlock\(self\._gid\('wrg', mi, idx\)\)/.test(appSrc),
  '带读每读完一句就解锁那句的麦克风（和点 🔊 同一个门）');
ok(/_leadReadStop/.test(appSrc) && /再带读一遍/.test(appSrc), '带读可中途停、可再带读一遍');
const drillPassSrc = /const drillPass = m\.type === 'writing_drill' && !!text\s*\n\s*&& a\.score >= \(m\.pass_score \|\| self\.PASS_SCORE\);/.test(appSrc);
ok(drillPassSrc, '作文跟读 60 分过关（背作文那屏仍逐词读对）');
ok(/return all\.filter\(function \(s\) \{/.test(appSrc) && /署名/.test(appSrc),
  '信末署名（Luca）不算一句、不占动作数');
ok(/if \(m\.cn_list && m\.cn_list\.length\)/.test(appSrc), '跟读完出逐句中文对照');
ok(appSrc.indexOf("writing_drill:'🎙️'") >= 0, '模块图标 🎙️');
ok(/writing_drill: \{ icon: '🎙️', name: '作文跟读' \}/.test(appSrc), '错题本/预览的题型名叫「作文跟读」');
ok(/_writingDrillPreviewHtml/.test(appSrc), '老师预览能看到今天的跟读句和中文');
ok(/'writing_drill', 'speaking'/.test(fs.readFileSync(path.join(ROOT, 'tools', 'weekpack-apply.js'), 'utf8')),
  '周包管线把作文跟读排在每天第一个模块');

// —— 版本钉 ——
const idxHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const swSrc = fs.readFileSync(path.join(ROOT, 'public', 'sw.js'), 'utf8');
ok(/content="198"/.test(idxHtml), 'index.html app-version=177');
ok((idxHtml.match(/\?v=198/g) || []).length >= 6, '静态资源 ?v=198 ≥ 7 处');
ok(/var V = 198;/.test(swSrc) && /amy-english-v198/.test(swSrc), 'sw.js 版本与缓存名 = 177');

console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
