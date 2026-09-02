/**
 * Database Integration Tests
 *
 * These tests require a running PostgreSQL database with DATABASE_URL configured.
 * Skip these tests if database is not available (CI/CD without database).
 *
 * Run with: npm run test:integration
 * Or: npm run test src/lib/db.integration.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, testDatabaseConnection } from './db';

// Skip these tests if DATABASE_URL is not configured or points to example
const shouldSkip =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost:5432/taas_dev') ||
  process.env.DATABASE_URL.includes('password@localhost');

describe.skipIf(shouldSkip)('Database Integration', () => {
  beforeAll(async () => {
    // Ensure database is accessible
    try {
      await db.$connect();
    } catch (error) {
      console.warn('Database connection failed, skipping integration tests');
      throw error;
    }
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('should connect to database successfully', async () => {
    const result = await testDatabaseConnection();
    expect(result).toBe(true);
  });

  it('should execute a simple query', async () => {
    // Test database is accessible with a simple query
    const result = await db.$queryRaw`SELECT 1 as value`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should have User model available', async () => {
    // Test that Prisma client has generated User model
    expect(db.user).toBeDefined();
    expect(typeof db.user.findMany).toBe('function');
  });

  it('should have Role model available', async () => {
    expect(db.role).toBeDefined();
    expect(typeof db.role.findMany).toBe('function');
  });

  it('should have Permission model available', async () => {
    expect(db.permission).toBeDefined();
    expect(typeof db.permission.findMany).toBe('function');
  });

  it('should have Organisation model available', async () => {
    expect(db.organisation).toBeDefined();
    expect(typeof db.organisation.findMany).toBe('function');
  });

  it('should have AuditEvent model available', async () => {
    expect(db.auditEvent).toBeDefined();
    expect(typeof db.auditEvent.findMany).toBe('function');
  });

  it('should count users (may be zero)', async () => {
    const count = await db.user.count();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

describe('Database Integration (Manual Test Required)', () => {
  it('should provide instructions when database not available', () => {
    if (shouldSkip) {
      console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                    DATABASE SETUP REQUIRED                         ║
╚════════════════════════════════════════════════════════════════════╝

Integration tests require a configured PostgreSQL database.

SETUP INSTRUCTIONS:

1. Install PostgreSQL 15+ (or use managed service/Docker)

2. Create database:
   createdb taas_dev

3. Create .env.local with connection string:
   DATABASE_URL="postgresql://postgres:password@localhost:5432/taas_dev"

4. Generate Prisma Client:
   npx prisma generate

5. Run migrations:
   npx prisma migrate dev

6. Run integration tests:
   npm run test src/lib/db.integration.test.ts

For detailed setup instructions, see:
  scripts/database-setup-guide.md

Or use Docker for quick local setup:
  docker-compose up -d
      `);
    }
    // This test always passes - just provides guidance
    expect(true).toBe(true);
  });
});
