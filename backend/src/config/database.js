const mongoose = require('mongoose');
const { env } = require('./env');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
};

module.exports = { connectDB };
