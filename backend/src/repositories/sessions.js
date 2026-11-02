import { createHash, randomBytes } from 'node:crypto';

const hashToken = token => createHash('sha256').update(token).digest('hex');

export function createSession(db, facultyId, ttlMs) {
  const token = randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
  db.prepare('INSERT INTO sessions (token_hash, faculty_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    facultyId,
    new Date(Date.now() + ttlMs).toISOString()
  );
  return token;
}

export function getSessionFacultyId(db, token) {
  return (
    db.prepare('SELECT faculty_id FROM sessions WHERE token_hash = ? AND expires_at > ?')
      .get(hashToken(token), new Date().toISOString())?.faculty_id ?? null
  );
}

export function deleteSession(db, token) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

export function deleteSessionsForFaculty(db, facultyId, { exceptToken } = {}) {
  db.prepare('DELETE FROM sessions WHERE faculty_id = ? AND token_hash != ?').run(
    facultyId,
    exceptToken ? hashToken(exceptToken) : ''
  );
}
