import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 8: Quotations & Payments (UK 20% VAT, Invoicing, Stripe & BACS)
 */
export const getQuotesList = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        job: { select: { id: true, reference: true, propertyAddress: true, clientName: true } },
        lead: { select: { id: true, reference: true, clientName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { quotes, total: quotes.length });
  } catch (error) {
    next(error);
  }
};

export const getInvoicesList = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

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

export const getQuotationsAndPaymentsMetrics = async (req, res, next) => {
  try {
    const [totalQuoted, paidInvoices, pendingInvoices] = await Promise.all([
      prisma.quote.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'PENDING' },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return ApiResponse.success(res, {
      totalQuotedValue: `£${(totalQuoted._sum.totalAmount || 0).toLocaleString()}`,
      paidRevenue: `£${(paidInvoices._sum.total || 0).toLocaleString()}`,
      paidCount: paidInvoices._count.id,
      outstandingAmount: `£${(pendingInvoices._sum.total || 0).toLocaleString()}`,
      outstandingCount: pendingInvoices._count.id,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req, res, next) => {
  try {
    const { jobId, leadId, baseFee, inclusions, validDays = 30 } = req.body;

    if (!baseFee || parseFloat(baseFee) <= 0) {
      throw ApiError.badRequest('Valid base inspection fee is required');
    }

    const fee = parseFloat(baseFee);
    const vatRate = 20.0; // Statutory UK 20% VAT
    const vatAmount = parseFloat(((fee * vatRate) / 100).toFixed(2));
    const totalAmount = parseFloat((fee + vatAmount).toFixed(2));

    const count = await prisma.quote.count();
    const reference = `QTE-2026-${String(count + 101).padStart(3, '0')}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const quote = await prisma.quote.create({
      data: {
        reference,
        jobId: jobId ? parseInt(jobId) : null,
        leadId: leadId ? parseInt(leadId) : null,
        baseFee: fee,
        vatRate,
        vatAmount,
        totalAmount,
        inclusions: inclusions ? JSON.stringify(inclusions) : null,
        status: 'SENT',
        validUntil,
      },
    });

    return ApiResponse.created(res, { quote }, 'Quote issued with 20% UK VAT calculated');
  } catch (error) {
    next(error);
  }
};

export const settleBacsPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bacsReference, amountPaid } = req.body;
    const invoiceId = parseInt(id);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { job: true },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice record not found');
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paymentMethod: 'BACS_TRANSFER',
        bacsReference: bacsReference || `BACS-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Advance job to PAID if currently QUOTE
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
        action: 'BACS_PAYMENT_SETTLED',
        details: `Reconciled £${invoice.total} BACS payment. Ref: ${bacsReference || 'Bank Transfer'}`,
      },
    });

    return ApiResponse.success(res, { invoice: updated }, 'BACS payment confirmed and reconciled');
  } catch (error) {
    next(error);
  }
};
