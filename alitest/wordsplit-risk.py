#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""静态筛查：字母串里哪些相邻字母会被 TTS 当成真词读掉。

背景：示范串是 "Letters: P-A-N-D-A, panda"。阿里云是按"词"理解文本的，
连字符串里只要出现连续字母恰好是英文真词（P-[AND]-A 里的 AND），
它就会把那一段读成那个词 —— N 的字母名 /en/ 直接消失，听起来成了 /n/。
家长反馈的"字母 N 发音不好，读成了 n"就属这一类。

这个脚本不联网：纯词库 + 真词表，把全库词条扫一遍，列出高危词与命中的子串，
作为后面用 ASR 复核的靶子。
"""
import re
import sys
import os
import glob

# 2~4 字母的英文常用词（会干扰字母串连读的那批）
MINI = set("""
am an as at ax be by do go he hi if in is it me my no of on or ox pi so to up us we ye
and are bad bag ban bar bat bed bee beg bet big bin bit box boy bug bus but buy can car cat
cop cow cry cup cut dad day den did die dig dim dip dog dot dry due ear eat egg end eve eye
fan far fat fee few fin fit fix fly for fox fry fun fur gap gas get god got gum gun gut guy
gym had ham has hat her him hip his hit hoe hog hop hot how hub hug hut ice ill ink inn ion
its jab jam jar jaw jet job jog jot joy jug key kid kit lab lad lag lap law lay led leg let
lid lie lip lit log lot low mad man map mat may men met mix mob mop mud mug net new nil nit
nod nor not now nut oak oar oat odd off oil old one opt orb ore our out owe owl own pad pal
pan par pat paw pay pea peg pen pet pie pig pin pit pod pop pot pro pry pub pug pun pup put
rag ram ran rap rat raw ray red rib rid rig rim rip rob rod rot row rub rug rum run rut sad
sap sat saw say sea see set sew she shy sin sip sir sit six ski sky sly sob sod son sow soy
spa spy sty sub sue sum sun tab tag tan tap tar tax tea ten the thy tic tie tin tip toe ton
too top tot tow toy try tub tug two urn use van vat vet via vie vow war was wax way web wed
wet who why wig win wit woe wok won wow yes yet you zip zoo
""".split())

MIN_LEN = 2
MAX_LEN = 4


def find_hits(letters):
    """返回字母串里命中真词的 (起, 止, 子串)。"""
    s = "".join(letters).lower()
    hits = []
    n = len(s)
    for i in range(n):
        for L in range(MIN_LEN, MAX_LEN + 1):
            if i + L > n:
                break
            sub = s[i:i + L]
            if sub in MINI:
                hits.append((i, i + L, sub))
    # 丢掉被更长命中完全包住的短命中（AND 比 AN 更有意义）
    out = []
    for h in hits:
        covered = False
        for g in hits:
            if g is h:
                continue
            if g[0] <= h[0] and g[1] >= h[1] and (g[1] - g[0]) > (h[1] - h[0]):
                covered = True
                break
        if not covered:
            out.append(h)
    return sorted(set(out))


def load_words(path):
    src = open(path, encoding="utf-8", errors="replace").read()
    return sorted(set(re.findall(r'"word"\s*:\s*"([A-Za-z]+)"', src)))


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cands = [os.path.join(root, "public", "data.js")]
    cands += glob.glob(os.path.join(root, "public", "data", "*.js"))
    words = []
    for c in cands:
        if os.path.isfile(c):
            words += load_words(c)
    words = sorted(set(w.lower() for w in words))
    print("词库共 %d 条" % len(words))
    risky = []
    for w in words:
        ls = [c for c in w if c.isalpha()]
        h = find_hits(ls)
        if h:
            risky.append((w, h))
    print("有「字母被词汇化」风险的词: %d / %d  (%.0f%%)\n"
          % (len(risky), len(words), 100.0 * len(risky) / max(1, len(words))))
    for w, h in risky:
        marks = []
        for i, c in enumerate(w):
            tag = " "
            for a, b, sub in h:
                if a <= i < b:
                    tag = "."
            marks.append(c.upper() if tag == "." else c)
        spans = ", ".join("'%s'(#%d-%d)" % (sub.upper(), a + 1, b) for a, b, sub in h)
        print("  %-14s → %-16s  %s" % (w, "".join(marks), spans))


if __name__ == "__main__":
    main()
