import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { isValidTransition, ALLOWED_TRANSITIONS } from '../../utils/jobStages.js';
import { sendPostInspectionUpdateEmail } from '../../services/emailService.js';

/**
 * Surveyor Menu 4: Site Visits (/surveyor/site-visits)
 * Logistics, Key Collection Protocols & On-Site Inspection Status
 */
export const getSiteVisits = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;

    const visits = await prisma.job.findMany({
      where: {
        surveyorId,
        stage: { in: ['BOOKED', 'INSPECTED', 'DRAFTING'] },
      },
      select: {
        id: true,
        reference: true,
        serviceType: true,
        propertyAddress: true,
        postcode: true,
        inspectionDate: true,
        inspectionTime: true,
        stage: true,
        keyCollectionDetails: true,
        specialInstructions: true,
        company: {
          select: {
            name: true,
            branchName: true,
            address: true,
            contactName: true,
            contactPhone: true,
            keyCollectionProtocol: true,
          },
        },
      },
      orderBy: { inspectionDate: 'asc' },
    });

    return ApiResponse.success(res, { visits, total: visits.length });
  } catch (error) {
    next(error);
  }
};

export const checkInSiteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);
    const surveyorId = req.user.id;

    const job = await prisma.job.findFirst({
      where: { id: jobId, surveyorId },
    });

    if (!job) {
      throw ApiError.notFound('Job not found or not assigned to you');
    }

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: 'SURVEYOR_ARRIVED_ON_SITE',
        details: `Surveyor ${req.user.name} checked in at ${job.propertyAddress}. Inspection commenced.`,
      },
    });

    return ApiResponse.success(res, null, 'Checked in successfully. On-site inspection recorded.');
  } catch (error) {
    next(error);
  }
};

export const completeSiteVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id, 10);
    const surveyorId = req.user.id;
    const surveyorEmail = (req.user?.email || '').toLowerCase().trim();

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
      throw ApiError.notFound('Job not found or not assigned to you');
    }

    if (!isValidTransition(job.stage, 'INSPECTED')) {
      const allowed = ALLOWED_TRANSITIONS[job.stage] || [];
      throw ApiError.badRequest(
        `Cannot mark inspection complete from stage "${job.stage}". Allowed: ${allowed.join(', ') || 'None'}`
      );
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { stage: 'INSPECTED' },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: `STAGE_CHANGED_${job.stage}_TO_INSPECTED`,
        details: `Site visit completed. Stage progressed from ${job.stage} to INSPECTED.`,
      },
    });

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
            title: '🔍 Site Inspection Completed',
            desc: `Surveyor ${req.user.name} completed the physical site inspection for ${job.propertyAddress}. Your technical survey report is now being drafted.`,
            type: 'booking',
            link: '/customer/track-my-survey',
          },
        });
      }

      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Site Inspection Completed — ${job.reference}`,
          desc: `Surveyor ${req.user.name} completed the site inspection for ${job.propertyAddress}.`,
          type: 'booking',
          link: '/admin/jobs',
        },
      });

      if (job.clientEmail && job.clientEmail.includes('@')) {
        await sendPostInspectionUpdateEmail({
          to: job.clientEmail,
          clientName: job.clientName || 'Valued Client',
          jobRef: job.reference,
          propertyAddress: job.propertyAddress,
          surveyType: job.serviceType,
          surveyorName: req.user.name || 'Assigned Chartered Surveyor',
          jobId: job.id,
        });
      }
    } catch (notifErr) {
      console.warn('[completeSiteVisit] notification warning:', notifErr.message);
    }

    return ApiResponse.success(
      res,
      { job: updated },
      'Site visit completed. Job has moved to Draft Report preparation stage.'
    );
  } catch (error) {
    next(error);
  }
};

export const addSiteEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id, 10);
    const surveyorId = req.user.id;
    const surveyorEmail = (req.user?.email || '').toLowerCase().trim();
    const { room, note, url, time } = req.body || {};

    if (!note || !String(note).trim()) {
      throw ApiError.badRequest('Defect note is required');
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
      throw ApiError.notFound('Job not found or not assigned to you');
    }

    const cleanTime =
      time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const cleanRoom = String(room || 'General Inspection').trim();
    const cleanNote = String(note).trim();

    const log = await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: 'SITE_EVIDENCE_LOGGED',
        details: JSON.stringify({
          room: cleanRoom,
          note: cleanNote,
          url: url || null,
          time: cleanTime,
        }),
      },
    });

    return ApiResponse.created(
      res,
      {
        evidence: {
          id: log.id,
          room: cleanRoom,
          note: cleanNote,
          url: url || null,
          time: cleanTime,
          createdAt: log.createdAt,
        },
      },
      'Site evidence logged to database.'
    );
  } catch (error) {
    next(error);
  }
};

