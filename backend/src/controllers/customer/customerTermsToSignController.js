import crypto from 'crypto';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendTermsSignedEmail } from '../../services/emailService.js';
import { generateTermReference } from '../../utils/references.js';

/**
 * Customer Menu 7: Terms to Sign (/customer/terms-to-sign)
 * Digital Signature & Statutory RICS Terms
 */
export const getTermsToSign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { quoteId, jobId } = req.query || {};

    const termInclude = {
      job: {
        select: {
          id: true,
          reference: true,
          propertyAddress: true,
          serviceType: true,
          stage: true,
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, invoiceNumber: true, subtotal: true, vatAmount: true, total: true, status: true },
          },
          quotes: {
            where: { status: 'ACCEPTED' },
            orderBy: { acceptedAt: 'desc' },
            take: 1,
            select: { id: true, reference: true, baseFee: true, vatAmount: true, totalAmount: true, serviceType: true, status: true },
          },
        },
      },
    };

    const ownerFilter = {
      OR: [
        { job: { clientId: userId } },
        { job: { clientEmail: userEmail } },
        { clientEmail: userEmail },
      ],
    };

    let term = null;

    if (quoteId) {
      const numericQuoteId = parseInt(quoteId, 10);
      const matchedQuote = await prisma.quote.findFirst({
        where: {
          OR: [
            ...(!isNaN(numericQuoteId) ? [{ id: numericQuoteId }] : []),
            { reference: String(quoteId) },
          ],
        },
        select: { jobId: true },
      });
      if (matchedQuote?.jobId) {
        term = await prisma.term.findFirst({
          where: {
            jobId: matchedQuote.jobId,
            ...ownerFilter,
          },
          include: termInclude,
          orderBy: { updatedAt: 'desc' },
        });
      }
    }

    if (!term && jobId) {
      const numericJobId = parseInt(jobId, 10);
      term = await prisma.term.findFirst({
        where: {
          job: {
            OR: [
              ...(!isNaN(numericJobId) ? [{ id: numericJobId }] : []),
              { reference: String(jobId) },
            ],
          },
          ...ownerFilter,
        },
        include: termInclude,
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!term) {
      term = await prisma.term.findFirst({
        where: ownerFilter,
        include: termInclude,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      });
    }

    let resultTerm = term;
    if (term) {
      // Only advance to signed if term itself is signed or job has already passed booking into inspection/report
      const isJobAdvanced = ['BOOKED', 'INSPECTED', 'DRAFTING', 'QA_REVIEW', 'COMPLETE'].includes(term.job?.stage);
      resultTerm = {
        ...term,
        signed: Boolean(term.signed || isJobAdvanced),
      };
    }

    return ApiResponse.success(res, { term: resultTerm });
  } catch (error) {
    next(error);
  }
};

