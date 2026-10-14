export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message = 'Bad Request', errors = []) => {
  return new ApiError(400, message, errors);
};

export const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

export const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

export const notFound = (message = 'Resource not found') => {
  return new ApiError(404, message);
};

export const conflict = (message = 'Conflict / Duplicate entry') => {
  return new ApiError(409, message);
};

export const internal = (message = 'Internal server error') => {
  return new ApiError(500, message);
};
