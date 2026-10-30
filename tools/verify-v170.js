#!/usr/bin/env node
// ===========================================================================
// verify-v170 —— 参考译文"说完一遍就出来"（家长 2026-10-30 上午）
//
// 家长原话：「题目中所有的中文翻译，无论对错，孩子们翻译完一遍之后都出来
// 正确的译文。」
//
// 这条规矩在结果区里始终成立：三个翻译场景（阅读逐句 / 完形逐句 / 整篇）
// 说完一遍（含"识别没回话但确实出了声"）都要给出参考译文。
//
// ⚠️ v171 起，"参考译文常驻在说话按钮上方"被家长否掉了（会照着念），
//    改成 <60 分才摆出来让他背、开录即隐藏 —— 那部分由 verify-v171 钉。
// ===========================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, msg, detail) {
  if (cond) { pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg + (detail ? ' —— ' + detail : '')); }
}
function section(t) { console.log('\n=== ' + t + ' ==='); }

const appSrc = fs.readFileSync(path.join(ROOT, 'public', 'app.js'), 'utf8');

section('1. 结果区：无论对错都亮参考译文');
{
  const trSeg = appSrc.slice(appSrc.indexOf('_translateSentence(ev, mi, si)'),
                             appSrc.indexOf('_translateSentence(ev, mi, si)') + 2600);
  ok(/参考答案|参考译文（先背一背）/.test(trSeg), '阅读逐句：结果区有参考译文块');
  const refIdx = trSeg.indexOf("'<div class=\"tr-block\"><div class=\"tr-label\">'");
  const heardBlock = trSeg.indexOf('if (heard) {');
  ok(refIdx > heardBlock, '阅读逐句：参考译文块在 if (heard) 之外（没识别到话也亮）');

  const czSeg = appSrc.slice(appSrc.indexOf('_translateClozeSentence(ev, mi, si)'),
                             appSrc.indexOf('_translateClozeSentence(ev, mi, si)') + 3400);
  ok(!/band !== 'pass' && refCn/.test(czSeg), '完形逐句：「过了就不亮」的旧条件已删除');
  ok(/if \(refCn\) \{/.test(czSeg), '完形逐句：有参考就亮（不分档）');

  const psSeg = appSrc.slice(appSrc.indexOf('async toggleTranslate(mi)'),
                             appSrc.indexOf('async toggleTranslate(mi)') + 5600);
  ok(psSeg.indexOf('参考翻译</div><div class="tr-text ref">') >= 0 ||
     /参考翻译<\/div>'[\s\S]{0,80}tr-text ref/.test(psSeg),
     '整篇翻译：结果区给「参考翻译」');
  const psRef = psSeg.indexOf('参考翻译');
  const psHeard = psSeg.indexOf('if (heard) {');
  ok(psRef > psHeard, '整篇翻译：参考翻译在 if (heard) 之外（出了声就亮）');
}

section('2. 三个场景都能取到标准译文（不是空手亮个标签）');
{
  ok(/_pairSentences\(m\)/.test(appSrc) && /pair\.cn/.test(appSrc),
     '阅读逐句：译文取自 passage_cn 的逐句配对（pair.cn）');
  ok(/_clozeSentenceRefCn\(/.test(appSrc), '完形逐句：译文走 _clozeSentenceRefCn（CLOZE_SENTENCE_CN 优先）');
  ok(/m\.passage_cn/.test(appSrc), '整篇翻译：译文取 passage_cn');
}

section('3. 旧底线不回退');
{
  ok(/gate-locked[\s\S]{0,300}点一下说中文|gate-locked[\s\S]{0,300}我背好了/.test(appSrc),
     '逐句翻译按钮仍挂门禁（先听英文）');
  ok(/renderTranslateStep[\s\S]{0,900}sent-words/.test(appSrc), '翻译屏的词仍可点');
  ok(/没参考 = 只要说了就算过|canScore/.test(appSrc), '没有参考译文时不把孩子卡死（v127 底线）');
}

console.log('\n==============================');
console.log('verify-v170: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
