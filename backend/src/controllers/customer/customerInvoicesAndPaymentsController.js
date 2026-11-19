import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendInvoiceReceiptEmail } from '../../services/emailService.js';

/**
 * Customer Menu 8: Invoices & Payments (/customer/invoices-and-payments)
 */
export const getCustomerInvoices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const invoices = await prisma.invoice.findMany({
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { invoices, total: invoices.length });
  } catch (error) {
    next(error);
  }
};

export const payInvoiceWithCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'STRIPE_CARD', stripePaymentIntentId } = req.body;
    const invoiceId = parseInt(id);
    const userId = req.user.id;
    const userEmail = req.user.email;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { clientEmail: userEmail },
        ],
      },
      include: { job: true },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice record not found');
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('This invoice has already been settled');
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paymentMethod,
        stripePaymentIntentId: stripePaymentIntentId || `pi_sim_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Advance job stage to PAID if it was in QUOTE
    if (invoice.job && invoice.job.stage === 'QUOTE') {
      await prisma.job.update({
        where: { id: invoice.jobId },
        data: { stage: 'PAID' },
      });
    }

    await prisma.auditLog.create({
      data: {
        jobId: invoice.jobId,
        userId: req.user.id,
        action: 'PAYMENT_SETTLED_BY_CUSTOMER',
        details: `Customer settled £${invoice.total} via ${paymentMethod} for invoice ${invoice.invoiceNumber}`,
      },
    });

    // Dispatch Official HMRC-compliant VAT Receipt Email to Customer & CC Admin
    try {
      const recipientEmail = req.user.email || invoice.clientEmail || invoice.job?.clientEmail || userEmail;
      if (recipientEmail && recipientEmail.includes('@')) {
        sendInvoiceReceiptEmail({
          to: recipientEmail,
          clientName: req.user.name || invoice.clientName || invoice.job?.clientName || 'Valued Client',
          invoiceRef: invoice.invoiceNumber,
          amount: invoice.total,
          paymentMethod: 'Online Card (Stripe Gateway)',
          propertyAddress: invoice.job?.propertyAddress || 'Subject Property',
        }).catch((e) => console.warn('[sendInvoiceReceiptEmail] background error:', e.message));
      }
    } catch (emailErr) {
      console.warn('[sendInvoiceReceiptEmail] warning:', emailErr.message);
    }

    // In-App Notifications for Customer & Admin
    try {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          role: 'CLIENT',
          title: `Payment Received - £${invoice.total}`,
          desc: `Your payment of £${invoice.total} for invoice ${invoice.invoiceNumber} has cleared. HMRC 20% VAT receipt issued.`,
          type: 'PAYMENT',
          amount: parseFloat(invoice.total) || 0,
          link: '/customer/invoices-and-payments',
        },
      });

      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Invoice Settled - £${invoice.total}`,
          desc: `${req.user.name || 'Client'} paid invoice ${invoice.invoiceNumber} via Stripe Card for ${invoice.job?.propertyAddress || 'Subject Property'}.`,
          type: 'PAYMENT',
          amount: parseFloat(invoice.total) || 0,
          link: '/admin/finance/invoices',
        },
      });
    } catch (notifErr) {
      console.warn('[payInvoiceWithCard] notification create warning:', notifErr.message);
    }

    return ApiResponse.success(
      res,
      { invoice: updated },
      'Payment settled successfully. Your UK 20% VAT receipt has been issued.'
    );
  } catch (error) {
    next(error);
  }
};

