# -*- coding: utf-8 -*-
# v162：把周四（明天）的题目整日替换为围绕三张练习图（名词复数 / a·an / How much·many）的 30 道题。
# 家长 2026-10-28：总题数 30，形式多变（组词选择题、打字题），考察点不变。
# 约束：全项目「每天真实动作恰好 30」（v155 家长约定）→ 不带课文/译文，30 题 = 30 动作。
import io, json

P = 'public/data.js'
s = io.open(P, encoding='utf-8').read()

start = s.find('const WEEK5 = ')
assert start >= 0
arr_start = s.find('[', start)
i, depth, in_str, esc = arr_start, 0, None, False
while i < len(s):
    c = s[i]
    if in_str:
        if esc: esc = False
        elif c == '\\': esc = True
        elif c == in_str: in_str = None
    else:
        if c in ('"', "'"): in_str = c
        elif c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0: break
    i += 1
arr_end = i + 1

week = json.loads(s[arr_start:arr_end])
assert len(week) == 7
thu = week[3]
assert thu['day_en'] == 'Thursday', thu['day_en']

def mc(qid, stem, options, answer, expl):
    return {"id": qid, "type": "choice", "question": stem, "options": options,
            "answer": answer, "explanation_cn": expl}

def fill(qid, stem, ans, expl):
    return {"id": qid, "type": "fill", "question": stem,
            "answer": ans, "explanation_cn": expl}

# ── 模块一：a / an（15 个词并成 5 道组词选择题） ──────────────────
articles = [
    mc("w5-thu-an1",
       "选出正确的一组：1. bike  2. egg  3. university",
       ["a / an / a", "an / a / a", "a / a / an", "an / an / a"], 0,
       "bike 辅音开头用 a；egg 元音 /e/ 开头用 an；university 虽以 u 开头，但读音是 /juː/（辅音），用 a university。"),
    mc("w5-thu-an2",
       "选出正确的一组：1. umbrella  2. big apple  3. English teacher",
       ["a / a / an", "an / a / an", "an / an / a", "a / an / an"], 1,
       "umbrella 元音 /ʌ/ 开头用 an；big 辅音 /b/ 用 a；English 元音 /ɪ/ 用 an。"),
    mc("w5-thu-an3",
       "选出正确的一组：1. old book  2. European country  3. ID card",
       ["a / an / a", "an / an / a", "an / a / an", "a / a / an"], 2,
       "old 元音 /əʊ/ 用 an；European 读音是 /jʊə/（辅音 j 开头）用 a；ID 读 /aɪ/ 元音用 an。"),
    mc("w5-thu-an4",
       "选出正确的一组：1. island  2. elephant  3. insect",
       ["an / an / an", "a / an / an", "an / a / an", "a / a / an"], 0,
       "island、elephant、insect 都是元音音素开头，全部用 an。"),
    mc("w5-thu-an5",
       "选出正确的一组：1. ugly dog  2. unusual experience  3. honest boy",
       ["a / an / an", "an / an / an", "a / a / an", "an / a / a"], 1,
       "ugly、unusual 元音开头用 an；honest 的 h 不发音，读音以元音 /ɒ/ 开头，所以是 an honest boy。"),
]

# ── 模块二：How much / How many（图片三全部 6 小题，打字题） ──────
muchmany = [
    fill("w5-thu-mm1", "How ___ sweets would you like? — A lot! [填 much 或 many]", "many",
         "sweets（糖果）是可数名词复数，用 how many。a lot 说明数量很多。"),
    fill("w5-thu-mm2", "How ___ bananas do you eat in a week? — Only a few. [填 much 或 many]", "many",
         "bananas 可数，用 how many；a few 修饰可数名词：only a few bananas。"),
    fill("w5-thu-mm3", "How ___ pasta would you like? — Just a little, please. [填 much 或 many]", "much",
         "pasta（意大利面）不可数，用 how much；a little 修饰不可数名词。"),
    fill("w5-thu-mm4", "How ___ ice cream would you like? — A lot, please! [填 much 或 many]", "much",
         "ice cream 此处指冰淇淋这种食物，不可数，用 how much。"),
    fill("w5-thu-mm5", "How ___ bread have we got? — Only a little. [填 much 或 many]", "much",
         "bread（面包）不可数，用 how much；Only a little 提醒我们要再买一些。"),
    fill("w5-thu-mm6", "How ___ oranges are you going to buy? — None. [填 much 或 many]", "many",
         "oranges 可数复数，用 how many。None 表示一个都不买——没带钱！"),
]

