# WEEK6（2026-11-02 起）自编方案

家长 2026-10-30 拍板：由 Amy 自编第 6 周，不提供材料。

## 为什么要新编（根因，别忘）
- `HOMEWORK_WEEK_IDX` 是真实周号，内容周号被 `Math.min(..., HOMEWORK_WEEKS.length-1)` 夹取。
- 现有 5 周里 **WEEK5 是 WEEK4 的克隆**（tools/apply-v157-week5.js：只换了阅读/写作），
  逐条比对 20 条内容里 15 条与 W4 相同。
- 于是 11-02 那周（真实周号 5，夹到 4）＝ 原样重放本周 WEEK5 → 家长说的"下周又重复"。

## 目标
- 新周 id 前缀 `w6-`，周内 7 天，动作数与 v155 口径一致（每天恰好 30 个真实动作）。
- 与 W1~W5 **零重复**（verify-weeks.js 会跨周查重，重复就红）。
- 题材沿用"中国文化 / 科学技术 / 现代热点"，难度不高于 W5（跟读句仍 ≤14 词）。

## 每天模块结构（照 W5 抄骨架，只换内容）
| 天 | 模块 | 条数 |
|---|---|---|
| 周一/周三/周六 | speaking 5 + vocabulary_game 5 词 + reading 4 + multiple_choice 4 | 13 |
| 周二 | reading 4 + grammar 6 + multiple_choice 8 | 18 |
| 周四 | multiple_choice 5 + tense 6 + tense(拼写/填空) 14 + multiple_choice 5 | 30 |
| 周五 | writing_template(5 空) + ket_pet 5 + grammar 15 | 20 |
| 周日 | vocabulary_game 5 词 + cloze 6 + listening 5 | 11 |

## 内容选题（全部新写，避开 W1~W5 已用）
- 阅读：① 中国高铁 ② 二十四节气 ③ 中国空间站 ④ 移动支付
- 完形：一篇"社区图书馆志愿日"
- 写作：给外国朋友介绍"我家乡的一种food/节日"
- 口语：city library / online class / helping at home / a school trip / favourite app
- 词汇：20 词新词表（需 phonetic / meaning / emoji / syllables / spell / wrongEmoji×3 / wrongMeaning×3）
- 语法：比较级最高级、现在完成时、if 条件句、被动语态、介词搭配
- 听力 + ket_pet：短对话选择题

## 落地步骤
1. `tools/apply-v164-week6.js`：克隆 W5 骨架 → id 改 `w6-` → 按内容表覆盖各模块；
   幂等守卫（已有 WEEK6 就跳过）+ 备份 data.js。
2. `node tools/verify-weeks.js` 跑到全绿（结构 / answer 范围 / 完形占位符数量 /
   作文模板拼回 full_text / 跨周查重 / 文章长度不递增）。
3. 版本号 v164 + sw.js，跑全量 `tools/verify-*.js`，部署，逐字节校验。
4. HOMEWORK_WEEKS 追加 WEEK6（`[WEEK1..WEEK6]`），`HOMEWORK_CONTENT_WEEK_IDX` 自动跟到 5。

## 注意
- 完形填空每篇的 `___` 占位符数量必须与 questions 数量一致，否则 verify-weeks 红。
- 写作 `full_text` 必须能由模板 + 答案忽略大小写拼回。
- 词卡 `wrongMeaning` 用同一天其它词的释义（v107 约定）。
- 新词必须补 `VOCAB_HINTS`（≤30 字、不含 meaning 原文）。
