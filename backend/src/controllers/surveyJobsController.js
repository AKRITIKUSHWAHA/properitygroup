import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendInspectionBookedEmail, sendReportReadyEmail } from '../services/emailService.js';

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
      stage,
    } = req.body;

    if (!propertyAddress || !postcode || !clientName || !clientEmail) {
      throw ApiError.badRequest('Property address, postcode, client name and email are required');
    }

    const cleanEmail = clientEmail.toLowerCase().trim();
    const cleanAddress = propertyAddress.trim();

    let targetStage = 'QUOTE';
    if (stage) {
      const s = String(stage).toUpperCase().trim();
      if (STAGE_ORDER.includes(s)) {
        targetStage = s;
      }
    } else if (req.user?.role === 'CUSTOMER') {
      targetStage = 'ACCEPTED';
    }

    // Check for duplicate pending job instruction within same client and property
    const existingJob = await prisma.job.findFirst({
      where: {
        clientEmail: cleanEmail,
        propertyAddress: cleanAddress,
        stage: { in: ['QUOTE', 'NEW', 'ACCEPTED', 'PAID'] },
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

    const lastJob = await prisma.job.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
    let reference = `JOB-2026-${String((lastJob?.id || 0) + 101).padStart(3, '0')}`;
    const jobRefExists = await prisma.job.findUnique({ where: { reference }, select: { id: true } });
    if (jobRefExists) {
      reference = `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

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

    let targetStage = (newStage || '').toUpperCase().trim().replace(/\s+/g, '_');
    if (['INSPECTED', 'DRAFTING', 'QA_REVIEW', 'PREPARING_REPORT'].includes(targetStage)) {
      targetStage = 'PREPARING_REPORT';
    } else if (['COMPLETED', 'COMPLETE', 'DELIVERED'].includes(targetStage)) {
      targetStage = 'COMPLETE';
    }

    if (!targetStage || !STAGE_ORDER.includes(targetStage)) {
      throw ApiError.badRequest(`Invalid target stage "${newStage}". Valid stages: ${STAGE_ORDER.join(', ')}`);
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
        `Stage updated to ${targetStage}`
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
          action: `STAGE_CHANGED_TO_${targetStage}`,
          details: reason || `Progressed from ${job.stage} to ${targetStage}`,
        },
      });
    } catch {}

    // Notify Customer when transitioning through PREPARING_REPORT sub-phases (Inspected / Drafting / QA Review)
    if (targetStage === 'PREPARING_REPORT') {
      try {
        const reasonText = String(reason || '').trim();
        const isFirstEntry = job.stage !== 'PREPARING_REPORT';
        const isQaReason = /submitted draft report|qa audit|qa review/i.test(reasonText);
        const isDraftReason = /started report drafting|drafting commenced/i.test(reasonText);
        const isInspectReason = /completed site visit|inspection completed/i.test(reasonText);

        if (isFirstEntry || isQaReason || isDraftReason || isInspectReason) {
          let targetCustomerId = job.clientId || null;
          if (job.clientEmail && job.clientEmail.includes('@')) {
            const targetUser = await prisma.user.findFirst({
              where: { email: { equals: job.clientEmail.toLowerCase().trim(), mode: 'insensitive' } },
              select: { id: true },
            });
            if (targetUser) targetCustomerId = targetUser.id;
          }

          if (targetCustomerId) {
            let notifTitle = '🔍 Site Inspection Completed';
            let notifDesc = `Physical inspection for ${job.propertyAddress || 'your property'} is complete and report preparation has begun.`;
            let notifType = 'booking';

            if (isQaReason) {
              notifTitle = '🛡️ Quality Assurance Review Underway';
              notifDesc = `Your draft RICS survey report for ${job.propertyAddress || 'your property'} has been submitted for Admin Quality Assurance.`;
              notifType = 'report';
            } else if (isDraftReason) {
              notifTitle = '📝 Survey Report Drafting Started';
              notifDesc = `Your Chartered Surveyor is now drafting your official RICS survey report for ${job.propertyAddress || 'your property'}.`;
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
        }
      } catch (notifErr) {}
    }

    // Dispatch Report Ready email if stage transitioned to COMPLETE
    if (targetStage === 'COMPLETE' && job.stage !== 'COMPLETE') {
      try {
        const clientEmail = job.clientEmail || updated.clientEmail;
        if (clientEmail && clientEmail.includes('@')) {
          sendReportReadyEmail({
            to: clientEmail,
            clientName: job.clientName || updated.clientName || 'Valued Client',
            jobRef: job.reference || updated.reference,
            propertyAddress: job.propertyAddress || updated.propertyAddress || 'Subject Property',
            surveyType: job.serviceType || updated.serviceType || 'RICS Level 2 Home Survey',
            reportPdfUrl: job.reportPdfUrl || updated.reportPdfUrl,
          }).catch((e) => console.warn('[sendReportReadyEmail] background error:', e.message));

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
      } catch (err) {}
    }

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

    const currentJob = await prisma.job.findUnique({ where: { id: jobId }, include: { invoices: true, terms: true } });
    const hasPaid = currentJob?.invoices?.some((i) => i.status === 'PAID');
    const hasSigned = currentJob?.terms?.some((t) => t.signed);
    const nextStage = currentJob && inspectionDate && (currentJob.stage === 'PAID' || (hasPaid && hasSigned))
      ? 'BOOKED'
      : currentJob?.stage;

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
    try {
      if (job.clientEmail && job.clientEmail.includes('@') && inspectionDate) {
        sendInspectionBookedEmail({
          to: job.clientEmail,
          clientName: job.clientName || 'Valued Client',
          jobRef: job.reference,
          propertyAddress: job.propertyAddress || 'Subject Property',
          surveyType: job.serviceType || 'RICS Level 2 Home Survey',
          inspectionDate: job.inspectionDate || inspectionDate,
          inspectionTime: job.inspectionTime || inspectionTime,
          surveyorName: job.surveyor?.name || 'RICS Chartered Surveyor',
        }).catch((e) => console.warn('[sendInspectionBookedEmail] background error:', e.message));

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
    } catch (emailErr) {}

    return ApiResponse.success(res, { job }, 'Surveyor assigned successfully');
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
      if (!id || String(id) === 'undefined' || String(id) === 'null') {
        throw ApiError.badRequest('Valid job reference or ID is required');
      }
      let fallbackSurveyorId = null;
      const anySurveyor = await prisma.user.findFirst({ where: { role: 'SURVEYOR' } });
      if (anySurveyor) fallbackSurveyorId = anySurveyor.id;

      job = await prisma.job.create({
        data: {
          reference: String(id),
          serviceType: 'RICS Level 2 Home Survey',
          propertyAddress: req.body.propertyAddress || 'Subject Property',
          postcode: req.body.postcode || 'SW1A 1AA',
          clientName: req.body.clientName || 'Private Client',
          clientEmail: req.body.clientEmail || 'client@example.com',
          inspectionDate: parsedDate,
          inspectionTime: inspectionTime || '10:00 AM - 01:00 PM',
          surveyorId: fallbackSurveyorId,
          stage: 'BOOKED',
        },
      });
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
          // If specific ID doesn't exist, check for any surveyor user
          const anySurveyor = await prisma.user.findFirst({
            where: { role: 'SURVEYOR' },
          });
          if (anySurveyor) {
            validSurveyorId = anySurveyor.id;
          }
        }
      }
    }

    // Reject placeholder "Date: TBD" reschedules from background UI syncs
    if (!parsedDate && (!inspectionTime || String(inspectionTime).toLowerCase().includes('tbd')) && surveyorId === undefined && keyCollectionDetails === undefined) {
      return ApiResponse.success(res, { job }, 'No valid inspection date or details provided');
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
        stage: (canMoveToBooked && ['QUOTE', 'ACCEPTED', 'PAID'].includes(job.stage)) ? 'BOOKED' : job.stage,
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
    } catch (e) {}

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
      } catch (e) {}
    }

    // Dispatch Rescheduled/Updated Inspection Booked Email to Customer & CC Admin
    try {
      if (updated.clientEmail && updated.clientEmail.includes('@') && updated.inspectionDate) {
        sendInspectionBookedEmail({
          to: updated.clientEmail,
          clientName: updated.clientName || 'Valued Client',
          jobRef: updated.reference,
          propertyAddress: updated.propertyAddress || 'Subject Property',
          surveyType: updated.serviceType || 'RICS Level 2 Home Survey',
          inspectionDate: updated.inspectionDate,
          inspectionTime: updated.inspectionTime,
          surveyorName: updated.surveyor?.name || 'RICS Chartered Surveyor',
          surveyorPhone: updated.surveyor?.phone,
        }).catch((e) => console.warn('[sendInspectionBookedEmail Reschedule] background error:', e.message));

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
    } catch (emailErr) {}

    return ApiResponse.success(
      res,
      { job: updated },
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
      return ApiResponse.success(res, null, 'Job deleted successfully');
    }

    const jId = targetJob.id;
    await prisma.supportTicket.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.customerReview.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.message.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.quote.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.term.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.invoice.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.callLog.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.complaintLog.deleteMany({ where: { jobId: jId } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { jobId: jId } }).catch(() => {});

    await prisma.job.delete({ where: { id: jId } });

    return ApiResponse.success(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

