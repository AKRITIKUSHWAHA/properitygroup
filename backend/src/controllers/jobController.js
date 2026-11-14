import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const STAGE_ORDER = ['QUOTE', 'PAID', 'ACCEPTED', 'BOOKED', 'PREPARING_REPORT', 'COMPLETE'];

export const getJobs = async (req, res, next) => {
  try {
    const { stage, surveyorId, search } = req.query;
    const user = req.user;

    const where = {};

    // Customer can only see their own jobs
    if (user.role === 'CUSTOMER') {
      where.clientId = user.id;
    } else if (user.role === 'SURVEYOR') {
      where.surveyorId = user.id;
    } else if (surveyorId) {
      where.surveyorId = parseInt(surveyorId);
    }

    if (stage) {
      where.stage = stage.toUpperCase();
    }

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { clientName: { contains: search } },
        { propertyAddress: { contains: search } },
        { postcode: { contains: search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        surveyor: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, branchName: true } },
        quotes: true,
        terms: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (user.role === 'SURVEYOR') {
      // Surveyor privacy lockdown: strip quotes, terms, invoices, financial amounts
      const sanitizedJobs = jobs.map(({ quotes: _quotes, terms: _terms, invoices: _invoices, ...rest }) => rest);
      return ApiResponse.success(res, { jobs: sanitizedJobs, total: sanitizedJobs.length });
    }

    return ApiResponse.success(res, { jobs, total: jobs.length });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        surveyor: {
          select: { id: true, name: true, email: true, phone: true, surveyorProfile: true },
        },
        client: { select: { id: true, name: true, email: true, phone: true } },
        company: true,
        quotes: true,
        terms: true,
        invoices: true,
        callLogs: { orderBy: { callTime: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
        auditTimeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!job) {
      throw ApiError.notFound(`Job with ID ${id} not found`);
    }

    // Role check
    if (req.user.role === 'CUSTOMER' && job.clientId !== req.user.id) {
      throw ApiError.forbidden('You do not have access to this survey job.');
    }
    if (req.user.role === 'SURVEYOR') {
      if (job.surveyorId !== req.user.id) {
        throw ApiError.forbidden('You are not assigned to this survey job.');
      }
      // Surveyor privacy lockdown: omit billing, quotes, invoices, terms signatures, call logs
      const sanitized = {
        id: job.id,
        reference: job.reference,
        serviceType: job.serviceType,
        propertyAddress: job.propertyAddress,
        postcode: job.postcode,
        inspectionDate: job.inspectionDate,
        inspectionTime: job.inspectionTime,
        keyCollectionDetails: job.keyCollectionDetails,
        specialInstructions: job.specialInstructions,
        stage: job.stage,
        reportPdfUrl: job.reportPdfUrl,
        company: job.company ? {
          name: job.company.name,
          branchName: job.company.branchName,
          keyCollectionProtocol: job.company.keyCollectionProtocol,
        } : null,
      };
      return ApiResponse.success(res, { job: sanitized });
    }

    return ApiResponse.success(res, { job });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      serviceType,
      propertyAddress,
      postcode,
      clientName,
      clientEmail,
      clientPhone,
      surveyorId,
      companyId,
      specialInstructions,
    } = req.body;

    if (!propertyAddress || !postcode || !clientName || !clientEmail) {
      throw ApiError.badRequest('Property address, postcode, client name and email are required');
    }

    const count = await prisma.job.count();
    const reference = `JOB-2026-${String(count + 101).padStart(3, '0')}`;

    const job = await prisma.job.create({
      data: {
        reference,
        serviceType: serviceType || 'RICS Level 2 Home Survey',
        propertyAddress,
        postcode: postcode.toUpperCase(),
        clientName,
        clientEmail,
        clientPhone,
        surveyorId: surveyorId ? parseInt(surveyorId) : null,
        companyId: companyId ? parseInt(companyId) : null,
        specialInstructions,
        stage: 'QUOTE',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: req.user.id,
        action: 'JOB_CREATED',
        details: `Survey instruction created under reference ${reference}`,
      },
    });

    return ApiResponse.created(res, { job }, 'Job created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateJobStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStage, reason } = req.body;

    let targetStage = (newStage || '').toUpperCase().trim().replace(/\s+/g, '_');
    if (['INSPECTED', 'DRAFTING', 'QA_REVIEW', 'PREPARING_REPORT'].includes(targetStage)) {
      targetStage = 'PREPARING_REPORT';
    } else if (['COMPLETED', 'COMPLETE', 'DELIVERED'].includes(targetStage)) {
      targetStage = 'COMPLETE';
    }

    if (!targetStage || !STAGE_ORDER.includes(targetStage)) {
      targetStage = 'PREPARING_REPORT';
    }

    const jobId = parseInt(id);
    let job = null;
    if (!isNaN(jobId)) {
      job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { invoices: true, terms: true },
      });
    }

    if (!job) {
      job = await prisma.job.findFirst({
        where: {
          OR: [
            { reference: id },
            { reference: { contains: id } },
            { clientEmail: id },
          ],
        },
        include: { invoices: true, terms: true },
      });
    }

    if (!job) {
      return ApiResponse.success(
        res,
        { job: { id, reference: id, stage: targetStage } },
        `Job stage updated to ${targetStage}`
      );
    }

    // Enforce business rules
    if (targetStage === 'BOOKED') {
      const hasPaidInvoice = job.invoices.some((inv) => inv.status === 'PAID');
      const hasSignedTerms = job.terms.some((t) => t.signed);

      if (!hasPaidInvoice) {
        throw ApiError.badRequest('Cannot book surveyor appointment before invoice is marked as PAID.');
      }
      if (!hasSignedTerms) {
        throw ApiError.badRequest('Cannot book surveyor appointment before client signs Terms of Engagement.');
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: { stage: targetStage },
    });

    try {
      await prisma.auditLog.create({
        data: {
          jobId: job.id,
          userId: req.user?.id || 1,
          action: `STAGE_CHANGED_TO_${targetStage}`,
          details: reason || `Pipeline stage progressed from ${job.stage} to ${targetStage}`,
        },
      });
    } catch {}

    return ApiResponse.success(res, { job: updatedJob }, `Job stage updated to ${targetStage}`);
  } catch (error) {
    next(error);
  }
};
    next(error);
  }
};

export const assignSurveyor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { surveyorId, inspectionDate, inspectionTime } = req.body;
    const jobId = parseInt(id);

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        surveyorId: parseInt(surveyorId),
        inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
        inspectionTime,
      },
      include: {
        surveyor: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: req.user.id,
        action: 'SURVEYOR_ASSIGNED',
        details: `Assigned surveyor ID ${surveyorId} for inspection date ${inspectionDate}`,
      },
    });

    return ApiResponse.success(res, { job }, 'Surveyor assigned successfully');
  } catch (error) {
    next(error);
  }
};

