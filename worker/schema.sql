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
