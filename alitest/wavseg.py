#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 TTS 音频切成语音段并逐段给特征 —— 用来客观判断"这个字母到底读成了什么"。

背景：/api/tts 返回的其实是 24kHz 单声道 16-bit WAV（别看后缀叫 mp3）。
有了 PCM 就能量出段时长、能量、过零率、基频，区分：
  · 字母名 /en/  → 有元音段（有声、能量强、时长 150~300ms）
  · 音值   /n/   → 纯鼻音（能量弱、无稳定基频、时长 60~120ms）
"""
import sys
import wave
import struct
import math

SR = 24000


def read_wav(path):
    """手动解 RIFF —— 阿里云返回的是流式 WAV，RIFF/data 长度字段填的是
    占位大值（0x7FFFFFxx），wave 模块照它去读会当场报错。"""
    buf = open(path, "rb").read()
    if buf[:4] != b"RIFF" or buf[8:12] != b"WAVE":
        # 退一步：真 mp3 的情况下仍然用 wave 试一次
        with wave.open(path, "rb") as w:
            raw = w.readframes(w.getnframes())
            ch, sw = w.getnchannels(), w.getsampwidth()
        if sw != 2:
            raise ValueError("expect 16-bit, got %d" % sw)
        fmt = "<%dh" % (len(raw) // 2)
        s = struct.unpack(fmt, raw)
        if ch > 1:
            s = tuple(s[i] for i in range(0, len(s), ch))
        return s
    i = 12
    ch, rate, bits, data = 1, 24000, 16, None
    n = len(buf)
    while i + 8 <= n:
        cid = buf[i:i + 4]
        csz = struct.unpack("<I", buf[i + 4:i + 8])[0]
        body = buf[i + 8:]
        if cid == b"fmt ":
            ch = struct.unpack("<H", body[2:4])[0]
            rate = struct.unpack("<I", body[4:8])[0]
            bits = struct.unpack("<H", body[14:16])[0]
        elif cid == b"data":
            # 以实际剩余字节为准，不信 chunk 声明值
            data = body[:min(csz, len(body))]
            if csz > len(body) or csz <= 0:
                data = body
        i += 8 + csz
    if data is None:
        raise ValueError("no data chunk")
    if bits != 16:
        raise ValueError("expect 16-bit, got %d" % bits)
    sw = 2
    raw = data[:len(data) - (len(data) % (sw * ch))]
    fmt = "<%dh" % (len(raw) // 2)
    s = struct.unpack(fmt, raw)
    if ch > 1:
        s = tuple(s[i] for i in range(0, len(s), ch))
    return s


def rms(s, a, b):
    if b <= a:
        return 0.0
    acc = 0
    for i in range(a, b):
        v = s[i]
        acc += v * v
    return math.sqrt(acc / float(b - a))


def zcr(s, a, b):
    c = 0
    for i in range(a + 1, b):
        if (s[i - 1] < 0) != (s[i] < 0):
            c += 1
    return c / float(max(1, b - a)) * SR / 2.0   # Hz 近似


def f0(s, a, b):
    """自相关估基频。返回 (f0, 相关系数)。"""
    n = b - a
    if n < 240:
        return 0.0, 0.0
    mean = sum(s[a:b]) / float(n)
    seg = [s[a + i] - mean for i in range(n)]
    best, bestlag = 0.0, 0
    lo, hi = int(SR / 400.0), int(SR / 70.0)      # 70~400Hz
    e0 = sum(v * v for v in seg)
    if e0 <= 0:
        return 0.0, 0.0
    lag = lo
    while lag < min(hi, n - 1):
        acc = 0.0
        for i in range(0, n - lag):
            acc += seg[i] * seg[i + lag]
        r = acc / e0
        if r > best:
            best, bestlag = r, lag
        lag += 2
    if bestlag == 0:
        return 0.0, 0.0
    return SR / float(bestlag), best


def segments(s, hop=240, win=480, floor_ratio=0.03, min_ms=50):
    """按短时能量切语音段。hop=10ms, win=20ms @24k。"""
    n = len(s)
    env = []
    i = 0
    while i + win < n:
        env.append(rms(s, i, i + win))
        i += hop
    if not env:
        return []
    peak = max(env)
    thr = max(peak * floor_ratio, 60.0)
    segs = []
    cur = None
    for k, e in enumerate(env):
        if e >= thr:
            if cur is None:
                cur = [k, k]
            else:
                cur[1] = k
        else:
            if cur is not None:
                if (cur[1] - cur[0]) * hop >= min_ms * SR / 1000.0:
                    segs.append(cur)
                cur = None
    if cur is not None:
        segs.append(cur)
    out = []
    for a, b in segs:
        sa, sb = a * hop, min(n, (b + 1) * hop + win)
        f, corr = f0(s, sa, sb)
        out.append({
            "t0": sa / float(SR), "t1": sb / float(SR),
            "dur": (sb - sa) / float(SR),
            "rms": rms(s, sa, sb), "zcr": zcr(s, sa, sb),
            "f0": f, "corr": corr,
        })
    return out


def describe(path, verbose=True):
    s = read_wav(path)
    segs = segments(s)
    total = len(s) / float(SR)
    if verbose:
        print("%s   总长 %.2fs  段数 %d" % (path, total, len(segs)))
        for i, g in enumerate(segs):
            print("   #%-2d %6.3f~%-6.3f  %5.0fms  rms=%-7.0f zcr=%-6.0f f0=%-6.1f corr=%.2f"
                  % (i, g["t0"], g["t1"], g["dur"] * 1000, g["rms"],
                     g["zcr"], g["f0"], g["corr"]))
    return segs, total


if __name__ == "__main__":
    for p in sys.argv[1:]:
        describe(p)
