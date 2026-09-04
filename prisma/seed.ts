/**
 * TaaS Solutions Platform - Database Seed Script
 * 
 * This script seeds the database with demo data for development and testing.
 * ALL DEMO DATA IS CLEARLY LABELED WITH "DEMO_" PREFIX.
 * 
 * Features:
 * - Idempotent (can be run multiple times safely)
 * - Creates roles and permissions if they don't exist
 * - Creates demo users for each role
 * - Creates demo organisations
 * - Creates organisation memberships
 * - Uses secure password hashing (bcrypt)
 * 
 * Usage:
 *   npm run db:seed
 * 
 * Security:
 * - Will not run in production (NODE_ENV check)
 * - Uses known demo password for development convenience
 * - All passwords are properly hashed with bcrypt
 */

import { PrismaClient, OrganisationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo password for all demo accounts (development convenience)
const DEMO_PASSWORD = 'DemoPassword123!';
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Main seed function
 */
async function main() {
  // Prevent running in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: Cannot seed database in production environment');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...\n');

  // Hash demo password once
  const hashedDemoPassword = await hashPassword(DEMO_PASSWORD);
  console.log('✅ Demo password hashed');

  // Step 1: Seed Permissions
  console.log('\n📋 Seeding permissions...');
  const permissions = await seedPermissions();
  console.log(`✅ Created ${permissions.length} permissions`);

  // Step 2: Seed Roles
  console.log('\n👥 Seeding roles...');
  const roles = await seedRoles();
  console.log(`✅ Created ${roles.length} roles`);

  // Step 3: Assign Permissions to Roles
  console.log('\n🔐 Assigning permissions to roles...');
  await assignPermissionsToRoles(roles, permissions);
  console.log('✅ Permissions assigned to roles');

  // Step 4: Seed Demo Users
  console.log('\n👤 Seeding demo users...');
  const users = await seedDemoUsers(hashedDemoPassword);
  console.log(`✅ Created ${users.length} demo users`);

  // Step 5: Assign Roles to Users
  console.log('\n🎭 Assigning roles to users...');
  await assignRolesToUsers(users, roles);
  console.log('✅ Roles assigned to users');

  // Step 6: Seed Demo Organisations
  console.log('\n🏢 Seeding demo organisations...');
  const organisations = await seedDemoOrganisations();
  console.log(`✅ Created ${organisations.length} demo organisations`);

  // Step 7: Assign Users to Organisations
  console.log('\n🔗 Assigning users to organisations...');
  await assignUsersToOrganisations(users, organisations);
  console.log('✅ Users assigned to organisations');

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n📝 Demo Accounts:');
  console.log('   Email: DEMO_TALENT@example.com');
  console.log('   Email: DEMO_CLIENT@example.com');
  console.log('   Email: DEMO_DELIVERY_LEAD@example.com');
  console.log('   Email: DEMO_ADMIN@example.com');
  console.log(`   Password (all): ${DEMO_PASSWORD}`);
}

/**
 * Seed base permissions
 */
async function seedPermissions() {
  const permissionData = [
    // User permissions
    { name: 'user:create', resource: 'user', action: 'create' },
    { name: 'user:read', resource: 'user', action: 'read' },
    { name: 'user:read:own', resource: 'user', action: 'read:own' },
    { name: 'user:update', resource: 'user', action: 'update' },
    { name: 'user:update:own', resource: 'user', action: 'update:own' },
    { name: 'user:delete', resource: 'user', action: 'delete' },

    // Profile permissions
    { name: 'profile:read:own', resource: 'profile', action: 'read:own' },
    { name: 'profile:update:own', resource: 'profile', action: 'update:own' },

    // Organisation permissions
    { name: 'organisation:create', resource: 'organisation', action: 'create' },
    { name: 'organisation:read', resource: 'organisation', action: 'read' },
    { name: 'organisation:read:all', resource: 'organisation', action: 'read:all' },
    { name: 'organisation:update', resource: 'organisation', action: 'update' },
    { name: 'organisation:delete', resource: 'organisation', action: 'delete' },
    { name: 'organisation:members:add', resource: 'organisation', action: 'members:add' },
    { name: 'organisation:members:remove', resource: 'organisation', action: 'members:remove' },

    // Role permissions
    { name: 'role:create', resource: 'role', action: 'create' },
    { name: 'role:read', resource: 'role', action: 'read' },
    { name: 'role:update', resource: 'role', action: 'update' },
    { name: 'role:delete', resource: 'role', action: 'delete' },
    { name: 'role:assign', resource: 'role', action: 'assign' },
    { name: 'role:revoke', resource: 'role', action: 'revoke' },

    // Audit permissions
    { name: 'audit:read', resource: 'audit', action: 'read' },
    { name: 'audit:read:all', resource: 'audit', action: 'read:all' },

    // Opportunity permissions (placeholder for future specs)
    { name: 'opportunity:create', resource: 'opportunity', action: 'create' },
    { name: 'opportunity:read:org', resource: 'opportunity', action: 'read:org' },
    { name: 'opportunity:read:all', resource: 'opportunity', action: 'read:all' },

    // Project permissions (placeholder for future specs)
    { name: 'project:read:assigned', resource: 'project', action: 'read:assigned' },
    { name: 'project:read:org', resource: 'project', action: 'read:org' },
    { name: 'project:update:assigned', resource: 'project', action: 'update:assigned' },

    // Deliverable permissions (placeholder for future specs)
    { name: 'deliverable:submit', resource: 'deliverable', action: 'submit' },
    { name: 'deliverable:review', resource: 'deliverable', action: 'review' },
    { name: 'deliverable:accept', resource: 'deliverable', action: 'accept' },
  ];

  const permissions = [];
  for (const perm of permissionData) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(permission);
  }

  return permissions;
}

