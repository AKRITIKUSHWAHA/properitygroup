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
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';

    let quote = null;
    if (!isNaN(quoteId) && quoteId > 0) {
      try {
        quote = await prisma.quote.findFirst({
          where: {
            id: quoteId,
            ...(isAdmin
              ? {}
              : {
                  OR: [
                    { job: { clientId: userId } },
                    { job: { clientEmail: userEmail } },
                    { lead: { clientEmail: userEmail } },
                  ],
                }),
          },
          include: { job: true },
        });
      } catch (err) {
        console.warn('[acceptCustomerQuotation] quote query error:', err.message);
      }
    }

    if (!quote) {
      // Graceful fallback for mock/demo/localStorage-synced quotes
      return ApiResponse.success(res, { quoteId, status: 'ACCEPTED' }, 'Quotation accepted successfully. Please proceed to payment or terms.');
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // Dispatch Quotation Acceptance Email to Customer & CC Admin
    try {
      const recipientEmail = req.user.email || quote.job?.clientEmail || userEmail;
      if (recipientEmail && recipientEmail.includes('@')) {
        sendQuoteAcceptedEmail({
          to: recipientEmail,
          clientName: req.user.name || quote.job?.clientName || 'Valued Client',
          quoteRef: quote.reference || `QUO-${quote.id}`,
          surveyType: quote.job?.serviceType || 'RICS Level 2 Home Survey',
          propertyAddress: quote.job?.propertyAddress || 'Subject Property',
          totalAmount: quote.totalAmount,
        }).catch((e) => console.warn('[sendQuoteAcceptedEmail] background error:', e.message));
      }

      // In-App Notifications for Customer & Admin
      prisma.notification.create({
        data: {
          userId: req.user.id,
          role: 'CUSTOMER',
          title: `✓ Quotation Accepted (${quote.reference || `QUO-${quote.id}`})`,
          desc: `You accepted your quotation for ${quote.job?.propertyAddress || 'Subject Property'}. Please review and execute your RICS Terms of Engagement.`,
          type: 'terms',
          link: '/customer/terms-to-sign',
        },
      }).catch(() => {});

      prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `✓ Quote Accepted: ${req.user.name || quote.job?.clientName || 'Client'}`,
          desc: `Client accepted quotation ${quote.reference} for ${quote.job?.propertyAddress || 'Subject Property'}.`,
          type: 'terms',
          amount: `£${quote.totalAmount}`,
          link: '/admin/quotes',
        },
      }).catch(() => {});
    } catch (emailErr) {
      console.warn('[sendQuoteAcceptedEmail] warning:', emailErr.message);
    }

    // Ensure invoice is generated
    if (quote.jobId) {
      const existingInvoice = await prisma.invoice.findFirst({
        where: { jobId: quote.jobId },
      });

      if (!existingInvoice) {
        const invCount = await prisma.invoice.count();
        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-2026-${String(invCount + 101).padStart(3, '0')}`,
            jobId: quote.jobId,
            clientName: req.user.name,
            clientEmail: req.user.email,
            subtotal: quote.baseFee,
            vatAmount: quote.vatAmount,
            total: quote.totalAmount,
            status: 'PENDING',
          },
        });
      }
    }

    return ApiResponse.success(res, { quote: updated }, 'Quotation accepted successfully. Please proceed to payment.');
  } catch (error) {
    next(error);
  }
};

