import { describe, it, expect } from 'vitest';
import {
  formatDate,
  capitalize,
  truncate,
  isValidEmail,
  getInitials,
  safeJsonParse,
  generateRandomString,
} from './utils';

describe('formatDate', () => {
  it('should format a Date object correctly', () => {
    const date = new Date('2026-09-01');
    const formatted = formatDate(date);
    expect(formatted).toContain('September');
    expect(formatted).toContain('2026');
  });

  it('should format a string date correctly', () => {
    const formatted = formatDate('2026-09-01');
    expect(formatted).toContain('September');
    expect(formatted).toContain('2026');
  });
});

describe('capitalize', () => {
  it('should capitalize the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should lowercase the rest of the string', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    const long = 'This is a very long string that needs truncating';
    expect(truncate(long, 10)).toBe('This is a ...');
  });

  it('should not truncate short strings', () => {
    const short = 'Short';
    expect(truncate(short, 10)).toBe('Short');
  });

  it('should handle exact length', () => {
    const exact = '1234567890';
    expect(truncate(exact, 10)).toBe('1234567890');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('invalid@.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('getInitials', () => {
  it('should generate initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should only take first two words', () => {
    expect(getInitials('John Middle Doe')).toBe('JM');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });

  it('should uppercase initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const json = '{"key": "value"}';
    expect(safeJsonParse(json, {})).toEqual({ key: 'value' });
  });

  it('should return fallback for invalid JSON', () => {
    const invalid = '{invalid json}';
    const fallback = { default: true };
    expect(safeJsonParse(invalid, fallback)).toEqual(fallback);
  });

  it('should return fallback for empty string', () => {
    const fallback = { default: true };
    expect(safeJsonParse('', fallback)).toEqual(fallback);
  });
});

describe('generateRandomString', () => {
  it('should generate string of correct length', () => {
    expect(generateRandomString(10).length).toBe(10);
    expect(generateRandomString(5).length).toBe(5);
  });

  it('should generate different strings', () => {
    const str1 = generateRandomString(20);
    const str2 = generateRandomString(20);
    expect(str1).not.toBe(str2);
  });

  it('should only contain alphanumeric characters', () => {
    const str = generateRandomString(100);
    expect(/^[A-Za-z0-9]+$/.test(str)).toBe(true);
  });
});
