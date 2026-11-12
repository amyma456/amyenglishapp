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
    reviewMin: 0.35, reviewPerWrong: 0.05, reviewMax: 0.80,
    // ---- v196 · 防乱点：想好了再点，连续点对才高分 --------------------
    // 家长 2026-11-12：「玩游戏点单词不能乱点，要想一下才能点，就是连续
    //   点出正确答案，这种得分上面受影响。」
    // 以前四个选项点错只变灰、还能接着蒙，最坏 4 次必中；秒点也拿满分。
    // 现在一题只有一次机会，且出题后先给一段「看题时间」。
    thinkMs: 700,            // 出题后这段时间内点了不算，先看清单词
    rushMs: 1300,            // 出题后 1.3 秒内点 = 抢点，低分 + 连击冻结
    rushScore: 4,            // 抢点答对只拿 4 分（稳稳点对是 10 分起）
    wrongPauseMs: 900,       // 点错后亮出正确答案、停留一下再换题
    tapGapMs: 380,           // 两次点击间隔小于此值，后一次直接忽略
    chainFrom: 3,            // 连续稳稳点对 3 题起，每题再加
    chainBonus: 5,
    missPenalty: 0.15,       // 每点错 1 次，轮末补给少发 15%
    rushPenalty: 0.08,       // 每抢点 1 次，轮末补给少发 8%
    penaltyCap: 0.60         // 最多扣 60%，不把孩子扣到 0 分劝退
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
    var info = { wrong: 0, done: false, teacher: false, dayIdx: 0, ckAt: '' };
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
      // ② 打卡记录里的错题数。v200：老师电脑端的打卡监控读的是后台确认过的
      // cloudCheckins（App._clsCk）；游戏页以前只看本机那份，孩子换手机、
      // 老师代录之后就一直显示「还没打卡」、只给 30 秒试玩，跟电脑端对不上。
      // 本机 + 云端两份都取，谁更完整听谁的。
      var takeCk = function (ck) {
        if (!ck) return;
        if (ck.done) info.done = true;
        var w = Number(ck.wrongCount) || 0;
        if (w > info.wrong) info.wrong = w;
        if (ck.time || ck.at) info.ckAt = String(ck.time || ck.at || '');
      };
      takeCk((st.checkins || {})[sid + tag + '_d' + info.dayIdx]);
      try { if (App._clsCk) takeCk(App._clsCk(sid, info.dayIdx)); } catch (e) {}
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
    qShownAt: 0,         // 这一题出现的时间（思考闸门 / 抢点判定都看它）
    answered: false,     // 一题只能答一次，点过就不再受理
    score: 0,            // 本轮已得分
    combo: 0,
    maxCombo: 0,
    correct: 0,
    starHit: 0,
    misses: 0,           // 本轮点错次数
    rush: 0,             // 本轮「没想好就点」次数
    lastTapAt: 0,        // 连点保护
    hint: '', hintUntil: 0,
    locked: false,
    last: null,          // 上一轮结算
    started: false
  };

  // ====================================================================
  // v195 · 星际基地（家长：「多设置一些像基地这样有趣的话」）
  // --------------------------------------------------------------------
  // 基地不是换个标题就完事：积分攒到一定程度，基地真的会「升级」，
  // 每轮出发 / 返航 / 连击 / 里程碑都有专属播报，孩子是在经营一个地方，
  // 而不是在刷一张分数表。文案集中放在这里，以后想加梗只改数组。
  // ====================================================================
  var BASES = [
    { min: 0,    name: '临时营地',   icon: '⛺', line: '帐篷刚搭好，先攒第一批能量吧！' },
    { min: 150,  name: '补给小站',   icon: '🔋', line: '补给灯亮了，基地开始运转。' },
    { min: 400,  name: '能量基地',   icon: '🛰️', line: '天线展开，全班都能收到你的信号！' },
    { min: 900,  name: '星际空间港', icon: '🌌', line: '飞船进出港，指挥官请就位。' },
    { min: 1800, name: '银河总部',   icon: '🏰', line: '总部落成，这里是全班的能量中心！' },
    { min: 3200, name: '星河灯塔',   icon: '✨', line: '灯塔点亮，后来的小宇航员都看着你呢。' }
  ];
  var START_CALLS = [
    '🚀 舱门打开，出发收集能量！',
    '🛰️ 基地呼叫：这一轮把单词都带回来。',
    '🌠 推进器预热完毕，单词星球见！',
    '🔭 雷达扫描中，今天错过的词优先回收。',
    '⚡ 能量舱空着呢，快去装满它！',
    '👨‍🚀 指挥官请系好安全带，出发！',
    '🪐 目标锁定，碰到星星题记得抓牢。',
    '📡 基地已连线，这一轮全班都看得见。'
  ];
  var CHEERS = [
    '🎉 能量包已入舱，基地亮了一格！',
    '🌟 收获满满，补给站给你记了一笔。',
    '🛰️ 信号清晰，这一轮收得漂亮！',
    '⚡ 电池充满一格，继续冲呀！',
    '🏅 基地播报：这位指挥官手感很稳。',
    '🚀 返航成功，下一轮可以再快一点。',
    '💫 星星都被你收进能量舱啦。',
    '🔋 今日配额又少一格，分数可一点没少。'
  ];
  var COMBO_CALLS = [
    { at: 3,  text: '🔥 连击 ×3 · 基地天线亮了！' },
    { at: 5,  text: '⚡ 连击 ×5 · 能量舱开始超载！' },
    { at: 8,  text: '🌠 连击 ×8 · 指挥部全体起立！' },
    { at: 12, text: '👑 连击 ×12 · 银河总部发来贺电！' },
    { at: 16, text: '🪐 连击 ×16 · 这已经不是运气了！' }
  ];
  var BASE_LINES = [
    '基地守则第一条：点错不扣分，别怕，继续点。',
    '今天错过的单词，基地会优先派给你练。',
    '少错一道题，明天就多 12 秒配额。',
    '每一轮都单独结算，分数一直攒着不清零。',
    '全班同学都在排行榜上，看看今天谁冲得最靠前。',
    '金色星星题是基地空投，接住就多 30 分。',
    '连击越高，补给站给的奖励越多。',
    '音效觉得吵？大厅最下面一按就关。'
  ];
  var MILESTONES = [
    { at: 100,  text: '🎖️ 累计破 100 分，基地给你发了第一枚勋章！' },
    { at: 400,  text: '🛰️ 累计破 400 分，能量基地正式启用！' },
    { at: 900,  text: '🌌 累计破 900 分，星际空间港开放！' },
    { at: 1800, text: '🏰 累计破 1800 分，银河总部落成！' },
    { at: 3200, text: '✨ 累计破 3200 分，星河灯塔为你点亮！' }
  ];

  function baseOf(total) {
    var b = BASES[0], next = null, i;
    for (i = 0; i < BASES.length; i++) {
      if (total >= BASES[i].min) b = BASES[i];
      else { next = BASES[i]; break; }
    }
    return { name: b.name, icon: b.icon, line: b.line,
             next: next ? next.min - total : 0, nextName: next ? next.name : '' };
  }
  function callOf(arr) { return pick(arr) || ''; }
  function comboCall(n) {
    var out = '', i;
    for (i = 0; i < COMBO_CALLS.length; i++) if (n >= COMBO_CALLS[i].at) out = COMBO_CALLS[i].text;
    return out;
  }
  function milestoneOf(total) {
    var out = '', i;
    for (i = 0; i < MILESTONES.length; i++) if (total >= MILESTONES[i].at) out = MILESTONES[i].text;
    return out;
  }
  function hhmm(ts) {
    var d = new Date(ts);
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  // ====================================================================
  // v195 · 全班实时积分榜（家长：「每个学生的积分是透明的」「就跟打卡
  //   同步一样，每台手机看到的都是同一个排名，不是这个手机有那个没有」）
  // --------------------------------------------------------------------
  // 唯一真相在后台 D1。本机只放「还没报上去的那一轮」，断网先排队，
  // 联网/回前台/每 15 秒自动补发 + 重新拉榜。上报的是增量，云端做加法，
  // 换手机、两台设备同时玩都不会互相覆盖。
  // ====================================================================
  var SYNC_KEY = 'amy_wordgame_sync_v1';
  var Q = [];
  var BOARD = { rows: [], at: 0, day: '', loading: false };
  var syncing = false, boardTimer = null, ckTimer = null;

  function boardNameKey(name) {
    return String(name || '').toLowerCase().replace(/[\s\u3000]+/g, '');
  }
  function hasScore(r) {
    return (Number(r && r.total) || 0) > 0 || (Number(r && r.rounds) || 0) > 0;
  }
  /**
   * v200：同一个孩子在报名 / 换手机时可能留下好几个编号，云端给的原始榜里
   * 就会一行变两行（老师看到 14 人，其实班里只有 9 个孩子）。按姓名合并成
   * 一人，几个账号攒的分全部加起来，一分不丢。服务端也做同样的合并，这里
   * 再兜一层：老手机拿到的还是旧接口数据时也不会显示重复。
   */
  function normalizeBoardRows(input) {
    var arr = Array.isArray(input) ? input.slice(0, 300) : [];
    var raw = [], i, r;
    for (i = 0; i < arr.length; i++) {
      r = arr[i] || {};
      raw.push({
        student_id: String(r.student_id || ''),
        student_name: String(r.student_name || ''),
        student_class: String(r.student_class || ''),
        total: Math.max(0, Number(r.total) || 0),
        best: Math.max(0, Number(r.best) || 0),
        rounds: Math.max(0, Number(r.rounds) || 0),
        today_score: Math.max(0, Number(r.today_score) || 0),
        updated_at: String(r.updated_at || ''),
        played: r.played === true || (Number(r.rounds) || 0) > 0 || (Number(r.total) || 0) > 0
      });
    }
    // 有分的账号排前面，合并后留下的是它，孩子按编号认领自己才不会认错行。
    raw.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      return a.student_id < b.student_id ? -1 : (a.student_id > b.student_id ? 1 : 0);
    });
    var byName = Object.create(null), out = [];
    for (i = 0; i < raw.length; i++) {
      r = raw[i];
      var key = boardNameKey(r.student_name);
      if (!key) { out.push(r); continue; }
      var prev = byName[key];
      if (!prev) { byName[key] = r; out.push(r); continue; }
      prev.total += r.total;
      prev.best = Math.max(prev.best, r.best);
      prev.rounds += r.rounds;
      prev.today_score += r.today_score;
      prev.played = prev.played || r.played;
      if (r.updated_at > prev.updated_at) prev.updated_at = r.updated_at;
      if (r.student_name.length > prev.student_name.length) prev.student_name = r.student_name;
    }
    out.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      if (!!a.updated_at !== !!b.updated_at) return a.updated_at ? -1 : 1;
      if (a.updated_at !== b.updated_at) return a.updated_at < b.updated_at ? -1 : 1;
      return a.student_name < b.student_name ? -1 : (a.student_name > b.student_name ? 1 : 0);
    });
    return out;
  }

  function loadQ() {
    try {
      var raw = window.localStorage.getItem(SYNC_KEY);
      var o = raw ? JSON.parse(raw) : null;
      Q = (o && o.length && o.length === +o.length) ? o : [];
    } catch (e) { Q = []; }
  }
  function saveQ() {
    try { window.localStorage.setItem(SYNC_KEY, JSON.stringify(Q.slice(-80))); } catch (e) {}
  }
  loadQ();

  /** 我是谁。老师试玩不进榜，但照样能看全班榜。 */
  function myIdentity() {
    try {
      var Ap = window.App;
      if (!Ap || (Ap.isTeacher && Ap.isTeacher())) return null;
      var st = Ap.state || {};
      var sid = Ap._myStudentId ? Ap._myStudentId() : (st.phone || '');
      if (!sid) return null;
      var who = Ap._myWho ? Ap._myWho() : {};
      return {
        student_id: String(sid).slice(0, 80),
        student_name: String(who.name || st.userName || '').slice(0, 60),
        student_class: String(who.klass || st.className || '').slice(0, 60)
      };
    } catch (e) { return null; }
  }

  /**
   * v197：本机同步到的本班名册。交给后台存一份共享名单，榜上就每个人
   * 都有一行 —— 玩过没玩过都出现，没玩的是 0 分。
   * 只收「分过班」的学生，跟打卡监控同一口径，测试号不进榜。
   */
  function classRoster() {
    var out = { klass: '', students: [], authoritative: false };
    try {
      var Ap = window.App;
      if (!Ap) return out;
      var st = Ap.state || {};
      var all = st.students || [];
      var me = myIdentity();
      out.klass = me ? me.student_class : String(st.className || '');
      out.authoritative = !!(Ap.isTeacher && Ap.isTeacher());
      // v200：老师端 myIdentity() 是 null，st.className 有时也是空的。空班级
      // 去后台读榜会把所有班的孩子混在一起，跟电脑端看到的不一样。从名册里
      // 取人数最多的那个班，老师手机上就是自己的班。
      if (!out.klass) {
        var cnt = Object.create(null), best = '', bestN = 0, k, ss, c;
        for (k = 0; k < all.length; k++) {
          ss = all[k];
          if (!ss || !ss.class || ss.approved === false) continue;
          c = String(ss.class);
          cnt[c] = (cnt[c] || 0) + 1;
          if (cnt[c] > bestN) { bestN = cnt[c]; best = c; }
        }
        out.klass = best;
      }
      var pick = function (useCls) {
        var a = [], i, s;
        for (i = 0; i < all.length; i++) {
          s = all[i];
          if (!s || !s.id || !s.class || s.approved === false) continue;
          if (useCls && out.klass && s.class !== out.klass) continue;
          a.push({ id: String(s.id).slice(0, 80),
                   name: String(s.name || '').slice(0, 60),
                   class: String(s.class).slice(0, 60) });
        }
        return a;
      };
      out.students = pick(true);
      if (!out.students.length && out.klass) out.students = pick(false);
      // 名册还没同步下来 / 自己用的是临时编号时，别让自己从榜上消失。
      if (me && me.student_id) {
        var hasMe = false, j, nm = String(me.student_name || '').toLowerCase();
        for (j = 0; j < out.students.length; j++) {
          if (out.students[j].id === me.student_id ||
              (nm && String(out.students[j].name || '').toLowerCase() === nm)) hasMe = true;
        }
        if (!hasMe) out.students.push({ id: me.student_id, name: me.student_name,
                                        class: me.student_class });
      }
      out.students = out.students.slice(0, 300);
    } catch (e) {}
    return out;
  }

  function queueScore(score) {
    var info = G.info || todayInfo();
    if (info.teacher) return;              // 老师试玩不占全班名次
    Q.push({ delta: score, best: S.best, rounds: 1,
             day: todayStr(), today_delta: score, ts: Date.now() });
    if (Q.length > 80) Q = Q.slice(-80);
    saveQ();
    flushScores();
  }

  function flushScores() {
    if (syncing || !Q.length) return;
    var me = myIdentity();
    if (!me || !window.Api || !window.Api.reportGameScore) return;
    syncing = true;
    var batch = Q.slice(0, 20), i, it;
    var delta = 0, best = 0, rounds = 0, today = 0, day = '';
    for (i = 0; i < batch.length; i++) {
      it = batch[i];
      delta += Math.max(0, Number(it.delta) || 0);
      rounds += Math.max(0, Number(it.rounds) || 0);
      today += Math.max(0, Number(it.today_delta) || 0);
      best = Math.max(best, Number(it.best) || 0);
      if (String(it.day || '') > day) day = String(it.day || '').slice(0, 10);
    }
    var payload = {
      student_id: me.student_id, student_name: me.student_name,
      student_class: me.student_class,
      delta: delta, best: best, rounds: rounds,
      today_delta: today, day: day || todayStr()
    };
    var done = function (ok) {
      syncing = false;
      if (!ok) return;                    // 断网就留着，下次自动补
      Q = Q.slice(batch.length);
      saveQ();
      pullScores();                      // 自己的分刚进后台，立刻刷新榜
      if (Q.length) setTimeout(flushScores, 400);
    };
    try {
      var p = window.Api.reportGameScore(payload);
      if (p && p.then) p.then(done, function () { done(false); });
      else done(!!p);
    } catch (e) { done(false); }
  }

  function pullScores() {
    if (BOARD.loading || !window.Api || !window.Api.fetchGameScores) return;
    BOARD.loading = true;
    var done = function (d) {
      BOARD.loading = false;
      if (!d) return;                    // 断网保留上一份榜，不闪成空
      BOARD.rows = normalizeBoardRows(d.rows || []);   // v200：同名只留一人
      BOARD.day = d.server_day || '';
      BOARD.at = Date.now();
      // 正在答题时绝不重画 —— 会把题目和连击打断
      if (G.phase !== 'playing' && document.getElementById('wg-root')) paint();
    };
    try {
      var p = window.Api.fetchGameScores(classRoster());
      if (p && p.then) p.then(done, function () { done(null); });
      else done(p);
    } catch (e) { done(null); }
  }

  /** v200：进游戏页 / 每 60 秒拉一次后台打卡，跟打卡监控始终同一份数据。 */
  function pullCheckins() {
    var Ap = window.App;
    if (!Ap || !Ap._pullCloudCheckins) return;
    try {
      var p = Ap._pullCloudCheckins('class');
      if (p && p.then) p.then(function (n) {
        if (!n || G.phase === 'playing') return;   // 答题中绝不打断
        G.info = todayInfo();                      // 时长按最新打卡 / 错题数重算
        if (document.getElementById('wg-root')) paint();
      }, function () {});
    } catch (e) {}
  }
  function startCheckinSync() {
    if (ckTimer) return;
    ckTimer = setInterval(function () {
      if (typeof document.visibilityState !== 'undefined' &&
          document.visibilityState !== 'visible') return;
      if (!document.getElementById('wg-root')) return;
      pullCheckins();
    }, 60000);
  }

  function startBoardSync() {
    if (boardTimer) return;
    boardTimer = setInterval(function () {
      if (typeof document.visibilityState !== 'undefined' &&
          document.visibilityState !== 'visible') return;
      if (!document.getElementById('wg-root')) return;   // 不在游戏页不耗流量
      flushScores();
      pullScores();
    }, 10000);                            // v197：10 秒一拉，同学刚玩完马上能看到
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (!document.getElementById('wg-root')) return;
    flushScores();
    pullScores();
    pullCheckins();
  }, false);
  window.addEventListener('pagehide', function () { flushScores(); }, false);

  function myRank() {
    var me = myIdentity(), rows = BOARD.rows || [], i;
    if (!me) return { rank: 0, total: rows.length, row: null };
    for (i = 0; i < rows.length; i++) {
      if (rows[i].student_id === me.student_id) {
        // v200：0 分不该因为"名字排得靠前"就被算成第 1 名。
        return { rank: hasScore(rows[i]) ? i + 1 : 0, total: rows.length, row: rows[i] };
      }
    }
    // 换过设备 / 名册里用的是另一个编号时，按姓名认领（只在唯一命中时认，
    // 免得把同名或半截名的同学张冠李戴）。
    var norm = function (s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); };
    var mine = norm(me.student_name), hit = -1, hits = 0;
    if (mine) {
      for (i = 0; i < rows.length; i++) {
        var n = norm(rows[i].student_name);
        if (n && (n === mine || n.indexOf(mine) >= 0 || mine.indexOf(n) >= 0)) {
          hits++; hit = i;
        }
      }
      if (hits === 1) return { rank: hasScore(rows[hit]) ? hit + 1 : 0,
                              total: rows.length, row: rows[hit] };
    }
    return { rank: 0, total: rows.length, row: null };
  }

  /** v200：本班名单，同名只留一人（跟榜单同一口径），并带上他所有的编号。 */
  function ckRoster() {
    var Ap = window.App, out = [], seen = Object.create(null);
    if (!Ap || !Ap.state) return out;
    var klass = classRoster().klass, all = Ap.state.students || [], i, s;
    for (i = 0; i < all.length; i++) {
      s = all[i];
      if (!s || !s.id || !s.class || s.approved === false) continue;
      if (klass && String(s.class) !== klass) continue;
      var key = boardNameKey(s.name);
      if (!key) continue;
      var hit = seen[key];
      if (hit) { hit.ids.push(String(s.id)); continue; }
      var row = { name: String(s.name || ''), ids: [String(s.id)] };
      seen[key] = row; out.push(row);
    }
    return out;
  }
  /** 多个编号里取最完整的那条后台打卡记录（跟打卡监控的 _clsCk 同源）。 */
  function ckRecordOf(ids, di) {
    var Ap = window.App, best = null, i, rec;
    if (!Ap || !Ap._clsCk) return null;
    for (i = 0; i < ids.length; i++) {
      rec = null;
      try { rec = Ap._clsCk(ids[i], di); } catch (e) {}
      if (!rec) continue;
      if (!best || (!!rec.done && !best.done) ||
          (Number(rec.answered) || 0) > (Number(best.answered) || 0)) best = rec;
    }
    return best;
  }
  /**
   * v202：老师「答错了几题一个栏、得了多少分一个栏，融合到同一个状态栏，
   * 按排名第一到第九的顺序来排列」。云端积分榜只有分数，后台打卡才有错题数，
   * 这里按规范化姓名把两份数据挂到同一行上 —— 老师端「游戏试玩」和学生端
   * 「单词乐园」用的是同一份数据，看到的是同一张按名次排好的全班状态榜。
   */
  function ckBoardMap(di) {
    var map = Object.create(null), list = ckRoster(), i, it, rec;
    for (i = 0; i < list.length; i++) {
      it = list[i];
      rec = ckRecordOf(it.ids, di);
      map[boardNameKey(it.name)] = {
        name: it.name,
        rec: rec || null,
        done: !!(rec && rec.done),
        // 没有打卡记录时留 null，不假装成「错 0 道」
        wrong: rec ? (Number(rec.wrongCount) || 0) : null,
        answered: rec ? (Number(rec.answered) || 0) : 0,
        total: rec ? (Number(rec.total) || 0) : 0
      };
    }
    return map;
  }
  /** 融合榜数据 = 云端积分榜 ∪ 本班打卡名册，按第 1~N 名排好。 */
  function mergedBoardRows(di) {
    var rows = [], i, k, o, src = BOARD.rows || [];
    for (i = 0; i < src.length; i++) {
      o = {};
      for (k in src[i]) if (Object.prototype.hasOwnProperty.call(src[i], k)) o[k] = src[i][k];
      rows.push(o);
    }
    var map = ckBoardMap(di), seen = Object.create(null), list = ckRoster();
    for (i = 0; i < rows.length; i++) {
      rows[i]._ck = map[boardNameKey(rows[i].student_name)] || null;
      seen[boardNameKey(rows[i].student_name)] = 1;
    }
    // 云端还没连上时，本班名册也要一行不少（0 分 / 未打卡），照样按名次列出来。
    for (i = 0; i < list.length; i++) {
      var key = boardNameKey(list[i].name);
      if (!key || seen[key]) continue;
      seen[key] = 1;
      rows.push({
        student_id: list[i].ids[0] || '', student_name: list[i].name,
        student_class: '', total: 0, best: 0, rounds: 0, today_score: 0,
        updated_at: '', played: false, _ck: map[key] || null
      });
    }
    // 有分的按分数降序在前，没分的按姓名排后面 —— 列表顺序就是第 1~N 名。
    rows.sort(function (a, b) {
      var sa = hasScore(a) ? 1 : 0, sb = hasScore(b) ? 1 : 0;
      if (sa !== sb) return sb - sa;
      if (b.total !== a.total) return b.total - a.total;
      return a.student_name < b.student_name ? -1 : (a.student_name > b.student_name ? 1 : 0);
    });
    return rows;
  }
  /** 打卡栏已并入全班状态榜；保留这个函数名给旧调用与旧校验。 */
  function checkinCardHtml() {
    return boardHtml();
  }

  /**
   * v202：一个孩子 = 一条状态栏。左边名次、中间姓名+状态条、右边分数，
   * 分数 / 错题数 / 打卡状态 / 今日加分都在这同一条里，分门别类列清楚，
   * 不再上下两张卡各说一半。
   */
  function boardRow(r, i, isMe) {
    // v200：0 分、没玩过的人不再占前三名，也不给奖牌 —— 老师原话
    //「置顶一二三名，分数仍然显示是零分」。名次只发给真正出击过的人。
    var scored = hasScore(r);
    var medal = !scored ? '·' :
      (i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : ('#' + (i + 1)))));
    var ck = r._ck || null, rec = ck && ck.rec;
    var lv = levelOf(Number(r.total) || 0);
    var bits = [];
    bits.push('<span class="wg-st-wrong">' + (ck && ck.wrong !== null
      ? '错 <b>' + ck.wrong + '</b> 道' : '错题待同步') + '</span>');
    if (ck && ck.done) {
      bits.push('<span class="wg-st-ck wg-st-done">✅ 已打卡</span>');
    } else if (rec && (Number(rec.answered) || 0) > 0) {
      bits.push('<span class="wg-st-ck wg-st-partial">◐ 答了 ' +
        (Number(rec.answered) || 0) + '/' + (Number(rec.total) || 0) + ' 题</span>');
    } else {
      bits.push('<span class="wg-st-ck wg-st-wait">⏳ 还没打卡</span>');
    }
    if (scored && (Number(r.today_score) || 0) > 0) {
      bits.push('<span class="wg-st-today">今日 +' + (Number(r.today_score) || 0) + '</span>');
    }
    return '<div class="wg-board-row wg-ck-row' + (isMe ? ' wg-board-me' : '') +
      (scored ? '' : ' wg-board-idle') + (ck && ck.done ? ' is-done' : '') + '">' +
      '<span class="wg-rank' + (scored ? '' : ' wg-rank-none') + '">' + medal + '</span>' +
      '<div class="wg-board-main">' +
        '<div class="wg-board-line"><span class="wg-board-name">' +
          esc(r.student_name || '小指挥官') + (isMe ? '<em>我</em>' : '') + '</span>' +
          '<span class="wg-st-pos">' + (scored ? '第 ' + (i + 1) + ' 名' : '还没出击') +
          '</span></div>' +
        '<div class="wg-status">' + bits.join('<i>·</i>') + '</div>' +
      '</div>' +
      '<span class="wg-board-lv">' + lv.icon + '</span>' +
      '<span class="wg-board-score"><b>' + (Number(r.total) || 0) + '</b> 分</span>' +
    '</div>';
  }

  /** 基地状态卡：建筑会随累计积分升级 */
  function baseCardHtml() {
    var b = baseOf(S.total);
    var prev = 0, i;
    for (i = 0; i < BASES.length; i++) if (BASES[i].min <= S.total) prev = BASES[i].min;
    var nextMin = S.total + (b.next || 1);
    var pct = b.next > 0
      ? clamp(Math.round((S.total - prev) / Math.max(1, nextMin - prev) * 100), 3, 100)
      : 100;
    var h = '<div class="wg-card wg-base-card">';
    h += '<div class="wg-card-hd"><span>🛰️ 我的星际基地</span><span class="wg-pill wg-pill-base">' +
      b.icon + ' ' + esc(b.name) + '</span></div>';
    h += '<div class="wg-base-ic">' + b.icon + '</div>';
    h += '<div class="wg-base-line">' + esc(b.line) + '</div>';
    h += '<div class="wg-track"><div class="wg-track-in" style="width:' + pct + '%"></div></div>';
    h += '<div class="wg-note">' + (b.next > 0
      ? '再攒 <b>' + b.next + '</b> 分，基地升级成「' + esc(b.nextName) + '」'
      : '基地已经升到顶啦，你就是这里的总指挥 👑') + '</div>';
    var ms = milestoneOf(S.total);
    if (ms) h += '<div class="wg-base-ms">' + esc(ms) + '</div>';
    h += '<div class="wg-base-tip">📻 基地播报：' + esc(callOf(BASE_LINES)) + '</div>';
    h += '</div>';
    return h;
  }

  /**
   * v202：全班状态榜 —— 原来的「今日打卡记录」和「基地排行榜」合成这一张。
   * 按第 1 到第 N 名顺序，一个孩子一条状态栏，分数、错题数、打卡状态
   * 都在同一行里；玩没玩都出现，自己的那一行永远高亮。
   */
  function boardHtml() {
    var Ap = window.App;
    var di = (Ap && Ap.getTodayWeekdayIdx) ? Ap.getTodayWeekdayIdx() : 0;
    var rows = mergedBoardRows(di);
    var rk = myRank();
    var h = '<div class="wg-card wg-board wg-ck-card">';
    h += '<div class="wg-card-hd"><span>🏆 全班状态榜 · 分数 / 错题 / 打卡</span>' +
      '<span class="wg-pill">' + (rows.length ? rows.length + ' 位指挥官' : '连线中') +
      '</span></div>';
    h += '<div class="wg-board-hint">📋 今日打卡记录 · 🕒 ' +
      (BOARD.at ? '刚更新 ' + hhmm(BOARD.at) : '正在更新') +
      ' · 按第 1 到第 ' + (rows.length || 9) + ' 名顺序排列</div>';
    if (!rows.length) {
      h += '<div class="wg-board-empty">基地正在连线，马上就能看到全班同学啦。</div>';
    } else {
      var i, me = myIdentity(), done = 0, top = null;
      // v201：老师「现在没有任何排名信息」—— 第一名单独摆一行；只有真有分的
      // 人才拿第一名，全班都没分时也把话说清楚，不留下「榜是不是坏了」的疑问。
      for (i = 0; i < rows.length; i++) {
        if (rows[i]._ck && rows[i]._ck.done) done++;
        if (!top && hasScore(rows[i])) top = rows[i];
      }
      if (top) {
        h += '<div class="wg-leader">🥇 第 1 名 <b>' + esc(top.student_name) +
          '</b> · <b>' + (Number(top.total) || 0) + '</b> 分</div>';
      } else {
        h += '<div class="wg-leader wg-leader-empty">🏅 今天还没有人出击，第一名虚位以待</div>';
      }
      h += '<div class="wg-ck-group">✅ 已打卡 ' + done + ' 人</div>';
      h += '<div class="wg-ck-group wg-ck-group-wait">⏳ 还没打卡 ' +
        (rows.length - done) + ' 人</div>';
      // v197：不再只显示前 8 名。0 分、从没玩过的同学也是全班的一员，
      // 必须一行不少地列出来，否则等于「没玩就不出现」。
      h += '<div class="wg-board-scroll">';
      var meName = me ? boardNameKey(me.student_name) : '';
      for (i = 0; i < rows.length; i++) {
        // v200：自己 0 分时 rank 是 0，但那一行照样要高亮，别让孩子找不到自己。
        var mine = (rk.row === rows[i]) ||
          (!!me && rows[i].student_id === me.student_id) ||
          (!!meName && boardNameKey(rows[i].student_name) === meName);
        h += boardRow(rows[i], i, !!mine);
      }
      h += '</div>';
      h += '<div class="wg-ck-foot">今日已打卡 <b>' + done + '</b> / ' +
        rows.length + ' 人</div>';
      h += '<div class="wg-board-foot">' + (rk.rank > 0
        ? '你目前第 <b>' + rk.rank + '</b> 名 / 共 ' + rows.length +
          ' 人 · 再冲一轮就往上挪'
        : '全班 ' + rows.length + ' 位指挥官都在榜上，玩一轮就有自己的名次 🚀') + '</div>';
    }
    h += '</div>';
    return h;
  }

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
    h += '<div><div class="wg-title">单词星球 · 星际基地</div>';
    h += '<div class="wg-sub">' + esc(callOf(START_CALLS)) + '</div></div>';
    h += '</div>';
    // 一进游戏就能看见自己的名次 —— 家长要的「积分透明」不用往下翻。
    var rk = myRank();
    h += '<div class="wg-rank-strip">' + (rk.rank > 0
      ? '🏆 全班实时第 <b>' + rk.rank + '</b> 名 / 共 ' + rk.total +
        ' 人 · 累计 <b>' + (Number(rk.row && rk.row.total) || S.total) + '</b> 分'
      : '🏆 全班实时排名 · 全班同学都在榜上') + '</div>';

    // 时长规则卡：把「错得少玩得久」摆在明面上
    h += '<div class="wg-card wg-time-card">';
    h += '<div class="wg-card-hd"><span>⏱️ 基地今日配额</span><span class="wg-pill">' +
      (info.teacher ? '老师试玩' : (info.done ? '今日作业已打卡' : '还没打卡')) + '</span></div>';
    if (info.teacher) {
      h += '<div class="wg-big-time">' + fmt(MAX_SEC * 1000) +
        '</div><div class="wg-note">老师试玩按满额 ' + fmt(MAX_SEC * 1000) + ' 计算。</div>';
    } else if (!info.done) {
      h += '<div class="wg-big-time">' + fmt(TRIAL_SEC * 1000) + '</div>';
      h += '<div class="wg-note">今日作业还没打卡，先去完成，基地就按错题数发放最多 ' +
        fmt(MAX_SEC * 1000) + ' 的正式时长。</div>';
      h += '<button class="wg-btn wg-btn-ghost" data-wg="gotoday">📝 去完成今日作业</button>';
    } else {
      h += '<div class="wg-time-row"><span>今日错题 <b>' + info.wrong + '</b> 道</span>' +
           '<span>每少错 1 道多 ' + LOSS_PER_WRONG + ' 秒</span></div>';
      h += '<div class="wg-big-time">' + fmt(full) + '</div>';
      h += '<div class="wg-track"><div class="wg-track-in" style="width:' + pct + '%"></div></div>';
      h += '<div class="wg-note">' + (info.wrong === 0
          ? '全部答对，基地今天开满 ' + fmt(MAX_SEC * 1000) + '！'
          : '基地按错题数发放：全对 ' + fmt(MAX_SEC * 1000) + '，每错 1 道少 ' +
            LOSS_PER_WRONG + ' 秒，最少 ' + fmt(MIN_SEC * 1000) + '。') + '</div>';
      h += '<div class="wg-ladder">' + ladderHtml(info.wrong) + '</div>';
    }
    h += '</div>';

    // v202：分数 / 错题 / 打卡合成一张按名次排的全班状态榜，下面不再叠两张卡
    h += boardHtml();
    h += baseCardHtml();

    // 积分总账
    h += '<div class="wg-card">';
    h += '<div class="wg-card-hd"><span>🏅 基地能量总账</span><span class="wg-pill wg-pill-lv">' +
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
    h += '<div class="wg-card-hd"><span>📖 基地作战手册</span></div>';
    h += '<div class="wg-rule"><span>①</span>每题先亮「🔭 雷达扫描」，看清单词再点；抢着点只拿 ' +
      CFG.rushScore + ' 分，连击也不涨。</div>';
    h += '<div class="wg-rule"><span>②</span>一题只有一次机会：点错就亮出正确答案，这题 0 分、连击清零，不能挨个蒙。</div>';
    h += '<div class="wg-rule"><span>③</span>稳稳点对 +' + CFG.baseScore + ' 起，连击每题最多再加 ' +
      CFG.comboCap + ' 分；连对 ' + CFG.chainFrom + ' 题起，每题再 +' + CFG.chainBonus + ' 分。</div>';
    h += '<div class="wg-rule"><span>④</span>⭐ 基地空投额外 +' + CFG.starBonus +
      ' 分；返航按答对数和最高连击发补给，但乱点会扣掉一部分。</div>';
    h += '<div class="wg-rule"><span>⑤</span>一轮 ' + fmt(ROUND_MS) +
      '，今天错过的单词会被雷达优先锁定，错得越多练得越准。</div>';
    h += '</div>';

    if (S.history.length) {
      h += '<div class="wg-card"><div class="wg-card-hd"><span>📜 基地航行日志</span></div><div class="wg-hist">';
      S.history.slice(0, 5).forEach(function (r) {
        h += '<div class="wg-hist-row"><span>第 ' + r.n + ' 次出击 · 答对 ' + r.c + ' 题 · 连击 ' + r.combo +
          (r.slip ? ' · 乱点 ' + r.slip + ' 次' : ' · 稳稳作答') + '</span><b>+' + r.s + '</b></div>';
      });
      h += '</div></div>';
    }

    h += '<div class="wg-actions">';
    if (left >= 10000) {
      h += '<button class="wg-btn" data-wg="start">' +
        (G.roundNo > 0 ? '🚀 第 ' + (G.roundNo + 1) + ' 次出击' : '🚀 第一次出击') + '</button>';
      h += '<div class="wg-note wg-center">基地今日配额还剩 ' + fmt(left) + '，随时可以出击</div>';
    } else {
      h += '<button class="wg-btn wg-btn-disabled" disabled>今日配额已用完，基地收工啦</button>';
      h += '<div class="wg-note wg-center">明天少错几道题，基地就多开一会儿 🌟</div>';
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
    h += '<div class="wg-top-l"><span class="wg-round">第 ' + G.roundNo + ' 次出击</span>' +
         '<span class="wg-dot">·</span><span>' + lv.icon + ' ' + lv.name + '</span></div>';
    h += '<button class="wg-mini" data-wg="mute">' + (S.muted ? '🔇' : '🔊') + '</button>';
    h += '</div>';
    h += '<div class="wg-hud">';
    h += '<div class="wg-hud-cell"><span>本次出击</span><b id="wg-score">' + G.score + '</b></div>';
    h += '<div class="wg-hud-cell"><span>连击</span><b id="wg-combo">×' + G.combo + '</b></div>';
    h += '<div class="wg-hud-cell"><span>累计</span><b id="wg-total">' + S.total + '</b></div>';
    h += '</div>';
    h += '<div class="wg-call" id="wg-call">' + esc(comboCall(G.combo) || G.call || '') + '</div>';
    h += '<div class="wg-clockbar"><div class="wg-clock"><span>出击剩余</span><b id="wg-clock">' +
      fmt(G.roundMs) + '</b></div><div class="wg-clock"><span>今日配额</span><b id="wg-overline">' +
      fmt(leftMs()) + '</b></div></div>';
    h += '<div class="wg-track wg-track-live"><div class="wg-track-in" id="wg-bar" style="width:100%"></div></div>';
    h += '<div class="wg-qcard' + (q.star ? ' wg-qcard-star' : '') + '">';
    h += '<div class="wg-qtags">' + (q.star ? '<span class="wg-tag wg-tag-star">⭐ 基地空投 · 答对额外 +30</span>' : '') +
         (q.review ? '<span class="wg-tag wg-tag-review">🔁 雷达锁定 · 今天错过的词</span>' : '') + '</div>';
    h += '<div class="wg-qtitle">' + esc(q.title) + '</div>' +
         '<div class="wg-qsub">' + esc(q.sub) + '</div></div>';
    // v196：出题后先亮「雷达扫描」，这段时间点了不算，逼孩子先看一眼单词。
    h += '<div class="wg-think wg-think-wait" id="wg-think">🔭 先看一眼，想好了再点…</div>';
    h += '<div class="wg-opts wg-opts-wait" id="wg-opts">';
    q.options.forEach(function (o, i) {
      h += '<button class="wg-opt' + (o.used ? ' wg-opt-wrong' : '') +
        '" data-wg="opt" data-wg-v="' + i + '">' +
        '<span class="wg-opt-t">' + esc(o.text) + '</span></button>';
    });
    h += '</div>';
    h += '<div class="wg-bottom">' +
      '<span class="wg-note">📻 想好再点 +' + CFG.baseScore + ' 起 · 连着点对更高 · 空投 +' + CFG.starBonus + '</span>' +
      '<button class="wg-link" data-wg="end">返航结算</button></div>';
    return h;
  }

  function roundHtml() {
    var l = G.last || { score: 0, bonus: 0, correct: 0, combo: 0, star: 0 };
    var lv = levelOf(S.total);
    var left = leftMs();
    var h = '';
    h += '<div class="wg-result">';
    h += '<div class="wg-result-ic">🎉</div>';
    h += '<div class="wg-result-t">第 ' + G.roundNo + ' 次出击返航</div>';
    h += '<div class="wg-cheer">' + esc(G.cheer || callOf(CHEERS)) + '</div>';
    h += '<div class="wg-result-score">+' + l.score + '<span> 分</span></div>';
    h += '<div class="wg-result-detail">答对 ' + l.correct + ' 题 · 最高连击 ×' + l.combo +
      ' · 星星 ' + l.star + ' 颗 · 轮末奖励 +' + l.bonus + '</div>';
    // v196：把「乱点让分数变少」直接摆给孩子看，比讲道理管用。
    if (l.slip > 0) {
      h += '<div class="wg-note wg-slip">⚡ 本轮有 <b>' + l.slip +
        '</b> 次没想好就点，轮末补给少发 <b>' + (l.lost || 0) +
        '</b> 分。稳一点、连着点对，分数会高很多。</div>';
    } else {
      h += '<div class="wg-note wg-good">🎯 全程稳稳作答，补给全额发放！</div>';
    }
    h += '<div class="wg-total-line">累计 <b>' + S.total + '</b> 分 · ' + lv.icon + ' ' + lv.name + '</div>';
    var rk = myRank();
    if (rk.rank > 0) {
      h += '<div class="wg-note">🏆 全班实时第 <b>' + rk.rank + '</b> 名 · 继续连着点对，分数会更高</div>';
    }
    if (lv.next > 0) h += '<div class="wg-note">离下一级还差 ' + lv.next + ' 分</div>';
    h += '</div>';
    h += '<div class="wg-card"><div class="wg-card-hd"><span>⏱️ 基地今日配额</span></div>' +
      '<div class="wg-track"><div class="wg-track-in" style="width:' +
      clamp(Math.round(left / (G.allowanceMs || 1) * 100), 0, 100) + '%"></div></div>' +
      '<div class="wg-note">配额还剩 ' + fmt(left) + '，一次出击 30 秒。</div></div>';
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
    h += '<div class="wg-result-t">今日基地收工</div>';
    h += '<div class="wg-result-score">' + S.todayScore + '<span> 分</span></div>';
    h += '<div class="wg-result-detail">今天出击 ' + G.roundNo + ' 次 · 共 ' + fmt(used * 1000) +
      ' · 累计总积分 ' + S.total + ' 分</div>';
    h += '<div class="wg-total-line">' + lv.icon + ' ' + lv.name + '</div>';
    var rk = myRank();
    if (rk.rank > 0) {
      h += '<div class="wg-note">🏆 全班实时第 <b>' + rk.rank + '</b> 名 / 共 ' + rk.total + ' 人</div>';
    }
    h += '<div class="wg-note">📻 基地播报：' + esc(callOf(BASE_LINES)) + '</div>';
    h += '</div>';
    h += '<div class="wg-card wg-time-card">';
    h += '<div class="wg-card-hd"><span>🌟 明天让基地多开一会儿</span></div>';
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
    paintThink();
  }

  /** v196 · 思考闸门的可视状态：每 100ms 由 paintClock 驱动，不整页重绘。 */
  function paintThink() {
    if (G.phase !== 'playing') return;
    var el = document.getElementById('wg-think');
    var box = document.getElementById('wg-opts');
    if (!el) return;
    var now = Date.now();
    var wait = CFG.thinkMs - (now - G.qShownAt);
    if (G.hint && now < G.hintUntil) {
      el.className = 'wg-think wg-think-hint';
      el.innerHTML = esc(G.hint);
    } else {
      G.hint = '';
      if (wait > 0) {
        el.className = 'wg-think wg-think-wait';
        el.innerHTML = '🔭 先看一眼，想好了再点…';
      } else {
        el.className = 'wg-think wg-think-go';
        el.innerHTML = '✅ 想好了就点，连着点对分数更高';
      }
    }
    // 闸门期间按钮半透明（仍能点，但点了会收到「先看一眼」的提示）。
    if (box) box.className = 'wg-opts' + (wait > 0 ? ' wg-opts-wait' : '');
  }

  /** 一句短播报，1.3 秒后自动回到闸门状态 */
  function hint(t) {
    G.hint = t;
    G.hintUntil = Date.now() + 1300;
    paintThink();
  }

  function updateHud() {
    var a = document.getElementById('wg-score');
    var b = document.getElementById('wg-combo');
    var c = document.getElementById('wg-total');
    var d = document.getElementById('wg-call');
    if (a) a.innerHTML = G.score;
    if (b) b.innerHTML = '×' + G.combo;
    if (c) c.innerHTML = S.total;
    // 连击到 3 / 5 / 8 / 12 / 16 时基地会喊一嗓子，断了就回到出发播报
    if (d) d.innerHTML = esc(comboCall(G.combo) || G.call || '');
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
  /** v196：统一出题，重置这一题的思考闸门与「只能答一次」状态 */
  function armQuestion() {
    G.q = makeQuestion();
    G.qShownAt = Date.now();
    G.answered = false;
    G.locked = false;
    G.hint = '';
    G.hintUntil = 0;
  }

  function nextQuestion() {
    if (G.phase !== 'playing') return;
    if (Date.now() >= G.roundEndAt) { endRound('time'); return; }
    armQuestion();
    paint();
  }

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
    G.misses = 0; G.rush = 0; G.lastTapAt = 0;
    G.locked = false; G.started = true;
    armQuestion();
    G.call = callOf(START_CALLS);
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

  /**
   * v196 · 想好了再点（家长 2026-11-12）
   * 旧逻辑的漏洞：四个选项点错只变灰、还能接着蒙，最坏 4 次必中；秒点也拿
   * 满分。现在：
   *   ① 出题后 thinkMs 内点了不算（先看一眼单词）；
   *   ② 两次点击挨太近，后一次也不算（连点保护）；
   *   ③ 一题只答一次：点错就亮出正确答案、本题 0 分、连击清零；
   *   ④ 抢点（rushMs 内）答对只拿 rushScore，且连击冻结，不给链奖励；
   *   ⑤ 稳稳答对才涨连击、吃连击加成，连到 chainFrom 题起再加链奖励。
   * 乱点次数还会让轮末补给打折 —— 「得分上面受影响」是看得见的。
   */
  function pickOption(i) {
    if (G.phase !== 'playing' || G.locked || G.answered || !G.q) return;
    var now = Date.now();
    var dt = now - G.qShownAt;
    if (dt < CFG.thinkMs) { hint('🔭 先看一眼单词，别急着点'); return; }
    if (now - (G.lastTapAt || 0) < CFG.tapGapMs) { hint('慢一点，想好了再点'); return; }
    var o = G.q.options[i];
    if (!o) return;
    G.lastTapAt = now;
    var el = optEl(i), j, right = -1, rightEl;
    for (j = 0; j < G.q.options.length; j++) if (G.q.options[j].correct) right = j;
    var rushed = dt < CFG.rushMs;
    var isStar = !!G.q.star;
    G.answered = true;
    G.locked = true;

    if (o.correct) {
      G.correct += 1;
      var gain;
      if (rushed) {
        // 没想好就蒙对了：只给一点分，连击不涨也不断，星星空投也不发。
        G.rush += 1;
        gain = CFG.rushScore;
        beep('good');
        hint('⚡ 太快啦！想一下再点能拿更多分');
      } else {
        G.combo += 1;
        if (G.combo > G.maxCombo) G.maxCombo = G.combo;
        gain = CFG.baseScore + Math.min(CFG.comboCap, (G.combo - 1) * CFG.comboStep) +
               (G.combo >= CFG.chainFrom ? CFG.chainBonus : 0);
        if (isStar) { gain += CFG.starBonus; G.starHit += 1; beep('star'); }
        else beep('good');
        hint(G.combo >= CFG.chainFrom
          ? '🔥 连对 ' + G.combo + ' 题，补给加码！'
          : '✅ 点对啦，连着点对分数更高');
      }
      G.score += gain;
      if (el) el.className += rushed ? ' wg-opt-correct wg-opt-rush' : ' wg-opt-correct';
      floatScore(el, '+' + gain + (isStar && !rushed ? ' ⭐' : ''),
                 isStar && !rushed ? 'star' : '');
      updateHud();
      setTimeout(nextQuestion, isStar && !rushed ? 430 : 330);
    } else {
      o.used = true;
      G.combo = 0;
      G.misses += 1;
      beep('bad');
      if (el) el.className += ' wg-opt-wrong';
      rightEl = optEl(right);
      if (rightEl && rightEl !== el) rightEl.className += ' wg-opt-answer';
      floatScore(el, '这题 0 分', 'bad');
      hint(right >= 0
        ? '❌ 正确答案：' + G.q.options[right].text + ' · 这题 0 分，下一题想好再点'
        : '❌ 这题 0 分，下一题想好再点');
      updateHud();
      // 亮出正确答案停一下，让孩子真的看一眼再进下一题。
      setTimeout(nextQuestion, CFG.wrongPauseMs);
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
    // v196：轮末补给按「没想好就点」的次数打折。点错一次少 15%，抢点一次
    // 少 8%，最多扣 60% —— 乱点刷分在结算页会直接看到少发了多少分。
    var rawBonus = G.correct * 2 + G.maxCombo * 3 + (G.maxCombo >= 5 ? 20 : 0) + G.starHit * 5;
    var slip = G.misses + G.rush;
    var cut = Math.min(CFG.penaltyCap, G.misses * CFG.missPenalty + G.rush * CFG.rushPenalty);
    var bonus = Math.max(0, Math.round(rawBonus * (1 - cut)));
    var lost = Math.max(0, rawBonus - bonus);
    var score = G.score + bonus;
    S.total += score;
    S.todayScore += score;
    S.rounds += 1;
    if (score > S.best) S.best = score;
    S.history.unshift({ d: todayStr(), n: G.roundNo, s: score, c: G.correct,
                        combo: G.maxCombo, slip: slip });
    if (S.history.length > 8) S.history = S.history.slice(0, 8);
    persist();
    G.last = { score: score, bonus: bonus, correct: G.correct, combo: G.maxCombo,
               star: G.starHit, slip: slip, lost: lost, rawBonus: rawBonus };
    G.cheer = callOf(CHEERS);
    // v195：这一轮的分数立刻送后台，别的手机马上能看到名次变化。
    // 断网就先排队，回前台 / 每 15 秒 / 下次打开都会自动补发。
    queueScore(score);
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
      // v195：大厅里有实时榜单，每次进页面都要按最新后台数据重画，
      // 不能拿缓存的旧 HTML（否则这台手机会看到上一版名次）。
      if (G.phase === 'lobby' || G.phase === 'round' || G.phase === 'finish' || !G.html) {
        G.html = view();
      }
      return '<div id="wg-root" class="wg-root">' + G.html + '</div>';
    },
    /** 每次 renderContent 之后调；只在必要时刷新大厅 / 补时钟 */
    mount: function () {
      ensureDay();
      var root = document.getElementById('wg-root');
      if (!root) return;
      // v195：进游戏页就把没报完的分补上、把后台的榜拉回来，并开定时同步。
      startBoardSync();
      startCheckinSync();
      flushScores();
      pullScores();
      pullCheckins();
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
    baseOf: baseOf,
    todayInfo: todayInfo,
    total: function () { return S.total; },
    config: function () { return CFG; },
    board: function () { return BOARD; },
    myRank: myRank,
    pullScores: pullScores,
    flushScores: flushScores,
    // 校验脚本用的内部把手
    _test: {
      makeQuestion: makeQuestion,
      buildPool: buildPool,
      endRound: endRound,
      startRound: startRound,
      // v196：校验脚本要能真点一次按钮，而不是只看代码文本
      pickOption: pickOption,
      armQuestion: armQuestion,
      nextQuestion: nextQuestion,
      playHtml: playHtml,
      boardHtml: boardHtml,
      baseCardHtml: baseCardHtml,
      classRoster: classRoster,
      hallHtml: hallHtml,
      normalizeBoardRows: normalizeBoardRows,
      boardRow: boardRow,
      checkinCardHtml: checkinCardHtml,
      mergedBoardRows: mergedBoardRows,
      ckBoardMap: ckBoardMap,
      ckRoster: ckRoster,
      pullCheckins: pullCheckins,
      state: G,
      save: function () { return S; },
      reset: function () { S = defSave(); persist(); }
    }
  };
  window.WordGame = WordGame;
})();
