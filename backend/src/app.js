import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { logger } from './lib/logger.js';
import { requireAuth } from './middleware/auth.js';
import { apiNotFound, errorHandler, requestLogger, requireJsonOnWrites } from './middleware/http.js';
import { absencesRouter } from './routes/absences.js';
import { adjustmentsRouter } from './routes/adjustments.js';
import { authRouter } from './routes/auth.js';
import { facultyRouter } from './routes/faculty.js';
import { systemRouter } from './routes/system.js';
import { timetablesRouter } from './routes/timetables.js';

function healthCheck(db) {
  return (req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ data: { status: 'ok' } });
    } catch (err) {
      logger.error('Health check failed', { error: err.message });
      res.status(503).json({ error: { code: 'DATABASE_ERROR', message: 'The database is unavailable.' } });
    }
  };
}

export function createApp({ db, config }) {
  const app = express();
  const deps = { db, config };

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { upgradeInsecureRequests: config.cookieSecure ? [] : null }
      }
    })
  );
  app.use(requestLogger);

  if (config.corsOrigins.length > 0) {
    app.use('/api', cors({ origin: config.corsOrigins, credentials: true }));
  }

  app.get('/health', healthCheck(db));

  const api = express.Router();
  api.use(requireJsonOnWrites);
  api.use(express.json({ limit: '100kb' }));
  api.get('/health', healthCheck(db));
  api.use('/auth', authRouter(deps));

  const authenticated = express.Router();
  authenticated.use(requireAuth(db));
  authenticated.use('/faculty', facultyRouter(deps));
  authenticated.use('/timetables', timetablesRouter(deps));
  authenticated.use('/absences', absencesRouter(deps));
  authenticated.use('/adjustments', adjustmentsRouter(deps));
  authenticated.use(systemRouter(deps));
  authenticated.use(apiNotFound);
  api.use(authenticated);

  app.use('/api', api);

  if (config.frontendDist) {
    app.use(express.static(config.frontendDist));
    app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: config.frontendDist }));
  }

  app.use(errorHandler);
  return app;
}
