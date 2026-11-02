import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url));
const DEFAULT_DB_PATH = fileURLToPath(new URL('../data/fams.db', import.meta.url));
const DEFAULT_FRONTEND_DIST = fileURLToPath(new URL('../../frontend/dist', import.meta.url));

const toBool = (value, fallback) => (value === undefined || value === '' ? fallback : value === 'true');

export function loadEnvFile() {
  if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
}

export function loadConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  const cookieSameSite = env.COOKIE_SAMESITE || 'lax';
  const cookieSecure = toBool(env.COOKIE_SECURE, isProduction);
  const demoMode = toBool(env.DEMO_MODE, false);

  if (!['strict', 'lax', 'none'].includes(cookieSameSite)) {
    throw new Error('COOKIE_SAMESITE must be strict, lax or none.');
  }
  if (cookieSameSite === 'none' && !cookieSecure) {
    throw new Error('COOKIE_SAMESITE=none requires COOKIE_SECURE=true.');
  }
  if (demoMode && !env.DEMO_PASSWORD) {
    throw new Error('DEMO_MODE=true requires DEMO_PASSWORD to be set.');
  }

  return {
    isProduction,
    port: Number(env.PORT) || 4000,
    host: env.HOST || '127.0.0.1',
    dbPath: env.DB_PATH || DEFAULT_DB_PATH,
    demoMode,
    demoPassword: env.DEMO_PASSWORD,
    admin: { name: env.ADMIN_NAME, email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD },
    sessionTtlMs: (Number(env.SESSION_TTL_HOURS) || 168) * 60 * 60 * 1000,
    cookieSecure,
    cookieSameSite,
    corsOrigins: (env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
    trustProxy: Number(env.TRUST_PROXY) || false,
    frontendDist: isProduction ? env.FRONTEND_DIST || DEFAULT_FRONTEND_DIST : null
  };
}
