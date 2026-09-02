/**
 * Tests for Custom Error Classes
 *
 * These tests verify:
 * - Error classes throw correctly
 * - Error classes can be caught correctly
 * - Error codes and messages are set properly
 * - HTTP status codes are correct
 * - Field information is preserved for validation errors
 * - Error handling doesn't expose sensitive information
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  isAppError,
  formatErrorResponse,
} from './errors';

describe('AppError', () => {
  it('should create error with code, message, and status code', () => {
    const error = new AppError('TEST_ERROR', 'Test error message', 418);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.statusCode).toBe(418);
    expect(error.name).toBe('AppError');
  });

  it('should default to 500 status code if not provided', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.statusCode).toBe(500);
  });

  it('should preserve field information when provided', () => {
    const error = new AppError('TEST_ERROR', 'Test error message', 400, 'email');

    expect(error.field).toBe('email');
  });

  it('should have undefined field when not provided', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.field).toBeUndefined();
  });

  it('should have a stack trace', () => {
    const error = new AppError('TEST_ERROR', 'Test error message');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });

  it('should be catchable with try/catch', () => {
    expect(() => {
      try {
        throw new AppError('TEST_ERROR', 'Test error message');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        throw error;
      }
    }).toThrow(AppError);
  });
});

describe('ValidationError', () => {
  it('should create validation error with correct defaults', () => {
    const error = new ValidationError('Invalid email format');

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid email format');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('should preserve field information', () => {
    const error = new ValidationError('Email is required', 'email');

    expect(error.field).toBe('email');
    expect(error.message).toBe('Email is required');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ValidationError('Password too short', 'password');
    }).toThrow(ValidationError);
  });

  it('should be catchable as AppError', () => {
    try {
      throw new ValidationError('Test validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    }
  });
});

describe('UnauthorizedError', () => {
  it('should create unauthorized error with default message', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Authentication required');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should accept custom message', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(error.message).toBe('Invalid credentials');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new UnauthorizedError();
    }).toThrow(UnauthorizedError);
  });
});

describe('ForbiddenError', () => {
  it('should create forbidden error with default message', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('You do not have permission to perform this action');
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('ForbiddenError');
  });

  it('should accept custom message', () => {
    const error = new ForbiddenError('Only administrators can delete organisations');

    expect(error.message).toBe('Only administrators can delete organisations');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ForbiddenError();
    }).toThrow(ForbiddenError);
  });
});

describe('NotFoundError', () => {
  it('should create not found error with default message', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('should accept custom message', () => {
    const error = new NotFoundError('Organisation not found');

    expect(error.message).toBe('Organisation not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new NotFoundError();
    }).toThrow(NotFoundError);
  });
});

describe('ConflictError', () => {
  it('should create conflict error with message', () => {
    const error = new ConflictError('Email already exists');

    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Email already exists');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ConflictError('Duplicate entry');
    }).toThrow(ConflictError);
  });
});

describe('BadRequestError', () => {
  it('should create bad request error with message', () => {
    const error = new BadRequestError('Invalid request format');

    expect(error).toBeInstanceOf(BadRequestError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid request format');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('BadRequestError');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new BadRequestError('Invalid format');
    }).toThrow(BadRequestError);
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError('TEST', 'Test message');

    expect(isAppError(error)).toBe(true);
  });

  it('should return true for ValidationError instances', () => {
    const error = new ValidationError('Test validation error');

    expect(isAppError(error)).toBe(true);
  });

  it('should return true for all custom error classes', () => {
    expect(isAppError(new UnauthorizedError())).toBe(true);
    expect(isAppError(new ForbiddenError())).toBe(true);
    expect(isAppError(new NotFoundError())).toBe(true);
    expect(isAppError(new ConflictError('Test'))).toBe(true);
    expect(isAppError(new BadRequestError('Test'))).toBe(true);
  });

  it('should return false for standard Error', () => {
    const error = new Error('Standard error');

    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('error string')).toBe(false);
    expect(isAppError(123)).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError correctly', () => {
    const error = new AppError('TEST_ERROR', 'Test error message', 418);
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'TEST_ERROR',
      message: 'Test error message',
      field: undefined,
      statusCode: 418,
    });
  });

  it('should include field information for ValidationError', () => {
    const error = new ValidationError('Email is required', 'email');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Email is required',
      field: 'email',
      statusCode: 400,
    });
  });

  it('should format UnauthorizedError correctly', () => {
    const error = new UnauthorizedError('Invalid credentials');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
      field: undefined,
      statusCode: 401,
    });
  });

  it('should format ForbiddenError correctly', () => {
    const error = new ForbiddenError('Access denied');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'FORBIDDEN',
      message: 'Access denied',
      field: undefined,
      statusCode: 403,
    });
  });

  it('should format NotFoundError correctly', () => {
    const error = new NotFoundError('User not found');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'NOT_FOUND',
      message: 'User not found',
      field: undefined,
      statusCode: 404,
    });
  });

  it('should format ConflictError correctly', () => {
    const error = new ConflictError('Email already exists');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'CONFLICT',
      message: 'Email already exists',
      field: undefined,
      statusCode: 409,
    });
  });

  it('should format BadRequestError correctly', () => {
    const error = new BadRequestError('Invalid format');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invalid format',
      field: undefined,
      statusCode: 400,
    });
  });

  it('should NOT expose internal error details for standard Error', () => {
    const error = new Error('Internal database error with sensitive info');
    const formatted = formatErrorResponse(error);

    expect(formatted).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
    expect(formatted.message).not.toContain('database');
    expect(formatted.message).not.toContain('sensitive');
  });

  it('should NOT expose stack traces for any error', () => {
    const error = new ValidationError('Test error');
    const formatted = formatErrorResponse(error);

    expect(formatted).not.toHaveProperty('stack');
  });

  it('should handle null and undefined gracefully', () => {
    expect(formatErrorResponse(null)).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });

    expect(formatErrorResponse(undefined)).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });

  it('should handle non-error objects gracefully', () => {
    expect(formatErrorResponse('error string')).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });

    expect(formatErrorResponse({ custom: 'error' })).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });
});

describe('Error catching and type narrowing', () => {
  it('should allow instanceof checks in catch blocks', () => {
    try {
      throw new ValidationError('Test error', 'testField');
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.field).toBe('testField');
        expect(error.statusCode).toBe(400);
      } else {
        throw new Error('Expected ValidationError');
      }
    }
  });

  it('should allow type narrowing with isAppError', () => {
    try {
      throw new NotFoundError('Resource not found');
    } catch (error) {
      if (isAppError(error)) {
        expect(error.code).toBe('NOT_FOUND');
        expect(error.statusCode).toBe(404);
      } else {
        throw new Error('Expected AppError');
      }
    }
  });

  it('should differentiate between AppError types in catch blocks', () => {
    const throwError = (errorType: string) => {
      switch (errorType) {
        case 'validation':
          throw new ValidationError('Validation failed');
        case 'unauthorized':
          throw new UnauthorizedError();
        case 'forbidden':
          throw new ForbiddenError();
        case 'notfound':
          throw new NotFoundError();
        default:
          throw new Error('Unknown error');
      }
    };

    // Test ValidationError
    try {
      throwError('validation');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    }

    // Test UnauthorizedError
    try {
      throwError('unauthorized');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect((error as UnauthorizedError).statusCode).toBe(401);
    }

    // Test ForbiddenError
    try {
      throwError('forbidden');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
      expect((error as ForbiddenError).statusCode).toBe(403);
    }

    // Test NotFoundError
    try {
      throwError('notfound');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as NotFoundError).statusCode).toBe(404);
    }
  });
});

describe('Error security', () => {
  it('should not expose sensitive information in error messages', () => {
    // Simulate internal error with sensitive info
    const sensitiveError = new Error('Database connection failed: password=secret123');
    const formatted = formatErrorResponse(sensitiveError);

    expect(formatted.message).toBe('An unexpected error occurred');
    expect(formatted.message).not.toContain('password');
    expect(formatted.message).not.toContain('secret123');
  });

  it('should not expose stack traces to clients', () => {
    const error = new ValidationError('Test error');
    const formatted = formatErrorResponse(error);

    expect(formatted).not.toHaveProperty('stack');
  });

  it('should preserve intended error messages for AppErrors', () => {
    const error = new UnauthorizedError('Invalid email or password');
    const formatted = formatErrorResponse(error);

    // This message is safe to expose (doesn't reveal which is wrong)
    expect(formatted.message).toBe('Invalid email or password');
  });
});
