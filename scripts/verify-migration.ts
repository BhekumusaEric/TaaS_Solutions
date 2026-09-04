/**
 * Migration Verification Script
 * 
 * This script verifies that the database migration has been applied successfully
 * by checking for the existence of all required tables, indexes, and constraints.
 * 
 * Usage: npx tsx scripts/verify-migration.ts
 */

import { db } from '../src/lib/db';

interface VerificationResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: VerificationResult[] = [];

function logResult(result: VerificationResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${result.category}] ${result.check}: ${result.message}`);
}

async function verifyConnection(): Promise<boolean> {
  try {
    await db.$connect();
    logResult({
      category: 'Connection',
      check: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database',
    });
    return true;
  } catch (error) {
    logResult({
      category: 'Connection',
      check: 'Database Connection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function verifyTables(): Promise<void> {
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

  console.log('\n📋 Verifying Tables...\n');

  for (const table of expectedTables) {
    try {
      // Use raw query to check table existence
      const result = await db.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${table}'
      `);

      if (Array.isArray(result) && result.length > 0) {
        logResult({
          category: 'Tables',
          check: `Table: ${table}`,
          status: 'PASS',
          message: 'Table exists',
        });
      } else {
        logResult({
          category: 'Tables',
          check: `Table: ${table}`,
          status: 'FAIL',
          message: 'Table not found',
        });
      }
    } catch (error) {
      logResult({
        category: 'Tables',
        check: `Table: ${table}`,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

async function verifyIndexes(): Promise<void> {
  console.log('\n🔍 Verifying Indexes...\n');

  try {
    const indexes = await db.$queryRawUnsafe<Array<{ tablename: string; indexname: string }>>(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    const indexCount = indexes.length;
    
    if (indexCount >= 20) {
      logResult({
        category: 'Indexes',
        check: 'Index Count',
        status: 'PASS',
        message: `Found ${indexCount} indexes (minimum 20 expected)`,
      });
    } else {
      logResult({
        category: 'Indexes',
        check: 'Index Count',
        status: 'WARN',
        message: `Found ${indexCount} indexes (expected at least 20)`,
      });
    }

    // Check for critical indexes
    const criticalIndexes = [
      'User_email_key',
      'User_email_idx',
      'Role_name_key',
      'Permission_name_key',
      'Organisation_name_key',
    ];

    for (const indexName of criticalIndexes) {
      const found = indexes.some((idx) => idx.indexname === indexName);
      logResult({
        category: 'Indexes',
        check: `Critical Index: ${indexName}`,
        status: found ? 'PASS' : 'FAIL',
        message: found ? 'Index exists' : 'Index not found',
      });
    }
  } catch (error) {
    logResult({
      category: 'Indexes',
      check: 'Index Verification',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function verifyForeignKeys(): Promise<void> {
  console.log('\n🔗 Verifying Foreign Keys...\n');

  try {
    const foreignKeys = await db.$queryRawUnsafe<
      Array<{
        table_name: string;
        column_name: string;
        foreign_table_name: string;
        foreign_column_name: string;
      }>
    >(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    const fkCount = foreignKeys.length;
    
    if (fkCount >= 9) {
      logResult({
        category: 'Foreign Keys',
        check: 'Foreign Key Count',
        status: 'PASS',
        message: `Found ${fkCount} foreign keys (minimum 9 expected)`,
      });
    } else {
      logResult({
        category: 'Foreign Keys',
        check: 'Foreign Key Count',
        status: 'FAIL',
        message: `Found ${fkCount} foreign keys (expected at least 9)`,
      });
    }

    // Check for critical foreign keys
    const criticalForeignKeys = [
      { table: 'UserRole', column: 'userId', refTable: 'User' },
      { table: 'UserRole', column: 'roleId', refTable: 'Role' },
      { table: 'RolePermission', column: 'roleId', refTable: 'Role' },
      { table: 'RolePermission', column: 'permissionId', refTable: 'Permission' },
      { table: 'OrganisationMember', column: 'userId', refTable: 'User' },
      { table: 'OrganisationMember', column: 'organisationId', refTable: 'Organisation' },
      { table: 'AuditEvent', column: 'userId', refTable: 'User' },
      { table: 'Account', column: 'userId', refTable: 'User' },
      { table: 'Session', column: 'userId', refTable: 'User' },
    ];

    for (const fk of criticalForeignKeys) {
      const found = foreignKeys.some(
        (key) =>
          key.table_name === fk.table &&
          key.column_name === fk.column &&
          key.foreign_table_name === fk.refTable
      );
      logResult({
        category: 'Foreign Keys',
        check: `FK: ${fk.table}.${fk.column} → ${fk.refTable}`,
        status: found ? 'PASS' : 'FAIL',
        message: found ? 'Foreign key exists' : 'Foreign key not found',
      });
    }
  } catch (error) {
    logResult({
      category: 'Foreign Keys',
      check: 'Foreign Key Verification',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function verifyEnumType(): Promise<void> {
  console.log('\n📝 Verifying Enum Types...\n');

  try {
    const enumTypes = await db.$queryRawUnsafe<Array<{ typname: string; enumlabel: string }>>(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'OrganisationType'
      ORDER BY e.enumsortorder
    `);

    if (enumTypes.length === 0) {
      logResult({
        category: 'Enum Types',
        check: 'OrganisationType Enum',
        status: 'FAIL',
        message: 'Enum type not found',
      });
    } else {
      const values = enumTypes.map((e) => e.enumlabel);
      const expectedValues = ['CLIENT', 'PARTNER'];
      const allValuesPresent = expectedValues.every((val) => values.includes(val));

      logResult({
        category: 'Enum Types',
        check: 'OrganisationType Enum',
        status: allValuesPresent ? 'PASS' : 'FAIL',
        message: `Found values: ${values.join(', ')}`,
      });
    }
  } catch (error) {
    logResult({
      category: 'Enum Types',
      check: 'Enum Type Verification',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function verifyUniqueConstraints(): Promise<void> {
  console.log('\n🔒 Verifying Unique Constraints...\n');

  try {
    const constraints = await db.$queryRawUnsafe<
      Array<{
        table_name: string;
        constraint_name: string;
      }>
    >(`
      SELECT
        tc.table_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    const constraintCount = constraints.length;
    
    if (constraintCount >= 10) {
      logResult({
        category: 'Unique Constraints',
        check: 'Unique Constraint Count',
        status: 'PASS',
        message: `Found ${constraintCount} unique constraints (minimum 10 expected)`,
      });
    } else {
      logResult({
        category: 'Unique Constraints',
        check: 'Unique Constraint Count',
        status: 'WARN',
        message: `Found ${constraintCount} unique constraints (expected at least 10)`,
      });
    }

    // Check for critical unique constraints
    const criticalConstraints = [
      'User_email_key',
      'Role_name_key',
      'Permission_name_key',
      'Organisation_name_key',
      'Session_sessionToken_key',
      'VerificationToken_token_key',
    ];

    for (const constraintName of criticalConstraints) {
      const found = constraints.some((c) => c.constraint_name === constraintName);
      logResult({
        category: 'Unique Constraints',
        check: `Constraint: ${constraintName}`,
        status: found ? 'PASS' : 'FAIL',
        message: found ? 'Constraint exists' : 'Constraint not found',
      });
    }
  } catch (error) {
    logResult({
      category: 'Unique Constraints',
      check: 'Unique Constraint Verification',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function verifyPrismaClient(): Promise<void> {
  console.log('\n🔧 Verifying Prisma Client...\n');

  try {
    // Test basic Prisma operations
    const userCount = await db.user.count();
    logResult({
      category: 'Prisma Client',
      check: 'User Query',
      status: 'PASS',
      message: `Can query User table (${userCount} users found)`,
    });

    const roleCount = await db.role.count();
    logResult({
      category: 'Prisma Client',
      check: 'Role Query',
      status: 'PASS',
      message: `Can query Role table (${roleCount} roles found)`,
    });

    const orgCount = await db.organisation.count();
    logResult({
      category: 'Prisma Client',
      check: 'Organisation Query',
      status: 'PASS',
      message: `Can query Organisation table (${orgCount} organisations found)`,
    });
  } catch (error) {
    logResult({
      category: 'Prisma Client',
      check: 'Prisma Client Queries',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function printSummary(): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const warnings = results.filter((r) => r.status === 'WARN').length;
  const total = results.length;

  console.log(`✅ Passed:   ${passed}/${total}`);
  console.log(`❌ Failed:   ${failed}/${total}`);
  console.log(`⚠️  Warnings: ${warnings}/${total}`);
  console.log('');

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All checks passed! Migration successfully applied.\n');
  } else if (failed === 0) {
    console.log('⚠️  All critical checks passed, but there are warnings.\n');
  } else {
    console.log('❌ Some checks failed. Review the output above.\n');
    console.log('Failed checks:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  - [${r.category}] ${r.check}: ${r.message}`);
      });
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

async function main() {
  console.log('\n🔍 Database Migration Verification\n');
  console.log('This script verifies that all required database structures exist.\n');
  console.log('='.repeat(80) + '\n');

  try {
    // Step 1: Verify connection
    console.log('🔌 Verifying Database Connection...\n');
    const connected = await verifyConnection();
    
    if (!connected) {
      console.log('\n❌ Cannot connect to database. Verification aborted.\n');
      console.log('Please ensure:');
      console.log('  1. PostgreSQL is running');
      console.log('  2. Database exists (taas_dev)');
      console.log('  3. DATABASE_URL in .env.local is correct\n');
      process.exit(1);
    }

    // Step 2: Verify tables
    await verifyTables();

    // Step 3: Verify indexes
    await verifyIndexes();

    // Step 4: Verify foreign keys
    await verifyForeignKeys();

    // Step 5: Verify enum types
    await verifyEnumType();

    // Step 6: Verify unique constraints
    await verifyUniqueConstraints();

    // Step 7: Verify Prisma Client
    await verifyPrismaClient();

    // Print summary
    await printSummary();

    // Exit with appropriate code
    const failed = results.filter((r) => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
