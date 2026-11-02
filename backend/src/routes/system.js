import express from 'express';
import { DAYS_OF_WEEK, PERIODS } from '../constants.js';
import { seedDemoData } from '../db/seed.js';
import { notFound } from '../lib/errors.js';
import { requireHod, SESSION_COOKIE } from '../middleware/auth.js';
import * as absences from '../repositories/absences.js';
import * as adjustments from '../repositories/adjustments.js';
import * as faculty from '../repositories/faculty.js';
import * as timetables from '../repositories/timetables.js';
import { presentAbsence } from './absences.js';

const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 100;
const SEARCH_LIMIT = 8;

export function systemRouter({ db, config }) {
  const router = express.Router();

  router.get('/bootstrap', (req, res) => {
    res.json({
      data: {
        periods: PERIODS,
        daysOfWeek: DAYS_OF_WEEK,
        demoMode: config.demoMode,
        faculty: faculty.listAllFaculty(db),
        timetables: timetables.getAllTimetables(db),
        absences: absences.listAllAbsences(db).map(a => presentAbsence(a, req.user)),
        adjustments: adjustments.listAllAdjustments(db)
      }
    });
  });

  router.get('/search', (req, res) => {
    const term = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, MAX_SEARCH_LENGTH) : '';
    if (term.length < MIN_SEARCH_LENGTH) return res.json({ data: { faculty: [], classes: [] } });
    res.json({
      data: {
        faculty: faculty.searchFaculty(db, term, SEARCH_LIMIT),
        classes: timetables.searchClasses(db, term, SEARCH_LIMIT)
      }
    });
  });

  router.post('/demo/reset', requireHod, async (req, res) => {
    if (!config.demoMode) throw notFound('API route not found.');
    await seedDemoData(db, config.demoPassword);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ data: { success: true } });
  });

  return router;
}