# ── 模块三：打字题（14 个复数词，孩子用键盘敲出来） ───────────────
plural_fills = [
    ("foot", "feet", "不规则变化：foot → feet（脚）。同类：tooth → teeth。"),
    ("tooth", "teeth", "不规则变化：tooth → teeth（牙齿）。oo 变 ee。"),
    ("child", "children", "不规则变化：child → children（孩子）。"),
    ("mouse", "mice", "不规则变化：mouse → mice（老鼠）。"),
    ("woman", "women", "不规则变化：woman → women（女人），a 变 e。"),
    ("knife", "knives", "f/fe 结尾变 v 加 es：knife → knives。同类：leaf, shelf。"),
    ("leaf", "leaves", "f 结尾变 v 加 es：leaf → leaves（树叶）。"),
    ("shelf", "shelves", "f 结尾变 v 加 es：shelf → shelves（架子）。"),
    ("country", "countries", "辅音字母 + y 结尾，变 y 为 i 加 es：country → countries。"),
    ("family", "families", "辅音字母 + y 结尾，变 y 为 i 加 es：family → families。"),
    ("dish", "dishes", "s, x, ch, sh 结尾加 es：dish → dishes。"),
    ("box", "boxes", "s, x, ch, sh 结尾加 es：box → boxes。"),
    ("watch", "watches", "ch 结尾加 es：watch → watches。"),
    ("sandwich", "sandwiches", "ch 结尾加 es：sandwich → sandwiches（三明治）。"),
]
plural_fill_qs = [fill("w5-thu-pf%d" % (i + 1), "写出复数：" + w + " [用键盘打出来，全部小写]", a, e)
                  for i, (w, a, e) in enumerate(plural_fills)]

# ── 模块四：组词选择题（剩下 10 个复数词并成 5 道） ───────────────
plurals_mc = [
    mc("w5-thu-pm1", "选出正确的一组复数：tomato 和 photo",
       ["tomatoes / photos", "tomatos / photoes", "tomatoes / photoes", "tomatos / photos"], 0,
       "-o 结尾有的加 es（tomatoes, heroes），photo 是 photograph 的缩略词只加 s：photos。"),
    mc("w5-thu-pm2", "选出正确的一组复数：boy 和 toy",
       ["boies / toys", "boys / toies", "boys / toys", "boies / toies"], 2,
       "元音字母 + y 结尾直接加 s：boy → boys，toy → toys（对照 country 变 ies）。"),
    mc("w5-thu-pm3", "选出正确的一组复数：sheep 和 fish",
       ["sheeps / fishs", "sheep / fish", "sheep / fishs", "sheeps / fish"], 1,
       "sheep 和 fish 单复数同形：one sheep, two sheep；one fish, two fish。"),
    mc("w5-thu-pm4", "选出正确的一组复数：class 和 Japanese",
       ["classes / Japanese", "class / Japaneses", "classes / Japaneses", "classs / Japanese"], 0,
       "class 以 s 结尾加 es：classes；Japanese（日本人）单复数同形，不加 s。"),
    mc("w5-thu-pm5", "选出正确的一组复数：hero 和 fly",
       ["heros / flys", "heroes / flys", "heros / flies", "heroes / flies"], 3,
       "hero 加 es：heroes（hero, tomato 这类加 es）；fly 辅音 + y 变 ies：flies。"),
]

thu['modules'] = [
    {"id": "w5-thu-articles", "name_cn": "单项选择：a / an", "type": "multiple_choice",
     "duration": 8, "questions": articles},
    {"id": "w5-thu-muchmany", "name_cn": "打字题：How much / How many", "type": "tense",
     "duration": 10, "questions": muchmany},
    {"id": "w5-thu-plural-fill", "name_cn": "打字题：写出名词复数", "type": "tense",
     "duration": 18, "questions": plural_fill_qs},
    {"id": "w5-thu-plural-choice", "name_cn": "单项选择：名词复数", "type": "multiple_choice",
     "duration": 7, "questions": plurals_mc},
]
thu['total_duration'] = sum(m['duration'] for m in thu['modules'])
thu['theme_cn'] = "名词复数 + 冠词 a/an + How much/many"

out = s[:arr_start] + json.dumps(week, ensure_ascii=False, separators=(',', ':')) + s[arr_end:]
io.open(P, 'w', encoding='utf-8').write(out)

n = sum(len(m.get('questions', [])) for m in thu['modules'])
acts = sum(len(m.get('questions', [])) + (2 * len([x for x in __import__('re').split(r'[.!?]+["\']?(?=\s|$)', m['passage']) if x.strip()]) if m.get('passage') else 0) for m in thu['modules'])
print('modules:', [(m['id'], len(m.get('questions', []))) for m in thu['modules']])
print('total questions:', n, '| total real actions:', acts)
assert n == 30 and acts == 30
for m in thu['modules']:
    for q in m.get('questions', []):
        if q.get('type') == 'fill':
            assert q['answer'] == q['answer'].lower(), q
print('OK')
