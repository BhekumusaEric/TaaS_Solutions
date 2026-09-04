/**
 * Test Configuration for Seed Tests
 * 
 * This file sets up the test environment to work with the database.
 * It loads environment variables before running tests.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('');
  console.error('To run seed tests, you need a database connection.');
  console.error('');
  console.error('Steps to fix:');
  console.error('1. Copy .env.example to .env.local');
  console.error('2. Set DATABASE_URL to your PostgreSQL connection string');
  console.error('3. Run: npm run prisma:migrate');
  console.error('4. Run: npm run prisma:seed');
  console.error('5. Then run the tests again');
  console.error('');
  process.exit(1);
}

export {};
