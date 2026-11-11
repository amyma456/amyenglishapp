/* ===========================================================================
 * v194 · 单词星球 · 能量收集站（Word Planet）
 * ---------------------------------------------------------------------------
 * 家长 2026-11-11 的需求：
 *   「错的多的小孩就玩的时长少，错的少的同学就玩的时间长，最多 3 分钟。
 *     每一轮要有积分，每一轮赢的分数可以累计。」
 *
 * 设计要点（为什么这么定，不乱拍脑袋）：
 *   ① 时长不是拍一个数，而是**按今天的错题数实时算**：
 *        可玩秒数 = clamp(180 - 错题数 × 12, 45, 180)
 *      全对 = 3:00（家长要的上限）；错 5 道 = 2:00；错 12 道以上 = 45 秒
 *      （保底不剃光，孩子错得多也有得玩、也愿意明天少错几道）。
 *      每少错 1 道就多 12 秒，这个换算直接写在首页卡上，激励看得见。
 *   ② 一天只发一次「当日额度」，一轮 30 秒，最多 6 轮；最后一轮不足 30 秒
 *      就按剩余时间打。每轮结束**单独结算一次**，分数进总账，永久累计。
 *   ③ 积分不只是「答对 +10」：连击加成、金色星星 +30、轮末还有答对数／
 *      最高连击奖励。轮轮有小结、总分一直涨，才有「攒分」的味道。
 *   ④ 题目不是随机词海：今天答错的题里出现过的单词／短语会被优先抽中
 *      （错得多的孩子虽然玩得短，练的却正是自己错的），再补今天的 5 个
 *      生词、课本短语表、本地词典，三种题型轮换。
 *   ⑤ 英文一律小写（家长从 V14 起定的硬规矩），点词释义只走本地词典，
 *      游戏全程零网络请求 —— 弱网、华为浏览器、平板自带浏览器都能玩。
 *
 * 兼容性：全文件 ES5（var / function / 字符串拼接），不用 :has()、不用
 *   100dvh 单写、不用可选链、不用模板字符串。计时用 Date.now() 差值，
 *   切到后台再回来不会多扣也不会白送时间。
 * ======================================================================== */
