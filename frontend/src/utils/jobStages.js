/**
 * Frontend 10-Stage Job Lifecycle Constants & Utilities
 * Aligned with Backend and DB JobStage Enum
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
  ENQUIRY: 'Enquiry Received',
  QUOTE_ISSUED: 'Quote Dispatched',
  QUOTE_ACCEPTED: 'Quote Accepted',
  TERMS_SIGNED: 'Terms Signed',
  PAID: 'Payment Confirmed',
  BOOKED: 'Inspection Booked',
  INSPECTED: 'Site Visited & Inspected',
  DRAFTING: 'Report Drafting Underway',
  QA_REVIEW: 'Admin QA Audit',
  COMPLETE: 'Completed & Delivered',
});

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
  QA_REVIEW: 'QA_REVIEW',
  QA: 'QA_REVIEW',
  COMPLETE: 'COMPLETE',
  COMPLETED: 'COMPLETE',
  DELIVERED: 'COMPLETE',
});

export function normalizeJobStage(stage) {
  if (!stage) return 'QUOTE_ISSUED';
  const upper = String(stage).trim().toUpperCase();
  if (JOB_STAGES.includes(upper)) return upper;
  return LEGACY_STAGE_MAP[upper] || 'QUOTE_ISSUED';
}

export function getStageStep(stage) {
  const norm = normalizeJobStage(stage);
  return JOB_STAGE_STEPS[norm] || 1;
}

export function getStageLabel(stage) {
  const norm = normalizeJobStage(stage);
  return JOB_STAGE_LABELS[norm] || norm;
}

export const STAGE_CONFIG_10_STEPS = Object.freeze([
  { step: 1, stage: 'ENQUIRY', label: 'Enquiry Received', shortLabel: 'Enquiry' },
  { step: 2, stage: 'QUOTE_ISSUED', label: 'Quote Dispatched', shortLabel: 'Quote' },
  { step: 3, stage: 'QUOTE_ACCEPTED', label: 'Quote Accepted', shortLabel: 'Accepted' },
  { step: 4, stage: 'TERMS_SIGNED', label: 'Terms Signed', shortLabel: 'Terms' },
  { step: 5, stage: 'PAID', label: 'Payment Confirmed', shortLabel: 'Paid' },
  { step: 6, stage: 'BOOKED', label: 'Inspection Booked', shortLabel: 'Booked' },
  { step: 7, stage: 'INSPECTED', label: 'Site Inspected', shortLabel: 'Inspected' },
  { step: 8, stage: 'DRAFTING', label: 'Report Drafting', shortLabel: 'Drafting' },
  { step: 9, stage: 'QA_REVIEW', label: 'Quality Check', shortLabel: 'QA Review' },
  { step: 10, stage: 'COMPLETE', label: 'Report Delivered', shortLabel: 'Delivered' },
]);
