import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 9: Terms & Documents (Legal Terms, Digital Signature Audit)
 */
export const getTermsAndDocuments = async (req, res, next) => {
  try {
    const { signed, jobId } = req.query;
    const where = {};

    if (signed !== undefined) where.signed = signed === 'true';
    if (jobId) where.jobId = parseInt(jobId);

    const terms = await prisma.term.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            clientName: true,
            clientEmail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { terms, total: terms.length });
  } catch (error) {
    next(error);
  }
};

export const getTermsMetrics = async (req, res, next) => {
  try {
    const [totalTerms, signedCount, pendingCount] = await Promise.all([
      prisma.term.count(),
      prisma.term.count({ where: { signed: true } }),
      prisma.term.count({ where: { signed: false } }),
    ]);

    return ApiResponse.success(res, {
      issuedAgreements: totalTerms,
      executedDigitally: signedCount,
      pendingSignatures: pendingCount,
      complianceRate: totalTerms > 0 ? `${((signedCount / totalTerms) * 100).toFixed(0)}%` : '100%',
    });
  } catch (error) {
    next(error);
  }
};

export const issueTermsAgreement = async (req, res, next) => {
  try {
    const { jobId, documentTitle, content } = req.body;

    if (!jobId) {
      throw ApiError.badRequest('Survey Job ID is required to issue terms agreement');
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
    });

    if (!job) {
      throw ApiError.notFound('Job record not found');
    }

    const count = await prisma.term.count();
    const reference = `TRM-2026-${String(count + 101).padStart(3, '0')}`;

    const term = await prisma.term.create({
      data: {
        reference,
        jobId: job.id,
        clientName: job.clientName,
        clientEmail: job.clientEmail,
        documentTitle: documentTitle || 'RICS Standard Home Survey Terms of Engagement',
        content: content || 'Standard statutory liability clauses and RICS inspection scope.',
        signed: false,
      },
    });

    return ApiResponse.created(res, { term }, 'Terms of Engagement dispatched for customer signature');
  } catch (error) {
    next(error);
  }
};

export const getAuditCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const term = await prisma.term.findUnique({
      where: { id: parseInt(id) },
      include: { job: true },
    });

    if (!term) {
      throw ApiError.notFound('Terms record not found');
    }

    if (!term.signed) {
      throw ApiError.badRequest('This agreement has not been digitally signed yet');
    }

    const certificate = {
      agreementReference: term.reference,
      jobReference: term.job.reference,
      propertyAddress: term.job.propertyAddress,
      clientName: term.clientName,
      clientEmail: term.clientEmail,
      signedTimestampUTC: term.signedAt,
      signerIpAddress: term.signerIp,
      signerUserAgent: term.signerUserAgent,
      cryptographicSha256Hash: term.tamperAuditHash,
      legalStatus: 'Legally Executed & Audit Certified (UK Property Act Compliant)',
    };

    return ApiResponse.success(res, { certificate });
  } catch (error) {
    next(error);
  }
};
