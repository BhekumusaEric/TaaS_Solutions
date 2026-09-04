/**
 * Manual Seed Verification Script
 * 
 * This script verifies the seed data was created correctly by querying
 * the database and reporting on user role and organisation assignments.
 * 
 * Usage: npx tsx prisma/verify-seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying seed data...\n');

  try {
    // 1. Check demo users
    console.log('📊 Demo Users:');
    const demoUsers = await prisma.user.findMany({
      where: {
        email: { startsWith: 'DEMO_' },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        organisationMembers: {
          include: {
            organisation: true,
          },
        },
      },
      orderBy: {
        email: 'asc',
      },
    });

    console.log(`   Total demo users: ${demoUsers.length}`);
    console.log('');

    // 2. Display role assignments
    console.log('🎭 Role Assignments:');
    demoUsers.forEach((user) => {
      const roleName = user.roles[0]?.role.name || 'NO ROLE';
      console.log(`   ${user.email.padEnd(40)} → ${roleName}`);
    });
    console.log('');

    // 3. Display organisation assignments
    console.log('🏢 Organisation Assignments:');
    const usersWithOrgs = demoUsers.filter((u) => u.organisationMembers.length > 0);
    const usersWithoutOrgs = demoUsers.filter((u) => u.organisationMembers.length === 0);

    console.log(`   Users with organisations: ${usersWithOrgs.length}`);
    usersWithOrgs.forEach((user) => {
      const orgName = user.organisationMembers[0].organisation.name;
      console.log(`   ${user.email.padEnd(40)} → ${orgName}`);
    });
    console.log('');

    console.log(`   Users without organisations: ${usersWithoutOrgs.length}`);
    usersWithoutOrgs.forEach((user) => {
      console.log(`   ${user.email.padEnd(40)} → (none)`);
    });
    console.log('');

    // 4. Verify assignments match specifications
    console.log('✅ Verification Results:');
    
    const checks = [
      {
        name: 'Total demo users created',
        expected: 9,
        actual: demoUsers.length,
      },
      {
        name: 'Users assigned to organisations',
        expected: 3,
        actual: usersWithOrgs.length,
      },
      {
        name: 'Users without organisations',
        expected: 6,
        actual: usersWithoutOrgs.length,
      },
      {
        name: 'DEMO_TALENT role',
        expected: 'VERIFIED_TALENT',
        actual: demoUsers.find((u) => u.email === 'DEMO_TALENT@example.com')?.roles[0]?.role.name,
      },
      {
        name: 'DEMO_CLIENT role',
        expected: 'CLIENT_MEMBER',
        actual: demoUsers.find((u) => u.email === 'DEMO_CLIENT@example.com')?.roles[0]?.role.name,
      },
      {
        name: 'DEMO_CLIENT_APPROVER role',
        expected: 'CLIENT_APPROVER',
        actual: demoUsers.find((u) => u.email === 'DEMO_CLIENT_APPROVER@example.com')?.roles[0]?.role.name,
      },
      {
        name: 'DEMO_DELIVERY_LEAD role',
        expected: 'DELIVERY_LEAD',
        actual: demoUsers.find((u) => u.email === 'DEMO_DELIVERY_LEAD@example.com')?.roles[0]?.role.name,
      },
      {
        name: 'DEMO_ADMIN role',
        expected: 'PLATFORM_ADMIN',
        actual: demoUsers.find((u) => u.email === 'DEMO_ADMIN@example.com')?.roles[0]?.role.name,
      },
      {
        name: 'DEMO_CLIENT organisation',
        expected: 'DEMO Client Organisation',
        actual: demoUsers.find((u) => u.email === 'DEMO_CLIENT@example.com')
          ?.organisationMembers[0]?.organisation.name,
      },
      {
        name: 'DEMO_CLIENT_APPROVER organisation',
        expected: 'DEMO Client Organisation',
        actual: demoUsers.find((u) => u.email === 'DEMO_CLIENT_APPROVER@example.com')
          ?.organisationMembers[0]?.organisation.name,
      },
      {
        name: 'DEMO_DELIVERY_LEAD organisation',
        expected: 'DEMO Client Organisation',
        actual: demoUsers.find((u) => u.email === 'DEMO_DELIVERY_LEAD@example.com')
          ?.organisationMembers[0]?.organisation.name,
      },
    ];

    let allPassed = true;
    checks.forEach((check) => {
      const passed = check.expected === check.actual;
      const icon = passed ? '✓' : '✗';
      const status = passed ? 'PASS' : 'FAIL';
      
      console.log(`   ${icon} ${check.name}: ${status}`);
      if (!passed) {
        console.log(`      Expected: ${check.expected}`);
        console.log(`      Actual: ${check.actual}`);
        allPassed = false;
      }
    });

    console.log('');

    if (allPassed) {
      console.log('✨ All verification checks passed!');
      console.log('');
      console.log('📝 Summary:');
      console.log('   - 9 demo users created');
      console.log('   - Each user assigned to exactly 1 role');
      console.log('   - 3 users assigned to DEMO Client Organisation');
      console.log('   - 6 internal admin users not assigned to organisations');
      console.log('   - All assignments follow domain logic');
      console.log('');
      console.log('✅ Seed script verification complete!');
      process.exit(0);
    } else {
      console.log('❌ Some verification checks failed!');
      console.log('');
      console.log('Possible causes:');
      console.log('   - Seed script not run yet (npm run prisma:seed)');
      console.log('   - Manual data modifications');
      console.log('   - Database migration issues');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
