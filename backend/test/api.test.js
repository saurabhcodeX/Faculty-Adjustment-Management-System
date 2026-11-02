import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/index.js';
import { ensureInitialData, seedDemoData } from '../src/db/seed.js';

process.env.LOG_LEVEL = 'silent';

const PASSWORD = 'test-password-123';
const HOD = 'rajesh.sharma@college.edu';
const PRIYA = 'priya.verma@college.edu';
const AMIT = 'amit.patel@college.edu';
const DEMO_ABSENCE = 'abs-demo-1';

const config = loadConfig({ DEMO_MODE: 'true', DEMO_PASSWORD: PASSWORD, DB_PATH: ':memory:' });

let db;
let server;
let baseUrl;

function client() {
  let cookie = '';
  const call = async (method, path, body) => {
    const res = await fetch(`${baseUrl}/api${path}`, {
      method,
      headers: {
        ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
        ...(cookie ? { Cookie: cookie } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null, setCookie };
  };
  return {
    get: path => call('GET', path),
    post: (path, body) => call('POST', path, body),
    put: (path, body) => call('PUT', path, body),
    patch: (path, body) => call('PATCH', path, body),
    del: path => call('DELETE', path)
  };
}

async function signIn(email, password = PASSWORD) {
  const c = client();
  const res = await c.post('/auth/login', { email, password });
  assert.equal(res.status, 200);
  return c;
}

const absenceBody = (overrides = {}) => ({
  facultyId: 'f3',
  date: '2026-11-09',
  dayOfWeek: 'Monday',
  reason: 'Family function',
  leaveType: 'Casual Leave',
  periodsToAdjust: [1],
  ...overrides
});

before(async () => {
  db = openDatabase(':memory:');
  await new Promise(resolve => {
    server = createApp({ db, config }).listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  server.closeAllConnections();
  db.close();
});

beforeEach(() => seedDemoData(db, PASSWORD));

describe('authentication', () => {
  it('rejects anonymous access to protected routes', async () => {
    for (const path of ['/bootstrap', '/faculty', '/absences', '/adjustments', '/timetables', '/search?q=ab']) {
      assert.equal((await client().get(path)).status, 401, path);
    }
  });

  it('reports no session when signed out and health stays public', async () => {
    const c = client();
    assert.equal((await c.get('/auth/session')).body.data.user, null);
    assert.equal((await c.get('/health')).body.data.status, 'ok');
  });

  it('signs in with an httpOnly cookie and never returns the password hash', async () => {
    const c = client();
    const res = await c.post('/auth/login', { email: HOD.toUpperCase(), password: PASSWORD });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, 'hod');
    assert.match(res.setCookie, /HttpOnly/i);
    assert.match(res.setCookie, /SameSite=Lax/i);

    const raw = JSON.stringify((await c.get('/bootstrap')).body);
    assert.ok(!raw.includes('scrypt'));
    assert.ok(!raw.includes('password'));
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const wrong = await client().post('/auth/login', { email: HOD, password: 'nope-nope-nope' });
    const unknown = await client().post('/auth/login', { email: 'x@y.edu', password: 'nope-nope-nope' });
    assert.equal(wrong.status, 401);
    assert.deepEqual(wrong.body, unknown.body);
  });

  it('invalidates the session on logout', async () => {
    const c = await signIn(PRIYA);
    assert.equal((await c.get('/bootstrap')).status, 200);
    await c.post('/auth/logout', {});
    assert.equal((await c.get('/bootstrap')).status, 401);
  });

  it('changes the password, keeps this session and ends the others', async () => {
    const here = await signIn(PRIYA);
    const elsewhere = await signIn(PRIYA);

    const wrong = await here.post('/auth/change-password', { currentPassword: 'wrong-pass', newPassword: 'new-password-1' });
    assert.equal(wrong.status, 400);
    const short = await here.post('/auth/change-password', { currentPassword: PASSWORD, newPassword: 'short' });
    assert.equal(short.status, 400);

    const ok = await here.post('/auth/change-password', { currentPassword: PASSWORD, newPassword: 'new-password-1' });
    assert.equal(ok.status, 200);
    assert.equal((await here.get('/bootstrap')).status, 200);
    assert.equal((await elsewhere.get('/bootstrap')).status, 401);
    await signIn(PRIYA, 'new-password-1');
    assert.equal((await client().post('/auth/login', { email: PRIYA, password: PASSWORD })).status, 401);
  });

  it('rejects writes that are not JSON, which blocks cross-site form posts', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ email: HOD, password: PASSWORD })
    });
    assert.equal(res.status, 415);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json'
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'INVALID_REQUEST');
  });
});

