import express from 'express';
import { notFound } from '../lib/errors.js';
import { parsePagination, parseSort } from '../lib/pagination.js';
import { requireDate } from '../lib/validate.js';
import { requireHod } from '../middleware/auth.js';
import * as adjustments from '../repositories/adjustments.js';

const SORT_COLUMNS = { date: 'date', periodId: 'period_id', createdAt: 'created_at', subject: 'subject' };

export function adjustmentsRouter({ db }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { date, substituteFacultyId, originalFacultyId } = req.query;
    const { items, meta } = adjustments.queryAdjustments(db, {
      date: date === undefined ? undefined : requireDate(date),
      substituteFacultyId,
      originalFacultyId,
      orderBy: parseSort(req.query, SORT_COLUMNS, { key: 'createdAt', order: 'desc' }),
      ...parsePagination(req.query)
    });
    res.json({ data: items, meta });
  });

  router.delete('/:id', requireHod, (req, res) => {
    if (!adjustments.deleteAdjustment(db, req.params.id)) throw notFound('Adjustment not found.');
    res.status(204).end();
  });

  return router;
}
