const logger = require('./logger');

function setupAntiCrash() {
  process.on('uncaughtException', (err) => {
    logger.error(`[ANTI-CRASH] Uncaught exception: ${err.stack || err.message}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`[ANTI-CRASH] Unhandled rejection: ${reason?.stack || reason}`);
  });

  process.on('warning', (warning) => {
    logger.warn(`[PROCESS-WARNING] ${warning.name}: ${warning.message}`);
  });

  logger.info('[ANTI-CRASH] Global error handlers registered');
}

module.exports = { setupAntiCrash };

