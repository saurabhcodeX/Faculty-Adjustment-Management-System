import { randomUUID } from 'node:crypto';
import { hashPassword } from '../lib/password.js';
import { logger } from '../lib/logger.js';
import * as absences from '../repositories/absences.js';
import * as faculty from '../repositories/faculty.js';
import * as timetables from '../repositories/timetables.js';
import { INITIAL_ABSENCES, INITIAL_FACULTY, INITIAL_TIMETABLES } from './demoData.js';
import { transaction } from './index.js';

const DEMO_HOD_ID = 'f1';

export async function seedDemoData(db, password) {
  const passwordHash = await hashPassword(password);
  transaction(db, () => {
    db.exec('DELETE FROM adjustments; DELETE FROM absences; DELETE FROM sessions; DELETE FROM timetable_cells; DELETE FROM faculty;');
    for (const member of INITIAL_FACULTY) {
      faculty.insertFaculty(db, { ...member, role: member.id === DEMO_HOD_ID ? 'hod' : 'faculty', passwordHash });
    }
    for (const [facultyId, days] of Object.entries(INITIAL_TIMETABLES)) {
      for (const [day, cells] of Object.entries(days)) {
        for (const [periodId, classData] of Object.entries(cells)) {
          timetables.setCell(db, facultyId, day, Number(periodId), classData);
        }
      }
    }
    INITIAL_ABSENCES.forEach(absence => absences.insertAbsence(db, absence));
  });
}

// An empty database needs a first account, otherwise nobody could ever sign in.
export async function ensureInitialData(db, config) {
  if (faculty.countFaculty(db) > 0) return;

  if (config.demoMode) {
    await seedDemoData(db, config.demoPassword);
    logger.info('Seeded demo data');
    return;
  }

  const { name, email, password } = config.admin;
  if (!name || !email || !password) {
    throw new Error('The database is empty. Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD to create the first HOD account.');
  }
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters.');

  faculty.insertFaculty(db, {
    id: `f_${randomUUID()}`,
    name,
    designation: 'HOD',
    department: 'General',
    email: email.toLowerCase(),
    role: 'hod',
    passwordHash: await hashPassword(password)
  });
  logger.info('Created first HOD account', { email });
}
