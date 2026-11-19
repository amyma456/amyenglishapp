# -*- coding: utf-8 -*-
"""v216：统一录音控制条（所有录音入口共用）+ 录音时舞台可滚 + 文本常驻。

一次性精确替换，逐条断言命中次数，任何一条没命中就整体不落盘。
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = os.path.join(ROOT, 'public', 'index.html')
A = os.path.join(ROOT, 'public', 'app.js')
S = os.path.join(ROOT, 'public', 'sw.js')

def rd(p):
    with open(p, 'rb') as f:
        return f.read()

def wr(p, b):
    with open(p, 'wb') as f:
        f.write(b)

def rep(buf, old, new, n=1, tag=''):
    o = old.encode('utf-8') if isinstance(old, str) else old
    x = new.encode('utf-8') if isinstance(new, str) else new
    # 仓库里 index.html 是 LF、app.js 是 CRLF —— 多行锚点必须跟着目标文件走，
    # 否则整段匹配不上（也不会悄悄改错，直接 MISS 报出来）。
    if b'\r\n' in buf:
        o = o.replace(b'\n', b'\r\n')
        x = x.replace(b'\n', b'\r\n')
    c = buf.count(o)
    if c != n:
        raise SystemExit('MISS [%s] expect %d got %d\n--- old ---\n%s' %
                         (tag, n, c, o.decode('utf-8', 'replace')[:400]))
    return buf.replace(o, x)

# ---------------------------------------------------------------- index.html
h = rd(H)

# 1) 录音态不再把题干/中文/短语全藏掉，只收起会分散注意力的选项与提示
old_css = """/* v211 录音模式：整句跟读一开始，卡片上其他内容全部让位 —— 屏幕上只剩
   「要读的句子 + 录音按钮」，句子不用找、按钮不用划，读完自动恢复。 */
.speaking-card.is-recording>*{display:none}
.speaking-card.is-recording>[id^="sp-read-"]{display:block}
.speaking-card.is-recording .speak-record{margin-top:0}
"""
new_css = """/* v211 → v216 修正：录音模式原本是一条 `>*{display:none}`，把题干、中文
   意思、短语提示**一起藏了**，只留跟读面板。家长 2026-11-19 晚：「看见按钮
   的时候字又划不动，导致读的时候不知道文本」。现在只收起选项（防误点答案）、
   进度/提示/重新听这些干扰项，题干、中文、短语、跟读面板全部留在屏幕上。
   配合 v216 的录音浮条，舞台临时可滚，长句也读得到、划得动。 */
.speaking-card.is-recording > div:first-child,
.speaking-card.is-recording > .vocab-progress,
.speaking-card.is-recording > .speak-btn.play,
.speaking-card.is-recording > .speak-options,
.speaking-card.is-recording > .listen-wait,
.speaking-card.is-recording > .speak-tip{display:none}
.speaking-card.is-recording .speak-record{margin-top:0}
"""
h = rep(h, old_css, new_css, 1, 'is-recording css')

# 2) 统一录音控制条 + 录音时舞台可滚
anchor = """body.rd-end-on .rd-sentence.rd-rec{max-height:38vh;overflow-y:auto;
  overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.speak-words{"""
dock_css = """body.rd-end-on .rd-sentence.rd-rec{max-height:38vh;overflow-y:auto;
  overscroll-behavior:contain;-webkit-overflow-scrolling:touch}

/* ===== v216：统一录音控制条 =============================================
   家长 2026-11-19 晚：「第 15 题点了正在录音就看不到按钮，或者看见按钮时
   字又划不动……点停止也不能停止，类似这种情况很多」。
   根因是三件事叠在一起，跟某一道题无关：
     ① 舞台一屏不滚（body.stage-mode / .stage-body{overflow:hidden}），长句
        加一堆说明把「结束」顶出可视区；v214 的 .rd-end-pin 只盖了 3 个入口，
        其余「点一下开始、再点一下结束」的屏完全没有吸底；
     ② 上面那条 is-recording 把题干和中文一起藏了；
     ③ 结束只能点原按钮，而原按钮可能已被裁掉、或被祖先 display:none 吃掉
        （position:fixed 也救不了 display:none 的祖先）。
   所以不修某一颗按钮：录音一开始就挂一个**脱离所有容器的顶层浮条**，
   z-index 2000、pointer-events 只在按钮上，点它一定停；同时舞台临时允许
   滚动，孩子边读边看得到整句文本。所有录音入口共用这一套，不再逐个打补丁。 */
.rec-dock{position:fixed;left:0;right:0;bottom:0;z-index:2000;display:none;
  padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));
  padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));
  background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.94) 42%,#fff 100%);
  pointer-events:none}
