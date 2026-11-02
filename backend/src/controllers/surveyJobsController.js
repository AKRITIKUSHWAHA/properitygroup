import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const STAGE_ORDER = ['QUOTE', 'PAID', 'ACCEPTED', 'BOOKED', 'PREPARING_REPORT', 'COMPLETE'];

/**
 * Superadmin Menu 6: Survey Jobs (6-Stage Pipeline & Key Logistics)
 */
export const getSurveyJobs = async (req, res, next) => {
  try {
    const { stage, surveyorId, search } = req.query;
    const where = {};

    // Automatic role-based scoping (Surveyor gets assigned jobs, Customer gets their surveys)
    if (req.user?.role === 'SURVEYOR') {
      where.OR = [
        { surveyorId: req.user.id },
        { surveyor: { email: req.user.email } },
      ];
    } else if (req.user?.role === 'CUSTOMER') {
      where.OR = [
        { clientId: req.user.id },
        { clientEmail: req.user.email },
      ];
    } else if (surveyorId) {
      where.surveyorId = parseInt(surveyorId);
    }

    if (stage) where.stage = stage.toUpperCase();
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
        surveyor: { select: { id: true, name: true, email: true, phone: true } },
        company: { select: { id: true, name: true, branchName: true, keyCollectionProtocol: true } },
        quotes: true,
        terms: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { jobs, total: jobs.length });
  } catch (error) {
    next(error);
  }
};

export const getSurveyJobsMetrics = async (req, res, next) => {
  try {
    const [totalJobs, bookedCount, completedCount, activeCount] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { stage: 'BOOKED' } }),
      prisma.job.count({ where: { stage: 'COMPLETE' } }),
      prisma.job.count({ where: { stage: { not: 'COMPLETE' } } }),
    ]);

    return ApiResponse.success(res, {
      activeInstructions: activeCount,
      scheduledInspections: bookedCount,
      completedInspections: completedCount,
      totalJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getSurveyJobById = async (req, res, next) => {
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
      throw ApiError.notFound(`Job #${id} not found`);
    }

    return ApiResponse.success(res, { job });
  } catch (error) {
    next(error);
  }
};

export const createSurveyJob = async (req, res, next) => {
  try {
    const {
      serviceType = 'RICS Level 2 Home Survey',
      propertyAddress,
      postcode,
      clientName,
      clientEmail,
      clientPhone,
      surveyorId,
      companyId,
      specialInstructions,
      keyCollectionDetails,
    } = req.body;

    if (!propertyAddress || !postcode || !clientName || !clientEmail) {
      throw ApiError.badRequest('Property address, postcode, client name and email are required');
    }

    const count = await prisma.job.count();
    const reference = `JOB-2026-${String(count + 101).padStart(3, '0')}`;

    const job = await prisma.job.create({
      data: {
        reference,
        serviceType,
        propertyAddress,
        postcode: postcode.toUpperCase(),
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        clientPhone,
        surveyorId: surveyorId ? parseInt(surveyorId) : null,
        companyId: companyId ? parseInt(companyId) : null,
        specialInstructions,
        keyCollectionDetails,
        stage: 'QUOTE',
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: req.user.id,
        action: 'JOB_CREATED',
        details: `Survey job created under ref: ${reference}`,
      },
    });

    return ApiResponse.created(res, { job }, 'Survey job instruction initialized');
  } catch (error) {
    next(error);
  }
};

export const updateJobStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStage, reason } = req.body;
    const jobId = parseInt(id);

    if (!newStage || !STAGE_ORDER.includes(newStage.toUpperCase())) {
      throw ApiError.badRequest(`Invalid stage. Allowed: ${STAGE_ORDER.join(', ')}`);
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { invoices: true, terms: true },
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const targetStage = newStage.toUpperCase();

    // Dependency Rule Enforcement
    if (targetStage === 'BOOKED') {
      const hasPaid = job.invoices.some((inv) => inv.status === 'PAID');
      const hasTerms = job.terms.some((t) => t.signed);

      if (!hasPaid) {
        throw ApiError.badRequest('Cannot book surveyor appointment before payment invoice is marked as PAID.');
      }
      if (!hasTerms) {
        throw ApiError.badRequest('Cannot book surveyor appointment before client signs Terms of Engagement.');
      }
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { stage: targetStage },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: req.user.id,
        action: `STAGE_CHANGED_TO_${targetStage}`,
        details: reason || `Progressed from ${job.stage} to ${targetStage}`,
      },
    });

    return ApiResponse.success(res, { job: updated }, `Stage updated to ${targetStage}`);
  } catch (error) {
    next(error);
  }
};

export const assignSurveyor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { surveyorId, inspectionDate, inspectionTime, keyCollectionDetails } = req.body;
    const jobId = parseInt(id);

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        surveyorId: parseInt(surveyorId),
        inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
        inspectionTime,
        keyCollectionDetails,
      },
      include: {
        surveyor: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: req.user.id,
        action: 'SURVEYOR_SCHEDULED',
        details: `Assigned surveyor ID ${surveyorId} on ${inspectionDate} (${inspectionTime})`,
      },
    });

    return ApiResponse.success(res, { job }, 'Surveyor assigned successfully');
  } catch (error) {
    next(error);
  }
};

