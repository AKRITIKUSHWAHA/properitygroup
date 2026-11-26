import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { isValidTransition, ALLOWED_TRANSITIONS } from '../../utils/jobStages.js';

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
        stage: { in: ['INSPECTED', 'DRAFTING'] },
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
    const jobId = parseInt(id, 10);
    const surveyorId = req.user.id;
    const surveyorEmail = (req.user?.email || '').toLowerCase().trim();

    // If file was uploaded via multipart/form-data, validate file type & size
    if (req.file) {
      const isPdfMime = req.file.mimetype === 'application/pdf';
      const isPdfExt = String(req.file.originalname || '').toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !isPdfExt) {
        throw ApiError.badRequest('Only PDF report documents (.pdf) are allowed');
      }
      const maxBytes = 50 * 1024 * 1024; // 50MB
      if (req.file.size > maxBytes) {
        throw ApiError.badRequest('Report PDF file size must not exceed 50MB');
      }
      reportPdfUrl = `/uploads/reports/${req.file.filename}`;
    }

    if (!reportPdfUrl) {
      throw ApiError.badRequest('Report PDF document or uploaded file is required');
    }

    const idFilters = [];
    if (!isNaN(jobId)) idFilters.push({ id: jobId });
    idFilters.push({ reference: String(id) });

    const job = await prisma.job.findFirst({
      where: {
        OR: idFilters,
        AND: [
          {
            OR: [
              { surveyorId },
              ...(surveyorEmail ? [{ surveyor: { email: surveyorEmail } }] : []),
            ],
          },
        ],
      },
    });

    if (!job) {
      throw ApiError.notFound('Job record not found or not assigned to you');
    }

    // Allow INSPECTED -> (DRAFTING) -> QA_REVIEW or DRAFTING -> QA_REVIEW or idempotent QA_REVIEW
    const canSubmitQa =
      isValidTransition(job.stage, 'QA_REVIEW') ||
      (job.stage === 'INSPECTED' && isValidTransition('DRAFTING', 'QA_REVIEW'));

    if (!canSubmitQa) {
      const allowed = ALLOWED_TRANSITIONS[job.stage] || [];
      throw ApiError.badRequest(
        `Cannot submit draft report from stage "${job.stage}". Inspection must be completed first. Allowed: ${allowed.join(', ') || 'None'}`
      );
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        reportPdfUrl,
        reportGeneratedAt: new Date(),
        stage: 'QA_REVIEW',
      },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: `STAGE_CHANGED_${job.stage}_TO_QA_REVIEW`,
        details: `Draft report (${req.file ? req.file.originalname : 'PDF file'}) uploaded by surveyor ${req.user.name}. Job transitioned to QA_REVIEW.`,
      },
    });

    // Notify Customer & Admin directly in database so cross-browser portals stay in sync
    try {
      let targetCustomerId = job.clientId || null;
      if (job.clientEmail && job.clientEmail.includes('@')) {
        const clientUser = await prisma.user.findFirst({
          where: { email: job.clientEmail.toLowerCase().trim() },
          select: { id: true },
        });
        if (clientUser) targetCustomerId = clientUser.id;
      }

      if (targetCustomerId) {
        await prisma.notification.create({
          data: {
            userId: targetCustomerId,
            role: 'CUSTOMER',
            title: '🛡️ Quality Assurance Review Underway',
            desc: `Surveyor ${req.user.name} submitted the draft RICS report for ${job.propertyAddress} to Admin Quality Assurance.`,
            type: 'report',
            link: '/customer/track-my-survey',
          },
        });
      }

      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Draft Report Submitted for QA Review — ${job.reference}`,
          desc: `Surveyor ${req.user.name} submitted a draft report for ${job.propertyAddress} (${job.clientName}) for Admin QA sign-off.`,
          type: 'report',
          link: '/admin/reports-and-analytics',
        },
      });
    } catch (notifErr) {
      console.warn('[submitDraftReport] notification creation warning:', notifErr.message);
    }

    return ApiResponse.success(
      res,
      { job: updated, fileUrl: reportPdfUrl },
      'RICS Report draft uploaded successfully and submitted for Admin QA Review.'
    );
  } catch (error) {
    next(error);
  }
};

