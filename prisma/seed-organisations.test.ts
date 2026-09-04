/**
 * Test: Demo Organisations Verification
 * 
 * This test verifies that the seed script creates demo organisations correctly.
 * 
 * Requirements:
 * - US-023: Demo Data Seeding
 * - Demo organisations have DEMO labeling
 * - Both CLIENT and PARTNER organisation types exist
 * - Demo organisation memberships are created
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, OrganisationType } from '@prisma/client';

const prisma = new PrismaClient();

describe('Demo Organisations Seed Verification', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Organisation Creation', () => {
    it('should create DEMO Client Organisation', async () => {
      const clientOrg = await prisma.organisation.findUnique({
        where: { name: 'DEMO Client Organisation' },
      });

      expect(clientOrg).toBeDefined();
      expect(clientOrg?.name).toBe('DEMO Client Organisation');
      expect(clientOrg?.type).toBe(OrganisationType.CLIENT);
      expect(clientOrg?.description).toBe(
        'Demo client organisation for testing and development'
      );
    });

    it('should create DEMO Partner Organisation', async () => {
      const partnerOrg = await prisma.organisation.findUnique({
        where: { name: 'DEMO Partner Organisation' },
      });

      expect(partnerOrg).toBeDefined();
      expect(partnerOrg?.name).toBe('DEMO Partner Organisation');
      expect(partnerOrg?.type).toBe(OrganisationType.PARTNER);
      expect(partnerOrg?.description).toBe(
        'Demo partner organisation for testing and development'
      );
    });

    it('should label organisations with DEMO prefix', async () => {
      const demoOrgs = await prisma.organisation.findMany({
        where: {
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      expect(demoOrgs.length).toBeGreaterThanOrEqual(2);
      demoOrgs.forEach((org) => {
        expect(org.name).toMatch(/^DEMO/);
      });
    });

    it('should create both CLIENT and PARTNER organisation types', async () => {
      const clientOrgs = await prisma.organisation.findMany({
        where: {
          type: OrganisationType.CLIENT,
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      const partnerOrgs = await prisma.organisation.findMany({
        where: {
          type: OrganisationType.PARTNER,
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      expect(clientOrgs.length).toBeGreaterThanOrEqual(1);
      expect(partnerOrgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Organisation Membership', () => {
    it('should create organisation memberships for demo users', async () => {
      const clientOrg = await prisma.organisation.findUnique({
        where: { name: 'DEMO Client Organisation' },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(clientOrg).toBeDefined();
      expect(clientOrg?.members.length).toBeGreaterThan(0);

      // Verify members have DEMO prefix
      clientOrg?.members.forEach((member) => {
        expect(member.user.name).toMatch(/^DEMO/);
      });
    });

    it('should assign DEMO_CLIENT to DEMO Client Organisation', async () => {
      const clientUser = await prisma.user.findUnique({
        where: { email: 'DEMO_CLIENT@example.com' },
        include: {
          organisationMembers: {
            include: {
              organisation: true,
            },
          },
        },
      });

      expect(clientUser).toBeDefined();
      
      const clientOrgMembership = clientUser?.organisationMembers.find(
        (m) => m.organisation.name === 'DEMO Client Organisation'
      );

      expect(clientOrgMembership).toBeDefined();
      expect(clientOrgMembership?.organisation.type).toBe(OrganisationType.CLIENT);
    });

    it('should assign DEMO_CLIENT_APPROVER to DEMO Client Organisation', async () => {
      const approverUser = await prisma.user.findUnique({
        where: { email: 'DEMO_CLIENT_APPROVER@example.com' },
        include: {
          organisationMembers: {
            include: {
              organisation: true,
            },
          },
        },
      });

      expect(approverUser).toBeDefined();
      
      const clientOrgMembership = approverUser?.organisationMembers.find(
        (m) => m.organisation.name === 'DEMO Client Organisation'
      );

      expect(clientOrgMembership).toBeDefined();
    });

    it('should assign DEMO_DELIVERY_LEAD to DEMO Client Organisation', async () => {
      const leadUser = await prisma.user.findUnique({
        where: { email: 'DEMO_DELIVERY_LEAD@example.com' },
        include: {
          organisationMembers: {
            include: {
              organisation: true,
            },
          },
        },
      });

      expect(leadUser).toBeDefined();
      
      const clientOrgMembership = leadUser?.organisationMembers.find(
        (m) => m.organisation.name === 'DEMO Client Organisation'
      );

      expect(clientOrgMembership).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent createdAt timestamps', async () => {
      const organisations = await prisma.organisation.findMany({
        where: {
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      organisations.forEach((org) => {
        expect(org.createdAt).toBeInstanceOf(Date);
        expect(org.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should have valid UUIDs as IDs', async () => {
      const organisations = await prisma.organisation.findMany({
        where: {
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      organisations.forEach((org) => {
        expect(org.id).toMatch(uuidRegex);
      });
    });
  });

  describe('Seed Script Idempotency', () => {
    it('should not create duplicate organisations on re-run', async () => {
      const orgsBefore = await prisma.organisation.count({
        where: {
          name: {
            startsWith: 'DEMO',
          },
        },
      });

      // Verify we have exactly 2 demo organisations
      expect(orgsBefore).toBe(2);
    });
  });
});
