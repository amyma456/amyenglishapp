/* eslint-disable */
// ============================================================================
// Api — the single seam between app.js and storage.
//
// app.js must never touch localStorage, IndexedDB, or Cloud directly. It talks
// only to Api.*, which carries BUSINESS semantics ("save this check-in"), not
// storage semantics ("write this JSON blob").
//
// Two layers:
//   Api    — business surface. Signatures stay fixed when the backend changes.
//   Store  — the v1 local implementation (localStorage + IndexedDB + cloud.js).
//
// When the Cloudflare backend lands, only Store changes:
//   Store.blob      -> GET/POST /api/bootstrap        (D1)
//   Store.rec       -> PUT /api/recordings            (R2 + D1)
//   CloudSync.*     -> deleted; D1 rows make the merge unnecessary
//
// EVERY method is async, even where the v1 implementation is synchronous.
// That is deliberate: it is the whole point of this layer. Crossing the
// sync->async boundary now, while behaviour is unchanged and verifiable, is
// far cheaper than doing it later on top of new backend code.
//
// Rendering never awaits Api. app.js keeps App.state as the in-memory source
// of truth for rendering; Api writes are fire-and-forget behind it.
// ============================================================================

// 老师号白名单（可以多个）。两个作用，缺一不可：
//   1) 用这个号登录 → 直接进老师端；
//   2) 永远不受「移出/删除拦截」限制，可以无限登入登出。
// worker/src/index.js 里有一份同名常量，**两边必须保持一致**，
// 否则老师用第二个号登录时，后台接口会 403（删除/审批全部静默失败）。
// ⚠️ 只放老师自己的号。家长明确过：**13259532909 是孩子（陈皓正-Yunus）**，
// 是拿来在少儿英语A班做作业的学生号，绝不能因为"号码看起来像"就加进来 ——
// 一进白名单，孩子会直接看到老师端，而且永远不再受拦截保护。
const TEACHER_PHONES = ['13259532991'];
function isTeacherPhone(phone) {
  return TEACHER_PHONES.indexOf(String(phone == null ? '' : phone).trim()) >= 0;
}

// ---------------------------------------------------------------------------
// uid — client-generated ids so the Worker can dedupe retries later.
// A flaky mobile network means the same check-in may be POSTed twice; without
// a client id the server cannot tell a retry from a second attempt.
// ---------------------------------------------------------------------------
function uid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ===========================================================================
// Store.blob — the eng_hw_v6 document (localStorage today, D1 tomorrow)
// ===========================================================================
const Store = {
  KEY: 'eng_hw_v6',
  LEGACY: ['eng_hw_v5', 'eng_hw_v4'],
  LOGIN_KEY: 'amy_saved_login',
  WORDS_KEY: 'amy_learned_words',
  // v144：登录表单草稿（手机号 + 备注名）。和"正式凭据"分开存 ——
  // 孩子刚敲了半截手机号也得记住，但那时还不能算登录过。
  DRAFT_KEY: 'amy_login_draft',

  // The canonical document. Api holds this; App.state is a view onto it.
  _doc: null,

  _empty() {
    return {
      answers: {}, checkins: {}, errorBook: [],
      students: [], parentStudents: {}, classes: [],
      // 删除墓碑（tombstone）—— 见 CloudSync 顶部注释。
      // 记着"这个手机号/班级被老师删过"，否则下一次合并又会从云端把它捞回来。
      // revived* 是反过来的名单：老师改主意（同意重新加入 / 重建同名班级）
      // 时要能盖过一台设备或云端上还留着的墓碑。
      deletedPhones: [], deletedClasses: [],
      revivedPhones: [], revivedClasses: [],
    };
  },

  // Refill the existing collections in place instead of swapping in new ones.
  // App.state.checkins and friends hold these exact objects; replacing them
  // would leave the renderers reading a detached copy and silently showing
  // stale (usually empty) data.
  _adopt(target, source) {
    if (target === source) return target;   // self-adopt would empty it
    Object.keys(source).forEach(field => {
      const from = source[field];
      const to = target[field];
      if (Array.isArray(to) && Array.isArray(from)) {
        to.length = 0;
        from.forEach(v => to.push(v));
      } else if (to && from && typeof to === 'object' && typeof from === 'object') {
        Object.keys(to).forEach(k => delete to[k]);
        Object.keys(from).forEach(k => { to[k] = from[k]; });
      } else {
        target[field] = from;
      }
    });
    return target;
  },

  // Read the document, migrating v5/v4 exactly as loadData() used to.
  read() {
    const doc = this._empty();
    try {
      const saved = localStorage.getItem(this.KEY);
      if (saved) {
        const d = JSON.parse(saved);
        doc.answers = d.answers || {};
        doc.checkins = d.checkins || {};
        doc.errorBook = d.errorBook || [];
        doc.students = d.students || [];
        doc.parentStudents = d.parentStudents || {};
        doc.classes = d.classes || [];
        doc.deletedPhones = d.deletedPhones || [];
        doc.deletedClasses = d.deletedClasses || [];
        doc.revivedPhones = d.revivedPhones || [];
        doc.revivedClasses = d.revivedClasses || [];
        // ===== v150：一次性清掉历史遗留的「复活名单」=====
        // 老师 2026-10-23：「删除了之后下次显示还会再进来……顽固性的存在」。
        // 云端 blob 的 revivedPhones 里攒了五十多个号码（含 test 的
        // 13800138000、MATT 的 11840843943）—— 每清一次拦截名单，
        // `_dropGates` 就把「已删除」翻成「复活」，墓碑当场失效，人又回来。
        //
        // 真正的放行走的是另一条路：untombstonePhone 会把号码从 deletedPhones
        // 里摘掉，云端 deletedPhones 里本来就没有他，所以**清空这个列表不会
        // 影响任何在读学生**。这里只做一次（带版本标记），之后按新逻辑走。
        try {
          if (localStorage.getItem('amy_revived_reset_v150') !== '1') {
            doc.revivedPhones = [];
            doc.revivedClasses = [];
            localStorage.setItem('amy_revived_reset_v150', '1');
          }
        } catch (e) {}
      }
      // Migrate from an older version only when v6 produced no students.
      // Same order and same fields as the original loadData().
      let migrated = false;
      for (let i = 0; i < this.LEGACY.length && doc.students.length === 0; i++) {
        const raw = localStorage.getItem(this.LEGACY[i]);
        if (!raw) continue;
        const old = JSON.parse(raw);
        doc.students = old.students || [];
        doc.checkins = old.checkins || {};
        doc.parentStudents = old.parentStudents || {};
        doc.classes = old.classes || [];
        migrated = migrated || doc.students.length > 0;
      }
      if (doc.classes.length === 0 && doc.students.length > 0) {
        doc.classes = ['未分班'];
      }
      // Keep collection identity stable across re-reads (see _adopt), then
      // persist a migration immediately. app.js used to get that flush for
      // free from a saveData() on the login path; that call is gone, so
      // without it a migrated teacher would stay on v5 until their next write.
      this._doc = this._doc ? this._adopt(this._doc, doc) : doc;
      if (migrated) this.flush();
      return this._doc;
    } catch (e) { console.warn('Store.read error:', e); }
    this._doc = this._doc ? this._adopt(this._doc, doc) : doc;
    return this._doc;
  },

  doc() {
    return this._doc || this.read();
  },

  // Persist the whole document. v1 only — each Api write method flushes here.
  // Under D1 these become individual statements and this disappears.
  //
  // Cross-tab safety: a whole-document write blindly overwrites whatever
  // another tab (installed PWA + browser tab is the common case) wrote since
  // we loaded. answers and checkins are append-mostly keyed maps, so we union
  // in any keys the on-disk copy has that we do not, and let ours win on a
  // genuine conflict. Without this, a second tab sitting on a stale snapshot
  // silently erases a child's work on its next 15s sync poll.
  flush() {
    try {
      const d = this.doc();
      let onDisk = null;
      try { onDisk = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) {}
      if (onDisk) {
        ['answers', 'checkins'].forEach(field => {
          const theirs = onDisk[field];
          if (!theirs) return;
          Object.keys(theirs).forEach(k => { if (!d[field][k]) d[field][k] = theirs[k]; });
        });
      }
      localStorage.setItem(this.KEY, JSON.stringify({
        answers: d.answers,
        checkins: d.checkins,
        errorBook: d.errorBook,
        students: d.students,
        parentStudents: d.parentStudents,
        classes: d.classes,
        deletedPhones: d.deletedPhones || [],
        deletedClasses: d.deletedClasses || [],
        revivedPhones: d.revivedPhones || [],
        revivedClasses: d.revivedClasses || [],
      }));
      return true;
    } catch (e) { console.warn('Store.flush error:', e); return false; }
  },

  // v140：localStorage 在一部分手机浏览器（微信内置、iOS 低内存、系统清理）
  // 里会被整个清掉 —— 隔天再打开就变成"没账号"，家长被迫重新输手机号姓名。
  // 现在登录凭据同时写一份一年期 cookie：cookie 和 localStorage 的清空时机
  // 不一样，一边没了另一边还在，互相兜底。
  _LOGIN_COOKIE: 'amy_login',

  _cookieWrite(phone, name) {
    try {
      document.cookie = this._LOGIN_COOKIE + '=' +
        encodeURIComponent(JSON.stringify({ phone: phone, name: name })) +
        '; Max-Age=31536000; path=/; SameSite=Lax';
    } catch (e) {}
  },

  _cookieRead() {
    try {
      const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + this._LOGIN_COOKIE + '=([^;]*)'));
      if (!m) return null;
      const c = JSON.parse(decodeURIComponent(m[1]));
      return (c && c.phone && c.name) ? c : null;
    } catch (e) { return null; }
  },

  _cookieClear() {
    try { document.cookie = this._LOGIN_COOKIE + '=; Max-Age=0; path=/; SameSite=Lax'; } catch (e) {}
  },

  readLogin() {
    try {
      const raw = localStorage.getItem(this.LOGIN_KEY);
      if (raw) {
        const creds = JSON.parse(raw);
        if (creds && creds.phone && creds.name) return creds;
      }
    } catch (e) {}
    // localStorage 里没了 → 从 cookie 兜底恢复，并顺手写回 localStorage
    const c = this._cookieRead();
    if (c) this.writeLogin(c.phone, c.name);
    return c;
  },

  writeLogin(phone, name, known) {
    try { localStorage.setItem(this.LOGIN_KEY, JSON.stringify({ phone: phone, name: name })); } catch (e) {}
    this._cookieWrite(phone, name);
    // v144：草稿同步更新。known 只在"这台设备确实核对/登录成功过这个号"时
    // 才为 true —— 新设备第一次登录仍要走核对（v132 红线）。
    this.writeLoginDraft(phone, name, known === true);
  },

  clearLogin() {
    try { localStorage.removeItem(this.LOGIN_KEY); } catch (e) {}
    this._cookieClear();
    // 注意：**不清草稿**。退出登录/返回登录之后，孩子再点一次就能回去，
    // 不用重新敲一遍手机号和姓名（家长 2026-10-19 的要求）。
  },

  // =========================================================================
  // v144：登录表单草稿
  //   家长 2026-10-19：「刷新之后他需要输入手机号和孩子的姓名……即使刷新了，
  //   也不要丢失这两个部分的东西，继续保留。哪怕停留在登录界面，孩子一点
  //   登录有反应、快速进去就可以。」
  //   所以：输入框里有什么就记什么（含只敲了一半的情况），存 localStorage +
  //   一年期 cookie 双份；刷新时 index.html 的内联脚本在首帧前就回填好。
  //   known 是"这台设备用这个号登录成功过"的标记 —— 只有 known 的草稿才允许
  //   走"不等网络直接进"那条路（新设备第一次登录仍然要核对，v132 的红线）。
  // =========================================================================
  _DRAFT_COOKIE: 'amy_login_draft',

  _draftCookieRead() {
    try {
      const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + this._DRAFT_COOKIE + '=([^;]*)'));
      if (!m) return null;
      const d = JSON.parse(decodeURIComponent(m[1]));
      return (d && (d.phone || d.name)) ? d : null;
    } catch (e) { return null; }
  },

  readLoginDraft() {
    let d = null;
    try {
      d = JSON.parse(localStorage.getItem(this.DRAFT_KEY) || 'null');
    } catch (e) {}
    // v145：sessionStorage 兜底。有些手机内核（夸克/UC 极速模式）退出时会
    // 清 localStorage，但**刷新**不会动 sessionStorage —— 而家长抱怨的正是
    // "一刷新就没了"这一下，所以多存这一份最划算。
    if (!d || (!d.phone && !d.name)) {
      try { d = JSON.parse(sessionStorage.getItem(this.DRAFT_KEY) || 'null'); } catch (e) {}
    }
    if (!d || (!d.phone && !d.name)) d = this._draftCookieRead();   // localStorage 被清 → cookie 兜底
    if (!d || (!d.phone && !d.name)) {
      // 最后兜底：正式凭据里的就是上次登录成功的那一组
      const c = this.readLogin();
      if (c) d = { phone: c.phone, name: c.name, known: true };
    }
    if (!d) return null;
    return { phone: d.phone || '', name: d.name || '', known: !!d.known };
  },

  writeLoginDraft(phone, name, known) {
    const rec = { phone: phone || '', name: name || '', known: !!known, ts: Date.now() };
    if (!rec.phone && !rec.name) { this.clearLoginDraft(); return rec; }
    try { localStorage.setItem(this.DRAFT_KEY, JSON.stringify(rec)); } catch (e) {}
    try { sessionStorage.setItem(this.DRAFT_KEY, JSON.stringify(rec)); } catch (e) {}
    try {
      document.cookie = this._DRAFT_COOKIE + '=' + encodeURIComponent(JSON.stringify(rec)) +
        '; Max-Age=31536000; path=/; SameSite=Lax';
    } catch (e) {}
    return rec;
  },

  clearLoginDraft() {
    try { localStorage.removeItem(this.DRAFT_KEY); } catch (e) {}
    try { sessionStorage.removeItem(this.DRAFT_KEY); } catch (e) {}
    try { document.cookie = this._DRAFT_COOKIE + '=; Max-Age=0; path=/; SameSite=Lax'; } catch (e) {}
  },

  readWords() {
    try { return JSON.parse(localStorage.getItem(this.WORDS_KEY) || '{}'); } catch (e) { return {}; }
  },

  writeWords(map) {
    try { localStorage.setItem(this.WORDS_KEY, JSON.stringify(map)); } catch (e) {}
  },
};

// ===========================================================================
// Store.rec — recordings and speaking scores (IndexedDB today, R2 + D1 later)
//
// Audio never goes in localStorage: 45 students x 5 questions x 3 speaking
// days is ~675 clips a week, far past the 5MB quota. IndexedDB holds Blobs
// natively and has no practical size ceiling here.
// ===========================================================================
const RecStore = {
  DB: 'amy_media', VER: 1,
  CLIPS: 'clips', SCORES: 'scores',
  _db: null,

  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      let req;
      try { req = indexedDB.open(this.DB, this.VER); }
      catch (e) { reject(e); return; }
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(this.CLIPS)) {
          const s = db.createObjectStore(this.CLIPS, { keyPath: 'id' });
          s.createIndex('byStudentDay', ['studentId', 'dayIdx']);
        }
        if (!db.objectStoreNames.contains(this.SCORES)) {
          const s = db.createObjectStore(this.SCORES, { keyPath: 'id' });
          s.createIndex('byStudentDay', ['studentId', 'dayIdx']);
        }
      };
      req.onsuccess = () => { this._db = req.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  },

  _tx(store, mode, fn) {
    return this.open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const req = fn(tx.objectStore(store));
      tx.onerror = () => reject(tx.error);
      if (req) { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }
      else { tx.oncomplete = () => resolve(); }
    }));
  },

  put(store, rec) { return this._tx(store, 'readwrite', s => s.put(rec)); },
  get(store, id) { return this._tx(store, 'readonly', s => s.get(id)); },
  all(store) { return this._tx(store, 'readonly', s => s.getAll()); },
};

// ===========================================================================
// CloudSync — the two-way merge against cloud.js
//
// These ~130 lines came out of app.js verbatim. They exist ONLY because the
// backing store is one opaque JSON blob with no server-side logic: with no
// rows and no timestamps, the client has to reconcile field by field.
//
// DELETION TOMBSTONES
// A plain union merge can never delete anything: the record is gone locally,
// but the cloud copy — or another device still holding a stale copy — pushes
// it straight back on the very next sync. That is the bug the teacher hit:
// removed students and deleted classes kept reappearing. So the blob carries
// two extra lists:
//     deletedPhones  — phone numbers the teacher deleted / removed
//     deletedClasses — class names the teacher deleted
// They are unioned like everything else, which makes them travel to every
// device, and every merge path skips whatever is listed. A phone comes off
// the list only when the teacher approves that student again (approveJoin)
// or adds them back by hand (saveStudent).
//
// AUTHORITATIVE PUSH
// The teacher's device is the only writer allowed to win a conflict. The old
// rule ("cloud is the source of truth for class/approved") protected a
// student device from wiping a class the teacher had just assigned, but it
// also meant the teacher's own un-assign got overwritten by the cloud copy
// on the next push — so 「移出班级」 silently undid itself. Students keep
// pushing cloud-authoritative; the teacher pushes local-authoritative.
//
// When D1 lands this whole section is DELETED, not ported. A single UPDATE
// (and a real DELETE) replaces it, and app.js does not change because it only
// ever called Api.syncUp() / Api.syncDown().
// ===========================================================================
const CloudSync = {
  available() { return typeof Cloud !== 'undefined'; },

  // Union of two string lists, de-duplicated, order preserved (first wins).
  _union(a, b) {
    const out = [], seen = new Set();
    [].concat(a || [], b || []).forEach(v => {
      if (!v || typeof v !== 'string' || seen.has(v)) return;
      seen.add(v); out.push(v);
    });
    return out;
  },

  // Local tombstones ∪ cloud tombstones, minus anything the teacher has since
  // revived (approved back in / re-created the class). The cloud side is what
  // carries a deletion to the other devices, so it must always be merged in —
  // and undoing a deletion has to travel the same way.
  _tombstones(cloudData, local) {
    const c = cloudData || {};
    const l = local || {};
    const revivedPhones = new Set(this._union(l.revivedPhones, c.revivedPhones));
    const revivedClasses = new Set(this._union(l.revivedClasses, c.revivedClasses));
    const phones = this._union(l.phones, c.deletedPhones).filter(p => !revivedPhones.has(p));
    const classes = this._union(l.classes, c.deletedClasses).filter(x => !revivedClasses.has(x));
    return {
      phones: new Set(phones),
      classes: new Set(classes),
      list: {
        phones: phones,
        classes: classes,
        revivedPhones: Array.from(revivedPhones),
        revivedClasses: Array.from(revivedClasses),
      },
    };
  },

  // Push local state up, merging with whatever is already in the cloud.
  // opts.authoritative: the teacher's device — local wins any conflict.
  async up(localStudents, localClasses, opts) {
    opts = opts || {};
    if (!this.available()) return { ok: false, students: localStudents, classes: localClasses };

    const cloudData = await Cloud.loadAll();
    const tomb = this._tombstones(cloudData, opts.tombstones);
    const localWins = !!opts.authoritative;

    // Drop whatever is tombstoned — this is the delete that used to come
    // straight back on the next merge.
    // 同理：挂在已删班级上的学生，推之前先把班级字段抹掉，否则云端 blob
    // 里又会出现这个名字（见 down() 的同一处说明）。
    const mergedStudents = [];
    (localStudents || []).forEach(s => {
      if (!s || !s.phone || tomb.phones.has(s.phone)) return;
      if (s.class && tomb.classes.has(s.class)) { s.class = ''; s.approved = false; }
      mergedStudents.push(s);
    });

    if (cloudData && cloudData.students) {
      cloudData.students.forEach(cs => {
        if (!cs || !cs.phone) return;
        if (tomb.phones.has(cs.phone)) return;
        if (cs.class && tomb.classes.has(cs.class)) return;   // 死班级：不采纳
        const local = mergedStudents.find(s => s.phone === cs.phone);
        if (!local) {
          mergedStudents.push({
            id: cs.id || ('s' + cs.phone),
            name: cs.name,
            phone: cs.phone,
            parentPhone: cs.phone,
            class: cs.class || '',
            approved: cs.approved || false,
            registeredAt: cs.registeredAt || new Date().toISOString(),
          });
        } else if (!localWins) {
          // Cloud is the source of truth for class/approved. Without this a
          // student device holding a stale record could wipe a class the
          // teacher just assigned.
          if (cs.class) local.class = cs.class;
          if (cs.approved) local.approved = cs.approved;
          if (cs.name) local.name = cs.name;
        }
      });
    }

    const mergedClasses = [];
    (localClasses || []).forEach(c => { if (c && !tomb.classes.has(c)) mergedClasses.push(c); });
    if (cloudData && cloudData.classes) {
      cloudData.classes.forEach(c => {
        if (c && !tomb.classes.has(c) && !mergedClasses.includes(c)) mergedClasses.push(c);
      });
    }

    const payload = {
      students: mergedStudents.map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        class: s.class || '',
        approved: s.approved || false,
        registeredAt: s.registeredAt || new Date().toISOString(),
      })),
      classes: mergedClasses,
      deletedPhones: tomb.list.phones,
      deletedClasses: tomb.list.classes,
      revivedPhones: tomb.list.revivedPhones,
      revivedClasses: tomb.list.revivedClasses,
      lastUpdated: new Date().toISOString(),
    };

    const ok = await Cloud.saveAll(payload);
    return { ok: ok, students: mergedStudents, classes: mergedClasses, tombstones: tomb.list };
  },

  // Pull the cloud down, merging into the local collections IN PLACE so that
  // callers holding the same array reference see the update.
  async down(localStudents, localClasses, opts) {
    opts = opts || {};
    if (!this.available()) return { ok: false, empty: true, unreachable: false };

    const cloudData = await Cloud.loadAll();
    if (!cloudData) {
      // Distinguish "cloud is empty" from "cloud unreachable": loadAll() only
      // sets lastError on a real network failure.
      const unreachable = !!(Cloud.lastError && Cloud.lastError.indexOf('网络') >= 0);
      return { ok: false, empty: true, unreachable: unreachable };
    }

    const tomb = this._tombstones(cloudData, opts.tombstones);

    // 已删除的班级名是**全局事实**：任何一个学生记录里若还挂着这个名字
    // （别的设备刚改的、云端 blob 的旧副本、或学生端推上来的旧快照），
    // 都必须当场抹成"未分配"，否则这个班会在班级列表里阴魂不散地冒回来。
    // 老师 2026-10-15：「写定了没有了就是没有了，不要再出现了」。
    const deadClass = (c) => c && tomb.classes.has(c);
    const scrubClass = (s) => {
      if (s && deadClass(s.class)) { s.class = ''; s.approved = false; }
      return s;
    };

    // A deletion made on another device arrives as a tombstone. Apply it
    // here too, otherwise this device keeps showing the deleted record.
    if (tomb.phones.size) {
      for (let i = localStudents.length - 1; i >= 0; i--) {
        const s = localStudents[i];
        if (s && s.phone && tomb.phones.has(s.phone)) localStudents.splice(i, 1);
      }
    }
    if (tomb.classes.size) {
      for (let i = localClasses.length - 1; i >= 0; i--) {
        if (localClasses[i] && tomb.classes.has(localClasses[i])) localClasses.splice(i, 1);
      }
      localStudents.forEach(scrubClass);
    }

    if (cloudData.students && Array.isArray(cloudData.students)) {
      cloudData.students.forEach(cs => {
        if (!cs || !cs.phone) return;
        if (tomb.phones.has(cs.phone)) return;
        if (deadClass(cs.class)) return;      // 学生还挂在已删班级上：整条不采纳
        const local = localStudents.find(s => s.phone === cs.phone);
        if (local) {
          local.name = cs.name || local.name;
          if (!deadClass(cs.class)) {
            if (cs.class !== undefined) local.class = cs.class;
            if (cs.approved !== undefined) local.approved = cs.approved;
          }
          local.registeredAt = cs.registeredAt || local.registeredAt;
        } else {
          localStudents.push({
            id: cs.id || ('s' + cs.phone),
            name: cs.name,
            phone: cs.phone,
            parentPhone: cs.phone,
            class: deadClass(cs.class) ? '' : (cs.class || ''),
            approved: deadClass(cs.class) ? false : (cs.approved || false),
            registeredAt: cs.registeredAt || new Date().toISOString(),
          });
        }
      });
    }

    if (cloudData.classes && Array.isArray(cloudData.classes)) {
      cloudData.classes.forEach(c => {
        if (c && !tomb.classes.has(c) && !localClasses.includes(c)) localClasses.push(c);
      });
    }

    return { ok: true, empty: false, unreachable: false, tombstones: tomb.list };
  },

  lastError() { return this.available() ? Cloud.lastError : null; },
};

