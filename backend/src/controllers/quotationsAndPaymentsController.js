import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendQuoteProposalEmail } from '../services/emailService.js';

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
    const {
      jobId,
      leadId,
      client: inputClient,
      clientName,
      clientEmail: inputClientEmail,
      clientPhone,
      property: inputProperty,
      propertyAddress,
      surveyType: inputSurveyType,
      baseFee,
      discount = 0,
      inclusions,
      validDays = 30,
    } = req.body;

    const client = inputClient || clientName || '';
    const clientEmail = inputClientEmail || '';
    const property = inputProperty || propertyAddress || '';
    const surveyType = inputSurveyType || '';

    if (!baseFee || parseFloat(baseFee) <= 0) {
      throw ApiError.badRequest('Valid base inspection fee is required');
    }

    const fee = parseFloat(baseFee);
    const disc = parseFloat(discount) || 0;
    const subtotal = Math.max(0, fee - disc);
    const vatRate = 20.0; // Statutory UK 20% VAT
    const vatAmount = parseFloat(((subtotal * vatRate) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + vatAmount).toFixed(2));

    const count = await prisma.quote.count();
    const reference = `QTE-2026-${String(count + 101).padStart(3, '0')}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    let parsedLeadId = null;
    let leadRecord = null;
    if (leadId) {
      const numLead = Number(leadId);
      try {
        if (!isNaN(numLead) && String(numLead) === String(leadId)) {
          leadRecord = await prisma.lead.findUnique({ where: { id: numLead } });
        } else {
          leadRecord = await prisma.lead.findFirst({ where: { reference: String(leadId) } });
        }
      } catch (fErr) {}
      if (leadRecord) {
        parsedLeadId = leadRecord.id;
      }
    }

    let numericJobId = jobId ? parseInt(jobId, 10) : null;

    if (!numericJobId && property) {
      const existingJob = await prisma.job.findFirst({
        where: { propertyAddress: { contains: property.slice(0, 15) } },
        select: { id: true },
      });
      if (existingJob) numericJobId = existingJob.id;
    }

    const inclusionsData = inclusions
      ? (typeof inclusions === 'string' ? inclusions : JSON.stringify(inclusions))
      : JSON.stringify({ client, clientEmail, clientPhone, property, surveyType, discount: disc });

    const quote = await prisma.quote.create({
      data: {
        reference,
        jobId: numericJobId,
        leadId: parsedLeadId,
        baseFee: fee,
        vatRate,
        vatAmount,
        totalAmount,
        inclusions: inclusionsData,
        status: 'SENT',
        validUntil,
      },
      include: {
        job: { select: { id: true, reference: true, propertyAddress: true, clientName: true, clientEmail: true } },
        lead: { select: { id: true, reference: true, clientName: true } },
      },
    });

    // Also update lead status to QUOTE_SENT if lead exists
    if (parsedLeadId) {
      try {
        await prisma.lead.update({
          where: { id: parsedLeadId },
          data: { status: 'QUOTE_SENT' },
        });
      } catch (lErr) {}
    }

    // Dispatch formal RICS quote proposal email via Resend
    let recipientEmail = clientEmail || req.body.clientEmail || leadRecord?.clientEmail;
    let recipientName = client || req.body.clientName || leadRecord?.clientName || 'Valued Client';
    let targetProperty = property || req.body.propertyAddress || leadRecord?.propertyAddress || 'Subject Property';
    let targetSurveyType = surveyType || req.body.surveyType || leadRecord?.serviceType || 'RICS Level 2 Home Survey';

    if (parsedLeadId && (!recipientEmail || !recipientName)) {
      try {
        const lead = await prisma.lead.findUnique({ where: { id: parsedLeadId } });
        if (lead) {
          recipientEmail = recipientEmail || lead.clientEmail;
          recipientName = recipientName || lead.clientName;
          targetProperty = targetProperty || lead.propertyAddress;
          targetSurveyType = targetSurveyType || lead.serviceType;
        }
      } catch (err) {}
    }

    let emailSent = false;
    if (recipientEmail) {
      try {
        const emailRes = await sendQuoteProposalEmail({
          to: recipientEmail,
          clientName: recipientName || 'Valued Client',
          quoteAmount: totalAmount.toFixed(2),
          surveyType: targetSurveyType || 'RICS Level 2 Home Survey',
          propertyAddress: targetProperty || 'Subject Property',
          quoteLink: req.body.quoteLink || `${process.env.CLIENT_URL?.split(',')[0] || 'https://njspropertygroup.com'}/login`,
        });
        emailSent = Boolean(emailRes?.success);
      } catch (emailErr) {
        console.warn('Resend quotation email warning:', emailErr.message);
      }
    }

    return ApiResponse.created(
      res, 
      { quote, emailSent, recipientEmail }, 
      emailSent 
        ? `Quote issued and formal proposal emailed to ${recipientEmail}` 
        : 'Quote issued with 20% UK VAT calculated'
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

    if (!quote) {
      throw ApiError.notFound('Quotation record not found');
    }

    const normalizedStatus = (status || 'ACCEPTED').toUpperCase();
    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: normalizedStatus === 'PAID' ? 'ACCEPTED' : normalizedStatus,
        acceptedAt: normalizedStatus === 'ACCEPTED' || normalizedStatus === 'PAID' ? new Date() : quote.acceptedAt,
      },
    });

    return ApiResponse.success(res, { quote: updated }, 'Quotation status updated');
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