describe('authorization', () => {
  it('blocks HOD-only actions for faculty', async () => {
    const c = await signIn(PRIYA);
    const attempts = [
      c.post('/faculty', { name: 'A', designation: 'B', department: 'C', email: 'a@b.edu', password: PASSWORD }),
      c.patch('/faculty/f3', { name: 'Hacked' }),
      c.patch('/faculty/f2', { role: 'hod' }),
      c.del('/faculty/f3'),
      c.put('/timetables/f2/Monday/1', { classData: { subject: 'X' } }),
      c.post(`/absences/${DEMO_ABSENCE}/approve`, { assignments: {} }),
      c.post(`/absences/${DEMO_ABSENCE}/reject`, {}),
      c.del('/adjustments/anything'),
      c.post('/demo/reset', {})
    ];
    for (const res of await Promise.all(attempts)) assert.equal(res.status, 403);
  });

  it('only lets faculty report their own absence, while the HOD can report for anyone', async () => {
    const amit = await signIn(AMIT);
    assert.equal((await amit.post('/absences', absenceBody({ facultyId: 'f2' }))).status, 403);
    assert.equal((await amit.post('/absences', absenceBody())).status, 201);

    const hod = await signIn(HOD);
    assert.equal((await hod.post('/absences', absenceBody({ facultyId: 'f4', periodsToAdjust: [2] }))).status, 201);
  });

  it('hides leave reasons from other faculty but not from the owner or HOD', async () => {
    const reasonSeenBy = async email => {
      const { body } = await (await signIn(email)).get('/bootstrap');
      return body.data.absences.find(a => a.id === DEMO_ABSENCE).reason;
    };
    assert.equal(await reasonSeenBy(AMIT), null);
    assert.equal(await reasonSeenBy(PRIYA), 'Attending IEEE AI Conference');
    assert.equal(await reasonSeenBy(HOD), 'Attending IEEE AI Conference');

    const amit = await signIn(AMIT);
    assert.equal((await amit.get(`/absences/${DEMO_ABSENCE}`)).body.data.reason, null);
    assert.equal((await amit.get('/absences')).body.data[0].reason, null);
  });
});

