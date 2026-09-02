/**
 * Database Connection Test Script
 *
 * This script tests the database connection configuration.
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { db } from '../src/lib/db';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test connection
    await db.$connect();
    console.log('✅ Database connection successful!');
    console.log('📊 Connection Details:');
    console.log('   - Provider: PostgreSQL');
    console.log('   - Using DATABASE_URL from environment\n');

    // Try a simple query to verify database is accessible
    const result = await db.$queryRaw`SELECT version() as version`;
    console.log('✅ Database query successful!');
    console.log('📋 PostgreSQL Version:', (result as any)[0].version);

    console.log('\n✨ All database connectivity checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error);
    console.log('\n📝 Troubleshooting Steps:');
    console.log('   1. Check that PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env.local is correct');
    console.log('   3. Ensure database exists: createdb taas_dev');
    console.log('   4. Check firewall/network access to database');
    console.log('   5. Verify database credentials are correct');
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

testConnection();