/**
 * Seed roles
 */
async function seedRoles() {
  const roleData = [
    {
      name: 'TALENT_APPLICANT',
      description: 'Registered user who has submitted a talent network application but is not yet verified',
    },
    {
      name: 'VERIFIED_TALENT',
      description: 'Approved professional who has completed verification and is available for Talent Pod assignments',
    },
    {
      name: 'CLIENT_MEMBER',
      description: 'User who belongs to a client organisation and can submit opportunities',
    },
    {
      name: 'CLIENT_APPROVER',
      description: 'Client organisation member with authority to approve proposals and accept deliverables',
    },
    {
      name: 'DELIVERY_LEAD',
      description: 'Accountable person for a specific Talent Pod and project delivery',
    },
    {
      name: 'TALENT_OPS_ADMIN',
      description: 'Internal TaaS staff responsible for talent verification and progression',
    },
    {
      name: 'PROJECT_OPS_ADMIN',
      description: 'Internal TaaS staff responsible for opportunity qualification and project mobilization',
    },
    {
      name: 'QUALITY_REVIEWER',
      description: 'Internal TaaS staff responsible for internal quality assurance',
    },
    {
      name: 'FINANCE_ADMIN',
      description: 'Internal TaaS staff responsible for invoices and payouts',
    },
    {
      name: 'PLATFORM_ADMIN',
      description: 'Internal TaaS staff with system-wide configuration and support responsibilities',
    },
  ];

  const roles = [];
  for (const role of roleData) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    roles.push(created);
  }

  return roles;
}

/**
 * Assign permissions to roles based on role definitions
 */
async function assignPermissionsToRoles(
  roles: { id: string; name: string }[],
  permissions: { id: string; name: string }[]
) {
  // Helper to get role and permission IDs
  const getRoleId = (name: string) => roles.find((r) => r.name === name)?.id;
  const getPermIds = (names: string[]) =>
    names.map((name) => permissions.find((p) => p.name === name)?.id).filter(Boolean) as string[];

  // Define role-permission mappings
  const mappings = [
    {
      role: 'TALENT_APPLICANT',
      permissions: ['profile:read:own', 'profile:update:own'],
    },
    {
      role: 'VERIFIED_TALENT',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'project:read:assigned',
        'deliverable:submit',
      ],
    },
    {
      role: 'CLIENT_MEMBER',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'opportunity:create',
        'opportunity:read:org',
        'project:read:org',
      ],
    },
    {
      role: 'CLIENT_APPROVER',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'opportunity:create',
        'opportunity:read:org',
        'project:read:org',
        'deliverable:accept',
      ],
    },
    {
      role: 'DELIVERY_LEAD',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'project:read:assigned',
        'project:update:assigned',
        'deliverable:review',
      ],
    },
    {
      role: 'TALENT_OPS_ADMIN',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'user:read',
        'organisation:read:all',
        'audit:read:all',
      ],
    },
    {
      role: 'PROJECT_OPS_ADMIN',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'opportunity:read:all',
        'organisation:read:all',
        'audit:read:all',
      ],
    },
    {
      role: 'QUALITY_REVIEWER',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'deliverable:review',
        'audit:read:all',
      ],
    },
    {
      role: 'FINANCE_ADMIN',
      permissions: [
        'profile:read:own',
        'profile:update:own',
        'organisation:read:all',
        'audit:read:all',
      ],
    },
    {
      role: 'PLATFORM_ADMIN',
      permissions: [
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'profile:read:own',
        'profile:update:own',
        'organisation:create',
        'organisation:read:all',
        'organisation:update',
        'organisation:delete',
        'organisation:members:add',
        'organisation:members:remove',
        'role:create',
        'role:read',
        'role:update',
        'role:delete',
        'role:assign',
        'role:revoke',
        'audit:read:all',
        'opportunity:read:all',
        'project:read:assigned',
        'project:read:org',
      ],
    },
  ];

  // Create role-permission associations
  for (const mapping of mappings) {
    const roleId = getRoleId(mapping.role);
    if (!roleId) continue;

    const permissionIds = getPermIds(mapping.permissions);

    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }
}