describe('faculty', () => {
  it('creates, signs in, updates and deletes a teacher', async () => {
    const hod = await signIn(HOD);
    const created = await hod.post('/faculty', {
      name: 'Dr. Sunita Mehra', designation: 'Lecturer', department: 'CS', email: 'Sunita@College.edu', password: 'temp-pass-123'
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.email, 'sunita@college.edu');
    assert.equal(created.body.data.role, 'faculty');

    const sunita = await signIn('sunita@college.edu', 'temp-pass-123');
    assert.equal((await sunita.get('/auth/session')).body.data.user.name, 'Dr. Sunita Mehra');

    const updated = await hod.patch(`/faculty/${created.body.data.id}`, { designation: 'Professor' });
    assert.equal(updated.body.data.designation, 'Professor');
    assert.equal(updated.body.data.name, 'Dr. Sunita Mehra');

    assert.equal((await hod.patch(`/faculty/${created.body.data.id}`, { password: 'reset-pass-123' })).status, 200);
    assert.equal((await sunita.get('/bootstrap')).status, 401);

    assert.equal((await hod.del(`/faculty/${created.body.data.id}`)).status, 204);
    assert.equal((await hod.get(`/faculty/${created.body.data.id}`)).status, 404);
  });

  it('rejects invalid and duplicate faculty', async () => {
    const hod = await signIn(HOD);
    const base = { name: 'N', designation: 'D', department: 'C', email: 'n@c.edu', password: 'temp-pass-123' };
    assert.equal((await hod.post('/faculty', { ...base, name: ' ' })).status, 400);
    assert.equal((await hod.post('/faculty', { ...base, email: 'bad' })).status, 400);
    assert.equal((await hod.post('/faculty', { ...base, password: 'short' })).status, 400);
    assert.equal((await hod.post('/faculty', { ...base, role: 'root' })).status, 400);
    assert.equal((await hod.post('/faculty', { ...base, email: PRIYA.toUpperCase() })).status, 409);
    assert.equal((await hod.patch('/faculty/f3', { email: PRIYA })).status, 409);
  });

  it('protects the HOD account and teachers with history', async () => {
    const hod = await signIn(HOD);
    assert.equal((await hod.del('/faculty/f1')).status, 400);
    assert.equal((await hod.patch('/faculty/f1', { role: 'faculty' })).status, 400);
    assert.equal((await hod.del('/faculty/f2')).status, 409);
  });

  it('paginates, searches, filters and sorts', async () => {
    const hod = await signIn(HOD);
    const page = await hod.get('/faculty?page=2&pageSize=3&sort=name&order=asc');
    assert.equal(page.body.data.length, 3);
    assert.deepEqual(page.body.meta, { page: 2, pageSize: 3, total: 7, totalPages: 3 });

    const names = (await hod.get('/faculty?sort=name&order=desc')).body.data.map(f => f.name);
    assert.deepEqual(names, [...names].sort().reverse());

    assert.equal((await hod.get('/faculty?search=priya')).body.meta.total, 1);
    assert.equal((await hod.get('/faculty?search=%25')).body.meta.total, 0);
    assert.equal((await hod.get('/faculty?role=hod')).body.data[0].id, 'f1');
    assert.equal((await hod.get('/faculty?sort=password_hash')).status, 400);
    assert.equal((await hod.get('/faculty?page=0')).status, 400);
    assert.equal((await hod.get('/faculty?pageSize=100000')).body.meta.pageSize, 100);
  });
});

describe('timetables', () => {
  it('reads, sets, defaults and clears a cell', async () => {
    const hod = await signIn(HOD);
    const set = await hod.put('/timetables/f7/Wednesday/1', { classData: { subject: ' Graphics ' } });
    assert.deepEqual(set.body.data.classData, { subject: 'Graphics', classGroup: 'General', room: 'Room 101' });

    const week = (await hod.get('/timetables/f7')).body.data;
    assert.equal(week.Wednesday[1].subject, 'Graphics');
    assert.equal(week.Wednesday[2], null);

    await hod.put('/timetables/f7/Wednesday/1', { classData: null });
    assert.equal((await hod.get('/timetables')).body.data.f7.Wednesday[1], null);
  });

  it('validates the day, period, faculty and subject', async () => {
    const hod = await signIn(HOD);
    const classData = { subject: 'X' };
    assert.equal((await hod.put('/timetables/f7/Sunday/1', { classData })).status, 400);
    assert.equal((await hod.put('/timetables/f7/Monday/9', { classData })).status, 400);
    assert.equal((await hod.put('/timetables/nobody/Monday/1', { classData })).status, 404);
    assert.equal((await hod.put('/timetables/f7/Monday/1', { classData: { subject: '' } })).status, 400);
  });
});

describe('absences and adjustments', () => {
  it('validates new absences and rejects overlapping requests', async () => {
    const amit = await signIn(AMIT);
    assert.equal((await amit.post('/absences', absenceBody({ reason: '  ' }))).status, 400);
    assert.equal((await amit.post('/absences', absenceBody({ date: '2026-02-31' }))).status, 400);
    assert.equal((await amit.post('/absences', absenceBody({ dayOfWeek: 'Sunday' }))).status, 400);
    assert.equal((await amit.post('/absences', absenceBody({ periodsToAdjust: [9] }))).status, 400);
    assert.equal((await amit.post('/absences', absenceBody({ periodsToAdjust: 'all' }))).status, 400);

    assert.equal((await amit.post('/absences', absenceBody())).status, 201);
    assert.equal((await amit.post('/absences', absenceBody())).status, 409);
    assert.equal((await amit.post('/absences', absenceBody({ periodsToAdjust: [4] }))).status, 201);
  });

  it('approves with substitutes and copies class details from the timetable', async () => {
    const hod = await signIn(HOD);
    const res = await hod.post(`/absences/${DEMO_ABSENCE}/approve`, {
      assignments: { 3: { substituteFacultyId: 'f1' }, 4: { substituteFacultyId: 'f5' } },
      notes: 'Covered'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.absence.status, 'Approved');
    assert.ok(res.body.data.absence.approvedAt);

    const [first] = res.body.data.adjustments;
    assert.equal(first.subject, 'Machine Learning');
    assert.equal(first.classGroup, 'CS-3A');
    assert.equal(first.substituteFacultyName, 'Dr. Rajesh Sharma');
    assert.equal(first.notes, 'Covered');

    const filtered = await hod.get('/adjustments?date=2026-11-02&substituteFacultyId=f5');
    assert.equal(filtered.body.meta.total, 1);
    assert.equal(filtered.body.data[0].periodId, 4);

    assert.equal((await hod.post(`/absences/${DEMO_ABSENCE}/approve`, { assignments: {} })).status, 409);
  });

  it('refuses substitutes who are not actually free', async () => {
    const hod = await signIn(HOD);
    const approve = (absenceId, assignments) => hod.post(`/absences/${absenceId}/approve`, { assignments });

    assert.equal((await approve(DEMO_ABSENCE, { 3: { substituteFacultyId: 'f2' } })).status, 409, 'absent teacher');
    assert.equal((await approve(DEMO_ABSENCE, { 3: { substituteFacultyId: 'f7' } })).status, 409, 'own class');
    assert.equal((await approve(DEMO_ABSENCE, { 3: { substituteFacultyId: 'ghost' } })).status, 400, 'unknown');
    assert.equal((await approve(DEMO_ABSENCE, { 1: { substituteFacultyId: 'f1' } })).status, 400, 'wrong period');
    assert.equal((await approve('missing', {})).status, 404);

    const stillPending = (await hod.get(`/absences/${DEMO_ABSENCE}`)).body.data;
    assert.equal(stillPending.status, 'Pending');
    assert.equal((await hod.get('/adjustments')).body.meta.total, 0);

    assert.equal((await approve(DEMO_ABSENCE, { 4: { substituteFacultyId: 'f5' } })).status, 200);
    const second = await hod.post('/absences', absenceBody({ facultyId: 'f3', date: '2026-11-02', periodsToAdjust: [4] }));
    assert.equal((await approve(second.body.data.id, { 4: { substituteFacultyId: 'f5' } })).status, 409, 'double booked');
  });

  it('treats an absence with no selected lectures as away all day', async () => {
    const hod = await signIn(HOD);
    await hod.post('/absences', absenceBody({ facultyId: 'f5', date: '2026-11-02', periodsToAdjust: [] }));
    const res = await hod.post(`/absences/${DEMO_ABSENCE}/approve`, { assignments: { 4: { substituteFacultyId: 'f5' } } });
    assert.equal(res.status, 409);
  });

  it('rejecting removes adjustments and frees the substitute', async () => {
    const hod = await signIn(HOD);
    await hod.post(`/absences/${DEMO_ABSENCE}/approve`, { assignments: { 4: { substituteFacultyId: 'f5' } } });
    const rejected = await hod.post(`/absences/${DEMO_ABSENCE}/reject`, {});
    assert.equal(rejected.body.data.status, 'Rejected');
    assert.equal(rejected.body.data.approvedAt, null);
    assert.equal((await hod.get('/adjustments')).body.meta.total, 0);
  });

  it('cancels a single adjustment', async () => {
    const hod = await signIn(HOD);
    const { body } = await hod.post(`/absences/${DEMO_ABSENCE}/approve`, { assignments: { 4: { substituteFacultyId: 'f5' } } });
    assert.equal((await hod.del(`/adjustments/${body.data.adjustments[0].id}`)).status, 204);
    assert.equal((await hod.del(`/adjustments/${body.data.adjustments[0].id}`)).status, 404);
  });

  it('filters and paginates absences', async () => {
    const hod = await signIn(HOD);
    await hod.post('/absences', absenceBody());
    assert.equal((await hod.get('/absences')).body.meta.total, 2);
    assert.equal((await hod.get('/absences?facultyId=f3')).body.meta.total, 1);
    assert.equal((await hod.get('/absences?status=Approved')).body.meta.total, 0);
    assert.equal((await hod.get('/absences?from=2026-11-03')).body.data[0].facultyId, 'f3');
    assert.equal((await hod.get('/absences?to=2026-11-03')).body.data[0].id, DEMO_ABSENCE);
    assert.equal((await hod.get('/absences?search=verma')).body.meta.total, 1);
    assert.equal((await hod.get('/absences?status=Nope')).status, 400);
    assert.equal((await hod.get('/absences?from=soon')).status, 400);
  });
});

describe('search and bootstrap', () => {
  it('finds faculty and classes, ignoring too-short terms', async () => {
    const c = await signIn(PRIYA);
    const results = (await c.get('/search?q=network')).body.data;
    assert.ok(results.classes.some(k => k.subject === 'Computer Networks' && k.facultyName === 'Prof. Neha Gupta'));
    assert.equal((await c.get('/search?q=verma')).body.data.faculty[0].id, 'f2');
    assert.deepEqual((await c.get('/search?q=a')).body.data, { faculty: [], classes: [] });
  });

  it('returns everything the frontend needs', async () => {
    const { data } = (await (await signIn(PRIYA)).get('/bootstrap')).body;
    assert.equal(data.periods.length, 8);
    assert.equal(data.daysOfWeek.length, 6);
    assert.equal(data.faculty.length, 7);
    assert.equal(data.demoMode, true);
    assert.equal(data.timetables.f2.Monday[3].subject, 'Machine Learning');
    assert.equal(data.timetables.f2.Monday[1], null);
  });

  it('returns JSON 404s for unknown API routes', async () => {
    const res = await (await signIn(HOD)).get('/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});

describe('demo reset', () => {
  it('restores the sample data and signs everyone out', async () => {
    const hod = await signIn(HOD);
    await hod.post('/absences', absenceBody());
    assert.equal((await hod.post('/demo/reset', {})).status, 200);
    assert.equal((await hod.get('/bootstrap')).status, 401);
    const fresh = await signIn(HOD);
    assert.equal((await fresh.get('/absences')).body.meta.total, 1);
  });
});

describe('startup and persistence', () => {
  it('creates the first HOD from env vars when not in demo mode, and refuses to start without them', async () => {
    const emptyDb = openDatabase(':memory:');
    const realConfig = loadConfig({});
    await assert.rejects(ensureInitialData(emptyDb, realConfig), /ADMIN_NAME/);

    await ensureInitialData(emptyDb, {
      ...realConfig,
      admin: { name: 'Real HOD', email: 'HOD@Real.edu', password: 'long-enough-1' }
    });
    const row = emptyDb.prepare('SELECT email, role FROM faculty').all();
    assert.equal(row.length, 1);
    assert.equal(row[0].email, 'hod@real.edu');
    assert.equal(row[0].role, 'hod');
    emptyDb.close();
  });

  it('hides the demo reset outside demo mode', async () => {
    const realDb = openDatabase(':memory:');
    await seedDemoData(realDb, PASSWORD);
    const realServer = await new Promise(resolve => {
      const s = createApp({ db: realDb, config: { ...config, demoMode: false } }).listen(0, '127.0.0.1', () => resolve(s));
    });
    const realUrl = `http://127.0.0.1:${realServer.address().port}/api`;
    const login = await fetch(`${realUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: HOD, password: PASSWORD })
    });
    const res = await fetch(`${realUrl}/demo/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: login.headers.get('set-cookie').split(';')[0] },
      body: '{}'
    });
    assert.equal(res.status, 404);
    realServer.close();
    realServer.closeAllConnections();
    realDb.close();
  });

  it('rejects unsafe cookie configuration', () => {
    assert.throws(() => loadConfig({ COOKIE_SAMESITE: 'none' }), /COOKIE_SECURE/);
    assert.throws(() => loadConfig({ DEMO_MODE: 'true' }), /DEMO_PASSWORD/);
    assert.equal(loadConfig({ NODE_ENV: 'production' }).cookieSecure, true);
  });
});

describe('login rate limit', () => {
  it('locks out after repeated failures', async () => {
    const statuses = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await client().post('/auth/login', { email: HOD, password: 'wrong-password' })).status);
    }
    assert.equal(statuses.at(-1), 429);
    assert.ok(statuses.slice(0, 5).every(s => s === 401));
  });
});
