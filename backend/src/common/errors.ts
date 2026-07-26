export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(message, 404, 'NOT_FOUND');
}

export function badRequest(message: string): AppError {
  return new AppError(message, 400, 'BAD_REQUEST');
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError(message, 403, 'FORBIDDEN');
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, 'CONFLICT');
}
