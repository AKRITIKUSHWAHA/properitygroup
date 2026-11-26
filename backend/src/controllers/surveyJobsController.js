import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendInspectionBookedEmail, sendReportReadyEmail, sendPostInspectionUpdateEmail } from '../services/emailService.js';
import { runBookingReminderScan } from '../services/bookingReminderJob.js';
import { generateJobReference } from '../utils/references.js';
import {
  JOB_STAGES,
  JOB_STAGE_STEPS,
  JOB_STAGE_LABELS,
  normalizeJobStage,
  isValidTransition,
  ALLOWED_TRANSITIONS,
} from '../utils/jobStages.js';

/**
 * Superadmin Menu 6: Survey Jobs (6-Stage Pipeline & Key Logistics)
 */
export const getSurveyJobs = async (req, res, next) => {
  try {
    const { stage, surveyorId, search, bucket } = req.query;
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

    if (stage === 'READY_TO_BOOK' || bucket === 'jobs_to_book' || bucket === 'jobs-to-book') {
      where.stage = { in: ['PAID', 'QUOTE_ACCEPTED'] };
      where.terms = { some: { signed: true } };
      where.invoices = { some: { status: 'PAID' } };
    } else if (stage) {
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
      stage,
    } = req.body;

    if (!propertyAddress || !postcode || !clientName || !clientEmail) {
      throw ApiError.badRequest('Property address, postcode, client name and email are required');
    }

    const cleanEmail = clientEmail.toLowerCase().trim();
    const cleanAddress = propertyAddress.trim();

    let targetStage = 'ENQUIRY';
    if (stage) {
      const s = String(stage).toUpperCase().trim();
      if (STAGE_ORDER.includes(s)) {
        targetStage = s;
      }
    } else if (req.user?.role === 'CUSTOMER') {
      targetStage = 'ENQUIRY';
    }

    // Check for duplicate pending job instruction within same client and property
    const existingJob = await prisma.job.findFirst({
      where: {
        clientEmail: cleanEmail,
        propertyAddress: cleanAddress,
        stage: { in: ['ENQUIRY', 'QUOTE_ISSUED', 'QUOTE_ACCEPTED', 'TERMS_SIGNED', 'PAID'] },
      },
    });

    if (existingJob) {
      // Update existing job rather than creating a duplicate
      const updatedJob = await prisma.job.update({
        where: { id: existingJob.id },
        data: {
          clientName: clientName.trim(),
          clientPhone: clientPhone || existingJob.clientPhone,
          serviceType: serviceType || existingJob.serviceType,
          stage: targetStage !== 'QUOTE' ? targetStage : existingJob.stage,
          postcode: postcode.toUpperCase().trim(),
          specialInstructions: specialInstructions || existingJob.specialInstructions,
          keyCollectionDetails: keyCollectionDetails || existingJob.keyCollectionDetails,
        },
      });
      return ApiResponse.success(res, { job: updatedJob }, 'Existing survey instruction updated without duplication');
    }

    // remove unused lastJob reference since generateJobReference handles it internally
    const reference = await generateJobReference();

    const job = await prisma.job.create({
      data: {
        reference,
        serviceType,
        propertyAddress,
        postcode: postcode.toUpperCase(),
        clientName,
        clientEmail: cleanEmail,
        clientPhone,
        clientId: req.user?.id ? parseInt(req.user.id) : null,
        surveyorId: surveyorId ? parseInt(surveyorId) : null,
        companyId: companyId ? parseInt(companyId) : null,
        specialInstructions,
        keyCollectionDetails,
        stage: targetStage,
      },
    });

    if (req.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            jobId: job.id,
            userId: req.user.id,
            action: 'JOB_CREATED',
            details: `Survey job created under ref: ${reference}`,
          },
        });
      } catch (logErr) {
        console.warn('Audit log write error:', logErr.message);
      }
    }

    return ApiResponse.created(res, { job }, 'Survey job instruction initialized');
  } catch (error) {
    next(error);
  }
};

