# -*- coding: utf-8 -*-
"""v214 一次性改动（字节级精确替换，命中数不符立即中止）：

  1) 跟读录音中的「结束」按钮吸底 —— app.js 新增 helper、挂到所有
     「点一下开始 / 再点一下结束」的录音 UI，文案点明「结束」。
  2) 字号分层 —— 把 <=13px 的辅助小字公式改走 --fs-sm / --fs-sm-min，
     >=14px 的句子 / 标题 / 分数仍按 --fs 放大。
  3) 版本钉子 213 -> 214（index.html meta + 7 处 ?v=，sw.js CACHE_NAME / V）。

  历史注释里的 vNNN 一律不动；print 排版本来就没套字号公式。
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(rel):
    with open(os.path.join(ROOT, rel), 'rb') as f:
        return f.read()


def save(rel, b):
    with open(os.path.join(ROOT, rel), 'wb') as f:
        f.write(b)


def R(b, old, new, cnt=None, label=''):
    nl = '\r\n' if b'\r\n' in b else '\n'
    o = old.replace('\n', nl).encode('utf-8')
    n = new.replace('\n', nl).encode('utf-8')
    c = b.count(o)
    if c == 0 or (cnt is not None and c != cnt):
        raise SystemExit('MISS/COUNT %s: got %d, want %s | %r' % (label, c, cnt, old[:80]))
    print('  %-46s %d hit' % (label, c))
    return b.replace(o, n)


SMALL = re.compile(
    rb'font-size:(\s*)max\(calc\((\d+(?:\.\d+)?)px\s*\*\s*var\(--fs\)\),\s*var\(--fs-min\)\)'
)


def layer(b, rel):
    hit = [0]

    def sub(m):
        if float(m.group(2)) <= 13:
            hit[0] += 1
            return (b'font-size:' + m.group(1) + b'max(calc(' + m.group(2)
                    + b'px*var(--fs-sm)),var(--fs-sm-min))')
        return m.group(0)

    out = SMALL.sub(sub, b)
    if hit[0] == 0:
        raise SystemExit('MISS: no small-font formula found in ' + rel)
    print('  %-46s %d small-font formulas relayered' % (rel, hit[0]))
    return out


# ---------------------------------------------------------------- index.html
print('[public/index.html]')
h = load('public/index.html')
h = R(h,
      '  --fs:1.26;\n  --fs-min:15px;\n}',
      '''  --fs:1.26;
  --fs-min:15px;
  /* v214 字号分层：家长 2026-11-19「现在老师和学生的字体都变大了，
     该大的大、该小的小」。v209 把 9~13px 的说明 / 标签 / 进度一刀切托到
     15px 以上，层级被抹平，长句子还被撑出屏幕。现在只让 >=14px 的句子 /
     标题 / 分数继续按 --fs 放大（远距离可读），<=13px 的辅助小字走
     --fs-sm，回到 11~14px。老师电脑端和孩子手机端共用同一套令牌。 */
  --fs-sm:1.06;
  --fs-sm-min:11px;
}''', 1, 'idx: --fs-sm / --fs-sm-min tokens')
h = layer(h, 'index.html')
h = R(h, '<meta name="app-version" content="213">',
      '<meta name="app-version" content="214">', 1, 'idx: app-version 213->214')
h = R(h, '?v=213', '?v=214', 7, 'idx: 7 script ?v= 213->214')
save('public/index.html', h)

# ---------------------------------------------------------------- app.js
print('[public/app.js]')
a = load('public/app.js')
a = R(a, "'🔴 录音中… 读完了点我'", "'🔴 录音中 · 读完点我结束'", 3,
       'app: 3 recording labels now say 结束')
a = R(a,
      '''  _exitRecordingMode(mi) {
    const card = document.getElementById('sp-card-' + mi);
    if (card) card.classList.remove('is-recording');
  },''',
      '''  // v214：录音中的「结束」按钮固定吸底（CSS 见 index.html .rd-end-pin）。
  // 长句子把跟读面板撑出舞台可视区时，按钮仍钉在屏幕底部，孩子读完随时
  // 能点，不用被动等 15~20 秒看门狗自动结算。on=true 只在真正开录时给。
  _pinReadEndBtn(btn, on) {
    if (!btn) return;
    if (on) {
      btn.classList.add('rd-end-pin');
      document.body.classList.add('rd-end-on');
    } else {
      btn.classList.remove('rd-end-pin');
      document.body.classList.remove('rd-end-on');
    }
  },

  // v214：兜底清理 —— 任何录音结束的出口都不许把吸底按钮留在屏幕上。
  _unpinAllReadBtns() {
    var pins = document.querySelectorAll('.rd-end-pin');
    for (var i = 0; i < pins.length; i++) pins[i].classList.remove('rd-end-pin');
    document.body.classList.remove('rd-end-on');
  },

  _exitRecordingMode(mi) {
    const card = document.getElementById('sp-card-' + mi);
    if (card) card.classList.remove('is-recording');
    this._unpinAllReadBtns();
  },''', 1, 'app: helper + exit-mode unpin')
a = R(a,
      '''    this._markScoring(btn, status === 'scoring');
    const m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (status === 'recording') {''',
      '''    this._markScoring(btn, status === 'scoring');
    // v214：口语整句跟读，录音中把「结束」按钮吸底。
    this._pinReadEndBtn(btn, status === 'recording');
    const m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (status === 'recording') {''', 1, 'app: _spReadUI pin/unpin')
a = R(a,
      '''    // v179：同 _spReadUI —— 给看门狗留时间戳。
    this._markScoring(btn, status === 'scoring');
    if (status === 'recording') {''',
      '''    // v179：同 _spReadUI —— 给看门狗留时间戳。
    this._markScoring(btn, status === 'scoring');
    // v214：阅读理解 / 选择题 / 填空的跟读同样吸底。
    this._pinReadEndBtn(btn, status === 'recording');
    if (status === 'recording') {''', 1, 'app: _setHoldReadUI pin/unpin')
a = R(a,
      '''    if (btn) btn.innerHTML = '🔴 录音中 · 读完点我结束';
    if (hint) hint.textContent = '';''',
      '''    if (btn) btn.innerHTML = '🔴 录音中 · 读完点我结束';
    this._pinReadEndBtn(btn, true);
    if (hint) hint.textContent = '';''', 1, 'app: _wordRepairRec pin')
a = R(a,
      '''    R.rec = false;
    clearTimeout(R.capTimer);
    // v208：误触保护从 250ms 提到 MIN_READ_MS，双击不再能换到分数。''',
      '''    R.rec = false;
    clearTimeout(R.capTimer);
    // v214：错词重读结束，同步撤掉吸底按钮。
    this._unpinAllReadBtns();
    // v208：误触保护从 250ms 提到 MIN_READ_MS，双击不再能换到分数。''', 1,
       'app: _wordRepairStop unpin')
a = layer(a, 'app.js')
save('public/app.js', a)

# ---------------------------------------------------------------- sw.js
print('[public/sw.js]')
s = load('public/sw.js')
s = R(s, "var CACHE_NAME = 'amy-english-v213';",
      "var CACHE_NAME = 'amy-english-v214';", 1, 'sw: CACHE_NAME 213->214')
s = R(s, 'var V = 213;', 'var V = 214;', 1, 'sw: V 213->214')
save('public/sw.js', s)

print('OK: v214 apply finished')
