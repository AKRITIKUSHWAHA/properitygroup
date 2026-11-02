import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Surveyor Menu 5: Upload Reports (/surveyor/upload-reports)
 * Draft RICS Report Submission & QA Handoff
 */
export const getPendingReportJobs = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;

    const jobs = await prisma.job.findMany({
      where: {
        surveyorId,
        stage: 'PREPARING_REPORT',
      },
      select: {
        id: true,
        reference: true,
        serviceType: true,
        propertyAddress: true,
        postcode: true,
        inspectionDate: true,
        reportPdfUrl: true,
        reportGeneratedAt: true,
        qaApprovedAt: true,
      },
      orderBy: { inspectionDate: 'asc' },
    });

    return ApiResponse.success(res, { jobs, total: jobs.length });
  } catch (error) {
    next(error);
  }
};

export const submitDraftReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reportPdfUrl, conditionSummary } = req.body;
    const jobId = parseInt(id);
    const surveyorId = req.user.id;

    if (!reportPdfUrl) {
      throw ApiError.badRequest('Report PDF document URL is required');
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, surveyorId },
    });

    if (!job) {
      throw ApiError.notFound('Job record not found or not assigned to you');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        reportPdfUrl,
        reportGeneratedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: 'DRAFT_REPORT_SUBMITTED_FOR_QA',
        details: `Draft report submitted by surveyor ${req.user.name}. Awaiting Admin QA audit approval.`,
      },
    });

    return ApiResponse.success(
      res,
      { job: updated },
      'RICS Report draft uploaded successfully and submitted for Admin QA Review.'
    );
  } catch (error) {
    next(error);
  }
};
