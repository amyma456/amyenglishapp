#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""字母串示范写法实测：合成示范音 -> 回灌识别 -> 逐字母命中率。

用途：高频词汇「逐字母拼读」那一屏，示范串到底怎么连才既顺滑又不读错。
线上 /api/tts 支持 ?engine=ali 强制阿里云；/api/transcribe 回灌识别。
"""
import urllib.request
import urllib.parse
import json
import os
import re
import sys

BASE = "https://amyeng.top"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def tts(text, engine="ali"):
    q = urllib.parse.urlencode({"text": text, "engine": engine})
    req = urllib.request.Request(BASE + "/api/tts?" + q, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read(), dict(r.headers)


def asr(mp3, model="turbo"):
    req = urllib.request.Request(
        BASE + "/api/transcribe?model=" + model,
        data=mp3,
        headers={"Content-Type": "audio/mpeg", "User-Agent": UA},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read().decode("utf-8", "replace")
    try:
        j = json.loads(body)
        return j.get("text") or j.get("result") or body
    except Exception:
        return body


def letters_of(word):
    return [c.upper() for c in word if c.isalpha()]


def hit_rate(word, heard):
    """返回 (命中字母数, 总字母数, 漏掉的字母)。识别文本里单字母 token 且出现过。"""
    toks = re.findall(r"[A-Za-z]+", heard)
    singles = [t.upper() for t in toks if len(t) == 1]
    blob = heard.upper().replace(" ", "")
    hits, misses = 0, []
    consumed = list(singles)
    for L in letters_of(word):
        if L in consumed:
            consumed.remove(L)
            hits += 1
        elif len(L) == 1 and L in blob:
            hits += 1
        else:
            misses.append(L)
    return hits, len(letters_of(word)), misses


def fmt_cur(w, us):
    return ", ".join(us) + " - " + w


def fmt_dash(w, us):
    return "-".join(us) + " - " + w


def fmt_dash_sp(w, us):
    return " - ".join(us) + " - " + w


def fmt_space(w, us):
    return " ".join(us) + " - " + w


def fmt_commasp(w, us):
    return ",".join(us) + " - " + w


def fmt_dots(w, us):
    return ". ".join(us) + ". - " + w


def fmt_slash(w, us):
    return "/".join(us) + " - " + w


def fmt_spell(w, us):
    return "Spell: " + ", ".join(us) + ". " + w


def fmt_quote(w, us):
    return "'" + ", ".join(us) + "' - " + w


def fmt_zwsp(w, us):
    return "\u200b".join(us) + " - " + w


def fmt_letters_dash(w, us):
    return "Letters: " + "-".join(us) + " - " + w


def fmt_commacomma(w, us):
    return ", ".join(list(us) + [w])


def fmt_semi(w, us):
    return "; ".join(us) + ". " + w


def fmt_spell_short(w, us):
    return "Spell. " + ", ".join(us) + ". " + w


def fmt_dashcc(w, us):
    return "-".join(us) + ", " + w


def fmt_spelldashcc(w, us):
    return "Spell: " + "-".join(us) + ", " + w


def fmt_letterdashcc(w, us):
    return "Letters: " + "-".join(us) + ", " + w


def fmt_dashspace(w, us):
    """连字符连接但每组之间留空格：G-U I-T A-R"""
    n = 3
    groups = ["-".join(us[i:i + n]) for i in range(0, len(us), n)]
    return " ".join(groups) + ", " + w


def fmt_prefix(w, us):
    return "Letters: " + ", ".join(us) + ". " + w


FORMATS = [
    ("cur 逗号+空格", fmt_cur),
    ("slash 斜杠", fmt_slash),
    ("prefix Letters:", fmt_prefix),
    ("spell Spell:", fmt_spell),
    ("quote 引号", fmt_quote),
    ("zwsp 零宽", fmt_zwsp),
    ("lettersdash", fmt_letters_dash),
    ("dashcc 连字符+逗号", fmt_dashcc),
    ("letterdashcc", fmt_letterdashcc),
    ("spelldashcc", fmt_spelldashcc),
    ("dashspace 分组", fmt_dashspace),
    ("commacomma 全逗号", fmt_commacomma),
    ("semi 分号", fmt_semi),
    ("spellshort", fmt_spell_short),
    ("dash 连字符", fmt_dash),
    ("dash空 连字符带空格", fmt_dash_sp),
    ("space 空格", fmt_space),
    ("commasp 逗号无空格", fmt_commasp),
    ("dots 句点", fmt_dots),
]

_only = {x.strip() for x in os.environ.get("FMT", "").split(",") if x.strip()}
if _only:
    FORMATS = [f for f in FORMATS if f[0].split()[0] in _only]


def main():
    words = sys.argv[1:] or [
        "breakfast", "delicious", "vegetable", "umbrella", "exercise",
        "panda", "bamboo", "forest", "clever", "friendly",
    ]
    names = [n for n, _ in FORMATS]
    tally = {n: [0, 0] for n in names}
    for w in words:
        us = letters_of(w)
        print("=" * 76)
        print("单词:", w, " 字母:", " ".join(us))
        for name, fn in FORMATS:
            text = fn(w, us)
            try:
                mp3, hdr = tts(text)
                heard = asr(mp3)
            except Exception as e:
                print("  [%s] 失败: %s" % (name, e))
                continue
            h, tot, miss = hit_rate(w, heard)
            tally[name][0] += h
            tally[name][1] += tot
            src = hdr.get("X-TTS-Source", hdr.get("x-tts-source", "?"))
            flag = "OK " if h == tot else "!! "
            print("  %s[%s] %d/%d 缺%s  src=%s  %dB" % (flag, name, h, tot, miss, src, len(mp3)))
            print("      说: %s" % text)
            print("      听: %s" % heard.strip()[:110])
    print("=" * 76)
    print("汇总（逐字母命中率）:")
    for n in names:
        h, t = tally[n]
        pct = (100.0 * h / t) if t else 0
        print("  %-22s %3d/%3d  %.1f%%" % (n, h, t, pct))


if __name__ == "__main__":
    main()
