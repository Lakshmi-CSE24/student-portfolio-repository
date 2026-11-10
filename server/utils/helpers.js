// Utility helpers for API responses and formatting
export function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
}

export function errorResponse(res, message = 'An error occurred', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
  });
}
