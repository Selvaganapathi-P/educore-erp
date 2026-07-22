const mongoose      = require('mongoose');
const { env }       = require('./config/env');
const { connectDB } = require('./config/database');
const { logger }    = require('./utils/logger');
const app           = require('./app');

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`EduCore API  ▶  http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
    // Signal to PM2 cluster that this worker is ready
    if (process.send) process.send('ready');
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} — graceful shutdown initiated`);
    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed');
      } catch (e) {
        logger.error('Error closing MongoDB:', e);
      }
      logger.info('Server closed');
      process.exit(0);
    });
    // Force exit after 10 s if connections don't drain
    setTimeout(() => { logger.warn('Force exit after timeout'); process.exit(1); }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    shutdown('uncaughtException');
  });
};

start();
