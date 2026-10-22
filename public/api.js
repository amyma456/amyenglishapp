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
  _buildPhraseIdx() {
    if (this._phraseIdx) return this._phraseIdx;
    const idx = {};
    const self = this;
    this.PHRASES.forEach(function (p) {
      const en = p[0], zh = p[1];
      const words = en.split(' ');
      const head = words[0];
      const rest = words.slice(1).join(' ');
      const forms = [];
      if (head === 'be') {
        ['be', 'is', 'am', 'are', 'was', 'were', 'been', 'being'].forEach(function (f) {
          forms.push(rest ? f + ' ' + rest : f);
        });
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
        }
      }
      forms.forEach(function (f) {
        const k = f.toLowerCase().replace(/\s+/g, ' ');
        if (!idx[k]) idx[k] = { en: en, zh: zh, surface: f };
      });
    });
    this._phraseIdx = idx;
    return idx;
  },

  // 一串词里从第 i 个位置开始，最长能匹配到哪个短语。
  // tokens: 已经拆好的单词数组（不含标点）
  phraseAt(tokens, i) {
    const idx = this._buildPhraseIdx();
    const maxLen = 4;
    for (let len = maxLen; len >= 2; len--) {
      if (i + len > tokens.length) continue;
      const joined = tokens.slice(i, i + len).join(' ').toLowerCase();
      const hit = idx[joined];
      if (hit) return { len: len, en: hit.en, zh: hit.zh, surface: tokens.slice(i, i + len).join(' ') };
    }
    return null;
  },

  // 整串是不是一个（或含有一个）固定搭配？给点词弹层用。
  phraseInfo(text) {
    const norm = String(text || '').toLowerCase().replace(/[^a-z'\- ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!norm) return null;
    const idx = this._buildPhraseIdx();
    if (idx[norm]) return { en: idx[norm].en, zh: idx[norm].zh, surface: text };
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
  async flushCheckinQueue() {
    if (this._flushingCheckins) return 0;
    const q = this._loadCkQueue();
    if (!q.length) return 0;
    this._flushingCheckins = true;
    let sent = 0;
    const remain = [];
    for (let i = 0; i < q.length; i++) {
      const item = q[i];
      if (!item || !item.body) continue;
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
    this._flushingCheckins = false;
    return sent;
  },
  reportCheckin(rec, who) {
    if (!rec || !rec.studentId) return Promise.resolve(null);
    const w = who || {};
    const stu = (Store.doc().students || []).find(s => s.id === rec.studentId) || {};
    const curWeek = (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0;
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
    };
    const fail = (why) => {
      this._queueCheckin(body);
      console.warn('reportCheckin failed (' + why + '), 已进重试队列');
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
  TRANSCRIBE_TIMEOUT: 18000,

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
  ASR_BUDGET_MS: 5000,      // 整次朗读的总时间预算
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

  async dict(word) {
    const w = String(word || '').trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    if (!w || !/^[a-z][a-z'\-]*$/.test(w)) return null;
    if (this._dictMem[w]) return this._dictMem[w];
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

  async transcribe(blob, meta, opts) {
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
      if (timer) clearTimeout(timer);
      // v131：诊断用的响应头。跨域/老 Worker 可能一个都没有 —— 取不到就留空，
      // 绝不能因为读头而抛错。headers.get 在缺失时本来就返回 null。
      headers = res.headers;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const text = (data.text || '').trim();
      this._noteSpent(t0);
      this.perfHop({ ms: this._elapsed(t0), headers, text, empty: !text });
      return { text, words: data.words || null };
    } catch (e) {
      if (timer) clearTimeout(timer);
      errName = (e && e.name === 'AbortError') ? 'timeout' : String((e && e.message) || e);
      console.warn('transcribe failed:', e && e.name === 'AbortError' ? 'timeout' : e);
      this._noteSpent(t0);
      this.perfHop({ ms: this._elapsed(t0), headers, error: true, empty: true, errName });
      // Park it so a later attempt can fill the transcript in.
      if (meta && meta.clipId) this._queueTranscribe(meta.clipId);
      return null;
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