export const updateJobStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStage, reason } = req.body;

    const targetStage = normalizeJobStage(newStage);

    if (!targetStage || !JOB_STAGES.includes(targetStage)) {
      throw ApiError.badRequest(`Invalid target stage "${newStage}". Valid 10 stages: ${JOB_STAGES.join(', ')}`);
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
      throw ApiError.notFound(`Job not found with identifier: ${id}`);
    }

    // Workflow Transition Matrix Enforcement
    if (!isValidTransition(job.stage, targetStage)) {
      const allowed = ALLOWED_TRANSITIONS[job.stage] || [];
      throw ApiError.badRequest(
        `Invalid stage transition from "${job.stage}" to "${targetStage}". Allowed transitions from "${job.stage}": ${
          allowed.length ? allowed.join(', ') : 'None (Terminal stage)'
        }`
      );
    }

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
      where: { id: job.id },
      data: { stage: targetStage },
    });

    try {
      await prisma.auditLog.create({
        data: {
          jobId: job.id,
          userId: req.user?.id || 1,
          action: `STAGE_CHANGED_${job.stage}_TO_${targetStage}`,
          details: `Stage updated from ${job.stage} to ${targetStage}. Reason: ${reason || 'Workflow progression'}`,
        },
      });
    } catch (auditErr) {
      console.error('[surveyJobsController] Failed to record stage audit log:', auditErr.message);
    }

    // In-app Notifications for intermediate inspection & drafting stages
    if (['INSPECTED', 'DRAFTING', 'QA_REVIEW'].includes(targetStage)) {
      try {
        let targetCustomerId = job.clientId || null;
        if (job.clientEmail && job.clientEmail.includes('@')) {
          const targetUser = await prisma.user.findFirst({
            where: { email: job.clientEmail.toLowerCase().trim() },
            select: { id: true },
          });
          if (targetUser) targetCustomerId = targetUser.id;
        }

        if (targetCustomerId) {
          let notifTitle = '🔍 Site Inspection Completed';
          let notifDesc = `Physical site inspection for ${job.propertyAddress || 'your property'} is complete. Report preparation has begun.`;
          let notifType = 'booking';

          if (targetStage === 'QA_REVIEW') {
            notifTitle = '🛡️ Quality Assurance Review Underway';
            notifDesc = `Draft RICS survey report for ${job.propertyAddress || 'your property'} has been submitted for Admin QA Audit.`;
            notifType = 'report';
          } else if (targetStage === 'DRAFTING') {
            notifTitle = '📝 Survey Report Drafting Started';
            notifDesc = `Your Chartered Surveyor is now compiling your official RICS survey report for ${job.propertyAddress || 'your property'}.`;
            notifType = 'report';
          }

          const recentCutoff = new Date(Date.now() - 60 * 1000);
          const alreadyExists = await prisma.notification.findFirst({
            where: {
              userId: targetCustomerId,
              role: 'CUSTOMER',
              title: notifTitle,
              createdAt: { gte: recentCutoff },
            },
          });

          if (!alreadyExists) {
            await prisma.notification.create({
              data: {
                userId: targetCustomerId,
                role: 'CUSTOMER',
                title: notifTitle,
                desc: notifDesc,
                type: notifType,
                link: '/customer/track-my-survey',
              },
            });
          }
        }
      } catch (notifErr) {
        console.error('[surveyJobsController] Failed to create stage transition notification:', notifErr.message);
      }
    }

    // Dispatch Post-Inspection Update email when transitioning to INSPECTED (or DRAFTING if skipping INSPECTED)
    let stageEmailSent = false;
    let stageEmailError = null;
    if (
      (targetStage === 'INSPECTED' && job.stage !== 'INSPECTED') ||
      (targetStage === 'DRAFTING' && job.stage !== 'INSPECTED' && job.stage !== 'DRAFTING')
    ) {
      try {
        const clientEmail = job.clientEmail || updated.clientEmail;
        if (clientEmail && clientEmail.includes('@')) {
          const surveyorUser = job.surveyorId
            ? await prisma.user.findUnique({ where: { id: job.surveyorId }, select: { name: true } })
            : null;
          const emailRes = await sendPostInspectionUpdateEmail({
            to: clientEmail,
            clientName: job.clientName || updated.clientName || 'Valued Client',
            jobRef: job.reference || updated.reference,
            propertyAddress: job.propertyAddress || updated.propertyAddress || 'Subject Property',
            surveyType: job.serviceType || updated.serviceType || 'RICS Level 2 Home Survey',
            surveyorName: surveyorUser?.name || req.user?.name || 'Assigned Chartered Surveyor',
            jobId: job.id,
          });
          stageEmailSent = Boolean(emailRes?.success);
          stageEmailError = emailRes?.error || null;
        }
      } catch (err) {
        console.error('[sendPostInspectionUpdateEmail] error:', err.message);
        stageEmailError = err.message;
      }
    }

    // Dispatch Report Ready email if stage transitioned to COMPLETE
    if (targetStage === 'COMPLETE' && job.stage !== 'COMPLETE') {
      try {
        const clientEmail = job.clientEmail || updated.clientEmail;
        if (clientEmail && clientEmail.includes('@')) {
          const emailRes = await sendReportReadyEmail({
            to: clientEmail,
            clientName: job.clientName || updated.clientName || 'Valued Client',
            jobRef: job.reference || updated.reference,
            propertyAddress: job.propertyAddress || updated.propertyAddress || 'Subject Property',
            surveyType: job.serviceType || updated.serviceType || 'RICS Level 2 Home Survey',
            reportPdfUrl: job.reportPdfUrl || updated.reportPdfUrl,
          });
          stageEmailSent = Boolean(emailRes?.success);
          stageEmailError = emailRes?.error || null;

          const targetUser = await prisma.user.findFirst({ where: { email: clientEmail } });
          if (targetUser || job.clientId) {
            await prisma.notification.create({
              data: {
                userId: targetUser ? targetUser.id : job.clientId,
                role: 'CUSTOMER',
                title: 'RICS Survey Report Ready',
                desc: `Your accredited RICS survey report for ${job.propertyAddress || 'Subject Property'} has been published and is ready for download.`,
                type: 'REPORT',
                link: '/customer/my-reports',
              },
            });
          }
        }
      } catch (err) {
        console.error('[sendReportReadyEmail] error:', err.message);
        stageEmailError = err.message;
      }
    }

    return ApiResponse.success(res, { job: updated, emailSent: stageEmailSent, emailError: stageEmailError }, `Stage updated to ${targetStage}`);
  } catch (error) {
    next(error);
  }
};

