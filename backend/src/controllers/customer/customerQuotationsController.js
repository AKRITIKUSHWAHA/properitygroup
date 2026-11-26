import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendQuoteAcceptedEmail } from '../../services/emailService.js';
import { generateJobReference, generateTermReference, generateInvoiceNumber } from '../../utils/references.js';

/**
 * Customer Menu 2: My Quotations (/customer/quotations)
 */
export const getCustomerQuotations = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;
    const userName = req.user?.name || 'Valued Client';

    // 1. Fetch live quotes from prisma.quote (strictly scoped by clientId or exact clientEmail)
    const quotes = await prisma.quote.findMany({
      where: {
        status: { in: ['SENT', 'ACCEPTED'] },
        OR: [
          ...(userId ? [{ job: { clientId: userId } }] : []),
          ...(userEmail ? [{ job: { clientEmail: userEmail } }] : []),
          ...(userEmail ? [{ lead: { clientEmail: userEmail } }] : []),
          ...(userEmail ? [{ inclusions: { contains: `"clientEmail":"${userEmail}"` } }] : []),
        ],
      },
      include: {
        job: true,
        lead: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedQuotes = quotes.map((q) => {
      let inclusionsObj = {};
      try {
        if (q.inclusions) {
          inclusionsObj = typeof q.inclusions === 'string' ? JSON.parse(q.inclusions) : q.inclusions;
        }
      } catch {
        // Harmless JSON parse fallback: inclusions may be plain text, invalid JSON or null
        inclusionsObj = {};
      }

      const property =
        q.job?.propertyAddress ||
        q.lead?.propertyAddress ||
        inclusionsObj.property ||
        inclusionsObj.propertyAddress ||
        'Subject Property';
      const surveyType =
        q.job?.serviceType ||
        q.lead?.serviceType ||
        inclusionsObj.surveyType ||
        inclusionsObj.serviceName ||
        'RICS Level 2 Home Survey';
      const client =
        q.job?.clientName ||
        q.lead?.clientName ||
        inclusionsObj.client ||
        inclusionsObj.clientName ||
        req.user?.name ||
        'Valued Client';
      const clientEmail =
        q.job?.clientEmail ||
        q.lead?.clientEmail ||
        inclusionsObj.clientEmail ||
        userEmail;

      const rawBase = q.baseFee ? Number(q.baseFee) : null;
      const rawTotal = q.totalAmount ? Number(q.totalAmount) : null;
      const hasFee = (rawBase !== null && rawBase > 0) || (rawTotal !== null && rawTotal > 0);
      const baseFee = hasFee ? (rawBase || Math.round((rawTotal / 1.2) * 100) / 100) : null;
      const vatAmount = hasFee ? (q.vatAmount ? Number(q.vatAmount) : Math.round(((rawTotal || (baseFee * 1.2)) - baseFee) * 100) / 100) : null;
      const totalAmount = hasFee ? (rawTotal || Math.round((baseFee + vatAmount) * 100) / 100) : null;

      return {
        id: q.reference || `QUO-2026-${q.id}`,
        numericId: q.id,
        reference: q.reference,
        jobId: q.job?.reference || (q.jobId ? `JOB-${q.jobId}` : `JOB-2026-${q.id}`),
        property,
        surveyType,
        client,
        clientEmail,
        hasFee,
        baseFee,
        vatAmount,
        totalAmount,
        net: hasFee ? `£${baseFee.toFixed(2)}` : 'Pending Estimation',
        vat: hasFee ? `£${vatAmount.toFixed(2)}` : '—',
        total: hasFee ? `£${totalAmount.toFixed(2)}` : 'Pending Quotation',
        status: q.status === 'ACCEPTED' ? 'Quotation Accepted' : hasFee ? 'Open Proposal' : 'Under Review by NJS Practice',
        isAccepted: q.status === 'ACCEPTED',
        date: q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
        validUntil: q.validUntil ? `Valid until ${new Date(q.validUntil).toLocaleDateString('en-GB')}` : hasFee ? '14 Days Remaining' : 'Pending Fee Review',
        rawQuote: q,
      };
    });

    return ApiResponse.success(res, { quotes: mappedQuotes, total: mappedQuotes.length });
  } catch (error) {
    next(error);
  }
};

export const acceptCustomerQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quoteId = parseInt(id, 10);
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;
    const userName = req.user?.name || 'Valued Client';

    // 1. Strict lookup by ID or exact reference
    let quote = null;
    if (!isNaN(quoteId) && quoteId > 0) {
      quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { job: true, lead: true },
      });
    }
    if (!quote && id) {
      quote = await prisma.quote.findUnique({
        where: { reference: String(id) },
        include: { job: true, lead: true },
      });
    }

    if (!quote) {
      throw ApiError.notFound('Quotation not found.');
    }

    // 2. Ownership check
    const isOwner =
      (userId && (quote.job?.clientId === userId || quote.lead?.clientId === userId)) ||
      (userEmail && (
        quote.job?.clientEmail?.toLowerCase() === userEmail ||
        quote.lead?.clientEmail?.toLowerCase() === userEmail
      )) ||
      req.user?.role === 'ADMIN';

    if (!isOwner) {
      throw ApiError.forbidden('You are not authorized to accept this quotation.');
    }

    // 3. Status validity
    if (quote.status === 'SUPERSEDED' || quote.status === 'EXPIRED') {
      throw ApiError.badRequest(`This quotation is no longer valid (status: ${quote.status}).`);
    }

    const leadTargetId = quote.leadId || quote.job?.leadId;
    const clientName = req.user?.name || quote.job?.clientName || quote.lead?.clientName || userName || 'Valued Client';
    const recipientEmail = userEmail || req.user?.email || quote.job?.clientEmail || quote.lead?.clientEmail;
    const clientPhone = quote.job?.clientPhone || quote.lead?.clientPhone || null;
    const propertyAddress = quote.job?.propertyAddress || quote.lead?.propertyAddress;
    const postcode = quote.job?.postcode || quote.lead?.postcode;
    const serviceType = quote.job?.serviceType || quote.lead?.serviceType || 'RICS Level 2 Home Survey (Homebuyer)';
    const totalFee = Number(quote.totalAmount || 0);

    if (!propertyAddress || !postcode) {
      throw ApiError.badRequest('Property address and postcode are required to accept this quotation.');
    }

    if (!totalFee || totalFee <= 0) {
      throw ApiError.badRequest('Quote fee not found for this job. Cannot accept quotation without valid fee.');
    }

    const baseFee = Number(quote.baseFee || Math.round((totalFee / 1.2) * 100) / 100);
    const vatFee = Number(quote.vatAmount || Math.round((totalFee - baseFee) * 100) / 100);

    // 4. Atomic transaction across Quote, Lead, Job, Term, and Invoice
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Advance quote status
      const updatedQuote = await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      // Advance lead status to CONVERTED
      if (leadTargetId) {
        await tx.lead.update({
          where: { id: leadTargetId },
          data: { status: 'CONVERTED' },
        });
      }

      // Ensure Job record exists and is set to QUOTE_ACCEPTED
      let activeJobId = quote.jobId || quote.job?.id || null;
      if (!activeJobId && leadTargetId) {
        const existingLeadJob = await tx.job.findFirst({
          where: { leadId: leadTargetId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });
        if (existingLeadJob) {
          activeJobId = existingLeadJob.id;
          await tx.quote.update({
            where: { id: quote.id },
            data: { jobId: activeJobId },
          });
        }
      }

      if (!activeJobId) {
        const jobRef = quote.lead?.reference
          ? (quote.lead.reference.startsWith('NJS-') ? quote.lead.reference.replace('NJS-', 'JOB-') : `JOB-${quote.lead.reference}`)
          : await generateJobReference(tx);

        const newJob = await tx.job.create({
          data: {
            reference: jobRef,
            clientName,
            clientEmail: recipientEmail,
            clientPhone,
            clientId: userId || null,
            propertyAddress,
            postcode,
            serviceType,
            stage: 'QUOTE_ACCEPTED',
            leadId: leadTargetId || null,
          },
        });
        activeJobId = newJob.id;

        await tx.quote.update({
          where: { id: quote.id },
          data: { jobId: activeJobId },
        });
      } else {
        await tx.job.update({
          where: { id: activeJobId },
          data: {
            stage: 'QUOTE_ACCEPTED',
            serviceType,
            propertyAddress,
            postcode,
            clientName,
            clientEmail: recipientEmail,
            clientPhone,
          },
        });
      }

      // Check existing Invoice status before deciding whether to reset/override Term & Invoice
      const existingInvoice = await tx.invoice.findFirst({ where: { jobId: activeJobId } });
      const isAlreadyPaid = existingInvoice?.status === 'PAID';

      // Ensure Term record exists and reflects the newly accepted quote
      const existingTerm = await tx.term.findFirst({ where: { jobId: activeJobId } });
      if (!existingTerm) {
        await tx.term.create({
          data: {
            reference: `TRM-2026-${activeJobId}`,
            jobId: activeJobId,
            clientName,
            clientEmail: recipientEmail,
            documentTitle: `${serviceType} Terms of Engagement`,
            content: 'RICS Standard Terms of Engagement',
            signed: false,
          },
        });
      } else if (!isAlreadyPaid) {
        await tx.term.update({
          where: { id: existingTerm.id },
          data: {
            clientName,
            clientEmail: recipientEmail,
            documentTitle: `${serviceType} Terms of Engagement`,
            signed: false,
            signedAt: null,
            signatureData: null,
          },
        });
      }

      // Ensure Invoice record exists and reflects the accepted quote amount (override PENDING / BACS_CLAIMED / FAILED)
      if (!existingInvoice) {
        await tx.invoice.create({
          data: {
            invoiceNumber: await generateInvoiceNumber(tx),
            jobId: activeJobId,
            clientName,
            clientEmail: recipientEmail,
            subtotal: baseFee,
            vatAmount: vatFee,
            total: totalFee,
            status: 'PENDING',
          },
        });
      } else if (!isAlreadyPaid) {
        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            clientName,
            clientEmail: recipientEmail,
            subtotal: baseFee,
            vatAmount: vatFee,
            total: totalFee,
            status: 'PENDING',
          },
        });
      }

      return { jobId: activeJobId, quote: updatedQuote };
    });

    const activeJobId = transactionResult.jobId;

    // 5. Dispatch Quotation Acceptance Email to Customer & CC Admin
    const quoteRef = quote.reference;
    const totalAmountStr = totalFee.toFixed(2);

    let emailSent = false;
    let emailError = null;
    if (recipientEmail && recipientEmail.includes('@')) {
      try {
        const emailRes = await sendQuoteAcceptedEmail({
          to: recipientEmail,
          clientName,
          quoteRef,
          surveyType: serviceType,
          propertyAddress,
          totalAmount: totalAmountStr,
        });
        emailSent = Boolean(emailRes?.success);
        emailError = emailRes?.error || null;
      } catch (e) {
        console.error('[sendQuoteAcceptedEmail] error:', e.message);
        emailError = e.message;
      }
    }

    // 6. In-App Notifications for Customer & Admin
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          role: 'CUSTOMER',
          title: `✓ Quotation Accepted (${quoteRef})`,
          desc: `You accepted your quotation for ${propertyAddress}. Please review and execute your RICS Terms of Engagement.`,
          type: 'terms',
          link: '/customer/terms-to-sign',
        },
      }).catch(async (err) => {
        console.error('[Customer Quote Accepted Notification error]:', err.message);
      });
    }

    await prisma.notification.create({
      data: {
        role: 'ADMIN',
        title: `✓ Quote Accepted: ${clientName}`,
        desc: `Client accepted quotation ${quoteRef} for ${propertyAddress}. Next: send Terms of Engagement.`,
        type: 'terms',
        amount: `£${totalAmountStr}`,
        link: '/admin/quotes',
      },
    }).catch(async (err) => {
      console.error('[Admin Quote Accepted Notification error]:', err.message);
    });

    return ApiResponse.success(
      res,
      { quoteId: quote.id, jobId: activeJobId, status: 'ACCEPTED', emailSent, emailError },
      'Quotation accepted successfully. Please proceed to payment or terms.'
    );
  } catch (error) {
    next(error);
  }
};
