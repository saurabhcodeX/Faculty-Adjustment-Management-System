import { likePattern, queryPage } from '../lib/pagination.js';

const toFaculty = row => ({
  id: row.id,
  name: row.name,
  designation: row.designation,
  department: row.department,
  email: row.email,
  phone: row.phone,
  role: row.role
});

export function countFaculty(db) {
  return db.prepare('SELECT COUNT(*) AS count FROM faculty').get().count;
}

export function listAllFaculty(db) {
  return db.prepare('SELECT * FROM faculty ORDER BY rowid').all().map(toFaculty);
}

export function queryFaculty(db, { search, role, department, orderBy, page, pageSize }) {
  const where = [];
  const params = [];
  if (search) {
    const pattern = likePattern(search);
    where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR designation LIKE ? ESCAPE '\\')");
    params.push(pattern, pattern, pattern);
  }
  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  if (department) {
    where.push('department = ?');
    params.push(department);
  }
  return queryPage(db, { table: 'faculty', where, params, orderBy, page, pageSize, map: toFaculty });
}

export function searchFaculty(db, term, limit) {
  const pattern = likePattern(term);
  return db
    .prepare("SELECT * FROM faculty WHERE name LIKE ? ESCAPE '\\' OR designation LIKE ? ESCAPE '\\' ORDER BY name LIMIT ?")
    .all(pattern, pattern, limit)
    .map(toFaculty);
}

export function getFaculty(db, id) {
  const row = db.prepare('SELECT * FROM faculty WHERE id = ?').get(id ?? '');
  return row ? toFaculty(row) : null;
}

export function getFacultyByEmail(db, email) {
  const row = db.prepare('SELECT * FROM faculty WHERE email = ?').get(email);
  return row ? toFaculty(row) : null;
}

export function getPasswordHash(db, id) {
  return db.prepare('SELECT password_hash FROM faculty WHERE id = ?').get(id)?.password_hash ?? null;
}

export function insertFaculty(db, f) {
  db.prepare(
    `INSERT INTO faculty (id, name, designation, department, email, phone, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(f.id, f.name, f.designation, f.department, f.email, f.phone ?? null, f.role, f.passwordHash);
}

export function updateFaculty(db, id, f) {
  db.prepare(
    'UPDATE faculty SET name = ?, designation = ?, department = ?, email = ?, phone = ?, role = ? WHERE id = ?'
  ).run(f.name, f.designation, f.department, f.email, f.phone, f.role, id);
}

export function setPasswordHash(db, id, passwordHash) {
  db.prepare('UPDATE faculty SET password_hash = ? WHERE id = ?').run(passwordHash, id);
}

export function hasHistory(db, id) {
  return Boolean(
    db.prepare(
      `SELECT 1 FROM absences WHERE faculty_id = ?
       UNION SELECT 1 FROM adjustments WHERE substitute_faculty_id = ? OR original_faculty_id = ?
       LIMIT 1`
    ).get(id, id, id)
  );
}

export function deleteFaculty(db, id) {
  db.prepare('DELETE FROM faculty WHERE id = ?').run(id);
}
