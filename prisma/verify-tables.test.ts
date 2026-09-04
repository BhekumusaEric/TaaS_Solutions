/**
 * Database Table Verification Test
 * 
 * This test verifies that all 11 required tables exist in the database
 * with the correct structure as defined in the Prisma schema.
 * 
 * Required Tables:
 * 1. User
 * 2. Role
 * 3. Permission
 * 4. UserRole
 * 5. RolePermission
 * 6. Organisation
 * 7. OrganisationMember
 * 8. AuditEvent
 * 9. Account (NextAuth.js)
 * 10. Session (NextAuth.js)
 * 11. VerificationToken (NextAuth.js)
 * 
 * Usage: npm run test -- prisma/verify-tables.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';

describe('Database Table Verification', () => {
  beforeAll(async () => {
    try {
      await db.$connect();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('Table Existence', () => {
    const expectedTables = [
      'User',
      'Role',
      'Permission',
      'UserRole',
      'RolePermission',
      'Organisation',
      'OrganisationMember',
      'AuditEvent',
      'Account',
      'Session',
      'VerificationToken',
    ];

    expectedTables.forEach((tableName) => {
      it(`should have ${tableName} table`, async () => {
        const result = await db.$queryRawUnsafe<Array<{ table_name: string }>>(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        `);

        expect(result).toHaveLength(1);
        expect(result[0].table_name).toBe(tableName);
      });
    });

    it('should have exactly 11 required tables', async () => {
      const tables = await db.$queryRawUnsafe<Array<{ count: number }>>(`
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN (
          'User', 'Role', 'Permission', 'UserRole', 'RolePermission',
          'Organisation', 'OrganisationMember', 'AuditEvent',
          'Account', 'Session', 'VerificationToken'
        )
      `);

      expect(Number(tables[0].count)).toBe(11);
    });
  });

  describe('Table Structure Verification', () => {
    describe('User table', () => {
      it('should have correct columns', async () => {
        const columns = await db.$queryRawUnsafe<
          Array<{ column_name: string; data_type: string; is_nullable: string }>
        >(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'User'
          ORDER BY ordinal_position
        `);

        const columnNames = columns.map((c) => c.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('email');
        expect(columnNames).toContain('name');
        expect(columnNames).toContain('password');
        expect(columnNames).toContain('createdAt');
        expect(columnNames).toContain('updatedAt');
      });

      it('should have unique constraint on email', async () => {
        const constraints = await db.$queryRawUnsafe<Array<{ constraint_name: string }>>(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = 'User'
          AND constraint_type = 'UNIQUE'
        `);

        const hasEmailConstraint = constraints.some((c) =>
          c.constraint_name.includes('email')
        );
        expect(hasEmailConstraint).toBe(true);
      });
    });

    describe('Role table', () => {
      it('should have correct columns', async () => {
        const columns = await db.$queryRawUnsafe<Array<{ column_name: string }>>(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'Role'
        `);

        const columnNames = columns.map((c) => c.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('name');
        expect(columnNames).toContain('description');
        expect(columnNames).toContain('createdAt');
      });

      it('should have unique constraint on name', async () => {
        const constraints = await db.$queryRawUnsafe<Array<{ constraint_name: string }>>(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = 'Role'
          AND constraint_type = 'UNIQUE'
        `);

        const hasNameConstraint = constraints.some((c) => c.constraint_name.includes('name'));
        expect(hasNameConstraint).toBe(true);
      });
    });

    describe('Permission table', () => {
      it('should have correct columns', async () => {
        const columns = await db.$queryRawUnsafe<Array<{ column_name: string }>>(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'Permission'
        `);

        const columnNames = columns.map((c) => c.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('name');
        expect(columnNames).toContain('resource');
        expect(columnNames).toContain('action');
        expect(columnNames).toContain('createdAt');
      });
    });

    describe('Organisation table', () => {
      it('should have correct columns', async () => {
        const columns = await db.$queryRawUnsafe<Array<{ column_name: string }>>(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'Organisation'
        `);

        const columnNames = columns.map((c) => c.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('name');
        expect(columnNames).toContain('type');
        expect(columnNames).toContain('description');
        expect(columnNames).toContain('createdAt');
        expect(columnNames).toContain('updatedAt');
      });

      it('should have unique constraint on name', async () => {
        const constraints = await db.$queryRawUnsafe<Array<{ constraint_name: string }>>(`
          SELECT constraint_name
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = 'Organisation'
          AND constraint_type = 'UNIQUE'
        `);

        const hasNameConstraint = constraints.some((c) => c.constraint_name.includes('name'));
        expect(hasNameConstraint).toBe(true);
      });
    });

    describe('AuditEvent table', () => {
      it('should have correct columns', async () => {
        const columns = await db.$queryRawUnsafe<Array<{ column_name: string }>>(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'AuditEvent'
        `);

        const columnNames = columns.map((c) => c.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('timestamp');
        expect(columnNames).toContain('userId');
        expect(columnNames).toContain('action');
        expect(columnNames).toContain('resourceType');
        expect(columnNames).toContain('resourceId');
        expect(columnNames).toContain('organisationId');
        expect(columnNames).toContain('metadata');
        expect(columnNames).toContain('ipAddress');
        expect(columnNames).toContain('userAgent');
      });
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should have foreign keys from UserRole to User and Role', async () => {
      const foreignKeys = await db.$queryRawUnsafe<
        Array<{
          constraint_name: string;
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'UserRole'
      `);

      const userFK = foreignKeys.find(
        (fk) => fk.column_name === 'userId' && fk.foreign_table_name === 'User'
      );
      const roleFK = foreignKeys.find(
        (fk) => fk.column_name === 'roleId' && fk.foreign_table_name === 'Role'
      );

      expect(userFK).toBeDefined();
      expect(roleFK).toBeDefined();
    });

    it('should have foreign keys from RolePermission to Role and Permission', async () => {
      const foreignKeys = await db.$queryRawUnsafe<
        Array<{
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'RolePermission'
      `);

      const roleFK = foreignKeys.find(
        (fk) => fk.column_name === 'roleId' && fk.foreign_table_name === 'Role'
      );
      const permissionFK = foreignKeys.find(
        (fk) => fk.column_name === 'permissionId' && fk.foreign_table_name === 'Permission'
      );

      expect(roleFK).toBeDefined();
      expect(permissionFK).toBeDefined();
    });

    it('should have foreign keys from OrganisationMember to User and Organisation', async () => {
      const foreignKeys = await db.$queryRawUnsafe<
        Array<{
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'OrganisationMember'
      `);

      const userFK = foreignKeys.find(
        (fk) => fk.column_name === 'userId' && fk.foreign_table_name === 'User'
      );
      const orgFK = foreignKeys.find(
        (fk) =>
          fk.column_name === 'organisationId' && fk.foreign_table_name === 'Organisation'
      );

      expect(userFK).toBeDefined();
      expect(orgFK).toBeDefined();
    });

    it('should have foreign key from AuditEvent to User', async () => {
      const foreignKeys = await db.$queryRawUnsafe<
        Array<{
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'AuditEvent'
      `);

      const userFK = foreignKeys.find(
        (fk) => fk.column_name === 'userId' && fk.foreign_table_name === 'User'
      );

      expect(userFK).toBeDefined();
    });

    it('should have foreign keys from NextAuth tables', async () => {
      // Account table should have foreign key to User
      const accountFK = await db.$queryRawUnsafe<
        Array<{
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'Account'
      `);

      const accountUserFK = accountFK.find(
        (fk) => fk.column_name === 'userId' && fk.foreign_table_name === 'User'
      );

      expect(accountUserFK).toBeDefined();

      // Session table should have foreign key to User
      const sessionFK = await db.$queryRawUnsafe<
        Array<{
          table_name: string;
          column_name: string;
          foreign_table_name: string;
        }>
      >(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'Session'
      `);

      const sessionUserFK = sessionFK.find(
        (fk) => fk.column_name === 'userId' && fk.foreign_table_name === 'User'
      );

      expect(sessionUserFK).toBeDefined();
    });
  });

  describe('Enum Types', () => {
    it('should have OrganisationType enum with CLIENT and PARTNER values', async () => {
      const enumValues = await db.$queryRawUnsafe<Array<{ enumlabel: string }>>(`
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'OrganisationType'
        ORDER BY e.enumsortorder
      `);

      const values = enumValues.map((e) => e.enumlabel);
      expect(values).toContain('CLIENT');
      expect(values).toContain('PARTNER');
      expect(values).toHaveLength(2);
    });
  });

  describe('Indexes', () => {
    it('should have index on User.email', async () => {
      const indexes = await db.$queryRawUnsafe<Array<{ indexname: string }>>(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'User'
        AND indexname LIKE '%email%'
      `);

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should have index on Role.name', async () => {
      const indexes = await db.$queryRawUnsafe<Array<{ indexname: string }>>(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'Role'
        AND indexname LIKE '%name%'
      `);

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should have index on Organisation.name', async () => {
      const indexes = await db.$queryRawUnsafe<Array<{ indexname: string }>>(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'Organisation'
        AND indexname LIKE '%name%'
      `);

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should have indexes on AuditEvent for querying', async () => {
      const indexes = await db.$queryRawUnsafe<Array<{ indexname: string }>>(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'AuditEvent'
      `);

      // Should have indexes on userId, action, timestamp, etc.
      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('Prisma Client Integration', () => {
    it('should be able to query User table via Prisma', async () => {
      const users = await db.user.findMany({ take: 1 });
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should be able to query Role table via Prisma', async () => {
      const roles = await db.role.findMany({ take: 1 });
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
    });

    it('should be able to query Permission table via Prisma', async () => {
      const permissions = await db.permission.findMany({ take: 1 });
      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });

    it('should be able to query Organisation table via Prisma', async () => {
      const organisations = await db.organisation.findMany({ take: 1 });
      expect(organisations).toBeDefined();
      expect(Array.isArray(organisations)).toBe(true);
    });

    it('should be able to query AuditEvent table via Prisma', async () => {
      const auditEvents = await db.auditEvent.findMany({ take: 1 });
      expect(auditEvents).toBeDefined();
      expect(Array.isArray(auditEvents)).toBe(true);
    });

    it('should be able to count records in all tables', async () => {
      const counts = await Promise.all([
        db.user.count(),
        db.role.count(),
        db.permission.count(),
        db.userRole.count(),
        db.rolePermission.count(),
        db.organisation.count(),
        db.organisationMember.count(),
        db.auditEvent.count(),
        db.account.count(),
        db.session.count(),
        db.verificationToken.count(),
      ]);

      // All counts should be defined numbers (0 or positive)
      counts.forEach((count) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
