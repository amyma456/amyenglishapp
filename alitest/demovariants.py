#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""示范串「局部词汇化」排查。

怀疑：连字符串里相邻字母拼成真词时，阿里云会把它们当一个词读。
  P-A-N-D-A → 中间 "AND" 是个真词 → 读成 /ænd/，N 的字母名 /en/ 消失。
对照矩阵：同一句里只改字母部分的写法，看哪一种能保住每个字母名。
"""
import sys
import os
import json
import urllib.request
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BASE = "https://amyeng.top"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/var"


def tts(text, engine="ali"):
    q = urllib.parse.urlencode({"text": text, "engine": engine})
    req = urllib.request.Request(BASE + "/api/tts?" + q, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def asr(mp3, prompt=""):
    q = {}
    if prompt:
        q["prompt"] = prompt
    q["model"] = "turbo"
    url = BASE + "/api/transcribe?" + urllib.parse.urlencode(q)
    req = urllib.request.Request(
        url, data=mp3,
        headers={"Content-Type": "audio/mpeg", "User-Agent": UA}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        body = r.read().decode("utf-8", "replace")
    try:
        return json.loads(body).get("text") or body
    except Exception:
        return body


CASES = [
    ("cur", "Letters: P-A-N-D-A, panda"),
    ("comma", "Letters: P, A, N, D, A, panda"),
    ("comma2", "Letters: P, A, N, D, A. panda"),
    ("spellcomma", "Spell: P, A, N, D, A. panda"),
    ("dot", "Letters: P. A. N. D. A., panda"),
    ("en", "Letters: P-A-En-D-A, panda"),
    ("halfspace", "Letters: P-A-N-D-A. panda"),
    ("slash", "Letters: P/A/N/D/A, panda"),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, text in CASES:
        try:
            data = tts(text)
        except Exception as e:
            print("### %-11s ERR %s" % (name, e))
            continue
        p = os.path.join(OUT, name + ".wav")
        open(p, "wb").write(data)
        try:
            heard = asr(data)
        except Exception as e:
            heard = "ASR ERR " + str(e)
        print("### %-11s %-34s bytes=%-7d" % (name, text, len(data)))
        print("      heard: %s" % heard)


if __name__ == "__main__":
    main()
