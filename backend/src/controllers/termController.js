import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getTerms = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const where = {};
    if (jobId) where.jobId = parseInt(jobId);

    const terms = await prisma.term.findMany({
      where,
      include: {
        job: { select: { id: true, reference: true, clientName: true, propertyAddress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { terms, total: terms.length });
  } catch (error) {
    next(error);
  }
};

export const signTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;
    const termId = parseInt(id);

    if (!signatureData) {
      throw ApiError.badRequest('Digital signature data is required');
    }

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: { job: true },
    });

    if (!term) {
      throw ApiError.notFound('Terms agreement not found');
    }

    if (term.signed) {
      throw ApiError.badRequest('This agreement has already been digitally executed');
    }

    const signedAt = new Date();
    const signerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const signerUserAgent = req.headers['user-agent'] || 'Unknown';

    // Generate SHA-256 tamper-evident integrity hash
    const hashData = `${term.id}|${term.jobId}|${term.clientEmail}|${signedAt.toISOString()}|${signerIp}|${signerUserAgent}`;
    const tamperAuditHash = crypto.createHash('sha256').update(hashData).digest('hex');

    const updatedTerm = await prisma.term.update({
      where: { id: termId },
      data: {
        signed: true,
        signatureData,
        signedAt,
        signerIp,
        signerUserAgent,
        tamperAuditHash,
      },
    });

    // If job was in PAID stage, update to ACCEPTED
    if (term.job.stage === 'PAID') {
      await prisma.job.update({
        where: { id: term.jobId },
        data: { stage: 'ACCEPTED' },
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        jobId: term.jobId,
        action: 'TERMS_DIGITALLY_SIGNED',
        details: `Signed by ${term.clientName} (${term.clientEmail}) from IP ${signerIp}. Hash: ${tamperAuditHash.slice(0, 16)}...`,
        ipAddress: signerIp,
      },
    });

    return ApiResponse.success(res, { term: updatedTerm }, 'Terms of Engagement digitally signed');
  } catch (error) {
    next(error);
  }
};

