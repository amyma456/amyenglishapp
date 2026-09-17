-- Class-removal gate and re-join approval.
--
-- removed_students: a phone the teacher took out of a class. Presence of a
--   row means the student may NOT auto-register on login; they must go
--   through a join request instead. Deleted on approval.
-- join_requests: one row per re-join application. pending → approved/denied.
--   A student re-removed after approval starts over with a new request.
CREATE TABLE IF NOT EXISTS removed_students (
  phone      TEXT PRIMARY KEY,
  name       TEXT,
  removed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS join_requests (
  id          TEXT PRIMARY KEY,
  phone       TEXT NOT NULL,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending / approved / denied
  created_at  TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_join_requests_phone ON join_requests(phone);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Wrong-question archive: every wrong answer the student reports.
-- One row per (student, day, module, question); ON CONFLICT keeps the first
-- one, so a student who tries again later doesn't multiply the same row.
-- Kept even after the student later answers correctly — the teacher may
-- still want to see "this kid got it wrong on Aug 30".
CREATE TABLE IF NOT EXISTS wrong_questions (
  id             TEXT PRIMARY KEY,
  student_id     TEXT NOT NULL,
  student_name   TEXT NOT NULL,
  student_phone  TEXT NOT NULL,
  day_idx        INTEGER NOT NULL,
  module_idx     INTEGER NOT NULL,
  q_idx          INTEGER NOT NULL,
  question       TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  student_answer TEXT,
  day_cn         TEXT,
  module_cn      TEXT,
  explanation_cn TEXT,
  explanation_en TEXT,
  recorded_at    TEXT NOT NULL,
  UNIQUE(student_id, day_idx, module_idx, q_idx)
);

CREATE INDEX IF NOT EXISTS idx_wq_student    ON wrong_questions(student_id);
CREATE INDEX IF NOT EXISTS idx_wq_day_module ON wrong_questions(day_idx, module_idx);
