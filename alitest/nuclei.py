#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""连读字母串的"元音核"分析 —— 判断某个字母有没有被连读吃掉。

字母名几乎都带元音（N = /en/、M = /em/、B = /biː/）。
如果 TTS 把 N 读成了纯鼻音 /n/（和后面的字母黏成一个音节），
这一段的元音核就会少一个 —— 这是可测量的。
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wavseg import read_wav, rms, f0, SR   # noqa: E402


def nuclei(s, hop=120, win=360, corr_thr=0.45, rms_ratio=0.06):
    """逐 5ms 帧算有声度，返回元音核区间列表。"""
    n = len(s)
    vals = []
    i = 0
    while i + win < n:
        e = rms(s, i, i + win)
        f, c = f0(s, i, i + win)
        vals.append((i, e, c, f))
        i += hop
    if not vals:
        return []
    peak = max(v[1] for v in vals)
    thr = peak * rms_ratio
    groups = []
    cur = None
    for pos, e, c, f in vals:
        good = (e >= thr) and (c >= corr_thr)
        if good:
            if cur is None:
                cur = [pos, pos, f]
            else:
                cur[1] = pos
                cur[2] = 0.7 * cur[2] + 0.3 * f
        else:
            if cur is not None:
                if (cur[1] - cur[0]) >= SR * 0.04:      # 至少 40ms
                    groups.append(cur)
                cur = None
    if cur is not None:
        groups.append(cur)
    return [{"t0": a / float(SR), "t1": (b + win) / float(SR),
             "dur": (b + win - a) / float(SR), "f0": f} for a, b, f in groups]


def main():
    for p in sys.argv[1:]:
        s = read_wav(p)
        gs = nuclei(s)
        print("%s  总长 %.2fs  元音核 %d 个" % (os.path.basename(p), len(s) / float(SR), len(gs)))
        for i, g in enumerate(gs):
            print("   #%-2d %6.3f~%-6.3f %5.0fms  f0=%5.1f" %
                  (i, g["t0"], g["t1"], g["dur"] * 1000, g["f0"]))


if __name__ == "__main__":
    main()
