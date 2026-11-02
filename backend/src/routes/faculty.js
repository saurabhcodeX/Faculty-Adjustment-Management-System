import { randomUUID } from 'node:crypto';
import express from 'express';
import { ROLES } from '../constants.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { parsePagination, parseSort } from '../lib/pagination.js';
import { hashPassword } from '../lib/password.js';
import { optionalText, requireEmail, requireOneOf, requirePassword, requireText } from '../lib/validate.js';
import { requireHod } from '../middleware/auth.js';
import * as faculty from '../repositories/faculty.js';
import * as sessions from '../repositories/sessions.js';

const SORT_COLUMNS = { name: 'name', designation: 'designation', department: 'department', email: 'email' };

export function facultyRouter({ db }) {
  const router = express.Router();

  const assertEmailAvailable = (email, ownId = null) => {
    const existing = faculty.getFacultyByEmail(db, email);
    if (existing && existing.id !== ownId) throw conflict('Another faculty member already uses this email.');
  };

  router.get('/', (req, res) => {
    const { items, meta } = faculty.queryFaculty(db, {
      search: req.query.search,
      role: req.query.role,
      department: req.query.department,
      orderBy: parseSort(req.query, SORT_COLUMNS, { key: 'name', order: 'asc' }),
      ...parsePagination(req.query)
    });
    res.json({ data: items, meta });
  });

  router.get('/:id', (req, res) => {
    const member = faculty.getFaculty(db, req.params.id);
    if (!member) throw notFound('Faculty member not found.');
    res.json({ data: member });
  });

  router.post('/', requireHod, async (req, res) => {
    const body = req.body ?? {};
    const member = {
      id: `f_${randomUUID()}`,
      name: requireText(body.name, 'Name'),
      designation: requireText(body.designation, 'Designation'),
      department: requireText(body.department, 'Department'),
      email: requireEmail(body.email),
      phone: optionalText(body.phone, 'Phone'),
      role: body.role === undefined ? 'faculty' : requireOneOf(body.role, ROLES, 'Role')
    };
    const password = requirePassword(body.password, 'Temporary password');
    assertEmailAvailable(member.email);
    faculty.insertFaculty(db, { ...member, passwordHash: await hashPassword(password) });
    res.status(201).json({ data: member });
  });

  router.patch('/:id', requireHod, async (req, res) => {
    const existing = faculty.getFaculty(db, req.params.id);
    if (!existing) throw notFound('Faculty member not found.');
    const body = req.body ?? {};
    const updated = {
      name: body.name === undefined ? existing.name : requireText(body.name, 'Name'),
      designation: body.designation === undefined ? existing.designation : requireText(body.designation, 'Designation'),
      department: body.department === undefined ? existing.department : requireText(body.department, 'Department'),
      email: body.email === undefined ? existing.email : requireEmail(body.email),
      phone: body.phone === undefined ? existing.phone : optionalText(body.phone, 'Phone'),
      role: body.role === undefined ? existing.role : requireOneOf(body.role, ROLES, 'Role')
    };
    if (existing.id === req.user.id && updated.role !== existing.role) {
      throw badRequest('You cannot change your own role.');
    }
    assertEmailAvailable(updated.email, existing.id);

    const passwordHash = body.password === undefined ? null : await hashPassword(requirePassword(body.password));
    faculty.updateFaculty(db, existing.id, updated);
    if (passwordHash) {
      faculty.setPasswordHash(db, existing.id, passwordHash);
      sessions.deleteSessionsForFaculty(db, existing.id);
    }
    res.json({ data: faculty.getFaculty(db, existing.id) });
  });

  router.delete('/:id', requireHod, (req, res) => {
    const existing = faculty.getFaculty(db, req.params.id);
    if (!existing) throw notFound('Faculty member not found.');
    if (existing.id === req.user.id) throw badRequest('You cannot remove your own account.');
    if (faculty.hasHistory(db, existing.id)) {
      throw conflict(`${existing.name} has absence or adjustment records, so they cannot be removed.`);
    }
    faculty.deleteFaculty(db, existing.id);
    res.status(204).end();
  });

  return router;
}