export const assignSurveyor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { surveyorId, inspectionDate, inspectionTime, keyCollectionDetails } = req.body;
    const jobId = parseInt(id);

    const currentJob = await prisma.job.findUnique({ where: { id: jobId }, include: { invoices: true, terms: true } });
    if (!currentJob) {
      throw ApiError.notFound(`Job not found with id: ${jobId}`);
    }
    const hasPaid = currentJob?.invoices?.some((i) => i.status === 'PAID');
    const hasSigned = currentJob?.terms?.some((t) => t.signed);

    if (!hasPaid) {
      throw ApiError.badRequest('Cannot assign surveyor before invoice is PAID.');
    }
    if (!hasSigned) {
      throw ApiError.badRequest('Cannot assign surveyor before Terms of Engagement are signed.');
    }

    // Determine new stage: move to BOOKED only if an inspection date is being set
    const nextStage = inspectionDate && isValidTransition(currentJob.stage, 'BOOKED')
      ? 'BOOKED'
      : currentJob.stage;

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        surveyorId: parseInt(surveyorId),
        inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
        inspectionTime,
        keyCollectionDetails,
        ...(nextStage ? { stage: nextStage } : {}),
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

    // Dispatch Inspection Booked Email to Customer & CC Admin
    let assignEmailSent = false;
    let assignEmailError = null;
    try {
      if (job.clientEmail && job.clientEmail.includes('@') && inspectionDate) {
        const emailRes = await sendInspectionBookedEmail({
          to: job.clientEmail,
          clientName: job.clientName || 'Valued Client',
          jobRef: job.reference,
          propertyAddress: job.propertyAddress || 'Subject Property',
          surveyType: job.serviceType || 'RICS Level 2 Home Survey',
          inspectionDate: job.inspectionDate || inspectionDate,
          inspectionTime: job.inspectionTime || inspectionTime,
          surveyorName: job.surveyor?.name || 'RICS Chartered Surveyor',
        });
        assignEmailSent = Boolean(emailRes?.success);
        assignEmailError = emailRes?.error || null;

        const formattedDate = new Date(inspectionDate).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const targetUser = await prisma.user.findFirst({ where: { email: job.clientEmail } });
        if (targetUser || job.clientId) {
          await prisma.notification.create({
            data: {
              userId: targetUser ? targetUser.id : job.clientId,
              role: 'CUSTOMER',
              title: 'Inspection Appointment Booked',
              desc: `Your property survey for ${job.propertyAddress} is confirmed for ${formattedDate} (${inspectionTime || 'Morning'}).`,
              type: 'INSPECTION',
              link: '/customer/appointment-details',
            },
          });
        }
        await prisma.notification.create({
          data: {
            role: 'ADMIN',
            title: `Inspection Scheduled - ${job.reference}`,
            desc: `Inspection booked for ${job.propertyAddress} on ${formattedDate} (${job.surveyor?.name || 'Surveyor'}).`,
            type: 'INSPECTION',
            link: '/admin/surveys/schedule',
          },
        });
      }
    } catch (emailErr) {
      console.error('[sendInspectionBookedEmail assignSurveyor] error:', emailErr.message);
      assignEmailError = emailErr.message;
    }

    return ApiResponse.success(res, { job, emailSent: assignEmailSent, emailError: assignEmailError }, 'Surveyor assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const rescheduleSurveyJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inspectionDate, inspectionTime, surveyorId, reason, keyCollectionDetails } = req.body;

    let jobId = parseInt(id, 10);
    let job = null;

    if (!isNaN(jobId)) {
      job = await prisma.job.findUnique({ where: { id: jobId } });
    }
    if (!job) {
      job = await prisma.job.findFirst({ where: { reference: String(id) } });
    }
    if (!job) {
      const cleanRef = String(id).replace(/[^0-9]/g, '');
      if (cleanRef) {
        job = await prisma.job.findFirst({
          where: {
            OR: [
              { reference: { contains: cleanRef } },
              { id: parseInt(cleanRef, 10) || 0 },
            ],
          },
        });
      }
    }
    let parsedDate = undefined;
    if (inspectionDate) {
      const d = new Date(inspectionDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    if (!job) {
      throw ApiError.notFound(`Survey job "${id}" not found.`);
    }

    // Validate surveyor ID against database to avoid foreign key violation
    let validSurveyorId = job.surveyorId;
    if (surveyorId !== undefined && surveyorId !== null) {
      const parsedSurveyorId = parseInt(surveyorId);
      if (!isNaN(parsedSurveyorId)) {
        const surveyorExists = await prisma.user.findUnique({
          where: { id: parsedSurveyorId },
        });
        if (surveyorExists) {
          validSurveyorId = surveyorExists.id;
        } else {
            // surveyor ID provided but not found — keep existing assignment
          console.warn(`[rescheduleSurveyJob] Surveyor ID ${parsedSurveyorId} not found; keeping existing surveyorId ${job.surveyorId}`);
        }
      }
    }

    // Reject placeholder "Date: TBD" reschedules from background UI syncs
    if (!parsedDate && (!inspectionTime || String(inspectionTime).toLowerCase().includes('tbd')) && surveyorId === undefined && keyCollectionDetails === undefined) {
      throw ApiError.badRequest('Please provide a valid inspection date, time slot, or assignment details to reschedule');
    }

    const fullJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: { invoices: true, terms: true },
    });
    const hasPaidInv = fullJob?.invoices?.some((i) => i.status === 'PAID');
    const hasSignedTerms = fullJob?.terms?.some((t) => t.signed);
    const canMoveToBooked = Boolean(parsedDate) && (job.stage === 'PAID' || (hasPaidInv && hasSignedTerms));

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        inspectionDate: parsedDate !== undefined ? parsedDate : job.inspectionDate,
        inspectionTime: (inspectionTime && !String(inspectionTime).toLowerCase().includes('tbd')) ? inspectionTime : job.inspectionTime,
        surveyorId: validSurveyorId,
        keyCollectionDetails: keyCollectionDetails !== undefined ? keyCollectionDetails : job.keyCollectionDetails,
        stage: (canMoveToBooked && ['QUOTE_ACCEPTED', 'TERMS_SIGNED', 'PAID'].includes(job.stage)) ? 'BOOKED' : job.stage,
      },
      include: {
        surveyor: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Create audit timeline log
    try {
      const auditUserId = req.user?.id || (await prisma.user.findFirst({ select: { id: true } }))?.id;
      if (auditUserId) {
        await prisma.auditLog.create({
          data: {
            jobId: job.id,
            userId: auditUserId,
            action: 'JOB_RESCHEDULED',
            details: `Rescheduled to ${inspectionDate || 'new date'} (${inspectionTime || 'slot'}). Reason: ${reason || 'Client request'}`,
          },
        });
      }
    } catch (e) {
      console.error('[surveyJobsController] Reschedule audit log failed:', e.message);
    }

    // Also record callLog / timeline note if reason provided
    if (reason) {
      try {
        await prisma.callLog.create({
          data: {
            jobId: job.id,
            leadId: job.leadId,
            callerName: req.user?.name || 'Staff Coordinator',
            summary: `Appointment Rescheduled to ${inspectionDate} ${inspectionTime || ''}. Reason: ${reason}`,
            durationMinutes: 2,
          },
        });
      } catch (e) {
        console.error('[surveyJobsController] Reschedule callLog failed:', e.message);
      }
    }

    // Dispatch Rescheduled/Updated Inspection Booked Email to Customer & CC Admin
    let rescheduleEmailSent = false;
    let rescheduleEmailError = null;
    try {
      if (updated.clientEmail && updated.clientEmail.includes('@') && updated.inspectionDate) {
        const emailRes = await sendInspectionBookedEmail({
          to: updated.clientEmail,
          clientName: updated.clientName || 'Valued Client',
          jobRef: updated.reference,
          propertyAddress: updated.propertyAddress || 'Subject Property',
          surveyType: updated.serviceType || 'RICS Level 2 Home Survey',
          inspectionDate: updated.inspectionDate,
          inspectionTime: updated.inspectionTime,
          surveyorName: updated.surveyor?.name || 'RICS Chartered Surveyor',
          surveyorPhone: updated.surveyor?.phone,
        });
        rescheduleEmailSent = Boolean(emailRes?.success);
        rescheduleEmailError = emailRes?.error || null;

        const formattedDate = new Date(updated.inspectionDate).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const targetUser = await prisma.user.findFirst({ where: { email: updated.clientEmail } });
        if (targetUser || updated.clientId) {
          await prisma.notification.create({
            data: {
              userId: targetUser ? targetUser.id : updated.clientId,
              role: 'CUSTOMER',
              title: 'Inspection Appointment Rescheduled',
              desc: `Your property survey for ${updated.propertyAddress} has been rescheduled to ${formattedDate} (${updated.inspectionTime || 'Morning'}).`,
              type: 'INSPECTION',
              link: '/customer/appointment-details',
            },
          });
        }
        await prisma.notification.create({
          data: {
            role: 'ADMIN',
            title: `Inspection Rescheduled - ${updated.reference}`,
            desc: `Inspection appointment for ${updated.propertyAddress} moved to ${formattedDate}. Reason: ${reason || 'Updated'}`,
            type: 'INSPECTION',
            link: '/admin/surveys/schedule',
          },
        });
      }
    } catch (emailErr) {
      console.error('[sendInspectionBookedEmail Reschedule] error:', emailErr.message);
      rescheduleEmailError = emailErr.message;
    }

    return ApiResponse.success(
      res,
      { job: updated, emailSent: rescheduleEmailSent, emailError: rescheduleEmailError },
      `Inspection appointment successfully rescheduled to ${inspectionDate || 'new date'}`
    );
  } catch (error) {
    next(error);
  }
};

