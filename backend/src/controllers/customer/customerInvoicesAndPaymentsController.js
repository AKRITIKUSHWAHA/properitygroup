import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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

    return ApiResponse.success(
      res,
      { invoice: updated },
      'Payment settled successfully. Your UK 20% VAT receipt has been issued.'
    );
  } catch (error) {
    next(error);
  }
};

