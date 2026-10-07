#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""示范串写法评测：严格的"逐个字母是否被单独读出"命中率。

相比 letterdemo.py 的老算法，这里**不做 "字母出现在 blob 里就算命中" 的兜底**
—— 那个兜底会把 "and" 里的 N 算成 N 读对了，正是 v94 当时漏掉这类问题的原因。

用法: python demoeval.py <outdir> [词...]
"""
import re
import os
import sys
import json
import urllib.request
import urllib.parse

BASE = "https://amyeng.top"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")


def tts(text):
    q = urllib.parse.urlencode({"text": text, "engine": "ali"})
    req = urllib.request.Request(BASE + "/api/tts?" + q, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def asr(data):
    url = BASE + "/api/transcribe?model=turbo"
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "audio/mpeg", "User-Agent": UA}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        body = r.read().decode("utf-8", "replace")
    try:
        return json.loads(body).get("text") or body
    except Exception:
        return body


def toks(heard):
    return [t.upper() for t in re.findall(r"[A-Za-z]+", heard)]


def letters_of(w):
    return [c.upper() for c in w if c.isalpha()]


def strict_hits(word, heard):
    singles = [t for t in toks(heard) if len(t) == 1]
    consumed = list(singles)
    hits, misses = 0, []
    for L in letters_of(word):
        if L in consumed:
            consumed.remove(L)
            hits += 1
        else:
            misses.append(L)
    return hits, len(letters_of(word)), misses


def word_hit(word, heard):
    ws = [t.lower() for t in toks(heard)]
    return word.lower() in ws


def fmt_cur(w, us):
    return "Letters: " + "-".join(us) + ", " + w


def fmt_comma(w, us):
    return "Letters: " + ", ".join(us) + ", " + w


def fmt_comma_dot(w, us):
    return "Letters: " + ", ".join(us) + ". " + w


FORMATS = [("cur", fmt_cur), ("comma", fmt_comma), ("comma.", fmt_comma_dot)]


def main():
    out = sys.argv[1]
    words = sys.argv[2:] or ["panda", "camera", "island"]
    os.makedirs(out, exist_ok=True)
    tally = {n: [0, 0, 0] for n, _ in FORMATS}      # 字母命中 / 字母总数 / 整词命中
    for w in words:
        us = letters_of(w)
        print("=" * 74)
        print("词: %s  (%s)" % (w, "-".join(us)))
        for name, fn in FORMATS:
            say = fn(w, us)
            try:
                data = tts(say)
                heard = asr(data)
            except Exception as e:
                print("  %-8s ERR %s" % (name, e))
                continue
            open(os.path.join(out, "%s_%s.wav" % (w, name.replace('.', 'd'))), "wb").write(data)
            hits, total, misses = strict_hits(w, heard)
            wh = word_hit(w, heard)
            tally[name][0] += hits
            tally[name][1] += total
            tally[name][2] += 1 if wh else 0
            print("  %-8s 时长%4.2fs  字母 %d/%d  整词%s  漏:%s"
                  % (name, (len(data) - 44) / 48000.0, hits, total,
                     "✓" if wh else "✗", "".join(misses) or "-"))
            print("           heard: %s" % heard)
    print("=" * 74)
    print("汇总（%d 词）:" % len(words))
    for name, _ in FORMATS:
        h, t, wh = tally[name]
        print("  %-8s 字母命中率 %5.1f%%  整词读出 %d/%d"
              % (name, 100.0 * h / max(1, t), wh, len(words)))


if __name__ == "__main__":
    main()
