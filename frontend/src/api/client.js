const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;
const UNREACHABLE_MESSAGE = 'Cannot reach the server. Please check that the backend is running and try again.';
const MAX_GET_RETRIES = 2;
const RETRY_DELAY_MS = 500;
const TRANSIENT_STATUSES = [502, 503, 504];

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function send(method, path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {})
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 0, 'NETWORK_ERROR');
  }

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || UNREACHABLE_MESSAGE, response.status, payload?.error?.code);
  }
  return payload?.data ?? null;
}

// Only reads retry automatically: repeating a failed write could apply it twice.
async function get(path, attempt = 0) {
  try {
    return await send('GET', path);
  } catch (err) {
    const isTransient = err.status === 0 || TRANSIENT_STATUSES.includes(err.status);
    if (!isTransient || attempt >= MAX_GET_RETRIES) throw err;
    await wait(RETRY_DELAY_MS * (attempt + 1));
    return get(path, attempt + 1);
  }
}

const post = (path, body) => send('POST', path, body);

export const api = {
  getSession: () => get('/auth/session'),
  login: (email, password) => post('/auth/login', { email, password }),
  logout: () => post('/auth/logout'),
  changePassword: (currentPassword, newPassword) => post('/auth/change-password', { currentPassword, newPassword }),

  getBootstrap: () => get('/bootstrap'),
  search: q => get(`/search?q=${encodeURIComponent(q)}`),
  resetDemo: () => post('/demo/reset'),

  createFaculty: faculty => post('/faculty', faculty),
  deleteFaculty: id => send('DELETE', `/faculty/${encodeURIComponent(id)}`),

  updateTimetableCell: (facultyId, day, periodId, classData) =>
    send('PUT', `/timetables/${encodeURIComponent(facultyId)}/${encodeURIComponent(day)}/${periodId}`, { classData }),

  createAbsence: absence => post('/absences', absence),
  approveAbsence: (id, assignments, notes) => post(`/absences/${encodeURIComponent(id)}/approve`, { assignments, notes }),
  rejectAbsence: id => post(`/absences/${encodeURIComponent(id)}/reject`),

  deleteAdjustment: id => send('DELETE', `/adjustments/${encodeURIComponent(id)}`)
};
