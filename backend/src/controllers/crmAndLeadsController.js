import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
    const reference = `LEAD-2026-${String(count + 101).padStart(3, '0')}`;

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

