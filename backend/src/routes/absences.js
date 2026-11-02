import { randomUUID } from 'node:crypto';
import express from 'express';
import { ABSENCE_STATUSES } from '../constants.js';
import { transaction } from '../db/index.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { parsePagination, parseSort } from '../lib/pagination.js';
import { optionalText, requireDate, requireDay, requireOneOf, requirePeriod, requireText } from '../lib/validate.js';
import { requireHod } from '../middleware/auth.js';
import * as absences from '../repositories/absences.js';
import * as adjustments from '../repositories/adjustments.js';
import * as faculty from '../repositories/faculty.js';
import * as timetables from '../repositories/timetables.js';

const SORT_COLUMNS = { date: 'date', reportedAt: 'reported_at', facultyName: 'faculty_name', status: 'status' };

// Leave reasons can be medical, so colleagues only see that someone is away, not why.
export function presentAbsence(absence, user) {
  if (user.role === 'hod' || absence.facultyId === user.id) return absence;
  return { ...absence, reason: null, leaveType: null };
}

function findSubstituteConflict(db, substitute, absence, periodId) {
  if (substitute.id === absence.facultyId) return `${substitute.name} is the absent faculty member`;
  const isAbsent = absences
    .listActiveAbsencesFor(db, substitute.id, absence.date)
    .some(a => a.periodsToAdjust.length === 0 || a.periodsToAdjust.includes(periodId));
  if (isAbsent) return `${substitute.name} is absent`;
  if (timetables.getCell(db, substitute.id, absence.dayOfWeek, periodId)) {
    return `${substitute.name} has their own class`;
  }
  if (adjustments.isSubstituteBooked(db, substitute.id, absence.date, periodId)) {
    return `${substitute.name} is already substituting`;
  }
  return null;
}

function buildAdjustments(db, absence, assignments, notes, timestamp) {
  return Object.entries(assignments).map(([rawPeriodId, assignment]) => {
    const period = requirePeriod(rawPeriodId);
    if (!absence.periodsToAdjust.includes(period.id)) {
      throw badRequest(`${period.label} is not part of this absence request.`);
    }
    const substitute = faculty.getFaculty(db, assignment?.substituteFacultyId);
    if (!substitute) throw badRequest(`Unknown substitute for ${period.label}.`);

    const problem = findSubstituteConflict(db, substitute, absence, period.id);
    if (problem) throw conflict(`Cannot assign ${period.label}: ${problem}.`);

    const classDetails = timetables.getCell(db, absence.facultyId, absence.dayOfWeek, period.id);
    return {
      id: `adj-${randomUUID()}`,
      absenceId: absence.id,
      date: absence.date,
      dayOfWeek: absence.dayOfWeek,
      periodId: period.id,
      periodTime: period.time,
      originalFacultyId: absence.facultyId,
      originalFacultyName: absence.facultyName,
      substituteFacultyId: substitute.id,
      substituteFacultyName: substitute.name,
      subject: classDetails?.subject ?? 'Class',
      classGroup: classDetails?.classGroup ?? '',
      room: classDetails?.room ?? '',
      approvedBy: 'HOD',
      notes,
      status: 'Confirmed',
      createdAt: timestamp
    };
  });
}

export function absencesRouter({ db }) {
  const router = express.Router();

  const requireAbsence = id => {
    const absence = absences.getAbsence(db, id);
    if (!absence) throw notFound('Absence request not found.');
    return absence;
  };

  router.get('/', (req, res) => {
    const { status, facultyId, from, to, search } = req.query;
    const { items, meta } = absences.queryAbsences(db, {
      status: status === undefined ? undefined : requireOneOf(status, ABSENCE_STATUSES, 'status'),
      facultyId,
      from: from === undefined ? undefined : requireDate(from),
      to: to === undefined ? undefined : requireDate(to),
      search,
      orderBy: parseSort(req.query, SORT_COLUMNS, { key: 'reportedAt', order: 'desc' }),
      ...parsePagination(req.query)
    });
    res.json({ data: items.map(a => presentAbsence(a, req.user)), meta });
  });

  router.get('/:id', (req, res) => {
    res.json({ data: presentAbsence(requireAbsence(req.params.id), req.user) });
  });

  router.post('/', (req, res) => {
    const body = req.body ?? {};
    const member = faculty.getFaculty(db, body.facultyId);
    if (!member) throw badRequest('Unknown faculty member.');
    if (req.user.role !== 'hod' && member.id !== req.user.id) {
      throw forbidden('You can only report your own absence.');
    }
    if (!Array.isArray(body.periodsToAdjust)) throw badRequest('Lecture periods must be a list.');

    const date = requireDate(body.date);
    const periodsToAdjust = [...new Set(body.periodsToAdjust.map(p => requirePeriod(p).id))];
    const overlapping = absences
      .listActiveAbsencesFor(db, member.id, date)
      .flatMap(a => a.periodsToAdjust)
      .filter(p => periodsToAdjust.includes(p));
    if (overlapping.length > 0) {
      throw conflict(`${member.name} already has an absence request on ${date} for lecture(s) ${overlapping.join(', ')}.`);
    }

    const absence = {
      id: `abs-${randomUUID()}`,
      facultyId: member.id,
      facultyName: member.name,
      date,
      dayOfWeek: requireDay(body.dayOfWeek),
      reason: requireText(body.reason, 'Reason'),
      leaveType: optionalText(body.leaveType, 'Leave type', 'Casual Leave'),
      status: 'Pending',
      reportedAt: new Date().toISOString(),
      approvedAt: null,
      periodsToAdjust
    };
    absences.insertAbsence(db, absence);
    res.status(201).json({ data: absence });
  });

  router.post('/:id/approve', requireHod, (req, res) => {
    const absence = requireAbsence(req.params.id);
    if (absence.status !== 'Pending') throw conflict(`This request is already ${absence.status.toLowerCase()}.`);

    const assignments = req.body?.assignments ?? {};
    if (typeof assignments !== 'object' || Array.isArray(assignments)) throw badRequest('Invalid assignments.');

    const timestamp = new Date().toISOString();
    const notes = optionalText(req.body?.notes, 'Notes', '');
    const created = buildAdjustments(db, absence, assignments, notes, timestamp);

    transaction(db, () => {
      created.forEach(a => adjustments.insertAdjustment(db, a));
      absences.setStatus(db, absence.id, 'Approved', timestamp);
    });
    res.json({
      data: {
        absence: absences.getAbsence(db, absence.id),
        adjustments: adjustments.listForAbsence(db, absence.id)
      }
    });
  });

  router.post('/:id/reject', requireHod, (req, res) => {
    const absence = requireAbsence(req.params.id);
    transaction(db, () => {
      adjustments.deleteForAbsence(db, absence.id);
      absences.setStatus(db, absence.id, 'Rejected');
    });
    res.json({ data: absences.getAbsence(db, absence.id) });
  });

  return router;
}
