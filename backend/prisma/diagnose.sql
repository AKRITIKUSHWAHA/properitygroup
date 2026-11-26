-- ============================================================
-- diagnose.sql  — READ-ONLY diagnostics for NJS PropertyGroup DB
-- Run against LOCAL DB only (njs_db on 127.0.0.1:3306)
-- Every statement is a plain SELECT — nothing is modified.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. LEADS with more than 1 active quote (SENT / DRAFT)
-- ─────────────────────────────────────────────────────────────
SELECT
    l.id              AS lead_id,
    l.reference       AS lead_ref,
    l.clientEmail,
    l.status          AS lead_status,
    COUNT(q.id)       AS active_quote_count,
    GROUP_CONCAT(q.reference ORDER BY q.id SEPARATOR ', ')  AS quote_refs,
    GROUP_CONCAT(q.status    ORDER BY q.id SEPARATOR ', ')  AS quote_statuses,
    GROUP_CONCAT(q.totalAmount ORDER BY q.id SEPARATOR ', ') AS quote_amounts
FROM leads l
JOIN quotes q ON q.leadId = l.id
WHERE q.status IN ('SENT', 'DRAFT')
GROUP BY l.id
HAVING COUNT(q.id) > 1
ORDER BY active_quote_count DESC;

-- ─────────────────────────────────────────────────────────────
-- 2. JOBS with more than 1 invoice (any status)
-- ─────────────────────────────────────────────────────────────
SELECT
    j.id               AS job_id,
    j.reference        AS job_ref,
    j.clientEmail,
    j.stage,
    COUNT(i.id)        AS invoice_count,
    GROUP_CONCAT(i.invoiceNumber ORDER BY i.id SEPARATOR ', ')  AS invoice_numbers,
    GROUP_CONCAT(i.status        ORDER BY i.id SEPARATOR ', ')  AS invoice_statuses,
    GROUP_CONCAT(i.total         ORDER BY i.id SEPARATOR ', ')  AS invoice_totals
FROM jobs j
JOIN invoices i ON i.jobId = j.id
GROUP BY j.id
HAVING COUNT(i.id) > 1
ORDER BY invoice_count DESC;

-- ─────────────────────────────────────────────────────────────
-- 3. JOBS with more than 1 term record
-- ─────────────────────────────────────────────────────────────
SELECT
    j.id              AS job_id,
    j.reference       AS job_ref,
    j.clientEmail,
    COUNT(t.id)       AS term_count,
    GROUP_CONCAT(t.reference ORDER BY t.id SEPARATOR ', ')  AS term_refs,
    GROUP_CONCAT(t.signed    ORDER BY t.id SEPARATOR ', ')  AS term_signed_flags,
    GROUP_CONCAT(t.signedAt  ORDER BY t.id SEPARATOR ', ')  AS term_signed_dates
FROM jobs j
JOIN terms t ON t.jobId = j.id
GROUP BY j.id
HAVING COUNT(t.id) > 1
ORDER BY term_count DESC;

-- ─────────────────────────────────────────────────────────────
-- 4. ORPHAN QUOTES — both leadId and jobId are NULL
-- ─────────────────────────────────────────────────────────────
SELECT
    q.id,
    q.reference,
    q.status,
    q.totalAmount,
    q.createdAt
FROM quotes q
WHERE q.leadId IS NULL AND q.jobId IS NULL
ORDER BY q.createdAt DESC;

-- ─────────────────────────────────────────────────────────────
-- 5. JOBS whose leadId is NULL but a lead with same email+address exists
-- ─────────────────────────────────────────────────────────────
SELECT
    j.id              AS job_id,
    j.reference       AS job_ref,
    j.clientEmail,
    j.propertyAddress AS job_address,
    j.stage,
    l.id              AS matched_lead_id,
    l.reference       AS matched_lead_ref,
    l.status          AS lead_status
FROM jobs j
JOIN leads l
    ON  LOWER(l.clientEmail)     = LOWER(j.clientEmail)
    AND LOWER(l.propertyAddress) = LOWER(j.propertyAddress)
WHERE j.leadId IS NULL
ORDER BY j.id;

-- ─────────────────────────────────────────────────────────────
-- 6. INVOICE total vs accepted quote totalAmount mismatch
--    (tolerance: ±£1 for rounding)
-- ─────────────────────────────────────────────────────────────
SELECT
    i.id              AS invoice_id,
    i.invoiceNumber,
    i.jobId,
    j.reference       AS job_ref,
    i.total           AS invoice_total,
    q.totalAmount     AS quote_total,
    ABS(i.total - q.totalAmount) AS diff_gbp
FROM invoices i
JOIN jobs j   ON j.id = i.jobId
JOIN quotes q ON (q.jobId = i.jobId OR q.leadId = j.leadId)
             AND q.status = 'ACCEPTED'
WHERE ABS(i.total - q.totalAmount) > 1.00
ORDER BY diff_gbp DESC;

-- ─────────────────────────────────────────────────────────────
-- 7. LEADS whose clientEmail has NO User row (CUSTOMER role)
-- ─────────────────────────────────────────────────────────────
SELECT
    l.id,
    l.reference,
    l.clientName,
    l.clientEmail,
    l.status    AS lead_status,
    l.createdAt
FROM leads l
LEFT JOIN users u
    ON LOWER(u.email) = LOWER(l.clientEmail)
   AND u.role = 'CUSTOMER'
WHERE u.id IS NULL
ORDER BY l.createdAt DESC;

-- ─────────────────────────────────────────────────────────────
-- 8. NOTIFICATIONS whose link references a JOB or INV that
--    no longer exists in the DB
-- ─────────────────────────────────────────────────────────────

-- 8a. Notifications linking to /admin/jobs/<id> or /customer/... where jobId not found
SELECT
    n.id,
    n.title,
    n.link,
    REGEXP_SUBSTR(n.link, '[0-9]+$') AS extracted_id,
    'JOB_NOT_FOUND' AS issue
FROM notifications n
WHERE n.link REGEXP '/jobs/[0-9]+$'
  AND CAST(REGEXP_SUBSTR(n.link, '[0-9]+$') AS UNSIGNED) NOT IN (
      SELECT id FROM jobs
  )
ORDER BY n.createdAt DESC;

-- 8b. Notifications with an amount like "INV-XXXX" ref that doesn't exist
SELECT
    n.id,
    n.title,
    n.amount,
    n.link,
    'INV_REF_NOT_FOUND' AS issue
FROM notifications n
WHERE n.amount REGEXP '^INV-'
  AND n.amount NOT IN (SELECT invoiceNumber FROM invoices)
ORDER BY n.createdAt DESC;

-- ─────────────────────────────────────────────────────────────
-- 9. SUMMARY counts (quick health-check at a glance)
-- ─────────────────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM leads)          AS total_leads,
    (SELECT COUNT(*) FROM jobs)           AS total_jobs,
    (SELECT COUNT(*) FROM quotes)         AS total_quotes,
    (SELECT COUNT(*) FROM quotes WHERE status IN ('SENT','DRAFT'))  AS active_quotes,
    (SELECT COUNT(*) FROM invoices)       AS total_invoices,
    (SELECT COUNT(*) FROM invoices WHERE status = 'PAID') AS paid_invoices,
    (SELECT COUNT(*) FROM terms)          AS total_terms,
    (SELECT COUNT(*) FROM terms WHERE signed = 1) AS signed_terms,
    (SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER') AS customer_users,
    (SELECT COUNT(*) FROM notifications)  AS total_notifications;