body.rec-dock-on .rec-dock{display:block}
.rec-dock-in{max-width:430px;margin:0 auto;display:flex;align-items:center;gap:10px;
  background:#fff;border:1px solid var(--line);border-radius:999px;padding:7px 8px 7px 14px;
  box-shadow:0 8px 28px rgba(0,0,0,.22);pointer-events:none}
.rec-dock-label{flex:0 0 auto;white-space:nowrap;color:var(--danger);font-weight:700;
  font-size:max(calc(13px*var(--fs-sm)),var(--fs-sm-min))}
.rec-dock-stop{flex:1 1 auto;min-height:50px;border:0;border-radius:999px;
  background:var(--danger);color:#fff;font-weight:700;
  font-size:max(calc(17px*var(--fs)),var(--fs-min));
  pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rec-dock-stop:active{transform:scale(.98);filter:brightness(.94)}
/* 录音时舞台内容整体可滚：长句、题干、中文、短语、结果卡片都不会再被裁掉。
   原来只有「句子自己滚」一层，外面的提示/按钮仍被 overflow:hidden 吃掉。 */
body.rec-dock-on .stage-body{overflow-y:auto!important;
  overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
  padding-bottom:100px!important}
body.rec-dock-on .stage-body > .module-card,
body.rec-dock-on .stage-body > .stage-q,
body.rec-dock-on .stage-body > .sent-step,
body.rec-dock-on .stage-body > .passage-full{overflow:visible!important}
/* 舞台能滚之后，句子就别再自己滚了 —— 两层滚动嵌套会把上下滑的手势吞掉
   （家长说的「字划不动」）。sticky 保留，边读边看，句子始终在眼前。 */
body.rec-dock-on .rd-sentence.rd-rec{max-height:none;overflow:visible;
  position:sticky;top:0;z-index:40;background:var(--card)}

.speak-words{"""
h = rep(h, anchor, dock_css, 1, 'dock css')

# 3) 浮条 DOM（app.js 是 defer，DOM 一定先解析完）
dock_html = """<!-- v216 统一录音控制条：任何录音入口都挂它，点一下必定结束 -->
<div id="rec-dock" class="rec-dock" aria-hidden="true">
  <div class="rec-dock-in">
    <span id="rec-dock-label" class="rec-dock-label">🔴 录音中</span>
    <button id="rec-dock-stop" class="rec-dock-stop" type="button">读完点我结束</button>
  </div>
</div>
</body>"""
h = rep(h, '</body>', dock_html, 1, 'dock dom')

# 4) 版本钉子 214 → 216
h = rep(h, 'name="app-version" content="214"', 'name="app-version" content="216"', 1, 'meta version')
h = rep(h, '?v=214', '?v=216', 7, 'script versions')

# ---------------------------------------------------------------- app.js
a = rd(A)

# 5) 新增三个统一方法，放在 _pinReadEndBtn 之前
anchor2 = """  _pinReadEndBtn(btn, on) {"""
methods = """  // ===== v216：统一录音控制条 =============================================
  //
  // 所有录音入口（口语整句跟读、阅读理解/选择/填空跟读、错词重读、按住说
  // 中文、翻译句、写作句、复习词……）共用这一颗「读完点我结束」。它挂在
  // body 顶层、position:fixed、z-index 2000，不受任何祖先的 display:none /
  // overflow:hidden 影响，也不依赖原按钮还在不在屏幕里。
  // 点它直接调当前录音的结束函数，绕开"按钮被裁掉 / 双击被当误触"两条死路。
  _recDockShow(stopFn, label, btnLabel) {
    this._recDockStop = (typeof stopFn === 'function') ? stopFn : null;
    var lab = document.getElementById('rec-dock-label');
    var btn = document.getElementById('rec-dock-stop');
    if (lab) lab.textContent = label || '🔴 录音中';
    if (btn) btn.textContent = btnLabel || '读完点我结束';
    document.body.classList.add('rec-dock-on');
    clearTimeout(this._recDockTimer);
    var self = this;
    // 最后一道兜底：切页 / 崩溃 / 录音卡死，浮条都不许赖在屏幕上。
    this._recDockTimer = setTimeout(function () { self._recDockHide(); }, 130000);
  },
  _recDockHide() {
    clearTimeout(this._recDockTimer);
    this._recDockTimer = null;
    this._recDockStop = null;
    document.body.classList.remove('rec-dock-on');
  },
  _recDockTap(e) {
    if (e && e.preventDefault) e.preventDefault();
    var fn = this._recDockStop;
    this._recDockHide();            // 先收，结束函数里再收一次也无害
    if (!fn) return;
    try { fn(); } catch (err) { console.warn('rec dock stop failed', err); }
  },

  _pinReadEndBtn(btn, on) {"""
a = rep(a, anchor2, methods, 1, 'dock methods')

# 6) _pinReadEndBtn(false) 也收浮条
a = rep(a, """    } else {
      btn.classList.remove('rd-end-pin');
      document.body.classList.remove('rd-end-on');
    }
  },""", """    } else {
      btn.classList.remove('rd-end-pin');
      document.body.classList.remove('rd-end-on');
      this._recDockHide();
    }
  },""", 1, 'pin off')

# 7) _unpinAllReadBtns / _exitRecordingMode 兜底收浮条
a = rep(a, """    for (var i = 0; i < pins.length; i++) pins[i].classList.remove('rd-end-pin');
    document.body.classList.remove('rd-end-on');
  },""", """    for (var i = 0; i < pins.length; i++) pins[i].classList.remove('rd-end-pin');
    document.body.classList.remove('rd-end-on');
    this._recDockHide();
  },""", 1, 'unpin all')

a = rep(a, """  _exitRecordingMode(mi) {
    const card = document.getElementById('sp-card-' + mi);
    if (card) card.classList.remove('is-recording');
    this._unpinAllReadBtns();
  },""", """  _exitRecordingMode(mi) {
    const card = document.getElementById('sp-card-' + mi);
    if (card) card.classList.remove('is-recording');
    this._unpinAllReadBtns();
    this._recDockHide();
  },""", 1, 'exit recording mode')

# 8) 口语整句跟读：开 / 关
a = rep(a, """    this._spReadTimer = setTimeout(() => this._spReadEnd(mi, qi, dayIdx), 20000);
    this._spReadUI(mi, qi, dayIdx, 'recording');
  },""", """    this._spReadTimer = setTimeout(() => this._spReadEnd(mi, qi, dayIdx), 20000);
    this._spReadUI(mi, qi, dayIdx, 'recording');
    this._recDockShow(() => this._spReadEnd(mi, qi, dayIdx));
  },""", 1, 'sp start show')

a = rep(a, """  _spReadEnd(mi, qi, dayIdx) {
    const ctx = this._spReadActive;""", """  _spReadEnd(mi, qi, dayIdx) {
    this._recDockHide();
    const ctx = this._spReadActive;""", 1, 'sp end hide')

# 9) 阅读/选择/填空跟读：开 / 关
a = rep(a, """    this._holdReadTimer = setTimeout(() => this._holdReadEnd(mi, qi, dayIdx), 15000);
    this._setHoldReadUI(mi, qi, 'recording', null, false);
  },""", """    this._holdReadTimer = setTimeout(() => this._holdReadEnd(mi, qi, dayIdx), 15000);
    this._setHoldReadUI(mi, qi, 'recording', null, false);
    this._recDockShow(() => this._holdReadEnd(mi, qi, dayIdx));
  },""", 1, 'holdread start show')

a = rep(a, """  _holdReadEnd(mi, qi, dayIdx) {
    const ctx = this._holdReadActive;""", """  _holdReadEnd(mi, qi, dayIdx) {
    this._recDockHide();
    const ctx = this._holdReadActive;""", 1, 'holdread end hide')

# 10) 错词重读：开 / 关
a = rep(a, """    if (btn) btn.innerHTML = '🔴 录音中 · 读完点我结束';
    this._pinReadEndBtn(btn, true);
    if (hint) hint.textContent = '';""", """    if (btn) btn.innerHTML = '🔴 录音中 · 读完点我结束';
    this._pinReadEndBtn(btn, true);
    this._recDockShow(() => this._wordRepairStop());
    if (hint) hint.textContent = '';""", 1, 'wordrepair start show')

a = rep(a, """  _wordRepairStop() {
    const R = this._wordRepair;""", """  _wordRepairStop() {
    this._recDockHide();
    const R = this._wordRepair;""", 1, 'wordrepair stop hide')

# 11) 通用 _holdStart / _holdEnd（所有"按住说 / 点一下说"入口）
a = rep(a, """    Api.warmup();                              // 手指按下就把连接热好
    this._holdKey = key;""", """    Api.warmup();                              // 手指按下就把连接热好
    this._holdKey = key;
    // v216：这一层覆盖了点一下说中文、翻译句、写作句、复习词等所有入口。
    // tap-toggle 的孩子靠它结束；按住模式松手照旧结束，浮条只是多一层保险。
    this._recDockShow(function () { self._holdEnd(); },
      tapToggle ? '🔴 录音中' : '🔴 正在听你说',
      tapToggle ? '读完点我结束' : '松手即可结束');""", 1, 'hold start show')

a = rep(a, """  async _holdEnd(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();""", """  async _holdEnd(ev) {
    this._recDockHide();
    if (ev && ev.preventDefault) ev.preventDefault();""", 1, 'hold end hide')

a = rep(a, """    if (!Recorder.supported()) {
      setStatus('<div class="tap-result bad">此浏览器不支持录音</div>');
      this._holdKey = null;
      return;
    }""", """    if (!Recorder.supported()) {
      setStatus('<div class="tap-result bad">此浏览器不支持录音</div>');
      this._holdKey = null;
      this._recDockHide();
      return;
    }""", 1, 'hold unsupported')

a = rep(a, """      .catch(function() {
        setStatus('<div class="tap-result bad">无法访问麦克风，请允许权限</div>');
        self._holdKey = null;
        // v171：录音根本没开成 —— 把刚才遮起来的译文/结果放回来。
        if (self._trRestore) self._trRestore();
      });""", """      .catch(function() {
        setStatus('<div class="tap-result bad">无法访问麦克风，请允许权限</div>');
        self._holdKey = null;
        self._recDockHide();
        // v171：录音根本没开成 —— 把刚才遮起来的译文/结果放回来。
        if (self._trRestore) self._trRestore();
      });""", 1, 'hold mic fail')

# 12) 切题时清掉浮条，绝不残留
a = rep(a, """  renderStage(dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];""", """  renderStage(dayIdx) {
    // v216：换题/重渲染时不许把上一题的录音浮条带过去。
    this._recDockHide();
    const day = HOMEWORK_DATA[dayIdx];""", 1, 'render stage hide')

# 13) 全局绑定浮条按钮（App.init 之前，DOM 已由 defer 保证解析完）
a = rep(a, """// Init
App.init();""", """// v216：统一录音控制条 —— 一次绑定，所有录音入口共用。
// touchstart 上 preventDefault 挡住手机补发的 mousedown/click，click 留作
// 老内核兜底；_recDockTap 自己先收回调，重复触发也只会停一次。
(function () {
  var stop = document.getElementById('rec-dock-stop');
  if (!stop) return;
  var tap = function (e) { if (e && e.preventDefault) e.preventDefault(); App._recDockTap(e); };
  stop.addEventListener('touchstart', tap, { passive: false });
  stop.addEventListener('mousedown', tap);
  stop.addEventListener('click', tap);
})();

// Init
App.init();""", 1, 'dock binding')

# ---------------------------------------------------------------- sw.js
s = rd(S)
s = rep(s, "var CACHE_NAME = 'amy-english-v214';", "var CACHE_NAME = 'amy-english-v216';", 1, 'sw cache')
s = rep(s, 'var V = 214;', 'var V = 216;', 1, 'sw V')

# ---------------------------------------------------------------- 落盘
wr(H, h); wr(A, a); wr(S, s)
print('v216 applied OK')
print('  index.html', len(h), 'bytes | app.js', len(a), 'bytes | sw.js', len(s), 'bytes')
