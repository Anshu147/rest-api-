import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': value '${err.value}' is not valid`;
    errors = [{ field: err.path, message }];
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    message = errors[0]?.message || 'Validation failed';
  }

  // Handle Sequelize Unique Constraint Error (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errors = err.errors.map((item) => ({
      field: item.path,
      message: item.message || `${item.path} already exists`
    }));
    message = errors[0]?.message || 'Duplicate entry error';
  }

  // Handle Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errors = err.errors.map((item) => ({
      field: item.path,
      message: item.message
    }));
    message = errors[0]?.message || 'Validation failed';
  }

  // Handle JSON parse error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  const response = {
    success: false,
    message
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (config.nodeEnv === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
