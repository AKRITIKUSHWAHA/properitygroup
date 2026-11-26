import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL || '';

// Security check: ONLY allow running on local databases (127.0.0.1 or localhost)
function isLocalDatabase(url) {
  if (!url) return false;
  try {
    // MySQL URL format: mysql://user:pass@host:port/dbname
    const parsed = new URL(url.replace(/^mysql:/i, 'http:'));
    const host = (parsed.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    const lower = url.toLowerCase();
    return lower.includes('localhost') || lower.includes('127.0.0.1');
  }
}

if (!isLocalDatabase(databaseUrl)) {
  const maskedUrl = databaseUrl.replace(/:([^@/:]+)@/, ':****@');
  console.error(`\n❌ [SAFETY ABORT] Refusing to run clean_test_data on non-local database!`);
  console.error(`   DATABASE_URL target: ${maskedUrl || '(not set)'}`);
  console.error(`   This script is restricted to local developer environments (127.0.0.1 or localhost) only.\n`);
  process.exit(1);
}

const prisma = new PrismaClient();
const isConfirm = process.argv.includes('--confirm');

// Test data patterns that should be targeted for cleanup
const TEST_PATTERNS = {
  names: ['akku', 'test user', 'dummy', 'fake user', 'phantom'],
  emails: ['akku', 'test@', 'dummy@', 'fake@'],
  addresses: ['mp nagar', 'plot no 45', 'bhopal', 'dummy street', 'test road'],
  references: ['JOB-2026-101', 'TEST-', 'DUMMY-'],
};

function matchesAny(str, patterns) {
  if (!str) return false;
  const s = String(str).toLowerCase().trim();
  return patterns.some((p) => s.includes(p.toLowerCase()));
}

async function findTestRecords() {
  // Fetch candidate test leads
  const allLeads = await prisma.lead.findMany({
    select: {
      id: true,
      reference: true,
      clientName: true,
      clientEmail: true,
      propertyAddress: true,
      createdAt: true,
    },
  });

  const testLeads = allLeads.filter((l) =>
    matchesAny(l.clientName, TEST_PATTERNS.names) ||
    matchesAny(l.clientEmail, TEST_PATTERNS.emails) ||
    matchesAny(l.propertyAddress, TEST_PATTERNS.addresses) ||
    matchesAny(l.reference, TEST_PATTERNS.references)
  );

  // Fetch candidate test jobs
  const allJobs = await prisma.job.findMany({
    select: {
      id: true,
      reference: true,
      clientName: true,
      clientEmail: true,
      propertyAddress: true,
      createdAt: true,
    },
  });

  const testJobs = allJobs.filter((j) =>
    matchesAny(j.clientName, TEST_PATTERNS.names) ||
    matchesAny(j.clientEmail, TEST_PATTERNS.emails) ||
    matchesAny(j.propertyAddress, TEST_PATTERNS.addresses) ||
    matchesAny(j.reference, TEST_PATTERNS.references)
  );

  const testJobIds = testJobs.map((j) => j.id);

  // Quotes linked to test jobs
  const testQuotes = await prisma.quote.findMany({
    where: {
      OR: [
        { jobId: { in: testJobIds } },
        { reference: { startsWith: 'TEST-' } },
      ],
    },
    select: { id: true, reference: true, jobId: true, totalAmount: true },
  });

  // Terms linked to test jobs
  const testTerms = await prisma.term.findMany({
    where: {
      jobId: { in: testJobIds },
    },
    select: { id: true, jobId: true, clientName: true, signed: true },
  });

  // Invoices linked to test jobs
  const testInvoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { jobId: { in: testJobIds } },
        { invoiceNumber: { startsWith: 'INV-TEST' } },
      ],
    },
    select: { id: true, invoiceNumber: true, jobId: true, total: true, status: true },
  });

  // Test users (protecting seed demo accounts like admin@demo.com, customer@demo.com)
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  const testUsers = allUsers.filter((u) => {
    // Preserve core seed accounts
    const email = (u.email || '').toLowerCase().trim();
    if (['admin@demo.com', 'customer@demo.com', 'surveyor@demo.com', 'alexander@njspropertygroup.com'].includes(email)) {
      return false;
    }
    return (
      matchesAny(u.name, TEST_PATTERNS.names) ||
      matchesAny(u.email, ['akku', 'test-phantom', 'dummy@', 'fake@'])
    );
  });

  return { testLeads, testJobs, testQuotes, testTerms, testInvoices, testUsers };
}

async function main() {
  console.log(`\n============================================================`);
  console.log(`🧹 NJS Database Test Data Cleaner`);
  console.log(`   Host verified: LOCAL (127.0.0.1 / localhost)`);
  console.log(`   Mode: ${isConfirm ? '🚨 LIVE DELETION (--confirm)' : '🔍 DRY RUN (Preview only)'}`);
  console.log(`============================================================\n`);

  const { testLeads, testJobs, testQuotes, testTerms, testInvoices, testUsers } = await findTestRecords();

  const totalCount =
    testLeads.length +
    testJobs.length +
    testQuotes.length +
    testTerms.length +
    testInvoices.length +
    testUsers.length;

  console.log(`Found test records:`);
  console.log(` - Leads:    ${testLeads.length}`);
  console.log(` - Jobs:     ${testJobs.length}`);
  console.log(` - Quotes:   ${testQuotes.length}`);
  console.log(` - Terms:    ${testTerms.length}`);
  console.log(` - Invoices: ${testInvoices.length}`);
  console.log(` - Users:    ${testUsers.length}`);
  console.log(`Total test records found: ${totalCount}\n`);

  if (testLeads.length > 0) {
    console.log(`--- [Leads to Clean] ---`);
    console.table(
      testLeads.map((l) => ({
        ID: l.id,
        Reference: l.reference,
        Name: l.clientName,
        Email: l.clientEmail,
        Address: l.propertyAddress,
      }))
    );
  }

  if (testJobs.length > 0) {
    console.log(`--- [Jobs to Clean] ---`);
    console.table(
      testJobs.map((j) => ({
        ID: j.id,
        Reference: j.reference,
        Client: j.clientName,
        Email: j.clientEmail,
        Address: j.propertyAddress,
      }))
    );
  }

  if (testUsers.length > 0) {
    console.log(`--- [Users to Clean] ---`);
    console.table(
      testUsers.map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
      }))
    );
  }

  if (totalCount === 0) {
    console.log(`✨ Database is already clean! No test records matching test patterns were found.\n`);
    return;
  }

  if (!isConfirm) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`[DRY-RUN COMPLETE] Found ${totalCount} records.`);
    console.log(`No records were deleted.`);
    console.log(`To delete these records, run:`);
    console.log(`  node backend/prisma/clean_test_data.js --confirm`);
    console.log(`------------------------------------------------------------\n`);
    return;
  }

  console.log(`\n⚡ Performing safe deletion in foreign key order...`);
  const jobIds = testJobs.map((j) => j.id);
  const leadIds = testLeads.map((l) => l.id);
  const userIds = testUsers.map((u) => u.id);

  if (jobIds.length > 0) {
    await prisma.invoice.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.term.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.quote.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.message.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.supportTicket.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.customerReview.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.job.deleteMany({ where: { id: { in: jobIds } } });
  }

  if (leadIds.length > 0) {
    await prisma.quote.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
  }

  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  console.log(`✅ Successfully deleted ${totalCount} test records from local database.\n`);
}

main()
  .catch((e) => {
    console.error('Error executing clean_test_data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
