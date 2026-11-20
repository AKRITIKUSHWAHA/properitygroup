import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendWebsiteEnquiryNotificationEmail } from '../services/emailService.js';

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

