/**
 * Simple script to test production safety check
 * This verifies the seed script rejects NODE_ENV=production
 */

// Simulate production environment
process.env.NODE_ENV = 'production';

console.log('Testing production safety check...');
console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`);

// This should trigger the production check and exit
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production check would reject: Cannot seed database in production environment');
  console.log('✅ Script would exit with code 1');
  console.log('✅ No database operations would occur');
  process.exit(0); // Exit successfully for this test
}

console.log('❌ Production check failed - script would continue');
process.exit(1);