/**
 * Seed demo users (one for each major role)
 */
async function seedDemoUsers(hashedPassword: string) {
  const demoUsers = [
    {
      email: 'DEMO_TALENT@example.com',
      name: 'DEMO Verified Talent User',
      password: hashedPassword,
    },
    {
      email: 'DEMO_CLIENT@example.com',
      name: 'DEMO Client Member',
      password: hashedPassword,
    },
    {
      email: 'DEMO_CLIENT_APPROVER@example.com',
      name: 'DEMO Client Approver',
      password: hashedPassword,
    },
    {
      email: 'DEMO_DELIVERY_LEAD@example.com',
      name: 'DEMO Delivery Lead',
      password: hashedPassword,
    },
    {
      email: 'DEMO_TALENT_OPS@example.com',
      name: 'DEMO Talent Ops Admin',
      password: hashedPassword,
    },
    {
      email: 'DEMO_PROJECT_OPS@example.com',
      name: 'DEMO Project Ops Admin',
      password: hashedPassword,
    },
    {
      email: 'DEMO_QUALITY@example.com',
      name: 'DEMO Quality Reviewer',
      password: hashedPassword,
    },
    {
      email: 'DEMO_FINANCE@example.com',
      name: 'DEMO Finance Admin',
      password: hashedPassword,
    },
    {
      email: 'DEMO_ADMIN@example.com',
      name: 'DEMO Platform Administrator',
      password: hashedPassword,
    },
  ];

  const users = [];
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { password: userData.password, name: userData.name },
      create: userData,
    });
    users.push(user);
  }

  return users;
}

/**
 * Assign roles to demo users
 */
async function assignRolesToUsers(
  users: { id: string; email: string }[],
  roles: { id: string; name: string }[]
) {
  const getUserId = (email: string) => users.find((u) => u.email === email)?.id;
  const getRoleId = (name: string) => roles.find((r) => r.name === name)?.id;

  const assignments = [
    { email: 'DEMO_TALENT@example.com', role: 'VERIFIED_TALENT' },
    { email: 'DEMO_CLIENT@example.com', role: 'CLIENT_MEMBER' },
    { email: 'DEMO_CLIENT_APPROVER@example.com', role: 'CLIENT_APPROVER' },
    { email: 'DEMO_DELIVERY_LEAD@example.com', role: 'DELIVERY_LEAD' },
    { email: 'DEMO_TALENT_OPS@example.com', role: 'TALENT_OPS_ADMIN' },
    { email: 'DEMO_PROJECT_OPS@example.com', role: 'PROJECT_OPS_ADMIN' },
    { email: 'DEMO_QUALITY@example.com', role: 'QUALITY_REVIEWER' },
    { email: 'DEMO_FINANCE@example.com', role: 'FINANCE_ADMIN' },
    { email: 'DEMO_ADMIN@example.com', role: 'PLATFORM_ADMIN' },
  ];

  for (const assignment of assignments) {
    const userId = getUserId(assignment.email);
    const roleId = getRoleId(assignment.role);

    if (!userId || !roleId) continue;

    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      update: {},
      create: { userId, roleId },
    });
  }
}

/**
 * Seed demo organisations
 */
async function seedDemoOrganisations() {
  const orgData = [
    {
      name: 'DEMO Client Organisation',
      type: OrganisationType.CLIENT,
      description: 'Demo client organisation for testing and development',
    },
    {
      name: 'DEMO Partner Organisation',
      type: OrganisationType.PARTNER,
      description: 'Demo partner organisation for testing and development',
    },
  ];

  const organisations = [];
  for (const org of orgData) {
    const created = await prisma.organisation.upsert({
      where: { name: org.name },
      update: { description: org.description },
      create: org,
    });
    organisations.push(created);
  }

  return organisations;
}

/**
 * Assign users to organisations
 */
async function assignUsersToOrganisations(
  users: { id: string; email: string }[],
  organisations: { id: string; name: string }[]
) {
  const getUserId = (email: string) => users.find((u) => u.email === email)?.id;
  const getOrgId = (name: string) => organisations.find((o) => o.name === name)?.id;

  const assignments = [
    { email: 'DEMO_CLIENT@example.com', org: 'DEMO Client Organisation' },
    { email: 'DEMO_CLIENT_APPROVER@example.com', org: 'DEMO Client Organisation' },
    { email: 'DEMO_DELIVERY_LEAD@example.com', org: 'DEMO Client Organisation' },
  ];

  for (const assignment of assignments) {
    const userId = getUserId(assignment.email);
    const organisationId = getOrgId(assignment.org);

    if (!userId || !organisationId) continue;

    await prisma.organisationMember.upsert({
      where: {
        userId_organisationId: { userId, organisationId },
      },
      update: {},
      create: { userId, organisationId },
    });
  }
}

// Execute seed script
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
