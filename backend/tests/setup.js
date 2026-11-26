// Enforce isolated test database BEFORE any app/prisma module is imported
const testDbUrl =
  process.env.DATABASE_URL_TEST ||
  'mysql://root:@127.0.0.1:3306/njs_db_test';

const dbNameMatch = testDbUrl.match(/\/([^/?]+)(?:\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : '';

if (!dbName || !dbName.toLowerCase().includes('test')) {
  throw new Error(
    `[TEST DB GUARD] Refusing to run tests against non-test database "${dbName}". Database name must contain "test".`
  );
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDbUrl;
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'njs_test_secret_key_for_vitest_only_12345';
process.env.RESEND_API_KEY = '';
process.env.STRIPE_SECRET_KEY = '';
process.env.ENABLE_BOOKING_REMINDER_JOB = 'false';