export const deleteSurveyJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    const where = !isNaN(numId) && String(numId) === String(id)
      ? { OR: [{ id: numId }, { reference: String(id) }] }
      : { reference: String(id) };

    const targetJob = await prisma.job.findFirst({ where });
    if (!targetJob) {
      throw ApiError.notFound(`Job not found for deletion: ${id}`);
    }

    const jId = targetJob.id;
    try {
      await prisma.$transaction([
        prisma.supportTicket.deleteMany({ where: { jobId: jId } }),
        prisma.customerReview.deleteMany({ where: { jobId: jId } }),
        prisma.message.deleteMany({ where: { jobId: jId } }),
        prisma.quote.deleteMany({ where: { jobId: jId } }),
        prisma.term.deleteMany({ where: { jobId: jId } }),
        prisma.invoice.deleteMany({ where: { jobId: jId } }),
        prisma.callLog.deleteMany({ where: { jobId: jId } }),
        prisma.complaintLog.deleteMany({ where: { jobId: jId } }),
        prisma.auditLog.deleteMany({ where: { jobId: jId } }),
        prisma.job.delete({ where: { id: jId } }),
      ]);
    } catch (delErr) {
      console.error('[surveyJobsController] Error deleting job and related records:', delErr.message);
      throw delErr;
    }

    return ApiResponse.success(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const triggerBookingReminders = async (req, res, next) => {
  try {
    const minAgeHours = req.body?.minAgeHours !== undefined ? Number(req.body.minAgeHours) : 0;
    const summary = await runBookingReminderScan({
      triggeredByUserId: req.user?.id || null,
      minAgeHours,
    });
    return ApiResponse.success(res, summary, `Booking reminder scan completed (${summary.dispatched} dispatched)`);
  } catch (error) {
    next(error);
  }
};

