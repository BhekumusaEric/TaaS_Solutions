/**
 * Custom Error Classes for TaaS Solutions Platform
 *
 * These error classes provide consistent error handling across the application
 * with proper error codes, messages, and HTTP status codes.
 *
 * Usage:
 * - throw new UnauthorizedError() when authentication is required
 * - throw new ForbiddenError() when user lacks permission
 * - throw new NotFoundError() when resource doesn't exist
 * - throw new ValidationError(message, field) for input validation failures
 * - throw new ConflictError(message) for unique constraint violations
 */

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  /**
   * @param code - Machine-readable error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param field - Optional field name for validation errors
   */
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public field?: string
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error (400 Bad Request)
 * Thrown when user input fails validation
 *
 * @example
 * throw new ValidationError('Email is required', 'email');
 * throw new ValidationError('Password must be at least 12 characters');
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super('VALIDATION_ERROR', message, 400, field);
  }
}

/**
 * Unauthorized Error (401 Unauthorized)
 * Thrown when authentication is required but not provided
 *
 * @example
 * throw new UnauthorizedError();
 * throw new UnauthorizedError('Invalid credentials');
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

/**
 * Forbidden Error (403 Forbidden)
 * Thrown when user is authenticated but lacks permission for the action
 *
 * @example
 * throw new ForbiddenError();
 * throw new ForbiddenError('Only administrators can delete organisations');
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super('FORBIDDEN', message, 403);
  }
}

/**
 * Not Found Error (404 Not Found)
 * Thrown when a requested resource doesn't exist
 *
 * @example
 * throw new NotFoundError();
 * throw new NotFoundError('Organisation not found');
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}

/**
 * Conflict Error (409 Conflict)
 * Thrown when an operation conflicts with existing data (e.g., duplicate email)
 *
 * @example
 * throw new ConflictError('Email already exists');
 * throw new ConflictError('User is already a member of this organisation');
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

/**
 * Bad Request Error (400 Bad Request)
 * Thrown for general invalid requests that don't fit other categories
 *
 * @example
 * throw new BadRequestError('Invalid request format');
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super('BAD_REQUEST', message, 400);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Format error response for API/Server Actions
 * Ensures sensitive information is not exposed to clients
 *
 * @param error - The error to format
 * @returns Formatted error response
 */
export function formatErrorResponse(error: unknown): {
  code: string;
  message: string;
  field?: string;
  statusCode: number;
} {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      field: error.field,
      statusCode: error.statusCode,
    };
  }

  // Don't expose internal error details to clients
  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
