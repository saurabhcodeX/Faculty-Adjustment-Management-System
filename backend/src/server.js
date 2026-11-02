import { createApp } from './app.js';
import { loadConfig, loadEnvFile } from './config.js';
import { openDatabase } from './db/index.js';
import { ensureInitialData } from './db/seed.js';
import { logger } from './lib/logger.js';

async function main() {
  loadEnvFile();
  const config = loadConfig();
  const db = openDatabase(config.dbPath);
  await ensureInitialData(db, config);

  if (config.isProduction && config.demoMode) {
    logger.warn('DEMO_MODE is on in production: the Reset Demo button can erase all data.');
  }

  const server = createApp({ db, config }).listen(config.port, config.host, () => {
    logger.info('API started', { url: `http://${config.host}:${config.port}/api`, database: config.dbPath });
  });

  server.on('error', err => {
    logger.error('Server failed to start', { error: err.message });
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  logger.error('Startup failed', { error: err.message });
  process.exit(1);
});
