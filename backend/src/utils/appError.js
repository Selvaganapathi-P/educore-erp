class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors) { super(message, 400, errors); }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden — insufficient permissions') { super(message, 403); }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(`${resource} not found`, 404); }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409); }
}

module.exports = { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError };
