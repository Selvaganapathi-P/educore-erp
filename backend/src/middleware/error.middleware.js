const mongoose = require('mongoose');
const { AppError } = require('../utils/appError');
const { logger } = require('../utils/logger');
const { env } = require('../config/env');

const notFound = (req, res, next) => {
  const err = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(err);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || 'Internal server error';
  let errors     = err.errors;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    errors  = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'`;
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (!err.isOperational || statusCode === 500) {
    logger.error(err.message, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.isDev && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
