CREATE TABLE IF NOT EXISTS demo_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  email TEXT,
  session_id TEXT,
  ts TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  viewport TEXT,
  user_agent TEXT,
  payload TEXT
);
CREATE INDEX IF NOT EXISTS idx_demo_events_email ON demo_events(email);
CREATE INDEX IF NOT EXISTS idx_demo_events_event ON demo_events(event);
CREATE INDEX IF NOT EXISTS idx_demo_events_ts ON demo_events(ts);
