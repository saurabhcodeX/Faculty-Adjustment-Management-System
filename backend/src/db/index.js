import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS faculty (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('hod', 'faculty')),
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timetable_cells (
    faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    period_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    class_group TEXT NOT NULL,
    room TEXT NOT NULL,
    PRIMARY KEY (faculty_id, day, period_id)
  );

  CREATE TABLE IF NOT EXISTS absences (
    id TEXT PRIMARY KEY,
    faculty_id TEXT NOT NULL REFERENCES faculty(id),
    faculty_name TEXT NOT NULL,
    date TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    reason TEXT NOT NULL,
    leave_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reported_at TEXT NOT NULL,
    approved_at TEXT,
    periods_to_adjust TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS absences_by_faculty_date ON absences (faculty_id, date);
  CREATE INDEX IF NOT EXISTS absences_by_status ON absences (status);

  CREATE TABLE IF NOT EXISTS adjustments (
    id TEXT PRIMARY KEY,
    absence_id TEXT NOT NULL REFERENCES absences(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    period_id INTEGER NOT NULL,
    period_time TEXT NOT NULL,
    original_faculty_id TEXT NOT NULL REFERENCES faculty(id),
    original_faculty_name TEXT NOT NULL,
    substitute_faculty_id TEXT NOT NULL REFERENCES faculty(id),
    substitute_faculty_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_group TEXT NOT NULL,
    room TEXT NOT NULL,
    approved_by TEXT NOT NULL,
    notes TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (absence_id, period_id),
    UNIQUE (date, period_id, substitute_faculty_id)
  );
`;

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(SCHEMA);
  return db;
}

export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
