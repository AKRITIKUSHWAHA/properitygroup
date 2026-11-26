import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateQuoteReference, generateInvoiceNumber } from '../utils/references.js';

export const getQuotes = async (req, res, next) => {
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

export const createQuote = async (req, res, next) => {
  try {
    const { jobId, leadId, baseFee, inclusions, validDays = 30 } = req.body;

    if (!baseFee || baseFee <= 0) {
      throw ApiError.badRequest('Valid base fee is required');
    }

    const fee = parseFloat(baseFee);
    const vatRate = 20.0; // UK 20% VAT
    const vatAmount = parseFloat(((fee * vatRate) / 100).toFixed(2));
    const totalAmount = parseFloat((fee + vatAmount).toFixed(2));

    const reference = await generateQuoteReference();

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

    return ApiResponse.created(res, { quote }, 'Quote created and dispatched');
  } catch (error) {
    next(error);
  }
};

export const acceptQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quoteId = parseInt(id);

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { job: true },
    });

    if (!quote) {
      throw ApiError.notFound('Quote not found');
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // If linked to a job, advance to PAID or generate invoice
    if (quote.jobId) {
      const invoiceNumber = await generateInvoiceNumber();

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          jobId: quote.jobId,
          clientName: quote.job.clientName,
          clientEmail: quote.job.clientEmail,
          subtotal: quote.baseFee,
          vatAmount: quote.vatAmount,
          total: quote.totalAmount,
          status: 'PENDING',
        },
      });
    }

    return ApiResponse.success(res, { quote: updatedQuote }, 'Quote accepted');
  } catch (error) {
    next(error);
  }
};

