# 周包自动出题机制（weekpack）

家长 2026-10-29 要求：**不用每周催「继续」，每周围度必须是新题**。
本目录就是这套机制的落点。每周只要往 `tools/weekpacks/wN/` 放 7 天内容，
一条命令合入题库，剩下的校验/发版照旧。

## 一条命令

```bash
node tools/weekpack-apply.js w7 --dry   # 只校验，不写
node tools/weekpack-apply.js w7         # 校验通过才写入 public/data.js
```

脚本会自动：
1. 按 W1~W5 的骨架生成模块（id / 中文名 / 时长 / 题型），
2. 生成词卡 8 个阶段（看图选词 ×2、选中文 ×2、跟读字母、拼音节、补全拼写），
   干扰项取自同一天其它 4 个词的 emoji / 释义，并做确定性洗牌；
3. 生成写作 `blanks` 与 `full_text`（由模板 + 关键词拼回，保证能对上）；
4. 把完形的 `sentences_cn` 写进 `CLOZE_SENTENCE_CN`（逐句译文表，缺了 cloze 评分会是 0 分）；
5. 幂等合入 `public/data.js`：替换同名 `const WEEKn`，并更新 `HOMEWORK_WEEKS`。

## 目录结构

```
tools/weekpacks/w6/
  meta.json     { "id": "w6", "week": 6, "startDate": "2026-11-02" }
  day0.json     周一 … day6.json 周日
```

## 每天必须满足（校验器会拦）

| 项 | 要求 |
|---|---|
| 真实动作 | 每天 **恰好 30**：词 + 题 + 空 + 课文句×2 + 作文句 |
| 阅读 | 4 篇/周，每篇 **6 句**、4 题、必须有 `passage_cn` |
| 完形 | 1 篇/周（周日），**7 句**、6 个空 `1___`…`6___`、`sentences_cn` 7 句 |
| 词汇 | 每周 20 词（周一/周三/周六 各 5，周日 5），必须有 phonetic/meaning/emoji/example/hint_cn/syllables |
| 口语 | 每天 5 题，每题 4 选项 + options_cn + answer_cn_hint + pronunciation_tips |
| 写作 | 5 个关键词 = 5 个空，模板 `{{1}}`…`{{5}}` |
| 跨周查重 | 题干（归一化后前 90 字符）和单词都**不许**与任何旧周重复 |
| 题型时长骨架 | 周一/三/六 18 条、周二 18、周四 30（冠词5+比较级6+拼写14+巩固5）、周五 20、周日 16 |

## 已用题材（新周请避开）

- W1~W4：熊猫/竹子、故宫/长城、恐龙/天文、海岛/海豚、茶、汉字、环保、健康生活
- W5：AI 口语（大奖/校服/发明/环保）、故宫、健康生活写作、汉字完形
- W6（2026-11-02）：中国高铁、二十四节气、中国空间站、移动支付、社区图书馆志愿日
- 建议后续：中国茶马古道、沙漠治沙、京杭大运河、5G/北斗、乡村教师、机器人快递、
  垃圾分类、城市绿道、非遗手作（剪纸/皮影）、深海探测、极地科考、城市地铁

## 每周例行（自动化在跑，不用人盯）

1. 算出下周的周索引 `idx`（`HOMEWORK_EPOCH` = 2026-09-28 周一 = 第 1 周）。
2. 若 `HOMEWORK_WEEKS.length > idx`，说明内容已就绪 → 什么都不做。
3. 否则新建 `tools/weekpacks/w{N}/`（N = length+1），编 7 天内容。
4. `node tools/weekpack-apply.js w{N}` → `node tools/verify-weeks.js` → 全量 `tools/verify-*.js`。
5. 版本号 +1（index.html 的 `?v=`、`app-version`、sw.js 的 `CACHE_NAME` / `var V`、verify 里的钉子），
   新增 `tools/verify-v{n}.js` 钉住本周关键约束。
6. `wrangler deploy` → 6 个文件逐字节比对线上 → 非交互推 GitHub。

## 红线

- **sw.js 的 CACHE_NAME 必须跟着版本升**，否则孩子端一直吃旧缓存，新题看不到。
- 题库只追加不删；周号越界会夹取到最后一 周（兜底不崩，但会重放，所以内容必须提前备好）。
- 词卡/字母/拼写格子保持「按住 + 说完自动收」，整句跟读才是「点一下开始、再点一下结束」（v163 起）。
