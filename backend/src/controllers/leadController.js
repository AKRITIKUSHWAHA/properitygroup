import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getLeads = async (req, res, next) => {
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
        company: { select: { id: true, name: true } },
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

export const createLead = async (req, res, next) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      postcode,
      serviceType,
      propertyType,
      estimatedValue,
      source = 'WEBSITE',
      companyId,
    } = req.body;

    if (!clientName || !clientEmail || !propertyAddress || !postcode) {
      throw ApiError.badRequest('Client name, email, property address and postcode are required');
    }

    const count = await prisma.lead.count();
    const reference = `LEAD-2026-${String(count + 1).padStart(3, '0')}`;

    const lead = await prisma.lead.create({
      data: {
        reference,
        clientName,
        clientEmail,
        clientPhone,
        propertyAddress,
        postcode: postcode.toUpperCase(),
        serviceType: serviceType || 'RICS Level 2 Home Survey',
        propertyType,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        source: source.toUpperCase(),
        companyId: companyId ? parseInt(companyId) : null,
        status: 'NEW',
      },
    });

    return ApiResponse.created(res, { lead }, 'Lead created successfully');
  } catch (error) {
    next(error);
  }
};

// Client Requirement #1: Call Communication Notes
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

    return ApiResponse.created(res, { callLog }, 'Call log recorded successfully');
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

    return ApiResponse.created(res, { complaint }, 'Complaint registered in log');
  } catch (error) {
    next(error);
  }
};