// ===========================================================================
// WordHelp — 点词查义要用的两块本地知识（v143）
//
// 家长 2026-10-19 提了两件事：
//   ① 「felt 是 feel 的过去式，表示感觉，但是这个最基本的都没有显示出来；
//      好多只要有过去式的、谁谁谁的将来时都没有写出来」——线上词典对 felt
//      只回了「n. 毛毡；v. （使）毡合」，孩子点开一头雾水。
//   ② 「giving up 这种能组成短语的，要把 giving up 连起来，告诉孩子这是一
//      个固定搭配，不要单个松开，孩子识别不了短语」。
//
// 所以这里放两张本地表：**词形变化**（不规则动词 / 名词复数 / 形容词比较级）
// 和 **常见固定搭配**。查词时先问它，命中就把「谁谁谁的过去式」和短语整体
// 摆到最前面，再补词典释义 —— 词典不全也不会漏掉最基本的那个意思。
//
// 表只影响"怎么解释"，不影响判分；加词、改词随时可以，不动线上接口。
// ===========================================================================
// ===== LOCAL_DICT BEGIN (generated by tools/gen-local-dict.js) =====
// 题库全量单词的本地释义（2586 词）。由本脚本生成，勿手改。
// 格式：word -> "短中文|音标"。Api._localDictBuild 会把它和词汇卡合并。
const LOCAL_DICT = {"a":"一|ə; eɪ","a's":"一系列","a-p-p-l-e-s":"苹果|ˈæplz","able":"能够|ˈeɪb(ə)l","about":"大约|əˈbaʊt","above":"在以上|əˈbʌv","abroad":"在国外|əˈbrɔːd","ac":"交流电|ˌeɪ ˈsiː","account":"账户|əˈkaʊnt","accustomed":"习惯的|əˈkʌstəmd","ace":"A牌|eɪs","across":"从一边到另一边|əˈkrɔːs","action":"行动|ˈækʃ(ə)n","actions":"行动|ˈækʃnz","activities":"活动|ækˈtɪvətiz","activity":"活跃状况|ækˈtɪvəti","actor":"演员|ˈæktər","actors":"演员|ˈæktər","actually":"实际上|ˈæktʃuəli","ad":"广告|æd","add":"添加|æd","added":"额外的|ˈædɪd","address":"地址|əˈdres","adds":"add 的第三人称单数现在时|ædz","ade":"自动数据输入|eɪd","adjective":"形容词|ˈædʒɪktɪv","adjectives":"形容词|ˈædʒɪktɪvz","admire":"钦佩|ədˈmaɪər","adult":"成年人或动物|əˈdʌlt; ˈædʌlt","adv":"副词","advanced":"先进的|ədˈvænst","adventure":"冒险|ədˈventʃə","adverb":"副词|ˈædvɜːrb","adverbial":"副词的|ædˈvɜːrbiəl","advice":"忠告|ədˈvaɪs","advise":"通知|ədˈvaɪz","aeroplane":"<英> 飞机|ˈerəpleɪn","affairs":"事务|əˈferz","afraid":"害怕的|əˈfreɪd","africa":"非洲|ˈæfrɪkə","after":"在之后|ˈæftər","afternoon":"午后|ˌæftərˈnuːn","again":"再一次|əˈɡen","age":"年龄|eɪdʒ","agent":"智能体|ˈeɪdʒənt","agents":"agent 的复数|ˈeɪdʒənts","ago":"以前|əˈɡoʊ","agree":"同意|əˈɡriː","ah":"啊|ɑː","ai":"三趾树懒|ˌeɪ ˈaɪ","air":"大气|er","airport":"机场|ˈerpɔːrt","airports":"机场|ˈerpɔːrts","al":"美国联盟|əl","alice":"爱丽丝|ˈælɪs","all":"全部|ɔːl","allowed":"allow 的过去式和过去分|əˈlaʊd","almost":"几乎|ˈɔːlmoʊst","alone":"独自的|əˈloʊn","along":"沿着|əˈlɔːŋ","aloud":"大声地|əˈlaʊd","already":"已经|ɔːlˈredi","also":"此外|ˈɔːlsoʊ","always":"总是|ˈɔːlweɪz","am":"是|æm; əm","amazing":"惊人的|əˈmeɪzɪŋ","american":"美国人|əˈmerɪkən","amount":"数量|əˈmaʊnt","an":"一个|æn; ən","ancient":"古老的|ˈeɪnʃənt","and":"和|ænd; ənd","angry":"愤怒的|ˈæŋɡri","animal":"动物|ˈænɪm(ə)l","animals":"动物|ˈænɪmlz","another":"另一|əˈnʌðər","answer":"回答|ˈænsər","answered":"回答|ˈænsər","answers":"答案|ˈænsər","antecedent":"先例|ˌæntɪˈsiːd(ə)nt","any":"任何的|ˈeni","anybody":"任何人|ˈenibɑːdi","anyone":"任何人|ˈeniwʌn","anything":"任何事物|ˈeniθɪŋ","anywhere":"在任何地方|ˈeniwer","ap":"美国联合通讯社|ˌeɪ ˈpiː","app":"应用程序|æp","appearance":"露面|əˈpɪrəns","apple":"苹果|ˈæp(ə)l","apples":"苹果|ˈæplz","appo":"奥博金","appoint":"任命|əˈpɔɪnt","appointment":"约定|əˈpɔɪntmənt","april":"四月|ˈeɪprəl","ar":"应收款|ˌeɪ ˈɑːr","are":"是|ɑːr; ər","area":"地区|ˈeəriə","areas":"区域|ˈeriəz","aren't":"are not 的缩略形式|ɑːrnt","around":"在…周围|əˈraʊnd","arrive":"到达|əˈraɪv","arrived":"到达|əˈraɪvd","arrives":"v．到达","arriving":"arrive 的现在分词或动|əˈraɪvɪŋ","arrow":"箭|ˈærəʊ","art":"美术|ɑːrt","article":"文章|ˈɑːtɪkl","artificial":"人造的|ˌɑːrtɪˈfɪʃ(ə)l","artist":"艺术家|ˈɑːrtɪst","artists":"艺术家","arts":"技艺","as":"作为|æz; əz","asia":"亚洲|ˈeɪʒə; ˈeɪʃə","ask":"询问|æsk","asked":"问|æskt","asking":"询问|ˈæskɪŋ","asks":"问|æsks","asleep":"睡着的|əˈsliːp","aspirations":"愿望","ass":"傻瓜|æs","assist":"帮助|əˈsɪst","assistance":"帮助|əˈsɪstəns","assistant":"助手|əˈsɪstənt","ast":"大西洋标准时间|ˌeɪ es ˈtiː","astro":"天文的|ˈæstroʊ","astronaut":"宇航员|ˈæstrənɔːt","astronauts":"宇航员|ˈæstrənɔːts; ˈæstrənɑːts","at":"在|æt; ət","ate":"吃|eɪt","attention":"注意|əˈtenʃ(ə)n","attitude":"态度|ˈætɪtuːd","au":"任意单位|ˌeɪ ˈjuː","aud":"澳元","audience":"观众|ˈɔːdiəns","august":"威严的|ɔːˈɡʌst","aunt":"姑妈|ænt","autumn":"秋天|ˈɔːtəm","av":"简易型|ˌeɪ ˈviː","away":"距离有多远|əˈweɪ","ax":"削减|æks","b":"乙等|biː","b-u-r-g-e-r":"汉堡包|ˈbɜːrɡər","ba":"文学学士|ˌbiː ˈeɪ","baby":"婴儿|ˈbeɪbi","back":"后面|bæk","bad":"坏的|bæd","badly":"严重地|ˈbædli","bag":"袋|bæɡ","bags":"包|bæɡz","bal":"平衡|ˈbæl","ball":"球|bɔːl","balloon":"气球|bəˈluːn","bam":"砰|bæm","bamboo":"竹子|bæmˈbuː","banana":"香蕉|bəˈnænə","bananas":"香蕉|bəˈnænəz","bank":"银行|bæŋk","bar":"酒吧|bɑːr","barbecue":"烧烤|ˈbɑːbɪkjuː","bas":"巴斯|bʌs","base":"根基|beɪs","bases":"base 和 basis 的|ˈbeɪsiːz","bask":"晒太阳取暖|bæsk","basket":"篮子|ˈbæskɪt","basketball":"篮球|ˈbɑːskɪtbɔːl","bat":"球棒|bæt","bath":"浴缸|bæθ","bathroom":"浴室|ˈbɑːθruːm","batteries":"电池|ˈbætəriz","bbq":"barbecue 的缩写：户|ˈbɑːrbɪkjuː","bd":"反向二极管|ˌbiː ˈdiː","be":"被|biː; bi","bea":"美国经济分析局","beach":"沙滩|biːtʃ","beans":"豆子|biːnz","beau":"男友|boʊ","beautiful":"美丽的|ˈbjuːtɪfəl","became":"成为|bɪˈkeɪm","because":"因为|bɪˈkəz, bɪˈkɔːz","become":"变成|bɪˈkʌm","becomes":"变得|bɪˈkʌmz","becoming":"好看的|bɪˈkʌmɪŋ","bed":"床|bed","bedroom":"卧室|ˈbedruːm","bedru":"卧室","beds":"床|bedz","bedtime":"就寝时间|ˈbedtaɪm","been":"是|bɪn","before":"在之前|bɪˈfɔːr","began":"开始|bɪˈɡæn","begin":"开始|bɪˈɡɪn","beginning":"开始|bɪˈɡɪnɪŋ","begins":"begin 的第三人称单数形|bɪˈɡɪnz","behind":"在的后面|bɪˈhaɪnd","beijing":"北京","being":"生物|ˈbiːɪŋ","believe":"相信|bɪˈliːv","belong":"应在地方|bɪˈlɔːŋ","belt":"腰带|belt","best":"最好的|best","better":"较好的|ˈbetər","between":"在中间|bɪˈtwiːn","bi":"元素铋的符号|baɪ","big":"大的|bɪɡ","bigger":"更大的|bɪgə(r)","biggest":"最大的|bɪgɪst","bike":"自行车|baɪk","bikes":"自行车|baɪks","bin":"垃圾桶|bɪn","birds":"鸟|bɜːrdz","birth":"出生|bɜːrθ","birthday":"生日|ˈbɜːrθdeɪ","bit":"小片|bɪt","bju":"比尔霍尔姆","bl":"男孩之爱|ˈbiː ˈel","black":"黑的|blæk","blackboard":"黑板|ˈblækbɔːrd","blank":"空白的|blæŋk","ble":"低功耗蓝牙","blend":"混合|blend","blew":"动词 blow 的过去式|bluː","blue":"蓝色的|bluː","board":"板|bɔːrd","boat":"小船|boʊt","boating":"划船|ˈboʊtɪŋ","boats":"船|boʊts","body":"身体|ˈbɑːdi","boies":"博伊斯","bones":"骨骼|boʊnz","boo":"发嘘声|buː","book":"书|bʊk","books":"书|bʊks","bookstore":"书店|ˈbʊkstɔːr","boot":"靴子|buːt","boots":"靴子|buːts","bor":"掉电复位","bored":"无聊的|bɔːrd","boring":"令人厌烦的|ˈbɔːrɪŋ","born":"天生的|bɔːrn","both":"双方|boʊθ","bottle":"瓶子|ˈbɑːt(ə)l","bottles":"瓶子","bottom":"底|ˈbɑːtəm","bought":"买|bɔːt","box":"盒|bɑːks","boxes":"box 的复数：盒子|bɑːksɪz","boy":"男孩|bɔɪ","boys":"男孩子们|bɔɪz","br":"英国铁路公司的缩写|ˌbiː ˈɑːr","bra":"胸罩|brɑː","brate":"布拉捷耶沃区","brave":"勇敢的|breɪv","bravely":"勇敢地|ˈbreɪvli","braveness":"勇敢|ˈbrevnɪs","braver":"更勇敢的|ˈbreɪvər","bre":"英国建筑研究院","bread":"面包|bred","break":"打破|breɪk","breakfast":"早餐|ˈbrekfəst","breath":"呼吸|breθ","brekf":"早餐","brel":"布雷尔","bridge":"桥|brɪdʒ","bridges":"[交]桥梁|ˈbrɪdʒɪz","brief":"短暂的|briːf","bright":"明亮的|braɪt","bring":"拿来|brɪŋ","bringing":"递送|ˈbrɪŋɪŋ","brings":"带来|brɪŋz","british":"英国的|ˈbrɪtɪʃ","bronze":"青铜|brɒnz","brother":"兄弟|ˈbrʌðər","brought":"带来|brɔːt","brown":"褐色的|braʊn","brush":"刷子|brʌʃ","brushes":"刷子|ˈbrʌʃɪz","brushies":"毛茸茸的","brushs":"笔触","bu":"支持|buː","build":"建造|bɪld","builders":"施工人员|ˈbɪldərz","building":"建筑物|ˈbɪldɪŋ","buildings":"建筑物|ˈbɪldɪŋz","built":"具有特性|bɪlt","burger":"汉堡包|ˈbɜːrɡər","burgur":"汉堡包","bus":"公共汽车|bʌs","buses":"公共汽车|ˈbʌsɪz","business":"商业|ˈbɪznəs","busy":"繁忙的|ˈbɪzi","but":"而|bʌt; bət","butter":"黄油|ˈbʌtər","buy":"购买|baɪ","buying":"购买|ˈbaɪɪŋ","buys":"购买|baɪz","by":"由|baɪ","c":"碳|siː","c-r-e-a-m":"奶油|kriːm","ca":"大约|ˈsɜːrkə","caf":"成本加运费价格","cake":"饼状食物|keɪk","cakes":"糕饼|keɪks","cal":"小卡|kæl","calendar":"日历|ˈkælɪndə","call":"给命名|kɔːl","called":"叫做|kɔːld","calligraphy":"书法|kəˈlɪɡrəfi","calls":"电话|kɔːlz","cam":"凸轮|kæm","came":"come 的过去式|keɪm","camel":"骆驼|ˈkæml","camels":"骆驼|ˈkæmlz","camera":"相机|ˈkæmrə","camping":"露营|ˈkæmpɪŋ","can":"能|kæn; kən","can't":"不能|kænt","canal":"运河|kəˈnæl","canals":"运河|kəˈnælz","cannot":"情态动词 can 的否定式：|ˈkænɑːt","cans":"金属罐|kænz","capital":"资本|ˈkæpɪt(ə)l","car":"汽车|kɑːr","card":"银行卡|kɑːrd","cards":"纸牌|kɑːrdz","care":"照料|ker","career":"职业|kəˈrɪr","careful":"仔细的|ˈkerf(ə)l","carefully":"小心地|ˈkerfəli","carried":"拿|ˈkærid","carries":"携带|ˈkæriz","carrots":"胡萝卜|ˈkærəts","carry":"提|ˈkæri","carrying":"carry 的现在分词：运送|ˈkæriɪŋ","cars":"汽车|kɑːrz","cartoon":"漫画|kɑːrˈtuːn","cartoons":"动画片|kɑːrˈtuːnz","cas":"儿童援助协会|ˌsi e ˈɛs","cash":"现款|kæʃ","cat":"猫|kæt","catch":"接住|kætʃ","cats":"猫|kæts","ce":"公元|ˌsiː ˈiː","cel":"厘米/秒|ˈsel","celebrate":"庆祝|ˈselɪbreɪt","celebration":"庆典|ˌseləˈbreɪʃ(ə)n","center":"中间|ˈsentər","cess":"税|ses","ch":"荣誉勋爵","chair":"椅子|tʃer","chairs":"椅子|tʃerz","chang'e":"嫦娥：中国神话中的月亮女神","change":"改变|tʃeɪndʒ","changed":"经过改变的|tʃeɪndʒd","changes":"改变|ˈtʃeɪndʒɪz","changing":"变化中的|ˈtʃeɪndʒɪŋ","character":"性格|ˈkærəktər","characters":"人物角色|ˈkærəktərz","charge":"充电|tʃɑːrdʒ","charging":"充电|ˈtʃɑːdʒɪŋ","cheap":"便宜的|tʃiːp","cheaper":"cheap 的比较级：成本更|ˈtʃiːpər","check":"检查|tʃek","cheer":"欢呼声|tʃɪr","chen":"陈","chess":"国际象棋|tʃes","chicken":"鸡|ˈtʃɪkɪn","child":"儿童|tʃaɪld","children":"child 的复数形式|ˈtʃɪldrən","china":"瓷|ˈtʃaɪnə","china's":"China 的所有格形式","chine":"切开的脊骨|tʃaɪn","chinese":"中国的|ˌtʃaɪˈniːz","chip":"炸薯条|tʃɪp","chips":"[食品]炸土豆条|tʃɪps","chocolate":"巧克力|ˈtʃɔːklət","choice":"选择|tʃɔɪs","choose":"选择|tʃuːz","chooses":"choose 的第三人称单数","chores":"日常杂务|tʃɔːrz","christmas":"圣诞节|ˈkrɪsməs","ci":"铸铁|siː aɪ","cinema":"电影院|ˈsɪnəmə","cinemas":"电影院|ˈsɪnəməz","cious":"堂兄弟","circle":"圆|ˈsɜːrk(ə)l","cise":"计算机信息科学与工程中心","cities":"城市|ˈsɪtiz","city":"城市|ˈsɪti","ck":"肌酸激酶|ˈsikˈeɪ","class":"班级|klæs","classes":"课程|ˈklæsɪz","classmate":"同班同学|ˈklæsmeɪt","classroom":"教室|ˈklæsruːm","classrooms":"教室|ˈklæsruːmz; ˈklæsrʊmz","classs":"班级","clause":"从句|klɔːz","clay":"黏土|kleɪ","cle":"克利夫兰","clean":"洁净的|kliːn","cleaned":"打扫|kliːnd","cleaner":"清洁工人|ˈkliːnər","cleaning":"清洗|ˈkliːnɪŋ","cleans":"打扫|kliːnz","clear":"易懂的|klɪr","clever":"聪明的|ˈklevə","climb":"攀登|klaɪm","climbed":"攀登|klaɪmd","clock":"时钟|klɑːk","close":"关闭|kloʊz","closed":"关着的|kloʊzd","closes":"关闭","closing":"结束的|ˈkloʊzɪŋ","cloth":"布|klɔːθ","clothes":"衣服|kloʊðz","cloud":"云|klaʊd","cloudy":"多云的|ˈklaʊdi","cloze":"完形的|ˈkloʊz","clubs":"俱乐部|klʌbz","co":"一氧化碳|ˌsiː ˈoʊ","coal":"煤|koʊl","code":"密码|koʊd","codes":"密码|koʊdz","coffee":"咖啡|ˈkɔːfi","coins":"硬币|kɔɪnz","cold":"冷的|koʊld","colder":"更冷的|ˈkəʊldə(r)","collected":"collect 的过去式和过|kəˈlektɪd","collocation":"词组|ˌkɑːləˈkeɪʃn","color":"颜色|ˈkʌlər","colors":"彩色","colour":"<英>颜色|ˈkʌlər","colours":"colour 的英式复数形式|ˈkʌlərz","com":"组件对象模型|kɑːm","come":"来|kʌm","comes":"来|kʌmz","comf":"舒服","comfortable":"舒适的|ˈkʌmftəbl","comforting":"安慰的|ˈkʌmfərtɪŋ","common":"共同的|ˈkɑːmən","community":"社区|kəˈmjuːnəti","commute":"通勤|kəˈmjuːt","company":"公司|ˈkʌmpəni","comparative":"比较级|kəmˈpærətɪv","compare":"比较|kəmˈper","comparison":"比较|kəmˈpærɪsn","competi":"竞争","competition":"比赛|ˌkɒmpəˈtɪʃn","complete":"完全的|kəmˈpliːt","compound":"混合物|ˈkɑːmpaʊnd","computer":"计算机|kəmˈpjuːtər","computers":"电脑|kəmˈpjuːtərz","con":"骗局|kɑːn","concrete":"确实的|ˈkɑːnkriːt","conditional":"有条件的|kənˈdɪʃən(ə)l","connect":"连接|kəˈnekt","connected":"连接的|kəˈnektɪd","connecting":"连接的|kəˈnektɪŋ","connects":"连接","consistent":"始终如一的|kənˈsɪstənt","consonant":"辅音|ˈkɑːnsənənt","content":"满足的|ˈkɑːntent; kənˈtent","continuous":"连续不断的|kənˈtɪnjuəs","conv":"卷积和多项式相乘|ˈkənv","convenient":"方便的|kənˈviːniənt","conversation":"谈话|ˌkɑːnvərˈseɪʃ(ə)n","cook":"厨师|kʊk","cooked":"烹饪|kʊkt","cooking":"烹饪|ˈkʊkɪŋ","cooks":"厨师|kʊks","cool":"凉的|kuːl","corner":"角|ˈkɔːrnər","correct":"正确的|kəˈrekt","cost":"价钱|kɔːst","costs":"费用|kɔːsts","cotton":"棉|ˈkɑːt(ə)n","cou":"中华有机联盟","could":"可以|kʊd; kəd","count":"数数|kaʊnt","countable":"可数的|ˈkaʊntəbl","countries":"国家|ˈkʌntriz","country":"国|ˈkʌntri","countryes":"国家","countrys":"乡村","countryside":"乡村|ˈkʌntrisaɪd","cour":"庭院","courage":"勇气|ˈkʌrɪdʒ","course":"课程|kɔːrs","cousin":"堂兄弟|ˈkʌzn","cover":"覆盖|ˈkʌvər","covered":"有顶的|ˈkʌvərd","cr":"条件反射","cream":"奶油|kriːm","cross":"反对|krɔːs","crossing":"人行横道|ˈkrɔːsɪŋ","crowded":"拥挤的|ˈkraʊdɪd","cry":"哭|kraɪ","ct":"计算机化X线体层照相术|siː tiː","cu":"<非正式>再见|ˌsiː ˈjuː","cue":"暗示|kjuː","cultural":"文化的|ˈkʌltʃərəl","culture":"文化|ˈkʌltʃər","cup":"杯子|kʌp","cupes":"线索","cupies":"副本","cups":"杯子|kʌps","curious":"好奇的|ˈkjʊəriəs","current":"现行的|ˈkɜːrənt","cus":"硫化铜","custom":"习俗|ˈkʌstəm","customers":"顾客|ˈkʌstəmərz","cut":"切|kʌt","cute":"漂亮的|kjuːt","cutting":"尖酸刻薄的|ˈkʌtɪŋ","cuttings":"插条|ˈkʌtɪŋz","cy":"日历年度|saɪ; si","d":"字母 D|diː","d-w-i":"酒醉后开车|ˌdiː dʌbljuː ˈaɪ","da":"是|ˌdiː ˈeɪ","dad":"爸爸|dæd","daily":"每日的|ˈdeɪli","dal":"木豆等南亚豆类|dɑːl","dan":"段|dæn","dance":"跳舞|dæns","dancer":"舞者|ˈdænsər","dances":"舞蹈|ˈdɑːnsɪz","danger":"危险|ˈdeɪndʒər","dangerous":"危险的|ˈdeɪndʒərəs","dar":"美国革命女儿会|ˌdiː eɪ ˈɑːr","darker":"更暗的|ˈdɑːrkər","day":"一天|deɪ","days":"天|deɪz","daytime":"白天|ˈdeɪtaɪm","de":"德国|diː","deal":"大量|diːl","dear":"珍视的|dɪr","december":"十二月|dɪˈsembər","decision":"决定|dɪˈsɪʒ(ə)n","deep":"深的|diːp","deli":"<非正式>熟食店|ˈdeli","delicious":"美味的|dɪˈlɪʃəs","deliver":"投递|dɪˈlɪvər","delivered":"投递|dɪˈlɪvərd","delivering":"投递|dɪˈlɪvərɪŋ","delivery":"递送|dɪˈlɪvəri","deliveryman":"送货员|dɪˈlɪvərimən","depend":"取决于|dɪˈpend","der":"区分编码规则","des":"数据加密标准|ˈdiˈiˈes","describe":"描述|dɪˈskraɪb","describes":"：描述|dɪˈskraɪbz","describing":"描述|dɪˈskraɪbɪŋ","description":"描述|dɪˈskrɪpʃn","desert":"沙漠|ˈdezət","deserts":"沙漠|dɪˈzɜːrts","desk":"书桌|desk","desks":"桌子|desks","details":"细节|ˈdiːteɪlz","dez":"二乙基锌","di":"直接喷射|ˌdiː ˈaɪ","dialogue":"对白|ˈdaɪəlɔːɡ","dictionary":"字典|ˈdɪkʃəneri","did":"做|dɪd","dier":"死者","different":"不同的|ˈdɪfrənt","difficult":"困难的|ˈdɪfɪkəlt","dig":"搜寻|dɪɡ","digital":"数字的|ˈdɪdʒɪtl","dining":"吃饭|ˈdaɪnɪŋ","dinner":"正餐|ˈdɪnər","dinosaur":"恐龙|ˈdaɪnəsɔː","dinosaurs":"[古生]恐龙|ˈdaɪnəsɔːrz","directly":"直接地|dəˈrektli; daɪˈrektli","dirty":"肮脏的|ˈdɜːrti","dis":"表示对某人的轻视|dɪs","discover":"发现|dɪˈskʌvə","disease":"疾病|dɪˈziːz","dish":"碟|dɪʃ","dishes":"菜肴|ˈdɪʃɪz","divide":"分开|dɪˈvaɪd","divided":"分裂的|dɪˈvaɪdɪd","divides":"动词 divide 的第三人","dividing":"区分的|dɪˈvaɪdɪŋ","dl":"分升","dlz":"一打","do":"做|duː; də","doctor":"医生|ˈdɑːktər","doctor's":"医生诊疗所","doctors":"医生|ˈdɑːktərz","does":"做|dʌz","dog":"狗|dɔːɡ","doing":"做|ˈduːɪŋ","dol":"痛单位|dɒl","dollars":"美元","dolphin":"海豚|ˈdɒlfɪn","don't":"do not 的缩略形式|doʊnt","done":"完成的|dʌn","door":"门|dɔːr","doors":"大门|dɔːz","dot":"点|dɑːt","down":"朝下|daʊn","downtown":"市中心的|ˌdaʊnˈtaʊn","dr":"速度三角形定位法|ˈdɑːktər;  draɪv","dra":"航位推算分析器","dragon":"西方的龙|ˈdræɡən","drank":"喝|dræŋk","draw":"画|drɔː","drawing":"图画|ˈdrɔːɪŋ","drawn":"憔悴的|drɔːn","dream":"梦|driːm","dress":"连衣裙|dres","dressed":"穿好衣服的|drest","drew":"draw 的过去式：牵引|druː","drill":"钻|drɪl","drink":"喝|drɪŋk","drinking":"喝|ˈdrɪŋkɪŋ","drinks":"饮料|drɪŋks","drive":"驾车送|draɪv","driven":"有紧迫感的|ˈdrɪvn","driver":"司机|ˈdraɪvər","drivers":"司机|ˈdraɪvər","drives":"drive 的复数形式：驱动|draɪvz","driving":"推动的|ˈdraɪvɪŋ","drone":"嗡嗡叫|droʊn","drones":"无人机|droʊnz","drop":"投|drɑːp","drops":"滴|drɑːps","drove":"人群|droʊv","drunk":"喝醉的|drʌŋk","dry":"干的|draɪ","duck":"鸭子|dʌk","dumpling":"汤团|ˈdʌmplɪŋ","dumplings":"饺子|ˈdʌmplɪŋz","duration":"持续|duˈreɪʃn","during":"在期间|ˈdʊrɪŋ","dw":"发展的宽度|ˌdiː ˈdʌbljuː","dynasties":"朝代","dz":"阿尔及利亚的域名|ˈdʌzn","e":"英语字母中的第五个字母|iː","e-books":"电子图书|ˈiː bʊks","ea":"EA的缩写|ˌi ˈe","each":"每|iːtʃ","earlier":"早些时候地|ˈɜːrliər","early":"早期的|ˈɜːrli","earth":"地球|ɜːrθ","ease":"容易|iːz","easier":"更简单|ˈiziə","easily":"容易地|ˈiːzəli","east":"东|iːst","easy":"容易的|ˈiːzi","eat":"吃|iːt","eaten":"吃|ˈiːtn","eating":"吃|ˈiːtɪŋ","eats":"设备准确度测试站|iːts","echoes":"回声|ˈekoʊz","ed":"Edmund|ed","ee":"早期英语|iː","egg":"卵|eɡ","eggs":"[禽]蛋|eɡz","egypt":"埃及|ˈiːdʒɪpt","ei":"电子点火|ˌiːˈaɪ","eight":"八|eɪt","eighteen":"十八|ˌeɪˈtiːn","either":"或者|ˈiːðər","either-or":"只能二选一的|ˈaɪðɚˈɔ","eks":"依克丝","ekt":"外表层","el":"预期损失|el","electric":"电的|ɪˈlektrɪk","electricity":"电|ɪˌlekˈtrɪsəti","elephant":"象|ˈelɪfənt; ˈeləfənt","eleven":"十一|ɪˈlev(ə)n","ella":"Ella|ˈelə","email":"电子邮件|ˈiːmeɪl","emma":"艾玛|ˈemə","emperors":"皇帝","en":"字母 N|ɪn","ence":"的动作","end":"最后部分|end","ends":"结束|endz","enemies":"敌人|ˈenəmi","energy":"能量|ˈenədʒi","engine":"发动机|ˈendʒɪn","engineer":"工程师|ˌendʒɪˈnɪr","engineering":"工程|ˌendʒɪˈnɪrɪŋ","engines":"发动机|ˈendʒɪnz","english":"英国的|ˈɪŋɡlɪʃ","enjoy":"享受|ɪnˈdʒɔɪ","enjoys":"享受","enough":"充足的|ɪˈnʌf","ent":"耳鼻喉|ˌiː en ˈtiː","enter":"进入|ˈentər","entered":"进入|ˈentərd","entire":"全部的|ɪnˈtaɪər","entrance":"入口|ˈentrəns","envelopes":"信封|ˈenvəloʊps; ˈɑːnvəloʊps","environment":"自然环境|ɪnˈvaɪrənmənt","er":"呃|ɜːr; ər","ert":"雌激素替换疗法","es":"西班牙|iːz","essay":"短文|ˈeseɪ","est":"美国东部标准时间|ˌiː es ˈtiː","et":"埃塞俄比亚的网络域名|et","etc":"等等|ˌet ˈsetərə; ˌɪt ˈsetərə","eu":"欧盟|ˌiː ˈjuː","european":"欧洲的|ˌjʊrəˈpiːən","eve":"前夕|iːv","even":"平坦的|ˈiːv(ə)n","evening":"晚上|ˈiːvnɪŋ","ever":"曾经|ˈevər","every":"每个|ˈevri","everybody":"每个人|ˈevribɑːdi; ˈevribʌdi","everyone":"每个人|ˈevriwʌn","everything":"每件事物|ˈevriθɪŋ","everywhere":"到处|ˈevriwer","ex":"<非正式>前妻|eks","exam":"考试|ɪɡˈzæm","example":"例子|ɪɡˈzæmp(ə)l","examples":"例子|ɪɡˈzæmpl","excellent":"极好的|ˈeksələnt","exciting":"令人兴奋的|ɪkˈsaɪtɪŋ","exclamation":"惊叫|ˌekskləˈmeɪʃn","excuse":"借口|ɪkˈskjuːs","exer":"埃克塞","exercise":"锻炼|ˈeksəsaɪz","exercised":"行使","exercises":"练习|ˈeksərsaɪzɪz","exercising":"锻炼","exist":"存在|ɪɡˈzɪst","expe":"经历","expensive":"花钱多的|ɪkˈspensɪv","experience":"经历|ɪkˈspɪriəns","experiment":"实验|ɪkˈsperɪmənt","experimented":"试验|ɪkˈsperɪmentɪd","experimenting":"做实验|ɪkˈsperɪməntɪŋ","experiments":"实验|ɪkˈsperɪmənts; ɪkˈsperɪments; ɪkˈsperəmənts; ɪkˈsperəments","explain":"解释|ɪkˈspleɪn","explains":"解释|ɪkˈspleɪnz","exploration":"勘探|ˌekspləˈreɪʃ(ə)n","explore":"探索|ɪkˈsplɔː","express":"表达|ɪkˈspres","expresses":"表达|ɪkˈspresɪz","expression":"表达|ɪkˈspreʃ(ə)n","eye":"眼睛|aɪ","eyes":"眼睛|aɪz","f":"F 级|ef","fa-vo-rite":"最受喜爱的|ˈfeɪvərɪt","face":"脸|feɪs","faces":"脸|ˈfeɪsɪz","fact":"事实|fækt","factories":"工厂|ˈfæktriz; ˈfæktəriz","facts":"设备管理控制与时间调度程序|fækts","fall":"降落|fɔːl","families":"家庭|ˈfæməliz","family":"家|ˈfæməli","famous":"著名的|ˈfeɪməs","far":"远|fɑːr","faraway":"遥远的|ˈfɑːrəweɪ","farest":"法乐通","farm":"农场|fɑːrm","farmer":"农夫|ˈfɑːrmər","farmers":"农民|ˈfɑːrmərz","farms":"农场|fɑːrmz","farther":"较远地|ˈfɑːrðər","fashionable":"流行的|ˈfæʃ(ə)nəb(ə)l","fast":"快的|fæst","faster":"更快的|ˈfæstər","fastest":"最快速的|fæstɪst","father":"父亲|ˈfɑːðər","favorite":"最受喜爱的|ˈfeɪvərɪt","favourite":"特别受喜爱的|ˈfeɪvərɪt","fe":"铁的化学符号|ˌef ˈiː","feature":"特点|ˈfiːtʃər","february":"二月|ˈfebrueri","feed":"饲养|fiːd","feel":"感受到|fiːl","feelings":"感情|ˈfiːlɪŋz","feels":"feel 的第三人称单数：感|fiːlz","feet":"脚|fiːt","felt":"毛毡|felt","fest":"集会|fest","festival":"活动节期|ˈfestɪvl; ˈfestəvəl","festivals":"节日|ˈfestɪvlz","few":"一些|fjuː","fewer":"较少的|fjuːər","field":"田地|fiːld","fifteen":"十五|ˌfɪfˈtiːn","fifty":"五十|ˈfɪfti","fight":"与作斗争|faɪt","fill":"充满|fɪl","filled":"充满的|fɪld","filling":"给人以满足感的|ˈfɪlɪŋ","fillings":"补牙填料|ˈfɪlɪŋz","film":"电影|fɪlm","films":"电影|fɪlmz","find":"找到|faɪnd","finding":"结果|ˈfaɪndɪŋ","finish":"完成|ˈfɪnɪʃ","finished":"结束了的|ˈfɪnɪʃt","fire":"失火|ˈfaɪər","firefighters":"消防员","firemen":"消防员|ˈfaɪəmən","first":"第一位的|fɜːrst","fish":"鱼|fɪʃ","fishing":"钓鱼|ˈfɪʃɪŋ","fishs":"<俚>可卡因","fit":"适合|fɪt","fits":"合身|fɪts","five":"五|faɪv","fix":"修理|fɪks","fixed":"固定的|fɪkst","flat":"平的|flæt","flew":"飞|fluː","flies":"苍蝇|flaɪz","flight":"航班|flaɪt","floats":"花车|floʊts","floor":"地板|flɔːr","flowers":"花|ˈflaʊərz","fly":"飞|flaɪ","flying":"能飞的|ˈflaɪɪŋ","flys":"财福星","fn":"fn：功能","fo":"英国外交部|ˌef ˈəʊ","foggy":"有雾的|ˈfɑːɡi","folk":"人们|foʊk","follow":"跟着|ˈfɑːloʊ","followed":"follow 的过去式和过去|ˈfɑːloʊd","following":"之后的|ˈfɑːloʊɪŋ","follows":"跟随","fond":"喜爱的|fɑːnd","food":"养料|fuːd","foods":"食物|fuːdz","fool":"傻瓜|fuːl","foot":"脚|fʊt","football":"足球运动|ˈfʊtbɔːl","for":"给|fɔːr; fər","forbidden":"禁止的|fərˈbɪdn","foreign":"外国的|ˈfɔːrən","forest":"森林|ˈfɒrɪst","forests":"森林|ˈfɔːrɪsts; ˈfɑːrɪsts","forever":"永远|fərˈevər","forget":"忘记|fərˈɡet","forgive":"原谅|fərˈɡɪv","forgot":"忘记|fərˈɡɑːt","form":"出现|fɔːrm","format":"总体安排|ˈfɔːrmæt","fort":"堡垒|fɔːrt","forty":"四十|ˈfɔːrti","forty-five":"四十五","forty-two":"四十二","forward":"向前|ˈfɔːrwərd","found":"创办|faʊnd","four":"四|fɔːr","fourteen":"十四|ˌfɔːrˈtiːn","fox":"狐狸|fɑːks","foxes":"[脊椎]狐狸","fr":"法郎|ef ɑːr","france":"法国|fræns","fre":"free 的误拼","free":"免费的|friː","freedom":"自由权|ˈfriːdəm","freely":"自由地|ˈfriːli","freer":"更自由的|ˈfriːər","freeze":"结冰|friːz","french":"法国的|frentʃ","frend":"friend 的误拼","frendli":"友好","frequency":"出现次数|ˈfriːkwənsi","fresh":"新鲜的|freʃ","fri":"星期五","friday":"星期五|ˈfraɪdeɪ","fridge":"冰箱|frɪdʒ","frien":"朋友","friend":"朋友|frend","friendly":"友好的|ˈfrendli","friends":"朋友|frendz","friendship":"友谊|ˈfrendʃɪp","fries":"薯条|fraɪz","from":"从|frʌm; frəm","front":"前面|frʌnt","fruit":"水果|fruːt","fruits":"水果|fruːts","ful":"富拉人|fʊl; fl","full":"满的|fʊl","fun":"乐趣|fʌn","funny":"滑稽的|ˈfʌni","fur":"软毛|fɜːr","future":"未来|ˈfjuːtʃər","g":"英语字母的第七个字母|dʒiː","game":"游戏|ɡeɪm","games":"game 的复数：游戏|ɡeɪmz","garbage":"<美>垃圾|ˈɡɑːrbɪdʒ","garden":"花园|ˈɡɑːrdn","gate":"大门|ɡeɪt","gates":"[建]大门|ɡeɪts","gave":"给予|ɡeɪv","ge":"格鲁吉亚","general":"总体的|ˈdʒen(ə)rəl","ger":"圆顶帐篷|dʒər","get":"收到|ɡet","gets":"得到|ɡets","getting":"get 的现在分词：得到|ˈɡetɪŋ","gh":"生长激素","ghbor":"伽柏","gi":"白色束腰宽松服|ˌdʒiː ˈaɪ","giant":"巨人|ˈdʒaɪənt","gift":"礼物|ɡɪft","gifts":"礼品|ɡɪfts","gine":"吟卫","girl":"女孩|ɡɜːrl","give":"给|ɡɪv","given":"规定的|ˈɡɪv(ə)n","gives":"付出|ɡɪvz","giving":"give 的现在分词：给|ˈɡɪvɪŋ","glass":"玻璃|ɡlæs","glasses":"眼镜|ˈɡlæsɪz","globally":"全球地|ˈɡloʊbəli","gn":"几内亚","go":"去|ɡoʊ","goddess":"女神|ˈɡɑːdəs","goddesses":"女神","goes":"go 的第三人称单数现在时形|ɡoʊz","going":"离开|ˈɡoʊɪŋ","gold":"金|ɡoʊld","golden":"金制的|ˈɡoʊldən","gonna":"<非正式>即将|ˈgɔːnə; ˈɡənə","good":"优良的|ɡʊd","goodbye":"再见|ˌɡʊdˈbaɪ","goods":"商品|ɡʊdz","got":"得到|ɡɑːt","gr":"总预备队","grain":"谷物|ɡreɪn","grammar":"语法|ˈɡræmər","grams":"克|ɡræmz","grand":"壮丽的|ɡrænd","grandfather":"祖父|ˈɡrænfɑːðər","grandma":"<非正式>奶奶|ˈɡrænmɑː","grandma's":"奶奶的","grandpa":"<非正式>爷爷|ˈɡrænpɑː","grandparents":"祖父母|ˈɡrænperənts","grapes":"葡萄|ɡreɪps","grass":"草|ɡræs","great":"伟大的|ɡreɪt","greatest":"最伟大的|ˈɡretɪst","green":"绿色的|ɡriːn","greenway":"园林路|ˈɡriːnˌweɪ","greeting":"问候|ˈɡriːtɪŋ","grew":"grow 的过去式：长大|ɡruː","grids":"grid 的复数形式：网格|ɡrɪdz","group":"集体|ɡruːp","grow":"长大|ɡroʊ","growing":"增长的|ˈɡroʊɪŋ","grown":"长大的|ɡroʊn","grows":"grow 的第三人称单数：长","guangdong":"广东|ˈgwɑːŋˈduːŋ","guests":"guest 的复数：客人|ɡests","gui":"图形用户界面|ˈɡuːiˌˌdʒiː juː ˈaɪ","guide":"导游|ɡaɪd","guitar":"吉他|ɡɪˈtɑː","gy":"灰色","h":"英语字母中的第八个字母|eɪtʃ","ha":"哈|hɑː","habit":"习惯|ˈhæbɪt","habits":"习惯|ˈhæbɪts","habitual":"习惯性的|həˈbɪtʃuəl","had":"已经|hæd; həd","hair":"毛发|her","half":"一半|hæf","hall":"礼堂|hɔːl","hamburgers":"汉堡包|ˈhæmbɜːrɡərz","hand":"手|hænd","hands":"[解剖]手|hændz","hang":"悬挂|hæŋ","hangzhou":"杭州|ˈhɑːŋˈdʒəʊ","happening":"事件|ˈhæpənɪŋ","happens":"发生|ˈhæpənz","happily":"快乐地|ˈhæpɪli","happiness":"快乐|ˈhæpinəs","happy":"快乐的|ˈhæpi","happyly":"快乐地","har":"海港咨询雷达","hard":"硬的|hɑːrd","harder":"更难的|ˈhɑːrdər","hardly":"几乎不|ˈhɑːrdli","harmful":"有害的|ˈhɑːrmf(ə)l","harry":"不断烦扰|ˈhæri","harvest":"收获|ˈhɑːvɪst","has":"有|hæz; həz","hat":"帽子|hæt","hate":"厌恶|heɪt","hats":"帽子|hæts","have":"拥有|hæv; həv","haven't":"have not 的常用口语|ˈhævnt","having":"有|ˈhævɪŋ","he":"他|hiː; hi","head":"头|hed","heal":"痊愈|hiːl","health":"身体状况|helθ","healthful":"有益于健康的|ˈhelθf(ə)l","healthly":"健康的","healthy":"健康的|ˈhelθi","hear":"听到|hɪr","heart":"心|hɑːrt","heavy":"重的|ˈhevi","hel":"赫尔","hello":"喂|həˈloʊ","help":"帮助|help","helped":"帮助|helpt","helper":"助手|ˈhelpər","helpful":"有帮助的|ˈhelpf(ə)l","helping":"一份|ˈhelpɪŋ","helps":"高端激光打印解决方案|helps","her":"她|hɜːr; hər","here":"在这里|hɪr","heritage":"遗产|ˈherɪtɪdʒ","hero":"英雄|ˈhɪroʊ","heroes":"英雄|ˈhɪroʊz","heros":"高性能路由器操作系统","hers":"她的|hɜːrz","herself":"她自己|hɜːrˈself","hevi":"人名","hide":"把藏起来|haɪd","hiding":"隐藏|ˈhaɪdɪŋ","high":"高的|haɪ","high-speed":"高速的|ˌhaɪ ˈspiːd","higher":"更高的|ˈhaɪər","highest-speed":"最高速度","hiking":"徒步旅行|ˈhaɪkɪŋ","hill":"山丘|hɪl","hills":"[地理]丘陵|hɪlz","him":"他|hɪm; ɪm","himself":"他自己|hɪmˈself","hin":"高强度噪声|hɪn","his":"他的|hɪz; ɪz","history":"历史|ˈhɪstri; ˈhɪstəri","hit":"打|hɪt","ho":"嗬|hoʊ","hold":"抓住|hoʊld","holds":"hold 的第三人称单数形式|hoʊldz","holiday":"假日|ˈhɑːlədeɪ","holidays":"每逢假日|ˈhɑːlədeɪz","home":"家|hoʊm","homes":"家庭|hoʊmz","homework":"家庭作业|ˈhoʊmwɜːrk","honest":"诚实的|ˈɒnɪst","hong":"行|hɑːŋ","hope":"希望|hoʊp","hospital":"医院|ˈhɑːspɪt(ə)l","hospitals":"[医]医院|ˈhɑːspɪtlz","host":"主人|hoʊst","hot":"热的|hɑːt","hotel":"旅馆|hoʊˈtel","hotels":"酒店|hoʊˈtel","hour":"小时|ˈaʊər","hours":"小时|ˈaʊərz","house":"房子|haʊs","houses":"住宅|ˈhaʊzɪz","housework":"家务劳动|ˈhaʊswɜːrk","how":"怎样|haʊ","hr":"小时|ˌetʃ ˈɑr","ht":"高度的缩写","huge":"庞大的|hjuːdʒ","humans":"人类|ˈhjuːmənz","hundred":"一百|ˈhʌndrəd","hundreds":"数百|ˈhʌndrədz","hungry":"感到饿的|ˈhʌŋɡri","hunter":"猎人|ˈhʌntər","hurry":"匆忙|ˈhɜːri","hurt":"使受伤|hɜːrt","hy":"亨利","hypothetical":"假设的|ˌhaɪpəˈθetɪk(ə)l","i":"英语字母 i|aɪ","i'd":"我愿意","i'll":"我将","i'm":"I am 的缩略式|aɪm","i-c-e":"冰|aɪs","ib":"国际文凭的缩写|ˌaɪ ˈbiː","ic":"集成电路|ɪk","ice":"冰|aɪs","id":"遗传素质|ˌaɪ ˈdiː","ide":"圆腹雅罗鱼|aɪd","idea":"想法|aɪˈdiːə","ie":"工业管理学|ˌaɪ ˈiː","ient":"认出","ies":"信息交流处","if":"如果|ɪf","if-clause":"条件子句|ɪf klɔːz","ig":"监察主任","il":"内层|ɪl","ill":"有病的|ɪl","illness":"疾病|ˈɪlnəs","im":"感应电动机|ɪm","image":"形象|ˈɪmɪdʒ","imagine":"想象|ɪˈmædʒɪn","imagined":"想象|ɪˈmædʒɪnd","important":"重要的|ɪmˈpɔːrt(ə)nt","impossible":"不可能的|ɪmˈpɑːsəb(ə)l","in":"在内|ɪn","include":"包含|ɪnˈkluːd","ine":"西班牙国家统计局","ing":"惯性导航与制导|ɪŋ","ink":"墨水|ɪŋk","inner":"内部的|ˈɪnər","insect":"昆虫|ˈɪnsekt","inside":"内部|ˌɪnˈsaɪd","instead":"代替|ɪnˈsted","instrument":"器械|ˈɪnstrəmənt","instruments":"仪器|ˈɪnstrʊmənts","intangible":"不可捉摸的|ɪnˈtændʒəb(ə)l","intelligence":"智力|ɪnˈtelɪdʒəns","interested":"感兴趣的|ˈɪntrəstɪd","interesting":"有趣的|ˈɪntrəstɪŋ","internet":"互联网|ˈɪntərnet","into":"到里面|ˈɪntuː","introduces":"介绍","invent":"发明|ɪnˈvent","invented":"发明|ɪnˈventɪd","invention":"发明物|ɪnˈvenʃ(ə)n","inventions":"发明物|ɪnˈvenʃnz","invitation":"邀请|ˌɪnvɪˈteɪʃ(ə)n","invite":"邀请|ɪnˈvaɪt","ion":"离子|ˈaɪənˌˈaɪɑːn","iron":"铁|ˈaɪərn","is":"是|ɪz","ise":"伊势|aɪz","island":"岛屿|ˈaɪlənd","isn't":"is not 的缩略形式|ˈɪz(ə)nt","it":"它|ɪt","it's":"它是|ɪts","its":"它的|ɪts","itself":"它自己|ɪtˈself","iz":"<非正式>is 的非标准拼写","j":"字母 j|dʒeɪ","jams":"宽短裤|dʒæmz","january":"一月|ˈdʒænjueri","japanese":"日本的|ˌdʒæpəˈniːz","japaneses":"日本的|ˌdʒæpəˈniːz","jazz":"爵士乐|dʒæz","jiu":"汉语拼音音节|ˌdʒe aɪ ˈju","job":"工作|dʒɑːb","join":"成为的一员|dʒɔɪn","joined":"加入|dʒɔɪnd","joins":"加入|dʒɔɪnz","jour":"报纸|dʒɜː(r)","journey":"旅行|ˈdʒɜːni","ju":"六月","juice":"汁|dʒuːs","july":"七月|dʒʊˈlaɪ","jumped":"跳跃|dʒʌmpt","june":"六月|dʒuːn","junk":"废旧杂物|dʒʌŋk","just":"正好|dʒʌst","k":"字母 k|keɪ","ka":"阴极|kɑː","ke":"动能","keen":"渴望的|kiːn","keenly":"敏锐地|ˈkiːnli","keep":"保持|kiːp","keeps":"保留|kiːps","kend":"肯德尔","ket":"刃|ket","key":"钥匙|kiː","keyboard":"键盘|ˈkiːbɔːrd","keyboard's":"键盘快捷键：在计算机键盘上按","keyboards":"键盘|ˈkiːbɔːdz","keywords":"关键词","kfast":"卡斯特","kids":"<非正式>小孩|kɪdz","kilogram":"千克|ˈkɪləɡræm","kilograms":"公斤|ˈkɪləɡræmz","kilometre":"千米|kɪˈlɑːmɪtər","kilometres":"[计量] kilometre|kɪˈlɑːmɪtərz","kind":"种类|kaɪnd","kinds":"种类|kaɪndz","kitchen":"厨房|ˈkɪtʃɪn","kite":"风筝|kaɪt","kites":"kite 的复数：风筝|kaɪts","kj":"千焦耳|keɪ dʒeɪ","kju":"人名","kl":"千升|ˈkeɪ ˈel","kle":"克莱因","klev":"克列文","kli":"公里","km":"公里|ˌkeɪ ˈem","kn":"海里","knife":"餐刀|naɪf","knives":"刀|naɪvz","kno":"克钦民族组织","know":"知道|noʊ","knowledge":"知识|ˈnɒlɪdʒ","known":"已知的|noʊn","kong":"杠|kɑːŋ","ks":"韩国标准|keɪz","ksi":"千磅每平方英寸","kt":"千吨","kubuqi":"库布齐沙漠：位于中国内蒙古自","kwa":"克瓦语|kwɑː","l":"字母 l|el","la":"全音阶中的第6个音|lɑː","label":"标签|ˈleɪb(ə)l","labo":"拉博","laboratory":"实验室|ləˈbɒrətri","lake":"湖|leɪk","lamp":"灯|læmp","lamps":"灯|læmps","land":"陆地|lænd","languages":"language 的复数形式|ˈlæŋɡwɪdʒ","lanterns":"灯笼|ˈlæntərnz","large":"大的|lɑːrdʒ","last":"最后的|læst","late":"晚期的|leɪt","lately":"近来|ˈleɪtli","later":"后来|ˈleɪtər","laugh":"笑|læf","ld":"检漏器","le":"语言工程|lə","lead":"引领|liːd","leads":"引线|liːdz","leaf":"叶|liːf","learn":"学习|lɜːrn","learned":"博学的|ˈlɜːrnɪd","learning":"学习|ˈlɜːrnɪŋ","least":"一点儿|liːst","leather":"皮|ˈleðər","leave":"离开|liːv","leaves":"树叶|liːvz","leaving":"离开|ˈliːvɪŋ","ledge":"岩架|ledʒ","lee":"保护|liː","left":"左边的|left","lem":"登月舱|lem","lemonade":"<英>柠檬味汽水|ˌleməˈneɪd","lend":"借给|lend","length":"长|leŋkθ; leŋθ","lent":"借给|lent","less":"更少地|les","lesson":"一节课|ˈles(ə)n","lesson's":"课例研究","lessoning":"v．上课","lessons":"课程|ˈlesnz; ˈlesənz","let":"允许|let","let's":"让我们|lets","letter":"信|ˈletər","lf":"低频","li":"轻步兵|li","librarian":"图书馆馆长|laɪˈbreriən","library":"图书馆|ˈlaɪbrəri","lie":"平躺|laɪ","life":"生命|laɪf","lighter":"打火机|ˈlaɪtər","lights":"灯|laɪts","like":"像|laɪk","liked":"喜欢|laɪkt","likes":"好恶|laɪks","liking":"嗜好|ˈlaɪkɪŋ","line":"线|laɪn","lines":"line 的复数：线|laɪnz","list":"列表|lɪst","listen":"听|ˈlɪs(ə)n","listening":"倾听|ˈlɪsnɪŋ","listens":"v．倾听","listing":"列表|ˈlɪstɪŋ","lists":"竞技场|lɪsts","little":"小的|ˈlɪt(ə)l","live":"生存|lɪv; laɪv","lived":"居住|lɪvd","lives":"生活|laɪvz; lɪvz","living":"活着的|ˈlɪvɪŋ","lj":"救生短上衣","lk":"斯里兰卡","ll":"陆上通信线|ˈelˈel","llu":"柳利","lo":"瞧|loʊ","loaf":"一条|loʊf","loaves":"一条|loʊvz","locate":"确定的位置|ˈloʊkeɪt","long":"长的|lɔːŋ","longer":"更长的|lɔːŋɡər","longest":"最长的|ˈlɔːŋɡɪst","look":"看|lʊk","looked":"看|lʊkt","looks":"相貌|lʊks","loon":"潜鸟|luːn","lose":"遗失|luːz","losing":"失败|ˈluːzɪŋ","lost":"迷路的|lɔːst","lot":"一群|lɑːt","lots":"<非正式>大量|lɑːts","lotus":"莲属植物|ˈloʊtəs","loudly":"大声地|ˈlaʊdli","love":"喜爱|lʌv","loved":"爱|lʌvd","lovely":"可爱的|ˈlʌvli","loves":"爱|lʌvz","low":"低的|loʊ","lower":"较下的|ˈloʊər","lowest":"最低的|ˈloʊɪst","lp":"密纹唱片|ˌel ˈpiː","lt":"书信电报|ɪt","lu":"手太阴肺经|ˈlʌ","luca":"卢卡","luck":"幸运|lʌk","lucky":"幸运的|ˈlʌki","lucy":"露西|ˈluːsi","lucy's":"露西·夏皮罗（露西尔·夏皮罗","lunch":"午餐|lʌntʃ","lwe":"勒韦","ly":"利比亚|li","m":"米|em","ma":"妈|mɑː","macao":"澳门|məˈkaʊ","machine":"机器|məˈʃiːn","machines":"机器|məˈʃiːnz","made":"构成的|meɪd","magic":"魔法|ˈmædʒɪk","main":"主要的|meɪn","mainly":"主要地|ˈmeɪnli","make":"制造|meɪk","makes":"做|meɪks","making":"制作|ˈmeɪkɪŋ","male":"男性的|meɪl","mall":"购物中心|mɔːl","man":"成年男子|mæn","man-made":"人造的|ˌmæn ˈmeɪd","manage":"管理|ˈmænɪdʒ","many":"许多|ˈmeni","map":"地图|mæp","marathon":"马拉松赛跑|ˈmærəθɑːn","march":"齐步走|mɑːrtʃ","mark":"痕迹|mɑːrk","marked":"明显的|mɑːrkt","market":"集市|ˈmɑːrkɪt","markets":"市场|ˈmɑːrkɪts","mars":"火星|mɑːrz","match":"比赛|mætʃ","matches":"比赛|mætʃɪz","maths":"数学|mæθs","may":"可能|meɪ","maybe":"大概|ˈmeɪbi","mays":"玉米|meɪz","mb":"兆位|ˌem ˈbiː","me":"我|miː; mi","meal":"一餐|miːl","meals":"一餐|miːlz","mean":"意味着|miːn","meaning":"意思|ˈmiːnɪŋ","means":"手段|miːnz","meant":"意味|ment","medal":"奖牌|ˈmedl","medicine":"药物|ˈmedɪs(ə)n","medl":"n. 混合","medsn":"医学电子学与数据学会（Med","meet":"结识|miːt","meeting":"会议|ˈmiːtɪŋ","members":"成员|ˈmembər","ment":"的结果或手段|mənt","mentions":"提到|ˈmenʃnz","menu":"菜单|ˈmenjuː","mess":"肮脏|mes","messily":"乱糟糟地","messy":"脏的|ˈmesi","met":"遇见|met","metaphor":"隐喻|ˈmetəfər","method":"方法|ˈmeθəd","metres":"metre 的复数：米","mft":"任务数固定的多道系统","mi":"我|miː","mice":"老鼠|maɪs","mid":"中间的|mɪd","mid-autumn":"中秋的|mɪd ˈɔːtəm","middle":"中间的|ˈmɪd(ə)l","milk":"奶|mɪlk","million":"一百万|ˈmɪljən","millions":"数百万","mine":"我的|maɪn","ming":"明朝|mɪŋ","minute":"分|ˈmɪnɪt","minute's":"快熟薄牛排","minutes":"分钟|ˈmɪnɪts","mirror":"镜子|ˈmɪrər","mis":"米斯|ˌem aɪ ˈes","miss":"女士|mɪs","missing":"找不到的|ˈmɪsɪŋ","mission":"任务|ˈmɪʃn","mistake":"错误|mɪˈsteɪk","mistakes":"错误|mɪˈsteɪks","misunderstands":"v．误解","mix":"混合|mɪks","mixes":"混合物|ˈmɪksɪz","mju":"多个的","ml":"机器语言|mɪl","mli":"识别器指示灯","mn":"磁北","mobile":"活动的|ˈmoʊbəl","model":"模型|ˈmɑːd(ə)l","modern":"近代的|ˈmɑːdərn","moment":"片刻|ˈmoʊmənt","monday":"星期一|ˈmʌndeɪ; ˈmʌndi","monetary":"货币的|ˈmɑːnɪteri","money":"钱|ˈmʌni","mongolia":"蒙古|mɑːŋˈɡoʊliə","month":"月|mʌnθ","months":"月份|mʌnθs","mood":"心境|muːd","moon":"月亮|muːn","mooncakes":"月饼|ˈmuːnkeɪk","moonlight":"月光|ˈmuːnlaɪt","more":"更多的|mɔːr","morning":"早晨|ˈmɔːrnɪŋ","most":"最多|moʊst","mother":"母亲|ˈmʌðər","mountain":"山|ˈmaʊnt(ə)n","mountains":"山脉|ˈmaʊntnz","mouse":"老鼠|maʊs","move":"改变位置|muːv","moved":"感动的|muːvd","moves":"移动|muːvz","movie":"<美>电影|ˈmuːvi","movies":"<美>电影|muvɪz","moving":"动人的|ˈmuːvɪŋ","mp":"国会议员|ˌem ˈpiː","mpl":"数学编程语言","mr":"先生|ˈmɪstər","ms":"毫秒|ˌem ˈes","mte":"最大热能","mu":"希腊语的第12个字母|mjuː","much":"许多|mʌtʃ","multiple":"多个的|ˈmʌltɪp(ə)l","mum":"妈妈|mʌm","muscles":"肌肉|ˈmʌslz","museum":"博物馆|mjuˈziːəm","museums":"博物馆|mjʊˈzɪəm","music":"音乐|ˈmjuːzɪk","musical":"音乐的|ˈmjuːzɪk(ə)l","musician":"音乐家|mjuˈzɪʃ(ə)n","musicians":"音乐家|mjuˈzɪʃənz","must":"必须|mʌst; məst","musting":"必须|mʌst; məst","mustn't":"不能|ˈmʌsnt","musts":"<非正式>必不可少的事物","mutual":"相互的|ˈmjuːtʃuəl","my":"我的|maɪ","mys":"马来西亚","myself":"我自己|maɪˈself","mystery":"谜|ˈmɪstri","mz":"莫桑比克","n":"英语字母的第十四个字母|en","nail":"钉子|neɪl","nails":"钉子|neɪlz","nal":"<美>国家加速器实验室","name":"名字|neɪm","named":"命名的|neɪmd","names":"名字|neɪmz","nanjing":"南京|ˈnɑːnˈdʒɪŋ","natural":"天然的|ˈnætʃ(ə)rəl","naut":"nautical 的缩写：船","nce":"新天主教版本","nd":"国债","nda":"新药申请","ndk":"核苷二磷酸激酶","ne":"尼日尔|en iː","near":"距离不远|nɪr","nearby":"附近的|ˌnɪrˈbaɪ","nearest":"最近的|ˈnɪrəst","neat":"整齐的|niːt","need":"需要|niːd","needn't":"need not 的缩略形式|ˈnidnt","needs":"需要|niːdz","negatives":"底片|ˈneɡətɪvz","nei":"别处不含","neighbor":"邻居|ˈneɪbə","neighborhood":"街区|ˈneɪbərhʊd","neighbors":"街坊邻里|ˈnebəz","neighbour":"邻居|ˈneɪbər","neighbours":"邻居|ˈneɪbərz","neither":"两者都不|ˈniːðər","ner":"核苷酸切除修复","nervous":"紧张的|ˈnɜːvəs","nest":"窝|nest","never":"决不|ˈnevər","new":"新出现的|nuː","newest":"最新的|njuɪst","newspaper":"报纸|ˈnuːzpeɪpər","next":"下一个的|nekst","ney":"奈伊笛|neɪ","ng":"窄轨距","nger":"恩吉鲁穆德是太平洋岛国帕劳的","ni":"国民保险制度|ˌen ˈaɪ","nic":"网络接口卡|ɛn aɪ si","nice":"美好的|naɪs","nient":"全无","night":"夜间|naɪt","nine":"九|naɪn","nj":"新泽西","nm":"新墨西哥","no":"不|noʊ","nobody":"没有人|ˈnoʊbɑːdi","noisy":"嗓门大的|ˈnɔɪzi","none":"全无|nʌn","noodles":"面条|ˈnuːd(ə)lz","noon":"正午|nuːn","nor":"也不|nɔːr","north":"北|nɔːrθ","not":"表示否定|nɑːt","note":"短笺|noʊt","notes":"指出|noʊts","nothing":"没有什么|ˈnʌθɪŋ","noun":"名词|naʊn","november":"十一月|noʊˈvembər","now":"现在|naʊ","ns":"毫微秒","nstr":"氮","nt":"加拿大西北地区","ntli":"电路杂音干扰","ntm":"喷管试验发动机","ntr":"正常贸易关系","nts":"不按比例","nu":"希腊字母第13字|njuː","number":"数字|ˈnʌmbər","nurses":"护士|ˈnɜːrsɪz","nz":"新西兰|en zi","o":"哦|oʊ","o'clock":"点钟|əˈklɑːk","object":"物体|ˈɑːbdʒekt; ˈɑːbdʒekt; əbˈdʒekt","oc":"检查局","occasion":"时刻|əˈkeɪʒn","october":"[天] 十月|ɑːkˈtoʊbər","oe":"奥风|oʊ","of":"的|ʌv; əv","off":"离开|ɔːf","offer":"提供|ˈɔːfər","offers":"提供","office":"办公室|ˈɑːfɪs","often":"常常|ˈɔːf(ə)n","oh":"哎呀|oʊ","ok":"好的|oʊˈkeɪ","old":"岁的|oʊld","oldest":"最年长的|ˈoʊldɪst","om":"唵|ˌoʊ ˈem","on":"在上|ɑːn","once":"一次|wʌns","one":"一|wʌn","one's":"某人的|wʌnz","ones":"用作复数代词|wʌnz","oneself":"自己|wʌnˈself","onion":"洋葱|ˈʌnjən","online":"在线的|ˌɑːnˈlaɪn","only":"只|ˈoʊnli","oo":"面向对象|ˌuˈɜːr","oom":"伯父|um","oon":"面向对象的数值计算","open":"开放的|ˈoʊpən","open-ended":"开放式的|ˌoʊpən ˈendɪd","opened":"open 的过去式和过去分词|ˈoʊpənd","opening":"洞|ˈoʊpənɪŋ","opens":"开","opera":"歌剧演出|ˈɑːprə","opinion":"意见|əˈpɪnjən","or":"或|ɔːr","oracle":"牧师|ˈɔrəkl","orange":"橙红色的|ˈɔːrɪndʒ","oranges":"柑桔|ˈɔːrɪndʒɪz","order":"顺序|ˈɔːrdər","orm":"对象关系映射","other":"别的|ˈʌðər","others":"其他人|ˈʌðər","ou":"开放大学|oʊ","ought":"应该|ɔːt","our":"我们的|ˈaʊər; ɑːr","ours":"我们的|ˈaʊərz","ous":"牛津大学协会|əs","out":"出现|aʊt","outside":"外表|ˌaʊtˈsaɪd","over":"向下|ˈoʊvər","ow":"哦|aʊ","own":"有|oʊn","p":"磷|piː","p's":"P 选择素","pa":"爸爸|pɑː","packets":"小包|ˈpækɪts","paid":"有偿的|peɪd","pain":"疼痛|peɪn","paint":"油漆|peɪnt","painter":"画家|ˈpeɪntər","painting":"绘画|ˈpeɪntɪŋ","paints":"涂料|peɪnts","pair":"一对|per","pairs":"一对|perz","pal":"<非正式>朋友|pæl","palace":"宫殿|ˈpæləs","pan":"平底锅|pæn","pancakes":"薄煎饼","panda":"熊猫|ˈpændə","panda's":"熊猫皮","pandas":"panda 的复数形式|ˈpændəz","paper":"纸|ˈpeɪpər","parcel":"<英>包裹|ˈpɑːrs(ə)l","parcels":"parcel 的复数：包裹|ˈpɑːrslz","parent":"父亲|ˈperənt","parents":"父母|ˈperənts","park":"公园|pɑːrk","parked":"停放|pɑːkt","parking":"停车|ˈpɑːrkɪŋ","part":"部分|pɑːrt","parts":"部分|pɑːrts","party":"聚会|ˈpɑːrti","pas":"舞步|pɑː; pɑːz","pass":"经过|pæs","passage":"过道|ˈpæsɪdʒ","passenger":"乘客|ˈpæsɪndʒə","passengers":"乘客|ˈpæsndʒər","past":"过去的|pæst","pasta":"意大利面食|ˈpɑːstə","path":"小径|pæθ","patience":"耐心|ˈpeɪʃ(ə)ns","patient":"能忍耐的|ˈpeɪʃ(ə)nt","pattern":"模式|ˈpætərn","patterns":"模式|ˈpætərn","pay":"支付|peɪ","paying":"支付|ˈpeɪɪŋ","payment":"付款|ˈpeɪmənt","pays":"支付|peɪz","pe":"体育课|ˌpiː ˈiː","peach":"桃子|piːtʃ","peak":"巅峰|piːk","peaks":"山顶|piːks","peking":"北京的旧式英文名称|ˈpiːkɪŋ","pen":"笔|pen","pencil":"铅笔|ˈpens(ə)l","pencils":"铅笔|ˈpenslz","pens":"钢笔|penz","people":"人|ˈpiːp(ə)l","per":"每|pər","perfect":"无瑕的|ˈpɜːrfɪkt","performed":"演出|pərˈfɔːrmd","period":"一段时间|ˈpɪriəd","person":"人|ˈpɜːrs(ə)n","personal":"个人的|ˈpɜːrsən(ə)l","personality":"个性|ˌpɜːrsəˈnæləti","pet":"宠物|pet","petrol":"<英>汽油|ˈpetrəl","phin":"惯性自动导航仪","phone":"电话|foʊn","phones":"电话|fəʊnz","photo":"照片|ˈfoʊtoʊ","photoes":"摄影短文","photograph":"照片|ˈfoʊtəɡræf","photography":"摄影|fəˈtɑːɡrəfi","photos":"照片|ˈfoʊtoʊz","phrase":"短语|freɪz","physical":"身体的|ˈfɪzɪk(ə)l","pi":"产品改进|paɪ","piano":"钢琴|piˈænoʊ","pic":"<非正式>照片|pɪk","pick":"采|pɪk","picnic":"野餐|ˈpɪknɪk","picture":"图片|ˈpɪktʃər","pictures":"图片|ˈpɪktʃərz","piece":"块|piːs","pieces":"piece 的复数形式：块|ˈpiːsɪz","pilot":"飞行员|ˈpaɪlət","pilots":"飞行员|ˈpaɪləts","ping":"乒乓的声响|pɪŋ","pirates":"海盗|ˈpaɪrəts","pj":"拍焦耳","pl":"分界线|ˌpiː ˈel","pla":"中国人民解放军","place":"地点|pleɪs","placed":"place 的过去式和过去分|pleɪst","places":"地点|ˈpleɪsɪz","plain":"无装饰的|pleɪn","plan":"规划|plæn","plane":"飞机|pleɪn","planes":"飞机|pleɪnz","planet":"行星|ˈplænɪt","plans":"计划|plænz","plant":"植物|plænt","planted":"栽种|ˈplɑːntɪd","plastic":"塑料|ˈplæstɪk","plat":"高原|plæt","platform":"站台|ˈplætfɔːm","play":"玩|pleɪ","played":"演奏|pleɪd","player":"运动员|ˈpleɪər","playground":"操场|ˈpleɪɡraʊnd","playing":"比赛|ˈpleɪɪŋ","plays":"戏剧|pleɪz","please":"好吗|pliːz","pleasure":"快乐|ˈpleʒər","plenty":"富裕|ˈplenti","plore":"探索性展览品|plɔː","plural":"复数|ˈplʊrəl","plus":"加|plʌs","po":"夜壶|ˌpiː ˈoʊ","pocket":"衣袋|ˈpɑːkɪt","poet":"诗人|ˈpoʊət","point":"观点|pɔɪnt","points":"点|pɔɪnts","pol":"油料|pɑːl","police":"警察部门|pəˈliːs","policeman":"警察|pəˈliːsmən","polite":"有礼貌的|pəˈlaɪt","pollution":"污染|pəˈluːʃn","pool":"游泳池|puːl","popcorn":"爆米花|ˈpɑːpkɔːrn","popular":"受大众喜爱的|ˈpɑːpjələr","possible":"可能的|ˈpɑːsəb(ə)l","post":"<英>邮政|poʊst","poster":"海报|ˈpoʊstər","postman":"邮递员|ˈpoʊstmən","pot":"锅|pɑːt","potter":"陶艺家|ˈpɑːtər","power":"控制力|ˈpaʊər","pp":"过去分词","pr":"公共关系|ˌpiː ˈɑːr","pra":"涂料研究协会","prac":"公共关系咨询委员会","practice":"实践|ˈpræktɪs","practise":"练习|ˈpræktɪs","practised":"熟练的|ˈpræktɪst","practising":"积极履行义务的|ˈpræktɪsɪŋ","pre":"在之前|prɪ","prefer":"更喜爱|prɪˈfɜːr","prepare":"使做好准备|prɪˈper","prepared":"有准备的|prɪˈperd","preparing":"准备|prɪˈpeərɪŋ","preposition":"介词|ˌprepəˈzɪʃ(ə)n","present":"礼物|ˈpreznt","preznt":"<旧>徒弟","price":"价格|praɪs","prices":"价格|ˈpraɪsɪz","primary":"主要的|ˈpraɪmeri","prise":"<英>强行使分开|praɪz","prize":"奖品|praɪz","prizes":"奖品|ˈpraɪzɪz","pro":"<非正式>专业人士|proʊ","problem":"问题|ˈprɑːbləm","program":"程序|ˈproʊɡræm","programme":"计划|ˈproʊɡræm","progress":"进步|ˈprɑːɡres","project":"项目|ˈprɑːdʒekt; prəˈdʒekt","pronounced":"明显的|prəˈnaʊnst","pronunciation":"发音方法|prəˌnʌnsiˈeɪʃ(ə)n","protect":"保护|prəˈtekt","protecting":"保护的|prəˈtektɪŋ","proud":"自豪的|praʊd","ps":"附言|ˌpiː ˈes","pt":"铂金|ˌpiː ˈtiː","public":"公众的|ˈpʌblɪk","pulling":"拉|ˈpʊlɪŋ","pulls":"v．拉","puppet":"木偶|ˈpʌpɪt","puppeteer":"操纵木偶的人|ˌpʌpɪˈtɪr","puppetry":"木偶戏|ˈpʌpɪtri","puppets":"木偶","purpose":"目的|ˈpɜːrpəs","put":"放|pʊt","puts":"放置|pʊts","py":"巴拉圭|ˈpaɪ","pyr":"丙酮酸钙","pyramid":"金字塔|ˈpɪrəmɪd","pyramids":"pyramid 的复数：金字|ˈpɪrəmɪdz","qing":"清","qr":"二维码","qu":"合格单位|kw","question":"问题|ˈkwestʃən","questions":"问题|ˈkwestʃənz","quick":"迅速的|kwɪk","quicker":"更快的|ˈkwɪkər","quickest":"最快的|ˈkwɪkɪst","quickly":"快速地|ˈkwɪkli","quiet":"轻声的|ˈkwaɪət","quieter":"更安静的|ˈkwaɪətər","r":"英语字母中的第十八个字母|ɑːr","ra":"皇家学院|ˈrɑː","race":"赛跑|reɪs","raced":"比赛","races":"竞赛|ˈreɪsɪz","racing":"以速度争胜的竞赛|ˈreɪsɪŋ","radio":"收音机|ˈreɪdioʊ","rail":"铁路系统|reɪl","railway":"铁路|ˈreɪlweɪ","railways":"铁路|ˈrelˌwe","rain":"雨|reɪn","rainy":"多雨的|ˈreɪni","ran":"跑|ræn","rather":"颇|ˈræðər","re":"关于|riː","reach":"到达|riːtʃ","reached":"抵达|riːtʃt","reaches":"到达|ˈriːtʃɪz","reaching":"到达|ˈriːtʃɪŋ","read":"阅读|riːd","readed":"<非规范>阅读","reading":"阅读|ˈriːdɪŋ","reads":"read 的第三人称单数现在|riːdz","ready":"准备好的|ˈredi","real":"实际存在的|ˈriːəl","really":"真正地|ˈriːəli","reason":"原因|ˈriːz(ə)n","rec":"娱乐|rek","receipt":"发票|rɪˈsiːt","receive":"得到|rɪˈsiːv","recently":"最近|ˈriːs(ə)ntli","recognize":"认识|ˈrekəɡnaɪz","recyclable":"可回收利用的|ˌriːˈsaɪkləbl","recycle":"回收利用|ˌriːˈsaɪkl","red":"红的|red","regular":"定期的|ˈreɡjələr","relationship":"关系|rɪˈleɪʃ(ə)nʃɪp","relative":"亲戚|ˈrelətɪv","relatives":"亲属|ˈrelətɪvz","relax":"休息|rɪˈlæks","remember":"回想起|rɪˈmembər","reports":"报告|rɪˈpɔːrts","requires":"需要|rɪˈkwaɪrz","res":"物|ˈrez","rescue":"营救|ˈreskjuː","rescued":"rescue 的过去式和过去|ˈreskjuːd","research":"研究|ˈriːsɜːrtʃ","reskju":"已判决的事项：在有管辖权的法","rest":"休息|rest","restaurant":"餐馆|ˈrestrɑːnt","restaurants":"餐厅|ˈrestərənt","returned":"return 的过去式和过去|rɪˈtɜːrnd","reunion":"聚会|ˌriːˈjuːniən","rg":"角速度陀螺仪","ri":"罗得岛州","rice":"稻|raɪs","rich":"有钱的|rɪtʃ","richer":"rich 的比较级：更富有的|ˈrɪtʃər","ride":"骑马|raɪd","riders":"骑手|ˈraɪdərz","rides":"摩天轮|raɪdz","riding":"骑马|ˈraɪdɪŋ","right":"符合道德的|raɪt","ring":"戒指|rɪŋ","rious":"暴动","rise":"增加|raɪz","river":"河|ˈrɪvər","rivers":"里弗斯|ˈrɪvəz","rney":"放射性核素食管造影照片","ro":"只接收","road":"路|roʊd","roads":"道路|roʊdz","roast":"炙|roʊst","robot":"机器人|ˈroʊbɑːt","robots":"机器人|ˈroʊbɑːts","rock":"岩石|rɑːk","rocket":"火箭|ˈrɒkɪt","rocks":"[岩]岩石|rɒks","rode":"骑|roʊd","roofs":"屋顶|ruːfs","room":"房间|ruːm","rooms":"房间|ruːmz; rʊmz","round":"圆形的|raʊnd","rous":"劳斯","routine":"常规|ruːˈtiːn","row":"一排|roʊ","rr":"无线电航向信标","ru":"橄榄球协会","rubbish":"垃圾|ˈrʌbɪʃ","rule":"规章|ruːl","ruled":"有横格的|ruːld","ruler":"统治者|ˈruːlər","rules":"规章|ruːlz","ruling":"裁决|ˈruːlɪŋ","run":"跑|rʌn","running":"跑步|ˈrʌnɪŋ","runs":"run 的第三人称单数形式：|rʌnz","rural":"农村的|ˈrʊrəl","rv":"娱乐车|ˌɑːr ˈviː","ry":"铁路|ri","s":"字母 s|es","sa":"救世军","sad":"伤心的|sæd","safe":"安全的|seɪf","safely":"安全地|ˈseɪfli","safer":"更安全的|ˈseɪfər","said":"<法律>上述的|sed","sailed":"航行|seɪld","salad":"沙拉|ˈsæləd","sale":"出售|seɪl","salt":"盐|sɔːlt","salty":"咸的|ˈsɔːlti","same":"同一的|seɪm","sand":"沙|sænd","sandcas":"沙堡","sandcastle":"沙堡|ˈsændkɑːsl","sandstorms":"沙尘暴","sandwich":"三明治|ˈsænwɪtʃ","sandwiches":"三明治|ˈsænwɪtʃɪz; ˈsænwɪdʒɪz","sang":"唱|sæŋ","sat":"坐|sæt","saturday":"星期六|ˈsætərdeɪ","saur":"阿富汗太阳历二月","save":"救助|seɪv","saved":"获救的|seɪvd","saving":"节约|ˈseɪvɪŋ","saw":"锯|sɔː","say":"说|seɪ","says":"说|sez","sb":"某人|ˈsʌmbədi","scan":"扫描|skæn","scanned":"扫描|skænd","scanning":"扫描|ˈskænɪŋ","scans":"网络系统自动程序控制|skænz","scarf":"围巾|skɑːrf","scenery":"风景|ˈsiːnəri","sch":"时间表","school":"学校|skuːl","schools":"学校|skuːlz","science":"科学|ˈsaɪəns","scientist":"科学家|ˈsaɪəntɪst","scientists":"科学家|ˈsaɪəntɪsts","scissors":"剪刀|ˈsɪzərz","scope":"范围|skoʊp","screen":"屏幕|skriːn","screens":"屏幕|skriːnz","se":"东南|ˌes ˈiː","sea":"海洋|siː","seaside":"海边|ˈsiːsaɪd","season":"季节|ˈsiːz(ə)n","seasons":"季节|ˈsiːznz","seat":"座位|siːt","seats":"座椅|siːts","second":"第二|ˈsekənd","see":"看见|siː","seeds":"种子|siːdz","seek":"寻找|siːk","sel":"系统事件日志|sel","seldom":"不常|ˈseldəm","self":"自己|self","sell":"出让|sel","seller":"卖方|ˈselər","selling":"销售|ˈselɪŋ","sells":"卖|selz","sen":"仙|sen","send":"邮寄|send","sending":"发送|ˈsendɪŋ","sends":"发送|sendz","sent":"送|sent","sentence":"句子|ˈsentəns","september":"九月|sepˈtembər","ses":"工程科学学会","set":"放|set","seven":"七|ˈsev(ə)n","seventeen":"十七|ˌsev(ə)nˈtiːn","seventy":"七十|ˈsev(ə)nti","several":"不同的|ˈsevrəl","sh":"嘘|ʃ","shade":"背阴处|ʃeɪd","shadow":"阴影|ˈʃædoʊ","shadows":"阴影|ˈʃædəʊz","shake":"摇动|ʃeɪk","shanghai":"<非正式>强迫或诱骗去做某事|ˌʃæŋˈhaɪ","shape":"形状|ʃeɪp","shapes":"形状|ʃeɪps","share":"共享|ʃer","shared":"分享的|ʃerd","she":"她|ʃiː; ʃi","sheep":"羊|ʃiːp","sheeps":"<非规范","sheet":"床单|ʃiːt","shelf":"搁板|ʃelf","shelves":"架子|ʃelvz","shine":"发光|ʃaɪn","shines":"发光|ʃaɪnz","ship":"船|ʃɪp","ships":"船|ʃɪps","sho":"超高输出|ʃoʊ","shoes":"鞋子|ʃuːz","shoot":"开|ʃuːt","shop":"商店|ʃɑːp","shopkeepers":"店主","shopping":"购物|ˈʃɒpɪŋ","shops":"商店|ʃɑːps","short":"短暂的|ʃɔːrt","shorter":"较短的|ˈʃɔːrtər","should":"应该|ʃʊd; ʃəd","shouldn't":"should not 的缩约|ˈʃudnt","shout":"叫嚷|ʃaʊt","show":"显示|ʃoʊ","showed":"显示|ʃoʊd","shower":"淋浴器|ˈʃaʊər","showing":"放映|ˈʃoʊɪŋ","shown":"show 的过去分词|ʃoʊn","shows":"显示|ʃoʊz","shut":"关闭|ʃʌt","si":"火花塞点火|ˌes ˈaɪ","sichuan":"四川省","sick":"生病的|sɪk","side":"一旁|saɪd","sides":"边|saɪdz","sig":"签名|sɪɡ","sight":"视力|saɪt","signal":"信号|ˈsɪɡnəl","silence":"寂静|ˈsaɪləns","silent":"寂静的|ˈsaɪlənt","silk":"丝绸|sɪlk","silly":"愚蠢的|ˈsɪli","simple":"简单的|ˈsɪmp(ə)l","since":"自以后|sɪns","sing":"唱|sɪŋ","single":"单一的|ˈsɪŋɡ(ə)l","sings":"唱|sɪŋz","sion":"锡安|ˈsaɪən","sis":"姐妹|sɪs","sister":"姐姐|ˈsɪstər","sister's":"姊妹学校：通常指的是一对学校","sit":"坐下|sɪt","situation":"情况|ˌsɪtʃuˈeɪʃ(ə)n","six":"六|sɪks","six-month":"半年的","sixty":"六十|ˈsɪksti","sk":"袋","skating":"滑冰|ˈskeɪtɪŋ","skilled":"熟练的|skɪld","skins":"皮肤|skɪnz","skirts":"裙子|skɜːrts","skra":"斯克雷林人","sky":"天|skaɪ","sl":"海平面","sleep":"睡|sliːp","sleeping":"睡觉|ˈsliːpɪŋ","slept":"睡觉|slept","slow":"低速的|sloʊ","slower":"较慢的|ˈsloʊər","slowly":"缓慢地|ˈsloʊli","small":"小型的|smɔːl","smart":"聪明的|smɑːrt","smell":"气味|smel","smells":"气味|smelz","smile":"微笑|smaɪl","smiled":"微笑|smaɪld","sn":"顺序号","snow":"雪|snoʊ","snowman":"雪人|ˈsnəʊmæn","snowy":"多雪的|ˈsnoʊi","so":"如此|soʊ","soap":"肥皂|soʊp","sock":"短袜|sɑːk","socks":"袜子|sɒks","sofa":"沙发|ˈsoʊfə","soft":"易弯曲的|sɔːft","soil":"泥土|sɔɪl","sol":"溶胶|soʊl","sold":"卖|soʊld","soldier":"士兵|ˈsəʊldʒə","soldiers":"士兵|ˈsoʊldʒərz","solve":"解决|sɑːlv","some":"若干|sʌm; səm","somebody":"某人|ˈsʌmbɑːdi","someone":"有人|ˈsʌmwʌn","something":"某事|ˈsʌmθɪŋ","sometimes":"有时|ˈsʌmtaɪmz","somewhere":"在某处|ˈsʌmwer","song":"歌|sɔːŋ","songs":"歌曲|sɔːŋz","soon":"很快|suːn","sooner":"更快地|ˈsuːnər","sorry":"抱歉的|ˈsɑːri","sort":"种类|sɔːrt","sorters":"从事分类的人|ˈsɔːrtər","sorting":"整理|ˈsɔːrtɪŋ","sorts":"种类|sɔːrts","sounds":"声音|saʊndz","soup":"汤|suːp","south":"南|saʊθ","space":"空间|speɪs","speak":"谈话|spiːk","speaker":"发言者|ˈspiːkər","speaking":"说话|ˈspiːkɪŋ","special":"特殊的|ˈspeʃ(ə)l","speciality":"特色菜|ˌspeʃiˈæləti","specially":"专门地|ˈspeʃəli","specials":"特价商品或降价促销|ˈspeʃlz","specific":"明确的|spəˈsɪfɪk","speed":"速度|spiːd","spell":"一段时间|spel","spelled":"拼写|speld","spelling":"拼写|ˈspelɪŋ","spend":"度过|spend","spends":"spend 的第三人称单数现","sper":"特征值周期","spl":"声压级","spoon":"匙|spuːn","sports":"体育运动的|spɔːrts","spr":"战略石油储备","spread":"展开|spred","spreaded":"<非规范> spread 的","spreads":"传播|spredz","spring":"春天|sprɪŋ","square":"正方形的|skwer","ss":"卫星系统|ˌes ˈes","st":"Street的缩写|ˌes ˈtiː","stadium":"体育场|ˈsteɪdiəm","stand":"站|stænd","standing":"永久的|ˈstændɪŋ","stands":"看台|stændz","star":"星|stɑːr","stars":"明星类|stɑːrz","start":"开始|stɑːrt","started":"开始|ˈstɑːrtɪd","starting":"开始|ˈstɑrtɪŋ","starts":"开始|stɑːrts","state":"状态|steɪt","statements":"statement 的复数：|ˈsteɪtmənts","states":"状态|steɪts","station":"车站|ˈsteɪʃ(ə)n","stations":"车站|ˈsteɪʃnz","stay":"停留|steɪ","stayed":"stay 的过去式和过去分词|steɪd","steal":"偷窃|stiːl","steel":"钢|stiːl","step":"迈步|step","sth":"某物","stick":"粘|stɪk","sticks":"棍|stɪks","still":"还|stɪl","stone":"石头|stoʊn","stones":"小石头|stoʊnz","stood":"站立|stʊd","stop":"停止|stɑːp","stopped":"停止|stɑːpt","stopping":"填充料|ˈstɑːpɪŋ","stories":"故事|ˈstɔːriz","story":"故事|ˈstɔːri","storybooks":"故事书|ˈstɔːribʊk","str":"潜艇用热中子反应堆","straw":"麦秆|strɔː","street":"街道|striːt","streets":"街道|striːts","stress":"精神压力|stres","stri":"史密森尼热带研究所","strict":"要求严格的|strɪkt","strike":"击|straɪk","strong":"强壮的|strɔːŋ","structure":"结构|ˈstrʌktʃər","student":"学生|ˈstuːd(ə)nt","students":"学生|ˈstjʊdnts","study":"研究|ˈstʌdi","studying":"学习|ˈstʌdiɪŋ","su":"SU锶单位的缩写|suː","subject":"主题|ˈsʌbdʒekt","subjunctive":"虚拟式|səbˈdʒʌŋktɪv","subway":"<美>地铁|ˈsʌbweɪ","suc":"往下","success":"成功|səkˈses","such":"如此的|sʌtʃ","sugar":"食糖|ˈʃʊɡər","suggestions":"民众意见箱","summary":"总结|ˈsʌməri","summer":"夏天|ˈsʌmər","sun":"太阳|sʌn","sunday":"星期日|ˈsʌndeɪ","sundays":"每星期日|ˈsʌndez","sunny":"阳光充足的|ˈsʌni","sunset":"日落|ˈsʌnset","sunshine":"阳光|ˈsʌnʃaɪn","superlative":"最高级的|suːˈpɜːrlətɪv","supermarket":"超级市场|ˈsuːpərmɑːrkɪt","supermarkets":"超级市场","superpower":"超级大国|ˈsuːpərpaʊər","superpowers":"超级大国","sur":"根据|sɜːr","sure":"确信的|ʃʊr","surprise":"惊讶|səˈpraɪz","suzhou":"苏州","sv":"支援车|es viː","sw":"西南|es ˈdʌbljuː","sweep":"打扫|swiːp","sweet":"含糖的|swiːt","sweets":"糖果|swiːts","swim":"游泳|swɪm","swimming":"游泳|ˈswɪmɪŋ","switch":"开关|swɪtʃ","syllable":"音节|ˈsɪləb(ə)l","system":"系统|ˈsɪstəm","systems":"系统|ˈsɪstəmz","t":"氚|tiː","ta":"谢谢|tɑː","table":"桌子|ˈteɪbl","tablet":"药片|ˈtæblət","take":"携带|teɪk","taken":"拿|ˈteɪkən","takes":"take 的第三人称单数现在|teɪks","taking":"取得|ˈteɪkɪŋ","tal":"塔尔|tɑːl","talk":"说话|tɔːk","talked":"talk 的过去式和过去分词|tɔːkt","talking":"说话的|ˈtɔːkɪŋ","talks":"会谈|tɔːks","tall":"高的|tɔːl","taller":"更高的|ˈtɔːlər","tant":"同等的","tap":"轻拍|tæp","taps":"<英>水龙头|tæps","tar":"焦油|tɑːr","target":"目标|ˈtɑːrɡɪt","taste":"味道|teɪst","tastes":"味道|teɪsts","tasty":"美味的|ˈteɪsti","taught":"教|tɔːt","tax":"税款|tæks","taxi":"出租车|ˈtæksi","taxis":"出租车|ˈtæksɪs; ˈtæksiz","tb":"肺结核|ˌtiː ˈbiː","te":"大调音阶的第7音|tiː","tea":"茶|tiː","teach":"教授|tiːtʃ","teacher":"教师|ˈtiːtʃər","teachers":"教师|ˈtiːtʃərz","teaches":"教育|ˈtiːtʃɪz","teaching":"教学工作|ˈtiːtʃɪŋ","team":"队|tiːm","teapot":"茶壶|ˈtiːpɑːt","tear":"撕碎|ter; tɪ(ə)r","tect":"高效控制技术","teer":"跨上皮电阻","teeth":"牙齿|tiːθ","tekt":"美国泰克","tel":"试验仪器清单|tel","telephone":"电话通讯系统|ˈtelɪfoʊn","telescope":"望远镜|ˈtelɪskəʊp","television":"电视|ˈtelɪvɪʒ(ə)n","tell":"告诉|tel","tells":"告诉|telz","template":"模板|ˈtemplət","temple":"庙宇|ˈtemp(ə)l","ten":"十个|ten","tense":"紧张的|tens","tenses":"使拉紧|ˈtensɪz","term":"词语|tɜːrm","test":"测验|test","tests":"测验|tests","tf":"法国南部","th":"真实航向|tiː ˈeɪtʃ","than":"比|ðæn; ðən","thank":"感谢|θæŋk","thanks":"谢意|θæŋks","thanksgiving":"感恩|ˌθæŋksˈɡɪvɪŋ","that":"那|ðæt","the":"这|ðə; ði","theatre":"剧场|ˈθiːətər","their":"他们的|ðer; ðər","them":"他们|ðem; ðəm","then":"当时|ðen","ther":"特尔","there":"在那里|ðer; ðər","these":"这些|ðiːz","they":"第三人称复数主格代词：他们|ðeɪ","thick":"厚的|θɪk","thin":"薄的|θɪn","thing":"东西|θɪŋ","things":"事物|θɪŋz","think":"认为|θɪŋk","thinking":"想法|ˈθɪŋkɪŋ","third":"第三|θɜːrd","thirteen":"十三|ˌθɜːrˈtiːn","thirty":"二十世纪三十年代|ˈθɜːrti","this":"这|ðɪs","those":"那些|ðoʊz","though":"虽然|ðoʊ","thought":"想法|θɔːt","thousand":"一千|ˈθaʊz(ə)nd","thousands":"数千","three":"三|θriː","through":"穿过|θruː","throw":"投|θroʊ","throwing":"投掷|ˈθroʊɪŋ","thrown":"抛|θroʊn","ths":"混合动力系统","thursday":"星期四|ˈθɜːrzdeɪ","thy":"你的|ðaɪ","ti":"朱蕉|tiː","tian'anmen":"天安门","tiangong":"天宫","tianjin":"天津","ticket":"票|ˈtɪkɪt","tickets":"票|ˈtɪkɪts","tidy":"整洁的|ˈtaɪdi","tim":"蒂姆|tɪm","time":"时间|taɪm","times":"乘以|taɪmz","timetable":"时刻表|ˈtaɪmteɪbl","ting":"发出叮当声|tɪŋ","tion":"名词后缀 -tion|ʃən","tired":"疲倦的|ˈtaɪərd","tiring":"令人疲倦的|ˈtaɪərɪŋ","tise":"蒂斯","title":"名称|ˈtaɪt(ə)l","tl":"传递线","tle":"薄层电泳","tment":"试探性的","tn":"商品名的缩写","tnt":"三硝基甲苯|ˌtiː en ˈtiː","to":"朝|tuː; tə","today":"今天|təˈdeɪ","together":"在一起|təˈɡeðər","toies":"[解剖]脚趾","told":"告诉|toʊld","tom":"〈美口〉逆来顺受|tɑːm","tomato":"番茄|təˈmeɪtoʊ","tomatoes":"番茄|təˈmeɪtoʊz","tomatos":"番茄","tomorrow":"在明天|təˈmɑːroʊ","toni":"托妮","too":"太|tuː","took":"拿|tʊk","tools":"工具|tuːlz","tooth":"牙|tuːθ","top":"顶部|tɑːp","topic":"题目|ˈtɑːpɪk","tory":"英国保守党党员|ˈtɔːri","total":"总的|ˈtoʊt(ə)l","touch":"触摸|tʌtʃ","tourists":"游客|ˈtʊrɪsts","tower":"塔|ˈtaʊər","towers":"塔|ˈtaʊərz","town":"城镇|taʊn","toy":"玩具|tɔɪ","toyies":"Tory 的复数形式：英国保","toys":"玩具|tɔɪz","tr":"土耳其","tra":"印度茶叶研究协会|trə","trade":"贸易|treɪd","tradition":"传统|trəˈdɪʃn","traffic":"路上行驶的车辆|ˈtræfɪk","train":"火车|treɪn","trains":"[铁路]火车|treɪnz","traits":"特性|treɪts","translate":"译|trænzˈleɪt","transport":"运输|ˈtrænspɔːrt","transportation":"运输|ˌtrænspərˈteɪʃ(ə)n","travel":"旅行|ˈtræv(ə)l","traveled":"旅行|ˈtrævld","traveling":"旅行|ˈtrævlɪŋ","travelled":"旅行|ˈtrævld","travelling":"巡回的|ˈtrævəlɪŋ","travels":"旅行|ˈtrævlz","tre":"高音","trea":"海藻糖酶","treasure":"宝藏|ˈtreʒə","treasures":"宝物|ˈtreʒərz","tree":"树|triː","trees":"树木|triːz","tri":"产业研究所|traɪ","trip":"旅行|trɪp","trips":"远行|trɪps","tro":"临时禁制令","trouble":"困难|ˈtrʌb(ə)l","true":"真实的|truː","try":"试图|traɪ","ts":"试验装置|tiːz","tt":"电汇|ˌtiː ˈtiː","tu":"TU工会|ˌti ju","tuesday":"星期二|ˈtuːzdeɪ","tumn":"n．图姆纳斯：《纳尼亚传奇》","tunnel":"隧道|ˈtʌn(ə)l","ture":"大而深的盖碗","turn":"旋转|tɜːrn","turned":"被转动的|tɜːrnd","turning":"转弯处|ˈtɜːrnɪŋ","turns":"turn 的复数形式：转动|tɜːrnz","tv":"电视|ˌtiː ˈviː","twelve":"十二|twelv","twenty":"二十|ˈtwenti","twenty-four":"二十四|ˌtwɛntiˈfɔr","twice":"两次|twaɪs","two":"二|tuː","ty":"<非正式|taɪ; ti","type":"类型|taɪp","u":"铀|juː","ue":"统一标准装置","uf":"脲甲醛树脂","ugly":"丑陋的|ˈʌɡli","ui":"用户界面|ˌjuː ˈaɪ","ul":"<美>保险商实验室","um":"嗯|ʌm; əm","umbrella":"雨伞|ʌmˈbrelə","un":"家伙|ən","uncle":"叔叔|ˈʌŋk(ə)l","uncountable":"无数的|ʌnˈkaʊntəbl","under":"在下面|ˈʌndər","underground":"在地下|ˌʌndərˈɡraʊnd","understand":"理解|ˌʌndərˈstænd","uniform":"制服|ˈjuːnɪfɔːrm","uniforms":"制服|ˈjuːnɪfɔːrmz","univer":"《大学》","university":"大学|ˌjuːnɪˈvɜːsəti","unlock":"开的锁|ˌʌnˈlɑːk","unrelated":"无关的|ˌʌnrɪˈleɪtɪd","until":"到时|ənˈtɪl","unusual":"不寻常的|ʌnˈjuːʒuəl","up":"向上|ʌp","us":"我们|ʌs; əs","use":"用|juːz","used":"用过的|juːst","useful":"有用的|ˈjuːsf(ə)l","user":"用户|ˈjuːzər","uses":"use 的第三人称单数：使用|ˈjuːzɪz","using":"使用|ˈjuːzɪŋ","usual":"通常的|ˈjuːʒuəl","usually":"通常地|ˈjuːʒuəli; ˈjuːʒəli","v":"英语字母中的第二十二个字母|viː","va":"<美>维吉尼亚州|ˌvi ˈe","vacation":"假期|veɪˈkeɪʃ(ə)n","ve":"委内瑞拉","ved":"vehicle excise","veg":"蔬菜|vedʒ","vegetable":"蔬菜|ˈvedʒtəbl","vegetables":"蔬菜|ˈvedʒtəb(ə)lz","ven":"虚拟企业网","vent":"通风孔|vent","ver":"版本|vɜːr","verb":"动词|vɜːrb","verb-ing":"名词动词化","verbs":"动词|vɜːrbz","very":"很|ˈveri","ves":"虚拟执行系统","vest":"<英> 背心|vest","vi":"罗马数字 VI|ˈsɪksθ","video":"录像|ˈvɪdioʊ","videos":"video 的复数形式","view":"观点|vjuː","villagers":"村民|ˈvɪlɪdʒər","villages":"村庄|ˈvɪlɪdʒ","visit":"参观|ˈvɪzɪt","visited":"参观|ˈvɪzɪtɪd","visiting":"来访的|ˈvɪzɪtɪŋ","visitor":"访问者|ˈvɪzɪtər","visitors":"访问者|ˈvɪzɪtər","visits":"访问|ˈvɪzɪts","vl":"轻链可变区","vld":"超低密度脂蛋白","vli":"变额人寿保险","vocabulary":"全部词汇|vəˈkæbjəleri; voʊˈkæbjəleri","voice":"嗓音|vɔɪs","vol":"卷|ˈvɑːl","volunteer":"志愿者|ˌvɒlənˈtɪə","volunteers":"志愿者","vous":"代金券","vowel":"元音|ˈvaʊəl","vowels":"元音|ˈvaʊəlz","w":"英语字母中的第二十三个字母|ˈdʌbljuː","wa":"华盛顿州","wait":"等候|weɪt","waited":"wait 的过去式和过去分词|ˈweɪtɪd","waiting":"等|ˈweɪtɪŋ","wake":"唤醒|weɪk","wal":"预写式日志","walk":"走|wɔːk","walked":"walk 的过去式和过去分词|wɔːkt","walking":"步行|ˈwɔːkɪŋ","walks":"walk 的复数形式：散步|wɔːks","wall":"城墙|wɔːl","wallet":"钱包|ˈwɒlɪt","walls":"墙壁|wɔːlz","wang":"王|wæŋ","wanna":"想要|ˈwɑːnə","want":"想要|wɑːnt","wants":"需求|ˈwɒnts","warm":"暖和的|wɔːrm","was":"是|wʌz; wəz","wash":"清洗|wɑːʃ","washing":"洗涤|ˈwɑːʃɪŋ","waste":"浪费|weɪst","watch":"看|wɑːtʃ","watched":"观察|wɑːtʃt","watches":"手表|ˈwɑːtʃɪz","watching":"watch 的现在分词/动名|ˈwɑtʃɪŋ","water":"水|ˈwɔːtər","waterway":"航道|ˈwɔːtərweɪ","wave":"海浪|weɪv","waved":"wave 的过去式和过去分词|weɪvd","waves":"wave 的复数形式：波浪|weɪvz","way":"方法|weɪ","ways":"方法|weɪz","wd":"陆军部","we":"我们|wiː; wi","we've":"我们已|wɪv","wea":"工人教育协会","weak":"虚弱的|wiːk","wear":"穿|wer","wearing":"使人疲倦的|ˈwerɪŋ","weather":"天气|ˈweðə","wednesday":"星期三|ˈwenzdeɪ","week":"星期|wiːk","weekdays":"平日|ˈwiːkdeɪz","weekend":"周末|ˈwiːkend","weekends":"在每周末|ˈwɪkˌendz","weeks":"周|wiːks","weig":"魏格","weight":"重量|weɪt","weightless":"失重的|ˈweɪtləs","welcome":"欢迎|ˈwelkəm","well":"顺利地|wel","went":"去|went","were":"是|wɜːr; wər","west":"西|west","wet":"湿的|wet","whales":"鲸鱼|weɪlz","what":"什么|wʌt","what's":"是什么|wʌts","when":"什么时候|wen","where":"在哪里|wer","whether":"是否|ˈweðər","which":"哪一个|wɪtʃ","while":"当的时候|waɪl","white":"白色的|waɪt","who":"谁|huː","who's":"who is 的缩约形式|huz","whole":"全部的|hoʊl","whose":"谁的|huːz","why":"为什么|waɪ","wi":"熟铁|ˌdʌbljuː ˈaɪ","wide":"宽的|waɪd","wild":"自然生长的|waɪld","will":"将|wɪl","willows":"杨柳","win":"赢|wɪn","wind":"风|wɪnd","window":"窗|ˈwɪndoʊ","windows":"窗户|ˈwɪndoʊz","windy":"多风的|ˈwɪndi","wings":"翅膀|wɪŋz","wins":"赢|wɪnz","winter":"冬季|ˈwɪntər","wishes":"希望|wɪʃɪz","with":"和在一起|wɪð; wɪθ","without":"没有|wɪˈðaʊt","wizard":"巫师|ˈwɪzərd","wo":"准尉军官|woʊ","woman":"成年女子|ˈwʊmən","women":"女人|ˈwɪmɪn","won":"韩圆|wʌn","wonder":"奇迹|ˈwʌndə","wondered":"想知道","wonderful":"绝妙的|ˈwʌndərf(ə)l","wondering":"想知道|ˈwʌndərɪŋ","wonders":"奇观|ˈwʌndər","wood":"木材|wʊd","word":"字|wɜːrd","words":"word 的复数：词|wɜːrdz","work":"工作|wɜːrk","worked":"工作|wɜːrkt","workers":"工作者|ˈwɜːrkərz","working":"有工作的|ˈwɜːrkɪŋ","works":"工作|wɜːrks","world":"世界|wɜːrld","worry":"担心|ˈwɜːri","worse":"更糟的|wɜːrs","would":"将|wʊd","wouldn't":"（等于 would no|ˌwʊdnt","wrap":"包|ræp","write":"写作|raɪt","writer's":"作家的障碍：一种心理抑制","writing":"写作|ˈraɪtɪŋ","wrong":"错误的|rɔːŋ","wrongly":"错误地|ˈrɔːŋli","wrote":"写|roʊt","x":"英语字母中的第二十四个字母|eks","x-ray":"X 射线|ˈeks reɪ","xi'an":"西安","y":"钇|waɪ","yao":"尧|jaʊ","year":"年|jɪr","year's":"year 的所有格/属格形式","years":"年","yellow":"黄的|ˈjeloʊ","yes":"是|jes","yesterday":"在昨天|ˈjestərdeɪ","ym":"基督教青年会","you":"你|juː; jʊ","you'd":"你已经|jʊd","young":"幼小的|jʌŋ","younger":"更年轻的|ˈjʌŋɡər","your":"你的|jʊr; jər","yourself":"你自己|jɔːrˈself","yuan":"元|juˈɑːn","z":"英语字母表的第二十六个字母|ziː","ze":"玉米纤维","zhuhai":"珠海","zi":"美国本土","zongzi":"粽子","zoo":"动物园|zuː","zu":"巴比伦神话中的风雨神"};
// ===== LOCAL_DICT END =====

