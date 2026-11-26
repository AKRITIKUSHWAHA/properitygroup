/**
 * fix_data.js  —  Local DB data-cleanup script  (ESM)
 *
 * Fixes:
 *  1. Duplicate active quotes on same lead → oldest ones → SUPERSEDED
 *  2. Extra invoices per job → extras → CANCELLED (keep PAID one, else latest)
 *  3. Extra terms per job → extras → flagged (keep signed one, else latest)
 *  4. Orphan quotes (leadId & jobId both NULL) → SUPERSEDED
 *  5. Jobs whose leadId is NULL but lead exists by email+address → leadId linked
 *
 * Safety:
 *  - LOCAL DB guard: refuses to run if DATABASE_URL is not 127.0.0.1 / localhost
 *  - DEFAULT: dry-run (prints what would change, nothing written)
 *  - Pass --confirm to execute changes
 *  - Nothing is hard-deleted; status changes only (SUPERSEDED / CANCELLED)
 *
 * Usage:
 *   node backend/prisma/fix_data.js              # dry-run
 *   node backend/prisma/fix_data.js --confirm    # execute
 */

import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load .env from backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^["']|["']$/g, '');
  }
}

// ── Safety guard ────────────────────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL || '';
const isLocal = /127\.0\.0\.1|localhost/.test(dbUrl);
const prisma  = new PrismaClient();

if (!isLocal) {
  console.error('\n❌  SAFETY ABORT: DATABASE_URL does not point to localhost / 127.0.0.1.');
  console.error('   This script must only run against a local DB.\n');
  process.exit(1);
}

const DRY_RUN = !process.argv.includes('--confirm');

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg)        { console.log(msg); }
function section(title)  { console.log(`\n${'─'.repeat(60)}\n  ${title}\n${'─'.repeat(60)}`); }

async function applyUpdate(description, fn) {
  if (DRY_RUN) {
    log(`  [DRY-RUN] Would: ${description}`);
    return null;
  }
  const result = await fn();
  log(`  [DONE]    ${description}`);
  return result;
}

// ── Fix 1: Duplicate ACTIVE quotes on the same lead ──────────────────────────

async function fixDuplicateLeadQuotes() {
  section('1. Duplicate SENT/DRAFT quotes per lead');

  const leads = await prisma.lead.findMany({
    include: {
      quotes: {
        where: { status: { in: ['SENT', 'DRAFT'] } },
        orderBy: { id: 'desc' },
      },
    },
  });

  let affected = 0;
  for (const lead of leads) {
    if (lead.quotes.length <= 1) continue;

    // Keep the newest (highest id); supersede the rest
    const [keep, ...supersede] = lead.quotes; // already sorted desc
    log(`  Lead ${lead.reference} (id=${lead.id}): ${lead.quotes.length} active quotes`);
    log(`    Keep  : ${keep.reference} (${keep.status}) — totalAmount £${keep.totalAmount}`);
    for (const q of supersede) {
      log(`    Supersede: ${q.reference} (${q.status}) — totalAmount £${q.totalAmount}`);
      await applyUpdate(
        `Quote ${q.reference} → SUPERSEDED`,
        () => prisma.quote.update({ where: { id: q.id }, data: { status: 'SUPERSEDED' } }),
      );
      affected++;
    }
  }

  if (affected === 0) log('  ✓ No duplicate lead-quotes found.');
  else log(`  Total quotes superseded: ${affected}`);
}

// ── Fix 2: Duplicate ACTIVE quotes on the same job ───────────────────────────

async function fixDuplicateJobQuotes() {
  section('2. Duplicate SENT/DRAFT quotes per job');

  const jobs = await prisma.job.findMany({
    include: {
      quotes: {
        where: { status: { in: ['SENT', 'DRAFT'] } },
        orderBy: { id: 'desc' },
      },
    },
  });

  let affected = 0;
  for (const job of jobs) {
    if (job.quotes.length <= 1) continue;

    const [keep, ...supersede] = job.quotes;
    log(`  Job ${job.reference} (id=${job.id}): ${job.quotes.length} active quotes`);
    log(`    Keep  : ${keep.reference} (${keep.status}) — £${keep.totalAmount}`);
    for (const q of supersede) {
      log(`    Supersede: ${q.reference} (${q.status}) — £${q.totalAmount}`);
      await applyUpdate(
        `Quote ${q.reference} → SUPERSEDED`,
        () => prisma.quote.update({ where: { id: q.id }, data: { status: 'SUPERSEDED' } }),
      );
      affected++;
    }
  }

  if (affected === 0) log('  ✓ No duplicate job-quotes found.');
  else log(`  Total quotes superseded: ${affected}`);
}

// ── Fix 3: Duplicate invoices per job ────────────────────────────────────────

async function fixDuplicateInvoices() {
  section('3. Duplicate invoices per job');

  const jobs = await prisma.job.findMany({
    include: {
      invoices: { orderBy: { id: 'desc' } },
    },
  });

  let affected = 0;
  for (const job of jobs) {
    if (job.invoices.length <= 1) continue;

    // Priority: keep PAID one; if none PAID, keep highest id
    const paidInv = job.invoices.find((i) => i.status === 'PAID');
    const keep    = paidInv || job.invoices[0];
    const cancel  = job.invoices.filter((i) => i.id !== keep.id && i.status !== 'CANCELLED');

    log(`  Job ${job.reference} (id=${job.id}): ${job.invoices.length} invoices`);
    log(`    Keep  : ${keep.invoiceNumber} (${keep.status}) — £${keep.total}`);
    for (const inv of cancel) {
      log(`    Cancel: ${inv.invoiceNumber} (${inv.status}) — £${inv.total}`);
      await applyUpdate(
        `Invoice ${inv.invoiceNumber} → CANCELLED`,
        () => prisma.invoice.update({ where: { id: inv.id }, data: { status: 'CANCELLED' } }),
      );
      affected++;
    }
  }

  if (affected === 0) log('  ✓ No duplicate invoices found.');
  else log(`  Total invoices cancelled: ${affected}`);
}

