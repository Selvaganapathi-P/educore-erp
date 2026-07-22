const winston = require('winston');
const { env } = require('../config/env');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const fmt = printf(({ level, message, timestamp: ts, stack }) =>
  `${ts} [${level}]: ${stack || message}`
);

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), fmt),
  }),
];

const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: combine(errors({ stack: true }), timestamp()),
  transports,
});

module.exports = { logger };
