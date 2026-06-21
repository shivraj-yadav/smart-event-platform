const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If not ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Log error
  logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

const notFoundMiddleware = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = { errorMiddleware, notFoundMiddleware };