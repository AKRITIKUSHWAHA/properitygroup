import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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
        stage: { in: ['BOOKED', 'PREPARING_REPORT'] },
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
    const jobId = parseInt(id);
    const surveyorId = req.user.id;

    const job = await prisma.job.findFirst({
      where: { id: jobId, surveyorId },
    });

    if (!job) {
      throw ApiError.notFound('Job not found or not assigned to you');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { stage: 'PREPARING_REPORT' },
    });

    await prisma.auditLog.create({
      data: {
        jobId: job.id,
        userId: surveyorId,
        action: 'SITE_INSPECTION_COMPLETED',
        details: `Site visit completed. Stage progressed to PREPARING_REPORT for draft report compilation.`,
      },
    });

    return ApiResponse.success(
      res,
      { job: updated },
      'Site visit completed. Job has moved to Draft Report preparation stage.'
    );
  } catch (error) {
    next(error);
  }
};

