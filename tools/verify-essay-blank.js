#!/usr/bin/env node
// verify-essay-blank.js —— v193（家长 2026-11-07 深夜加指令）：
//   「下周的新作文……每天都要把这个接入上去，每天都要练习作文……每天都要进行跟读渗透」
// 钉死三条：
//   1) W7 七天的作文跟读每句都带挖空（blank_list 与句子一一对齐、无空缺）；
//   2) 前端有「先填空后跟读」的拦截（_wrBlankCheck / _wrBlankDone / 麦克风拦）；
//   3) 周五背默全文带署名 Tom，与课本四线三格 Sample Answer 一致。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg); }
}

const data = fs.readFileSync(path.join(ROOT, 'public/data.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'public/app.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
const apply = fs.readFileSync(path.join(ROOT, 'tools/weekpack-apply.js'), 'utf8');

console.log('== 1) W7 每天作文跟读全带挖空 ==');
const tag7 = 'const WEEK7 = ';
const i7 = data.indexOf(tag7);
const w7 = i7 >= 0 ? (() => {
  const seg = data.slice(i7 + tag7.length);
  const end = seg.indexOf('];');
  try { return JSON.parse(seg.slice(0, end + 1)); } catch (e) { return null; }
})() : null;
ok(!!w7, 'data.js 里能取到 WEEK7');
const week = w7 || [];
const LINES = [
  /go shopping with you/i, /meet at your home/i, /o'clock OK/i,
  /take a taxi/i, /football boots/i, /See you tomorrow/i,
];
const seen = {};
week.forEach((d, di) => {
  const wd = d.modules.find((m) => m.type === 'writing_drill');
  ok(!!wd, 'day' + di + ' 有作文跟读模块');
  if (!wd) return;
  ok(Array.isArray(wd.blank_list) && wd.blank_list.length === wd.cn_list.length,
    'day' + di + ' blank_list 与句子对齐（' + (wd.blank_list || []).length + '/' + wd.cn_list.length + '）');
  const nonEmpty = (wd.blank_list || []).filter(Boolean).length;
  ok(nonEmpty === wd.cn_list.length, 'day' + di + ' 每句都有挖空词（' + nonEmpty + ' 句）');
  // 六句课文，一周内每句至少读到 2 遍（跟读渗透）
  LINES.forEach((re, li) => {
    if (re.test(wd.full_text)) seen[li] = (seen[li] || 0) + 1;
  });
  (wd.blank_list || []).forEach((b, i) => {
    if (b) ok(new RegExp('\\b' + b + '\\b', 'i').test(wd.full_text),
      'day' + di + ' 挖空词「' + b + '」确实在本周作文句里');
  });
});
ok(Object.keys(seen).length === 6, '六句课文全部进到跟读轮换里（' + Object.keys(seen).length + '/6）');
Object.keys(seen).forEach((k) => ok(seen[k] >= 2, '第 ' + (Number(k) + 1) + ' 句一周读到 ' + seen[k] + ' 遍（≥2 渗透达标）'));

console.log('== 2) 前端：先填空、后跟读 ==');
ok(/_wrBlankCheck\(mi, si\)/.test(app), 'app.js 有 _wrBlankCheck 填空判定');
ok(/_wrBlankDone\(m, mi, si\)/.test(app), 'app.js 有 _wrBlankDone 状态查询');
ok(/_wrBlankDone\(m0, mi, si\)/.test(app), '麦克风入口先拦挖空（_readWritingSentence）');
ok(/wr-blank-in-/.test(app), '挖空输入框已渲染');
ok(/先把空里的词填对/.test(app), '空没填时的引导文案在');
ok(/wr-blank-in\{/.test(html), 'index.html 有挖空输入框样式');
ok(/wrBlankShake/.test(html), '填错抖动动画在');

console.log('== 3) 周五背默全文带署名 Tom ==');
const fri = week[4].modules.find((m) => m.type === 'writing_template');
ok(!!fri, '周五有写作模块');
ok(/See you tomorrow! Tom$/.test(fri.full_text || ''), 'full_text 以 See you tomorrow! Tom 结尾');
ok(/See you tomorrow! Tom$/.test(fri.template || ''), 'template 同步带 Tom');
const rebuilt = (fri.template || '').replace(/\{\{(\d+)\}\}/g, (_, n) => fri.keywords[Number(n) - 1]);
ok(rebuilt.toLowerCase() === String(fri.full_text).toLowerCase(), '模板+答案重建 = full_text（校验器口径）');

console.log('== 4) 版本与工具链 ==');
ok(/app-version" content="199"/.test(html), 'index.html 版本 = 189');
ok(/blank_list = list\.map/.test(apply), 'weekpack-apply 透传 blank_list');
ok(/blank_cn_list = list\.map/.test(apply), 'weekpack-apply 透传 blank_cn_list');

console.log(fail === 0 ? '✅ verify-essay-blank 全部 ' + pass + ' 项通过' : '❌ ' + fail + '/' + (fail + pass) + ' 项失败');
process.exit(fail === 0 ? 0 : 1);
