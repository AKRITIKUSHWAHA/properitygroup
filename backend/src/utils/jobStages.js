/**
 * Standard 10-Stage Survey Job Lifecycle & Validation Matrix
 * NJS Property Group Official Workflow Specification
 */

export const JOB_STAGES = Object.freeze([
  'ENQUIRY',
  'QUOTE_ISSUED',
  'QUOTE_ACCEPTED',
  'TERMS_SIGNED',
  'PAID',
  'BOOKED',
  'INSPECTED',
  'DRAFTING',
  'QA_REVIEW',
  'COMPLETE',
]);

export const JOB_STAGE_STEPS = Object.freeze({
  ENQUIRY: 1,
  QUOTE_ISSUED: 2,
  QUOTE_ACCEPTED: 3,
  TERMS_SIGNED: 4,
  PAID: 5,
  BOOKED: 6,
  INSPECTED: 7,
  DRAFTING: 8,
  QA_REVIEW: 9,
  COMPLETE: 10,
});

export const JOB_STAGE_LABELS = Object.freeze({
  ENQUIRY: 'Enquiry Logged',
  QUOTE_ISSUED: 'Quote Issued',
  QUOTE_ACCEPTED: 'Quote Accepted',
  TERMS_SIGNED: 'Terms Signed',
  PAID: 'Payment Received',
  BOOKED: 'Inspection Booked',
  INSPECTED: 'Site Inspected',
  DRAFTING: 'Report Drafting',
  QA_REVIEW: 'QA Review',
  COMPLETE: 'Completed & Delivered',
});

/**
 * Normalizes legacy or informal stage strings to canonical 10-stage JobStage
 */
export const LEGACY_STAGE_MAP = Object.freeze({
  QUOTE: 'QUOTE_ISSUED',
  QUOTED: 'QUOTE_ISSUED',
  QUOTE_SENT: 'QUOTE_ISSUED',
  NEW: 'ENQUIRY',
  ACCEPTED: 'QUOTE_ACCEPTED',
  ACCEPT: 'QUOTE_ACCEPTED',
  SIGNED: 'TERMS_SIGNED',
  TERMS: 'TERMS_SIGNED',
  PAID: 'PAID',
  BOOKED: 'BOOKED',
  SCHEDULED: 'BOOKED',
  INSPECTED: 'INSPECTED',
  SITE_VISIT: 'INSPECTED',
  PREPARING_REPORT: 'DRAFTING',
  DRAFTING: 'DRAFTING',
  DRAFT: 'DRAFTING',
  QA_REVIEW: 'QA_REVIEW',
  QA: 'QA_REVIEW',
  COMPLETE: 'COMPLETE',
  COMPLETED: 'COMPLETE',
  DELIVERED: 'COMPLETE',
});

export function normalizeJobStage(stage) {
  if (!stage) return 'QUOTE_ISSUED';
  const upper = String(stage).trim().toUpperCase();
  if (JOB_STAGES.includes(upper)) {
    return upper;
  }
  return LEGACY_STAGE_MAP[upper] || 'QUOTE_ISSUED';
}

/**
 * Transition validation rules.
 * Defines allowable stage progressions.
 */
export const ALLOWED_TRANSITIONS = Object.freeze({
  ENQUIRY: ['QUOTE_ISSUED'],
  QUOTE_ISSUED: ['QUOTE_ACCEPTED'],
  QUOTE_ACCEPTED: ['TERMS_SIGNED', 'PAID'],
  TERMS_SIGNED: ['PAID', 'BOOKED'],
  PAID: ['TERMS_SIGNED', 'BOOKED'],
  BOOKED: ['INSPECTED', 'BOOKED'], // re-booking / reschedule allowed
  INSPECTED: ['DRAFTING'],
  DRAFTING: ['QA_REVIEW'],
  QA_REVIEW: ['COMPLETE', 'DRAFTING'], // Admin QA Approved -> COMPLETE, or QA Rejected -> DRAFTING for surveyor revisions
  COMPLETE: [],
});

/**
 * Validates if moving from currentStage to targetStage is permissible.
 * Allows idempotent updates (current === target).
 */
export function isValidTransition(currentStage, targetStage) {
  const current = normalizeJobStage(currentStage);
  const target = normalizeJobStage(targetStage);

  if (current === target) return true;

  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Normalized LeadStatus helper.
 * Resolves mismatch between 'QUOTED' and 'QUOTE_SENT'.
 */
export const LEAD_STATUSES = Object.freeze([
  'NEW',
  'CONTACTED',
  'QUOTE_SENT',
  'CONVERTED',
  'LOST',
]);

export function normalizeLeadStatus(status) {
  if (!status) return 'NEW';
  const upper = String(status).trim().toUpperCase();
  if (upper === 'QUOTED') return 'QUOTE_SENT';
  if (LEAD_STATUSES.includes(upper)) return upper;
  return 'NEW';
}
