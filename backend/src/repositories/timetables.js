import { DAYS_OF_WEEK, PERIODS } from '../constants.js';
import { likePattern } from '../lib/pagination.js';

const toClassData = row => ({ subject: row.subject, classGroup: row.class_group, room: row.room });

function emptyWeek() {
  return Object.fromEntries(
    DAYS_OF_WEEK.map(day => [day, Object.fromEntries(PERIODS.map(p => [p.id, null]))])
  );
}

export function getAllTimetables(db) {
  const timetables = {};
  for (const { id } of db.prepare('SELECT id FROM faculty').all()) timetables[id] = emptyWeek();
  for (const row of db.prepare('SELECT * FROM timetable_cells').all()) {
    timetables[row.faculty_id][row.day][row.period_id] = toClassData(row);
  }
  return timetables;
}

export function getFacultyTimetable(db, facultyId) {
  const week = emptyWeek();
  for (const row of db.prepare('SELECT * FROM timetable_cells WHERE faculty_id = ?').all(facultyId)) {
    week[row.day][row.period_id] = toClassData(row);
  }
  return week;
}

export function getCell(db, facultyId, day, periodId) {
  const row = db
    .prepare('SELECT * FROM timetable_cells WHERE faculty_id = ? AND day = ? AND period_id = ?')
    .get(facultyId, day, periodId);
  return row ? toClassData(row) : null;
}

export function setCell(db, facultyId, day, periodId, classData) {
  if (!classData) {
    db.prepare('DELETE FROM timetable_cells WHERE faculty_id = ? AND day = ? AND period_id = ?')
      .run(facultyId, day, periodId);
    return;
  }
  db.prepare(
    `INSERT INTO timetable_cells (faculty_id, day, period_id, subject, class_group, room)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (faculty_id, day, period_id) DO UPDATE SET
       subject = excluded.subject, class_group = excluded.class_group, room = excluded.room`
  ).run(facultyId, day, periodId, classData.subject, classData.classGroup, classData.room);
}

export function searchClasses(db, term, limit) {
  const pattern = likePattern(term);
  return db
    .prepare(
      `SELECT c.*, f.name AS faculty_name FROM timetable_cells c
       JOIN faculty f ON f.id = c.faculty_id
       WHERE c.subject LIKE ? ESCAPE '\\' OR c.class_group LIKE ? ESCAPE '\\' OR c.room LIKE ? ESCAPE '\\'
       ORDER BY c.subject, c.faculty_id, c.period_id LIMIT ?`
    )
    .all(pattern, pattern, pattern, limit)
    .map(row => ({
      ...toClassData(row),
      facultyId: row.faculty_id,
      facultyName: row.faculty_name,
      day: row.day,
      periodId: row.period_id
    }));
}