(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 家长 2026-11-11：「最多 3 分钟试一下，如果后面太多了，还可以再调整」。
  // 所以全部数值集中在这一个配置里 —— 以后想改时长 / 扣分幅度 / 一轮多长，
  // 只动下面几个数字即可，不用翻遍代码，也不用重新设计玩法。
  // ------------------------------------------------------------------
  var CFG = {
    maxSec: 180,             // 硬上限：3:00，一分不多
    minSec: 45,              // 保底：错得再多也留 45 秒，不把孩子劝退
    secPerWrong: 12,         // 每错 1 道少 12 秒（改这个就改了整条曲线）
    roundMs: 30000,          // 一轮 30 秒；180 秒正好 6 轮
    trialSec: 30,            // 今日作业没打卡时只能试玩 30 秒
    starRate: 0.18,          // 星星题出现概率
    baseScore: 10,           // 点对基础分
    comboStep: 2,            // 每级连击额外分
    comboCap: 10,            // 连击加成封顶
    starBonus: 30,           // 星星题答对额外分
    // 错题回炉权重：错得越多，游戏里越优先抽自己错过的词
    reviewMin: 0.35, reviewPerWrong: 0.05, reviewMax: 0.80
  };
  var STORE_KEY     = 'amy_wordgame_v1';
  var MAX_SEC       = CFG.maxSec;
  var MIN_SEC       = CFG.minSec;
  var LOSS_PER_WRONG= CFG.secPerWrong;
  var ROUND_MS      = CFG.roundMs;
  var TRIAL_SEC     = CFG.trialSec;
  var STAR_RATE     = CFG.starRate;

  // ------------------------------------------------------------------ utils
  function clamp(n, a, b) { return n < a ? a : (n > b ? b : n); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + pad2(s % 60);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function pick(a) { return a && a.length ? a[Math.floor(Math.random() * a.length)] : null; }
  function shuffle(a) {
    var r = a.slice(), i, j, t;
    for (i = r.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function cleanZh(s) {
    var t = String(s == null ? '' : s)
      .replace(/<[^>]*>/g, '').replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '')
      .split(/[|;；,，/]/)[0].trim();
    // 中文释义里夹着大写英文（T恤、A牌…）的条目直接不用 —— 家长定的硬规矩：
    // 孩子在游戏里看到的英文一律小写。
    if (!t || t.length > 12 || !/[\u4e00-\u9fa5]/.test(t) || /[A-Z]/.test(t)) return '';
    return t;
  }
  function lower(s) { return String(s == null ? '' : s).toLowerCase(); }

  // ------------------------------------------------------------------ 存档
  function defSave() {
    return {
      total: 0, best: 0, rounds: 0, todayScore: 0,
      day: todayStr(), usedMs: 0, muted: false, history: []
    };
  }
  function loadSave() {
    var d = defSave(), raw, o, k;
    try {
      raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        o = JSON.parse(raw);
        for (k in d) { if (Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined) d[k] = o[k]; }
      }
    } catch (e) {}
    // 跨天：清空「今天已用时间 / 今日得分」，累计总分永远不清零。
    if (d.day !== todayStr()) {
      d.day = todayStr(); d.usedMs = 0; d.todayScore = 0;
    }
    if (!d.history || !d.history.length) d.history = [];
    d.total = Math.max(0, Math.floor(Number(d.total) || 0));
    d.best = Math.max(0, Math.floor(Number(d.best) || 0));
    d.rounds = Math.max(0, Math.floor(Number(d.rounds) || 0));
    d.usedMs = Math.max(0, Math.floor(Number(d.usedMs) || 0));
    return d;
  }
  function persist() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
  }

  var S = loadSave();

  // ------------------------------------------------- 今天错了多少 / 打卡没
  function todayInfo() {
    var info = { wrong: 0, done: false, teacher: false, dayIdx: 0 };
    try {
      var App = window.App;
      if (!App) return info;
      info.teacher = !!(App.isTeacher && App.isTeacher());
      if (App.getTodayWeekdayIdx) info.dayIdx = App.getTodayWeekdayIdx();
      var st = App.state || {};
      var sid = App._myStudentId ? App._myStudentId() : (st.phone || '');
      var tag = App._weekTag ? App._weekTag() : '';
      var prefix = sid + tag + '_d' + info.dayIdx + '_';
      var answers = st.answers || {}, k;
      // ① 本机答题记录里的实时错题（最准，孩子改一题这里立刻变）
      for (k in answers) {
        if (!Object.prototype.hasOwnProperty.call(answers, k)) continue;
        if (k.indexOf(prefix) === 0 && answers[k] && answers[k].correct === false) info.wrong++;
      }
      // ② 打卡记录里的错题数（换设备 / 云端补录时也认），取更完整的那份
      var ck = (st.checkins || {})[sid + tag + '_d' + info.dayIdx];
      if (ck) {
        if ((Number(ck.wrongCount) || 0) > info.wrong) info.wrong = Number(ck.wrongCount) || 0;
        info.done = !!ck.done;
      }
    } catch (e) {}
    // 老师是试玩，不按任何学生的错题扣时长
    if (info.teacher) { info.wrong = 0; info.done = true; }
    return info;
  }

  /** 时长规则（对外暴露，校验脚本直接测它） */
  function rule(wrong) {
    var w = Math.max(0, Math.floor(Number(wrong) || 0));
    return clamp(MAX_SEC - w * LOSS_PER_WRONG, MIN_SEC, MAX_SEC);
  }
  function grantSec(info) {
    if (info.teacher) return MAX_SEC;
    if (!info.done) return TRIAL_SEC;
    return rule(info.wrong);
  }

  // ------------------------------------------------------------------ 等级
  var LEVELS = [
    { min: 0,    name: '见习宇航员', icon: '🌱' },
    { min: 150,  name: '单词侦察兵', icon: '🔭' },
    { min: 400,  name: '星球队长',   icon: '🚀' },
    { min: 900,  name: '能量指挥官', icon: '🛰️' },
    { min: 1800, name: '银河词王',   icon: '👑' }
  ];
  function levelOf(total) {
    var lv = LEVELS[0], i, next = null;
    for (i = 0; i < LEVELS.length; i++) {
      if (total >= LEVELS[i].min) lv = LEVELS[i];
      else { next = LEVELS[i]; break; }
    }
    return { name: lv.name, icon: lv.icon, next: next ? next.min - total : 0 };
  }

  // ------------------------------------------------------------------ 词库
  var STOP = ('the and for with you are was were she his her that this have has not but what when where which who how ' +
    'from they them there their will would can could please choose correct answer blank listen read sentence picture ' +
    'word words true false into about your our its one two three all any some more most very too day days today ' +
    'fill following option options').split(' ');
  var SMALL = ['to','in','on','at','for','with','of','off','out','up','down','about','from','into','over',
               'back','away','after','like','near','under','by','as','through','around','along'];
  var FALLBACK_EN = ['apple','river','cloud','pencil','market','window','planet','ticket'];
  var FALLBACK_ZH = ['苹果','河流','云朵','铅笔','市场','窗户','星球','车票'];

  function addWord(map, list, en, zh, emoji, p) {
    en = lower(en).trim().replace(/\s+/g, ' ');
    zh = cleanZh(zh);
    if (!en || !zh) return;
    if (!/^[a-z][a-z' ]*$/.test(en) || en.length < 2 || en.length > 28) return;
    var it = map[en];
    if (it) { if (p < it.p) it.p = p; return; }
    it = { en: en, zh: zh, emoji: emoji || '', p: p };
    map[en] = it; list.push(it);
  }

  function todayWords(dayIdx, map, list) {
    try {
      var day = window.HOMEWORK_DATA[dayIdx];
      if (!day) return;
      (day.modules || []).forEach(function (m) {
        (m.words || []).forEach(function (w) {
          addWord(map, list, w.word, w.meaning, w.emoji, 1);
        });
        // 阅读／语法题里出现的短语也顺手收进来
        (m.questions || []).forEach(function (q) {
          if (q && q.word) addWord(map, list, q.word, q.meaning, '', 1);
        });
      });
    } catch (e) {}
  }

  function phraseList() {
    var out = [];
    try {
      (window.WordHelp.PHRASES || []).forEach(function (p) {
        if (!p || !p[0]) return;
        var en = lower(p[0]).trim(), zh = cleanZh(p[1]);
        if (!zh || !/^[a-z][a-z' ]*$/.test(en)) return;
        if (en.split(' ').length < 2 || en.split(' ').length > 4) return;
        out.push({ en: en, zh: zh });
      });
    } catch (e) {}
    return out;
  }

  // 今天答错的题里出现过的词 → 优先级最高，游戏里优先抽到
  function wrongWords(info, map, list) {
    var out = [];
    try {
      var App = window.App, st = App.state || {};
      var sid = App._myStudentId ? App._myStudentId() : (st.phone || '');
      var tag = App._weekTag ? App._weekTag() : '';
      var prefix = sid + tag + '_d' + info.dayIdx + '_';
      var day = window.HOMEWORK_DATA[info.dayIdx];
      var answers = st.answers || {}, ph = phraseList(), n = 0;
      Object.keys(answers).forEach(function (k) {
        if (k.indexOf(prefix) !== 0 || n >= 20) return;
        var a = answers[k];
        if (!a || a.correct !== false) return;
        n++;
        var mm = /_m(\d+)_q(\d+)$/.exec(k);
        var text = '';
        if (mm && day) {
          var mod = (day.modules || [])[Number(mm[1])];
          var q = mod && (mod.questions || [])[Number(mm[2])];
          if (q) {
            text = [q.question, q.text, q.prompt, q.sentence, q.en, q.word, q.answer]
              .filter(Boolean).join(' ');
            if (q.options && q.options.join) text += ' ' + q.options.join(' ');
          }
        }
        if (!text && a.value) text = String(a.value);
        text = lower(text);
        // 整条短语优先（large desert / is close to 这类）
        ph.forEach(function (p) {
          if (text.indexOf(p.en) >= 0) addWord(map, list, p.en, p.zh, '', 0);
        });
        (text.match(/[a-z][a-z'-]{2,}/g) || []).forEach(function (w) {
          if (STOP.indexOf(w) >= 0 || w.length > 14) return;
          var d = null;
          try { d = window.Api.dictLocal(w); } catch (e) {}
          if (d && d.zh) addWord(map, list, w, d.zh, '', 0);
        });
      });
    } catch (e) {}
    // 把 p=0 的挑出来，作为「错题回炉」优先池
    list.forEach(function (it) { if (it.p === 0) out.push(it); });
    return out;
  }

  function dictWords(map, list) {
    try {
      var D = window.LOCAL_DICT, keys = Object.keys(D), i, k, zh;
      keys = shuffle(keys);
      for (i = 0; i < keys.length && list.length < 460; i++) {
        k = keys[i];
        if (!/^[a-z]{3,12}$/.test(k)) continue;
        if (STOP.indexOf(k) >= 0) continue;
        zh = cleanZh(String(D[k]).split('|')[0]);
        if (!zh || zh.length < 2) continue;
        addWord(map, list, k, zh, '', 3);
      }
    } catch (e) {}
  }

  function buildPool(info) {
    var map = {}, list = [];
    var wrong = wrongWords(info, map, list);
    todayWords(info.dayIdx, map, list);
    phraseList().forEach(function (p) { addWord(map, list, p.en, p.zh, '', 2); });
    dictWords(map, list);
    if (list.length < 12) {
      for (var i = 0; i < FALLBACK_EN.length; i++) {
        addWord(map, list, FALLBACK_EN[i], FALLBACK_ZH[i], '', 3);
      }
    }
    return { all: list, wrong: wrong, phrases: phraseList() };
  }

  function distract(base, field, n) {
    var used = {}, out = [], tries = 0, it, v;
    used[base[field]] = 1;
    while (out.length < n && tries < 80) {
      tries++;
      it = pick(G.pool.all);
      if (!it) break;
      v = it[field];
      if (!v || used[v]) continue;
      used[v] = 1; out.push(v);
    }
    var fb = field === 'en' ? FALLBACK_EN : FALLBACK_ZH;
    for (var i = 0; out.length < n && i < fb.length; i++) {
      if (!used[fb[i]]) { used[fb[i]] = 1; out.push(fb[i]); }
    }
    return out;
  }

  /** 错得越多，越优先练自己错过的词：0 错 35%，5 错 60%，10 错以上 80%。
   *  时长短的孩子，玩到的题反而更贴自己的薄弱环节。 */
  function reviewWeight() {
    var w = G.info ? G.info.wrong : 0;
    return clamp(CFG.reviewMin + w * CFG.reviewPerWrong, CFG.reviewMin, CFG.reviewMax);
  }
  function pickItem() {
    if (G.pool.wrong.length && Math.random() < reviewWeight()) return pick(G.pool.wrong);
    return pick(G.pool.all) || { en: 'apple', zh: '苹果' };
  }

  /** 出一道题：中→英 / 英→中 / 短语补全，4 个选项且恰好 1 个正确 */
  function makeQuestion() {
    var kinds = ['zh2en', 'en2zh'];
    if (G.pool.phrases.length > 4) kinds.push('phrase');
    var kind = pick(kinds);
    var item, title, sub, opts = [], i, parts, cut, ans, masked, wrongs;

    if (kind === 'phrase') {
      var ph = pick(G.pool.phrases), tries = 0;
      while (ph && ph.en.split(' ').length < 2 && tries++ < 8) ph = pick(G.pool.phrases);
      if (!ph || ph.en.split(' ').length < 2) kind = 'zh2en';
      else {
        parts = ph.en.split(' ');
        cut = 1 + Math.floor(Math.random() * (parts.length - 1));
        ans = parts[cut];
        masked = parts.slice(); masked[cut] = '___';
        wrongs = shuffle(SMALL.filter(function (w) { return w !== ans; })).slice(0, 3);
        title = '补全短语：' + masked.join(' ');
        sub = '意思是「' + ph.zh + '」';
        opts = shuffle([ans].concat(wrongs)).map(function (t) {
          return { text: t, correct: t === ans, used: false };
        });
      }
    }
    if (kind === 'zh2en') {
      item = pickItem();
      title = '选出「' + item.zh + '」的英文';
      sub = item.emoji ? item.emoji + ' 想一想，点对的能量泡泡' : '想一想，点对的能量泡泡';
      wrongs = distract(item, 'en', 3);
      opts = shuffle([item.en].concat(wrongs)).map(function (t) {
        return { text: t, correct: t === item.en, used: false };
      });
    } else if (kind === 'en2zh') {
      item = pickItem();
      title = '「' + item.en + '」是什么意思？';
      sub = item.emoji ? item.emoji + ' 点出正确的中文意思' : '点出正确的中文意思';
      wrongs = distract(item, 'zh', 3);
      opts = shuffle([item.zh].concat(wrongs)).map(function (t) {
        return { text: t, correct: t === item.zh, used: false };
      });
    }

    // 保证恰好一个正确答案（干扰项万一撞车就补一个兜底词）
    var correctCount = 0;
    for (i = 0; i < opts.length; i++) if (opts[i].correct) correctCount++;
    if (correctCount !== 1) {
      opts = opts.filter(function (o) { return !o.correct; }).slice(0, 3);
      while (opts.length < 3) opts.push({ text: pick(FALLBACK_EN), correct: false, used: false });
      opts.push({ text: item ? item.en : 'apple', correct: true, used: false });
      opts = shuffle(opts);
    }
    // 星星挂在「这一题」上，不挂在正确选项上 —— 标在选项上等于直接报答案。
    // 星星题答对额外 +30，孩子在题目卡一眼能看到，但还得自己想哪个对。
    return {
      kind: kind, title: title, sub: sub, options: opts,
      star: Math.random() < STAR_RATE,
      review: !!(item && item.p === 0),
      tip: item ? (item.en + ' · ' + item.zh) : ''
    };
  }

  /** 跨天：额度、轮数、词库全部重来，但累计积分不清零 */
  function ensureDay() {
    if (S.day === todayStr()) return;
    S.day = todayStr(); S.usedMs = 0; S.todayScore = 0;
    persist();
    G.roundNo = 0; G.pool = { all: [], wrong: [], phrases: [] };
    G.info = null; G.html = ''; G.started = false;
    clearInterval(G.timer); G.timer = null;
    G.phase = 'lobby';
  }

  // ------------------------------------------------------------ 运行时状态
  var G = {
    phase: 'lobby',      // lobby | playing | round | finish
    html: '',
    info: null,
    allowanceMs: 0,
    pool: { all: [], wrong: [], phrases: [] },
    roundNo: 0,
    roundMs: 0,
    roundEndAt: 0,
    timer: null,
    q: null,
    score: 0,            // 本轮已得分
    combo: 0,
    maxCombo: 0,
    correct: 0,
    starHit: 0,
    locked: false,
    last: null,          // 上一轮结算
    started: false
  };

  function leftMs() {
    return Math.max(0, (G.allowanceMs || 0) - (S.usedMs || 0));
  }

  // ------------------------------------------------------------------ 音效
  var AC = null;
  function beep(kind) {
    if (S.muted) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      if (!AC) AC = new C();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine';
      o.frequency.value = kind === 'star' ? 880 : (kind === 'good' ? 660 : 220);
      g.gain.value = 0.045;
      o.connect(g); g.connect(AC.destination);
      o.start(0); o.stop(AC.currentTime + (kind === 'bad' ? 0.09 : 0.13));
    } catch (e) {}
  }

  // ------------------------------------------------------------------ 渲染
  function statBox(num, label, color) {
    return '<div class="wg-stat"><div class="wg-stat-n" style="color:' + (color || 'var(--primary-dark)') + '">' +
      num + '</div><div class="wg-stat-l">' + label + '</div></div>';
  }

  /** 「错几道 → 能玩多久」阶梯表。直接按 CFG 算，以后调参数表也跟着变。 */
  function ladderHtml(wrong) {
    var floorWrong = Math.ceil((MAX_SEC - MIN_SEC) / LOSS_PER_WRONG);
    var steps = [0, 3, 5, 10, floorWrong].filter(function (v, i, a) {
      return a.indexOf(v) === i;
    }).sort(function (a, b) { return a - b; });
    var near = steps[0], i;
    for (i = 1; i < steps.length; i++) {
      if (Math.abs(steps[i] - wrong) < Math.abs(near - wrong)) near = steps[i];
    }
    var h = '';
    steps.forEach(function (n) {
      h += '<div class="wg-ladder-item' + (n === near ? ' wg-ladder-cur' : '') + '">' +
        '<span>错 ' + n + (n === floorWrong ? '+' : '') + ' 道</span><b>' +
        fmt(rule(n) * 1000) + '</b></div>';
    });
    return h;
  }

  function hallHtml() {
    var info = G.info || todayInfo();
    var full = grantSec(info) * 1000;
    G.allowanceMs = full;
    var left = Math.max(0, full - S.usedMs);
    var lv = levelOf(S.total);
    var pct = clamp(Math.round(left / full * 100), 0, 100);
    var h = '';

    h += '<div class="wg-hero">';
    h += '<div class="wg-hero-ic">🚀</div>';
    h += '<div><div class="wg-title">单词星球 · 能量收集站</div>';
    h += '<div class="wg-sub">答对单词收集能量，连击越高分越多。每轮结算一次，积分一直攒着。</div></div>';
    h += '</div>';

    // 时长规则卡：把「错得少玩得久」摆在明面上
    h += '<div class="wg-card wg-time-card">';
    h += '<div class="wg-card-hd"><span>⏱️ 今天能玩多久</span><span class="wg-pill">' +
      (info.teacher ? '老师试玩' : (info.done ? '今日作业已打卡' : '还没打卡')) + '</span></div>';
    if (info.teacher) {
      h += '<div class="wg-big-time">' + fmt(MAX_SEC * 1000) +
        '</div><div class="wg-note">老师试玩按满额 ' + fmt(MAX_SEC * 1000) + ' 计算。</div>';
    } else if (!info.done) {
      h += '<div class="wg-big-time">' + fmt(TRIAL_SEC * 1000) + '</div>';
      h += '<div class="wg-note">今日作业还没打卡，先去完成，就能按错题数领取最多 ' +
        fmt(MAX_SEC * 1000) + ' 的正式时长。</div>';
      h += '<button class="wg-btn wg-btn-ghost" data-wg="gotoday">📝 去完成今日作业</button>';
    } else {
      h += '<div class="wg-time-row"><span>今日错题 <b>' + info.wrong + '</b> 道</span>' +
           '<span>每少错 1 道多 ' + LOSS_PER_WRONG + ' 秒</span></div>';
      h += '<div class="wg-big-time">' + fmt(full) + '</div>';
      h += '<div class="wg-track"><div class="wg-track-in" style="width:' + pct + '%"></div></div>';
      h += '<div class="wg-note">' + (info.wrong === 0
          ? '全部答对，今天可以玩满 ' + fmt(MAX_SEC * 1000) + '！'
          : '按错题数发放：全对 ' + fmt(MAX_SEC * 1000) + '，每错 1 道少 ' +
            LOSS_PER_WRONG + ' 秒，最少 ' + fmt(MIN_SEC * 1000) + '。') + '</div>';
      h += '<div class="wg-ladder">' + ladderHtml(info.wrong) + '</div>';
    }
    h += '</div>';

    // 积分总账
    h += '<div class="wg-card">';
    h += '<div class="wg-card-hd"><span>🏅 我的能量总账</span><span class="wg-pill wg-pill-lv">' +
      lv.icon + ' ' + lv.name + '</span></div>';
    h += '<div class="wg-stats">' +
      statBox(S.total, '累计积分', 'var(--primary-dark)') +
      statBox(S.best, '最高单轮', 'var(--accent-dark)') +
      statBox(S.rounds, '已完成轮数', 'var(--teal)') +
      statBox(S.todayScore, '今日得分', 'var(--info)') + '</div>';
    if (lv.next > 0) h += '<div class="wg-note">再攒 ' + lv.next + ' 分就升级啦，每一轮的分数都会加进来。</div>';
    h += '</div>';

    // 玩法
    h += '<div class="wg-card wg-rules">';
    h += '<div class="wg-card-hd"><span>✨ 怎么拿高分</span></div>';
    h += '<div class="wg-rule"><span>①</span>点对一个 +' + CFG.baseScore +
      ' 分，点错不扣分，只是连击断掉，还能继续点。</div>';
    h += '<div class="wg-rule"><span>②</span>连续点对有连击加成，最高每题再加 ' + CFG.comboCap + ' 分。</div>';
    h += '<div class="wg-rule"><span>③</span>金色星星 ⭐ 额外 +' + CFG.starBonus +
      ' 分；轮末按答对数和最高连击再发奖励。</div>';
    h += '<div class="wg-rule"><span>④</span>一轮 ' + fmt(ROUND_MS) +
      '，今天错过的单词会优先出现，错得越多练得越准。</div>';
    h += '</div>';

    if (S.history.length) {
      h += '<div class="wg-card"><div class="wg-card-hd"><span>📜 最近几轮</span></div><div class="wg-hist">';
      S.history.slice(0, 5).forEach(function (r) {
        h += '<div class="wg-hist-row"><span>第 ' + r.n + ' 轮 · 答对 ' + r.c + ' 题 · 连击 ' + r.combo +
          '</span><b>+' + r.s + '</b></div>';
      });
      h += '</div></div>';
    }

    h += '<div class="wg-actions">';
    if (left >= 10000) {
      h += '<button class="wg-btn" data-wg="start">' +
        (G.roundNo > 0 ? '🚀 开始第 ' + (G.roundNo + 1) + ' 轮' : '🚀 开始收集能量') + '</button>';
      h += '<div class="wg-note wg-center">今天还剩 ' + fmt(left) + ' 可以玩</div>';
    } else {
      h += '<button class="wg-btn wg-btn-disabled" disabled>今天的能量已收集完</button>';
      h += '<div class="wg-note wg-center">明天少错几道题，就能玩更久 🌟</div>';
    }
    h += '<button class="wg-mini" data-wg="mute">' + (S.muted ? '🔇 音效已关' : '🔊 音效开启') + '</button>';
    h += '</div>';
    return h;
  }

  function playHtml() {
    var q = G.q || { title: '准备出发…', sub: '', options: [] };
    var lv = levelOf(S.total);
    var h = '';
    h += '<div class="wg-top">';
    h += '<div class="wg-top-l"><span class="wg-round">第 ' + G.roundNo + ' 轮</span>' +
         '<span class="wg-dot">·</span><span>' + lv.icon + ' ' + lv.name + '</span></div>';
    h += '<button class="wg-mini" data-wg="mute">' + (S.muted ? '🔇' : '🔊') + '</button>';
    h += '</div>';
    h += '<div class="wg-hud">';
    h += '<div class="wg-hud-cell"><span>本轮</span><b id="wg-score">' + G.score + '</b></div>';
    h += '<div class="wg-hud-cell"><span>连击</span><b id="wg-combo">×' + G.combo + '</b></div>';
    h += '<div class="wg-hud-cell"><span>累计</span><b id="wg-total">' + S.total + '</b></div>';
    h += '</div>';
    h += '<div class="wg-clockbar"><div class="wg-clock"><span>本轮剩余</span><b id="wg-clock">' +
      fmt(G.roundMs) + '</b></div><div class="wg-clock"><span>今天还剩</span><b id="wg-overline">' +
      fmt(leftMs()) + '</b></div></div>';
    h += '<div class="wg-track wg-track-live"><div class="wg-track-in" id="wg-bar" style="width:100%"></div></div>';
    h += '<div class="wg-qcard' + (q.star ? ' wg-qcard-star' : '') + '">';
    h += '<div class="wg-qtags">' + (q.star ? '<span class="wg-tag wg-tag-star">⭐ 星星题 · 答对额外 +30</span>' : '') +
         (q.review ? '<span class="wg-tag wg-tag-review">🔁 今天错过的词</span>' : '') + '</div>';
    h += '<div class="wg-qtitle">' + esc(q.title) + '</div>' +
         '<div class="wg-qsub">' + esc(q.sub) + '</div></div>';
    h += '<div class="wg-opts">';
    q.options.forEach(function (o, i) {
      h += '<button class="wg-opt' + (o.used ? ' wg-opt-wrong' : '') +
        '" data-wg="opt" data-wg-v="' + i + '">' +
        '<span class="wg-opt-t">' + esc(o.text) + '</span></button>';
    });
    h += '</div>';
    h += '<div class="wg-bottom">' +
      '<span class="wg-note">点对 +' + CFG.baseScore + ' · 连击加成 · 星星 +' + CFG.starBonus + '</span>' +
      '<button class="wg-link" data-wg="end">收工结算</button></div>';
    return h;
  }

  function roundHtml() {
    var l = G.last || { score: 0, bonus: 0, correct: 0, combo: 0, star: 0 };
    var lv = levelOf(S.total);
    var left = leftMs();
    var h = '';
    h += '<div class="wg-result">';
    h += '<div class="wg-result-ic">🎉</div>';
    h += '<div class="wg-result-t">第 ' + G.roundNo + ' 轮完成</div>';
    h += '<div class="wg-result-score">+' + l.score + '<span> 分</span></div>';
    h += '<div class="wg-result-detail">答对 ' + l.correct + ' 题 · 最高连击 ×' + l.combo +
      ' · 星星 ' + l.star + ' 颗 · 轮末奖励 +' + l.bonus + '</div>';
    h += '<div class="wg-total-line">累计 <b>' + S.total + '</b> 分 · ' + lv.icon + ' ' + lv.name + '</div>';
    if (lv.next > 0) h += '<div class="wg-note">离下一级还差 ' + lv.next + ' 分</div>';
    h += '</div>';
    h += '<div class="wg-card"><div class="wg-card-hd"><span>⏱️ 今天的能量</span></div>' +
      '<div class="wg-track"><div class="wg-track-in" style="width:' +
      clamp(Math.round(left / (G.allowanceMs || 1) * 100), 0, 100) + '%"></div></div>' +
      '<div class="wg-note">还剩 ' + fmt(left) + '，一轮 30 秒。</div></div>';
    h += '<div class="wg-actions">';
    if (left >= 10000) h += '<button class="wg-btn" data-wg="next">🚀 开始第 ' + (G.roundNo + 1) + ' 轮</button>';
    h += '<button class="wg-btn wg-btn-ghost" data-wg="lobby">回到基地</button>';
    h += '</div>';
    return h;
  }

  function finishHtml() {
    var info = G.info || todayInfo();
    var lv = levelOf(S.total);
    var used = Math.round((G.allowanceMs - leftMs()) / 1000);
    var h = '';
    h += '<div class="wg-result">';
    h += '<div class="wg-result-ic">🏆</div>';
    h += '<div class="wg-result-t">今天的能量收集完毕</div>';
    h += '<div class="wg-result-score">' + S.todayScore + '<span> 分</span></div>';
    h += '<div class="wg-result-detail">今天玩了 ' + G.roundNo + ' 轮 · 共 ' + fmt(used * 1000) +
      ' · 累计总积分 ' + S.total + ' 分</div>';
    h += '<div class="wg-total-line">' + lv.icon + ' ' + lv.name + '</div>';
    h += '</div>';
    h += '<div class="wg-card wg-time-card">';
    h += '<div class="wg-card-hd"><span>🌟 明天玩更久的办法</span></div>';
    if (info.teacher) {
      h += '<div class="wg-note">老师试玩按满额 3 分钟计算。</div>';
    } else {
      h += '<div class="wg-note">今天错 <b>' + info.wrong + '</b> 道 → 时长 <b>' + fmt(rule(info.wrong) * 1000) +
        '</b>。每少错 1 道就多 ' + LOSS_PER_WRONG + ' 秒，全部答对可以玩满 <b>' +
        fmt(MAX_SEC * 1000) + '</b>。</div>';
      if (info.wrong > 0) {
        var less = Math.min(3, info.wrong);
        h += '<div class="wg-note">明天少错 ' + less + ' 道，就能多玩 <b>' +
          (less * LOSS_PER_WRONG) + ' 秒</b> 🌟</div>';
      }
    }
    h += '</div>';
    h += '<div class="wg-actions"><button class="wg-btn wg-btn-ghost" data-wg="gotoday">📝 回去看看今日作业</button>' +
      '<button class="wg-btn wg-btn-ghost" data-wg="lobby">回到基地</button></div>';
    return h;
  }

  function view() {
    if (G.phase === 'playing') return playHtml();
    if (G.phase === 'round') return roundHtml();
    if (G.phase === 'finish') return finishHtml();
    return hallHtml();
  }

  function paint() {
    G.html = view();
    var root = document.getElementById('wg-root');
    if (root) {
      root.innerHTML = G.html;
      if (G.phase === 'playing') paintClock();
    }
  }

  function paintClock() {
    var leftRound = G.phase === 'playing' ? Math.max(0, G.roundEndAt - Date.now()) : 0;
    var a = document.getElementById('wg-clock');
    var b = document.getElementById('wg-overline');
    var bar = document.getElementById('wg-bar');
    if (a) a.innerHTML = fmt(leftRound);
    if (b) b.innerHTML = fmt(Math.max(0, leftMs() - (G.roundMs - leftRound)));
    if (bar) bar.style.width = clamp(leftRound / (G.roundMs || 1) * 100, 0, 100) + '%';
  }

  function updateHud() {
    var a = document.getElementById('wg-score');
    var b = document.getElementById('wg-combo');
    var c = document.getElementById('wg-total');
    if (a) a.innerHTML = G.score;
    if (b) b.innerHTML = '×' + G.combo;
    if (c) c.innerHTML = S.total;
  }

  function optEl(i) {
    var root = document.getElementById('wg-root');
    if (!root || !root.querySelectorAll) return null;
    var nodes = root.querySelectorAll('[data-wg="opt"]'), j;
    for (j = 0; j < nodes.length; j++) {
      if (nodes[j].getAttribute('data-wg-v') === String(i)) return nodes[j];
    }
    return null;
  }

  function floatScore(el, text, kind) {
    if (!el) return;
    var s = document.createElement('span');
    s.className = 'wg-float' + (kind ? ' wg-float-' + kind : '');
    s.innerHTML = text;
    el.appendChild(s);
    setTimeout(function () { try { el.removeChild(s); } catch (e) {} }, 750);
  }

  // ------------------------------------------------------------------ 流程
  function startRound() {
    ensureDay();
    if (!G.info) G.info = todayInfo();
    G.allowanceMs = grantSec(G.info) * 1000;
    if (leftMs() < 10000) { G.phase = 'finish'; paint(); return; }
    if (!G.pool.all.length) G.pool = buildPool(G.info);
    G.roundNo += 1;
    G.roundMs = Math.min(ROUND_MS, leftMs());
    G.roundEndAt = Date.now() + G.roundMs;
    G.score = 0; G.combo = 0; G.maxCombo = 0; G.correct = 0; G.starHit = 0;
    G.locked = false; G.started = true;
    G.q = makeQuestion();
    G.phase = 'playing';
    paint();
    clearInterval(G.timer);
    var self = setInterval(function () {
      if (G.phase !== 'playing') { clearInterval(self); return; }
      if (Date.now() >= G.roundEndAt) { endRound('time'); return; }
      paintClock();
    }, 100);
    G.timer = self;
  }

  function pickOption(i) {
    if (G.phase !== 'playing' || G.locked || !G.q) return;
    var o = G.q.options[i];
    if (!o || o.used) return;
    var el = optEl(i);
    if (o.correct) {
      G.locked = true;
      G.combo += 1;
      if (G.combo > G.maxCombo) G.maxCombo = G.combo;
      G.correct += 1;
      var isStar = !!G.q.star;
      var gain = CFG.baseScore + Math.min(CFG.comboCap, (G.combo - 1) * CFG.comboStep);
      if (isStar) { gain += CFG.starBonus; G.starHit += 1; beep('star'); }
      else beep('good');
      G.score += gain;
      if (el) el.className += ' wg-opt-correct';
      floatScore(el, '+' + gain + (isStar ? ' ⭐' : ''), isStar ? 'star' : '');
      updateHud();
      setTimeout(function () {
        if (G.phase !== 'playing') return;
        G.q = makeQuestion();
        G.locked = false;
        paint();
      }, isStar ? 430 : 330);
    } else {
      o.used = true;
      G.combo = 0;
      beep('bad');
      if (el) el.className += ' wg-opt-wrong';
      floatScore(el, '连击断啦', 'bad');
      updateHud();
    }
  }

  /** 轮末结算：本轮分 → 累计总账；每轮都调一次，不重复入账 */
  function endRound(reason) {
    if (G.phase !== 'playing') return;
    clearInterval(G.timer); G.timer = null;
    var elapsed = reason === 'time'
      ? G.roundMs
      : clamp(G.roundMs - Math.max(0, G.roundEndAt - Date.now()), 0, G.roundMs);
    S.usedMs = Math.min(G.allowanceMs, S.usedMs + Math.max(elapsed, 0));
    var bonus = G.correct * 2 + G.maxCombo * 3 + (G.maxCombo >= 5 ? 20 : 0) + G.starHit * 5;
    var score = G.score + bonus;
    S.total += score;
    S.todayScore += score;
    S.rounds += 1;
    if (score > S.best) S.best = score;
    S.history.unshift({ d: todayStr(), n: G.roundNo, s: score, c: G.correct, combo: G.maxCombo });
    if (S.history.length > 8) S.history = S.history.slice(0, 8);
    persist();
    G.last = { score: score, bonus: bonus, correct: G.correct, combo: G.maxCombo, star: G.starHit };
    G.phase = leftMs() >= 10000 ? 'round' : 'finish';
    G.locked = false;
    paint();
  }

  function handle(act, val) {
    if (act === 'start' || act === 'next') { G.info = todayInfo(); startRound(); }
    else if (act === 'opt') pickOption(parseInt(val, 10));
    else if (act === 'end') endRound('manual');
    else if (act === 'lobby') { if (G.phase === 'playing') endRound('leave'); else { G.phase = 'lobby'; paint(); } }
    else if (act === 'mute') { S.muted = !S.muted; persist(); paint(); }
    else if (act === 'gotoday') {
      if (G.phase === 'playing') endRound('leave');
      try { window.App.switchTab('today'); } catch (e) {}
    }
  }

  // 全局事件委托：app.js 会反复重建 content-area，绑在 document 上才不会掉。
  // 手写向上遍历（不用 closest），老华为浏览器 / 平板自带浏览器都稳。
  function findAct(node) {
    while (node && node !== document) {
      if (node.getAttribute && node.getAttribute('data-wg')) return node;
      node = node.parentNode;
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var node = findAct(e.target || e.srcElement);
    if (!node) return;
    handle(node.getAttribute('data-wg'), node.getAttribute('data-wg-v'));
  }, false);
  // 刷新 / 切后台前把正在进行的这一轮入账，分数一笔不丢
  window.addEventListener('pagehide', function () { if (G.phase === 'playing') endRound('leave'); }, false);

  // ------------------------------------------------------------------ 对外
  var WordGame = {
    /** app.js 把这段塞进 content-area */
    render: function () {
      ensureDay();
      if (!G.html) G.html = view();
      return '<div id="wg-root" class="wg-root">' + G.html + '</div>';
    },
    /** 每次 renderContent 之后调；只在必要时刷新大厅 / 补时钟 */
    mount: function () {
      ensureDay();
      var root = document.getElementById('wg-root');
      if (!root) return;
      if (G.phase === 'lobby') { G.info = todayInfo(); paint(); }
      else if (G.phase === 'playing') paintClock();
      else if (!root.innerHTML) paint();
    },
    /** 切走页签：正在玩就立刻结算这一轮 */
    onLeave: function () {
      if (G.phase === 'playing') endRound('leave');
    },
    rule: rule,
    grantSec: grantSec,
    levelOf: levelOf,
    todayInfo: todayInfo,
    total: function () { return S.total; },
    config: function () { return CFG; },
    // 校验脚本用的内部把手
    _test: {
      makeQuestion: makeQuestion,
      buildPool: buildPool,
      endRound: endRound,
      startRound: startRound,
      state: G,
      save: function () { return S; },
      reset: function () { S = defSave(); persist(); }
    }
  };
  window.WordGame = WordGame;
})();
