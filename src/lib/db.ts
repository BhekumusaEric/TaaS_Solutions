/**
 * Prisma Client Singleton
 *
 * This file exports a single instance of PrismaClient to be used throughout the application.
 * In development, it prevents multiple instances from being created during hot reloading.
 * In production, it provides a single, optimized client instance.
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

/**
 * Helper function to test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.$connect();
    // eslint-disable-next-line no-console
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await db.$disconnect();
  }
}

/**
 * Type exports for use in application
 */
export type {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Organisation,
  OrganisationMember,
  OrganisationType,
  AuditEvent,
  Account,
  Session,
  VerificationToken,
  Prisma,
} from '@prisma/client';
