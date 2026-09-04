/**
 * Seed Script Idempotency Tests
 * 
 * Verifies that the seed script:
 * - Uses upsert operations throughout
 * - Can be run multiple times without errors
 * - Doesn't create duplicate data
 * - Respects unique constraints
 * - Maintains data integrity
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const prisma = new PrismaClient();

describe('Seed Script Idempotency', () => {
  beforeAll(async () => {
    // Ensure clean state before tests
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should run seed script successfully the first time', async () => {
    // Run seed script
    const result = await runSeedScript();
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Database seeding completed successfully');
  });

  it('should create all expected permissions', async () => {
    const permissions = await prisma.permission.findMany();
    
    // Verify we have permissions for all resources
    expect(permissions.length).toBeGreaterThan(0);
    
    // Verify specific critical permissions exist
    const permissionNames = permissions.map(p => p.name);
    expect(permissionNames).toContain('user:create');
    expect(permissionNames).toContain('organisation:create');
    expect(permissionNames).toContain('role:assign');
    expect(permissionNames).toContain('audit:read:all');
    
    // Verify all permissions have unique names
    const uniqueNames = new Set(permissionNames);
    expect(uniqueNames.size).toBe(permissions.length);
  });

  it('should create all expected roles', async () => {
    const roles = await prisma.role.findMany();
    
    // Verify expected roles exist
    expect(roles.length).toBe(10);
    
    const roleNames = roles.map(r => r.name);
    expect(roleNames).toContain('TALENT_APPLICANT');
    expect(roleNames).toContain('VERIFIED_TALENT');
    expect(roleNames).toContain('CLIENT_MEMBER');
    expect(roleNames).toContain('CLIENT_APPROVER');
    expect(roleNames).toContain('DELIVERY_LEAD');
    expect(roleNames).toContain('TALENT_OPS_ADMIN');
    expect(roleNames).toContain('PROJECT_OPS_ADMIN');
    expect(roleNames).toContain('QUALITY_REVIEWER');
    expect(roleNames).toContain('FINANCE_ADMIN');
    expect(roleNames).toContain('PLATFORM_ADMIN');
    
    // Verify all roles have unique names
    const uniqueNames = new Set(roleNames);
    expect(uniqueNames.size).toBe(roles.length);
  });

  it('should create all expected demo users', async () => {
    const users = await prisma.user.findMany({
      where: {
        email: {
          startsWith: 'DEMO_'
        }
      }
    });
    
    // Verify expected users exist
    expect(users.length).toBe(9);
    
    const emails = users.map(u => u.email);
    expect(emails).toContain('DEMO_TALENT@example.com');
    expect(emails).toContain('DEMO_CLIENT@example.com');
    expect(emails).toContain('DEMO_CLIENT_APPROVER@example.com');
    expect(emails).toContain('DEMO_DELIVERY_LEAD@example.com');
    expect(emails).toContain('DEMO_TALENT_OPS@example.com');
    expect(emails).toContain('DEMO_PROJECT_OPS@example.com');
    expect(emails).toContain('DEMO_QUALITY@example.com');
    expect(emails).toContain('DEMO_FINANCE@example.com');
    expect(emails).toContain('DEMO_ADMIN@example.com');
    
    // Verify all users have passwords
    users.forEach(user => {
      expect(user.password).toBeTruthy();
      expect(user.name).toContain('DEMO');
    });
  });

  it('should create all expected demo organisations', async () => {
    const organisations = await prisma.organisation.findMany({
      where: {
        name: {
          startsWith: 'DEMO'
        }
      }
    });
    
    expect(organisations.length).toBe(2);
    
    const orgNames = organisations.map(o => o.name);
    expect(orgNames).toContain('DEMO Client Organisation');
    expect(orgNames).toContain('DEMO Partner Organisation');
    
    // Verify organisation types
    const clientOrg = organisations.find(o => o.name === 'DEMO Client Organisation');
    const partnerOrg = organisations.find(o => o.name === 'DEMO Partner Organisation');
    
    expect(clientOrg?.type).toBe('CLIENT');
    expect(partnerOrg?.type).toBe('PARTNER');
  });

  it('should assign roles to users correctly', async () => {
    // Get demo admin user and their roles
    const admin = await prisma.user.findUnique({
      where: { email: 'DEMO_ADMIN@example.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    expect(admin).toBeTruthy();
    expect(admin?.roles.length).toBe(1);
    expect(admin?.roles[0].role.name).toBe('PLATFORM_ADMIN');
    
    // Get demo talent user and their roles
    const talent = await prisma.user.findUnique({
      where: { email: 'DEMO_TALENT@example.com' },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    expect(talent).toBeTruthy();
    expect(talent?.roles.length).toBe(1);
    expect(talent?.roles[0].role.name).toBe('VERIFIED_TALENT');
  });

  it('should assign permissions to roles correctly', async () => {
    // Get PLATFORM_ADMIN role with permissions
    const adminRole = await prisma.role.findUnique({
      where: { name: 'PLATFORM_ADMIN' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    expect(adminRole).toBeTruthy();
    expect(adminRole?.permissions.length).toBeGreaterThan(10);
    
    // Verify admin has critical permissions
    const permissionNames = adminRole?.permissions.map(rp => rp.permission.name) || [];
    expect(permissionNames).toContain('user:create');
    expect(permissionNames).toContain('organisation:create');
    expect(permissionNames).toContain('role:assign');
    expect(permissionNames).toContain('audit:read:all');
    
    // Get VERIFIED_TALENT role with permissions
    const talentRole = await prisma.role.findUnique({
      where: { name: 'VERIFIED_TALENT' },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    expect(talentRole).toBeTruthy();
    expect(talentRole?.permissions.length).toBeGreaterThan(0);
    
    const talentPermissions = talentRole?.permissions.map(rp => rp.permission.name) || [];
    expect(talentPermissions).toContain('profile:read:own');
    expect(talentPermissions).toContain('profile:update:own');
    expect(talentPermissions).toContain('project:read:assigned');
  });

  it('should assign users to organisations correctly', async () => {
    const clientOrg = await prisma.organisation.findUnique({
      where: { name: 'DEMO Client Organisation' },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    expect(clientOrg).toBeTruthy();
    expect(clientOrg?.members.length).toBe(3);
    
    const memberEmails = clientOrg?.members.map(m => m.user.email) || [];
    expect(memberEmails).toContain('DEMO_CLIENT@example.com');
    expect(memberEmails).toContain('DEMO_CLIENT_APPROVER@example.com');
    expect(memberEmails).toContain('DEMO_DELIVERY_LEAD@example.com');
  });

  it('should run seed script successfully a second time (idempotency)', async () => {
    // Count records before second run
    const countsBefore = await getCounts();
    
    // Run seed script again
    const result = await runSeedScript();
    
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Database seeding completed successfully');
    
    // Count records after second run
    const countsAfter = await getCounts();
    
    // Verify no duplicate records created
    expect(countsAfter.users).toBe(countsBefore.users);
    expect(countsAfter.roles).toBe(countsBefore.roles);
    expect(countsAfter.permissions).toBe(countsBefore.permissions);
    expect(countsAfter.organisations).toBe(countsBefore.organisations);
    expect(countsAfter.userRoles).toBe(countsBefore.userRoles);
    expect(countsAfter.rolePermissions).toBe(countsBefore.rolePermissions);
    expect(countsAfter.orgMembers).toBe(countsBefore.orgMembers);
  });

  it('should run seed script successfully a third time (further idempotency verification)', async () => {
    // Count records before third run
    const countsBefore = await getCounts();
    
    // Run seed script again
    const result = await runSeedScript();
    
    expect(result.exitCode).toBe(0);
    
    // Count records after third run
    const countsAfter = await getCounts();
    
    // Verify still no duplicate records
    expect(countsAfter.users).toBe(countsBefore.users);
    expect(countsAfter.roles).toBe(countsBefore.roles);
    expect(countsAfter.permissions).toBe(countsBefore.permissions);
    expect(countsAfter.organisations).toBe(countsBefore.organisations);
    expect(countsAfter.userRoles).toBe(countsBefore.userRoles);
    expect(countsAfter.rolePermissions).toBe(countsBefore.rolePermissions);
    expect(countsAfter.orgMembers).toBe(countsBefore.orgMembers);
  });

  it('should respect unique constraints on User.email', async () => {
    // Try to create duplicate user (this should fail if not using upsert)
    await expect(async () => {
      await prisma.user.create({
        data: {
          email: 'DEMO_ADMIN@example.com',
          name: 'Duplicate Admin',
          password: 'test'
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on Role.name', async () => {
    await expect(async () => {
      await prisma.role.create({
        data: {
          name: 'PLATFORM_ADMIN',
          description: 'Duplicate role'
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on Permission.name', async () => {
    await expect(async () => {
      await prisma.permission.create({
        data: {
          name: 'user:create',
          resource: 'user',
          action: 'create'
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on Organisation.name', async () => {
    await expect(async () => {
      await prisma.organisation.create({
        data: {
          name: 'DEMO Client Organisation',
          type: 'CLIENT'
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on UserRole', async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'DEMO_ADMIN@example.com' }
    });
    
    const adminRole = await prisma.role.findUnique({
      where: { name: 'PLATFORM_ADMIN' }
    });
    
    expect(admin).toBeTruthy();
    expect(adminRole).toBeTruthy();
    
    await expect(async () => {
      await prisma.userRole.create({
        data: {
          userId: admin!.id,
          roleId: adminRole!.id
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on RolePermission', async () => {
    const adminRole = await prisma.role.findUnique({
      where: { name: 'PLATFORM_ADMIN' },
      include: {
        permissions: {
          include: {
            permission: true
          },
          take: 1
        }
      }
    });
    
    expect(adminRole).toBeTruthy();
    expect(adminRole?.permissions.length).toBeGreaterThan(0);
    
    const roleId = adminRole!.id;
    const permissionId = adminRole!.permissions[0].permission.id;
    
    await expect(async () => {
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        }
      });
    }).rejects.toThrow();
  });

  it('should respect unique constraints on OrganisationMember', async () => {
    const client = await prisma.user.findUnique({
      where: { email: 'DEMO_CLIENT@example.com' }
    });
    
    const org = await prisma.organisation.findUnique({
      where: { name: 'DEMO Client Organisation' }
    });
    
    expect(client).toBeTruthy();
    expect(org).toBeTruthy();
    
    await expect(async () => {
      await prisma.organisationMember.create({
        data: {
          userId: client!.id,
          organisationId: org!.id
        }
      });
    }).rejects.toThrow();
  });

  it('should prevent running in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    
    try {
      // Set NODE_ENV to production
      process.env.NODE_ENV = 'production';
      
      const result = await runSeedScript();
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Cannot seed database in production');
    } finally {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    }
  });
});

/**
 * Helper function to run the seed script
 */
