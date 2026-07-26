const config = require('./config/config');
const logger = require('./lib/logger');
const { setupAntiCrash } = require('./lib/antiCrash');
const { connectDatabase } = require('./database/connection');
const { loadCommands } = require('./handlers/commandLoader');
const { startWebServer } = require('./web/server');

async function bootstrap() {
  setupAntiCrash();

  logger.info(`Starting ${config.bot.name} owned by ${config.bot.ownerName}`);

  await connectDatabase();
  loadCommands();

  // The web server exposes the pairing UI (QR + pair code) and the
  // dashboard. The actual Baileys socket is started on demand once a
  // pairing request comes in from the website, or automatically if a
  // saved session already exists (handled inside server.js).
  await startWebServer();
}

bootstrap().catch((err) => {
  logger.error(`[BOOTSTRAP] Fatal error during startup: ${err.stack || err.message}`);
  process.exit(1);
});

