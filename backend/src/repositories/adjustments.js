import { queryPage } from '../lib/pagination.js';

const toAdjustment = row => ({
  id: row.id,
  absenceId: row.absence_id,
  date: row.date,
  dayOfWeek: row.day_of_week,
  periodId: row.period_id,
  periodTime: row.period_time,
  originalFacultyId: row.original_faculty_id,
  originalFacultyName: row.original_faculty_name,
  substituteFacultyId: row.substitute_faculty_id,
  substituteFacultyName: row.substitute_faculty_name,
  subject: row.subject,
  classGroup: row.class_group,
  room: row.room,
  approvedBy: row.approved_by,
  notes: row.notes,
  status: row.status,
  createdAt: row.created_at
});

export function listAllAdjustments(db) {
  return db.prepare('SELECT * FROM adjustments ORDER BY created_at DESC, period_id').all().map(toAdjustment);
}

export function queryAdjustments(db, { date, substituteFacultyId, originalFacultyId, orderBy, page, pageSize }) {
  const where = [];
  const params = [];
  const add = (clause, value) => {
    where.push(clause);
    params.push(value);
  };
  if (date) add('date = ?', date);
  if (substituteFacultyId) add('substitute_faculty_id = ?', substituteFacultyId);
  if (originalFacultyId) add('original_faculty_id = ?', originalFacultyId);
  return queryPage(db, { table: 'adjustments', where, params, orderBy, page, pageSize, map: toAdjustment });
}

export function listForAbsence(db, absenceId) {
  return db.prepare('SELECT * FROM adjustments WHERE absence_id = ? ORDER BY period_id').all(absenceId).map(toAdjustment);
}

export function isSubstituteBooked(db, facultyId, date, periodId) {
  return Boolean(
    db.prepare('SELECT 1 FROM adjustments WHERE substitute_faculty_id = ? AND date = ? AND period_id = ?')
      .get(facultyId, date, periodId)
  );
}

export function insertAdjustment(db, a) {
  db.prepare(
    `INSERT INTO adjustments
       (id, absence_id, date, day_of_week, period_id, period_time, original_faculty_id, original_faculty_name,
        substitute_faculty_id, substitute_faculty_name, subject, class_group, room, approved_by, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    a.id, a.absenceId, a.date, a.dayOfWeek, a.periodId, a.periodTime, a.originalFacultyId, a.originalFacultyName,
    a.substituteFacultyId, a.substituteFacultyName, a.subject, a.classGroup, a.room, a.approvedBy, a.notes, a.status, a.createdAt
  );
}

export function deleteForAbsence(db, absenceId) {
  db.prepare('DELETE FROM adjustments WHERE absence_id = ?').run(absenceId);
}

export function deleteAdjustment(db, id) {
  return db.prepare('DELETE FROM adjustments WHERE id = ?').run(id).changes > 0;
}
