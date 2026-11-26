import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { sendQuoteProposalEmail, sendPortalActivationEmail } from './emailService.js';
import { ensureCustomerUser, generateActivationToken } from './customerUserService.js';
import { generateQuoteReference } from '../utils/references.js';

/**
 * Single source of truth for issuing quotations in the system.
 * Atomic transaction supersedes previous active quotes, sets safe sequential reference,
 * updates lead status/estimatedValue, dispatches emails and deduplicated notifications.
 */
export const issueQuote = async ({
  leadId,
  jobId,
  baseFee,
  discount = 0,
  serviceType,
  inclusions,
  validUntil: customValidUntil,
  issuedBy,
}) => {
  const rawLeadId = leadId !== undefined && leadId !== null ? String(leadId).trim() : '';
  const rawJobId = jobId !== undefined && jobId !== null ? String(jobId).trim() : '';

  if (!rawLeadId && !rawJobId) {
    throw ApiError.badRequest('Quote must be linked to a valid leadId or jobId.');
  }

  // 1. Fetch Lead or Job by numeric ID or reference string (e.g. NJS-2026-5894)
  let lead = null;
  let job = null;

  if (rawLeadId) {
    const numLeadId = /^\d+$/.test(rawLeadId) ? parseInt(rawLeadId, 10) : null;
    lead = numLeadId
      ? await prisma.lead.findUnique({ where: { id: numLeadId } })
      : await prisma.lead.findUnique({ where: { reference: rawLeadId } });
  }
  if (rawJobId) {
    const numJobId = /^\d+$/.test(rawJobId) ? parseInt(rawJobId, 10) : null;
    job = numJobId
      ? await prisma.job.findUnique({ where: { id: numJobId } })
      : await prisma.job.findUnique({ where: { reference: rawJobId } });
  }

  const parsedLeadId = lead?.id || null;
  const parsedJobId = job?.id || null;

  if (!lead && !job) {
    throw ApiError.notFound('Associated Lead or Job record not found in the database.');
  }

  // Extract client and property information strictly from DB record
  const clientName = (lead?.clientName || job?.clientName || 'Valued Client').trim();
  const clientEmail = (lead?.clientEmail || job?.clientEmail || '').toLowerCase().trim();
  const propertyAddress = (lead?.propertyAddress || job?.propertyAddress || 'Subject Property').trim();
  const targetSurveyType = (serviceType || lead?.serviceType || job?.serviceType || 'RICS Level 2 Home Survey').trim();

  if (!clientEmail || !clientEmail.includes('@')) {
    throw ApiError.badRequest('A valid client email address is required to issue a quotation.');
  }

  // 2. Financial calculation
  const parsedBaseFee = parseFloat(baseFee);
  if (isNaN(parsedBaseFee) || parsedBaseFee <= 0) {
    throw ApiError.badRequest('Valid positive quote base fee is required.');
  }

  const parsedDiscount = parseFloat(discount || 0);
  const netFee = Math.max(0, Math.round((parsedBaseFee - parsedDiscount) * 100) / 100);
  const vatRate = 0.20;
  const vatAmount = Math.round(netFee * vatRate * 100) / 100;
  const totalAmount = Math.round((netFee + vatAmount) * 100) / 100;
  const validUntilDate = customValidUntil
    ? new Date(customValidUntil)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // 2.5 Idempotency guard: prevent duplicate quote/email/notification if identical quote was just issued within 30s
  const recentCutoff = new Date(Date.now() - 30 * 1000);
  const duplicateRecentQuote = await prisma.quote.findFirst({
    where: {
      status: 'SENT',
      baseFee: parsedBaseFee,
      totalAmount,
      createdAt: { gte: recentCutoff },
      OR: [
        ...(parsedLeadId ? [{ leadId: parsedLeadId }] : []),
        ...(parsedJobId ? [{ jobId: parsedJobId }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (duplicateRecentQuote) {
    return {
      quote: duplicateRecentQuote,
      emailSent: true,
      emailError: null,
      deduplicated: true,
    };
  }

  // 3. Safe sequential reference generation via centralised references.js
  const cleanReference = await generateQuoteReference();

  // 4. Atomic Transaction: Supersede active quotes, create new quote, update lead/job
  const supersedeWhere = {
    status: { in: ['DRAFT', 'SENT'] },
    OR: [
      ...(parsedLeadId ? [{ leadId: parsedLeadId }] : []),
      ...(parsedJobId ? [{ jobId: parsedJobId }] : []),
    ],
  };

  const newQuote = await prisma.$transaction(async (tx) => {
    // Supersede old active quotes
    await tx.quote.updateMany({
      where: supersedeWhere,
      data: { status: 'SUPERSEDED' },
    });

    // Create single active quote
    const createdQuote = await tx.quote.create({
      data: {
        reference: cleanReference,
        leadId: parsedLeadId || null,
        jobId: parsedJobId || null,
        baseFee: parsedBaseFee,
        vatRate,
        vatAmount,
        totalAmount,
        inclusions: inclusions || JSON.stringify(['Official RICS Regulated Inspection', 'Photographic Defect Schedule', 'HMRC 20% VAT Included']),
        status: 'SENT',
        validUntil: validUntilDate,
      },
    });

    // Update lead status and estimated value
    if (parsedLeadId) {
      await tx.lead.update({
        where: { id: parsedLeadId },
        data: {
          status: 'QUOTE_SENT',
          estimatedValue: totalAmount,
        },
      });
    }

    // Ensure Job stage reflects quotation if currently pre-quote
    if (parsedJobId && job && (!job.stage || job.stage === 'QUOTE')) {
      await tx.job.update({
        where: { id: parsedJobId },
        data: { stage: 'QUOTE' },
      });
    }

    return createdQuote;
  });

  // 5. Ensure Customer User exists in users table (Status: PENDING if new)
  let customerUser = null;
  try {
    customerUser = await ensureCustomerUser({
      email: clientEmail,
      name: clientName,
      phone: lead?.clientPhone || job?.clientPhone || null,
    });

    // If new PENDING customer, dispatch portal activation email
    if (customerUser && customerUser.status === 'PENDING') {
      const activationToken = generateActivationToken(customerUser);
      await sendPortalActivationEmail({
        to: clientEmail,
        clientName,
        activationToken,
        propertyAddress,
      });
    }
  } catch (userErr) {
    console.error('[issueQuote customer provisioning error]:', userErr.message);
  }

  // 6. Dispatch Formal RICS Quote Proposal Email
  let emailSent = false;
  let emailError = null;
  try {
    const frontendBase = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5175').split(',')[0];
    const targetQuoteLink = `${frontendBase}/customer/my-quotations?quoteRef=${encodeURIComponent(newQuote.reference)}&leadId=${parsedLeadId || ''}&jobId=${parsedJobId || ''}`;

    const emailRes = await sendQuoteProposalEmail({
      to: clientEmail,
      clientName,
      quoteAmount: totalAmount.toFixed(2),
      surveyType: targetSurveyType,
      propertyAddress,
      quoteLink: targetQuoteLink,
    });
    emailSent = Boolean(emailRes?.success);
    emailError = emailRes?.error || null;
  } catch (emailErr) {
    console.error('[sendQuoteProposalEmail issueQuote error]:', emailErr.message);
    emailError = emailErr.message;
  }

  // 7. Deduplicated In-App Notifications for Customer & Admin
  try {
    if (customerUser?.id) {
      const existingCustNotif = await prisma.notification.findFirst({
        where: {
          userId: customerUser.id,
          role: 'CUSTOMER',
          type: 'QUOTE',
          desc: { contains: newQuote.reference },
        },
      });

      if (!existingCustNotif) {
        await prisma.notification.create({
          data: {
            userId: customerUser.id,
            role: 'CUSTOMER',
            title: `Formal Survey Quotation Ready (£${totalAmount.toFixed(2)})`,
            desc: `A formal RICS quote of £${totalAmount.toFixed(2)} (${newQuote.reference}) has been prepared for ${propertyAddress}.`,
            type: 'QUOTE',
            amount: `£${totalAmount.toFixed(2)}`,
            link: '/customer/my-quotations',
          },
        });
      }
    }

    const existingAdminNotif = await prisma.notification.findFirst({
      where: {
        role: 'ADMIN',
        type: 'QUOTE',
        desc: { contains: newQuote.reference },
      },
    });

    if (!existingAdminNotif) {
      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Quote Proposal Issued - £${totalAmount.toFixed(2)}`,
          desc: `Quote proposal ${newQuote.reference} sent to ${clientName} (${clientEmail}) for ${propertyAddress}.`,
          type: 'QUOTE',
          amount: `£${totalAmount.toFixed(2)}`,
          link: '/admin/finance/quotations',
        },
      });
    }
  } catch (notifErr) {
    console.error('[issueQuote notification error]:', notifErr.message);
  }

  return {
    quote: newQuote,
    emailSent,
    emailError,
  };
};