// ── Fix 4: Duplicate terms per job ───────────────────────────────────────────

async function fixDuplicateTerms() {
  section('4. Duplicate terms per job');

  const jobs = await prisma.job.findMany({
    include: {
      terms: { orderBy: { id: 'desc' } },
    },
  });

  let affected = 0;
  for (const job of jobs) {
    if (job.terms.length <= 1) continue;

    // Keep signed one if exists; else newest
    const signedTerm = job.terms.find((t) => t.signed === true);
    const keep       = signedTerm || job.terms[0];
    const extras     = job.terms.filter((t) => t.id !== keep.id);

    log(`  Job ${job.reference} (id=${job.id}): ${job.terms.length} terms`);
    log(`    Keep  : ${keep.reference} (signed=${keep.signed})`);
    for (const term of extras) {
      log(`    Flag extra (not deleted): ${term.reference} (signed=${term.signed})`);
      // Terms have no status enum — we soft-flag in documentTitle
      await applyUpdate(
        `Term ${term.reference} → title prefixed [SUPERSEDED]`,
        () => prisma.term.update({
          where: { id: term.id },
          data: { documentTitle: `[SUPERSEDED] ${term.documentTitle}` },
        }),
      );
      affected++;
    }
  }

  if (affected === 0) log('  ✓ No duplicate terms found.');
  else log(`  Total extra terms flagged: ${affected}`);
}

// ── Fix 5: Orphan quotes (leadId=NULL, jobId=NULL) ───────────────────────────

async function fixOrphanQuotes() {
  section('5. Orphan quotes (leadId=NULL, jobId=NULL)');

  const orphans = await prisma.quote.findMany({
    where: { leadId: null, jobId: null },
  });

  if (orphans.length === 0) {
    log('  ✓ No orphan quotes found.');
    return;
  }

  log(`  Found ${orphans.length} orphan quote(s).`);
  log('  (Cannot auto-link without email context — marking SUPERSEDED)\n');

  for (const q of orphans) {
    log(`  Orphan: ${q.reference} (${q.status}) — £${q.totalAmount} — created ${q.createdAt.toISOString()}`);
    await applyUpdate(
      `Quote ${q.reference} (orphan) → SUPERSEDED`,
      () => prisma.quote.update({ where: { id: q.id }, data: { status: 'SUPERSEDED' } }),
    );
  }
}

// ── Fix 6: Jobs with NULL leadId where a matching lead exists ────────────────

async function fixJobLeadLinks() {
  section('6. Jobs missing leadId (but matching lead exists by email+address)');

  const unlinkedJobs = await prisma.job.findMany({
    where: { leadId: null },
    select: { id: true, reference: true, clientEmail: true, propertyAddress: true },
  });

  let linked = 0;
  for (const job of unlinkedJobs) {
    const matchedLead = await prisma.lead.findFirst({
      where: {
        clientEmail:     { equals: job.clientEmail,     mode: 'insensitive' },
        propertyAddress: { equals: job.propertyAddress, mode: 'insensitive' },
      },
    });

    if (!matchedLead) {
      log(`  Job ${job.reference}: no matching lead found (skipped)`);
      continue;
    }

    log(`  Job ${job.reference} → Lead ${matchedLead.reference} (id=${matchedLead.id})`);
    await applyUpdate(
      `Job ${job.reference}: set leadId = ${matchedLead.id}`,
      () => prisma.job.update({ where: { id: job.id }, data: { leadId: matchedLead.id } }),
    );
    linked++;
  }

  if (linked === 0 && unlinkedJobs.length === 0) log('  ✓ All jobs have a leadId.');
  else if (linked === 0) log(`  ${unlinkedJobs.length} unlinked job(s) — no matchable leads found.`);
  else log(`  Linked ${linked} job(s) to leads.`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║  NJS PropertyGroup — Data Fix Script                  ║`);
  console.log(`║  Mode: ${DRY_RUN ? 'DRY-RUN (pass --confirm to apply)    ' : 'LIVE — changes WILL be written to DB'}  ║`);
  console.log(`║  DB  : ${dbUrl.split('@').pop()?.split('/')[0] || 'local'}${'                                        '.slice(0, 48 - (dbUrl.split('@').pop()?.split('/')[0] || 'local').length)}║`);
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    await fixDuplicateLeadQuotes();
    await fixDuplicateJobQuotes();
    await fixDuplicateInvoices();
    await fixDuplicateTerms();
    await fixOrphanQuotes();
    await fixJobLeadLinks();

    console.log('\n════════════════════════════════════════════════════════');
    if (DRY_RUN) {
      console.log('  DRY-RUN complete. Run with --confirm to apply changes.');
    } else {
      console.log('  ✅  All fixes applied successfully.');
    }
    console.log('════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌  Script failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
