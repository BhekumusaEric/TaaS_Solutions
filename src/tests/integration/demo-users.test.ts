/**
 * Demo Users Integration Tests
 * 
 * Tests to verify that all demo users are properly labeled with "DEMO" prefix
 * as specified in US-023 requirements.
 * 
 * Requirements validated:
 * - All demo user emails have "DEMO_" prefix
 * - All demo user names contain "DEMO" for clear identification
 * - Demo users can be identified and filtered
 * - Demo users have proper role assignments
 * - Demo users have proper organisation memberships
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Demo Users - US-023 Verification', () => {
  beforeAll(async () => {
    // Ensure we're connected to the database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Email Prefix Validation', () => {
    it('should have all demo users with "DEMO_" prefix in email', async () => {
      // Fetch all demo users (users with "DEMO" in email)
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'DEMO',
          },
        },
      });

      // Verify we have the expected 9 demo users
      expect(demoUsers.length).toBeGreaterThanOrEqual(9);

      // Verify each demo user has the correct email prefix
      for (const user of demoUsers) {
        expect(user.email).toMatch(/^DEMO_/);
        expect(user.email).toContain('@example.com');
      }
    });

    it('should have specific demo user emails as documented', async () => {
      const expectedEmails = [
        'DEMO_TALENT@example.com',
        'DEMO_CLIENT@example.com',
        'DEMO_CLIENT_APPROVER@example.com',
        'DEMO_DELIVERY_LEAD@example.com',
        'DEMO_TALENT_OPS@example.com',
        'DEMO_PROJECT_OPS@example.com',
        'DEMO_QUALITY@example.com',
        'DEMO_FINANCE@example.com',
        'DEMO_ADMIN@example.com',
      ];

      for (const email of expectedEmails) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
      }
    });
  });

  describe('Name Identification Validation', () => {
    it('should have all demo users with "DEMO" in their name', async () => {
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'DEMO',
          },
        },
      });

      // Verify each demo user has "DEMO" in their name for clear identification
      for (const user of demoUsers) {
        expect(user.name).toContain('DEMO');
      }
    });

    it('should have descriptive demo user names', async () => {
      const expectedNameMappings = [
        { email: 'DEMO_TALENT@example.com', namePattern: /DEMO.*Talent/i },
        { email: 'DEMO_CLIENT@example.com', namePattern: /DEMO.*Client/i },
        { email: 'DEMO_CLIENT_APPROVER@example.com', namePattern: /DEMO.*Client.*Approver/i },
        { email: 'DEMO_DELIVERY_LEAD@example.com', namePattern: /DEMO.*Delivery.*Lead/i },
        { email: 'DEMO_TALENT_OPS@example.com', namePattern: /DEMO.*Talent.*Ops/i },
        { email: 'DEMO_PROJECT_OPS@example.com', namePattern: /DEMO.*Project.*Ops/i },
        { email: 'DEMO_QUALITY@example.com', namePattern: /DEMO.*Quality/i },
        { email: 'DEMO_FINANCE@example.com', namePattern: /DEMO.*Finance/i },
        { email: 'DEMO_ADMIN@example.com', namePattern: /DEMO.*Admin/i },
      ];

      for (const mapping of expectedNameMappings) {
        const user = await prisma.user.findUnique({
          where: { email: mapping.email },
        });

        expect(user).not.toBeNull();
        expect(user?.name).toMatch(mapping.namePattern);
      }
    });
  });

  describe('Demo User Identification and Filtering', () => {
    it('should be able to identify demo users by email pattern', async () => {
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'DEMO_',
          },
        },
      });

      expect(demoUsers.length).toBeGreaterThanOrEqual(9);

      // All returned users should be demo users
      for (const user of demoUsers) {
        expect(user.email).toMatch(/^DEMO_/);
      }
    });

    it('should be able to filter demo users by name', async () => {
      const demoUsersByName = await prisma.user.findMany({
        where: {
          name: {
            contains: 'DEMO',
          },
        },
      });

      expect(demoUsersByName.length).toBeGreaterThanOrEqual(9);

      // All returned users should have DEMO in their name
      for (const user of demoUsersByName) {
        expect(user.name).toContain('DEMO');
      }
    });

    it('should be able to exclude demo users from queries', async () => {
      // This test verifies we can filter OUT demo users if needed
      const nonDemoUsers = await prisma.user.findMany({
        where: {
          email: {
            not: {
              startsWith: 'DEMO_',
            },
          },
        },
      });

      // Verify no demo users are returned
      for (const user of nonDemoUsers) {
        expect(user.email).not.toMatch(/^DEMO_/);
      }
    });
  });

  describe('Demo User Role Assignments', () => {
    it('should have all demo users assigned to appropriate roles', async () => {
      const roleAssignments = [
        { email: 'DEMO_TALENT@example.com', roleName: 'VERIFIED_TALENT' },
        { email: 'DEMO_CLIENT@example.com', roleName: 'CLIENT_MEMBER' },
        { email: 'DEMO_CLIENT_APPROVER@example.com', roleName: 'CLIENT_APPROVER' },
        { email: 'DEMO_DELIVERY_LEAD@example.com', roleName: 'DELIVERY_LEAD' },
        { email: 'DEMO_TALENT_OPS@example.com', roleName: 'TALENT_OPS_ADMIN' },
        { email: 'DEMO_PROJECT_OPS@example.com', roleName: 'PROJECT_OPS_ADMIN' },
        { email: 'DEMO_QUALITY@example.com', roleName: 'QUALITY_REVIEWER' },
        { email: 'DEMO_FINANCE@example.com', roleName: 'FINANCE_ADMIN' },
        { email: 'DEMO_ADMIN@example.com', roleName: 'PLATFORM_ADMIN' },
      ];

      for (const assignment of roleAssignments) {
        const user = await prisma.user.findUnique({
          where: { email: assignment.email },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        expect(user).not.toBeNull();
        expect(user?.roles).toHaveLength(1);
        expect(user?.roles[0].role.name).toBe(assignment.roleName);
      }
    });
  });

  describe('Demo User Organisation Memberships', () => {
    it('should have client demo users assigned to demo client organisation', async () => {
      const clientUsers = [
        'DEMO_CLIENT@example.com',
        'DEMO_CLIENT_APPROVER@example.com',
        'DEMO_DELIVERY_LEAD@example.com',
      ];

      const demoClientOrg = await prisma.organisation.findUnique({
        where: { name: 'DEMO Client Organisation' },
      });

      expect(demoClientOrg).not.toBeNull();

      for (const email of clientUsers) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            organisationMembers: {
              include: {
                organisation: true,
              },
            },
          },
        });

        expect(user).not.toBeNull();
        expect(user?.organisationMembers.length).toBeGreaterThan(0);

        const isClientOrgMember = user?.organisationMembers.some(
          (membership) => membership.organisation.name === 'DEMO Client Organisation'
        );

        expect(isClientOrgMember).toBe(true);
      }
    });

    it('should have demo organisations with "DEMO" prefix', async () => {
      const demoOrganisations = await prisma.organisation.findMany({
        where: {
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      expect(demoOrganisations.length).toBeGreaterThanOrEqual(2);

      const orgNames = demoOrganisations.map((org) => org.name);
      expect(orgNames).toContain('DEMO Client Organisation');
      expect(orgNames).toContain('DEMO Partner Organisation');
    });
  });

  describe('Demo Data Security', () => {
    it('should have demo users with hashed passwords (not plaintext)', async () => {
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'DEMO_',
          },
        },
      });

      for (const user of demoUsers) {
        // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
        expect(user.password).not.toBeNull();
        expect(user.password).toMatch(/^\$2[aby]\$/);
        expect(user.password?.length).toBe(60);
      }
    });

    it('should not have demo users in production environment', async () => {
      // This test documents the requirement that demo users should not exist in production
      // The actual enforcement is in the seed script with NODE_ENV check
      if (process.env.NODE_ENV === 'production') {
        const demoUsers = await prisma.user.findMany({
          where: {
            email: {
              startsWith: 'DEMO_',
            },
          },
        });

        expect(demoUsers).toHaveLength(0);
      }
    });
  });

  describe('Demo Data Completeness', () => {
    it('should have exactly 9 demo users as specified', async () => {
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'DEMO_',
          },
        },
      });

      expect(demoUsers).toHaveLength(9);
    });

    it('should have all demo users with creation timestamps', async () => {
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'DEMO_',
          },
        },
      });

      for (const user of demoUsers) {
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        expect(user.createdAt).toBeTruthy();
        expect(user.updatedAt).toBeTruthy();
      }
    });

    it('should have demo users identifiable in audit events', async () => {
      // Verify that if any audit events exist for demo users,
      // we can identify them by the user relationship
      const demoUsers = await prisma.user.findMany({
        where: {
          email: {
            startsWith: 'DEMO_',
          },
        },
        select: {
          id: true,
        },
      });

      const demoUserIds = demoUsers.map((u) => u.id);

      // If audit events exist for demo users, verify they're queryable
      const demoAuditEvents = await prisma.auditEvent.findMany({
        where: {
          userId: {
            in: demoUserIds,
          },
        },
        include: {
          user: true,
        },
      });

      // All returned audit events should be for demo users
      for (const event of demoAuditEvents) {
        expect(event.user.email).toMatch(/^DEMO_/);
      }
    });
  });
});