async function runSeedScript(): Promise<{ exitCode: number; output: string }> {
  try {
    const output = execSync('npx tsx prisma/seed.ts', {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: {
        ...process.env,
        // Ensure we're not in production for most tests
        NODE_ENV: process.env.NODE_ENV || 'test'
      }
    });
    
    return { exitCode: 0, output };
  } catch (error: any) {
    return {
      exitCode: error.status || 1,
      output: error.stdout || error.stderr || error.message
    };
  }
}

/**
 * Helper function to get counts of all seeded entities
 */
async function getCounts() {
  const [
    users,
    roles,
    permissions,
    organisations,
    userRoles,
    rolePermissions,
    orgMembers
  ] = await Promise.all([
    prisma.user.count({ where: { email: { startsWith: 'DEMO_' } } }),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.organisation.count({ where: { name: { startsWith: 'DEMO' } } }),
    prisma.userRole.count(),
    prisma.rolePermission.count(),
    prisma.organisationMember.count()
  ]);
  
  return {
    users,
    roles,
    permissions,
    organisations,
    userRoles,
    rolePermissions,
    orgMembers
  };
}

/**
 * Helper function to clean database before tests
 */
async function cleanDatabase() {
  // Delete in reverse order of dependencies
  await prisma.auditEvent.deleteMany();
  await prisma.organisationMember.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
}
