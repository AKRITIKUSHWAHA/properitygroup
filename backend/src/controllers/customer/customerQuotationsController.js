import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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
    const userEmail = req.user.email;
    const userId = req.user.id;

    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        OR: [
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
          { lead: { clientEmail: userEmail } },
        ],
      },
      include: { job: true },
    });

    if (!quote) {
      throw ApiError.notFound('Quotation not found or does not belong to your account');
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

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
