/* eslint-disable */
// TEACHER_PHONE now lives in api.js — role resolution is Api's job, so that
// it can move to the Worker without touching this file.
const App = {
  state: {
    // Empty until Api resolves a session. Was 'teacher', which only worked
    // because isTeacher() used to compare the phone number instead.
    role: '',
    userName: '',
    phone: '',
    className: '',
    currentDay: 0,
    currentTab: 'weekly',
    // v134 老师「题库预览」：正在用学生界面看哪一天。
    //   previewDay  = null  → 没在预览，一切照旧
    //   previewDay  = 0..6  → 正在预览这一天
    //   previewWeek = 0 本周 / 1 下周（相对当前自然周）
    previewDay: null,
    previewWeek: 0,
    currentModule: null,
    vocabStage: 0,
    vocabWordIdx: 0,
    vocabScore: 0,
    // 这一套词汇坐标属于哪个模块（断点记录要用；-1 = 还没进过词汇闯关）
    vocabMi: -1,
    // v136：**已经学完的那个词的序号**（-1 = 一个都还没学完）。
    // 底部「下一个单词」只在这个词学完（所有阶段走完）时才亮 —— 以前它靠
    // `_spell` 判，而 `_spell` 只在"逐字母拼读"那一屏才有值，看图选词 /
    // 选释义两屏是 null，于是孩子一张图都没选就能一路点到底，整个词汇游戏
    // 被跳过去（家长 2026-10-17 报的"题没做完，下一题又能开始做了"）。
    vocabDoneIdx: -1,
    selectedVoice: 'female',
    answers: {},
    checkins: {},
    errorBook: [],
    students: [],
    parentStudents: {},
    classes: [],
    audioEnabled: false,
    voices: [],
    learnedWords: {},
    speakingRecords: [],
    stepIdx: 0,
    // 老师端：后台「移出名单」（D1 removed_students）。进了这个名单的手机号
    // 登录一律被拦，只有老师同意（学生申请→同意，或老师直接点解除）才出得来。
    // 这里只用来显示，判断真伪永远以后台为准。
    removedPhones: [],
    // 老师端批量勾选。key 形如 's:<手机号>'（学生）/ 'g:<手机号>'（已被拦的号码），
    // 一个「删除选中」同时服务两种对象 —— 结果都是同一句话：从列表里消失 + 进不来。
    picked: [],
    // 被老师「收起」的拦截号码（纯本机界面偏好，不进云端）：这些人**仍然被拦着**，
    // 只是不再占着学生管理页。想看 / 想放行时随时展开回来。
    showHiddenGated: false,
    // v128：学生管理页面精简后，「更多」（同步 / 被删名单 / 入班申请）默认收起。
    // 老师 2026-10-15：「这个页面调了好多次，你给调得太复杂了，搞最简单的。」
    showMore: false,
  },

  async init() {
    // v143：本机数据是同步的（localStorage），先同步读进来，**读词表
    // （IndexedDB）挪到最后**。以前 loadData 里 await 了 IndexedDB，自动登录
    // 排在它后面，孩子就得先等这一下 —— 家长 2026-10-19：「登录时间还是太久」。
    try {
      this.loadDataSync();
    } catch (e) { console.warn('loadData failed (auto-login continues):', e); }
    // v143：自动登录立刻发起 —— 它只做同步的凭据读取，不等任何网络。
    // 注意它是 async 的：真正的 showApp 要等这一轮同步初始化跑完之后才会执行
    // （第一个 await 让出主线程），所以下面那些绑定不用抢在它前面。
    if (/[?&]ttstest=1/.test(location.search)) { this.runTtsTest(); return; }
    // v148：手机录音自检页（?micdiag=1）。家长说"就这个红米有问题"，
    // 让她在这台手机上打开一次，页面直接告诉她这台机器是不是降采样/爆音。
    if (/[?&]micdiag=1/.test(location.search)) { this.runMicDiag(); return; }
    // v144：先把上次填的手机号/姓名放回输入框，并把输入框的变化记下来。
    // 必须在 tryAutoLogin 之前 —— 自动登录那条路也可能要回退到登录页。
    this._hydrateLoginForm();
    this.tryAutoLogin();
    this.loadVoices();
    // v129：长按朗读时不许浏览器弹「复制 / 选中」把录音抢走（家长 2026-10-16）
    this._bindNoCopy();
    // v131：?perf=1 时挂上 ASR 性能诊断面板；普通页面这里什么都不做。
    this._setupPerfPanel();
    // 先听再读的门禁：一次绑定，全平台所有朗读控件都走它
    this._bindGateGuard();
    if (typeof Cloud !== 'undefined') Cloud.init();
    // WeChat built-in browser: unlock audio as soon as WeixinJSBridge is
    // ready. On WeChat, the first play() must happen inside this callback
    // or a user gesture — this covers the "opened app but never tapped"
    // case on WeChat.
    this._setupWeChatAudioUnlock();
    // Attach the one-time unlock on EVERY path, not just auto-login. Browsers
    // only allow playback after a user gesture; with the 「开启语音」 screen
    // gone, the first tap anywhere has to be what unlocks it — otherwise the
    // sentence auto-read is called but never actually heard.
    this._setupAudioUnlock();
    // 提示音用的是 Web Audio，和语音朗读走的不是同一条路，得单独唤醒；
    // 而且它随时可能被系统掐掉（切后台、来电、TTS 抢音频会话），所以不是
    // 一次性的事 —— 每次点按都顺手确认一下它还醒着。
    this._bindAudioKeeper();
    // Show WeChat notice if in WeChat
    if (this.isWeChat()) {
      const notice = document.getElementById('wechat-notice');
      if (notice) notice.style.display = 'flex';
    }
    // v144：登录按钮在脚本还没就绪时被点过 → 现在补上这一次登录，孩子不用
    // 再点第二下（以前那一下只是把按钮改成"正在加载，请稍候…"，然后就没下文了）。
    if (typeof window !== 'undefined' && window.__pendingLogin) {
      window.__pendingLogin = false;
      const pEl = document.getElementById('login-phone');
      const nEl = document.getElementById('login-name');
      const pv = pEl ? pEl.value.trim() : '';
      const nv = nEl ? nEl.value.trim() : '';
      const b = document.getElementById('login-btn');
      if (!this.state.phone && pv.length >= 11 && nv) {
        this.login();
      } else if (b) {
        b.classList.remove('logging-in');
        b.innerHTML = '登录';
      }
    }
  },

  // v144（家长 2026-10-19）：刷新之后不许再把手机号和姓名弄丢。
  //   ① 开屏脚本已经在首帧前回填过一遍，这里再保一遍（老页面/老缓存兜底）；
  //   ② 输入框每变一个字就写进草稿（localStorage + 一年 cookie）；
  //   ③ `_loginDraftKnown` 记住"这个手机号在这台设备上登录成功过" ——
  //      登录时据此走"不等网络直接进"那条路。
  _hydrateLoginForm() {
    const phoneEl = document.getElementById('login-phone');
    const nameEl = document.getElementById('login-name');
    if (!phoneEl || !nameEl) return;

    let d = (typeof window !== 'undefined' && window.__bootDraft) ? window.__bootDraft : null;
    if (!d && typeof Api.readLoginDraft === 'function') {
      try { d = Api.readLoginDraft(); } catch (e) { d = null; }
    }
    this._draft = d || null;

    if (d) {
      if (d.phone && !phoneEl.value) phoneEl.value = d.phone;
      if (d.name && !nameEl.value) nameEl.value = d.name;
    }
    if (nameEl.value) { try { this.checkNameFormat(); } catch (e) {} }
    // 页面刚打开、孩子一个字都没改就点登录时，也要认得出这是老设备。
    this._loginDraftKnown = !!(d && d.known && d.phone && d.phone === phoneEl.value.trim());
    this._draftPhone = phoneEl.value.trim();

    const self = this;
    const save = function () {
      const p = phoneEl.value.trim();
      const n = nameEl.value.trim();
      // 只有"本机登录过的那个号"才算老设备；改了号就重新走核对（v132 红线）。
      self._loginDraftKnown = !!(d && d.known && d.phone && d.phone === p);
      self._draftPhone = p;
      const hint = document.getElementById('login-remember-hint');
      if (hint) hint.style.display = (p.length >= 11 && n) ? 'block' : 'none';
      if (typeof Api.writeLoginDraft !== 'function') return;
      try { Api.writeLoginDraft(p, n, self._loginDraftKnown); } catch (e) {}
    };
    this._saveLoginDraft = save;
    phoneEl.addEventListener('input', save);
    nameEl.addEventListener('input', save);
    phoneEl.addEventListener('change', save);
    nameEl.addEventListener('change', save);
    // 关页面 / 切后台再补一次 —— 最后几个字有时还没触发 input 就切走了。
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') save();
    });

    // 填好了就明说一句，孩子不用猜"是不是还要再输一遍"
    const hint = document.getElementById('login-remember-hint');
    if (hint) {
      hint.style.display = (phoneEl.value.trim().length >= 11 && nameEl.value.trim()) ? 'block' : 'none';
    }
  },

  // v143：同步版数据装载。localStorage 是同步的，没有理由 await ——
  // 自动登录排在它后面就多等一个微任务 + 一次 IndexedDB 开启（几十到几百
  // 毫秒）。词表另开一条路在后台补（见 loadLearnedWords）。
  loadDataSync() {
    // Api.loadStateSync 是 v143 新加的同步读；老调用方（测试桩）可能只有
    // 异步的 loadState —— 那种情况下退回到"空文档"，绝不拦住登录。
    let d = null;
    try {
      if (typeof Api.loadStateSync === 'function') d = Api.loadStateSync();
    } catch (e) { console.warn('loadStateSync failed:', e); }
    if (!d) d = { answers: {}, checkins: {}, errorBook: [], students: [], parentStudents: {}, classes: [] };
    this.state.answers = d.answers || {};
    this.state.checkins = d.checkins || {};
    this.state.errorBook = d.errorBook || [];
    this.state.students = d.students || [];
    this.state.parentStudents = d.parentStudents || {};
    this.state.classes = d.classes || [];
    this.loadLearnedWords();
  },

  loadLearnedWords() {
    const self = this;
    Promise.resolve(typeof Api.getLearnedWords === 'function' ? Api.getLearnedWords() : {})
      .then(function (w) {
        self.state.learnedWords = w || {};
      }).catch(function (e) { console.warn('learnedWords load failed:', e); });
  },

  // Unlock the audio element when WeixinJSBridge becomes available
  _setupWeChatAudioUnlock() {
    var self = this;
    if (typeof WeixinJSBridge === 'undefined') {
      document.addEventListener('WeixinJSBridgeReady', function() {
        self._unlockAudioElement();
      }, false);
    } else {
      self._unlockAudioElement();
    }
  },

  // Play the inline silent WAV once to unlock the persistent audio element
  _unlockAudioElement() {
    try {
      var el = document.getElementById('tts-player');
      if (el && !this._ttsUnlocked) {
        el.src = this.SILENT_WAV;
        el.volume = 0;
        var p = el.play();
        if (p && p.then) { p.then(function() { el.volume = 1; }).catch(function() { el.volume = 1; }); }
      }
    } catch(e) {}
  },

  // Auto-login from saved credentials
  // v143：整条路都不等网络，也不等 Promise —— 凭据本机同步读得到，就直接
  // showApp。index.html 的开屏脚本已经把登录页藏好了，所以孩子看到的是
  // 「正在进入…」一闪 → 直接是作业界面。
  async tryAutoLogin() {
    try {
      // 开屏脚本在解析期已经同步读过一次，直接复用，省掉一次 JSON 解析 + 一次让出。
      const creds = (typeof window !== 'undefined' && window.__bootSavedLogin)
        ? window.__bootSavedLogin
        : (typeof Api.getSavedLoginSync === 'function'
            ? Api.getSavedLoginSync()
            : (typeof Api.savedLoginSync === 'function' ? Api.savedLoginSync() : null));
      if (creds) {
        {
          // Fill in the form fields (in case auto-login needs to show them)
          const phoneInput = document.getElementById('login-phone');
          const nameInput = document.getElementById('login-name');
          if (phoneInput) phoneInput.value = creds.phone;
          if (nameInput) nameInput.value = creds.name;
          // v144：草稿同步成"这台设备认识这个号" —— 万一凭据之后被系统清掉，
          // 登录页上仍是填好的，点一下就走。
          try {
            if (typeof Api.writeLoginDraft === 'function') Api.writeLoginDraft(creds.phone, creds.name, true);
            this._loginDraftKnown = true;
            this._draftPhone = creds.phone;
          } catch (e) {}
          // Auto-login
          this.state.phone = creds.phone;
          this.state.userName = creds.name;
          // Keep audioEnabled=false until user interacts (browser requires
          // a user gesture to unlock audio). The render functions will show
          // a "开启语音" banner; when the user taps it or taps anywhere on
          // screen, _setupAudioUnlock fires, sets audioEnabled=true, and
          // re-renders so auto-speak works.
          this.state.audioEnabled = false;
          this._ttsUnlocked = false;
          this.loadVoices();
          // Add one-time listener to unlock audio on first interaction
          this._setupAudioUnlock();
          // resolveSession 是纯本机判断（老师端看手机号），不碰网络。
          const session = (typeof Api.sessionSync === 'function')
            ? Api.sessionSync(creds.phone, creds.name)
            : { phone: creds.phone, name: creds.name, role: 'student' };
          if (session.role === 'teacher') {
            this.state.role = 'teacher';
            this.state.className = '';
            this.showApp();
          } else {
            this.state.role = 'user';
            // 自动登录 = 凭据就来自这台设备，必然是"老设备"：直接进，
            // 核对放后台（v142）。隔天打开不该再看到"正在核对"。
            this.registerStudent(creds.phone, creds.name, true);
          }
        }
      }
    } catch(e) { console.warn('Auto login error:', e); }
  },

  // Setup one-time audio unlock on first user interaction (for auto-login case)
  _setupAudioUnlock() {
    if (this._ttsUnlocked) return;
    var self = this;
    var unlockHandler = function() {
      if (self._ttsUnlocked) return;
      self._ttsUnlocked = true;
      self.state.audioEnabled = true;
      // Unlock Web Audio API context (for sound effects)
      var ctx = self._getAudioCtx();
      if (ctx && ctx.state === 'suspended') { ctx.resume(); }
      // Unlock the persistent audio element within user gesture
      // Only do this if nothing is currently playing (avoid interrupting ongoing TTS)
      // Uses an inline silent WAV (no network dependency) for maximum reliability.
      var audioEl = document.getElementById('tts-player');
      if (audioEl && !self._currentAudio) {
        audioEl.src = self.SILENT_WAV;
        audioEl.volume = 0;
        var p = audioEl.play();
        if (p && p.then) {
          p.then(function() { audioEl.volume = 1; }).catch(function() { audioEl.volume = 1; });
        }
      }
      // Remove listeners
      document.removeEventListener('touchstart', unlockHandler);
      document.removeEventListener('click', unlockHandler);
      // Anything queued before the unlock (the sentence the child just landed
      // on) gets played now instead of being lost.
      if (self._pendingSpeak) {
        var pending = self._pendingSpeak;
        var pGate = self._pendingSpeakGate;
        self._pendingSpeak = null;
        self._pendingSpeakGate = null;
        self.speak(pending, pGate ? { onDone: function() { self._gateUnlock(pGate); } } : undefined);
        return;
      }
      // Re-render content so auto-speak can now work with unlocked audio
      if (self.state.phone) {
        self.renderContent();
      }
    };
    document.addEventListener('touchstart', unlockHandler, { once: false, passive: true });
    document.addEventListener('click', unlockHandler, { once: false });
  },

  // 提示音的"保活"。语音朗读走 <audio> 元素，提示音走 Web Audio，两条路
  // 各有各的解锁；而且音频会话随时可能被系统抢走（切后台回来、来电、
  // 语音朗读把会话切到播放态），醒来之后 AudioContext 会停在 suspended，
  // 之后所有提示音都不响。所以每次点按都顺手确认一下它还在跑，代价只是
  // 读一次 state 字段。
  _bindAudioKeeper() {
    if (this._audioKeeperBound) return;
    this._audioKeeperBound = true;
    var self = this;
    var keep = function() { self._unlockAudioCtx(); };
    ['pointerdown', 'touchstart', 'click'].forEach(function(tn) {
      document.addEventListener(tn, keep, true);
    });
    // 从后台回到前台、或者被别的应用打断过，也补一次
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) keep();
    });
  },

  // ===== Data =====
  // One read at startup. Api owns the storage format and the v5/v4 migration;
  // the collections come back by reference, so App.state stays the in-memory
  // source of truth for rendering while Api persists behind it.
  // 保留给测试 / 旧调用点：等价于同步读 + 后台补词表。
  async loadData() {
    this.loadDataSync();
    this.state.learnedWords = await Api.getLearnedWords();
  },

  // ===== Login =====
  isTeacher() {
    return this.state.role === 'teacher';
  },

  // The id answers and recordings are filed under. Falls back to the phone
  // number so a student whose roster row has not synced yet still records.
  _myStudentId() {
    const me = this.state.students.find(s => s.phone === this.state.phone);
    return me ? me.id : ('s' + this.state.phone);
  },

  // How many questions a day contains — the denominator for the check-in.
  // Counts exactly what the four recording entry points can answer, so a day
  // can actually reach 'full'. Vocab and spelling drills are excluded: they
  // are repeatable practice with no stable question identity.
  _countDayQuestions(dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];
    if (!day || !day.modules) return 0;
    let n = 0;
    day.modules.forEach(m => {
      if (m.type === 'vocab') return;
      if (m.questions) n += m.questions.length;
      if (m.blanks) n += m.blanks.length;
    });
    return n;
  },

  // ===== 断点位置（连续记录）=====
  // 「上次退出去时停在哪儿」不能只靠答题记录反推：一道题答到一半、正在跟读
  // 的那一屏、词汇闯关里的第几个词第几个阶段，都还没有任何"答过了"的痕迹。
  // 所以在每次位置变化时把当前坐标写进本机，重登录（以及更新后自动刷新）
  // 直接回到这个坐标。
  _POS_KEY: 'amy-pos-v1',

  _posStore() {
    if (!this._posStoreCache) {
      try { this._posStoreCache = JSON.parse(localStorage.getItem(this._POS_KEY) || '{}') || {}; }
      catch (e) { this._posStoreCache = {}; }
    }
    return this._posStoreCache;
  },

  // 按「学生 + 第几周 + 第几天」分段：换周、换天都是另一份进度。
  _posKey(dayIdx) {
    return this._myStudentId() + this._weekTag() + '_d' + dayIdx;
  },

  // ===== 打卡记录同步（v120）===============================================
  //
  // 家长 2026-10-14 报的：「孩子端显示的打卡记录都是未打卡，完成时间、正确率、
  // 错题数都没同步过来。」根因是打卡记录**从来没上过后端** —— CloudSync.up()
  // 的 payload 只带 students / classes / 墓碑，answers 和 checkins 只写在各自
  // 手机的 localStorage 里。孩子用自己的手机做完，家长在另一台设备上看到的
  // 自然是一片空白。
  //
  // 现在打卡会报到 D1（Api.reportCheckin），这里负责把后台那份拉回来合并。

  // 上报打卡时带上"我是谁"。孩子端常常没有同步到自己的档案（state.students
  // 里找不到自己），所以从登录时记下的 state 上再兜一层。
  _myWho() {
    const me = this.state.students.find(s => s.phone === this.state.phone);
    return {
      name: (me && me.name) || this.state.userName || '',
      phone: this.state.phone || '',
      klass: (me && me.class) || this.state.className || '',
    };
  },

  // 把后台的打卡行合并进 state.checkins。
  //
  // 冲突时取"更完整"的一份，而不是无脑用云端覆盖：
  //   ・done 只增不减（一台设备本地被清过，不该把已打卡抹回未打卡）
  //   ・answered 多的那一份正确率更可信
  // 这样孩子刚答完、上报还在路上时，本机那份照样显示得对。
  // 把后台行的 student_id 对齐到名单里的编号（v123）。
  //
  // 为什么要这一步：上报用的是"孩子设备当时认到的自己"。而 `registerStudent`
  // 在**名单同步下来之前**登录过的话，会给同一个手机号现造一个 `s<时间戳>` 的
  // 新编号（见 registerStudent 里的 `id: 's' + Date.now()`），之后就一直是它。
  // 老师端渲染是**按名单里的编号**取 key 的（`state.checkins[s.id + tag + '_dN']`），
  // 于是这类设备报上来的行老师一条也看不到 —— 明明传了，还是"未打卡"。
  //
  // 2026-10-14 实测踩到：后台出现 `s1791934007056`（名单里没有）与
  // `s1791931729388`（名单里的）两行同名同班的 张子皓-Harvey。
  //
  // 规则：名单里有这个编号 → 原样；没有 → 按「姓名 + 班级」认领到名单里的那个
  // 学生；认不出来（没名字 / 命中不唯一）→ 原样返回（**宁可不显示，也不张冠李戴**）。
  _rosterIdFor(sid, name, klass) {
    const list = this.state.students || [];
    if (!sid || list.some(s => s.id === sid)) return sid;
    const nm = String(name || '').trim();
    if (!nm) return sid;
    const hit = list.filter(s => String(s.name || '').trim() === nm
      && (!klass || s.class === klass));
    if (hit.length !== 1) return sid;
    console.warn('checkin id ' + sid + ' not in roster; aliased to ' + hit[0].id + ' (' + nm + ')');
    return hit[0].id;
  },

  _mergeCloudCheckins(rows) {
    if (!Array.isArray(rows)) return 0;
    const tag = this._weekTag();
    let n = 0;
    rows.forEach(r => {
      if (!r || !r.student_id || r.day_idx === undefined || r.day_idx === null) return;
      const sid = this._rosterIdFor(r.student_id, r.student_name, r.student_class);
      const k = sid + tag + '_d' + r.day_idx;
      const mine = this.state.checkins[k];
      const done = !!r.done;
      const better = !mine
        || (done && !mine.done)
        || ((r.answered || 0) > (mine.answered || 0));
      if (!better) return;
      this.state.checkins[k] = {
        id: 'cloud_' + k,
        studentId: sid,
        dayIdx: r.day_idx,
        done: done,
        completed: r.completed || (done ? 'full' : 'partial'),
        answered: r.answered || 0,
        total: r.total || 0,
        correctRate: r.correct_rate || 0,
        wrongCount: r.wrong_count || 0,
        time: r.finish_time || '',
        at: r.updated_at || '',
        fromCloud: true,
      };
      n++;
    });
    return n;
  },

  // 历史补录（v120 建；v121 扩到"本机所有周"+ 切回前台也补）。
  //
  // 在这版之前，打卡记录只写在本机，后台一条都没有。孩子的手机只要**打开一次
  // App**，这里就把本机这份全推上去 —— 不要求孩子做任何操作，也不需要家长
  // 去挨个"下拉刷新"。
  //
  // v121 两点加强（家长 2026-10-14 报"我还是看不到"之后）：
  //   1. 不再只推**本周**，而是推本机**所有周**的记录。孩子上一次作业可能是
  //      上一周做的，只推本周等于历史永远补不上（key 里的 _wN 就是周序号，
  //      由 _checkinKeySlot 拆出来，配 rec.weekIdx 一起报）。
  //   2. 除了进 App 时，**每次回到前台**（visibilitychange / focus / pageshow）
  //      再补一次（60 秒节流）—— 孩子做完作业切出去又切回来的场景很常见，
  //      那一次上报可能正好断网丢了。
  // v122 补第三点，也是**真正的病根**（前两点都只是通道）：
  //   家长 2026-10-14 晚又说"重新登录了还是没反应"。查下来是 Api._answerPrefix
  //   漏了周标记 —— 第 2 周（10-05 周一）起 saveCheckin 一次都没写成功过，
  //   本机 checkins 是空的，**没有东西可报**。所以打开 App 时先让 Api 拿本机
  //   答案重算一遍打卡（纯本地、幂等），再往下统一上报。
  _backfillCheckins() {
    if (this.isTeacher() || !this.state.phone) return 0;
    const sid = this._myStudentId();
    const who = this._myWho();
    // 先把答案汇总成打卡（补回第 2 周起一直没写下来的那几天）。
    if (typeof Api.repairCheckins === 'function') {
      try { Api.repairCheckins(sid, this._dayTotals(), who); }
      catch (e) { console.warn('repairCheckins failed:', e); }
    }
    if (this._backfilled) return 0;
    this._backfilled = true;
    let n = 0;
    Object.keys(this.state.checkins || {}).forEach(k => {
      const slot = this._checkinKeySlot(k, sid);
      const rec = this.state.checkins[k];
      if (!slot || !rec) return;
      Api.reportCheckin(Object.assign({}, rec, {
        studentId: sid, dayIdx: slot.dayIdx, weekIdx: slot.weekIdx,
      }), who);
      n++;
    });
    if (n) console.log('backfilled ' + n + ' check-ins');
    return n;
  },

  // 本周每天的题数，下标 = 第几天。给 Api.repairCheckins 算 total 用。
  _dayTotals() {
    const out = [];
    for (let i = 0; i < HOMEWORK_DATA.length; i++) out.push(this._countDayQuestions(i));
    return out;
  },

  // 从本机打卡 key 里拆出（第几周, 第几天）。key 的形状由 Api.checkinKey /
  // App._weekTag 决定，只有两种：
  //   <sid>_d<day>           第 1 周（_weekTag() 对 0 不写 _w）
  //   <sid>_w<week>_d<day>   第 2 周起
  // 不是自己的 key、或者形状不认识 → null（**宁可不报，也不报一条错数据**）。
  _checkinKeySlot(key, sid) {
    const k = String(key || '');
    const pre = String(sid || '');
    if (!pre || k.indexOf(pre) !== 0) return null;
    const rest = k.slice(pre.length);
    let m = /^_w(\d+)_d(\d+)$/.exec(rest);
    let weekIdx = 0, dayIdx = -1;
    if (m) { weekIdx = parseInt(m[1], 10); dayIdx = parseInt(m[2], 10); }
    else {
      m = /^_d(\d+)$/.exec(rest);
      if (!m) return null;
      dayIdx = parseInt(m[1], 10);
    }
    if (!isFinite(weekIdx) || !isFinite(dayIdx) || dayIdx < 0) return null;
    return { weekIdx: weekIdx, dayIdx: dayIdx };
  },

  // 回到前台就再补一次上报（只绑一次）。60 秒节流，避免孩子在 App 里切来
  // 切去时反复打后台 —— 服务端那边是 UPSERT，重复报也不会写坏数据。
  _bindCheckinUpload() {
    if (this._checkinKeeperBound) return;
    this._checkinKeeperBound = true;
    let last = 0;
    const again = () => {
      try {
        if (document.visibilityState === 'hidden') return;
        if (Date.now() - last < 60000) return;
        last = Date.now();
        this._backfilled = false;
        this._backfillCheckins();
      } catch (e) { /* 补报失败绝不能影响孩子用 App */ }
    };
    document.addEventListener('visibilitychange', again);
    window.addEventListener('focus', again);
    window.addEventListener('pageshow', again);
  },

  // 进「孩子打卡 / 完成率对比」之前拉一次后台。失败保持本机数据不动 ——
  // 一断网就把全班显示成"未打卡"是最坏的降级方式。
  //
  // 老师端要跨班看，所以逐个班拉一遍再合并（班级数量个位数，够用）。
  //
  // 返回**这次真的并进来了几条**（v130）。switchTab 靠它决定要不要补渲染：
  // 一条都没变就别白刷一遍，否则屏幕上会闪一下 —— 那比慢更让人难受。
  async _pullCloudCheckins(scope) {
    const who = this._myWho();
    if (this.isTeacher()) {
      let n = 0;
      const classes = (this.state.classes || []).filter(Boolean);
      for (let i = 0; i < classes.length; i++) {
        const rows = await Api.fetchCheckins({ klass: classes[i] });
        n += this._mergeCloudCheckins(rows);
      }
      return n;
    }
    const rows = scope === 'class'
      ? await Api.fetchCheckins({ klass: who.klass || this.state.className })
      : await Api.fetchCheckins({ studentId: this._myStudentId() });
    return this._mergeCloudCheckins(rows);
  },

  _getPos(dayIdx) {
    if (this.isTeacher() || !this.state.phone) return null;
    if (dayIdx === undefined || dayIdx === null) return null;
    const rec = this._posStore()[this._posKey(dayIdx)];
    if (!rec || typeof rec !== 'object') return null;
    if (typeof rec.stepIdx !== 'number' || !isFinite(rec.stepIdx) || rec.stepIdx < 0) return null;
    return rec;
  },

  // 写当前坐标。步骤下标 + 词汇闯关的内部坐标（词序/阶段/分数/昨日复习）。
  _savePos(dayIdx) {
    if (this.isTeacher() || !this.state.phone) return;
    if (dayIdx === undefined || dayIdx === null) return;
    const store = this._posStore();
    const k = this._posKey(dayIdx);
    const rec = (store[k] && typeof store[k] === 'object') ? store[k] : {};
    rec.stepIdx = this.state.stepIdx;
    rec.vocab = {
      mi: this.state.vocabMi,
      wordIdx: this.state.vocabWordIdx,
      stage: this.state.vocabStage,
      score: this.state.vocabScore,
      reviewDone: !!this.state.vocabReviewDone,
      // v136：这个词学完了没有 —— 断点续做时靠它判断底部按钮该不该亮
      doneIdx: this.state.vocabDoneIdx,
    };
    rec.at = Date.now();
    store[k] = rec;
    try { localStorage.setItem(this._POS_KEY, JSON.stringify(store)); } catch (e) {}
  },

  // 学生断点续做：登录 / 刷新 / 更新后不从第一题重来，直接停在"上次退出
  // 去时停的那一屏"。
  //
  // 位置有两个来源，取更靠后的那个：
  //  1) 本机连续记录（_savePos）：每次位置变化都写，所以"答到一半"的地方
  //     也在里面 —— 正在跟读的那句、词汇闯关里的第 N 个词第 M 个阶段。
  //  2) 答题记录反推（_resumeStepIdxFromAnswers）：兜底，只认"这题答过没有"，
  //     清了缓存 / 换了设备时用它。
  // 最后再从停下的那一步往前走一格：这一步其实已经做完（题答过、词汇学完、
  // 作文填全、朗读读完）就自动落位到下一屏 —— 位置跟着完成度走，不需要孩子
  // 额外点一次「下一题」。
  // 老师端始终 0（老师是预览，不做题）。
  _resumeStepIdx(dayIdx) {
    const steps = this._buildSteps(dayIdx);
    if (!steps.length) return 0;
    const fromAnswers = this._resumeStepIdxFromAnswers(dayIdx, steps);
    const saved = this._getPos(dayIdx);
    if (!saved) return fromAnswers;
    let s = Math.floor(saved.stepIdx);
    if (!isFinite(s) || s < 0) s = 0;
    if (s > steps.length) s = steps.length;
    if (s < fromAnswers) s = fromAnswers;
    while (s < steps.length && this._stepIsDone(steps[s], dayIdx)) s++;
    return s;
  },

  // 这一步是不是已经做完了（只认有持久化记录的那几种题型）。
  _stepIsDone(step, dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];
    if (!step || !day || !day.modules) return false;
    const sid = this._myStudentId();
    if (step.kind === 'question' || step.kind === 'speaking') {
      return !!this.state.answers[Api.answerKey(sid, dayIdx, step.mi, step.qi)];
    }
    if (step.kind === 'vocab') return !!this._getLearnedWords(dayIdx);
    const m = day.modules[step.mi];
    if (!m) return false;
    if (step.kind === 'writing') return this._writingAllBlanksRight(m, step.mi, dayIdx);
    if (step.kind === 'writingread') return this._writingAllRead(m, step.mi);
    // sentence / translate / passage 没有独立记录，一律算没做完
    return false;
  },

  // 这道题是不是已经**做对**了（只认 correct === true，答错不算）。
  // 填空题（没有选项、没有跟读入口）从下一题退回来时靠它判断还要不要锁住
  // 底部"下一题"——已经写对了就不该再锁，否则按钮永远是灰的，孩子点不动。
  _questionSolved(mi, qi, dayIdx) {
    const rec = this.state.answers[Api.answerKey(this._myStudentId(), dayIdx, mi, qi)];
    return !!(rec && rec.correct);
  },

  // 只靠答题记录反推的版本（见上面 _resumeStepIdx 的说明）。依据是本地记录
  // 的答题（answers）+ 单词闯关完成标记（learnedWords），都在手机本地，
  // 重新登录不会丢。
  //  - 做完的模块：整块跳过（含它前面的听读句子步骤）
  //  - 做到一半的模块：停在第一个没做的题
  //  - 完全没碰过的模块：从该模块第一屏开始（保留听读/翻译引导）
  //  - 全部做完：停在"今天的作业做完了"完成页
  _resumeStepIdxFromAnswers(dayIdx, steps) {
    steps = steps || this._buildSteps(dayIdx);
    if (!steps.length) return 0;
    const day = HOMEWORK_DATA[dayIdx];
    if (!day || !day.modules) return 0;
    const sid = this._myStudentId();
    const answered = (mi, q) =>
      !!this.state.answers[Api.answerKey(sid, dayIdx, mi, q)];

    let firstUn = -1;          // 第一个没做完的"可答题"步骤下标
    const touched = {};         // moduleIdx -> 该模块是否做过至少一题
    for (let i = 0; i < steps.length && firstUn < 0; i++) {
      const s = steps[i];
      if (s.kind === 'question' || s.kind === 'speaking') {
        if (answered(s.mi, s.qi)) { touched[s.mi] = true; continue; }
        firstUn = i;
      } else if (s.kind === 'clozegroup') {
        // 完形填空一组（同句多个空）：整组都答过才算做过。
        const grp = s.qis || [s.qi];
        if (grp.every(qi => answered(s.mi, qi))) { touched[s.mi] = true; continue; }
        firstUn = i;
      } else if (s.kind === 'writing') {
        const blanks = (day.modules[s.mi] || {}).blanks || [];
        let miss = -1;
        for (let bi = 0; bi < blanks.length; bi++) {
          if (answered(s.mi, bi)) { touched[s.mi] = true; }
          else if (miss < 0) miss = bi;
        }
        if (miss >= 0) firstUn = i;
      } else if (s.kind === 'writingread') {
        // 作文的空填完了但全文还没读完 → 回到朗读这一屏（朗读的记录在
        // 本机，刷新/重登录都还在，不会让孩子重读已经读过的句子）
        const wm = day.modules[s.mi] || {};
        if (this._writingAllRead(wm, s.mi)) { touched[s.mi] = true; continue; }
        firstUn = i;
      } else if (s.kind === 'vocab') {
        if (this._getLearnedWords(dayIdx)) { touched[s.mi] = true; continue; }
        firstUn = i;
      }
      // sentence / translate / passage 步骤没有独立答题记录：它们排在
      // 所属模块的题目之前，跟随后面的题目状态一起被跳过或重做。
    }
    if (firstUn < 0) {
      // 正课全做完了 → 停在**错题巩固的第一屏**（错题重练 / 错词跟读）。
      // v120 之前这里直接返回完成页，于是孩子一退出再进来，答错的题和读错的
      // 词就再也见不到了 —— 家长要的"把错题再返回练一下"必须能回得来。
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].kind === 'retry' || steps[i].kind === 'review') return i;
      }
      return steps.length;
    }

    const target = steps[firstUn];
    if (!touched[target.mi]) {
      // 模块还没动过：回到该模块的第一屏（听读句子等引导），孩子
      // 不会一头撞进没有上下文的题目里。
      for (let i = 0; i < firstUn; i++) {
        if (steps[i].mi === target.mi) return i;
      }
    }
    return firstUn;
  },

  // Single funnel for every answered question. Fire-and-forget: the DOM
  // feedback the caller renders is what the child sees, not this.
  _recordAnswer(dayIdx, moduleIdx, qIdx, value, correct) {
    if (this.isTeacher() || !this.state.phone) return;
    const sid = this._myStudentId();
    const who = this._myWho();
    Api.saveAnswer(sid, dayIdx, moduleIdx, qIdx, value, correct)
      .then(res => res.recorded
        ? Api.saveCheckin(sid, dayIdx, this._countDayQuestions(dayIdx), who)
        : null)
      .catch(e => console.warn('Record answer failed:', e));

    // Wrong answers also get pushed to the D1 archive so the teacher's
    // "错题本 / 错题卷打印" actually has data to work with — without this
    // the teacher only ever sees rows they locally tap on their own device.
    // Same fire-and-forget rule: a failed report must not punish the kid.
    if (!correct) {
      const payload = this._buildWrongQuestionPayload(dayIdx, moduleIdx, qIdx, value);
      if (payload) {
        const me = this.state.students.find(s => s.phone === this.state.phone);
        const sName = me ? me.name : (this.state.name || '');
        Api.reportWrongQuestion(sid, sName, this.state.phone, payload)
          .catch(e => console.warn('Report wrong-question failed:', e));
      }
    }

    // 孩子答完一道题后不再自动翻页——之前的 _scheduleAdvance(1300) 会
    // 让 stage-next-btn 自己跳题，跟读模块的"≥60 才能进下一题"挡不住它，
    // 上一题跟读一过它就替孩子翻了。改为：各题型自己 unlock stage-next-btn
    // （选项题跟读通过 / 填空题答对 / sentence 跟读通过），孩子在屏幕
    // 底部自己点"下一题"。答错时清掉任何遗留的计时器，避免前一个题
    // 的 1300ms 计时器偷偷替这一题翻页。
    clearTimeout(this._advanceTimer);
  },

  // Pull the question text + correct answer out of HOMEWORK_DATA for the
  // D1 archive. Returns null if the lookup fails (unknown shape) — the
  // caller skips the report in that case so we don't write garbage rows.
  _buildWrongQuestionPayload(dayIdx, moduleIdx, qIdx, studentValue) {
    const day = HOMEWORK_DATA[dayIdx];
    if (!day) return null;
    const m = (day.modules || [])[moduleIdx];
    if (!m) return null;
    let question = '', correctAnswer = '';
    let explanation_cn = m.explanation_cn || '';
    let explanation_en = m.explanation_en || '';
    if (Array.isArray(m.questions) && m.questions[qIdx]) {
      const q = m.questions[qIdx];
      question = q.question || q.sentence || q.text || q.id || '';
      if (Array.isArray(q.options)) {
        const idx = (typeof q.answer === 'number') ? q.answer : -1;
        correctAnswer = idx >= 0 ? (q.options[idx] || '') : '';
      } else {
        correctAnswer = (q.answer != null) ? String(q.answer) : '';
      }
      if (q.explanation_cn) explanation_cn = q.explanation_cn;
      if (q.explanation_en) explanation_en = q.explanation_en;
    } else if (Array.isArray(m.blanks) && m.blanks[qIdx]) {
      const b = m.blanks[qIdx];
      question = (day.day_cn || '') + ' · ' + (m.name_cn || '写作') + ' · 填空' + b.id;
      correctAnswer = b.answer || '';
    } else {
      return null;
    }
    return {
      day_idx: dayIdx,
      module_idx: moduleIdx,
      q_idx: qIdx,
      day_cn: day.day_cn || '',
      module_cn: m.name_cn || '',
      question: question,
      correct_answer: correctAnswer,
      student_answer: studentValue != null ? String(studentValue) : '',
      explanation_cn: explanation_cn,
      explanation_en: explanation_en,
    };
  },

  // Pull this kid's wrong-answer record from the local store. Falls back to
  // the cloud cache (loaded by _loadCloudWrongCache) when the local row is
  // missing — the typical case is a kid who answered on phone A and the
  // teacher is checking on phone B.
  _lookupWrongAnswer(studentId, dayIdx, moduleIdx, qIdx) {
    const key = Api.answerKey(studentId, dayIdx, moduleIdx, qIdx);
    const local = this.state.answers[key];
    if (local) return local;
    const cloud = (this.state.cloudWrongCache || {})[key];
    if (!cloud) return null;
    // Shape the cloud row into the same record shape local answers use so the
    // renderers don't have to care where the data came from.
    return {
      id: cloud.id, studentId: cloud.student_id,
      dayIdx: cloud.day_idx, moduleIdx: cloud.module_idx, qIdx: cloud.q_idx,
      value: cloud.student_answer, correct: false,
      at: cloud.recorded_at, fromCloud: true,
    };
  },

  // Fetch every cloud wrong-question once, key by (student,day,module,q).
  // Cached on state so repeated renders (e.g. clicking each student) don't
  // refetch. Reload is triggered manually after the teacher clears rows.
  async _loadCloudWrongCache() {
    if (!this.isTeacher()) return;
    if (this.state._cloudWrongLoaded) return;
    if (this._cloudWrongLoading) {
      // Another render is already loading; wait for it.
      await this._cloudWrongLoading;
      return;
    }
    const teacher = this.state.phone || '';
    this._cloudWrongLoading = Api.getAllWrongQuestions(teacher).then(rows => {
      const cache = {};
      rows.forEach(r => {
        const key = Api.answerKey(r.student_id, r.day_idx, r.module_idx, r.q_idx);
        // If the kid answered wrong more than once on the same question, the
        // server keeps only the first; but the latest fetch might race with
        // a fresh report, so prefer the newer timestamp when both exist.
        if (!cache[key] || (cache[key].recorded_at < r.recorded_at)) {
          cache[key] = r;
        }
      });
      this.state.cloudWrongCache = cache;
      this.state._cloudWrongLoaded = true;
      this._cloudWrongLoading = null;
    }).catch(e => {
      console.warn('Load cloud wrong cache failed:', e);
      this._cloudWrongLoading = null;
    });
    await this._cloudWrongLoading;
  },

  isWeChat() {
    return /MicroMessenger/i.test(navigator.userAgent);
  },

  // Real-time name format validation
  checkNameFormat() {
    var input = document.getElementById('login-name');
    var hint = document.getElementById('name-hint');
    var errEl = document.getElementById('name-error');
    if (!input || !hint) return;
    var val = input.value.trim();
    var nameRegex = /^[\u4e00-\u9fa5]{2,4}-[A-Za-z]{2,20}$/;
    if (val === '') {
      hint.style.color = 'var(--text-sub)';
      hint.textContent = '格式：中文名(2-4字) + 减号 + 英文名(2-20字母)，如：马慧-Amy';
      if (errEl) errEl.style.display = 'none';
    } else if (nameRegex.test(val)) {
      hint.style.color = 'var(--success)';
      hint.textContent = '✅ 格式正确';
      if (errEl) errEl.style.display = 'none';
    } else {
      hint.style.color = 'var(--danger)';
      if (val.indexOf('-') === -1) {
        hint.textContent = '⚠️ 缺少减号"-"，正确格式：中文名-英文名（如：马慧-Amy）';
      } else {
        var parts = val.split('-');
        if (parts[0] && !/^[\u4e00-\u9fa5]{2,4}$/.test(parts[0])) {
          hint.textContent = '⚠️ 中文名需要2-4个汉字';
        } else if (parts[1] && !/^[A-Za-z]{2,20}$/.test(parts[1])) {
          hint.textContent = '⚠️ 英文名需要2-20个英文字母';
        } else {
          hint.textContent = '⚠️ 格式不正确，正确格式：中文名-英文名（如：马慧-Amy）';
        }
      }
    }
  },

  async login() {
    const btn = document.getElementById('login-btn');
    // v140（家长 2026-10-18）：点登录的第一瞬间就要有反应 —— 按压变色 +
    // 震动 + 按钮立刻变成"正在进入…"。以前要等好几秒网络才跳页面，学生
    // 以为没点上，又连点好几下。
    if (btn) {
      btn.classList.add('logging-in');
      btn.innerHTML = '⏳ 正在进入…';
    }
    try { if (navigator.vibrate) navigator.vibrate(35); } catch (e) {}

    const phone = document.getElementById('login-phone').value.trim();
    const name = document.getElementById('login-name').value.trim();
    const restoreBtn = function() {
      if (!btn) return;
      btn.classList.remove('logging-in');
      btn.innerHTML = '登录';
    };
    if (!phone || phone.length < 11) { restoreBtn(); alert('请输入正确的11位手机号'); return; }
    if (!name) { restoreBtn(); alert('请输入备注名'); return; }

    // Validate name format: must be 中文名-英文名
    const nameRegex = /^[\u4e00-\u9fa5]{2,4}-[A-Za-z]{2,20}$/;
    if (!nameRegex.test(name)) {
      restoreBtn();
      var errEl = document.getElementById('name-error');
      if (errEl) {
        errEl.style.display = 'block';
        errEl.scrollIntoView({behavior:'smooth', block:'center'});
      }
      alert('备注名格式不正确！必须按"中文名-英文名"格式填写，例如：马慧-Amy\n（中文名2-4个汉字，英文名2-20个字母）');
      return;
    }

    this.state.phone = phone;
    this.state.userName = name;

    // Enable audio on user interaction (login click is a valid user gesture)
    this.state.audioEnabled = true;
    this._ttsUnlocked = true;
    // Unlock Web Audio API context (for sound effects)
    var ctx = this._getAudioCtx();
    if (ctx && ctx.state === 'suspended') { ctx.resume(); }

    // CRITICAL: Unlock the persistent audio element NOW (within user gesture).
    // This must happen BEFORE any async calls (registerStudent uses await)
    // because the browser only allows audioEl.play() inside a user gesture.
    // Once unlocked here, subsequent play() calls will work even after async.
    // Uses an inline silent WAV (no network dependency) for maximum reliability.
    var unlockAudioEl = document.getElementById('tts-player');
    if (unlockAudioEl) {
      unlockAudioEl.src = this.SILENT_WAV;
      unlockAudioEl.volume = 0;
      var unlockPromise = unlockAudioEl.play();
      if (unlockPromise && unlockPromise.then) {
        unlockPromise.then(function() { unlockAudioEl.volume = 1; })
                     .catch(function() { unlockAudioEl.volume = 1; });
      }
    }

    this.loadVoices();

    // Everything above ran synchronously inside the click so the audio
    // element is unlocked. Only now is it safe to await.
    //
    // v142（家长 2026-10-18）：这台设备以前登录过（凭据还在 localStorage
    // 或一年期 cookie 里）就**直接进**，不再站在登录页等删除状态的网络
    // 核对 —— 那是"等很久都登不进去"的唯一原因。新设备才核对。
    const prevCreds = (function() {
      try {
        if (typeof Api.savedLoginSync === 'function') return Api.savedLoginSync();
        if (typeof Api.getSavedLoginSync === 'function') return Api.getSavedLoginSync();
        return null;
      } catch (e) { return null; }
    })();
    const knownDevice = !!(prevCreds && prevCreds.phone === phone)
      // v144：凭据被系统清掉、但草稿里存着"这台设备登录过这个号" → 同样
      // 算老设备，点下去直接进（后台照样核对删除状态，被删的人 1~2 秒后出局）。
      || !!(this._loginDraftKnown && this._draftPhone === phone);
    try {
      // v143：同步拿会话（只比手机号），点下去这一帧就能切界面。
      // Api.login 的函数体会在第一个 await 之前就把 session 设好，所以这里
      // 直接读 Api.session，不用等它返回的 Promise。
      if (typeof Api.sessionSync === 'function') {
        Api.login(phone, name);
      }
      const session = Api.session || { phone: phone, name: name, role: 'student' };
      if (session.role === 'teacher') {
        this.state.role = 'teacher';
        this.state.className = '';
        this.showApp();
        restoreBtn();
      } else {
        this.state.role = 'user';
        this.registerStudent(phone, name, knownDevice);
      }
    } catch (e) {
      console.warn('login failed:', e);
      restoreBtn();
      alert('登录出了点问题，请再点一次「登录」');
    }
  },

  // Register student - goes straight in, no approval needed.
  // EXCEPT when the teacher removed them: then the server-side gate holds
  // them on the removed page until a re-join request is approved.
  // 学生登录。v142（家长 2026-10-18）：「登录界面花的时间太久，学生在这儿
  // 等很久都没有登进去」——根子是**进 App 之前必等一次网络核对**
  // （/api/class/status）。那个请求在 Worker 冷启动时能挂 20 秒（实测），
  // 再叠上 3 次重试，孩子就在登录页干等。
  //
  // 现在的规矩分两档：
  //   · 这台设备**以前登录过**（凭据还在 / 本机有这个学生）→ 立刻进 App，
  //     核对挪到后台。老师删掉的人 1~2 秒后会被踢到「已被移出」页，结果一样，
  //     只是不让孩子先等。
  //   · **全新设备**（查不到任何本地痕迹）→ 仍然先核对（≤4 秒一次、只重试
  //     一次）。查不到就按 v132 的规矩拦住，不给断网留口子。
  //
  // v132 的红线仍然守着：**核对没通过之前绝不把这个学生写进名单、绝不
  // syncToCloud**。所以即使被删的人短暂进了界面，也不会把老师删掉的名单
  // 滚回去。
  async registerStudent(phone, name, fast) {
    // 只有**明确**传 true 才走"不等网络"那条（login / 自动登录会传）。
    // 默认 false：任何其它调用方（含测试）都走核对，别让缺省值悄悄绕过
    // 老师的删除拦截。
    const known = (fast === true);

    // v143：按钮上**不再写「正在核对…」**。家长看到的正是这四个字，以为一直
    // 在核对。登录那一刻按钮已经变成「正在进入…」（见 App.login），核对再慢
    // 也不该改口。
    if (known) {
      // ---- 1) 立刻进去，零等待 ----
      this._enterAsStudent(phone, name);
      const lb = document.getElementById('login-btn');
      if (lb) { lb.classList.remove('logging-in'); lb.innerHTML = '登录'; }
      // ---- 2) 后台核对：真被删了就把人请出去 ----
      const self = this;
      this._gateCheck(phone).then(function(status) {
        if (!status) return;               // 查不到：保持现状，不写名单不上云
        if (status.removed) { self.showRemovedPage(status); return; }
        self._markDeviceKnown(phone, name);   // v144：核对通过 = 这台设备认识这个号
        self._commitStudent(phone, name);  // 确认没被删 → 才写名单 + 上云
      }).catch(function() {});
      return;
    }

    // ---- 全新设备：先核对，再进 ----
    // 只多试一次，等待也从 800/1600ms 压到 400ms（v142）：这一支站在登录
    // 路径上，孩子盯着屏幕数秒；而正常学生这条路一次就过。
    let status = await Api.classStatus(phone);
    if (status === null) status = await this._retryClassStatus(phone, 1);
    if (status === null) {
      const lbtn = document.getElementById('login-btn');
      if (lbtn) { lbtn.classList.remove('logging-in'); lbtn.innerHTML = '登录'; }
      this.showGateCheckFailed(phone, name);
      return;
    }
    if (status.removed) {
      const lbtn = document.getElementById('login-btn');
      if (lbtn) { lbtn.classList.remove('logging-in'); lbtn.innerHTML = '登录'; }
      this.showRemovedPage(status);
      return;
    }
    this._enterAsStudent(phone, name);
    this._markDeviceKnown(phone, name);   // v144：核对通过 → 下次一点就进
    this._commitStudent(phone, name);
    const lb2 = document.getElementById('login-btn');
    if (lb2) { lb2.classList.remove('logging-in'); lb2.innerHTML = '登录'; }
  },

  // 核对一次删除状态。后台路径（v142）：一次重试就够，不在登录路径上叠
  // 长重试 —— 每一跳都在花孩子的时间。
  async _gateCheck(phone) {
    return await this._retryClassStatus(phone, 1);
  },

  // 把学生放进来（纯本地，不碰网络）：切界面 + 本机登记一条记录。
  // 注意这里**不**写云端名单、不 syncToCloud —— 那属于 _commitStudent，
  // 要等核对通过才做（v132 的红线）。
  _enterAsStudent(phone, name) {
    this.state.parentStudents = this.state.parentStudents || {};
    this.state.parentStudents[phone] = { name: name, class: '', approved: false };

    let existing = this.state.students.find(s => s.phone === phone);
    if (!existing) {
      existing = {
        id: 's' + Date.now(),
        name: name,
        phone: phone,
        parentPhone: phone,
        class: '',
        approved: false,
        registeredAt: new Date().toISOString()
      };
      this.state.students.push(existing);
    } else {
      existing.name = name;
      existing.registeredAt = existing.registeredAt || new Date().toISOString();
    }
    try { Api.saveStudent(existing); } catch (e) {}   // 只写本机，瞬时

    this.showApp();
  },

  // 核对通过之后才做的收尾：本机名单上云 + 取班级分配（全部后台，不阻塞）。
  _commitStudent(phone, name) {
    const self = this;
    this.state.parentStudents = this.state.parentStudents || {};
    if (!this.state.parentStudents[phone]) {
      this.state.parentStudents[phone] = { name: name, class: '', approved: false };
    }
    Api.saveParentStudent(phone, this.state.parentStudents[phone])
      .catch(function(e) { console.warn('saveParentStudent error:', e); });
    this.syncToCloud();
    // 班级分配后台取，取到了再刷新角标（不做全屏重渲染，别打断做题）
    Api.fetchMyAssignment(phone).then(function(mine) {
      if (!mine || !mine.className) return;
      self.state.className = mine.className;
      self.state.students = self.state.students.map(s =>
        s.phone === phone ? Object.assign({}, s, { approved: true, class: mine.className }) : s);
      Api.saveStudents(self.state.students);
      const badge = document.getElementById('class-badge');
      if (badge && !self.isTeacher()) badge.textContent = mine.className;
    }).catch(function() {});
  },

  // v144：把"这台设备认识这个号"记进草稿。之后即使正式凭据被系统清掉，
  // 孩子刷新/重开时登录页也是填好的，一点就走"不等网络"那条路。
  _markDeviceKnown(phone, name) {
    try {
      if (typeof Api.writeLoginDraft === 'function') Api.writeLoginDraft(phone, name, true);
      this._loginDraftKnown = true;
      this._draftPhone = phone;
    } catch (e) {}
  },

  showWaitingPage() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    const wp = document.getElementById('waiting-page');
    if (wp) wp.classList.remove('hidden');
  },

  // ===== Removed-student gate =====
  // The teacher took this student out of the class. They cannot use the app
  // until they apply to re-join AND the teacher approves on the server.
  showRemovedPage(status) {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    const wp = document.getElementById('waiting-page');
    if (wp) wp.classList.add('hidden');
    const rp = document.getElementById('removed-page');
    if (rp) rp.classList.remove('hidden');
    // v145：标题复位。showGateCheckFailed 会把它改成"连不上服务器"，
    // 真被移出时必须改回来 —— 只有这里才允许出现"被移出"三个字。
    const tEl = document.getElementById('removed-title');
    const sEl = document.getElementById('removed-subtitle');
    if (tEl) tEl.textContent = '暂时无法进入';
    if (sEl) sEl.textContent = '你已被移出班级';
    this.state.removedStatus = status || { removed: true, request: null };
    this.renderRemovedCard();
    this.startRemovedPolling();
  },

  renderRemovedCard() {
    const card = document.getElementById('removed-card');
    const btn = document.getElementById('removed-btn');
    if (!card || !btn) return;
    const st = this.state.removedStatus || {};
    // v132：核对失败页（showGateCheckFailed 画的）自己管自己的按钮，
    // 这里别去覆盖它 —— 否则会把"重新核对"按钮改成"申请重新加入"。
    if (st.checkFailed) return;
    const req = st.request;
    const pending = !!(req && req.status === 'pending');
    const denied = !!(req && req.status === 'denied');
    let icon = '🚫', title = '你已被移出班级', desc = '如需重新加入，请提交申请，老师同意后自动进入';
    if (pending) {
      icon = '⏳'; title = '申请已提交';
      desc = '老师同意后这里会自动进入班级，请保持页面打开或稍后重新登录';
    } else if (denied) {
      icon = '📩'; title = '上次的申请未通过';
      desc = '老师没有同意这次申请。你可以再次提交申请，或直接联系老师';
    }
    card.innerHTML =
      '<div style="font-size:48px;margin-bottom:8px">' + icon + '</div>' +
      '<p style="font-size:15px;color:var(--warning);font-weight:600">' + title + '</p>' +
      '<p class="text-sub fs-12 mt-8">' + desc + '</p>';
    btn.textContent = pending ? '⏳ 等待老师同意…' : '✉️ 申请重新加入';
    btn.disabled = pending;
    btn.style.opacity = pending ? '0.6' : '1';
  },

  async applyRejoin() {
    const phone = this.state.phone, name = this.state.userName;
    if (!phone) return;
    const btn = document.getElementById('removed-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 提交中…'; }
    const res = await Api.classJoinRequest(phone, name);
    if (res && res.ok) {
      this.state.removedStatus = this.state.removedStatus || {};
      this.state.removedStatus.request = { status: 'pending' };
      this.renderRemovedCard();
      this.showToast('✅ 申请已提交，等待老师同意');
    } else {
      if (btn) { btn.disabled = false; btn.textContent = '✉️ 申请重新加入'; }
      this.showToast('⚠️ 提交失败，请检查网络后重试', 'warn');
    }
  },

  // While the student sits on the removed page, poll for the approval.
  // Approved → removed:false → registerStudent() runs for real this time.
  startRemovedPolling() {
    if (this._removedTimer) clearInterval(this._removedTimer);
    this._removedTimer = setInterval(async () => {
      const status = await Api.classStatus(this.state.phone);
      if (!status) return;                 // network hiccup: try again next tick
      if (!status.removed) {
        clearInterval(this._removedTimer);
        this._removedTimer = null;
        this.showToast('🎉 老师已同意，正在进入…');
        // v145：能坐在这个页上，说明这台设备早先核对通过过 → 秒进，不再等网络。
        this.registerStudent(this.state.phone, this.state.userName, true);
        return;
      }
      // Keep the request state fresh (pending/denied changes the card).
      this.state.removedStatus = status;
      this.renderRemovedCard();
    }, 15000);
  },

  // 拦截查询的短暂重试（v132）。只在"第一次没查到"时用，间隔递增。
  // 返回最后一次结果：拿到对象就返回它，三次都失败返回 null。
  async _retryClassStatus(phone, timesLeft) {
    if (timesLeft <= 0) return null;
    // v142：等待从 800/1600ms 压到 400ms。这条重试只用在登录路径上，
    // 目的是接住一次网络抖动，不是做长轮询 —— 每多等一秒都是孩子的等待。
    const wait = 400;
    await new Promise(r => setTimeout(r, wait));
    const s = await Api.classStatus(phone);
    if (s !== null) return s;
    return this._retryClassStatus(phone, timesLeft - 1);
  },

  // 三次都查不到拦截状态时显示。**不放行**，也不假装"你被删了"。
  // v145 大改（家长 2026-10-19 投诉「重新核对很久也登不进去」）：
  //   1. 标题不再是"你已被移出班级"——核对失败跟移出**没有关系**，以前
  //      复用移出页把静态标题一起带出来了，家长孩子都以为被老师踢了；
  //   2. **自动重试**：每 3 秒一次、最多 6 次，不用孩子一遍遍手点；
  //   3. 这台设备以前核对通过过（名单/草稿里有这个号）→ 重试时直接走
  //      "不等网络"那条路秒回 App，核对放后台。
  showGateCheckFailed(phone, name) {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    const wp = document.getElementById('waiting-page');
    if (wp) wp.classList.add('hidden');
    const rp = document.getElementById('removed-page');
    if (rp) rp.classList.remove('hidden');
    this.state.removedStatus = { checkFailed: true, request: null };
    // 标题动态改：核对失败 ≠ 被移出。
    const tEl = document.getElementById('removed-title');
    const sEl = document.getElementById('removed-subtitle');
    if (tEl) tEl.textContent = '连不上服务器';
    if (sEl) sEl.textContent = '别担心，这不是被移出班级';
    const card = document.getElementById('removed-card');
    const btn = document.getElementById('removed-btn');
    if (card) {
      card.innerHTML =
        '<div style="font-size:48px;margin-bottom:8px">📡</div>'
        + '<p style="font-size:15px;color:var(--warning);font-weight:600">正在核对你的身份</p>'
        + '<p class="text-sub fs-12 mt-8">正在重新连接，稍等几秒会自动进入。'
        + '会自动重试，也可以点下面的按钮。</p>';
    }
    if (btn) {
      btn.textContent = '🔄 立即重试';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.onclick = () => {
        btn.textContent = '⏳ 核对中…';
        // 设备认识这个号 → 秒回 App（后台再核对）；否则走完整核对。
        if (this._deviceKnows(phone)) this.registerStudent(phone, name, true);
        else this.registerStudent(phone, name);
      };
    }
    this._gateAutoRetry(phone, name, 6);
  },

  // 核对失败页的自动重试。3 秒一次、最多 left 次；页面被别的路径接走就停。
  _gateAutoRetry(phone, name, left) {
    clearTimeout(this._gateRetryTimer);
    if (left <= 0) return;
    const self = this;
    this._gateRetryTimer = setTimeout(async function () {
      const rp = document.getElementById('removed-page');
      if (!rp || rp.classList.contains('hidden')) return;   // 已经进 App / 换页了
      if (self._deviceKnows(phone)) { self.registerStudent(phone, name, true); return; }
      const s = await Api.classStatus(phone);
      if (s !== null && !s.removed) { self.registerStudent(phone, name, true); return; }
      if (s !== null && s.removed) { self.showRemovedPage(s); return; }
      self._gateAutoRetry(phone, name, left - 1);
    }, 3000);
  },

  // 这台设备是否"认识"这个号：草稿标了 known，或本机名单里已有这条记录。
  // 只有认识才允许走"不等网络"的重试 —— 新设备仍然要核对（v132 红线）。
  _deviceKnows(phone) {
    try {
      const d = (typeof Api.readLoginDraft === 'function') ? Api.readLoginDraft() : null;
      if (d && d.known && d.phone === phone) return true;
    } catch (e) {}
    if ((this.state.parentStudents || {})[phone]) return true;
    return (this.state.students || []).some(function (s) { return s.phone === phone; });
  },

  // v145：中途网络查不到时的横幅 —— **v146 已停用**。
  // 家长明确要求不要出现这类提示文字（2026-10-20）。
  // 保留这个函数只是为了让旧代码调用不报错：不管传什么，都只会把可能残留的
  // 横幅摘掉，绝不再新建。
  _netBanner(show) {
    const b = document.getElementById('net-status-banner');
    if (b) b.style.display = 'none';
    void show;
  },

  async logout() {
    clearTimeout(this._advanceTimer);
    clearTimeout(this._gateRetryTimer);   // v145：停掉核对失败页的自动重试
    this._netBanner(false);
    if (this._removedTimer) { clearInterval(this._removedTimer); this._removedTimer = null; }
    this.state.stepIdx = 0;
    // Clear saved login so auto-login doesn't re-login
    await Api.logout();
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    const wp = document.getElementById('waiting-page');
    if (wp) wp.classList.add('hidden');
    const rp = document.getElementById('removed-page');
    if (rp) rp.classList.add('hidden');
    this.state.removedStatus = null;
    // v144：退出登录**不清空**输入框 —— 草稿还在，返回登录页时手机号和
    // 姓名已经填好，孩子点一下「登录」就能回去（家长 2026-10-19）。
    try {
      const d = (typeof Api.readLoginDraft === 'function') ? Api.readLoginDraft() : null;
      const pEl = document.getElementById('login-phone');
      const nEl = document.getElementById('login-name');
      if (d) {
        if (pEl) pEl.value = d.phone || '';
        if (nEl) nEl.value = d.name || '';
        this._draftPhone = d.phone || '';
        this._loginDraftKnown = !!d.known;
      }
      const hint = document.getElementById('login-remember-hint');
      if (hint && pEl && nEl) {
        hint.style.display = (pEl.value.trim().length >= 11 && nEl.value.trim()) ? 'block' : 'none';
      }
    } catch (e) {}
    this.state.currentTab = 'weekly';
    this.state.audioEnabled = false;
    this.state.phone = '';
    this.state.userName = '';
    // Must clear too: isTeacher() reads role now, so a stale 'teacher' here
    // would survive logout (it used to be derived from phone, cleared above).
    this.state.role = '';
    this.state.className = '';
  },

  showApp() {
    document.getElementById('login-page').classList.add('hidden');
    // v143：开屏层到这里才算完成任务 —— 它盖着的是"正在进入…"。
    var splash = document.getElementById('boot-splash');
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    const wp = document.getElementById('waiting-page');
    if (wp) wp.classList.add('hidden');
    const rp = document.getElementById('removed-page');
    if (rp) rp.classList.add('hidden');
    // Entering the app means the removal gate is closed for this session.
    if (this._removedTimer) { clearInterval(this._removedTimer); this._removedTimer = null; }
    document.getElementById('main-app').classList.remove('hidden');
    // Default to the real today (teacher can still switch days for preview)
    this.state.currentTab = this.isTeacher() ? 'weekly' : 'today';
    this.state.currentDay = this.getTodayWeekdayIdx();
    // 学生：接着上次做到的地方继续，不从第一题重来（重新登录、更新
    // 自动刷新后同样生效）。老师保持第 0 步。
    this.state.stepIdx = this.isTeacher()
      ? 0
      : this._resumeStepIdx(this.state.currentDay);
    if (!this.isTeacher() && this.state.stepIdx > 0) {
      const n = this._buildSteps(this.state.currentDay).length;
      this.showToast(this.state.stepIdx >= n
        ? '✅ 今天的作业已经做完啦'
        : '📍 接着上次做到的地方继续');
    }
    clearTimeout(this._advanceTimer);
    // v120：把本机的历史打卡补报一次到后台（见 _backfillCheckins）。
    // v121：再绑一层"回到前台就补一次"，孩子不用做任何操作。
    // v122：之前是本机打卡压根没写下来（Api._answerPrefix 漏周标记），
    //       所以先重算再上报 —— 打开一次 App 就把这几天的补回来。
    this._backfillCheckins();
    this._bindCheckinUpload();
    // Update header name - show student name or teacher label
    const headerName = document.getElementById('header-name');
    if (headerName) {
      if (this.isTeacher()) {
        headerName.textContent = 'Amy老师';
      } else {
        headerName.textContent = this.state.userName || '同学';
      }
    }
    // Avatar follows the role: Amy's photo for the teacher, the students
    // photo for a child.
    const headerPhoto = document.getElementById('header-photo');
    if (headerPhoto) {
      headerPhoto.src = (this.isTeacher() ? 'photo.jpeg' : 'students.jpeg') + '?v=52';
      headerPhoto.alt = this.isTeacher() ? 'Amy老师' : '同学';
    }
    // Update class badge in header
    const badge = document.getElementById('class-badge');
    if (this.isTeacher()) {
      badge.textContent = this.state.classes.length > 0 ? this.state.classes.join(' / ') : '未设置班级';
    } else {
      badge.textContent = this.state.className || '待分配';
    }
    // Show/hide header buttons
    document.getElementById('invite-btn-header').style.display = this.isTeacher() ? '' : 'none';
    document.getElementById('settings-btn-header').style.display = this.isTeacher() ? '' : 'none';
    this.renderTabs();
    // v142（家长 2026-10-18）：「点了登录要等好一会才跳转」。点下之后这
    // 一大段是**同步**跑的：老师端的周报一次要渲染几十个学生，主线程被
    // 占住的这几百毫秒里，界面还停在登录页 —— 看起来就是"点了没反应"。
    // 现在先把界面切过去（头部、tab 立刻可见），内容挪到下一帧再画。
    var self = this;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function() { self.renderContent(); });
    } else {
      setTimeout(function() { self.renderContent(); }, 0);
    }
    // Cloud sync + auto-polling for BOTH roles:
    // - Teacher: download student registrations, merge & upload
    // - Student: download own class assignment (updates badge promptly
    //   whenever the teacher assigns a class)
    if (this.isTeacher()) {
      this.syncFromCloud().then(() => {
        // After downloading, also upload local data (merge)
        this.syncToCloud();
      });
    } else {
      this.syncFromCloud();
    }
    this.startAutoSync();
  },

  // ===== TTS / Voice =====
  // TTS callback system - lets question rendering know when audio finishes
  _ttsCallback: null,
  _currentAudio: null,
  _ttsUnlocked: false,  // Track if audio has been unlocked by user gesture
  _speakToken: 0,       // Incremented on each speak() call to invalidate stale callbacks

  // ===== 朗读设置 =====
  // 孩子要跟着读，原速太快跟不上。两个音源各降一次：
  //   - 音频标签（有道/百度/自建 TTS）走 playbackRate，改的是播放速度，
  //     preservesPitch 打开后音高不变，听上去只是说得慢，不变调。
  //   - speechSynthesis 走 rate。
  // 想再慢/再快，只改这两个数字即可。
  TTS_RATE: 0.78,       // 1 = 原速；0.78 ≈ 慢 22%
  SYNTH_RATE: 0.72,     // 浏览器内建语音的语速

  // 把音频标签的播放速度压到 TTS_RATE。每次起播都调用一次：换了 src 之后
  // 某些浏览器会把 playbackRate 重置回 1。
  _applyRate(el) {
    if (!el || !el.playbackRate) return;
    try {
      el.playbackRate = this.TTS_RATE;
      // 保持音高，否则慢速会变成"低沉怪声"，孩子更听不懂
      if ('preservesPitch' in el) el.preservesPitch = true;
      el.webkitPreservesPitch = true;
      el.mozPreservesPitch = true;
      el.msPreservesPitch = true;
    } catch (e) {}
  },

  // ===== 只读英文，绝不读中文 =====
  // 题目里混着中文：释义（"美丽的，漂亮的"）、答题提示（"[填入正确形式]"）、
  // 中文题干（"听到的句子是什么？"）。这些交给英文音源读出来是一串怪音，
  // 孩子听不出是什么，也没必要听。所以朗读前统一过一遍：
  //   - 中文、中文标点、全角字符 → 去掉
  //   - [中文提示] → 去掉
  //   - (visit) 这样括号里是英文的保留，是中文注释的去掉
  //   - 空位 ___ 读作 blank，跟读时能听出"这里空着一格"
  // 返回空串表示这一句没有可读的英文，调用方应当直接跳过朗读。
  _ttsText(text) {
    var s = String(text === null || text === undefined ? '' : text);
    if (!s) return '';
    // 中日韩文字、中文标点、全角字符
    s = s.replace(/[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/g, ' ');
    // 方括号里的内容整段丢掉（都是中文答题提示）
    s = s.replace(/\[[^\]]*\]/g, ' ');
    // 圆括号：里面还有英文字母的保留（I ___ (visit) ...），否则丢掉
    s = s.replace(/\(([^)]*)\)/g, function(m, inner) {
      return /[A-Za-z]/.test(inner) ? ' (' + inner.trim() + ')' : ' ';
    });
    // I ___ (visit) 里的空位读成 blank
    s = s.replace(/_{2,}/g, ' blank ');
    s = s.replace(/[ \t]+/g, ' ');
    s = s.replace(/\s+([,.!?;:])/g, '$1').trim();
    return s;
  },

  // 把题干拆成「指令 / 题目本体 / 中文提示」三段。
  // KET/PET 题干里的英文指令（"Choose the correct answer."、"Complete the
  // second sentence..."）是写给做题人的操作说明，不是题目内容 —— 朗读要
  // 跳过它，显示时也单独占一行，让英文题目另起一行。
  //
  // 指令的判定要避开正文：像 "Look! The children ___ (play) ..." 里的
  // "Look!" 是句子本身的一部分。所以指令必须至少 3 个词、且以句号收尾，
  // "Look!" 这种一个词加感叹号的不会命中。
  _stemParts(text) {
    var s = String(text === null || text === undefined ? '' : text).trim();
    if (!s) return { instr: '', rest: '', hint: '' };
    // [填入正确形式] 这类中文提示：拎出来，显示时单独放最后一行
    var hint = '';
    s = s.replace(/\[[^\]]*\]/g, function(mm) {
      if (/[\u4e00-\u9fff]/.test(mm)) { hint = (hint ? hint + ' ' : '') + mm.trim(); return ' '; }
      return mm;                    // 方括号里是英文的（罕见）留在正文
    });
    var instr = '';
    var rest = s;
    var prev = null;
    while (prev !== rest) {
      prev = rest;
      // 前缀里的考试标签：KET: / PET：/ KET/PET.
      rest = rest.replace(/^\s*(?:ket\s*\/\s*pet|ket|pet|fce)\s*[:：.、]?\s*/i, function(mm) {
        instr += (instr ? ' ' : '') + mm.trim(); return ' ';
      });
      // 开头的英文指令句：动词开头、一直到第一个句号/冒号为止，后面的
      // 破折号一并带走。注意两点：
      //  1) 词原子必须排除终止符（[^.。:：!?？！\s]+）——用 \S+ 会贪婪地
      //     把句号吃进词里，惰性量符就失效了，整句会被当成指令吞掉（实测
      //     复现过）；! 和 ? 也一并排除，否则 "Look! The children ..."
      //     这种句子本体会被当成指令。
      //  2) 要求至少 3 个词，进一步避开感叹开头。
      rest = rest.replace(/^\s*(?:please\s+)?(?:choose|select|complete|fill|listen|circle|match|tick|write|read|look|answer|put|pick)\b[^.。:：!?？！]*[.。:：]\s*(?:[—–-]\s*)?/i, function(mm) {
        if ((mm.match(/[^.\s]+/g) || []).length < 3) return mm;   // 太短，不是指令句
        instr += (instr ? ' ' : '') + mm.trim(); return ' ';
      });
    }
    return { instr: instr.trim(), rest: rest.trim(), hint: hint.trim() };
  },

  // 学生界面的题干排版：指令一行（灰色小字）、英文题目另起一行（正文）、
  // 中文提示再一行（橙色小字）。中文题干没有指令，原样一行。
  _stemHtml(text) {
    if (!text) return '';
    var p = this._stemParts(text);
    if (!p.instr && !p.hint) return String(text);   // 没什么可拆的，保持原样
    var html = '';
    if (p.instr) html += '<div class="q-instr">' + p.instr + '</div>';
    if (p.rest)  html += '<div class="q-main">' + p.rest + '</div>';
    if (p.hint)  html += '<div class="q-hint">' + p.hint + '</div>';
    return html;
  },

  // Inline silent WAV (~0.1s) — used to unlock the audio element inside a
  // user gesture WITHOUT any network request. Works offline, instant, and
  // can't be blocked by third-party TTS endpoints.
  SILENT_WAV: 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',

  // ===== Date helpers (homework dates) =====
  // Monday=0 .. Sunday=6
  getTodayWeekdayIdx() {
    return (new Date().getDay() + 6) % 7;
  },
  // Returns array of 7 Date objects (Mon..Sun) for the given week offset
  // (0 = this week, 1 = next week)
  getWeekDates(weekOffset) {
    var now = new Date();
    var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() - ((now.getDay() + 6) % 7) + (weekOffset || 0) * 7);
    var dates = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  },
  formatDateCn(d) {
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  },
  // Format a full date label for a homework day, e.g. "周一 · 8月24日"
  getDayDateLabel(dayIdx, weekOffset) {
    if (dayIdx < 0 || dayIdx > 6) return '';
    var d = this.getWeekDates(weekOffset || 0)[dayIdx];
    return this.formatDateCn(d);
  },
  // Is the given day index (of given week) actually today?
  isDayToday(dayIdx, weekOffset) {
    if (weekOffset) return false;
    return dayIdx === this.getTodayWeekdayIdx();
  },

  loadVoices() {
    if (!window.speechSynthesis) return;
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.state.voices = voices;
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    setTimeout(load, 500);
    setTimeout(load, 1500);
    setTimeout(load, 3000);
  },

  // Unlock audio on mobile (must be called from user gesture)
  enableAudio() {
    this.state.audioEnabled = true;
    this._ttsUnlocked = true;
    // Unlock Web Audio API context (for sound effects)
    var ctx = this._getAudioCtx();
    if (ctx && ctx.state === 'suspended') { ctx.resume(); }
    // Unlock the persistent audio element within user gesture
    // Uses an inline silent WAV (no network dependency) for maximum reliability.
    var unlockEl = document.getElementById('tts-player');
    if (unlockEl) {
      unlockEl.src = this.SILENT_WAV;
      unlockEl.volume = 0;
      var p = unlockEl.play();
      if (p && p.then) {
        p.then(function() { unlockEl.volume = 1; }).catch(function() { unlockEl.volume = 1; });
      }
    }
    // Directly speak a test phrase - this call is within the user gesture context,
    // so audioEl.play() will unlock the persistent audio element on mobile
    this.speak('Hello! Welcome to Amy English class.', { onDone: () => { this.renderContent(); } });
  },

  // Main speak function - robust TTS with multiple fallbacks
  // Primary: Youdao TTS (works for both words and sentences, most reliable)
  // Fallback: Baidu TTS (secondary, for when Youdao fails)
  // -------------------------------------------------------------------------
  // TTS 预取 —— 治的是"新出来一道题，要干等它开口"。
  //
  // 原来每换一题才去 /api/tts 取音频：孩子看到题 → 安静一秒多 → 才开始读。
  // 现在题一渲染出来，就顺手把接下来几句的音频取回本地存成 blob，真正要读的
  // 时候直接播本地文件，起播几乎瞬时。取回来的按文本缓存，重听不再走网络。
  //
  // 两条纪律（都是踩过坑换来的）：
  //
  //   1. 取的时候排一条队，最多五句同时在路上，永远先取离当前进度最近的
  //      那几句。原先是把后面五屏一次全甩出去 —— 口语题一屏 5 句（题面 +
  //      四个选项）就是 25 个请求同时打过去，实测并发到 25 时排在后面的要
  //      6 秒才回来。而孩子点选项那一刻要的正是其中一两句，预取反倒成了
  //      拖慢它的原因。（实测 8 个并发时每句仍是 2.2–2.6s，和 3 个并发没差，
  //      所以定在 5：够宽松不会拖慢，又比 3 快六成 —— 进第一屏时五个格子
  //      的音频能一起到手。）
  //   2. 扔的时候按"离当前进度有多远"，不是按取回来的先后。原先是谁先取
  //      回来谁先被顶掉，而下一屏的音频恰好是这一轮里最先取回来的 —— 结果
  //      每一题都是刚预取好就被扔掉，孩子点下去只能重新等网络，看着就是
  //      "点读反应越来越慢"。
  // -------------------------------------------------------------------------
  TTS_PREFETCH_MAX: 30,          // 本地最多留三十句音频，超出的按下述顺序释放
  TTS_PREFETCH_AHEAD: 5,         // 往前预取几步
  TTS_PREFETCH_CONCURRENCY: 5,   // 预取请求同时在路上的上限

  // 示范读音的"音色偏好"（v95）。只有 AI 口语练习用 'cf'：家长反馈阿里云
  // 读英文"太烂了"，而这个模块整屏都是英文对话句，量又小（每天 5 题 ×
  // 三四句），用得起 Cloudflare Deepgram 的母语音色。额度用完时服务端会
  // 自动落回阿里云，客户端不用管。其它模块保持默认（阿里云，便宜）。
  _stepTtsPrefer(step) {
    return (step && step.kind === 'speaking') ? 'cf' : '';
  },

  // 本地音频缓存的键。同一句话在两种音色下是两段不同的音频，键必须分开，
  // 否则谁先取到谁就一直被播（孩子在口语屏听到阿里云的口音就是这么来的）。
  _ttsKey(text, prefer) {
    return (prefer ? prefer + '|' : '') + text;
  },

  // 某一步会朗读的英文（和各个 step 渲染时读的是同一份文本）
  _stepSpeechText(steps, dayIdx, i) {
    var s = steps && steps[i];
    if (!s) return '';
    // 错词巩固屏：孩子落屏头一秒就会点单词听示范，提前把音频取好
    if (s.kind === 'review') return s.word || '';
    var day = HOMEWORK_DATA[dayIdx];
    var m = day && day.modules && day.modules[s.mi];
    if (!m) return '';
    if (s.kind === 'sentence') return this._splitSentences(m.passage)[s.si] || '';
    if (s.kind === 'translate') {
      var pairs = this._pairSentences(m);
      return (pairs && pairs[s.si] && pairs[s.si].en) || '';
    }
    if (s.kind === 'question') return this._questionSpeechText(m, m.questions[s.qi]);
    // 完形填空逐句翻译（v126）：听的是填满空之后的完整句
    if (s.kind === 'cqtrans') {
      var cs = this._splitSentences(m.passage)[s.si] || '';
      return this._clozeFillSentence(m, cs, false) || cs;
    }
    // 完形填空一组：整句（所有空都填好）就是孩子要听和要读的那句
    if (s.kind === 'clozegroup') {
      var fq = m.questions && m.questions[s.qi];
      return fq ? this._buildReadSentence(m, fq) : '';
    }
    if (s.kind === 'speaking') {
      var q = m.questions && m.questions[s.qi];
      return (q && (q.audio_text || q.sentence)) || '';
    }
    return '';
  },

  // 某一步"点了选项之后才会读"的句子。题面本身早就在预取了，但孩子
  // 点 ABCD 之后系统要读的是另外几句：口语模块读所选选项本身（对错
  // 都读），选择题模块读"题干+正确答案"拼成的整句。以前这些要等孩子
  // 点了才去现场生成音频，冷启动要干等好几秒；现在跟题面一起提前取好。
  _stepTapSpeechTexts(steps, dayIdx, i) {
    var s = steps && steps[i];
    if (!s) return [];
    var day = HOMEWORK_DATA[dayIdx];
    var m = day && day.modules && day.modules[s.mi];
    if (!m) return [];
    var out = [];
    if (s.kind === 'speaking') {
      var q = m.questions && m.questions[s.qi];
      if (q && q.options) {
        q.options.forEach(function(o) { if (o) out.push(String(o)); });
      }
    } else if (s.kind === 'question') {
      var q2 = m.questions && m.questions[s.qi];
      if (q2) {
        var rs = this._buildReadSentence(m, q2);
        if (rs) out.push(rs);
      }
    } else if (s.kind === 'clozegroup') {
      // 每个空选对后跟读的都是同一句填满后的完整句（一组共用一个跟读面板），
      // 所以只要取这一组第一空对应的那句就够。
      var fq0 = m.questions && m.questions[s.qi];
      if (fq0) {
        var grs = this._buildReadSentence(m, fq0);
        if (grs) out.push(grs);
      }
    } else if (s.kind === 'writingread') {
      // 这一屏的每一句都是孩子要点开听的，全部提前取好
      return this._writingSentences(m);
    }
    return out;
  },

  // 当前这一步通常正在播或刚要播，跳过它，只预取后面的。
  // 但当前这一屏"点了马上要读"的句子必须现在就手上有：孩子点它的那一刻
  // 不能再去网络要。听力题点错要立刻读所选句子、口语题点完选项要立刻读
  // 答句、写作朗读那一屏每一句都要点着听，都靠这一步兜住。
  prefetchUpcoming(steps, dayIdx, fromIdx) {
    if (!steps || typeof fetch !== 'function') return;
    var curStep = steps[fromIdx];
    var curPref = this._stepTtsPrefer(curStep);

    if (curStep) {
      var day0 = HOMEWORK_DATA[dayIdx];
      var cm = day0 && day0.modules && day0.modules[curStep.mi];
      var cq = cm && cm.questions && cm.questions[curStep.qi];
      var copts = (cq && cq.options) || [];
      for (var k = 0; k < copts.length; k++) {
        if (copts[k]) this.prefetchTts(String(copts[k]), fromIdx, curPref);
      }
      // 完形填空一组里的**每一个空**的选项都要预取（v126）——孩子在一屏里
      // 连选好几个空的答案，点错的选项也要立刻读出来，不能等。
      if (curStep.kind === 'clozegroup' && (curStep.qis || []).length) {
        for (var gi = 0; gi < curStep.qis.length; gi++) {
          var gq = cm && cm.questions && cm.questions[curStep.qis[gi]];
          var gopts = (gq && gq.options) || [];
          for (var gk = 0; gk < gopts.length; gk++) {
            if (gopts[gk]) this.prefetchTts(String(gopts[gk]), fromIdx, curPref);
          }
        }
      }
      // 当前屏自己的示范句也要：口语跟读的「先听一遍」读的是问句+答句整句，
      // 阅读逐句的听入口就是那句话本身 —— 孩子落在这屏的头几秒就会去点，
      // 不能等点了才现场生成。
      var curSay = this._stepSpeechText(steps, dayIdx, fromIdx);
      if (curSay) this.prefetchTts(curSay, fromIdx, curPref);
      // writingread 这一屏的句子孩子会一句句点着听，先全取回来
      var curTaps = this._stepTapSpeechTexts(steps, dayIdx, fromIdx);
      for (var n = 0; n < curTaps.length; n++) this.prefetchTts(curTaps[n], fromIdx, curPref);
    }

    for (var i = fromIdx + 1; i <= fromIdx + this.TTS_PREFETCH_AHEAD; i++) {
      var pref = this._stepTtsPrefer(steps[i]);
      this.prefetchTts(this._stepSpeechText(steps, dayIdx, i), i, pref);
      var taps = this._stepTapSpeechTexts(steps, dayIdx, i);
      for (var j = 0; j < taps.length; j++) this.prefetchTts(taps[j], i, pref);
    }
    this._ttsTrim();
  },

  // 把一句英文排进预取队列。stepIdx 是"这句话属于第几步"—— 取和扔都靠它
  // 排序：越靠近孩子当前这一步，越先取、越不容易被释放。
  // prefer 是音色偏好（'cf' = Cloudflare 母语音色，见 _stepTtsPrefer）。
  prefetchTts(text, stepIdx, prefer) {
    var t = this._ttsText(text);
    if (!t) return;
    t = t.substring(0, 500).trim();
    var pref = prefer || '';
    var key = this._ttsKey(t, pref);
    // 单词/字母也要预取：词汇模块"先听一遍"是串行播 5~6 段（逐字母 + 整词），
    // 每段现场去取的话中间全是空档，孩子看着格子干等。现在统一走自家端点
    // （服务端在额度用完时会自动换道有道/百度），取回来存本地，点哪段秒播。

    this._ttsBlobs = this._ttsBlobs || {};
    this._ttsPending = this._ttsPending || {};
    this._ttsBlobStep = this._ttsBlobStep || {};

    var st = (typeof stepIdx === 'number') ? stepIdx
           : ((this.state && typeof this.state.stepIdx === 'number') ? this.state.stepIdx : 0);
    var prev = this._ttsBlobStep[key];
    // 同一句可能在好几屏里都要用，记最早的那一步：走过它才允许释放。
    this._ttsBlobStep[key] = (typeof prev === 'number') ? Math.min(prev, st) : st;

    if (this._ttsBlobs[key] || this._ttsPending[key]) return;      // 已经取到 / 正在路上
    var q = this._ttsQueue = this._ttsQueue || [];
    for (var i = 0; i < q.length; i++) {
      if (q[i].key === key) return;                                // 已经排在队里
    }
    q.push({ key: key, text: t, prefer: pref, step: st });
    this._ttsPump();
  },

  // 队列泵：没到并发上限就再放一句出去，每次挑队里"离当前进度最近"的那句。
  // 就近优先而不是先进先出，是为了保证孩子在看的这一屏永远排在最前面 ——
  // 后面几屏晚一点回来没关系，当前这一屏晚一点都不行。
  _ttsPump() {
    var q = this._ttsQueue = this._ttsQueue || [];
    this._ttsRunning = this._ttsRunning || 0;
    var self = this;
    while (this._ttsRunning < this.TTS_PREFETCH_CONCURRENCY && q.length) {
      var best = 0;
      for (var i = 1; i < q.length; i++) {
        if (q[i].step < q[best].step) best = i;
      }
      var job = q.splice(best, 1)[0];
      if (this._ttsBlobs[job.key]) continue;                    // 等的时候已经到手了
      this._ttsRunning++;
      this._ttsPending[job.key] = true;
      // 每句的 key/text/prefer 都要绑在这次请求自己的闭包里：循环里的 var 是
      // 共享的，回调异步跑起来时早就被下一次迭代覆盖了 —— 那会把取回来的
      // 音频记到别人的键上，孩子点读时本地永远没有，白预取一场。
      (function(job) {
        var u = '/api/tts?text=' + encodeURIComponent(job.text)
              + (job.prefer ? '&prefer=' + encodeURIComponent(job.prefer) : '');
        fetch(u)
          .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
          .then(function(b) {
            self._ttsBlobs[job.key] = URL.createObjectURL(b);
            self._ttsBlobOrder = self._ttsBlobOrder || [];
            self._ttsBlobOrder.push(job.key);
            self._ttsTrim();
          })
          .catch(function() {
            // 取不到就照旧走网络路径，孩子那边不用等、也不需要知道
          })
          .then(function() {
            delete self._ttsPending[job.key];
            self._ttsRunning--;
            self._ttsPump();
          });
      })(job);
    }
  },

  // 孩子正在等这一句（他刚点下去）—— 把它插到队头，别排在一堆预取后面。
  _ttsPrioritize(text, prefer) {
    var q = this._ttsQueue;
    if (!q) return;
    var key = this._ttsKey(text, prefer || '');
    for (var i = 0; i < q.length; i++) {
      if (q[i].key === key) { q[i].step = -999; this._ttsPump(); return; }
    }
  },

  _ttsQueued(text, prefer) {
    var q = this._ttsQueue;
    if (!q) return false;
    var key = this._ttsKey(text, prefer || '');
    for (var i = 0; i < q.length; i++) {
      if (q[i].key === key) return true;
    }
    return false;
  },

  // 释放本地音频。扔的顺序不是"谁先取回来谁先走" —— 那正好会把孩子马上
  // 要用的那一句先扔掉（下一屏的音频最先取回、也最先被顶掉，结果每一题
  // 点下去都要重新等）。改成按"离当前进度多远"取舍：
  //   已经走过的屏 → 最先放； 还没到的屏 → 越远越先放； 当前这一屏 → 最后放。
  _ttsTrim() {
    var order = this._ttsBlobOrder;
    if (!order || order.length <= this.TTS_PREFETCH_MAX) return;
    var self = this;
    var cur = (this.state && typeof this.state.stepIdx === 'number') ? this.state.stepIdx : 0;
    var stepOf = function(t) {
      var s = self._ttsBlobStep && self._ttsBlobStep[t];
      return (typeof s === 'number') ? s : cur;
    };
    var rank = function(t) {
      var s = stepOf(t);
      if (s < cur) return 0;      // 已经走过：最先放
      if (s === cur) return 2;    // 正用着：最后放
      return 1;                   // 还没到：中间，越远越先放
    };
    var idx = order.map(function(_, i) { return i; });
    idx.sort(function(a, b) {
      var ra = rank(order[a]), rb = rank(order[b]);
      if (ra !== rb) return ra - rb;
      if (ra === 1) return stepOf(order[b]) - stepOf(order[a]);   // 远的先放
      if (ra === 0) return stepOf(order[a]) - stepOf(order[b]);   // 最旧的先放
      return a - b;                                               // 当前屏：按取回顺序
    });
    var drop = order.length - this.TTS_PREFETCH_MAX;
    var dead = {};
    for (var k = 0; k < drop && k < idx.length; k++) dead[idx[k]] = 1;
    var keep = [];
    for (var i2 = 0; i2 < order.length; i2++) {
      if (dead[i2]) { this._ttsDrop(order[i2]); continue; }
      keep.push(order[i2]);
    }
    this._ttsBlobOrder = keep;
  },

  _ttsDrop(t) {
    var u = this._ttsBlobs && this._ttsBlobs[t];
    if (this._ttsBlobs) delete this._ttsBlobs[t];
    if (this._ttsBlobStep) delete this._ttsBlobStep[t];
    if (u) { try { URL.revokeObjectURL(u); } catch (e) {} }
  },

  // Last resort: speechSynthesis (built-in, no network needed)
  speak(text, opts) {
    opts = opts || {};
    // 先过一遍「只读英文」的过滤：中文释义、答题提示在这里就被去掉了。
    // 一句里没有可读的英文，就直接当作读完 —— 门控该放行还是要放行，
    // 否则选项会一直锁着。
    var speakable = this._ttsText(text);
    if (!speakable) {
      this._showSpeakingIndicator(false);
      if (opts.onDone) opts.onDone();
      return;
    }
    text = speakable;

    // Stop any currently playing audio FIRST
    this._stopCurrentAudio();

    // Increment speak token — all async callbacks check this to detect
    // if they belong to a stale (superseded) speak() call
    this._speakToken = (this._speakToken || 0) + 1;
    var myToken = this._speakToken;

    this._showSpeakingIndicator(true);
    this._ttsCallback = opts.onDone || null;

    var self = this;
    var cleanText = text.substring(0, 500).trim();
    var encoded = encodeURIComponent(cleanText);
    // 音色偏好（v95）：'cf' = 先要 Cloudflare 的母语音色（AI 口语练习用）。
    // 缓存的键和请求参数都要跟着它走，否则会拿到另一条通道的旧音频。
    var prefer = opts.prefer || '';
    var tkey = this._ttsKey(cleanText, prefer);

    var audioEl = document.getElementById('tts-player');
    if (!audioEl) { audioEl = new Audio(); }
    this._applyRate(audioEl);

    self._currentAudio = audioEl;
    self._ttsDone = false;
    self._audioStarted = false;

    // Pick the endpoint by what is being spoken. Youdao's dictvoice is a
    // DICTIONARY endpoint: it returns audio for a word and HTTP 500 for a
    // sentence (measured). That is why words played and sentences were silent
    // — desktop happened to recover through speechSynthesis, mobile browsers
    // did not. Sentences therefore go to Baidu first, with our own same-origin
    // endpoint behind it.
    var isSentence = /\s/.test(cleanText.trim());
    var youdao = 'https://dict.youdao.com/dictvoice?audio=' + encoded + '&type=2';
    var baidu  = 'https://fanyi.baidu.com/gettts?lan=en&text=' + encoded + '&spd=3&source=web';
    var ownTts = '/api/tts?text=' + encoded + (prefer ? '&prefer=' + encodeURIComponent(prefer) : '');
    // Sentences go to our own origin FIRST. Routing them to Baidu instead of
    // Youdao fixed nothing on the phones — words still played and sentences
    // still did not, on both iOS Safari and Xiaomi's browser. Both remaining
    // suspects (a blocked third-party host, a cross-origin media restriction)
    // disappear when the audio comes from the same origin as the page.
    // Words keep Youdao: that path is the one already known to work.
    // 预取命中就直接播本地 blob —— 不用再等一次网络往返 + 模型生成。
    // 这是"题一出来就开始读"的关键：绝大多数时候音频早就躺在本地了。
    // 单词/字母也走缓存：词汇模块的"先听一遍"要串行播 5~6 个字母 + 整词，
    // 每一段都现场去有道取一次的话中间全是空档；预取回来就是一段接一段。
    var cachedTts = (self._ttsBlobs && self._ttsBlobs[tkey]) || null;
    var ttsUrl      = cachedTts || (isSentence ? ownTts : youdao);
    var fallbackUrl = isSentence ? baidu  : baidu;

    var timeoutId = null;
    var absoluteTimeout = null;
    var synthFallbackCalled = false;
    var baiduTried = false;

    function finishTTS() {
      if (self._ttsDone || myToken !== self._speakToken) return;
      self._ttsDone = true;
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
      if (absoluteTimeout) { clearTimeout(absoluteTimeout); absoluteTimeout = null; }
      self._showSpeakingIndicator(false);
      self._currentAudio = null;
      if (self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
    }

    function trySynthFallback() {
      if (self._ttsDone || myToken !== self._speakToken || synthFallbackCalled) return;
      synthFallbackCalled = true;
      try {
        audioEl.onplaying = null;
        audioEl.onended = null;
        audioEl.onerror = null;
        audioEl.pause();
      } catch(e) {}
      if (!self._audioStarted) {
        self._speakWithSynthesis(cleanText, opts, myToken);
      } else {
        finishTTS();
      }
    }

    audioEl.onplaying = function() {
      if (myToken !== self._speakToken) return;
      self._applyRate(audioEl);          // src 换过之后某些浏览器会重置回原速
      self._audioStarted = true;
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    };

    audioEl.onended = function() {
      finishTTS();
    };

    audioEl.onerror = function() {
      if (self._ttsDone || myToken !== self._speakToken) return;
      if (!self._audioStarted) {
        // Try Baidu as secondary fallback before speechSynthesis
        if (!baiduTried) {
          baiduTried = true;
          try {
            audioEl.src = fallbackUrl;
            audioEl.load();
            audioEl.play().catch(function() { trySynthFallback(); });
          } catch(e) { trySynthFallback(); }
        } else {
          trySynthFallback();
        }
      }
    };

    // If stalled (loading hangs), try Baidu then speechSynthesis
    audioEl.onstalled = function() {
      if (self._ttsDone || myToken !== self._speakToken || self._audioStarted) return;
      if (!baiduTried) {
        baiduTried = true;
        try {
          audioEl.src = fallbackUrl;
          audioEl.load();
          audioEl.play().catch(function() { trySynthFallback(); });
        } catch(e) { trySynthFallback(); }
      } else {
        trySynthFallback();
      }
    };

    // 开播动作收进一个函数：如果这句的音频正在预取（题一渲染就发出去了），
    // 先等它一小会儿 —— 直接再发一次请求等于两份生成音频赛跑，后发的
    // 那次常常更慢，孩子点完选项就是从这儿开始干等的。等到本地 blob 就
    // 直接播，基本瞬时；最多等 2.5 秒，取不回来就照旧走网络，行为不变。
    function startPlayback() {
      if (self._ttsDone || myToken !== self._speakToken) return;
      audioEl.src = ttsUrl;
      audioEl.load(); // Critical for Safari/cross-browser: must call load() after setting src
      self._applyRate(audioEl);

      var playPromise = audioEl.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function() {
          if (myToken !== self._speakToken) return;
          self._audioStarted = true;
          if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        }).catch(function(err) {
          if (self._ttsDone || myToken !== self._speakToken) return;
          // play() was rejected — likely autoplay restriction or network error
          // Try Baidu first, then speechSynthesis
          if (!baiduTried) {
            baiduTried = true;
            try {
              audioEl.src = fallbackUrl;
              audioEl.load();
              audioEl.play().then(function() {
                if (myToken !== self._speakToken) return;
                self._audioStarted = true;
                if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
              }).catch(function() { trySynthFallback(); });
            } catch(e) { trySynthFallback(); }
          } else {
            trySynthFallback();
          }
        });
      }

      // Safety timeout: if audio hasn't started in 2.5 seconds, try Baidu/synthesis
      timeoutId = setTimeout(function() {
        if (!self._ttsDone && !self._audioStarted && myToken === self._speakToken) {
          if (!baiduTried) {
            baiduTried = true;
            try {
              audioEl.src = fallbackUrl;
              audioEl.load();
              audioEl.play().then(function() {
                if (myToken !== self._speakToken) return;
                self._audioStarted = true;
              }).catch(function() { trySynthFallback(); });
            } catch(e) { trySynthFallback(); }
          } else {
            trySynthFallback();
          }
        }
      }, 2500);
    }

    // 孩子点下去要读的这句，如果音频正在取、或还排在预取队列里，就等它
    // 一下并让它插队 —— 直接再发一次请求等于两份音频赛跑，还要跟一堆预取
    // 抢浏览器连接，反而更慢。最多等 2.5 秒，等不到就照旧走网络，行为不变。
    var waitingForPrefetch = !cachedTts
      && ((self._ttsPending && self._ttsPending[tkey]) || this._ttsQueued(cleanText, prefer));
    if (waitingForPrefetch) {
      this._ttsPrioritize(cleanText, prefer);
      var waitedMs = 0;
      (function waitForPrefetch() {
        if (self._ttsDone || myToken !== self._speakToken) return;
        var hit = self._ttsBlobs && self._ttsBlobs[tkey];
        if (hit) { ttsUrl = hit; startPlayback(); return; }
        var busy = (self._ttsPending && self._ttsPending[tkey]) || self._ttsQueued(cleanText, prefer);
        if (waitedMs >= 2500 || !busy) { startPlayback(); return; }
        waitedMs += 120;
        setTimeout(waitForPrefetch, 120);
      })();
    } else {
      startPlayback();
    }

    // Absolute timeout: no matter what, stop indicator after 12 seconds.
    // If NOTHING ever started playing (all TTS sources failed), tell the
    // user instead of failing silently.
    absoluteTimeout = setTimeout(function() {
      if (!self._ttsDone && myToken === self._speakToken) {
        if (!self._audioStarted) {
          self.showToast('🔇 语音播放失败，可点击🔊按钮重试', 'warn');
        }
        finishTTS();
      }
    }, 12000);
  },

  _stopCurrentAudio() {
    // Increment speak token to invalidate ALL pending async callbacks
    // (audio element events AND speechSynthesis events) from previous calls
    this._speakToken = (this._speakToken || 0) + 1;
    this._ttsDone = true;
    this._audioStarted = false;
    
    if (this._currentAudio) {
      try { 
        this._currentAudio.onplaying = null;
        this._currentAudio.onended = null;
        this._currentAudio.onerror = null;
        this._currentAudio.onstalled = null;
        this._currentAudio.pause(); 
      } catch(e) {}
      this._currentAudio = null;
    }
    // Cancel any speechSynthesis that might be running
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
  },

  // speechSynthesis fallback (built into browser, no network needed)
  // token parameter ensures we only fire callbacks for the CURRENT speak() call
  _speakWithSynthesis(text, opts, token) {
    var self = this;
    var myToken = token || self._speakToken;
    if (!window.speechSynthesis) {
      this._showSpeakingIndicator(false);
      if (myToken === self._speakToken && self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = opts.rate || this.SYNTH_RATE;
      u.pitch = 1.0;
      u.volume = 1.0;

      // Load voices if needed
      if (this.state.voices.length === 0) {
        this.state.voices = window.speechSynthesis.getVoices() || [];
      }

      // Pick best available natural voice (auto-assign)
      var voices = this.state.voices;
      var voicePrefs = [
        'Microsoft Aria Online', 'Microsoft Jenny Online', 'Microsoft Aria', 'Microsoft Jenny',
        'Google US English', 'Samantha', 'Microsoft Zira',
        'Microsoft Guy Online', 'Microsoft Davis Online', 'Microsoft Guy', 'Microsoft Davis',
        'Karen', 'Moira', 'Tessa', 'Daniel', 'Alex'
      ];
      var chosen = null;
      for (var i = 0; i < voicePrefs.length; i++) {
        chosen = voices.find(function(v) { return v.name && v.name.indexOf(voicePrefs[i]) >= 0; });
        if (chosen) break;
      }
      if (!chosen) chosen = voices.find(function(v) { return v.lang && v.lang.indexOf('en') === 0; });
      if (chosen) u.voice = chosen;

      u.onend = function() {
        // Only fire if this is still the current speak call
        if (myToken !== self._speakToken) return;
        self._showSpeakingIndicator(false);
        if (self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
      };
      u.onerror = function() {
        // Only fire if this is still the current speak call
        if (myToken !== self._speakToken) return;
        self._showSpeakingIndicator(false);
        if (self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
      };

      // Timeout: if speech doesn't start in 3 seconds, call callback
      var started = false;
      u.onstart = function() {
        if (myToken !== self._speakToken) return;
        started = true;
        self._audioStarted = true; // synthesis is producing sound — don't fire the "failed" toast
      };
      setTimeout(function() {
        if (myToken !== self._speakToken) return;
        if (!started) {
          self._showSpeakingIndicator(false);
          if (self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
        }
      }, 3000);

      window.speechSynthesis.speak(u);
    } catch(e) {
      this._showSpeakingIndicator(false);
      if (myToken === self._speakToken && self._ttsCallback) { self._ttsCallback(); self._ttsCallback = null; }
    }
  },

  // Show/hide speaking indicator
  _showSpeakingIndicator(show) {
    var indicators = document.querySelectorAll('.auto-read-badge');
    indicators.forEach(function(el) {
      if (show) {
        el.classList.add('speaking');
        el.innerHTML = '<svg class="icon icon-sm speaking-anim"><use href="#i-sound"/></svg> \u6b63\u5728\u6717\u8bfb\u2026';
      } else {
        el.classList.remove('speaking');
        el.innerHTML = '<svg class="icon icon-sm"><use href="#i-check"/></svg> \u6717\u8bfb\u5b8c\u6210';
      }
    });
  },

  // ===== Global toast notification (non-blocking) =====
  _toastTimer: null,
  showToast(msg, type) {
    var t = document.getElementById('app-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'app-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'app-toast show' + (type ? ' ' + type : '');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(function() {
      t.classList.remove('show');
    }, 3000);
  },

  // ===== 平台统一规则：先听完，才能读 ====================================
  //
  // 凡是要求孩子朗读的地方（整句跟读、逐句跟读、写作朗读、字母/音节拼读、
  // 错词重读），都要先把那句的示范听完整才解锁。理由很实在：没听过就开口，
  // 读出来的是孩子自己"想当然"的音，越读越偏，纠正的成本比一开始就听高得多。
  //
  // 全平台只走一条路，不给每个面板各写一套：
  //   1. 渲染时朗读控件加 data-gate="<区域id>"，锁着的再带 class="gate-locked"；
  //   2. 区域里放一颗 <button class="gate-listen" data-gate data-say="示范内容">，
  //      点它 → 播示范 → 播完调 _gateUnlock 把该区域点亮；
  //   3. 全局在**捕获阶段**监听 pointerdown/touchstart/mousedown：凡是撞上带
  //      data-gate 且还没解锁的朗读控件，就地拦下（preventDefault +
  //      stopPropagation）。内联的 onpointerdown 和按钮自己的 touchstart 都还
  //      没轮到执行，录音压根不会启动 —— 不会留下"录了一半被掐断"的脏状态。
  _gates: {},

  // 周号：多周轮换后，key 要按周分段（和 Api._weekTag 同一套规则）。
  _weekIdx() {
    return (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0;
  },
  _weekTag() {
    const w = this._weekIdx();
    return w > 0 ? '_w' + w : '';
  },

  // v134：把「当前生效的一周」对齐到该对齐的那一周。
  //
  // 只有老师、且**正停在预览页**时才切到别的周；其它一切情况都强制回到本周。
  // 所以这不是"设一次状态"，而是**每次渲染都重新宣告一次** —— 中途抛错、
  // 没走到恢复那一步也没关系，下一帧自己纠正。
  //
  // 判定挂的是 currentTab，不是 previewDay：老师只要切走标签，周次立刻还原。
  // （挂 previewDay 会留个坑 —— 切回周计划时 previewDay 还在，周计划就会
  //  把下周的题当成本周的显示，正好是这次要修的那个毛病。）
  _syncWeekData() {
    if (typeof hwSetActiveWeek !== 'function') return;   // 老缓存里没有，不动
    hwSetActiveWeek(this._previewWeekOffset());
  },

  // 当前应该生效的周偏移。0 = 本周。
  _previewWeekOffset() {
    if (!this.isTeacher()) return 0;
    if (this.state.currentTab !== 'preview') return 0;
    return this.state.previewWeek || 0;
  },

  // 老师此刻是不是真的在预览舞台上（学生端永远 false）
  _inPreview() {
    return this.isTeacher() && this.state.currentTab === 'preview';
  },

  _gateOpen(gid) { return !!this._gates[gid]; },

  // 门禁 id 统一从这里出，**必须带"第几天"**：题号 mi/qi 在不同天是重复的，
  // 只用题号的话，孩子切到另一天的同一题会被当成"已经听过了"，门就白设了。
  _gid(prefix) {
    const rest = Array.prototype.slice.call(arguments, 1);
    return prefix + '@' + this.state.currentDay + ':' + rest.join('-');
  },

  // 解锁一个区域：把手底下所有挂着同一 gid 的控件点亮。
  _gateUnlock(gid) {
    if (!gid) return;
    this._gates[gid] = true;
    this._syncGates();
  },

  // 按当前 _gates 把（可能刚重建过的）DOM 重新点亮一遍。
  // 面板每次重渲染都是新节点，带上 gate-locked，所以渲染后要 sync 一次，
  // 免得"已经听过了却还是灰的"。
  _syncGates(root) {
    const scope = root || document;
    const self = this;
    scope.querySelectorAll('[data-gate]').forEach(function(el) {
      const isListen = el.classList.contains('gate-listen') || el.getAttribute('data-listen') === '1';
      if (!isListen) {
        if (self._gates[el.getAttribute('data-gate')]) el.classList.remove('gate-locked');
        return;
      }
      // 听入口一出现就把它要播的东西预取好：孩子点「先听一遍」时音频应该
      // 已经在本地了，点下去就是 0 延迟，而不是现场等网络生成那两三秒。
      // prefetchTts 自带去重，这里反复触发也不会重复发请求。
      const pref = el.getAttribute('data-prefer') || '';
      const seq = el.getAttribute('data-seq');
      if (seq) {
        seq.split('|').forEach(function(item) { if (item) self.prefetchTts(item, undefined, pref); });
      } else {
        const say = el.getAttribute('data-say');
        if (say) self.prefetchTts(say, undefined, pref);
      }
    });
  },

  // 没听就想读 → 抖一下 + 说清楚该点哪儿（不弹窗打断，只用一条轻提示）
  _gateNudge(gid) {
    const now = Date.now();
    if (this._gateNudgeAt && now - this._gateNudgeAt < 900) return;   // 一次手势别提示两遍
    this._gateNudgeAt = now;
    let msg = '';
    document.querySelectorAll('[data-gate="' + gid + '"]').forEach(function(el) {
      if (el.classList.contains('gate-listen') || el.getAttribute('data-listen') === '1') return;
      // 允许各个界面自己写提示语：v137 翻译屏要用"先听英文再说中文"，
      // 跟读屏用默认那句，两种场景一句话说不清。
      if (!msg && el.getAttribute('data-nudge')) msg = el.getAttribute('data-nudge');
      el.classList.add('gate-shake');
      setTimeout(function() { el.classList.remove('gate-shake'); }, 460);
    });
    // 顺手把"该点哪儿"指出来：专用按钮，或者本身就是句子的那个听入口
    const listen = document.querySelector('.gate-listen[data-gate="' + gid + '"], [data-gate="' + gid + '"][data-listen="1"]');
    if (listen) {
      listen.classList.add('gate-hint-glow');
      setTimeout(function() { listen.classList.remove('gate-hint-glow'); }, 1250);
    }
    this.showToast(msg || '🔊 先听一遍示范，再开口读哦', 'warn');
  },

  // 那颗「🔊 先听一遍」按钮。say 是示范内容（英文），label 可换措辞。
  // prefer 是音色偏好（'cf' = Cloudflare 母语音色，AI 口语练习用），
  // 挂在 data-prefer 上，播放和预取都从属性里读 —— 免得每处各写一份。
  _gateListenHtml(gid, say, label, prefer) {
    return '<button type="button" class="gate-listen" data-gate="' + gid
      + '" data-say="' + this._escHtml(say) + '"'
      + (prefer ? ' data-prefer="' + this._escHtml(prefer) + '"' : '')
      + '>' + (label || '🔊 先听一遍') + '</button>';
  },

  // 依次播放一串示范音（字母 → 音节 → 整词）。TTS 一次只放一条，所以上一条
  // 播完了才放下一条；中间任何一条哑火也不会卡住，外层的兜底计时器会放行。
  _speakSeq(items, onAllDone, prefer) {
    const self = this;
    let i = 0;
    const next = function() {
      if (i >= items.length) { if (onAllDone) onAllDone(); return; }
      const t = items[i++];
      if (!t) { next(); return; }
      self.speak(t, { onDone: function() { setTimeout(next, 0); }, prefer: prefer || '' });
    };
    next();
  },

  // 兜底放行时间：示范可能因为断网/系统静音根本没响，onDone 就永远不来。
  // 按句子长短给一个上限，最迟也会放行 —— 不能因为听不到声把孩子锁死在题目里。
  // v92：拼读示范从逐段串播改成单段连读（首次要等阿里云合成 + 完整播放），
  // 上限从 2500+n*450 提到 3500+n*600，避免合成慢的时候提前解锁。
  _gateFallbackMs(say) {
    const n = String(say || '').split(/\s+/).filter(Boolean).length;
    return Math.max(5000, Math.min(15000, 3500 + n * 600));
  },

  _gateGuardBound: false,
  // ===== v129：长按不被「复制 / 选中」抢走 =====
  //
  // 家长 2026-10-16：「按住说中文这里，因为在浏览器1点它就会显示复制，导致很多次
  // 点了之后并不能读，而是一直点复制，导致进程加慢。有的浏览器不会这样，但是有的
  // 就是这样。」
  //
  // 为什么光靠 CSS 修不掉：
  //   · 长按那一下，浏览器**先**发 selectstart / 开始选词，**再**弹「复制」菜单。
  //     菜单一出来，指针就被系统接管 —— 我们的 pointerup 永远收不到，录音一直挂着，
  //     孩子得等 15 秒看门狗才恢复。这就是他说的"进程加慢"。
  //   · 家长按的是**句子**（那一屏句子就在按钮上方），而句子当时是可选中文字。
  //   · 微信 / UC / 夸克内置浏览器对 -webkit-touch-callout 的支持不一致，
  //     CSS 挡不住，必须事件层兜住。
  //
  // 三件事一起做才稳：CSS 禁选（见 index.html）＋ 事件拦截 ＋ 录音掉线自愈。
  _bindNoCopy() {
    if (this._noCopyBound) return;
    this._noCopyBound = true;
    const doc = document;
    // 输入框 / 可编辑区必须放行 —— 登录、填词、作文都要能选中和粘贴。
    const isEditable = function(t) {
      if (!t || !t.tagName) return false;
      const tag = t.tagName.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (t.isContentEditable) return true;
      return !!(t.closest && t.closest('input,textarea,select,[contenteditable="true"]'));
    };

    // ① 选词一开始就掐掉：这是"复制"菜单真正的入口。
    const killSelect = function(ev) {
      if (isEditable(ev.target)) return;
      ev.preventDefault();
    };
    doc.addEventListener('selectstart', killSelect, { passive: false });
    doc.addEventListener('dragstart', function(ev) {
      if (isEditable(ev.target)) return;
      ev.preventDefault();
    }, { passive: false });

    // ② 长按菜单（含 iOS 的放大镜 / 呼出菜单）。整页禁掉 —— 这是个学习
    //    应用，页面上的文字没有一处是给孩子复制的。
    doc.addEventListener('contextmenu', function(ev) {
      if (isEditable(ev.target)) return;
      ev.preventDefault();
    });

    // ③ 录音期间"指针被系统抢走"的自愈：正常松手走 pointerup，可一旦弹了
    //    复制菜单 / 切了应用，pointerup 就永远不来。这几种情况一律当成松手
    //    收尾，别让孩子对着一个红按钮干等。
    const self = this;
    const bail = function() {
      if (self._holdKey) self._holdEnd();
    };
    // 手指离开视口 / 指针被取消 / 页面被切走
    doc.addEventListener('pointercancel', bail);
    window.addEventListener('blur', bail);
    doc.addEventListener('visibilitychange', function() {
      if (doc.hidden) bail();
    });
    // 兜底：真被抢走了，也不许一直挂着。正常屏（非自动收）把上限从 15 秒
    // 收到 10 秒 —— 孩子读一句话用不了这么久，早点收尾早点能重来。
    // 看门狗本身在 _holdStart 里挂，这里只改默认时长（见 HOLD_MAX_MS）。
  },

  // ===== v131：ASR 性能诊断面板（只在 ?perf=1 出现） ========================
  //
  // 家长要"出分快一点"，但快不快得有数字。这个面板把最近 30 次朗读的
  // 真实耗时、打了几趟、走了哪条通道摆在一起，方便对着它做优化。
  //
  // 三条硬规矩：
  //   ① 普通页面完全看不见（PERF_ENABLED() 为假时直接 return，容器
  //      始终 hidden、始终空 —— 学生和家长根本不知道它存在）；
  //   ② 只显示数字与枚举：耗时、趟数、通道名。**没有**录音内容、
  //      **没有** API Key、**没有**学生手机号；
  //   ③ 任何一步出错都静默吞掉（诊断面板绝不能影响正常打卡）。
  _setupPerfPanel() {
    try {
      if (!Api.PERF_ENABLED()) return;
      this._perfOn = true;
      const box = document.getElementById('perf-panel');
      if (!box) return;
      box.hidden = false;
      document.body.classList.add('perf-on');
      this._perfEl = box;
      this.renderPerfPanel();
      // 每次出分后自动刷新一下（renderPerfPanel 很轻，就是拼字符串）
      const self = this;
      this._perfTimer = setInterval(function() { self.renderPerfPanel(); }, 1500);
    } catch (e) { /* 诊断面板不许影响主流程 */ }
  },

  renderPerfPanel() {
    try {
      const box = this._perfEl;
      if (!box || !this._perfOn) return;
      const s = Api.perfSummary();
      const xs = Api.perfSamples();
      let html = '<h4>🔬 ASR 性能诊断（?perf=1）'
        + '<button class="pf-x" onclick="App.hidePerfPanel()">关闭</button>'
        + '<button class="pf-x" onclick="App.clearPerfPanel()">清空</button></h4>';
      if (!s) {
        html += '<div class="pf-note">还没有样本。去读一句英文/中文，这里就会出数字。</div>';
        box.innerHTML = html;
        return;
      }
      html += '<div class="pf-sum">样本 ' + s.n + ' 次 ｜ 均值 <b>' + s.avg
        + 'ms</b> ｜ p50 ' + s.p50 + ' ｜ p90 ' + s.p90 + ' ｜ 最慢 ' + s.max
        + 'ms<br>总趟数 ' + s.attempts + '（平均 ' + s.avgAttempts
        + ' 趟/次，重试过 ' + s.retried + ' 次）｜ 空结果 ' + s.empty
        + ' ｜ 报错 ' + s.errors + ' ｜ 判失败 ' + s.failed + ' ｜ 低分 ' + s.low + '</div>';
      html += '<table><tr><th>#</th><th>场景</th><th>总耗时</th><th>趟</th>'
        + '<th>空</th><th>通道</th><th>服务端 Server-Timing</th>'
        + '<th>音频</th><th>colo</th><th>结果</th></tr>';
      // 最新的在最上面
      for (let i = xs.length - 1; i >= 0; i--) {
        const x = xs[i];
        const slow = x.totalMs >= 4000 ? ' pf-slow' : '';
        const bad = (x.result === 'fail') ? ' pf-fail' : '';
        const chans = x.hops.map(h => h.channel || '-').join('/');
        const tim = x.hops.map(h => h.timing || '-').join(' / ');
        const aud = x.hops.map(h => h.audioIn || '-').join('/');
        const colo = x.hops.map(h => h.colo || '-').join('/');
        html += '<tr class="pf-row' + slow + bad + '">'
          + '<td>' + (i + 1) + '</td>'
          + '<td>' + this._perfEsc(x.what) + '</td>'
          + '<td>' + x.totalMs + 'ms</td>'
          + '<td>' + x.attempts + '</td>'
          + '<td>' + x.empty + '</td>'
          + '<td>' + this._perfEsc(chans) + '</td>'
          + '<td>' + this._perfEsc(tim) + '</td>'
          + '<td>' + this._perfEsc(aud) + '</td>'
          + '<td>' + this._perfEsc(colo) + '</td>'
          + '<td>' + this._perfEsc(x.result) + '</td>'
          + '</tr>';
      }
      html += '</table>';
      html += '<div class="pf-note">预算：整次朗读 ≤' + Api.ASR_MAX_TRIPS + ' 趟 / ≤'
        + (Api.ASR_BUDGET_MS / 1000) + 's。这里有"总耗时"和"几趟"两个数 —— '
        + '总耗时高但只 1 趟 = 单趟慢（网络/上游）；趟数多 = 在重试（该压重试）。</div>';
      box.innerHTML = html;
    } catch (e) { /* 同上 */ }
  },

  _perfEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  hidePerfPanel() {
    this._perfOn = false;
    if (this._perfTimer) clearInterval(this._perfTimer);
    this._perfEl = null;
    try {
      const box = document.getElementById('perf-panel');
      if (box) { box.hidden = true; box.innerHTML = ''; }
      document.body.classList.remove('perf-on');
    } catch (e) {}
  },

  clearPerfPanel() {
    Api.perfClear();
    this.renderPerfPanel();
  },

  _bindGateGuard() {
    if (this._gateGuardBound) return;
    this._gateGuardBound = true;
    const self = this;
    const closestGate = function(ev) {
      const t = ev.target;
      return (t && t.closest) ? t.closest('.gate-listen,[data-gate]') : null;
    };

    // 播示范 → 播完解锁。兜底计时器和真实回调赛跑，谁先到算谁，门一定开。
    const playAndUnlock = function(el, gid) {
      if (!el || !gid) return;
      if (el.dataset.playing === '1') return;          // 正在播，别叠第二遍
      el.dataset.playing = '1';
      el.classList.add('playing');
      // 点下去当场给反馈：一声轻快的短音 + 按钮字样换掉。示范音频就算
      // 还在路上，孩子也立刻知道"我点到了，它在放"——而不是干等两三秒
      // 什么动静都没有。
      self._playListenCue();
      let label = null;
      if (el.classList.contains('gate-listen') && el.innerHTML) {
        label = el.innerHTML;
        el.innerHTML = '🔊 示范播放中…';
      }
      const say = el.getAttribute('data-say') || '';
      const seq = el.getAttribute('data-seq');         // 一串示范（字母→音节→整词）
      const pref = el.getAttribute('data-prefer') || '';
      const done = function() {
        if (el.dataset.playing !== '1') return;
        el.dataset.playing = '';
        el.classList.remove('playing');
        if (label !== null) el.innerHTML = label;
        clearTimeout(el._gateTimer);
        self._gateUnlock(gid);
      };
      clearTimeout(el._gateTimer);
      el._gateTimer = setTimeout(done, self._gateFallbackMs(seq ? seq.split('|').join(' ') : say));
      if (seq) self._speakSeq(seq.split('|'), done, pref);
      else self.speak(say, { onDone: done, prefer: pref });
    };

    // ① 「先听一遍」按钮 + "还没听就想读"的拦截。
    //    走 pointerdown/touchstart：必须赶在控件自己的录音 handler 之前落地，
    //    否则点了就已经开录了，事后拦截只会留下一段半截录音。
    const guard = function(ev) {
      const el = closestGate(ev);
      if (!el) return;
      const gid = el.getAttribute('data-gate');
      if (!gid) return;

      if (el.classList.contains('gate-listen')) {
        ev.preventDefault();
        ev.stopPropagation();
        playAndUnlock(el, gid);
        return;
      }
      // 句子形态的听入口（data-listen）不在这一层处理 —— 见下面 click 那条。
      // 在这里吞掉 touchstart 会连页面滚动一起吞掉，孩子在这句话上往下滑都滑不动。
      if (el.getAttribute('data-listen') === '1') return;

      if (!self._gateOpen(gid)) {
        ev.preventDefault();
        ev.stopPropagation();
        self._gateNudge(gid);
      }
    };
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function(tn) {
      document.addEventListener(tn, guard, true);
    });

    // ② 句子形态的听入口（data-listen）：用 click。
    //    "点一下听一遍"是轻点，滑动翻页必须照常，所以不能用 touchstart。
    //    v109 起阅读逐句 / 写作朗读都改成「词可点 + 独立 🔊 按钮」，句子上
    //    不再挂 data-listen；这条留着是给以后可能出现的"整块文字就是听入口"
    //    的情形兜底，动它之前先确认还有没有别的界面在用。
    document.addEventListener('click', function(ev) {
      const el = closestGate(ev);
      if (!el || el.getAttribute('data-listen') !== '1') return;
      ev.preventDefault();
      ev.stopPropagation();
      playAndUnlock(el, el.getAttribute('data-gate'));
    }, true);

    // 面板重渲染会带出新的 gate-locked 节点（比如切到下一题、口语面板刷新），
    // 而"这句我早听过了"的状态是记在 _gates 里的。DOM 一有新节点就按记录
    // 校正一次，免得已听过的句子又变回灰的、孩子被迫再听第二遍。
    if (window.MutationObserver) {
      const mo = new MutationObserver(function() {
        if (self._gateSyncRaf) return;
        self._gateSyncRaf = requestAnimationFrame(function() {
          self._gateSyncRaf = null;
          self._syncGates();
        });
      });
      const boot = function() {
        if (document.body) mo.observe(document.body, { childList: true, subtree: true });
        else setTimeout(boot, 60);
      };
      boot();
    }
  },

  // Auto-speak with callback - minimal delay for fast response
  autoSpeak(text, callback, prefer) {
    if (this.state.audioEnabled && text) {
      this.speak(text, { onDone: callback, prefer: prefer || '' });
    } else if (callback) {
      callback();
    }
  },

  // ===== Sound Effects (Web Audio API - no external files needed) =====
  _audioCtx: null,
  _getAudioCtx() {
    if (!this._audioCtx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this._audioCtx = new AC();
      } catch(e) { return null; }
    }
    return this._audioCtx;
  },

  // 把音频上下文叫醒。iOS Safari / 微信里 AudioContext 只要没在用户手势里
  // resume 过就一直是 suspended —— 现象就是"点选之后一点声都没有"。这个
  // 函数绑在全局第一次点按上（见 _bindAudioKeeper）。
  _unlockAudioCtx() {
    var ctx = this._getAudioCtx();
    if (!ctx) return null;
    try {
      if (ctx.state !== 'running' && ctx.resume) {
        var p = ctx.resume();
        if (p && p.catch) p.catch(function() {});
      }
    } catch(e) {}
    return ctx;
  },

  // 统一发声器。notes: [{f, at, dur, vol, type, to}]
  //   f 起播频率(Hz) / at 相对起播点的偏移(秒) / dur 时长(秒)
  //   vol 峰值音量 / type 波形 / to 滑到的频率(Hz)
  //
  // 这里有个必须踩住的坑：**挂起状态下排进去的振荡器会被直接吞掉**。
  // 原先的写法是 `if (suspended) resume()` 之后马上排音 —— resume() 是
  // 异步的，排音时上下文还没真正跑起来，在 iOS（尤其是刚被 TTS 抢过音频
  // 会话之后）就静默丢弃了。表现就是"有时候响、有时候不响，孩子点对了
  // 却没动静"。所以现在等 resume 落地之后再排，另留一条兜底路径，万一
  // resume 一直不落地也不至于永远哑着。
  _playTone(notes) {
    var ctx = this._getAudioCtx();
    if (!ctx) return;
    var fired = false;
    var fire = function() {
      if (fired) return;
      fired = true;
      var t0 = ctx.currentTime + 0.01;
      notes.forEach(function(n) {
        try {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = n.type || 'sine';
          var start = t0 + (n.at || 0);
          var dur = n.dur || 0.22;
          var vol = (n.vol == null) ? 0.4 : n.vol;
          osc.frequency.setValueAtTime(n.f, start);
          if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, start + dur);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(vol, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
          osc.start(start);
          osc.stop(start + dur + 0.03);
        } catch(e) {}
      });
    };
    try {
      if (ctx.state === 'running') { fire(); return; }
      if (ctx.resume) {
        var p = ctx.resume();
        if (p && p.then) {
          p.then(fire).catch(function() {});
          setTimeout(fire, 500);     // resume 迟迟不落地也别哑着
          return;
        }
      }
    } catch(e) {}
    fire();
  },

  // 点下「先听一遍」那一瞬的一声轻快短音 —— 告诉孩子"点到了，正在放"。
  // 示范音频就算还在路上，这一声也是 0 延迟的。
  _playListenCue() {
    this._playTone([
      { f: 880.0, at: 0.00, dur: 0.09, vol: 0.20 },
      { f: 1174.7, at: 0.06, dur: 0.10, vol: 0.14, type: 'triangle' }
    ]);
  },

  // 选对了：C5 → E5 → G5 三连上行，末尾再补一记高音 C6，干净利落的一声"叮铃"。
  // 手机小喇叭对低频不友好，所以每个音都叠了一层高八度泛音、音量也提了一档
  // —— 教室里有杂音时也要听得见。总长约 0.55 秒，不拖到影响后面的朗读。
  _playCorrectSound() {
    this._playTone([
      { f: 523.25, at: 0.00, dur: 0.16, vol: 0.32 },
      { f: 1046.5, at: 0.00, dur: 0.10, vol: 0.07, type: 'triangle' },
      { f: 659.25, at: 0.08, dur: 0.16, vol: 0.36 },
      { f: 1318.5, at: 0.08, dur: 0.10, vol: 0.08, type: 'triangle' },
      { f: 783.99, at: 0.16, dur: 0.22, vol: 0.42 },
      { f: 1568.0, at: 0.16, dur: 0.14, vol: 0.09, type: 'triangle' },
      { f: 1046.5, at: 0.27, dur: 0.28, vol: 0.34 }
    ]);
  },

  // 选错了：两记往下掉的短音，一听就知道"不是这个"。音色用 triangle，
  // 比原来的方波柔和，不刺耳，但比正弦更容易在嘈杂环境里被听见。
  _playWrongSound() {
    this._playTone([
      { f: 294.0, at: 0.00, dur: 0.16, vol: 0.26, to: 220.0, type: 'triangle' },
      { f: 220.0, at: 0.13, dur: 0.26, vol: 0.28, to: 164.8, type: 'triangle' }
    ]);
  },

  // ===== 答错引导（v104）=====
  //
  // 以前孩子答错，正确选项当场亮成绿框、下面一行"点绿色正确答案" —— 那等于
  // 把答案递到手里，孩子照着点一下就过关，脑子没动。家长的原话是"不要一下
  // 提示答案，要用中文提示词一步步引导他选出来"。
  //
  // 所以现在答错只做三件事：把他点错的那一项就地划掉（范围越选越小）、给一句
  // 中文提示、**始终不点亮正确项**。提示一次比一次具体：
  //   第 1 次错 → 直接给"围绕这个词的意思"的提示（v107 改版，见 _wrongHintHtml）；
  //   第 2 次错 → 同一句提示 + 正确答案的"长相"（首字母 / 字母数 / 词数）或例句；
  //   第 3 次起 → 非词汇题点名 + 讲解；**词汇题永远不点名**，只给最强的
  //                "围绕意思"的提示（v107，家长原话"没有提示正确答案，
  //                让学生自己思考"），最后那一下仍然要他自己点下去。
  // 全程没有自动选中、没有"替我点亮"，答对的那一刻才亮绿。
  _wrongTry: {},
  _wrongTries(key) { return (this._wrongTry && this._wrongTry[key]) || 0; },
  _wrongTryBump(key) {
    if (!this._wrongTry) this._wrongTry = {};
    this._wrongTry[key] = this._wrongTries(key) + 1;
    return this._wrongTry[key];
  },
  _wrongTryClear(key) { if (this._wrongTry) delete this._wrongTry[key]; },

  // 正确选项的"长相"—— 让孩子能在剩下几个里自己认出它，但不报字母。
  // 图片/表情选项（词汇游戏的"选图片"）没有字可描述，返回空串，让调用方
  // 用中文释义去提示。
  _choiceShape(text) {
    const s = String(text == null ? '' : text).trim();
    if (!s || !/^[A-Za-z\u4e00-\u9fa5]/.test(s)) return '';
    if (/[\u4e00-\u9fa5]/.test(s)) {
      return '它是一句中文，共 ' + s.replace(/\s/g, '').length + ' 个字';
    }
    const letters = s.replace(/[^A-Za-z]/g, '');
    const words = s.split(/\s+/).filter(Boolean).length;
    let out = '它的第一个字母是“' + s[0] + '”';
    if (letters.length > 1) {
      out += '，一共 ' + letters.length + ' 个字母';
      if (words > 1) out += '、' + words + ' 个单词';
    }
    return out;
  },

  // 把手写下来的中文例句里"就是答案的那几个字"挖掉，换成 ○○（v107）。
  //
  // "选意思"那两题的四个选项就是中文释义。所以中文例句不能原样端出来 ——
  // 「我在图书馆看书。」等于把选项「图书馆」念了一遍。挖成「我在○○看书。」
  // 之后，端出去的是一句有语境的话，孩子得自己把"这儿该是什么"和四张卡片
  // 对起来 —— 家长原话"没有提示正确答案，让学生自己思考"。
  //
  // 例句本身不含释义时（比如 delicious 的"这面条很好吃。"），原样返回、不挖，
  // 它本来就没泄露答案，反而是一句好用的语境提示。
  _maskMeanings(sentence, meaning) {
    let out = String(sentence == null ? '' : sentence);
    if (!out) return { text: '', masked: false };
    const parts = String(meaning == null ? '' : meaning)
      .split(/[，,；;、\/]/).map(function (s) { return s.trim(); }).filter(Boolean);
    const goals = [];
    parts.forEach(function (p) {
      goals.push(p);
      // "美丽的" → "美丽"（例句里常写成"很美丽"）；"图书馆" 这种直接命中。
      const stem = p.replace(/[的地得了儿]$/, '');
      if (stem.length >= 2) goals.push(stem);
      if (p.length >= 3) goals.push(p.slice(0, 2));   // 长词再退一步："博物馆" → "博物"
    });
    // 长的先挖，免得先挖掉短的把长的切碎
    goals.sort(function (a, b) { return b.length - a.length; });
    let masked = false;
    goals.forEach(function (g) {
      if (g.length < 2) return;
      if (out.indexOf(g) >= 0) { out = out.split(g).join('○○'); masked = true; }
    });
    return { text: out, masked: masked };
  },

  // 答错后要显示的那段中文提示。
  //   o.attempt     连错第几次（从 1 起）
  //   o.opts        选项文案数组（填空题不给）
  //   o.answer      正确项下标（选择题）/ 填空题不用
  //   o.correctText 正确选项的文案（选择题）/ 正确答案（填空题）
  //   o.picked      刚点错的下标（可空）
  //   o.clue1       第 1 级就端出来的提示（词汇题＝这个词的场景化中文提示 hint_cn）
  //   o.clue2       第 2 级追加的一句更具体的提示
  //   o.clue3       第 3 级点名时附上的中文讲解（题库里的 explanation_cn）
  //   o.retryTip    第 1 次错时附加的一句"怎么办"
  //   o.finalTail   第 3 次起收尾那句（填空题要"打进去"而不是"点一下"）
  //   o.neverReveal 词汇题（v107）：连错几次都不点名是哪张卡
  //   o.revealStrong 词汇题第 3 级起端出的"最强但仍围绕意思"的提示
  //
  // v107 改版（家长原话：「不要提示说'不是这个，已经划掉第一个了，答案就在
  // 剩下 3 个里面再选一次'。这句话没有用。词的相关意思、或者相关搭配，就是最
  // 浅显的意思去提醒他」）：
  //   原来第 1 级只会说"划掉了哪个、还剩几个"—— 划掉这件事屏幕上看得见，
  //   念给孩子听纯属废话，孩子还是不知道往哪儿想。现在第 1 级直接把
  //   **围绕词义**的提示（clue1）端出来，第一次错就说在点子上。
  //
  // 讲解（explanation_cn）仍然只放在第 3 级：题库里不少解析本身就是答案（"……用 is"、
  // "……two hundred and thirty (230)"），提前端出来跟直接报答案没区别。
  _wrongHintHtml(o) {
    o = o || {};
    const attempt = o.attempt || 1;
    const opts = o.opts || null;
    const picked = (o.picked == null) ? null : o.picked;
    const correctText = String(o.correctText == null ? '' : o.correctText);
    // 词汇游戏的卡片上没有 A/B/C/D，只能说"第几个"（naming: 'index'）
    const byIndex = (o.naming === 'index');
    const nameOf = function (i) {
      return byIndex ? '第 ' + (i + 1) + ' 个' : String.fromCharCode(65 + i);
    };
    const left = [];
    let correctLetter = '';
    if (opts && opts.length) {
      opts.forEach(function (_, i) { if (i !== picked) left.push(nameOf(i)); });
      if (o.answer != null && o.answer >= 0) correctLetter = nameOf(o.answer);
    }
    const shape = this._choiceShape(correctText);

    if (attempt <= 1) {
      let t = '🤔 不是这个，再想想。';
      if (o.clue1) t += '<br>💡 ' + o.clue1;
      if (o.retryTip) t += '<br><span class="fs-12">' + o.retryTip + '</span>';
      return t;
    }

    if (attempt === 2) {
      const bits = [];
      if (o.clue1) bits.push('💡 ' + o.clue1);
      if (shape) bits.push('正确答案' + shape + '。');
      // 词汇卡片上没有字母，且词汇题一律不提"在哪几个里挑"（见 neverReveal）
      if (left.length && !byIndex && !o.neverReveal) bits.push('在 ' + left.join('、') + ' 里面挑一个。');
      let t = '🔎 快对了。' + (bits.length ? '<br>' + bits.join('<br>') : '');
      if (o.clue2) t += '<br>💡 ' + o.clue2;
      return t;
    }

    // 第 3 级起：词汇题**永不点名**，只把最强的"围绕意思"的提示端出来 ——
    // 家长原话「没有提示正确答案，让学生自己思考」。别的题型仍然点名 + 讲解，
    // 但最后那一下永远要孩子自己点（脚本从不代点）。
    if (o.neverReveal) {
      let t = '👉 再给你一个提示。';
      if (o.clue1) t += '<br>💡 ' + o.clue1;
      if (o.revealStrong) t += '<br>' + o.revealStrong;
      t += '<br><span class="fs-12">' + (o.finalTail || '别急，自己把它找出来。') + '</span>';
      return t;
    }

    let t = '👉 就差一点啦。答案是 '
          + (correctLetter ? correctLetter + '：' : '')
          + '“' + correctText + '”。<br>'
          + (o.finalTail || '点它一下，我们就往下走。');
    if (o.clue3) t += '<br>📖 ' + o.clue3;
    return t;
  },

  // 把提示落进页面上的某个容器（统一换色 + 淡入，免得各处样式走样）
  _showWrongHint(el, html) {
    if (!el) return;
    el.style.display = 'block';
    el.classList.add('q-hint');
    el.innerHTML = html;
  },
  _clearWrongHint(el) { if (el) el.classList.remove('q-hint'); },

  // Show celebration animation
  _showCelebration(el) {
    if (!el) return;
    var emojis = ['\ud83c\udf89', '\u2b50', '\ud83d\udcab', '\ud83c\udf8a', '\u2728', '\ud83d\ude0d'];
    var emoji = emojis[Math.floor(Math.random() * emojis.length)];
    var div = document.createElement('div');
    div.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:60px;pointer-events:none;z-index:100;animation:celebrate 1s ease-out forwards';
    div.textContent = emoji;
    el.style.position = 'relative';
    el.appendChild(div);
    setTimeout(function() { if (div.parentNode) div.parentNode.removeChild(div); }, 1000);
  },

  // ===== Cloud Sync =====
  // The merge itself lives in Api (see CloudSync in api.js) — it is an
  // artefact of blob storage, not business logic. This function keeps only
  // the parts that are: updating state and telling the user what happened.
  async syncToCloud() {
    if (!Api.cloudAvailable()) return;
    try {
      // The teacher's device is authoritative: their un-assign / removal must
      // not be overwritten by the cloud copy it is in the middle of pushing.
      const res = await Api.syncUp(this.state.students, this.state.classes, {
        authoritative: this.isTeacher(),
      });
      this._reportSyncResult(res.ok);
      this.state.students = res.students;
      this.state.classes = res.classes;
    } catch(e) {
      console.warn('Sync to cloud error:', e);
      this._reportSyncResult(false);
    }
  },

  // Report sync result to the user via toast (throttled: failures shown
  // at most once every 5 minutes so auto-polling doesn't spam)
  _reportSyncResult(ok) {
    var now = Date.now();
    if (ok) {
      this._lastSyncOk = true;
      this._lastSyncAt = now;
      return;
    }
    var wasOk = this._lastSyncOk !== false;
    this._lastSyncOk = false;
    if (wasOk || !this._lastFailToastAt || (now - this._lastFailToastAt) > 300000) {
      this._lastFailToastAt = now;
      this.showToast('⚠️ 云同步失败，数据已保存在本机', 'warn');
    }
  },

  // Human-readable sync status for teacher pages
  _syncStatusText() {
    if (this._lastSyncOk === false) return '⚠️ 同步失败（网络问题），点击"立即同步"重试';
    if (this._lastSyncAt) {
      var d = new Date(this._lastSyncAt);
      var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      return '已连接 · 上次同步 ' + hm;
    }
    return '已开启';
  },

  // Manual full sync (push local changes, then pull remote changes)
  async manualSync() {
    this.showToast('🔄 正在同步...', 'info');
    await this.syncToCloud();
    await this.syncFromCloud();
    if (this._lastSyncOk !== false) {
      this.showToast('✅ 同步成功，已是最新数据');
    }
    this.renderContent();
  },

  // Sync all data FROM cloud (teacher loads student registrations)
  // Merge logic lives in Api; this keeps the UI reactions.
  async syncFromCloud() {
    if (!Api.cloudAvailable()) return;
    try {
      const res = await Api.syncDown(this.state.students, this.state.classes);
      if (!res.ok) {
        if (res.unreachable) this._reportSyncResult(false);
        return;
      }
      this._lastSyncOk = true;

      // Student side: keep own class assignment up to date.
      // When the teacher assigns a class, students pick it up here
      // (polled every 15s + on every app foreground).
      if (!this.isTeacher() && this.state.phone) {
        const me = this.state.students.find(s => s.phone === this.state.phone);
        const cloudClass = me ? (me.class || '') : '';
        if (cloudClass && cloudClass !== this.state.className) {
          this.state.className = cloudClass;
          // Update the class badge in the header right away
          const badge = document.getElementById('class-badge');
          if (badge) badge.textContent = cloudClass;
          // Re-render so any class-dependent view refreshes
          this.renderContent();
          console.log('Class updated from cloud:', cloudClass);
        } else if (!cloudClass && this.state.className) {
          // Class was removed on teacher side — clear it
          this.state.className = '';
          const badge = document.getElementById('class-badge');
          if (badge) badge.textContent = '待分配';
        }

        // Regardless of class state: if the server says this phone was
        // removed/deleted, kick them to the removed page immediately.
        // (Covers the delete case where the student had no class at all.)
        const rp = document.getElementById('removed-page');
        const alreadyRemoved = rp && !rp.classList.contains('hidden');
        if (!alreadyRemoved) {
          const st = await Api.classStatus(this.state.phone);
          if (st !== null) {
            // 网络回来了 → 摘掉"网络不稳定"横幅
            this._netBanner(false);
            if (st.removed) {
              this.showRemovedPage(st);
              return;
            }
          } else {
            // v146（家长 2026-10-20）：不要任何"网络提示"字样。
            // 孩子/家长看到这类提示只会以为又出故障了。
            // 所以这里**什么都不显示**：静默重试（下一个 15 秒周期再来一次），
            // 网络恢复自然就好，做题完全不受影响。
            // 只有服务器**明确**返回 removed 才请出去（上一行）。
          }
        }
      }

      // Teacher: pick up re-join applications (polled with the same cycle)
      if (this.isTeacher()) {
        this.fetchJoinRequests();
        // 移出名单也要每轮拉一次：它是「谁还能登录」的真相，
        // 名单会在老师自己的操作之后立刻变。
        this.loadRemovedList();
      }

      // Teacher: detect students that just became pending (new registration
      // or re-request to join) and raise an instant clickable alert.
      if (this.isTeacher()) this._checkNewPendingStudents();

      // Teacher: re-render if on a relevant tab
      if (this.isTeacher() && (this.state.currentTab === 'students' || this.state.currentTab === 'classmgmt' || this.state.currentTab === 'checkin')) {
        this.renderContent();
      }
    } catch(e) { console.warn('Sync from cloud error:', e); }
  },

  // ===== Teacher: instant alert when a student requests to join =====
  // Phones already alerted about in this session, so polling doesn't
  // re-notify for the same student every 15 seconds.
  _alertedPendingPhones: null,

  _currentPendingStudents() {
    // v133：已被删的人不算"新来的待分配"，否则老师刚删掉他，
    // 这个函数又把他当"新学生"弹横幅提醒 —— 正是老师说的"删了还在"。
    const gated = new Set((this.state.removedPhones || []).map(g => g && g.phone).filter(Boolean));
    return (this.state.students || []).filter(s => s && s.phone && !gated.has(s.phone))
      .filter(s => !s.approved || !s.class);
  },

  // Called after every cloud sync on the teacher side. The first call after
  // login only records the baseline (no alarm for students that were already
  // pending); from then on, every newly pending student triggers an alert.
  _checkNewPendingStudents() {
    if (!this.isTeacher()) return;
    const pending = this._currentPendingStudents();
    if (!this._alertedPendingPhones) {
      this._alertedPendingPhones = new Set(pending.map(s => s.phone));
    } else {
      const fresh = pending.filter(s => !this._alertedPendingPhones.has(s.phone));
      if (fresh.length > 0) {
        fresh.forEach(s => this._alertedPendingPhones.add(s.phone));
        this._alertNewStudents(fresh);
      }
    }
    this._updatePendingBadge();
  },

  _alertNewStudents(list) {
    // Ding + vibrate so the teacher notices even with the phone in hand
    this._playAlertSound();
    if (navigator.vibrate) { try { navigator.vibrate([120, 80, 120]); } catch(e) {} }
    const names = list.map(s => s.name).join('、');
    const label = list.length === 1
      ? '学生「' + names + '」申请加入'
      : list.length + ' 名学生申请加入（' + names + '）';
    this.showAlertBanner('🔔 ' + label + '，等待分配班级', '立即处理 →', function() {
      App.gotoPendingStudents();
    });
  },

  // Prominent clickable banner at the top of the screen. Unlike showToast()
  // this one has a real tap target: one tap jumps straight into management.
  _alertBannerTimer: null,
  showAlertBanner(title, actionText, onAction) {
    var b = document.getElementById('student-alert-banner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'student-alert-banner';
      b.className = 'alert-banner';
      document.body.appendChild(b);
    }
    b.innerHTML = '<div class="ab-main">' + title + '</div>'
      + '<button class="ab-action">' + (actionText || '立即处理') + '</button>'
      + '<button class="ab-close" aria-label="关闭">&times;</button>';
    b.querySelector('.ab-action').onclick = function() {
      App._hideAlertBanner();
      if (onAction) onAction();
    };
    b.querySelector('.ab-close').onclick = function() { App._hideAlertBanner(); };
    b.classList.add('show');
    if (this._alertBannerTimer) clearTimeout(this._alertBannerTimer);
    // Long enough to be seen; after it fades the red tab badge remains.
    this._alertBannerTimer = setTimeout(function() { App._hideAlertBanner(); }, 15000);
  },

  _hideAlertBanner() {
    var b = document.getElementById('student-alert-banner');
    if (b) b.classList.remove('show');
    if (this._alertBannerTimer) { clearTimeout(this._alertBannerTimer); this._alertBannerTimer = null; }
  },

  // Short two-tone "ding" via WebAudio — no audio file needed.
  _playAlertSound() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = this._alertAudioCtx || new AC();
      this._alertAudioCtx = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      var now = ctx.currentTime;
      [880, 1174.66].forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.16);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.18); osc.stop(now + i * 0.18 + 0.18);
      });
    } catch(e) { /* audio blocked before first user gesture — badge still shows */ }
  },

  // Red count badge on the 学生管理 tab while students are waiting
  _updatePendingBadge() {
    var bar = document.getElementById('tab-bar');
    if (!bar || !this.isTeacher()) return;
    var n = this._currentPendingStudents().length;
    var btn = null;
    bar.querySelectorAll('button').forEach(function(b) {
      if (b.getAttribute('onclick') === "App.switchTab('students')") btn = b;
    });
    if (!btn) return;
    var old = btn.querySelector('.tab-badge');
    if (n > 0) {
      if (!old) {
        var badge = document.createElement('span');
        badge.className = 'tab-badge';
        btn.appendChild(badge);
      }
      btn.querySelector('.tab-badge').textContent = n;
    } else if (old) {
      old.remove();
    }
  },

  // One tap on the alert banner lands here: open student management and put
  // the newest pending student right in front of the teacher — no scrolling
  // around trying to find them at the bottom of a long list.
  async gotoPendingStudents() {
    await this.switchTab('students');
    setTimeout(function() {
      var card = document.getElementById('pending-card-top');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('flash');
        setTimeout(function() { card.classList.remove('flash'); }, 3200);
      }
    }, 100);
  },

  // Auto-polling - keeps data fresh on BOTH teacher and student devices.
  // Teacher: picks up new student registrations (every 15s) so a join
  //          request raises the alert banner as quickly as possible.
  // Student: picks up class assignments made by the teacher (every 15s)
  //          so the class badge updates promptly after the teacher
  //          assigns a class.
  startAutoSync() {
    if (this._syncInterval) clearInterval(this._syncInterval);
    // 15s for both roles: the teacher side needs to spot a new join request
    // fast enough to raise the alert banner, so the old 30s teacher interval
    // was dropped.
    var interval = 15000;
    // First poll right away (a teacher who just logged in shouldn't wait a
    // whole tick to see a pending re-join application), then on the timer.
    this.syncFromCloud();
    this._syncInterval = setInterval(() => {
      this.syncFromCloud();
    }, interval);

    // Also sync whenever the app comes back to the foreground
    // (covers WeChat/browser tab switching, phone unlock)
    if (!this._visibilityHandler) {
      var self = this;
      this._visibilityHandler = function() {
        if (document.visibilityState === 'visible' && self.state.phone) {
          self.syncFromCloud();
          // Clips whose transcription failed on a bad connection get another
          // go here — the audio is already safe in IndexedDB.
          Api.retryPendingTranscripts().catch(function(){});
        }
      };
      document.addEventListener('visibilitychange', this._visibilityHandler);
    }
  },

  // ===== Settings =====
  showSettings() {
    this.showModal(
      '<div class="modal-header"><div class="modal-title">\u2699\ufe0f \u7cfb\u7edf\u8bbe\u7f6e</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>' +
      '<div class="modal-body">' +
        '<div class="settings-card">' +
          '<div class="sc-title">\u2601\ufe0f \u4e91\u7aef\u540c\u6b65</div>' +
          '<div class="sc-desc">\u5b66\u751f\u6ce8\u518c\u4fe1\u606f\u81ea\u52a8\u540c\u6b65\u5230\u4e91\u7aef\uff0c\u65e0\u9700\u624b\u52a8\u914d\u7f6e\u3002\u8001\u5e08\u767b\u5f55\u540e\u81ea\u52a8\u63a5\u6536\u5b66\u751f\u6ce8\u518c\u4fe1\u606f\u3002</div>' +
          '<div class="cloud-status on">\u2705 \u4e91\u7aef\u540c\u6b65\u5df2\u5f00\u542f\uff08\u81ea\u52a8\uff09</div>' +
          '<button class="btn btn-outline btn-sm mt-8" onclick="App.manualSync();App.closeModal()">\ud83d\udd04 \u7acb\u5373\u540c\u6b65</button>' +
        '</div>' +
        '<div class="settings-card">' +
          '<div class="sc-title">\ud83c\udfa4 \u8bed\u97f3\u8bbe\u7f6e</div>' +
          '<div class="sc-desc">\u5982\u679c\u5fae\u4fe1\u5185\u65e0\u6cd5\u64ad\u653e\u8bed\u97f3\uff0c\u8bf7\u70b9\u53f3\u4e0a\u89d2 \u00b7\u00b7\u00b7 \u9009\u62e9\u201c\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u201d</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn btn-outline btn-sm" onclick="App.testTTS(1)">\ud83d\udd0a \u8bd5\u542c\u6709\u9053TTS</button>' +
          '<button class="btn btn-outline btn-sm" onclick="App.testTTS(2)">\ud83d\udd0a \u8bd5\u542c\u767e\u5ea6TTS</button>' +
          '<button class="btn btn-outline btn-sm" onclick="App.testTTS(3)">\ud83d\udd0a \u8bd5\u542c\u6d4f\u89c8\u5668TTS</button>' +
          '</div>' +
          '<div id="tts-test-result" style="margin-top:8px;font-size:12px"></div>' +
        '</div>' +
        '<div class="settings-card">' +
          '<div class="sc-title">\ud83d\udcca \u6570\u636e\u7ba1\u7406</div>' +
          '<div class="sc-desc">\u672c\u5730\u6570\u636e\u4f1a\u81ea\u52a8\u5907\u4efd\u5230\u4e91\u7aef\u3002\u5982\u9700\u91cd\u7f6e\u672c\u5730\u6570\u636e\uff0c\u53ef\u4ee5\u624b\u52a8\u5bfc\u5165\u4e91\u7aef\u6570\u636e\u3002</div>' +
          '<button class="btn btn-outline btn-sm mt-8" onclick="App.syncFromCloud();alert(\'\u2705 \u5df2\u4ece\u4e91\u7aef\u540c\u6b65\u6700\u65b0\u6570\u636e\')">\ud83d\udcbe \u4ece\u4e91\u7aef\u6062\u590d\u6570\u636e</button>' +
        '</div>' +
      '</div>'
    );
  },

  saveSettings() {
    this.closeModal();
  },

  // Test TTS with specific source
  testTTS(source) {
    var self = this;
    var resultEl = document.getElementById('tts-test-result');
    var testText = 'Hello! Welcome to Amy English class.';
    var encoded = encodeURIComponent(testText);

    if (resultEl) resultEl.innerHTML = '<span style="color:var(--info)">\u23f3 \u6b63\u5728\u6d4b\u8bd5...</span>';

    var audioEl = document.getElementById('tts-player');
    if (!audioEl) audioEl = new Audio();

    // Stop any current audio
    this._stopCurrentAudio();
    this._speakToken = (this._speakToken || 0) + 1;
    var myToken = this._speakToken;
    this._ttsDone = false;
    this._currentAudio = audioEl;

    var url;
    if (source === 1) {
      url = 'https://dict.youdao.com/dictvoice?audio=' + encoded + '&type=2';
    } else if (source === 2) {
      url = 'https://fanyi.baidu.com/gettts?lan=en&text=' + encoded + '&spd=3&source=web';
    } else {
      // Browser speechSynthesis
      if (resultEl) resultEl.innerHTML = '<span style="color:var(--info)">\u23f3 \u6b63\u5728\u4f7f\u7528\u6d4f\u89c8\u5668\u5185\u7f6e\u8bed\u97f3...</span>';
      this._ttsCallback = function() {
        if (myToken !== self._speakToken) return;
        if (resultEl) resultEl.innerHTML = '<span style="color:var(--success)">\u2705 \u6d4f\u89c8\u5668TTS\u64ad\u653e\u5b8c\u6210\uff01\u5982\u679c\u542c\u5230\u4e86\u58f0\u97f3\uff0c\u8bf4\u660e\u6d4f\u89c8\u5668TTS\u53ef\u7528</span>';
      };
      this._speakWithSynthesis(testText, {}, myToken);
      return;
    }

    audioEl.onended = function() {
      if (myToken !== self._speakToken) return;
      self._ttsDone = true;
      self._currentAudio = null;
      if (resultEl) {
        var srcName = source === 1 ? '\u6709\u9053' : '\u767e\u5ea6';
        resultEl.innerHTML = '<span style="color:var(--success)">\u2705 ' + srcName + 'TTS\u64ad\u653e\u6210\u529f\uff01\u5982\u679c\u542c\u5230\u4e86\u58f0\u97f3\uff0c\u8bf4\u660e' + srcName + 'TTS\u53ef\u7528</span>';
      }
    };
    audioEl.onerror = function() {
      if (myToken !== self._speakToken) return;
      self._ttsDone = true;
      self._currentAudio = null;
      if (resultEl) {
        var srcName = source === 1 ? '\u6709\u9053' : '\u767e\u5ea6';
        resultEl.innerHTML = '<span style="color:var(--danger)">\u274c ' + srcName + 'TTS\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u9009\u9879</span>';
      }
    };

    audioEl.src = url;
    audioEl.load();
    var playPromise = audioEl.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(function(err) {
        if (myToken !== self._speakToken) return;
        self._ttsDone = true;
        self._currentAudio = null;
        if (resultEl) {
          var srcName = source === 1 ? '\u6709\u9053' : '\u767e\u5ea6';
          resultEl.innerHTML = '<span style="color:var(--danger)">\u274c ' + srcName + 'TTS\u64ad\u653e\u5931\u8d25\uff1a' + (err.message || err.name || '\u672a\u77e5\u9519\u8bef') + '\u3002\u53ef\u80fd\u662f\u624b\u673a\u6d4f\u89c8\u5668\u9650\u5236\uff0c\u8bf7\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00\u540e\u5c1d\u8bd5</span>';
        }
      });
    }

    // Timeout
    setTimeout(function() {
      if (!self._ttsDone && myToken === self._speakToken) {
        if (resultEl) {
          var srcName = source === 1 ? '\u6709\u9053' : '\u767e\u5ea6';
          resultEl.innerHTML = '<span style="color:var(--warning)">\u23f3 ' + srcName + 'TTS\u8d85\u65f6\uff0c\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u9009\u9879</span>';
        }
      }
    }, 8000);
  },

  // ===== Tabs =====
  renderTabs() {
    const bar = document.getElementById('tab-bar');
    const isTeacher = this.isTeacher();
    let tabs;
    // Icons are sprite ids from the <symbol> set in index.html — no emoji.
    if (isTeacher) {
      tabs = [
        { id: 'weekly', icon: 'i-list', name: '周计划' },
        // v134：老师自己想先做一遍、提前发现问题的那一屏。渲染的就是学生
        // 做题的那套界面（renderStage），不是另做一份预览版 —— 不然"看到的
        // 和学生看到的不一样"就没意义了。
        { id: 'preview', icon: 'i-eye', name: '题库预览' },
        { id: 'daily', icon: 'i-calendar', name: '每日详情' },
        { id: 'edit', icon: 'i-pencil', name: '作业编辑' },
        { id: 'checkin', icon: 'i-chart', name: '打卡监控' },
        { id: 'scores', icon: 'i-trend', name: '成绩分析' },
        { id: 'errors', icon: 'i-close', name: '错题本' },
        { id: 'print', icon: 'i-printer', name: '错题卷打印' },
        { id: 'speaking', icon: 'i-mic', name: '口语记录' },
        { id: 'students', icon: 'i-users', name: '学生管理' },
        { id: 'classmgmt', icon: 'i-layers', name: '班级管理' },
      ];
    } else {
      // Non-teacher: see today's homework, own child progress, class comparison, own error book
      tabs = [
        { id: 'today', icon: 'i-doc', name: '今日作业' },
        { id: 'myprogress', icon: 'i-chart', name: '孩子打卡' },
        { id: 'compare', icon: 'i-trophy', name: '完成率对比' },
        { id: 'myerrors', icon: 'i-close', name: '错题改错' },
      ];
    }
    bar.innerHTML = tabs.map(t => `<button class="${t.id===this.state.currentTab?'active':''}" onclick="App.switchTab('${t.id}')"><svg class="icon"><use href="#${t.icon}"/></svg>${t.name}</button>`).join('');
    this._setupTabScroll(bar);
    // Keep the pending-student red badge alive — renderTabs rebuilds the
    // buttons' innerHTML, which would otherwise wipe it.
    if (isTeacher) this._updatePendingBadge();
  },

  // The tab strip scrolls horizontally when it overflows. Touch can swipe it,
  // but a mouse cannot scroll an overflow-x container — so tabs pushed off the
  // end were simply unreachable on a narrow desktop window. Three fixes:
  // map the wheel onto it, fade the right edge so it looks scrollable, and
  // always bring the active tab into view.
  _setupTabScroll(bar) {
    const sync = () => {
      const over = bar.scrollWidth > bar.clientWidth + 1;
      bar.classList.toggle('is-overflowing', over);
      bar.classList.toggle('at-end', over && bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 2);
    };

    if (!bar._scrollWired) {
      bar._scrollWired = true;
      bar.addEventListener('wheel', (e) => {
        if (bar.scrollWidth <= bar.clientWidth) return;
        // Trackpads send deltaX; mice only send deltaY. Use whichever is bigger.
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (!d) return;
        e.preventDefault();
        bar.scrollLeft += d;
      }, { passive: false });
      bar.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
    }

    const active = bar.querySelector('button.active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    sync();
  },

  async switchTab(tab) {
    // A pending auto-advance must not fire after the child has navigated away,
    // or it silently skips a question when they come back.
    clearTimeout(this._advanceTimer);

    // v130：点一下必须**立刻**切屏。
    //
    // 以前这里在 renderContent() 之前 await 了一次云端拉取，于是从手指落下到
    // 内容变样要等一整趟网络往返 —— 大陆手机数据下 300ms~2s，家长的感觉就是
    // 「点了没反应」，然后连点好几下。选项卡高亮倒是瞬间变了，内容却停在上一
    // 屏，看起来像卡死。
    //
    // 现在拆成两步：
    //   ① 立刻用**本机已有数据**同步渲染一次 —— 一帧内出画面；
    //   ② 云端数据回来后，只有真的变了才补渲染一次（没变就不动，避免闪烁）。
    //
    // 本机数据不是"空"：打卡记录本来就落在 localStorage，登录时也拉过一次，
    // 所以第一屏不是占位图，只是可能比云端略旧。拉失败就保持现状 ——
    // 一断网就把全班显示成"未打卡"是最坏的降级方式（这条原则没变）。
    //
    // 连点同一个页签直接忽略：重画一遍内容一样，还会把滚动位置顶回去。
    // 「口语记录」除外 —— 每次进去都要重新读一遍 IndexedDB，新录的才会出现。
    if (tab !== 'speaking' && this.state.currentTab === tab && this._tabPainted) return;
    this._tabPainted = true;

    this.state.currentTab = tab;
    this.renderTabs();

    // 「口语记录」例外：它读的是 IndexedDB，渲染函数是同步的、没法 await，
    // 所以必须先拉回来再渲染，否则第一屏是空的。
    if (tab === 'speaking') {
      try {
        this.state.speakingRecords = await Api.getSpeakingRecords();
        // Pair each score with its clip so the teacher can actually listen.
        const clips = await Api.getRecordings({});
        const byId = {};
        clips.forEach(c => { byId[c.id] = c.url; });
        this.state.speakingRecords.forEach(r => { r.audioUrl = byId[r.clipId] || null; });
      } catch(e) { this.state.speakingRecords = []; }
    }

    // ① 先画出来 —— 不等网络
    this.renderContent();

    // ② 再去拉云；回来了且数据真的变了，补渲染一次
    const needsCheckins = ['myprogress', 'compare', 'daily', 'checkin', 'scores'];
    if (needsCheckins.indexOf(tab) >= 0) {
      const scope = tab === 'myprogress' ? 'me' : 'class';
      // 换了 tab 就作废这次补渲染 —— 否则人已经走了，旧数据还把新页面刷掉。
      const token = (this._tabSeq || 0) + 1;
      this._tabSeq = token;
      this._pullCloudCheckins(scope).then((changed) => {
        if (this._tabSeq !== token) return;        // 已经切走了
        if (this.state.currentTab !== tab) return;
        if (!changed) return;                      // 数据没变，别白刷一遍造成闪烁
        this.renderContent();
      }).catch(e => { console.warn('pull checkins failed:', e); });
    }
  },

  async renderContent() {
    const area = document.getElementById('content-area');
    const isTeacher = this.isTeacher();
    const tab = this.state.currentTab;
    // v134：每次渲染先把"生效的是哪一周"重新对齐一次（老师预览下周时是下周，
    // 其它任何时候都是本周）。放在最前面，保证下面所有渲染读到的 HOMEWORK_DATA
    // 一定是对的。见 _syncWeekData 的注释。
    this._syncWeekData();
    // Only the homework stage locks the page; every other view scrolls.
    // 老师预览走的是同一套舞台，所以也要 stage-mode —— 不然同一个界面在
    // 老师这儿长得跟学生那儿不一样，"和学生界面一样"就落空了。
    const inPreviewStage = isTeacher && tab === 'preview';
    document.body.classList.toggle('stage-mode',
      (!isTeacher && tab === 'today') || inPreviewStage);
    // preview-mode 只负责给舞台让出顶栏那一行的高度（见 index.html），
    // 舞台内部样式不动 —— 学生看到的还是原来那一屏。
    document.body.classList.toggle('preview-mode', inPreviewStage);

    // Assign/delete/update all end with renderContent — refresh the
    // pending badge here so the count always matches reality.
    if (isTeacher) this._updatePendingBadge();

    if (isTeacher) {
      switch(tab) {
        case 'weekly': area.innerHTML = this.renderWeekly(); break;
        case 'preview': area.innerHTML = this.renderPreview(); break;
        case 'daily': area.innerHTML = this.renderDaily(); break;
        case 'edit': area.innerHTML = this.renderEdit(); break;
        case 'checkin': area.innerHTML = this.renderCheckin(); break;
        case 'scores': area.innerHTML = this.renderScores(); break;
        case 'errors': area.innerHTML = await this.renderErrorBook(); break;
        case 'print': area.innerHTML = await this.renderPrint(); break;
        case 'speaking': area.innerHTML = this.renderSpeakingRecords(); break;
        case 'students': area.innerHTML = this.renderStudents(); break;
        case 'classmgmt': area.innerHTML = this.renderClassMgmt(); break;
      }
    } else {
      switch(tab) {
        case 'today': area.innerHTML = this.renderToday(); break;
        case 'myprogress': area.innerHTML = this.renderMyProgress(); break;
        case 'compare': area.innerHTML = this.renderCompare(); break;
        case 'myerrors': area.innerHTML = this.renderMyErrors(); break;
      }
    }
    // 舞台渲染完就把该锁的「下一题」锁上。以前只有 nextStep/prevStep 里会
    // 调 _applyStepLock，首次进入（刚登录、刚刷新、第一次落到这一题）时是
    // 漏的 —— 那一屏的门禁等于没上。
    if (!isTeacher && tab === 'today') {
      this._applyStepLock();
      // 位置一变化就落盘：这样"答到一半就退出"也能被记住，下次登录直接
      // 回到这一屏（而不只是回到"最后一道答过的题"）。
      this._savePos(this.state.currentDay);
    } else if (inPreviewStage) {
      // v138：预览和学生对同一套门禁 —— 少这一下，老师那边就是"没做题
      // 也能点下一题"。_savePos 不调：老师的位置不进学生账里。
      this._applyStepLock();
    }
  },

  // ===== Teacher: Weekly Plan =====
  renderWeekly() {
    const thisWeek = this.getWeekDates(0);
    const nextWeek = this.getWeekDates(1);
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">📋 作业周计划（本周 + 下周）</h2>';
    html += '<div class="stat-row mb-16">';
    html += '<div class="stat-box"><div class="num">' + HOMEWORK_DATA.length + '</div><div class="label">每天模块</div></div>';
    let totalMod = 0;
    HOMEWORK_DATA.forEach(d => totalMod += d.modules.length);
    html += '<div class="stat-box"><div class="num">' + totalMod + '</div><div class="label">周模块数</div></div>';
    html += '<div class="stat-box"><div class="num">' + this.state.students.length + '</div><div class="label">学生数</div></div>';
    let totalDur = 0;
    HOMEWORK_DATA.forEach(d => totalDur += d.total_duration);
    html += '<div class="stat-box"><div class="num">' + totalDur + '</div><div class="label">周总时长(分)</div></div>';
    html += '</div>';

    // Render one week block (weekOffset: 0=this week, 1=next week)
    //
    // v134：每个区块必须取**自己那一周**的题库。以前两处都遍历同一个
    // HOMEWORK_DATA，于是「下周」栏列出来的是本周的题、只是日期换成了下周的
    // —— 老师照它检查下周的题，检查的全是错的。（今天 WEEK_IDX=2，本该看到
    // WEEK4，实际看到的是 WEEK3。）
    var renderWeekBlock = (weekOffset, dates) => {
      var weekDays = (typeof hwWeekData === 'function') ? hwWeekData(weekOffset) : HOMEWORK_DATA;
      var label = weekOffset === 0
        ? '📅 本周作业（' + this.formatDateCn(dates[0]) + ' ~ ' + this.formatDateCn(dates[6]) + '）'
        : '📅 下周作业（' + this.formatDateCn(dates[0]) + ' ~ ' + this.formatDateCn(dates[6]) + '）';
      var out = '<h3 style="color:var(--primary-dark);margin:16px 0 8px">' + label + '</h3>';
      out += '<div class="day-grid">';
      weekDays.forEach((day, i) => {
        const isToday = this.isDayToday(i, weekOffset);
        out += '<div class="day-card ' + (day.is_speaking_day ? 'speaking' : '') + '" style="' + (isToday ? 'border-color:var(--primary);box-shadow:0 0 0 2px var(--primary-light)' : '') + '" onclick="App.viewDay(' + i + ',' + weekOffset + ')">';
        out += '<div class="day-name">' + day.day_cn + (isToday ? ' <span style="font-size:11px;color:var(--primary)">今天</span>' : '') + '</div>';
        out += '<div class="day-type" style="font-size:11px;color:var(--primary-dark)">' + this.formatDateCn(dates[i]) + '</div>';
        out += '<div class="day-type">' + (day.is_speaking_day ? '🎤 AI口语日' : '📝 练习日') + '</div>';
        out += '<div class="day-modules">' + day.modules.map(m => m.name_cn).join('<br>') + '</div>';
        out += '<div class="day-duration">共' + day.total_duration + '分钟</div>';
        // v134：一眼看出"点这里就是用学生那套界面做一遍"。
        // stopPropagation 是必须的 —— 不然会先触发卡片的 viewDay，两个都开。
        out += '<button class="btn btn-sm btn-outline mt-8" onclick="event.stopPropagation();App.openPreview(' + i + ',' + weekOffset + ')">👀 学生界面</button>';
        out += '</div>';
      });
      out += '</div>';
      return out;
    };

    html += renderWeekBlock(0, thisWeek);
    html += renderWeekBlock(1, nextWeek);
    // Hidden container used by viewDay for detail preview
    html += '<div id="day-detail"></div>';
    return html;
  },

  viewDay(idx, weekOffset) {
    weekOffset = weekOffset || 0;
    // v134：按 weekOffset 取对应那一周的题库（以前固定取本周的，所以点"下周"
    // 的卡片，展开的是本周的题）。
    const weekDays = (typeof hwWeekData === 'function') ? hwWeekData(weekOffset) : HOMEWORK_DATA;
    const day = weekDays[idx];
    const detail = document.getElementById('day-detail');
    if (!detail) return;
    const dateLabel = this.getDayDateLabel(idx, weekOffset);
    const weekLabel = weekOffset === 0 ? '本周' : '下周';
    let html = '<h3 style="color:var(--primary-dark);margin:16px 0 8px">' + weekLabel + day.day_cn + '（' + dateLabel + '）作业详情</h3>';
    // v134：题型清单 + 学生界面，两种看法，互不耽误
    html += '<div class="mb-16"><button class="btn-primary" onclick="App.openPreview(' + idx + ',' + weekOffset + ')">👀 用学生界面做一遍这一天</button></div>';
    day.modules.forEach(m => {
      html += '<div class="module-card">';
      html += '<div class="module-header"><span class="m-name">' + this.getModuleIcon(m.type) + ' ' + m.name_cn + '</span><span class="m-duration">' + m.duration + '分钟</span></div>';
      html += '<div class="module-body">';
      if (m.type === 'speaking' && m.questions) {
        m.questions.forEach((q, qi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">第' + (qi+1) + '题</div>';
          html += '<div class="q-text">' + q.sentence + '</div>';
          html += '<div class="text-sub fs-12">' + (q.sentence_cn||'') + '</div>';
          html += '<div class="q-options">';
          q.options.forEach((o, oi) => {
            const cls = oi === q.answer ? 'correct' : '';
            html += '<div class="q-option ' + cls + '">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
          });
          html += '</div>';
          html += '<div class="q-answer">正确答案：' + String.fromCharCode(65+q.answer) + '</div>';
          html += '<div class="q-explanation show"><div class="cn">' + (q.explanation_cn||'') + '</div><div class="en">' + (q.explanation_en||'') + '</div></div>';
          if (q.pronunciation_tips) html += '<div class="fs-12 mt-8" style="color:var(--info)">🗣️ 发音提示：' + q.pronunciation_tips + '</div>';
          html += '</div>';
        });
      } else if (m.type === 'vocabulary_game' && m.words) {
        m.words.forEach((w, wi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">单词' + (wi+1) + '</div>';
          html += '<div class="q-text">' + w.emoji + ' <strong>' + w.word + '</strong> ' + w.phonetic + '</div>';
          html += '<div class="text-sub fs-12">释义：' + w.meaning + '</div>';
          html += '<div class="text-sub fs-12">例句：' + w.example_en + ' ' + w.example_cn + '</div>';
          html += '<div class="mt-8">通关阶段：' + w.stages.map(s => this.getStageName(s.type)).join(' → ') + '</div>';
          html += '</div>';
        });
      } else if (m.type === 'writing_template') {
        html += '<div class="q-item">';
        html += '<div class="q-text">📝 ' + m.title + '</div>';
        html += '<div class="writing-banner">⚠️ ' + m.requirement_cn + '</div>';
        html += '<div class="writing-keywords">';
        m.keywords.forEach(k => html += '<span class="keyword-chip">' + k + '</span>');
        html += '</div>';
        html += '<div class="writing-essay">' + this.renderTemplateText(m) + '</div>';
        html += '<div class="q-answer">完整范文：' + m.full_text + '</div>';
        html += '<div class="q-explanation show"><div class="cn">📖 ' + (m.explanation_cn||'') + '</div><div class="en">📘 ' + (m.explanation_en||'') + '</div></div>';
        html += '</div>';
      } else if (m.questions) {
        m.questions.forEach((q, qi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">第' + (qi+1) + '题</div>';
          if (m.passage && qi === 0) html += '<div class="card mb-8" style="background:var(--bg)"><div class="fs-12 text-sub mb-4">阅读材料：</div>' + m.passage + '</div>';
          html += '<div class="q-text">' + q.question + '</div>';
          if (q.options) {
            html += '<div class="q-options">';
            q.options.forEach((o, oi) => {
              const cls = oi === q.answer ? 'correct' : '';
              html += '<div class="q-option ' + cls + '">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
            });
            html += '</div>';
          }
          html += '<div class="q-answer">正确答案：' + (q.options ? String.fromCharCode(65+q.answer) : q.answer) + '</div>';
          html += '<div class="q-explanation show"><div class="cn">' + (q.explanation_cn||'') + '</div><div class="en">' + (q.explanation_en||'') + '</div></div>';
          html += '</div>';
        });
      }
      html += '</div></div>';
    });
    detail.innerHTML = html;
  },

  getModuleIcon(type) {
    const icons = { speaking:'🎤', vocabulary_game:'🎮', reading:'📖', grammar:'📐', multiple_choice:'📝', listening:'👂', cloze:'🔗', tense:'⏰', writing_template:'✍️', ket_pet:'🏆' };
    return icons[type] || '📚';
  },

  getStageName(type) {
    const names = { learn:'看图学词', image_choice:'看图选词', meaning_choice:'选释义', spell_fill:'拼写填空' };
    return names[type] || type;
  },

  renderTemplateText(m) {
    let text = m.template;
    m.blanks.forEach(b => {
      text = text.replace('{{' + b.id + '}}', '<span class="writing-blank" style="color:var(--primary)">[' + b.hint_cn + ']</span>');
    });
    return text;
  },

  // ===== Teacher: 题库预览（v134）========================================
  //
  // 老师 2026-10-16：「老师端能够看到两周的作业题，并且每天的作业题显示的
  // 和学生界面是一样的。这样的话，老师可以将做题做一遍，然后发现问题提前把
  // 后一天的题给更新一下……每天的题型和这个学生的题做题的界面给融合一下，
  // 这样的话，两个都不耽误」
  //
  // 实现要点只有一句：**这里渲染的就是学生的 renderStage()，不是另做的
  // 预览版**。只要另做一份，它就会慢慢走样，"和学生界面一样"这句承诺就废了。
  //
  // 老师在预览里怎么点都留不下痕迹，这不是靠这一页的自觉，而是靠三处已有的
  // 硬闸：
  //   · _recordAnswer 第一行 `if (this.isTeacher() || !this.state.phone) return;`
  //     —— 所有答案、打卡、错题上报的唯一汇集点
  //   · _savePos 同样第一行就 return —— 断点续做位置不会被污染
  //   · renderStage 内部所有"锁住下一题"的门禁都带 `!this.isTeacher()`
  //     —— 老师可以自由翻遍全天的题，不会被"没跟读够 60 分"卡住
  // 口语录音那条路上原来没有闸，v134 单独补了（见 _persistSpeakingClip）。
  //
  // 周数据：下周的题从 hwWeekData(1) 取。原来「周计划」两个区块都遍历同一个
  // HOMEWORK_DATA，「下周」栏显示的是本周的题 —— 老师提前检查下周的题，
  // 检查的根本不是下周要发的那份。
  openPreview(dayIdx, weekOffset) {
    this.state.previewDay = dayIdx;
    this.state.previewWeek = weekOffset || 0;
    this.state.currentDay = dayIdx;   // renderStage 内部按 currentDay 取词汇坐标
    this.state.stepIdx = 0;           // 老师是来查题的，不是来续做的，从头看
    this._pvPickerOpen = false;
    this.switchTab('preview');
  },

  closePreview() {
    this.state.previewDay = null;
    this.state.previewWeek = 0;
    this.state.stepIdx = 0;
    this._pvPickerOpen = false;
    // 走 switchTab 而不是只 renderContent —— 它会把 currentTab 改掉，
    // 于是 _previewWeekOffset() 立刻回到 0，题库自动切回本周。
    this.switchTab('weekly');
  },

  // 预览页内换天 / 换周，不离开预览
  previewGo(dayIdx, weekOffset) {
    this.state.previewDay = dayIdx;
    this.state.previewWeek = weekOffset || 0;
    this.state.currentDay = dayIdx;
    this.state.stepIdx = 0;
    this._pvPickerOpen = false;
    this.renderContent();
  },

  togglePvPicker() {
    this._pvPickerOpen = !this._pvPickerOpen;
    this.renderContent();
  },

  renderPreview() {
    const weekOff = this._previewWeekOffset();
    const weekDays = (typeof hwWeekData === 'function') ? hwWeekData(weekOff) : HOMEWORK_DATA;
    let d = this.state.previewDay;
    if (d === null || d === undefined || !weekDays[d]) d = this.getTodayWeekdayIdx();
    // 回写：下面 renderStage 读的是 state.currentDay，两边必须是同一天
    this.state.previewDay = d;
    this.state.currentDay = d;

    const day = weekDays[d];

    let html = '';

    // ---- 顶栏（占 --pv-h 那一行，舞台自动让位）----
    html += '<div class="pv-bar">';
    html += '<button class="btn btn-sm" onclick="App.closePreview()">✕ 退出</button>';
    html += '<span class="pv-title">👀 ' + (weekOff === 0 ? '本周' : '下周') + ' · ' + day.day_cn
         + (this.isDayToday(d, weekOff) ? '（今天）' : '') + '</span>';
    html += '<button class="btn btn-sm btn-outline" onclick="App.togglePvPicker()">换天 ▾</button>';
    html += '</div>';

    // ---- 换天浮层：默认收起，不影响舞台高度 ----
    if (this._pvPickerOpen) {
      html += '<div class="pv-picker">';
      html += '<div class="pv-row">';
      html += '<button class="btn btn-sm ' + (weekOff === 0 ? 'btn-primary' : '') + '" onclick="App.previewGo(' + d + ',0)">本周</button>';
      html += '<button class="btn btn-sm ' + (weekOff === 1 ? 'btn-primary' : '') + '" onclick="App.previewGo(' + d + ',1)">下周</button>';
      html += '<span class="fs-12 text-sub" style="align-self:center;margin-left:auto">点日期直接跳过去</span>';
      html += '</div>';
      html += '<div class="pv-row">';
      weekDays.forEach((dd, i) => {
        const on = i === d;
        html += '<button class="btn btn-sm ' + (on ? 'btn-primary' : '') + '" onclick="App.previewGo(' + i + ',' + weekOff + ')">'
             + dd.day_cn + (this.isDayToday(i, weekOff) ? '·今天' : '') + '</button>';
      });
      html += '</div>';
      html += '<div class="pv-mods">' + this.getDayDateLabel(d, weekOff) + ' · 共'
           + (day.total_duration || 0) + '分钟 · '
           + (day.modules || []).map(m => m.name_cn).join(' · ') + '</div>';
      html += '</div>';
    }

    // ---- 学生界面本体：同一个函数，逐字未改 ----
    html += this.renderStage(d);
    return html;
  },

  // ===== Teacher: Daily Detail =====
  renderDaily() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">📅 每日作业详情 · 第 ' + (this._weekIdx() + 1) + ' 周</h2>';
    html += '<div class="day-grid mb-16">';
    HOMEWORK_DATA.forEach((day, i) => {
      html += '<div class="day-card ' + (i===this.state.currentDay?'':'') + '" style="' + (i===this.state.currentDay?'border-color:var(--primary)':'') + '" onclick="App.selectDay(' + i + ')">';
      html += '<div class="day-name">' + day.day_cn + (this.isDayToday(i, 0) ? ' <span style="font-size:11px;color:var(--primary)">今天</span>' : '') + '</div>';
      html += '<div class="day-type" style="font-size:11px;color:var(--primary-dark)">' + this.getDayDateLabel(i, 0) + '</div>';
      html += '<div class="day-type">' + day.modules.map(m=>m.name_cn).join('·') + '</div>';
      html += '</div>';
    });
    html += '</div>';
    const day = HOMEWORK_DATA[this.state.currentDay];
    html += '<div id="day-detail">' + this.renderDayModules(day) + '</div>';
    return html;
  },

  selectDay(idx) {
    this.state.currentDay = idx;
    this.renderContent();
  },

  renderDayModules(day) {
    const dayIdx = HOMEWORK_DATA.indexOf(day);
    let html = '<h3 style="color:var(--primary-dark);margin:8px 0 12px">' + day.day_cn + '（' + this.getDayDateLabel(dayIdx >= 0 ? dayIdx : 0, 0) + '）· 共' + day.total_duration + '分钟</h3>';
    day.modules.forEach(m => {
      html += '<div class="module-card">';
      html += '<div class="module-header"><span class="m-name">' + this.getModuleIcon(m.type) + ' ' + m.name_cn + '</span><span class="m-duration">' + m.duration + '分钟</span></div>';
      html += '<div class="module-body">';
      // Show all questions with answers and explanations (teacher view)
      if (m.type === 'speaking' && m.questions) {
        m.questions.forEach((q, qi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">第' + (qi+1) + '题</div>';
          html += '<div class="q-text">' + q.sentence + '</div>';
          html += '<div class="text-sub fs-12">' + q.sentence_cn + '</div>';
          html += '<div class="q-options">';
          q.options.forEach((o, oi) => {
            html += '<div class="q-option ' + (oi===q.answer?'correct':'') + '">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
          });
          html += '</div>';
          html += '<div class="q-answer">✅ 正确答案：' + String.fromCharCode(65+q.answer) + '</div>';
          if (q.pronunciation_tips) html += '<div class="fs-12 mt-8" style="color:var(--info)">🗣️ ' + q.pronunciation_tips + '</div>';
          html += '<div class="q-explanation show"><div class="cn">📖 ' + q.explanation_cn + '</div><div class="en">📘 ' + q.explanation_en + '</div></div>';
          html += '</div>';
        });
      } else if (m.type === 'vocabulary_game' && m.words) {
        m.words.forEach((w, wi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">单词' + (wi+1) + '</div>';
          html += '<div class="q-text" style="font-size:18px">' + w.emoji + ' <strong>' + w.word + '</strong> ' + w.phonetic + ' = ' + w.meaning + '</div>';
          html += '<div class="text-sub fs-12">例句：' + w.example_en + ' ' + w.example_cn + '</div>';
          html += '<div class="mt-8 fs-12">闯关阶段：</div>';
          w.stages.forEach((s, si) => {
            html += '<div class="fs-12 text-sub">' + (si+1) + '. ' + this.getStageName(s.type);
            if (s.prompt) html += ' — ' + s.prompt;
            if (s.answer) html += ' (答案: ' + s.answer + ')';
            html += '</div>';
          });
          html += '</div>';
        });
      } else if (m.type === 'writing_template') {
        html += '<div class="q-item">';
        html += '<div class="q-text">✍️ ' + m.title + '</div>';
        html += '<div class="writing-banner">⚠️ ' + m.requirement_cn + '</div>';
        html += '<div class="writing-keywords">';
        m.keywords.forEach(k => html += '<span class="keyword-chip">' + k + '</span>');
        html += '</div>';
        html += '<div class="writing-essay">' + this.renderTemplateText(m) + '</div>';
        html += '<div class="q-answer">完整范文：' + m.full_text + '</div>';
        html += '<div class="q-explanation show"><div class="cn">📖 ' + m.explanation_cn + '</div><div class="en">📘 ' + m.explanation_en + '</div></div>';
        html += '</div>';
      } else if (m.questions) {
        if (m.passage) html += '<div class="card mb-8" style="background:var(--bg)"><div class="fs-12 text-sub mb-4">📄 阅读材料：</div>' + (m.passage_cn||'') + '<br>' + m.passage + '</div>';
        m.questions.forEach((q, qi) => {
          html += '<div class="q-item">';
          html += '<div class="q-num">第' + (qi+1) + '题</div>';
          html += '<div class="q-text">' + q.question + '</div>';
          if (q.options) {
            html += '<div class="q-options">';
            q.options.forEach((o, oi) => {
              html += '<div class="q-option ' + (oi===q.answer?'correct':'') + '">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
            });
            html += '</div>';
          }
          html += '<div class="q-answer">✅ 正确答案：' + (q.options ? String.fromCharCode(65+q.answer) : q.answer) + '</div>';
          html += '<div class="q-explanation show"><div class="cn">📖 ' + q.explanation_cn + '</div><div class="en">📘 ' + q.explanation_en + '</div></div>';
          html += '</div>';
        });
      }
      html += '</div></div>';
    });
    return html;
  },

  // ===== Teacher: Edit =====
  renderEdit() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">✏️ 作业编辑</h2>';
    html += '<p class="text-sub mb-16">点击模块可修改名称、时长和说明</p>';
    HOMEWORK_DATA.forEach((day, di) => {
      html += '<div class="card mb-16">';
      html += '<div class="card-title">' + day.day_cn + '（本周' + this.getDayDateLabel(di, 0) + '）· ' + day.theme_cn + ' · 共' + day.total_duration + '分钟</div>';
      day.modules.forEach((m, mi) => {
        html += '<div class="flex-between mb-8 p-8" style="background:var(--bg);border-radius:8px">';
        html += '<span>' + this.getModuleIcon(m.type) + ' ' + m.name_cn + ' (' + m.duration + '分钟)</span>';
        html += '<button class="btn btn-outline btn-sm" onclick="App.editModule(' + di + ',' + mi + ')">编辑</button>';
        html += '</div>';
      });
      html += '</div>';
    });
    return html;
  },

  editModule(di, mi) {
    const m = HOMEWORK_DATA[di].modules[mi];
    this.showModal(`
      <div class="modal-header"><div class="modal-title">编辑模块</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label>模块名称</label><input type="text" id="edit-name" value="${m.name_cn}"></div>
        <div class="form-group"><label>时长（分钟）</label><input type="number" id="edit-duration" value="${m.duration}"></div>
        <div class="form-group"><label>说明</label><textarea id="edit-note" rows="3" placeholder="模块说明">${m.requirement_cn||m.theme_cn||''}</textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="App.saveEdit(${di},${mi})">保存</button>
        <button class="btn btn-outline" onclick="App.closeModal()">取消</button>
      </div>
    `);
  },

  saveEdit(di, mi) {
    const m = HOMEWORK_DATA[di].modules[mi];
    m.name_cn = document.getElementById('edit-name').value;
    m.duration = parseInt(document.getElementById('edit-duration').value);
    const note = document.getElementById('edit-note').value;
    if (m.requirement_cn !== undefined) m.requirement_cn = note;
    // Recalculate total duration
    HOMEWORK_DATA[di].total_duration = HOMEWORK_DATA[di].modules.reduce((s,mod) => s + mod.duration, 0);
    this.closeModal();
    this.renderContent();
  },

  // ===== Teacher: Check-in Monitor =====

  // 打卡数据来自后台，不是老师这台手机上"攒"出来的。这一条把两件事直说：
  //   1. 后台到底收到了多少条（收了 0 条就等于"全是未打卡"，家长一眼能判断
  //      是"孩子没传"还是"系统没显示"）；
  //   2. **还没上传的孩子是谁** —— 家长知道该让哪几个孩子去开一次 App。
  // 家长 2026-10-14：「他们打卡的东西从我这一个账号就能看见，而不是非要他们
  // 下拉我才能收到」。这条就是那个"一个账号看全班"的入口。
  _checkinSyncStrip() {
    const tag = this._weekTag();
    const students = this.state.students || [];
    let cloudRows = 0, latest = '';
    const reported = {};
    students.forEach(s => {
      let n = 0;
      HOMEWORK_DATA.forEach((d, di) => {
        const ck = this.state.checkins[s.id + tag + '_d' + di];
        // fromCloud 由 _mergeCloudCheckins 打上 —— 只有"后台回来的"才算上传过，
        // 老师本机自己点出来的记录不算（否则会假报"已上传"）。
        if (!ck || !ck.fromCloud) return;
        n++; cloudRows++;
        if (ck.at && String(ck.at) > latest) latest = String(ck.at);
      });
      if (n) reported[s.id] = n;
    });
    const missing = students.filter(s => !reported[s.id]);

    let when = '';
    if (latest) {
      const d = new Date(latest);
      if (!isNaN(d.getTime())) {
        const mins = Math.round((Date.now() - d.getTime()) / 60000);
        const hhmm = String(d.getHours()).padStart(2, '0') + ':'
                   + String(d.getMinutes()).padStart(2, '0');
        when = hhmm + (mins >= 0 && mins < 720
          ? '（' + (mins < 1 ? '刚刚' : mins + ' 分钟前') + '）' : '');
      }
    }

    let html = '<div class="card mb-16 sync-strip">';
    html += '<div class="sync-head"><span class="sync-title">📡 数据来自后台（孩子手机自动上传）</span>';
    html += '<button class="btn btn-outline btn-sm" onclick="App.refreshCheckins(this)">🔄 重新拉取</button></div>';
    html += '<div class="sync-line">本周从后台收到 <b>' + cloudRows + '</b> 条打卡记录';
    html += when ? '，最近一次 <b>' + this._escHtml(when) + '</b>' : '（还没有收到任何记录）';
    html += '</div>';
    if (!students.length) {
      html += '<div class="sync-line text-sub">名单里还没有学生。</div>';
    } else if (missing.length) {
      html += '<div class="sync-line sync-warn">还没上传的 <b>' + missing.length + '</b> 位：'
            + missing.map(s => this._escHtml(s.name)).join('、')
            + '<br><span class="sync-tip">让这几位同学各自打开一次 App，就会自动上传'
            + '（不用做题、不用下拉刷新）。</span></div>';
    } else {
      html += '<div class="sync-line sync-ok">全班 ' + students.length + ' 位本周都已有记录 ✅</div>';
    }
    html += '</div>';
    return html;
  },

  // 老师版"刷新"：不用下拉，点一下就把后台再拉一遍。
  async refreshCheckins(btn) {
    const label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在拉取…'; }
    try {
      await this._pullCloudCheckins('class');
      this.renderContent();
      this.showToast('✅ 已从后台拉取最新打卡记录');
    } catch (e) {
      // 拉失败保持原样显示（本机那份不动）—— 断网不该把界面清空。
      if (btn) { btn.disabled = false; btn.textContent = label; }
      this.showToast('⚠️ 拉取失败，请检查网络后重试');
    }
  },

  renderCheckin() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">📊 打卡监控</h2>';
    html += this._checkinSyncStrip();
    // Note: no auto-generated demo data - show real data only
    // Summary
    html += '<div class="stat-row mb-16">';
    let totalDone = 0, totalUndone = 0;
    this.state.students.forEach(s => {
      HOMEWORK_DATA.forEach((d, di) => {
        const k = s.id + this._weekTag() + '_d' + di;
        if (this.state.checkins[k] && this.state.checkins[k].done) totalDone++;
        else totalUndone++;
      });
    });
    html += '<div class="stat-box"><div class="num" style="color:var(--success)">' + totalDone + '</div><div class="label">已打卡</div></div>';
    html += '<div class="stat-box"><div class="num" style="color:var(--danger)">' + totalUndone + '</div><div class="label">未打卡</div></div>';
    html += '<div class="stat-box"><div class="num">' + Math.round(totalDone/(totalDone+totalUndone)*100) + '%</div><div class="label">完成率</div></div>';
    html += '</div>';

    // Table
    html += '<div class="card"><div class="checkin-table"><table class="data-table"><thead><tr><th>学生</th>';
    HOMEWORK_DATA.forEach((d, di) => html += '<th>' + d.day_cn + '<br><span style="font-weight:400;font-size:10px;color:var(--text-sub,#888)">' + this.getDayDateLabel(di, 0) + '</span></th>');
    html += '<th>总完成</th><th>平均正确率</th></tr></thead><tbody>';
    this.state.students.forEach(s => {
      html += '<tr><td>' + s.name + '</td>';
      let doneCount = 0, totalCorrect = 0, correctCount = 0;
      HOMEWORK_DATA.forEach((d, di) => {
        const k = s.id + this._weekTag() + '_d' + di;
        const ck = this.state.checkins[k];
        // A record exists from the first answer on. Show the dot either way —
        // 'started but unfinished' is what the teacher most wants to see —
        // but only count a finished day toward doneCount.
        if (ck) {
          if (ck.done) doneCount++;
          if (ck.correctRate) { totalCorrect += ck.correctRate; correctCount++; }
          const cls = ck.completed === 'partial' ? 'partial' : 'done';
          html += '<td><span class="checkin-dot ' + cls + '" title="' + ck.time + ' 正确率' + ck.correctRate + '%">✓</span></td>';
        } else {
          html += '<td><span class="checkin-dot undone">✗</span></td>';
        }
      });
      html += '<td>' + doneCount + '/' + HOMEWORK_DATA.length + '</td>';
      html += '<td>' + (correctCount > 0 ? Math.round(totalCorrect/correctCount) + '%' : '-') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
  },

  // ===== Teacher: Score Analysis =====
  renderScores() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">📈 成绩分析</h2>';
    HOMEWORK_DATA.forEach((day, di) => {
      html += '<div class="card mb-16">';
      html += '<div class="card-title">' + day.day_cn + '（' + this.getDayDateLabel(di, 0) + '）· ' + day.theme_cn + '</div>';
      day.modules.forEach(m => {
        // Calculate demo scores
        const scores = [];
        this.state.students.forEach(s => {
          const k = s.id + this._weekTag() + '_d' + di;
          const ck = this.state.checkins[k];
          if (ck && ck.done && ck.correctRate) scores.push(ck.correctRate);
        });
        if (scores.length > 0) {
          const avg = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
          const max = Math.max(...scores);
          const min = Math.min(...scores);
          const passRate = Math.round(scores.filter(s=>s>=60).length/scores.length*100);
          html += '<div class="flex-between mb-8 p-8" style="background:var(--bg);border-radius:8px">';
          html += '<span>' + this.getModuleIcon(m.type) + ' ' + m.name_cn + '</span>';
          html += '<span>平均' + avg + '% | 最高' + max + '% | 最低' + min + '% | 及格率' + passRate + '%</span>';
          html += '</div>';
        }
      });
      html += '</div>';
    });
    return html;
  },

  // ===== Teacher: Error Book =====
  async renderErrorBook() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">❌ 班级错题本</h2>';
    html += '<p class="text-sub mb-12">学生答错的题会上传到云端，老师可在此查看全班错题汇总。</p>';
    await this._loadCloudWrongCache();
    // Real wrong answers. This used to invent them: it took any student whose
    // day-level correctRate was under 80 and flagged a random half of the
    // questions as wrong, so the same page showed different errors on reload.
    const errors = [];
    HOMEWORK_DATA.forEach((day, di) => {
      day.modules.forEach((m, mi) => {
        if (m.questions) {
          m.questions.forEach((q, qi) => {
            const wrongStudents = [];
            this.state.students.forEach(s => {
              const a = this._lookupWrongAnswer(s.id, di, mi, qi);
              if (a && !a.correct) wrongStudents.push(s.name);
            });
            if (wrongStudents.length > 0) {
              errors.push({ day: day.day_cn, module: m.name_cn, question: q.question || q.sentence, answer: q.options ? String.fromCharCode(65+q.answer) : q.answer, explanation_cn: q.explanation_cn, explanation_en: q.explanation_en, students: wrongStudents, dayIdx: di });
            }
          });
        }
      });
    });
    errors.sort((a,b) => b.students.length - a.students.length);
    errors.forEach(e => {
      html += '<div class="error-item">';
      html += '<div class="e-q"><strong>' + this._dayTag(e.day, e.module, e.dayIdx) + '</strong> ' + e.question + '</div>';
      html += '<div class="q-answer">正确答案：' + e.answer + '</div>';
      html += '<div class="e-students">❌ 做错学生(' + e.students.length + '人)：' + e.students.join('、') + '</div>';
      html += '<div class="q-explanation show"><div class="cn">📖 ' + e.explanation_cn + '</div><div class="en">📘 ' + e.explanation_en + '</div></div>';
      html += '</div>';
    });
    if (errors.length === 0) html += '<p class="text-sub text-center">暂无错题记录</p>';
    return html;
  },

  // ===== Teacher: Error sheet — blank lines sized to the answer =====
  // 错题卷上这道题的标准答案（打印横线要用它的长度）。
  // 选择题的 answer 是选项下标，填空题的 answer 才是文本本身。
  _a4AnswerText(q) {
    if (q == null) return '';
    if (Array.isArray(q.options)) {
      // 极少数题虽然有 options，answer 却直接写了答案文本
      if (typeof q.answer === 'string' && !/^\d+$/.test(q.answer.trim())) return q.answer;
      const i = parseInt(q.answer, 10);
      if (isFinite(i) && i >= 0 && q.options[i] != null) return String(q.options[i]);
      return '';
    }
    if (Array.isArray(q.answer)) return q.answer.join('; ');
    return q.answer == null ? '' : String(q.answer);
  },

  // 把题目里的填空横线（___）换成"跟答案一样长"的书写线。
  // 家长反馈：原来不管答案多长，题目里永远只有三个下划线 —— 写 goes 勉强，
  // 写 was reading / talking 根本写不下。这里按标准答案的字数把横线拉长：
  // 一个字母留 1.6em，太短的答案（are、goes）也保证有 4 个字母的位置，太长
  // 的答案最多占满一行，免得把 A4 版心撑破。
  // 一道题可能有多个空（"___ of the students ... ___ girls."），标准答案里
  // 用 ";" 分隔（Two-thirds; are），按出现顺序一一对应；答案不够分时后面的
  // 空沿用最后一个。还有一种题是答案本身被空格分成两截
  // （"How long ___ you ___ (learn) English?" → have learned），空位和空格
  // 数对得上就按空格拆。
  _a4BlankLetters(q, blanks) {
    const n = Math.max(1, blanks || 1);
    const ans = typeof q === 'string' ? '' : this._a4AnswerText(q);
    let parts = String(ans).split(/[;；]/).map(function(s) { return s.trim(); }).filter(Boolean);
    if (n > 1 && parts.length === 1) {
      const bySpace = parts[0].split(/\s+/).filter(Boolean);
      if (bySpace.length === n) parts = bySpace;
    }
    return parts;
  },

  _a4QuestionHtml(q) {
    const text = (typeof q === 'string' ? q : (q && (q.question || q.sentence))) || '';
    const blanks = (String(text).match(/_{2,}/g) || []).length;
    const parts = this._a4BlankLetters(q, blanks);
    const PER = 1.6;        // 每个字母留多宽（em）——手写比印刷体宽
    const MIN = 4;          // 再短的答案也留 4 个字母的位置
    const MAX = 20;         // 再长的答案最多占满一行
    let n = 0;
    return String(text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/_{2,}/g, function() {
        const p = parts.length ? parts[Math.min(n, parts.length - 1)] : '';
        n++;
        let letters = p ? p.length : MIN;
        if (letters < MIN) letters = MIN;
        if (letters > MAX) letters = MAX;
        return '<span class="a4-blank" style="width:' + (letters * PER).toFixed(1) + 'em"></span>';
      });
  },

  // ===== 错题标签上的"具体日期" =====
  // 家长反馈：卷面上只写「周一·语法」，翻回去对不上是哪天做的，没法跟踪。
  // 题库按自然周轮换（data.js 里 HOMEWORK_EPOCH = 第 1 周的周一 2026-09-28），
  // 所以「第几周的第几天」能唯一换算成一个具体日期：
  //   日期 = HOMEWORK_EPOCH + 本周序号 × 7 + 第几天
  // 用作业日的日期（而不是"实际答题那天"）是为了让日期和周几永远对得上 ——
  // 孩子周三补做周一的题，卷面上仍然是「2026-10-12 周一」，不会自相矛盾。
  _weekDayYmd(dayIdx) {
    const ep = (typeof HOMEWORK_EPOCH !== 'undefined' && HOMEWORK_EPOCH) ? HOMEWORK_EPOCH : null;
    if (!ep) return '';
    const d = new Date(ep.getTime());
    d.setDate(d.getDate() + this._weekIdx() * 7 + (Number(dayIdx) || 0));
    const p = n => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  },

  // 统一的错题标签：[2026-10-12 周一·语法]（拿不到日期时退回 [周一·语法]）
  _dayTag(dayCn, moduleCn, dayIdx) {
    const ymd = this._weekDayYmd(dayIdx);
    return '[' + (ymd ? ymd + ' ' : '') + (dayCn || '') + '·' + (moduleCn || '') + ']';
  },

  // ===== Teacher: Print Error Sheet =====
  renderPrint() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">🖨️ 错题卷打印</h2>';
    html += '<p class="text-sub mb-16">选择学生生成个性化A4错题卷，答案默认隐藏，可切换显示</p>';
    html += '<div class="flex gap-8 mb-16" style="flex-wrap:wrap">';
    this.state.students.forEach(s => {
      html += '<button class="btn btn-outline btn-sm" onclick="App.genErrorSheet(\'' + s.id + '\')">' + s.name + '</button>';
    });
    html += '</div>';
    html += '<div id="print-area"></div>';
    return html;
  },

  async genErrorSheet(sid) {
    const student = this.state.students.find(s => s.id === sid);
    if (!student) return;
    await this._loadCloudWrongCache();
    // Collect this student's errors — the questions they actually got wrong.
    // Local-first, then cloud — the local row carries `value` and full record,
    // the cloud fallback is only needed when the kid answered on another device.
    const errors = [];
    HOMEWORK_DATA.forEach((day, di) => {
      day.modules.forEach((m, mi) => {
        if (m.questions) {
          m.questions.forEach((q, qi) => {
            const a = this._lookupWrongAnswer(student.id, di, mi, qi);
            if (a && !a.correct) {
              errors.push({ day: day.day_cn, module: m.name_cn, q: q, type: m.type, dayIdx: di });
            }
          });
        }
      });
    });
    // If too few errors, add similar questions
    const similarQuestions = [];
    if (errors.length < 5) {
      const pool = [
        { question: 'He ___ (go) to school by bus every day.', answer: 'goes', explanation_cn: '第三人称单数，every day 表示一般现在时，go 变 goes。', explanation_en: 'Third person singular with habitual action uses goes.' },
        { question: 'I ___ (read) a book when the phone rang.', answer: 'was reading', explanation_cn: '过去进行时，was/were + doing，表示过去某时刻正在进行的动作。', explanation_en: 'Past continuous: was/were + doing for an action in progress in the past.' },
        { question: 'She has ___ (finish) her homework already.', answer: 'finished', explanation_cn: '现在完成时 has + 过去分词，already 用于肯定句。', explanation_en: 'Present perfect: has + past participle, already for affirmative.' },
        { question: '___ interesting story it is!', answer: 'What an', explanation_cn: '感叹句 What (a/an) + adj + noun！story 可数名词单数，interesting 元音开头用 an。', explanation_en: 'Exclamatory: What (a/an) + adj + noun! Singular countable with vowel sound uses an.' },
        { question: 'There ___ many apples on the tree.', answer: 'are', explanation_cn: 'There be 就近原则，apples 复数用 are。', explanation_en: 'There be follows proximity principle; plural apples uses are.' },
      ];
      pool.forEach((p, i) => {
        if (errors.length + similarQuestions.length < 6) {
          similarQuestions.push(p);
        }
      });
    }

    let html = '<div class="a4-print-area" id="a4-print-' + sid + '">';
    html += '<div class="a4-sheet" id="a4-sheet-' + sid + '">';
    html += '<h1>英语错题巩固卷</h1>';
    html += '<div class="a4-info">姓名：___________  日期：___________  得分：___________</div>';
    if (errors.length > 0) {
      html += '<h3 style="margin:12px 0 8px">一、错题重做（共' + errors.length + '题）</h3>';
      errors.forEach((e, i) => {
        html += '<div class="a4-q">';
        html += '<div class="a4-q-num">' + (i+1) + '. ' + this._dayTag(e.day, e.module, e.dayIdx) + ' ' + this._a4QuestionHtml(e.q) + '</div>';
        if (e.q.options) {
          e.q.options.forEach((o, oi) => {
            html += '<div style="margin-left:20px">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
          });
        }
        html += '<div class="a4-write-area"></div>';
        html += '<div class="a4-write-area"></div>';
        // Hidden answer (teacher can toggle)
        html += '<div class="a4-ans" id="ans-' + sid + '-' + i + '">正确答案：' + (e.q.options ? String.fromCharCode(65+e.q.answer) : e.q.answer) + '<br>解析：' + (e.q.explanation_cn||'') + '<br>Explanation: ' + (e.q.explanation_en||'') + '</div>';
        html += '</div>';
      });
    }
    if (similarQuestions.length > 0) {
      html += '<h3 style="margin:16px 0 8px">二、相似题型巩固练习（共' + similarQuestions.length + '题）</h3>';
      similarQuestions.forEach((sq, i) => {
        html += '<div class="a4-q a4-similar">';
        html += '<div class="a4-q-num">' + (errors.length+i+1) + '. ' + this._a4QuestionHtml(sq) + '</div>';
        html += '<div class="a4-write-area"></div>';
        html += '<div class="a4-ans" id="sim-ans-' + sid + '-' + i + '">正确答案：' + sq.answer + '<br>解析：' + sq.explanation_cn + '<br>Explanation: ' + sq.explanation_en + '</div>';
        html += '</div>';
      });
    }
    html += '<div style="margin-top:20px;text-align:center;font-size:10pt;color:#999">Amy老师英语打卡平台 | 错题更少，进步更快</div>';
    html += '</div></div>';

    // Controls
    html += '<div class="no-print mt-16 text-center" style="padding:12px">';
    html += '<button class="btn btn-outline btn-sm" onclick="App.toggleAnswers(\'' + sid + '\',' + errors.length + ',' + similarQuestions.length + ')">👁️ 显示/隐藏答案</button> ';
    html += '<button class="btn btn-primary btn-sm" onclick="App.doPrint()">🖨️ 打印</button>';
    html += '</div>';

    document.getElementById('print-area').innerHTML = html;
  },

  toggleAnswers(sid, errCount, simCount) {
    for (let i = 0; i < errCount; i++) {
      const el = document.getElementById('ans-' + sid + '-' + i);
      if (el) el.classList.toggle('show');
    }
    for (let i = 0; i < simCount; i++) {
      const el = document.getElementById('sim-ans-' + sid + '-' + i);
      if (el) el.classList.toggle('show');
    }
  },

  doPrint() { window.print(); },

  // ===== Teacher: Speaking Records =====
  // Was unreachable: it referenced an undefined `di` and threw on open, and
  // the scores under it were Math.random(). Now it renders the real recording
  // records, or an honest empty state when there are none.
  renderSpeakingRecords() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">🎤 口语练习记录</h2>';
    html += '<p class="text-sub mb-16">学生朗读录音的得分记录</p>';

    const records = this.state.speakingRecords || [];
    if (records.length === 0) {
      html += '<div class="card text-center text-sub">暂无口语记录<br>' +
              '<span class="fs-12">学生在字母/音节模块完成朗读后，记录会出现在这里</span></div>';
      return html;
    }

    // Group by day, newest first within each day.
    const byDay = {};
    records.forEach(r => {
      const k = r.dayIdx === undefined ? 'other' : r.dayIdx;
      (byDay[k] = byDay[k] || []).push(r);
    });

    const nameOf = (sid) => {
      const s = this.state.students.find(st => st.id === sid);
      return s ? s.name : (sid || '未知学生');
    };

    Object.keys(byDay).sort((a, b) => a - b).forEach(k => {
      const day = HOMEWORK_DATA[k];
      const rows = byDay[k].slice().sort((a, b) => (b.at || '').localeCompare(a.at || ''));
      html += '<div class="card mb-16">';
      html += '<div class="card-title">' + (day ? day.day_cn + '（' + this.getDayDateLabel(Number(k), 0) + '）' : '未归类') + '</div>';
      html += '<table class="data-table"><thead><tr><th>学生</th><th>内容</th><th>轮次</th><th>得分</th><th>分数来源</th><th>时间</th><th>录音</th></tr></thead><tbody>';
      rows.forEach(r => {
        // v139：识别端没回话、按"确实读到了"放行的那一遍没有分数。
        // 这里必须显示"未判分"而不是 0 分 —— 0 分会让老师以为孩子没读。
        const hasScore = (typeof r.score === 'number');
        const score = hasScore ? r.score : null;
        // Where the number came from matters more than the number: none of
        // these measure pronunciation.
        const src = r.source === 'asr' ? '语音识别比对'
                  : r.source === 'self' ? '学生自评'
                  : r.source === 'voice' ? '已录下（识别未回结果）'
                  : '音量';
        html += '<tr><td>' + nameOf(r.studentId) + '</td>';
        html += '<td>' + (r.label || '-') + '</td>';
        html += '<td>' + (r.round || 1) + '</td>';
        html += '<td>' + (hasScore ? score : '<span class="fs-12 text-sub">未判分</span>')
             + (r.wordTotal ? ' <span class="fs-12 text-sub">(' + r.okCount + '/' + r.wordTotal + '词)</span>' : '') + '</td>';
        html += '<td class="fs-12 text-sub">' + src
             + (r.spoken ? '<br><span style="color:var(--ink-3)">识别：' + r.spoken + '</span>' : '')
             + ((r.wrongWords && r.wrongWords.length)
                 ? '<br><span style="color:#D6321F">读错：' + r.wrongWords.map(w=>w.expected+'→'+w.heard).join('、') + '</span>' : '')
             + ((r.missedWords && r.missedWords.length)
                 ? '<br><span style="color:var(--ink-3)">漏读：' + r.missedWords.join('、') + '</span>' : '')
             + '</td>';
        html += '<td class="fs-12">' + (r.at ? r.at.slice(11, 16) : '-') + '</td>';
        html += '<td>' + (r.audioUrl
          ? '<audio controls preload="none" src="' + r.audioUrl + '" style="height:30px;max-width:200px"></audio>'
          : '<span class="fs-12 text-sub">音频已失效</span>') + '</td></tr>';
      });
      html += '</tbody></table>';
      // The volume-based score says nothing about pronunciation — say so
      // rather than letting the teacher read it as an assessment.
      html += '<p class="fs-12 text-sub mt-8">以上分数来自音量、学生自评或语音识别比对，'
           + '<strong>都不能代表发音准确度</strong>。请点开录音试听判断。</p>';
      html += '</div>';
    });
    return html;
  },

  // ===== Teacher: Student Management =====
  //
  // 老师 2026-10-15：「这块还是太复杂了。显示所有的学生已分配的放在一起，未分配的
  // 都显示到一起，然后点删除就能删除掉，就直接从列表里消失。然后他们要再加入的话，
  // 就需要老师验证才能通过 —— 这个规则永远不变。这个页面调了好多次，你给调得太
  // 复杂了，搞最简单的。」
  //
  // 所以页面只剩两件事：
  //   ① 未分配（一群人）  —— 一个全选、一个删除
  //   ② 已分配（一群人）  —— 一个全选、一个删除
  // 其余（被拦截名单、重新入班申请、同步状态、班级数）统统折进最下面的「⚙️ 更多」，
  // 平时不展开、不占地方。功能一个没少，只是不再挤在孩子名单前面。
  //
  // 删除的规则（老师反复确认过的，**永远不变**）：
  //   从名单删掉 + 写进后台拦截名单 ⇒ 他再次登录必须经老师同意。
  //   顺序是「先落闸、验回来、再删人」（见 deletePicked），不许反过来。
  renderStudents() {
    // ===== v133：名单必须**扣掉已被删的人**（老师 2026-10-16）=====
    //
    // 老师：「这些学生名单删除了之后，还是存在少儿英语A班的田默涵，
    //        包括测试test这个账号，删除了仍然存在。我需要删除之后再也看不见。」
    //
    // 根因：这个函数原来直接拿 `this.state.students` 就渲染了，**从不看拦截名单**。
    // 而删除做的是两件事：①写后台拦截名单 ②从本机 students 里摘掉。
    // 只要 ② 因为任何原因没落干净（另一台设备推回旧快照、本机 blob 残留、
    // 学生在删除前刚注册过），这条记录就会**重新出现在页面上** ——
    // 后台明明拦着、老师眼里却"删不掉"。
    //
    // 所以这里加一道**渲染层的硬过滤**：只要手机号在拦截名单里，
    // 就不进这两个区。这是最后一道防线，跟后台拦截是**两个独立的保证** ——
    // 后台管"他进不进得来"，这里管"你看不看得见"。两个都要有。
    const gated = new Set((this.state.removedPhones || []).map(g => g && g.phone).filter(Boolean));
    const all = (this.state.students || []).filter(s => s && s.phone && !gated.has(s.phone));
    // 未分配 = 还没班级（或还没批准）；已分配 = 有班级且已批准。
    // 未分配按注册时间倒序，刚申请的人排最上面，老师一眼能看到。
    const pending = all.filter(s => !s.approved || !s.class)
      .slice()
      .sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
    const approved = all.filter(s => s.approved && s.class);

    let html = '<h2 style="color:var(--primary-dark);margin-bottom:4px">👥 学生管理</h2>';
    html += '<p class="text-sub fs-12 mb-16">点<b>全选</b>→点<b>删除</b>，人就从列表里没了。'
         + '被删的人再登录，必须你点同意才能进来（这条永远不变）。</p>';

    // ===== ① 未分配 =====
    html += '<h3 style="color:var(--warning);margin:0 0 8px">⏳ 未分配（' + pending.length + '人）</h3>';
    if (!pending.length) {
      html += '<div class="card text-center text-sub fs-12" style="padding:14px">暂时没有未分配的学生</div>';
    } else {
      const pendPicked = pending.filter(s => this.isPicked('s', s.phone)).length;
      html += this._simplePickBar('pending', '未分配', pending.length, pendPicked);
      pending.forEach(s => {
        html += '<div class="assign-card">';
        html += '<div class="ac-info">';
        html += this._studentPickLabel(s);
        html += '</div>';
        html += '<div class="ac-actions">';
        html += '<select id="assign-sel-' + s.id + '" style="padding:4px 8px;border-radius:6px;border:1.5px solid #FFE0CC;font-size:12px">';
        html += '<option value="">-- 选择班级 --</option>';
        (this.state.classes || []).forEach(c => { html += '<option value="' + c + '">' + c + '</option>'; });
        html += '</select>';
        html += '<button class="btn btn-primary btn-sm" onclick="App.assignStudent(\'' + s.id + '\')">✅ 分配班级</button>';
        html += '</div>';
        html += '</div>';
      });
    }

    // ===== ② 已分配 =====
    html += '<h3 style="color:var(--success);margin:20px 0 8px">✅ 已分配（' + approved.length + '人）</h3>';
    if (!approved.length) {
      html += '<div class="card text-center text-sub fs-12" style="padding:14px">暂时没有已分配的学生</div>';
    } else {
      const apprPicked = approved.filter(s => this.isPicked('s', s.phone)).length;
      html += this._simplePickBar('approved', '已分配', approved.length, apprPicked);
      approved.forEach(s => {
        html += '<div class="assign-card">';
        html += '<div class="ac-info">';
        html += this._studentPickLabel(s);
        html += '<span class="badge badge-assigned">' + (s.class || '-') + '</span>';
        html += '</div>';
        html += '</div>';
      });
    }

    if (!all.length) {
      html += '<div class="card text-center text-sub" style="margin-top:16px">暂无注册学生<br>'
           + '<span class="fs-12">学生登录后会自动出现在这里</span></div>';
    }

    // ===== ⚙️ 更多：其余那些老师平时不需要看的东西 =====
    // 按钮上只写"有几个"，让老师知道里面有没有需要处理的事，但不占用页面。
    const nGated = (this.state.removedPhones || []).length;
    const nJoin = (this.state.joinRequests || []).length;
    const moreHints = [];
    if (nJoin) moreHints.push('入班申请 ' + nJoin);
    if (nGated) moreHints.push('被删名单 ' + nGated);
    const moreLabel = this.state.showMore
      ? '▲ 收起'
      : ('⚙️ 更多' + (moreHints.length ? '（' + moreHints.join('、') + '）' : ''));
    html += '<div id="more-box" style="margin-top:24px">';
    html += '<button class="btn btn-outline btn-sm" onclick="App.toggleMore()">' + moreLabel + '</button>';
    if (this.state.showMore) {
      html += '<div class="card" style="margin-top:8px">';
      html += '<div class="fs-12" style="color:var(--text-sub);margin-bottom:8px">'
           + '✅ 云端同步：' + this._syncStatusText() + '（每15秒自动刷新）</div>';
      html += '<button class="btn btn-outline btn-sm" onclick="App.manualSync()">🔄 立即同步</button>';
      html += '<span class="fs-12 text-sub" style="margin-left:8px">共注册 ' + all.length
           + ' 人 · ' + (this.state.classes || []).length + ' 个班级</span>';
      html += '</div>';
      html += this._moreJoinRequestsHtml();
      html += this._moreGatedHtml();
    }
    html += '</div>';

    return html;
  },

  // 两区共用的那一行：全选 ☐ + 删除按钮。就这两样，老师要的就是这个。
  _simplePickBar(scope, label, total, pickedN) {
    const allPicked = pickedN > 0 && pickedN === total;
    let html = '<div class="pick-card">';
    html += '<div class="pick-tools">';
    html += '<label class="pick-label"><input type="checkbox" class="pick-box" '
         + (allPicked ? 'checked ' : '')
         + 'onclick="App.pickAllIn(this.checked,\'' + scope + '\')"> 全选（' + total + '）</label>';
    html += '<button class="btn btn-outline btn-sm" onclick="App.deleteInScope(\'' + scope + '\')">'
         + '🗑️ 删除选中（' + pickedN + '）</button>';
    html += '</div>';
    html += '<div class="pick-count">不想删谁，就点掉他前面的 ☐ —— 没勾的不会被删。</div>';
    html += '</div>';
    return html;
  },

  // 学生卡片左边那个「☐ + 名字 + 手机号」。两区长得一样。
  _studentPickLabel(s) {
    const phoneJs = String(s.phone || '').replace(/'/g, "\\'");
    const barred = (this.state.removedPhones || []).some(g => g.phone === s.phone);
    let html = '<label class="pick-label ac-pick">';
    html += '<input type="checkbox" class="pick-box" ' + (this.isPicked('s', s.phone) ? 'checked ' : '')
         + 'onclick="App.togglePick(\'s\',\'' + phoneJs + '\')">';
    html += '<span class="ac-grow"><span class="ac-name">' + s.name + '</span> '
         + '<span class="ac-phone">' + (s.phone || '-') + '</span></span>';
    html += '</label>';
    if (barred) html += '<span class="badge badge-pending">🚫 需你同意</span>';
    return html;
  },

  toggleMore() { this.state.showMore = !this.state.showMore; this.renderContent(); },

  // 「更多」里的：重新入班申请
  _moreJoinRequestsHtml() {
    const reqs = this.state.joinRequests || [];
    if (!reqs.length) return '';
    let html = '<h3 style="color:var(--primary-dark);margin:16px 0 8px">📮 申请重新入班（' + reqs.length + '人）</h3>';
    html += '<p class="text-sub fs-12 mb-8">这些学生被删过，正在申请回来。同意了他才能继续用。</p>';
    reqs.forEach(r => {
      html += '<div class="assign-card" style="border-color:var(--primary)">';
      html += '<div class="ac-info">';
      html += '<div><span class="ac-name">' + (r.name || '-') + '</span> <span class="ac-phone">' + (r.phone || '-') + '</span></div>';
      html += '<span class="badge badge-pending">申请重新加入</span>';
      html += '</div>';
      html += '<div class="ac-actions">';
      html += '<button class="btn btn-primary btn-sm" onclick="App.approveJoin(\'' + r.id + '\')">✅ 同意</button>';
      html += '<button class="btn btn-outline btn-sm" onclick="App.denyJoin(\'' + r.id + '\')">✖️ 拒绝</button>';
      html += '</div>';
      html += '</div>';
    });
    return html;
  },

  // 「更多」里的：被删过的号码名单。只保留「放行」和「删除」两件事，
  // 不再有全选/反选/收起那一堆 —— 这块平时没人动。
  _moreGatedHtml() {
    const gatedAll = this.state.removedPhones || [];
    if (!gatedAll.length) return '';
    let html = '<h3 style="color:var(--warning);margin:16px 0 8px">🚫 被删过的号码（' + gatedAll.length + '）</h3>';
    html += '<p class="text-sub fs-12 mb-8">这些人登录会被拦住，必须你同意。'
         + '点「🔓 放行」让他以后不用验证；点「🗑️ 删除」就彻底清掉这个号码。</p>';
    gatedAll.forEach(g => {
      const inRoster = (this.state.students || []).find(s => s.phone === g.phone);
      const name = (inRoster && inRoster.name) || g.name || '-';
      const phoneJs = String(g.phone).replace(/'/g, "\\'");
      const nameJs = String(name).replace(/'/g, "\\'");
      html += '<div class="assign-card" style="border-color:var(--warning)">';
      html += '<div class="ac-info">';
      html += '<span class="ac-grow"><span class="ac-name">' + name + '</span> '
           + '<span class="ac-phone">' + (g.phone || '-') + '</span></span>';
      html += '<span class="badge badge-pending">🚫 需你同意才能登录</span>';
      html += '</div>';
      html += '<div class="ac-actions">';
      html += '<button class="btn btn-primary btn-sm" onclick="App.unblockStudent(\'' + phoneJs + '\', \'' + nameJs + '\')">🔓 放行</button>';
      html += '<button class="btn btn-outline btn-sm" onclick="App.deleteGatedOne(\'' + phoneJs + '\', \'' + nameJs + '\')">🗑️ 删除</button>';
      html += '</div>';
      html += '</div>';
    });
    return html;
  },


  // Assign student to a class (also approves them)
  async assignStudent(sid) {
    const student = this.state.students.find(s => s.id === sid || s.phone === sid);
    if (!student) return;
    const sel = document.getElementById('assign-sel-' + sid);
    if (!sel || !sel.value) { alert('请选择一个班级'); return; }
    const className = sel.value;
    student.class = className;
    student.approved = true;
    await Api.saveStudent(student);
    this.syncToCloud();
    this.renderContent();
  },

  // ===== Teacher: re-join applications =====
  async fetchJoinRequests() {
    if (!this.isTeacher() || !this.state.phone) return;
    const reqs = await Api.classJoinRequests(this.state.phone);
    if (reqs === null) return;              // poll failed: keep the old list
    const prevCount = (this.state.joinRequests || []).length;
    this.state.joinRequests = reqs;
    // A new application arrived while the teacher is elsewhere in the app.
    if (reqs.length > prevCount) {
      this.showToast('📮 有新的入班申请，请到「学生管理」处理');
    }
  },

  // ===== Teacher: who is gated right now =====
  // 后台「移出名单」是本机看不到的真相：名单里的人，登录一定被拦住 —— 哪怕
  // 他已经重新出现在学生名单上（老师手动添加过、或云端同步又把他并回来了）。
  // 所以老师端必须把它拉出来显示，否则老师只会看到「这孩子怎么进不来」。
  async loadRemovedList() {
    if (!this.isTeacher() || !this.state.phone) return;
    const list = await Api.classRemovedList();
    if (list === null) return;              // 拉取失败：保持上一次的结果
    this.state.removedPhones = list;
  },

  // 老师显式放行。这是唯一一条「不经过学生申请」也能开门的路径，必须是点出来的。
  async unblockStudent(phone, name) {
    if (!this.isTeacher()) return;
    if (!confirm('解除对「' + (name || phone) + '」的登录拦截？\n\n解除后 TA 可以直接登录，不需要再申请。')) return;
    const ok = await Api.classUnblock(phone);
    if (!ok) { this.showToast('⚠️ 解除失败，请检查网络后重试', 'warn'); return; }
    // 后台放行了，本机也把墓碑清掉，否则下次合并又会把他藏起来。
    await Api.untombstonePhone(phone);
    // 放行了就别再把他留在「已收起」名单里 —— 否则以后他再被删时，会莫名其妙
    // 不进页面，老师会找不到这个人。
    const hid = this._hiddenGated();
    if (hid.indexOf(phone) >= 0) this._saveHiddenGated(hid.filter(p => p !== phone));
    const me = this.state.students.find(s => s.phone === phone);
    await this.loadRemovedList();
    this.showToast('✅ 已解除拦截，' + ((me && me.name) || name || phone) + ' 可以登录了');
    this.renderContent();
  },

  // 折叠/展开那批「不在名单里」的已拦截号码（多半是早年清掉的测试号）。
  toggleGatedRest() {
    this.state.showAllGated = !this.state.showAllGated;
    this.renderContent();
  },

  // ===== 老师端：批量管理（多选 / 全选 / 反选 / 一次删几个）=================
  // 老师 2026-10-14 原话：「有一个全选的功能，多选的功能，这样一次性可以多删几个」、
  // 「这 48 个号码，每个都有删除的按钮……点了全选之后就显示一键删除，然后点是否，
  //   我们就可以确认是或者否，删除了之后就不要再存在了」、「全选之后把不用的给反选」。
  // 所以「删除」对两种对象都是同一句话 —— 从你的列表里消失：
  //   · 学生（待分配 / 已分配）→ 从名单删掉 + 写进后台拦截名单（再次登录必须老师同意）
  //   · 拦截区里的号码 → 从后台拦截名单里彻底删掉（不再被拦，`_dropGates`）
  // 注意「🧹 收起不删」是另一条路：只是不显示，拦截一点没松（`_hiddenGated`）。
  _HIDDEN_GATED_KEY: 'amy-hidden-gated-v1',

  _hiddenGated() {
    try { return JSON.parse(localStorage.getItem(this._HIDDEN_GATED_KEY) || '[]') || []; }
    catch (e) { return []; }
  },
  _saveHiddenGated(list) {
    try { localStorage.setItem(this._HIDDEN_GATED_KEY, JSON.stringify(list || [])); } catch (e) {}
  },

  // 「和当前名单有关」的号码永远显示（名单里有名字却进不来，是老师最需要看到的事），
  // 只有与名单无关的旧号码才会被收起。渲染和「全选」共用这一份口径，不会两处打架。
  _gatedSplit() {
    const gatedAll = this.state.removedPhones || [];
    const rosterPhones = new Set((this.state.students || []).map(s => s.phone));
    const appliedPhones = new Set((this.state.joinRequests || []).map(r => r.phone));
    const hidden = new Set(this._hiddenGated());
    const related = gatedAll.filter(g => rosterPhones.has(g.phone) || appliedPhones.has(g.phone));
    const rest = gatedAll.filter(g => !rosterPhones.has(g.phone) && !appliedPhones.has(g.phone) && !hidden.has(g.phone));
    const tucked = gatedAll.filter(g => !rosterPhones.has(g.phone) && !appliedPhones.has(g.phone) && hidden.has(g.phone));
    const showRest = !!this.state.showAllGated;
    return {
      gatedAll: gatedAll, related: related, rest: rest, tucked: tucked,
      listed: related.concat(showRest ? rest : []),
      restCount: rest.length, tuckedCount: tucked.length,
    };
  },

  // 一个被拦号码的卡片。tucked = 老师已把它从页面收起（视觉上淡一点，
  // 但状态一模一样：仍然被拦着）。
  _gatedCardHtml(g, tucked) {
    const inRoster = this.state.students.find(s => s.phone === g.phone);
    const name = (inRoster && inRoster.name) || g.name || '-';
    const phoneJs = String(g.phone).replace(/'/g, "\\'");
    let html = '<div class="assign-card" style="border-color:var(--warning)' + (tucked ? ';opacity:.75' : '') + '">';
    html += '<div class="ac-info">';
    html += '<label class="pick-label ac-pick">';
    html += '<input type="checkbox" class="pick-box" ' + (this.isPicked('g', g.phone) ? 'checked ' : '')
         + 'onclick="App.togglePick(\'g\',\'' + phoneJs + '\')">';
    html += '<span class="ac-grow"><span class="ac-name">' + name + '</span> '
         + '<span class="ac-phone">' + (g.phone || '-') + '</span></span>';
    html += '</label>';
    html += '<span class="badge badge-pending">🚫 需你同意才能登录</span>';
    html += '</div>';
    html += '<div class="ac-actions">';
    html += '<button class="btn btn-primary btn-sm" onclick="App.unblockStudent(\'' + phoneJs + '\', \''
         + String(name).replace(/'/g, "\\'") + '\')">🔓 放行</button>';
    // 老师 2026-10-14：「这 48 个号码，每个都有删除的按钮……删除了之后就不要再存在了」
    html += '<button class="btn btn-outline btn-sm" onclick="App.deleteGatedOne(\'' + phoneJs + '\', \''
         + String(name).replace(/'/g, "\\'") + '\')">🗑️ 删除</button>';
    html += '</div>';
    html += '<div class="fs-12 text-sub mt-4">移出时间：'
         + (g.removed_at ? new Date(g.removed_at).toLocaleString('zh-CN') : '-') + '</div>';
    html += '</div>';
    return html;
  },

  _pickKey(kind, phone) { return kind + ':' + String(phone); },
  isPicked(kind, phone) { return (this.state.picked || []).indexOf(this._pickKey(kind, phone)) >= 0; },

  togglePick(kind, phone, checked) {
    const key = this._pickKey(kind, phone);
    let list = (this.state.picked || []).slice();
    const has = list.indexOf(key) >= 0;
    const want = (checked === undefined) ? !has : !!checked;
    if (want && !has) list.push(key);
    if (!want && has) list = list.filter(k => k !== key);
    this.state.picked = list;
    this.renderContent();
  },

  // 全选/反选 的公共实现。scope 决定作用范围（见 _studentsInScope）：
  //   'pending'  待分配区   'approved' 已分配区   'all' 全部学生
  // 只动 's:' 前缀的键，拦截区（'g:'）的勾选原样保留 —— 两套各选各的。
  _pickStudentsInScope(scope, keys) {
    const keep = (this.state.picked || []).filter(k => k.indexOf('s:') !== 0);
    this.state.picked = keep.concat(keys || []);
    this.renderContent();
  },
  _studentsInScope(scope) {
    const all = this.state.students || [];
    if (scope === 'pending') return all.filter(s => !s.approved || !s.class);
    if (scope === 'approved') return all.filter(s => s.approved && s.class);
    return all;
  },
  // 全选某一区（checked=false 即取消整区勾选）。故意不把「被拦号码」一起选上 ——
  // 那批号码动辄几十个；拦截区有它自己的全选。
  pickAll(checked) { this.pickAllPending(checked); this._pickStudentsInScope('all', checked ? (this.state.students || []).map(s => this._pickKey('s', s.phone)) : []); },
  pickAllPending(checked) {
    const keys = checked ? this._studentsInScope('pending').map(s => this._pickKey('s', s.phone)) : [];
    this._pickStudentsInScope('pending', keys);
  },
  pickAllApproved(checked) {
    const keys = checked ? this._studentsInScope('approved').map(s => this._pickKey('s', s.phone)) : [];
    this._pickStudentsInScope('approved', keys);
  },
  // 反选某一区：勾上的取消、没勾的勾上。老师要的就是「全选之后，把不用的给反选」。
  // 注意范围是**整区**（含当前没显示出来的行），否则点了反选会漏掉看不见的人。
  _invertStudentsInScope(scope) {
    const have = new Set((this.state.picked || []).filter(k => k.indexOf('s:') === 0));
    const keys = this._studentsInScope(scope)
      .map(s => this._pickKey('s', s.phone))
      .filter(k => !have.has(k));
    // 整区已有的勾选先清掉，再放上反选结果（这样才能真正"反"过来）
    const inScope = new Set(this._studentsInScope(scope).map(s => this._pickKey('s', s.phone)));
    const keep = (this.state.picked || []).filter(k => k.indexOf('s:') !== 0 || !inScope.has(k));
    this.state.picked = keep.concat(keys);
    this.renderContent();
  },
  invertPending() { this._invertStudentsInScope('pending'); },
  invertApproved() { this._invertStudentsInScope('approved'); },

  // ===== v128：页面精简后对外只留这两件事 =====
  // 老师 2026-10-15：「搞最简单的」。所以整个学生管理只剩「全选」+「删除」。
  // 这两个是新名字；下面 pickAllPending / deletePickedPending 等老名字全部
  // 保留成别名 —— 一是测试在用，二是万一别处还有调用点，不必一个个去改。
  // scope: 'pending'（未分配）| 'approved'（已分配）
  pickAllIn(checked, scope) {
    if (scope === 'approved') return this.pickAllApproved(checked);
    return this.pickAllPending(checked);
  },
  async deleteInScope(scope) {
    return this._deletePickedInScope(scope);
  },

  // 清空所有学生勾选（不动拦截区）
  clearPicked() {
    this.state.picked = (this.state.picked || []).filter(k => k.indexOf('s:') !== 0);
    this.renderContent();
  },

  // 拦截区自己的全选：一次勾上这一区**全部**号码（含默认折叠的「其它」
  // 和你收起来的那些）。老师 2026-10-14 说的就是「这 48 个号码的全选」，
  // 所以范围是整区，不是"当前看得见的那些"。
  pickAllGated(checked) {
    const keys = [];
    if (checked) (this.state.removedPhones || []).forEach(g => keys.push(this._pickKey('g', g.phone)));
    this.state.picked = (this.state.picked || []).filter(k => k.indexOf('g:') !== 0).concat(keys);
    this.renderContent();
  },

  // 反选：勾上的取消、没勾的勾上（同样以整区为范围）。老师要的就是
  // 「全选之后，把不用的给反选」——先一键全勾，再把不想删的那几个点掉。
  invertGated() {
    const have = new Set((this.state.picked || []).filter(k => k.indexOf('g:') === 0));
    const keys = (this.state.removedPhones || [])
      .map(g => this._pickKey('g', g.phone))
      .filter(k => !have.has(k));
    this.state.picked = (this.state.picked || []).filter(k => k.indexOf('g:') !== 0).concat(keys);
    this.renderContent();
  },

  _pickedGroups() {
    const students = [], gated = [];
    (this.state.picked || []).forEach(k => {
      const phone = k.slice(2);
      if (k.indexOf('s:') === 0) students.push(phone);
      else if (k.indexOf('g:') === 0) gated.push(phone);
    });
    return { students: students, gated: gated };
  },

  // 一个按钮两种对象，结果都是同一句话 —— 从你的列表里消失：
  //   · 学生（待分配 / 已分配）→ 从名单删掉 + 写进后台拦截名单（再次登录必须老师同意）
  //   · 已经被拦的号码 → 从这个拦截名单里**彻底删掉**（不再被拦）
  // 老师 2026-10-14 定的：「删除了之后就不要再存在了」。所以拦截区里的删除是真的删。
  // 一键删除某一区（待分配 / 已分配）。范围限死在本区，不会误伤另一区。
  async deletePickedPending() { return this._deletePickedInScope('pending'); },
  async deletePickedApproved() { return this._deletePickedInScope('approved'); },
  async _deletePickedInScope(scope) {
    const pickedInScope = this._studentsInScope(scope).filter(s => this.isPicked('s', s.phone));
    if (!pickedInScope.length) {
      this.showToast('先点「全选（' + this._studentsInScope(scope).length + '）」，或点掉不想删的人前面的 ☐');
      return;
    }
    // 只删本区里勾上的人，别的区就算也勾着也不动
    const phones = pickedInScope.map(s => s.phone);
    const prevPicked = this.state.picked;
    this.state.picked = prevPicked.filter(k => k.indexOf('s:') !== 0)
      .concat(phones.map(p => this._pickKey('s', p)));
    await this.deletePicked();
    // 删完后把本区残余的勾选清掉（另一区保留）
    this.state.picked = (this.state.picked || []).filter(k => k.indexOf('s:') !== 0);
    this.renderContent();
  },

  async deletePicked() {
    if (!this.isTeacher()) return;
    const picked = this._pickedGroups();
    if (!picked.students.length && !picked.gated.length) {
      this.showToast('先在要删的那一行前面打勾（或用「全选」）');
      return;
    }
    const targets = this.state.students.filter(s => picked.students.indexOf(s.phone) >= 0);
    let msg = '确认删除选中的 ' + (targets.length + picked.gated.length) + ' 项？\n\n';
    if (targets.length) msg += '· ' + targets.length + ' 名学生：从名单删除，再次登录必须经你同意\n';
    if (picked.gated.length) msg += '· ' + picked.gated.length + ' 个已被拦的号码：从拦截名单里彻底删除\n';
    msg += this._rosterWarn(picked.gated);
    msg += '\n删除后他们会从这个列表里消失。';
    if (!confirm(msg)) return;

    // ===== 顺序是关键（老师 2026-10-15）=====
    // 「只要删除了，任何人再进来都需要老师验证」。所以先把拦截写进后台、
    // **确认写成功**，再动本机名单。反过来做（先删本机 → 再写拦截）有一个
    // 致命窗口：名单已经没了、拦截却没写上，学生这时登录就是直接放行 ——
    // 而且本机状态已经被 syncToCloud 推上云，事后连人都找不回来。
    const phones = targets.map(s => s.phone).filter(Boolean);
    const entries = targets.map(s => ({ phone: s.phone, name: s.name }));
    let gateConfirmed = true;      // 没有要拦的人 = 无需确认
    if (phones.length) {
      const wrote = await Api.classRemoveMany(entries);
      if (wrote === null) gateConfirmed = false;
      // 写完一定要回读核对。接口返回 200 不等于那一行真的落库；老师端**不允许**
      // 在没有证据的情况下宣布"已删除"。
      const v = await Api.verifyGated(phones);
      if (v === null || !v.ok) gateConfirmed = false;
    }

    if (!gateConfirmed && phones.length) {
      // 拦截没坐实 —— 学生一个都不从名单上删。宁可让老师看到"没删掉"，
      // 也不能让他以为删掉了、实际上门还开着。
      await this.loadRemovedList();
      this.renderContent();
      this.showToast('⚠️ 后台拦截没写成功，为安全起见这次没有删除任何学生。请检查网络后重试', 'warn');
      return;
    }

    // 到这里后台拦截已经确认落库，再删本机名单是安全的。
    for (const st of targets) {
      this.state.students = await Api.deleteStudent(st);
      delete this.state.parentStudents[st.phone];
    }
    if (picked.gated.length) await this._dropGates(picked.gated);
    if (targets.length) await this.syncToCloud();
    await this.loadRemovedList();
    this.state.picked = [];
    this.state.showAllGated = false;
    this.renderContent();
    if (targets.length && picked.gated.length) {
      this.showToast('✅ 删除 ' + targets.length + ' 人（再次登录要你同意）+ ' + picked.gated.length + ' 个号码（已清掉）');
    } else if (picked.gated.length) {
      this.showToast('✅ 已删除 ' + picked.gated.length + ' 个号码，他们不再被拦了');
    } else {
      this.showToast('✅ 已删除 ' + targets.length + ' 名学生，再次登录都要你同意');
    }
  },

  // 每行自带的「🗑️ 删除」——不用先打勾，点一下就删这一个。
  async deleteGatedOne(phone, name) {
    if (!this.isTeacher()) return;
    let msg = '删除「' + (name || phone) + '」？\n\n'
            + '删除后 TA 从这个拦截名单里彻底消失，不再需要你同意就能登录'
            + '（如果重新注册，会像新学生一样出现在「待分配」，你可以再删）。';
    const s = (this.state.students || []).find(x => x.phone === phone);
    if (s) msg += '\n\n⚠️ ' + s.name + ' 还在你的学生名单里：删掉拦截后 TA 能直接进来。';
    if (!confirm(msg)) return;
    const n = await this._dropGates([phone]);
    await this.loadRemovedList();
    this.renderContent();
    if (n === 0) this.showToast('⚠️ 删除失败，请检查网络后重试', 'warn');
    else this.showToast('✅ 已删除「' + (name || phone) + '」，不再被拦了');
  },

  // 勾中的号码里，有多少还在这位老师的学生名单里。删掉这些号码的拦截记录 =
  // 他们能直接登录，是老师最容易忽略的后果，所以弹窗必须点名。
  _rosterWarn(phones) {
    const hit = [];
    (phones || []).forEach(p => {
      const s = (this.state.students || []).find(x => x.phone === p);
      if (s) hit.push(s.name || p);
    });
    if (!hit.length) return '';
    const show = hit.slice(0, 6).join('、') + (hit.length > 6 ? ' 等' : '');
    return '\n⚠️ 其中 ' + hit.length + ' 个还在你的学生名单里：' + show
         + '\n删掉拦截后他们可以直接进来，不用再申请。\n';
  },

  // 真正把号码从后台拦截名单里删掉。返回成功个数；一批一次请求，
  // 48 个号码不会变成 48 次往返（手机上那是半分钟白屏）。
  async _dropGates(phones) {
    const list = (phones || []).filter(Boolean);
    if (!list.length) return 0;
    let n = await Api.classUnblockMany(list);
    if (n === null) {
      // 整批请求失败：退化成一个个来，能救几个是几个，绝不谎报成功
      n = 0;
      for (const p of list) { if (await Api.classUnblock(p)) n++; }
    }
    // 本机也把痕迹清掉：墓碑（否则下次合并又把他藏起来）和「已收起」
    for (const p of list) await Api.untombstonePhone(p);
    const hid = this._hiddenGated();
    const left = hid.filter(p => list.indexOf(p) < 0);
    if (left.length !== hid.length) this._saveHiddenGated(left);
    return n;
  },

  // 一次性把那批早年的号码从页面上收起来（拦截照旧，规则不变）。
  async hideAllGated() {
    const split = this._gatedSplit();
    const related = new Set(split.related.map(g => g.phone));
    const targets = split.gatedAll.filter(g => !related.has(g.phone)).map(g => g.phone);
    if (!targets.length) { this.showToast('没有可收起的号码'); return; }
    if (!confirm('把这 ' + targets.length + ' 个号码从页面上收起来？\n\n'
      + '他们仍然被拦着 —— 下次登录一样要经过你同意，规则不变。\n'
      + '只是想看 / 想放行时，点「展开已收起的号码」就能找回来。')) return;
    const hidden = this._hiddenGated().slice();
    targets.forEach(p => { if (hidden.indexOf(p) < 0) hidden.push(p); });
    this._saveHiddenGated(hidden);
    this.state.showAllGated = false;
    this.state.picked = [];
    this.showToast('✅ 已收起 ' + targets.length + ' 个号码（仍然被拦着）');
    this.renderContent();
  },

  toggleHiddenGated() {
    this.state.showHiddenGated = !this.state.showHiddenGated;
    this.renderContent();
  },

  // 把收起的号码放回页面（只是显示，不改拦截状态）。
  restoreHiddenGated() {
    const n = this._hiddenGated().length;
    if (!n) return;
    if (!confirm('把收起的 ' + n + ' 个号码放回页面？\n\n他们仍然被拦着，只是重新显示出来方便你放行。')) return;
    this._saveHiddenGated([]);
    this.state.showHiddenGated = false;
    this.showToast('已放回页面');
    this.renderContent();
  },

  // 批量放行（只对勾选的被拦号码有效）——唯一能开门的按钮，必须是点出来的。
  async unblockPicked() {
    if (!this.isTeacher()) return;
    const phones = this._pickedGroups().gated;
    if (!phones.length) { this.showToast('先勾选要放行的号码'); return; }
    if (!confirm('解除对选中的 ' + phones.length + ' 个号码的登录拦截？\n\n解除后他们可以直接登录，不需要再申请。')) return;
    const done = await this._dropGates(phones);
    await this.loadRemovedList();
    this.state.picked = [];
    this.renderContent();
    if (done < phones.length) this.showToast('⚠️ ' + done + '/' + phones.length + ' 个已放行，其余失败请重试', 'warn');
    else this.showToast('✅ 已放行 ' + done + ' 个号码');
  },

  async approveJoin(id) {
    const req = (this.state.joinRequests || []).find(r => r.id === id);
    const res = await Api.classResolveJoinRequest(id, 'approve');
    if (!res || !res.ok) { this.showToast('⚠️ 操作失败，请重试', 'warn'); return; }
    this.showToast('✅ 已同意，学生端将自动进入待分配');
    // Approving means letting them back in, so clear the delete tombstone —
    // otherwise the merge keeps hiding the student we are about to restore.
    if (req && req.phone) await Api.untombstonePhone(req.phone);
    // Put the student back on the roster right away so the teacher can
    // assign a class without waiting for the student's device to re-register.
    if (req && req.phone) {
      let s = this.state.students.find(x => x.phone === req.phone);
      if (!s) {
        s = {
          id: 's' + Date.now(), name: req.name, phone: req.phone,
          parentPhone: req.phone, class: '', approved: false,
          registeredAt: new Date().toISOString(),
        };
        this.state.students.push(s);
      } else {
        s.name = req.name || s.name;
        s.class = '';
        s.approved = false;
      }
      await Api.saveStudent(s);
      this.syncToCloud();
    }
    await this.fetchJoinRequests();
    this.renderContent();
  },

  async denyJoin(id) {
    if (!confirm('拒绝这次申请？学生仍被移出，可再次申请。')) return;
    const res = await Api.classResolveJoinRequest(id, 'deny');
    if (!res || !res.ok) { this.showToast('⚠️ 操作失败，请重试', 'warn'); return; }
    this.showToast('已拒绝该申请');
    await this.fetchJoinRequests();
    this.renderContent();
  },

  // Reject / delete a student
  async rejectStudent(sid) {
    if (!confirm('确认删除该学生？删除后该手机号需申请并经你同意才能重新登录。')) return;
    const student = this.state.students.find(s => s.id === sid || s.phone === sid);
    if (!student) return;
    // 先写拦截、确认成功，再删本机（同 deletePicked 的顺序，理由见那里）。
    const gated = await Api.classRemove(student.phone, student.name);
    const v = gated ? await Api.verifyGated([student.phone]) : null;
    if (!gated || v === null || !v.ok) {
      await this.loadRemovedList();
      this.renderContent();
      this.showToast('⚠️ 后台拦截没写成功，为安全起见这次没有删除。请检查网络后重试', 'warn');
      return;
    }
    // Delete locally. Api.deleteStudent also records the phone as deleted —
    // without that tombstone the cloud merge put the student straight back,
    // which is why 删除 used to look like a no-op.
    this.state.students = await Api.deleteStudent(student);
    delete this.state.parentStudents[student.phone];
    this.syncToCloud();
    await this.loadRemovedList();
    this.renderContent();
  },

  addStudent() {
    let classOptions = this.state.classes.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    this.showModal(
      '<div class="modal-header"><div class="modal-title">添加学生</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-group"><label>备注名（中文名-英文名）</label><input type="text" id="add-name" placeholder="如：马慧-Amy"></div>' +
        '<div class="form-group"><label>班级</label><select id="add-class"><option value="">-- 不分配 --</option>' + classOptions + '</select></div>' +
        '<div class="form-group"><label>手机号</label><input type="tel" id="add-phone" placeholder="11位手机号"></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-primary" onclick="App.saveStudent()">添加</button><button class="btn btn-outline" onclick="App.closeModal()">取消</button></div>'
    );
  },

  async saveStudent() {
    const name = document.getElementById('add-name').value.trim();
    const cls = document.getElementById('add-class').value;
    const phone = document.getElementById('add-phone').value.trim();
    if (!name || !name.includes('-')) { alert('请按"中文名-英文名"格式填写'); return; }
    if (!phone || phone.length < 11) { alert('请输入正确的11位手机号'); return; }
    // Added back by hand — clear any "deleted" tombstone for this phone, or
    // the next cloud merge would filter the new record right out again.
    await Api.untombstonePhone(phone);
    const student = {
      id: 's' + Date.now(),
      name: name,
      phone: phone,
      parentPhone: phone,
      class: cls,
      approved: !!cls,
      registeredAt: new Date().toISOString()
    };
    this.state.students.push(student);
    this.state.parentStudents[phone] = { name: name, class: cls, approved: !!cls };
    await Api.saveStudent(student);
    await Api.saveParentStudent(phone, this.state.parentStudents[phone]);
    this.syncToCloud();
    this.closeModal();
    // 加进名单 ≠ 放进门：这个号如果还在后台拦截名单里，孩子照样进不来。
    // 与其让老师等孩子打电话来问，不如现在就说明白。
    if ((this.state.removedPhones || []).some(g => g.phone === phone)) {
      this.showToast('⚠️ ' + name + ' 曾被移出，还在拦截名单里：TA 登录会被拦住，点「🔓 放行」才能进', 'warn');
    }
    this.renderContent();
  },

  async removeStudent(sid) {
    if (!confirm('确认移除该学生？移除后该学生需申请并经你同意才能重新加入。')) return;
    const student = this.state.students.find(s => s.id === sid);
    if (!student) return;
    // Same gate as removeFromClass — a full removal must not be a loophole.
    // 先拦后台、确认成功再动本机名单；顺序不能反（见 deletePicked 的说明）。
    const gated = await Api.classRemove(student.phone, student.name);
    const v = gated ? await Api.verifyGated([student.phone]) : null;
    if (!gated || v === null || !v.ok) {
      await this.loadRemovedList();
      this.renderContent();
      this.showToast('⚠️ 后台拦截没写成功，为安全起见这次没有移除。请检查网络后重试', 'warn');
      return;
    }
    student.class = '';
    student.approved = false;
    await Api.saveStudent(student);
    this.syncToCloud();
    await this.loadRemovedList();
    this.renderContent();
  },

  // ===== Teacher: Class Management =====
  renderClassMgmt() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">🏫 班级管理</h2>';
    html += '<div class="stat-row mb-16">';
    html += '<div class="stat-box"><div class="num">' + this.state.classes.length + '</div><div class="label">班级数</div></div>';
    let totalStudents = this.state.students.filter(s => s.approved && s.class).length;
    html += '<div class="stat-box"><div class="num">' + totalStudents + '</div><div class="label">已分配学生</div></div>';
    html += '</div>';
    html += '<button class="btn btn-primary btn-sm mb-16" onclick="App.addClass()">+ 创建班级</button>';
    html += '<button class="btn btn-outline btn-sm mb-16" onclick="App.manualSync()" style="margin-left:8px">🔄 立即同步</button>';

    if (this.state.classes.length === 0) {
      html += '<div class="card text-center text-sub">暂无班级<br><span class="fs-12">点击上方按钮创建第一个班级</span></div>';
    }

    this.state.classes.forEach(cls => {
      const clsStudents = this.state.students.filter(s => s.class === cls && s.approved);
      const count = clsStudents.length;
      html += '<div class="card mb-16">';
      html += '<div class="flex-between">';
      html += '<span class="card-title">🏫 ' + cls + '</span>';
      html += '<div class="flex gap-8">';
      html += '<button class="btn btn-outline btn-sm" onclick="App.renameClass(\'' + cls.replace(/'/g,"\\'") + '\')">✏️ 改名</button>';
      html += '<button class="btn btn-outline btn-sm" onclick="App.deleteClass(\'' + cls.replace(/'/g,"\\'") + '\')">🗑️ 删除</button>';
      html += '</div>';
      html += '</div>';
      html += '<div class="text-sub fs-12 mt-8">学生人数：' + count + '人</div>';
      if (clsStudents.length > 0) {
        html += '<table class="data-table mt-8"><thead><tr><th>备注名</th><th>手机号</th><th>注册时间</th><th>操作</th></tr></thead><tbody>';
        clsStudents.forEach(s => {
          html += '<tr><td>' + s.name + '</td><td>' + (s.phone||'-') + '</td>';
          html += '<td class="fs-12">' + (s.registeredAt ? new Date(s.registeredAt).toLocaleDateString('zh-CN') : '-') + '</td>';
          html += '<td><button class="btn btn-outline btn-sm" onclick="App.removeFromClass(\'' + s.id + '\')">移出班级</button></td></tr>';
        });
        html += '</tbody></table>';
      } else {
        html += '<p class="text-sub fs-12 mt-8">暂无学生</p>';
      }
      html += '</div>';
    });
    return html;
  },

  addClass() {
    this.showModal(
      '<div class="modal-header"><div class="modal-title">创建班级</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-group"><label>班级名称</label><input type="text" id="add-class-name" placeholder="如：五年级A班" autofocus></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-primary" onclick="App.saveClass()">创建</button><button class="btn btn-outline" onclick="App.closeModal()">取消</button></div>'
    );
  },

  async saveClass() {
    const name = document.getElementById('add-class-name').value.trim();
    if (!name) { alert('请输入班级名称'); return; }
    if (this.state.classes.includes(name)) { alert('该班级已存在'); return; }
    // Created (again) on purpose — a stale "deleted" tombstone for this name
    // would make it disappear on the next cloud merge.
    await Api.untombstoneClass(name);
    this.state.classes.push(name);
    await Api.saveClasses(this.state.classes);
    this.syncToCloud();
    this.closeModal();
    this.renderContent();
  },

  renameClass(oldName) {
    this.showModal(
      '<div class="modal-header"><div class="modal-title">重命名班级</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>' +
      '<div class="modal-body">' +
        '<div class="form-group"><label>当前名称</label><input type="text" value="' + oldName + '" disabled></div>' +
        '<div class="form-group"><label>新名称</label><input type="text" id="rename-class-name" placeholder="输入新班级名称" value="' + oldName + '" autofocus></div>' +
      '</div>' +
      '<div class="modal-footer"><button class="btn btn-primary" onclick="App.saveRenameClass(\'' + oldName.replace(/'/g,"\\'") + '\')">保存</button><button class="btn btn-outline" onclick="App.closeModal()">取消</button></div>'
    );
  },

  async saveRenameClass(oldName) {
    const newName = document.getElementById('rename-class-name').value.trim();
    if (!newName) { alert('请输入新班级名称'); return; }
    if (oldName === newName) { this.closeModal(); return; }
    if (this.state.classes.includes(newName)) { alert('该名称已存在'); return; }
    await Api.untombstoneClass(newName);
    // Update classes list
    const idx = this.state.classes.indexOf(oldName);
    if (idx >= 0) this.state.classes[idx] = newName;
    // Update all students in this class
    this.state.students.forEach(s => {
      if (s.class === oldName) {
        s.class = newName;
      }
    });
    await Api.saveClasses(this.state.classes);
    await Api.saveStudents(this.state.students);
    this.syncToCloud();
    this.closeModal();
    this.renderContent();
  },

  async deleteClass(cls) {
    const members = this.state.students.filter(s => s.class === cls);
    const count = members.filter(s => s.approved).length;
    if (count > 0) {
      if (!confirm('班级"' + cls + '"下还有' + count + '名学生。删除班级后学生将变为未分配状态。确认删除？')) return;
    } else if (members.length > 0) {
      if (!confirm('班级"' + cls + '"下有' + members.length + '名学生。确认删除该班级？')) return;
    } else {
      if (!confirm('确认删除班级"' + cls + '"？')) return;
    }
    // Second question only when there is somebody to clean up: teachers who
    // just want the testing班级 gone can drop the whole class in one go.
    let alsoDelete = false;
    if (members.length > 0) {
      alsoDelete = confirm('是否同时删除这 ' + members.length + ' 名学生？\n\n【确定】连学生一起从名单删除（他们需重新申请才能进班）\n【取消】只删班级，学生保留为「待分配」');
    }

    if (alsoDelete) {
      // 先一次批量写拦截、确认成功，再删本机名单（顺序见 deletePicked）。
      // 之前是 N 次单个 classRemove 的 fire-and-forget 数组，失败就静默漏人。
      const phones = members.map(s => s.phone).filter(Boolean);
      const wrote = await Api.classRemoveMany(members.map(s => ({ phone: s.phone, name: s.name })));
      const v = (wrote === null) ? null : await Api.verifyGated(phones);
      if (wrote === null || v === null || !v.ok) {
        await this.loadRemovedList();
        this.renderContent();
        this.showToast('⚠️ 后台拦截没写成功，为安全起见这次没有删除学生。请检查网络后重试', 'warn');
        return;
      }
      // Api.deleteStudent writes a tombstone per phone, so the cloud merge
      // cannot resurrect them on the next poll.
      for (const s of members) {
        this.state.students = await Api.deleteStudent(s);
        delete this.state.parentStudents[s.phone];
      }
      await this.loadRemovedList();
      this.showToast('✅ 已删除班级和 ' + members.length + ' 名学生');
    } else {
      // Unassign students
      this.state.students.forEach(s => {
        if (s.class === cls) {
          s.class = '';
          s.approved = false;
        }
      });
      await Api.saveStudents(this.state.students);
    }

    // 班级彻底消失的完整处方（老师 2026-10-15：「写定了没有了就是没有了，
    // 不要再出现了」）——四步一个都不能少，顺序也不能换：
    //   1) 先把墓碑写进本机（deletedClasses）
    //   2) 本机名录里立刻删掉这个班
    //   3) 把本机名录落盘
    //   4) **等**墓碑和名录一起推上云（await，不能再"挂着不管"）
    // 之前第 4 步是 fire-and-forget 的 syncToCloud()：一旦它失败（老师那会儿
    // 正没信号），云端 blob 里旧班级还在、墓碑却没上去，于是下次任何一台设备
    // 同步都会把「B班 / A班」原样拉回来 —— 这就是"删了又出来"的病根。
    this.state.classes = this.state.classes.filter(c => c !== cls);
    await Api.tombstoneClass(cls);          // 1) 本机墓碑，必须在 push 之前
    await Api.saveClasses(this.state.classes);  // 3) 本机名录落盘
    if (!Api.cloudAvailable()) { this.renderContent(); return; }
    const res = await Api.syncUp(this.state.students, this.state.classes, {
      authoritative: true,
    });
    if (!res.ok) {
      // 墓碑没推上云 —— 必须让老师知道，否则这个班下次还会冒出来
      this.showToast('⚠️ 班级已在本机删除，但没同步上云（网络问题）。请点「🔄 立即同步」重试', 'warn');
    } else {
      this.state.students = res.students;
      this.state.classes = res.classes;
      this.showToast('✅ 班级"' + cls + '"已删除，不会再出现');
    }
    this.renderContent();
  },

  async removeFromClass(sid) {
    if (!confirm('确认将该学生移出班级？移出后该学生需申请并经你同意才能重新加入。')) return;
    const student = this.state.students.find(s => s.id === sid);
    if (!student) return;
    // Server-side gate — without this the student just re-registers on next
    // login and lands back in 待分配. 先拦后台、确认成功再动本机（见 deletePicked）。
    const gated = await Api.classRemove(student.phone, student.name);
    const v = gated ? await Api.verifyGated([student.phone]) : null;
    if (!gated || v === null || !v.ok) {
      await this.loadRemovedList();
      this.renderContent();
      this.showToast('⚠️ 后台拦截没写成功，为安全起见这次没有移出。请检查网络后重试', 'warn');
      return;
    }
    student.class = '';
    student.approved = false;
    await Api.saveStudent(student);
    this.syncToCloud();
    await this.loadRemovedList();
    this.renderContent();
  },

  // ===== Student/Parent: Today's Homework =====
  renderToday() {
    // Students always see TODAY's real homework (weekday-based).
    // Teachers can freely switch days for preview (default: today).
    let todayIdx = this.state.currentDay;
    if (todayIdx === undefined || todayIdx === null) {
      todayIdx = this.getTodayWeekdayIdx();
    }
    if (!this.isTeacher()) {
      // Reset to real today on every render so the student never gets stuck
      // on an old day (e.g. app left open overnight)
      todayIdx = this.getTodayWeekdayIdx();
      this.state.currentDay = todayIdx;
    }
    // Students get the one-question-per-screen stage. The teacher keeps the
    // scrolling list — they preview whole days, not answer them.
    if (!this.isTeacher()) return this.renderStage(todayIdx);

    const day = HOMEWORK_DATA[todayIdx];
    const dateLabel = this.getDayDateLabel(todayIdx, 0);
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:8px">📝 今日作业 · 第 ' + (this._weekIdx() + 1) + ' 周</h2>';
    html += '<div class="card mb-16" style="background:var(--primary-light);border:none">';
    html += '<div class="flex-between"><span>📅 ' + day.day_cn + ' · ' + dateLabel + (this.isDayToday(todayIdx, 0) ? '（今天）' : '') + '</span><span class="badge badge-primary">' + day.total_duration + '分钟</span></div>';
    html += '<div class="fs-12 text-sub mt-8">' + day.theme_cn + '</div>';
    html += '</div>';

    // Audio enable banner for non-teacher
    if (!this.isTeacher() && !this.state.audioEnabled) {
      html += '<div class="audio-enable-banner">';
      html += '<div class="ae-icon">🔊</div>';
      html += '<div class="ae-title">点击开启语音朗读</div>';
      html += '<div class="ae-desc">开启后，每道题会自动用纯正美音朗读英语</div>';
      html += '<button class="ae-btn" onclick="App.enableAudio()">🔊 开启语音</button>';
      html += '</div>';
    }

    // Day selector - only for teacher, non-teacher sees just today
    if (this.isTeacher()) {
      html += '<div class="day-grid mb-16">';
      HOMEWORK_DATA.forEach((d, i) => {
        const isToday = i === todayIdx;
        html += '<div class="day-card" style="' + (isToday?'border-color:var(--primary)':'') + '" onclick="App.switchTodayDay(' + i + ')">';
        html += '<div class="day-name">' + d.day_cn + '</div>';
        html += '<div class="day-type" style="font-size:11px">' + this.getDayDateLabel(i, 0) + (this.isDayToday(i, 0) ? ' · 今天' : '') + '</div>';
        html += '<div class="day-type">' + d.modules.map(m=>m.name_cn).join('·') + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Modules for today
    day.modules.forEach((m, mi) => {
      html += '<div class="module-card">';
      html += '<div class="module-header"><span class="m-name">' + this.getModuleIcon(m.type) + ' ' + m.name_cn + '</span><span class="m-duration">' + m.duration + '分钟</span></div>';
      html += '<div class="module-body" id="mod-body-' + mi + '">' + this.renderModuleInteractive(m, mi, todayIdx) + '</div>';
      html += '</div>';
    });
    return html;
  },

  switchTodayDay(idx) {
    this.state.currentDay = idx;
    this.renderContent();
  },

  renderModuleInteractive(m, mi, dayIdx) {
    if (m.type === 'speaking') {
      return this.renderSpeakingStudent(m, mi, dayIdx);
    } else if (m.type === 'vocabulary_game') {
      return this.renderVocabGame(m, mi, dayIdx);
    } else if (m.type === 'writing_template') {
      return this.renderWritingTemplate(m, mi, dayIdx);
    } else if (m.questions) {
      return this.renderQuestionsStudent(m, mi, dayIdx);
    }
    return '<p class="text-sub">暂无内容</p>';
  },

  // Speaking - student interactive
  renderSpeakingStudent(m, mi, dayIdx) {
    let html = '<div id="speaking-area-' + mi + '">';
    // Audio enable check
    if (!this.state.audioEnabled) {
      html += '<div class="audio-enable-banner">';
      html += '<div class="ae-icon">🔊</div>';
      html += '<div class="ae-title">点击开启语音朗读</div>';
      html += '<div class="ae-desc">开启后，每道题会自动用纯正美音朗读英语</div>';
      html += '<button class="ae-btn" onclick="App.enableAudio()">🔊 开启语音</button>';
      html += '</div>';
      html += '</div>';
      return html;
    }
    html += '<div id="sp-content-' + mi + '">' + this.renderSpeakingQuestion(m, mi, 0, dayIdx) + '</div>';
    html += '</div>';
    return html;
  },

  // Shuffle array in place (for randomizing answer order)
  _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  },

  // Get shuffled options for a speaking question, with mapping to original answer index
  //
  // v137：中文意思（q.options_cn）必须跟着一起打乱。它和 options 是一一对应的，
  // 只打乱英文、中文还按原顺序排，答错时给出的"你选的那句意思是……"就会指错
  // 句子 —— 比不给提示更糟。cn 用同一份 shuffledIndices 映射，错位不可能发生。
  _getShuffledSpeakingOptions(q) {
    var origOptions = q.options;
    var origAnswer = q.answer;
    var origCn = q.options_cn || null;
    var indices = origOptions.map(function(_, i) { return i; });
    var shuffledIndices = this._shuffle(indices);
    var shuffledOptions = shuffledIndices.map(function(i) { return origOptions[i]; });
    var newAnswerIdx = shuffledIndices.indexOf(origAnswer);
    var shuffledCn = (origCn && origCn.length === origOptions.length)
      ? shuffledIndices.map(function(i) { return origCn[i]; })
      : null;
    return { options: shuffledOptions, answer: newAnswerIdx, cn: shuffledCn };
  },

  renderSpeakingQuestion(m, mi, qi, dayIdx) {
    const q = m.questions[qi];
    // Shuffle options for this question
    var shuffled = this._getShuffledSpeakingOptions(q);
    // Store shuffled data for this question instance
    if (!this._speakingShuffle) this._speakingShuffle = {};
    this._speakingShuffle[mi + '-' + qi] = shuffled;

    let html = '<div class="speaking-card">';
    html += '<div class="auto-read-badge"><svg class="icon icon-sm speaking-anim"><use href="#i-sound"/></svg> 正在朗读…</div>';
    html += '<div class="fs-12 text-sub">第' + (qi+1) + '题 / 共' + m.questions.length + '题</div>';
    html += '<div class="vocab-progress mt-8"><div class="fill" style="width:' + (qi/m.questions.length*100) + '%"></div></div>';
    html += '<div class="speak-sentence">' + q.sentence + '</div>';
    html += '<div class="speak-sentence-cn">' + q.sentence_cn + '</div>';
    html += '<button class="speak-btn play" onclick="App.playSentence(' + mi + ',' + qi + ',\'' + dayIdx + '\')"><svg class="icon icon-sm"><use href="#i-sound"/></svg> 重新听</button>';
    // Options disabled until reading finishes
    html += '<div class="speak-options" id="sp-opts-' + mi + '" style="opacity:0.4;pointer-events:none">';
    shuffled.options.forEach((o, oi) => {
      html += '<div class="speak-option" onclick="App.selectSpeakAnswer(' + mi + ',' + qi + ',' + oi + ',' + dayIdx + ')">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
    });
    html += '</div>';
    html += '<div class="listen-wait" id="sp-wait-' + mi + '" style="text-align:center;padding:8px;color:var(--text-sub);font-size:12px">⏳ 请先听完整朗读，再选择答案</div>';
    html += '<div class="speak-tip" id="sp-tip-' + mi + '"></div>';
    html += '<div id="sp-read-' + mi + '"></div>';
    html += '</div>';
    // Auto-play the sentence, then enable options
    // 'cf' = 这一屏的示范读音要 Cloudflare 的母语音色（见 _stepTtsPrefer）
    this.autoSpeak(q.sentence, function() {
      var optsEl = document.getElementById('sp-opts-' + mi);
      var waitEl = document.getElementById('sp-wait-' + mi);
      if (optsEl) { optsEl.style.opacity = '1'; optsEl.style.pointerEvents = 'auto'; }
      if (waitEl) { waitEl.style.display = 'none'; }
    }, 'cf');
    return html;
  },

  playSentence(mi, qi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    // Disable options while replaying
    var optsEl = document.getElementById('sp-opts-' + mi);
    var waitEl = document.getElementById('sp-wait-' + mi);
    if (optsEl) { optsEl.style.opacity = '0.4'; optsEl.style.pointerEvents = 'none'; }
    if (waitEl) { waitEl.style.display = 'block'; waitEl.textContent = '⏳ 请先听完整朗读，再选择答案'; }
    this.speak(q.sentence, { prefer: 'cf', onDone: function() {
      if (optsEl) { optsEl.style.opacity = '1'; optsEl.style.pointerEvents = 'auto'; }
      if (waitEl) { waitEl.style.display = 'none'; }
    }});
  },

  selectSpeakAnswer(mi, qi, oi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    // Use shuffled answer index
    var shuffled = this._speakingShuffle && this._speakingShuffle[mi + '-' + qi];
    var correctAnswer = shuffled ? shuffled.answer : q.answer;
    var options = shuffled ? shuffled.options : q.options;
    const isCorrect = oi === correctAnswer;
    const selectedText = options[oi];

    const opts = document.querySelectorAll('#sp-opts-' + mi + ' .speak-option');
    const waitEl = document.getElementById('sp-wait-' + mi);
    const tip = document.getElementById('sp-tip-' + mi);

    if (!isCorrect) {
      // 选错不点答案（v104）：划掉他选的那一句、把中文提示挂出来，正确项
      // 一律不亮绿 —— 让他自己听着、看着把对的那句找出来。
      const tryKey = 'sp-' + mi + '-' + qi;
      const attempt = this._wrongTryBump(tryKey);
      this._playWrongSound();
      // 先记下"这一次之前已经划掉过哪几句"，提示里要跳过它们。
      const dead = [];
      opts.forEach((el, i) => { if (el.classList.contains('wrong')) dead.push(i); });
      opts.forEach((el, i) => {
        el.classList.remove('correct');
        if (i === oi || el.classList.contains('wrong')) {
          el.classList.add('wrong');
          el.style.pointerEvents = 'none';
        } else {
          el.style.pointerEvents = 'auto';
        }
      });
      if (dead.indexOf(oi) < 0) dead.push(oi);
      if (tip) {
        // 中文意思优先用打乱后的那一份（和 screen 上的顺序一致）；万一没有
        // 打乱记录（直接调用 / 老缓存），退回原始顺序 —— 只有长度对得上才用，
        // 对不上就当作没有，绝不让订单错位。
        const cns = (shuffled && shuffled.cn) ? shuffled.cn
          : ((q.options_cn && q.options_cn.length === options.length) ? q.options_cn : null);
        this._showWrongHint(tip, this._speakWrongHintHtml({
          attempt: attempt,
          q: q,
          opts: options,
          cns: cns,
          answer: correctAnswer,
          picked: oi,
          dead: dead,
        }));
      }
      // 把选错的这句读出来给他听 —— 靠耳朵就能发现差在哪。提示词挂着不动，
      // 不用等读完就能改选。
      this.speak(selectedText, { prefer: 'cf' });
      return;
    }

    // 选对（第一次就中，或选错后重新点中）：先当场给回馈，再朗读答句，
    // 然后进入"问句 + 答句"整句跟读。
    //
    // 「当场」是重点。这几样原来是挂在 speak() 的 onDone 里的 —— 孩子点完
    // 选项得先把整句答句听完（音频还没取回来时更久）才听得到提示音、才看
    // 得到绿框，等于点下去那一下什么反应都没有。现在提示音、绿框、文字在
    // 手指落下的一瞬间就出来，朗读接在它后面。
    this._stopCurrentAudio();
    this._showSpeakingIndicator(false);
    this._playCorrectSound();
    this._recordAnswer(dayIdx, mi, qi, selectedText, true);
    this._wrongTryClear('sp-' + mi + '-' + qi);
    this._clearWrongHint(tip);
    opts.forEach((el, i) => {
      el.classList.remove('wrong', 'selected');
      el.style.pointerEvents = 'none';
      if (i === correctAnswer) el.classList.add('correct');
    });
    if (waitEl) {
      waitEl.style.display = 'block';
      waitEl.style.color = 'var(--success)';
      waitEl.textContent = '✅ 选对了！正在朗读答句…';
    }

    var self2 = this;
    this.speak(selectedText, { prefer: 'cf', onDone: function() {
      if (waitEl) waitEl.style.display = 'none';
      if (tip && q.pronunciation_tips) {
        tip.classList.add('show');
        tip.innerHTML = '🗣️ <strong>发音提示：</strong>' + q.pronunciation_tips;
      }
      // Show read-along section for the full Q + A sentence
      self2.startReadAlong(mi, qi, dayIdx);
    }});
  },

  // AI 口语练习答错后的中文提示（v137）。
  //
  // 家长 2026-10-17：「选错了答案，它会提示，但是提示得太傻了。他告诉不是 A
  // 就是 B、就是 C，从逻辑上告诉大家是错的，但是他没有告诉学生题是什么意思。
  // 比如说问句是什么意思、找的答句是什么意思，像老师一步一步启发学生那样
  // 的中文给提示出来。」
  //
  // 以前这里走的是 _wrongHintHtml 的通用三档：第 1 次"不是这个，再想想"、
  // 第 2 次报"正确答案有几个词、在 A、C、D 里挑"、第 3 次点名。对选择题也许
  // 够用，对口语题完全没用 —— 口语题的四个选项**全是英文**，孩子手里没有
  // 任何中文坐标，你跟他讲"不是 B 就是 C"，他能做的只有瞎猜字母。
  //
  // 所以这里换成老师的三步走（用的是每道题配好的 q.answer_cn_hint /
  // q.options_cn，见 data.js 的 SPEAK_HINTS）：
  //   ① 问句到底在问什么 → 答句必须说出哪一类东西（意思层面，不提字母）
  //      再把他刚点的那句翻成中文，当面告诉他"这句答的不是这个问题"
  //   ② 把还没划掉的几句全翻成中文，让他一句一句对回英文去找
  //   ③ 才点名，并给出中文意思 + 题库里的解析
  // 全程不提前点亮正确项，最后一下仍然要他自己点。
  _speakWrongHintHtml(o) {
    o = o || {};
    const q = o.q || {};
    const attempt = o.attempt || 1;
    const opts = o.opts || [];
    const cns = (o.cns && o.cns.length === opts.length) ? o.cns : null;
    const picked = (o.picked == null) ? null : o.picked;
    const dead = o.dead || (picked == null ? [] : [picked]);
    const qCn = String(q.sentence_cn || '');
    const want = String(q.answer_cn_hint || '').trim();
    const correctIdx = (o.answer == null) ? -1 : o.answer;
    const correctEn = (correctIdx >= 0 && opts[correctIdx] != null) ? String(opts[correctIdx]) : '';
    const correctCn = (cns && correctIdx >= 0 && cns[correctIdx]) ? String(cns[correctIdx]) : '';

    // 没有中文数据（题库更新了但提示没跟上）→ 退回通用提示，绝不瞎编意思。
    if (!cns) {
      return this._wrongHintHtml({
        attempt: attempt,
        opts: opts,
        answer: o.answer,
        correctText: correctEn,
        picked: picked,
        clue1: want || '先把问句的意思弄明白：它问的是「' + qCn + '」。',
        clue3: q.explanation_cn,
        retryTip: '先听完问句，再一句一句把选项翻成中文，看哪一句在回答这个问题。',
      });
    }

    // ① 第一次错：说清问什么、你选的那句什么意思、为什么对不上
    if (attempt <= 1) {
      let t = '🤔 这句回答不了这个问题。<br>';
      if (qCn) t += '📖 问句的意思是：「' + qCn + '」<br>';
      if (want) t += '💡 ' + want + '<br>';
      const pickEn = (picked != null && opts[picked] != null) ? String(opts[picked]) : '';
      const pickCn = (picked != null && cns[picked]) ? String(cns[picked]) : '';
      if (pickCn) {
        t += '🔤 你选的这句';
        if (pickEn) t += ' “' + this._escHtml(pickEn) + '”';
        t += ' 意思是：' + this._escHtml(pickCn) + '<br>'
          + '<span class="fs-12">　→ 它答的不是这个问题，所以对不上。</span><br>';
      }
      t += '<span class="fs-12">🎧 再听一遍问句，然后把每一句都在心里翻成中文再选。</span>';
      return t;
    }

    // ② 第二次错：把还没划掉的几句全翻成中文，让他自己对回英文 ——
    //    这一步才是"读懂意思再选"，而不是按字母排除。
    if (attempt === 2) {
      const rest = [];
      cns.forEach(function (cn, i) {
        if (dead.indexOf(i) >= 0) return;
        if (!cn) return;
        rest.push(this._escHtml(String(cn)));
      }, this);
      let t = '🔎 换个办法：一句一句翻成中文，再对一次。<br>';
      if (qCn) t += '📖 问句问的是：「' + qCn + '」<br>';
      if (rest.length) {
        t += '<span class="fs-12">上面还没划掉的句子，意思分别是：</span><br>'
          + rest.map(function (x) { return '· ' + x; }).join('<br>') + '<br>';
      }
      // 问句中文本身可能已经带问号，拼进去时先去掉，免得出现「……？」？」
      const qShort = qCn.replace(/[。．.！!？?\s]+$/, '');
      t += '❓ 上面哪一句在回答「' + (qShort || '这个问题') + '」？找到它，点它。';
      return t;
    }

    // ③ 第三次起：点名 + 中文意思 + 解析，但最后一下仍由孩子自己点
    let t = '👉 就差一点啦。答案是 ';
    const letter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : '';
    if (letter) t += letter + '：';
    if (correctEn) t += '“' + this._escHtml(correctEn) + '”';
    if (correctCn) t += '<br>　意思是：' + this._escHtml(correctCn);
    if (q.explanation_cn) t += '<br>📖 ' + q.explanation_cn;
    t += '<br><span class="fs-12">点它一下，我们就往下走。</span>';
    return t;
  },

  // 口语跟读：问句 + 答句整句连读。点一下开始、读完再点一下停止打分，
  // 读到的词实时变绿打勾；≥60 分才能进下一题。
  startReadAlong(mi, qi, dayIdx) {
    const sentence = this._speakingReadSentence(mi, qi, dayIdx);
    const readArea = document.getElementById('sp-read-' + mi);
    if (!readArea || !sentence) return;
    const gid = this._gid('sp', mi, qi);
    readArea.innerHTML = '<div class="speak-record show" style="text-align:center">'
      + '<p class="fs-12 text-sub">请把问句和答句连起来读：</p>'
      + '<div class="rd-sentence" id="rd-sent-' + mi + '-' + qi + '">' + this._readSentenceHtml(sentence) + '</div>'
      + '<div class="rd-live-hint" id="rd-live-' + mi + '-' + qi + '"></div>'
      + '<div class="gate-bar">' + this._gateListenHtml(gid, sentence, '🔊 先听一遍示范', 'cf') + '</div>'
      + '<div id="sp-status-' + mi + '-' + qi + '" style="min-height:18px;margin:6px 0;color:var(--text-sub);font-size:14px"></div>'
      + '<button id="sphr-' + mi + '-' + qi + '" class="speak-btn gate-locked" data-gate="' + gid + '" '
      + 'style="background:var(--primary);margin-top:8px;font-size:18px;padding:18px 32px;'
      + 'user-select:none;-webkit-user-select:none;touch-action:none;border-radius:24px;min-width:200px">'
      + '🎤 点我读</button>'
      + '<p class="fs-12 text-sub" style="margin-top:8px">先听完上面的示范，再点「点我读」；读到的词会变绿打勾，读完了再点一下就打分。读错的词要读对了才能进下一题。</p>'
      + '<p class="fs-12 text-sub" style="margin-top:2px">不认识的词，点一下就有读音和中文意思。</p>'
      + '<div id="sp-clip-' + mi + '" class="mt-8"></div>'
      + '</div>';
    const btn = document.getElementById('sphr-' + mi + '-' + qi);
    if (!btn) return;
    const self = this;
    // 点一下：正在录音 → 结束打分；没在录 → 开始新一轮。
    // touchstart 上 preventDefault，避免手机补发一次 mousedown 算成两下。
    const onTap = function(e) {
      e.preventDefault();
      if (self._spReadActive) self._spReadEnd(mi, qi, dayIdx);
      else self._spReadStart(mi, qi, dayIdx);
    };
    btn.addEventListener('touchstart', onTap, { passive: false });
    btn.addEventListener('mousedown', onTap);
    btn.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    // v143：刷新后把上次读错的词还原回去（台账里的错词只增不减）。
    this.restoreReadMarks(mi, qi, dayIdx, 'sp-status-' + mi + '-' + qi);
  },

  // 问句 + 正确答句拼成整句。跟读面板和"听示范"都用这一句，
  // 所以孩子听到的、读的、打分对的都是同一段完整对话。
  _speakingReadSentence(mi, qi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m && m.questions[qi];
    if (!q) return '';
    const shuffled = this._speakingShuffle && this._speakingShuffle[mi + '-' + qi];
    const options = shuffled ? shuffled.options : q.options;
    const correctAnswer = shuffled ? shuffled.answer : q.answer;
    const ans = (options && options[correctAnswer] != null) ? String(options[correctAnswer]).trim() : '';
    const s = String(q.sentence || '').trim().replace(/[?？]\s*$/, '?');
    return ans ? (s + ' ' + ans) : s;
  },

  _spReadStart(mi, qi, dayIdx) {
    if (this._spReadActive) return;
    // 门禁双保险：全局捕获已经拦过一次，这里是兜底，保证"没听不会开录"。
    const gid = this._gid('sp', mi, qi);
    if (!this._gateOpen(gid)) { this._gateNudge(gid); return; }
    // 正在单独纠错某个词时不让整句录音插进来（两路录音会打架）。
    if (this._wordRepair && this._wordRepair.rec) return;
    // 主动放弃纠错模式，重新整句朗读。
    if (this._wordRepair) { clearTimeout(this._wordRepair.capTimer); this._wordRepair = null; }
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const sentence = this._speakingReadSentence(mi, qi, dayIdx);
    if (!sentence) return;
    this._spReadActive = { mi: mi, qi: qi, dayIdx: dayIdx, sentence: sentence,
                           q: m.questions[qi], startedAt: Date.now() };
    Recorder.warmUp(); Api.warmup();
    this._startClipCapture();
    // 同一道题重读算下一轮，老师的记录里能看到第几轮读的。
    this._spRounds = this._spRounds || {};
    const rkey = dayIdx + '-' + mi + '-' + qi;
    this._spRounds[rkey] = (this._spRounds[rkey] || 0) + 1;
    this._spRound = this._spRounds[rkey];
    // 新一轮朗读：清掉上一轮的绿/红，把光标放回句首。
    this._clearReadMarks(mi, qi);
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (panel) { const first = panel.querySelector('.rd-w'); if (first) first.classList.add('rd-cur'); }
    const hint = document.getElementById('rd-live-' + mi + '-' + qi);
    if (hint) hint.textContent = '';
    this._liveStart(mi, qi, sentence);
    // 20 秒兜底：问句 + 答句比单句长，防止忘了点停止麦克风一直开着。
    this._spReadTimer = setTimeout(() => this._spReadEnd(mi, qi, dayIdx), 20000);
    this._spReadUI(mi, qi, dayIdx, 'recording');
  },

  // 第二次点击（或 20 秒兜底）就到这里：停识别、停录音，出分。
  // A 路手机自带识别优先（能逐词实时高亮），拿不到再走 B 路 whisper。
  _spReadEnd(mi, qi, dayIdx) {
    const ctx = this._spReadActive;
    clearTimeout(this._spReadTimer);
    if (!ctx || ctx._ended) return;
    ctx._ended = true;
    // 两次点击隔得太近多半是误触，复位按钮不计这轮。
    if (Date.now() - ctx.startedAt < 250) {
      this._spReadActive = null;
      this._liveStop();
      this._clearReadMarks(mi, qi);
      this._spReadUI(mi, qi, dayIdx, 'mistap');
      return;
    }
    this._spReadActive = null;
    this._spReadUI(mi, qi, dayIdx, 'scoring');

    const self = this;
    // v131：松手 → 出分，算作"一次朗读"。清空重试预算并开一个性能样本。
    Api.asrResetBudget();
    Api.perfBegin('sentence');
    const perfT0 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    const liveP = this._liveStop();
    const clipP = this._finishClipCapture();
    Promise.all([liveP, clipP]).then(async function(res) {
      // 两路择优（v98）：A 路（手机自带识别）判过就立即出分，判不过才等
      // B 路（云端）复核 —— 见 _bestTranscript 的注释。
      const best = await self._bestTranscript(ctx.sentence, res[0], res[1], self._spClipSamples);
      // v143：兜底放行必须"真的像读了一整句"—— 门槛按词数算，哼一声过不了。
      const vMin = self._minVoiceSec(ctx.sentence);
      self._spShowResult(mi, qi, dayIdx, ctx,
        best ? best.spoken : null,
        best ? best.source : null,
        best ? best.verdict : null,
        !best && self._lastClipVoiceOk(vMin));
      // v131：收口 —— 只记"耗时/趟数/结果档位"，不记文本内容。
      Api.perfEnd({ kind: (!best && !self._lastClipVoiceOk(vMin)) ? 'fail'
        : (!best ? 'voice' : (best.verdict && best.verdict.passed ? 'pass' : 'low')) });
    }).catch(function(e) {
      console.warn('Speaking read capture failed:', e);
      self._spShowResult(mi, qi, dayIdx, ctx, null, null, null, self._lastClipVoiceOk(self._minVoiceSec(ctx.sentence)));
      Api.perfEnd({ kind: 'fail' });
    });
  },

  // 出分：逐词上色（绿勾/红波浪线），≥60 过、<60 锁下一题必须重读。
  _spShowResult(mi, qi, dayIdx, ctx, spoken, source, verdict, voiceOk) {
    const sentence = ctx.sentence;
    if (!spoken) {
      // v139：识别端没回话，但录音里确实有人声 → 这道题算做完。
      // 家长 2026-10-17：「明明说得很清楚，他就说没听清，孩子要重复四五遍」——
      // 这一条就是那个"四五遍"的口子，现在堵上。
      if (voiceOk) {
        this._clearReadMarks(mi, qi);
        this._playCorrectSound();
        this._spReadUI(mi, qi, dayIdx, 'passed', null);
        this._persistSpeakingClip(mi, qi, dayIdx, ctx.q, null, {
          spoken: '', source: 'voice', lenient: true,
        });
        return;
      }
      // 真的没录到声音：只提示这一件事，让孩子再来一次。
      this._clearReadMarks(mi, qi);
      this._spReadUI(mi, qi, dayIdx, 'noaudio');
      return;
    }
    // 判定和上色同源：都用同一个对齐结果，红词不会再因为显示格子对不上而错算。
    const v = verdict || this._readVerdict(sentence, spoken);
    this._markReadProgress(mi, qi, sentence, spoken, false, v.align);
    const score = v.score;
    const badWords = v.badWords;
    // 通过 = 分数够 60 且没有读错的词。红色波浪线的词要原处重读对了
    // 才能进下一题（见 _startWordRepair）。
    const passed = v.passed;
    // v143：判分结果落台账。刷新页面不会再把这一遍的错词抹掉。
    this.readLedgerSave(mi, qi, dayIdx, {
      pass: passed, score: score,
      bad: badWords.map(function (x) { return x.expected; }),
    });
    if (passed) {
      this._playCorrectSound();
      this._spReadUI(mi, qi, dayIdx, 'passed', score);
    } else if (badWords.length) {
      // 有读错的词：逐个原处重读纠正，全对了才解锁下一题。
      this._playWrongSound();
      this._spReadUI(mi, qi, dayIdx, 'repair', score, { badCount: badWords.length });
      const self = this;
      this._startWordRepair(mi, qi, sentence, 'sp-status-' + mi + '-' + qi, function() {
        self._playCorrectSound();
        self._spReadUI(mi, qi, dayIdx, 'passed', score);
      }, function() {
        self._spReplay(mi, qi, dayIdx);
      });
    } else {
      this._playWrongSound();
      this._spReadUI(mi, qi, dayIdx, 'failed', score, { badWords: badWords });
    }
    this._persistSpeakingClip(mi, qi, dayIdx, ctx.q, score, {
      spoken: spoken, source: source,
      okCount: v.align.ok,
      wordTotal: v.align.total,
      wrongWords: badWords.map(x => ({ expected: x.expected, heard: x.heard })),
      missedWords: v.align.missing.map(x => x.target),
    });
  },

  // status: 'recording' | 'scoring' | 'mistap' | 'passed' | 'failed' | 'noaudio'
  _spReadUI(mi, qi, dayIdx, status, score, extra) {
    const btn = document.getElementById('sphr-' + mi + '-' + qi);
    const statusEl = document.getElementById('sp-status-' + mi + '-' + qi);
    if (!btn) return;
    const m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (status === 'recording') {
      btn.style.background = 'var(--danger)';
      btn.innerHTML = '🔴 录音中… 读完了点我';
      btn.disabled = false;
      if (statusEl) statusEl.innerHTML = '';
      return;
    }
    if (status === 'scoring') {
      btn.style.background = 'var(--text-sub)';
      btn.innerHTML = '⏳ 正在出分…';
      btn.disabled = true;
      if (statusEl) statusEl.innerHTML =
        '<div style="font-size:34px;font-weight:700;color:var(--primary);line-height:1.15">…</div>'
        + '<span style="color:var(--text-sub);font-size:13px">核对中，分数马上到</span>';
      return;
    }
    if (status === 'mistap') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 点我读';
      btn.disabled = false;
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--danger)">⚠️ 时间太短了，点一下开始，读完再点一下</span>';
      return;
    }
    if (status === 'noaudio') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 点我读';
      btn.disabled = false;
      // v139：只有"真的没录到声音"才走到这里，措辞也只说这一件事。
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--danger)">🎤 这次没录到声音，再点一下读</span>';
      return;
    }
    if (status === 'repair') {
      // 有读错的词待纠正：主按钮让位给纠错卡片，这里只提供"整句重读"
      // 的入口（不想逐词纠错的孩子可以整句再来一遍）。
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 重读整句';
      btn.disabled = false;
      // v138：只动"这一题自己的"底部按钮 —— 晚到的回调不许去改别的屏。
      if (this._stepBelongsTo(mi, qi)) {
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = true; next.classList.remove('nudge'); }
      }
      return;
    }
    if (status === 'passed') {
      btn.style.background = 'var(--success)';
      // score 为 null = 本地判定"确实读了"，但识别端没给分 —— 只报通过。
      const hasScore = (typeof score === 'number');
      btn.innerHTML = '✅ 已通过' + (hasScore ? ' ' + score + ' 分' : '');
      btn.disabled = true;
      // v138：通过 = 这道口语题真的做完了。先落状态（_speakingGateOpen 只认它），
      // 再去点亮底部按钮；而且只在"这一屏还是这道题"时才点 —— 否则上一题
      // 打完分才回来的回调会把孩子正看着的下一题也点亮（就是这么"虚"的）。
      this._spPassed = this._spPassed || {};
      this._spPassed[dayIdx + '-' + mi + '-' + qi] = hasScore ? score : 60;
      if (this._stepBelongsTo(mi, qi)) {
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = false; next.classList.add('nudge'); }
      }
      if (statusEl) {
        let html = (hasScore
          ? '<div style="font-size:34px;font-weight:700;color:var(--success);line-height:1.15">' + score + ' 分</div>'
          : '<div style="font-size:34px;font-weight:700;color:var(--success);line-height:1.15">✓</div>')
                 + '<span style="color:var(--success);font-weight:600">'
                 + (hasScore ? '✅ 读得很好，通过！' : '✅ 读到了，通过！录音已经存下来')
                 + '</span>';
        if (m && m.questions && qi < m.questions.length - 1) {
          html += '<div style="margin-top:10px"><button class="speak-btn" style="background:var(--success)" '
                + 'onclick="App.nextSpeaking(' + mi + ',' + (qi + 1) + ',\'' + dayIdx + '\')">下一题 →</button></div>';
        } else {
          html += '<div class="badge badge-success mt-8" style="font-size:16px">🎉 全部完成！</div>';
        }
        statusEl.innerHTML = html;
      }
      return;
    }
    if (status === 'failed') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 再点一次重读';
      btn.disabled = false;
      if (this._stepBelongsTo(mi, qi) && !this._speakingGateOpen(mi, qi, dayIdx)) {
        // <60 分：底部"下一题"保持灰色锁定，重读通过后才会解锁。
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = true; next.classList.remove('nudge'); }
      }
      if (statusEl) {
        const bad = (extra && extra.badWords) || [];
        let html = '<div style="font-size:34px;font-weight:700;color:var(--danger);line-height:1.15">'
                 + score + ' 分</div>'
                 + '<span style="color:var(--danger);font-weight:600">⚠️ 不到 60 分，带 ✗ 的红词再读清楚些</span>';
        if (bad.length) {
          const list = bad.slice(0, 6).map(function(x) {
            return x.heard ? '<b>' + x.expected + '</b>（听成了 ' + x.heard + '）' : '<b>' + x.expected + '</b>（没读到）';
          }).join('、');
          html += '<div class="fs-12 text-sub" style="margin-top:6px">没读对的词：' + list
                + '<br>先听一遍示范，再把<b>整句</b>重读一次。'
                + '<div style="margin-top:6px"><button class="speak-btn" style="font-size:13px;padding:6px 14px" '
                + 'onclick="App._spReplay(' + mi + ',' + qi + ',\'' + dayIdx + '\')">🔊 听一遍示范</button></div></div>';
        } else {
          html += '<div class="fs-12 text-sub" style="margin-top:6px">把整句再读一次，注意读清楚每个词。'
                + '<div style="margin-top:6px"><button class="speak-btn" style="font-size:13px;padding:6px 14px" '
                + 'onclick="App._spReplay(' + mi + ',' + qi + ',\'' + dayIdx + '\')">🔊 听一遍示范</button></div></div>';
        }
        statusEl.innerHTML = html;
      }
      return;
    }
  },

  // 重读前先听一遍标准示范（问句 + 答句整句）。音色跟上面那一屏一致（cf）。
  _spReplay(mi, qi, dayIdx) {
    const s = this._speakingReadSentence(mi, qi, dayIdx);
    if (s) this.speak(s, { prefer: 'cf' });
  },

  // Self-assessment mode (when speech recognition is not available)
  _showSelfAssessment(mi, qi, dayIdx, q, reason) {
    const readArea = document.getElementById('sp-read-' + mi);
    var sentence = this._speakingReadSentence(mi, qi, dayIdx).replace(/'/g, "\\'");
    var html = '<div class="speak-record show" style="text-align:center">';
    html += '<p style="font-size:15px;font-weight:600;color:var(--primary);margin-bottom:8px">请给自己打分</p>';
    // Be explicit about why the automatic comparison is not shown.
    html += '<p class="fs-12 text-sub mb-8">' + (reason ? reason + '，改为自评。' : '')
         + '听一听标准发音，对比自己的朗读</p>';
    html += '<button class="speak-btn play" style="margin-bottom:12px" onclick="App.speak(\'' + sentence + '\',{prefer:\'cf\'})">🔊 听标准发音</button>';
    html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
    html += '<button class="speak-btn" style="background:var(--success)" onclick="App._selfScore(' + mi + ',' + qi + ',\'' + dayIdx + '\',90)">⭐ 很好 (90分)</button>';
    html += '<button class="speak-btn" style="background:var(--warning)" onclick="App._selfScore(' + mi + ',' + qi + ',\'' + dayIdx + '\',75)">👍 还不错 (75分)</button>';
    html += '<button class="speak-btn" style="background:var(--danger)" onclick="App._selfScore(' + mi + ',' + qi + ',\'' + dayIdx + '\',50)">💪 需练习 (50分)</button>';
    html += '</div>';
    html += '</div>';
    readArea.innerHTML = html;
  },

  // Handle self-assessment score
  _selfScore(mi, qi, dayIdx, score) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    const readArea = document.getElementById('sp-read-' + mi);
    const passed = score >= 60;
    var html = '<div class="speak-record show" style="text-align:center">';
    html += '<div class="speak-score" style="color:' + (passed?'var(--success)':'var(--danger)') + '">' + score + '分</div>';
    if (passed) {
      html += '<div class="badge badge-success mt-8" style="font-size:14px">✅ 继续加油！</div>';
      this._playCorrectSound();
    } else {
      html += '<div class="badge badge-warning mt-8">多听多读，你会越来越好！</div>';
    }
    html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px">';
    html += '<button class="speak-btn" onclick="App.startReadAlong(' + mi + ',' + qi + ',\'' + dayIdx + '\')">🎤 再读一次</button>';
    if (passed && qi < m.questions.length - 1) {
      html += '<button class="speak-btn" style="background:var(--success)" onclick="App.nextSpeaking(' + mi + ',' + (qi+1) + ',\'' + dayIdx + '\')">下一题 →</button>';
    } else if (passed) {
      html += '<div class="badge badge-success" style="font-size:16px;align-self:center">🎉 全部完成！</div>';
    }
    html += '</div>';
    html += '<div id="sp-clip-' + mi + '" class="mt-8"></div>';
    html += '</div>';
    readArea.innerHTML = html;
    this._persistSpeakingClip(mi, qi, dayIdx, q, score, { source: 'self' });
  },

  // fallbackPron removed - replaced by _showSelfAssessment for better UX

  nextSpeaking(mi, qi, dayIdx) {
    // In the student's one-question stage each speaking question IS a step —
    // advancing in place would leave the progress counter behind.
    // v138：预览也是"一题一屏"，老师在这里也必须走 nextStep，否则题换了、
    // 底部那颗按钮还挂在上一题身上，门禁就对不上了。
    if (!this.isTeacher() || this.state.currentTab === 'preview') { this.nextStep(); return; }
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    document.getElementById('sp-content-' + mi).innerHTML = this.renderSpeakingQuestion(m, mi, qi, dayIdx);
  },

  // ===== Speaking: real audio capture =====
  // The read-along UI used to say "正在录音…" while capturing nothing — it
  // only ran speech recognition. Now the audio is actually kept, so the
  // teacher can listen and judge pronunciation themselves.
  _startClipCapture() {
    this._spClip = null;
    this._spClipBlob = null;
    // v139：上一遍的波形/meta 必须清掉。_lastClipVoiceOk() 靠它们判断"这次
    // 有没有出声" —— 留着上一次的，就会把一次真的没录到的朗读判成"读过"。
    this._spClipSamples = null;
    this._spClipMeta = null;
    if (!Recorder.supported()) {
      this._spClipStarting = null;
      return Promise.resolve(false);
    }
    // Held so that a finish() arriving before the mic is ready still waits for
    // the recorder — otherwise the clip is lost AND the mic stays open.
    this._spClipStarting = Recorder.start()
      .then(() => { this._spClip = true; return true; })
      .catch(e => {
        // Denied or unavailable: the read-along still works, just without audio.
        console.warn('Clip capture unavailable:', e);
        return false;
      });
    return this._spClipStarting;
  },

  // Idempotent: called as soon as the child stops reading (so the mic is
  // released and we don't record the silence while they self-score), and
  // again when the result is persisted. The blob is buffered in between.
  async _finishClipCapture() {
    if (this._spClipPending) return this._spClipPending;
    // Wait for a capture that is still starting up, so a fast recognition
    // result cannot leave the microphone running.
    if (this._spClipStarting) {
      try { await this._spClipStarting; } catch (e) {}
      this._spClipStarting = null;
    }
    if (!this._spClip) return this._spClipBlob || null;
    this._spClip = null;
    this._spClipPending = Recorder.stop()
      .then(out => {
        this._spClipBlob = out ? out.blob : null;
        this._spClipMeta = out ? { duration: out.duration, sampleRate: out.sampleRate,
                                   peak: out.peak, health: out.health || null } : null;
        this._spClipSamples = out ? out.samples : null;
        this._spClipPending = null;
        if (out) this._micNote(out, 'sp');
        return this._spClipBlob;
      })
      .catch(e => { console.warn('Recorder.stop failed:', e); this._spClipPending = null; return null; });
    return this._spClipPending;
  },

  // Persist the clip + score, then drop a player into the result view.
  async _persistSpeakingClip(mi, qi, dayIdx, q, score, extra) {
    const blob = await this._finishClipCapture();
    this._spClipBlob = null;              // consumed; next attempt starts clean
    const meta = Object.assign({
      studentId: this._myStudentId(),
      dayIdx: dayIdx, moduleIdx: mi, itemIdx: qi, round: this._spRound || 1,
      type: 'speaking', label: q.sentence, score: score,
    }, extra || {});

    let clipId = null, url = null;
    if (blob) {
      if (this.isTeacher()) {
        // v134 老师预览：录音只在本机放给自己听，不上传、不留档。
        //
        // 不加这一道的后果是实打实的：老师身上没有 students 记录，
        // _myStudentId() 会退化成 's' + 手机号，于是老师每录一遍，就往
        // 「口语记录」里多一条挂在这个假学号下的记录，还白占上传带宽。
        // 老师是来检查题的，不该在她自己的档案里留东西。
        try { url = URL.createObjectURL(blob); } catch (e) { url = null; }
      } else {
        try {
          const saved = await Api.uploadRecording(blob, meta);
          clipId = saved.id; url = saved.url;
        } catch (e) { console.warn('Speaking clip upload failed:', e); }
      }
    }
    // 评分同理：老师预览不提交，但下面的分数照常显示 —— 她要看的正是
    // "这个评分到底对不对"，只是不该写进任何人的账里。
    if (!this.isTeacher()) {
      try { await Api.submitSpeakingScore(Object.assign({ clipId }, meta)); }
      catch (e) { console.warn('Speaking score save failed:', e); }
    }

    const slot = document.getElementById('sp-clip-' + mi);
    if (slot) {
      slot.innerHTML = url
        ? '<div class="fs-12 text-sub mb-4">你的朗读</div>'
          + '<audio controls src="' + url + '" style="width:100%;max-width:280px;height:32px"></audio>'
        : '<div class="fs-12 text-sub">本次没有录到音频（可能未授权麦克风）</div>';
    }
  },

  // ===== Speech-recognition comparison =====
  // Word-level alignment between the target sentence and what the recogniser
  // heard. The old version tested `spoken.includes(target)` per word, which
  // matched "think" against "sink" and "in" against "interesting" — it could
  // not tell a mispronunciation from a correct read.
  // Digits are spoken as words: a child reading "10-year-old" says "ten year
  // old", so comparing the written form against the transcript marked a
  // correctly read sentence wrong.
  NUM_WORDS: ['zero','one','two','three','four','five','six','seven','eight',
              'nine','ten','eleven','twelve','thirteen','fourteen','fifteen',
              'sixteen','seventeen','eighteen','nineteen','twenty'],

  _spellNumber(n) {
    const v = parseInt(n, 10);
    if (isNaN(v)) return String(n);
    if (v <= 20) return this.NUM_WORDS[v];
    if (v < 100) {
      const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
      const t = tens[Math.floor(v / 10)], o = v % 10;
      return o ? t + ' ' + this.NUM_WORDS[o] : t;
    }
    return String(v);
  },

  // 缩写摊平表（v96）。识别端经常把 "I'm" 吐成 "I am"、"don't" 吐成
  // "do not"、"what's" 吐成 "what is" —— 孩子嘴里读的就是一个词，逐字比对
  // 却会把它判成读错。两边都先摊平成同一个写法，这一整类误判消失。
  CONTRACTIONS: {
    "i'm": 'i am', "i've": 'i have', "i'll": 'i will', "i'd": 'i would',
    "you're": 'you are', "you've": 'you have', "you'll": 'you will', "you'd": 'you would',
    "we're": 'we are', "we've": 'we have', "we'll": 'we will', "we'd": 'we would',
    "they're": 'they are', "they've": 'they have', "they'll": 'they will', "they'd": 'they would',
    "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is',
    "what's": 'what is', "where's": 'where is', "who's": 'who is', "how's": 'how is',
    "there's": 'there is', "here's": 'here is', "let's": 'let us',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not',
    "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not',
    "can't": 'cannot', "couldn't": 'could not', "won't": 'will not', "wouldn't": 'would not',
    "shouldn't": 'should not', "mustn't": 'must not',
    "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
    "gonna": 'going to', "wanna": 'want to', "gotta": 'got to', "ok": 'okay',
  },

  _expandContractions(toks) {
    const map = this.CONTRACTIONS;
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      // "can not" / "cannot" / "can't" 在识别结果里三种写法都出现过，统一
      // 收成 "cannot"，否则同一个词会因为写法不同被判成读错。
      if (t === 'can' && toks[i + 1] === 'not') { out.push('cannot'); i++; continue; }
      const e = map[t];
      if (e) { const parts = e.split(' '); for (let k = 0; k < parts.length; k++) out.push(parts[k]); }
      else out.push(t);
    }
    return out;
  },

  _tokens(s) {
    const self = this;
    const raw = String(s).toLowerCase()
      .replace(/(\d+)/g, function(_, d) { return ' ' + self._spellNumber(d) + ' '; })
      .replace(/[^a-z'\s]/g, ' ')
      .split(/\s+/).filter(Boolean);
    // 缩写摊平放在最后一步：_readTokens 也是逐词调这里，所以显示格子的
    // data-n 会自动跟着变成 2（"What's" 占两个词位），高亮与判分仍然对齐
    // —— tools/verify-read-tokens.js 守着这条一致性。
    return this._expandContractions(raw);
  },

  // 纯语法连接词（v96）。识别端最爱吞的就是这一小撮：孩子嘴里读了 "the"，
  // 回来的转写里没有它。判定要求"一个红词都不许有"，被吞一个 the 就能把整句
  // 卡死 —— 而句子的实词一个都没少。这类词漏读/听岔不计入错词。
  GLUE_WORDS: {
    a: 1, an: 1, the: 1, is: 1, am: 1, are: 1, was: 1, were: 1, be: 1, been: 1,
    do: 1, does: 1, did: 1, of: 1, to: 1, and: 1, or: 1, in: 1, on: 1, at: 1,
    as: 1, so: 1, but: 1, for: 1, with: 1, that: 1, this: 1, us: 1, not: 1,
  },

  // 词尾变化（v96）：同一个词的复数 / 三单 / 过去式 / 进行时 / 比较级。
  // cats/cat 那条由 _wordSame ③ 覆盖掉了；helped/help、visited/visit、
  // years/year、reading/read 得剥掉 -ed/-s/-ing 才相等，单独补一条。
  // 要求两边都不短于 4 个字母 —— 否则 an/and、be/bed 这种短词会互相认领。
  _inflectSame(a, b) {
    if (a.length < 4 || b.length < 4) return false;
    const rules = [['ies', 'y'], ['ing', ''], ['est', ''], ['ed', ''], ['es', ''],
                   ['er', ''], ['ly', ''], ['s', ''], ['d', '']];
    const strip = function(w) {
      const out = [w];
      for (let i = 0; i < rules.length; i++) {
        const suf = rules[i][0];
        // 剥完至少还剩 3 个字母，免得把 help 剥成 he
        if (w.length > suf.length + 2 && w.slice(-suf.length) === suf) {
          out.push(w.slice(0, w.length - suf.length) + rules[i][1]);
        }
      }
      return out;
    };
    const A = strip(a), B = strip(b);
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B.length; j++) if (A[i] === B[j]) return true;
    }
    return false;
  },

  // 一个词算不算「读的就是这个」（v96）。判分要同时满足两件相反的事：
  // 读对的别冤枉（识别噪声、拼写变体），读错的别放过（think/sink 要能分开）。
  // 四条口径，一条比一条松：
  //   ① 拼写完全一样
  //   ② 音形归一后一样（favorite/favourite、library/libary、full/ful）
  //   ③ 音形归一只差一个字母 —— 但只认"长度不一样"的那种差（多一个 s / d / ed
  //      的去尾：cats/cat、subjects/subject、help/helped），因为那是同一个词的
  //      词形变化；等长的一个字母之差（cat/cut、pen/pan、run/ran）是另一个词，
  //      不认。两边都 ≥4 个字母时放宽到等长也认（school/schoo 之类的手滑）。
  //   ④ 剥掉词尾后相等（helped/help、visited/visit、years/year）
  //   ⑤ 音形归一后互为前缀，且都不短于 6 个字母（recognize/recognition）
  _wordSame(expected, heard) {
    const a0 = String(expected == null ? '' : expected).toLowerCase();
    const b0 = String(heard == null ? '' : heard).toLowerCase();
    if (!a0 || !b0) return false;
    if (a0 === b0) return true;
    const x = this._soundKey(a0), y = this._soundKey(b0);
    if (!x || !y) return false;
    if (x === y) return true;
    if (this._editDistance(x, y) <= 1 && (x.length !== y.length || (x.length >= 4 && y.length >= 4))) return true;
    if (this._inflectSame(a0, b0)) return true;
    if (x.length >= 6 && y.length >= 6 && (x.indexOf(y) === 0 || y.indexOf(x) === 0)) return true;
    return false;
  },

  // 「这一串识别结果里有没有出现过这个词」—— 不看位置。单词纠错用。
  _heardAny(expected, heard) {
    const toks = String(heard || '').toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      if (this._wordSame(expected, toks[i])) return true;
    }
    return false;
  },

  _editDistance(a, b) {
    const n = a.length, m = b.length;
    if (!n) return m;
    if (!m) return n;
    let prev = Array.from({ length: m + 1 }, (_, j) => j);
    for (let i = 1; i <= n; i++) {
      const cur = [i];
      for (let j = 1; j <= m; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[m];
  },

  // Levenshtein over word arrays, with backtrace, so each target word gets a
  // verdict: ok / wrong (something else was said there) / missing (skipped),
  // plus any extra words that were not in the sentence.
  //
  // v96：位置上的「一样」不再要求拼写逐字相同，改走 _wordSame（音形归一 +
  // 一个字母的容错）——识别噪声本来就不该算孩子读错。虚词（a/the/is/to…）
  // 一旦漏读或被吞，也不计入错词（见 GLUE_WORDS）。
  alignSpeech(target, spoken) {
    const t = this._tokens(target), s = this._tokens(spoken);
    const n = t.length, m = s.length;
    const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    const bt = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(''));
    for (let i = 1; i <= n; i++) { d[i][0] = i; bt[i][0] = 'del'; }
    for (let j = 1; j <= m; j++) { d[0][j] = j; bt[0][j] = 'ins'; }
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const same = this._wordSame(t[i - 1], s[j - 1]);
        const sub = d[i - 1][j - 1] + (same ? 0 : 1);
        const del = d[i - 1][j] + 1;
        const ins = d[i][j - 1] + 1;
        const best = Math.min(sub, del, ins);
        d[i][j] = best;
        bt[i][j] = best === sub ? (same ? 'match' : 'sub') : (best === del ? 'del' : 'ins');
      }
    }
    const out = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
      const op = i === 0 ? 'ins' : j === 0 ? 'del' : bt[i][j];
      if (op === 'match' || op === 'sub') {
        out.push({ target: t[i - 1], spoken: s[j - 1], status: op === 'match' ? 'ok' : 'wrong' });
        i--; j--;
      } else if (op === 'del') {
        out.push({ target: t[i - 1], spoken: null, status: 'missing' }); i--;
      } else {
        out.push({ target: null, spoken: s[j - 1], status: 'extra' }); j--;
      }
    }
    out.reverse();
    // 复合词拆合（v96）：识别端很爱把 storybooks 写成 "story book"、basketball
    // 写成 "basket ball" —— 孩子读得完全没错，逐词比对却必挂。做一次局部合并：
    // ① 一个没判过的目标词，把它左右紧邻的"多出来的词"拼进来再比一次
    //    （storybooks ← "story" + "book" 两半，哪一半落在左边都可能）；
    // ② 反过来（目标句是 "story books" 两个词、识别回来粘成 "storybooks"）。
    const self = this;
    for (let i = 0; i < out.length; i++) {
      const it = out[i];
      if (!it.target || it.status === 'ok') continue;
      const left = [], right = [];
      for (let j = i - 1; j >= 0; j--) {
        const pv = out[j];
        if (!pv || pv.target || pv.status !== 'extra') break;
        left.unshift(j);
      }
      for (let j = i + 1; j < out.length; j++) {
        const nx = out[j];
        if (!nx || nx.target || nx.status !== 'extra') break;
        right.push(j);
      }
      if (!left.length && !right.length) continue;
      const L = left.map(function(k) { return String(out[k].spoken || ''); });
      const R = right.map(function(k) { return String(out[k].spoken || ''); });
      let hit = null;
      for (let a = L.length; a >= 0 && !hit; a--) {
        for (let b = 0; b <= R.length && !hit; b++) {
          const acc = L.slice(0, a).join('') + String(it.spoken || '') + R.slice(0, b).join('');
          if (acc.length > 1 && self._wordSame(it.target, acc)) hit = { a: a, b: b, acc: acc };
        }
      }
      if (hit) {
        it.status = 'ok'; it.merged = hit.acc;
        for (let k = 0; k < hit.a; k++) out[left[k]].consumed = true;
        for (let k = 0; k < hit.b; k++) out[right[k]].consumed = true;
      }
    }
    for (let i = 0; i + 1 < out.length; i++) {
      const a = out[i], b = out[i + 1];
      if (!a || !b || !a.target || !b.target) continue;
      if (a.status === 'ok' && b.status === 'ok') continue;
      const joined = String(a.target) + String(b.target);
      if (a.spoken && this._wordSame(joined, a.spoken)) {
        a.status = 'ok'; b.status = 'ok'; a.merged = joined;
      }
    }
    const items = out.filter(function(x) { return !x.consumed; });
    // 虚词豁免：漏读 / 听岔的连接词按"读到了"记，soft 标记留下来给排查用。
    const glue = this.GLUE_WORDS;
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      if (it.target && it.status !== 'ok' && glue[it.target]) { it.status = 'ok'; it.soft = true; }
    }
    const total = n || 1;
    const ok = items.filter(x => x.status === 'ok').length;
    return {
      items: items,
      total: n,
      ok: ok,
      score: Math.round(ok / total * 100),
      wrong: items.filter(x => x.status === 'wrong'),
      missing: items.filter(x => x.status === 'missing'),
      extra: items.filter(x => x.status === 'extra'),
    };
  },

  calcPronScore(target, spoken) {
    return this.alignSpeech(target, spoken).score;
  },

  findWrongWords(target, spoken) {
    const a = this.alignSpeech(target, spoken);
    return a.wrong.concat(a.missing).map(x => x.target).filter(w => w && w.length > 1);
  },

  // Old speak() removed - now using new TTS system above

  // Sequentially speak items and highlight corresponding DOM elements
  // items: array of strings to speak
  // prefix: DOM id prefix (e.g., 'letter', 'syllable')
  // mi: module index used in id
  // onDone: callback when all rounds complete
  _speakAndHighlight(items, prefix, mi, onDone) {
    var self = this;
    var idx = 0;
    var round = 0;
    function next() {
      if (round >= 2) { if (onDone) onDone(); return; }
      if (idx >= items.length) { idx = 0; round++; next(); return; }
      var el = document.getElementById(prefix + '-' + mi + '-' + idx);
      if (el) { el.classList.add('active'); el.classList.remove('done'); }
      self.speak(items[idx], { onDone: function() {
        if (el) { el.classList.remove('active'); el.classList.add('done'); }
        idx++;
        setTimeout(next, 500);
      }});
    }
    next();
  },

  // Vocab game (Baicizhan style)
  renderVocabGame(m, mi, dayIdx) {
    // 断点续做：词汇闯关是"一天 5 个词、词内 8 个阶段"的连续闯关，它的内部
    // 坐标（第几个词 / 第几个阶段 / 分数）不在题号体系里，只放内存的话重登录
    // 一定回到第 1 个词（家长报的"明明读到 dinosaur 了，重进去又是 museum"）。
    // 这里先从本机记录里恢复，恢复不了才是全新开始。
    this.state.vocabMi = mi;
    const pos = this._getPos(dayIdx);
    const v = pos && pos.vocab;
    const usable = v && v.mi === mi && typeof v.wordIdx === 'number'
                && isFinite(v.wordIdx) && v.wordIdx >= 0 && v.wordIdx <= m.words.length;
    if (usable) {
      this.state.vocabWordIdx = Math.floor(v.wordIdx);
      this.state.vocabScore = Math.max(0, Math.floor(v.score) || 0);
      this.state.vocabReviewDone = !!v.reviewDone;
      // v136：上次学到第几个词**学完了**。没这个记录（旧版本存的位置）一律
      // 当作"还没学完"——宁可让孩子把当前这个词重走一遍，也不许跳过。
      this.state.vocabDoneIdx = (typeof v.doneIdx === 'number' && isFinite(v.doneIdx))
        ? Math.floor(v.doneIdx) : -1;
      // 阶段号要按当前这个词的阶段数夹一下，否则数据一变就会渲染到
      // 不存在的阶段（stage 为 undefined，取 .type 直接炸）
      const stCount = (((m.words[this.state.vocabWordIdx] || m.words[0] || {}).stages) || []).length || 1;
      let st = Math.floor(v.stage);
      if (!isFinite(st) || st < 0) st = 0;
      if (st > stCount - 1) st = stCount - 1;
      this.state.vocabStage = st;
    } else {
      this.state.vocabStage = 0;
      this.state.vocabWordIdx = 0;
      this.state.vocabScore = 0;
      this.state.vocabReviewDone = false;
      this.state.vocabDoneIdx = -1;
    }
    // Check if previous day has learned words for review —— 已经点过
    // "复习完成"就不再回放这一屏，否则断点续做会先被按回复习页。
    var reviewWords = this._getLearnedWords(dayIdx - 1);
    if (reviewWords && reviewWords.length > 0 && !this.state.vocabReviewDone) {
      return '<div class="vocab-game" id="vocab-game-' + mi + '">' + this._renderVocabReview(mi, dayIdx, reviewWords, m) + '</div>';
    }
    return '<div class="vocab-game" id="vocab-game-' + mi + '">' + this.renderVocabStage(m, mi, dayIdx) + '</div>';
  },

  // Save learned words for next-day review
  _saveLearnedWords(dayIdx, words) {
    const slim = words.map(function(w) {
      return { word: w.word, meaning: w.meaning, emoji: w.emoji, phonetic: w.phonetic };
    });
    this.state.learnedWords['day_' + dayIdx] = slim;
    // Fire-and-forget: the in-memory copy above is what the renderer reads.
    Api.saveLearnedWords(dayIdx, slim);
  },

  // Get learned words for a specific day. Stays synchronous — it is called
  // from inside a render function that builds HTML in one pass.
  _getLearnedWords(dayIdx) {
    return this.state.learnedWords['day_' + dayIdx] || null;
  },

  // Render review screen
  _renderVocabReview(mi, dayIdx, reviewWords, m) {
    var self = this;
    var html = '<div class="vocab-progress"><div class="fill" style="width:5%"></div></div>';
    html += '<div class="vocab-stage vocab-review">';
    html += '<div class="vr-title">📚 复习昨日单词</div>';
    html += '<div class="vr-sub">先复习昨天学的' + reviewWords.length + '个单词，再学新词</div>';
    reviewWords.forEach(function(w, i) {
      html += '<div class="vr-word-item">';
      html += '<span class="vrw-emoji tap-speak-sm" onclick="App.speak(\'' + w.word.replace(/'/g, "\\'") + '\')" title="点一下听发音">' + (w.emoji || '📖') + '</span>';
      html += '<div class="vrw-info"><div class="vrw-word">' + w.word + '</div><div class="vrw-meaning">' + w.meaning + '</div></div>';
      html += '<button class="vrw-play" onclick="App.speak(\'' + w.word.replace(/'/g, "\\'") + '\')" aria-label="听发音"><svg class="icon icon-sm"><use href="#i-sound"/></svg></button>';
      html += '</div>';
    });
    html += '<button class="vocab-btn" style="margin-top:16px" onclick="App._finishReview(' + mi + ',' + dayIdx + ')">复习完成，开始学新词 →</button>';
    html += '</div>';
    return html;
  },

  // Finish review, start actual vocab game
  _finishReview(mi, dayIdx) {
    this.state.vocabReviewDone = true;
    this.state.vocabMi = mi;
    this._savePos(dayIdx);          // 复习这一屏也过了，断点不再回到它
    var m = HOMEWORK_DATA[dayIdx].modules[mi];
    var el = document.getElementById('vocab-game-' + mi);
    if (el) el.innerHTML = this.renderVocabStage(m, mi, dayIdx);
  },

  // 中文提示的"内嵌槽位"（v118）：选图片 / 选释义两屏都把它埋在题目（图片）
  // 正下方。原来答错时提示是 append 到整张词汇卡片的最末尾，手机上要往下滑
  // 一屏才看得见 —— 家长原话"中文提示需要滑动屏幕才能看见"。
  _vocabHintSlot(mi) {
    return '<div class="vocab-hint-slot" id="vocab-hint-' + mi + '" style="display:none"></div>';
  },

  // 提示往哪儿落：优先内嵌槽位（题目正下方），没有再退回老位置
  //（拼写填空的 spell-result / 动态创建的卡片尾部）。
  _vocabHintEl(mi) {
    return document.getElementById('vocab-hint-' + mi)
        || document.getElementById('spell-result-' + mi)
        || document.getElementById('vocab-retry-area-' + mi);
  },

  // 提示一出现，就把上面那张大图收小一圈 —— 给提示腾出地方，让"图片 + 提示 +
  // 选项"在手机上同屏放得下（不然多出来的这几行还是会把选项挤出屏幕）。
  _vocabTightenForHint(mi) {
    var box = document.querySelector('#vocab-game-' + mi + ' .vocab-stage');
    if (box) box.classList.add('hint-open');
  },

  renderVocabStage(m, mi, dayIdx) {
    // 拼读进度是「本阶段」的状态：切阶段/切单词必须清掉，否则上一个单词
    // 的 _spell 残留会把底部按钮错误地锁住（或放行）。
    this._spell = null;
    const wIdx = this.state.vocabWordIdx;
    const sIdx = this.state.vocabStage;
    if (wIdx >= m.words.length) {
      // Completion screen with score and word list
      var maxScore = m.words.reduce(function(s, w) { return s + w.stages.length; }, 0);
      var scorePct = maxScore > 0 ? Math.round(this.state.vocabScore / maxScore * 100) : 0;
      var stars = scorePct >= 90 ? '⭐⭐⭐' : scorePct >= 70 ? '⭐⭐' : '⭐';
      var html = '<div class="vocab-progress"><div class="fill" style="width:100%"></div></div>';
      html += '<div class="vocab-stage vocab-complete">';
      html += '<div class="vocab-emoji-card" style="background:linear-gradient(135deg,#FFF9E6,#FFE082)">🎉</div>';
      html += '<div class="vc-title">全部学完啦！</div>';
      html += '<div class="vc-stars">' + stars + '</div>';
      html += '<div class="vc-score">答对 ' + this.state.vocabScore + ' / ' + maxScore + ' 题（' + scorePct + '%）</div>';
      html += '<div class="vc-word-list">';
      m.words.forEach(function(w) {
        html += '<div class="vc-word-item"><span class="vcw-emoji tap-speak-sm" onclick="App.speak(\'' + w.word.replace(/'/g, "\\'") + '\')" title="点一下听发音">' + w.emoji + '</span><div class="vcw-info"><div class="vcw-word">' + w.word + '</div><div class="vcw-meaning">' + w.meaning + '</div></div><button class="vrw-play" onclick="App.speak(\'' + w.word.replace(/'/g, "\\'") + '\')" aria-label="听发音"><svg class="icon icon-sm"><use href="#i-sound"/></svg></button></div>';
      });
      html += '</div>';
      html += '<div style="font-size:13px;color:var(--text-sub);margin-top:8px">明天学习新单词时，会先复习这' + m.words.length + '个单词哦</div>';
      html += '</div>';
      // Save completed words for next-day review
      this._saveLearnedWords(dayIdx, m.words);
      return html;
    }
    const word = m.words[wIdx];
    const stage = word.stages[sIdx];
    const totalStages = m.words.length * word.stages.length;
    const currentProgress = (wIdx * word.stages.length + sIdx) / totalStages * 100;

    html = '<div class="vocab-progress"><div class="fill" style="width:' + currentProgress + '%"></div></div>';
    html += '<div class="vocab-stars">' + '⭐'.repeat(Math.min(this.state.vocabScore, 10)) + '</div>';
    html += '<div class="vocab-stage">';

    if (stage.type === 'learn') {
      html += this._wordImage(word, false);
      html += '<div class="vocab-word">' + word.word + '</div>';
      html += '<div class="vocab-phonetic">' + word.phonetic + '</div>';
      html += '<div class="vocab-meaning">' + word.meaning + '</div>';
      html += '<div class="vocab-example">"' + word.example_en + '"<br>' + word.example_cn + '</div>';
      html += '<button class="vocab-btn" onclick="App.speak(\'' + word.word.replace(/'/g,"\\'") + '\')">🔊 听发音</button>';
      html += '<button class="vocab-btn" onclick="App.nextVocabStage(' + mi + ',' + dayIdx + ',' + m.words.length + ',' + word.stages.length + ')">我学会了 →</button>';
      // Auto-read the word
      this.autoSpeak(word.word);
    } else if (stage.type === 'image_choice') {
      html += '<div class="auto-read-badge"><svg class="icon icon-sm speaking-anim"><use href="#i-sound"/></svg> 正在朗读…</div>';
      html += '<div class="vocab-meaning">' + stage.prompt + '</div>';
      html += this._wordImage(word, true);
      // v118：中文提示的内嵌槽位就埋在**图片正下方**。答错时它原地长出来，
      // 孩子一眼就能看到，不用往下滑一屏（家长反馈"提示要滑动才看得见"）。
      html += this._vocabHintSlot(mi);
      html += '<div class="vocab-options" id="vo-' + mi + '" style="opacity:0.4;pointer-events:none">';
      stage.options.forEach((opt, oi) => {
        html += '<div class="vocab-option-card" onclick="App.checkVocabAnswer(' + mi + ',' + oi + ',' + stage.answer + ',' + dayIdx + ',' + m.words.length + ',' + word.stages.length + ')">' + opt + '</div>';
      });
      html += '</div>';
      html += '<div class="listen-wait" id="vw-' + mi + '" style="text-align:center;padding:8px;color:var(--text-sub);font-size:12px">⏳ 请先听完整朗读，再选择答案</div>';
      // Auto-read the word, then enable options
      this.autoSpeak(word.word, function() {
        var el = document.getElementById('vo-' + mi);
        var w = document.getElementById('vw-' + mi);
        if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
        if (w) w.style.display = 'none';
      });
    } else if (stage.type === 'meaning_choice') {
      html += '<div class="auto-read-badge"><svg class="icon icon-sm speaking-anim"><use href="#i-sound"/></svg> 正在朗读…</div>';
      html += this._wordImage(word, true);
      html += '<div class="vocab-word">' + word.word + '</div>';
      html += '<div class="vocab-phonetic">' + word.phonetic + '</div>';
      html += '<div class="vocab-meaning">' + stage.prompt + '</div>';
      // v118：和"选图片"一样，提示槽位埋在题目正下方（图片 → 题目 → 提示 → 选项），
      // 答错时不用滑动就能看见。
      html += this._vocabHintSlot(mi);
      html += '<div class="vocab-options" id="vo-' + mi + '" style="opacity:0.4;pointer-events:none">';
      stage.options.forEach((opt, oi) => {
        html += '<div class="vocab-option-card" style="font-size:16px;padding:14px 8px" onclick="App.checkVocabAnswer(' + mi + ',' + oi + ',' + stage.answer + ',' + dayIdx + ',' + m.words.length + ',' + word.stages.length + ')">' + opt + '</div>';
      });
      html += '</div>';
      html += '<div class="listen-wait" id="vw-' + mi + '" style="text-align:center;padding:8px;color:var(--text-sub);font-size:12px">⏳ 请先听完整朗读，再选择答案</div>';
      // Auto-read the word, then enable options
      this.autoSpeak(word.word, function() {
        var el = document.getElementById('vo-' + mi);
        var w = document.getElementById('vw-' + mi);
        if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
        if (w) w.style.display = 'none';
      });
    } else if (stage.type === 'letter_read') {
      html += this._renderSpellRead(m, mi, dayIdx, word,
        word.letters || word.word.split(''), 'letter');
    } else if (stage.type === 'syllable_blend') {
      html += this._renderSpellRead(m, mi, dayIdx, word,
        word.syllables || [word.word], 'syllable');
    } else if (stage.type === 'spell_fill') {
      // Multi-blank support: format like "di__co__r" or "b__autiful"
      var wordWithBlank = stage.prompt.split(': ').pop();
      var parts = wordWithBlank.split('__');
      var blankCount = parts.length - 1;
      // If answer is a single string, split into chars for multi-blank
      var answerChars = stage.answer.split('');
      // Distribute answer chars across blanks
      var blankLengths = [];
      if (blankCount === 1) {
        blankLengths = [answerChars.length];
      } else {
        // Distribute evenly or use explicit lengths if available
        var base = Math.floor(answerChars.length / blankCount);
        var rem = answerChars.length % blankCount;
        for (var bi = 0; bi < blankCount; bi++) {
          blankLengths.push(base + (bi < rem ? 1 : 0));
        }
      }

      var hintText = answerChars.length === 1 ? '缺少一个字母' : '缺少 ' + answerChars.length + ' 个字母';

      html += this._wordImage(word, true);
      html += '<div class="vocab-word">' + word.meaning + '</div>';
      html += '<div class="vocab-meaning">补全拼写</div>';
      html += '<div class="fs-12 text-sub" style="color:var(--primary)">' + hintText + '</div>';
      html += '<div class="spell-inline-container mt-16">';
      var charIdx = 0;
      for (var pi = 0; pi < parts.length; pi++) {
        if (parts[pi]) {
          html += '<span class="spell-letter">' + parts[pi] + '</span>';
        }
        if (pi < parts.length - 1) {
          var bl = blankLengths[pi] || 1;
          html += '<input type="text" class="spell-blank-input" id="vocab-spell-' + mi + '-' + pi + '" maxlength="' + bl + '" size="' + bl + '" placeholder="' + '\u2014'.repeat(bl) + '" autocomplete="off" autocorrect="off" autocapitalize="none" style="width:' + (bl * 28 + 16) + 'px">';
        }
      }
      html += '</div>';
      html += '<div id="spell-result-' + mi + '"></div>';
      html += '<button class="vocab-btn" onclick="App.checkSpell(' + mi + ',\'' + stage.answer.replace(/'/g,"\\'") + '\',' + dayIdx + ',' + m.words.length + ',' + word.stages.length + ',\'' + word.word.replace(/'/g,"\\'") + '\')">确认</button>';
      this._spellFocusId = 'vocab-spell-' + mi + '-0';
    }
    html += '</div>';
    return html;
  },

  checkVocabAnswer(mi, selected, correct, dayIdx, wordCount, stageCount) {
    const opts = document.querySelectorAll('#vocab-game-' + mi + ' .vocab-option-card');
    const mod = HOMEWORK_DATA[dayIdx].modules[mi] || {};
    const vw = (mod.words || [])[this.state.vocabWordIdx];
    const stage = vw && vw.stages ? vw.stages[this.state.vocabStage] : null;
    const optTexts = stage && stage.options ? stage.options.slice() : null;

    if (selected === correct) {
      // Correct answer
      const tryKey = 'v-' + mi + '-' + this.state.vocabWordIdx + '-' + this.state.vocabStage;
      // 只有第一次就点对才计分 —— 试错之后点对的算"改对了"，跟原来"错的那张
      // 只能点绿框跳过、不计分"的口径一致，星级不会被刷高。
      const firstTry = this._wrongTries(tryKey) === 0;
      this._wrongTryClear(tryKey);
      opts.forEach((el, i) => {
        el.style.pointerEvents = 'none';
        if (i === correct) el.classList.add('correct');
      });
      if (firstTry) this.state.vocabScore++;
      this._playCorrectSound();
      var correctEl = opts[correct];
      if (correctEl) this._showCelebration(correctEl);
      var resultDiv = this._vocabHintEl(mi);
      if (resultDiv) {
        this._clearWrongHint(resultDiv);
        resultDiv.style.display = 'block';   // 内嵌槽位默认藏着，这里要显出来
        resultDiv.innerHTML = '<div style="color:var(--success);font-size:14px;font-weight:600;margin-top:8px">✅ 正确！</div>';
      }
      // v106：答对之后停 800ms 就走（原来 1200ms）。孩子一天要在词汇模块里
      // 点几十次，每次多等 0.4 秒就是"点久了不耐烦"（家长原话）。庆祝动画
      // 本身不到 700ms，800 足够看见，不会被切得突兀。
      setTimeout(() => this.nextVocabStage(mi, dayIdx, wordCount, stageCount), 800);
    } else {
      // 答错不点答案（v104）：卡片上没有 A/B/C/D，提示词只能说"第几个"；
      // 正确卡片一律不亮绿、也不代替孩子点。他自己点对了才进下一阶段。
      // 错词进复习队列（v89）：今天作业末尾的"错词巩固"会再练它
      if (vw && vw.word) this._reviewAdd(vw.word);
      const tryKey = 'v-' + mi + '-' + this.state.vocabWordIdx + '-' + this.state.vocabStage;
      const attempt = this._wrongTryBump(tryKey);
      opts.forEach((el, i) => {
        if (i === selected || el.classList.contains('wrong')) {
          el.classList.add('wrong');           // 选错的那张当场划掉
          el.style.pointerEvents = 'none';
        } else {
          el.style.pointerEvents = 'auto';     // 没点过的还能再点
        }
      });
      this._playWrongSound();
      var resultDiv = this._vocabHintEl(mi);
      if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'vocab-retry-area-' + mi;
        var stageEl = document.getElementById('vocab-game-' + mi);
        if (stageEl) stageEl.appendChild(resultDiv);
      }
      // 提示就在图片下方：顺手把大图收小，保证"图片 + 提示 + 选项"同屏放得下
      this._vocabTightenForHint(mi);
      // 中文提示（v107）：第 1 次错就把这个词的"场景化中文提示"（hint_cn，
      // 见 data.js 的 VOCAB_HINTS）端出来 —— 围绕词义、搭配、用途去说，
      // 但**不含释义原文**（选意思那两题的选项就是释义，写进去等于给答案）。
      //   "选图片"那题（选项是表情）→ 第 2 次错给中文例句，第 3 次起才给
      //     释义（要懂意思才选得对图，但**不给表情本身**，表情才是答案）；
      //   "选意思"那题（选项就是中文释义）→ 释义**永远不给**，第 2 次错让
      //     _choiceShape 去说"这几个字有多长"，第 3 次起给中文例句，让他自己
      //     把"句子说的是什么"和四张卡片对起来。
      // 词汇题全程不点名是哪一张，也不代孩子点（neverReveal）—— 家长原话
      // "没有提示正确答案，让学生自己思考"。
      var isImagePick = !!(stage && stage.type === 'image_choice');
      var clue1 = '';
      var clue2 = '';
      var revealStrong = '';
      var finalTail = '';
      if (vw) {
        clue1 = String(vw.hint_cn || '');
        var exampleLine = vw.example_cn ? '我们学过的一句话：「' + vw.example_cn + '」' : '';
        if (attempt >= 3) {
          if (isImagePick) {
            revealStrong = '💡 ' + vw.word + ' 的意思是「' + vw.meaning + '」。'
                         + '对着这个意思，挑出配得上的那张图。';
            finalTail = '把对上意思的那张，自己点下去。';
          } else {
            // 选意思那题：选项就是释义，所以例句里"就是答案的那几个字"要挖成
            // ○○ 再端出来（见 _maskMeanings）—— 给语境，不给答案。
            var mk = this._maskMeanings(vw.example_cn, vw.meaning);
            revealStrong = mk.text
              ? '我们学过的一句话：「' + mk.text + '」<br>'
                + (mk.masked ? '想想 ○○ 那儿说的是什么，再对着四张卡片挑一个。'
                             : '哪张卡片的意思，跟这句话说的是同一件事？')
              : '';
            finalTail = '对得上意思的那一张，自己点下去。';
          }
        } else if (attempt === 2 && isImagePick) {
          clue2 = exampleLine;
        }
      }
      this._showWrongHint(resultDiv, this._wrongHintHtml({
        attempt: attempt,
        naming: 'index',
        opts: optTexts,
        answer: correct,
        correctText: optTexts ? String(optTexts[correct]) : '',
        picked: selected,
        clue1: clue1,
        clue2: clue2,
        revealStrong: revealStrong,
        neverReveal: true,
        finalTail: finalTail,
        retryTip: '先点一下 🔊 再听一遍发音，想想它是什么意思。',
      }));
    }
  },

  checkSpell(mi, answer, dayIdx, wordCount, stageCount, fullWord) {
    // Collect all spell inputs for this module
    var collected = '';
    var inputEls = [];
    var idx = 0;
    while (true) {
      var inp = document.getElementById('vocab-spell-' + mi + '-' + idx);
      if (!inp) break;
      collected += inp.value.trim().toLowerCase();
      inputEls.push(inp);
      idx++;
    }
    // Fallback to single input if no multi-input found
    if (inputEls.length === 0) {
      var singleInp = document.getElementById('vocab-spell-' + mi);
      if (singleInp) {
        collected = singleInp.value.trim().toLowerCase();
        inputEls.push(singleInp);
      }
    }

    const resultDiv = document.getElementById('spell-result-' + mi);
    const spellKey = 'sf-' + mi + '-' + this.state.vocabWordIdx + '-' + this.state.vocabStage;
    const spellWord = ((HOMEWORK_DATA[dayIdx].modules[mi] || {}).words || [])[this.state.vocabWordIdx] || null;
    if (collected === answer.toLowerCase()) {
      this._wrongTryClear(spellKey);
      inputEls.forEach(function(el) {
        el.classList.add('correct');
        el.classList.remove('wrong');
        el.disabled = true;
      });
      this.state.vocabScore++;
      this._playCorrectSound();
      if (resultDiv) {
        resultDiv.innerHTML = '<div class="spell-result-word">' + fullWord + '</div><div class="spell-result-phonetic">🔊 ' + fullWord + '</div>';
      }
      this.speak(fullWord);
      // v106：拼对之后停 900ms 就走（原来 1500ms），同 _checkVocabAnswer 的理由。
      setTimeout(() => this.nextVocabStage(mi, dayIdx, wordCount, stageCount), 900);
    } else {
      inputEls.forEach(function(el) {
        el.classList.add('wrong');
        el.classList.remove('correct');
        el.value = '';
      });
      this._playWrongSound();
      // 拼写错了，单词进复习队列（v89）
      if (fullWord) this._reviewAdd(fullWord);
      if (resultDiv) {
        var hintText = answer.length === 1 ? '还差一个字母，再试一次' : '还差 ' + answer.length + ' 个字母，再试一次';
        var attemptS = this._wrongTryBump(spellKey);
        var lines = ['<div style="color:var(--danger);font-size:13px;margin-top:8px">❌ ' + hintText + '</div>'];
        // v107：拼写题同样是"记词"，答错就给围绕词义的提示，而不是干说一句
        // "还差几个字母" —— 孩子缺的往往不是字母个数，是"这是哪个词"。
        // 答错两次起再补上我们学过的中文例句，但**始终不给整词**（要他打出来）。
        if (spellWord && spellWord.hint_cn) {
          lines.push('<div class="fs-12" style="margin-top:4px">💡 ' + spellWord.hint_cn + '</div>');
        }
        if (attemptS >= 2 && spellWord && spellWord.example_cn) {
          lines.push('<div class="fs-12" style="margin-top:2px">📖 我们学过的一句话：「' + spellWord.example_cn + '」</div>');
        }
        resultDiv.innerHTML = lines.join('');
      }
      setTimeout(function() {
        inputEls.forEach(function(el) {
          el.classList.remove('wrong');
        });
        if (inputEls[0]) inputEls[0].focus();
      }, 600);
    }
  },

  nextVocabStage(mi, dayIdx, wordCount, stageCount) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    this.state.vocabStage++;
    if (this.state.vocabStage >= stageCount) {
      // v136：这个词的最后一个阶段走完了 —— 记下"第几个词学完了"，
      // 底部「下一个单词」就靠它亮。见 _vocabFootLocked。
      this.state.vocabDoneIdx = this.state.vocabWordIdx;
      this.state.vocabStage = 0;
      this.state.vocabWordIdx++;
    }
    this.state.vocabMi = mi;
    this._savePos(dayIdx);          // 阶段/词一往前走就落盘，重登录接着这一屏
    const el = document.getElementById('vocab-game-' + mi);
    if (el) el.innerHTML = this.renderVocabStage(m, mi, dayIdx);
    // Auto-focus spell input if present
    if (this._spellFocusId) {
      var focusId = this._spellFocusId;
      this._spellFocusId = null;
      setTimeout(function() {
        var inp = document.getElementById(focusId);
        if (inp) inp.focus();
      }, 200);
    }
  },

  // ====== Student Voice Recording (Recorder -> 16kHz WAV -> Workers AI) ======
  // NO machine TTS — student records their own voice, system analyzes volume for auto-scoring

  // Start recording a letter — NO machine audio, just microphone
  // Skip to the next word in the vocabulary game; once the words run out,
  // hand over to the stage and move to the next question.
  nextVocabWord(mi, dayIdx) {
    var m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (!m || !m.words) { this.nextStep(); return; }
    // v136：这个词没学完，就别想跳到下一个词 —— 页面上的按钮是灰的，
    // 这里再挡一道（旧缓存页面里的按钮、或程序化调用绕不过去）。
    if (this._vocabFootLocked(mi, dayIdx)) {
      this.showToast('先把这个词学完，再点下一个单词', 'warn');
      return;
    }
    if (this.state.vocabWordIdx >= m.words.length - 1) {
      // 最后一个词学完了 → 直接进下一屏。顺手把"学完了"记下来，
      // 万一孩子退回来，底部按钮不会又变成灰的。
      this.state.vocabDoneIdx = this.state.vocabWordIdx;
      this.nextStep();
      return;
    }
    // 拼读阶段（逐字母/音节）没读完、或还有字母没读对，都不放行 —— 双保险：
    // 按钮本身 disabled，这里再挡一道（防止旧缓存页面里的按钮、或程序化
    // 调用绕过去）。v93 起加了 allOk；v119 起再加 contDone（连起来读过一遍）。
    var sp0 = this._spell;
    if (!this.isTeacher() && sp0 && sp0.mi === mi) {
      if (!sp0.finished || sp0.allOk === false) {
        this.showToast('还有字母没读对，按住红色的格子再读一次', 'warn');
        return;
      }
      if (sp0.contDone !== true) {
        this.showToast('先把字母和单词连着读一遍，才能到下一个单词', 'warn');
        return;
      }
    }
    this.state.vocabDoneIdx = this.state.vocabWordIdx;   // v136：这个词学完了
    this.state.vocabWordIdx++;
    this.state.vocabStage = 0;
    this.state.vocabMi = mi;
    this._savePos(dayIdx);          // 点「下一个单词」立刻记位置（不用等做完）
    var el = document.getElementById('vocab-game-' + mi);
    if (el) el.innerHTML = this.renderVocabStage(m, mi, dayIdx);
    this._syncVocabFootLabel(mi, dayIdx);
  },

  // 词汇游戏底部那颗按钮该不该锁（v136）。
  //
  // "这个词学完了"有两条路都算数：
  //   ① 拼读那一屏：每个格子读对 + 整词 + 连起来读一遍（_spell 三个条件）
  //      —— 这是旧版本就在用的判据，保留；
  //   ② 这个词的所有阶段都走完了（vocabDoneIdx）。
  // 以前只有 ①，而 _spell 由 renderVocabStage 在每屏开头清成 null、只有在
  // 拼读屏才重新赋值 —— 「看图选词」「选释义」两屏的底部按钮等于没门，
  // 孩子一张图都不用点就能一路「下一个单词」点到头，整个词汇模块被跳过去
  // （家长 2026-10-17：「题没做完，下一题又能开始做了」）。
  _vocabFootLocked(mi, dayIdx) {
    // v138：老师预览也照锁 —— 预览要验的就是"能不能不做就往前走"。
    // 老师真想快进，用底部那颗明说的「跳过本题（老师）」。
    var m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (!m || !m.words) return false;
    var wIdx = this.state.vocabWordIdx;
    if (wIdx >= m.words.length) return false;              // 全学完的完成页
    var sp = this._spell;
    if (sp && sp.mi === mi && sp.finished && sp.allOk !== false && sp.contDone === true) {
      return false;                                        // 拼读这一关过了
    }
    if (this.state.vocabDoneIdx >= wIdx) return false;      // 这个词已经学完
    return true;
  },

  // Last word in the game? Then the button really is 下一题.
  _syncVocabFootLabel(mi, dayIdx) {
    var m = HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    var btn = document.getElementById('stage-next-' + mi);
    if (!m || !m.words || !btn) return;
    var last = this.state.vocabWordIdx >= m.words.length - 1;
    btn.textContent = last ? '下一题' : '下一个单词';
    // v93：全部字母读对；v119：连起来读通过；v136：当前这个词整个学完。
    // 老师预览不锁。_finishSpell / nextVocabStage 完成后都会再调到这里。
    btn.disabled = this._vocabFootLocked(mi, dayIdx);
  },

  // Every word picture is a play button. Children reach for the picture, not
  // for a separate speaker icon next to it.
  _wordImage(word, big) {
    var w = String(word.word || '').replace(/'/g, "\\'");
    return '<div class="vocab-emoji-card tap-speak"'
         + (big ? ' style="width:100px;height:100px;font-size:52px"' : '')
         + ' onclick="App.speak(\'' + w + '\')" title="点一下听发音"'
         + ' role="button" aria-label="听 ' + w + ' 的发音">'
         + word.emoji + '<span class="tap-speak-badge"><svg class="icon icon-sm"><use href="#i-sound"/></svg></span></div>';
  },

  // Punctuation ends a sentence. Abbreviations would trip this up, but the
  // passages are graded readers — plain sentences, no "Dr." or "e.g.".
  _splitSentences(text) {
    // v135 两处修正（都来自真实课文的踩坑）：
    // ① 引号结尾："…colour." Amy wants…" —— 句号在引号**里面**，
    //    原来的 lookbehind（只认 [.!?]）在引号后切不开，两句粘成一句，
    //    中英句数永远对不上（WEEK2 周六撞过）。lookbehind 放宽到 [.!?]["']?。
    // ② 缩写点："His science teacher, Mr. Brown, encourages…" —— "Mr." 的点
    //    被当成句号，一句劈成两句（WEEK1 周三撞过）。切完之后把以缩写结尾的
    //    碎片并回前一段。
    const parts = String(text || '')
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?]["']?)\s+(?=[A-Z0-9"“'])/)
      .map(function(x) { return x.trim(); })
      .filter(function(x) { return x.length > 1; });
    // \b 必须有：否则 "coast." 尾部的 "st" 会被当成缩写 "St."（大小写不敏感），
    // 一整句并进前一句 —— 第一版就栽在这里。
    const ABBR = /(?:\b(?:Mr|Mrs|Ms|Dr|St|Prof|Sr|Jr|vs|etc))\.?$/i;
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      if (out.length && ABBR.test(out[out.length - 1])) {
        out[out.length - 1] += ' ' + parts[i];
      } else {
        out.push(parts[i]);
      }
    }
    return out;
  },

  // ===== 完形填空的空位（v126）===========================================
  //
  // 完形填空的题干是 "4___" 这种编号，孩子要听的是**它所在的那句课文**。
  // 麻烦在于同一句里可能挖了好几个空（今天的 "You 4___ take care of it, and
  // it will make you 5___."），以前把空读作 blank，孩子听到的是
  // "You blank take care of it... blank" —— 完全不成句，也不知道该填哪儿。
  //
  // 现在统一：找到这个空所在的句子，把**这一句里所有的空**都用它们的正确
  // 答案填好，朗读的是填满后的完整句子。孩子听到的就是一句正常的话。
  // 空位编号本身的空（"4___" 里那个 4）不单独念。
  _clozeAnswerOf(q) {
    if (!q) return '';
    if (q.options && typeof q.answer === 'number' && q.options[q.answer] != null) {
      return String(q.options[q.answer]).trim();
    }
    if (q.answer != null && typeof q.answer === 'string') return q.answer.trim();
    return '';
  },

  // 题干 "4___" / "___" / "3 ____" 里那个空位标记（含前面的编号），
  // 以及它前面紧挨着的数字（"4" + "___"），用于在课文里定位。
  _clozeMarker(q) {
    const m = String((q && q.question) || '').match(/(\d*)\s*(_{2,})/);
    if (!m) return null;
    return { full: m[0], num: m[1] || '', blanks: m[2] };
  },

  // 一个模块里所有的空位，按它们在 passage 里出现的先后排好，带上各自的
  // 正确答案。返回 [{ num, raw, answer, qIdx }]。raw 是课文里那一小段标记
  // （"4___"），用于 replace。
  _clozeBlanks(m) {
    if (!m || m.type !== 'cloze' || !Array.isArray(m.questions)) return [];
    const self = this;
    const out = [];
    m.questions.forEach(function(q, qi) {
      const mk = self._clozeMarker(q);
      if (!mk) return;
      out.push({ num: mk.num, raw: mk.full, answer: self._clozeAnswerOf(q), qIdx: qi });
    });
    return out;
  },

  // 这句课文里都有哪些空（按下标比对，比字符串匹配稳）。
  _clozeSentenceOf(m, q) {
    const mk = this._clozeMarker(q);
    if (!mk || !m || !m.passage) return null;
    const sents = this._splitSentences(m.passage);
    // 先按「这句话里含有这个空位标记」找；找不到再用编号回退匹配。
    let hit = sents.filter(function(s) { return s.indexOf(mk.full) >= 0; })[0];
    if (!hit && mk.num) {
      hit = sents.filter(function(s) {
        return new RegExp('\\b' + mk.num + '\\s*_{2,}').test(s);
      })[0];
    }
    return hit || null;
  },

  // 把一句话里**所有的空**都填上正确答案，得到可以直接朗读 / 显示的完整句。
  // 已经答过的空用孩子当时的答案（对错都算，错题回顾才看得到他写了什么）；
  // 没答过的用正确答案 —— 示范朗读要读对的。
  _clozeFillSentence(m, sentence, preferPicked) {
    if (!sentence) return '';
    const blanks = this._clozeBlanks(m);
    let s = sentence;
    for (const b of blanks) {
      if (s.indexOf(b.raw) < 0) continue;
      let fill = b.answer;
      if (preferPicked) {
        const picked = this._pickedClozeAnswer(m, b);
        if (picked) fill = picked;
      }
      if (!fill) continue;
      s = s.replace(b.raw, fill);
    }
    // 兜底：还有没填上的空（数据里标记写法和题干对不上），一律抹掉那个
    // 编号+下划线，别留下 "4___" 或者 "blank" 给孩子听。
    s = s.replace(/\d*\s*_{2,}/g, ' ');
    return s.replace(/\s+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
  },

  // 孩子在这道空上选过什么（答对答错都返回），没有就返回空串。
  _pickedClozeAnswer(m, b) {
    try {
      const mi = this.state.currentModuleIdx;
      const rec = this.state.answers && this.state.answers[this.state.currentDay]
                && this.state.answers[this.state.currentDay][mi];
      if (!rec) return '';
      const a = rec[b.qIdx];
      if (!a || a.picked == null) return '';
      if (m.questions[b.qIdx].options) {
        const o = m.questions[b.qIdx].options[a.picked];
        return o == null ? '' : String(o).trim();
      }
      return String(a.picked).trim();
    } catch (e) { return ''; }
  },

  // 把完形填空的题目按"所在课文句子"分组（v126）。同一句里的多个空
  // 归成一组，孩子一屏做完：这是今天第 4、5 空同句的根治办法。
  // 找不到所在句的题各自成一组，保证一题都不会漏。
  _clozeQuestionGroups(m) {
    if (!m || m.type !== 'cloze' || !Array.isArray(m.questions)) return [];
    const self = this;
    const groups = [];
    const bySentence = {};
    m.questions.forEach(function(q, qi) {
      const sent = self._clozeSentenceOf(m, q);
      const key = sent || ('__solo_' + qi);
      if (!bySentence[key]) { bySentence[key] = []; groups.push(bySentence[key]); }
      bySentence[key].push(qi);
    });
    return groups;
  },

  // Pair each English sentence with its Chinese counterpart — but only when
  // the two really line up. Across the current passages 4 of 5 match; one has
  // 8 English sentences against 7 Chinese, because a translator merged two.
  // Pairing by index there would show the wrong reference answer, which is
  // worse than showing none, so that passage keeps whole-passage translation.
  _pairSentences(m) {
    if (!m || !m.passage || !m.passage_cn) return null;
    const en = this._splitSentences(m.passage);
    let cn = String(m.passage_cn).replace(/\s+/g, '')
      .split(/(?<=[。！？])/).map(function (x) { return x.trim(); })
      .filter(function (x) { return x.length > 1; });
    // v135：中文句数多于英文时，先把"说话尾缀"并回前一句再比。
    // 英文把引语和说话人写在同一句 —— "Dolphins!" she shouted. ——
    // 中文按标点切却是「海豚！」「她喊道。」两段，句数永远对不上，
    // 整篇就退化成"一口气翻全文"（老师原话：学生会有压力）。
    // 尾缀的特征：≤8 个字、以 说/喊/问/答/叫/笑/叹/道 类动词收尾，
    // 短到不像一句独立的话（WEEK3 周六撞过）。
    if (en.length && cn.length > en.length) {
      const merged = [];
      for (let i = 0; i < cn.length; i++) {
        const f = cn[i];
        if (merged.length && f.length <= 8 && /(说|喊|问|答|叫|笑|叹|道)[。！？]?$/.test(f)) {
          merged[merged.length - 1] += f;
        } else {
          merged.push(f);
        }
      }
      cn = merged;
    }
    if (!en.length || en.length !== cn.length) return null;
    return en.map(function (e, i) { return { en: e, cn: cn[i] }; });
  },

  // ===== Reading: translate a sentence aloud =====
  renderTranslateStep(m, mi, si, dayIdx) {
    const pairs = this._pairSentences(m);
    const pair = pairs && pairs[si];
    if (!pair) return '<div class="card text-center text-sub">这篇课文暂不支持逐句翻译</div>';
    Recorder.warmUp(); Api.warmup();

    let html = '<div class="sent-step hold-zone">';
    html += '<div class="sent-progress">翻译 ' + (si + 1) + ' / ' + pairs.length + ' 句</div>';
    // 同阅读逐句：词可点（查意思），整句听英文改由下面的按钮承担。
    html += '<div class="sent-text sent-words">' + this._wordSpans(pair.en) + '</div>';
    html += '<div class="sent-tip">👆 点单词看中文意思 · 点下面听整句英文</div>';
    html += '<div class="sent-listen">'
         + this._gateListenHtml(this._gid('trsg', mi, si), pair.en, '🔊 听整句英文') + '</div>';
    html += '<div class="sent-hint">先点上面「听整句英文」，再用中文说出这句话的意思</div>';
    // v137：先说中文也得先听英文。家长 2026-10-17：「按住说中文的时候，
    // 之前是要点一下英文听完，然后去说中文，现在不点也能直接说」——
    // 这一屏的听入口有 data-gate，但"按住说中文"这颗按钮一直没挂门，
    // 于是孩子可以跳过听力直接把中文蒙一遍。现在挂同一个 gid：
    // 听完那句英文（_gateUnlock）按钮才摘锁，没听就按住会被 _gateNudge
    // 拦下来，并闪一下上面那颗「听整句英文」。
    html += '<button class="word-read-btn hold-target gate-locked" id="trs-btn-' + mi + '-' + si + '"'
         + ' data-gate="' + this._gid('trsg', mi, si) + '"'
         + ' data-nudge="🔊 先听一遍这句英文，再用中文说意思"'
         + ' onpointerdown="App._translateSentence(event,' + mi + ',' + si + ')"'
         + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
         + ' oncontextmenu="return false">按住说中文</button>';
    html += '<div id="trs-status-' + mi + '-' + si + '"></div>';
    html += '<div id="trs-result-' + mi + '-' + si + '"></div>';
    html += '</div>';
    return html;
  },

  _translateSentence(ev, mi, si) {
    const self = this;
    const m = HOMEWORK_DATA[this.state.currentDay].modules[mi];
    const pair = (this._pairSentences(m) || [])[si];
    if (!pair) return;
    const btn = document.getElementById('trs-btn-' + mi + '-' + si);
    const status = document.getElementById('trs-status-' + mi + '-' + si);
    if (btn) btn.classList.add('reading');

    this._holdStart(ev, 'trs-' + mi + '-' + si, '这句的意思', status, function (out, text) {
      // 孩子说的是中文 —— 必须用多语种模型识别
      if (btn) btn.classList.remove('reading');
      if (!out) return;
      const heard = text ? self._toSimplified(text) : '';
      // v139：出声了就算数。识别端没回话（晚高峰吐空）不再让孩子重说。
      self._micNote(out, 'v148');
      const voiceOk = !heard && self._judgeSilence(out).voiceOk;
      const r = self.scoreTranslation(pair.cn, heard);

      let html = '<div class="spell-summary">';
      html += '<div class="ss-head"><span class="ss-score">'
           + (heard ? r.score : (voiceOk ? '✓' : '—')) + '</span>'
           + '<span class="ss-label">' + (heard ? '意思覆盖 ' + r.covered + '/' + r.total + ' 字'
                                                : (voiceOk ? self.VOICE_PASS_LABEL
                                                           : '这次没录到声音，再说一次')) + '</span></div>';
      if (heard) {
        html += '<div class="tr-block"><div class="tr-label">你说的</div>'
             + '<div class="tr-text">' + heard + '</div></div>';
        html += '<div class="tr-block"><div class="tr-label">参考答案</div>'
             + '<div class="tr-text ref">' + pair.cn + '</div></div>';
      }
      if (out.samples) {
        const joined = Recorder.join([out.samples], 0);
        if (joined) html += '<audio controls src="' + URL.createObjectURL(joined.blob)
                         + '" style="width:100%;max-width:280px;height:32px"></audio>';
      }
      html += '</div>';
      const slot = document.getElementById('trs-result-' + mi + '-' + si);
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      const passed = heard ? self._gateStep(r.score, true)
                           : (voiceOk ? self._gateStep(self.TRANS_PASS, true) : false);
      if (slot && !passed) slot.insertAdjacentHTML('beforeend', self._retryHint(false, false));

      if (heard) {
        Api.submitSpeakingScore({
          studentId: self._myStudentId(), dayIdx: self.state.currentDay,
          moduleIdx: mi, itemIdx: si, round: 1, type: 'translate-sentence',
          label: pair.en, score: r.score, spoken: heard, source: 'asr',
        });
      }
    }, true, 'zh');
  },

  // A step is cleared only when the child actually got it. Below the mark
  // they are asked to try again instead of being able to click past it.
  PASS_SCORE: 60,

  // ===== v139：本地"到底有没有出声"判定 ===================================
  //
  // 家长 2026-10-17：「明明按住说得很清楚，他偏说没听清，孩子要重复四五遍」。
  //
  // 根子在**把"识别端没回话"当成了"孩子没读"**。识别端（阿里云/whisper）在
  // 晚高峰会偶发吐空 —— 音频完整传上去了，模型一个字都没产出。以前这个空结果
  // 被当成"没过"，孩子只能一遍遍重读，可他明明每遍都读对了。这就是最伤兴趣
  // 的那件事：不是他不行，是系统听不见。
  //
  // 现在多一把尺子：录音本身在本地就有波形，可以直接量"这一段里有没有人声、
  // 有多长"。只要量到确实出了声，就绝不判他重来 —— 该给的分给分，该放的行
  // 放行，录音留给老师听。真正没出声（误触、麦克风没开）才提示再来一次。
  //
  // 阈值取的是"有人声"的量级：麦克风开了 AGC，正常说话峰值 0.1~0.5，
  // 安静房间底噪在 0.01 上下。v143 把门槛从 0.02/0.2 秒抬到 0.05/0.35 秒，
  // 并要求"有声帧占一定比例"—— 家长 2026-10-19：「孩子什么都没做，只是偷了
  // 个懒」也能过。以前一声咳嗽、一阵风声（0.2 秒超过 0.02）就算读过。
  VOICE_MIN_PEAK: 0.05,
  VOICE_MIN_SEC: 0.35,
  // 有声帧至少占全段这么一点。零星咔嗒声占比极低，正常说话远高于它。
  //
  // v147（家长 2026-10-20）：原来卡 18%，手机上误杀太多 —— 手机麦克风增益
  // 差异极大，华为/UC 里同一句话的峰值可能只有 0.06～0.09，落在阈值之上
  // 的帧本来就少，加上起手那几百毫秒没录到（v147 之前的真问题），占比一算
  // 就掉到 10% 以下，孩子读得再对也被判"没录到声音"。现在只降到 8%：
  // 仍能挡住"一下咔嗒声 + 长静音"，但正常朗读不会再被冤枉。
  VOICE_MIN_RATIO: 0.08,

  // minSec：这一段至少要"真出声"多久。整句跟读按词数算（见 _minVoiceSec），
  // 单词朗读给固定的小值。不传就用默认 0.45 秒。
  //
  // v148（家长 2026-10-20：红米 note 9 5G 特别容易判"没录到声音"）：
  // 有些机型（千元机居多）会把 AudioContext 要的 16k 直接降成 8k —— 4kHz 以上
  // 的频带全丢，孩子读的 /s/ /f/ /θ/ 全靠那一段，能量整体小一截，于是同一句
  // 在小米 11/13 上能过、在红米上过不了。录音器现在会量出这段的"体质"
  // （out.health.lowRate），**只在设备确实降采样时才放宽**，不搞全局降标准。
  _voiceOk(out, minSec) {
    if (!out) return false;
    const need = (typeof minSec === 'number' && minSec > 0) ? minSec : this.VOICE_MIN_SEC;
    const health = out.health || null;
    const lowRate = !!(health && health.lowRate);
    // 削波（波形顶到天花板）的录音峰值恒为 ~1、且大量采样都"够响"，
    // 但它恰恰是最脏的一段 —— 不能因为响就放行，反而要更严。
    const th = lowRate ? this.VOICE_MIN_PEAK * 0.5 : this.VOICE_MIN_PEAK;
    const ratioNeed = lowRate ? this.VOICE_MIN_RATIO * 0.6 : this.VOICE_MIN_RATIO;
    const s = out.samples;
    if (s && s.length) {
      let peak = 0, voiced = 0;
      for (let i = 0; i < s.length; i++) {
        const v = s[i] < 0 ? -s[i] : s[i];
        if (v > peak) peak = v;
        if (v > th) voiced++;
      }
      if (peak < th || !voiced) return false;
      if (voiced / s.length < ratioNeed) return false;   // 太稀疏 → 不是说话
      return voiced / (Recorder.TARGET_RATE || 16000) >= need;
    }
    // 只留了 meta 的路径（片段已经被收走）：退化成 peak + 时长两个数。
    const peak = Number(out.peak) || 0;
    const dur = Number(out.duration) || 0;
    return peak >= th && dur >= need;
  },

  // 一整句要读多久才算"读过了"？0.16 秒/词，夹在 0.5~2.5 秒之间。
  // 孩子整句读下来通常远超这个数；随便哼一声远不到。
  _minVoiceSec(sentence) {
    const words = (this._tokens ? this._tokens(String(sentence || '')) : []).length || 1;
    return Math.max(0.5, Math.min(2.5, 0.16 * words));
  },

  // 整句跟读/口语那两条路只在 _spClipSamples / _spClipMeta 里留着这一段。
  _lastClipVoiceOk(minSec) {
    if (this._spClipSamples && this._spClipSamples.length) {
      return this._voiceOk({ samples: this._spClipSamples, peak: (this._spClipMeta || {}).peak }, minSec);
    }
    const meta = this._spClipMeta || {};
    return this._voiceOk({ peak: meta.peak, duration: meta.duration, health: meta.health }, minSec);
  },

  // 出声了但识别端没给文本 —— 这一条统一的说法。**不再出现"没听清"。**
  VOICE_PASS_LABEL: '✅ 过（这段朗读已经存下来了）',

  // ==========================================================================
  // v148：录音"体质"上报 + 兜底判定的共享逻辑
  // ==========================================================================
  //
  // 家长 2026-10-20 的原话值得抄在这里，因为它定义了什么叫"修好了"：
  //   「说改了，结果还是没有太大的改善，我很生气！…孩子已经很用心在读了，
  //     每字每句都在卡着，然后过不去。并且有时候录出来的声音是很渣的、
  //     很嘈杂的，这是为什么？」
  //
  // 前几版治的是"门槛"，这一版治的是**设备**：红米 note 9 5G 这一档机器会把
  // 16k 采样降成 8k、会掉帧、会削波。这三个都能从样本里量出来（recorder.js
  // 的 _micHealth），量出来之后就有两件事可做：
  //
  //   ① 判定用设备自己的基准，而不是全系统一把尺（见 _voiceOk 的 lowRate 分支）；
  //   ② 确实录到人声就放行，不再让孩子为"识别端空手"重读 —— 这一条以前只散落
  //      在各个页面里各写一遍，现在收成一个函数，谁漏了都看得见。
  //
  // 顺带把每次录音的体质记进 Api.perfEnd，以后家长再说"就这个手机有问题"，
  // 直接查后台就知道是 8k 还是削波，不用再猜。

  // 这一段的设备是否"先天吃亏"（降采样）。
  _micLowRate(out) {
    return !!(out && out.health && out.health.lowRate);
  },

  // 削波严重：波形顶到天花板。这种录音"听着响"，其实是最脏的一段 ——
  // 识别模型在这种波形上最容易吐空。提示孩子离远一点比让他重读有用。
  _micClipping(out) {
    return !!(out && out.health && out.health.clipRatio > 0.02);
  },

  // 录完一按的统一体检：把体质记进性能样本（只记数值，不记内容）。
  _micNote(out, where) {
    if (!out || !out.health) return;
    try {
      Api.perfEnd({
        kind: 'mic',
        at: where || '',
        rate: out.health.srcRate,
        clip: Math.round(out.health.clipRatio * 1000) / 1000,
        drop: out.health.dropouts,
        voiced: Math.round(out.health.voicedRatio * 100),
      });
    } catch (e) {}
  },

  // 削波时的提示语：不说"你没读清"，说"设备这边太响了"。
  _clipHintHtml() {
    return '<div class="rf-tip">🎤 这次录音有点"爆音"（离嘴太近了），稍微离远一点点再读，会更清楚。</div>';
  },

  // --------------------------------------------------------------------------
  // 唯一一个"要不要判孩子重读"的出口。
  //
  // 以前每个页面各写一行 `const voiceOk = !text && self._voiceOk(out)`，
  // 于是一个页面补了兜底、另一个页面忘了补，家长就会觉得"这里好了那里没好"。
  // 现在全部走这一个函数，判定口径只有一处：
  //
  //   · 有识别文本          → 交给逐词打分（不在这里管）
  //   · 没文本，但确实有人声 → **放行**（孩子读得对不对不该由识别端的空结果决定）
  //   · 没文本，也没人声     → 才让孩子重读
  //
  // 第三档才允许提示"再读一次"，而且提示语要说清是"没听到声音"而不是
  // "你没读清" —— 家长最生气的就是被系统倒打一耙。
  _judgeSilence(out, minSec) {
    const heard = this._voiceOk(out, minSec);
    return {
      voiceOk: heard,
      clipping: heard && this._micClipping(out),
      lowRate: this._micLowRate(out),
    };
  },

  // 翻译三档（v126，家长定的松紧）：
  //   ≥60        过（跟阅读理解同一把尺）
  //   40 ~ 59    「错得不多」→ 把中文原文亮出来给他自己对照，仍然放行
  //   < 40       「出入太大」→ 必须重说一遍，不放行
  TRANS_PASS: 60,
  TRANS_SOFT: 40,

  // ===== 完形填空逐句翻译（v126）========================================
  //
  // 家长原话：「所有句子主读完了之后，要翻译每个句子……就像之前做阅读理解
  // 一样，每个句子点出来去翻译，然后每个句子的单词可以点一下出来中文意思，
  // 让学生自己先翻译。如果他翻译错了，就出来听力，就出来翻译的原文。错的
  // 不多的话，就错放过。如果错的太多，出入太大的话，就要重新读。」
  //
  // 完形填空的课文本身**没有** passage_cn（不像阅读理解是一句一句配好的
  // 中文），所以这里不能用 _pairSentences 那套。参考译文来自题目自带的
  // explanation_cn 汇总，或者模块上的 passage_cn（如果某天补上了）。
  renderClozeTransStep(m, mi, si, dayIdx) {
    const sents = this._splitSentences(m.passage);
    const sent = sents[si] || '';
    Recorder.warmUp(); Api.warmup();

    let html = '<div class="sent-step hold-zone">';
    html += '<div class="sent-progress">翻译 ' + (si + 1) + ' / ' + sents.length + ' 句</div>';
    // 空位在这句里 → 显示填好正确答案的完整句，孩子翻译的是完整的一句话。
    const shown = this._clozeFillSentence(m, sent, false) || sent;
    html += '<div class="sent-text sent-words">' + this._wordSpans(shown) + '</div>';
    html += '<div class="sent-tip">👆 点单词看中文意思 · 点下面听整句英文</div>';
    html += '<div class="sent-listen">'
         + this._gateListenHtml(this._gid('cqtrsg', mi, si), shown, '🔊 听整句英文') + '</div>';
    html += '<div class="sent-hint">先听一遍英文，想一想这句是什么意思，再按住说中文</div>';
    // v137：同上，完形填空的逐句翻译也要"先听英文，再说中文"。
    html += '<button class="word-read-btn hold-target gate-locked" id="cqtrs-btn-' + mi + '-' + si + '"'
         + ' data-gate="' + this._gid('cqtrsg', mi, si) + '"'
         + ' data-nudge="🔊 先听一遍这句英文，再用中文说意思"'
         + ' onpointerdown="App._translateClozeSentence(event,' + mi + ',' + si + ')"'
         + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
         + ' oncontextmenu="return false">按住说中文</button>';
    html += '<div id="cqtrs-status-' + mi + '-' + si + '"></div>';
    html += '<div id="cqtrs-result-' + mi + '-' + si + '"></div>';
    html += '</div>';
    return html;
  },

  // 这句课文的参考中文。「弹原文」时用它。取不到就返回空串，此时只给
  // 分档提示、不亮参考译文。
  //
  // v127：完形填空的课文没有 passage_cn，唯一带中文的是题目上的
  // explanation_cn —— 而那是**解析**不是译文（"水很干净，人们能在里面钓鱼，
  // 用 catch（捕）。catch fish 意为捕鱼。"）。拿它当译文去和孩子说的中文做
  // LCS 比对，分数天然偏低，没挖空的句子更是**一个字都没有** → 孩子读得再
  // 清楚也判"出入太大"还被锁住（家长 2026-10-15 报的就是这个）。
  // 所以现在优先取数据里逐句写好的 CLOZE_SENTENCE_CN，解析只当最后兜底。
  _clozeSentenceRefCn(m, si, sentence) {
    if (!m) return '';
    // 1) 专为完形填空写的逐句译文（首选，教研口径，和 _splitSentences 对齐）
    const tbl = (typeof CLOZE_SENTENCE_CN !== 'undefined' && CLOZE_SENTENCE_CN)
      ? CLOZE_SENTENCE_CN[m.id] : null;
    if (tbl && tbl[si]) return tbl[si];
    // 2) 模块整体配了 passage_cn 且句数对得上 → 直接用这一句
    const pairs = this._pairSentences(m);
    if (pairs && pairs[si]) return pairs[si].cn;
    // 3) 这句里挖了空 → 用那个空的 explanation_cn（是解析，但总比没有强）
    const blanks = this._clozeBlanks(m).filter(function(b) {
      return sentence && sentence.indexOf(b.raw) >= 0;
    });
    if (blanks.length) {
      const q = m.questions[blanks[0].qIdx];
      if (q && q.explanation_cn) return q.explanation_cn;
    }
    // 4) 整篇 passage_cn 只有一句、句数对不上 → 当作整篇参考给出
    if (m.passage_cn && String(m.passage_cn).length) return String(m.passage_cn);
    return '';
  },

  _translateClozeSentence(ev, mi, si) {
    const self = this;
    const m = HOMEWORK_DATA[this.state.currentDay].modules[mi];
    const sents = this._splitSentences(m.passage);
    const raw = sents[si] || '';
    const shown = this._clozeFillSentence(m, raw, false) || raw;
    const refCn = this._clozeSentenceRefCn(m, si, raw);
    const btn = document.getElementById('cqtrs-btn-' + mi + '-' + si);
    const status = document.getElementById('cqtrs-status-' + mi + '-' + si);
    if (btn) btn.classList.add('reading');

    this._holdStart(ev, 'cqtrs-' + mi + '-' + si, '这句的意思', status, function(out, text) {
      if (btn) btn.classList.remove('reading');
      if (!out) return;
      const heard = text ? self._toSimplified(text) : '';
      const slot = document.getElementById('cqtrs-result-' + mi + '-' + si);
      // 没有参考译文就没法判分 —— 绝不能因此把孩子卡在"出入太大"里
      // （v127：家长报的"明明说得很清楚却判没听清、也没有下一题"就是
      //   这里的 refCn 为空导致的）。没参考 = 只要说了就算过。
      const canScore = !!refCn;
      // v139：确实出声了但识别端没回话 → 直接放行，不让孩子重说。
      self._micNote(out, 'v148');
      const voiceOk = !heard && self._judgeSilence(out).voiceOk;   // v148
      const r = canScore ? self.scoreTranslation(refCn, heard)
                         : { score: 0, covered: 0, total: 0 };
      const band = canScore ? self._transBand(heard ? r.score : 0, !!heard)
                            : (heard ? 'pass' : 'retry');

      let html = '<div class="spell-summary">';
      if (canScore) {
        html += '<div class="ss-head"><span class="ss-score">'
             + (heard ? r.score : (voiceOk ? '✓' : '—')) + '</span>'
             + '<span class="ss-label">'
             + (voiceOk ? self.VOICE_PASS_LABEL : self._transBandLabel(band, r)) + '</span></div>';
      } else {
        html += '<div class="ss-head"><span class="ss-score">'
             + ((heard || voiceOk) ? '✓' : '—') + '</span>'
             + '<span class="ss-label">'
             + ((heard || voiceOk) ? '说得不错，继续下一句' : '这次没录到声音，再说一次') + '</span></div>';
      }
      if (heard) {
        html += '<div class="tr-block"><div class="tr-label">你说的</div>'
             + '<div class="tr-text">' + heard + '</div></div>';
      }
      // 小错 / 大错都亮原文 —— 家长："翻译错了，就出来翻译的原文"
      if (canScore && band !== 'pass' && refCn) {
        html += '<div class="tr-block"><div class="tr-label">' + (band === 'soft' ? '参考答案' : '原文（照着说一遍）')
             + '</div><div class="tr-text ref">' + refCn + '</div></div>';
      }
      if (out.samples) {
        const joined = Recorder.join([out.samples], 0);
        if (joined) html += '<audio controls src="' + URL.createObjectURL(joined.blob)
                         + '" style="width:100%;max-width:280px;height:32px"></audio>';
      }
      html += '</div>';
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      // 只有"出入太大"才锁住不放行，并让他照着原文再说一遍。
      // v139：识别端没回话但确实出了声 → 放行，不重说。
      const passed = voiceOk ? true : (!canScore ? !!heard : (band !== 'hard'));
      if (!passed && slot) {
        slot.insertAdjacentHTML('beforeend',
          heard ? self._retryHint(false, true) : self._retryHint(false, false));
      }
      // 放行时给满档分数解锁底部「下一句」；不放行时明确锁住。
      self._gateStep(passed ? self.TRANS_PASS : 0, passed);

      if (canScore) {
        Api.submitSpeakingScore({
          studentId: self._myStudentId(), dayIdx: self.state.currentDay,
          moduleIdx: mi, itemIdx: si, round: 1, type: 'translate-sentence',
          label: shown, score: r.score, spoken: heard, source: 'asr',
        });
      }
    }, true, 'zh');
  },

  // 没听清也算"要重来"，但不叫"错"（识别问题不该算孩子的账）。
  _transBand(score, hasSpeech) {
    if (!hasSpeech) return 'hard';
    if (score >= this.TRANS_PASS) return 'pass';
    if (score >= this.TRANS_SOFT) return 'soft';
    return 'hard';
  },

  _transBandLabel(band, r) {
    if (band === 'pass') return '意思对上了（覆盖 ' + r.covered + '/' + r.total + ' 字）';
    if (band === 'soft') return '意思差一点（覆盖 ' + r.covered + '/' + r.total + ' 字）· 对一下参考答案';
    // v139：这里原来写的是"没听清"。既然确实没录到声音，就说清楚是没录到 ——
    // 家长明确要求这句别再出现，孩子看到"没听清"只会以为是自己读错了。
    return r.total ? '出入太大，照着原文再说一遍' : '这次没录到声音，再说一次';
  },

  _gateStep(score, hasSpeech) {
    const next = document.getElementById('stage-next-btn');
    const passed = !!hasSpeech && score >= this.PASS_SCORE;
    if (next) {
      next.disabled = !passed;
      next.classList.toggle('nudge', passed);
    }
    return passed;
  },

  _retryHint(passed, hasSpeech) {
    if (passed) return '';
    return '<div class="retry-hint">'
         + (hasSpeech ? '没到 ' + this.PASS_SCORE + ' 分，请重试' : '这次没录到声音，再按住说一遍')
         + '</div>';
  },

  // Steps that must be passed start with the forward button disabled.
  _applyStepLock() {
    // v138：老师预览也照锁。v136 曾给老师开个"免锁"口子（想让老师能一路翻着
    // 看题），结果家长在预览里看到的就是"我还没做题呢，下一题已经可以点了"
    // —— 预览不照学生规矩来，就验不出学生那边的问题。老师现在改用下面那颗
    // 「跳过本题（老师）」走，锁本身对学生、老师一视同仁。
    if (!this._lockNextOnRender) return;
    this._lockNextOnRender = false;
    const next = document.getElementById('stage-next-btn');
    if (next) { next.disabled = true; next.classList.remove('nudge'); }
  },

  // ===== 门禁（v138）======================================================
  //
  // 家长 2026-10-17：「今天的 AI 口语练习，我还没做题呢，下一题就已经出现了，
  // 已经可以点选了。这个还没有改，赶紧改。」
  //
  // 屏幕上的按钮是不是灰的，只是**表现**；真正的判据要能离开 DOM 单独回答
  // "这一屏到底做完没有"。以前没有这个判据，于是：
  //   · 任何一处 `next.disabled = false`（上一屏跟读通过的回调、晚到的
  //     上传/打分、别的题型收尾）都能把**当前这一屏**点亮；
  //   · 老师端预览干脆完全不锁，看到的就是"没做题也能点"。
  // 下面两个函数把判据立起来，nextStep() 只认它们，不认按钮长什么样。

  // 这一屏是不是正属于这道题。晚到的异步回调（上一题的打分、纠错、上传）
  // 只该点亮它自己的那一屏，绝不能去点亮孩子正看着的另一题。
  _stepBelongsTo(mi, qi) {
    const steps = this._buildSteps(this.state.currentDay);
    const st = steps[this.state.stepIdx];
    if (!st) return false;
    if (mi !== undefined && mi !== null && st.mi !== mi) return false;
    if (qi !== undefined && qi !== null && st.qi !== qi) return false;
    return true;
  },

  // 口语这一题做完了没有：选对答案 + 整句跟读通过，缺一不可。
  // 只认状态（_spPassed），不看按钮 —— 按钮被谁点亮都不算数。
  _speakingGateOpen(mi, qi, dayIdx) {
    const k = (dayIdx === undefined ? this.state.currentDay : dayIdx) + '-' + mi + '-' + qi;
    return !!(this._spPassed && this._spPassed[k]);
  },

  // 当前这一屏的"能不能翻页"，纯状态判断（不看 DOM）。
  // 目前只有口语有独立判据；其余题型的判据仍由各自的 DOM 锁 + nextStep
  // 里的 disabled 检查兜着（v136 起已在 215 屏上逐屏验过）。
  _stepGateOpen(step, dayIdx) {
    if (!step) return true;
    if (step.kind === 'speaking') return this._speakingGateOpen(step.mi, step.qi, dayIdx);
    return true;
  },

  // ===== 完形填空：一句里的空一起做完（v126）============================
  //
  // 家长原话：「完形填空今天的第四空和第五空是同一个句子，挖了两个空。
  // 也就是说，在做题的时候，一次性把 4 和 5 一次性在选择里头做完，以至于
  // 后面他跟着系统读的时候，系统不会再说 4 blank 或者 5 blank，而是一起
  // 会把这个 blank 的空词给真正的写出来，成为一个完整的句子。」
  //
  // 这一屏做的就是这个：上面是被挖空的那句话（没有空的那部分照原样显示，
  // 空的位置显示成带编号的槽位），下面每一行是一个空 + 它的 ABCD。孩子
  // 一次性把这一句里所有空都选对，然后跟读**填满后的完整句子**。
  //
  // 和单题模式共用同一套判分/跟读积木（_renderHoldReadPanel /
  // _buildReadSentence / selectAnswer 的判定逻辑），所以对错反馈、跟读
  // ≥60 分门槛、错题上报全部一致。
  renderClozeGroupStep(m, mi, qis, dayIdx) {
    Recorder.warmUp(); Api.warmup();
    const g = qis || [m.questions.map(function(_, i) { return i; })];
    const list = Array.isArray(g) ? qis : [qis];
    const firstQ = m.questions[list[0]];
    const sent = this._clozeSentenceOf(m, firstQ) || '';
    const numLabel = list.map(function(i) { return (i + 1); }).join('、');

    let html = '<div class="cloze-group">';
    html += '<div class="sent-progress">第 ' + numLabel + ' 空 · 同一句话一起做完</div>';

    // 句子本体：空的位置换成槽位（显示编号），其余部分可点（查词）。
    html += '<div class="cq-sentence sent-words">'
         + this._clozeSentenceHtml(m, sent) + '</div>';
    html += '<div class="sent-tip">👆 点单词看中文意思 · 下面每个空都选好再读整句</div>';

    // 每个空一小组：标签 + 四个选项。选对了就锁住这一组。
    list.forEach(function(qi) {
      const q = m.questions[qi];
      const solved = this._questionSolved(mi, qi, dayIdx);
      html += '<div class="cq-blank" id="cq-b-' + mi + '-' + qi + '">';
      html += '<div class="cq-blank-num">第 ' + (qi + 1) + ' 空</div>';
      html += '<div class="q-options cq-options" id="qo-' + mi + '-' + qi + '"'
           + (solved ? ' style="pointer-events:none"' : '') + '>';
      (q.options || []).forEach(function(o, oi) {
        const cls = solved && oi === q.answer ? ' correct' : '';
        html += '<div class="q-option' + cls + '"'
             + (solved ? ' style="pointer-events:none"' : '')
             + ' onclick="App.selectClozeBlank(' + mi + ',' + qi + ',' + oi + ',' + dayIdx + ')">'
             + String.fromCharCode(65 + oi) + '. ' + o + '</div>';
      });
      html += '</div>';
      html += '<div class="q-answer" id="ans-' + mi + '-' + qi + '" style="display:none"></div>';
      html += '<div class="q-explanation" id="exp-' + mi + '-' + qi + '"><div class="cn">'
           + (q.explanation_cn || '') + '</div></div>';
      html += '</div>';
    }, this);

    // 跟读区：整组共用一个 —— 读的是**填满所有空之后的完整句子**。
    // 所有空都选对了才把跟读面板端出来。
    const allSolved = list.every(qi => this._questionSolved(mi, qi, dayIdx));
    html += '<div id="cq-follow-' + mi + '-' + list[0] + '" class="qr-follow"></div>';
    if (allSolved) {
      html += '<div id="cq-ready-' + mi + '-' + list[0] + '" style="display:none"></div>';
    }
    html += '</div>';
    return html;
  },

  // 一句话的展示版：空位换成槽位标签，旁边保留编号，其余按可点单词渲染。
  _clozeSentenceHtml(m, sentence) {
    if (!sentence) return '';
    // 先把每个空替换成一个占位符，再把剩下的文字交给 _wordSpans。
    const blanks = this._clozeBlanks(m);
    const PH = '\u0001';                     // 不可能出现在课文里的分隔符
    let s = sentence;
    const slots = [];
    for (const b of blanks) {
      if (s.indexOf(b.raw) < 0) continue;
      s = s.replace(b.raw, ' ' + PH + b.num + PH + ' ');
      slots.push(b.num);
    }
    // 还没对上标记的残留空位（数据写法不一）也一起收进槽位
    s = s.replace(/(\d*)\s*_{2,}/g, function(mm, n) {
      const num = n || '';
      slots.push(num);
      return ' ' + PH + num + PH + ' ';
    });
    const parts = s.split(PH);
    let out = '';
    parts.forEach(function(p, i) {
      if (i % 2 === 1) {
        out += '<span class="cq-slot">' + (p ? '第' + p + '空' : '＿＿') + '</span>';
      } else {
        out += this._wordSpans(p);
      }
    }, this);
    return out;
  },

  // 点一个空里的选项。判分逻辑和 selectAnswer 的学生分支完全一致：
  //   · 选错 → 只划掉他点的那个，给一句中文提示，不进跟读
  //   · 选对 → 亮绿 + 记分；**这一组全选对了**才端出跟读面板
  selectClozeBlank(mi, qi, oi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    const isCorrect = oi === q.answer;
    const ansEl = document.getElementById('ans-' + mi + '-' + qi);
    const opts = document.querySelectorAll('#qo-' + mi + '-' + qi + ' .q-option');

    if (this.isTeacher()) {
      this._recordAnswer(dayIdx, mi, qi, oi, isCorrect);
      opts.forEach((el, i) => {
        el.classList.remove('correct', 'wrong');
        el.style.pointerEvents = 'none';
        if (i === q.answer) el.classList.add('correct');
        if (i === oi && !isCorrect) el.classList.add('wrong');
      });
      if (ansEl) {
        ansEl.style.display = 'block';
        ansEl.innerHTML = isCorrect ? '✅ 正确！'
          : '❌ 错误。正确答案：' + String.fromCharCode(65 + q.answer);
      }
      if (!isCorrect) {
        const ex = document.getElementById('exp-' + mi + '-' + qi);
        if (ex) ex.classList.add('show');
      }
      return;
    }

    if (!isCorrect) {
      const attempt = this._wrongTryBump('q-' + mi + '-' + qi);
      opts.forEach((el, i) => {
        el.classList.remove('correct');
        if (i === oi || el.classList.contains('wrong')) {
          el.classList.add('wrong');
          el.style.pointerEvents = 'none';
        } else {
          el.style.pointerEvents = 'auto';
        }
      });
      if (ansEl) {
        this._showWrongHint(ansEl, this._wrongHintHtml({
          attempt: attempt, opts: q.options, answer: q.answer,
          correctText: (q.options && q.options[q.answer]) || '',
          picked: oi, clue3: q.explanation_cn,
          retryTip: '把这一句再听一遍，想想哪个词最合得上。',
        }));
      }
      this._playWrongSound();
      const pickedText = (q.options && q.options[oi] != null) ? String(q.options[oi]) : '';
      if (pickedText && this.state.audioEnabled) this.speak(pickedText);
      return;
    }

    // 选对
    this._stopCurrentAudio();
    this._playCorrectSound();
    this._wrongTryClear('q-' + mi + '-' + qi);
    opts.forEach((el, i) => {
      el.classList.remove('wrong');
      el.style.pointerEvents = 'none';
      if (i === q.answer) el.classList.add('correct');
    });
    if (ansEl) {
      ansEl.style.display = 'block';
      this._clearWrongHint(ansEl);
      ansEl.innerHTML = '✅ 选对了';
    }
    // 记下这一次的选择：跟读面板（和它内部走错的修复流程）收尾时会用它
    // 去 _recordAnswer —— 和普通选择题同一条路，别让跟读面板找不到这题。
    this._lastPick = this._lastPick || {};
    this._lastPick[mi + '-' + qi] = { oi: oi, isCorrect: true };
    this._recordAnswer(dayIdx, mi, qi, oi, true);

    // 这一组是不是全选完了？
    const group = (this._currentClozeGroup && this._currentClozeGroup.mi === mi)
      ? this._currentClozeGroup.qis : [qi];
    // v136：这里原来是 `every(function(x) { return this._questionSolved(...) })`
    // —— 普通 function 的 this 不是 App，一选中整组就抛 TypeError，
    // 后面"把跟读面板端出来"和"解锁下一题"两步全被跳过：孩子把整组空都
    // 选对了，界面却像没反应。箭头函数保住 this。
    const allSolved = group.every(x => this._questionSolved(mi, x, dayIdx));
    if (!allSolved) return;

    // 全选对了：把跟读面板端出来，读的是填满后的完整句子。
    const followEl = document.getElementById('cq-follow-' + mi + '-' + group[0]);
    const firstQ = m.questions[group[0]];
    const sentence = this._buildReadSentence(m, firstQ);
    if (followEl) this._renderHoldReadPanel(followEl, mi, group[0], dayIdx, sentence);
    // v136：整组选对只是**拿到跟读资格**，离"做完"还差跟读这一关。
    // 以前这里直接 next.disabled = false —— 孩子把 ABCD 选完、一个字没读，
    // 底部「下一题」就亮了（家长 2026-10-17：「题没做完，下一题又能开始做了」）。
    // 现在保持锁，等跟读面板打分通过时由 _gateStep 解锁。
    const next = document.getElementById('stage-next-btn');
    if (next) { next.disabled = true; next.classList.remove('nudge'); }
  },

  // ===== Reading: one sentence at a time =====
  // 一屏一句：上面是这句话（每个词都能点开看意思），中间一颗「听整句」，
  // 下面按住跟读。Deliberately no Chinese here — the child is listening and
  // imitating, not translating.
  renderSentenceStep(m, mi, si, dayIdx) {
    const sents = this._splitSentences(m.passage);
    const sent = sents[si] || '';
    Recorder.warmUp(); Api.warmup();

    // 听与读拆成两件事（v109，家长反馈："点单词就能够出现单词的意思，
    // 这个界面里点单词是不行的，因为一点就是整个句子的发音"）：
    //   · 句子本体 = 一串可点的词 → 点哪个词查哪个词（音标 + 中文 + 读音）；
    //   · 整句示范 = 下面那颗「🔊 先听一遍整句」按钮，它也是"先听后读"的门禁。
    // 落地这一屏仍会自动播一遍整句并把门禁放行（见 _speakOnRender），
    // 按钮是给孩子"再听一遍"用的。
    const gid = this._gid('sentg', mi, si);
    let html = '<div class="sent-step hold-zone">';
    html += '<div class="sent-progress">第 ' + (si + 1) + ' / ' + sents.length + ' 句</div>';
    html += '<div class="sent-text sent-words" id="sent-' + mi + '-' + si + '">'
         + this._wordSpans(sent) + '</div>';
    html += '<div class="sent-tip">👆 点单词看中文意思 · 点下面听整句</div>';
    html += '<div class="sent-listen">' + this._gateListenHtml(gid, sent, '🔊 先听一遍整句') + '</div>';
    html += '<button class="word-read-btn hold-target gate-locked" data-gate="' + gid + '"'
         + ' id="sent-btn-' + mi + '-' + si + '"'
         + ' onpointerdown="App._readSentence(event,' + mi + ',' + si + ')"'
         + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
         + ' oncontextmenu="return false">按住跟读</button>';
    html += '<div id="sent-status-' + mi + '-' + si + '"></div>';
    html += '<div id="sent-result-' + mi + '-' + si + '"></div>';
    html += '</div>';

    // Register the sentence to be spoken; the navigation call speaks it while
    // still inside the tap. iOS Safari only allows playback from within the
    // synchronous call stack of a user gesture — a setTimeout here worked on
    // desktop and silently did nothing on iPhone.
    // 这一遍自动示范播完，同样算"听过了"，把门禁一起放行。
    this._speakOnRender = sent;
    this._speakOnRenderGate = gid;
    return html;
  },

  _readSentence(ev, mi, si) {
    const self = this;
    const gid = this._gid('sentg', mi, si);
    if (!this._gateOpen(gid)) { this._gateNudge(gid); return; }   // 先听再读
    Api.warmup();                              // 手指按下就把连接热好
    const m = HOMEWORK_DATA[this.state.currentDay].modules[mi];
    const sent = this._splitSentences(m.passage)[si] || '';
    const btn = document.getElementById('sent-btn-' + mi + '-' + si);
    const status = document.getElementById('sent-status-' + mi + '-' + si);
    if (btn) btn.classList.add('reading');

    this._holdStart(ev, 'sent-' + mi + '-' + si, '这句话', status, function(out, text) {
      if (btn) btn.classList.remove('reading');
      if (!out) return;
      const a = self.alignSpeech(sent, text || '');
      const slot = document.getElementById('sent-result-' + mi + '-' + si);
      // v139：识别端没回话，但录音里确实有人声 → 算过，不让孩子重读。
      self._micNote(out, 'v148');
      const voiceOk = !text && self._judgeSilence(out).voiceOk;   // v148

      let html = '<div class="spell-summary">';
      html += '<div class="ss-head"><span class="ss-score">'
           + (text ? a.score : (voiceOk ? '✓' : '—')) + '</span>'
           + '<span class="ss-label">'
           + (text ? '读对 ' + a.ok + '/' + a.total + ' 个词'
                   : (voiceOk ? self.VOICE_PASS_LABEL : '这次没录到声音，再读一次')) + '</span></div>';
      if (text) {
        html += '<div class="align-sentence">';
        a.items.forEach(function(x) {
          if (x.status === 'extra') return;
          const cls = x.status === 'ok' ? 'w-ok' : x.status === 'wrong' ? 'w-bad' : 'w-miss';
          // v109：逐词标记里每个词也是一个可点的盒子 —— 红色那个（读错的）
          // 点一下就能看中文、听读音，并顺手点亮下面修复框里对应那颗芯片。
          const bad = (x.status === 'wrong' || x.status === 'missing');
          html += '<span class="lk-word ' + cls + '"'
               + (bad ? ' data-repair-word="' + self._escHtml(x.target) + '"' : '')
               + '>' + x.target + '</span> ';
        });
        html += '</div>';
      }
      if (out.samples) {
        const joined = Recorder.join([out.samples], 0);
        if (joined) html += '<audio id="sent-audio-' + mi + '-' + si + '" controls src="'
                         + URL.createObjectURL(joined.blob) + '" style="width:100%;max-width:280px;height:32px"></audio>';
      }
      html += '</div>';
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      const audio = document.getElementById('sent-audio-' + mi + '-' + si);
      if (audio) { const p = audio.play(); if (p && p.catch) p.catch(function(){}); }

      // v87 修复流程：只要有读错/漏读的词，整句就不算过 —— 先把这些单词
      // 一个个读对，才解锁「再读整句」，整句读对才放行下一句。
      // （对齐结果里 wrong = 读错，miss = 漏读，两者都要修复。）
      const wrongs = [];
      if (text) {
        a.items.forEach(function(x) {
          if ((x.status === 'wrong' || x.status === 'missing') && wrongs.indexOf(x.target) < 0) {
            wrongs.push(x.target);
          }
        });
      }
      const allOk = !!text && wrongs.length === 0;

      // v139：出了声就算过（识别端空手而归不是孩子的错）。
      const passed = (voiceOk && !text) ? self._gateStep(self.PASS_SCORE, true)
                                        : self._gateStep(allOk ? a.score : 0, allOk);
      const slotEl = document.getElementById('sent-result-' + mi + '-' + si);
      if (slotEl && !passed) {
        if (wrongs.length) {
          self._renderSentenceRepair('sent', mi, si, wrongs);
        } else {
          slotEl.insertAdjacentHTML('beforeend', self._retryHint(false, !!text));
        }
      }

      if (text) {
        Api.submitSpeakingScore({
          studentId: self._myStudentId(), dayIdx: self.state.currentDay,
          moduleIdx: mi, itemIdx: si, round: 1, type: 'sentence',
          label: sent, score: a.score, spoken: text, source: 'asr',
        });
      }
      Api.uploadRecording(out.blob, {
        studentId: self._myStudentId(), dayIdx: self.state.currentDay,
        moduleIdx: mi, itemIdx: si, round: 1, type: 'sentence',
        label: sent, score: a.score,
      }).catch(function(){});
    }, true, 'en', sent);
  },

  // ===== 读错单词修复（v87）：先读对单词，才能再读整句 ==================
  // 规则来自家长：所有读错的词都必须重新读 —— 重新先读单词，单词读对了，
  // 才能读句子。每个词两步：点一下听示范（先听后读的门禁在这也成立），
  // 再按住跟读；识别比对 ≥60 分算过。全部读对后解锁「再读整句」。
  // 阅读理解逐句（prefix='sent'）和写作朗读全文（prefix='wr'）共用。
  // 词卡读错只是练习，不上传录音、不记分 —— 和"拼词是练习不是测试"同一条理。
  //
  // v109 三处调整：
  //   · 芯片两态分明：虚框 = 还没听过（点一下听读音），实框 = 可以按住读了；
  //   · 修复框出现后自动滚到看得见的地方（家长："界面上要能看见单词"）；
  //   · 同一个词连错 3 次就放行 —— 识别有时候就是听不准（家长："识别的不准"），
  //     不能因为机器的判断把孩子永远锁在这一屏。放行时说明是"先算过"。
  _renderSentenceRepair(prefix, mi, si, words) {
    const self = this;
    const key = prefix + '-' + mi + '-' + si;
    // 读错/漏读的单词全部进复习队列（v89）：今天作业末尾逐个巩固，
    // 连对 2 次才出队 —— "读错的单词要重新读"不只在这一次朗读里。
    (words || []).forEach(w => this._reviewAdd(w));
    this._repair = { key: key, prefix: prefix, words: words.slice(),
                     listened: {}, done: {}, tries: {}, chipIds: [], total: words.length };
    const btn = document.getElementById(prefix + '-btn-' + mi + '-' + si);
    if (btn) { btn.disabled = true; btn.textContent = '先读对红色单词'; }
    const slot = document.getElementById(prefix + '-result-' + mi + '-' + si);
    if (!slot) return;
    // 已经有修复框就不再叠一个（同一屏重读会再进这里）
    const old = document.getElementById('repair-box-' + key);
    if (old && old.remove) { try { old.remove(); } catch (e) {} }
    let html = '<div class="repair-box" id="repair-box-' + key + '">';
    html += '<div class="repair-title">📖 有 ' + words.length + ' 个单词没读对，先把它们读会：</div>';
    html += '<div class="repair-words">';
    words.forEach(function(w, i) {
      const cid = 'repair-w-' + prefix + '-' + mi + '-' + si + '-' + i;
      self._repair.chipIds.push(cid);
      html += '<button class="repair-word repair-locked" id="' + cid + '"'
           + ' onpointerdown="App._repairWordStart(event,\'' + prefix + '\',' + mi + ',' + si + ',' + i + ')"'
           + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
           + ' oncontextmenu="return false">🔊 ' + self._escHtml(w) + '</button>';
    });
    html += '</div>';
    html += '<div class="repair-hint" id="repair-hint-' + prefix + '-' + mi + '-' + si + '">先点一下单词听读音，再按住它跟读</div>';
    html += '</div>';
    slot.insertAdjacentHTML('beforeend', html);
    // 滚进视野：句子上面还有分数、标记、录音条，修复框常常落在框外，
    // 孩子只看到"按钮变灰了"却不知道下面要他做什么。
    const box = document.getElementById('repair-box-' + key);
    if (box && box.scrollIntoView) {
      try { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
  },

  // 一个词连错几次就放行（v109）。识别不是百分百准，三次都没认出来的话，
  // 多半是它的问题而不是孩子的 —— 继续较真只会把孩子卡死在这一屏。
  REPAIR_GIVE_UP: 3,

  // 点逐词判分结果里那个红词，除了弹出意思，顺手把下面修复框里对应的那颗
  // 芯片点亮 + 滚进来 —— 家长："读错的单词点出错的单词来读"。两个地方原来
  // 只有"颜色一样"这一层联系，孩子得自己去找下面哪一颗是它。
  _focusRepairChip(word) {
    const r = this._repair;
    if (!r || !r.chipIds || !r.chipIds.length) return;
    const w = String(word || '').toLowerCase();
    let idx = -1;
    (r.words || []).forEach(function(x, i) { if (String(x).toLowerCase() === w && idx < 0) idx = i; });
    if (idx < 0) return;
    const chip = document.getElementById(r.chipIds[idx]);
    if (!chip) return;
    chip.classList.add('repair-focus');
    if (chip.scrollIntoView) { try { chip.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }
    setTimeout(function() { if (chip.classList) chip.classList.remove('repair-focus'); }, 1800);
  },

  _repairWordStart(ev, prefix, mi, si, idx) {
    ev.preventDefault();
    const r = this._repair;
    if (!r || r.key !== prefix + '-' + mi + '-' + si) return;
    if (ev.pointerId !== undefined && ev.currentTarget.setPointerCapture) {
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    }
    const word = r.words[idx];
    const chip = document.getElementById('repair-w-' + prefix + '-' + mi + '-' + si + '-' + idx);
    const status = document.getElementById('repair-hint-' + prefix + '-' + mi + '-' + si);
    if (!r.listened[idx]) {
      r.listened[idx] = true;                    // 先听一遍示范才解锁跟读
      if (chip) chip.classList.remove('repair-locked');
      // 句子里的词不在静态朗读表里（表里只有整句和固定单词），走 CF 的母语
      // 音色（v98）—— 跟词汇模块、查词的单词示范音保持一致，同一个人。
      this.speak(word, { prefer: 'cf' });
      if (status) status.textContent = '现在按住「' + word + '」读一遍';
      return;                                    // 这一按只听不录
    }
    if (r.done[idx]) return;                     // 已经读对的词不用再读
    const self = this;
    // v109：孤立单词和字母/音节属于同一类（短、没有上下文），走 CF 才对得上；
    // 自动收尾用 900ms 静音窗口（比字母的 600ms 宽一点，别把词尾的辅音切掉）。
    this._holdStart(ev, 'repair-' + prefix + '-' + mi + '-' + si + '-' + idx, word, status, function(out, text) {
      // v139：识别端没回话，但录音里确实有人声 —— 这一格算过。
      // 以前这里直接判"没听清"让孩子再读，是"重复四五遍"的主要来源之一：
      // 整句里每个红词都要走这一关，卡一格就过不去。
      self._micNote(out, 'v148');
      const voiceOk = !text && self._judgeSilence(out).voiceOk;   // v148
      if (!text && !voiceOk) {
        if (status) status.textContent = '这次没录到声音，点一下单词听读音，再按住读一次';
        return;
      }
      const a = self.alignSpeech(word, text || '');
      // 判"读对了"：位置上对得上，或者这一串识别结果里任意位置出现过这个词。
      // 后者挡住对齐偶尔把词吃进"多余的词"里的情况。
      const hit = voiceOk || (a.ok >= 1 && a.score >= 60) || self._heardAny(word, text);
      const tries = (r.tries[idx] || 0) + 1;
      r.tries[idx] = tries;
      if (hit || tries >= self.REPAIR_GIVE_UP) {
        r.done[idx] = true;
        if (chip) {
          chip.classList.remove('repair-shake');
          chip.classList.add('repair-done');
          chip.textContent = '✓ ' + word;
          chip.disabled = true;
        }
        const n = Object.keys(r.done).length;
        // 连错 3 次放过的那一个：告诉孩子"这次先算过"，别让他以为读对是假的。
        const lenient = !hit;
        if (n >= r.total) {
          if (status) status.innerHTML = '🎉 单词全对了！点上面「再读整句」';
          const btn = document.getElementById(r.prefix + '-btn-' + mi + '-' + si);
          if (btn) { btn.disabled = false; btn.textContent = '再读整句'; }
        } else if (status) {
          status.textContent = (lenient ? '这次先算过～' : '✓ 读对了！')
                             + '还剩 ' + (r.total - n) + ' 个单词';
        }
      } else {
        if (chip) { chip.classList.add('repair-shake'); setTimeout(function() { chip.classList.remove('repair-shake'); }, 500); }
        if (status) status.innerHTML = '❌ 还没读对，再听一遍、再读一次（识别到：' + self._escHtml(text) + '）';
      }
    }, true, 'en', word, 'cf', 900);
  },

  // The whole passage, English only, once every sentence has been read.
  renderPassageStep(m, mi, dayIdx) {
    const esc = String(m.passage).replace(/'/g, "\\'");
    Recorder.warmUp(); Api.warmup();
    let html = '<div class="passage-full">';
    html += '<div class="pf-title">全文</div>';
    html += '<div class="pf-text sent-words">' + this._wordSpans(m.passage) + '</div>';
    html += '<div class="sent-tip">👆 点单词看中文意思</div>';
    html += '<div class="pf-actions">';
    html += '<button class="btn-ghost" onclick="App.speak(\'' + esc + '\')">听全文</button>';
    if (m.passage_cn) {
      html += '<button class="word-read-btn" id="tr-btn-' + mi + '" onclick="App.toggleTranslate(' + mi + ')">开始翻译录音</button>';
    }
    html += '</div>';
    html += '<div id="tr-status-' + mi + '"></div>';
    html += '<div id="tr-result-' + mi + '"></div>';
    html += '</div>';
    return html;
  },

  // ===== Translate the passage aloud =====
  // Tap to start, tap to stop — not press-and-hold. Translating a whole
  // passage takes a while and holding a button for a minute is not something
  // to ask of a child.
  async toggleTranslate(mi) {
    const btn = document.getElementById('tr-btn-' + mi);
    const status = document.getElementById('tr-status-' + mi);
    const m = HOMEWORK_DATA[this.state.currentDay].modules[mi];

    if (this._trRecording) {
      this._trRecording = false;
      clearInterval(this._trTimer);
      if (btn) { btn.textContent = '开始翻译录音'; btn.classList.remove('reading'); }
      if (status) status.innerHTML = '<div class="tap-rec"><span class="tap-spin"></span>正在识别…</div>';

      let out = null;
      try { out = await Recorder.stop(); } catch (e) {}
      if (!out || !out.blob) {
        if (status) status.innerHTML = '<div class="tap-result bad">没有录到声音，再试一次</div>';
        return;
      }
      const forAsr = (out.samples && Recorder.padForAsr(out.samples)) || out.blob;
      // 整篇翻译说的是中文 —— turbo + mode=zh（v86），同逐句翻译。
      // v131：清预算 + 开性能样本（中文口述翻译）
      Api.asrResetBudget();
      Api.perfBegin('zh-translate-whole');
      const res = await Api.transcribe(forAsr, null, { fast: true, lang: 'zh', budgeted: true });
      const heard = res && res.text && !Api.isFillerTranscript(res.text) ? res.text : '';
      // v139：出声了就给过 —— 识别端没回话不算孩子没说。
      this._micNote(out, 'v148');
      const voiceOk = !heard && this._judgeSilence(out).voiceOk;   // v148
      const r = this.scoreTranslation(m.passage_cn, heard);
      // v131：中文口述的"结果档位"只看有没有真的说出内容 —— 不做分数档判断，
      // 因为它本来就不判对错（意思覆盖而已）。
      Api.perfEnd({ kind: (heard || voiceOk) ? 'pass' : 'fail' });

      let html = '<div class="spell-summary">';
      html += '<div class="ss-head"><span class="ss-score">'
           + (heard ? r.score : (voiceOk ? '✓' : '—')) + '</span>'
           + '<span class="ss-label">'
           + (heard ? '意思覆盖 ' + r.covered + '/' + r.total + ' 字'
                    : (voiceOk ? this.VOICE_PASS_LABEL : '这次没录到声音，再试一次')) + '</span></div>';
      if (heard) {
        html += '<div class="tr-block"><div class="tr-label">你说的</div><div class="tr-text">'
             + this._toSimplified(heard) + '</div></div>';
        html += '<div class="tr-block"><div class="tr-label">参考翻译</div><div class="tr-text ref">'
             + m.passage_cn + '</div></div>';
        html += '<p class="fs-12 text-sub">翻译没有标准答案，这个分数只看意思覆盖了多少，说法不同不代表错。</p>';
      }
      const joined = out.samples ? Recorder.join([out.samples], 0) : null;
      if (joined) html += '<audio controls src="' + URL.createObjectURL(joined.blob)
                       + '" style="width:100%;max-width:280px;height:32px"></audio>';
      html += '</div>';
      const slot = document.getElementById('tr-result-' + mi);
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      Api.submitSpeakingScore({
        studentId: this._myStudentId(), dayIdx: this.state.currentDay,
        moduleIdx: mi, itemIdx: 96, round: 1, type: 'translation',
        label: '整篇翻译', score: r.score, spoken: heard, source: 'asr',
      });
      if (joined) {
        Api.uploadRecording(joined.blob, {
          studentId: this._myStudentId(), dayIdx: this.state.currentDay,
          moduleIdx: mi, itemIdx: 96, round: 1, type: 'translation',
          label: '整篇翻译', score: r.score,
        }).catch(function(){});
      }
      return;
    }

    if (!Recorder.supported()) {
      if (status) status.innerHTML = '<div class="tap-result bad">此浏览器不支持录音</div>';
      return;
    }
    this._trRecording = true;
    if (btn) { btn.textContent = '结束录音'; btn.classList.add('reading'); }
    let secs = 0;
    if (status) status.innerHTML = '<div class="tap-rec"><span class="tap-dot"></span>'
      + '用中文说出这篇文章的意思 <span class="tap-hint" id="tr-time-' + mi + '">0秒</span></div>';
    clearInterval(this._trTimer);
    this._trTimer = setInterval(function() {
      secs++;
      const t = document.getElementById('tr-time-' + mi);
      if (t) t.textContent = secs + '秒';
    }, 1000);

    try { await Recorder.start(); }
    catch (e) {
      this._trRecording = false;
      clearInterval(this._trTimer);
      if (btn) { btn.textContent = '开始翻译录音'; btn.classList.remove('reading'); }
      if (status) status.innerHTML = '<div class="tap-result bad">无法访问麦克风，请允许权限</div>';
    }
  },


  // ===== Chinese translation check =====
  // Whisper transcribes Mandarin in Traditional characters and ignores any
  // language hint (@cf/openai/whisper takes only `audio` — a Simplified
  // prompt was tried and made no difference), so the transcript is folded to
  // Simplified here before it is compared with the reference translation.
  //
  // Coverage is the common everyday set, which is what graded readers use.
  // A character that is not in the table simply stays as it is.
  TRAD: '這來個們時們國學會後間對開實發當經動樣進點種說實過還將產業務員來機關與體現們爾種學裡對後隻歡歡喜聽讀書愛媽爸媽學運動風雲電話語問題長長門馬鳥魚鳥飛車東頭興爾龍龜歲兒兒歲數樓錢銀鐵鋼銅顏線紙筆畫圖書園場農漁牧獵豬雞鴨鵝馬羊狗貓蟲蝦蟹龍鳳凰麗華貴賤買賣價貨財貧富續斷續轉輪車軍陣戰爭勝負將帥兵刀劍槍砲彈藥醫藥療養護衛檢驗診斷術學習慣練習題號碼碼頭條約結約續紹紅綠藍紫綢緞織繡縫繩結網絡線續維綜統緊繼績纖鮮鹽醬醋糖麵飯餅餃麥穀糧倉庫儲藏積蓄豐盈虧損盡歸還償贈賞罰責備懲獎勵勸諫諮詢議論談話語言詞語謠謎謝誠謹謙讓認識記憶讀誦講課試驗證據調查訪問訊詢誤誤譯譯詩詞誌誌湯姆麼沒總聲藝豐辦壓陽陰際隨險難靜華萬與專屬層屆屬島嶺峽帶幫幾廣廳應廠處備複雜賦稟賽獎勵誇讚讓態勢豐績優劣佳績勤懇認眞聰穎穎悟嚴謹積極熱愛興趣趣味關註註意專註堅持毅力鼓勵讚揚驕傲滿意輕鬆愉快興奮激動溫暖親切熱情開朗樂觀積極師傅級課題練習講話語詞說讀寫聽談論述評論斷續識記憶課堂學校教師學生同學朋友夥伴親戚鄰居醫生護士司機農民工人職業',
  SIMP: '这来个们时们国学会后间对开实发当经动样进点种说实过还将产业务员来机关与体现们尔种学里对后只欢欢喜听读书爱妈爸妈学运动风云电话语问题长长门马鸟鱼鸟飞车东头兴尔龙龟岁儿儿岁数楼钱银铁钢铜颜线纸笔画图书园场农渔牧猎猪鸡鸭鹅马羊狗猫虫虾蟹龙凤凰丽华贵贱买卖价货财贫富续断续转轮车军阵战争胜负将帅兵刀剑枪炮弹药医药疗养护卫检验诊断术学习惯练习题号码码头条约结约续绍红绿蓝紫绸缎织绣缝绳结网络线续维综统紧继绩纤鲜盐酱醋糖面饭饼饺麦谷粮仓库储藏积蓄丰盈亏损尽归还偿赠赏罚责备惩奖励劝谏咨询议论谈话语言词语谣谜谢诚谨谦让认识记忆读诵讲课试验证据调查访问讯询误误译译诗词志志汤姆么没总声艺丰办压阳阴际随险难静华万与专属层届属岛岭峡带帮几广厅应厂处备复杂赋禀赛奖励夸赞让态势丰绩优劣佳绩勤恳认真聪颖颖悟严谨积极热爱兴趣趣味关注注意专注坚持毅力鼓励赞扬骄傲满意轻松愉快兴奋激动温暖亲切热情开朗乐观积极师傅级课题练习讲话语词说读写听谈论述评论断续识记忆课堂学校教师学生同学朋友伙伴亲戚邻居医生护士司机农民工人职业',

  _toSimplified(text) {
    if (!this._tsMap) {
      this._tsMap = {};
      for (var i = 0; i < this.TRAD.length && i < this.SIMP.length; i++) {
        if (this.TRAD[i] !== this.SIMP[i]) this._tsMap[this.TRAD[i]] = this.SIMP[i];
      }
    }
    var map = this._tsMap, out = '';
    for (var j = 0; j < text.length; j++) out += map[text[j]] || text[j];
    return out;
  },

  // Meaning, not wording. 「非常有天赋」 and 「很有天赋」 are the same answer,
  // but as character strings they overlap only 3 of 5. Degree adverbs and
  // near-synonyms are folded to one form, and grammatical particles dropped,
  // before anything is compared — otherwise a correct translation phrased
  // differently from the reference is marked down for no good reason.
  ZH_FOLD: {
    // degree
    '非常':'很','十分':'很','特别':'很','格外':'很','相当':'很','挺':'很','极其':'很',
    '极为':'很','异常':'很','尤其':'很','分外':'很','好':'很',
    // frequency / time
    '经常':'常','时常':'常','往往':'常','总是':'常','老是':'常',
    '每日':'每天','天天':'每天','日常':'每天',
    // like / love
    '喜爱':'喜欢','热爱':'喜欢','爱好':'喜欢','钟爱':'喜欢','酷爱':'喜欢',
    // ability
    '天分':'天赋','才能':'天赋','才华':'天赋','资质':'天赋',
    // common nouns
    '男孩子':'男孩','小男孩':'男孩','女孩子':'女孩','小女孩':'女孩',
    '足球运动':'足球','体育运动':'运动','体育':'运动',
    // verbs
    '喜欢做':'喜欢','进行':'','从事':'',
  },
  ZH_DROP: '的了着地得呢吧啊吗呀嘛哦噢欸',

  _zhChars(text) {
    let t = this._toSimplified(String(text || ''));
    // Longest keys first so 「非常」 is folded before 「常」 can match inside it.
    const keys = Object.keys(this.ZH_FOLD).sort((a, b) => b.length - a.length);
    for (const k of keys) t = t.split(k).join(this.ZH_FOLD[k]);
    const drop = this.ZH_DROP;
    return t.replace(/[^\u4e00-\u9fa5]/g, '')
      .split('')
      .filter(c => drop.indexOf(c) < 0);
  },

  // Longest common subsequence over characters. Translation is free-form —
  // two correct translations of the same sentence share content words but not
  // word order or particles — so this measures overlap, not exactness. It is
  // a "did you get the meaning across" indicator, not a translation grade.
  scoreTranslation(reference, spoken) {
    var a = this._zhChars(reference), b = this._zhChars(spoken);
    if (!a.length) return { score: 0, covered: 0, total: 0, spoken: spoken };
    if (!b.length) return { score: 0, covered: 0, total: a.length, spoken: spoken };
    var prev = new Array(b.length + 1).fill(0);
    for (var i = 1; i <= a.length; i++) {
      var cur = [0];
      for (var j = 1; j <= b.length; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
      }
      prev = cur;
    }
    var lcs = prev[b.length];
    return {
      score: Math.round(lcs / a.length * 100),
      covered: lcs, total: a.length, spoken: spoken,
    };
  },

  // ===== 手机录音自检（v148）=====
  // Open ?micdiag=1 on the phone.
  //
  // 家长 2026-10-20：「红米 note 9 5G 用自带浏览器容易出问题，小米 11 / 13 就还好」。
  // 这类"就这个机型不行"的问题，靠改代码反复猜是最慢的路 —— 先让那台手机自己
  // 说出它到底哪一项不达标（采样率被降？爆音？掉帧？），再对症下药。
  //
  // 用法：让孩子在那台手机上打开 https://amyeng.top/?micdiag=1
  //   1. 点「开始检测」，允许麦克风；
  //   2. 正常读一句书上的英文（页面会显示实时音量条和峰值）；
  //   3. 松手后看报告 —— 把整段截图发给老师即可。
  runMicDiag() {
    const self = this;
    document.body.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;overflow:auto;'
      + 'padding:18px 16px 60px;font:15px/1.75 -apple-system,"PingFang SC",sans-serif;color:#222';
    box.innerHTML = '<h2 style="font-size:19px;margin:0 0 6px">🎤 手机录音自检</h2>'
      + '<p style="color:#666;margin:0 0 14px;font-size:13px">老师排查用。孩子读一句英文就好，'
      + '读完把这一页截图发出来。</p>'
      + '<div id="md-status" style="min-height:52px;padding:12px;border-radius:10px;'
      + 'background:#f4f6fa;font-size:14px">点下面的按钮开始</div>'
      + '<div id="md-meter" style="height:12px;border-radius:6px;background:#e6eaf2;margin:12px 0;overflow:hidden">'
      + '<div id="md-bar" style="height:100%;width:0%;background:#2ecc71;transition:width .05s"></div></div>'
      + '<button id="md-go" style="width:100%;padding:16px;border:0;border-radius:12px;'
      + 'background:#2b6cff;color:#fff;font-size:17px;font-weight:600">按住这里，读一句英文</button>'
      + '<div id="md-report" style="margin-top:18px"></div>';
    document.body.appendChild(box);

    const statusEl = box.querySelector('#md-status');
    const bar = box.querySelector('#md-bar');
    const btn = box.querySelector('#md-go');
    const rep = box.querySelector('#md-report');

    let holding = false;
    const start = function (ev) {
      if (ev) ev.preventDefault();
      if (holding) return;
      holding = true;
      statusEl.textContent = '正在录音…请正常读一句英文（读完松手）';
      Promise.resolve(Recorder.prime()).then(function () {
        return Recorder.start({
          onLevel: function (v) {
            const pct = Math.min(100, Math.round(v * 140));
            bar.style.width = pct + '%';
            bar.style.background = v > 0.9 ? '#e74c3c' : (v > 0.02 ? '#2ecc71' : '#e6eaf2');
          },
        });
      }).catch(function (e) {
        holding = false;
        statusEl.textContent = '打不开麦克风：' + (e && e.message ? e.message : e)
          + '\n请检查浏览器是否允许了麦克风权限。';
      });
    };
    const end = function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      if (!holding) return;
      holding = false;
      statusEl.textContent = '分析中…';
      Recorder.stop().then(function (out) {
        if (!out) { statusEl.textContent = '这一段什么都没录到（麦克风没出数据），再试一次。'; return; }
        statusEl.textContent = '✅ 录到了 ' + out.duration.toFixed(2) + ' 秒。报告在下面。';
        bar.style.width = '0%';
        const h = out.health || {};
        const rows = [
          ['录音采样率', (h.srcRate || 0) + ' Hz',
            h.lowRate ? '⚠️ 偏低（正常 16000）—— 高频丢失，声音会发闷' : '✅ 正常'],
          ['峰值', (h.peak || 0).toFixed(3),
            (h.peak || 0) < 0.03 ? '⚠️ 太小 —— 可能离太远 / 麦克风被挡' : '✅ 正常'],
          ['爆音占比', ((h.clipRatio || 0) * 100).toFixed(2) + '%',
            (h.clipRatio || 0) > 0.02 ? '⚠️ 偏高 —— 离嘴太近，声音会嘈杂' : '✅ 正常'],
          ['掉帧', (h.dropouts || 0) + ' 处',
            (h.dropouts || 0) > 0 ? '⚠️ 有空洞 —— 声音会断续' : '✅ 正常'],
          ['人声占比', ((h.voicedRatio || 0) * 100).toFixed(0) + '%',
            (h.voicedRatio || 0) < 0.05 ? '⚠️ 很少 —— 几乎没说话' : '✅ 正常'],
          ['录音时长', out.duration.toFixed(2) + ' 秒', ''],
        ];
        let html = '<div style="font-weight:600;margin-bottom:8px">报告</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:13px">';
        rows.forEach(function (r) {
          html += '<tr>'
            + '<td style="padding:7px 4px;border-bottom:1px solid #eef1f6;color:#666;white-space:nowrap">' + r[0] + '</td>'
            + '<td style="padding:7px 4px;border-bottom:1px solid #eef1f6;font-weight:600;white-space:nowrap">' + r[1] + '</td>'
            + '<td style="padding:7px 4px;border-bottom:1px solid #eef1f6">' + r[2] + '</td>'
            + '</tr>';
        });
        html += '</table>';
        html += '<div style="margin-top:12px;font-size:12px;color:#888">'
          + '设备：' + ((navigator.userAgent || '').slice(0, 120)) + '</div>';
        html += '<div style="margin-top:6px;font-size:12px;color:#888">'
          + '判定：' + (out.healthLabel || '—') + '</div>';
        // 回放：家长自己也听一遍，比任何数字都直观
        try {
          const url = URL.createObjectURL(out.blob);
          html += '<div style="margin-top:14px"><div style="font-size:13px;color:#666;margin-bottom:6px">'
            + '听一下刚才的录音（这一条就是要发出去的那份）：</div>'
            + '<audio controls src="' + url + '" style="width:100%;height:40px"></audio></div>';
        } catch (e) {}
        html += '<div style="margin-top:18px;padding:12px;border-radius:10px;background:#f4f6fa;font-size:13px;line-height:1.8">'
          + '<b>怎么读这一页：</b><br>'
          + '· 采样率偏低 + 爆音偏高 → 这台机器的音频通路有问题，请先试试<b>关掉其他正在用麦克风的 App</b>，'
          + '或在系统设置里把"录音"权限重新授予浏览器；<br>'
          + '· 只有爆音偏高 → 让孩子离手机 10~15 厘米说话，不要贴着嘴；<br>'
          + '· 只有峰值太小 → 离远了一点，稍微靠近些；<br>'
          + '· 全部正常 → 这台机器的录音没问题，问题在识别端，把截图发出来。</div>';
        rep.innerHTML = html;
      }).catch(function (e) {
        statusEl.textContent = '收尾失败：' + (e && e.message ? e.message : e);
      });
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('pointerleave', function (e) { if (holding) end(e); });
  },

  // ===== TTS self-test =====
  // Open ?ttstest=1 on the phone. Two guesses have already been shipped
  // blind; this reports which step actually fails on the device that is
  // failing — fetch, decode, or play — for each endpoint and text length.
  async runTtsTest() {
    const WORD = 'beautiful';
    const SENT = 'Tom is a 10-year-old boy from England.';
    const enc = encodeURIComponent;
    const srcs = [
      ['同源 /api/tts', t => '/api/tts?text=' + enc(t)],
      ['有道 dictvoice', t => 'https://dict.youdao.com/dictvoice?audio=' + enc(t) + '&type=2'],
      ['百度 gettts',    t => 'https://fanyi.baidu.com/gettts?lan=en&text=' + enc(t) + '&spd=3&source=web'],
    ];

    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;overflow:auto;padding:16px;font:14px/1.7 -apple-system,sans-serif';
    box.innerHTML = '<h3 style="margin-bottom:8px">语音自检</h3>'
      + '<div id="tt-out">点下面的按钮开始（必须点一下，浏览器才允许播放）</div>'
      + '<button id="tt-go" style="margin-top:14px;padding:12px 22px;border-radius:999px;background:#F07000;color:#fff;font-size:16px">开始测试</button>'
      + '<button id="tt-close" style="margin-left:8px;padding:12px 18px;border-radius:999px;background:#eee">关闭</button>';
    document.body.appendChild(box);
    box.querySelector('#tt-close').onclick = () => box.remove();

    box.querySelector('#tt-go').onclick = async () => {
      const out = box.querySelector('#tt-out');
      const lines = [];
      const say = m => { lines.push(m); out.innerHTML = lines.join('<br>'); };
      say('UA: ' + navigator.userAgent.slice(0, 70));
      say('speechSynthesis: ' + (window.speechSynthesis ? '有' : '无'));

      for (const [name, mk] of srcs) {
        for (const [label, text] of [['单词', WORD], ['句子', SENT]]) {
          const url = mk(text);
          // 1) can the file be fetched at all?
          let fetched = '—';
          try {
            const r = await fetch(url, { method: 'GET' });
            fetched = r.status + ' ' + (r.headers.get('content-type') || '');
          } catch (e) { fetched = '取不到 (' + (e.message || e) + ')'; }

          // 2) will the audio element actually play it?
          const played = await new Promise(resolve => {
            const a = new Audio();
            let done = false;
            const finish = v => { if (!done) { done = true; try { a.pause(); } catch (e) {} resolve(v); } };
            a.onplaying = () => finish('播放成功');
            a.onerror = () => finish('播放失败 code=' + (a.error && a.error.code));
            setTimeout(() => finish('超时未播放'), 6000);
            a.src = url;
            const p = a.play();
            if (p && p.catch) p.catch(e => finish('被拒绝: ' + (e.name || e)));
          });
          say('<b>' + name + ' · ' + label + '</b>：取 ' + fetched + ' ｜ ' + played);
        }
      }
      say('<br>把这一屏截图发给我。');
    };
  },

  // ===== Sound-alike matching =====
  // A syllable read correctly still comes back spelled differently: Whisper
  // wrote "No." for /noʊ/ (know), "Full." for ful, "T" for ti, "shine." for
  // chine. Comparing letters would fail a child who read it perfectly, so both
  // sides are reduced to a rough sound key first.
  _soundKey(w) {
    var x = String(w).toLowerCase().replace(/[^a-z]/g, '');
    if (!x) return '';
    x = x.replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/^gn/, 'n')
         .replace(/^ps/, 's').replace(/^x/, 'z')
         .replace(/dge/g, 'j').replace(/tch/g, 'ch')
         .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/qu/g, 'kw')
         .replace(/ch/g, 'sh')                 // chine -> shine
         .replace(/gh/g, '')                   // silent
         .replace(/([a-z])\1+/g, '$1');         // full -> ful
    // Silent-final-e and the w/vowel rules only make sense on a real word.
    // Applied to a single letter they erase it — "e" became "" and then
    // matched nothing, so a correctly read E scored as missed.
    if (x.length > 2) {
      x = x.replace(/e$/, '').replace(/([aeiou])w$/, '$1');
    }
    x = x.replace(/([aeiou])\1/g, '$1');
    return x || String(w).toLowerCase().replace(/[^a-z]/g, '');
  },

  // Lenient on purpose: one edit apart still counts. Being strict here means
  // telling a child they read it wrong when the recogniser simply spelled it
  // another way.
  _soundAlike(expected, heard) {
    if (!heard) return false;
    var a = this._soundKey(expected);
    if (!a) return false;
    var toks = String(heard).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    var self = this;
    return toks.some(function(t) {
      var b = self._soundKey(t);
      if (!b) return false;
      if (a === b) return true;
      if (a.length >= 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)) return true;
      return self._editDistance(a, b) <= 1;
    });
  },

  // v93：字母判定。_soundAlike 不能拿来判单个字母 —— 它最后那条
  // `_editDistance <= 1` 在 26 个字母的宇宙里等于"几乎都对"：
  // B 和 P、B 和 D、M 和 N 的距离都是 1，会被判成读对了。
  // 这里认三件事：识别结果里直接出现了这个字母（"b"）、出现了它的字母名
  // 拼写（B → "bee" / "be"）、或者出现了它的读音写法（B → "buh"）。
  // v99 补齐第三类并压掉重复字母（"peee" → "pe"）—— 判别力不变（b/p、b/d、
  // m/n 仍然分得开），但识别端换一种写法不会再冤枉孩子。
  _letterOk(target, heard) {
    var t = String(target || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!t) return false;
    if (t.length !== 1) return this._soundAlike(target, heard);
    var s = String(heard || '').toLowerCase();
    if (!s) return false;
    var LNAMES = this._LNAMES;
    // v99：两边都先把重复字母压成一个再比 —— 识别端把短音写成 "peee"、"mmm"、
    // "buh"（读的是 /p/ /m/ /b/ 的音而不是字母名）很常见。以前只认字母名，
    // 孩子读对了反而被要求重读，卡在"全部读对才能走"上过不去（家长反馈）。
    var squash = function (x) { return String(x).replace(/([a-z])\1+/g, '$1'); };
    var allowed = (t + ' ' + (LNAMES[t] || '')).split(' ')
                   .filter(Boolean).map(squash);
    var toks = s.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    for (var i = 0; i < toks.length; i++) {
      if (allowed.indexOf(squash(toks[i])) >= 0) return true;
    }
    // 注意：这里**不**做"子串包含"兜底（比如 "sea" 里含 e 就算 e 读对）——
    // 那会让 c 的字母名反过来匹配给 e，把读错的判成读对。宁可让它重读。
    return false;
  },

  // 26 个字母的"字母名 / 读音 / 字母本身"三种写法（v99 建立，v101 提到外面
  // 给 _letterNear、_letterish 共用）。识别端对同一个字母可能吐出其中任一种。
  _LNAMES: {
    a: 'ay eh ei ey ah uh',  b: 'be bee bi buh',    c: 'ce see sea cee',
    d: 'de dee di duh',      e: 'ee eh ey',         f: 'ef eff fuh',
    g: 'ge gee guh',         h: 'aitch haitch ech huh',
    i: 'eye ai ay ih',       j: 'jay je juh',       k: 'kay ka kah kuh',
    l: 'el ell luh',         m: 'em emm muh',       n: 'en enn nuh',
    o: 'oh owe',             p: 'pe pee pea puh',   q: 'cue queue que kyu',
    r: 'are ar ruh',         s: 'es ess suh',       t: 'te tea tee ti tuh',
    u: 'you yu uh',          v: 've vee vuh',       w: 'double www wuh',
    x: 'ex eks axe',         y: 'why wye',          z: 'zee zed ze',
  },

  // 清浊 / 易混辅音对（v101）。这两者之间只差一个音，但**是另一个字母** ——
  // 孩子把 B 读成 /p/、把 D 读成 /t/，那是真读错，不许走"发音不准"这条放行路。
  _MIX_PAIRS: { b: 'p', p: 'b', d: 't', t: 'd', g: 'k', k: 'g', v: 'f', f: 'v',
                z: 's', s: 'z', m: 'n', n: 'm' },

  // 字母名首音相同的一小撮（g/j 都是 /dʒ/，c/k 都是 /k/，s/c 都是 /s/）：
  // 识别端把 G 写成 "jee"、把 K 写成 "see" 是同一个音换了拼法，不是读错。
  _SAME_INITIAL: { g: 'j', j: 'g', c: 's', s: 'c', k: 'c', i: 'y', y: 'i',
                   u: 'w', w: 'u', o: 'u' },

  // v101：发音**不准** ≠ 读**错**。家长原话：「如果是字母发音不准，不是很严重
  // 的话，就给过 60 分以上。如果单个字母读错了，那该错的就是错，要求重读。」
  //
  // 识别回来的东西不是目标字母的标准写法，但听得出就是它 —— 口音、拖长
  // （"deek" ≈ dee）、被写成同音的另一种拼法（x → "ks"、g → "jee"）—— 算过。
  // 拦在门外的是 _MIX_PAIRS：一步之差落到另一个字母的读音上，那是读错。
  _letterNear(target, heard) {
    var t = String(target || '').toLowerCase().replace(/[^a-z]/g, '');
    if (t.length !== 1) return false;
    var toks = String(heard || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (!toks.length) return false;
    var self = this;
    var squash = function (x) { return String(x).replace(/([a-z])\1+/g, '$1'); };
    var forms = ((this._LNAMES[t] || '') + ' ' + t).split(' ').filter(Boolean).map(squash);
    for (var i = 0; i < toks.length; i++) {
      var tok = squash(toks[i]);
      if (!tok || tok.length > 7) continue;
      if (this._letterOk(t, tok)) return true;
      // 明确是**另一个字母**的读法（K 的 "kay" 出现在读 C 的时候、P 的 "puh"
      // 出现在读 B 的时候）—— 那不是"发音不准"，是真读错，走重读。
      var other = false;
      for (var c = 97; c <= 122; c++) {
        var L = String.fromCharCode(c);
        if (L !== t && this._letterOk(L, tok)) { other = true; break; }
      }
      if (other) continue;
      for (var j = 0; j < forms.length; j++) {
        var f = forms[j];
        var sameHead = tok.charAt(0) === f.charAt(0);
        var sameSoundHead = self._SAME_INITIAL[tok.charAt(0)] === f.charAt(0);
        // 尾音写法（X 的 "ks" ⊂ "eks"）：首字母对不上，但尾部一模一样
        var suffixy = tok.length >= 2 && f.length >= 2 && f.slice(-tok.length) === tok;
        var prefixy = tok.length >= 2 && f.length >= 2 && tok.indexOf(f) === 0;
        if (!(sameHead || sameSoundHead || suffixy || prefixy)) continue;
        var dist = this._editDistance(tok, f);
        var close = Math.abs(tok.length - f.length) <= 2;
        if (dist <= 1 && !this._mixOnly(tok, f)) return true;
        // 长字母名（W 的 "double"、H 的 "aitch"）容易被听走形一位两位；
        // 短形式（"ah" ↑ "are"）只认长度差不超过 1 的吞音。
        // v106：差两位的那一档再松一格 —— 只要有一边 ≥3 个字母就认（"aye" ≈ "ay"、
        // "deed" ≈ "de"）。这是"听走形"不是"读成别的字母"：落到另一个字母的读音上
        // 的那一步，已经在上面 `other` 那道闸里被拦掉了，这一格放宽碰不到 b/p、m/n。
        if (dist === 2 && close && Math.max(tok.length, f.length) >= 3) return true;
      }
    }
    return false;
  },

  // 两个短 token 的唯一差别是不是"清浊 / 易混对"那一步（b↔p、d↔t…）。
  _mixOnly(a, b) {
    if (a.length !== b.length) return false;
    var diff = -1;
    for (var i = 0; i < a.length; i++) {
      if (a.charAt(i) === b.charAt(i)) continue;
      if (diff >= 0) return false;
      diff = i;
    }
    if (diff < 0) return false;
    return this._MIX_PAIRS[a.charAt(diff)] === b.charAt(diff);
  },

  // 识别结果到底像不像"某个字母音"。不像 = 识别幻觉（实测 E 回来 "Capitoli"、
  // W 回来 "www."），不该算孩子读错，归到"没听清"。
  _letterish(heard) {
    var toks = String(heard || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (!toks.length) return false;
    var squash = function (x) { return String(x).replace(/([a-z])\1+/g, '$1'); };
    for (var i = 0; i < toks.length; i++) {
      var tok = squash(toks[i]);
      if (!tok || tok.length > 7) continue;
      for (var c = 97; c <= 122; c++) {
        var L = String.fromCharCode(c);
        if (this._letterOk(L, tok) || this._letterNear(L, tok)) return true;
      }
    }
    return false;
  },

  // 识别端只回了一个孤立单字母、而且不是目标字母 —— 这是它自己在猜（实测孩子
  // 读 D 回来 "N"），不足以定性"读错"。真读错要有读音证据（"puh" 之类）。
  _singleLetterGuess(heard) {
    var toks = String(heard || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    for (var i = 0; i < toks.length; i++) if (toks[i].length === 1) return true;
    return false;
  },

  // v119：音节格子的"没听清"判定。一个音节（beau / ti / ful）是 0.3~0.5 秒的
  // 短音，识别端经常把它写成一整串别的东西（读 "beau" 回来 "bow and arrow"）。
  // 这种结果里没有"孩子读了另一个音节"的证据，不该判红挡路（家长：
  // "只要不是明显的错，都让过"）。只有**单** token、而且长度和目标差不多时，
  // 才算真的读出了另一个音 —— 那种仍然判错、要他重读。
  _syllableUnclear(target, heard) {
    var t = String(target || '').toLowerCase().replace(/[^a-z]/g, '');
    var toks = String(heard || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    if (!toks.length) return true;
    if (toks.length > 1) return true;
    return toks[0].length >= t.length + 3;
  },

  // ===== Spell-then-say =====
  // One implementation for every spelling exercise (letters, syllables, and
  // anything added later): hold each piece to read it, hold the whole word,
  // then hear the takes stitched together.
  //
  // Syllables ARE scored; letters are not. A syllable is a pronounceable
  // chunk the recogniser handles well (know, ledge, ful all came back right,
  // via _soundAlike). An isolated letter is not: E came back as "Capitoli"
  // and W as "www." — scoring those would fail a child who read correctly.
  _renderSpellRead(m, mi, dayIdx, word, units, kind) {
    var self = this;
    Recorder.warmUp(); Api.warmup();          // so the first hold does not clip the start
    var selfSync = this;
    setTimeout(function(){ selfSync._syncVocabFootLabel(mi, dayIdx); }, 0);
    this._spell = { mi: mi, kind: kind, word: word.word, total: units.length,
                    takes: {}, unitScores: {}, wordTake: null, score: null,
                    units: units.slice(), phase: 'pieces',
                    // v119：连读读完之前不许去下一个单词。finished/allOk 只说明
                    // "逐格读完了"，contDone 才说明"整串连起来读通过了"。
                    contDone: false };

    var html = '<div class="vocab-step-label">' + (kind === 'letter' ? '字母跟读' : '音节拼合') + '</div>';
    html += this._wordImage(word, true);
    html += '<div class="vocab-word">' + word.word + '</div>';
    html += '<div class="vocab-phonetic">' + word.phonetic + '</div>';
    html += '<div class="read-instruction">按住每个格子读一遍，再按住整词读一遍</div>';

    // v119：这一屏**不再放示范**，也不再挂"先听一遍"的门禁 —— 家长要求
    // "点住单个字母就能读，不要为了听示范先等一段合成、也不要每格都等评分"。
    // 于是整个词卡流程里只留**一处**听：读完所有格子的最后一屏「连起来读」
    // （见 startContinuous），那一段示范与这里的 _spellDemo 逐字相同。
    // 示范这一屏就先预取好，孩子走到连读那屏时点下去是零等待。
    this.prefetchTts(this._spellDemo(kind, units, word.word));

    html += '<div class="spell-row" id="spell-row-' + mi + '">';
    units.forEach(function(u, i) {
      html += '<div class="spell-box hold-target" id="spell-' + mi + '-' + i + '"'
           + ' onpointerdown="App._readUnit(event,' + mi + ',' + i + ')"'
           + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
           + ' oncontextmenu="return false">'
           + (kind === 'letter' ? String(u).toUpperCase() : u) + '</div>';
    });
    // The whole word is just another box — same shape, on its own line but
    // still sized to the word, not stretched across the row.
    html += '<div class="spell-break"></div>';
    html += '<div class="spell-box spell-word hold-target" id="spell-word-' + mi + '"'
         + ' onpointerdown="App._readFullWord(event,' + mi + ')"'
         + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
         + ' oncontextmenu="return false">' + word.word + '</div>';
    html += '</div>';

    html += '<div id="spell-status-' + mi + '"></div>';
    html += '<div id="spell-result-area-' + mi + '"></div>';
    html += '<div id="letter-read-btn-' + mi + '" style="display:none;margin-top:12px">';
    html += '<button class="vocab-btn" onclick="App.nextVocabStage(' + mi + ',' + dayIdx + ',' + m.words.length + ',' + word.stages.length + ')">我读好了 →</button>';
    html += '</div>';
    return html;
  },

  // 按住格子的瞬间，把正在读的字母/音节放大悬浮在页面上方 —— 手指正好
  // 挡住格子里的小字，孩子按着 D 却看不见 D（家长实测反馈）。悬浮层
  // pointer-events:none，不挡任何手势，松手即消失。
  _spellPeekShow(label) {
    this._spellPeekHide();
    var d = document.createElement('div');
    d.id = 'spell-peek';
    d.className = 'spell-peek';
    d.textContent = label;
    document.body.appendChild(d);
  },
  _spellPeekHide() {
    var d = document.getElementById('spell-peek');
    if (d && d.remove) { try { d.remove(); } catch (e) {} }
  },

  // 拼读示范串（v94）：字母阶段 = "Letters: G-U-I-T-A-R, guitar"。
  //
  // 这一句是整块拼读的地基，写法是实测出来的，改之前先看这段结论
  // （线上 TTS → ASR 往返，20 个高频词 × 一轮格式矩阵）：
  //   · 逗号分隔（v93 前："G, U, I, T, A, R. guitar"）：字母串本身正好能
  //     拼成真词时，阿里云会"自作聪明"把整串读成那个单词 —— guitar 听到
  //     "GUITAR GUITAR"、beautiful 听到 "BEAUTIFUL BEAUTIFUL"，孩子根本
  //     没听到字母。家长说"不自然、不够丝滑"根子在这。
  //   · 换成连字符接整词（v93："G-U-I-T-A-R - guitar"）：guitar 修好了，
  //     camera 又栽了（C-A-M-E-R-A 同样被读成 "CAMERA CAMERA"）—— 只换
  //     分隔符是按不住的，它换一种拼读路径照样能合并。
  //   · 句点分隔（"G. U. I. T. A. R."）、斜杠、零宽字符：全部更差，成段乱读。
  //   · 真正稳的是「先声明这是字母，再一口气连读，最后用逗号接整词」：
  //     "Letters: C-A-M-E-R-A, camera" —— 20 个词全部逐字母读对，
  //     字母之间没有停顿（比逗号版本更连），也不再触发那个"智能拼读"。
  //
  // v102：连字符版漏了一类情况 —— **局部**子串拼成真词。前缀 + 连字符只挡住
  // 了"整串拼成词"（GUITAR），挡不住"中间几个字母恰好是一个词"：
  //   panda  的 P-[A-N-D]-A     → A-N-D 被读成英文单词 "and"
  //   island 的 I-S-L-[A-N-D]   → 同上
  // 实测（线上 TTS → ASR 回灌）：
  //   "Letters: P-A-N-D-A, panda"  → 识别 "Letters P, A, and D."
  //   ↑ N 的字母名 /en/ 直接消失（听感就是 /n/），末尾的 A 和整词 panda 也没读。
  //   这正是家长反馈的"字母 N 发音不好，读成了 n"。
  // 换成逗号（保留 Letters: 前缀，它负责挡"智能拼读"）后同一句实测：
  //   "Letters: P, A, N, D, A, panda" → "Letters P A N D"
  //   "Letters: I, S, L, A, N, D, island" → "Letters I S L A N D island."
  //   "Letters: G, U, I, T, A, R, guitar" → "Letters G U I T A R guitar."
  // 字母与整词都完整。逗号本身不会被读出来（斜杠就会 —— 实测 "P/A/N/D/A"
  // 识别成 "P S L E San"，那是在读单词 slash）。
  // 音节阶段（beau, ti, ful）拼起来本来就是词的读音，就是教学目标，沿用原样。
  _spellDemo(kind, units, word) {
    if (kind === 'letter') {
      var us = (units || []).map(function(u) { return String(u).toUpperCase(); });
      return 'Letters: ' + us.join(', ') + ', ' + word;
    }
    return (units || []).join(', ') + '. ' + word;
  },

  _readUnit(ev, mi, idx) {
    var self = this;
    // v119：不再有"先听完示范才能读"的门禁 —— 家长要的是"点住就能读、
    // 一格一格往下走，别为了一段示范在原地等合成"。这一屏的示范已取消，
    // 唯一那一段留在连读屏（startContinuous）。
    var el = document.getElementById('spell-' + mi + '-' + idx);
    if (!el) return;
    var label = el.textContent.trim();
    var status = document.getElementById('spell-status-' + mi);
    var isLetter = this._spell.kind === 'letter';
    // v93：把整串字母喂给识别端当 initial_prompt。孤立字母本来就是
    // whisper 的软肋（v91 实测 E 回来是 "Capitoli"、W 是 "www."），
    // 偏置之后它朝这串字母解码，读对的字母被听岔的比例明显下降。
    var hint = isLetter ? this._spell.units.join(', ') : label;
    el.classList.add('reading');
    this._spellPeekShow(isLetter ? label.toUpperCase() : label);
    // v96：这一格是「一个字母」或「一个音节」，都是 0.5 秒上下的孤立音，
    // 先要 Cloudflare 认 —— 阿里云对这类音频基本吐空（实测 10 个字母 9 个
    // 返回空）。整句跟读不受影响，仍走更快的阿里云。
    this._holdStart(ev, 'unit-' + mi + '-' + idx, label, status, function(out, text) {
      el.classList.remove('reading');
      self._spellPeekHide();
      if (!out) return;
      el.classList.add('read-done');
      if (out.samples) self._spell.takes[idx] = out.samples;   // kept for the joined playback
      self._spell.finished = false;      // a new take must re-run the summary

      // v93：这里原来有一句 self.speak(label) —— 松开手后机器念一遍这个字母。
      // 家长明确不要（"读 B 就不要读出来 B，直接让学生点一下 B，学生自己说 B"），
      // 所以字母跟读全程静音。音节保留回放。
      if (!isLetter) self.speak(label);

      // v93：字母也判对错 —— 家长的规则是「哪个字母读错了要显出来，
      // 全部读对才能走到下一个单词」。判定用专门的 _letterOk，不能拿
      // _soundAlike 判单字母：它容忍一个编辑距离，而 26 个字母两两距离
      // 几乎都是 1（b/p、b/d、m/n 全判"对"），等于没判。
      var ok = isLetter ? self._letterOk(label, text) : self._soundAlike(label, text);
      // v101：发音**不准**但听得出就是这个字母 → 也算过。家长原话：「如果是字母
      // 发音不准，不是很严重的话，就给过 60 分以上；如果单个字母读错了，那该错
      // 的就是错，要求重读」。落到另一个字母的读音上（b→"puh"、d→"tee"）由
      // _letterNear 里的 _MIX_PAIRS 拦住，仍然算错。
      var near = !ok && isLetter && self._letterNear(label, text);
      if (near) ok = true;
      // v99：识别端一个字都没回来 ≠ 孩子读错了。孤立字母/短音节本来就难识别
      // （prefer=cf 的说明见 _holdStart），把"没听清"也算成错，孩子就会
      // 卡在"全部读对才能走"上永远过不去 —— 家长反馈的"跑不通"就是这个。
      // v101 再补两种"定不了性"的情形：识别端自己猜的孤立单字母（实测读 D 回来
      // "N"）、以及根本不像任何字母音的幻觉词（读 E 回来 "Capitoli"）——
      // 两者都没有"孩子读了别的字母"的证据，不该判红。
      // v119：家长再次强调「只要不是明显的错，都让过」—— 判定再放一档：
      //   ① 音节这一格也不再要求"认出音节本身"才算过，凡是**没有**听到
      //      "另一个音节"的证据（识别回来是一串词、或者音节被拆成好几个
      //      token）一律按"没听清"放行；
      //   ② 只有 `_letterNear` / `_soundAlike` 明确落到另一个字母/另一个
      //      音节的读法上，才判错、才要求重读。
      var unclear = !text;
      if (!unclear && !ok) {
        unclear = isLetter
          ? (self._singleLetterGuess(text) || !self._letterish(text))
          : self._syllableUnclear(label, text);
      }
      self._spell.unitScores[idx] = { label: label, ok: unclear ? undefined : ok,
                                     unclear: unclear, near: near, heard: text };
      el.classList.toggle('read-miss', !unclear && !ok);
      el.classList.toggle('read-unclear', unclear);
      el.classList.toggle('read-near', near);
      if (status) {
        // v119：这里不再报分数、也不再报"识别成什么" —— 家长要的是「哪一格
        // 是错的、重读那一格」，不是每一格都停下来等一个分数。所以只有两种
        // 反馈：过了（打勾）、要重读（点名那一格）。
        status.innerHTML = '<div class="tap-result ' + ((ok || unclear) ? 'good' : 'bad') + '">'
          + (ok ? (near ? '✅ 有点不准，算你过' : '✅ 读对了')
                : (unclear ? '✅ 过（这个音算对了）'
                           : '🔁 这一格再读一次「' + label + '」'))
          + '</div>';
      }
      // v119：删掉了这里的 Api.submitSpeakingScore（原来每个字母/音节都提交
      // 一次分数）。家长："不用每个都判分，只要标出哪个字母是错的、重读那一格，
      // 这样不用等分能快一些"。老师端看到的是整词与连读的分（_readFullWord /
      // _readContinuous 仍在提交），字母级的细粒度分数不再上报。
      self._spellProgress(mi);
    }, true, 'en', hint, 'cf', true);  // v99：v96 的注释说字母/音节要 CF 先认，代码却
                                  // 一直没把 'cf' 传下来 —— 结果是先白等阿里云
                                  // （它对孤立音基本吐空）再排 CF。补上，
                                  // 单个字母的识别时长直接砍掉一段。
                                  // v106 第 10 参 true：说完了自动收，不用一直按着。
  },

  async _readFullWord(ev, mi) {
    var self = this;
    // v119：同 _readUnit —— 这一屏没有门禁了，按住就读。
    var el = document.getElementById('spell-word-' + mi);
    var status = document.getElementById('spell-status-' + mi);
    var wordText = this._spell.word;
    if (el) el.classList.add('reading');
    this._spellPeekShow(wordText);
    this._holdStart(ev, 'word-' + mi, wordText, status, async function(out, text) {
      if (el) el.classList.remove('reading');
      self._spellPeekHide();
      if (!out) return;
      if (el) el.classList.add('read-done');
      self.speak(wordText);
      self._spell.finished = false;      // re-reading must re-score and redraw
      var a = self.alignSpeech(wordText, text || '');
      // v139：识别端没回话但确实出了声 → 算读过。分数按及格给，不判 0 分 ——
      // 判 0 分会让「连续读」那一格一直灰着，孩子只能反复重读整词。
      self._micNote(out, 'v148');
      var voiceOk = !text && self._judgeSilence(out).voiceOk;   // v148
      var score = voiceOk ? self.PASS_SCORE : self._wordTakeScore(wordText, text || '', a);
      self._spell.wordTake = out.samples || null;
      self._spell.score = score;
      self._spell.heard = text || (voiceOk ? '（这段已经录下来了）' : null);
      if (status) {
        status.innerHTML = '<div class="tap-result ' + (score >= 60 ? 'good' : 'bad') + '">'
          + (voiceOk ? '✅ 整词读过了' : '整词 ' + score + ' 分')
          + (text ? '<span class="tap-heard">识别：' + text + '</span>'
                  : '<span class="tap-heard">' + (voiceOk ? '录音已保存，可以继续' : '没识别出内容') + '</span>') + '</div>';
      }
      Api.submitSpeakingScore({
        studentId: self._myStudentId(), dayIdx: self.state.currentDay,
        moduleIdx: mi, itemIdx: 99, round: 1, type: 'word',
        label: wordText, score: score, spoken: text, source: 'asr',
      });
      self._spellProgress(mi);
    }, null, 'en', wordText, '', true);   // v106：整词也说完了自动收（第 10 参）
  },

  // 整词打分（v92）：逐词对齐对"目标只有一个词"的目标太狠了 —— 识别把
  // breakfast 听成 "break fast" 两个词，逐词对齐 0 分；孩子明明读对了。
  // 单词目标改成字符级比对：把识别结果的字母连成一串和目标比编辑距离，
  // 轻微口音/个别字母含糊扣得少，多出来的幻觉音节照实扣。
  _wordTakeScore(target, heard, align) {
    var t = String(target || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    var s = String(heard || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!t || !s) return align ? align.score : 0;
    if (s === t) return 100;
    var dist = this._editDistance(t, s);
    var pen = (dist / Math.max(t.length, s.length)) * 100 * 1.3;   // 放宽：个别字母含糊不挡过关
    return Math.max(align ? align.score : 0, Math.max(0, Math.round(100 - pen)));
  },

  // Nothing advances on its own — the child decides when to finish.
  _spellProgress(mi) {
    var sp = this._spell;
    var done = Object.keys(sp.takes).length;
    var area = document.getElementById('spell-result-area-' + mi);
    if (!area) return;
    if (done >= sp.total && sp.wordTake) {
      // Everything is read — play the stitched take back and show the score
      // straight away. Only moving on to the NEXT exercise waits for a tap.
      if (!sp.finished) { sp.finished = true; this._finishSpell(mi); }
      return;
    } else {
      area.innerHTML = '<div class="fs-12 text-sub">已读 ' + done + '/' + sp.total
        + (sp.wordTake ? '，整词已读' : '，整词未读') + '</div>';
    }
  },

  // Stitch every take into one clip so the child hears the pieces then the
  // whole word in sequence, and show the word score.
  // Phase A summary. Deliberately compact: it has to fit the fixed stage
  // height without scrolling, so scores go in a grid rather than one row per
  // letter, and there is no audio player here — the recording belongs to
  // phase B, where the whole thing is read in one breath.
  _finishSpell(mi) {
    var sp = this._spell;
    var area = document.getElementById('spell-result-area-' + mi);
    if (!area) return;

    var cells = '';
    var missed = [];
    for (var i = 0; i < sp.total; i++) {
      var u = sp.unitScores[i];
      var lbl = (u && u.label) || (sp.units && sp.units[i]) || '·';
      if (sp.kind === 'letter') lbl = String(lbl).toUpperCase();
      // v101：多一档 near（发音不准但算过）—— 汇总里它既不是红（读错）也不是
      // 纯黄（没听清），单独一色，家长一眼能看出"这个音还要再练"。
      var state = !u ? 'na'
        : (u.unclear ? 'unclear'
                     : (u.ok === undefined ? 'done'
                                           : (u.near ? 'near' : (u.ok ? 'ok' : 'bad'))));
      // v99：只有"确认读错"才进重读名单。"没听清"（识别端没回内容）不算 ——
      // 把识别失败当成孩子的错，就是这条路上"永远过不去"的根源。
      if (state === 'bad') missed.push(lbl);
      cells += '<span class="sc-cell ' + state + '">' + lbl + '</span>';
    }
    // v93：家长要求「哪个字母读错了要显出来，全部读对才能走到下一个单词」。
    // 以前这里只看「每个格子都读过了」，读错照样解锁 —— 现在按对错解锁。
    sp.allOk = missed.length === 0;
    var noSpeech = !sp.heard;

    var html = '<div class="spell-summary">';
    html += '<div class="ss-head"><span class="ss-score">'
         + (noSpeech || sp.score === null ? '—' : sp.score) + '</span>'
         + '<span class="ss-label">' + (noSpeech ? '整词还没读到（再按一次就好）' : '整词得分') + '</span></div>';
    html += '<div class="sc-grid">' + cells + '</div>';
    if (sp.allOk) {
      // v119：全部读对 → **弹一个卡片**出来（原来只是汇总末尾一颗普通按钮，
      // 孩子常常看不到、直接去点底部那个灰着的「下一个单词」）。卡片里只有
      // 一件事可做：连起来读一遍。读完它底部按钮才会亮。
      html += '<div class="spell-pop" id="spell-pop-' + mi + '">'
           +  '<div class="spell-pop-card">'
           +  '<div class="spc-emoji">🎉</div>'
           +  '<div class="spc-title">全部读对啦！</div>'
           +  '<div class="spc-sub">最后一步：先听一遍，再连起来读</div>'
           +  '<button class="word-read-btn" onclick="App.startContinuous(' + mi + ')">连续读一遍 →</button>'
           +  '</div></div>';
    } else {
      html += '<div class="spell-retry-hint">还有 ' + missed.length + ' 个要重读：'
           + missed.join('、') + '<span>按住红色格子再读一次</span></div>';
    }
    html += '</div>';
    area.innerHTML = html;
    // v90 修复：这里原来调的 this._playCelebrate() 根本不存在（历史笔误），
    // 每次读完都会抛 TypeError，把后面的 _syncVocabFootLabel 一起打断 ——
    // 在新的「读完才放行」逻辑下这会让孩子永远过不去。换成真函数。
    // v93：只有全读对才庆祝 —— 还有错字母时放庆祝动画等于告诉他"过了"。
    if (sp.allOk) this._showCelebration(area);
    this._syncVocabFootLabel(mi, this.state.currentDay);
  },

  // ===== Phase B: read the whole thing in one take =====
  // One hold, letters then the word, straight through. This is the take that
  // gets recorded, played back and scored — the phase A drill is for hearing
  // each piece against the model.
  startContinuous(mi) {
    var sp = this._spell;
    if (!sp) return;
    sp.phase = 'continuous';
    sp.contMiss = false;     // v93：重进连读阶段时清掉上一次的判定
    // v119：还没读出结果之前，这一遍不算数 —— 底部「下一个单词」重新锁上。
    sp.contDone = false;
    this._syncVocabFootLabel(mi, this.state.currentDay);
    var seq = (sp.units || []).map(function(u) {
      return sp.kind === 'letter' ? String(u).toUpperCase() : u;
    }).concat([sp.word]);
    var area = document.getElementById('spell-result-area-' + mi);
    var row = document.getElementById('spell-row-' + mi);
    if (row) row.style.display = 'none';
    var instr = document.querySelector('.read-instruction');
    if (instr) instr.textContent = '按住不放，把下面的字母和单词连着读一遍';

    // 先听再读：连读也要先听一遍完整串法，孩子才知道"连着读"是什么节奏。
    // v119：这是整个词卡流程里**唯一**的一段示范（逐字母那一屏的示范去掉了，
    // 家长只留这一处）。它在逐字母那一屏就已经预取过，这里点下去即出声音。
    var cgid = this._gid('contg', mi);
    var contDemo = this._spellDemo(sp.kind, sp.units, sp.word);
    this.prefetchTts(contDemo);
    var html = '<div class="gate-bar"><button type="button" class="gate-listen" data-gate="' + cgid
         + '" data-say="' + this._escHtml(contDemo) + '">🔊 先听一遍（连起来读）</button></div>';
    html += '<div class="cont-seq gate-locked" data-gate="' + cgid + '">' + seq.map(function(x, i) {
      return '<span class="cont-item" id="cont-' + mi + '-' + i + '">' + x + '</span>';
    }).join('') + '</div>';
    html += '<button class="word-read-btn hold-target gate-locked" data-gate="' + cgid + '" id="cont-btn-' + mi + '"'
         + ' onpointerdown="App._readContinuous(event,' + mi + ')"'
         + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
         + ' oncontextmenu="return false">按住连续读</button>';
    html += '<div id="cont-status-' + mi + '"></div>';
    html += '<div id="cont-result-' + mi + '"></div>';
    if (area) area.innerHTML = html;
  },

  _readContinuous(ev, mi) {
    var self = this;
    var cgid = this._gid('contg', mi);
    if (!this._gateOpen(cgid)) { this._gateNudge(cgid); return; }   // 先听再读
    var sp = this._spell;
    var btn = document.getElementById('cont-btn-' + mi);
    var status = document.getElementById('cont-status-' + mi);
    var seq = (sp.units || []).concat([sp.word]);
    if (btn) btn.classList.add('reading');
    // v93：把整串（字母 + 整词）喂给识别端做 initial_prompt 偏置 —— 串读时
    // whisper 更容易按顺序把每个字母听出来，这是「全对才放行」能成立的前提。
    var contHint = seq.map(function(x) {
      return sp.kind === 'letter' ? String(x).toUpperCase() : x;
    }).join(', ');

    this._holdStart(ev, 'cont-' + mi, sp.word, status, function(out, text) {
      if (btn) btn.classList.remove('reading');
      if (!out) return;
      // v139：识别端没回话但确实出了声 → 连读成立，不让孩子重复整串。
      self._micNote(out, 'v148');
      var voiceOk = !text && self._judgeSilence(out).voiceOk;   // v148
      var res = self._scoreSequence(seq, text);
      sp.contScore = voiceOk ? self.PASS_SCORE : res.score;
      sp.contHeard = text;
      // v93：连续读也必须整串都被听到才放行（家长："同样也是全部读的
      // 没问题了才能走"）。没读全就把底部按钮重新按下去；上面已经给每个
      // 片段标了 ok / miss，孩子看得见漏的是哪个。
      // v100：整词被听到（res.wordHit）就算连读成立 —— 孤立字母识别不到不是
      // 孩子的错，不能因为这个把人锁在门外（家长：读得很好却十几分、过不去）。
      sp.contMiss = voiceOk ? false : (!text || (!res.wordHit && res.ok < seq.length));
      // v119：这一遍读全了，才算"这个单词读完了" —— 底部「下一个单词」这才
      // 亮起来。没读全就一直是灰的（家长："这个单词没有读完，下一个单词这个
      // 地方永远是虚的"）。
      sp.contDone = !sp.contMiss;

      // Mark which pieces were actually heard.
      seq.forEach(function(x, i) {
        var el = document.getElementById('cont-' + mi + '-' + i);
        if (el) el.className = 'cont-item ' + (res.hits[i] ? 'ok' : 'miss');
      });

      var joined = out.samples ? Recorder.join([out.samples], 0) : null;
      var html = '<div class="spell-summary">';
      html += '<div class="ss-head"><span class="ss-score">'
           + (text ? res.score : (voiceOk ? '✓' : '—')) + '</span><span class="ss-label">'
           + (voiceOk ? self.VOICE_PASS_LABEL
                      : (text ? (res.wordHit
                        // v100：整词读对但字母格没被识别到时，别再写「读到 2/6」
                        // 让孩子以为读漏了大半 —— 那句话本身就是误报。
                        ? '连续读得分 · 整词读对了'
                        : '连续读得分 · 读到 ' + res.ok + '/' + seq.length)
                   : '这次没录到声音，再读一次')) + '</span></div>';
      if (joined) {
        html += '<audio id="cont-audio-' + mi + '" controls src="' + URL.createObjectURL(joined.blob)
             + '" style="width:100%;max-width:280px;height:32px"></audio>';
      }
      html += '<div class="ss-actions">';
      html += '<button class="btn-ghost" onclick="App.startContinuous(' + mi + ')">再读一次</button>';
      html += '</div></div>';
      var slot = document.getElementById('cont-result-' + mi);
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      var audio = document.getElementById('cont-audio-' + mi);
      if (audio) { var p = audio.play(); if (p && p.catch) p.catch(function(){}); }

      Api.uploadRecording(out.blob, {
        studentId: self._myStudentId(), dayIdx: self.state.currentDay,
        moduleIdx: mi, itemIdx: 97, round: 1, type: 'continuous',
        label: sp.word, score: res.score, spoken: text,
      }).catch(function(){});
      Api.submitSpeakingScore({
        studentId: self._myStudentId(), dayIdx: self.state.currentDay,
        moduleIdx: mi, itemIdx: 97, round: 1, type: 'continuous',
        label: sp.word, score: res.score, spoken: text, source: 'asr',
      });
      self._syncVocabFootLabel(mi, self.state.currentDay);
    }, true, 'en', contHint, 'cf', 1200);    // v96：连读是一串字母，同 _readUnit 走 Cloudflare
                                             // v106：连读串本身 2~4 秒，安静窗口放宽到
                                             // 1200ms —— 字母之间、字母与整词之间不会停这么久，
                                             // 但孩子读完了就不用一直按着（家长："点久了不耐烦"）。
  },

  // How much of the expected sequence turned up, in order. Each expected item
  // is matched by sound, not spelling — the recogniser writes "No." for know
  // and "T" for ti.
  _scoreSequence(expected, transcript) {
    var hits = new Array(expected.length).fill(false);
    if (!transcript) return { score: 0, ok: 0, hits: hits };
    var toks = String(transcript).toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
                 .split(/\s+/).filter(Boolean);
    var cursor = 0, ok = 0;
    var self = this;
    for (var i = 0; i < expected.length; i++) {
      var hit = false;
      // v93：单个字母改走 _letterOk —— _soundAlike 对 26 个字母等于不判
      // （任意两个的距离基本都是 1）。音节和整词仍用 _soundAlike。
      // v101：字母再加一档 _letterNear（发音不准也算过），与逐字母阶段同一把尺子。
      var one = String(expected[i]).replace(/[^a-zA-Z]/g, '');
      for (var j = cursor; j < toks.length; j++) {
        var match = (one.length === 1)
          ? (this._letterOk(expected[i], toks[j]) || this._letterNear(expected[i], toks[j]))
          : this._soundAlike(expected[i], toks[j]);
        if (match) {
          hits[i] = true; ok++; cursor = j + 1; hit = true; break;
        }
      }
      // 整词和 _readFullWord 同一把尺子：识别把 breakfast 听成 "break fast"
      // 两个词时，逐词匹配必挂 —— 用剩余 token 连成一串做字符级比对。
      if (!hit && i === expected.length - 1 && String(expected[i]).indexOf(' ') < 0) {
        var rest = toks.slice(cursor).join('');
        if (rest && self._wordTakeScore(expected[i], rest, null) >= 70) {
          hits[i] = true; ok++;
        }
      }
    }
    // v100：连读的分数不能只看「逐格听到几个」。孤立字母是识别端最不稳的输入
    // —— 孩子把 "p a n d a panda" 整串读得清清楚楚，回来常常只剩一个
    // "panda"（字母全被吞掉），逐格一算 1/6 = 17 分。家长实测就是这句：
    // 「学生读得很好，还是读了好几次，十几分」。整词的识别比孤立字母可靠得多，
    // 所以把「整词被听到」当作连读成立的凭证：字母格只决定 82~99 的细节分，
    // 整词有没有读出来决定过不过。读错整词（panda 读成 penda）仍然不给保底。
    const total = expected.length || 1;
    const lastIdx = total - 1;
    const word = String(expected[lastIdx] || '').replace(/[^a-zA-Z]/g, '');
    let wordHit = false;
    if (word.length >= 3) {
      for (let j = 0; j < toks.length; j++) {
        if (toks[j].length < 3) continue;   // 单字母 token 不算整词凭证
        if (this._soundAlike(word, toks[j])
            || this._wordTakeScore(word, toks[j], null) >= 70) { wordHit = true; break; }
      }
    }
    if (wordHit && !hits[lastIdx]) { hits[lastIdx] = true; ok++; }
    let score = Math.round(ok / total * 100);
    if (wordHit) {
      const pieces = Math.max(0, total - 1);
      const pieceOk = hits.slice(0, lastIdx).filter(Boolean).length;
      score = Math.max(score, Math.round(82 + 17 * (pieces ? pieceOk / pieces : 1)));
    }
    return { score: score, ok: ok, hits: hits, wordHit: wordHit };
  },


  // ===== Press and hold to record =====
  // Hold to speak, release to stop — the gesture from a voice message. Pointer
  // events (not mouse/touch pairs) so one code path covers finger, pen and
  // mouse, and setPointerCapture so releasing outside the button still ends
  // the recording instead of leaving the mic open.
  // lang: 'en'（默认，朗读跟读）| 'zh'（逐句翻译，说的是中文）。
  // 两条路都走 turbo 快模型：英文 ?model=turbo（language=en），
  // 中文 ?model=turbo&mode=zh（language=zh + 简体提示词，v86 起）。
  // 中文不再留在默认模型上 —— 那条路要整数数组 JSON，请求体膨胀三四倍，
  // 孩子说完要盯着"核对中"多等好几秒。
  // asrHint（v87）：把目标句/目标词传给识别端做 initial_prompt 偏置，
  // Whisper 会朝这个内容解码，读对的词被误判漏读的比例明显下降。
  // asrPrefer（v96）：'cf' = 这次朗读先要 Cloudflare 认（字母/音节这种极短
  // 孤立音只有它认得出来，见 Api.transcribe 的注释），不传就走更快的阿里云。
  // autoStop（v106）：true = 说完了就自动收；数字 = 自定义"安静多久算说完"
  // 的毫秒数。字母跟读是一段 0.5 秒的孤立音，孩子按着不知道什么时候该松手，
  // 一直按着又"不耐烦"（家长原话）。开了它，孩子读完松手就行、甚至不松手
  // 也行 —— 系统听见声音之后再安静够久，自己收尾进评分。
  _holdStart(ev, key, promptLabel, statusEl, onDone, needsTranscript, lang, asrHint, asrPrefer, autoStop) {
    if (ev) {
      ev.preventDefault();
      if (ev.pointerId !== undefined && ev.currentTarget.setPointerCapture) {
        try {
          ev.currentTarget.setPointerCapture(ev.pointerId);
          // v129：被浏览器抢走指针时（弹了复制菜单 / 切应用 / 手势返回），
          // 系统会把 capture 收回去 —— 这就是「收不到 pointerup」的信号。
          // 一丢就跑收尾，别让孩子对着红按钮干等 15 秒。
          var capEl = ev.currentTarget, capId = ev.pointerId, selfCap = this;
          this._holdCapEl = capEl;
          this._holdCapId = capId;
          capEl._lostCapture = function(e) {
            if (!selfCap._holdKey) return;
            clearTimeout(selfCap._holdCap);
            selfCap._holdEnd(e);
          };
          capEl.addEventListener('lostpointercapture', capEl._lostCapture);
        } catch (e) {}
      }
    }
    if (this._holdKey) return;                 // already recording something
    var self = this;
    Api.warmup();                              // 手指按下就把连接热好
    this._holdKey = key;
    this._holdDone = onDone;
    this._holdNeedsTranscript = needsTranscript !== false;
    this._holdFast = lang !== 'zh';
    this._holdHint = String(asrHint || '').slice(0, 200);
    this._holdPrefer = asrPrefer || '';
    this._holdStatusEl = statusEl;
    this._holdStartedAt = Date.now();
    // v147：手指一按就把录音管道热起来。手机上建管道要 150～500ms，
    // 孩子是按下去就开口的 —— 不预热，第一个音（甚至整句）录不进去，
    // 于是"明明读了还显示没录到声音"。Recorder.start 里会复用这条管道。
    try { if (Recorder.prime) Recorder.prime(); } catch (e) {}

    // 自动收尾的看门狗（v106）。只看音量，不看时长：孩子说完了就收，
    // 不逼他一直按着。松手那条路（_holdEnd）不受影响 —— 它先到就先算，
    // 两个入口都走 _holdEnd，第二个人会被 `if (!key) return` 挡掉。
    var stopOn = !!autoStop;
    var silMs = typeof autoStop === 'number' ? autoStop : this.AUTO_STOP_SILENCE_MS;
    // 没有自动收尾的屏（"按住说中文"、"按住跟读"…）：松手才是唯一的收尾信号。
    // v129：上限从 15 秒收到 HOLD_MAX_MS。指针真被浏览器抢走（弹了复制菜单），
    // 靠 lostpointercapture 兜底；这条超时是最后一道，也别让孩子等太久。
    var capMs = stopOn ? this.AUTO_STOP_CAP_MS : this.HOLD_MAX_MS;
    var spoke = false, lastLoudAt = 0;
    var t0 = Date.now();

    var setStatus = function(html) { if (statusEl) statusEl.innerHTML = html; };
    setStatus('<div class="tap-rec"><span class="tap-dot"></span>正在录「' + promptLabel + '」'
            + '<span class="tap-hint">松开结束</span>'
            + '<div class="rec-wave"><div class="rec-wave-bar" id="tap-wave" style="width:0%"></div></div></div>');

    if (!Recorder.supported()) {
      setStatus('<div class="tap-result bad">此浏览器不支持录音</div>');
      this._holdKey = null;
      return;
    }

    // v147：先接上预热管道（手指按下那一刻已经开录），不等 getUserMedia。
    // 预热还没建好的话 prime() 会把这条 start 一起做掉，不会重复开麦。
    var begin = function () {
      return Recorder.start({
        onLevel: function(v) {
          var bar = document.getElementById('tap-wave');
          if (bar) bar.style.width = Math.min(100, Math.round(v * 140)) + '%';
          if (!stopOn) return;
          var now = Date.now();
          if (v >= self.AUTO_STOP_LEVEL) { spoke = true; lastLoudAt = now; return; }
          if (spoke && now - lastLoudAt >= silMs && now - t0 >= self.AUTO_STOP_MIN_MS) {
            stopOn = false;                      // 只收一次
            self._holdEnd();
          }
        }
      });
    };
    var started = false;
    var primeP = (typeof Recorder.prime === 'function') ? Recorder.prime() : Promise.resolve(false);
    primeP
      .then(function () { started = true; return begin(); })
      .catch(function () { started = true; return begin(); })
      .catch(function() {
        setStatus('<div class="tap-result bad">无法访问麦克风，请允许权限</div>');
        self._holdKey = null;
      });
    void started;

    clearTimeout(this._holdCap);
    this._holdCap = setTimeout(function() { self._holdEnd(); }, capMs);
  },

  // 自动收尾的量（v106）。阈值取的是"有人声"的量级：麦克风已开 AGC，
  // 正常说话每帧峰值 0.1~0.5，安静房间底噪在 0.01 上下 —— 0.05 正好落在
  // 两者中间，既不会被底噪骗成"说完了"，也不会漏掉轻声的字母。
  AUTO_STOP_LEVEL: 0.05,
  AUTO_STOP_SILENCE_MS: 600,     // 字母/整词：说完安静 0.6 秒就收
  AUTO_STOP_MIN_MS: 350,         // 按下到能自动收，至少留 350ms（别把起手的音切掉）
  AUTO_STOP_CAP_MS: 8000,        // 自动收的那几屏，最长也就等 8 秒（原来 15 秒）
  // v129：非自动收的屏（按住说中文 / 跟读）的超时上限。孩子读一句话用不了
  // 10 秒；真被浏览器抢走指针时，早一点收尾、早一点能重来。
  HOLD_MAX_MS: 10000,

  async _holdEnd(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var key = this._holdKey, onDone = this._holdDone, statusEl = this._holdStatusEl;
    var needs = this._holdNeedsTranscript;
    var fast = this._holdFast !== false;
    var heldMs = Date.now() - (this._holdStartedAt || 0);
    this._holdKey = null; this._holdDone = null;
    clearTimeout(this._holdCap);
    // v129：解掉上一步挂的 lostpointercapture 监听，别越积越多。
    if (this._holdCapEl && this._holdCapEl._lostCapture) {
      try { this._holdCapEl.removeEventListener('lostpointercapture', this._holdCapEl._lostCapture); } catch (e) {}
      this._holdCapEl._lostCapture = null;
    }
    this._holdCapEl = null;
    if (!key) return;

    // A stray tap is not an attempt — drop it rather than scoring silence.
    // v106：门槛从 220ms 收到 140ms。字母本来就只有半秒长，孩子快按快松是
    // 正常的读法（家长："不要让学生点那么久"），220 会把认真的快读判成
    // "没按住"，逼他按得更久 —— 正好是要治的那个毛病。防误触仍然靠
    // "录到的音频"这一关：真误触的录音里没有人声，识别为空 → 走"没听清"。
    if (heldMs < 140) {
      try { await Recorder.stop(); } catch (e) {}
      if (statusEl) statusEl.innerHTML = '<div class="tap-result bad">太快了，按住读一下再松手</div>';
      return;
    }

    if (statusEl && needs) statusEl.innerHTML = '<div class="tap-rec"><span class="tap-spin"></span>核对中，马上出分…</div>';
    var out = null;
    try { out = await Recorder.stop(); } catch (e) { console.warn('hold stop failed', e); }
    if (!out || !out.blob) {
      if (statusEl) statusEl.innerHTML = '<div class="tap-result bad">没有录到声音，再按住试一次</div>';
      if (onDone) onDone(null, null);
      return;
    }
    // Pieces of a word are practice, not a test — no upload, no recognition.
    if (!needs) { if (onDone) onDone(out, null); return; }
    // Send the padded copy — short clips make Whisper hallucinate.
    var forAsr = (out.samples && Recorder.padForAsr(out.samples)) || out.blob;
    // 中文也走 turbo（mode=zh），worker 会传 language=zh + 简体提示词；
    // turbo 失败或返回空时服务端自动降级回默认多语种模型。
    // hint：目标句/词的提示词偏置（v87），识别更准、误判漏读更少。
    // v99：这一层必须自己兜住错误。以前没兜，识别链路整个抛错时 onDone
    // 不会被调用 —— 页面就永远停在"核对中，马上出分…"，孩子白读一遍、
    // 按钮也一直是按不下去的红色（家长反馈的"这里跑不通"）。
    var res = null;
    try {
      // v131：清预算（每次按住都是一个独立的朗读），并带上 budgeted 让它
      // 受统一预算约束 —— 字母/音节那条带 prefer 的本来就只打一趟。
      Api.asrResetBudget();
      res = await Api.transcribe(forAsr, null,
        fast ? { fast: true, hint: this._holdHint || '', prefer: this._holdPrefer || '', budgeted: true }
             : { fast: true, lang: 'zh', budgeted: true });
    } catch (e) { console.warn('hold transcribe failed:', e); }
    var text = res && res.text ? res.text : null;
    if (Api.isFillerTranscript(text)) text = null;
    if (onDone) { try { onDone(out, text); } catch (e) { console.warn('hold onDone failed:', e); } }
  },

  // Writing template
  renderWritingTemplate(m, mi, dayIdx) {
    const blanks = m.blanks || [];
    // 参考单词的中文是「不会的时候才去翻」的：默认藏着，点了才摊开，
    // 顺手把这个词念一遍。所以**不**做「点哪个空就点亮哪个词」的联动 ——
    // 那等于系统直接把答案递过去，孩子就不用自己想了。
    const kws = this._kwList(m);
    // 上次填过的答案回填 —— 从「朗读」那一步点上一题回来时不用重打一遍
    const sid = this._myStudentId();
    const fst = this._writingFillState(mi);
    const prevVal = (bi) => {
      let v = (fst[bi] && fst[bi].v != null) ? String(fst[bi].v) : null;
      if (v == null) {
        const rec = this.state.answers[Api.answerKey(sid, dayIdx, mi, bi)];
        v = rec ? String(rec.value == null ? '' : rec.value) : '';
      }
      return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    };

    let html = '<div class="writing-template">';
    html += '<div class="writing-banner">⚠️ ' + m.requirement_cn + '</div>';

    // 参考单词：粘在滚动区顶部。作文一长，孩子滑到后半段时原始的
    // 参考单词：粘在滚动区顶部。作文一长，孩子滑到后半段时原始的
    // 关键词条早就滚出去了，遇到不会写的词得往回翻 —— 这里让它常驻。
    //
    // 这里只给英文，**中文要孩子自己配对出来**：点某个词 → 听发音 + 从
    // 打乱的中文里挑出它的意思。配对上了才显示「英文 · 中文」。
    // 系统不主动把「英文＝中文」摆在他面前，认一遍比看一眼记得住。
    html += '<div class="writing-kwbar">';
    html += '<div class="wk-title">📌 参考单词（点一下听发音 → 找出它的中文意思）</div>';
    html += '<div class="writing-keywords">';
    kws.forEach((it, ki) => {
      html += this._kwChipHtml(mi, ki, it, !!this._kwState(mi)[ki], this._kwShown(mi, ki));
    });
    html += '</div>';
    // 中文候选池：默认不出现，点了英文词才摊开，配对成功就收回去
    html += '<div class="wk-pool" id="wk-pool-' + mi + '" style="display:none">'
         +  '<div class="wk-pool-hint" id="wk-pool-hint-' + mi + '"></div>'
         +  '<div class="wk-pool-items" id="wk-pool-items-' + mi + '"></div>'
         +  '</div>';
    html += '</div>';
    // 点下去就要响：多词短语先预取一份音频（单个词走的是有道词典，不进预取）
    kws.forEach(it => this.prefetchTts(it.en));

    // 配对没做完，横线上就填不了 —— 先认词，再动笔（老师端是预览，不锁）
    const lockHtml = this._writingLockHintHtml(mi, m);
    if (lockHtml) html += '<div class="wf-lock" id="wf-lock-' + mi + '">' + lockHtml + '</div>';

    html += '<div class="card mb-16"><div class="card-title fs-12">📝 完成作文（填入空白处）</div>';
    html += '<div class="writing-essay">';
    let text = m.template;
    const fillOpen = this.isTeacher() || this._kwAllPaired(mi, m);
    m.blanks.forEach((b, bi) => {
      const v = prevVal(bi);
      text = text.replace('{{' + b.id + '}}', '<input type="text" class="writing-blank-input' + (fillOpen ? '' : ' locked') + '" data-blank="' + b.id + '" data-answer="' + b.answer + '" value="' + v + '" placeholder="' + b.hint_cn + '"'
        + (fillOpen ? '' : ' readonly onclick="App._writingLockedClick(' + mi + ')"')
        + ' autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="border:none;border-bottom:2px solid var(--primary);text-align:center;color:var(--primary);font-weight:600;width:120px;background:transparent;font-size:14px">');
    });
    html += text;
    html += '</div></div>';
    html += '<button class="btn btn-primary" onclick="App.submitWriting(' + mi + ',' + dayIdx + ')">提交批改</button>';
    html += '<div id="writing-result-' + mi + '">' + this._writingReviewHtml(m, mi, dayIdx) + '</div>';
    html += '</div>';
    return html;
  },

  // 空填成什么样自己记一份（本地）。不能复用 Api 的答题记录：那份是
  // 一次写入不再改的（saveAnswer 见到已存在的 key 直接返回），孩子第一次
  // 填错、改对之后再提交，记录里留的还是错的那个值，门禁就永远开不了。
  _WF_STORE_KEY: 'amy-writing-fill-v1',
  _writingFillStore() {
    if (!this._wfStore) {
      try { this._wfStore = JSON.parse(localStorage.getItem(this._WF_STORE_KEY) || '{}') || {}; }
      catch (e) { this._wfStore = {}; }
    }
    return this._wfStore;
  },
  _writingFillState(mi) {
    const store = this._writingFillStore();
    const k = this._writingReadKey(mi);
    if (!store[k] || typeof store[k] !== 'object') store[k] = {};
    return store[k];
  },
  _saveWritingFill() {
    try { localStorage.setItem(this._WF_STORE_KEY, JSON.stringify(this._writingFillStore())); } catch (e) {}
  },
  _writingAllBlanksRight(m, mi, dayIdx) {
    const blanks = m.blanks || [];
    if (!blanks.length) return false;
    const st = this._writingFillState(mi);
    return blanks.every(function (_, bi) { return !!(st[bi] && st[bi].ok); });
  },
  // 重新进入这一屏（上一题回来 / 刷新后回到这题）时，把「填对了就点底部
  // 开始朗读」的提示还原出来，不用孩子再点一次提交。
  _writingReviewHtml(m, mi, dayIdx) {
    // 配对记录被清掉（换设备/清缓存）时别出现「全部填对」和横线锁着同时在场
    if (!this.isTeacher() && !this._kwAllPaired(mi, m)) return '';
    if (!this._writingAllBlanksRight(m, mi, dayIdx)) return '';
    return '<div class="wr-start-hint ok">✅ 全部填对！点底部「开始朗读」，读完才能进入下一题</div>';
  },

  // 关键词列表归一化：keywords 可以是字符串数组（中文另给 keywords_cn），
  // 也可以直接写成 [{en, cn}]。中文三级兜底，最后从对应空的中文提示里借。
  _kwList(m) {
    const blanks = (m && m.blanks) || [];
    const cns = (m && m.keywords_cn) || [];
    return ((m && m.keywords) || []).map(function (k, ki) {
      let en = '', cn = '';
      if (k && typeof k === 'object') {
        en = String(k.en || k.word || '');
        cn = String(k.cn || k.hint_cn || '');
      } else {
        en = String(k == null ? '' : k);
      }
      if (!cn) cn = String(cns[ki] || '');
      if (!cn) {
        const lk = en.toLowerCase();
        const b = blanks.filter(function (x) {
          return String(x.answer || '').toLowerCase() === lk
              || String(x.hint_en || '').toLowerCase() === lk;
        })[0];
        cn = b ? String(b.hint_cn || '') : '';
      }
      return { en: en, cn: cn };
    });
  },

  _kwModule(mi) {
    const day = HOMEWORK_DATA[this.state.currentDay];
    return (day && day.modules && day.modules[mi]) || null;
  },

  // 配对进度要落 localStorage：它现在是填空的前置关卡 —— 刷新一下
  // 配对记录没了、横线却还填着上次的答案，门禁就自相矛盾了。
  _KW_PAIR_KEY: 'amy-writing-kwpair-v1',
  _kwState(mi) {
    if (!this._kwPairCache) {
      try { this._kwPairCache = JSON.parse(localStorage.getItem(this._KW_PAIR_KEY) || '{}') || {}; }
      catch (e) { this._kwPairCache = {}; }
    }
    const k = this._writingReadKey(mi);
    if (!this._kwPairCache[k] || typeof this._kwPairCache[k] !== 'object') this._kwPairCache[k] = {};
    return this._kwPairCache[k];
  },
  _saveKwPair() {
    try { localStorage.setItem(this._KW_PAIR_KEY, JSON.stringify(this._kwPairCache || {})); } catch (e) {}
  },
  // 配对好了的中文是不是正被眼睛挡着。只在内存里：刷新后一律重新遮上，
  // 「要看自己点」才是默认状态。
  _kwShown(mi, ki) {
    const key = this._writingReadKey(mi);
    return !!(this._kwShownMap && this._kwShownMap[key] && this._kwShownMap[key][ki]);
  },
  _setKwShown(mi, ki, on) {
    if (!this._kwShownMap) this._kwShownMap = {};
    const key = this._writingReadKey(mi);
    if (!this._kwShownMap[key]) this._kwShownMap[key] = {};
    if (on) this._kwShownMap[key][ki] = true;
    else delete this._kwShownMap[key][ki];
  },
  _kwUnpairedCount(mi, m) {
    const kws = this._kwList(m);
    const paired = this._kwState(mi);
    let n = 0;
    kws.forEach(function (_, ki) { if (!paired[ki]) n++; });
    return n;
  },
  // 5 个词全配对上了没有 —— 这是「能不能往横线上写字」的门槛
  _kwAllPaired(mi, m) {
    return this._kwList(m).length > 0 && this._kwUnpairedCount(mi, m) === 0;
  },

  // 一个参考单词长什么样：
  //   没配对 → 🔊 best friend                      （点它＝听发音 + 开始配中文）
  //   配好了 → ✓ best friend  👁  + 被眼睛遮住的中文（点 👁 才露出来）
  _kwChipHtml(mi, ki, it, paired, revealed) {
    const e = this._escHtml;
    let h = '<div class="keyword-chip kw-tap' + (paired ? ' paired' : '') + (revealed ? ' reveal' : '')
          + '" id="kw-' + mi + '-' + ki + '">';
    h += '<button type="button" class="kw-hit" id="kwhit-' + mi + '-' + ki + '"'
       + ' onclick="App._kwPeek(' + mi + ',' + ki + ')" aria-pressed="false">'
       + '<span class="kw-en">' + e(it.en) + '</span></button>';
    h += '<button type="button" class="kw-eye" id="kweye-' + mi + '-' + ki + '"'
       + ' onclick="App._kwReveal(' + mi + ',' + ki + ')" aria-label="看中文意思">'
       + '<svg class="icon"><use href="#' + (revealed ? 'i-eye' : 'i-eye-off') + '"/></svg></button>';
    h += '<span class="kw-cn">' + e(it.cn) + '</span>';
    h += '</div>';
    return h;
  },

  // 点眼睛：把遮住的中文露出来；再点一下重新遮上。
  // 这不是考他 —— 想看随时能看，只是不让他一直盯着中文不动脑。
  _kwReveal(mi, ki) {
    const m = this._kwModule(mi);
    if (!m) return;
    if (!this._kwState(mi)[ki]) return;                 // 还没配对，没有可看的中文
    this._setKwShown(mi, ki, !this._kwShown(mi, ki));
    this._kwRenderBar(mi, m);
  },
  _kwPickMap() {
    if (!this._kwPick) this._kwPick = {};
    return this._kwPick;
  },
  // 中文候选的顺序：第一次摊开时打乱一次并存起来。顺序固定的话孩子会去
  // 背位置，配对就退化成「点第三个」，白练了。
  _kwShufflePool(mi, kws, paired) {
    if (!this._kwPool) this._kwPool = {};
    const k = this._writingReadKey(mi);
    let order = this._kwPool[k];
    if (!order) {
      order = [];
      for (let i = 0; i < kws.length; i++) if (!paired[i]) order.push(i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }
      this._kwPool[k] = order;
    }
    return order.filter(function (ki) { return !paired[ki]; });
  },

  // 点参考单词：听发音 + 开始给它找中文（摊开打乱的中文候选）。
  // 已经配对过的词再点就只发声（中文一直显示在那儿了）。
  _kwPeek(mi, ki) {
    const m = this._kwModule(mi);
    if (!m) return;
    const it = this._kwList(m)[ki];
    if (!it) return;
    const paired = this._kwState(mi);
    if (it.en) this.speak(it.en);                 // 先让耳朵记住这个词
    if (paired[ki]) return;                       // 已配好，中文已经在上面了
    this._kwPickMap()[this._writingReadKey(mi)] = ki;
    this._kwRenderBar(mi, m);
  },

  // 点中文候选：对上了才算配对成功 —— 错了抖一下、提示再想想，
  // 但绝不把正确答案指出来，答案要孩子自己找。
  _kwPair(mi, ki) {
    const m = this._kwModule(mi);
    if (!m) return;
    const kws = this._kwList(m);
    const paired = this._kwState(mi);
    const key = this._writingReadKey(mi);
    const pick = this._kwPickMap()[key];
    if (pick == null || paired[pick]) return;

    if (pick !== ki) {
      const chip = document.getElementById('wkcn-' + mi + '-' + ki);
      if (chip) {
        chip.classList.add('wk-wrong');
        setTimeout(function () {
          const c = document.getElementById('wkcn-' + mi + '-' + ki);
          if (c) c.classList.remove('wk-wrong');
        }, 700);
      }
      const hint = document.getElementById('wk-pool-hint-' + mi);
      if (hint) hint.textContent = '🤔 不是这个，再想想';
      return;
    }

    paired[ki] = true;
    this._saveKwPair();
    delete this._kwPickMap()[key];
    // 配对成功先亮一下：让他看见「选的就是它」，随后自动把中文遮回眼睛后面，
    // 想看再点眼睛。中文一直摊着的话，配对就变成抄一遍了。
    this._setKwShown(mi, ki, true);
    // 配对成功再读一遍：把「音 — 形 — 义」这一次绑牢
    if (kws[ki].en) this.speak(kws[ki].en);
    this._kwRenderBar(mi, m);
    const self = this;
    setTimeout(function () {
      self._setKwShown(mi, ki, false);
      self._kwRenderBar(mi, m);
    }, this.KW_HIDE_MS);
  },

  // 按状态重画参考区：哪些已配对（显示中文 + ✓）、哪个正在配对（高亮）、
  // 候选池里还剩哪些中文没被认领。
  _kwRenderBar(mi, m) {
    // 配对进度一变，横线上的锁也要跟着变（配对全做完才让写字）
    this._writingSyncFillLock(mi, m);
    const kws = this._kwList(m);
    const paired = this._kwState(mi);
    const key = this._writingReadKey(mi);
    const pick = this._kwPickMap()[key];
    const picking = (pick != null && !paired[pick]) ? pick : null;

    kws.forEach((it, ki) => {
      const chip = document.getElementById('kw-' + mi + '-' + ki);
      if (!chip) return;
      const on = !!paired[ki];
      chip.classList.toggle('paired', on);
      chip.classList.toggle('picking', picking === ki);
      chip.classList.toggle('reveal', on && this._kwShown(mi, ki));
      const hit = document.getElementById('kwhit-' + mi + '-' + ki);
      if (hit) hit.setAttribute('aria-pressed', picking === ki ? 'true' : 'false');
      const eye = document.getElementById('kweye-' + mi + '-' + ki);
      if (eye) {
        eye.innerHTML = '<svg class="icon"><use href="#'
          + (this._kwShown(mi, ki) ? 'i-eye' : 'i-eye-off') + '"/></svg>';
      }
    });

    const pool = document.getElementById('wk-pool-' + mi);
    const items = document.getElementById('wk-pool-items-' + mi);
    const hint = document.getElementById('wk-pool-hint-' + mi);
    if (!pool || !items) return;

    if (picking == null) { pool.style.display = 'none'; items.innerHTML = ''; return; }

    const rest = this._kwShufflePool(mi, kws, paired);
    if (!rest.length) {
      if (hint) hint.textContent = '🎉 全部配对完成，作文就靠这些词写出来';
      items.innerHTML = '';
      pool.style.display = '';
      return;
    }
    if (hint) hint.textContent = '👆 找出「' + kws[picking].en + '」的中文意思';
    let h = '';
    rest.forEach(ki => {
      h += '<button type="button" class="wk-cn-chip" id="wkcn-' + mi + '-' + ki + '"'
         + ' onclick="App._kwPair(' + mi + ',' + ki + ')">' + this._escHtml(kws[ki].cn) + '</button>';
    });
    items.innerHTML = h;
    pool.style.display = '';
  },

  // ===== 写作：填空横线的锁（配对没做完就不让动笔）=====
  // 配对成功的中文先亮这么久，然后自动遮回眼睛后面（测试里会调小）
  KW_HIDE_MS: 1500,

  // 横线上那把锁：参考单词没配对完，横线就填不了 —— 先认词，再动笔。
  // 老师端是预览，不锁。
  _writingLockHintHtml(mi, m) {
    if (this.isTeacher()) return '';
    const total = this._kwList(m).length;
    const left = this._kwUnpairedCount(mi, m);
    if (!left) return '✅ 参考单词都配对好了，可以填横线上的词了';
    return '🔒 先把上面 ' + total + ' 个单词和中文意思配对好（还剩 <b>' + left
         + '</b> 个），才能填横线上的词';
  },
  _writingSyncFillLock(mi, m) {
    const open = this.isTeacher() || this._kwAllPaired(mi, m);
    (m.blanks || []).forEach(function (b) {
      const input = document.querySelector('[data-blank="' + b.id + '"]');
      if (!input) return;
      if (open) {
        if (input.removeAttribute) input.removeAttribute('readonly');
        if (input.classList) input.classList.remove('locked');
      } else {
        if (input.setAttribute) input.setAttribute('readonly', 'readonly');
        if (input.classList) input.classList.add('locked');
      }
    });
    const lock = document.getElementById('wf-lock-' + mi);
    if (!lock) return;
    lock.innerHTML = this._writingLockHintHtml(mi, m);
    if (lock.classList) lock.classList.toggle('ok', open);
  },
  // 锁着的时候点横线：把提示条抖一下，免得孩子以为是手机没反应
  _writingLockedClick(mi) {
    const lock = document.getElementById('wf-lock-' + mi);
    if (!lock || !lock.classList) return;
    lock.classList.add('shake');
    setTimeout(function () {
      const l = document.getElementById('wf-lock-' + mi);
      if (l && l.classList) l.classList.remove('shake');
    }, 700);
  },

  // ===== 写作：写完之后的朗读全文 =====
  // 作文的英文按句拆开 —— 和阅读模块的逐句跟读是同一份规则
  //（_splitSentences 的 lookbehind 切句 + 逗号不进句尾）。
  _writingSentences(m) {
    return this._splitSentences((m && m.full_text) || '');
  },

  // 读对过哪几句存在本机（localStorage）。刷新 / 重进这一屏不用重读已经
  // 读过的句子，断点续做也才有依据。
  _WR_STORE_KEY: 'amy-writing-read-v1',
  _writingReadStore() {
    if (!this._wrStore) {
      try { this._wrStore = JSON.parse(localStorage.getItem(this._WR_STORE_KEY) || '{}') || {}; }
      catch (e) { this._wrStore = {}; }
    }
    return this._wrStore;
  },
  _writingReadKey(mi) {
    // 多周轮换（v87）：写作练习的本地进度按周分段，第 1 周沿用旧格式。
    return (this._weekIdx() > 0 ? this._weekIdx() + '-' : '') + this.state.currentDay + '-' + mi;
  },
  _writingReadState(mi) {
    const store = this._writingReadStore();
    const k = this._writingReadKey(mi);
    if (!store[k] || typeof store[k] !== 'object') store[k] = { passed: {} };
    if (!store[k].passed) store[k].passed = {};
    return store[k];
  },
  _saveWritingRead() {
    try { localStorage.setItem(this._WR_STORE_KEY, JSON.stringify(this._writingReadStore())); } catch (e) {}
  },
  // 整篇都读对了没有 —— 门禁和解锁都以它为准
  _writingAllRead(m, mi) {
    const sents = this._writingSentences(m);
    if (!sents.length) return true;
    const st = this._writingReadState(mi);
    return sents.every(function (_, i) { return !!st.passed[i]; });
  },
  // 当前这一步是不是「写作朗读」，以及它放行了没有。nextStep 的硬门禁用。
  _writingReadGateOpen() {
    const steps = this._buildSteps(this.state.currentDay);
    const s = steps[this.state.stepIdx];
    if (!s || s.kind !== 'writingread') return true;
    // v138：老师预览也不再豁免 —— 预览要验的就是"能不能不读就过去"。
    // 老师真想快进，用底部那颗「跳过本题（老师）」（nextStep(true) 会绕开这里）。
    const m = HOMEWORK_DATA[this.state.currentDay].modules[s.mi];
    return this._writingAllRead(m, s.mi);
  },

  // ===== 写作第二步：朗读全文 =====
  // 一句话一张卡：点句子听朗读，按住按钮跟读。读对≥60 分变绿打勾，
  // 没到分只能重读这一句。全部读对才出现全文中文翻译，并解锁「下一题」。
  renderWritingRead(m, mi, dayIdx) {
    const sents = this._writingSentences(m);
    if (!sents.length) return '';
    const st = this._writingReadState(mi);
    const allRead = this._writingAllRead(m, mi);
    Recorder.warmUp(); Api.warmup();

    let html = '<div class="writing-read">';
    html += '<div class="wr-head">🎤 朗读全文</div>';
    html += '<div class="wr-sub">点单词看中文意思，点 🔊 先听一遍，再按住按钮跟读。读对全部 '
         + sents.length + ' 句才能进入下一题。</div>';
    html += '<div class="wr-progress" id="wr-progress-' + mi + '"></div>';
    sents.forEach((s, si) => {
      const ok = !!st.passed[si];
      // v109 同阅读逐句：句子分成"可点的词"和"独立的听示范按钮"两块 ——
      // 以前整句就是听入口，孩子点单词只会听整句，查不到意思。
      const gid = this._gid('wrg', mi, si);
      html += '<div class="wr-item' + (ok ? ' done' : '') + '" id="wr-item-' + mi + '-' + si + '">';
      html += '<div class="wr-sent">'
           + '<span class="wr-no">' + (si + 1) + '</span>'
           + '<span class="wr-words">' + this._wordSpans(s) + '</span>'
           + '<span class="wr-flag">' + (ok ? '✅' : '') + '</span>'
           + this._gateListenHtml(gid, s, '🔊 听这句')
           + '</div>';
      html += '<button class="word-read-btn hold-target gate-locked" data-gate="' + gid + '"'
           + ' id="wr-btn-' + mi + '-' + si + '"'
           + ' onpointerdown="App._readWritingSentence(event,' + mi + ',' + si + ')"'
           + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
           + ' oncontextmenu="return false">' + (ok ? '重读这句' : '按住跟读') + '</button>';
      html += '<div id="wr-status-' + mi + '-' + si + '"></div>';
      html += '<div id="wr-result-' + mi + '-' + si + '"></div>';
      html += '</div>';
    });
    html += '<div id="wr-cn-' + mi + '">' + (allRead ? this._writingTranslationHtml(m) : '') + '</div>';
    html += '</div>';
    // 渲染完把进度条和门禁状态按已有记录补一次
    setTimeout(() => this._refreshWritingRead(mi, m), 0);
    return html;
  },

  _readWritingSentence(ev, mi, si) {
    const self = this;
    const gid = this._gid('wrg', mi, si);
    if (!this._gateOpen(gid)) { this._gateNudge(gid); return; }   // 先听再读
    Api.warmup();                              // 手指按下就把连接热好
    const m = HOMEWORK_DATA[this.state.currentDay].modules[mi];
    const sent = this._writingSentences(m)[si] || '';
    const btn = document.getElementById('wr-btn-' + mi + '-' + si);
    const status = document.getElementById('wr-status-' + mi + '-' + si);
    if (btn) btn.classList.add('reading');

    this._holdStart(ev, 'wr-' + mi + '-' + si, '这一句', status, function(out, text) {
      if (btn) btn.classList.remove('reading');
      if (!out) return;
      const a = self.alignSpeech(sent, text || '');
      const slot = document.getElementById('wr-result-' + mi + '-' + si);
      // v139：出了声就算过 —— 识别端没回话不让孩子重读。
      self._micNote(out, 'v148');
      const voiceOk = !text && self._judgeSilence(out).voiceOk;   // v148

      let html = '<div class="spell-summary">';
      html += '<div class="ss-head"><span class="ss-score">'
           + (text ? a.score : (voiceOk ? '✓' : '—')) + '</span>'
           + '<span class="ss-label">'
           + (text ? '读对 ' + a.ok + '/' + a.total + ' 个词'
                   : (voiceOk ? self.VOICE_PASS_LABEL : '这次没录到声音，再读一次')) + '</span></div>';
      if (text) {
        html += '<div class="align-sentence">';
        a.items.forEach(function(x) {
          if (x.status === 'extra') return;
          const cls = x.status === 'ok' ? 'w-ok' : x.status === 'wrong' ? 'w-bad' : 'w-miss';
          const bad = (x.status === 'wrong' || x.status === 'missing');
          html += '<span class="lk-word ' + cls + '"'
               + (bad ? ' data-repair-word="' + self._escHtml(x.target) + '"' : '')
               + '>' + x.target + '</span> ';
        });
        html += '</div>';
      }
      if (out.samples) {
        const joined = Recorder.join([out.samples], 0);
        if (joined) html += '<audio id="wr-audio-' + mi + '-' + si + '" controls src="'
                         + URL.createObjectURL(joined.blob) + '" style="width:100%;max-width:280px;height:32px"></audio>';
      }
      html += '</div>';
      if (slot) slot.innerHTML = html;
      if (status) status.innerHTML = '';

      const audio = document.getElementById('wr-audio-' + mi + '-' + si);
      if (audio) { const p = audio.play(); if (p && p.catch) p.catch(function(){}); }

      // v87：和阅读逐句同一条规则 —— 有读错/漏读的词就先进单词修复，
      // 全部读对才能再读整句，整句读对（无错词）才算这句通过。
      const wrongs = [];
      if (text) {
        a.items.forEach(function(x) {
          if ((x.status === 'wrong' || x.status === 'missing') && wrongs.indexOf(x.target) < 0) {
            wrongs.push(x.target);
          }
        });
      }
      const allOk = !!text && wrongs.length === 0;

      // v139：识别端空手而归但确实出了声 —— 这句算过。
      if (allOk || (voiceOk && !text)) self._markWritingSentenceDone(mi, si, m);
      else if (slot) {
        if (wrongs.length) self._renderSentenceRepair('wr', mi, si, wrongs);
        else slot.insertAdjacentHTML('beforeend', self._retryHint(false, !!text));
      }

      if (text) {
        Api.submitSpeakingScore({
          studentId: self._myStudentId(), dayIdx: self.state.currentDay,
          moduleIdx: mi, itemIdx: si, round: 1, type: 'writing-sentence',
          label: sent, score: a.score, spoken: text, source: 'asr',
        });
      }
      Api.uploadRecording(out.blob, {
        studentId: self._myStudentId(), dayIdx: self.state.currentDay,
        moduleIdx: mi, itemIdx: si, round: 1, type: 'writing-sentence',
        label: sent, score: a.score,
      }).catch(function(){});
    }, true, 'en', sent);
  },

  _markWritingSentenceDone(mi, si, m) {
    const st = this._writingReadState(mi);
    st.passed[si] = true;
    this._saveWritingRead();
    const item = document.getElementById('wr-item-' + mi + '-' + si);
    if (item) {
      item.classList.add('done');
      const flag = item.querySelector('.wr-flag');
      if (flag) flag.textContent = '✅';
      const b = document.getElementById('wr-btn-' + mi + '-' + si);
      if (b) b.textContent = '重读这句';
    }
    this._refreshWritingRead(mi, m);
  },

  // 数一遍读对了几句：全对了就放全文中文翻译 + 解锁「下一题」。
  _refreshWritingRead(mi, m) {
    const sents = this._writingSentences(m);
    const st = this._writingReadState(mi);
    let done = 0;
    sents.forEach(function (_, i) { if (st.passed[i]) done++; });
    const allRead = done >= sents.length;

    const prog = document.getElementById('wr-progress-' + mi);
    if (prog) {
      prog.innerHTML = allRead
        ? '<span class="wr-allok">🎉 全部读完了，中文翻译在下面</span>'
        : '已读对 <b>' + done + '</b> / ' + sents.length + ' 句';
    }

    if (allRead) {
      const cn = document.getElementById('wr-cn-' + mi);
      if (cn && !cn.innerHTML) {
        cn.innerHTML = this._writingTranslationHtml(m);
        setTimeout(function () {               // 翻译直接送进视野，别让孩子自己找
          const el = document.getElementById('wr-cn-' + mi);
          if (el && el.scrollIntoView) {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
          }
        }, 160);
      }
      this._unlockStep();
    }
    // 老师端是预览，不设门槛
    if (this.isTeacher()) this._unlockStep();
  },

  _writingTranslationHtml(m) {
    if (!m.full_text_cn) return '';
    let html = '<div class="wr-cn">';
    html += '<div class="wr-cn-title">🀄 全文中文翻译</div>';
    html += '<div class="wr-cn-text">' + m.full_text_cn + '</div>';
    html += '</div>';
    return html;
  },

  // 解锁「下一题」——和 _gateStep 通过时的表现保持一致。
  // v138：先过一遍状态门 —— 这函数是给填空/写作那几屏收尾用的，绝不能拿来
  // 点亮一道还没做完的口语题。
  _unlockStep() {
    const steps = this._buildSteps(this.state.currentDay);
    if (!this._stepGateOpen(steps[this.state.stepIdx], this.state.currentDay)) return;
    const next = document.getElementById('stage-next-btn');
    if (next) { next.disabled = false; next.classList.add('nudge'); }
  },

  submitWriting(mi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    // 兜一道：配对没做完不让提交（横线本来就是 readonly，防的是脚本/旧页面绕过）
    if (!this.isTeacher() && !this._kwAllPaired(mi, m)) {
      const r0 = document.getElementById('writing-result-' + mi);
      if (r0) {
        r0.innerHTML = '<div class="wr-start-hint bad">🔒 先把上面 '
          + this._kwList(m).length + ' 个参考单词和中文意思配对好，再来提交批改</div>';
      }
      this._writingSyncFillLock(mi, m);
      return;
    }
    const inputs = document.querySelectorAll('[data-blank]');
    const fst = this._writingFillState(mi);
    let correct = 0, total = m.blanks.length;
    let detail = '';
    m.blanks.forEach((b, bi) => {
      const input = document.querySelector('[data-blank="' + b.id + '"]');
      const val = input.value.trim().toLowerCase();
      const ans = b.answer.toLowerCase();
      const isCorrect = val === ans;
      fst[bi] = { v: input.value, ok: isCorrect };   // 以最近一次提交为准
      this._recordAnswer(dayIdx, mi, bi, val, isCorrect);
      if (isCorrect) correct++;
      detail += '<div class="fs-12 mb-8"><span class="badge ' + (isCorrect?'badge-success':'badge-danger') + '">' + (isCorrect?'✅':'❌') + '</span> 空白' + b.id + '：你填 "' + (input.value||'(空)') + '" | 正确：' + b.answer + '</div>';
      if (isCorrect) { input.style.color = 'var(--success)'; input.style.borderColor = 'var(--success)'; }
      else { input.style.color = 'var(--danger)'; input.style.borderColor = 'var(--danger)'; }
    });
    this._saveWritingFill();
    const score = Math.round(correct / total * 100);
    const result = document.getElementById('writing-result-' + mi);
    result.innerHTML = '<div class="card mt-16" style="background:var(--primary-light)"><div class="card-title">📊 批改结果</div><div class="text-center mb-16"><span style="font-size:36px;font-weight:700;color:' + (score>=80?'var(--success)':score>=60?'var(--warning)':'var(--danger)') + '">' + score + '</span><span class="text-sub">分/100</span></div>' + detail + '<div class="q-explanation show mt-8"><div class="cn">📖 ' + (m.explanation_cn||'') + '</div><div class="en">📘 ' + (m.explanation_en||'') + '</div></div><div class="card mt-16" style="background:var(--success-light)"><div class="card-title fs-12">✅ 完整范文</div><div class="mt-8">' + m.full_text + '</div></div><div class="writing-banner mt-16">📝 请背诵这篇作文！明天将进行挖空默写测试</div></div>';

    // 填对了才放行去朗读 —— 要读的必须是写对的那篇作文。空没填对就先
    // 别往下走，改对了再提交一次，「开始朗读」才会亮。
    if (correct === total) {
      result.insertAdjacentHTML('beforeend',
        '<div class="wr-start-hint ok">✅ 全部填对！点底部「开始朗读」，读完才能进入下一题</div>');
      this._unlockStep();
    } else {
      result.insertAdjacentHTML('beforeend',
        '<div class="wr-start-hint bad">还有 ' + (total - correct)
        + ' 个空没填对，改对后再点一次「提交批改」，就能开始朗读全文</div>');
      const next = document.getElementById('stage-next-btn');
      if (next && !this.isTeacher()) { next.disabled = true; next.classList.remove('nudge'); }
    }
  },

  // ===== One question per screen =====
  // Flattens the day into a linear list of steps. Modules with their own
  // internal progression (vocab game, writing template) stay one step each;
  // everything else contributes one step per question.
  // ===== 错词巩固（v89）：错过的词自动进复习队列 =====
  //
  // 数据来源（都是孩子真实错过的瞬间，自动收集，不用老师手动加）：
  //   1. 词卡闯关选错（看图选词 / 选释义 / 补全拼写）
  //   2. 阅读逐句、写作朗读里识别出读错或漏读的单词（修复词卡弹出的那些）
  //
  // 规则：每个词要**连续 2 次跟读 ≥60 分**才算掌握出队；中途读错一次就
  // 清零重来并排到队尾。每天从队列里取最多 REVIEW_PER_DAY 个，插在当天
  // 作业的最后当"错词巩固"环节 —— 错得多的词（反复进队列）自然出现得
  // 更频繁，这就是"错得多就多练"的自适应。
  //
  // 存储在本机 localStorage（按学生 id 分 key）：复习是练习行为，不需要
  // 跨设备同步，也不该给服务端加写入压力。
  REVIEW_PER_DAY: 5,

  _reviewKey() {
    return 'amyReviewV1_' + (this._myStudentId() || 'guest');
  },
  _reviewLoad() {
    try {
      const list = JSON.parse(localStorage.getItem(this._reviewKey()) || '[]');
      return Array.isArray(list) ? list.filter(e => e && typeof e.w === 'string') : [];
    } catch (e) { return []; }
  },
  _reviewSave(list) {
    try { localStorage.setItem(this._reviewKey(), JSON.stringify(list.slice(0, 60))); } catch (e) {}
  },
  _reviewAdd(rawWord) {
    const word = String(rawWord || '').trim().toLowerCase();
    if (!word || word.length > 40 || !/^[a-z][a-z'\- ]*$/i.test(word)) return;
    const list = this._reviewLoad();
    const e = list.find(x => x.w === word);
    if (e) { e.n = (e.n || 1) + 1; e.ok = 0; e.t = Date.now(); }
    else list.push({ w: word, n: 1, ok: 0, t: Date.now() });
    this._reviewSave(list);
  },
  // 一次跟读通过。连续 ok≥2 → 出队（掌握）。
  _reviewPass(rawWord) {
    const word = String(rawWord || '').trim().toLowerCase();
    const list = this._reviewLoad();
    const e = list.find(x => x.w === word);
    if (!e) return 0;
    e.ok = (e.ok || 0) + 1;
    e.t = Date.now();
    if (e.ok >= 2) this._reviewSave(list.filter(x => x.w !== word));
    else this._reviewSave(list);
    return e.ok;
  },
  // 一次跟读失败：连对清零、排到队尾（明天还会见到它）。
  _reviewFail(rawWord) {
    const word = String(rawWord || '').trim().toLowerCase();
    const list = this._reviewLoad();
    const idx = list.findIndex(x => x.w === word);
    if (idx < 0) return;
    const e = list.splice(idx, 1)[0];
    e.ok = 0; e.n = (e.n || 1) + 1; e.t = Date.now();
    list.push(e);
    this._reviewSave(list);
  },
  // 今天要练的词：队列前 N 个（最久没练对的排最前）。
  _reviewDue(n) {
    return this._reviewLoad().slice(0, n || this.REVIEW_PER_DAY);
  },
  // v120 删掉了 _reviewSkip / _reviewSkipClick 和它们的「这个先跳过，下次
  // 再练 →」出口。家长原话：「不要出现这次不读了，下次再读这个选项，必须
  // 读完才能走」。错词本来就是孩子读错过的，给一个出口等于告诉他"读不出来
  // 可以溜"，而溜掉的那些词明天仍然在队列里，只是白等一天。

  // 错词巩固这一屏：先点单词听示范，再按住跟读。跟修复词卡同一套交互
  // （孩子已经熟悉），过线 = alignSpeech ≥60 分。
  //
  // v120：去掉「这个先跳过，下次再练 →」。家长原话：「不要出现这次不读了，
  // 下次再读这个选项，必须读完才能走」。错词本来就是孩子读错过的，给一个
  // 出口等于告诉他"读不出来可以溜" —— 溜掉的那些词明天仍然在队列里，只是
  // 白等一天。
  renderReviewStep(step) {
    const word = String(step.word || '');
    const esc = word.replace(/'/g, "\\'");
    Recorder.warmUp(); Api.warmup();
    this._reviewCtx = { word: word, tries: step.tries || 0 };
    this._reviewListened = false;   // 每个新词都要先听一遍示范才能跟读
    const n = this._reviewDue(60).length;
    const ph = this._wordPhonetic(word);
    let html = '<div class="review-step">';
    html += '<div class="review-badge">🎯 错词巩固 · 还剩 ' + n + ' 个待巩固</div>';
    html += '<div class="review-card">';
    html += '<div class="review-word tap-speak-sm" onclick="App.speak(\'' + esc + '\')" title="点一下听发音">' + this._escHtml(word) + '</div>';
    if (ph) html += '<div class="review-phonetic">' + this._escHtml(ph) + '</div>';
    html += '<div class="review-sub">这是你之前读错/答错的单词</div>';
    html += '</div>';
    html += '<div class="review-goal">' + (step.tries > 0
      ? '已连对 ' + step.tries + ' / 2 次，再读对 ' + (2 - step.tries) + ' 次就毕业'
      : '规则：连续跟读对 2 次，这个词就从错题本里毕业') + '</div>';
    html += '<button class="word-read-btn hold-target" id="review-btn"'
      + ' onpointerdown="App._reviewWordStart(event)"'
      + ' onpointerup="App._holdEnd(event)" onpointercancel="App._holdEnd(event)"'
      + ' oncontextmenu="return false">🔊 ' + this._escHtml(word) + '</button>';
    html += '<div class="review-hint" id="review-hint">第一按听示范读音，第二按住跟读</div>';
    html += '</div>';
    return html;
  },

  // 从词库里查音标（纠音要用）。错词队列是跨周的，所以四周都翻一遍。
  // 真的查不到就返回空串 —— 页面里不显示这一行，而不是显示个空括号。
  _wordPhonetic(rawWord) {
    const want = String(rawWord || '').trim().toLowerCase();
    if (!want) return '';
    const weeks = (typeof HOMEWORK_WEEKS !== 'undefined' && HOMEWORK_WEEKS) ? HOMEWORK_WEEKS : [HOMEWORK_DATA];
    for (let w = 0; w < weeks.length; w++) {
      const days = weeks[w] || [];
      for (let d = 0; d < days.length; d++) {
        const mods = (days[d] && days[d].modules) || [];
        for (let i = 0; i < mods.length; i++) {
          const ws = mods[i].words || [];
          for (let k = 0; k < ws.length; k++) {
            if (String(ws[k].word || '').toLowerCase() === want) return ws[k].phonetic || '';
          }
        }
      }
    }
    return '';
  },

  // 纠音（v120）。家长原话：「纠音这里没有，而且提交之后还是反应太慢了」。
  // 原来是干巴巴一句「还没读对」，孩子不知道自己错在哪个音，只能一遍遍瞎试，
  // 越试越慢。现在说清楚差在哪儿（漏了哪个、哪个没读准），并且**当场把正确
  // 读音放一遍** —— 跟读的本质就是"听—模仿"，不给听的机会就没有纠音。
  _reviewFixHtml(word, heard, a) {
    const miss = ((a && a.missing) || []).map(x => x.target).filter(Boolean);
    const wrong = ((a && a.wrong) || []).map(x => x.target).filter(Boolean);
    const bits = [];
    if (miss.length) bits.push('漏了「' + miss.join('、') + '」');
    if (wrong.length) bits.push('「' + wrong.join('、') + '」没读准');
    let html = '<div class="review-fix">';
    html += '<div class="rf-head">❌ ' + (bits.length ? bits.join('，') : '这一遍差一点') + '</div>';
    if (heard) html += '<div class="rf-heard">听到的是：' + this._escHtml(heard) + '</div>';
    html += '<div class="rf-tip">🔊 正确读音已经放了一遍，跟着它再按住读一次</div>';
    html += '</div>';
    return html;
  },

  _reviewWordStart(ev) {
    ev.preventDefault();
    const ctx = this._reviewCtx;
    if (!ctx) return;
    if (ev.pointerId !== undefined && ev.currentTarget.setPointerCapture) {
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    }
    const status = document.getElementById('review-hint');
    if (!this._reviewListened) {
      this._reviewListened = true;              // 先听一遍示范才解锁跟读
      if (status) status.textContent = '听好了？再按住它，大声读出来';
      this.speak(ctx.word);
      return;
    }
    const word = ctx.word;
    const self = this;
    // v120：最后一个参数 autoStop=true —— 说完静 0.6 秒自动收尾，不必一直
    // 按着。家长说「提交之后还是反应太慢了」，一半的等待其实来自"按着不放
    // 才敢松"；识别只有一次往返，收尾越早开始就越快。
    this._holdStart(ev, 'review-' + word, word, status, function(out, text) {
      // v139：识别端没回话但确实出了声 → 按读对算（孤立单词本来就是识别
      // 最不稳的一类，不能让孩子为识别端的空结果买单）。
      // v148：判定口径统一收进 _judgeSilence，并把设备录音体质记进样本。
      self._micNote(out, 'review');
      const judge = self._judgeSilence(out);
      const voiceOk = !text && judge.voiceOk;
      if (!text && !voiceOk) {
        if (status) status.innerHTML = '<div class="review-fix">'
          + '<div class="rf-head">这次没录到声音</div>'
          + '<div class="rf-tip">点一下上面的单词听读音，再按住大声读一次</div></div>';
        return;
      }
      const a = self.alignSpeech(word, text || '');
      if (voiceOk || (a.ok >= 1 && a.score >= 60)) {
        const okN = self._reviewPass(word);
        const btn = document.getElementById('review-btn');
        if (btn) { btn.classList.add('review-done'); btn.disabled = true; }
        if (status) status.innerHTML = okN >= 2
          ? '🎉 连续 2 次读对，这个词毕业啦！'
          : '✓ 第 1 次读对！明天还要再读一次巩固';
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = false; next.classList.add('nudge'); }
      } else {
        self._reviewFail(word);
        // 纠音（v120）：当场把正确读音放一遍，再说清楚差在哪儿。没有这一步，
        // 孩子看到的只是"还没读对"，只能一遍遍瞎试 —— 又慢又挫败。
        self.speak(word);
        if (status) status.innerHTML = self._reviewFixHtml(word, text, a);
      }
    }, true, 'en', word, '', true);
  },

  _buildSteps(dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];
    const steps = [];
    if (!day || !day.modules) return steps;
    day.modules.forEach((m, mi) => {
      if (m.type === 'vocabulary_game')       { steps.push({ mi, kind: 'vocab' }); return; }
      if (m.type === 'writing_template') {
        // 写完作文之后朗读全文，是独立的一屏：读对全部句子才放行下一题
        steps.push({ mi, kind: 'writing' });
        if (this._writingSentences(m).length) steps.push({ mi, kind: 'writingread' });
        return;
      }
      if (m.type === 'speaking' && m.questions) {
        m.questions.forEach((q, qi) => steps.push({ mi, qi, kind: 'speaking' }));
        return;
      }
      // A passage is read aloud sentence by sentence first — listen, then read
      // it back — and only after the whole text does the child answer on it.
      if (m.passage) {
        this._splitSentences(m.passage).forEach((sent, si) =>
          steps.push({ mi, si, kind: 'sentence' }));
        if (m.type === 'cloze') {
          // 完形填空（v126）：整篇课文逐句翻译，和阅读理解同一套 ——
          // 一屏一句、词可点、按住说中文、三档判定。翻译完再开始填空。
          this._splitSentences(m.passage).forEach((sent, si) =>
            steps.push({ mi, si, kind: 'cqtrans' }));
        } else {
          const pairs = this._pairSentences(m);
          if (pairs) {
            // Read it sentence by sentence, then translate it sentence by
            // sentence. No full-text screen in between.
            pairs.forEach((pr, si) => steps.push({ mi, si, kind: 'translate' }));
          } else {
            // Falls back to the whole-passage screen only where the English and
            // Chinese sentences do not line up, so that passage still gets a
            // translation exercise rather than none at all.
            steps.push({ mi, kind: 'passage' });
          }
        }
      }
      // 完形填空的题目：**同一句里挖的多个空合成一屏**（v126）。
      // 今天的第 4、5 空同属 "You 4___ take care of it, and it will make
      // you 5___."，孩子一次性选完这两个空，跟读的也是一句完整的
      // "You must take care of it, and it will make you happy."，
      // 不会再出现"第4空 / 第5空"分开做、也没有 blank。
      if (m.type === 'cloze' && m.questions) {
        const groups = this._clozeQuestionGroups(m);
        groups.forEach(g => steps.push({ mi, qi: g[0], qis: g, kind: 'clozegroup' }));
        return;
      }
      if (m.questions) m.questions.forEach((q, qi) => steps.push({ mi, qi, kind: 'question' }));
    });
    // 错题巩固排在当天全部模块之后：先把正课做完，最后把错的过一遍。
    // 老师预览路径不掺这个 —— 复习是学生自己的账。
    //
    // v120 起分两段：
    //   ① 错题重练（retry）：当天**答错的题**，换成三选一快速过一遍
    //   ② 错词跟读（review）：**读错的词**，连对 2 次才算毕业
    // 先做题、后读词 —— 题目是"想"的、单词是"说"的，把要张嘴的放最后，
    // 孩子读完就收工，不用再切回思考状态。
    if (!this.isTeacher()) {
      this._retryWrongQuestions(dayIdx).forEach(s => steps.push(s));
      this._reviewDue(this.REVIEW_PER_DAY)
        .filter(e => e && e.w)
        .forEach(e => steps.push({ kind: 'review', word: e.w, tries: e.ok || 0 }));
    }
    return steps;
  },

  // ===== 错题重练（v120）=================================================
  //
  // 家长原话：「错题巩固的话，在最后面进行一个巩固，把错题再给返回练一下。
  // 这个部分可以相对快一点，例如多加一些中文翻译，比如说之前没有中文翻译
  // 的，这下加上中文翻译，或者变一个题型……让孩子们觉得做错题也是一种快乐，
  // 不要太死板，而且还要快速一些。」
  //
  // 做法：把当天**答错的题**收进来，统一改成**三选一** —— 比原来的填空、
  // 长选项快得多，而且干扰项取自同一模块的其他答案，考的仍然是同一个知识点。
  // 每题配一句中文（题目自带的中文优先，否则用解析），这就是家长要的
  // "之前没有中文翻译的，这下加上中文翻译"。
  //
  // 重练**不碰**原始答题记录与打卡统计：这是"补考"，回填会让正确率虚高。
  RETRY_MAX: 6,

  // 当天已经"练对过"的题。存本机（和错词队列一样，复习是练习行为，不必
  // 跨设备同步）。key 带 dayIdx —— 换一天重新出现，这才是"巩固"。
  // 答错、看了答案就走的不记：那说明还没记住，下次还得再练。
  _retryKey(dayIdx) {
    return 'amyRetryV1_' + (this._myStudentId() || 'guest')
         + this._weekTag() + '_d' + dayIdx;
  },
  _retryDone(dayIdx) {
    try {
      const raw = JSON.parse(localStorage.getItem(this._retryKey(dayIdx)) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  },
  _retryMarkDone(dayIdx, mi, qi) {
    const list = this._retryDone(dayIdx);
    const k = mi + '_' + qi;
    if (list.indexOf(k) < 0) list.push(k);
    try { localStorage.setItem(this._retryKey(dayIdx), JSON.stringify(list.slice(0, 80))); } catch (e) {}
  },

  _retryWrongQuestions(dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];
    if (!day || !day.modules) return [];
    const sid = this._myStudentId();
    const done = this._retryDone(dayIdx);
    const out = [];
    (day.modules || []).forEach((m, mi) => {
      if (!m.questions) return;
      m.questions.forEach((q, qi) => {
        if (done.indexOf(mi + '_' + qi) >= 0) return;    // 今天已经练对了
        const rec = this.state.answers[Api.answerKey(sid, dayIdx, mi, qi)];
        if (rec && !rec.correct) out.push({ mi: mi, qi: qi, kind: 'retry', dayIdx: dayIdx });
      });
    });
    return out.slice(0, this.RETRY_MAX);
  },

  // 这道错题的中文说明：题目自带的中文优先，没有就用解析。
  // 两者都是题库里现成的，不新造内容 —— 新造的翻译没有教研把关，宁可不用。
  _retryZh(q) {
    if (!q) return '';
    return String(q.sentence_cn || q.question_cn || q.explanation_cn || '').trim();
  },

  // 三选一的选项：正确答案 + 同模块里另外两个答案。
  // 用题目 id 做定序种子 —— 同一道题每次渲染顺序一致（老师端预览、
  // 孩子重进这一屏都不会突然换位置）。
  _retryOptions(m, q, dayIdx, qi) {
    const right = this._a4AnswerText(q);
    if (!right) return null;
    const pool = [];
    (m.questions || []).forEach(qq => {
      if (qq === q) return;
      const t = this._a4AnswerText(qq);
      if (t && t !== right && pool.indexOf(t) < 0) pool.push(t);
    });
    // 同模块不够（比如一整个模块只有一个错项）就从当天其它模块拿。
    const day = HOMEWORK_DATA[dayIdx];
    if (pool.length < 2 && day) {
      (day.modules || []).forEach(mm => (mm.questions || []).forEach(qq => {
        const t = this._a4AnswerText(qq);
        if (t && t !== right && pool.indexOf(t) < 0) pool.push(t);
      }));
    }
    if (pool.length < 2) return null;          // 凑不出干扰项就别做三选一

    // 用题目 id 的字符和做种子，稳定地挑两个干扰项与插入位置。
    const seed = String(q.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + (qi || 0);
    const d1 = pool[seed % pool.length];
    let d2 = pool[(seed * 7 + 3) % pool.length];
    if (d2 === d1) d2 = pool[(pool.indexOf(d1) + 1) % pool.length];
    // 先把干扰项排好，再把正确答案**插进** at 位置 —— 不能先 splice 再 splice，
    // 那样删掉的不一定是 right，right 会被插两次（三个选项里两个一模一样）。
    const shuffled = [d1, d2];
    const at = seed % 3;                        // 正确答案落在哪个位置
    shuffled.splice(at, 0, right);
    return { options: shuffled, answerIdx: at };
  },

  renderRetryStep(step, dayIdx, left) {
    const day = HOMEWORK_DATA[dayIdx];
    const m = day && day.modules[step.mi];
    const q = m && m.questions && m.questions[step.qi];
    if (!m || !q) return '<div class="card text-sub">这一题找不到了</div>';
    const pack = this._retryOptions(m, q, dayIdx, step.qi);
    if (!pack) return '<div class="card text-sub">这一题暂时不能重练</div>';

    const zh = this._retryZh(q);
    let html = '<div class="retry-step">';
    html += '<div class="retry-badge">📕 错题重练 · 还剩 ' + left + ' 题</div>';
    html += '<div class="retry-note">这题你之前做错过，再选一次就记住啦</div>';
    html += '<div class="retry-stem">' + this._a4QuestionHtml(q) + '</div>';
    if (zh) html += '<div class="retry-zh">💡 ' + this._escHtml(zh) + '</div>';
    html += '<div class="retry-options" id="retry-opts-' + step.mi + '-' + step.qi + '">';
    pack.options.forEach((opt, oi) => {
      html += '<div class="retry-option" onclick="App.retryPick(this,' + oi + ',' + pack.answerIdx
            + ',' + step.mi + ',' + step.qi + ',' + dayIdx + ')">'
            + String.fromCharCode(65 + oi) + '. ' + this._escHtml(opt) + '</div>';
    });
    html += '</div>';
    html += '<div class="retry-verdict" id="retry-verdict-' + step.mi + '-' + step.qi + '"></div>';
    html += '</div>';
    return html;
  },

  // 答对/答错都不卡人：这是补考，目的是"再来一次就记住"，不是筛人。
  // 答对 → 记下"今天练过了"，底部「下一题」亮起；答错 → 直接标出正确项并
  // 放行，孩子看着答案走到下一题，比逼他再猜一遍快得多，也不会因为一道题
  // 反复受挫（家长："让孩子们觉得做错题也是一种快乐，不要太死板"）。
  retryPick(el, picked, right, mi, qi, dayIdx) {
    if (!el || el.parentElement.dataset.done === '1') return;
    const box = el.parentElement;
    box.dataset.done = '1';
    box.querySelectorAll('.retry-option').forEach((o, i) => {
      if (i === right) o.classList.add('correct');
      else if (i === picked) o.classList.add('wrong');
    });
    const hint = document.getElementById(box.id.replace('retry-opts-', 'retry-verdict-'));
    const hit = picked === right;
    if (hint) {
      hint.className = 'retry-verdict ' + (hit ? 'good' : 'bad');
      hint.innerHTML = hit
        ? '✅ 对了！这题以后不会再错啦'
        : '🙂 正确答案是 ' + String.fromCharCode(65 + right) + '，记住它就好';
    }
    if (hit && dayIdx !== undefined && mi !== undefined && qi !== undefined) {
      this._retryMarkDone(dayIdx, mi, qi);
    }
    this._playCorrectSound();
    const next = document.getElementById('stage-next-btn');
    if (next) { next.disabled = false; next.classList.add('nudge'); }
  },

  // 自动翻页已废弃：现在所有题型都靠 stage-next-btn 自己解锁，孩子在屏幕
  // 底部自己点。保留函数以防外部旧引用炸出 ReferenceError。
  _scheduleAdvance(delay) {
    if (this.isTeacher()) return;
    clearTimeout(this._advanceTimer);
    this._advanceTimer = setTimeout(() => this.nextStep(), delay || 1400);
  },

  // Speak whatever the freshly rendered step registered, still inside the tap
  // that triggered it. If audio has not been unlocked yet, park it for the
  // first tap instead of losing it.
  _flushSpeakOnRender() {
    this._applyStepLock();
    var sent = this._speakOnRender;
    var gate = this._speakOnRenderGate;
    this._speakOnRender = null;
    this._speakOnRenderGate = null;
    if (!sent) return;
    var self = this;
    // 这一遍系统自动示范播完，就当作"听过"，顺手把门禁放行 —— 孩子确实是
    // 听着示范进来的，没必要让他再点一次才解锁。
    var opts = gate ? { onDone: function() { self._gateUnlock(gate); } } : undefined;
    if (this._ttsUnlocked) this.speak(sent, opts);
    else { this._pendingSpeak = sent; this._pendingSpeakGate = gate; }
  },

  nextStep(force) {
    clearTimeout(this._advanceTimer);
    this._stopCurrentAudio();
    // force 只给「题库预览」里那颗明说的「跳过本题（老师）」用，别处在代码里
    // 传 true 也不算数 —— 否则又是一个能让门禁失效的口子。
    if (force && !(this.isTeacher() && this.state.currentTab === 'preview')) force = false;
    const steps = this._buildSteps(this.state.currentDay);
    const st0 = steps[this.state.stepIdx];
    if (!force) {
      // ① 状态门（v138）：不看按钮长什么样，只看这一屏做完没有。
      //    家长 2026-10-17：「我还没做题呢，下一题就已经出现了，已经可以点选了」
      //    —— 按钮被别处的异步回调点亮过，这一层照样不放行。
      if (!this._stepGateOpen(st0, this.state.currentDay)) {
        const nb = document.getElementById('stage-next-btn');
        if (nb && !nb.disabled) {
          nb.disabled = true; nb.classList.remove('nudge');
          this.showToast('🔒 这题还没做完：先选对答案，再把整句读完', 'warn');
        }
        return;
      }
      // ② 按钮门（v136）：还灰着就不许翻页。按钮 disabled 时孩子点不到，但
      //    旧计时器、残留的自动翻页、程序化调用都能绕过 DOM 叫到这里。
      const nb0 = document.getElementById('stage-next-btn')
               || (st0 && st0.mi !== undefined ? document.getElementById('stage-next-' + st0.mi) : null);
      if (nb0 && nb0.disabled) return;
      // ③ 硬门禁：写作朗读这一屏必须读完最后一句才放行。按钮本身也是锁的，
      //    这里是防止别处（旧计时器、外部调用）把这一屏替孩子翻过去。
      if (!this._writingReadGateOpen()) {
        const nextBtn = document.getElementById('stage-next-btn');
        if (nextBtn) { nextBtn.disabled = true; nextBtn.classList.remove('nudge'); }
        return;
      }
    }
    if (this.state.stepIdx < steps.length - 1) {
      this.state.stepIdx++;
      this.renderContent();
      this._flushSpeakOnRender();
    } else {
      this.state.stepIdx = steps.length;   // -> completion screen
      this.renderContent();
    }
  },

  prevStep() {
    clearTimeout(this._advanceTimer);
    this._stopCurrentAudio();
    if (this.state.stepIdx > 0) { this.state.stepIdx--; this.renderContent(); this._flushSpeakOnRender(); }
  },

  goToStep(i) {
    clearTimeout(this._advanceTimer);
    this._stopCurrentAudio();
    this.state.stepIdx = i;
    this.renderContent();
    this._flushSpeakOnRender();
  },

  // The fixed, non-scrolling stage. Only the passage box scrolls internally
  // so a long reading text stays reachable without the page moving.
  renderStage(dayIdx) {
    const day = HOMEWORK_DATA[dayIdx];
    const steps = this._buildSteps(dayIdx);
    if (steps.length === 0) return '<div class="card text-center text-sub">今天没有作业</div>';
    // 每渲染一屏都重新判定门槛：这个标记是"渲染时要不要锁住下一题"的一次性
    // 信号，上一屏若因故没被 _applyStepLock 消费掉，会连累下一屏莫名其妙锁死。
    this._lockNextOnRender = false;

    if (this.state.stepIdx >= steps.length) {
      const sid = this._myStudentId();
      const ck = this.state.checkins[Api.checkinKey(sid, dayIdx)];
      let done = '<div class="stage"><div class="stage-done">';
      done += '<svg class="icon icon-xl"><use href="#i-check"/></svg>';
      done += '<div class="sd-title">今天的作业做完了</div>';
      if (ck) done += '<div class="sd-sub">答对 ' + (ck.answered - ck.wrongCount) + ' / ' + ck.answered + ' 题 · 正确率 ' + ck.correctRate + '%</div>';
      done += '<button class="btn-primary-lg" onclick="App.goToStep(0)">再看一遍</button>';
      done += '</div></div>';
      return done;
    }

    const step = steps[this.state.stepIdx];
    // 错词巩固步骤没有所属模块（step.mi 为 undefined），m 允许为 null
    const m = step.mi !== undefined ? day.modules[step.mi] : null;

    // 孩子看这一题、听这一题、读这一题的时间，正好用来把后面几句的音频取回来。
    // 等到切到下一题时，朗读不用再等网络。
    this.prefetchUpcoming(steps, dayIdx, this.state.stepIdx);

    let html = '<div class="stage">';

    // Head: module name + progress
    html += '<div class="stage-head">';
    html += '<span class="sh-name">' + (m ? m.name_cn : '🎯 错词巩固') + '</span>';
    html += '<div class="stage-progress"><i style="width:' + Math.round((this.state.stepIdx) / steps.length * 100) + '%"></i></div>';
    html += '<span class="sh-count">' + (this.state.stepIdx + 1) + ' / ' + steps.length + '</span>';
    html += '</div>';

    html += '<div class="stage-body">';
    // No "开启语音" gate. Browsers unlock audio on the first user gesture and
    // the child's first action here IS a tap — the banner was a screen to get
    // past, nothing more.
    if (!this.state.audioEnabled) this.state.audioEnabled = true;

    if (step.kind === 'sentence') {
      html += this.renderSentenceStep(m, step.mi, step.si, dayIdx);
      this._lockNextOnRender = true;
    } else if (step.kind === 'cqtrans') {
      // 完形填空的整篇逐句翻译（v126）：和阅读理解逐句翻译同一套交互。
      html += this.renderClozeTransStep(m, step.mi, step.si, dayIdx);
      this._lockNextOnRender = true;
    } else if (step.kind === 'clozegroup') {
      // 同一句里的多个空合成一屏做完（v126）。
      this._currentClozeGroup = { mi: step.mi, qis: step.qis || [step.qi] };
      html += '<div class="stage-q stage-scroll">'
           + this.renderClozeGroupStep(m, step.mi, step.qis || [step.qi], dayIdx) + '</div>';
      // 整组都选对了才有资格跟读；读完（面板打分通过）才放行。
      // v136：不再因为"上次已经全对"就直接放行 —— 那等于让孩子选完 ABCD
      // 跳过跟读就进下一题。宁可让他回退到这一屏时再读一遍。
      // v138：老师预览不再免锁。
      this._lockNextOnRender = true;
      const grp = step.qis || [step.qi];
      const allDone = grp.every(qi => this._questionSolved(step.mi, qi, dayIdx));
      // 全对过又退回这一屏：跟读面板要自己回来，否则孩子看到一句全绿的选项
      // 却没有"读完整句"的入口，只能对着灰按钮干等。
      if (allDone) {
        const self2 = this;
        setTimeout(function() {
          const fe = document.getElementById('cq-follow-' + step.mi + '-' + grp[0]);
          if (fe && !fe.innerHTML.trim()) {
            const fq = m.questions[grp[0]];
            self2._renderHoldReadPanel(fe, step.mi, grp[0], dayIdx,
              self2._buildReadSentence(m, fq));
          }
        }, 0);
      }
    } else if (step.kind === 'passage') {
      html += this.renderPassageStep(m, step.mi, dayIdx);
    } else if (step.kind === 'translate') {
      html += this.renderTranslateStep(m, step.mi, step.si, dayIdx);
      this._lockNextOnRender = true;
    } else if (step.kind === 'question') {
      // English only — the child has already read this passage aloud.
      if (m.passage) {
        html += '<div class="stage-passage"><div class="fs-12 text-sub mb-4">阅读材料 · 点单词看中文</div>'
             + '<p class="sent-words">' + this._wordSpans(m.passage) + '</p></div>';
      }
      if (m.audio_text) {
        html += '<div class="mb-8"><button class="btn btn-outline btn-sm" onclick="App.speak(\'' + m.audio_text.replace(/'/g,"\\'") + '\')">听录音</button></div>';
      }
      html += '<div class="stage-q">' + this._renderOneQuestion(m, step.mi, step.qi, dayIdx) + '</div>';
      // 学生路径：题目可跟读时先把 stage-next-btn 锁住，必须跟读 ≥60 分
      // 才能进下一题——避免孩子在没读完/读得太糊的情况下被自动跳走。
      //
      // 但**填空题（没有 options）根本没有跟读入口**（跟读区只跟着 q.options
      // 渲染），所以它的门槛只能是"写对"：写对了立刻放行（submitFill 里
      // _unlockStep），已经写对过（从下一题退回来 / 昨天做过）也直接放行。
      // 以前这里不看题型一律锁，填空写对了底部按钮还是灰的、点不动，孩子
      // 只能把同一句答案再写一遍 —— 家长 2026-10-14 报的就是这个：
      // 「写对了没有任何错误，就弹出来下一题这个可选的项，而不是虚的显示，
      //   让学生点不了」。
      const q = m.questions[step.qi];
      const blanked = !q.options;
      const qHasRead = !!this._buildReadSentence(m, q);
      const solved = blanked && this._questionSolved(step.mi, step.qi, dayIdx);
      // v141：选择题（含阅读理解）做对过的也不许再锁 —— 以前只要题目能跟读
      // 就一律锁死，孩子做完一题切走再切回来（或隔天重进），下一题又变灰，
      // 得把已经读过的话再读一遍才能走（家长 2026-10-18：「做对了……下一题
      // 仍然是灰色的」）。做对过 = 答案记录里 correct，直接放行。
      const solvedChoice = !blanked && this._questionSolved(step.mi, step.qi, dayIdx);
      // v138：老师预览同样照锁（见 _applyStepLock 的说明）。
      if (blanked ? !solved : (qHasRead && !solvedChoice)) this._lockNextOnRender = true;
      const self = this;
      setTimeout(function(){ self._autoSpeakQuestion(m, step.mi, step.qi, dayIdx); }, 250);
    } else if (step.kind === 'speaking') {
      html += '<div class="stage-q" id="sp-content-' + step.mi + '">'
           + this.renderSpeakingQuestion(m, step.mi, step.qi, dayIdx) + '</div>';
      // 口语：选对选项 + 整句跟读 ≥60 分才放行。
      // v138：判据换成状态（_speakingGateOpen），学生和老师预览同一套 ——
      // 已经做完过（从下一题退回来）就直接放行，没做完一率灰着。
      if (!this._speakingGateOpen(step.mi, step.qi, dayIdx)) this._lockNextOnRender = true;
    } else if (step.kind === 'vocab') {
      html += '<div class="stage-q">' + this.renderVocabGame(m, step.mi, dayIdx) + '</div>';
    } else if (step.kind === 'writing') {
      html += '<div class="stage-q stage-scroll">' + this.renderWritingTemplate(m, step.mi, dayIdx) + '</div>';
      // 空没填对之前不放行；上一题回来时若已经全对就直接放行
      if (!this._writingAllBlanksRight(m, step.mi, dayIdx)) this._lockNextOnRender = true;
    } else if (step.kind === 'writingread') {
      html += '<div class="stage-q">' + this.renderWritingRead(m, step.mi, dayIdx) + '</div>';
      // 全部句子读对（≥60 分）之前不放行
      if (!this._writingAllRead(m, step.mi)) this._lockNextOnRender = true;
    } else if (step.kind === 'retry') {
      // 「还剩 N 题」按当前这一步往后数，孩子知道还有多远到头。
      let left = 0;
      for (let i = this.state.stepIdx; i < steps.length; i++) {
        if (steps[i].kind === 'retry') left++;
      }
      html += '<div class="stage-q">' + this.renderRetryStep(step, dayIdx, left) + '</div>';
      // 选之前锁着；选完（对或错都算）由 retryPick 就地解锁。
      if (!this.isTeacher()) this._lockNextOnRender = true;
    } else if (step.kind === 'review') {
      html += '<div class="stage-q">' + this.renderReviewStep(step) + '</div>';
      // 跟读读对才放行下一题。v120 起没有"先跳过"这个出口 —— 家长明确要求
      // "不要出现这次不读了，下次再读这个选项，必须读完才能走"。
      if (!this.isTeacher()) this._lockNextOnRender = true;
    }
    html += '</div>';

    // Foot: going back is always allowed. On the vocabulary step the forward
    // button walks the words INSIDE the game — a single global 下一题 there
    // skipped the whole game in one stray tap. Only after the last word does
    // it move on to the next question.
    html += '<div class="stage-foot">';
    html += '<button class="btn-ghost" onclick="App.prevStep()"' + (this.state.stepIdx === 0 ? ' disabled' : '') + '>上一题</button>';
    if (step.kind === 'vocab') {
      // 拼读阶段没读完先禁用（_renderSpellRead 刚设置过 _spell），0ms 后
      // _syncVocabFootLabel 会再校准一次 —— 这里先按当前状态渲染，避免闪一下。
      // v119：连读（contDone）没通过也先禁用。
      // v136：判据统一收进 _vocabFootLocked —— 当前这个词没学完就是灰的。
      var vLocked = this._vocabFootLocked(step.mi, dayIdx);
      html += '<button class="btn-ghost" id="stage-next-' + step.mi + '"' + (vLocked ? ' disabled' : '')
           + ' onclick="App.nextVocabWord(' + step.mi + ',' + dayIdx + ')">下一个单词</button>';
      // 预览里词汇这一屏也锁着：老师想快进就整块跳过（学生看不到这颗键）。
      if (vLocked && this.isTeacher() && this.state.currentTab === 'preview') {
        html += '<button class="btn-ghost" id="pv-skip-btn" style="font-size:12px;opacity:.75"'
             + ' onclick="App.nextStep(true)">跳过本题（老师）</button>';
      }
    } else {
      // Name the button after what actually comes next: reading a passage is
      // a run of sentences, not a run of questions.
      var nextStep = steps[this.state.stepIdx + 1];
      var label;
      if (this.state.stepIdx === steps.length - 1) label = '完成';
      else if (step.kind === 'sentence')
        label = nextStep && nextStep.kind === 'sentence' ? '下一句'
              : nextStep && nextStep.kind === 'translate' ? '开始翻译'
              : nextStep && nextStep.kind === 'cqtrans' ? '开始翻译'
              : nextStep && nextStep.kind === 'passage' ? '整篇翻译' : '下一题';
      else if (step.kind === 'cqtrans')
        label = nextStep && nextStep.kind === 'cqtrans' ? '下一句'
              : (nextStep && nextStep.kind === 'clozegroup') ? '开始填空' : '下一题';
      else if (step.kind === 'clozegroup')
        label = nextStep && nextStep.kind === 'clozegroup' ? '下一句的空' : '下一题';
      else if (step.kind === 'translate') label = nextStep && nextStep.kind === 'translate' ? '下一句' : '开始做题';
      else if (step.kind === 'passage') label = '开始做题';
      else if (step.kind === 'writing') label = '开始朗读';
      else if (step.kind === 'retry')
        label = nextStep && nextStep.kind === 'retry' ? '下一题'
              : nextStep && nextStep.kind === 'review' ? '开始错词巩固' : '完成巩固';
      else if (step.kind === 'review') label = nextStep && nextStep.kind === 'review' ? '下一个错词' : '完成复习';
      else label = '下一题';
      // v136：锁**直接写进 HTML**。以前只在 innerHTML 落地之后由
      // _applyStepLock() 补一次 disabled，任何一次重绘（切 tab 回来、
      // 静默更新、局部刷新）都会把这颗按钮还原成"亮的"，孩子一点就跳过去
      // —— 家长反复报的"虚的、能点"就是这么来的。现在渲染即带锁，
      // _applyStepLock 只当第二道保险。
      // v138：老师预览也带锁 —— 预览要验的正是"学生能不能蒙过去"，免锁就白看。
      var lockedNow = !!this._lockNextOnRender;
      html += '<button class="btn-ghost" id="stage-next-btn"' + (lockedNow ? ' disabled' : '')
           + ' onclick="App.nextStep()">' + label + '</button>';
      // 但老师不能因此被卡在某一屏翻不下去 —— 给老师一颗**明说的**跳过键，
      // 只出现在「题库预览」里，学生端永远看不到（也不受它影响）。
      if (lockedNow && this.isTeacher() && this.state.currentTab === 'preview') {
        html += '<button class="btn-ghost" id="pv-skip-btn" style="font-size:12px;opacity:.75"'
             + ' onclick="App.nextStep(true)">跳过本题（老师）</button>';
      }
    }
    html += '</div>';

    html += '</div>';
    return html;
  },

  // Questions (reading, grammar, etc.)
  renderQuestionsStudent(m, mi, dayIdx) {
    let html = '';
    // Audio enable check
    if (!this.state.audioEnabled) {
      html += '<div class="audio-enable-banner">';
      html += '<div class="ae-icon">🔊</div>';
      html += '<div class="ae-title">点击开启语音朗读</div>';
      html += '<div class="ae-desc">开启后，每道题会自动用纯正美音朗读英语</div>';
      html += '<button class="ae-btn" onclick="App.enableAudio()">🔊 开启语音</button>';
      html += '</div>';
      return html;
    }
    if (m.passage) {
      html += '<div class="card mb-16" style="background:var(--bg)"><div class="fs-12 text-sub mb-4">📄 阅读材料：</div>' + (m.passage_cn||'') + '<br><br>' + m.passage + '</div>';
    }
    if (m.audio_text) {
      html += '<div class="card mb-16" style="background:var(--info-light)"><button class="speak-btn play" onclick="App.speak(\'' + m.audio_text.replace(/'/g,"\\'") + '\')">🔊 听录音</button>';
      html += '</div>';
    }
    m.questions.forEach((q, qi) => {
      html += this._renderOneQuestion(m, mi, qi, dayIdx);
    });

    // After rendering, auto-play audio_text first, then first question
    // This avoids the forEach race condition where all speak() calls cancel each other
    var self = this;
    setTimeout(function() {
      if (m.audio_text && self.state.audioEnabled) {
        // Play audio_text first, then first question
        self.speak(m.audio_text, { onDone: function() {
          self._autoSpeakQuestion(m, mi, 0, dayIdx);
        }});
      } else if (m.questions && m.questions.length > 0) {
        // No audio_text, just play first question
        self._autoSpeakQuestion(m, mi, 0, dayIdx);
      }
    }, 300);

    return html;
  },

  // 跟读用的完整英文句。题目里的横杠（"I ___ to school."）要替换成正确
  // 选项，这样跟读面板上显示的是一句完整的话，孩子按住麦克风读到的是
  // 完整句子（不会卡在横杠处）。同时按 _questionSpeechText 的规则剥掉
  // 指令词（"Choose the correct answer."）和中文，所以孩子不会跟着读
  // "KET choose the correct answer" 这种话。
  _buildReadSentence(m, q) {
    if (!q) return '';
    // 听力题直接用听力原文
    if (q.audio_text) {
      var at = this._ttsText(q.audio_text);
      if (at) return at;
    }
    // 完形填空（v126）：跟读的是「这一句把所有空都填好」的完整句子。
    // 同句挖了 4、5 两个空时，两个都填上，孩子读到的是一句完整的人话。
    // 实测过：以前这里只填当前这个空，同句另一个空留着 ___ → 孩子跟着读
    // 到一半卡住。
    if (m && m.type === 'cloze') {
      var csent = this._clozeSentenceOf(m, q);
      if (csent) {
        var cfilled = this._clozeFillSentence(m, csent, false);
        var ctts = this._ttsText(cfilled);
        if (ctts) return ctts;
      }
    }
    var parts = this._stemParts(q.question);
    var rest = parts.rest;
    if (!rest) return '';
    // 把 ___ 替换成正确选项，构出一句完整的话
    var filled = rest;
    if (/_{2,}/.test(filled)) {
      var ans = '';
      if (q.options && typeof q.answer === 'number' && q.options[q.answer] != null) {
        ans = String(q.options[q.answer]).trim();
      } else if (q.answer != null) {
        ans = String(q.answer).trim();
      }
      if (ans) filled = filled.replace(/_{2,}/g, ans);
    }
    var stem = this._ttsText(filled);
    // 问句题干：把正确答案拼在后面一起读。孩子跟读的是"问句 + 回答"
    // 一来一回的完整对话（"Do you like apples? — Yes, I do."），而不是
    // 只读半截问句。带横杠的题干填空后已是完整句，不重复拼。
    if (!/_{2,}/.test(rest) && /[?？]\s*$/.test(String(rest).trim())) {
      var ansOpt = '';
      if (q.options && typeof q.answer === 'number' && q.options[q.answer] != null) {
        ansOpt = String(q.options[q.answer]).trim();
      } else if (q.answer != null) {
        ansOpt = String(q.answer).trim();
      }
      if (ansOpt) stem = stem.replace(/[?？]\s*$/, '?') + ' ' + ansOpt;
    }
    // 兜底：完形填空的题号（"2___"）且 rest 太短，从 passage 里找原句并
    // 把同句所有空都填上（v126：不再只填当前这一个）。
    var words = stem.match(/[A-Za-z][A-Za-z'-]*/g) || [];
    if (words.length < 2) {
      var marker = String(q.question || '').match(/\d*_{2,}/);
      if (marker && m && m.passage) {
        var target = marker[0];
        var hit = this._splitSentences(m.passage).filter(function(s) {
          return s.indexOf(target) >= 0;
        })[0];
        if (hit) {
          var filledAll = this._clozeFillSentence(m, hit, false);
          if (filledAll) return this._ttsText(filledAll);
        }
      }
    }
    return stem;
  },

  // 一道题该朗读哪一段英文。规则只有一条：读题，不读答案，不读中文。
  //   - 听力题：读 audio_text（听力原文），题干"听到的句子是什么？"是中文，不读
  //   - 阅读理解/语法/时态/单选/KET：读英文题干
  //   - 完形填空：题干只是"4___"这样的空格编号，读它所在的课文原句 ——
  //     而且**把这一句里所有的空都填上答案**（v126）。以前读作 blank，孩子
  //     听到 "You blank take care of it ... blank"，既不成句也不知道填哪儿；
  //     今天这句挖了 4、5 两个空，两个空一起补全才是人话。
  //   - 都没有英文可读（例如纯中文题干又没原文）→ 返回空串，不朗读
  // 解释（explanation_cn / explanation_en）从来不在这里，答题对错才显示。
  _questionSpeechText(m, q) {
    if (!q) return '';
    if (q.audio_text) return this._ttsText(q.audio_text);
    // 完形填空优先走「整句补全」：题干本身就是编号，没什么可读的。
    if (m && m.type === 'cloze') {
      const sent = this._clozeSentenceOf(m, q);
      if (sent) {
        const filled = this._clozeFillSentence(m, sent, false);
        const t = this._ttsText(filled);
        if (t) return t;
      }
    }
    // "KET: Choose the correct answer." 这类指令不读，只读题目本体
    var parts = this._stemParts(q.question);
    var stem = this._ttsText(parts.rest);
    // 至少要有两个英文单词才算"一句能读的题"，否则像 "1 blank" 这种
    // 空位编号读出来毫无意义。
    var words = stem.match(/[A-Za-z][A-Za-z'-]*/g) || [];
    if (words.length >= 2) return stem;

    var marker = String(q.question || '').match(/\d*_{2,}/);
    if (marker && m && m.passage) {
      var target = marker[0];
      var hit = this._splitSentences(m.passage).filter(function(s) {
        return s.indexOf(target) >= 0;
      })[0];
      // 兜底也要补全同句的其他空，不再吐 blank。
      if (hit) return this._ttsText(this._clozeFillSentence(m, hit, false));
    }
    return words.length >= 1 ? stem : '';
  },

  // One question's markup. Extracted so both the scrolling list (teacher
  // preview) and the one-question-per-screen stage render identical DOM —
  // the ids the answer handlers manipulate stay the same either way.
  _renderOneQuestion(m, mi, qi, dayIdx) {
    const q = m.questions[qi];
    var qId = 'q-' + mi + '-' + qi;
    // v142（家长 2026-10-18）：「阅读理解界面等系统先读句子的声音太久」。
    // 两件事：
    //   1) 阅读题的选项**不等题干读完**就能点 —— 一进屏就能选，题干朗读
    //      照旧在旁边读，孩子想听可以点「重新听」。以前要灰着等朗读
    //      （最长 6 秒），感觉就是"半天转不出来"。
    //   2) 点选项要读的**整句（问句+答句）**在渲染这一刻就预取音频，
    //      点下去直接播本地缓存，不再现场请求 TTS。
    var isReading = (m.type === 'reading');
    var qHasAudio = !!this._questionSpeechText(m, q);
    if (isReading) {
      var say = this._buildReadSentence(m, q);
      if (say) this.prefetchTts(say, (this.state && typeof this.state.stepIdx === 'number') ? this.state.stepIdx : 0);
    }
    let html = '<div class="q-item" id="' + qId + '">';
    html += '<div class="q-num">第' + (qi+1) + '题</div>';
    // Add listen button if the question has audio content
    // (listening audio_text, an English stem, or the cloze sentence the
    // blank lives in — see _questionSpeechText)
    if (qHasAudio) {
      html += '<div class="auto-read-badge" id="arb-' + mi + '-' + qi + '"><svg class="icon icon-sm speaking-anim"><use href="#i-sound"/></svg> 正在朗读…</div>';
      html += '<div class="flex gap-8 mb-8"><button class="btn btn-outline btn-sm" onclick="App.replayQuestion(\'' + qId + '\',' + mi + ',' + qi + ',\'' + dayIdx + '\')"><svg class="icon icon-sm"><use href="#i-sound"/></svg> 重新听</button></div>';
    }
    html += '<div class="q-text">' + this._stemHtml(q.question) + '</div>';
    if (q.options) {
      // Options disabled until reading finishes（阅读题例外：立即可点，见上）
      html += '<div class="q-options" id="qo-' + mi + '-' + qi + '"' + (isReading ? '' : ' style="opacity:0.4;pointer-events:none"') + '>';
      q.options.forEach((o, oi) => {
        html += '<div class="q-option" onclick="App.selectAnswer(' + mi + ',' + qi + ',' + oi + ',' + dayIdx + ')">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
      });
      html += '</div>';
      if (!isReading) {
        html += '<div class="listen-wait" id="qw-' + mi + '-' + qi + '" style="text-align:center;padding:8px;color:var(--text-sub);font-size:12px">⏳ 请先听完整朗读，再选择答案</div>';
      }
    } else {
      html += '<input type="text" class="vocab-input" style="width:100%;letter-spacing:1px;border:1.5px solid #FFE0CC;margin-top:8px" id="fill-' + mi + '-' + qi + '" placeholder="填入答案" onkeyup="if(event.key===\'Enter\')App.submitFill(' + mi + ',' + qi + ',' + dayIdx + ')">';
      html += '<button class="btn btn-primary btn-sm mt-8" onclick="App.submitFill(' + mi + ',' + qi + ',' + dayIdx + ')">确认</button>';
    }
    html += '<div class="q-answer" id="ans-' + mi + '-' + qi + '" style="display:none"></div>';
    // 孩子只看到中文解释：答错时再甩一段英文解释，看不懂，只是多一屏噪音。
    html += '<div class="q-explanation" id="exp-' + mi + '-' + qi + '"><div class="cn">' + (q.explanation_cn||'') + '</div>';
    // The correction area that used to live here is gone: the child corrects
    // in the original box — re-tapping an ABCD option, or retyping in the same
    // fill-in input. A second, separate answer box asked them to write the
    // answer twice and told them nothing the original field didn't.
    html += '</div>';
    // Follow-read area: after the child picks an ABCD option, we force them to
    // read the question sentence aloud. score >= 60 unlocks either finishing
    // (if the pick was right) or re-picking (if it was wrong).
    if (q.options) {
      html += '<div id="qr-follow-' + mi + '-' + qi + '" class="qr-follow"></div>';
    }
    html += '</div>';
    return html;
  },

  // Auto-speak a specific question and enable its options when done
  _autoSpeakQuestion(m, mi, qi, dayIdx) {
    var q = m.questions[qi];
    var unlock = function() {
      var optsEl = document.getElementById('qo-' + mi + '-' + qi);
      var waitEl = document.getElementById('qw-' + mi + '-' + qi);
      if (optsEl) { optsEl.style.opacity = '1'; optsEl.style.pointerEvents = 'auto'; }
      if (waitEl) waitEl.style.display = 'none';
    };
    var speakText = this._questionSpeechText(m, q);
    if (!speakText) { unlock(); return; }
    // Only the English stem is read. Chinese meanings and the answer
    // explanation are never spoken; speak() filters once more as a net.
    // v141：朗读卡住时的兜底 —— 最多等 6 秒就解锁选项，不让「⏳ 请先听完整
    // 朗读」把孩子锁在屏幕外（speak() 自己的绝对超时是 12 秒，家长反馈
    // 「点了没反应」的一大来源就是这段等待）。音频还在放也不影响：选项
    // 解锁只是允许他提前选，选完还有一整句示范要听。
    var done = false;
    var open = function() { if (!done) { done = true; unlock(); } };
    this.autoSpeak(speakText, open);
    setTimeout(open, 6000);
  },

  replayQuestion(qId, mi, qi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    // Disable options while replaying
    var optsEl = document.getElementById('qo-' + mi + '-' + qi);
    var waitEl = document.getElementById('qw-' + mi + '-' + qi);
    if (optsEl) { optsEl.style.opacity = '0.4'; optsEl.style.pointerEvents = 'none'; }
    if (waitEl) { waitEl.style.display = 'block'; }
    var speakText = this._questionSpeechText(m, q);
    if (!speakText) {                       // nothing English to read — unlock now
      if (optsEl) { optsEl.style.opacity = '1'; optsEl.style.pointerEvents = 'auto'; }
      if (waitEl) waitEl.style.display = 'none';
      return;
    }
    this.speak(speakText, { onDone: function() {
      if (optsEl) { optsEl.style.opacity = '1'; optsEl.style.pointerEvents = 'auto'; }
      if (waitEl) waitEl.style.display = 'none';
    }});
  },

  selectAnswer(mi, qi, oi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    const isCorrect = oi === q.answer;

    if (this.isTeacher()) {
      // Teacher scrolling list — keep the original "answer → lock → next"
      // behaviour. The mandatory hold-to-read is a student-side guard.
      this._recordAnswer(dayIdx, mi, qi, oi, isCorrect);
      const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
      opts.forEach((el, i) => {
        el.classList.remove('correct', 'wrong', 'selected');
        el.style.pointerEvents = 'none';
        if (i === q.answer) el.classList.add('correct');
        if (i === oi && !isCorrect) el.classList.add('wrong');
      });
      const ansEl = document.getElementById('ans-' + mi + '-' + qi);
      ansEl.style.display = 'block';
      ansEl.innerHTML = isCorrect ? '✅ 正确！' : '❌ 错误。正确答案：' + String.fromCharCode(65+q.answer);
      if (isCorrect) {
        this._playCorrectSound();
      } else {
        this._playWrongSound();
        document.getElementById('exp-' + mi + '-' + qi).classList.add('show');
      }
      if (qi < m.questions.length - 1) {
        const self = this;
        setTimeout(function() {
          self._autoSpeakQuestion(m, mi, qi + 1, dayIdx);
        }, isCorrect ? 1500 : 2500);
      }
      return;
    }

    // Student path: pick first, read only on a confirmed-correct answer.
    //   - Wrong pick: lock just that option red+disabled, others come back
    //     on the same ABCD row, prompt "请在原 ABCD 上点选正确答案". NO
    //     recording happens — the child just re-taps until they pick the
    //     right one.
    //   - Correct pick (first try OR after one or more wrongs): lock the
    //     whole row and require a HOLD-to-read of the question sentence
    //     with score >= 60 before the answer is recorded.
    // v140（家长 2026-10-18）：阅读理解点选项，**先把「问句 + 答句」整句
    // 读出来，读完才算"选了"**。v140 第一版只读所选的那个选项 —— 家长实测
    // 打回：「没有将问句和答句连到一起，像之前一样，系统先读，学生再读」。
    // 现在点一下读的是 _buildReadSentence 拼好的完整一句（跟读面板同一句），
    // 示范只放这一遍，后面两个分支直接用。
    // v141：点下的**第一瞬间**就要有反馈 —— 选项按压缩动 + 手机震一下 +
    // 高亮，然后才轮到朗读（家长：「没有弹动也没有任何提示」）。
    if (m.type === 'reading' && this.state.audioEnabled) {
      const pickedText = (q.options && q.options[oi] != null) ? String(q.options[oi]) : '';
      // —— 即时反馈，不等任何网络 ——
      const pickedEl = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option')[oi];
      if (pickedEl) {
        pickedEl.classList.add('picking');
        setTimeout(function() { pickedEl.classList.remove('picking'); }, 600);
      }
      try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {}
      const ansEl0 = document.getElementById('ans-' + mi + '-' + qi);
      if (ansEl0) {
        ansEl0.style.display = 'block';
        if (!ansEl0.textContent) ansEl0.innerHTML = '🔊 听一听这句话…';
      }
      const joined = this._buildReadSentence(m, q);
      const sayText = (joined && this._ttsText(joined)) ? joined : pickedText;
      if (sayText && this._ttsText(sayText)) {
        const optsEl = document.getElementById('qo-' + mi + '-' + qi);
        if (optsEl) optsEl.style.pointerEvents = 'none';   // 朗读期间不许连点
        const self = this;
        // 兜底：朗读万一卡住（TTS 慢/超时），3.5 秒后照常结算，绝不把孩子
        // 锁死（v142：原来 8 秒 —— 音频没起来时那就是干等 8 秒）。
        // 另外 1.2 秒还没出声就直接结算：预取的音频命中时几乎立刻响，
        // 迟迟不出声说明这一趟 TTS 不顺，没必要继续等。
        let settled = false;
        const decide = function() {
          if (settled) return;
          settled = true;
          if (optsEl) optsEl.style.pointerEvents = 'auto';
          self._readingDecide(m, mi, qi, oi, dayIdx);
        };
        this.speak(sayText, { onDone: decide });
        setTimeout(function() {
          if (!self._audioStarted) decide();
        }, 1200);
        setTimeout(decide, 3500);
        return;
      }
    }
    this._readingDecide(m, mi, qi, oi, dayIdx);
  },

  // selectAnswer 的结算段（v140 拆出来的）：走到这里才算真正"选了"。
  // 阅读理解的答错走 _readingWrongFlow（老师式引导），其余题型走原来的
  // 三档文字提示。
  _readingDecide(m, mi, qi, oi, dayIdx) {
    const q = m.questions[qi];
    const isCorrect = oi === q.answer;

    this._lastPick = this._lastPick || {};
    this._lastPick[mi + '-' + qi] = { oi: oi, isCorrect: isCorrect };

    const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
    const ansEl = document.getElementById('ans-' + mi + '-' + qi);

    if (!isCorrect) {
      if (m.type === 'reading') {
        this._readingWrongFlow(m, mi, qi, oi, dayIdx);
        return;
      }
      // 答错不点答案（v104）：只划掉他点错的那一项、给一句中文提示，
      // 正确项一律不亮绿 —— 孩子得自己把它找出来。
      const tryKey = 'q-' + mi + '-' + qi;
      const attempt = this._wrongTryBump(tryKey);
      opts.forEach((el, i) => {
        el.classList.remove('correct', 'selected');
        if (i === oi || el.classList.contains('wrong')) {
          el.classList.add('wrong');            // 错过的就地划掉，越选范围越小
          el.style.pointerEvents = 'none';
        } else {
          el.style.pointerEvents = 'auto';
        }
      });
      this._showWrongHint(ansEl, this._wrongHintHtml({
        attempt: attempt,
        opts: q.options,
        answer: q.answer,
        correctText: (q.options && q.options[q.answer]) || '',
        picked: oi,
        clue3: q.explanation_cn,
        retryTip: '把题目再听一遍，先弄清楚它在问什么。',
      }));
      this._playWrongSound();
      // Wrong pick clears any stale hold-read panel — a wrong pick is just a
      // "try again" hint, no recording has happened yet.
      const followEl = document.getElementById('qr-follow-' + mi + '-' + qi);
      if (followEl) followEl.innerHTML = '';
      // 和口语模块一致：把点错的这句立刻读出来给他听——听力题尤其重要，
      // 孩子要靠耳朵发现自己选的句子和原文差在哪。**提示词全程挂着**，
      // 不用等读完就能改选（v104：不再等朗读结束去改写提示，改写等于把
      // 孩子刚读到的引导擦掉）。
      // speak() 自己会分流：单词走有道、句子走自家端点；渲染时四个选项
      // 全都预取好了（见 prefetchUpcoming 的 copts 循环），点下去零等待。
      // 这是 v70/v76 两次修过的行为，删掉守卫等于回归红线，勿再收窄。
      var pickedText = (q.options && q.options[oi] != null) ? String(q.options[oi]) : '';
      if (pickedText && this.state.audioEnabled) {
        this.speak(pickedText);
      }
      return;
    }

    // Correct pick — gate the answer behind a recorded read-aloud.
    // 选对的一瞬间就给成功提示音（和词汇游戏一致），同时停掉可能还在播的
    // 错句朗读——别让它漏进接下来的跟读录音里。
    this._stopCurrentAudio();
    this._showSpeakingIndicator(false);
    this._playCorrectSound();
    this._wrongTryClear('q-' + mi + '-' + qi);
    opts.forEach((el, i) => {
      el.classList.remove('correct', 'wrong', 'selected');
      el.style.pointerEvents = 'none';
      // 点对哪一项，那一项就当场亮绿 —— 提示音得有个"落点"，不然孩子
      // 听到一声响却不知道是冲着哪一项来的。跟读门槛完全不受影响：
      // 下一题仍然要读够 60 分才开（见 _setHoldReadUI 的 passed 分支）。
      // 这是全程唯一一处"亮绿"（v104）：答错时一次都不会亮。
      if (i === q.answer) el.classList.add('correct');
    });
    if (ansEl) {
      ansEl.style.display = 'block';
      this._clearWrongHint(ansEl);
      // v141：措辞改成孩子能照着做的两步 —— 跟着读一遍，读完就能点下一题。
      ansEl.innerHTML = '✅ 选对了！点下方按钮跟着读这句话（读够 60 分就解锁下一题）';
    }

    const followEl = document.getElementById('qr-follow-' + mi + '-' + qi);
    if (followEl) {
      // 用 _buildReadSentence：剥指令词、剥中文、横杠处用正确答案补全
      const sentence = this._buildReadSentence(m, q);
      this._renderHoldReadPanel(followEl, mi, qi, dayIdx, sentence);
      // v141 关键修复：示范在孩子点选项的那一刻已经整句放过一遍了（见
      // selectAnswer 的 reading 分支），跟读面板不能再锁 —— 以前这里既不
      // 自动放示范也不解锁，「🎤 点我读」灰着点不动，孩子做完题卡在这一屏，
      // 下一题永远灰的（家长 2026-10-18 报的就是这个）。现在直接开门，
      // 门上的「先听一遍」按钮保留，想再听随时点。
      this._gateUnlock(this._gid('hrg', mi, qi));
    }
  },

  // v140（家长 2026-10-18）：阅读理解答错 —— 不再说"在 B、C 里面挑一个"，
  // 改成老师式的引导，一套固定顺序：
  //   1. 系统把「问句 + 答句」（_buildReadSentence 拼好的整句）先读出来；
  //   2. 孩子按住跟读这一句（同一个跟读面板）；
  //   3. 读完后中文讲解已经摆出来，选项解锁，孩子自己再选一遍。
  // 正确答案自始至终不亮绿 —— 最后那一下仍然要孩子自己找、自己点。
  _readingWrongFlow(m, mi, qi, oi, dayIdx) {
    const q = m.questions[qi];
    const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
    const ansEl = document.getElementById('ans-' + mi + '-' + qi);
    this._playWrongSound();
    // 点错的就地划掉、锁住（越选范围越小）；其余项引导期间全部锁住，
    // 等跟读完再放 —— 引导做完才有资格再选。
    opts.forEach((el, i) => {
      el.classList.remove('correct', 'selected');
      if (i === oi || el.classList.contains('wrong')) {
        el.classList.add('wrong');
      }
      el.style.pointerEvents = 'none';
    });
    if (ansEl) {
      ansEl.style.display = 'block';
      this._clearWrongHint(ansEl);
      ansEl.innerHTML = '🔔 听完了吧？点下方按钮跟着读，读完再选一次。';
    }
    // 中文讲解摆出来（引导式解释结构保留）
    const expEl = document.getElementById('exp-' + mi + '-' + qi);
    if (expEl) expEl.classList.add('show');

    const sentence = this._buildReadSentence(m, q);
    const followEl = document.getElementById('qr-follow-' + mi + '-' + qi);
    if (!sentence || !followEl) {
      // 没有可跟读的句子：解锁没划掉的选项，让孩子直接再选
      opts.forEach(el => { if (!el.classList.contains('wrong')) el.style.pointerEvents = 'auto'; });
      if (ansEl) ansEl.innerHTML = '🔔 再想一想，选一次。';
      return;
    }
    this._renderHoldReadPanel(followEl, mi, qi, dayIdx, sentence);
    // 结算标记：这个面板是"引导跟读"，不是正选题 —— 跟读完不记答案、
    // 不进下一题，只解锁选项让孩子再选一次（见 _showHoldReadResult）。
    this._guidedPick = mi + '-' + qi;
    // v141：示范不用再放第二遍 —— 孩子点选项的那一刻，「问句 + 答句」整句
    // 已经读过一遍了（selectAnswer 的 reading 分支），直接开门。门上那颗
    // 「先听一遍」保留，孩子想再听随时点。以前这里再 speak 一遍 + 8 秒兜底，
    // 示范卡住时门迟迟不开，「点我读」灰着点不动，孩子就卡死在引导里。
    this._gateUnlock(this._gid('hrg', mi, qi));
  },

  // Mandatory follow-read for ABCD-style questions. Records the child
  // reading `sentence`, scores it against the same model that drives
  // speaking questions, and invokes onResult(score, passed) where `passed`
  // is true when score >= 60. The recorder state is shared with the
  // speaking module — only one read can be in flight at a time.
  _runReadAlongForQuestion(mi, qi, dayIdx, sentence, onResult) {
    // Deprecated path — kept as a no-op shim so any leftover caller doesn't
    // crash. The new flow uses _renderHoldReadPanel / _holdReadStart /
    // _holdReadEnd (press-and-hold UX).
    try { onResult(0, false); } catch (e) {}
  },

  _stopQrRead(mi, qi) {
    // Deprecated: the new hold-read panel doesn't have a manual stop button.
    // If something is mid-recording, finish it so the mic is released.
    if (typeof this._holdReadEnd === 'function') this._holdReadEnd(mi, qi, null);
  },

  _startQrRead(mi, qi, dayIdx) {
    // Deprecated: re-render the hold-read panel to retry.
    const m = HOMEWORK_DATA && HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (!m) return;
    const q = m.questions[qi];
    const sentence = this._buildReadSentence(m, q);
    const followEl = document.getElementById('qr-follow-' + mi + '-' + qi);
    if (followEl) this._renderHoldReadPanel(followEl, mi, qi, dayIdx, sentence);
  },

  _qrSelfScore(mi, qi, dayIdx, score) {
    // Deprecated: re-render the hold-read panel so the child can press-and-
    // hold again. The new flow has no self-score buttons.
    const m = HOMEWORK_DATA && HOMEWORK_DATA[dayIdx] && HOMEWORK_DATA[dayIdx].modules[mi];
    if (!m) return;
    const q = m.questions[qi];
    const sentence = this._buildReadSentence(m, q);
    const followEl = document.getElementById('qr-follow-' + mi + '-' + qi);
    if (followEl) this._renderHoldReadPanel(followEl, mi, qi, dayIdx, sentence);
  },

  // Press-and-hold read-along panel. The mic button stays open while the
  // child has it pressed; on release we score the captured audio against
  // the question sentence. Threshold is 60. Compared to the old auto-stop
  // pipeline the timing is fully user-controlled, so we never wait for
  // silence detection — that shaves a couple of seconds off every pick.
  // 点击跟读面板。点一下麦克风开始录音，读完再点一下就结束并打分。
  // 相比按住不放，孩子不用一直压着按钮，读长句也不会手累；15 秒兜底
  // 自动收一次，防止忘了点停止、麦克风一直开着。
  _renderHoldReadPanel(followEl, mi, qi, dayIdx, sentence) {
    const sid = 'hr-' + mi + '-' + qi;
    const stid = 'qr-status-' + mi + '-' + qi;
    const sentid = 'rd-sent-' + mi + '-' + qi;
    const gid = this._gid('hrg', mi, qi);
    followEl.innerHTML = '<div class="speak-record show" style="text-align:center">'
      + '<p class="fs-12 text-sub">请朗读下面这句完整的话（问句和答案都读出来）：</p>'
      + '<div class="rd-sentence" id="' + sentid + '">' + this._readSentenceHtml(sentence) + '</div>'
      + '<div class="rd-live-hint" id="rd-live-' + mi + '-' + qi + '"></div>'
      + '<div class="gate-bar">' + this._gateListenHtml(gid, sentence, '🔊 先听一遍示范') + '</div>'
      + '<div id="' + stid + '" style="min-height:18px;margin:6px 0;color:var(--text-sub);font-size:14px"></div>'
      + '<button id="' + sid + '" class="speak-btn qr-hold-btn gate-locked" data-gate="' + gid + '" '
      + 'style="background:var(--primary);margin-top:8px;font-size:18px;padding:18px 32px;'
      + 'user-select:none;-webkit-user-select:none;touch-action:none;border-radius:24px;min-width:200px">'
      + '🎤 点我读</button>'
      + '<p class="fs-12 text-sub" style="margin-top:8px">先听完上面的示范，再点「点我读」；读到的词会变绿打勾，读完了再点一下就打分。读错的词要读对了才能进下一题。</p>'
      + '<p class="fs-12 text-sub" style="margin-top:2px">不认识的词，点一下就有读音和中文意思。</p>'
      + '</div>';
    const btn = document.getElementById(sid);
    if (!btn) return;
    const self = this;
    // 点一下：正在录音 → 结束打分；没在录 → 开始新一轮。
    // touchstart 上 preventDefault，避免手机再补发一次 mousedown 点了两下。
    const onTap = function(e) {
      e.preventDefault();
      if (self._holdReadActive) self._holdReadEnd(mi, qi, dayIdx);
      else self._holdReadStart(mi, qi, dayIdx, sentence);
    };
    btn.addEventListener('touchstart', onTap, { passive: false });
    btn.addEventListener('mousedown', onTap);
    btn.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    // v143：同上 —— 刷新后红词还在。
    this.restoreReadMarks(mi, qi, dayIdx, stid);
  },

  // ===== 跟读：逐词标记 =====
  //
  // 句子拆成一个个词渲染。读对的词变绿打勾，读错的标红波浪线，光标（浅橙）
  // 停在他还没读到的那个词上。孩子一眼能看出读到哪、哪个词没过。
  //
  // 出词有两条路，按"能不能用"自动挑：
  //   A. 手机自带识别（iOS 走 Apple 服务，境内可用）：边说边出词，松手瞬间
  //      就有分，完全不等网络 —— 这是唯一能把等待压到 0 的办法。
  //   B. 录下来送 whisper（安卓浏览器在国内基本调不到识别服务）：松手后
  //      1.5–3.5s 出分，分数到的同时逐词标出来。
  //   两条同时开着，A 报错就把 A 关掉（_srBroken），B 照常兜底 —— 不会因为
  //   试 A 失败而白丢一次录音。
  _escHtml(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // 词典的中文释义压到最短：去掉词性标注（adv. / v. / n. …），只取第一个
  // 义项的第一小段。"v. 描述，形容；做……运动" → "描述"，两三个字扫一眼就懂。
  _shortZh(zh) {
    let s = String(zh || '').trim();
    if (!s) return '';
    s = s.replace(/^[a-zA-Z]+\.+\s*/, '');           // 词性标注
    s = s.split(/;|；/)[0];                            // 只留第一个义项
    s = s.split(/,|，|、/)[0];                         // 义项里只留第一小段
    s = s.replace(/……/g, '').replace(/[（(].*?[)）]/g, '').trim();
    return s;
  },

  // 把句子切成「显示片段」，每个可读片段带一个序号；数字按朗读时展开后的
  // 个数记在 n 上（"21" 读作 "twenty one"，占 2 个归一化词，"3D" 占 2 个），
  // 这样和 alignSpeech 的逐词结果能一一对上，不会整体错位。
  _readTokens(sentence) {
    const parts = String(sentence || '').match(/[A-Za-z0-9][A-Za-z0-9'\-]*|[^A-Za-z0-9]+/g) || [];
    const display = [];
    const words = [];
    let wi = 0;
    parts.forEach(function(p) {
      if (/^[A-Za-z0-9]/.test(p)) {
        const sub = App._tokens(p);
        display.push({ text: p, word: true, wi: wi, n: sub.length || 1 });
        for (let k = 0; k < sub.length; k++) words.push(sub[k]);
        wi++;
      } else {
        display.push({ text: p, word: false, wi: -1, n: 0 });
      }
    });
    return { display: display, words: words, wordCount: wi };
  },

  // v143：一句话里哪些位置开始有固定搭配。
  // 传进来的是"纯单词"数组（不含标点），返回 { 起始下标: {len, en, zh, surface} }。
  // 贪心最长匹配，所以 look forward to 不会被拆成 look 和 forward。
  _phraseMask(words) {
    const mask = {};
    if (typeof WordHelp === 'undefined' || !words || !words.length) return mask;
    let i = 0;
    while (i < words.length) {
      const p = WordHelp.phraseAt(words, i);
      if (p) { mask[i] = p; i += p.len; } else { i++; }
    }
    return mask;
  },

  _readSentenceHtml(sentence) {
    const t = this._readTokens(sentence);
    const esc = this._escHtml;
    // 先把每个"词片段"在 display 里的下标列出来，短语合并才找得到范围。
    const pos = [];
    t.display.forEach(function (d, k) { if (d.word) pos.push(k); });
    const mask = this._phraseMask(t.display.filter(d => d.word)
      .map(d => String(d.text).replace(/[^A-Za-z'\-]/g, '')));
    let html = '';
    let wi = 0;                       // 第几个词片段（不是 display 下标）
    while (wi < pos.length) {
      const p = mask[wi];
      if (p && pos[wi + p.len - 1] !== undefined) {
        // giving up 这种：两个词（连同它们中间的空格）合成一个盒子，
        // 孩子点哪一半都是查这一整个短语。
        const from = pos[wi], to = pos[wi + p.len - 1];
        let text = '', n = 0;
        for (let k = from; k <= to; k++) {
          text += t.display[k].text;
          // 只数"词"：中间的空格/标点没有读音，不能算进 data-n，
          // 否则逐词判分会整体错位（gave up 会被当成 3 个词）。
          if (t.display[k].word) n += (t.display[k].n || 1);
        }
        html += '<span class="rd-w lk-word lk-phrase" data-w="' + t.display[from].wi
             + '" data-n="' + n + '" data-phrase="' + esc(p.en) + '">' + esc(text) + '</span>';
        wi += p.len;
        continue;
      }
      const d = t.display[pos[wi]];
      html += '<span class="rd-w" data-w="' + d.wi + '" data-n="' + d.n + '">' + esc(d.text) + '</span>';
      wi++;
    }
    return html;
  },

  _clearReadMarks(mi, qi) {
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (!panel) return;
    panel.querySelectorAll('.rd-w').forEach(function(el) {
      el.classList.remove('rd-ok', 'rd-bad', 'rd-cur');
    });
  },

  // ===== v143：逐句判分台账 ===============================================
  //
  // 家长 2026-10-19：「有读错的单词，多刷新几次，错的单词就会被冲掉，显示读成
  // 了 100 分。但其实孩子什么都没做，只是偷了个懒。」
  //
  // 根子：红词只活在 DOM 上。刷新一下页面，句子重新渲染成干干净净的一行，
  // 孩子/家长看到的就像"没读错过"，再读一遍随手过了就变成满分。
  //
  // 台账 = 这一句**至今为止**的判分结果，记在本机（跟着学生 + 周次 + 天 +
  // 模块 + 题号），规则只有一条：**错词只增不减**。
  //   · 新一遍读错了 → 并进旧错词里；分数取两遍里低的那个（成绩不会因为
  //     刷新而变好）；
  //   · 新一遍真的全读对了 → 清空。这是唯一的清零方式，靠"读对"，不靠刷新。
  _READ_LEDGER_KEY: 'amy_read_ledger_v1',

  _readLedgerAll() {
    try { return JSON.parse(localStorage.getItem(this._READ_LEDGER_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  },

  _readKey(mi, qi, dayIdx) {
    let wk = '';
    try { wk = (typeof Api !== 'undefined' && Api._weekTag) ? Api._weekTag() : ''; } catch (e) {}
    return this._myStudentId() + wk + '|d' + dayIdx + '|' + mi + '|' + qi;
  },

  readLedgerGet(mi, qi, dayIdx) {
    const all = this._readLedgerAll();
    return all[this._readKey(mi, qi, dayIdx)] || null;
  },

  readLedgerSave(mi, qi, dayIdx, rec) {
    try {
      const all = this._readLedgerAll();
      const key = this._readKey(mi, qi, dayIdx);
      const prev = all[key] || null;
      let out;
      if (rec && rec.pass) {
        out = { pass: true, score: Number(rec.score) || 0, bad: [], at: Date.now() };
      } else {
        const bad = [];
        ((prev && prev.bad) || []).concat((rec && rec.bad) || []).forEach(function (w) {
          if (w && bad.indexOf(w) < 0) bad.push(w);
        });
        const prevScore = (prev && typeof prev.score === 'number') ? prev.score : null;
        const nowScore = (rec && typeof rec.score === 'number') ? rec.score : null;
        let score = nowScore;
        if (prevScore !== null && nowScore !== null) score = Math.min(prevScore, nowScore);
        else if (prevScore !== null) score = prevScore;
        out = { pass: false, score: score, bad: bad, at: Date.now() };
      }
      all[key] = out;
      // 只留最近 300 条，别把 localStorage 撑爆
      const keys = Object.keys(all);
      if (keys.length > 300) {
        keys.sort(function (a, b) { return (all[a].at || 0) - (all[b].at || 0); });
        keys.slice(0, keys.length - 300).forEach(function (k) { delete all[k]; });
      }
      localStorage.setItem(this._READ_LEDGER_KEY, JSON.stringify(all));
    } catch (e) {}
  },

  // 把台账里的红词重新画回句子上，并在状态区说明"上次错在哪"。
  // 刷新之后孩子看到的仍然是那几个红词，不会以为自己做完了。
  restoreReadMarks(mi, qi, dayIdx, statusElId) {
    const rec = this.readLedgerGet(mi, qi, dayIdx);
    if (!rec || rec.pass) return;
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (!panel) return;
    const bad = rec.bad || [];
    if (bad.length) {
      const lower = bad.map(function (w) { return String(w).toLowerCase(); });
      panel.querySelectorAll('.rd-w').forEach(function (el) {
        const w = String(el.textContent || '').toLowerCase().replace(/[^a-z'\-]/g, '');
        if (!w) return;
        // 短语盒子按整块比，单词按词比
        if (lower.indexOf(w) >= 0) el.classList.add('rd-bad');
        else if (w.split(/\s+/).some(function (x) { return lower.indexOf(x) >= 0; })) el.classList.add('rd-bad');
      });
    }
    const statusEl = statusElId ? document.getElementById(statusElId) : null;
    if (statusEl) {
      const scoreTxt = (typeof rec.score === 'number') ? (' ' + rec.score + ' 分') : '';
      statusEl.innerHTML = '<span style="color:var(--danger);font-weight:600">还没读对' + scoreTxt + '</span>'
        + (bad.length
          ? '<div class="fs-12 text-sub">上次读错的词：' + bad.slice(0, 6).map(function (w) {
              return '<b>' + this._escHtml(w) + '</b>';
            }, this).join('、') + '（刷新不会把它们清掉，读对了才会消失）</div>'
          : '<div class="fs-12 text-sub">这一句还没读对，再读一遍。</div>');
    }
  },

  // ===== 实时逐词高亮：只回答一个问题 ——「他现在读到第几个词」===========
  //
  // 这里和出分是两条完全不同的路，分开看：
  //   实时（正在读） —— 用的就是下面这条"单调前缀推进"。识别出一个新词就把
  //                    位置往前推一格，永不回退，不解释后半句。
  //   出分（读完了） —— 才走 _markReadProgress 里那套全局对齐，逐词判对错。
  //
  // 为什么实时不能沿用全局对齐：Levenshtein 算的是"对整句话的最优解释"。孩子
  // 才读到一半，它已经把后半句一起拉进来匹配了，最优解常常是"把中间几个词判成
  // 漏读"——落到界面上就是光标卡住不动、或者来回跳，看上去就是高亮慢了半拍、
  // 不跟嘴。前缀推进只做加法，识别到哪就推到哪，天然跟手，而且复杂度从 O(n·m)
  // 掉到 O(m·窗口)，interim 结果一秒来十次也扛得住。
  //
  // 识别本身有噪声（cat 被听成 cut、多吐一个词），这一层刻意"听不出来就不动"：
  // 没匹配上的当噪声跳过，光标停在那儿等孩子重读，而不是乱标红冤枉人。
  _liveRaf: null,
  _livePending: null,

  // interim 结果可能一帧来好几次，合并到每帧最多画一次，省掉多余的重排
  _liveFlush(mi, qi, sentence, spoken) {
    this._livePending = { mi: mi, qi: qi, sentence: sentence, spoken: spoken };
    if (this._liveRaf) return;
    const self = this;
    const raf = window.requestAnimationFrame || function(cb) { return setTimeout(cb, 16); };
    this._liveRaf = raf(function() {
      self._liveRaf = null;
      const p = self._livePending;
      self._livePending = null;
      if (p) self._liveAdvance(p.mi, p.qi, p.sentence, p.spoken);
    });
  },

  // 纯计算，不碰 DOM：目标词序列 T 对上已说词序列 S，回答两件事 ——
  // 哪些目标词确实读到了（hit），以及嘴巴推进到了第几个词（cursor）。
  // 规则只有一条：cursor 只能前进。识别出一个新词就往前走一格，找不着就当
  // 噪声跳过。绝不回退、绝不重排，所以光标不会来回跳。
  _advanceCursor(T, S, WINDOW) {
    const hit = new Array(T.length).fill(false);
    let cursor = 0;
    for (let si = 0; si < S.length; si++) {
      const w = S[si];
      const end = Math.min(T.length, cursor + WINDOW);
      let idx = -1;
      for (let k = cursor; k < end; k++) {
        if (T[k] === w) { idx = k; break; }
      }
      if (idx < 0) continue;                   // 识别噪声，跳过，光标不动
      hit[idx] = true;
      cursor = idx + 1;                        // 单调前进，绝不回退
    }
    return { hit: hit, cursor: cursor };
  },

  _liveAdvance(mi, qi, sentence, spoken) {
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (!panel) return;
    const spans = panel.querySelectorAll('.rd-w');
    if (!spans.length) return;

    const T = this._tokens(sentence);
    const S = this._tokens(spoken || '');
    if (!T.length) return;

    const WINDOW = 3;                          // 往后看几个词，容忍多说/漏说
    const r = this._advanceCursor(T, S, WINDOW);
    const hit = r.hit;
    const cursor = r.cursor;
    let k = 0;
    let curSet = false;
    spans.forEach(function(sp) {
      const n = parseInt(sp.getAttribute('data-n') || '1', 10) || 1;
      const k0 = k;
      k += n;
      if (k0 >= T.length) { sp.classList.remove('rd-ok', 'rd-cur'); return; }
      const seg = hit.slice(k0, Math.min(k, T.length));
      const done = seg.length > 0 && seg.every(Boolean);
      sp.classList.toggle('rd-ok', done);
      // 光标 = 第一个还没读对的词。但如果它已经被嘴甩下两个词以上，那多半是
      // 这一处识别听岔了（孩子其实读对了），光标继续跟着嘴走，不为一个噪声卡住。
      const stale = (k0 + n) <= (cursor - 2);
      if (!done && !stale && !curSet) { sp.classList.add('rd-cur'); curSet = true; }
      else sp.classList.remove('rd-cur');
    });

    // 长句子会折行，光标跑出视野孩子就看不见自己读到哪了 —— 轻轻带回视野。
    const cur = panel.querySelector('.rd-cur');
    if (cur && cur.scrollIntoView) {
      try { cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
  },

  // 出分口径的**唯一入口**（v98）：句子 + 识别文本 → 分数 / 红词 / 过没过。
  //
  // 以前这个判断散在 _spShowResult 和 _showHoldReadResult 里，各自读一遍
  // _markReadProgress 的 spans 结果；而 spans 是"显示格子"，万一某个格子对不上
  // 目标词的个数，红词就会漏算或多算。这里直接从对齐结果里取，永远和分数同源。
  _readVerdict(sentence, spoken) {
    const a = this.alignSpeech(sentence, spoken || '');
    const badWords = a.items
      .filter(function (x) { return x.target && x.status !== 'ok'; })
      .map(function (x) { return { expected: x.target, heard: x.spoken || null }; });
    return {
      align: a,
      score: a.score,
      badWords: badWords,
      passed: a.score >= 60 && badWords.length === 0,
    };
  },

  // 两个候选转写谁更"像这句"：先看有没有过，再看分数，最后看红词多少。
  _verdictRank(v) {
    return (v.passed ? 1000 : 0) + v.score - v.badWords.length * 3;
  },

  // 两路识别结果比一遍，取更像目标句的那个（v98）。
  //
  // 为什么必须比：A 路是手机自带的语音识别 —— 快（不用出网，孩子松手就有分），
  // 但它本质是个语言模型，孩子读得稍微含糊，它会把整句"润色"成另一句通顺的话。
  // 孩子明明读对了，逐词一比却红成一片，还得进纠错重读一遍。B 路（云端阿里云 /
  // whisper）是照声音转写，宽容得多。
  //
  // 所以：A 路先判一次，**过了就立刻出分，一秒都不多等**（绝大多数情况走这里）；
  // 没过才等 B 路复核，谁更接近目标句就用谁的结果。代价只有一个 —— 判不过的那
  // 次多等一两秒，可它本来就要重读，比冤枉人强得多。
  async _bestTranscript(sentence, liveText, blob, samples) {
    let best = null;
    if (liveText && !Api.isFillerTranscript(liveText)) {
      const t = String(liveText).toLowerCase();
      best = { spoken: t, source: 'live', verdict: this._readVerdict(sentence, t) };
      if (best.verdict.passed) return best;
    }
    if (!blob) return best;
    const forAsr = (samples && Recorder.padForAsr(samples)) || blob;
    try {
      // hint 把目标句喂给识别端当偏置（v98）：题库是固定的，孩子要读的就是这
      // 一句 —— 把句子给它，同音词（there/their、`see/sea`）和吞音都会少一大截。
      const out = await Api.transcribe(forAsr, null, { fast: true, hint: sentence, budgeted: true });
      if (out && out.text && !Api.isFillerTranscript(out.text)) {
        const t = out.text.toLowerCase();
        const v = this._readVerdict(sentence, t);
        if (!best || this._verdictRank(v) > this._verdictRank(best.verdict)) {
          best = { spoken: t, source: 'whisper', verdict: v };
        }
      }
      // v124：一路到这儿还是空的（live 没有 + 云端空手）—— 孩子那一遍就是白读了。
      // 家长 2026-10-15 晚高峰的原话："明明按住说话是清楚的，系统就判我没听清"。
      // 换用不带 hint 的默认模式再试一次（hint 太强的偏置在高峰期偶发把结果
      // 压成空），拿到就是用，拿不到才认"没听清"。
      //
      // v131：这一手仍然保留（它是真正救回"被冤枉"的那一道），但**必须**
      // 受统一预算约束 —— 原来它和 Api.transcribe 内部的重试叠加，最坏会打
      // 到 20 次云端调用 / 等 72 秒。现在 asrCanRetry() 说了算：
      // 趟数到顶或时间超预算，就认这一遍没听清，让孩子重读（而不是干等）。
      if (!best && Api.asrCanRetry()) {
        const retry = await Api.transcribe(forAsr, null, { fast: true, budgeted: true });
        if (retry && retry.text && !Api.isFillerTranscript(retry.text)) {
          const t2 = retry.text.toLowerCase();
          best = { spoken: t2, source: 'whisper', verdict: this._readVerdict(sentence, t2) };
        }
      }
    } catch (e) { console.warn('verify transcribe failed:', e); }
    return best;
  },

  // 按逐词对齐结果给句子上色。live=true 直接交给前缀推进那条快路；live=false
  // 才做全局对齐，逐词判 ok / wrong / missing，红色只在这时候出现才作数。
  // preAlign 是已经算好的对齐结果，出分路径会传进来，省掉一次重复计算。
  _markReadProgress(mi, qi, sentence, spoken, live, preAlign) {
    if (live) { this._liveAdvance(mi, qi, sentence, spoken); return null; }
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (!panel) return null;
    const spans = panel.querySelectorAll('.rd-w');
    const a = preAlign || this.alignSpeech(sentence, spoken || '');
    const targets = a.items.filter(function(x) { return x.target; });
    const badWords = [];
    let k = 0;
    let curSet = false;

    spans.forEach(function(sp) {
      const n = parseInt(sp.getAttribute('data-n') || '1', 10) || 1;
      let bad = 0, seen = 0;
      const localBad = [];
      for (let i = 0; i < n; i++) {
        const it = targets[k++];
        if (!it) break;
        seen++;
        if (it.status === 'ok') continue;
        bad++;
        localBad.push({ expected: it.target, heard: it.spoken || null });
      }
      sp.classList.remove('rd-ok', 'rd-bad', 'rd-cur');
      if (!seen) {
        if (!curSet) { sp.classList.add('rd-cur'); curSet = true; }
        return;
      }
      if (bad) {
        sp.classList.add('rd-bad');
        localBad.forEach(function(x) { badWords.push(x); });
      } else {
        sp.classList.add('rd-ok');
      }
    });
    return { align: a, badWords: badWords };
  },

  // ---- 错词原处重读：句子里红色波浪线的词，要单独读对了才能进下一题 ----
  // 一轮朗读出分后逐个过没读对的词：卡片上亮出当前词 → 孩子点「读这个
  // 单词」→ 再点一下停止 → whisper 只核对这一个词。读对了，原句里那个词
  // 当场从红色波浪线变绿打勾；全部变绿这句话才算通过。阅读选择题和口语
  // 练习两个面板共用这一套。
  _wordRepair: null,

  _startWordRepair(mi, qi, sentence, statusElId, onAllFixed, hearSentence) {
    if (this._wordRepair) return;
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (!panel) return;
    this._wordRepair = {
      mi: mi, qi: qi, sentence: sentence,
      statusElId: statusElId, onAllFixed: onAllFixed,
      hearSentence: hearSentence || null,
      rec: false, startedAt: 0, capTimer: null, word: '',
    };
    this._wordRepairNext();
  },

  // 找下一个红波浪线的词亮出来；没有了就走各自的"通过"回调。
  _wordRepairNext() {
    const R = this._wordRepair;
    if (!R) return;
    const panel = document.getElementById('rd-sent-' + R.mi + '-' + R.qi);
    const statusEl = document.getElementById(R.statusElId);
    if (!panel) { this._wordRepair = null; return; }
    panel.querySelectorAll('.rd-cur').forEach(function(el) { el.classList.remove('rd-cur'); });
    const bads = panel.querySelectorAll('.rd-bad');
    if (!bads.length) {
      const done = R.onAllFixed;
      this._wordRepair = null;
      if (done) done();
      return;
    }
    const cur = bads[0];
    cur.classList.add('rd-cur');
    // v143：短语盒子（giving up）要连着读，别把空格也删掉变成 "givingup"。
    const word = (cur.getAttribute && cur.getAttribute('data-phrase')
      ? cur.getAttribute('data-phrase')
      : (cur.textContent || ''))
      .replace(/[^A-Za-z'\- ]/g, '').replace(/\s+/g, ' ').trim();
    R.word = word;
    // 每个词单独一道门禁：换词就重新要求先听一遍（id 里带上词本身）
    const wgid = this._gid('wrep', R.mi, R.qi, word);
    if (statusEl) {
      statusEl.innerHTML =
        '<div class="rd-repair-card">'
        + '<div class="rd-repair-word">' + this._escHtml(word)
        + '<span class="rd-repair-zh" id="wrep-zh"></span></div>'
        + '<div class="fs-12 text-sub">先把这个词听一遍，再点下面读它；读对了才能进下一题（也可以重读整句）</div>'
        + '<div class="gate-bar">' + this._gateListenHtml(wgid, word, '🔊 先听这个词') + '</div>'
        + '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap">'
        + '<button class="speak-btn" style="background:var(--primary)" onclick="App._wordRepairHearSentence()">🔊 听整句</button>'
        + '<button class="speak-btn gate-locked" data-gate="' + wgid + '" id="wrep-btn" style="background:var(--danger);font-size:18px;padding:16px 28px;border-radius:22px;user-select:none;-webkit-user-select:none;touch-action:none">🎤 点我读这个单词</button>'
        + '</div>'
        + '<div id="wrep-hint" class="fs-12 text-sub" style="margin-top:8px;min-height:18px"></div>'
        + '</div>';
      const self = this;
      // 词旁边带上最常见的中文意思——只留最短的那一个，两三个字，
      // 方便孩子扫一眼就知道这个词是什么，不用读一长串释义。
      // v143：短语（giving up）先问本地表 —— 词典接口不收带空格的词。
      const phInfo = (typeof WordHelp !== 'undefined') ? WordHelp.phraseInfo(word) : null;
      if (phInfo) {
        const zhEl = document.getElementById('wrep-zh');
        if (zhEl) zhEl.textContent = phInfo.zh;
      } else {
        Api.dict(word).then(function(info) {
          if (R !== self._wordRepair || R.word !== word) return;   // 已经换词了
          const zhEl = document.getElementById('wrep-zh');
          if (!zhEl) return;
          const zh = self._shortZh(info && info.zh);
          if (zh) zhEl.textContent = zh;
        });
      }
      const rbtn = document.getElementById('wrep-btn');
      if (rbtn) {
        const onRtap = function(e) {
          e.preventDefault();
          self._wordRepairTap();
        };
        rbtn.addEventListener('touchstart', onRtap, { passive: false });
        rbtn.addEventListener('mousedown', onRtap);
        rbtn.addEventListener('contextmenu', function(e) { e.preventDefault(); });
      }
    }
  },

  _wordRepairHear() {
    const R = this._wordRepair;
    if (R && R.word) this.speak(R.word);
  },

  _wordRepairHearSentence() {
    const R = this._wordRepair;
    if (R && typeof R.hearSentence === 'function') R.hearSentence();
  },

  _wordRepairTap() {
    const R = this._wordRepair;
    if (!R) return;
    const wgid = this._gid('wrep', R.mi, R.qi, R.word);
    if (!this._gateOpen(wgid)) { this._gateNudge(wgid); return; }   // 先听再读
    if (R.rec) this._wordRepairStop();
    else this._wordRepairRec();
  },

  _wordRepairRec() {
    const R = this._wordRepair;
    if (!R || R.rec) return;
    R.rec = true;
    R.startedAt = Date.now();
    Recorder.warmUp(); Api.warmup();
    this._startClipCapture();
    const btn = document.getElementById('wrep-btn');
    const hint = document.getElementById('wrep-hint');
    if (btn) btn.innerHTML = '🔴 录音中… 读完了点我';
    if (hint) hint.textContent = '';
    clearTimeout(R.capTimer);
    R.capTimer = setTimeout(() => this._wordRepairStop(), 6000);
  },

  _wordRepairStop() {
    const R = this._wordRepair;
    if (!R || !R.rec) return;
    R.rec = false;
    clearTimeout(R.capTimer);
    // 误触保护：250ms 内的两下不算一次朗读。
    if (Date.now() - R.startedAt < 250) {
      this._finishClipCapture();
      const btn = document.getElementById('wrep-btn');
      if (btn) btn.innerHTML = '🎤 点我读这个单词';
      return;
    }
    const btn = document.getElementById('wrep-btn');
    const hint = document.getElementById('wrep-hint');
    if (btn) { btn.innerHTML = '⏳ 核对中…'; btn.disabled = true; }
    if (hint) hint.textContent = '正在听你读「' + (R.word || '') + '」';
    const self = this;
    this._finishClipCapture().then(async function(blob) {
      let text = null;
      if (blob) {
        const forAsr = (self._spClipSamples && Recorder.padForAsr(self._spClipSamples)) || blob;
        try {
          // v131：清预算 + 性能样本（错词修复）。带 hint 走偏置，识别更准。
          Api.asrResetBudget();
          Api.perfBegin('word-repair');
          const out = await Api.transcribe(forAsr, null, {
            fast: true, hint: (R.word || ''), budgeted: true,
          });
          if (out && out.text && !Api.isFillerTranscript(out.text)) text = out.text.toLowerCase();
        } catch (e) { console.warn('word repair transcribe failed', e); }
        Api.perfEnd({ kind: text ? 'pass' : 'fail' });
      }
      // v139：把"本地有没有出声"一起交给判定 —— 识别端没回话时靠它放行。
      self._wordRepairJudge(text, !text && self._lastClipVoiceOk());
    });
  },

  _wordRepairJudge(text, voiceOk) {
    const R = this._wordRepair;
    if (!R) return;
    const btn = document.getElementById('wrep-btn');
    const hint = document.getElementById('wrep-hint');
    if (btn) { btn.disabled = false; btn.innerHTML = '🎤 点我读这个单词'; }
    // v96：单词语音本来就是识别最不稳的场景（一个孤立的词没有任何上下文），
    // 原来这里用逐字比对，识别把 subject 写成 subjects、把 library 写成
    // libary 就判"读错"，孩子得一遍遍重读、每遍还要等一次识别 —— 家长反馈
    // 的"读得好好的却判错、还特别慢"有一大半是这一处。
    // 现在两把尺子任意一把过就算过：句子对齐里这个位置是 ok，或者这段识别
    // 结果里任何一处跟目标词同音形（_soundAlike，孤立词的宽口径）。
    const a = this.alignSpeech(R.word || '', text || '');
    const aligned = !!(a && a.items && a.items.some(function(x) { return x.target && x.status === 'ok'; }));
    const ok = !!voiceOk || aligned || this._heardAny(R.word, text) || this._soundAlike(R.word || '', text);
    if (ok) {
      // 在原单词的位置上：红波浪线当场变绿打勾。
      const panel = document.getElementById('rd-sent-' + R.mi + '-' + R.qi);
      if (panel) {
        const sp = panel.querySelector('.rd-bad.rd-cur');
        if (sp) { sp.classList.remove('rd-bad', 'rd-cur'); sp.classList.add('rd-ok'); }
      }
      this._playCorrectSound();
      if (hint) hint.innerHTML = '<span style="color:var(--success)">✅ 「' + R.word + '」读对了！</span>';
      const self = this;
      setTimeout(function() { self._wordRepairNext(); }, 900);
    } else {
      this._playWrongSound();
      if (hint) hint.innerHTML = '<span style="color:var(--danger)">'
        + (text ? '听到的是「' + text + '」，听一遍再读' : '这次没录到声音，点一下听读音再按住读')
        + '</span>';
    }
  },

  // 手机自带识别。iOS Safari 用 Apple 的服务，境内可用；安卓浏览器大多调
  // 不到 Google 的服务，一启动就报错，这时把整条路关掉（_srBroken），后面
  // 的题不再重复试 —— 否则每道题都要白等一次失败。
  _liveRec: null,
  _srBroken: false,

  _srCtor() {
    if (this._srBroken) return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  },

  _liveStart(mi, qi, sentence) {
    const Ctor = this._srCtor();
    if (!Ctor || this._liveRec) return;
    const self = this;
    let rec;
    try { rec = new Ctor(); } catch (e) { this._srBroken = true; return; }

    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const live = { rec: rec, final: '', interim: '', stopped: false, errored: false, _hintAt: 0 };
    this._liveRec = live;

    rec.onresult = function(ev) {
      let fin = '', inter = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) fin += r[0].transcript + ' ';
        else inter += r[0].transcript + ' ';
      }
      if (fin) live.final += fin;
      live.interim = inter;
      const spoken = (live.final + ' ' + live.interim).trim();
      if (!spoken) return;
      // 高亮先走 —— 这是孩子盯着看的东西，一帧都不能等。
      self._liveFlush(mi, qi, sentence, spoken);
      // "听到：…" 是旁白，节流到 200ms 一次。每个 interim 都写一遍
      // textContent 会白触发一次重排，把光标那点响应拖慢。
      const now = Date.now();
      if (!live._hintAt || now - live._hintAt > 200) {
        live._hintAt = now;
        const hint = document.getElementById('rd-live-' + mi + '-' + qi);
        if (hint) hint.textContent = '🔵 听到：' + spoken;
      }
    };

    rec.onerror = function(ev) {
      live.errored = true;
      self._srBroken = true;   // 这台设备走不通，整场不再试
      console.warn('live speech recognition unavailable:', ev && ev.error);
      const hint = document.getElementById('rd-live-' + mi + '-' + qi);
      if (hint) hint.textContent = '';
    };

    rec.onend = function() {
      // iOS 上 continuous 会被忽略，孩子一停顿它自己就结束了。
      // 只要还在读（作业跟读按住式 _holdReadActive、口语跟读点击式
      // _spReadActive 都算）、也没报错，就接着开一段继续听。
      if ((self._holdReadActive || self._spReadActive) && !live.stopped && !live.errored) {
        try { rec.start(); } catch (e) { /* 下一段开不起来就算了，B 路兜底 */ }
      }
    };

    try { rec.start(); }
    catch (e) { this._srBroken = true; this._liveRec = null; }
  },

  // 松手时收尾：等最后一段 final 结果吐出来（最迟 450ms），拿不到就返回 null。
  _liveStop() {
    const live = this._liveRec;
    this._liveRec = null;
    if (!live) return Promise.resolve(null);
    live.stopped = true;
    return new Promise(function(resolve) {
      let settled = false;
      const done = function() {
        if (settled) return;
        settled = true;
        const txt = (live.final + ' ' + live.interim).trim();
        resolve(txt || null);
      };
      try { live.rec.onend = done; live.rec.stop(); }
      catch (e) { done(); return; }
      setTimeout(done, 450);
    });
  },

  _holdReadStart(mi, qi, dayIdx, sentence) {
    if (this._holdReadActive) return;
    // 门禁双保险：这一句必须先听过示范
    const gid = this._gid('hrg', mi, qi);
    if (!this._gateOpen(gid)) { this._gateNudge(gid); return; }
    // 正在单独纠错某个词时不让整句录音插进来（两路录音会打架）。
    if (this._wordRepair && this._wordRepair.rec) return;
    // 主动放弃纠错模式，重新整句朗读。
    if (this._wordRepair) { clearTimeout(this._wordRepair.capTimer); this._wordRepair = null; }
    this._holdReadActive = { mi: mi, qi: qi, dayIdx: dayIdx, sentence: sentence, startedAt: Date.now() };
    Recorder.warmUp(); Api.warmup();
    this._startClipCapture();

    // 新一轮朗读：清掉上一轮的绿/红，把光标放回句首。
    this._clearReadMarks(mi, qi);
    const panel = document.getElementById('rd-sent-' + mi + '-' + qi);
    if (panel) { const first = panel.querySelector('.rd-w'); if (first) first.classList.add('rd-cur'); }
    const hint = document.getElementById('rd-live-' + mi + '-' + qi);
    if (hint) hint.textContent = '';

    this._liveStart(mi, qi, sentence);

    // Tap-to-stop 的兜底：最多录 15 秒自动收一次（问句 + 回答比单句长），
    // 防止孩子忘了点停止、麦克风一直开着。
    this._holdReadTimer = setTimeout(() => this._holdReadEnd(mi, qi, dayIdx), 15000);
    this._setHoldReadUI(mi, qi, 'recording', null, false);
  },

  _holdReadEnd(mi, qi, dayIdx) {
    const ctx = this._holdReadActive;
    clearTimeout(this._holdReadTimer);
    if (!ctx || ctx._ended) return;
    ctx._ended = true;
    // Mis-tap guard: two taps less than 250 ms apart is almost certainly an
    // accidental double-touch — reset the button rather than firing a
    // half-empty transcription through the ASR pipeline.
    if (Date.now() - ctx.startedAt < 250) {
      this._holdReadActive = null;
      this._liveStop();
      this._clearReadMarks(mi, qi);
      this._setHoldReadUI(mi, qi, 'mistap', null, false);
      return;
    }
    this._holdReadActive = null;
    this._setHoldReadUI(mi, qi, 'scoring', null, false);

    const self = this;
    // v131：同样清预算 + 开性能样本（这条是「按住读整句」那条路）
    Api.asrResetBudget();
    Api.perfBegin('hold-sentence');
    const liveP = this._liveStop();
    const clipP = this._finishClipCapture();

    Promise.all([liveP, clipP]).then(async function(res) {
      // 两路择优（v98）：A 路判过就立即出分，判不过才等 B 路复核。
      const best = await self._bestTranscript(ctx.sentence, res[0], res[1], self._spClipSamples);
      // v143：兜底放行按"这句有多少词"设时长门槛（见 _minVoiceSec）。
      const hMin = self._minVoiceSec(ctx.sentence);
      self._showHoldReadResult(mi, qi, dayIdx, ctx.sentence,
        best ? best.spoken : null,
        best ? best.source : null,
        best ? best.verdict : null,
        !best && self._lastClipVoiceOk(hMin));
      Api.perfEnd({ kind: (!best && !self._lastClipVoiceOk(hMin)) ? 'fail'
        : (!best ? 'voice' : (best.verdict && best.verdict.passed ? 'pass' : 'low')) });
    }).catch(function(e) {
      console.warn('Hold-read capture failed:', e);
      self._showHoldReadResult(mi, qi, dayIdx, ctx.sentence, null, null, null,
        self._lastClipVoiceOk(self._minVoiceSec(ctx.sentence)));
      Api.perfEnd({ kind: 'fail' });
    });
  },

  // status is one of: 'recording' | 'scoring' | 'mistap' | 'passed' | 'failed' | 'noaudio'
  _setHoldReadUI(mi, qi, status, score, passed, extra) {
    const btn = document.getElementById('hr-' + mi + '-' + qi);
    const statusEl = document.getElementById('qr-status-' + mi + '-' + qi);
    if (!btn) return;
    if (status === 'recording') {
      btn.style.background = 'var(--danger)';
      btn.innerHTML = '🔴 录音中… 读完了点我';
      btn.disabled = false;
      if (statusEl) statusEl.innerHTML = '';
      return;
    }
    if (status === 'scoring') {
      // 松手就把结果卡片的架子摆出来，分数一到直接填进这个位置。
      // 孩子看到的是"分已经在算"，不是整屏灰着等。
      btn.style.background = 'var(--text-sub)';
      btn.innerHTML = '⏳ 正在出分…';
      btn.disabled = true;
      if (statusEl) statusEl.innerHTML =
        '<div style="font-size:34px;font-weight:700;color:var(--primary);line-height:1.15">…</div>'
        + '<span style="color:var(--text-sub);font-size:13px">核对中，分数马上到</span>';
      return;
    }
    if (status === 'mistap') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 点我读';
      btn.disabled = false;
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--danger)">⚠️ 时间太短了，点一下开始，读完再点一下</span>';
      return;
    }
    if (status === 'passed') {
      btn.style.background = 'var(--success)';
      // score 为空 = 本地判定"确实读了，但识别端没给分数"，只报通过不报分。
      const hasScore = (typeof score === 'number');
      btn.innerHTML = '✅ 已通过' + (hasScore ? ' ' + score + ' 分' : '');
      btn.disabled = true;
      if (statusEl) statusEl.innerHTML = hasScore
        ? ('<div style="font-size:34px;font-weight:700;color:var(--success);line-height:1.15">' + score + ' 分</div>'
          + '<span style="color:var(--success);font-weight:600">✅ 每个词都读到了，通过！</span>')
        : ('<div style="font-size:34px;font-weight:700;color:var(--success);line-height:1.15">✓</div>'
          + '<span style="color:var(--success);font-weight:600">✅ 读到了，通过！录音已经存下来</span>');
      return;
    }
    if (status === 'failed') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 再点一次重读';
      btn.disabled = false;
      if (statusEl) {
        const bad = (extra && extra.badWords) || [];
        let html = '<div style="font-size:34px;font-weight:700;color:var(--danger);line-height:1.15">'
                 + score + ' 分</div>'
                 + '<span style="color:var(--danger);font-weight:600">⚠️ 未达 60 分，需要重读</span>';
        if (bad.length) {
          const list = bad.slice(0, 6).map(function(x) {
            return x.heard ? '<b>' + x.expected + '</b>（听成了 ' + x.heard + '）' : '<b>' + x.expected + '</b>（没读到）';
          }).join('、');
          html += '<div class="rd-retry">带 ✗ 的红词就是没读对的：' + list
                + '<br>先听一遍示范，再把<b>整句</b>重读一次。'
                + '<div><button class="speak-btn rd-again-btn" style="font-size:13px;padding:6px 14px" '
                + 'onclick="App._replayReadSentence(' + mi + ',' + qi + ')">🔊 听一遍示范</button></div></div>';
        } else {
          html += '<div class="rd-retry">把整句再读一次，注意读清楚每个词。</div>';
        }
        statusEl.innerHTML = html;
      }
      return;
    }
    if (status === 'repair') {
      // 有读错的词待纠正：主按钮让位给纠错卡片，这里只提供"整句重读"
      // 的入口（不想逐词纠错的孩子可以整句再来一遍）。
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 重读整句';
      btn.disabled = false;
      return;
    }
    if (status === 'noaudio') {
      btn.style.background = 'var(--primary)';
      btn.innerHTML = '🎤 点我读';
      btn.disabled = false;
      // v139：只有"真的没录到声音"才走到这里，措辞也只说这一件事。
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--danger)">🎤 这次没录到声音，再点一下读</span>';
      return;
    }
  },

  // 重读前先听一遍标准示范。句子从当前题目现算，不依赖面板里存了什么。
  _replayReadSentence(mi, qi) {
    const m = HOMEWORK_DATA && HOMEWORK_DATA[this.state.currentDay]
           && HOMEWORK_DATA[this.state.currentDay].modules[mi];
    const q = m && m.questions && m.questions[qi];
    if (!q) return;
    const s = this._buildReadSentence(m, q);
    if (s) this.speak(s);
  },

  _showHoldReadResult(mi, qi, dayIdx, sentence, spoken, source, verdict, voiceOk) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    // v140：阅读理解答错后的「引导跟读」面板 —— 结算不走正选题的那套
    // （不记答案、不进下一题）。只要这一遍有内容（识别出字，或确实出了
    // 声），就解锁没划掉的选项让孩子自己再选一次；引导不是考试，没录到
    // 声音也照样解锁，只不给音效。
    if (this._guidedPick === (mi + '-' + qi)) {
      this._guidedPick = null;
      this._clearReadMarks(mi, qi);
      const gOpts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
      gOpts.forEach(function(el) {
        if (!el.classList.contains('wrong')) el.style.pointerEvents = 'auto';
      });
      const gAns = document.getElementById('ans-' + mi + '-' + qi);
      if (gAns) gAns.innerHTML = '👍 读完了。想一想刚才读的那句，再选一次。';
      const gFollow = document.getElementById('qr-follow-' + mi + '-' + qi);
      if (gFollow) gFollow.innerHTML = '';
      if (spoken || voiceOk) this._playCorrectSound();
      return;
    }
    const lastPick = this._lastPick && this._lastPick[mi + '-' + qi];
    if (!lastPick) return;
    const { oi, isCorrect } = lastPick;
    const hint = document.getElementById('rd-live-' + mi + '-' + qi);
    if (hint) hint.textContent = '';

    if (!spoken) {
      // v139：识别端一个字都没回来，但录音里确实有人声 —— 这一遍算读过了。
      // 以前这里让孩子"再读一次"，他读得再清楚也一样卡住，是家长报的
      // 「重复四五遍」最直接的来源。现在按通过走，录音留着给老师听。
      if (voiceOk) {
        this._clearReadMarks(mi, qi);
        this._recordAnswer(dayIdx, mi, qi, oi, isCorrect);
        const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
        opts.forEach((el, i) => {
          el.classList.remove('wrong', 'selected');
          if (i === q.answer) el.classList.add('correct');
          el.style.pointerEvents = 'none';
        });
        const ansEl = document.getElementById('ans-' + mi + '-' + qi);
        if (ansEl) { ansEl.style.display = 'block'; ansEl.innerHTML = '✅ 读到了，通过'; }
        this._playCorrectSound();
        this._setHoldReadUI(mi, qi, 'passed', null, true);
        if (this._stepBelongsTo(mi, qi)) {
          const next = document.getElementById('stage-next-btn');
          if (next) { next.disabled = false; next.classList.add('nudge'); }
        }
        return;
      }
      // 真的没录到声音 —— 只提示这一件事，不说"没听清"。
      this._clearReadMarks(mi, qi);
      this._setHoldReadUI(mi, qi, 'noaudio', null, false);
      return;
    }

    // 逐词上色：读对的绿勾、读错/漏读的红色波浪线，光标全部撤掉。
    // 判定和上色同源（v98）：红词直接取对齐结果，不再依赖显示格子的个数。
    const v = verdict || this._readVerdict(sentence, spoken);
    this._markReadProgress(mi, qi, sentence, spoken, false, v.align);
    const score = v.score;
    const badWords = v.badWords;
    // 通过 = 分数够 60 且没有读错的词。红色波浪线的词要原处重读对了
    // 才能进下一题（见 _startWordRepair）。
    const passed = v.passed;

    // v143：落台账 —— 错词只增不减，刷新冲不掉；只有真读对才清零。
    this.readLedgerSave(mi, qi, dayIdx, {
      pass: passed, score: score,
      bad: badWords.map(function (x) { return x.expected; }),
    });

    if (this._debugRead) console.log('[read] source=' + source + ' score=' + score + ' spoken=' + spoken);

    if (passed) {
      this._recordAnswer(dayIdx, mi, qi, oi, isCorrect);
      const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
      opts.forEach((el, i) => {
        el.classList.remove('wrong', 'selected');
        if (i === q.answer) el.classList.add('correct');
        el.style.pointerEvents = 'none';
      });
      const ansEl = document.getElementById('ans-' + mi + '-' + qi);
      if (ansEl) {
        ansEl.style.display = 'block';
        ansEl.innerHTML = '✅ 跟读通过！ ' + score + ' 分';
      }
      this._playCorrectSound();
      this._setHoldReadUI(mi, qi, 'passed', score, true);
      if (this._stepBelongsTo(mi, qi)) {
        // 把 stage-next-btn 解锁，让孩子/家长自己点下一题。
        // 不再 setTimeout 自动朗读——上一题读音还停在孩子耳边，会盖住
        // 朗读下一题的提示，反而容易让节奏乱掉。
        // v138：预览里的老师走同一条路（只认这一屏是不是这道题）。
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = false; next.classList.add('nudge'); }
      } else if (qi < m.questions.length - 1) {
        const self = this;
        setTimeout(function() {
          self._autoSpeakQuestion(m, mi, qi + 1, dayIdx);
        }, 1500);
      }
      return;
    }

    // 没通过：有读错的词 → 逐个原处重读纠正；一个词都没有读错的低分
    // （比如多读了一堆别的词）→ 按原来的流程整句重读。
    if (badWords.length) {
      this._setHoldReadUI(mi, qi, 'repair', score, false, { badCount: badWords.length });
      if (this._stepBelongsTo(mi, qi)) {
        const next = document.getElementById('stage-next-btn');
        if (next) { next.disabled = true; next.classList.remove('nudge'); }
      }
      this._playWrongSound();
      const self = this;
      this._startWordRepair(mi, qi, sentence, 'qr-status-' + mi + '-' + qi, function() {
        self._holdRepairDone(mi, qi, dayIdx, score);
      }, function() {
        self._replayReadSentence(mi, qi);
      });
      return;
    }

    this._setHoldReadUI(mi, qi, 'failed', score, false, { badWords: badWords });
    if (this._stepBelongsTo(mi, qi)) {
      const next = document.getElementById('stage-next-btn');
      if (next) { next.disabled = true; next.classList.remove('nudge'); }
    }
    this._playWrongSound();
  },

  // 错词全部纠正完 → 走和整句通过一样的收尾：记答案、亮选项、解锁下一题。
  _holdRepairDone(mi, qi, dayIdx, score) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    // v143：这一句真的读对了 —— 台账清零（这是唯一的清零路径）。
    this.readLedgerSave(mi, qi, dayIdx, { pass: true, score: score, bad: [] });
    const lastPick = this._lastPick && this._lastPick[mi + '-' + qi];
    if (lastPick) this._recordAnswer(dayIdx, mi, qi, lastPick.oi, lastPick.isCorrect);
    const opts = document.querySelectorAll('#q-' + mi + '-' + qi + ' .q-option');
    opts.forEach((el, i) => {
      el.classList.remove('wrong', 'selected');
      if (i === q.answer) el.classList.add('correct');
      el.style.pointerEvents = 'none';
    });
    const ansEl = document.getElementById('ans-' + mi + '-' + qi);
    if (ansEl) {
      ansEl.style.display = 'block';
      ansEl.innerHTML = '✅ 每个词都读对了，通过！';
    }
    this._playCorrectSound();
    this._setHoldReadUI(mi, qi, 'passed', score, true);
    if (this._stepBelongsTo(mi, qi)) {
      const next = document.getElementById('stage-next-btn');
      if (next) { next.disabled = false; next.classList.add('nudge'); }
    } else if (qi < m.questions.length - 1) {
      const self = this;
      setTimeout(function() {
        self._autoSpeakQuestion(m, mi, qi + 1, dayIdx);
      }, 1500);
    }
  },

  submitFill(mi, qi, dayIdx) {
    const m = HOMEWORK_DATA[dayIdx].modules[mi];
    const q = m.questions[qi];
    const input = document.getElementById('fill-' + mi + '-' + qi);
    // 大小写敏感：答案是 "big enough"，孩子写 "Big enough" 不算对，
    // 不再 toLowerCase。答案本身是规范化小写，孩子照着写就行。
    const val = input.value.trim();
    const ans = String(q.answer).trim();
    const isCorrect = val === ans;
    this._recordAnswer(dayIdx, mi, qi, val, isCorrect);
    const ansEl = document.getElementById('ans-' + mi + '-' + qi);
    ansEl.style.display = 'block';
    if (isCorrect) {
      this._wrongTryClear('f-' + mi + '-' + qi);
      this._clearWrongHint(ansEl);
      input.style.borderColor = 'var(--success)';
      input.style.color = 'var(--success)';
      this._playCorrectSound();
      // 填空题的门槛到此为止：写对了就把底部「下一题」点亮（橙色轻推）。
      // 以前只显示"✅ 正确！"、按钮还是灰的，孩子以为卡住了，只能把同一句
      // 答案再写一遍 —— 家长 2026-10-14：「写对了没有任何错误，就弹出来
      // 下一题这个可选的项，而不是虚的显示，让学生点不了」。
      if (this.isTeacher()) {
        ansEl.innerHTML = '✅ 正确！';
      } else {
        this._unlockStep();
        const nb = document.getElementById('stage-next-btn');
        const nbName = (nb && nb.textContent) ? nb.textContent.trim() : '下一题';
        ansEl.innerHTML = '✅ 正确！点下面的「' + nbName + '」继续';
      }
    } else {
      // 答错不报答案（v104）：先用中文提示一步步收窄（词性/时态 → 首字母
      // 和字数 → 整词），最后一次才把答案给全 —— 但永远是他自己打进去。
      const attempt = this._wrongTryBump('f-' + mi + '-' + qi);
      this._showWrongHint(ansEl, this._wrongHintHtml({
        attempt: attempt,
        correctText: ans,
        clue3: q.explanation_cn,
        retryTip: '先想这句话缺的是什么词、什么时态，再想拼写。',
        finalTail: '照着打进上面的框里就对了。',
      }));
      input.style.borderColor = 'var(--danger)';
      // 解析面板不再一上来就摊开——它常常等于答案，改由提示词按层级带出来
      // （见 _wrongHintHtml 的第 2/3 级）。
      // 改在原框里：清掉错的、光标放进去，直接重打。以前会再弹一个"请手写
      // 改正"的框，等于让孩子把同一个答案写两遍。
      input.value = '';
      input.style.color = 'var(--text)';
      try { input.focus(); } catch (e) {}
      this._playWrongSound();
    }
    // Auto-speak the next question after a short delay.
    // Only in the teacher's scrolling list, where the next question is already
    // on screen. In the student's one-question stage the next question is not
    // shown yet, so reading it here would speak ahead of the transition —
    // the stage speaks the question itself when it mounts.
    if (this.isTeacher() && qi < m.questions.length - 1) {
      var self = this;
      setTimeout(function() {
        self._autoSpeakQuestion(m, mi, qi + 1, dayIdx);
      }, isCorrect ? 1500 : 2500);
    }
  },

  // ===== Student/Parent: My Errors =====
  renderMyErrors() {
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">❌ 我的错题本</h2>';
    // The questions this child actually got wrong. Was a random 40% of every
    // question in the week, reshuffled on each render.
    const sid = this._myStudentId();
    const errors = [];
    HOMEWORK_DATA.forEach((day, di) => {
      day.modules.forEach((m, mi) => {
        if (m.questions) {
          m.questions.forEach((q, qi) => {
            const a = this.state.answers[Api.answerKey(sid, di, mi, qi)];
            if (a && !a.correct) {
              errors.push({ day: day.day_cn, module: m.name_cn, q: q, dayIdx: di });
            }
          });
        }
      });
    });
    if (errors.length === 0) {
      html += '<div class="card text-center text-sub">暂无错题，继续加油！</div>';
    } else {
      errors.forEach((e, i) => {
        html += '<div class="error-item">';
        html += '<div class="e-q"><strong>' + this._dayTag(e.day, e.module, e.dayIdx) + '</strong> ' + (e.q.question || e.q.sentence) + '</div>';
        html += '<div class="q-answer">正确答案：' + (e.q.options ? String.fromCharCode(65+e.q.answer) : e.q.answer) + '</div>';
        html += '<div class="q-explanation show"><div class="cn">📖 ' + (e.q.explanation_cn||'') + '</div></div>';
        html += '<button class="btn btn-outline btn-sm mt-8" onclick="App.practiceSimilar(' + i + ')">🔄 做相似题</button>';
        html += '<div id="similar-' + i + '"></div>';
        html += '</div>';
      });
    }
    return html;
  },

  practiceSimilar(idx) {
    const similar = {
      question: 'Choose the correct answer: She ___ to school every day.',
      options: ['go', 'goes', 'going', 'went'],
      answer: 1,
      explanation_cn: '第三人称单数 She + 一般现在时 → goes。注意 every day 是一般现在时标志词。',
      explanation_en: 'Third person singular She + simple present tense → goes. Every day is a present tense marker.'
    };
    let html = '<div class="card mt-8" style="background:var(--warning-light)"><div class="card-title fs-12">🔄 相似练习题</div>';
    html += '<div class="q-text">' + this._stemHtml(similar.question) + '</div>';
    html += '<div class="q-options">';
    similar.options.forEach((o, oi) => {
      html += '<div class="q-option" onclick="this.parentElement.querySelectorAll(\'.q-option\').forEach((el,i)=>{if(i===' + similar.answer + ')el.classList.add(\'correct\');if(i===' + oi + '&&i!==' + similar.answer + ')el.classList.add(\'wrong\')})">' + String.fromCharCode(65+oi) + '. ' + o + '</div>';
    });
    html += '</div>';
    html += '<div class="q-explanation show"><div class="cn">📖 ' + similar.explanation_cn + '</div></div>';
    html += '</div>';
    document.getElementById('similar-' + idx).innerHTML = html;
  },

  // ===== Non-teacher: My Child Progress =====
  renderMyProgress() {
    const myName = this.state.userName;
    const myClass = this.state.className;
    // Identify by phone, not by name+class. The teacher can rename a student
    // and the cloud merge overwrites the local name, both of which broke the
    // old name match — and the fallback minted a fresh 's'+Date.now() id on
    // every render, so this student's check-ins could never be found.
    let myStudent = this.state.students.find(s => s.phone === this.state.phone);
    if (!myStudent) {
      myStudent = { id: this._myStudentId(), name: myName, phone: this.state.phone, parentPhone: this.state.phone, class: myClass };
    }
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">📊 ' + myName + ' 的打卡情况</h2>';
    html += '<div class="card mb-16" style="background:var(--primary-light);border:none">';
    html += '<div class="flex-between"><span>👤 ' + myName + '</span><span class="badge badge-primary">' + myClass + '</span></div>';
    html += '</div>';

    // Summary stats
    let doneCount = 0, totalCorrect = 0, correctCount = 0;
    HOMEWORK_DATA.forEach((d, di) => {
      const k = myStudent.id + this._weekTag() + '_d' + di;
      const ck = this.state.checkins[k];
      if (ck && ck.done) {
        doneCount++;
        if (ck.correctRate) { totalCorrect += ck.correctRate; correctCount++; }
      }
    });
    html += '<div class="stat-row mb-16">';
    html += '<div class="stat-box"><div class="num" style="color:var(--success)">' + doneCount + '</div><div class="label">已完成天数</div></div>';
    html += '<div class="stat-box"><div class="num" style="color:var(--danger)">' + (HOMEWORK_DATA.length - doneCount) + '</div><div class="label">未完成天数</div></div>';
    html += '<div class="stat-box"><div class="num">' + (correctCount > 0 ? Math.round(totalCorrect/correctCount) : 0) + '%</div><div class="label">平均正确率</div></div>';
    html += '</div>';

    // Daily detail table
    html += '<div class="card"><table class="data-table"><thead><tr><th>日期</th><th>类型</th><th>打卡状态</th><th>完成时间</th><th>正确率</th><th>错题数</th></tr></thead><tbody>';
    HOMEWORK_DATA.forEach((d, di) => {
      const k = myStudent.id + this._weekTag() + '_d' + di;
      const ck = this.state.checkins[k];
      html += '<tr><td>' + d.day_cn + '（' + this.getDayDateLabel(di, 0) + '）' + (this.isDayToday(di, 0) ? ' 📍今天' : '') + '</td>';
      html += '<td>' + (d.is_speaking_day ? 'AI口语日' : '练习日') + '</td>';
      if (ck) {
        html += '<td><span class="badge ' + (ck.done ? 'badge-success">已打卡' : 'badge-warning">进行中') + '</span></td>';
        html += '<td>' + (ck.time||'-') + '</td>';
        html += '<td><span class="badge ' + (ck.correctRate>=85?'badge-success':ck.correctRate>=60?'badge-warning':'badge-danger') + '">' + (ck.correctRate||0) + '%</span></td>';
        html += '<td>' + (ck.wrongCount||0) + '</td>';
      } else {
        html += '<td><span class="badge badge-danger">未打卡</span></td>';
        html += '<td>-</td><td>-</td><td>-</td>';
      }
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  },

  // ===== Non-teacher: Class Comparison =====
  renderCompare() {
    const myClass = this.state.className;
    let html = '<h2 style="color:var(--primary-dark);margin-bottom:12px">🏆 全班完成率对比</h2>';
    html += '<div class="card mb-16" style="background:var(--primary-light);border:none">';
    html += '<div class="flex-between"><span>🏫 ' + myClass + '</span><span class="badge badge-primary">' + this.state.students.filter(s => s.class === myClass).length + '人</span></div>';
    html += '</div>';

    // Build rankings
    const classStudents = this.state.students.filter(s => s.class === myClass);
    const rankings = classStudents.map(s => {
      let doneCount = 0, totalCorrect = 0, correctCount = 0, firstTime = '';
      HOMEWORK_DATA.forEach((d, di) => {
        const k = s.id + this._weekTag() + '_d' + di;
        const ck = this.state.checkins[k];
        if (ck && ck.done) {
          doneCount++;
          if (ck.correctRate) { totalCorrect += ck.correctRate; correctCount++; }
          if (di === 0 && ck.time) firstTime = ck.time;
        }
      });
      return { name: s.name, doneCount, avgCorrect: correctCount > 0 ? Math.round(totalCorrect/correctCount) : 0, firstTime, isMe: s.name === this.state.userName };
    });
    rankings.sort((a, b) => b.doneCount - a.doneCount || b.avgCorrect - a.avgCorrect);

    // Ranking table
    html += '<div class="card">';
    html += '<table class="data-table"><thead><tr><th>排名</th><th>姓名</th><th>完成天数</th><th>平均正确率</th></tr></thead><tbody>';
    rankings.forEach((r, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1);
      const highlight = r.isMe ? ' style="background:var(--primary-light)"' : '';
      html += '<tr' + highlight + '><td>' + medal + '</td><td>' + r.name + (r.isMe ? ' <span class="badge badge-primary">我</span>' : '') + '</td>';
      html += '<td>' + r.doneCount + '/' + HOMEWORK_DATA.length + '</td>';
      html += '<td><span class="badge ' + (r.avgCorrect>=85?'badge-success':r.avgCorrect>=70?'badge-primary':'badge-warning') + '">' + r.avgCorrect + '%</span></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    // Daily check-in status for all
    html += '<h3 class="mt-16" style="color:var(--primary-dark)">📅 每日打卡状态</h3>';
    html += '<div class="card"><div class="checkin-table"><table class="data-table"><thead><tr><th>姓名</th>';
    HOMEWORK_DATA.forEach((d, di) => html += '<th>' + d.day_cn + '<br><span style="font-weight:400;font-size:10px;color:var(--text-sub,#888)">' + this.getDayDateLabel(di, 0) + '</span></th>');
    html += '<th>完成率</th></tr></thead><tbody>';
    rankings.forEach(r => {
      const student = classStudents.find(s => s.name === r.name);
      const highlight = r.isMe ? ' style="background:var(--primary-light)"' : '';
      html += '<tr' + highlight + '><td>' + r.name + (r.isMe ? ' ⭐' : '') + '</td>';
      let doneCount = 0;
      HOMEWORK_DATA.forEach((d, di) => {
        const k = student.id + this._weekTag() + '_d' + di;
        const ck = this.state.checkins[k];
        if (ck) {
          if (ck.done) doneCount++;
          html += '<td><span class="checkin-dot ' + (ck.completed==='partial'?'partial':'done') + '" title="' + ck.time + '">✓</span></td>';
        } else {
          html += '<td><span class="checkin-dot undone">✗</span></td>';
        }
      });
      html += '<td>' + Math.round(doneCount/HOMEWORK_DATA.length*100) + '%</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
  },

  // ===== Invite =====
  showInvite() {
    const link = window.location.href + '?invite=1';
    this.showModal(`
      <div class="modal-header"><div class="modal-title">🔗 邀请加入班级</div><button class="modal-close" onclick="App.closeModal()">&times;</button></div>
      <div class="modal-body invite-content">
        <div class="qr-placeholder"><img src="photo.jpeg?v=52" alt="Amy老师英语打卡" style="width:100%;height:100%;object-fit:cover;border-radius:8px"></div>
        <p class="text-sub fs-12">扫码或分享链接加入</p>
        <div class="invite-link">${link}</div>
        <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${link}');alert('链接已复制')">📋 复制链接</button>
        <ul class="invite-rules">
          <li>1. 点击链接进入平台</li>
          <li>2. 输入手机号注册登录</li>
          <li>3. 按格式填写备注名：中文名-英文名（如：马慧-Amy）</li>
          <li>4. 等待老师审核并分配班级</li>
        </ul>
      </div>
    `);
  },

  // ===== Modal =====
  showModal(html) {
    document.getElementById('modal-box').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('show');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
  },

  // 把一句英文的每个单词包成 <span class="lk-word">，标点留在外面。
  //
  // 家长的原话：「只要是有单词句子的地方，点单词就能够出现单词的意思」。
  // 全局的 caretRangeFromPoint 取词（见下面 _wordAtPoint）本身是能用的，
  // 但在句子这种**又长又会换行**的排版里，手指落点常常落进行间空隙，取不到
  // 文本节点，孩子点了没反应。包一层之后点击目标是一个实实在在的盒子，
  // 命中稳定、可以给视觉反馈（下划虚线 + 按下变橘），也不会误伤整句那个
  // 「听示范」的动作 —— 两者现在各自是独立的元素了。
  //
  // 标点必须留在 span 外面：句末的 "park." 如果连着包进去，查词会拿
  // "park." 去查，查不到。
  _wordSpans(text) {
    const self = this;
    const raw = String(text == null ? '' : text);
    const toks = raw.split(/(\s+)/);
    // 先看有没有固定搭配：把词单独抽出来判一次，命中的那两个（三个）词在
    // 排版上合成一个盒子 —— 家长要的「giving up 连起来」就是这一步。
    const info = [];        // 每个 tok 是词的话给出词本身，否则 null
    const words = [];
    toks.forEach(function (tok) {
      const mm = /^([^A-Za-z]*)([A-Za-z][A-Za-z'\-]*)([^A-Za-z]*)$/.exec(tok || '');
      info.push(mm ? mm[2] : null);
      if (mm) words.push(mm[2]);
    });
    const mask = this._phraseMask(words);
    let out = '', wi = 0;
    for (let i = 0; i < toks.length; i++) {
      const tok = toks[i];
      if (!tok) continue;
      if (!info[i]) { out += /^\s+$/.test(tok) ? ' ' : self._escHtml(tok); continue; }
      const p = mask[wi];
      if (p) {
        let phrase = info[i], got = 1, j = i + 1, last = i;
        while (got < p.len && j < toks.length) {
          if (!info[j]) {
            if (!/^\s+$/.test(toks[j] || '')) break;   // 中间夹了标点 → 不算一个短语
            j++;
            continue;
          }
          phrase += ' ' + info[j];
          got++;
          last = j;
          j++;
        }
        if (got >= p.len) {
          out += '<span class="lk-word lk-phrase" data-phrase="' + self._escHtml(p.en) + '">'
               + self._escHtml(phrase) + '</span>';
          wi += p.len;
          i = last;
          continue;
        }
      }
      const mm = /^([^A-Za-z]*)([A-Za-z][A-Za-z'\-]*)([^A-Za-z]*)$/.exec(tok);
      out += self._escHtml(mm[1])
           + '<span class="lk-word">' + self._escHtml(mm[2]) + '</span>'
           + self._escHtml(mm[3]);
      wi++;
    }
    return out;
  },

  // ===== Tap-a-word lookup =====
  //
  // 孩子读到不认识的词（cinema 这种），点一下就要有音标、中文意思和读音。
  //
  // 两条路一起用（v109）：
  //   ① 明确的词盒 .lk-word（_wordSpans 包出来的句子 / 范文 / 逐词判分结果）
  //      —— 直接命中，稳，还带视觉反馈；
  //   ② 其余任何位置：全局代理，用 caretRangeFromPoint 拿到手指下面那个文字
  //      的字符偏移，再往两边扩到词边界。新加的界面不用做任何事就自动可点。
  //
  // 三道闸门，防止误触：
  //   1. 点到的元素在 button/input/label/a 里 → 不查词（那是功能操作）；
  //   2. 取出来的词必须至少 2 个字母，且全是 a-z/'/-；
  //   3. 弹层开着的时候再点别处 → 只关弹层。
  _lookupEl: null,
  _lookupWord: '',

  _initWordLookup() {
    if (this._lookupBound) return;
    this._lookupBound = true;
    const self = this;
    const handler = function(ev) {
      // 长按选择文字时不打扰
      try {
        const sel = window.getSelection && window.getSelection();
        if (sel && sel.toString && sel.toString().trim()) return;
      } catch (e) {}

      // ① 明确标好的词盒（.lk-word）—— 句子、范文、逐词判分结果里的词都走这条。
      //    不依赖 caretRangeFromPoint：那个 API 在 iOS / 微信里取不到落点时
      //    会静默失败，孩子点了没反应；词盒是实实在在的点击目标，稳定得多。
      const t = ev.target;
      const span = (t && t.closest) ? t.closest('.lk-word') : null;
      if (span) {
        // v143：短语盒子（giving up）里带空格，也要能点 —— 以前这里只认
        // 单个单词，整块短语反而点不开。
        const ph = span.getAttribute && span.getAttribute('data-phrase');
        const w = ph || String(span.textContent || '').trim();
        if (ph || /^[A-Za-z][A-Za-z'\-]*$/.test(w)) {
          ev.preventDefault();
          ev.stopPropagation();
          self._openWordSheet(w);
          // 这是逐词判分里"读错/漏读"的那个词 → 顺手点亮下面修复框里的芯片
          if (span.getAttribute && span.getAttribute('data-repair-word')) self._focusRepairChip(w);
          return;
        }
      }

      // ② 其余位置的英文单词：按落点取词（tab、表格、卡片里到处都能点）
      const pt = self._eventPoint(ev);
      if (!pt) return;
      const word = self._wordAtPoint(pt.x, pt.y);
      if (!word) { self._closeWordSheet(); return; }
      ev.preventDefault();
      ev.stopPropagation();
      self._openWordSheet(word);
    };
    document.addEventListener('click', handler, true);
  },

  _eventPoint(ev) {
    let x = null, y = null;
    if (ev.changedTouches && ev.changedTouches.length) {
      x = ev.changedTouches[0].clientX; y = ev.changedTouches[0].clientY;
    } else if (typeof ev.clientX === 'number' && ev.clientX) {
      x = ev.clientX; y = ev.clientY;
    }
    if (x === null || y === null) return null;
    return { x: x, y: y };
  },

  // 手指落点下面的那个英文单词，取不到就返回 null。
  _wordAtPoint(x, y) {
    let node = null, offset = 0;
    try {
      if (document.caretRangeFromPoint) {
        const r = document.caretRangeFromPoint(x, y);
        if (r) { node = r.startContainer; offset = r.startOffset; }
      } else if (document.caretPositionFromPoint) {
        const p = document.caretPositionFromPoint(x, y);
        if (p) { node = p.offsetNode; offset = p.offset; }
      }
    } catch (e) { return null; }
    if (!node || node.nodeType !== 3) return null;

    // 只认纯文本节点。按钮、输入框、链接、以及**自带点击行为**的元素里的
    // 字不查 —— 否则孩子点选项想选答案，却被弹层抢走了这次点击，
    // 答题流程直接断掉。选项、按钮一律让它们自己的 onclick 生效。
    const el = node.parentElement;
    if (!el) return null;
    if (el.closest && el.closest(
      'button,input,textarea,select,a,option,[onclick],[data-nolookup],'
      + '.q-option,.btn,.tab,.tab-item,.modal-close,.speak-btn,.qr-hold-btn'
    )) return null;

    const text = node.nodeValue || '';
    if (!text) return null;

    // 从 caret 往两边扩。caret 可能落在词尾（offset == 词末），所以先看
    // offset 处是不是字母，不是就往左挪一格再判。
    const isWordChar = c => /[A-Za-z'\-]/.test(c);
    let i = Math.min(offset, text.length - 1);
    if (!isWordChar(text[i] || '')) {
      if (i === 0 || !isWordChar(text[i - 1] || '')) return null;
      i = i - 1;
    }
    let a = i, b = i;
    while (a > 0 && isWordChar(text[a - 1])) a--;
    while (b < text.length - 1 && isWordChar(text[b + 1])) b++;
    let word = text.slice(a, b + 1).replace(/^['\-]+|['\-]+$/g, '');

    if (word.length < 2 || !/^[A-Za-z][A-Za-z'\-]*$/.test(word)) return null;
    // v143：这个位置落在固定搭配里吗？（giving up / look after…）
    // 落在里面就把整串短语交给弹层，别只给一个 giving 或一个 give。
    const ph = this._phraseAround(text, a, b);
    if (ph) return ph;
    // 全大写的缩写（OK、USA）查出来没意义，但保留，孩子可能真想查。
    return word;
  },

  // 同一个文本节点里，[a,b] 这段落在哪个固定搭配上 → 返回整串短语（含中间空格）
  _phraseAround(text, a, b) {
    if (typeof WordHelp === 'undefined') return null;
    // 把这个文本节点切成词，同时记住每个词的位置
    const toks = [];
    const re = /[A-Za-z][A-Za-z'\-]*/g;
    let m;
    while ((m = re.exec(text))) toks.push({ w: m[0], a: m.index, b: m.index + m[0].length - 1 });
    if (!toks.length) return null;
    let idx = -1;
    for (let k = 0; k < toks.length; k++) {
      if (a >= toks[k].a && b <= toks[k].b) { idx = k; break; }
    }
    if (idx < 0) return null;
    // 短语可能从当前词往前一两个词开始
    for (let back = 2; back >= 0; back--) {
      const start = idx - back;
      if (start < 0) continue;
      const p = WordHelp.phraseAt(toks.map(t => t.w), start);
      if (!p) continue;
      if (idx >= start && idx < start + p.len) {
        const from = toks[start].a, to = toks[start + p.len - 1].b;
        return text.slice(from, to + 1).replace(/\s+/g, ' ');
      }
    }
    return null;
  },

  _wordSheetEl() {
    if (this._lookupEl && document.body.contains(this._lookupEl)) return this._lookupEl;
    const wrap = document.createElement('div');
    wrap.id = 'word-sheet';
    wrap.setAttribute('data-nolookup', '1');
    wrap.className = 'word-sheet';
    wrap.innerHTML =
      '<div class="ws-mask" data-nolookup="1"></div>'
      + '<div class="ws-card" data-nolookup="1">'
      +   '<div class="ws-head">'
      +     '<span class="ws-word" id="ws-word"></span>'
      +     '<span class="ws-phon" id="ws-phon"></span>'
      +     '<button class="ws-speak" id="ws-speak" title="听读音">🔊</button>'
      +     '<button class="ws-close" id="ws-close" title="关闭">×</button>'
      +   '</div>'
      +   '<div class="ws-zh" id="ws-zh"></div>'
      +   '<div class="ws-note" id="ws-note"></div>'
      +   '<div class="ws-forms" id="ws-forms"></div>'
      + '</div>';
    document.body.appendChild(wrap);
    const self = this;
    wrap.querySelector('.ws-mask').addEventListener('click', function() { self._closeWordSheet(); });
    wrap.querySelector('#ws-close').addEventListener('click', function() { self._closeWordSheet(); });
    wrap.querySelector('#ws-speak').addEventListener('click', function() {
      if (self._lookupWord) self.speak(self._lookupWord, { prefer: 'cf' });
    });
    this._lookupEl = wrap;
    return wrap;
  },

  _closeWordSheet() {
    if (this._lookupEl) this._lookupEl.classList.remove('show');
  },

  async _openWordSheet(word) {
    const el = this._wordSheetEl();
    this._lookupWord = word.toLowerCase();
    el.querySelector('#ws-word').textContent = word;
    el.querySelector('#ws-phon').textContent = '';
    el.querySelector('#ws-zh').innerHTML = '<span class="ws-loading">正在查…</span>';
    const noteEl = el.querySelector('#ws-note');
    const formsEl = el.querySelector('#ws-forms');
    if (noteEl) { noteEl.className = 'ws-note'; noteEl.innerHTML = ''; }
    if (formsEl) { formsEl.className = 'ws-forms'; formsEl.innerHTML = ''; }
    el.classList.add('show');

    // ===== v143：先问本地那两张表 =====
    // ① 整个词是不是固定搭配（giving up / gave up / look after…）
    const ph = (typeof WordHelp !== 'undefined') ? WordHelp.phraseInfo(word) : null;
    if (ph) {
      // 短语整体读、整体解释。孩子点 giving 也拿到 give up —— 不再只给 "give"
      // 或半截 "giving"，那样他根本看不出这是一个搭配。
      this._lookupWord = ph.en.toLowerCase();
      el.querySelector('#ws-word').textContent = ph.en;
      if (noteEl) {
        noteEl.className = 'ws-note show';
        noteEl.innerHTML = '🔗 <b>固定搭配（短语）</b>'
          + (ph.surface && ph.surface.toLowerCase() !== ph.en.toLowerCase()
              ? '：这里是 <b>' + this._escHtml(ph.surface) + '</b>，来自 <b>' + this._escHtml(ph.en) + '</b>' : '');
      }
      el.querySelector('#ws-zh').textContent = ph.zh;
      this.speak(ph.en, { prefer: 'cf' });
      const binfo0 = await Api.dict(ph.en.split(' ')[0]).catch(function () { return null; });
      if (this._lookupWord !== ph.en.toLowerCase()) return;
      if (binfo0 && binfo0.phon) el.querySelector('#ws-phon').textContent = '/' + binfo0.phon + '/';
      return;
    }

    // ② 点的是变形（felt / went / children / better）→ 先说清它是谁的什么形
    const inf = (typeof WordHelp !== 'undefined') ? WordHelp.inflectionOf(word) : null;
    // ③ 点的是原型 → 顺手把它的各种变形列出来
    const forms = (typeof WordHelp !== 'undefined') ? WordHelp.formsOf(word) : [];

    // 点词即读：孩子点这个词多半就是不认识，先让他听见怎么念。
    // 走 CF 的母语音色（v98）：查词是任意单词，不在静态朗读表里 —— 表内那些
    // 单词的示范音已经换成 CF 音色了，这里跟着走，两处听起来才是同一个人。
    this.speak(word, { prefer: 'cf' });

    const info = await Api.dict(word);
    if (this._lookupWord !== word.toLowerCase()) return;   // 已经点了别的词

    // 变形词：同时把原型的意思也取回来。felt 这种词，词典只给"毛毡"，
    // 孩子要的其实是 feel（感觉）—— 原型的意思才是他真正要找的。
    let baseInfo = null;
    if (inf) {
      baseInfo = await Api.dict(inf.base).catch(function () { return null; });
      if (this._lookupWord !== word.toLowerCase()) return;
    }

    if (info && info.phon) el.querySelector('#ws-phon').textContent = '/' + info.phon + '/';
    else if (baseInfo && baseInfo.phon) el.querySelector('#ws-phon').textContent = '/' + baseInfo.phon + '/';

    if (inf) {
      if (noteEl) {
        noteEl.className = 'ws-note show';
        noteEl.innerHTML = '📌 这是 <b>' + this._escHtml(inf.base) + '</b> 的'
          + inf.labels.join(' / ') + '，意思是「'
          + this._escHtml(this._shortZh((baseInfo && baseInfo.zh) || '')) + '」';
      }
      // 释义优先给原型的意思；词典对变形词的解释里常夹着一堆无关义项。
      const baseZh = (baseInfo && baseInfo.zh) ? baseInfo.zh : '';
      el.querySelector('#ws-zh').textContent = baseZh || (info && info.zh) || '';
      // 原型还有别的变形，一并列出来（felt 的现在分词 feeling 之类）
      const baseForms = (typeof WordHelp !== 'undefined') ? WordHelp.formsOf(inf.base) : [];
      if (baseForms.length && formsEl) {
        formsEl.className = 'ws-forms show';
        formsEl.innerHTML = '<b style="color:var(--text)">' + this._escHtml(inf.base) + '</b> 的变化：'
          + baseForms.map(f => '<span class="ws-form-tag">' + f.label + ' <em>' + this._escHtml(f.word) + '</em></span>').join('');
      }
      if (!baseZh && !(info && info.zh)) {
        el.querySelector('#ws-zh').innerHTML = '<span class="ws-none">暂时查不到中文意思，点 🔊 听读音</span>';
      }
      return;
    }

    if (info && info.zh) {
      el.querySelector('#ws-zh').textContent = info.zh;
    } else {
      el.querySelector('#ws-zh').innerHTML = '<span class="ws-none">暂时查不到中文意思，点 🔊 听读音</span>';
    }
    if (forms.length && formsEl) {
      formsEl.className = 'ws-forms show';
      formsEl.innerHTML = '这个词的变化：'
        + forms.map(f => '<span class="ws-form-tag">' + f.label + ' <em>' + this._escHtml(f.word) + '</em></span>').join('');
    }
  },

};

// Init
App.init();
// v142：脚本改成了 defer —— 登录页会在 app.js 下载/解析完之前就显示出来。
// 这个标记让登录按钮知道"点下去有没有人接"：还没就绪就提示等一下，
// 而不是抛 ReferenceError 让人以为按钮坏了。
window.__appReady = true;

// 点词查义：全局代理，页面上任何英文单词点一下都有音标、中文意思和读音。
// 挂一次就够，跟路由/渲染无关。
App._initWordLookup();

// Preload voices (some browsers need this)
if (window.speechSynthesis) {
  // Trigger voice loading
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = function() {
    if (App && App.state) {
      App.state.voices = window.speechSynthesis.getVoices();
    }
  };
  // Retry loading voices
  setTimeout(function() { window.speechSynthesis.getVoices(); }, 500);
  setTimeout(function() { window.speechSynthesis.getVoices(); }, 1500);
}
