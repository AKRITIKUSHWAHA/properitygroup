import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendReportReadyEmail } from '../../services/emailService.js';

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
    let reportPdfUrl = req.body?.reportPdfUrl;
    const conditionSummary = req.body?.conditionSummary;
    const jobId = parseInt(id);
    const surveyorId = req.user.id;

    // If file was uploaded via multipart/form-data
    if (req.file) {
      reportPdfUrl = `/uploads/reports/${req.file.filename}`;
    }

    if (!reportPdfUrl) {
      throw ApiError.badRequest('Report PDF document or uploaded file is required');
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
        stage: 'COMPLETED',
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: 'DRAFT_REPORT_SUBMITTED_FOR_QA',
        details: `Draft report (${req.file ? req.file.originalname : 'PDF file'}) uploaded and submitted by surveyor ${req.user.name}.`,
      },
    });

    // If marked completed directly, notify customer
    try {
      if (job.clientEmail && job.clientEmail.includes('@')) {
        sendReportReadyEmail({
          to: job.clientEmail,
          clientName: job.clientName || 'Valued Client',
          jobRef: job.reference,
          propertyAddress: job.propertyAddress || 'Subject Property',
          surveyType: job.serviceType || 'RICS Level 2 Home Survey',
          reportPdfUrl,
        }).catch((e) => console.warn('[sendReportReadyEmail Surveyor] background error:', e.message));
      }
    } catch (emailErr) {}

    return ApiResponse.success(
      res,
      { job: updated, fileUrl: reportPdfUrl },
      'RICS Report draft uploaded successfully and submitted for Admin QA Review.'
    );
  } catch (error) {
    next(error);
  }
};

