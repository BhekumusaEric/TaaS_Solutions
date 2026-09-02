/**
 * Foreign Key Verification Script
 * 
 * This script verifies that all foreign key constraints in the Prisma schema
 * are correctly defined with appropriate onDelete behavior.
 * 
 * Expected Foreign Key Constraints:
 * - UserRole → User, Role (both Cascade)
 * - RolePermission → Role, Permission (both Cascade)
 * - OrganisationMember → User, Organisation (both Cascade)
 * - AuditEvent → User (Cascade)
 * - Account → User (Cascade)
 * - Session → User (Cascade)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ForeignKeyConstraint {
  tableName: string;
  constraintName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete: string;
  onUpdate: string;
}

async function getForeignKeyConstraints(): Promise<ForeignKeyConstraint[]> {
  const query = `
    SELECT
      tc.table_name AS "tableName",
      tc.constraint_name AS "constraintName",
      kcu.column_name AS "columnName",
      ccu.table_name AS "referencedTable",
      ccu.column_name AS "referencedColumn",
      rc.delete_rule AS "onDelete",
      rc.update_rule AS "onUpdate"
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
  `;

  const results = await prisma.$queryRawUnsafe<ForeignKeyConstraint[]>(query);
  return results;
}

interface ExpectedConstraint {
  tableName: string;
  columnName: string;
  referencedTable: string;
  expectedOnDelete: string;
  description: string;
}

const expectedConstraints: ExpectedConstraint[] = [
  // UserRole constraints
  {
    tableName: 'UserRole',
    columnName: 'userId',
    referencedTable: 'User',
    expectedOnDelete: 'CASCADE',
    description: 'UserRole → User: When user deleted, their role assignments should be deleted',
  },
  {
    tableName: 'UserRole',
    columnName: 'roleId',
    referencedTable: 'Role',
    expectedOnDelete: 'CASCADE',
    description: 'UserRole → Role: When role deleted, all assignments should be deleted',
  },
  
  // RolePermission constraints
  {
    tableName: 'RolePermission',
    columnName: 'roleId',
    referencedTable: 'Role',
    expectedOnDelete: 'CASCADE',
    description: 'RolePermission → Role: When role deleted, its permissions should be deleted',
  },
  {
    tableName: 'RolePermission',
    columnName: 'permissionId',
    referencedTable: 'Permission',
    expectedOnDelete: 'CASCADE',
    description: 'RolePermission → Permission: When permission deleted, role links should be deleted',
  },
  
  // OrganisationMember constraints
  {
    tableName: 'OrganisationMember',
    columnName: 'userId',
    referencedTable: 'User',
    expectedOnDelete: 'CASCADE',
    description: 'OrganisationMember → User: When user deleted, their org memberships should be deleted',
  },
  {
    tableName: 'OrganisationMember',
    columnName: 'organisationId',
    referencedTable: 'Organisation',
    expectedOnDelete: 'CASCADE',
    description: 'OrganisationMember → Organisation: When org deleted, all memberships should be deleted',
  },
  
  // AuditEvent constraint
  {
    tableName: 'AuditEvent',
    columnName: 'userId',
    referencedTable: 'User',
    expectedOnDelete: 'CASCADE',
    description: 'AuditEvent → User: When user deleted, their audit events should be deleted',
  },
  
  // Account constraint (NextAuth)
  {
    tableName: 'Account',
    columnName: 'userId',
    referencedTable: 'User',
    expectedOnDelete: 'CASCADE',
    description: 'Account → User: When user deleted, their OAuth accounts should be deleted',
  },
  
  // Session constraint (NextAuth)
  {
    tableName: 'Session',
    columnName: 'userId',
    referencedTable: 'User',
    expectedOnDelete: 'CASCADE',
    description: 'Session → User: When user deleted, their sessions should be deleted',
  },
];

async function verifyForeignKeys() {
  console.log('🔍 Starting Foreign Key Constraint Verification\n');
  console.log('=' .repeat(80));
  console.log('\n');

  try {
    const actualConstraints = await getForeignKeyConstraints();
    
    console.log(`Found ${actualConstraints.length} foreign key constraints in database\n`);
    
    let allCorrect = true;
    const results: { expected: ExpectedConstraint; actual: ForeignKeyConstraint | null; correct: boolean }[] = [];

    // Check each expected constraint
    for (const expected of expectedConstraints) {
      const actual = actualConstraints.find(
        (c) =>
          c.tableName === expected.tableName &&
          c.columnName === expected.columnName &&
          c.referencedTable === expected.referencedTable
      );

      const correct = actual !== undefined && actual.onDelete === expected.expectedOnDelete;
      
      if (!correct) {
        allCorrect = false;
      }

      results.push({ expected, actual: actual || null, correct });
    }

    // Display results
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(80));
    console.log('\n');

    for (const result of results) {
      const status = result.correct ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.expected.tableName}.${result.expected.columnName} → ${result.expected.referencedTable}`);
      console.log(`   Description: ${result.expected.description}`);
      console.log(`   Expected onDelete: ${result.expected.expectedOnDelete}`);
      
      if (result.actual) {
        console.log(`   Actual onDelete:   ${result.actual.onDelete}`);
        console.log(`   Constraint name:   ${result.actual.constraintName}`);
      } else {
        console.log(`   ⚠️  CONSTRAINT NOT FOUND IN DATABASE`);
      }
      console.log('');
    }

    // Check for unexpected constraints
    console.log('\n');
    console.log('ADDITIONAL FOREIGN KEYS IN DATABASE');
    console.log('='.repeat(80));
    console.log('\n');

    let hasUnexpected = false;
    for (const actual of actualConstraints) {
      const isExpected = expectedConstraints.some(
        (e) =>
          e.tableName === actual.tableName &&
          e.columnName === actual.columnName &&
          e.referencedTable === actual.referencedTable
      );

      if (!isExpected) {
        hasUnexpected = true;
        console.log(`ℹ️  ${actual.tableName}.${actual.columnName} → ${actual.referencedTable}`);
        console.log(`   onDelete: ${actual.onDelete}`);
        console.log(`   Constraint: ${actual.constraintName}`);
        console.log('');
      }
    }

    if (!hasUnexpected) {
      console.log('No unexpected foreign keys found.\n');
    }

    // Summary
    console.log('\n');
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log('\n');
    
    const passCount = results.filter((r) => r.correct).length;
    const failCount = results.filter((r) => !r.correct).length;
    
    console.log(`Total Expected Constraints: ${expectedConstraints.length}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('\n');

    if (allCorrect) {
      console.log('🎉 All foreign key constraints are correctly defined!');
      console.log('✅ All onDelete behaviors match requirements');
      console.log('✅ All relationships are properly configured');
      console.log('✅ Referential integrity will be maintained');
      return true;
    } else {
      console.log('⚠️  Some foreign key constraints need attention.');
      console.log('Please review the failures above and update the schema accordingly.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyForeignKeys()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
