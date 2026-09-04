/**
 * Prisma Client Verification Script
 * 
 * This script verifies that the Prisma Client has been successfully
 * generated and includes all expected models and types.
 * 
 * Usage: npx tsx scripts/verify-prisma-client.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark() {
  return '✓';
}

function crossMark() {
  return '✗';
}

async function main() {
  log('\n=================================================', 'cyan');
  log('  Prisma Client Generation Verification', 'cyan');
  log('=================================================\n', 'cyan');

  let allChecksPassed = true;

  // Check 1: Schema file exists
  log('Checking schema file...', 'blue');
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    log(`  ${checkMark()} Schema file exists at prisma/schema.prisma`, 'green');
  } else {
    log(`  ${crossMark()} Schema file not found!`, 'red');
    allChecksPassed = false;
  }

  // Check 2: Generated client directory exists
  log('\nChecking generated client...', 'blue');
  const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (fs.existsSync(clientPath)) {
    log(`  ${checkMark()} Generated client exists at node_modules/.prisma/client`, 'green');
  } else {
    log(`  ${crossMark()} Generated client not found!`, 'red');
    log(`     Run: npx prisma generate`, 'yellow');
    allChecksPassed = false;
  }

  // Check 3: @prisma/client can be imported
  log('\nChecking @prisma/client import...', 'blue');
  try {
    const prismaClient = await import('@prisma/client');
    log(`  ${checkMark()} @prisma/client can be imported`, 'green');

    // Check 4: PrismaClient class exists
    if (prismaClient.PrismaClient) {
      log(`  ${checkMark()} PrismaClient class is available`, 'green');

      // Check 5: Try to instantiate
      try {
        const client = new prismaClient.PrismaClient();
        log(`  ${checkMark()} PrismaClient can be instantiated`, 'green');
        await client.$disconnect();
      } catch (error) {
        log(`  ${crossMark()} Failed to instantiate PrismaClient`, 'red');
        console.error(error);
        allChecksPassed = false;
      }
    } else {
      log(`  ${crossMark()} PrismaClient class not found`, 'red');
      allChecksPassed = false;
    }

    // Check 6: Verify all expected models
    log('\nChecking model availability...', 'blue');
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

    const client = new prismaClient.PrismaClient();
    let modelChecksPassed = 0;

    for (const model of expectedModels) {
      if (client[model as keyof typeof client]) {
        log(`  ${checkMark()} Model '${model}' is available`, 'green');
        modelChecksPassed++;
      } else {
        log(`  ${crossMark()} Model '${model}' is missing!`, 'red');
        allChecksPassed = false;
      }
    }

    log(
      `\n  ${modelChecksPassed}/${expectedModels.length} models verified`,
      modelChecksPassed === expectedModels.length ? 'green' : 'yellow'
    );

    // Check 7: Verify enum export
    log('\nChecking enum exports...', 'blue');
    if (prismaClient.OrganisationType) {
      log(`  ${checkMark()} OrganisationType enum is exported`, 'green');
      if (
        prismaClient.OrganisationType.CLIENT === 'CLIENT' &&
        prismaClient.OrganisationType.PARTNER === 'PARTNER'
      ) {
        log(`  ${checkMark()} OrganisationType values are correct`, 'green');
      } else {
        log(`  ${crossMark()} OrganisationType values are incorrect`, 'red');
        allChecksPassed = false;
      }
    } else {
      log(`  ${crossMark()} OrganisationType enum not found`, 'red');
      allChecksPassed = false;
    }

    await client.$disconnect();
  } catch (error) {
    log(`  ${crossMark()} Failed to import @prisma/client`, 'red');
    log(`     Error: ${(error as Error).message}`, 'yellow');
    log(`     Run: npx prisma generate`, 'yellow');
    allChecksPassed = false;
  }

  // Check 8: Verify TypeScript types (if using TypeScript)
  log('\nChecking TypeScript types...', 'blue');
  try {
    // Try to read the index.d.ts file
    const typesPath = path.join(
      process.cwd(),
      'node_modules',
      '@prisma',
      'client',
      'index.d.ts'
    );
    if (fs.existsSync(typesPath)) {
      log(`  ${checkMark()} TypeScript definitions file exists`, 'green');

      const typesContent = fs.readFileSync(typesPath, 'utf-8');
      const expectedTypes = [
        'export class PrismaClient',
        'export type User',
        'export type Role',
        'export type Permission',
        'export type Organisation',
        'export type AuditEvent',
        'export enum OrganisationType',
      ];

      let typeChecksPassed = 0;
      for (const expectedType of expectedTypes) {
        if (typesContent.includes(expectedType)) {
          typeChecksPassed++;
        }
      }

      log(
        `  ${checkMark()} ${typeChecksPassed}/${expectedTypes.length} expected type definitions found`,
        typeChecksPassed === expectedTypes.length ? 'green' : 'yellow'
      );
    } else {
      log(`  ${crossMark()} TypeScript definitions file not found`, 'red');
      allChecksPassed = false;
    }
  } catch (error) {
    log(`  ${crossMark()} Failed to check TypeScript types`, 'red');
    console.error(error);
    allChecksPassed = false;
  }

  // Summary
  log('\n=================================================', 'cyan');
  if (allChecksPassed) {
    log('  ✓ All checks passed!', 'green');
    log('  Prisma Client is ready to use.', 'green');
  } else {
    log('  ✗ Some checks failed!', 'red');
    log('  Please run: npx prisma generate', 'yellow');
  }
  log('=================================================\n', 'cyan');

  process.exit(allChecksPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Verification script failed:', error);
  process.exit(1);
});
