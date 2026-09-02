/**
 * Logger Utility
 *
 * Provides structured logging with JSON output for production
 * and human-readable output for development.
 *
 * Log Levels: DEBUG, INFO, WARN, ERROR
 *
 * Security: Automatically redacts sensitive fields (password, token, apiKey, etc.)
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

/**
 * Sensitive field names that should be redacted from logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'sessionToken',
  'session_token',
  'authToken',
  'auth_token',
  'privateKey',
  'private_key',
  'idNumber',
  'id_number',
  'ssn',
  'creditCard',
  'credit_card',
];

/**
 * Redacts sensitive information from log context
 */
function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));

    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Formats log entry for human-readable console output (development)
 */
function formatForConsole(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m', // Green
    WARN: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m', // Red
  };

  const reset = '\x1b[0m';
  const color = levelColors[entry.level] || '';

  const time = new Date(entry.timestamp).toLocaleTimeString();
  const levelPadded = entry.level.padEnd(5);

  let output = `${color}[${time}] ${levelPadded}${reset} ${entry.message}`;

  // Add context fields if present
  const contextFields = Object.keys(entry).filter(
    (key) => !['timestamp', 'level', 'message'].includes(key)
  );

  if (contextFields.length > 0) {
    const context = contextFields.reduce(
      (acc, key) => {
        acc[key] = entry[key];
        return acc;
      },
      {} as Record<string, any>
    );
    output += `\n  ${JSON.stringify(context, null, 2)}`;
  }

  return output;
}

/**
 * Logger class implementing structured logging
 */
class Logger {
  /**
   * Returns numeric value for log level (for comparison)
   */
  private getLevelValue(level: LogLevel): number {
    const levels: Record<LogLevel, number> = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    return levels[level];
  }

  /**
   * Gets the current minimum log level from environment
   */
  private getMinLevel(): LogLevel {
    const configuredLevel = (process.env.LOG_LEVEL?.toUpperCase() || 'INFO') as LogLevel;
    return configuredLevel;
  }

  /**
   * Checks if we're in development mode
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Checks if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const minLevel = this.getMinLevel();
    return this.getLevelValue(level) >= this.getLevelValue(minLevel);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add context fields (redacted)
    if (context) {
      const redactedContext = redactSensitiveData(context);
      Object.assign(entry, redactedContext);
    }

    // Output based on environment
    if (this.isDevelopment()) {
      // Human-readable format for development
      console.log(formatForConsole(entry));
    } else {
      // Structured JSON for production
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * DEBUG level logging
   * For verbose development information
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('DEBUG', message, context);
  }

  /**
   * INFO level logging
   * For normal operations (user actions, state changes)
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('INFO', message, context);
  }

  /**
   * WARN level logging
   * For recoverable issues (validation failures, retries)
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('WARN', message, context);
  }

  /**
   * ERROR level logging
   * For unrecoverable errors (exceptions, system failures)
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('ERROR', message, context);

    // In production, you might want to send errors to error tracking service
    // (e.g., Sentry) here
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Export types for external use
 */
export type { LogLevel, LogEntry };
