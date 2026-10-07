#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""扫描一批 "Letters: X, nada" 示范音，报告各语音段时长/有声性。

用法: python letterscan.py <dir-with-wav-files>
每个文件名的首字母视作被测字母。
"""
import sys
import os
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wavseg import describe   # noqa: E402


def main():
    d = sys.argv[1] if len(sys.argv) > 1 else "."
    files = sorted(glob.glob(os.path.join(d, "*")))
    files = [f for f in files if os.path.isfile(f)]
    print("%-4s %-9s %-4s %-42s %s" % ("L", "total", "#seg", "段时长(ms)", "各段 corr(有声度)"))
    rows = []
    for p in files:
        L = os.path.basename(p)[0]
        try:
            segs, total = describe(p, verbose=False)
        except Exception as e:
            print("%-4s ERR %s" % (L, e))
            continue
        durs = " ".join("%d" % round(g["dur"] * 1000) for g in segs)
        corrs = " ".join("%.2f" % g["corr"] for g in segs)
        print("%-4s %-9.2f %-4d %-42s %s" % (L, total, len(segs), durs, corrs))
        rows.append((L, segs))
    return rows


if __name__ == "__main__":
    main()
