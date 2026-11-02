import express from 'express';
import { notFound } from '../lib/errors.js';
import { optionalText, requireDay, requirePeriod, requireText } from '../lib/validate.js';
import { requireHod } from '../middleware/auth.js';
import * as faculty from '../repositories/faculty.js';
import * as timetables from '../repositories/timetables.js';

export function timetablesRouter({ db }) {
  const router = express.Router();

  const assertFacultyExists = id => {
    if (!faculty.getFaculty(db, id)) throw notFound('Faculty member not found.');
  };

  router.get('/', (req, res) => {
    res.json({ data: timetables.getAllTimetables(db) });
  });

  router.get('/:facultyId', (req, res) => {
    assertFacultyExists(req.params.facultyId);
    res.json({ data: timetables.getFacultyTimetable(db, req.params.facultyId) });
  });

  router.put('/:facultyId/:day/:periodId', requireHod, (req, res) => {
    const { facultyId } = req.params;
    const day = requireDay(req.params.day);
    const period = requirePeriod(req.params.periodId);
    assertFacultyExists(facultyId);

    const input = req.body?.classData;
    const classData = input
      ? {
          subject: requireText(input.subject, 'Subject'),
          classGroup: optionalText(input.classGroup, 'Class group', 'General'),
          room: optionalText(input.room, 'Room', 'Room 101')
        }
      : null;
    timetables.setCell(db, facultyId, day, period.id, classData);
    res.json({ data: { classData } });
  });

  return router;
}
