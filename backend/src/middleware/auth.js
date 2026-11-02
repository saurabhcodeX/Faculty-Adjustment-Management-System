import { forbidden, unauthorized } from '../lib/errors.js';
import * as faculty from '../repositories/faculty.js';
import * as sessions from '../repositories/sessions.js';

export const SESSION_COOKIE = 'fams_session';

export function readSessionToken(req) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [name, value] = part.trim().split('=');
    if (name === SESSION_COOKIE && value) return value;
  }
  return null;
}

export function currentUser(db, req) {
  const token = readSessionToken(req);
  if (!token) return null;
  const facultyId = sessions.getSessionFacultyId(db, token);
  return facultyId ? faculty.getFaculty(db, facultyId) : null;
}

export const requireAuth = db => (req, res, next) => {
  req.user = currentUser(db, req);
  if (!req.user) return next(unauthorized());
  next();
};

export const requireHod = (req, res, next) => {
  if (req.user?.role !== 'hod') return next(forbidden('Only the HOD can do this.'));
  next();
};
