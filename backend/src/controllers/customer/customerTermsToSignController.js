import crypto from 'crypto';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendTermsSignedEmail } from '../../services/emailService.js';

/**
 * Customer Menu 7: Terms to Sign (/customer/terms-to-sign)
 * Digital Signature & Statutory RICS Terms
 */
export const getTermsToSign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const term = await prisma.term.findFirst({
      where: {
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { clientEmail: userEmail },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            serviceType: true,
            stage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { term });
  } catch (error) {
    next(error);
  }
};

export const executeDigitalSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;
    const termId = parseInt(id);
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!signatureData) {
      throw ApiError.badRequest('Digital signature data is required');
    }

    const term = await prisma.term.findFirst({
      where: {
        id: termId,
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { clientEmail: userEmail },
        ],
      },
      include: { job: true },
    });

    if (!term) {
      throw ApiError.notFound('Terms agreement not found or not linked to your account');
    }

    if (term.signed) {
      throw ApiError.badRequest('You have already digitally signed this agreement');
    }

    const signedAt = new Date();
    const signerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const signerUserAgent = req.headers['user-agent'] || 'Unknown Browser';

    // Cryptographic audit hash
    const hashData = `${term.id}|${term.jobId}|${req.user.email}|${signedAt.toISOString()}|${signerIp}|${signerUserAgent}`;
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

    // Advance job stage to ACCEPTED if it was in PAID
    if (term.job && term.job.stage === 'PAID') {
      await prisma.job.update({
        where: { id: term.jobId },
        data: { stage: 'ACCEPTED' },
      });
    }

    await prisma.auditLog.create({
      data: {
        jobId: term.jobId,
        userId: req.user.id,
        action: 'CUSTOMER_DIGITALLY_SIGNED_TERMS',
        details: `Customer signed Terms of Engagement from IP ${signerIp}. Hash: ${tamperAuditHash.slice(0, 16)}...`,
        ipAddress: signerIp,
      },
    });

    // Dispatch Terms Signed Confirmation Email to Customer & CC Admin
    try {
      const recipientEmail = req.user.email || term.clientEmail || term.job?.clientEmail || userEmail;
      if (recipientEmail && recipientEmail.includes('@')) {
        sendTermsSignedEmail({
          to: recipientEmail,
          clientName: req.user.name || term.clientName || term.job?.clientName || 'Valued Client',
          jobRef: term.job?.reference || `TRM-${term.id}`,
          surveyType: term.job?.serviceType || 'RICS Level 2 Home Survey',
          propertyAddress: term.job?.propertyAddress || 'Subject Property',
          signedAt,
          signerIp,
          tamperAuditHash,
        }).catch((e) => console.warn('[sendTermsSignedEmail] background error:', e.message));
      }

      // In-App Notifications for Customer & Admin
      prisma.notification.create({
        data: {
          userId: req.user.id,
          role: 'CUSTOMER',
          title: `✓ RICS Terms of Engagement Executed`,
          desc: `Your electronic contract has been confirmed. Our operations team is finalizing surveyor booking.`,
          type: 'terms',
          link: '/customer/track-survey',
        },
      }).catch(() => {});

      prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `📝 Terms Signed: ${req.user.name || term.clientName || 'Client'}`,
          desc: `Client signed RICS Terms of Engagement for ${term.job?.propertyAddress || 'Subject Property'} (Ref: ${term.job?.reference || `TRM-${term.id}`}).`,
          type: 'terms',
          link: '/admin/terms',
        },
      }).catch(() => {});
    } catch (emailErr) {
      console.warn('[sendTermsSignedEmail] warning:', emailErr.message);
    }

    return ApiResponse.success(
      res,
      { term: updatedTerm },
      'Terms of Engagement executed successfully. Your survey appointment is now being booked!'
    );
  } catch (error) {
    next(error);
  }
};

