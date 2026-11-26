-- ============================================================
-- Migration: 20261125_add_constraints_and_indexes
-- Purpose:
--   1. Add unique index on invoices.jobId WHERE status != 'CANCELLED'
--      NOTE: MySQL does not support partial (filtered) unique indexes.
--      A plain UNIQUE on jobId would block CANCELLED duplicates which is wrong.
--      DECISION: Use app-level guard only (see notes below).
--      We DO add a plain non-unique composite index for query performance.
--   2. Add index on quotes(leadId, status) for fast active-quote lookups.
--   3. Add index on quotes(jobId, status) for fast active-quote lookups.
--
-- WHY CERTAIN CONSTRAINTS ARE APP-LAYER ONLY (not DB-level):
--
--   Invoice.jobId UNIQUE → CANNOT be DB-level because:
--     • A job legitimately has one PAID invoice and potentially CANCELLED duplicates.
--     • MySQL has no partial/filtered unique indexes.
--     • Adding UNIQUE(jobId) would prevent storing any CANCELLED extras.
--     SOLUTION: quoteService, customerQuotationsController, crmAndLeadsController
--     all call tx.invoice.findFirst({ where: { jobId } }) and skip create if
--     one already exists (PENDING or PAID).
--
--   Term.jobId UNIQUE → CANNOT be DB-level because:
--     • fix_data.js soft-flags duplicates by prefixing documentTitle '[SUPERSEDED]'.
--     • A partial unique index on (jobId WHERE documentTitle NOT LIKE '[SUPERSEDED]%')
--       is not expressible in Prisma DSL and MySQL enforces it differently.
--     SOLUTION: termsAndDocumentsController and customerTermsToSignController check
--     for an existing active term (non-superseded) before creating a new one.
--
--   Quote: "one active quote per lead" → CANNOT be DB-level because:
--     • Multiple quotes can exist in EXPIRED/SUPERSEDED/DECLINED state.
--     • Only SENT+DRAFT should be unique per lead/job.
--     • No partial unique supported in MySQL.
--     SOLUTION: quoteService.issueQuote() runs inside prisma.$transaction and
--     supersedes all DRAFT/SENT quotes before inserting the new one — atomically.
-- ============================================================

-- Index: fast lookup of active quotes per lead
CREATE INDEX IF NOT EXISTS `idx_quotes_leadId_status`
  ON `quotes` (`leadId`, `status`);

-- Index: fast lookup of active quotes per job
CREATE INDEX IF NOT EXISTS `idx_quotes_jobId_status`
  ON `quotes` (`jobId`, `status`);

-- Index: fast lookup of non-cancelled invoices per job
CREATE INDEX IF NOT EXISTS `idx_invoices_jobId_status`
  ON `invoices` (`jobId`, `status`);

-- Index: fast lookup of active (non-superseded) terms per job
CREATE INDEX IF NOT EXISTS `idx_terms_jobId_documentTitle`
  ON `terms` (`jobId`, `documentTitle`(64));

-- Index: lead lookup by email (for ensureCustomerUser and orphan detection)
CREATE INDEX IF NOT EXISTS `idx_leads_clientEmail`
  ON `leads` (`clientEmail`);

-- Index: job lookup by email (for customer isolation)
CREATE INDEX IF NOT EXISTS `idx_jobs_clientEmail`
  ON `jobs` (`clientEmail`);
