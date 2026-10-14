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

-- v89: TTS 消费计数（阿里云 qwen3-tts-flash 每日字符上限，≈¥2.4/天封顶）。
-- 按 UTC 日一行；worker 运行时会 CREATE TABLE IF NOT EXISTS 自建，
-- 这里只是把结构写进文档。worker/src/index.js: ttsCharsToday()。
CREATE TABLE IF NOT EXISTS tts_usage (
  day    TEXT PRIMARY KEY,
  chars  INTEGER NOT NULL DEFAULT 0
);

-- v120: 打卡记录（家长 2026-10-14 报的"孩子端全是未打卡"）。
--
-- 背景：answers / checkins 从来没上过后端。CloudSync.up() 的 payload 只带
-- students / classes / 墓碑，打卡记录只写在**各自手机的 localStorage** 里。
-- 于是孩子用自己的手机做完作业，家长在另一台设备上看到的就是一片"未打卡"，
-- 完成率对比里全班完成天数全是 0、每日打卡状态全是叉。
--
-- 这张表把打卡烧进 D1：一台设备上报，所有设备都能读到。
-- 一个学生一周一天一行（student_id + week_idx + day_idx），因为打卡是
-- "做到哪算哪"的累积状态，重复上报要覆盖而不是追加。
--   done/completed：done=1 表示当天所有题都有答题记录；否则 partial
--   correct_rate：当天已答题目的正确率（整数百分比）
--   wrong_count：当天答错的题数
--   finish_time：最后一条答题落库时的本地时间 HH:MM
CREATE TABLE IF NOT EXISTS checkins (
  student_id    TEXT NOT NULL,
  student_name  TEXT,
  student_phone TEXT,
  student_class TEXT,
  week_idx      INTEGER NOT NULL DEFAULT 0,
  day_idx       INTEGER NOT NULL,
  done          INTEGER NOT NULL DEFAULT 0,
  completed     TEXT,
  answered      INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,
  correct_rate  INTEGER NOT NULL DEFAULT 0,
  wrong_count   INTEGER NOT NULL DEFAULT 0,
  finish_time   TEXT,
  updated_at    TEXT NOT NULL,
  PRIMARY KEY (student_id, week_idx, day_idx)
);

CREATE INDEX IF NOT EXISTS idx_checkins_class_week ON checkins(student_class, week_idx);
CREATE INDEX IF NOT EXISTS idx_checkins_week       ON checkins(week_idx);
