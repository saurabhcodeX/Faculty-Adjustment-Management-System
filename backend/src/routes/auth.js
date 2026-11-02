import express from 'express';
import rateLimit from 'express-rate-limit';
import { HttpError, unauthorized } from '../lib/errors.js';
import { burnPasswordCheck, hashPassword, verifyPassword } from '../lib/password.js';
import { requirePassword } from '../lib/validate.js';
import { currentUser, readSessionToken, requireAuth, SESSION_COOKIE } from '../middleware/auth.js';
import * as faculty from '../repositories/faculty.js';
import * as sessions from '../repositories/sessions.js';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 10;

export function authRouter({ db, config }) {
  const router = express.Router();

  const cookieOptions = {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: '/'
  };

  const loginLimiter = rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    limit: MAX_FAILED_LOGINS,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) =>
      next(new HttpError(429, 'TOO_MANY_ATTEMPTS', 'Too many failed sign-in attempts. Please try again in 15 minutes.'))
  });

  router.get('/session', (req, res) => {
    res.json({ data: { user: currentUser(db, req) } });
  });

  router.post('/login', loginLimiter, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const user = email ? faculty.getFacultyByEmail(db, email) : null;
    const valid = user
      ? await verifyPassword(password, faculty.getPasswordHash(db, user.id))
      : (await burnPasswordCheck(password), false);
    if (!valid) throw unauthorized('Incorrect email or password.');

    const token = sessions.createSession(db, user.id, config.sessionTtlMs);
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: config.sessionTtlMs });
    res.json({ data: { user } });
  });

  router.post('/logout', (req, res) => {
    const token = readSessionToken(req);
    if (token) sessions.deleteSession(db, token);
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    res.json({ data: { success: true } });
  });

  router.post('/change-password', requireAuth(db), async (req, res) => {
    const newPassword = requirePassword(req.body?.newPassword, 'New password');
    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    if (!(await verifyPassword(currentPassword, faculty.getPasswordHash(db, req.user.id)))) {
      throw new HttpError(400, 'WRONG_PASSWORD', 'Your current password is incorrect.');
    }
    faculty.setPasswordHash(db, req.user.id, await hashPassword(newPassword));
    sessions.deleteSessionsForFaculty(db, req.user.id, { exceptToken: readSessionToken(req) });
    res.json({ data: { success: true } });
  });

  return router;
}
