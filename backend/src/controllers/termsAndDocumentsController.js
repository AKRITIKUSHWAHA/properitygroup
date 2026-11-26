import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendTermsProposalEmail } from '../services/emailService.js';
import { generateTermReference } from '../utils/references.js';

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
    const { jobId, documentTitle, content, clientName, clientEmail } = req.body;

    let job = null;
    if (jobId) {
      job = await prisma.job.findUnique({
        where: { id: parseInt(jobId) },
      });
    }

    if (!job) {
      throw ApiError.notFound('Survey job not found for terms dispatch.');
    }

    const acceptedQuote = await prisma.quote.findFirst({
      where: { jobId: job.id, status: 'ACCEPTED' },
    });
    if (!acceptedQuote) {
      throw ApiError.badRequest('Cannot dispatch Terms of Engagement before a quotation has been accepted.');
    }

    const recipientEmail = clientEmail || job.clientEmail;
    if (!recipientEmail) {
      throw ApiError.badRequest('Client email is required to dispatch terms.');
    }

    const reference = await generateTermReference();

    // App-layer uniqueness guard: one active term per job (non-superseded)
    const existingActiveTerm = await prisma.term.findFirst({
      where: {
        jobId: job.id,
        NOT: { documentTitle: { startsWith: '[SUPERSEDED]' } },
      },
    });
    if (existingActiveTerm) {
      throw ApiError.conflict(`An active term already exists for this job (${existingActiveTerm.reference}). Supersede it before creating a new one.`);
    }

    const term = await prisma.term.create({
      data: {
        reference,
        jobId: job.id,
        clientName: clientName || job.clientName || 'Valued Client',
        clientEmail: recipientEmail,
        documentTitle: documentTitle || `${job.serviceType || 'RICS Standard'} Terms of Engagement`,
        content: content || 'Standard statutory liability clauses and RICS inspection scope.',
        signed: false,
      },
    });

    let emailSent = false;
    let emailError = null;
    if (recipientEmail && recipientEmail.includes('@')) {
      const emailRes = await sendTermsProposalEmail({
        to: recipientEmail,
        clientName: clientName || job.clientName || 'Valued Client',
        jobRef: job.reference,
        propertyAddress: job.propertyAddress,
        surveyType: job.serviceType,
        documentTitle: term.documentTitle,
      });
      emailSent = Boolean(emailRes?.success);
      emailError = emailRes?.error || null;
    }

    return ApiResponse.created(
      res,
      { term, emailSent, emailError },
      emailSent
        ? 'Terms of Engagement dispatched and emailed to customer for signature'
        : `Terms of Engagement created in portal (Email delivery failed: ${emailError || 'Resend not configured'})`
    );
  } catch (error) {
    next(error);
  }
};

export const markTermSigned = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signatureData, signerIp } = req.body;
    const termId = parseInt(id, 10);

    const existingTerm = await prisma.term.findUnique({ where: { id: termId } });
    if (!existingTerm) {
      throw ApiError.notFound('Terms agreement not found');
    }

    const signedAt = new Date();
    const resolvedIp =
      signerIp ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const hashData = `${termId}|${existingTerm.jobId}|${existingTerm.clientEmail}|${signedAt.toISOString()}|${resolvedIp}|${userAgent}`;
    const tamperAuditHash = crypto.createHash('sha256').update(hashData).digest('hex');

    const term = await prisma.term.update({
      where: { id: termId },
      data: {
        signed: true,
        signatureData: signatureData || 'Digital Signature',
        signedAt,
        signerIp: resolvedIp,
        tamperAuditHash,
      },
    });

    return ApiResponse.success(res, { term }, 'Terms marked as signed successfully');
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

