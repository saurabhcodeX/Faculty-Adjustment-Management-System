import { HttpError, notFound } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.user?.id
    });
  });
  next();
}

// Forcing a JSON content type makes cross-site form posts trigger a CORS preflight, which blocks CSRF.
export function requireJsonOnWrites(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return next(new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Requests must use Content-Type: application/json.'));
  }
  next();
}

export function apiNotFound(req, res, next) {
  next(notFound('API route not found.'));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: { code: 'INVALID_REQUEST', message: 'The request could not be understood.' } });
  }

  logger.error('Unhandled error', { path: req.originalUrl.split('?')[0], error: err.message, stack: err.stack });
  if (err.code === 'ERR_SQLITE_ERROR') {
    return res.status(503).json({ error: { code: 'DATABASE_ERROR', message: 'The database is unavailable. Please try again shortly.' } });
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on the server.' } });
}
