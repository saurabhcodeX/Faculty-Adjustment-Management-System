# Faculty Adjustment Management System

React (Vite) frontend, Express API and a SQLite database. Faculty report absences, and the HOD assigns free teachers as substitutes.

Requires Node.js 22.13 or newer.

## Run locally

```
npm run setup
copy backend\.env.example backend\.env
```

Edit `backend/.env`. To explore with sample data, set `DEMO_MODE=true` and choose a `DEMO_PASSWORD`. Otherwise set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create the first HOD account.

Then start each of these in its own terminal:

```
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173. The Vite dev server forwards `/api` requests to the backend on port 4000.

### Demo accounts

With `DEMO_MODE=true`, every account signs in with `DEMO_PASSWORD`:

| Role | Email |
| --- | --- |
| HOD | rajesh.sharma@college.edu |
| Faculty | priya.verma@college.edu |
| Faculty | amit.patel@college.edu |
| Faculty | neha.gupta@college.edu |
| Faculty | vikram.singh@college.edu |
| Faculty | ananya.iyer@college.edu |
| Faculty | rohit.nair@college.edu |

## Tests

```
npm test
```

## Deploy

The simplest setup runs one Node process that serves both the API and the built frontend, so no CORS configuration is needed.

1. Set these environment variables on the host:

   ```
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=4000
   DB_PATH=/path/on/persistent/disk/fams.db
   ADMIN_NAME=...
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=...
   TRUST_PROXY=1
   ```

   `TRUST_PROXY` is the number of reverse proxies in front of the app. Leave it out if there are none.

2. Build and start:

   ```
   npm run setup
   npm run build
   npm start
   ```

3. Put the app behind HTTPS. In production, sign-in cookies are only sent over HTTPS, so sign-in fails over plain HTTP. Set `COOKIE_SECURE=false` only for a temporary test on a trusted network.

4. Sign in as the HOD, change the password, and add your teachers in Timetable Manager. The `ADMIN_*` variables are only read while the database is empty, so you can remove them afterwards.

### Storage and scaling

- `DB_PATH` must be on a disk that survives restarts and redeploys. On hosts with temporary filesystems, attach a persistent volume or all data is lost.
- SQLite supports one running server process, so run a single instance.
- Back up the database with `sqlite3 fams.db ".backup backup.db"`, or copy the `.db`, `.db-wal` and `.db-shm` files together while the app is stopped.

### Hosting the frontend separately

1. Build the frontend with `VITE_API_URL=https://your-api-host`.
2. On the backend, set `CORS_ORIGINS=https://your-frontend-host`.
3. If the two are on unrelated domains, also set `COOKIE_SAMESITE=none`. Subdomains of one domain work with the default `lax`.

## API

All routes are under `/api`. Success responses look like `{ "data": ..., "meta": ... }` and errors like `{ "error": { "code", "message" } }`. Sessions use an httpOnly cookie, and writes must send `Content-Type: application/json`.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Server and database status |
| GET | `/auth/session` | Public | Current user, or null |
| POST | `/auth/login` | Public | Sign in (limited to 10 failed attempts per 15 minutes) |
| POST | `/auth/logout` | Public | Sign out |
| POST | `/auth/change-password` | Signed in | Change own password |
| GET | `/bootstrap` | Signed in | All data the frontend needs |
| GET | `/search?q=` | Signed in | Search faculty and classes |
| GET | `/faculty` | Signed in | List: `search`, `role`, `department`, `sort`, `order`, `page`, `pageSize` |
| GET | `/faculty/:id` | Signed in | One teacher |
| POST | `/faculty` | HOD | Add a teacher and their login |
| PATCH | `/faculty/:id` | HOD | Edit a teacher, or reset their password |
| DELETE | `/faculty/:id` | HOD | Remove a teacher with no absence or adjustment records |
| GET | `/timetables` | Signed in | All timetables |
| GET | `/timetables/:facultyId` | Signed in | One teacher's week |
| PUT | `/timetables/:facultyId/:day/:periodId` | HOD | Set or clear a lecture |
| GET | `/absences` | Signed in | List: `status`, `facultyId`, `from`, `to`, `search`, `sort`, `order`, `page`, `pageSize` |
| GET | `/absences/:id` | Signed in | One request |
| POST | `/absences` | Signed in | Report an absence (faculty for themselves, HOD for anyone) |
| POST | `/absences/:id/approve` | HOD | Approve and assign substitutes |
| POST | `/absences/:id/reject` | HOD | Reject and cancel its adjustments |
| GET | `/adjustments` | Signed in | List: `date`, `substituteFacultyId`, `originalFacultyId`, `sort`, `order`, `page`, `pageSize` |
| DELETE | `/adjustments/:id` | HOD | Cancel a substitution |
| POST | `/demo/reset` | HOD, demo mode only | Restore the sample data |

Leave reasons and leave types are only visible to the HOD and the teacher who reported them.
