import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Database Connection Tests
 *
 * These tests verify the database client configuration.
 * Actual database connectivity tests require a running PostgreSQL instance.
 */

describe('Database Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export db client', async () => {
    const { db } = await import('./db');
    expect(db).toBeDefined();
    expect(typeof db.$connect).toBe('function');
    expect(typeof db.$disconnect).toBe('function');
  });

  it('should export testDatabaseConnection function', async () => {
    const { testDatabaseConnection } = await import('./db');
    expect(testDatabaseConnection).toBeDefined();
    expect(typeof testDatabaseConnection).toBe('function');
  });

  it('should export Prisma types', async () => {
    const types = await import('./db');
    // Verify type exports are available (TypeScript will validate these)
    expect(types).toBeDefined();
  });
});

/**
 * Note: Integration tests with actual database will be in
 * src/lib/db.spec.ts once database is set up
 */
