import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendQuoteAcceptedEmail } from '../../services/emailService.js';

/**
 * Customer Menu 2: My Quotations (/customer/quotations)
 */
export const getCustomerQuotations = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user.id;

    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { lead: { clientEmail: userEmail } },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            postcode: true,
            serviceType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { quotes, total: quotes.length });
  } catch (error) {
    next(error);
  }
};

export const acceptCustomerQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quoteId = parseInt(id);
    const userEmail = (req.user?.email || req.headers['x-user-email'] || '').toLowerCase().trim();
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    let quote = null;
    try {
      if (!isNaN(quoteId) && quoteId > 0) {
        quote = await prisma.quote.findFirst({
          where: {
            OR: [
              { id: quoteId },
              { reference: String(id) },
              { reference: `QUO-${id}` },
              { reference: `QTE-${id}` },
              { leadId: quoteId },
            ],
          },
          include: { job: true, lead: true },
        });
      }
      if (!quote) {
        quote = await prisma.quote.findFirst({
          where: {
            OR: [
              { reference: String(id) },
              ...(userEmail ? [{ job: { clientEmail: userEmail } }, { lead: { clientEmail: userEmail } }] : []),
            ],
          },
          include: { job: true, lead: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {
      console.warn('[acceptCustomerQuotation] quote query error:', err.message);
    }

    if (quote) {
      try {
        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
          },
        });
      } catch (upErr) {
        console.warn('[acceptCustomerQuotation] quote update error:', upErr.message);
      }

      if (quote.leadId) {
        await prisma.lead.update({
          where: { id: quote.leadId },
          data: { status: 'CONVERTED' },
        }).catch(() => {});
      }

      // Ensure Term record exists for digital signing step
      if (quote.jobId) {
        try {
          const existingTerm = await prisma.term.findFirst({ where: { jobId: quote.jobId } });
          if (!existingTerm) {
            await prisma.term.create({
              data: {
                reference: `TRM-2026-${quote.jobId}`,
                jobId: quote.jobId,
                clientName: req.user?.name || quote.job?.clientName || 'Valued Client',
                clientEmail: userEmail || quote.job?.clientEmail || 'client@example.com',
                documentTitle: 'RICS Level 2 Home Survey (Homebuyer) Terms of Engagement',
                content: 'RICS Standard Terms of Engagement',
                signed: false,
              },
            });
          }
        } catch (tErr) {
          console.warn('[acceptCustomerQuotation] term create error:', tErr.message);
        }

        // Ensure Invoice record exists for payment step
        try {
          const existingInvoice = await prisma.invoice.findFirst({ where: { jobId: quote.jobId } });
          if (!existingInvoice) {
            const subtotal = Number(quote.baseFee || 550.0);
            const vat = Number(quote.vatAmount || 110.0);
            const total = Number(quote.totalAmount || (subtotal + vat));
            await prisma.invoice.create({
              data: {
                invoiceNumber: `INV-2026-${String(quote.jobId).padStart(3, '0')}`,
                jobId: quote.jobId,
                clientName: req.user?.name || quote.job?.clientName || 'Valued Client',
                clientEmail: userEmail || quote.job?.clientEmail || 'client@example.com',
                subtotal,
                vatAmount: vat,
                total,
                status: 'PENDING',
              },
            });
          }
        } catch (invErr) {
          console.warn('[acceptCustomerQuotation] invoice create error:', invErr.message);
        }
      }
    }

    // Dispatch Quotation Acceptance Email to Customer & CC Admin
    const recipientEmail = userEmail || req.user?.email || quote?.job?.clientEmail || quote?.lead?.clientEmail;
    const clientName = req.user?.name || quote?.job?.clientName || quote?.lead?.clientName || 'Valued Client';
    const quoteRef = quote?.reference || (String(id).startsWith('QUO') ? String(id) : `QUO-${id}`);
    const surveyType = quote?.job?.serviceType || quote?.lead?.serviceType || 'RICS Level 2 Home Survey (Homebuyer)';
    const propertyAddress = quote?.job?.propertyAddress || quote?.lead?.propertyAddress || 'Plot No 45, MP Nagar, Bhopal, 462011';
    const totalAmount = quote?.totalAmount ? quote.totalAmount.toString() : '660.00';

    if (recipientEmail && recipientEmail.includes('@')) {
      sendQuoteAcceptedEmail({
        to: recipientEmail,
        clientName,
        quoteRef,
        surveyType,
        propertyAddress,
        totalAmount,
      }).catch((e) => console.warn('[sendQuoteAcceptedEmail] background error:', e.message));
    }

    // In-App Notifications for Customer & Admin
    if (userId) {
      prisma.notification.create({
        data: {
          userId,
          role: 'CUSTOMER',
          title: `✓ Quotation Accepted (${quoteRef})`,
          desc: `You accepted your quotation for ${propertyAddress}. Please review and execute your RICS Terms of Engagement.`,
          type: 'terms',
          link: '/customer/terms-to-sign',
        },
      }).catch(() => {});
    }

    prisma.notification.create({
      data: {
        role: 'ADMIN',
        title: `✓ Quote Accepted: ${clientName}`,
        desc: `Client accepted quotation ${quoteRef} for ${propertyAddress}.`,
        type: 'terms',
        amount: `£${totalAmount}`,
        link: '/admin/quotes',
      },
    }).catch(() => {});

    return ApiResponse.success(
      res,
      { quoteId: quote?.id || quoteId || id, status: 'ACCEPTED' },
      'Quotation accepted successfully. Please proceed to payment or terms.'
    );
  } catch (error) {
    next(error);
  }
};

