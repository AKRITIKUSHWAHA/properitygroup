import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { issueQuote } from '../services/quoteService.js';
import {
  sendQuoteAcceptedEmail,
  sendInvoiceReceiptEmail,
  sendPortalActivationEmail,
} from '../services/emailService.js';
import { ensureCustomerUser, generateActivationToken } from '../services/customerUserService.js';

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
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            serviceType: true,
          },
        },
        lead: {
          select: {
            id: true,
            reference: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
            propertyAddress: true,
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

export const getInvoicesList = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            clientName: true,
            clientEmail: true,
            clientPhone: true,
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
    const {
      jobId,
      leadId,
      baseFee,
      discount = 0,
      surveyType,
      inclusions,
      validDays = 30,
    } = req.body;

    if (!baseFee || parseFloat(baseFee) <= 0) {
      throw ApiError.badRequest('Valid base inspection fee is required');
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const result = await issueQuote({
      leadId,
      jobId,
      baseFee,
      discount,
      serviceType: surveyType,
      inclusions: inclusions ? (typeof inclusions === 'string' ? inclusions : JSON.stringify(inclusions)) : undefined,
      validUntil,
      issuedBy: req.user?.id,
    });

    const { quote, emailSent, emailError } = result;
    const recipientEmail = quote.lead?.clientEmail || quote.job?.clientEmail || '';

    return ApiResponse.created(
      res,
      { quote, emailSent, emailError, recipientEmail },
      emailSent
        ? `Quote ${quote.reference} issued and formal proposal emailed to client`
        : `Quote ${quote.reference} issued in portal (Email delivery: ${emailError || 'Resend not configured'})`
    );
  } catch (error) {
    next(error);
  }
};

export const updateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      baseFee,
      discount,
      extras,
      surveyType,
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
    } = req.body;

    let quoteId = parseInt(id, 10);
    let quote = null;

    if (!isNaN(quoteId)) {
      quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    }

    if (!quote) {
      quote = await prisma.quote.findFirst({ where: { reference: String(id) } });
    }

    if (!quote) {
      throw ApiError.notFound('Quotation record not found');
    }

    const currentFee = baseFee !== undefined ? parseFloat(baseFee) : quote.baseFee;
    const currentDiscount = discount !== undefined ? Math.max(0, parseFloat(discount)) : 0;

    let extrasTotal = 0;
    if (Array.isArray(extras)) {
      extrasTotal = extras.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }

    const subtotal = Math.max(0, currentFee + extrasTotal - currentDiscount);
    const vatRate = 20.0;
    const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + vatAmount).toFixed(2));

    let parsedInclusions = {};
    try {
      if (quote.inclusions) {
        parsedInclusions = JSON.parse(quote.inclusions);
      }
    } catch {
      // Harmless: Inclusions may be legacy plain text string or invalid JSON, fall back to empty object
      parsedInclusions = {};
    }

    const updatedInclusions = {
      ...parsedInclusions,
      ...(clientName ? { client: clientName } : {}),
      ...(clientEmail ? { clientEmail } : {}),
      ...(clientPhone ? { clientPhone } : {}),
      ...(propertyAddress ? { property: propertyAddress } : {}),
      ...(surveyType ? { surveyType } : {}),
      discount: currentDiscount,
      extras: Array.isArray(extras) ? extras : parsedInclusions.extras || [],
    };

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        baseFee: currentFee,
        vatRate,
        vatAmount,
        totalAmount,
        inclusions: JSON.stringify(updatedInclusions),
      },
      include: {
        job: true,
        lead: true,
      },
    });

    if (updated.leadId) {
      try {
        await prisma.lead.update({
          where: { id: updated.leadId },
          data: { estimatedValue: totalAmount },
        });
      } catch (err) {
        console.error('[quotationsAndPayments] Failed to sync estimatedValue to lead:', err.message);
      }
    }

    if (updated.jobId) {
      try {
        await prisma.invoice.updateMany({
          where: { jobId: updated.jobId, status: { not: 'PAID' } },
          data: { subtotal, vatAmount, total: totalAmount },
        });
      } catch (err) {
        console.error('[quotationsAndPayments] Failed to sync fee updates to non-paid invoices:', err.message);
      }
    }

    return ApiResponse.success(
      res,
      { quote: updated },
      `Quotation ${quote.reference} updated to £${totalAmount.toFixed(2)} (inc. 20% VAT)`
    );
  } catch (error) {
    next(error);
  }
};

