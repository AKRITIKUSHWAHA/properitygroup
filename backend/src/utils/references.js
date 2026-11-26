/**
 * references.js — Centralised, collision-safe reference generation (ESM)
 *
 * Rules:
 *  - No Math.random()
 *  - No count()+101  (count-based breaks when rows are deleted)
 *  - Use MAX(id) + offset with retry loop against race-condition collisions
 *  - Year auto-updates on 1 Jan
 *  - Each prefix has its own zero-pad width
 *
 * Usage inside a Prisma transaction:
 *   const ref = await generateQuoteReference(tx);  // pass tx as prisma arg
 */

import { prisma as _prisma } from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// Core generator — not exported directly; use the named helpers below
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object}   opts
 * @param {string}   opts.prefix      e.g. 'QUO', 'JOB', 'NJS', 'LSD', 'INV', 'TRM'
 * @param {function} opts.findMaxId   async () => number|null
 * @param {function} opts.checkExists async (candidate: string) => boolean
 * @param {number}  [opts.offset=100]
 * @param {number}  [opts.padWidth=4]
 * @param {number}  [opts.maxRetries=8]
 * @returns {Promise<string>}
 */
async function _generateReference({ prefix, findMaxId, checkExists, offset = 100, padWidth = 4, maxRetries = 8 }) {
  const year = new Date().getFullYear();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const maxId     = (await findMaxId()) || 0;
    const seq       = maxId + offset + attempt;
    const candidate = `${prefix}-${year}-${String(seq).padStart(padWidth, '0')}`;
    if (!(await checkExists(candidate))) return candidate;
  }
  // Last-resort fallback — timestamp unique but non-sequential
  const fallback = `${prefix}-${year}-${Date.now()}`;
  console.warn(`[references] Collisions exhausted (${maxRetries} attempts) for prefix=${prefix}. Using fallback: ${fallback}`);
  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * QUO-YYYY-XXXX
 * @param {object} [prisma]  pass tx inside a Prisma transaction
 */
export async function generateQuoteReference(prisma = _prisma) {
  return _generateReference({
    prefix:      'QUO',
    padWidth:    4,
    offset:      100,
    findMaxId:   async () => (await prisma.quote.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))?.id ?? 0,
    checkExists: async (ref) => !!(await prisma.quote.findUnique({ where: { reference: ref } })),
  });
}

/**
 * JOB-YYYY-XXX
 * @param {object} [prisma]
 */
export async function generateJobReference(prisma = _prisma) {
  return _generateReference({
    prefix:      'JOB',
    padWidth:    3,
    offset:      100,
    findMaxId:   async () => (await prisma.job.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))?.id ?? 0,
    checkExists: async (ref) => !!(await prisma.job.findUnique({ where: { reference: ref } })),
  });
}

/**
 * NJS-YYYY-XXXX or LSD-YYYY-XXXX
 * @param {'NJS'|'LSD'} [prefix='NJS']
 * @param {object} [prisma]
 */
export async function generateLeadReference(prefix = 'NJS', prisma = _prisma) {
  if (!['NJS', 'LSD'].includes(prefix)) prefix = 'NJS';
  return _generateReference({
    prefix,
    padWidth:    4,
    offset:      100,
    findMaxId:   async () => (await prisma.lead.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))?.id ?? 0,
    checkExists: async (ref) => !!(await prisma.lead.findUnique({ where: { reference: ref } })),
  });
}

/**
 * INV-YYYY-XXXX
 * @param {object} [prisma]
 */
export async function generateInvoiceNumber(prisma = _prisma) {
  return _generateReference({
    prefix:      'INV',
    padWidth:    4,
    offset:      100,
    findMaxId:   async () => (await prisma.invoice.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))?.id ?? 0,
    checkExists: async (ref) => !!(await prisma.invoice.findUnique({ where: { invoiceNumber: ref } })),
  });
}

/**
 * TRM-YYYY-XXXX
 * @param {object} [prisma]
 */
export async function generateTermReference(prisma = _prisma) {
  return _generateReference({
    prefix:      'TRM',
    padWidth:    4,
    offset:      100,
    findMaxId:   async () => (await prisma.term.findFirst({ orderBy: { id: 'desc' }, select: { id: true } }))?.id ?? 0,
    checkExists: async (ref) => !!(await prisma.term.findUnique({ where: { reference: ref } })),
  });
}