const WordHelp = {
  // 不规则动词：base -> [过去式, 过去分词, 现在分词, 第三人称单数]
  V: {
    be: ['was/were', 'been', 'being', 'is/are'],
    have: ['had', 'had', 'having', 'has'],
    do: ['did', 'done', 'doing', 'does'],
    say: ['said', 'said', 'saying', 'says'],
    go: ['went', 'gone', 'going', 'goes'],
    get: ['got', 'got/gotten', 'getting', 'gets'],
    make: ['made', 'made', 'making', 'makes'],
    know: ['knew', 'known', 'knowing', 'knows'],
    think: ['thought', 'thought', 'thinking', 'thinks'],
    take: ['took', 'taken', 'taking', 'takes'],
    see: ['saw', 'seen', 'seeing', 'sees'],
    come: ['came', 'come', 'coming', 'comes'],
    give: ['gave', 'given', 'giving', 'gives'],
    find: ['found', 'found', 'finding', 'finds'],
    tell: ['told', 'told', 'telling', 'tells'],
    become: ['became', 'become', 'becoming', 'becomes'],
    show: ['showed', 'shown', 'showing', 'shows'],
    leave: ['left', 'left', 'leaving', 'leaves'],
    feel: ['felt', 'felt', 'feeling', 'feels'],
    put: ['put', 'put', 'putting', 'puts'],
    bring: ['brought', 'brought', 'bringing', 'brings'],
    begin: ['began', 'begun', 'beginning', 'begins'],
    keep: ['kept', 'kept', 'keeping', 'keeps'],
    hold: ['held', 'held', 'holding', 'holds'],
    write: ['wrote', 'written', 'writing', 'writes'],
    stand: ['stood', 'stood', 'standing', 'stands'],
    hear: ['heard', 'heard', 'hearing', 'hears'],
    let: ['let', 'let', 'letting', 'lets'],
    mean: ['meant', 'meant', 'meaning', 'means'],
    set: ['set', 'set', 'setting', 'sets'],
    meet: ['met', 'met', 'meeting', 'meets'],
    run: ['ran', 'run', 'running', 'runs'],
    pay: ['paid', 'paid', 'paying', 'pays'],
    sit: ['sat', 'sat', 'sitting', 'sits'],
    speak: ['spoke', 'spoken', 'speaking', 'speaks'],
    lie: ['lay', 'lain', 'lying', 'lies'],
    lead: ['led', 'led', 'leading', 'leads'],
    read: ['read', 'read', 'reading', 'reads'],
    grow: ['grew', 'grown', 'growing', 'grows'],
    lose: ['lost', 'lost', 'losing', 'loses'],
    fall: ['fell', 'fallen', 'falling', 'falls'],
    send: ['sent', 'sent', 'sending', 'sends'],
    build: ['built', 'built', 'building', 'builds'],
    understand: ['understood', 'understood', 'understanding', 'understands'],
    draw: ['drew', 'drawn', 'drawing', 'draws'],
    break: ['broke', 'broken', 'breaking', 'breaks'],
    spend: ['spent', 'spent', 'spending', 'spends'],
    cut: ['cut', 'cut', 'cutting', 'cuts'],
    rise: ['rose', 'risen', 'rising', 'rises'],
    drive: ['drove', 'driven', 'driving', 'drives'],
    buy: ['bought', 'bought', 'buying', 'buys'],
    wear: ['wore', 'worn', 'wearing', 'wears'],
    choose: ['chose', 'chosen', 'choosing', 'chooses'],
    eat: ['ate', 'eaten', 'eating', 'eats'],
    drink: ['drank', 'drunk', 'drinking', 'drinks'],
    sing: ['sang', 'sung', 'singing', 'sings'],
    swim: ['swam', 'swum', 'swimming', 'swims'],
    fly: ['flew', 'flown', 'flying', 'flies'],
    teach: ['taught', 'taught', 'teaching', 'teaches'],
    catch: ['caught', 'caught', 'catching', 'catches'],
    throw: ['threw', 'thrown', 'throwing', 'throws'],
    win: ['won', 'won', 'winning', 'wins'],
    forget: ['forgot', 'forgotten', 'forgetting', 'forgets'],
    forgive: ['forgave', 'forgiven', 'forgiving', 'forgives'],
    freeze: ['froze', 'frozen', 'freezing', 'freezes'],
    wake: ['woke', 'woken', 'waking', 'wakes'],
    ride: ['rode', 'ridden', 'riding', 'rides'],
    hide: ['hid', 'hidden', 'hiding', 'hides'],
    fight: ['fought', 'fought', 'fighting', 'fights'],
    seek: ['sought', 'sought', 'seeking', 'seeks'],
    sell: ['sold', 'sold', 'selling', 'sells'],
    sleep: ['slept', 'slept', 'sleeping', 'sleeps'],
    smell: ['smelt', 'smelt', 'smelling', 'smells'],
    cost: ['cost', 'cost', 'costing', 'costs'],
    hurt: ['hurt', 'hurt', 'hurting', 'hurts'],
    hit: ['hit', 'hit', 'hitting', 'hits'],
    shut: ['shut', 'shut', 'shutting', 'shuts'],
    spread: ['spread', 'spread', 'spreading', 'spreads'],
    feed: ['fed', 'fed', 'feeding', 'feeds'],
    deal: ['dealt', 'dealt', 'dealing', 'deals'],
    dig: ['dug', 'dug', 'digging', 'digs'],
    hang: ['hung', 'hung', 'hanging', 'hangs'],
    lend: ['lent', 'lent', 'lending', 'lends'],
    ring: ['rang', 'rung', 'ringing', 'rings'],
    shake: ['shook', 'shaken', 'shaking', 'shakes'],
    shine: ['shone', 'shone', 'shining', 'shines'],
    shoot: ['shot', 'shot', 'shooting', 'shoots'],
    steal: ['stole', 'stolen', 'stealing', 'steals'],
    stick: ['stuck', 'stuck', 'sticking', 'sticks'],
    strike: ['struck', 'struck', 'striking', 'strikes'],
    sweep: ['swept', 'swept', 'sweeping', 'sweeps'],
    tear: ['tore', 'torn', 'tearing', 'tears'],
  },

  // 规则动词（用来确认"play 确实是动词"，才能说 played 是它的过去式）。
  // 只放课内高频、孩子真会去点的那些。
  REG_V: ('want look play help work study watch like live love need use open close '
    + 'start finish learn talk walk listen call ask answer clean cook dance jump '
    + 'kick laugh move paint pick plant pull push rain relax remember rest shop '
    + 'smile snow stay stop swim talk travel try turn visit wait wash watch '
    + 'wish worry climb cook count cover cry decide enjoy explain follow hope '
    + 'invite join jump kiss knock land lift lock mark match miss mix move '
    + 'notice offer order pack pass phone place plan point practice prepare '
    + 'promise protect provide read relax repair reply report rest return save '
    + 'search share shout sign sound spell start study talk taste thank touch '
    + 'train try tidy travel treat trust turn type use walk want warm waste '
    + 'watch water wave weigh welcome wish wonder wrap').split(/\s+/),

  // 不规则名词复数
  IRREG_N: {
    child: 'children', man: 'men', woman: 'women', foot: 'feet', tooth: 'teeth',
    mouse: 'mice', goose: 'geese', person: 'people', sheep: 'sheep', fish: 'fish',
    deer: 'deer', knife: 'knives', leaf: 'leaves', wife: 'wives', life: 'lives',
    half: 'halves', wolf: 'wolves', thief: 'thieves', potato: 'potatoes',
    tomato: 'tomatoes', hero: 'heroes', photo: 'photos', piano: 'pianos',
  },

  // 形容词比较级 / 最高级
  IRREG_A: {
    good: ['better', 'best'], bad: ['worse', 'worst'], well: ['better', 'best'],
    many: ['more', 'most'], much: ['more', 'most'],
    little: ['less', 'least'], far: ['farther', 'farthest'],
    big: ['bigger', 'biggest'], small: ['smaller', 'smallest'],
    tall: ['taller', 'tallest'], short: ['shorter', 'shortest'],
    long: ['longer', 'longest'], old: ['older', 'oldest'],
    young: ['younger', 'youngest'], fast: ['faster', 'fastest'],
    slow: ['slower', 'slowest'], easy: ['easier', 'easiest'],
    happy: ['happier', 'happiest'], busy: ['busier', 'busiest'],
    early: ['earlier', 'earliest'], late: ['later', 'latest'],
    hot: ['hotter', 'hottest'], cold: ['colder', 'coldest'],
    warm: ['warmer', 'warmest'], cool: ['cooler', 'coolest'],
    nice: ['nicer', 'nicest'], kind: ['kinder', 'kindest'],
    clean: ['cleaner', 'cleanest'], dirty: ['dirtier', 'dirtiest'],
    cheap: ['cheaper', 'cheapest'], high: ['higher', 'highest'],
    low: ['lower', 'lowest'], heavy: ['heavier', 'heaviest'],
    light: ['lighter', 'lightest'], strong: ['stronger', 'strongest'],
    weak: ['weaker', 'weakest'], thin: ['thinner', 'thinnest'],
    fat: ['fatter', 'fattest'], large: ['larger', 'largest'],
    safe: ['safer', 'safest'], funny: ['funnier', 'funniest'],
    angry: ['angrier', 'angriest'], hungry: ['hungrier', 'hungriest'],
    thirsty: ['thirstier', 'thirstiest'], pretty: ['prettier', 'prettiest'],
    quiet: ['quieter', 'quietest'], deep: ['deeper', 'deepest'],
    wide: ['wider', 'widest'], cute: ['cuter', 'cutest'],
  },

  // 常见固定搭配。第一列是"原型"，第二列是给孩子看的中文。
  // 变形（giving up / gave up / gives up）由动词表自动生成，不用手写。
  PHRASES: [
    ['give up', '放弃'], ['give back', '归还'], ['give away', '送出，赠送'],
    ['give in', '让步，屈服'],
    ['look after', '照顾'], ['look for', '寻找'], ['look at', '看着'],
    ['look up', '查阅；抬头看'], ['look out', '当心'], ['look like', '看起来像'],
    ['look forward to', '盼望'],
    ['take care of', '照顾'], ['take part in', '参加'], ['take off', '脱下；起飞'],
    ['take out', '拿出'], ['take away', '拿走'], ['take up', '开始从事；占地方'],
    ['get up', '起床'], ['get on', '上车'], ['get off', '下车'],
    ['get back', '回来；取回'], ['get ready for', '为…做准备'],
    ['get along with', '与…相处'],
    ['go on', '继续'], ['go out', '出去'], ['go back', '回去'],
    ['go over', '复习'], ['go home', '回家'], ['go shopping', '去购物'],
    ['go swimming', '去游泳'], ['go fishing', '去钓鱼'],
    ['come back', '回来'], ['come in', '进来'], ['come from', '来自'],
    ['come on', '快点；加油'], ['come true', '实现'],
    ['turn on', '打开（电器）'], ['turn off', '关掉（电器）'],
    ['turn up', '调大声；出现'], ['turn down', '调小声；拒绝'],
    ['turn left', '向左转'], ['turn right', '向右转'],
    ['put on', '穿上'], ['put off', '推迟'], ['put away', '收起来'],
    ['put up', '举起；张贴'], ['put down', '放下'],
    ['pick up', '捡起；接人'], ['wake up', '醒来'], ['hurry up', '快点'],
    ['grow up', '长大'], ['stand up', '站起来'], ['sit down', '坐下'],
    ['write down', '写下来'], ['find out', '查明，弄清楚'],
    ['run out of', '用完'], ['keep on', '继续'], ['carry on', '继续进行'],
    ['set up', '建立，创办'], ['clean up', '打扫干净'], ['cheer up', '振作起来'],
    ['fix up', '修理好'], ['eat up', '吃光'], ['use up', '用完'],
    ['dress up', '穿上盛装'], ['make up', '编造；组成'],
    ['make friends with', '与…交朋友'],
    ['be good at', '擅长'], ['be interested in', '对…感兴趣'],
    ['be proud of', '为…自豪'], ['be afraid of', '害怕'],
    ['be full of', '充满'], ['be made of', '由…制成'],
    ['be different from', '与…不同'], ['be late for', '迟到'],
    ['depend on', '依靠'], ['wait for', '等待'], ['listen to', '听'],
    ['talk to', '和…说话'], ['talk about', '谈论'], ['think about', '考虑'],
    ['think of', '想起；认为'], ['worry about', '担心'], ['care about', '关心'],
    ['belong to', '属于'], ['arrive at', '到达（小地方）'],
    ['arrive in', '到达（大地方）'], ['laugh at', '嘲笑'],
    ['shout at', '冲…喊'], ['agree with', '同意'], ['play with', '和…玩'],
    ['help with', '帮助做'], ['fill in', '填写'], ['hand in', '上交'],
    ['hand out', '分发'], ['check in', '登记入住'], ['check out', '结账离开'],
    ['at last', '最后'], ['in the end', '最后'], ['of course', '当然'],
    ['as well', '也'], ['too much', '太多'], ['a lot of', '许多'],
    ['lots of', '许多'], ['a bit', '一点儿'], ['in front of', '在…前面'],
    ['next to', '紧挨着'], ['because of', '因为'], ['instead of', '代替'],
    ['such as', '例如'], ['as soon as', '一…就…'], ['right away', '立刻'],
    ['all the time', '一直'], ['from now on', '从今以后'],
    ['on time', '准时'], ['in time', '及时'], ['at once', '立刻'],
    ['have fun', '玩得开心'], ['have a good time', '玩得愉快'],
    ['do homework', '做作业'], ['watch TV', '看电视'],
    ['play football', '踢足球'], ['play basketball', '打篮球'],
    ['play the piano', '弹钢琴'], ['play the guitar', '弹吉他'],

    // ===== v163：家长说"短语分化不够精细，有些还是会被漏掉" =====
    // 下表按类型补齐：动词搭配 → be 结构 → 介词短语 → 量词/连接 → 课本题材。
    // 变形（gave up / is good at / days off…）由 _buildPhraseIdx 自动生成，不手写。
    ['get ready to', '准备好做…'], ['get dressed', '穿好衣服'],
    ['get together', '聚会'], ['get lost', '迷路'], ['get home', '到家'],
    ['get to', '到达'], ['get there', '到那里'], ['get worse', '变得更糟'],
    ['take place', '发生，举行'], ['take a photo', '拍照'],
    ['take photos', '拍照'], ['take a walk', '散步'],
    ['take a bus', '乘公交车'], ['take a train', '乘火车'],
    ['take care', '保重'], ['take it easy', '别紧张，放轻松'],
    ['take notes', '记笔记'], ['take a rest', '休息一下'],
    ['take a trip', '去旅行'], ['take turns', '轮流'],
    ['make a mistake', '犯错误'], ['make sure', '确保'],
    ['make a decision', '做决定'], ['make a plan', '制订计划'],
    ['make a cake', '做蛋糕'], ['make a phone call', '打电话'],
    ['make dumplings', '包饺子'], ['make money', '挣钱'],
    ['make use of', '利用'],
    ['do one\'s best', '尽力'], ['do sports', '做运动'],
    ['do housework', '做家务'], ['do the dishes', '洗碗'],
    ['do a good job', '干得好'], ['do some reading', '读点书'],
    ['have a look', '看一看'], ['have a rest', '休息一下'],
    ['have breakfast', '吃早饭'], ['have lunch', '吃午饭'],
    ['have dinner', '吃晚饭'], ['have a try', '试一试'],
    ['have a party', '开派对'], ['have a meeting', '开会'],
    ['have a cold', '感冒'], ['have a good day', '过得愉快'],
    ['keep healthy', '保持健康'], ['keep fit', '保持健康'],
    ['keep quiet', '保持安静'], ['keep in touch with', '与…保持联系'],
    ['keep away from', '远离'],
    ['come out', '出来；出版'], ['come over', '过来'],
    ['come up with', '想出'], ['come along', '一起来'],
    ['go to bed', '上床睡觉'], ['go to school', '去上学'],
    ['go to work', '去上班'], ['go abroad', '出国'],
    ['go boating', '去划船'], ['go skating', '去滑冰'],
    ['go camping', '去露营'], ['go hiking', '去远足'],
    ['go on a trip', '去旅行'], ['go bad', '变坏'],
    ['turn around', '转身'], ['turn into', '变成'],
    ['put out', '扑灭'], ['put in', '放进；投入'],
    ['look around', '四处看'], ['look the same', '看起来一样'],
    ['run away', '跑开'], ['run after', '追赶'],
    ['run into', '偶然遇到'], ['walk to', '走向'],
    ['walk along', '沿着…走'], ['walk around', '四处走走'],
    ['lie down', '躺下'], ['fall down', '跌倒'],
    ['fall asleep', '睡着'], ['fall behind', '落后'],
    ['throw away', '扔掉'], ['bring back', '带回来'],
    ['hold on', '等一下；坚持'], ['try on', '试穿'],
    ['switch on', '打开（电器）'], ['switch off', '关掉（电器）'],
    ['smile at', '对…微笑'], ['point at', '指着'],
    ['point out', '指出'], ['pay attention to', '注意'],
    ['be good for', '对…有益'], ['be bad for', '对…有害'],
    ['be famous for', '因…而闻名'], ['be known as', '被称为'],
    ['be made from', '由…制成'], ['be made in', '在…制造'],
    ['be used for', '用于'], ['be used to', '习惯于'],
    ['be able to', '能够'], ['be going to', '打算'],
    ['be about to', '即将'], ['be sure to', '一定'],
    ['be ready for', '为…做好准备'], ['be ready to', '准备好做…'],
    ['be busy with', '忙于'], ['be covered with', '被…覆盖'],
    ['be filled with', '充满'], ['be angry with', '生…的气'],
    ['be strict with', '对…严格'], ['be friendly to', '对…友好'],
    ['be kind to', '对…友善'], ['be polite to', '对…有礼貌'],
    ['be helpful to', '对…有帮助'], ['be important to', '对…重要'],
    ['be fond of', '喜欢'], ['be tired of', '厌倦'],
    ['be afraid to', '不敢'], ['be free', '有空'],
    ['be over', '结束'],
    ['used to', '过去常常'], ['ought to', '应该'],
    ['had better', '最好'], ['would rather', '宁愿'],
    ['would like to', '想要'],
    ['at first', '起初'], ['at least', '至少'], ['at most', '最多'],
    ['at present', '目前'], ['at the moment', '此刻'],
    ['at the end of', '在…末尾'], ['at the beginning of', '在…开始'],
    ['at the age of', '在…岁时'], ['at home', '在家'],
    ['at school', '在学校'], ['at work', '在上班'],
    ['at night', '在夜里'], ['at noon', '在中午'],
    ['at weekends', '在周末'], ['at the top of', '在…顶部'],
    ['at the bottom of', '在…底部'], ['at the foot of', '在…脚下'],
    ['at the same time', '同时'], ['at the gate', '在门口'],
    ['in the morning', '在上午'], ['in the afternoon', '在下午'],
    ['in the evening', '在晚上'], ['in the middle of', '在…中间'],
    ['in fact', '事实上'], ['in future', '今后'],
    ['in the future', '在未来'], ['in public', '当众'],
    ['in trouble', '处于困境'], ['in danger', '处于危险中'],
    ['in silence', '沉默地'], ['in a hurry', '匆忙'],
    ['in common', '共同的'], ['in short', '简言之'],
    ['in order to', '为了'], ['in the front of', '在…前部'],
    ['in the world', '在世界上'], ['in English', '用英语'],
    ['in class', '在课堂上'], ['in hospital', '住院'],
    ['in the sky', '在天空中'], ['in the past', '在过去'],
    ['in a word', '总之'], ['in the open air', '在户外'],
    ['on foot', '步行'], ['on sale', '出售；打折'],
    ['on holiday', '在度假'], ['on business', '出差'],
    ['on the phone', '通电话'], ['on the internet', '在网上'],
    ['on the left', '在左边'], ['on the right', '在右边'],
    ['on the way', '在路上'], ['on the way to', '在去…的路上'],
    ['on weekends', '在周末'], ['on the other hand', '另一方面'],
    ['on purpose', '故意'], ['on show', '在展出'],
    ['on the farm', '在农场'], ['on the playground', '在操场上'],
    ['on the second floor', '在二楼'],
    ['for example', '例如'], ['for free', '免费'],
    ['for sure', '肯定'], ['for a while', '一会儿'],
    ['for ever', '永远'], ['for the first time', '第一次'],
    ['for a long time', '很长时间'], ['for hours', '好几个小时'],
    ['by the way', '顺便说一下'], ['by bus', '乘公交车'],
    ['by bike', '骑自行车'], ['by car', '乘汽车'],
    ['by train', '乘火车'], ['by plane', '乘飞机'],
    ['by subway', '乘地铁'], ['by ship', '乘船'],
    ['by hand', '手工'], ['by mistake', '错误地'],
    ['by the end of', '到…末为止'],
    ['at the weekend', '在周末'], ['do some exercise', '做锻炼'],
    ['let me know', '告诉我'], ['come with me', '跟我一起来'],
    ['with the help of', '在…帮助下'], ['with pleasure', '乐意地'],
    ['day by day', '一天天'], ['one by one', '一个接一个'],
    ['side by side', '并排'], ['face to face', '面对面'],
    ['step by step', '一步步'], ['little by little', '逐渐地'],
    ['more and more', '越来越多'], ['less and less', '越来越少'],
    ['better and better', '越来越好'], ['sooner or later', '迟早'],
    ['now and then', '不时'], ['here and there', '到处'],
    ['first of all', '首先'], ['so far', '到目前为止'],
    ['as usual', '像往常一样'], ['as if', '好像'],
    ['as long as', '只要'], ['as well as', '也，和'],
    ['as soon as possible', '尽快'],
    ['all over the world', '全世界'], ['all kinds of', '各种各样的'],
    ['different kinds of', '不同种类的'], ['a kind of', '一种'],
    ['plenty of', '大量的'], ['a number of', '许多'],
    ['the number of', '…的数量'], ['a few', '几个'],
    ['a little', '一点儿'], ['a pair of', '一双'],
    ['a piece of', '一片；一条'], ['a cup of', '一杯'],
    ['a glass of', '一玻璃杯'], ['a bottle of', '一瓶'],
    ['a set of', '一套'], ['each other', '互相'],
    ['one another', '互相'], ['so many', '这么多'],
    ['so much', '这么多'], ['too many', '太多'],
    ['no longer', '不再'], ['not any more', '不再'],
    ['the Great Wall', '长城'], ['the Palace Museum', '故宫博物院'],
    ['the Spring Festival', '春节'], ['the Mid-Autumn Festival', '中秋节'],
    ['the Dragon Boat Festival', '端午节'],
    ['high-speed train', '高铁'], ['mobile phone', '手机'],
    ['ice cream', '冰淇淋'], ['fly a kite', '放风筝'],
    ['ride a bike', '骑自行车'], ['draw a picture', '画画'],
    ['sing a song', '唱歌'], ['read a book', '读书'],
    ['listen to music', '听音乐'], ['watch a movie', '看电影'],
    ['after school', '放学后'], ['before class', '上课前'],
    ['next week', '下周'], ['last year', '去年'],
    ['this morning', '今天早上'], ['the day before yesterday', '前天'],
    ['the day after tomorrow', '后天'], ['how long', '多长（问长度／时间）'],
    ['how far', '多远'], ['how often', '多久一次'],
    ['how much', '多少（不可数／价格）'], ['how many', '多少（可数）'],
    // there be：一条就够，_buildPhraseIdx 会生成 there is/are/was/were
    ['there is', '有（某处存在）'],

    // ===== v169：家长 2026-10-30「只要是短语的，比较常见的、普通的，甚至
    // 简单的，你都给我弄出来」===== 这一轮按"常见 + 简单"全量补：
    // 时间 → 地点（in/on/at the …）→ 名词短语 → 动词短语 → 口语短句。
    // 动词变形 / 名词复数 / one's 替换仍由 _buildPhraseIdx 自动生成。

    // —— 时间：every / this / last / next / all ——
    ['every morning', '每天早上'], ['every day', '每天'], ['every week', '每周'],
    ['every month', '每个月'], ['every year', '每年'], ['every night', '每天夜里'],
    ['every weekend', '每个周末'], ['every spring', '每年春天'], ['every summer', '每年夏天'],
    ['every autumn', '每年秋天'], ['every winter', '每年冬天'],
    ['this week', '这周'], ['this year', '今年'], ['this afternoon', '今天下午'],
    ['this evening', '今天傍晚'], ['this weekend', '这个周末'], ['this term', '这学期'],
    ['this time', '这一次'], ['that day', '那天'], ['that year', '那年'],
    ['last night', '昨天夜里'], ['last week', '上周'], ['last month', '上个月'],
    ['last weekend', '上周末'], ['last summer', '去年夏天'], ['last winter', '去年冬天'],
    ['next month', '下个月'], ['next year', '明年'], ['next summer', '明年夏天'],
    ['next time', '下一次'], ['next weekend', '下个周末'],
    ['all day', '一整天'], ['all night', '整夜'], ['all morning', '一上午'],
    ['half an hour', '半小时'], ['just now', '刚才'], ['right now', '现在，立刻'],
    ['these days', '现在，如今'], ['at that time', '在那时'], ['at that moment', '在那一刻'],
    ['at six', '在六点'], ['at half past six', '在六点半'], ['at seven', '在七点'],
    ['in the day', '在白天'], ['in the daytime', '在白天'], ['during the day', '在白天'],
    ['after breakfast', '早饭后'], ['after lunch', '午饭后'], ['after dinner', '晚饭后'],
    ['after class', '下课后'], ['after work', '下班后'],
    ['before breakfast', '早饭前'], ['before dinner', '晚饭前'],
    ['before school', '上学前'], ['before bedtime', '睡觉前'],
    ['at breakfast', '吃早饭时'], ['at lunch', '吃午饭时'], ['at dinner', '吃晚饭时'],
    ['at meals', '在吃饭时'], ['in five minutes', '五分钟后'], ['in two days', '两天后'],
    ['in a minute', '马上，一会儿'], ['one day', '有一天'], ['some day', '将来有一天'],
    ['the next day', '第二天'],
    ['on Monday', '在周一'], ['on Tuesday', '在周二'], ['on Wednesday', '在周三'],
    ['on Thursday', '在周四'], ['on Friday', '在周五'], ['on Saturday', '在周六'],
    ['on Sunday', '在周日'], ['on weekdays', '在工作日'],

    // —— 地点：in the / on the / at the ——
    ['in the park', '在公园里'], ['in the classroom', '在教室里'], ['in the library', '在图书馆里'],
    ['in the garden', '在花园里'], ['in the kitchen', '在厨房里'], ['in the bedroom', '在卧室里'],
    ['in the bathroom', '在浴室里'], ['in the living room', '在客厅里'], ['in the dining room', '在餐厅里'],
    ['in the room', '在房间里'], ['in the hall', '在大厅里'], ['in the street', '在街上'],
    ['in the city', '在城市里'], ['in the town', '在镇上'], ['in the countryside', '在乡下'],
    ['in the mountains', '在山里'], ['in the forest', '在森林里'], ['in the tree', '在树上'],
    ['in the water', '在水里'], ['in the river', '在河里'], ['in the sea', '在海里'],
    ['in the lake', '在湖里'], ['in the box', '在盒子里'], ['in the bag', '在包里'],
    ['in the desk', '在课桌里'], ['in the picture', '在图画里'], ['in the photo', '在照片里'],
    ['in the book', '在书里'], ['in the newspaper', '在报纸上'], ['in the letter', '在信里'],
    ['in the story', '在故事里'], ['in the sun', '在阳光下'], ['in the rain', '在雨中'],
    ['in the wind', '在风中'], ['in the corner', '在角落里'], ['in the center of', '在…中心'],
    ['in the east of', '在…的东部'], ['in the west of', '在…的西部'],
    ['in the south of', '在…的南部'], ['in the north of', '在…的北部'],
    ['in China', '在中国'], ['in bed', '在睡觉'], ['in the mirror', '在镜子里'],
    ['in the fridge', '在冰箱里'], ['in the office', '在办公室'],
    ['on the floor', '在地板上'], ['on the table', '在桌子上'], ['on the desk', '在书桌上'],
    ['on the wall', '在墙上'], ['on the blackboard', '在黑板上'], ['on the bed', '在床上'],
    ['on the chair', '在椅子上'], ['on the sofa', '在沙发上'], ['on the shelf', '在架子上'],
    ['on the bus', '在公交车上'], ['on the train', '在火车上'], ['on the plane', '在飞机上'],
    ['on the boat', '在船上'], ['on the road', '在路上'], ['on the street', '在街上'],
    ['on the river', '在河上'], ['on the lake', '在湖上'], ['on the grass', '在草地上'],
    ['on the moon', '在月球上'], ['on the box', '在盒子上'], ['on the cover', '在封面上'],
    ['on the list', '在清单上'], ['on the hill', '在小山上'], ['on the way home', '在回家的路上'],
    ["on one's way to", '在去…的路上'],
    ['at the table', '在桌边'], ['at the door', '在门口'], ['at the window', '在窗边'],
    ['at the desk', '在书桌前'], ['at the bus stop', '在公交车站'], ['at the station', '在车站'],
    ['at the airport', '在机场'], ['at the hotel', '在旅馆'], ['at the restaurant', '在餐馆里'],
    ['at the supermarket', '在超市'], ['at the market', '在市场'], ['at the crossing', '在十字路口'],
    ['at the traffic lights', '在红绿灯处'], ['at the back of', '在…后面'],
    ['at the front of', '在…前面'], ['at the corner of', '在…拐角处'],
    ['at the seaside', '在海边'],

    // —— 名词短语 ——
    ['good habits', '好习惯'], ['bad habits', '坏习惯'], ['junk food', '垃圾食品'],
    ['fast food', '快餐'], ['green tea', '绿茶'], ['hot water', '热水'],
    ['cold water', '凉水'], ['warm water', '温水'], ['fresh air', '新鲜空气'],
    ['clean water', '干净的水'], ['primary school', '小学'], ['middle school', '中学'],
    ['high school', '高中'], ['bus stop', '公交车站'], ['train station', '火车站'],
    ['post office', '邮局'], ['police station', '警察局'], ['shopping center', '购物中心'],
    ['sports meeting', '运动会'], ['birthday party', '生日聚会'], ['family photo', '全家福'],
    ['phone number', '电话号码'], ['email address', '电子邮箱'], ['orange juice', '橙汁'],
    ['healthy food', '健康食品'], ['Chinese food', '中餐'], ['school uniform', '校服'],
    ['sports shoes', '运动鞋'], ['best friend', '最好的朋友'], ['school gate', '校门口'],
    ['young people', '年轻人'], ['old people', '老人'], ['big city', '大城市'],
    ['wild animals', '野生动物'], ['paper cutting', '剪纸'], ['dragon boat', '龙舟'],
    ['rice dumplings', '粽子'],

    // —— 动词短语 ——
    ['do morning exercises', '做早操'], ['do eye exercises', '做眼保健操'],
    ['stay up late', '熬夜，睡得晚'], ['deal with', '处理，应对'], ['make me', '让我；使我'],
    ['get better', '变得更好'], ['get angry', '生气'],
    ['come home', '回家'], ['come to school', '来上学'],
    ['go to the park', '去公园'], ['go to the cinema', '去看电影'], ['go to the zoo', '去动物园'],
    ['go for a walk', '去散步'], ['go to sleep', '入睡'],
    ['turn green', '变绿'], ['think over', '仔细考虑'],
    ['work hard', '努力工作；努力学习'], ['study hard', '努力学习'],
    ['learn from', '向…学习'], ['learn about', '了解'], ['know about', '了解…的情况'],
    ['hear from', '收到…的来信'], ['hear of', '听说'], ['talk with', '和…交谈'],
    ['help each other', '互相帮助'], ['write to', '写信给'],
    ['say goodbye to', '向…告别'], ['say sorry to', '向…道歉'], ['say hello to', '向…问好'],
    ['thank you for', '因…感谢你'], ['welcome to', '欢迎来到'],
    ['the same as', '和…相同'], ['a lot', '很；非常；许多'],

    // —— the X of：孩子从中间点起也要能连成短语（at/by the end of 已有，
    // 但单独点 "the end of" 时同样要能整块出意思）——
    ['the end of', '…的末尾；…的结尾'], ['the beginning of', '…的开头'],
    ['the middle of', '…的中间'], ['the top of', '…的顶部'], ['the bottom of', '…的底部'],
    ['the foot of', '…的脚下'], ['the front of', '…的前部'], ['the back of', '…的后面'],
    ['the corner of', '…的拐角'], ['the name of', '…的名字'], ['the rest of', '其余的…'],

    // —— 口语短句 ——
    ['good idea', '好主意'], ['good luck', '好运'], ['best wishes', '最美好的祝愿'],
    ['well done', '做得好'], ['no problem', '没问题'], ['excuse me', '打扰一下'],
    ['thank you', '谢谢你'], ['what about', '…怎么样'], ['how about', '…怎么样'],

    // ===== v192（家长 2026-11-11）：「常见的 large desert、is close to 等等，
    // 都是非常简单的短语，也给画横线。每句尽量标出五六个、三四个」=====
    // 之前的表偏"动词短语/成语"，把最常见、最适合刚学翻译的孩子看的
    // 「形容词+名词」「be+形容词+介词」「动词+介词」「名词+名词」漏了一大片。
    // 这里按类型补齐；表外的组合由 collocAt 用本地词典自动拼（见下方）。
    // —— be + 形容词 + 介词（家长点名的 is close to 就是这一类）——
    ['be close to', '靠近…；离…近'], ['be far from', '离…远'],
    ['be near to', '离…近'], ['be similar to', '与…相似'],
    ['be sorry for', '为…感到抱歉'], ['be sorry about', '为…难过'],
    ['be happy with', '对…感到满意'], ['be pleased with', '对…满意'],
    ['be excited about', '对…感到兴奋'], ['be surprised at', '对…感到惊讶'],
    ['be worried about', '担心…'], ['be married to', '与…结婚'],
    ['be crowded with', '挤满了…'], ['be rich in', '富含…'],
    ['be short of', '缺少…'], ['be famous as', '作为…而出名'],
    ['be known for', '因…而闻名'], ['be responsible for', '对…负责'],
    ['be bad at', '不擅长…'], ['be good with', '善于应付…'],
    ['be careful with', '小心…'], ['be born in', '出生于'],
    ['be patient with', '对…有耐心'], ['be familiar with', '熟悉…'],
    ['be satisfied with', '对…满意'], ['be sure about', '对…有把握'],
    ['be out of', '从…出来；用完'], ['be up to', '由…决定'],
    ['be in danger', '处于危险中'], ['be in trouble', '遇到麻烦'],
    ['be on duty', '值日'], ['be at school', '在上学'],
    // —— 形容词 + 名词：刚开始翻译的孩子最容易一个词一个词去查 ——
    ['large desert', '大沙漠'], ['hot desert', '炎热的沙漠'],
    ['dry desert', '干旱的沙漠'], ['large area', '大片区域'],
    ['large population', '众多人口'], ['small population', '人口少'],
    ['modern city', '现代城市'],
    ['old city', '古城'], ['ancient city', '古城'],
    ['small town', '小镇'], ['tall building', '高楼'],
    ['high mountain', '高山'], ['long river', '长河'],
    ['wide river', '宽阔的河'], ['deep lake', '深湖'],
    ['deep sea', '深海'], ['blue sea', '蔚蓝的大海'],
    ['busy street', '繁华的街道'], ['quiet street', '安静的街道'],
    ['green trees', '绿树'], ['wild plants', '野生植物'], ['blue sky', '蓝天'],
    ['white clouds', '白云'], ['bright moon', '明亮的月亮'],
    ['beautiful beach', '美丽的海滩'], ['sunny day', '晴天'],
    ['rainy day', '雨天'], ['windy day', '刮风天'],
    ['cloudy day', '阴天'], ['snowy day', '下雪天'],
    ['cold winter', '寒冷的冬天'], ['hot summer', '炎热的夏天'],
    ['warm spring', '温暖的春天'], ['cool autumn', '凉爽的秋天'],
    ['heavy rain', '大雨'], ['strong wind', '大风'],
    ['dry weather', '干燥的天气'], ['wet weather', '潮湿的天气'],
    ['hot weather', '炎热的天气'], ['cold weather', '寒冷的天气'],
    ['nice weather', '好天气'], ['bad weather', '坏天气'],
    ['rainy season', '雨季'], ['dry season', '旱季'],
    ['fresh food', '新鲜的食物'], ['cold drink', '冷饮'],
    ['sweet fruit', '甜水果'], ['salty water', '咸水'],
    ['high temperature', '高温'], ['low temperature', '低温'],
    ['long history', '悠久的历史'], ['famous place', '著名的地方'],
    ['beautiful place', '美丽的地方'], ['quiet place', '安静的地方'],
    ['safe place', '安全的地方'], ['dangerous place', '危险的地方'],
    ['public place', '公共场所'], ['big problem', '大问题'],
    ['difficult problem', '难题'], ['easy question', '简单的问题'],
    ['hard work', '艰苦的工作'], ['good news', '好消息'],
    ['bad news', '坏消息'], ['interesting story', '有趣的故事'],
    ['funny story', '好笑的故事'], ['short story', '短篇故事'],
    ['true story', '真实的故事'], ['main idea', '中心思想'],
    ['key word', '关键词'], ['new word', '生词'],
    ['long sentence', '长句'], ['short sentence', '短句'],
    ['right answer', '正确答案'], ['wrong answer', '错误答案'],
    ['best answer', '最佳答案'], ['common mistake', '常见错误'],
    ['big mistake', '大错误'], ['great change', '巨大的变化'],
    ['big change', '大变化'], ['important change', '重要的变化'],
    ['good result', '好结果'], ['bad result', '坏结果'],
    ['final result', '最终结果'], ['high score', '高分'],
    ['low score', '低分'], ['good grade', '好成绩'],
    ['heavy traffic', '交通拥堵'], ['busy traffic', '交通繁忙'],
    ['good habit', '好习惯'], ['bad habit', '坏习惯'],
    ['healthy habit', '健康习惯'], ['daily life', '日常生活'],
    ['school life', '学校生活'], ['family life', '家庭生活'],
    ['city life', '城市生活'], ['country life', '乡村生活'],
    ['modern life', '现代生活'], ['busy life', '忙碌的生活'],
    ['happy life', '幸福的生活'], ['hard life', '艰苦的生活'],
    ['good example', '好榜样'], ['different answers', '不同的答案'], ['warm clothes', '暖和的衣服'],
    ['clean clothes', '干净的衣服'], ['new clothes', '新衣服'],
    ['old clothes', '旧衣服'], ['strong body', '强壮的身体'],
    ['healthy body', '健康的身体'], ['young children', '小孩子'],
    ['sick people', '病人'], ['famous people', '名人'],
    ['little girl', '小女孩'], ['little boy', '小男孩'],
    ['new student', '新同学'], ['good student', '好学生'],
    ['close friend', '亲密的朋友'],
    ['old friend', '老朋友'], ['new friend', '新朋友'],
    ['good friend', '好朋友'], ['family member', '家庭成员'],
    ['family name', '姓'], ['first name', '名'],
    ['last name', '姓'], ['full name', '全名'],
    ['science museum', '科学博物馆'],
    ['history museum', '历史博物馆'], ['art museum', '美术馆'],
    ['swimming pool', '游泳池'], ['football match', '足球比赛'],
    ['basketball game', '篮球比赛'], ['English class', '英语课'], ['Chinese class', '语文课'],
    ['maths class', '数学课'], ['music lesson', '音乐课'],
    ['art lesson', '美术课'], ['PE lesson', '体育课'],
    ['birthday cake', '生日蛋糕'],
    ['birthday card', '生日贺卡'], ['summer holiday', '暑假'],
    ['winter holiday', '寒假'], ['school trip', '学校旅行'],
    ['school bus', '校车'], ['school rule', '校规'], ['class rule', '班规'],
    ['traffic light', '交通灯'], ['traffic rules', '交通规则'],
    ['public transport', '公共交通'], ['fast train', '快车'],
    ['night market', '夜市'], ['morning exercise', '早操'],
    ['free time', '空闲时间'], ['lunch time', '午饭时间'],
    ['dinner time', '晚饭时间'], ['break time', '课间休息'],
    ['reading time', '阅读时间'], ['hard time', '艰难时期'],
    ['good time', '愉快的时光'], ['short time', '短时间'],
    ['last time', '上一次'], ['every time', '每次'],
    ['school things', '学习用品'], ['school subjects', '学校科目'],
    ['favorite subject', '最喜欢的科目'], ['favorite food', '最喜欢的食物'],
    ['favorite sport', '最喜欢的运动'], ['favorite animal', '最喜欢的动物'],
    ['favorite color', '最喜欢的颜色'], ['great man', '伟人'],
    ['kind man', '善良的人'], ['old man', '老人'],
    ['young man', '年轻人'], ['top student', '尖子生'],
    ['round table', '圆桌'], ['long table', '长桌'],
    ['big box', '大箱子'], ['small box', '小盒子'],
    ['new book', '新书'], ['old book', '旧书'],
    ['story book', '故事书'], ['picture book', '绘本'],
    ['English book', '英语书'], ['Chinese book', '语文书'],
    ['science book', '科学书'], ['history book', '历史书'],
    // —— 名词 + 名词 / 专有地理名词（W7 库布齐那篇就有）——
    ['Inner Mongolia', '内蒙古'], ['the Yellow River', '黄河'],
    ['the Yangtze River', '长江'], ['the Sahara Desert', '撒哈拉沙漠'],
    ['the Gobi Desert', '戈壁沙漠'], ['North China', '华北'],
    ['South China', '华南'], ['the United States', '美国'],
    ['the UK', '英国'], ['Beijing Opera', '京剧'],
    ['Chinese culture', '中国文化'],
    ['Chinese history', '中国历史'],
    ['world record', '世界纪录'], ['space station', '空间站'],
    ['solar energy', '太阳能'], ['green energy', '绿色能源'],
    ['climate change', '气候变化'], ['air pollution', '空气污染'],
    ['water pollution', '水污染'], ['noise pollution', '噪音污染'],
    ['plant trees', '植树'], ['save water', '节约用水'],
    ['protect the environment', '保护环境'],
    // —— 动词 + 介词 / 动词 + 名词（"住在…""去…"这一类）——
    ['live in', '住在…'], ['live on', '以…为生'],
    ['live with', '和…住在一起'], ['work in', '在…工作'],
    ['work for', '为…工作'], ['work with', '与…共事'],
    ['study at', '在…学习'], ['go to', '去…'],
    ['come to', '来到…'], ['travel to', '去…旅行'],
    ['move to', '搬到…'], ['return to', '回到…'],
    ['fly to', '飞往…'], ['drive to', '开车去…'],
    ['ride to', '骑车去…'], ['walk into', '走进…'],
    ['jump into', '跳进…'], ['fall into', '掉进…'],
    ['change into', '变成…'], ['divide into', '分成…'],
    ['get out of', '从…出来'], ['come out of', '从…出来'],
    ['walk out of', '走出…'], ['take out of', '从…拿出'],
    ['speak to', '对…说'], ['shout to', '对…喊'],
    ['point to', '指向…'], ['happen to', '发生在…身上'],
    ['lead to', '导致…'], ['add to', '增加…'],
    ['send to', '寄到…'], ['bring to', '带到…'],
    ['pass to', '传给…'], ['search for', '搜寻…'],
    ['ask for', '请求…'], ['pay for', '为…付钱'],
    ['care for', '照顾…'], ['prepare for', '为…准备'],
    ['leave for', '动身去…'], ['hope for', '希望…'],
    ['stand for', '代表…'], ['fight for', '为…奋斗'],
    ['dream of', '梦见…'], ['dream about', '梦想…'],
    ['hear about', '听说…'], ['get rid of', '摆脱…'],
    ['away from', '远离…'], ['suffer from', '遭受…'],
    ['begin with', '以…开始'], ['end with', '以…结束'],
    ['stay with', '和…待在一起'],
    ['share with', '与…分享'], ['compare with', '与…比较'],
    ['knock at', '敲…'], ['more than', '多于；超过'],
    ['less than', '少于'], ['so that', '以便；所以'],
    ['what if', '要是…怎么办'], ['why not', '为什么不'],
    ['not only', '不但'], ['even if', '即使'],
    ['even though', '尽管'], ['want to', '想要做…'], ['need to', '需要做…'],
    ['have to', '不得不'], ['try to', '试着做…'],
    ['decide to', '决定做…'], ['hope to', '希望做…'],
    ['plan to', '计划做…'], ['learn to', '学会做…'],
    ['start to', '开始做…'], ['begin to', '开始做…'],
    ['forget to', '忘记做…'], ['remember to', '记得做…'],
    ['enough to', '足够…去做'], ['would like', '想要'],
    ['I think', '我认为'], ['I hope', '我希望'],
    ['I believe', '我相信'], ['I know', '我知道'],
    ["I don't know", '我不知道'], ['let us', '让我们'],
    ['long ago', '很久以前'], ['in recent years', '近年来'],
    ['over the years', '多年来'], ['from then on', '从那时起'],
    ['since then', '从那以后'], ['up to now', '到目前为止'],
    ['day after day', '日复一日'], ['year after year', '年复一年'],
    ['more and more people', '越来越多的人'],
    // —— v192 补：题干/简单句里最常出现、却一个短语都标不出来的那些 ——
    ['years old', '…岁'], ['which sentence', '哪一句'],
    ['do you hear', '你听到…吗'], ['do you like', '你喜欢…吗'],
    ['do you have', '你有…吗'], ['do you want', '你想要…吗'],
    ['don\'t forget', '别忘了'], ['don\'t worry', '别担心'],
    ['in different colours', '用不同的颜色'], ['in different colors', '用不同的颜色'],
    ['very friendly', '非常友好'], ['very important', '非常重要'],
    ['too hot', '太烫；太热'], ['too cold', '太冷'],
    ['a teacher', '一位老师'], ['a doctor', '一位医生'],
    ['a student', '一名学生'], ['an honest boy', '一个诚实的男孩'],
    ['my homework', '我的作业'], ['my grandma', '我的奶奶'],
    ['my mother', '我的妈妈'], ['my father', '我的爸爸'],
    ['my family', '我的家庭'], ['my birthday', '我的生日'],
    ['in May', '在五月'], ['in June', '在六月'],
    ['in July', '在七月'], ['in August', '在八月'],
    ['be ten years old', '十岁'], ['be careful', '小心'],
    ['be quiet', '安静'], ['be happy', '开心'],
    ['be sad', '难过'], ['be angry', '生气'],
    ['be tired', '累了'], ['be hungry', '饿了'],
    ['be thirsty', '渴了'], ['be busy', '很忙'],
    ['feel better', '感觉好些'],
    ['speak English', '说英语'], ['learn English', '学英语'],
    ['read books', '读书'], ['write stories', '写故事'],
    ['tell stories', '讲故事'], ['ask questions', '提问'],
    ['answer questions', '回答问题'], ['make friends', '交朋友'],
    ['over there', '在那边'], ['right here', '就在这里'],
    // —— v193 补：AI 口语练习里的问答句框架 + 日常词块 ——
    // 家长 2026-11-11：「口语练习里一个句子要有两三个短语的提示」。
    // 口语题多是 What/How 疑问句和 I… 答句，光靠「形容词+名词」规则
    // 一句只能标 0~1 个，这里把问答框架本身也做成可直接点开的短语。
    ['what time', '几点'], ['how old', '几岁'],
    ['what color', '什么颜色'], ['what colour', '什么颜色'],
    ['what\'s your', '你的…是什么'], ['what is your', '你的…是什么'],
    ['what\'s the weather like', '天气怎么样'],
    ['how do you', '你怎么…'], ['what do you', '你…什么'],
    ['what did you', '你做了什么'], ['what are you', '你要…什么'],
    ['can you', '你能…吗'], ['could you', '你能…吗'],
    ['do you usually', '你通常…吗'], ['want to be', '想成为'],
    ['going to', '打算做…'], ['summer vacation', '暑假'],
    ['winter vacation', '寒假'], ['this summer', '今年夏天'],
    ['long hair', '长头发'], ['a pet dog', '一只宠物狗'],
    ['play games', '玩游戏'], ['playing games', '玩游戏'],
    ['like swimming', '喜欢游泳'],
    ['I like', '我喜欢'], ['I have', '我有'], ['I am', '我是'],
    ['I went', '我去了'], ['I will', '我将要'],
    ['I usually', '我通常'], ['I don\'t', '我不'],
    ['it is', '它是'], ['red envelopes', '红包'],
    ['Spring Festival', '春节'], ['help sick people', '帮助病人'],
    ['tell me about', '告诉我关于…'], ['your family', '你的家庭'],
    ['favorite holiday', '最喜欢的节日'], ['do my homework', '做我的作业'],
    ['a million dollars', '一百万美元'], ['the weather', '天气'],
    ['sunny and warm', '晴朗又暖和'], ['red envelope', '红包'],
    ['wash the dishes', '洗碗'],
    ['be rainy', '下雨'], ['be sunny', '晴朗'], ['be warm', '暖和'],
    ['be cold', '冷'], ['be cloudy', '阴天'], ['be windy', '刮风'],
    // 规则会把 close to 拼成「去关闭」（有道把 close 当动词），钉死它。
    ['close to', '靠近…'],
  ],

  _formIdx: null,
  _phraseIdx: null,

  _esc(s) { return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); },

  // 需要双写末尾辅音的短动词。只认这一张白名单 —— 用规则猜（CVC）会把
  // look 变成 lookked、visit 变成 visitted，宁可少写几个也不要教错。
  DBL_V: ('stop plan run get sit put cut dig shop drop chat swim win hit set '
    + 'let clap skip hug nod jog tap mop pop').split(/\s+/),

  // 规则动词的四形。
  _regularVerb(base) {
    const b = String(base || '').toLowerCase();
    if (!b) return null;
    const isE = /e$/.test(b) && !/ee$/.test(b);
    const isY = /[^aeiou]y$/.test(b);
    const dbl = this.DBL_V.indexOf(b) >= 0;
    const ing = /ie$/.test(b) ? b.slice(0, -2) + 'ying'
      : isE ? b.slice(0, -1) + 'ing'
      : dbl ? b + b.slice(-1) + 'ing' : b + 'ing';
    const past = isE ? b + 'd'
      : isY ? b.slice(0, -1) + 'ied'
      : dbl ? b + b.slice(-1) + 'ed' : b + 'ed';
    const s = /(s|x|ch|sh|o)$/.test(b) ? b + 'es'
      : isY ? b.slice(0, -1) + 'ies' : b + 's';
    return { past: past, pp: past, ing: ing, s: s };
  },

  // 一个动词 base 的全部形态（不规则表优先，规则表兜底）。
  verbForms(base) {
    const b = String(base || '').toLowerCase();
    if (!b) return null;
    const irr = this.V[b];
    if (irr) return { past: irr[0], pp: irr[1], ing: irr[2], s: irr[3] };
    if (this.REG_V.indexOf(b) >= 0) return this._regularVerb(b);
    return null;
  },

  isVerb(base) {
    const b = String(base || '').toLowerCase();
    return !!this.V[b] || this.REG_V.indexOf(b) >= 0;
  },

  // 反查表：任何形态 -> [{base, label}]
  _buildFormIdx() {
    if (this._formIdx) return this._formIdx;
    const idx = {};
    const add = (form, base, label) => {
      String(form || '').split('/').forEach(function (f) {
        f = f.trim().toLowerCase();
        if (!f) return;
        (idx[f] = idx[f] || []);
        if (!idx[f].some(x => x.base === base && x.label === label)) {
          idx[f].push({ base: base, label: label });
        }
      });
    };
    Object.keys(this.V).forEach((base) => {
      if (/2$/.test(base)) return;                 // 表里的重复项
      const f = this.V[base];
      add(f[0], base, '过去式');
      add(f[1], base, '过去分词');
      add(f[2], base, '现在分词');
      add(f[3], base, '第三人称单数');
    });
    this.REG_V.forEach((base) => {
      const f = this._regularVerb(base);
      if (!f) return;
      add(f.past, base, '过去式');
      add(f.ing, base, '现在分词');
      add(f.s, base, '第三人称单数');
    });
    Object.keys(this.IRREG_N).forEach((base) => {
      add(this.IRREG_N[base], base, '复数');
    });
    Object.keys(this.IRREG_A).forEach((base) => {
      const f = this.IRREG_A[base];
      add(f[0], base, '比较级');
      add(f[1], base, '最高级');
    });
    this._formIdx = idx;
    return idx;
  },

  // word 是某个词的变形吗？→ {base, labels:['过去式','过去分词']} / null
  inflectionOf(word) {
    const w = String(word || '').toLowerCase().replace(/[^a-z'\-]/g, '');
    if (!w || w.length < 2) return null;
    const idx = this._buildFormIdx();
    const hits = idx[w];
    if (hits && hits.length) {
      const labels = [];
      hits.forEach(h => { if (labels.indexOf(h.label) < 0) labels.push(h.label); });
      return { base: hits[0].base, labels: labels };
    }
    // 规则变形兜底：查不到就按规则拆一次，拆出来的 base 必须是我们认得的词。
    const tries = [];
    if (/ied$/.test(w)) tries.push(w.slice(0, -3) + 'y');
    if (/ed$/.test(w)) { tries.push(w.slice(0, -2)); tries.push(w.slice(0, -1)); }
    if (/ying$/.test(w)) tries.push(w.slice(0, -4) + 'ie');
    if (/ing$/.test(w)) { tries.push(w.slice(0, -3)); tries.push(w.slice(0, -3) + 'e'); }
    if (/ies$/.test(w)) tries.push(w.slice(0, -3) + 'y');
    if (/es$/.test(w)) tries.push(w.slice(0, -2));
    if (/s$/.test(w)) tries.push(w.slice(0, -1));
    for (let i = 0; i < tries.length; i++) {
      const b = tries[i];
      if (b.length < 2 || !this.isVerb(b)) continue;
      const f = this.verbForms(b);
      if (!f) continue;
      if (f.past === w || f.pp === w) return { base: b, labels: ['过去式'] };
      if (f.ing === w) return { base: b, labels: ['现在分词'] };
      if (f.s === w) return { base: b, labels: ['第三人称单数'] };
    }
    return null;
  },

  // base 的全部形态，给"点 base 也能看到它的变形"用。
  formsOf(word) {
    const w = String(word || '').toLowerCase();
    const out = [];
    const v = this.verbForms(w);
    if (v) {
      const push = (label, form) => {
        String(form || '').split('/').forEach(function (f) {
          f = f.trim();
          if (!f) return;
          if (!out.some(x => x.label === label && x.word === f)) out.push({ label: label, word: f });
        });
      };
      push('过去式', v.past);
      push('过去分词', v.pp);
      push('现在分词', v.ing);
      push('第三人称单数', v.s);
      out.push({ label: '将来时', word: 'will ' + w });
    }
    if (this.IRREG_N[w]) out.push({ label: '复数', word: this.IRREG_N[w] });
    if (this.IRREG_A[w]) {
      out.push({ label: '比较级', word: this.IRREG_A[w][0] });
      out.push({ label: '最高级', word: this.IRREG_A[w][1] });
    }
    return out;
  },

  // ===== 短语 =====
  // v163：家长「短语分化不够精细，有些还是会被漏掉」。原来只给首词是动词的
  // 条目生成形态，名词开头的（day off → days off）、one's 占位（do one's best
  // → do my best）、be 的各种人称都漏。现在四类统一生成：
  //   ① be 开头 → be/is/am/are/was/were/been/being
  //   ② 动词开头 → 原形/过去式/过去分词/现在分词/三单
  //   ③ 名词开头 → 单数 + 复数（不规则复数查 IRREG_N 反表）
  //   ④ 含 one's 的 → my/your/his/her/our/their
  _buildPhraseIdx() {
    if (this._phraseIdx) return this._phraseIdx;
    const idx = {};
    const self = this;
    const POSS = ['my', 'your', 'his', 'her', 'our', 'their'];

    // v193：字面写的条目优先登记，免得被别的词条自动生成的变形盖掉。
    // 例：go to 的变形会生成 "going to = 去…"，而口语里专门写了
    // "going to = 打算做…"；后者才是对孩子有用的解释。
    this.PHRASES.forEach(function (p) {
      const k = String(p[0]).toLowerCase().replace(/\s+/g, ' ');
      if (!idx[k]) idx[k] = { en: p[0], zh: p[1], surface: p[0] };
    });

    // 名词复数：先查不规则反表，再按规则加 -s/-es/-ies
    const pluralOf = function (n) {
      const w = String(n || '').toLowerCase();
      if (!w) return null;
      const rev = self._buildNounPluralRev && self._buildNounPluralRev();
      if (rev && rev[w]) return rev[w];
      if (/(s|x|ch|sh)$/.test(w)) return w + 'es';
      if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
      if (/f$/.test(w)) return w.slice(0, -1) + 'ves';
      return w + 's';
    };

    this.PHRASES.forEach(function (p) {
      const en = p[0], zh = p[1];
      const words = en.split(' ');
      const head = words[0];
      const rest = words.slice(1).join(' ');
      let forms = [];

      if (head === 'be') {
        ['be', 'is', 'am', 'are', 'was', 'were', 'been', 'being'].forEach(function (f) {
          forms.push(rest ? f + ' ' + rest : f);
        });
      } else if (head === 'there') {
        // there is / there are / there was / there were + 其余部分
        const tail = words.slice(2).join(' ');
        ['is', 'are', 'was', 'were'].forEach(function (f) {
          forms.push('there ' + f + (tail ? ' ' + tail : ''));
        });
        forms.push(en);
      } else {
        const vf = self.verbForms(head);
        if (vf) {
          [head, vf.past, vf.pp, vf.ing, vf.s].forEach(function (f) {
            String(f || '').split('/').forEach(function (one) {
              one = one.trim();
              if (one) forms.push(rest ? one + ' ' + rest : one);
            });
          });
        } else {
          forms.push(en);
          // 名词开头的短语：补一个复数形态（day off → days off）
          const pl = pluralOf(head);
          if (pl && pl !== head && rest) forms.push(pl + ' ' + rest);
        }
      }

      // one's 占位：do one's best → do my best / do his best …
      const expanded = [];
      forms.forEach(function (f) {
        if (f.indexOf("one's ") >= 0) {
          POSS.forEach(function (ps) { expanded.push(f.replace("one's ", ps + ' ')); });
        } else {
          expanded.push(f);
        }
      });
      forms = expanded;

      forms.forEach(function (f) {
        const k = f.toLowerCase().replace(/\s+/g, ' ');
        if (!idx[k]) idx[k] = { en: en, zh: zh, surface: f };
      });
    });
    this._phraseIdx = idx;
    return idx;
  },

  // 不规则复数反表（mice → mouse），给名词开头的短语用。
  _buildNounPluralRev() {
    if (this._pluralRev) return this._pluralRev;
    const rev = {};
    const src = this.IRREG_N || {};
    Object.keys(src).forEach(function (base) {
      const pl = String(src[base] || '').toLowerCase();
      if (pl && !rev[pl]) rev[pl] = base;
    });
    this._pluralRev = rev;
    return rev;
  },

  // 一串词里从第 i 个位置开始，最长能匹配到哪个短语。
  // tokens: 已经拆好的单词数组（不含标点）
  phraseAt(tokens, i) {
    const idx = this._buildPhraseIdx();
    // v163：最长 6 词（as soon as possible / on the other hand / in the middle of）
    const maxLen = 6;
    for (let len = maxLen; len >= 2; len--) {
      if (i + len > tokens.length) continue;
      const joined = tokens.slice(i, i + len).join(' ').toLowerCase();
      const hit = idx[joined];
      if (hit) {
        // v193：代词开头的弱 2 词块（it is / there is / I am）不许把后面
        // 更完整的固定搭配切碎 —— "it is close to" 必须让 is close to
        // 整块命中「靠近…」，而不是 it is + close to（会被规则拼成「去关闭」）。
        if (len === 2 && /^(it|there|this|that|he|she|i|you|we|they)$/
              .test(String(tokens[i] || '').toLowerCase())
            && this._handPhraseFrom(tokens, i + 1)) return null;
        return { len: len, en: hit.en, zh: hit.zh, surface: tokens.slice(i, i + len).join(' ') };
      }
    }
    // v163：代词插进短语中间（pick it up / take them off / put it on）。
    // 孩子点 "it" 也要能拿到 pick up，别只给一个 it。
    const PRON = ['it', 'them', 'him', 'her', 'me', 'us', 'you'];
    if (i + 2 < tokens.length && PRON.indexOf(String(tokens[i + 1] || '').toLowerCase()) >= 0) {
      const k = (tokens[i] + ' ' + tokens[i + 2]).toLowerCase();
      const h2 = idx[k];
      if (h2) {
        return { len: 3, en: h2.en, zh: h2.zh, surface: tokens.slice(i, i + 3).join(' ') };
      }
    }
    return null;
  },

  // 从 j 开始有没有 ≥3 词的**手写**固定搭配（给上面的让位判断用）。
  _handPhraseFrom(tokens, j) {
    const idx = this._buildPhraseIdx();
    for (let L = 6; L >= 3; L--) {
      if (j + L > tokens.length) continue;
      if (idx[tokens.slice(j, j + L).join(' ').toLowerCase()]) return true;
    }
    return false;
  },

  // ==========================================================================
  // v192：规则化搭配（家长 2026-11-11「每句尽量标出五六个、三四个短语」）
  //
  // 手写 PHRASES 再怎么补也补不完：large desert、in the desert、many people、
  // help sick people 这种"临时搭起来但一眼就该懂"的组合，孩子刚学翻译时
  // 恰恰最容易一个词一个词去查。这里用本地词典（LOCAL_DICT，随页面下发）
  // 把几类最常见的组合自动认出来，中文现拼，点一下就直接出意思：
  //   形容词 + 名词    large desert → 大的沙漠
  //   介词 + the + 名词 in the desert → 在沙漠里
  //   数量词 + 名词    many people → 许多人
  //   动词 + 宾语      clean houses → 打扫房子
  //   动词 + 介词      go to → 去
  // 手写表永远优先（phraseAtRich 先问它），所以 look forward to 这类固定
  // 搭配不会被拆开；规则只捡手写表漏下的那些。
  // ==========================================================================

  // 不能当"名词/形容词"用的功能词、常见动词、代词。
  STOP: ('a an the and or but if so of to in on at by for from with about into over under '
    + 'near along across through around between after before during since until than as '
    + 'is am are was were be been being do does did have has had will would can could '
    + 'should may might must not no nor yet very too quite also just only even still '
    + 'i you he she it we they me him her us them my your his its our their this that '
    + 'these those there here what which who whom whose when where why how one two '
    + 'three four five six seven eight nine ten first next last other another some any '
    + 'all each every both more most much many few little less least own same such '
    + 'because while although though unless whether either neither yes off out up down '
    + 'again once twice please thank yes ok').split(/\s+/),

  ADJ: ('large small big tall short long high low deep wide hot cold warm cool dry wet '
    + 'new old young beautiful lovely pretty nice clean dirty quiet busy noisy sunny '
    + 'rainy windy cloudy snowy different same important famous popular dangerous safe '
    + 'heavy light strong weak fast slow easy hard difficult interesting exciting bored '
    + 'boring delicious tasty favorite fresh sweet sour salty blue green red white black '
    + 'bright dark round ancient modern public free happy sad angry excited surprised '
    + 'worried afraid proud kind friendly polite helpful useful careful lucky healthy '
    + 'sick ill rich poor cheap expensive simple special true false whole enough '
    + 'best better worse great wonderful terrible hungry thirsty tired ready late early '
    + 'near far close main key common gentle soft loud clear gentle').split(/\s+/)
    .concat(('clever smart brave shy lazy honest patient cute funny silly naughty '
      + 'tidy neat huge tiny giant narrow thick thin flat straight empty full '
      + 'open closed broken lost missing sure certain natural local national '
      + 'international foreign western eastern traditional cultural historical '
      + 'medical scientific digital global daily weekly monthly yearly '
      + 'single double final usual normal strange quick sudden amazing '
      + 'excellent perfect awful glad upset nervous calm wise strict serious '
      + 'well fine warm friendly').split(/\s+/)),

  PREP_ZH: {
    in: '在', on: '在', at: '在', near: '在', under: '在', over: '在',
    beside: '在', behind: '在', around: '在', along: '沿着', across: '穿过',
    through: '穿过', into: '进入', from: '从', to: '去', with: '和',
    for: '为了', about: '关于', by: '在', of: '…的',
  },
  PREP_SUFFIX: {
    in: '里', on: '上', at: '', near: '附近', under: '下面', over: '上方',
    beside: '旁边', behind: '后面', around: '周围', along: '', across: '',
    through: '', into: '', from: '', to: '', with: '一起', for: '',
    about: '', by: '旁边', of: '',
  },
  QUANT_ZH: {
    many: '许多', much: '许多', some: '一些', several: '几个', no: '没有',
    every: '每个', each: '每个', another: '另一个', other: '其他的',
    more: '更多', most: '大多数', all: '所有的', both: '两个都',
  },
  DET_ZH: {
    my: '我的', your: '你的', his: '他的', her: '她的', our: '我们的',
    their: '他们的', this: '这个', that: '那个', these: '这些', those: '那些',
    a: '一个', an: '一个',
  },

  // v193：有道词典的头号义项有时不适合给孩子看，或者会拼出错误搭配
  // （like → 「像」，于是 I like swimming 变成「像游泳」；hair → 「毛发」，
  // long hair 变成「长的毛发」）。这里给一批高频词钉死短中文，仅用于
  // 规则拼短语，单词弹层仍显示词典原文。
  SHORT_ZH: {
    like: '喜欢', likes: '喜欢', liked: '喜欢', love: '喜爱',
    favorite: '最喜欢的', favourite: '最喜欢的',
    hair: '头发', pet: '宠物', playing: '玩', swimming: '游泳',
    sleeping: '睡觉', eating: '吃', reading: '读', writing: '写',
    walking: '走路', running: '跑步', cooking: '做饭', drawing: '画画',
    singing: '唱歌', dancing: '跳舞', shopping: '购物',
    subject: '科目', weather: '天气', holiday: '假日', vacation: '假期',
    homework: '作业', breakfast: '早饭', lunch: '午饭', dinner: '晚饭',
    weekend: '周末', morning: '早上', afternoon: '下午', evening: '晚上',
    expensive: '贵的', cheap: '便宜的', important: '重要的',
    delicious: '好吃的', beautiful: '美丽的', clever: '聪明的',
    kind: '友善的', tall: '高的', sunny: '晴朗的', warm: '暖和的',
    clean: '干净的', rainy: '下雨的', windy: '刮风的', cloudy: '多云的',
    eggs: '鸡蛋', books: '本书', classes: '节课', dishes: '碗碟',
    make: '做', makes: '做', making: '做', cost: '花费', costs: '花费',
    money: '钱', pollution: '污染', learned: '学会', lot: '许多',
  },
  // 「一个书 / 一个狗」这种量词错误，刚学翻译的孩子会照抄。冠词 + 名词
  // 的规则按名词配量词；没列到的通用「个」。
  CLASSIFIER: {
    book: '本', books: '些', dog: '只', cat: '只', pet: '只', bird: '只',
    fish: '条', student: '名', teacher: '位', doctor: '位', friend: '个',
    boy: '个', girl: '个', man: '位', woman: '位', child: '个',
    bus: '辆', car: '辆', bike: '辆', train: '列', photo: '张',
    picture: '张', tree: '棵', flower: '朵', river: '条', mountain: '座',
    school: '所', park: '个', room: '间', house: '座', desk: '张',
    chair: '把', letter: '封', song: '首', game: '个', class: '节',
  },
  // 数词 + 名词（five classes → 五节课）：口语句子里很常见。
  NUM_ZH: {
    one: '一', two: '两', three: '三', four: '四', five: '五',
    six: '六', seven: '七', eight: '八', nine: '九', ten: '十',
    eleven: '十一', twelve: '十二', twenty: '二十', thirty: '三十',
  },
  // 时间副词不能当名词：「warm today」不是「暖和的今天」。
  NOT_NOUN: ('today tomorrow yesterday tonight now then here there '
    + 'million hundred thousand billion dollars yuan '
    + "today's tomorrow's").split(/\s+/),

  measure(w) {
    const k = String(w || '').toLowerCase();
    return '一' + (this.CLASSIFIER[k] || '个');
  },

  // 从本地词典里取一个词的短中文（已经是清洗过的"大的/沙漠"这种）。
  zhOf(w) {
    const k = String(w || '').toLowerCase().replace(/[^a-z'\-]/g, '');
    if (!k || k.length < 2) return '';
    if (this.SHORT_ZH[k]) return this.SHORT_ZH[k];
    try {
      if (typeof LOCAL_DICT !== 'undefined' && LOCAL_DICT[k]) {
        const zh = String(LOCAL_DICT[k]).split('|')[0];
        // 有道残留的学科标签（"[禽]蛋"这种）不能拿去拼短语
        if (/[\[\]【】;；]/.test(zh)) return '';
        return zh && zh.length <= 10 ? zh : '';
      }
    } catch (e) {}
    return '';
  },

  isStop(w) { return this.STOP.indexOf(String(w || '').toLowerCase()) >= 0; },
  isAdj(w) { return this.ADJ.indexOf(String(w || '').toLowerCase()) >= 0; },
  isDet(w) { return ['the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'these', 'those'].indexOf(String(w || '').toLowerCase()) >= 0; },
  isVerb(w) {
    const k = String(w || '').toLowerCase();
    if (this.isStop(k)) return false;
    if (this.V[k] || this.REG_V.indexOf(k) >= 0) return true;
    // doing / visited / plays 这类变形也算动词（doing my homework 才连得起来）。
    // 只做轻量反推，不调 inflectionOf，避免和那边互相递归。
    const tries = [];
    if (/ing$/.test(k)) tries.push(k.slice(0, -3), k.slice(0, -3) + 'e');
    if (/ed$/.test(k)) tries.push(k.slice(0, -2), k.slice(0, -1));
    if (/ies$/.test(k)) tries.push(k.slice(0, -3) + 'y');
    if (/s$/.test(k)) tries.push(k.slice(0, -1));
    for (let i = 0; i < tries.length; i++) {
      const b = tries[i];
      if (b.length >= 2 && (this.V[b] || this.REG_V.indexOf(b) >= 0)) return true;
    }
    return false;
  },
  isNounish(w) {
    const k = String(w || '').toLowerCase();
    if (this.isStop(k) || this.isAdj(k) || this.isVerb(k)) return false;
    if (this.NOT_NOUN.indexOf(k) >= 0) return false;
    if (this.PREP_ZH[k] || this.QUANT_ZH[k] || this.isDet(k)) return false;
    const zh = this.zhOf(k);
    if (!zh || zh.length > 6) return false;
    // 中文里带"的"结尾的多半是形容词，不是名词
    if (/的$/.test(zh)) return false;
    return true;
  },

  // 规则搭配：从第 i 个词开始，能连成一个什么样的短语。
  // 返回 {len, en, zh, surface, rule:true}；认不出返回 null。
  collocAt(tokens, i) {
    const T = tokens || [];
    const n = T.length;
    if (i >= n) return null;
    const w = k => String(T[i + k] || '').toLowerCase();
    const zh = k => this.zhOf(w(k));
    const mk = (len, meaning) => {
      const parts = [];
      for (let k = 0; k < len; k++) parts.push(T[i + k]);
      return { len: len, en: parts.join(' ').toLowerCase(), zh: meaning,
               surface: parts.join(' '), rule: true };
    };

    // ① 介词 + the/a/an + 名词（in the desert → 在沙漠里）
    if (i + 2 < n && this.PREP_ZH[w(0)] && this.isDet(w(1)) && this.isNounish(w(2))) {
      const p = w(0), nz = zh(2);
      const pre = this.PREP_ZH[p], suf = this.PREP_SUFFIX[p] || '';
      let meaning = pre + nz + suf;
      if (p === 'of') meaning = nz + '的';
      if (p === 'to') meaning = '去' + nz;
      if (p === 'from') meaning = '从' + nz;
      if (p === 'for') meaning = '为了' + nz;
      if (p === 'about') meaning = '关于' + nz;
      if (p === 'with') meaning = '和' + nz + '一起';
      if (meaning && meaning.length <= 14) return mk(3, meaning);
    }

    const DET_ZH = this.DET_ZH;
    // ①b 物主词/冠词 + 形容词 + 名词（an honest boy → 一个诚实的男孩）。
    // 家长要「每句尽量五六个」：刚学翻译的孩子看 "my new book" 会一个词
    // 一个词去查，标成一块给「我的新书」才帮得上忙。
    if (i + 2 < n && DET_ZH[w(0)] && this.isAdj(w(1)) && this.isNounish(w(2))) {
      // 手写表里若有专门解释（large desert → 大沙漠），让手写赢：
      // 三词规则别抢在它前面把「一个大的沙漠」这种啰嗦说法塞给孩子。
      if (!this.phraseAt(T, i + 1)) {
        const az = zh(1), nz = zh(2);
        // v193：your favorite holiday 别拼成「你的最受喜爱的假日」——
        // 物主词碰到「最…的」形容词时把「的」让给形容词，读着才顺。
        const possessive = /^(my|your|his|her|our|their)$/.test(w(0));
        const det = (possessive && /最/.test(az)) ? DET_ZH[w(0)].replace(/的$/, '') : DET_ZH[w(0)];
        const meaning = det + (/的$/.test(az) ? az : az + '的') + nz;
        if (az && nz && meaning.length <= 14) return mk(3, meaning);
      }
    }

    // ①c 动词 + 物主词/冠词 + 名词（doing my homework → 做我的作业）
    const BE = ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being'];
    if (i + 2 < n && (this.isVerb(w(0)) || BE.indexOf(w(0)) >= 0)
        && DET_ZH[w(1)] && this.isNounish(w(2))) {
      const vz = BE.indexOf(w(0)) >= 0 ? '是' : zh(0);
      // v193：a/an 后面按名词配量词（have a book → 有一本书），别再「一个书」。
      const det = (w(1) === 'a' || w(1) === 'an') ? this.measure(w(2)) : DET_ZH[w(1)];
      const meaning = vz + det + zh(2);
      if (vz && zh(2) && meaning.length <= 14) return mk(3, meaning);
    }

    // ①e 形容词 + and + 形容词（sunny and warm → 晴朗又暖和）
    if (i + 2 < n && this.isAdj(w(0)) && w(1) === 'and' && this.isAdj(w(2))) {
      const az = zh(0), cz = zh(2);
      const meaning = az.replace(/的$/, '') + '又' + cz.replace(/的$/, '');
      if (az && cz && meaning.length <= 12) return mk(3, meaning);
    }

    if (i + 1 >= n) return null;
    const a = w(0), b = w(1);
    const az = zh(0), bz = zh(1);

    // ⓪ v193：like + 动名词/名词 = 「喜欢…」，不是「像…」。
    // （有道头号义项 like=像，I like swimming 以前拼成「像游泳」。）
    // 「What's the weather like…」这种 like 前面是 weather/look/be 时不算。
    if ((a === 'like' || a === 'likes' || a === 'love' || a === 'loves')
        && !this.isStop(b) && this.NOT_NOUN.indexOf(b) < 0 && bz
        && !/^(weather|look|looks|sound|sounds|seem|seems|feel|feels|be|is|are|am|was|were|what)$/
          .test(String(T[i - 1] || '').toLowerCase())) {
      const meaning = (a === 'love' || a === 'loves' ? '喜爱' : '喜欢') + bz.replace(/的$/, '');
      if (meaning.length <= 10) return mk(2, meaning);
    }
    // ⓪b be + 形容词（is important → 很重要 / is sunny → 很晴朗）
    if (BE.indexOf(a) >= 0 && this.isAdj(b) && bz) {
      const meaning = '很' + bz.replace(/的$/, '');
      if (meaning.length <= 10) return mk(2, meaning);
    }

    // ② 形容词 + 名词（large desert → 大的沙漠）
    if (this.isAdj(a) && this.isNounish(b) && az && bz) {
      const meaning = (/的$/.test(az) ? az : az + '的') + bz;
      if (meaning.length <= 14) return mk(2, meaning);
    }
    // ③ 数量词 + 名词（many people → 许多人）
    if (this.QUANT_ZH[a] && this.isNounish(b) && bz) {
      const meaning = this.QUANT_ZH[a] + bz;
      if (meaning.length <= 14) return mk(2, meaning);
    }
    // ③b 数词 + 名词（five classes → 五节课）
    if (this.NUM_ZH[a] && this.isNounish(b) && bz) {
      const meaning = this.NUM_ZH[a] + bz;
      if (meaning.length <= 12) return mk(2, meaning);
    }
    // ④ 动词 + 宾语（clean houses → 打扫房子）
    if (this.isVerb(a) && this.isNounish(b) && az && bz
        && !/的$/.test(az)
        && !/^(去|做|是|有|在|能|会|要|把|被|使|让)$/.test(az)) {
      const meaning = az + bz;
      if (meaning.length <= 12) return mk(2, meaning);
    }
    // ⑤ 动词 + 介词（walk along → 沿着走 / go to → 去）
    if (this.isVerb(a) && this.PREP_ZH[b] && az) {
      const pz = this.PREP_ZH[b];
      const meaning = (b === 'to' ? '去' + az : pz + az + (this.PREP_SUFFIX[b] || ''));
      if (meaning.length <= 12) return mk(2, meaning);
    }
    // ⑥ 名词 + 名词（school life → 学校生活），只在两个中文都很短时拼
    if (this.isNounish(a) && this.isNounish(b) && az && bz
        && az.length <= 4 && bz.length <= 4) {
      const meaning = az + bz;
      if (meaning.length <= 9) return mk(2, meaning);
    }
    // ⑦ 物主词/冠词 + 名词（my homework → 我的作业 / a teacher → 一位老师）。
    // 排除 the：the + 名词到处都是但几乎不带来新意思，画满横线反而碍眼。
    const detZh = DET_ZH[a];
    if (detZh && this.isNounish(b) && bz) {
      // v193：a/an 按名词配量词（a book → 一本书 / a dog → 一只狗）
      const meaning = (a === 'a' || a === 'an' ? this.measure(b) : detZh) + bz;
      if (meaning.length <= 12) return mk(2, meaning);
    }
    // ⑧ very / so / quite + 形容词（very friendly → 非常友好）
    if ((a === 'very' || a === 'so' || a === 'quite' || a === 'really')
        && this.isAdj(b) && bz) {
      const adv = a === 'so' ? '这么' : a === 'quite' ? '相当' : a === 'really' ? '真的' : '非常';
      const meaning = adv + bz.replace(/的$/, '');
      if (meaning.length <= 12) return mk(2, meaning);
    }
    // ⑨ 介词 + 名词（in deserts → 在沙漠里 / in May → 在五月）
    if (this.PREP_ZH[a] && this.isNounish(b) && bz && a !== 'of') {
      const pre = this.PREP_ZH[a], suf = this.PREP_SUFFIX[a] || '';
      let meaning = pre + bz + suf;
      if (a === 'to') meaning = '去' + bz;
      if (a === 'from') meaning = '从' + bz;
      if (a === 'for') meaning = '为了' + bz;
      if (a === 'about') meaning = '关于' + bz;
      if (a === 'with') meaning = '和' + bz + '一起';
      if (meaning.length <= 12) return mk(2, meaning);
    }
    return null;
  },

  // 手写表优先，规则兜底。阅读材料/作文/选项的排版用这一条（不影响
  // 跟读判分：那边仍只认手写表，避免把判分词盒切得太碎）。
  phraseAtRich(tokens, i) {
    const hand = this.phraseAt(tokens, i);
    if (hand) return hand;
    const c = this.collocAt(tokens, i);
    // v193：提示条要**直接把中文摆给孩子看**，规则拼出来的中文必须干净。
    // 有道残留标签、半截「…的」、混着英文的，宁可不画这一条横线。
    if (c && (!c.zh || c.zh.length > 14 || /[\[\]【】A-Za-z]/.test(c.zh)
              || /的$/.test(c.zh))) return null;
    return c;
  },

  // 整串是不是一个（或含有一个）固定搭配？给点词弹层用。
  phraseInfo(text) {
    const norm = String(text || '').toLowerCase().replace(/[^a-z'\- ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!norm) return null;
    const idx = this._buildPhraseIdx();
    if (idx[norm]) return { en: idx[norm].en, zh: idx[norm].zh, surface: text };
    // v192：规则认出来的搭配（in the desert / large desert）点开时也要
    // 立刻给中文 —— 不然孩子点了刚画横线的短语，弹层又去查网络。
    const toks = norm.split(' ');
    if (toks.length >= 2 && toks.length <= 4) {
      const c = this.collocAt(toks, 0);
      if (c && c.len === toks.length && c.zh) {
        return { en: norm, zh: c.zh, surface: text, rule: true };
      }
    }
    return null;
  },
};

// ===========================================================================
// Api — the public surface. app.js talks to this and nothing else.
// ===========================================================================
const Api = {
  // v142：登录核对（/api/class/status）的硬超时。这个请求站在**进 App 的
  // 必经路径**上，而 fetch 自己不会超时 —— Worker 冷启动时实测能挂 20 秒，
  // 孩子就在登录页干等。4 秒足够一次正常往返（实测 1.6s），超时按"查不到"
  // 处理，交给上层决定放行还是拦。
  CLASS_TIMEOUT_MS: 4000,

  // -- session ------------------------------------------------------------
  // Role resolution lives here, not in app.js. Today it is a phone-number
  // comparison; under Cloudflare it becomes a Worker call returning a real
  // token, and app.js does not change because it only reads session.role.
  session: null,

  async getSavedLogin() {
    return Store.readLogin();
  },

  // v142：同步读本机登录凭据（localStorage + 一年期 cookie 兜底）。
  // 登录按钮要用它判断"这台设备以前登录过没有"——登录过就直接进，
  // 不再等网络核对（见 App.registerStudent 的 fast 分支）。
  savedLoginSync() {
    return Store.readLogin();
  },

  async login(phone, name) {
    // v144：这个号以前在这台设备上登录过 → 草稿标 known，下次凭据被系统
    // 清掉时也能"一点就进"。第一次登录（本机没痕迹）仍然是 false。
    let known = false;
    try {
      const prev = Store.readLogin();
      known = !!(prev && prev.phone === phone);
    } catch (e) {}
    Store.writeLogin(phone, name, known);
    return this.resolveSession(phone, name);
  },

  // v143：同步版。角色判断只比手机号，本来就不需要 await。
  sessionSync(phone, name) {
    if (!this.session || this.session.phone !== phone || this.session.name !== name) {
      this.session = {
        phone: phone,
        name: name,
        role: isTeacherPhone(phone) ? 'teacher' : 'student',
        token: null,
        className: '',
      };
    }
    return this.session;
  },

  // 同步读凭据（不返回 Promise）。自动登录路径用它，避免多一次让出。
  getSavedLoginSync() {
    return Store.readLogin();
  },

  // v144：登录表单草稿（手机号 + 姓名）—— 刷新、重开都不丢。
  readLoginDraft() {
    return Store.readLoginDraft();
  },

  writeLoginDraft(phone, name, known) {
    return Store.writeLoginDraft(phone, name, known);
  },

  async resolveSession(phone, name) {
    this.session = {
      phone: phone,
      name: name,
      role: isTeacherPhone(phone) ? 'teacher' : 'student',
      token: null,       // Worker-issued later
      className: '',
    };
    return this.session;
  },

  async logout() {
    Store.clearLogin();
    this.session = null;
  },

  isTeacher() {
    return !!(this.session && this.session.role === 'teacher');
  },

  // -- assignments --------------------------------------------------------
  async getAssignments() {
    return typeof HOMEWORK_DATA !== 'undefined' ? HOMEWORK_DATA : [];
  },

  // -- bootstrap ----------------------------------------------------------
  // One read at startup. Becomes GET /api/bootstrap.
  // The returned collections are handed to App.state by reference: mutating
  // App.state.students mutates the document. That is a v1 shortcut which
  // keeps this refactor behaviour-identical; the write methods below are what
  // carry the real intent across to the backend.
  async loadState() {
    return Store.read();
  },

  // v143：同步版本。localStorage 本来就是同步的，`loadState()` 那层 async
  // 只是历史包袱 —— 而它站在登录路径上，多一个微任务就多一次让出主线程。
  loadStateSync() {
    return Store.read();
  },

  // -- students / classes -------------------------------------------------
  async saveStudent(student) {                       // -> UPSERT students
    const d = Store.doc();
    const i = d.students.findIndex(s => s.id === student.id || s.phone === student.phone);
    if (i >= 0) d.students[i] = student; else d.students.push(student);
    return Store.flush();
  },

  async saveStudents(students) {                     // -> batched UPSERT
    Store.doc().students = students;
    return Store.flush();
  },

  // Returns the surviving list. Callers assign it back into App.state rather
  // than filtering separately, so the two never drift apart.
  // Also records the phone as deleted: without the tombstone the next cloud
  // merge pulls the student straight back in from the blob.
  async deleteStudent(student) {                     // -> DELETE FROM students
    const d = Store.doc();
    d.students = d.students.filter(s => s.id !== student.id && s.phone !== student.phone);
    delete d.parentStudents[student.phone];
    d.deletedPhones = d.deletedPhones || [];
    if (student.phone && !d.deletedPhones.includes(student.phone)) {
      d.deletedPhones.push(student.phone);
    }
    Store.flush();
    return d.students;
  },

  // -- deletion tombstones -------------------------------------------------
  // A phone/class the teacher deleted. Kept in sync with the cloud blob by
  // CloudSync so the deletion sticks on every device (see CloudSync notes).
  // revived* is the opposite list: undoing a deletion has to override the
  // tombstone still sitting on another device (or on the cloud blob).
  async tombstonePhone(phone) {
    if (!phone) return;
    const d = Store.doc();
    d.deletedPhones = d.deletedPhones || [];
    if (!d.deletedPhones.includes(phone)) d.deletedPhones.push(phone);
    d.revivedPhones = (d.revivedPhones || []).filter(p => p !== phone);
    return Store.flush();
  },

  // Cleared when the teacher lets that student back in (approveJoin) or adds
  // them by hand (saveStudent) — otherwise the merge would keep hiding them.
  async untombstonePhone(phone) {
    if (!phone) return;
    const d = Store.doc();
    d.deletedPhones = (d.deletedPhones || []).filter(p => p !== phone);
    d.revivedPhones = d.revivedPhones || [];
    if (!d.revivedPhones.includes(phone)) d.revivedPhones.push(phone);
    return Store.flush();
  },

  async tombstoneClass(cls) {
    if (!cls) return;
    const d = Store.doc();
    d.deletedClasses = d.deletedClasses || [];
    if (!d.deletedClasses.includes(cls)) d.deletedClasses.push(cls);
    d.revivedClasses = (d.revivedClasses || []).filter(c => c !== cls);
    return Store.flush();
  },

  // Cleared when a class with that name is created (or renamed to) again.
  async untombstoneClass(cls) {
    if (!cls) return;
    const d = Store.doc();
    d.deletedClasses = (d.deletedClasses || []).filter(c => c !== cls);
    d.revivedClasses = d.revivedClasses || [];
    if (!d.revivedClasses.includes(cls)) d.revivedClasses.push(cls);
    return Store.flush();
  },

  hasTombstonePhone(phone) {
    return (Store.doc().deletedPhones || []).indexOf(phone) >= 0;
  },

  hasTombstoneClass(cls) {
    return (Store.doc().deletedClasses || []).indexOf(cls) >= 0;
  },

  async saveClasses(classes) {                       // -> REPLACE classes
    Store.doc().classes = classes;
    return Store.flush();
  },

  async saveParentStudent(phone, rec) {
    Store.doc().parentStudents[phone] = rec;
    return Store.flush();
  },

  // -- answers and check-ins ----------------------------------------------
  // Key shapes match what the existing renderers already read, so no render
  // code has to learn a new format.
  //
  // 多周轮换（v87）后，答题/打卡记录按周分段：第 2 周起 key 带上 _w<N>，
  // 不同周的同一题不会互相顶掉。第 1 周（HOMEWORK_WEEK_IDX === 0）刻意
  // 不加前缀 —— 沿用 v86 之前的 key 格式，孩子已积累的记录一条不丢。
  _weekTag() {
    const w = (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0;
    return w > 0 ? '_w' + w : '';
  },

  answerKey(studentId, dayIdx, moduleIdx, qIdx) {
    return studentId + this._weekTag() + '_d' + dayIdx + '_m' + moduleIdx + '_q' + qIdx;
  },

  checkinKey(studentId, dayIdx) {
    return studentId + this._weekTag() + '_d' + dayIdx;
  },

  // First answer wins. Choice questions lock themselves after one tap, but a
  // fill-in box can be retyped; without this the accuracy rate is gameable.
  async saveAnswer(studentId, dayIdx, moduleIdx, qIdx, value, correct) {
    const d = Store.doc();
    const key = this.answerKey(studentId, dayIdx, moduleIdx, qIdx);
    if (d.answers[key]) return { recorded: false, record: d.answers[key] };
    const rec = {
      id: uid(),
      studentId: studentId, dayIdx: dayIdx, moduleIdx: moduleIdx, qIdx: qIdx,
      value: value, correct: !!correct,
      at: new Date().toISOString(),
    };
    d.answers[key] = rec;
    Store.flush();
    return { recorded: true, record: rec };
  },

  // 属于「某周某天」的答案记录。**给答案挑记录时，前缀只有这一个来源。**
  //
  // ⚠️ v122 修的真 bug：这里原来是 studentId + '_d' + dayIdx + '_'，漏了
  // _weekTag()，而写入侧的 answerKey() 是**带**周标记的。于是第 2 周起
  // （2026-10-05 周一之后）这个函数恒返回空数组，saveCheckin 撞上"一条答案
  // 都没有"就直接 return null —— **打卡记录再也没被写下来过**。
  //
  // 症状和"没上后台"完全不同，是本地就断了：
  //   孩子端「孩子打卡」清一色未打卡 / 完成率对比全员 0/7 / 每日状态全是叉，
  //   后台的 checkins 表一条也没有（因为压根没人写过，v120/v121 的上报
  //   通道是好的，只是没东西可报）。
  // 改 answerKey() 或这里，必须两边一起改。
  _answerPrefix(studentId, dayIdx) {
    return studentId + this._weekTag() + '_d' + dayIdx + '_';
  },

  _dayAnswers(studentId, dayIdx) {
    const d = Store.doc();
    const prefix = this._answerPrefix(studentId, dayIdx);
    return Object.keys(d.answers)
      .filter(k => k.indexOf(prefix) === 0)
      .map(k => d.answers[k]);
  },

  // 保持 async：外部（及旧测试）按 Promise 用。
  async getAnswers(studentId, dayIdx) {
    return this._dayAnswers(studentId, dayIdx);
  },

  // 由本机答案算出某一天的打卡记录。同步、幂等 —— 正常答题路径和"补历史"
  // 路径共用一份算法，两条路算出来的数字必须一模一样。
  //
  // 完成时间取**这天最后一次答题的时刻**（本地时区 HH:MM），不是"现在"：
  // 补 10-12、10-13 的历史时用 now 会把三天前的作业记成今晚才做完。
  // done=true 只有在这天的每一道题都有记录时才成立；之前是 partial。
  buildCheckin(studentId, dayIdx, totalQuestions, prev) {
    const answered = this._dayAnswers(studentId, dayIdx);
    if (answered.length === 0) return null;
    const correct = answered.filter(a => a.correct).length;
    const full = totalQuestions > 0 && answered.length >= totalQuestions;
    const stamps = answered.map(a => a.at).filter(Boolean).sort();
    const lastISO = stamps.length ? stamps[stamps.length - 1] : new Date().toISOString();
    let t = new Date(lastISO);
    if (isNaN(t.getTime())) t = new Date();
    return {
      id: prev ? prev.id : uid(),
      studentId: studentId, dayIdx: dayIdx,
      done: full,
      completed: full ? 'full' : 'partial',
      answered: answered.length,
      total: totalQuestions,
      correctRate: Math.round(correct / answered.length * 100),
      wrongCount: answered.length - correct,
      time: String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'),
      at: lastISO,
    };
  },

  // Written from the first answer of the day onward, recomputed after each.
  async saveCheckin(studentId, dayIdx, totalQuestions, who) {
    const d = Store.doc();
    const key = this.checkinKey(studentId, dayIdx);
    const rec = this.buildCheckin(studentId, dayIdx, totalQuestions, d.checkins[key]);
    if (!rec) return null;
    d.checkins[key] = rec;
    Store.flush();

    // 同步烧进 D1（v120）。以前打卡只写本机 localStorage，所以孩子在自己
    // 手机上做完的作业，家长在另一台设备上看到的是"未打卡 / 完成天数 0 /
    // 每日状态全是叉"。fire-and-forget：上报失败绝不能影响孩子答题。
    this.reportCheckin(rec, who);
    return rec;
  },

  // 补回历史打卡（v122）。
  //
  // 答案一直都在本机 answers 里，只是第 2 周起没人把它们汇总成打卡（见
  // _answerPrefix）。这个函数按天重算一遍，逐条报到后台 —— 孩子**打开一次
  // App**，这几天的完成时间 / 正确率 / 错题数就全回来了。
  //
  //   dayTotals —— 每天的总题数（App._countDayQuestions），下标 = 第几天
  //
  // 只增不减：已经打过的卡不会因为"本机答案比云端少"而退回未打卡（一台没
  // 做过作业的手机不该把孩子的记录抹掉）。返回补出来的天数。
  repairCheckins(studentId, dayTotals, who) {
    if (!studentId || !Array.isArray(dayTotals)) return 0;
    const d = Store.doc();
    let fixed = 0;
    dayTotals.forEach((total, dayIdx) => {
      const key = this.checkinKey(studentId, dayIdx);
      const prev = d.checkins[key];
      let rec = this.buildCheckin(studentId, dayIdx, total, prev);
      if (!rec) return;
      if (prev) {
        // 与 worker 端 UPSERT 同一套判据：答题数更多的那份更可信，
        // 但 done 只增不减。
        const useNew = rec.answered >= (prev.answered || 0);
        const anyDone = !!prev.done || rec.done;
        rec = {
          id: prev.id || rec.id,
          studentId: studentId, dayIdx: dayIdx,
          done: anyDone,
          completed: anyDone ? 'full' : 'partial',
          answered: Math.max(prev.answered || 0, rec.answered),
          total: useNew ? rec.total : (prev.total || rec.total),
          correctRate: useNew ? rec.correctRate : (prev.correctRate || rec.correctRate),
          wrongCount: useNew ? rec.wrongCount : (prev.wrongCount || rec.wrongCount),
          time: useNew ? rec.time : (prev.time || rec.time),
          at: rec.at,
        };
        const same = !!(prev.done === rec.done
          && (prev.answered || 0) === rec.answered
          && prev.correctRate === rec.correctRate
          && prev.time === rec.time);
        if (same) return;          // 已经对的天不动，重复打开也不会反复报
      }
      d.checkins[key] = rec;
      fixed++;
      this.reportCheckin(rec, who);
    });
    if (fixed) Store.flush();
    return fixed;
  },

  // who（可选）：{name, phone, klass}。调用方已经知道这些，比在这里翻
  // Store.doc().students 更可靠 —— 孩子端可能压根没同步到自己的档案。
  //
  // rec.weekIdx（可选）：**补报历史时必须给**。不给就盖当前周 —— 那会把
  // 上一条第 2 周的记录写到第 3 周去（v121 修）。
  //
  // ===== v149：失败不再丢，进持久重试队列 ==================================
  // 家长 2026-10-22：「从周一过来之后的周二和周三，每个学生打卡的记录就没有
  // 同步过来。」查 D1：数据最后都进来了，但普遍**迟到 1~3 天** —— 孩子当晚
  // 答题时的上报，在手机弱网 / 锁屏 / 做完马上关页的情况下死在路上，而旧逻辑
  // 是 fire-and-forget，失败就永远丢了，只能等孩子下一次打开 App 补录。老师
  // 当晚检查，看到的就是一片"未打卡"。
  //
  // 现在：上报失败（网络错误 / 非 200）立即把 body 存进 localStorage 队列，
  // 由 flushCheckinQueue() 在打开 App、回前台、每分钟、网络恢复时重发，
  // 服务器确认 ok 才出队。请求本身加 keepalive —— 孩子答完最后一题就锁屏，
  // 这条请求也要能活到发出去。
  _ckQueueKey() { return 'amy_checkin_retry_v1'; },
  _loadCkQueue() {
    try { return JSON.parse(localStorage.getItem(this._ckQueueKey()) || '[]'); }
    catch (e) { return []; }
  },
  _saveCkQueue(q) {
    try { localStorage.setItem(this._ckQueueKey(), JSON.stringify(q.slice(-200))); }
    catch (e) { /* 存储满就算了：打卡上报绝不能把孩子卡住 */ }
  },
  _ckQueueId(body) {
    return [body.student_id, body.week_idx, body.day_idx].join('|');
  },
  _queueCheckin(body) {
    if (!body || !body.student_id) return;
    const q = this._loadCkQueue();
    const id = this._ckQueueId(body);
    // 同一条打卡（学生/周/天）只留最新的一份 —— 越晚的 body 答题数越多。
    const idx = q.findIndex(item => item && item.id === id);
    const entry = { id: id, body: body, at: new Date().toISOString() };
    if (idx >= 0) q[idx] = entry; else q.push(entry);
    this._saveCkQueue(q);
  },
  _flushingCheckins: false,
  // ===== v152：荣耀 / 华为自带浏览器上「打卡迟到」的根治 ====================
  // 家长 2026-10-23：有位同学用荣耀 70 自带浏览器，打卡记录总是"才更新上来"，
  // 老师当晚看就是"没打卡"，第二天才冒出来 —— 典型的误判。
  //
  // 原因：这类浏览器（尤其开了省流 / 极速模式）在页面切后台、锁屏、被划掉时
  // 会**直接掐掉还在飞的 fetch**，`keepalive` 请求头它们并不遵守；后台定时器
  // 又被节流到几乎不跑。于是那次上报死在路上，只能等孩子下次打开 App 由
  // 持久队列补发 —— 表现就是"迟到一天"。
  //
  // sendBeacon 是浏览器自己持有的请求：页面已经关了、被冻结了，它也照发。
  // 服务端是 UPSERT（同一条打卡重复写不会坏），所以 beacon 和 fetch 可以
  // 同时用，宁可发两遍也不能漏。
  _ckBeacon(body) {
    try {
      if (!body) return false;
      if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;
      const payload = JSON.stringify(body);
      let data = payload;
      // text/plain 属于「简单请求」，跨域也不触发预检；worker 那边用
      // request.json() 解析，不看 Content-Type，所以照样能读。
      try { data = new Blob([payload], { type: 'text/plain;charset=UTF-8' }); } catch (e) {}
      const sent = navigator.sendBeacon(this._classUrl('/api/checkins/report'), data);
      return sent === true;
    } catch (e) { return false; }
  },
  // 孩子还停在页面上时，隔几秒自己再试 —— 弱网抖一下本来几秒就能补上，
  // 不该拖到"下次打开 App"。队列里已经没有这条了就提前收工。
  _ckRetryLater(body, delays) {
    if (!body || !delays || !delays.length) return;
    const id = this._ckQueueId(body);
    const next = delays.slice(1);
    const run = () => {
      try {
        const still = this._loadCkQueue().some(it => it && it.body && this._ckQueueId(it.body) === id);
        if (!still) return;
        Promise.resolve(this.flushCheckinQueue()).then(() => {
          if (next.length) this._ckRetryLater(body, next);
        });
      } catch (e) { /* 重试本身绝不能影响孩子用 App */ }
    };
    try { setTimeout(run, delays[0]); } catch (e) {}
  },
  // opts.beacon = true：页面正在离场（切后台 / 关闭 / 被冻结），只能走 beacon。
  // beacon 拿不到回执，所以这种情况下**不**把条目从队列里删掉 —— 下次打开
  // App 再发一遍（UPSERT 幂等），宁可多一条重复请求，也不能少一条打卡。
  async flushCheckinQueue(opts) {
    const beaconOnly = !!(opts && opts.beacon);
    if (this._flushingCheckins && !beaconOnly) return 0;
    const q = this._loadCkQueue();
    if (!q.length) return 0;
    if (!beaconOnly) this._flushingCheckins = true;
    let sent = 0;
    const remain = [];
    for (let i = 0; i < q.length; i++) {
      const item = q[i];
      if (!item || !item.body) continue;
      if (beaconOnly) {
        this._ckBeacon(item.body);
        remain.push(item);          // 没有回执，保留到下次确认成功再删
        continue;
      }
      let ok = false;
      try {
        const res = await fetch(this._classUrl('/api/checkins/report'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body),
          keepalive: true,
        });
        ok = res.ok;
      } catch (e) { ok = false; }
      if (ok) sent++; else remain.push(item);
    }
    this._saveCkQueue(remain);
    if (!beaconOnly) this._flushingCheckins = false;
    return sent;
  },
  reportCheckin(rec, who) {
    if (!rec || !rec.studentId) return Promise.resolve(null);
    const w = who || {};
    const stu = (Store.doc().students || []).find(s => s.id === rec.studentId) || {};
    const curWeek = (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0;
    // v161：上报带客户端版本号。后台存下来，以后再出"哪台设备报了怪数据"
    // 的事，查一行就知道是哪个版本干的好事（2026-10-26 串周事件后加的）。
    let clientVer = 0;
    try {
      const meta = document.querySelector('meta[name="app-version"]');
      if (meta) clientVer = parseInt(meta.getAttribute('content'), 10) || 0;
    } catch (e) {}
    const body = {
      student_id: rec.studentId,
      student_name: w.name || stu.name || '',
      student_phone: w.phone || stu.phone || '',
      student_class: w.klass || stu.class || '',
      week_idx: (typeof rec.weekIdx === 'number') ? rec.weekIdx : curWeek,
      day_idx: rec.dayIdx,
      done: !!rec.done,
      completed: rec.completed,
      answered: rec.answered,
      total: rec.total,
      correct_rate: rec.correctRate,
      wrong_count: rec.wrongCount,
      finish_time: rec.time,
      client_ver: clientVer,
    };
    const fail = (why) => {
      this._queueCheckin(body);
      // v152：fetch 死在路上（荣耀 / 华为自带浏览器切后台就掐）时立刻补一发
      // beacon —— 这是页面即将被关掉时唯一还能送出去的通道。
      this._ckBeacon(body);
      // 孩子还停在页面上：2s / 6s / 15s / 40s 自己再试几轮，当场补上，
      // 不拖到"下次打开 App"。
      this._ckRetryLater(body, [2000, 6000, 15000, 40000]);
      console.warn('reportCheckin failed (' + why + '), 已 beacon + 进重试队列');
      return null;
    };
    return fetch(this._classUrl('/api/checkins/report'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).then(res => (res.ok ? res.json() : fail('http ' + res.status)))
      .catch(e => fail((e && e.message) || 'network'));
  },

  // 读后台打卡。一台设备上报、所有设备可见。
  //   opts.studentId —— 一个学生；opts.klass —— 整个班
  //
  // 失败返回 **null**（不是 []）：调用方要能分清"后台说这个孩子没打卡"
  // 和"这次没读到"。后者绝不能拿来当结论，否则一断网全班又变回一天未打卡。
  async fetchCheckins(opts) {
    opts = opts || {};
    const q = [];
    if (opts.studentId) q.push('student_id=' + encodeURIComponent(opts.studentId));
    else if (opts.klass) q.push('class=' + encodeURIComponent(opts.klass));
    else return null;
    q.push('week=' + ((typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0));
    try {
      const res = await fetch(this._classUrl('/api/checkins?' + q.join('&')), { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return (data && Array.isArray(data.rows)) ? data.rows : null;
    } catch (e) { console.warn('fetchCheckins failed:', e); return null; }
  },

  async getCheckin(studentId, dayIdx) {
    return Store.doc().checkins[this.checkinKey(studentId, dayIdx)] || null;
  },

  // -- vocabulary ---------------------------------------------------------
  // Read once at startup into App.state; the vocab renderer looks words up
  // synchronously while building HTML and cannot await.
  async getLearnedWords() {
    return Store.readWords();
  },

  async saveLearnedWords(dayIdx, words) {
    const map = Store.readWords();
    map['day_' + dayIdx] = words;
    Store.writeWords(map);
    return map;
  },

  // -- recordings ---------------------------------------------------------
  // Returns an opaque url. Today an object URL over an IndexedDB blob;
  // later a signed R2 url. Callers must not assume it is permanent.
  async uploadRecording(blob, meta) {
    const rec = Object.assign({
      id: uid(),
      at: new Date().toISOString(),
      mime: blob && blob.type ? blob.type : 'audio/webm',
      size: blob ? blob.size : 0,
    }, meta || {});
    try {
      await RecStore.put(RecStore.CLIPS, Object.assign({}, rec, { blob: blob }));
    } catch (e) {
      // IndexedDB unavailable (private mode, quota). Recording still plays
      // back this session via the object url; it just will not survive.
      console.warn('uploadRecording: persistence failed, session-only:', e);
    }
    return { id: rec.id, url: URL.createObjectURL(blob), meta: rec };
  },

  async getRecordings(filter) {
    let all = [];
    try { all = await RecStore.all(RecStore.CLIPS); } catch (e) { return []; }
    const f = filter || {};
    return all
      .filter(r => (f.studentId === undefined || r.studentId === f.studentId))
      .filter(r => (f.dayIdx === undefined || r.dayIdx === f.dayIdx))
      .map(r => ({ id: r.id, url: r.blob ? URL.createObjectURL(r.blob) : null, meta: r }));
  },

  // -- speaking scores ----------------------------------------------------
  async submitSpeakingScore(record) {
    const rec = Object.assign({ id: uid(), at: new Date().toISOString() }, record || {});
    try { await RecStore.put(RecStore.SCORES, rec); }
    catch (e) { console.warn('submitSpeakingScore failed:', e); }
    return rec;
  },

  async getSpeakingRecords(filter) {
    let all = [];
    try { all = await RecStore.all(RecStore.SCORES); } catch (e) { return []; }
    const f = filter || {};
    return all
      .filter(r => (f.studentId === undefined || r.studentId === f.studentId))
      .filter(r => (f.dayIdx === undefined || r.dayIdx === f.dayIdx));
  },

  // A student asking only "which class am I in?". Deliberately not syncDown:
  // it must not merge the whole roster onto a student's device.
  // Becomes GET /api/me once the Worker exists.
  async fetchMyAssignment(phone) {
    if (!CloudSync.available()) return null;
    try {
      const cloudData = await Cloud.loadAll();
      if (!cloudData || !cloudData.students) return null;
      const me = cloudData.students.find(s => s.phone === phone);
      return (me && me.class) ? { className: me.class } : null;
    } catch (e) { console.warn('fetchMyAssignment error:', e); return null; }
  },

  // -- class removal gate / re-join approval (D1 backend) ------------------
  // Same-origin in production, api. subdomain as fallback — same rule as
  // the transcribe URL below.
  get CLASS_API_BASE() {
    const h = (typeof location !== 'undefined' && location.hostname) || '';
    const sameZone = h === 'amyeng.top' || h.endsWith('.amyeng.top');
    return sameZone ? '' : this.API_HOST;
  },

  _classUrl(path) {
    return this.CLASS_API_BASE + path;
  },

  // Student login gate. Returns null on ANY failure (network, non-200,
  // malformed) — callers must treat null as "no restriction" so a missing
  // backend can never lock every child out of the app.
  //
  // 老师号在这里直接放行：白名单在客户端先挡一次，worker 再挡一次。
  async classStatus(phone) {
    if (isTeacherPhone(phone)) return { removed: false, removedAt: null, request: null, teacher: true };
    // v142（家长 2026-10-18）：「登录界面花的时间太久，学生在这儿等很久都
    // 没登进去」。实测就是这个请求 —— Worker 冷启动 / 手机弱网时 fetch 会
    // **一直挂着**，量到过 20 秒才回来（重试还有 3 趟），孩子当然登不进。
    // fetch 本身没有超时，必须自己掐表。
    var ms = this.CLASS_TIMEOUT_MS;
    var ctrl = null, timer = null;
    var opts = {};
    try {
      if (typeof AbortController !== 'undefined') {
        ctrl = new AbortController();
        opts.signal = ctrl.signal;
        timer = setTimeout(function() { try { ctrl.abort(); } catch (e) {} }, ms);
      }
      const res = await fetch(this._classUrl('/api/class/status?phone=' + encodeURIComponent(phone)), opts);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && typeof data.removed === 'boolean') return data;
      return null;
    } catch (e) { console.warn('classStatus failed:', e); return null; }
    finally { if (timer) clearTimeout(timer); }
  },

  // Teacher removed a student — record the gate server-side. Fire-and-forget
  // is NOT ok here: losing this write silently reopens the loophole. Still
  // returns a bool so the caller can warn, not block, on failure.
  async classRemove(phone, name) {
    try {
      const res = await fetch(this._classUrl('/api/class/remove'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, name: name, teacher: this.session && this.session.phone }),
      });
      return res.ok;
    } catch (e) { console.warn('classRemove failed:', e); return false; }
  },

  // Teacher removed a whole batch. Same endpoint, one round trip.
  //
  // 老师 2026-10-15：「点了全选删除之后……只要删除了，任何人再进来都需要老师验证」。
  // 之前批量删除走的是 N 次单个 classRemove：手机上几十个号码就是几十次往返，
  // 中间断一次那一批就静默漏掉（而且失败只报一个数字，老师看不出是谁漏了）。
  // 一批一次请求，服务端同一段 SQL，不可能和单号路径跑偏。
  // 返回服务端确认写入的人数；请求本身失败返回 null（调用方绝不能在 null 上
  // 报成功，否则老师以为删掉了、其实后台一个都没进）。
  async classRemoveMany(entries) {
    const payload = (entries || [])
      .map(e => ({ phone: String((e && e.phone) || '').trim(), name: String((e && e.name) || '').slice(0, 60) }))
      .filter(e => e.phone);
    if (!payload.length) return 0;
    try {
      const res = await fetch(this._classUrl('/api/class/remove'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: payload, teacher: this.session && this.session.phone }),
      });
      if (!res.ok) return null;
      const d = await res.json();
      return (d && typeof d.count === 'number') ? d.count : payload.length;
    } catch (e) { console.warn('classRemoveMany failed:', e); return null; }
  },

  // Read the gate list back and say which phones are ACTUALLY gated.
  //
  // 这是「删除 = 一定进拦截名单」这条承诺的唯一验收方式：写入返回 200 不代表
  // 那一行真的落库（老师那会儿正没信号、服务端 500、请求被中间层吞掉都可能）。
  // 拿不到名单时返回 null（= 无法确认），调用方必须把 null 当成"没验证成功"，
  // 而不是默认成功。
  async verifyGated(phones) {
    const want = (phones || []).filter(Boolean);
    if (!want.length) return { ok: true, missing: [] };
    const list = await this.classRemovedList();
    if (list === null) return null;                  // 名单拉不到 = 验不了
    const have = new Set(list.map(g => String((g && g.phone) || '').trim()));
    const missing = want.filter(p => !have.has(String(p).trim()));
    return { ok: missing.length === 0, missing: missing };
  },

  // Student asks to re-join. Returns { ok } or null on network failure.
  async classJoinRequest(phone, name) {
    try {
      const res = await fetch(this._classUrl('/api/class/join-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, name: name }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { console.warn('classJoinRequest failed:', e); return null; }
  },

  // Teacher: pending re-join applications. [] on failure (a failed poll
  // just means the list stays as it was).
  async classJoinRequests(teacherPhone) {
    try {
      const res = await fetch(this._classUrl('/api/class/join-requests?teacher=' + encodeURIComponent(teacherPhone)));
      if (!res.ok) return null;
      const data = await res.json();
      return (data && Array.isArray(data.requests)) ? data.requests : [];
    } catch (e) { console.warn('classJoinRequests failed:', e); return null; }
  },

  // Teacher: approve / deny an application. { ok } or null on failure.
  async classResolveJoinRequest(id, action) {
    try {
      const res = await fetch(this._classUrl('/api/class/join-request/resolve'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, action: action, teacher: this.session && this.session.phone }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { console.warn('classResolveJoinRequest failed:', e); return null; }
  },

  // Teacher: everyone the teacher has removed/deleted. This is the D1 移出名单
  // — the thing that decides whether a phone may log in at all. [] on failure.
  async classRemovedList() {
    try {
      const res = await fetch(this._classUrl('/api/class/removed-list?teacher=' + encodeURIComponent(this.session && this.session.phone)));
      if (!res.ok) return null;
      const data = await res.json();
      return (data && Array.isArray(data.removed)) ? data.removed : [];
    } catch (e) { console.warn('classRemovedList failed:', e); return null; }
  },

  // Teacher: let one phone back in WITHOUT it having to apply first.
  // This is the only door that opens the gate from the teacher side, and it
  // is deliberately an explicit click — never a side effect of a sync.
  async classUnblock(phone) {
    if (!phone) return false;
    try {
      const res = await fetch(this._classUrl('/api/class/unblock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, teacher: this.session && this.session.phone }),
      });
      return res.ok;
    } catch (e) { console.warn('classUnblock failed:', e); return false; }
  },

  // Teacher: clear a whole batch. Returns how many the server confirmed, or
  // null if the request itself failed — a caller must NOT report success on
  // null, or the teacher is left believing 48 numbers are gone when they are
  // still gated (and the list will reappear on the next refresh).
  async classUnblockMany(phones) {
    const list = (phones || []).map(p => String(p || '').trim()).filter(Boolean);
    if (!list.length) return 0;
    try {
      const res = await fetch(this._classUrl('/api/class/unblock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: list, teacher: this.session && this.session.phone }),
      });
      if (!res.ok) return null;
      const d = await res.json();
      return (d && typeof d.count === 'number') ? d.count : list.length;
    } catch (e) { console.warn('classUnblockMany failed:', e); return null; }
  },

  // -- wrong-question archive (D1) -----------------------------------------
  // Student fires this from saveAnswer when correct=false. Best-effort: a
  // failed report does not block local storage, so the kid still gets
  // immediate feedback. The duplicate path (UNIQUE violation) is the
  // expected outcome when a student retries — keep the first record.
  async reportWrongQuestion(studentId, studentName, phone, payload) {
    try {
      const res = await fetch(this._classUrl('/api/wrong-questions/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({
          student_id: studentId,
          student_name: studentName,
          student_phone: phone,
        }, payload || {})),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { console.warn('reportWrongQuestion failed:', e); return null; }
  },

  // Teacher: list every row for one student. Returns [] on any failure.
  async getStudentWrongQuestions(teacherPhone, studentId) {
    try {
      const res = await fetch(this._classUrl(
        '/api/wrong-questions?teacher=' + encodeURIComponent(teacherPhone) +
        '&student_id=' + encodeURIComponent(studentId)
      ));
      if (!res.ok) return [];
      const data = await res.json();
      return (data && Array.isArray(data.rows)) ? data.rows : [];
    } catch (e) { console.warn('getStudentWrongQuestions failed:', e); return []; }
  },

  // Teacher: full archive (most recent first, capped server-side at 1000).
  async getAllWrongQuestions(teacherPhone) {
    try {
      const res = await fetch(this._classUrl(
        '/api/wrong-questions?teacher=' + encodeURIComponent(teacherPhone)
      ));
      if (!res.ok) return [];
      const data = await res.json();
      return (data && Array.isArray(data.rows)) ? data.rows : [];
    } catch (e) { console.warn('getAllWrongQuestions failed:', e); return []; }
  },

  // Teacher: wipe one student's archive. { deleted } or null on failure.
  async clearStudentWrongQuestions(teacherPhone, studentId) {
    try {
      const res = await fetch(this._classUrl(
        '/api/wrong-questions/by-student?teacher=' + encodeURIComponent(teacherPhone) +
        '&student_id=' + encodeURIComponent(studentId)
      ), { method: 'DELETE' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { console.warn('clearStudentWrongQuestions failed:', e); return null; }
  },

  // -- v195 · 单词星球全班实时积分榜 ---------------------------------------
  // 家长：「每个学生的积分是透明的，Yunus 能看见其他几个学生的积分，
  //   就跟打卡同步一样，每台手机看到的都是同一个实时排名。」
  // 所以积分的**唯一真相在后台 D1**，本机 localStorage 只当离线待发队列。
  // 上报的是「这一轮赢了多少」的增量，云端做加法 —— 换手机、清缓存、
  // 两台设备同时玩，都不会互相覆盖，也不会把分丢掉。
  async reportGameScore(body) {
    if (!body || !body.student_id) return false;
    try {
      let ver = 0;
      try {
        const meta = document.querySelector('meta[name="app-version"]');
        if (meta) ver = parseInt(meta.getAttribute('content'), 10) || 0;
      } catch (e) {}
      const payload = Object.assign({}, body, { client_ver: ver });
      const res = await fetch(this._classUrl('/api/game-scores/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (!res.ok) return false;
      const d = await res.json();
      return !!(d && d.ok);
    } catch (e) { return false; }
  },

  // 失败返回 null（不是 []）—— 断网和「后台一个人都没有」必须分得清，
  // 否则孩子一离线就看到空榜，以为同学们的分数都没了。
  async fetchGameScores() {
    try {
      const res = await fetch(this._classUrl('/api/game-scores'), { cache: 'no-store' });
      if (!res.ok) return null;
      const d = await res.json();
      return (d && Array.isArray(d.rows)) ? d : null;
    } catch (e) { return null; }
  },

  // -- speech recognition -------------------------------------------------
  // Posts 16kHz mono WAV to our own Worker, which calls Workers AI Whisper.
  // Deliberately NOT the browser's SpeechRecognition: that is Chrome-only and
  // streams the audio to Google, which is unreachable from the mainland.
  //
  // Recognition is an enhancement, never a dependency. Every caller must work
  // when this returns null: the clip is already saved locally by then, and the
  // teacher can listen regardless.
  // Same-origin when the app is served from amyeng.top — no CORS preflight,
  // which is one less round trip on a flaky connection. Anywhere else
  // (local dev, another host) falls back to the api. subdomain.
  API_HOST: 'https://api.amyeng.top',
  get TRANSCRIBE_URL() {
    const h = (typeof location !== 'undefined' && location.hostname) || '';
    const sameZone = h === 'amyeng.top' || h.endsWith('.amyeng.top');
    return (sameZone ? '' : this.API_HOST) + '/api/transcribe';
  },
  // v98：服务端两条通道改成并行竞速（阿里云 2.6s 上限 / Cloudflare 7s 上限），
  // 最坏情况已经压到 9 秒以内。之前 15 秒的上限形同虚设 —— 孩子早就不耐烦了，
  // 而且真到 15 秒才 abort，这一次朗读直接变成"识别失败"，白读。
  //
  // v124：服务端阿里云上限放宽到 3.2s，客户端又会对"空返回"再打一趟（见
  // transcribe）—— 两趟串行的最坏情况要留够，所以 12s 提到 18s。
  // 正常情况完全碰不到这个上限（一趟 0.7~1.5s），它只是兜住"服务端真挂了"。
  // v131：重试收敛成"整次朗读 ≤2 趟"，单趟预算由 _asrBudget 统一下发，
  // 这个常量降级为**兜底上限**（见 ASR_BUDGET_MS）。保持不变以免影响旧行为。
  // v195：18s → 6s。单趟超时不该比整次朗读的总预算还长；真正管事的是
  // 下面的 ASR_BUDGET_MS，这个只是最后一道保险。
  TRANSCRIBE_TIMEOUT: 6000,

  // ===== v131：ASR 性能埋点 =================================================
  //
  // 家长要的是"出分快一点"。要优化就得先有数字 —— 这一版先把每次朗读的
  // 真实耗时、走了哪条通道、重试了几趟记下来，再去动重试逻辑。
  //
  // 三条硬规矩（用户明确要求）：
  //   ① 只记录**数字和枚举**，绝不落 API Key / 录音内容 / 学生手机号；
  //   ② 响应头缺失（跨域被剥掉、老 Worker）时静默留空，**不许报错**；
  //   ③ 普通页面完全不显示、不打扰，只有 ?perf=1 才露面。
  PERF_ENABLED() {
    try {
      return typeof location !== 'undefined'
        && /[?&]perf=1\b/.test(String(location.search || ''));
    } catch (e) { return false; }
  },

  // 最近 N 次朗读的样本（只存内存，刷新即清空 —— 不落盘，免得留隐私数据）
  PERF_MAX: 30,
  _perf: [],

  // 一次"朗读"（从松手到出分）的会话。开始时开一个，结束时收口。
  perfBegin(what) {
    if (!this.PERF_ENABLED()) return null;
    const s = {
      what: String(what || 'read'),   // 场景名，如 'sentence' / 'cloze-zh' / 'repair'
      t0: (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now(),
      attempts: 0,        // _transcribeOnce 被调了几趟
      empty: 0,           // 其中空结果几趟
      errors: 0,          // 网络/超时几趟
      hops: [],           // 每趟的明细（下面 pushHop 填）
      endAt: null,
    };
    this._perfCur = s;
    return s;
  },

  // 每趟 _transcribeOnce 收尾时调一次。
  // headers 可能根本没有（跨域/老 Worker），全部按"取不到就留空"处理。
  perfHop(info) {
    const s = this._perfCur;
    if (!s) return;
    const h = (info && info.headers) || null;
    const pick = (name) => {
      try { return (h && h.get) ? (h.get(name) || '') : ''; } catch (e) { return ''; }
    };
    s.attempts++;
    if (info && info.empty) s.empty++;
    if (info && info.error) s.errors++;
    s.hops.push({
      ms: Math.max(0, Math.round((info && info.ms) || 0)),
      // 谁答的：worker 会回 X-Asr-Channel，没有就留空
      channel: pick('X-Asr-Channel').slice(0, 40),
      // 服务端内部耗时：aliyun=xx;cloudflare=yy 这种（v98 起的 Server-Timing）
      timing: pick('Server-Timing').slice(0, 120),
      // 送上去的音频大小，判断"是不是反复传同一段"
      audioIn: pick('X-Audio-In').slice(0, 20),
      // 哪个边缘节点处理的（排障用：某些 colo 到上游特别慢）
      colo: pick('X-Edge-Colo').slice(0, 12),
      text: info && info.text ? String(info.text).length : 0,   // ★ 只记长度，不记内容
      err: (info && info.errName) || '',
    });
  },

  // 收口：算总耗时并归档。result 只记"有没有文本 / 多少分"，不记文本本身。
  perfEnd(result) {
    const s = this._perfCur;
    this._perfCur = null;
    if (!s) return null;
    const now = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    s.totalMs = Math.max(0, Math.round(now - s.t0));
    s.result = (result && result.kind) ? String(result.kind) : 'unknown';
    this._perf.push(s);
    if (this._perf.length > this.PERF_MAX) this._perf.shift();
    return s;
  },

  perfSamples() { return this._perf.slice(); },
  perfClear() { this._perf.length = 0; this._perfCur = null; },

  // 汇总：给 ?perf=1 面板用。全部是数值，没有隐私。
  perfSummary() {
    const xs = this._perf;
    if (!xs.length) return null;
    const nums = xs.map(x => x.totalMs).sort((a, b) => a - b);
    const pct = (p) => nums[Math.min(nums.length - 1, Math.floor(nums.length * p))];
    const sum = (f) => xs.reduce((a, x) => a + (f(x) || 0), 0);
    return {
      n: xs.length,
      avg: Math.round(sum(x => x.totalMs) / xs.length),
      p50: pct(0.5),
      p90: pct(0.9),
      max: nums[nums.length - 1],
      attempts: sum(x => x.attempts),
      empty: sum(x => x.empty),
      errors: sum(x => x.errors),
      // 平均一趟，用来判断"是趟数多还是单趟慢"
      avgAttempts: +(sum(x => x.attempts) / xs.length).toFixed(2),
      retried: xs.filter(x => x.attempts > 1).length,
      failed: xs.filter(x => x.result === 'fail').length,
      low: xs.filter(x => x.result === 'low').length,
    };
  },

  // ===== v131：整次朗读的统一预算 ==========================================
  //
  // 收敛前的最坏情况（照代码读出来的，不是估计）：
  //   Worker runAliyun      最多 2 次阿里云
  //   Worker runCloudflare  最多 3 次 CF（turbo ×2 + 默认 ×1）
  //   Api.transcribe        空则再来一趟         → ×2
  //   app._bestTranscript   再兜一趟（不带 hint）→ ×2
  //   合计：云端 ASR 调用 20 次、客户端最坏等 4×18s = 72 秒。
  //
  // 这就是"出分很慢"的根源 —— 不是单趟慢，是**三层重试各自叠加**。
  // 现在给整次朗读一个总预算：到点就收，拿到的第一个有效文本就算数。
  //
  // v139：12 秒 → 5 秒。家长 2026-10-17 再次报"评分特别慢"。
  // 5 秒的依据：正常一趟 0.7~1.5s，服务端给阿里云的上限是 3.2s，5 秒已经
  // 兜住"上游抖一下"；再等下去就不叫出分了，叫让孩子对着按钮发呆。
  // 超预算不再是"识别失败、重读一遍"—— app 侧会用本地录音判定放行
  // （见 app.js 的 _voiceOk），所以缩短预算不会误伤读对的孩子。
  // v195：5s → 4s。家长「核对查分的时间再变得更短一点」。正常一趟 0.7~1.5s，
  // 4 秒够兜住一次上游抖动；超预算由本地录音判定放行，不会冤枉读对的孩子。
  ASR_BUDGET_MS: 4000,      // 整次朗读的总时间预算
  ASR_MAX_TRIPS: 2,         // 整次朗读最多打 2 趟 _transcribeOnce
  _asrSpent: 0,             // 本次朗读已经花掉的时间
  _asrTrips: 0,             // 本次朗读已经打过的趟数

  // 开始一次朗读：清零预算。**所有入口都要调**，否则预算会跨次累加。
  asrResetBudget() { this._asrSpent = 0; this._asrTrips = 0; },

  // 还能不能再打一趟？两个条件同时满足才行。
  asrCanRetry() {
    if (this._asrTrips >= this.ASR_MAX_TRIPS) return false;
    if (this._asrSpent >= this.ASR_BUDGET_MS) return false;
    return true;
  },

  // 本趟还允许跑多久：不能超过总预算的剩余量。
  // 传下去当 AbortController 的超时，避免"单趟 18s 把预算一次性吃光"。
  asrTripTimeout() {
    const left = this.ASR_BUDGET_MS - this._asrSpent;
    if (left <= 0) return 0;
    return Math.min(this.TRANSCRIBE_TIMEOUT, left);
  },

  get HEALTH_URL() {
    const h = (typeof location !== 'undefined' && location.hostname) || '';
    const sameZone = h === 'amyeng.top' || h.endsWith('.amyeng.top');
    return (sameZone ? '' : this.API_HOST) + '/api/health';
  },

  get DICT_URL() {
    const h = (typeof location !== 'undefined' && location.hostname) || '';
    const sameZone = h === 'amyeng.top' || h.endsWith('.amyeng.top');
    return (sameZone ? '' : this.API_HOST) + '/api/dict';
  },

  // 查词：孩子点一个不认识的单词，要音标 + 中文意思 + 读音。
  //
  // 走自家 Worker 代理（跨域 + 边缘缓存），本地再压一层内存/localStorage
  // 缓存 —— 一节课里同一个词可能被点好几次，第二次起必须是零等待，否则
  // 孩子会以为"点了没反应"。
  _dictMem: {},
  _dictKey(word) { return 'amy_dict_' + word; },

  // 本地词表：把题库里全部词汇卡的 word → {phon, zh} 一次性建索引。
  // 家长 2026-10-29：点单词不许再"正在查/等网络"——课程内的词本地秒出，
  // 查不到的（课外词）才走 /api/dict 网络查询。
  // v192（家长 2026-11-11）：「解释还是正在查询，还需要从云端调数据，
  // 这个也搞到本地」—— 原来只索引了词汇卡那 120 个词，阅读文章/题干/选项
  // 里的普通词（large、desert、close…）全都得联网。现在合并随页面下发的
  // LOCAL_DICT（题库 2586 个词，由 tools/gen-local-dict.js 生成），
  // 词汇卡的课内释义优先，其余全部零网络秒出。
  _localDict: null,
  _localDictBuild() {
    if (this._localDict) return this._localDict;
    const map = {};
    try {
      const weeks = (typeof HOMEWORK_WEEKS !== 'undefined') ? HOMEWORK_WEEKS
        : (typeof HOMEWORK_DATA !== 'undefined' ? [HOMEWORK_DATA] : []);
      weeks.forEach(wk => {
        (wk || []).forEach(day => {
          (day.modules || []).forEach(m => {
            (m.words || []).forEach(w => {
              if (w && w.word && w.meaning && !map[w.word.toLowerCase()]) {
                map[w.word.toLowerCase()] = { word: w.word.toLowerCase(), phon: String(w.phonetic || '').replace(/^\/|\/$/g, ''), zh: w.meaning, ok: true, local: true, at: Date.now() };
              }
            });
          });
        });
      });
    } catch (e) { console.warn('local dict build failed:', e); }
    // v192：静态词典补位（不覆盖词汇卡 —— 课内释义是老师定过的）。
    try {
      if (typeof LOCAL_DICT !== 'undefined' && LOCAL_DICT) {
        Object.keys(LOCAL_DICT).forEach(k => {
          if (map[k]) return;
          const bits = String(LOCAL_DICT[k]).split('|');
          if (!bits[0]) return;
          map[k] = { word: k, phon: bits[1] || '', zh: bits[0], ok: true, local: true, at: Date.now() };
        });
      }
    } catch (e) { console.warn('static dict merge failed:', e); }
    this._localDict = map;
    return map;
  },

  // v192：同步版查词 —— 给「点词弹层」在 await 之前就把中文摆上去，
  // 屏幕上连一帧的「正在查…」都不出现。只查本地，查不到返回 null。
  dictLocal(word) {
    const w = String(word || '').trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    if (!w || !/^[a-z][a-z'\-]*$/.test(w)) return null;
    const map = this._localDictBuild();
    if (map[w]) return map[w];
    try {
      if (typeof WordHelp !== 'undefined') {
        const inf = WordHelp.inflectionOf(w);
        if (inf && inf.base && map[inf.base]) {
          return { word: w, phon: map[inf.base].phon, zh: map[inf.base].zh, ok: true, local: true, at: Date.now() };
        }
      }
    } catch (e) {}
    return null;
  },

  async dict(word) {
    const w = String(word || '').trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    if (!w || !/^[a-z][a-z'\-]*$/.test(w)) return null;
    if (this._dictMem[w]) return this._dictMem[w];
    // ① 本地词表 —— 课程内的词零网络、零等待。
    const local = this._localDictBuild()[w];
    if (local) { this._dictMem[w] = local; return local; }
    // ② 变形词 → 原型在本地词表里（felt → feel）。
    try {
      if (typeof WordHelp !== 'undefined') {
        const inf = WordHelp.inflectionOf(w);
        if (inf && inf.base) {
          const baseLocal = this._localDictBuild()[inf.base];
          if (baseLocal) {
            const out = { word: w, phon: baseLocal.phon, zh: baseLocal.zh, ok: true, local: true, at: Date.now() };
            this._dictMem[w] = out;
            return out;
          }
        }
      }
    } catch (e) {}
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(this._dictKey(w));
        if (raw) {
          const cached = JSON.parse(raw);
          // 空结果也缓存过 —— 但别让它永久占坑，7 天后重查。
          if (cached && (cached.ok || Date.now() - (cached.at || 0) < 7 * 864e5)) {
            this._dictMem[w] = cached;
            return cached;
          }
        }
      } catch (e) {}
    }
    try {
      const res = await fetch(this.DICT_URL + '?word=' + encodeURIComponent(w));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const out = { word: w, phon: data.phon || '', zh: data.zh || '', ok: !!data.zh, at: Date.now() };
      this._dictMem[w] = out;
      try { localStorage.setItem(this._dictKey(w), JSON.stringify(out)); } catch (e) {}
      return out;
    } catch (e) {
      console.warn('dict failed:', w, e);
      // 查不到不缓存，下次还有机会。
      return { word: w, phon: '', zh: '', ok: false, error: true };
    }
  },

  // 读之前先把连接热好。
  //
  // 松手后的等待几乎全在网络往返上：tiny / turbo / 默认三个模型线上各跑三遍，
  // 都在 1.4–3.5s，重叠得完全分不出高下 —— 模型不是瓶颈。但手机上的
  // DNS + TLS + 连接会闲冷掉，那一次握手正好压在"松手 → 出分"这段路上。
  // 先打一个最小的请求把连接建好，等真要传录音时就不用再握手。
  // 20 秒内只热一次，不刷请求。
  WARMUP_INTERVAL: 20000,
  _warmedAt: 0,

  warmup() {
    const now = Date.now();
    if (now - (this._warmedAt || 0) < this.WARMUP_INTERVAL) return;
    this._warmedAt = now;
    try { fetch(this.HEALTH_URL, { cache: 'no-store' }).catch(function () {}); } catch (e) {}
  },

  // 英文跟读走 ?model=turbo（whisper-large-v3-turbo）。
  // 不是因为它快 —— 实测三个模型速度没有差别 —— 而是因为它最准：默认
  // whisper 会把 "I usually have breakfast" 听成 "I usually a breakfast"，
  // 孩子明明读对了却被判漏读。
  //
  // 中文（v86）也上了 turbo，带 &mode=zh：worker 收到后给 turbo 传
  // language=zh + 简体中文提示词，中文不再被硬当英文翻。这同时治了"中文
  // 识别时间很长"——默认模型要整数数组入参，JSON 展开后请求体是 WAV 的
  // 三四倍，手机上传这段就是主要等待；turbo 走 base64，体积小一半多。
  // turbo 失败/返回空时 worker 自动降级回默认多语种模型，孩子不用重说。

  // Whisper emits stock phrases from its training data when it is handed
  // audio it cannot make sense of. Treating those as a real answer scores the
  // child 0 for something they may well have read correctly.
  // Only phrases that cannot plausibly be an answer. "you" and "bye" are real
  // words a child might be asked to read, so they stay off this list even
  // though Whisper also emits them as filler.
  FILLERS: ['thank you', 'thanks for watching', 'thanks for watching!',
            'subscribe', 'please subscribe', '. .', '...', '。'],

  isFillerTranscript(text) {
    if (!text) return true;
    const raw = String(text).trim();
    // Any CJK content is a real answer — the filler phrases are all English.
    // Stripping non-Latin first (as this used to) emptied every Chinese
    // transcript and threw away the child's whole translation.
    if (/[\u4e00-\u9fa5]/.test(raw)) return false;
    const t = raw.toLowerCase().replace(/[^a-z\s.]/g, '').trim();
    if (!t || t === '.') return true;
    return this.FILLERS.indexOf(t) >= 0 || this.FILLERS.indexOf(t.replace(/\.$/, '')) >= 0;
  },

  // v179（家长 2026-11-02 晚）：整条识别链路的**最后一道墙**。
  //
  // 家长报「华为 nova 13 Pro 自带浏览器，做到 20 多题提交读音后一直卡在
  // 『正在出分』，刷新、退回去重做都一样」。查下来链路上还有一个没有任何
  // 时限的 await：`res.json()` —— 响应头到了、body 却迟迟不吐（华为浏览器
  // 常见：代理/省电策略把长连接挂住），而 AbortController 的定时器在拿到
  // 响应头那一刻就被清掉了，于是这个 await 可以永远不回来。
  // 下面这层 Promise.race 是兜底：不管里面卡在哪一步，到点就交 null 回去，
  // 上层按"识别端没回话"处理（还有本地录音判"有没有出声"那一条），
  // 孩子一定能往下走。
  // v195：12s → 7s。它兜的是「连 res.json() 都不回来」那种 Hang（华为系
  // 浏览器），7 秒已经是极限；再长就不是出分，是让孩子对着按钮发呆。
  ASR_HARD_CAP_MS: 7000,

  async transcribe(blob, meta, opts) {
    if (!blob) return null;
    const cap = (opts && opts.budgeted)
      ? Math.min(this.ASR_HARD_CAP_MS, this.ASR_BUDGET_MS + 4000)
      : this.ASR_HARD_CAP_MS;
    const flow = this._transcribeFlow(blob, meta, opts);
    let timer = null;
    const wall = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, cap);
    });
    const out = await Promise.race([flow, wall]);
    if (timer) clearTimeout(timer);
    // 里面晚到的结果直接丢掉：调用方已经按"没听清"往下走了，不能二刷。
    flow.catch(function () {});
    return out;
  },

  async _transcribeFlow(blob, meta, opts) {
    if (!blob) return null;
    // v124：空返回 / 网络抖动自动再试一次。
    //
    // 家长 2026-10-15 晚高峰报的"明明读得清楚，系统就说没听清"，根子在识别
    // 通道偶发吐空（线上实测：阿里云 200 + completion_tokens=0，CF 也复现过
    // 同一条音频 200 + 空 text）。一次空返回就让孩子重读是被冤枉的 —— 音频
    // 明明在那儿。所以这一层对"没有拿到文本"的结果自动重打一次，仍然拿不到
    // 才把空结果交上去走"没听清"。
    // 只重试**没有文本**的情况：真拿到文本（哪怕错了）不重试，避免同一遍朗读
    // 被识别两次、结果打架。
    // 重试对每个调用方都是透明的 —— 返回结构不变。
    //
    // v131：不再"无脑重一次"，改为受**统一预算**约束（asrCanRetry）。
    // 这就是原来"三层重试各自叠加、最坏 20 次调用 / 72 秒"的收敛点。
    const once = await this._transcribeOnce(blob, meta, opts);
    if (once && once.text) return once;
    // 只有在"调用本身通了、只是没内容"或"超时/网络失败"时才重试。
    // prefer='cf' 的孤立字母场景本来就常常识别不出（字母音识别端很难），
    // 那边重试意义不大还拖慢，所以只对默认（整句/单词）路径重试。
    if (opts && opts.prefer) return once;
    if (!this.asrCanRetry()) return once;          // ★ 预算用完 / 趟数到顶就收
    const again = await this._transcribeOnce(blob, meta, opts);
    return (again && again.text) ? again : (once || again);
  },

  async _transcribeOnce(blob, meta, opts) {
    if (!blob) return null;
    const fast = !!(opts && opts.fast);
    const t0 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    // v131：单趟超时不能超过总预算的剩余量 —— 否则一趟 18s 就把预算吃光，
    // 后面连"补一趟"的机会都没有了。剩余为 0 时直接不打（省一次白等）。
    const budgetLeft = this.asrTripTimeout();
    if (opts && opts.budgeted && budgetLeft <= 0) {
      this.perfHop({ ms: 0, error: true, errName: 'budget_exhausted', empty: true });
      return null;
    }
    const tripMs = (opts && opts.budgeted) ? budgetLeft : this.TRANSCRIBE_TIMEOUT;
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), tripMs) : null;
    this._asrTrips++;
    let headers = null, errName = '';
    try {
      const lang = (opts && opts.lang) || '';
      const hint = String((opts && opts.hint) || '').slice(0, 200);
      let qs = fast ? ('?model=turbo' + (lang === 'zh' ? '&mode=zh' : '')) : '';
      // prefer='cf'（v96）：字母/音节这类"极短、不含真实语言"的孤立音必须先给
      // Cloudflare —— 阿里云的 qwen3-asr-flash 对孤立字母基本不工作（实测 10 个
      // 字母 9 个返回空）。整句跟读没有这个问题，仍走更快的阿里云（默认）。
      // 服务端两条互为兜底，这里只是决定谁先上。
      if (opts && opts.prefer) qs += (qs ? '&' : '?') + 'prefer=' + encodeURIComponent(opts.prefer);
      if (hint) qs += (qs ? '&' : '?') + 'prompt=' + encodeURIComponent(hint);
      const res = await fetch(this.TRANSCRIBE_URL + qs, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: blob,
        signal: ctrl ? ctrl.signal : undefined,
      });
      // v179：这里**不能**清定时器。以前一拿到响应头就 clearTimeout，
      // 于是 `res.json()` 这一段完全没有时限 —— 响应头回来了、body 卡住
      // （华为系浏览器实测）就成了一个永不到头的 await。现在定时器留到
      // finally 才清，abort 能把 body 一起打断。
      headers = res.headers;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const text = (data.text || '').trim();
      this._noteSpent(t0);
      this.perfHop({ ms: this._elapsed(t0), headers, text, empty: !text });
      // v195：worker 已经把「AI 合分」算好并随这一趟一起回来了 —— 没有
      // 额外请求、没有额外等待。记一份全局快照，判定层可以据此跳过
      // 不必要的二次兜底（读得准就不用再打一趟识别）。
      if (typeof data.aiScore === 'number') {
        this.lastAiScore = data.aiScore;
        this.lastAiBy = data.aiBy || 'edge-ai';
      }
      return {
        text,
        words: data.words || null,
        aiScore: (typeof data.aiScore === 'number') ? data.aiScore : null,
        aiBy: data.aiBy || '',
        aiDetail: data.aiDetail || null,
      };
    } catch (e) {
      errName = (e && e.name === 'AbortError') ? 'timeout' : String((e && e.message) || e);
      console.warn('transcribe failed:', e && e.name === 'AbortError' ? 'timeout' : e);
      this._noteSpent(t0);
      this.perfHop({ ms: this._elapsed(t0), headers, error: true, empty: true, errName });
      // Park it so a later attempt can fill the transcript in.
      if (meta && meta.clipId) this._queueTranscribe(meta.clipId);
      return null;
    } finally {
      // v179：成功 / 失败都在这儿清 —— 让 abort 定时器盖住 res.json()。
      if (timer) clearTimeout(timer);
    }
  },

  // 本次朗读已花时间（预算扣减要用真实墙钟，不能只数趟数）
  _noteSpent(t0) { this._asrSpent += this._elapsed(t0); },
  _elapsed(t0) {
    const now = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    return Math.max(0, now - t0);
  },

  // Clips awaiting a retry. Kept as ids only — the audio itself is already
  // in IndexedDB, so nothing is lost if the tab closes.
  _queueTranscribe(clipId) {
    try {
      const q = JSON.parse(localStorage.getItem('amy_tx_queue') || '[]');
      if (q.indexOf(clipId) === -1) { q.push(clipId); localStorage.setItem('amy_tx_queue', JSON.stringify(q)); }
    } catch (e) {}
  },

  // Retry parked clips. Safe to call on a timer or when the app regains focus.
  async retryPendingTranscripts() {
    let q = [];
    try { q = JSON.parse(localStorage.getItem('amy_tx_queue') || '[]'); } catch (e) { return 0; }
    if (!q.length) return 0;
    let done = 0;
    for (const clipId of q.slice(0, 3)) {          // a few at a time
      let clip = null;
      try { clip = await RecStore.get(RecStore.CLIPS, clipId); } catch (e) {}
      if (!clip || !clip.blob) { q = q.filter(x => x !== clipId); continue; }
      const out = await this.transcribe(clip.blob, null);
      if (out && out.text) {
        const rec = (await this.getSpeakingRecords({})).find(r => r.clipId === clipId);
        if (rec) { rec.spoken = out.text; rec.source = 'asr'; await RecStore.put(RecStore.SCORES, rec); }
        q = q.filter(x => x !== clipId);
        done++;
      }
    }
    try { localStorage.setItem('amy_tx_queue', JSON.stringify(q)); } catch (e) {}
    return done;
  },

  // -- cloud sync ---------------------------------------------------------
  // opts.authoritative: teacher device (local wins conflicts — see CloudSync).
  // The tombstone lists ride along on both directions: up() writes them to
  // the blob, down() picks up deletions made on another device.
  async syncUp(students, classes, opts) {
    opts = opts || {};
    const d = Store.doc();
    const res = await CloudSync.up(students, classes, {
      authoritative: !!opts.authoritative,
      tombstones: {
        phones: d.deletedPhones || [], classes: d.deletedClasses || [],
        revivedPhones: d.revivedPhones || [], revivedClasses: d.revivedClasses || [],
      },
    });
    d.students = res.students;
    d.classes = res.classes;
    if (res.tombstones) {
      d.deletedPhones = res.tombstones.phones;
      d.deletedClasses = res.tombstones.classes;
      d.revivedPhones = res.tombstones.revivedPhones;
      d.revivedClasses = res.tombstones.revivedClasses;
    }
    Store.flush();
    return res;
  },

  async syncDown(students, classes, opts) {
    opts = opts || {};
    const d = Store.doc();
    const res = await CloudSync.down(students, classes, {
      tombstones: {
        phones: d.deletedPhones || [], classes: d.deletedClasses || [],
        revivedPhones: d.revivedPhones || [], revivedClasses: d.revivedClasses || [],
      },
    });
    if (res.tombstones) {
      d.deletedPhones = res.tombstones.phones;
      d.deletedClasses = res.tombstones.classes;
      d.revivedPhones = res.tombstones.revivedPhones;
      d.revivedClasses = res.tombstones.revivedClasses;
    }
    if (res.ok || res.tombstones) Store.flush();
    return res;
  },

  syncError() { return CloudSync.lastError(); },
  cloudAvailable() { return CloudSync.available(); },
};
