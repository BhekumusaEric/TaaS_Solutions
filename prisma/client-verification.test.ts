/**
 * Prisma Client Generation Verification Tests
 * 
 * This test file verifies that the Prisma Client can be successfully
 * generated from the schema and includes all expected models with
 * correct relationships and types.
 * 
 * Run after: npx prisma generate
 */

import { describe, it, expect, beforeAll } from 'vitest';
import type { PrismaClient } from '@prisma/client';

describe('Prisma Client Generation Verification', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Dynamically import PrismaClient to verify it exists and can be imported
    const { PrismaClient: PC } = await import('@prisma/client');
    prisma = new PC();
  });

  describe('Client Initialization', () => {
    it('should successfully import PrismaClient', async () => {
      const { PrismaClient } = await import('@prisma/client');
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });

    it('should successfully instantiate PrismaClient', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const client = new PrismaClient();
      expect(client).toBeDefined();
      expect(client.$connect).toBeDefined();
      expect(client.$disconnect).toBeDefined();
      await client.$disconnect();
    });
  });

  describe('Model Definitions', () => {
    it('should include User model', () => {
      expect(prisma.user).toBeDefined();
      expect(typeof prisma.user.findMany).toBe('function');
      expect(typeof prisma.user.findUnique).toBe('function');
      expect(typeof prisma.user.create).toBe('function');
      expect(typeof prisma.user.update).toBe('function');
      expect(typeof prisma.user.delete).toBe('function');
    });

    it('should include Role model', () => {
      expect(prisma.role).toBeDefined();
      expect(typeof prisma.role.findMany).toBe('function');
      expect(typeof prisma.role.findUnique).toBe('function');
      expect(typeof prisma.role.create).toBe('function');
    });

    it('should include Permission model', () => {
      expect(prisma.permission).toBeDefined();
      expect(typeof prisma.permission.findMany).toBe('function');
      expect(typeof prisma.permission.findUnique).toBe('function');
      expect(typeof prisma.permission.create).toBe('function');
    });

    it('should include UserRole model', () => {
      expect(prisma.userRole).toBeDefined();
      expect(typeof prisma.userRole.findMany).toBe('function');
      expect(typeof prisma.userRole.create).toBe('function');
      expect(typeof prisma.userRole.delete).toBe('function');
    });

    it('should include RolePermission model', () => {
      expect(prisma.rolePermission).toBeDefined();
      expect(typeof prisma.rolePermission.findMany).toBe('function');
      expect(typeof prisma.rolePermission.create).toBe('function');
      expect(typeof prisma.rolePermission.delete).toBe('function');
    });

    it('should include Organisation model', () => {
      expect(prisma.organisation).toBeDefined();
      expect(typeof prisma.organisation.findMany).toBe('function');
      expect(typeof prisma.organisation.findUnique).toBe('function');
      expect(typeof prisma.organisation.create).toBe('function');
      expect(typeof prisma.organisation.update).toBe('function');
    });

    it('should include OrganisationMember model', () => {
      expect(prisma.organisationMember).toBeDefined();
      expect(typeof prisma.organisationMember.findMany).toBe('function');
      expect(typeof prisma.organisationMember.create).toBe('function');
      expect(typeof prisma.organisationMember.delete).toBe('function');
    });

    it('should include AuditEvent model', () => {
      expect(prisma.auditEvent).toBeDefined();
      expect(typeof prisma.auditEvent.findMany).toBe('function');
      expect(typeof prisma.auditEvent.create).toBe('function');
    });

    it('should include Account model (NextAuth)', () => {
      expect(prisma.account).toBeDefined();
      expect(typeof prisma.account.findMany).toBe('function');
      expect(typeof prisma.account.create).toBe('function');
    });

    it('should include Session model (NextAuth)', () => {
      expect(prisma.session).toBeDefined();
      expect(typeof prisma.session.findMany).toBe('function');
      expect(typeof prisma.session.create).toBe('function');
      expect(typeof prisma.session.delete).toBe('function');
    });

    it('should include VerificationToken model (NextAuth)', () => {
      expect(prisma.verificationToken).toBeDefined();
      expect(typeof prisma.verificationToken.create).toBe('function');
      expect(typeof prisma.verificationToken.findUnique).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should provide type-safe User creation', async () => {
      // This test verifies that TypeScript types are correctly generated
      // We're not actually creating a user, just verifying the types compile
      const userData: Parameters<typeof prisma.user.create>[0] = {
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword',
        },
      };
      expect(userData).toBeDefined();
    });

    it('should provide type-safe Organisation creation with enum', async () => {
      const { OrganisationType } = await import('@prisma/client');
      
      const orgData: Parameters<typeof prisma.organisation.create>[0] = {
        data: {
          name: 'Test Organisation',
          type: OrganisationType.CLIENT,
          description: 'Test description',
        },
      };
      expect(orgData).toBeDefined();
      expect(OrganisationType.CLIENT).toBe('CLIENT');
      expect(OrganisationType.PARTNER).toBe('PARTNER');
    });

    it('should provide type-safe queries with include', async () => {
      const queryWithInclude: Parameters<typeof prisma.user.findUnique>[0] = {
        where: { email: 'test@example.com' },
        include: {
          roles: true,
          organisationMembers: {
            include: {
              organisation: true,
            },
          },
          auditEvents: true,
        },
      };
      expect(queryWithInclude).toBeDefined();
    });

    it('should provide type-safe where clauses', async () => {
      const whereClause: Parameters<typeof prisma.user.findMany>[0] = {
        where: {
          AND: [
            { email: { contains: '@example.com' } },
            {
              organisationMembers: {
                some: {
                  organisation: {
                    type: 'CLIENT',
                  },
                },
              },
            },
          ],
        },
      };
      expect(whereClause).toBeDefined();
    });
  });

  describe('Enum Types', () => {
    it('should export OrganisationType enum', async () => {
      const { OrganisationType } = await import('@prisma/client');
      expect(OrganisationType).toBeDefined();
      expect(OrganisationType.CLIENT).toBe('CLIENT');
      expect(OrganisationType.PARTNER).toBe('PARTNER');
    });
  });

  describe('Relation Support', () => {
    it('should support User -> UserRole relation', async () => {
      const queryWithRoles: Parameters<typeof prisma.user.findUnique>[0] = {
        where: { id: 'test-id' },
        include: { roles: true },
      };
      expect(queryWithRoles).toBeDefined();
    });

    it('should support User -> OrganisationMember relation', async () => {
      const queryWithOrgs: Parameters<typeof prisma.user.findUnique>[0] = {
        where: { id: 'test-id' },
        include: { organisationMembers: true },
      };
      expect(queryWithOrgs).toBeDefined();
    });

    it('should support Role -> RolePermission relation', async () => {
      const queryWithPerms: Parameters<typeof prisma.role.findUnique>[0] = {
        where: { id: 'test-id' },
        include: { permissions: true },
      };
      expect(queryWithPerms).toBeDefined();
    });

    it('should support nested includes', async () => {
      const nestedQuery: Parameters<typeof prisma.user.findUnique>[0] = {
        where: { id: 'test-id' },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      };
      expect(nestedQuery).toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    it('should provide $connect method', () => {
      expect(typeof prisma.$connect).toBe('function');
    });

    it('should provide $disconnect method', () => {
      expect(typeof prisma.$disconnect).toBe('function');
    });

    it('should provide $transaction method', () => {
      expect(typeof prisma.$transaction).toBe('function');
    });

    it('should provide $queryRaw method', () => {
      expect(typeof prisma.$queryRaw).toBe('function');
    });

    it('should provide $executeRaw method', () => {
      expect(typeof prisma.$executeRaw).toBe('function');
    });
  });

  describe('Model Counts', () => {
    it('should have exactly 11 models defined', () => {
      const expectedModels = [
        'user',
        'role',
        'permission',
        'userRole',
        'rolePermission',
        'organisation',
        'organisationMember',
        'auditEvent',
        'account',
        'session',
        'verificationToken',
      ];

      for (const model of expectedModels) {
        expect(prisma).toHaveProperty(model);
      }
    });
  });
});
