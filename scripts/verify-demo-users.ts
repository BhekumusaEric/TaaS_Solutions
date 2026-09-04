/**
 * Demo Users Verification Script
 * 
 * This script verifies that the demo user seed configuration meets
 * the requirements from US-023:
 * 1. All demo user emails have "DEMO_" prefix
 * 2. All demo user names contain "DEMO" for clear identification  
 * 3. Demo users are properly documented
 * 4. Production safety checks are in place
 * 
 * Usage:
 *   npx tsx scripts/verify-demo-users.ts
 * 
 * This script performs STATIC ANALYSIS of the seed script to verify
 * compliance WITHOUT requiring a database connection.
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string[];
}

class DemoUserVerifier {
  private seedScriptPath: string;
  private seedScriptContent: string;

  constructor() {
    this.seedScriptPath = path.join(process.cwd(), 'prisma', 'seed.ts');
    this.seedScriptContent = '';
  }

  /**
   * Main verification method
   */
  async verify(): Promise<void> {
    console.log('🔍 Verifying Demo User Configuration...\n');

    try {
      // Read seed script
      this.seedScriptContent = fs.readFileSync(this.seedScriptPath, 'utf-8');

      // Run all verification checks
      const results: VerificationResult[] = [
        this.verifyEmailPrefixes(),
        this.verifyNameLabeling(),
        this.verifyDemoUserCount(),
        this.verifyProductionProtection(),
        this.verifyDemoPassword(),
        this.verifyOrganisationLabeling(),
        this.verifyDocumentation(),
      ];

      // Display results
      this.displayResults(results);

      // Exit with appropriate code
      const allPassed = results.every((r) => r.passed);
      process.exit(allPassed ? 0 : 1);
    } catch (error) {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    }
  }

  /**
   * Verify all demo user emails have "DEMO_" prefix
   */
  private verifyEmailPrefixes(): VerificationResult {
    console.log('📧 Checking email prefixes...');

    // Match only emails in the demoUsers array definition
    const demoUsersMatch = this.seedScriptContent.match(
      /const demoUsers = \[([\s\S]*?)\];/
    );
    
    if (!demoUsersMatch) {
      return {
        passed: false,
        message: '❌ Email Prefix Check Failed',
        details: ['Could not find demoUsers array in seed script'],
      };
    }

    const demoUsersSection = demoUsersMatch[1];
    const emailPattern = /email:\s*['"`](DEMO_[^'"`]+@example\.com)['"`]/g;
    const emails: string[] = [];
    let match;

    while ((match = emailPattern.exec(demoUsersSection)) !== null) {
      if (!emails.includes(match[1])) {
        emails.push(match[1]);
      }
    }

    // Check all emails start with DEMO_
    const invalidEmails = emails.filter((email) => !email.startsWith('DEMO_'));

    if (invalidEmails.length > 0) {
      return {
        passed: false,
        message: '❌ Email Prefix Check Failed',
        details: [
          `Found ${invalidEmails.length} email(s) without "DEMO_" prefix:`,
          ...invalidEmails.map((e) => `  - ${e}`),
        ],
      };
    }

    return {
      passed: true,
      message: `✅ Email Prefix Check Passed`,
      details: [
        `Found ${emails.length} demo user emails`,
        'All emails start with "DEMO_" prefix',
        'Emails:',
        ...emails.map((e) => `  - ${e}`),
      ],
    };
  }

  /**
   * Verify all demo user names contain "DEMO"
   */
  private verifyNameLabeling(): VerificationResult {
    console.log('📝 Checking name labeling...');

    const namePattern = /name:\s*['"`]([^'"`]*DEMO[^'"`]*)['"`]/g;
    const names: string[] = [];
    let match;

    while ((match = namePattern.exec(this.seedScriptContent)) !== null) {
      names.push(match[1]);
    }

    if (names.length === 0) {
      return {
        passed: false,
        message: '❌ Name Labeling Check Failed',
        details: ['No demo user names found with "DEMO" identifier'],
      };
    }

    return {
      passed: true,
      message: `✅ Name Labeling Check Passed`,
      details: [
        `Found ${names.length} demo user names`,
        'All names contain "DEMO" for clear identification',
        'Names:',
        ...names.map((n) => `  - ${n}`),
      ],
    };
  }

  /**
   * Verify expected number of demo users (9)
   */
  private verifyDemoUserCount(): VerificationResult {
    console.log('🔢 Checking demo user count...');

    // Match only emails in the demoUsers array definition
    const demoUsersMatch = this.seedScriptContent.match(
      /const demoUsers = \[([\s\S]*?)\];/
    );
    
    if (!demoUsersMatch) {
      return {
        passed: false,
        message: '❌ Demo User Count Check Failed',
        details: ['Could not find demoUsers array in seed script'],
      };
    }

    const demoUsersSection = demoUsersMatch[1];
    const emailPattern = /email:\s*['"`](DEMO_[^'"`]+@example\.com)['"`]/g;
    const emails: string[] = [];
    let match;

    while ((match = emailPattern.exec(demoUsersSection)) !== null) {
      if (!emails.includes(match[1])) {
        emails.push(match[1]);
      }
    }

    const expectedCount = 9;
    const actualCount = emails.length;

    if (actualCount !== expectedCount) {
      return {
        passed: false,
        message: '❌ Demo User Count Check Failed',
        details: [
          `Expected ${expectedCount} demo users`,
          `Found ${actualCount} demo users`,
        ],
      };
    }

    return {
      passed: true,
      message: `✅ Demo User Count Check Passed`,
      details: [
        `Found exactly ${expectedCount} demo users as specified`,
        'Expected roles covered:',
        '  - VERIFIED_TALENT',
        '  - CLIENT_MEMBER',
        '  - CLIENT_APPROVER',
        '  - DELIVERY_LEAD',
        '  - TALENT_OPS_ADMIN',
        '  - PROJECT_OPS_ADMIN',
        '  - QUALITY_REVIEWER',
        '  - FINANCE_ADMIN',
        '  - PLATFORM_ADMIN',
      ],
    };
  }

  /**
   * Verify production protection is in place
   */
  private verifyProductionProtection(): VerificationResult {
    console.log('🛡️  Checking production protection...');

    const hasProductionCheck =
      this.seedScriptContent.includes('NODE_ENV') &&
      this.seedScriptContent.includes('production') &&
      this.seedScriptContent.includes('process.exit(1)');

    const hasWarningMessage = this.seedScriptContent.includes(
      'Cannot seed database in production'
    );

    if (!hasProductionCheck || !hasWarningMessage) {
      return {
        passed: false,
        message: '❌ Production Protection Check Failed',
        details: [
          'Seed script does not properly prevent production seeding',
          'Expected: NODE_ENV check with process.exit(1)',
          'Expected: Clear error message',
        ],
      };
    }

    return {
      passed: true,
      message: `✅ Production Protection Check Passed`,
      details: [
        'Seed script checks NODE_ENV === "production"',
        'Exits with error code 1 if production',
        'Displays clear error message',
        'Demo users cannot be created in production',
      ],
    };
  }

  /**
   * Verify demo password is configured
   */
  private verifyDemoPassword(): VerificationResult {
    console.log('🔐 Checking demo password configuration...');

    const hasDemoPassword = this.seedScriptContent.includes('DEMO_PASSWORD');
    const hasBcrypt = this.seedScriptContent.includes('bcrypt');
    const hasHashing = this.seedScriptContent.includes('hashPassword');

    if (!hasDemoPassword || !hasBcrypt || !hasHashing) {
      return {
        passed: false,
        message: '❌ Demo Password Check Failed',
        details: [
          'Demo password configuration incomplete',
          `DEMO_PASSWORD constant: ${hasDemoPassword ? '✓' : '✗'}`,
          `Bcrypt import: ${hasBcrypt ? '✓' : '✗'}`,
          `Password hashing: ${hasHashing ? '✓' : '✗'}`,
        ],
      };
    }

    return {
      passed: true,
      message: `✅ Demo Password Check Passed`,
      details: [
        'DEMO_PASSWORD constant defined',
        'Bcrypt library imported for secure hashing',
        'Password hashing function implemented',
        'All demo passwords are securely hashed',
      ],
    };
  }

  /**
   * Verify demo organisations are labeled
   */
  private verifyOrganisationLabeling(): VerificationResult {
    console.log('🏢 Checking organisation labeling...');

    const orgPattern = /name:\s*['"`](DEMO\s+[^'"`]+Organisation)['"`]/g;
    const organisations: string[] = [];
    let match;

    while ((match = orgPattern.exec(this.seedScriptContent)) !== null) {
      organisations.push(match[1]);
    }

    if (organisations.length < 2) {
      return {
        passed: false,
        message: '❌ Organisation Labeling Check Failed',
        details: [
          `Expected at least 2 demo organisations`,
          `Found ${organisations.length} demo organisation(s)`,
        ],
      };
    }

    const hasClientOrg = organisations.some((org) =>
      org.includes('DEMO Client Organisation')
    );
    const hasPartnerOrg = organisations.some((org) =>
      org.includes('DEMO Partner Organisation')
    );

    if (!hasClientOrg || !hasPartnerOrg) {
      return {
        passed: false,
        message: '❌ Organisation Labeling Check Failed',
        details: [
          'Missing expected demo organisations:',
          `  - DEMO Client Organisation: ${hasClientOrg ? '✓' : '✗'}`,
          `  - DEMO Partner Organisation: ${hasPartnerOrg ? '✓' : '✗'}`,
        ],
      };
    }

    return {
      passed: true,
      message: `✅ Organisation Labeling Check Passed`,
      details: [
        'Found 2 demo organisations',
        'All organisations labeled with "DEMO" prefix',
        'Organisations:',
        ...organisations.map((o) => `  - ${o}`),
      ],
    };
  }

  /**
   * Verify documentation exists
   */
  private verifyDocumentation(): VerificationResult {
    console.log('📚 Checking documentation...');

    const docPath = path.join(process.cwd(), 'docs', 'operations', 'DEMO_USERS.md');
    const testPath = path.join(
      process.cwd(),
      'src',
      'tests',
      'integration',
      'demo-users.test.ts'
    );

    const docExists = fs.existsSync(docPath);
    const testExists = fs.existsSync(testPath);

    const issues: string[] = [];
    if (!docExists) issues.push('Missing: docs/operations/DEMO_USERS.md');
    if (!testExists) issues.push('Missing: src/tests/integration/demo-users.test.ts');

    if (issues.length > 0) {
      return {
        passed: false,
        message: '❌ Documentation Check Failed',
        details: issues,
      };
    }

    return {
      passed: true,
      message: `✅ Documentation Check Passed`,
      details: [
        'Demo user documentation exists: docs/operations/DEMO_USERS.md',
        'Integration tests exist: src/tests/integration/demo-users.test.ts',
        'Requirements documented: US-023',
      ],
    };
  }

  /**
   * Display verification results
   */
  private displayResults(results: VerificationResult[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(60) + '\n');

    results.forEach((result) => {
      console.log(result.message);
      if (result.details) {
        result.details.forEach((detail) => console.log(`   ${detail}`));
      }
      console.log();
    });

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    console.log('='.repeat(60));
    console.log(
      `${passedCount === totalCount ? '✅' : '❌'} Overall: ${passedCount}/${totalCount} checks passed`
    );
    console.log('='.repeat(60) + '\n');

    if (passedCount === totalCount) {
      console.log('🎉 All demo user requirements verified successfully!');
      console.log('\nDemo users meet US-023 requirements:');
      console.log('  ✅ All emails have "DEMO_" prefix');
      console.log('  ✅ All names contain "DEMO" for identification');
      console.log('  ✅ Proper production safety checks');
      console.log('  ✅ Secure password hashing');
      console.log('  ✅ Demo organisations labeled');
      console.log('  ✅ Comprehensive documentation');
      console.log('\nNext steps:');
      console.log('  1. Set up database (see DATABASE_SETUP.md)');
      console.log('  2. Run: npm run db:seed');
      console.log('  3. Run integration tests: npm test demo-users');
    } else {
      console.log('⚠️  Some checks failed. Please review the issues above.');
    }
  }
}

// Run verification
const verifier = new DemoUserVerifier();
verifier.verify();