export const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let quoteId = parseInt(id, 10);
    let quote = null;

    if (!isNaN(quoteId)) {
      quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    }

    if (!quote) {
      quote = await prisma.quote.findFirst({ where: { reference: String(id) } });
    }

    // Fallback reference resolution: match without prefix or partial reference (e.g. QUO-2026-373 vs QTE-2026-373)
    if (!quote) {
      const cleanRef = String(id).replace(/^(QUO|QTE)-/i, '');
      quote = await prisma.quote.findFirst({
        where: {
          OR: [
            { reference: { contains: cleanRef } },
            { reference: `QTE-${cleanRef}` },
            { reference: `QUO-${cleanRef}` },
          ],
        },
      });
    }

    const normalizedStatus = (status || 'ACCEPTED').toUpperCase();

    if (!quote) {
      throw ApiError.notFound(`Quotation not found with identifier: ${id}`);
    }

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: normalizedStatus === 'PAID' ? 'ACCEPTED' : normalizedStatus,
        acceptedAt: normalizedStatus === 'ACCEPTED' || normalizedStatus === 'PAID' ? new Date() : quote.acceptedAt,
      },
      include: { job: true, lead: true },
    });

    let emailSent = false;
    let emailError = null;
    if (normalizedStatus === 'ACCEPTED' && quote.status !== 'ACCEPTED') {
      try {
        const clientEmail = updated.lead?.clientEmail || updated.job?.clientEmail;
        if (clientEmail && clientEmail.includes('@')) {
          const emailRes = await sendQuoteAcceptedEmail({
            to: clientEmail,
            clientName: updated.lead?.clientName || updated.job?.clientName || 'Valued Client',
            quoteRef: updated.reference,
            surveyType: updated.job?.serviceType || updated.lead?.serviceType || 'RICS Level 2 Home Survey',
            propertyAddress: updated.job?.propertyAddress || updated.lead?.propertyAddress || 'Subject Property',
            totalAmount: updated.totalAmount,
          });
          emailSent = Boolean(emailRes?.success);
          emailError = emailRes?.error || null;
        }
      } catch (err) {
        console.error('[sendQuoteAcceptedEmail updateQuoteStatus] error:', err.message);
        emailError = err.message;
      }
    }

    return ApiResponse.success(res, { quote: updated, emailSent, emailError }, 'Quotation status updated');
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

    const transactionOps = [
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paymentMethod: 'BACS_TRANSFER',
          bacsReference: bacsReference || `BACS-${Date.now()}`,
          paidAt: new Date(),
        },
      }),
    ];

    // Advance job to PAID if currently before PAID
    if (invoice.job && ['QUOTE', 'ACCEPTED'].includes(invoice.job.stage)) {
      transactionOps.push(
        prisma.job.update({
          where: { id: invoice.jobId },
          data: { stage: 'PAID' },
        })
      );
    }

    const [updated] = await prisma.$transaction(transactionOps);

    await prisma.auditLog.create({
      data: {
        jobId: invoice.jobId,
        userId: req.user.id,
        action: 'BACS_PAYMENT_SETTLED',
        details: `Reconciled £${invoice.total} BACS payment. Ref: ${bacsReference || 'Bank Transfer'}`,
      },
    });

    // Dispatch Official VAT Receipt Email for BACS Settlement
    let emailSent = false;
    let emailError = null;
    try {
      const recipientEmail = invoice.clientEmail || invoice.job?.clientEmail;
      if (recipientEmail && recipientEmail.includes('@')) {
        const emailRes = await sendInvoiceReceiptEmail({
          to: recipientEmail,
          clientName: invoice.clientName || invoice.job?.clientName || 'Valued Client',
          invoiceRef: invoice.invoiceNumber,
          amount: invoice.total,
          paymentMethod: `BACS Direct Settlement (Ref: ${bacsReference || 'Bank Transfer'})`,
          propertyAddress: invoice.job?.propertyAddress || 'Subject Property',
        });
        emailSent = Boolean(emailRes?.success);
        emailError = emailRes?.error || null;
      }
    } catch (err) {
      console.error('[sendInvoiceReceiptEmail BACS] error:', err.message);
      emailError = err.message;
    }

    // In-App Notifications for Client & Admin
    try {
      const recipientEmail = invoice.clientEmail || invoice.job?.clientEmail;
      let targetUser = null;
      if (recipientEmail) {
        targetUser = await prisma.user.findFirst({ where: { email: recipientEmail } });
      }
      const targetUserId = targetUser ? targetUser.id : invoice.job?.clientId;

      // Customer notification: "Payment received. Next: choose your inspection date" link /customer/my-bookings
      if (targetUserId) {
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            role: 'CUSTOMER',
            title: 'Payment Received',
            desc: 'Payment received. Next: choose your inspection date',
            type: 'PAYMENT',
            amount: `£${parseFloat(invoice.total || 0).toFixed(2)}`,
            link: '/customer/my-bookings',
          },
        });
      }

      // Deduplicated Admin notification
      if (invoice.jobId) {
        const existingAdminNotif = await prisma.notification.findFirst({
          where: {
            role: 'ADMIN',
            type: 'READY_TO_BOOK',
            link: `/admin/jobs/${invoice.jobId}`,
          },
        });

        if (!existingAdminNotif) {
          const clientName = invoice.clientName || invoice.job?.clientName || 'Client';
          const property = invoice.job?.propertyAddress || 'Subject Property';
          const amount = parseFloat(invoice.total || 0).toFixed(2);

          await prisma.notification.create({
            data: {
              role: 'ADMIN',
              title: `Payment Received - Ready to Book (£${amount})`,
              desc: `Payment received, ${clientName}, ${property}, £${amount}. Assign surveyor and book inspection.`,
              type: 'READY_TO_BOOK',
              amount: `£${amount}`,
              link: `/admin/jobs/${invoice.jobId}`,
            },
          });
        }
      }
    } catch (nErr) {
      console.error('[BACS notification error]:', nErr.message);
      if (invoice.jobId) {
        await prisma.auditLog.create({
          data: {
            jobId: invoice.jobId,
            userId: req.user?.id || null,
            action: 'NOTIFICATION_DISPATCH_FAILED',
            details: `Failed to create notification on BACS settlement: ${nErr.message}`,
          },
        }).catch((ae) => console.error('[AuditLog fallback error]:', ae.message));
      }
    }

    return ApiResponse.success(res, { invoice: updated, emailSent, emailError }, 'BACS payment confirmed and reconciled');
  } catch (error) {
    next(error);
  }
};

