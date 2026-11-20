import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getInvoices = async (req, res, next) => {
  try {
    const { status, jobId } = req.query;
    const user = req.user;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (jobId) where.jobId = parseInt(jobId);

    if (user.role === 'CUSTOMER') {
      where.job = { clientId: user.id };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        job: { select: { id: true, reference: true, propertyAddress: true, clientName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { invoices, total: invoices.length });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'BACS_TRANSFER', bacsReference, stripePaymentIntentId } = req.body;
    const invoiceId = parseInt(id);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { job: true },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw ApiError.badRequest('Invoice has already been paid');
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paymentMethod,
        bacsReference,
        stripePaymentIntentId,
        paidAt: new Date(),
      },
    });

    // Advance job to PAID stage if it was in QUOTE stage
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
        action: 'PAYMENT_SETTLED',
        details: `Settled £${invoice.total} via ${paymentMethod} (Invoice: ${invoice.invoiceNumber})`,
      },
    });

    return ApiResponse.success(res, { invoice: updatedInvoice }, 'Payment recorded and invoice marked as PAID');
  } catch (error) {
    next(error);
  }
};

