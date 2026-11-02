import { likePattern, queryPage } from '../lib/pagination.js';

const toAbsence = row => ({
  id: row.id,
  facultyId: row.faculty_id,
  facultyName: row.faculty_name,
  date: row.date,
  dayOfWeek: row.day_of_week,
  reason: row.reason,
  leaveType: row.leave_type,
  status: row.status,
  reportedAt: row.reported_at,
  approvedAt: row.approved_at,
  periodsToAdjust: JSON.parse(row.periods_to_adjust)
});

export function listAllAbsences(db) {
  return db.prepare('SELECT * FROM absences ORDER BY reported_at DESC, rowid DESC').all().map(toAbsence);
}

export function queryAbsences(db, { status, facultyId, from, to, search, orderBy, page, pageSize }) {
  const where = [];
  const params = [];
  const add = (clause, value) => {
    where.push(clause);
    params.push(value);
  };
  if (status) add('status = ?', status);
  if (facultyId) add('faculty_id = ?', facultyId);
  if (from) add('date >= ?', from);
  if (to) add('date <= ?', to);
  if (search) add("faculty_name LIKE ? ESCAPE '\\'", likePattern(search));
  return queryPage(db, { table: 'absences', where, params, orderBy, page, pageSize, map: toAbsence });
}

export function getAbsence(db, id) {
  const row = db.prepare('SELECT * FROM absences WHERE id = ?').get(id);
  return row ? toAbsence(row) : null;
}

export function listActiveAbsencesFor(db, facultyId, date) {
  return db
    .prepare("SELECT * FROM absences WHERE faculty_id = ? AND date = ? AND status != 'Rejected'")
    .all(facultyId, date)
    .map(toAbsence);
}

export function insertAbsence(db, a) {
  db.prepare(
    `INSERT INTO absences
       (id, faculty_id, faculty_name, date, day_of_week, reason, leave_type, status, reported_at, approved_at, periods_to_adjust)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    a.id, a.facultyId, a.facultyName, a.date, a.dayOfWeek, a.reason, a.leaveType,
    a.status, a.reportedAt, a.approvedAt ?? null, JSON.stringify(a.periodsToAdjust)
  );
}

export function setStatus(db, id, status, approvedAt = null) {
  db.prepare('UPDATE absences SET status = ?, approved_at = ? WHERE id = ?').run(status, approvedAt, id);
}
