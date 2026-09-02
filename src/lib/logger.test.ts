import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  // Store original console and environment
  const originalConsoleLog = console.log;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalLogLevel = process.env.LOG_LEVEL;

  // Mock console.log
  let consoleOutputs: string[] = [];

  beforeEach(() => {
    // Reset for each test
    consoleOutputs = [];
    console.log = vi.fn((message: string) => {
      consoleOutputs.push(message);
    });
    // Default to INFO level for most tests
    process.env.LOG_LEVEL = 'INFO';
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.LOG_LEVEL = originalLogLevel;
  });

  describe('Log Levels', () => {
    it('should log DEBUG messages when LOG_LEVEL is DEBUG', () => {
      process.env.LOG_LEVEL = 'DEBUG';

      logger.debug('Debug message', { detail: 'test' });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should log INFO messages', () => {
      logger.info('Info message', { userId: '123' });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should log WARN messages', () => {
      logger.warn('Warning message', { reason: 'test warning' });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should log ERROR messages', () => {
      logger.error('Error message', { error: 'test error' });

      expect(consoleOutputs.length).toBe(1);
    });
  });

  describe('Structured JSON Output (Production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'INFO';
      consoleOutputs = [];
    });

    it('should output structured JSON in production', () => {
      logger.info('Test message', { userId: '123', action: 'TEST' });

      expect(consoleOutputs.length).toBe(1);
      const output = consoleOutputs[0];

      // Should be valid JSON
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.userId).toBe('123');
      expect(parsed.action).toBe('TEST');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should include timestamp in ISO format', () => {
      logger.info('Test message');

      const parsed = JSON.parse(consoleOutputs[0]);
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include all context fields', () => {
      logger.info('Test message', {
        userId: '123',
        organisationId: '456',
        action: 'TEST_ACTION',
        metadata: { key: 'value' },
      });

      const parsed = JSON.parse(consoleOutputs[0]);
      expect(parsed.userId).toBe('123');
      expect(parsed.organisationId).toBe('456');
      expect(parsed.action).toBe('TEST_ACTION');
      expect(parsed.metadata).toEqual({ key: 'value' });
    });
  });

  describe('Human-Readable Output (Development)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      consoleOutputs = [];
    });

    it('should output human-readable format in development', () => {
      logger.info('Test message', { userId: '123' });

      expect(consoleOutputs.length).toBe(1);
      const output = consoleOutputs[0];

      // Should contain the message
      expect(output).toContain('Test message');
      expect(output).toContain('INFO');
    });
  });

  describe('Sensitive Data Redaction', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should redact password field', () => {
      logger.info('User login', { email: 'test@example.com', password: 'secret123' });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).not.toContain('secret123');
      expect(output).toContain('[REDACTED]');
    });

    it('should redact token field', () => {
      logger.info('API call', { endpoint: '/api/users', token: 'abc123xyz' });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).not.toContain('abc123xyz');
      expect(output).toContain('[REDACTED]');
    });

    it('should redact apiKey field', () => {
      logger.info('External API call', { service: 'stripe', apiKey: 'sk_test_123' });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).not.toContain('sk_test_123');
      expect(output).toContain('[REDACTED]');
    });

    it('should redact accessToken field', () => {
      logger.info('OAuth flow', { userId: '123', accessToken: 'bearer_token_123' });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).not.toContain('bearer_token_123');
      expect(output).toContain('[REDACTED]');
    });

    it('should redact nested sensitive fields', () => {
      logger.info('Complex object', {
        user: {
          email: 'test@example.com',
          password: 'secret123',
        },
        auth: {
          token: 'token123',
        },
      });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).not.toContain('secret123');
      expect(output).not.toContain('token123');
      expect(output).toContain('[REDACTED]');
    });

    it('should preserve non-sensitive fields while redacting sensitive ones', () => {
      logger.info('User action', {
        userId: '123',
        email: 'test@example.com',
        password: 'secret123',
        action: 'login',
      });

      const output = consoleOutputs[0];
      expect(output).toBeDefined();
      expect(output).toContain('123');
      expect(output).toContain('test@example.com');
      expect(output).toContain('login');
      expect(output).not.toContain('secret123');
    });
  });

  describe('Log Level Filtering', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should respect LOG_LEVEL environment variable', () => {
      process.env.LOG_LEVEL = 'ERROR';

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');

      expect(consoleOutputs.length).toBe(0);

      logger.error('Error message');
      expect(consoleOutputs.length).toBe(1);
    });

    it('should default to INFO level if LOG_LEVEL not set', () => {
      delete process.env.LOG_LEVEL;
      consoleOutputs = [];

      logger.debug('Debug message');
      expect(consoleOutputs.length).toBe(0);

      logger.info('Info message');
      expect(consoleOutputs.length).toBe(1);

      logger.warn('Warn message');
      expect(consoleOutputs.length).toBe(2);

      logger.error('Error message');
      expect(consoleOutputs.length).toBe(3);
    });
  });

  describe('Context Handling', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should log without context', () => {
      logger.info('Simple message');

      expect(consoleOutputs.length).toBe(1);
      expect(consoleOutputs[0]).toContain('Simple message');
    });

    it('should handle empty context object', () => {
      logger.info('Message with empty context', {});

      expect(consoleOutputs.length).toBe(1);
    });

    it('should handle null context values', () => {
      logger.info('Message', { value: null });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should handle undefined context values', () => {
      logger.info('Message', { value: undefined });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should handle complex nested objects', () => {
      logger.info('Complex context', {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
            },
          },
        },
        metadata: {
          timestamp: Date.now(),
        },
      });

      expect(consoleOutputs.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      logger.info(longMessage);

      expect(consoleOutputs.length).toBe(1);
      expect(consoleOutputs[0]).toContain(longMessage);
    });

    it('should handle special characters in message', () => {
      logger.info('Message with special chars: \n\t"quotes" and \'apostrophes\'');

      expect(consoleOutputs.length).toBe(1);
    });

    it('should handle Unicode characters', () => {
      logger.info('Unicode message: 你好 🚀 café');

      expect(consoleOutputs.length).toBe(1);
    });

    it('should handle Error objects in context', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { error: error.message, stack: error.stack });

      expect(consoleOutputs.length).toBe(1);
      expect(consoleOutputs[0]).toContain('Test error');
    });
  });

  describe('Real-World Usage Scenarios', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should log user sign-in event', () => {
      logger.info('User signed in', {
        userId: 'user-123',
        email: 'user@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(consoleOutputs.length).toBe(1);
      const output = consoleOutputs[0];
      expect(output).toContain('User signed in');
    });

    it('should log organisation created event', () => {
      logger.info('Organisation created', {
        userId: 'admin-123',
        action: 'ORGANISATION_CREATED',
        resourceType: 'Organisation',
        resourceId: 'org-456',
        organisationId: 'org-456',
      });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should log permission denied event', () => {
      logger.warn('Permission denied', {
        userId: 'user-123',
        action: 'PERMISSION_DENIED',
        attemptedAction: 'organisation:delete',
        resourceId: 'org-456',
      });

      expect(consoleOutputs.length).toBe(1);
    });

    it('should log error with stack trace', () => {
      const error = new Error('Database connection failed');
      logger.error('Failed to create opportunity', {
        userId: 'user-123',
        error: error.message,
        stack: error.stack,
      });

      expect(consoleOutputs.length).toBe(1);
      expect(consoleOutputs[0]).toContain('Failed to create opportunity');
    });

    it('should log audit event creation', () => {
      process.env.LOG_LEVEL = 'DEBUG';

      logger.debug('Creating audit event', {
        userId: 'user-123',
        action: 'ROLE_ASSIGNED',
        resourceType: 'UserRole',
        resourceId: 'role-789',
        metadata: {
          roleName: 'VERIFIED_TALENT',
          assignedBy: 'admin-123',
        },
      });

      expect(consoleOutputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      consoleOutputs = [];
    });

    it('should accept valid log level strings', () => {
      expect(() => logger.debug('test')).not.toThrow();
      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test')).not.toThrow();
    });

    it('should accept context with any fields', () => {
      expect(() =>
        logger.info('test', {
          string: 'value',
          number: 123,
          boolean: true,
          array: [1, 2, 3],
          object: { nested: 'value' },
        })
      ).not.toThrow();
    });
  });
});
