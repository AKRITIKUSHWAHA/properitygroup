import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendWebsiteEnquiryNotificationEmail, sendQuoteProposalEmail } from '../services/emailService.js';

/**
 * Superadmin Menu 5: CRM & Leads (Leads, Call Notes, Complaints Log)
 */
export const getCrmAndLeads = async (req, res, next) => {
  try {
    const { status, source, search } = req.query;
    const where = {};

    if (status) where.status = status.toUpperCase();
    if (source) where.source = source.toUpperCase();
    if (search) {
      where.OR = [
        { clientName: { contains: search } },
        { clientEmail: { contains: search } },
        { propertyAddress: { contains: search } },
        { postcode: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, branchName: true } },
        callLogs: { orderBy: { callTime: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
        quotes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { leads, total: leads.length });
  } catch (error) {
    next(error);
  }
};

export const getCrmMetrics = async (req, res, next) => {
  try {
    const [totalLeads, convertedLeads, newLeads] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'CONVERTED' } }),
      prisma.lead.count({ where: { status: 'NEW' } }),
    ]);

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    return ApiResponse.success(res, {
      inboundLeads: totalLeads,
      converted: convertedLeads,
      conversionRate: `${conversionRate}%`,
      newLeads,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      postcode,
      serviceType = 'RICS Level 2 Home Survey',
      propertyType,
      estimatedValue,
      source = 'WEBSITE',
      companyId,
    } = req.body;

    if (!clientName || !clientEmail || !propertyAddress || !postcode) {
      throw ApiError.badRequest('Client name, email, property address and postcode are required');
    }

    const count = await prisma.lead.count();
    const isLsd = String(source || '').toUpperCase().includes('LSD') || String(source || '').toUpperCase().includes('LOCAL');
    const prefix = isLsd ? 'LSD' : 'NJS';
    const reference = `${prefix}-2026-${String(count + 101).padStart(4, '0')}`;

    const lead = await prisma.lead.create({
      data: {
        reference,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        clientPhone,
        propertyAddress,
        postcode: postcode.toUpperCase(),
        serviceType,
        propertyType,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        source: source.toUpperCase(),
        companyId: companyId ? parseInt(companyId) : null,
        status: 'NEW',
      },
    });

    return ApiResponse.created(res, { lead }, 'CRM lead captured');
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, estimatedValue } = req.body;
    const numId = Number(id);

    const where = !isNaN(numId) && String(numId) === String(id) ? { id: numId } : { reference: String(id) };

    const updateData = {};
    if (status) updateData.status = status.toUpperCase();
    if (estimatedValue !== undefined && !isNaN(Number(estimatedValue))) {
      updateData.estimatedValue = parseFloat(estimatedValue);
    }

    const lead = await prisma.lead.update({
      where,
      data: updateData,
    });

    const upperStatus = (status || '').toUpperCase();

    // 1. If status is QUOTE_SENT or QUOTED, sync/create prisma.quote, dispatch proposal email & in-app notification
    if (upperStatus === 'QUOTE_SENT' || upperStatus === 'QUOTED') {
      try {
        const total = lead.estimatedValue || (estimatedValue ? parseFloat(estimatedValue) : 660.0);
        const baseFee = Math.round((total / 1.2) * 100) / 100;
        const vatAmount = Math.round((total - baseFee) * 100) / 100;

        const existingQuote = await prisma.quote.findFirst({
          where: { leadId: lead.id },
        });

        let quoteRef = `QTE-2026-${lead.id}`;
        if (existingQuote) {
          quoteRef = existingQuote.reference;
          await prisma.quote.update({
            where: { id: existingQuote.id },
            data: {
              baseFee,
              vatAmount,
              totalAmount: total,
              status: 'SENT',
            },
          });
        } else {
          const qCount = await prisma.quote.count().catch(() => 0);
          quoteRef = `QTE-2026-${String(qCount + 101).padStart(3, '0')}`;
          await prisma.quote.create({
            data: {
              reference: quoteRef,
              leadId: lead.id,
              baseFee,
              vatRate: 20.0,
              vatAmount,
              totalAmount: total,
              status: 'SENT',
              validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Dispatch Proposal Email (Resend)
        if (lead.clientEmail) {
          const frontendBase = process.env.CLIENT_URL?.split(',')[0] || process.env.FRONTEND_URL || 'http://localhost:5175';
          const quoteLink = `${frontendBase}/customer/quotations?quoteRef=${encodeURIComponent(quoteRef)}&property=${encodeURIComponent(lead.propertyAddress || '')}&email=${encodeURIComponent(lead.clientEmail)}`;
          sendQuoteProposalEmail({
            to: lead.clientEmail,
            clientName: lead.clientName || 'Valued Client',
            quoteAmount: total.toFixed(2),
            surveyType: lead.serviceType || 'RICS Level 2 Home Survey',
            propertyAddress: lead.propertyAddress || 'Subject Property',
            quoteLink,
          }).catch((err) => console.warn('[sendQuoteProposalEmail lead] warning:', err.message));
        }

        // In-App Notification for Customer & Admin
        const targetUser = await prisma.user.findFirst({
          where: { email: lead.clientEmail },
        });

        await prisma.notification.create({
          data: {
            userId: targetUser?.id || null,
            role: 'CUSTOMER',
            title: 'Formal Survey Quotation Ready',
            desc: `A formal RICS quotation of £${total.toFixed(2)} has been prepared for ${lead.propertyAddress || 'your property'}.`,
            type: 'QUOTE',
            amount: `£${total.toFixed(2)}`,
            link: '/customer/quotations',
          },
        }).catch((err) => console.warn('Customer quote notification error:', err.message));

        await prisma.notification.create({
          data: {
            role: 'ADMIN',
            title: `Quote Proposal Issued - £${total.toFixed(2)}`,
            desc: `Quote proposal ${quoteRef} issued for ${lead.clientName} (${lead.clientEmail}).`,
            type: 'QUOTE',
            amount: `£${total.toFixed(2)}`,
            link: '/admin/finance/quotations',
          },
        }).catch(() => {});
      } catch (qErr) {
        console.warn('[updateLeadStatus] quote sync warning:', qErr.message);
      }
    }

    // 2. If status is CONVERTED (e.g. Admin clicked "Convert to Won Job"), create prisma.job, term & invoice
    if (upperStatus === 'CONVERTED') {
      try {
        const existingJob = await prisma.job.findFirst({
          where: { leadId: lead.id },
        });

        let jobId = existingJob?.id;
        if (!existingJob) {
          const jobRef = lead.reference?.startsWith('NJS-')
            ? lead.reference.replace('NJS-', 'JOB-')
            : `JOB-2026-${lead.id}`;

          const newJob = await prisma.job.create({
            data: {
              reference: jobRef,
              clientName: lead.clientName,
              clientEmail: lead.clientEmail,
              clientPhone: lead.clientPhone,
              propertyAddress: lead.propertyAddress,
              postcode: lead.postcode,
              serviceType: lead.serviceType,
              stage: 'ACCEPTED',
              leadId: lead.id,
            },
          });
          jobId = newJob.id;
        } else if (existingJob.stage === 'QUOTE') {
          await prisma.job.update({
            where: { id: existingJob.id },
            data: { stage: 'ACCEPTED' },
          });
        }

        // Ensure terms record exists
        if (jobId) {
          const existingTerm = await prisma.term.findFirst({ where: { jobId } });
          if (!existingTerm) {
            await prisma.term.create({
              data: {
                reference: `TRM-2026-${jobId}`,
                jobId,
                clientName: lead.clientName,
                clientEmail: lead.clientEmail,
                documentTitle: `${lead.serviceType} Terms of Engagement`,
                content: 'RICS Standard Terms of Engagement',
                signed: false,
              },
            }).catch(() => {});
          }

          // Ensure invoice record exists
          const existingInvoice = await prisma.invoice.findFirst({ where: { jobId } });
          if (!existingInvoice) {
            const total = lead.estimatedValue || 660.0;
            const subtotal = Math.round((total / 1.2) * 100) / 100;
            const vat = Math.round((total - subtotal) * 100) / 100;
            await prisma.invoice.create({
              data: {
                invoiceNumber: `INV-2026-${String(jobId).padStart(3, '0')}`,
                jobId,
                clientName: lead.clientName,
                clientEmail: lead.clientEmail,
                subtotal,
                vatAmount: vat,
                total,
                status: 'PENDING',
              },
            }).catch(() => {});
          }
        }
      } catch (cErr) {
        console.warn('[updateLeadStatus] convert to job warning:', cErr.message);
      }
    }

    return ApiResponse.success(res, { lead }, `Lead status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// Client Requirement #1: Call Notes
export const addCallLog = async (req, res, next) => {
  try {
    const { leadId, jobId, callerName, summary, durationMinutes } = req.body;

    if (!summary || !callerName) {
      throw ApiError.badRequest('Caller name and call summary are required');
    }

    const callLog = await prisma.callLog.create({
      data: {
        leadId: leadId ? parseInt(leadId) : null,
        jobId: jobId ? parseInt(jobId) : null,
        callerName,
        summary,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        handlerName: req.user.name,
      },
    });

    return ApiResponse.created(res, { callLog }, 'Call log appended');
  } catch (error) {
    next(error);
  }
};

// Client Requirement #1: Dedicated Complaints Log
export const addComplaint = async (req, res, next) => {
  try {
    const { leadId, jobId, title, description, severity = 'MEDIUM' } = req.body;

    if (!title || !description) {
      throw ApiError.badRequest('Complaint title and description are required');
    }

    const complaint = await prisma.complaintLog.create({
      data: {
        leadId: leadId ? parseInt(leadId) : null,
        jobId: jobId ? parseInt(jobId) : null,
        title,
        description,
        severity: severity.toUpperCase(),
        status: 'OPEN',
      },
    });

    return ApiResponse.created(res, { complaint }, 'Complaint registered');
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const complaintId = parseInt(id);

    const complaint = await prisma.complaintLog.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        resolutionNotes,
        resolvedAt: new Date(),
      },
    });

    return ApiResponse.success(res, { complaint }, 'Complaint marked as resolved');
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook / Intake for Local Surveyors Direct (LSD) Leads
 * Endpoint: POST /api/v1/crm-and-leads/lsd
 * Parses incoming payload, prevents duplicate enquiries within 24h,
 * tags source as "Local Surveyors Direct", and dispatches instant Admin notification.
 */
export const ingestLsdLead = async (req, res, next) => {
  try {
    const body = req.body || {};

    const clientName = String(body.clientName || body.name || body.customerName || body.contactName || '').trim();
    const clientEmail = String(body.clientEmail || body.email || body.customerEmail || '').trim().toLowerCase();
    const clientPhone = String(body.clientPhone || body.phone || body.customerPhone || body.telephone || '').trim();
    const postcode = String(body.postcode || body.propertyPostcode || '').trim().toUpperCase();
    const propertyAddress = String(body.propertyAddress || body.address || body.propertyLocation || postcode || 'UK Property').trim();
    const serviceType = String(body.serviceType || body.surveyType || body.serviceName || 'RICS Level 2 Home Survey').trim();
    const propertyType = body.propertyType ? String(body.propertyType).trim() : null;
    const estimatedValue = body.estimatedValue ? parseFloat(body.estimatedValue) : null;
    const notes = String(body.notes || body.additionalNotes || body.comments || body.details || '').trim();

    if (!clientName || (!clientEmail && !clientPhone)) {
      throw ApiError.badRequest('Client name and at least email or phone number are required for LSD ingestion');
    }

    // 1. Duplicate Enquiry Prevention (check within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicateOr = [];
    if (clientEmail) {
      duplicateOr.push({ clientEmail, postcode: postcode || undefined });
    }
    if (clientPhone) {
      duplicateOr.push({ clientPhone });
    }

    if (duplicateOr.length > 0) {
      const existingLead = await prisma.lead.findFirst({
        where: {
          createdAt: { gte: oneDayAgo },
          OR: duplicateOr,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingLead) {
        return ApiResponse.success(
          res,
          { lead: existingLead, duplicate: true, reference: existingLead.reference },
          'Duplicate LSD enquiry detected within 24 hours. Existing lead preserved without duplication.'
        );
      }
    }

    // 2. Generate LSD-2026-XXXX reference
    const count = await prisma.lead.count();
    const reference = `LSD-2026-${String(count + 101).padStart(4, '0')}`;

    // 3. Create lead in database
    const lead = await prisma.lead.create({
      data: {
        reference,
        clientName,
        clientEmail: clientEmail || 'client@demo.com',
        clientPhone: clientPhone || null,
        propertyAddress: propertyAddress || postcode || 'UK Property',
        postcode: postcode || 'N/A',
        serviceType,
        propertyType,
        estimatedValue,
        source: 'Local Surveyors Direct',
        status: 'NEW',
      },
    });

    // 4. Attach notes if provided
    if (notes) {
      try {
        await prisma.callLog.create({
          data: {
            leadId: lead.id,
            callerName: 'LSD Ingestion Gateway',
            summary: `[LSD Enquiry Notes]: ${notes}`,
            durationMinutes: 0,
          },
        });
      } catch (logErr) {
        console.warn('Call log attachment warning:', logErr.message);
      }
    }

    // 5. Instant Admin Email Notification & Customer Acknowledgment
    try {
      await sendWebsiteEnquiryNotificationEmail({
        referenceId: reference,
        enquiryCategory: 'SURVEY_QUOTE',
        customerName: clientName,
        customerEmail: clientEmail,
        customerPhone: clientPhone,
        serviceName: serviceType,
        propertyAddress,
        propertyPostcode: postcode,
        additionalNotes: notes,
        sourcePage: 'Local Surveyors Direct (LSD) Lead Ingestion',
      });
    } catch (emailErr) {
      console.warn('LSD lead notification email warning:', emailErr.message);
    }

    // 6. In-App Notification for Admin
    try {
      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: 'New LSD Lead Received',
          desc: `Local Surveyors Direct lead received for ${clientName} (${postcode || propertyAddress}). Ref: ${reference}`,
          type: 'ENQUIRY',
          link: '/admin/crm-and-leads',
        },
      });
    } catch (_) {}

    return ApiResponse.created(
      res,
      { lead, reference, source: 'Local Surveyors Direct' },
      'LSD lead ingested successfully and admin notified'
    );
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    const where = !isNaN(numId) && String(numId) === String(id)
      ? { OR: [{ id: numId }, { reference: String(id) }] }
      : { reference: String(id) };

    const targetLead = await prisma.lead.findFirst({ where });
    if (!targetLead) {
      return ApiResponse.success(res, null, 'Lead deleted successfully');
    }

    await prisma.callLog.deleteMany({ where: { leadId: targetLead.id } }).catch(() => {});
    await prisma.complaintLog.deleteMany({ where: { leadId: targetLead.id } }).catch(() => {});
    await prisma.quote.deleteMany({ where: { leadId: targetLead.id } }).catch(() => {});
    await prisma.job.updateMany({ where: { leadId: targetLead.id }, data: { leadId: null } }).catch(() => {});
    await prisma.lead.delete({ where: { id: targetLead.id } });

    return ApiResponse.success(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

