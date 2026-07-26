const pino = require('pino');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'debug',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    },
    {
      target: 'pino/file',
      level: 'info',
      options: { destination: path.join(logsDir, 'app.log'), mkdir: true }
    },
    {
      target: 'pino/file',
      level: 'error',
      options: { destination: path.join(logsDir, 'error.log'), mkdir: true }
    }
  ]
});

const logger = pino({ level: 'debug' }, transport);

module.exports = logger;
