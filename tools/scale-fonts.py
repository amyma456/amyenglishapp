# -*- coding: utf-8 -*-
"""把 index.html / app.js 里所有写死的 font-size:NNpx 换成
   font-size:max(calc(NNpx*var(--fs)),var(--fs-min))
   —— 只要改 :root 里的 --fs / --fs-min 两个数，全站字号一起变大变小。
   跳过 @media print{...} 里的排版（A4 打印稿需要固定字号）。
"""
import io
import re
import sys

PAT = re.compile(r'font-size\s*:\s*(\d+(?:\.\d+)?)px')
DONE = re.compile(r'font-size\s*:\s*max\(calc\(')


def find_brace(s, start):
    """从 start（指向 '{'）开始，返回配对 '}' 的索引"""
    depth = 0
    i = start
    while i < len(s):
        c = s[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def skip_ranges(s, markers=('@media print', '@mediaprint')):
    """返回需要跳过的 [(start,end)] 区间"""
    out = []
    for m in markers:
        idx = 0
        while True:
            p = s.find(m, idx)
            if p < 0:
                break
            b = s.find('{', p)
            if b < 0:
                break
            e = find_brace(s, b)
            if e < 0:
                break
            out.append((p, e + 1))
            idx = e + 1
    return out


def main(path):
    s = io.open(path, encoding='utf-8').read()
    skips = skip_ranges(s)

    def in_skip(pos):
        return any(a <= pos < b for a, b in skips)

    count = [0]

    def rep(m):
        if in_skip(m.start()):
            return m.group(0)
        count[0] += 1
        return 'font-size:max(calc(%spx*var(--fs)),var(--fs-min))' % m.group(1)

    s2 = PAT.sub(rep, s)
    io.open(path, 'w', encoding='utf-8').write(s2)
    print('%s: 替换 %d 处' % (path, count[0]))


if __name__ == '__main__':
    for p in sys.argv[1:]:
        main(p)
