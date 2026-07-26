const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../lib/logger');

let isConnected = false;
let retryCount = 0;
const MAX_RETRY_DELAY = 30000;

async function connectDatabase() {
  if (isConnected) return mongoose.connection;

  mongoose.set('strictQuery', true);

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(config.mongodbUri, {
        dbName: config.mongodbDbName,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20
      });
      isConnected = true;
      retryCount = 0;
      logger.info('[DATABASE] MongoDB connected successfully');
    } catch (err) {
      retryCount += 1;
      const delay = Math.min(1000 * 2 ** retryCount, MAX_RETRY_DELAY);
      logger.error(`[DATABASE] Connection failed: ${err.message}. Retrying in ${delay}ms`);
      setTimeout(connectWithRetry, delay);
    }
  };

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('[DATABASE] MongoDB disconnected. Attempting reconnect...');
    connectWithRetry();
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`[DATABASE] MongoDB error: ${err.message}`);
  });

  await connectWithRetry();
  return mongoose.connection;
}

function isDatabaseConnected() {
  return isConnected;
}

module.exports = { connectDatabase, isDatabaseConnected };

