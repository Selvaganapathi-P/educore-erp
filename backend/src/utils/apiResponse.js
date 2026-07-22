const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta) =>
  res.status(statusCode).json({ success: true, message, data, ...(meta && { meta }) });

const sendError = (res, message = 'Something went wrong', statusCode = 500, errors) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

const sendCreated = (res, data, message = 'Created successfully') =>
  sendSuccess(res, data, message, 201);

const sendNoContent = (res) => res.status(204).send();

const paginate = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

module.exports = { sendSuccess, sendError, sendCreated, sendNoContent, paginate };
