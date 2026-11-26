import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL || '';

// Security check: only local DB allowed
function isLocalDatabase(url) {
  if (!url) return false;
  try {
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
  console.error(`\n❌ [SAFETY ABORT] Refusing to run migrate_job_stages on non-local database!`);
  console.error(`   DATABASE_URL target: ${maskedUrl || '(not set)'}`);
  console.error(`   This script is restricted to local developer environments (127.0.0.1 / localhost) only.\n`);
  process.exit(1);
}

const prisma = new PrismaClient();
const isConfirm = process.argv.includes('--confirm');

export const STAGE_MAPPING = {
  QUOTE: 'QUOTE_ISSUED',
  QUOTED: 'QUOTE_ISSUED',
  ACCEPTED: 'QUOTE_ACCEPTED',
  SIGNED: 'TERMS_SIGNED',
  PREPARING_REPORT: 'DRAFTING',
  COMPLETED: 'COMPLETE',
  DELIVERED: 'COMPLETE',
};

async function main() {
  console.log(`\n============================================================`);
  console.log(`🔄 NJS 10-Stage Job Lifecycle Data Migration`);
  console.log(`   Host verified: LOCAL (127.0.0.1 / localhost)`);
  console.log(`   Mode: ${isConfirm ? '🚨 LIVE MIGRATION (--confirm)' : '🔍 DRY RUN (Preview only)'}`);
  console.log(`============================================================\n`);

  // Query raw jobs from database
  const jobs = await prisma.$queryRawUnsafe(`
    SELECT id, reference, stage, clientName, clientEmail, createdAt FROM jobs
  `);

  const jobsToMigrate = [];
  for (const j of jobs) {
    const current = String(j.stage || '').trim();
    const mapped = STAGE_MAPPING[current];
    if (mapped && mapped !== current) {
      jobsToMigrate.push({
        id: j.id,
        reference: j.reference,
        clientName: j.clientName,
        currentStage: current,
        targetStage: mapped,
      });
    }
  }

  console.log(`Total jobs in database: ${jobs.length}`);
  console.log(`Jobs requiring stage migration: ${jobsToMigrate.length}\n`);

  if (jobsToMigrate.length > 0) {
    console.log(`--- [Jobs to be Migrated] ---`);
    console.table(jobsToMigrate);
  }

  if (!isConfirm) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`[DRY-RUN COMPLETE] Found ${jobsToMigrate.length} jobs to migrate.`);
    console.log(`No database changes were made.`);
    console.log(`To apply this migration to your local database, run:`);
    console.log(`  node backend/prisma/migrate_job_stages.js --confirm`);
    console.log(`------------------------------------------------------------\n`);
    return;
  }

  console.log(`⚡ Updating MySQL schema and executing data migration...`);

  // 1. Temporarily widen column to VARCHAR(64) to allow new values
  await prisma.$executeRawUnsafe(`
    ALTER TABLE jobs MODIFY COLUMN stage VARCHAR(64) NOT NULL DEFAULT 'QUOTE_ISSUED'
  `);

  // 2. Perform updates
  await prisma.$executeRawUnsafe(`UPDATE jobs SET stage = 'QUOTE_ISSUED' WHERE stage = 'QUOTE' OR stage = 'QUOTED'`);
  await prisma.$executeRawUnsafe(`UPDATE jobs SET stage = 'QUOTE_ACCEPTED' WHERE stage = 'ACCEPTED'`);
  await prisma.$executeRawUnsafe(`UPDATE jobs SET stage = 'TERMS_SIGNED' WHERE stage = 'SIGNED'`);
  await prisma.$executeRawUnsafe(`UPDATE jobs SET stage = 'DRAFTING' WHERE stage = 'PREPARING_REPORT'`);
  await prisma.$executeRawUnsafe(`UPDATE jobs SET stage = 'COMPLETE' WHERE stage = 'COMPLETED' OR stage = 'DELIVERED'`);

  // 3. Narrow column to strict 10-stage ENUM
  await prisma.$executeRawUnsafe(`
    ALTER TABLE jobs MODIFY COLUMN stage ENUM(
      'ENQUIRY',
      'QUOTE_ISSUED',
      'QUOTE_ACCEPTED',
      'TERMS_SIGNED',
      'PAID',
      'BOOKED',
      'INSPECTED',
      'DRAFTING',
      'QA_REVIEW',
      'COMPLETE'
    ) NOT NULL DEFAULT 'QUOTE_ISSUED'
  `);

  // 4. Create AuditLog entries for migrated jobs
  for (const j of jobsToMigrate) {
    try {
      await prisma.auditLog.create({
        data: {
          jobId: j.id,
          action: `STAGE_MIGRATION_${j.currentStage}_TO_${j.targetStage}`,
          details: `System 10-Stage Data Migration: stage upgraded from ${j.currentStage} to ${j.targetStage}`,
        },
      });
    } catch (auditErr) {
      console.warn(`[AuditLog Warning] Could not record migration log for job ${j.id}:`, auditErr.message);
    }
  }

  console.log(`\n✅ Migration successful! ${jobsToMigrate.length} job(s) migrated to 10-stage enum.\n`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
