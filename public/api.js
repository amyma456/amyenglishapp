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

  readLogin() {
    try {
      const raw = localStorage.getItem(this.LOGIN_KEY);
      if (!raw) return null;
      const creds = JSON.parse(raw);
      return (creds && creds.phone && creds.name) ? creds : null;
    } catch (e) { return null; }
  },

  writeLogin(phone, name) {
    try { localStorage.setItem(this.LOGIN_KEY, JSON.stringify({ phone: phone, name: name })); } catch (e) {}
  },

  clearLogin() {
    try { localStorage.removeItem(this.LOGIN_KEY); } catch (e) {}
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
    const mergedStudents = [];
    (localStudents || []).forEach(s => {
      if (!s || !s.phone || tomb.phones.has(s.phone)) return;
      mergedStudents.push(s);
    });

    if (cloudData && cloudData.students) {
      cloudData.students.forEach(cs => {
        if (!cs || !cs.phone) return;
        if (tomb.phones.has(cs.phone)) return;
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
    }

    if (cloudData.students && Array.isArray(cloudData.students)) {
      cloudData.students.forEach(cs => {
        if (!cs || !cs.phone) return;
        if (tomb.phones.has(cs.phone)) return;
        const local = localStudents.find(s => s.phone === cs.phone);
        if (local) {
          local.name = cs.name || local.name;
          if (cs.class !== undefined) local.class = cs.class;
          if (cs.approved !== undefined) local.approved = cs.approved;
          local.registeredAt = cs.registeredAt || local.registeredAt;
        } else {
          localStudents.push({
            id: cs.id || ('s' + cs.phone),
            name: cs.name,
            phone: cs.phone,
            parentPhone: cs.phone,
            class: cs.class || '',
            approved: cs.approved || false,
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
// Api — the public surface. app.js talks to this and nothing else.
// ===========================================================================
const Api = {

  // -- session ------------------------------------------------------------
  // Role resolution lives here, not in app.js. Today it is a phone-number
  // comparison; under Cloudflare it becomes a Worker call returning a real
  // token, and app.js does not change because it only reads session.role.
  session: null,

  async getSavedLogin() {
    return Store.readLogin();
  },

  async login(phone, name) {
    Store.writeLogin(phone, name);
    return this.resolveSession(phone, name);
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

  async getAnswers(studentId, dayIdx) {
    const d = Store.doc();
    const prefix = studentId + '_d' + dayIdx + '_';
    return Object.keys(d.answers)
      .filter(k => k.indexOf(prefix) === 0)
      .map(k => d.answers[k]);
  },

  // Written from the first answer of the day onward, recomputed after each.
  // done=true only once every question in the day has a record; before that
  // completed='partial', which the existing renderers already style.
  async saveCheckin(studentId, dayIdx, totalQuestions, who) {
    const d = Store.doc();
    const answered = await this.getAnswers(studentId, dayIdx);
    if (answered.length === 0) return null;

    const correct = answered.filter(a => a.correct).length;
    const full = totalQuestions > 0 && answered.length >= totalQuestions;
    const now = new Date();
    const key = this.checkinKey(studentId, dayIdx);
    const prev = d.checkins[key];

    const rec = {
      id: prev ? prev.id : uid(),
      studentId: studentId, dayIdx: dayIdx,
      done: full,
      completed: full ? 'full' : 'partial',
      answered: answered.length,
      total: totalQuestions,
      correctRate: Math.round(correct / answered.length * 100),
      wrongCount: answered.length - correct,
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      at: now.toISOString(),
    };
    d.checkins[key] = rec;
    Store.flush();

    // 同步烧进 D1（v120）。以前打卡只写本机 localStorage，所以孩子在自己
    // 手机上做完的作业，家长在另一台设备上看到的是"未打卡 / 完成天数 0 /
    // 每日状态全是叉"。fire-and-forget：上报失败绝不能影响孩子答题。
    this.reportCheckin(rec, who);
    return rec;
  },

  // who（可选）：{name, phone, klass}。调用方已经知道这些，比在这里翻
  // Store.doc().students 更可靠 —— 孩子端可能压根没同步到自己的档案。
  reportCheckin(rec, who) {
    if (!rec || !rec.studentId) return Promise.resolve(null);
    const w = who || {};
    const stu = (Store.doc().students || []).find(s => s.id === rec.studentId) || {};
    const body = {
      student_id: rec.studentId,
      student_name: w.name || stu.name || '',
      student_phone: w.phone || stu.phone || '',
      student_class: w.klass || stu.class || '',
      week_idx: (typeof HOMEWORK_WEEK_IDX === 'number') ? HOMEWORK_WEEK_IDX : 0,
      day_idx: rec.dayIdx,
      done: !!rec.done,
      completed: rec.completed,
      answered: rec.answered,
      total: rec.total,
      correct_rate: rec.correctRate,
      wrong_count: rec.wrongCount,
      finish_time: rec.time,
    };
    return fetch(this._classUrl('/api/checkins/report'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(res => (res.ok ? res.json() : null))
      .catch(e => { console.warn('reportCheckin failed:', e); return null; });
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
    try {
      const res = await fetch(this._classUrl('/api/class/status?phone=' + encodeURIComponent(phone)));
      if (!res.ok) return null;
      const data = await res.json();
      if (data && typeof data.removed === 'boolean') return data;
      return null;
    } catch (e) { console.warn('classStatus failed:', e); return null; }
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
  TRANSCRIBE_TIMEOUT: 12000,

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
    const fast = !!(opts && opts.fast);
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), this.TRANSCRIBE_TIMEOUT) : null;
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
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return { text: (data.text || '').trim(), words: data.words || null };
    } catch (e) {
      if (timer) clearTimeout(timer);
      console.warn('transcribe failed:', e && e.name === 'AbortError' ? 'timeout' : e);
      // Park it so a later attempt can fill the transcript in.
      if (meta && meta.clipId) this._queueTranscribe(meta.clipId);
      return null;
    }
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