export const executeDigitalSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { signatureData, property, surveyType, clientName: bodyClientName } = req.body;
    const termId = parseInt(id);
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    let term = null;
    if (!isNaN(termId) && termId > 0) {
      term = await prisma.term.findUnique({
        where: { id: termId },
        include: { job: true },
      });
    } else {
      term = await prisma.term.findFirst({
        where: { reference: String(id) },
        include: { job: true },
      });
    }

    if (!term) {
      throw ApiError.notFound('Terms agreement not found.');
    }

    const isOwner =
      (term.job?.clientId && term.job.clientId === userId) ||
      (userEmail && term.clientEmail?.toLowerCase() === userEmail) ||
      (userEmail && term.job?.clientEmail?.toLowerCase() === userEmail);

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to sign this agreement.');
    }

    const signedAt = new Date();
    const signerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '86.142.19.42';
    const signerUserAgent = req.headers['user-agent'] || 'Chrome Browser (Client Portal)';
    const hashData = `${id}|${userEmail}|${signedAt.toISOString()}|${signerIp}|${signerUserAgent}`;
    const tamperAuditHash = crypto.createHash('sha256').update(hashData).digest('hex');

    let updatedTerm = null;
    if (term) {
      updatedTerm = await prisma.term.update({
        where: { id: term.id },
        data: {
          signed: true,
          signatureData: signatureData || req.user?.name || 'Digitally Signed',
          signedAt,
          signerIp,
          signerUserAgent,
          tamperAuditHash,
        },
      });

      if (term.jobId && (!term.job?.stage || ['QUOTE_ISSUED', 'QUOTE_ACCEPTED'].includes(term.job.stage))) {
        await prisma.job.update({
          where: { id: term.jobId },
          data: { stage: 'TERMS_SIGNED' },
        }).catch(async (err) => {
          console.error('[Terms Job stage update error]:', err.message);
          await prisma.auditLog.create({
            data: {
              jobId: term.jobId,
              userId: userId || null,
              action: 'STAGE_UPDATE_FAILED',
              details: `Failed to update job stage on terms sign: ${err.message}`,
            },
          }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
        });
      }
    } else {
      // Find matching job for user to create a real term
      const matchingJob = await prisma.job.findFirst({
        where: {
          OR: [
            ...(userEmail ? [{ clientEmail: userEmail }] : []),
            ...(userId ? [{ clientId: userId }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (matchingJob) {
        const resolvedEmail = userEmail || matchingJob.clientEmail;
        if (!resolvedEmail) {
          throw ApiError.badRequest('Client email is required to execute Terms of Engagement.');
        }

        // App-layer uniqueness guard: only create a fresh term if no active (non-superseded) term exists
        const existingActiveTerm = await prisma.term.findFirst({
          where: {
            jobId: matchingJob.id,
            NOT: { documentTitle: { startsWith: '[SUPERSEDED]' } },
          },
        });

        if (existingActiveTerm && !existingActiveTerm.signed) {
          // Reuse and sign the existing unsigned term instead of creating a duplicate
          updatedTerm = await prisma.term.update({
            where: { id: existingActiveTerm.id },
            data: {
              signed: true,
              signatureData: signatureData || req.user?.name || 'Digitally Signed',
              signedAt,
              signerIp,
              signerUserAgent,
              tamperAuditHash,
            },
            include: { job: true },
          });
        } else if (existingActiveTerm && existingActiveTerm.signed) {
          // Already signed — return it without creating a duplicate
          updatedTerm = await prisma.term.findUnique({ where: { id: existingActiveTerm.id }, include: { job: true } });
        } else {
          updatedTerm = await prisma.term.create({
            data: {
              reference: await generateTermReference(),
              jobId: matchingJob.id,
              clientName: bodyClientName || req.user?.name || matchingJob.clientName || 'Valued Client',
              clientEmail: resolvedEmail,
              documentTitle: 'RICS Standard Terms of Engagement',
              content: 'RICS Standard Terms of Engagement',
              signed: true,
              signatureData: signatureData || req.user?.name || 'Digitally Signed',
              signedAt,
              signerIp,
              signerUserAgent,
              tamperAuditHash,
            },
            include: { job: true },
          });
        }
      } else {
        throw ApiError.notFound('Terms agreement or active instruction not found for this account.');
      }
    }

    // Dispatch Terms Signed Confirmation Email to Customer & CC Admin
    let emailSent = false;
    let emailError = null;
    try {
      const recipientEmail = userEmail || req.user?.email || term?.clientEmail || term?.job?.clientEmail;
      const clientDisplayName = bodyClientName || req.user?.name || term?.clientName || term?.job?.clientName || 'Valued Client';
      const resolvedJobRef = term?.job?.reference || `JOB-2026-${termId || id || 'NJS'}`;
      const resolvedSurveyType = surveyType || term?.job?.serviceType || 'RICS Property Survey';
      const resolvedProperty = property || term?.job?.propertyAddress || 'Property Address Not Available';

      if (recipientEmail && recipientEmail.includes('@')) {
        const emailRes = await sendTermsSignedEmail({
          to: recipientEmail,
          clientName: clientDisplayName,
          jobRef: resolvedJobRef,
          surveyType: resolvedSurveyType,
          propertyAddress: resolvedProperty,
          signedAt,
          signerIp,
          tamperAuditHash,
        });
        emailSent = Boolean(emailRes?.success);
        emailError = emailRes?.error || null;
      }

      // In-App Notifications for Customer & Admin
      if (userId) {
        prisma.notification.create({
          data: {
            userId,
            role: 'CUSTOMER',
            title: `✓ RICS Terms of Engagement Executed`,
            desc: `Your electronic contract has been confirmed. Next step: settle the invoice to unlock booking.`,
            type: 'terms',
            link: '/customer/invoices-and-payments',
          },
        }).catch(async (err) => {
          console.error('[Customer Terms Signed Notification error]:', err.message);
          const targetJobId = term?.jobId || updatedTerm?.jobId;
          if (targetJobId) {
            await prisma.auditLog.create({
              data: {
                jobId: targetJobId,
                userId,
                action: 'NOTIFICATION_DISPATCH_FAILED',
                details: `Failed to dispatch customer terms signed notification: ${err.message}`,
              },
            }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
          }
        });
      }

      prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `📝 Terms Signed: ${clientDisplayName}`,
          desc: `Client signed RICS Terms of Engagement for ${resolvedProperty} (Ref: ${resolvedJobRef}).`,
          type: 'terms',
          link: '/admin/terms',
        },
      }).catch(async (err) => {
        console.error('[Admin Terms Signed Notification error]:', err.message);
        const targetJobId = term?.jobId || updatedTerm?.jobId;
        if (targetJobId) {
          await prisma.auditLog.create({
            data: {
              jobId: targetJobId,
              userId: userId || null,
              action: 'NOTIFICATION_DISPATCH_FAILED',
              details: `Failed to dispatch admin terms signed notification: ${err.message}`,
            },
          }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
        }
      });
    } catch (emailErr) {
      console.error('[sendTermsSignedEmail] error:', emailErr.message);
    }

    return ApiResponse.success(
      res,
      { term: updatedTerm || { id: termId, signed: true }, emailSent, emailError },
      'Terms of Engagement executed successfully. Your survey appointment is now being booked!'
    );
  } catch (error) {
    next(error);
  }
};

