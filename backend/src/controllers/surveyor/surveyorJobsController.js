import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Surveyor Menu 3: My Jobs (/surveyor/my-jobs)
 */
export const getSurveyorJobs = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;
    const { stage, search } = req.query;

    const where = { surveyorId };

    if (stage) where.stage = stage.toUpperCase();
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { propertyAddress: { contains: search } },
        { postcode: { contains: search } },
        { clientName: { contains: search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true, branchName: true, keyCollectionProtocol: true } },
        auditTimeline: {
          where: {
            OR: [
              { action: { contains: 'INSPECTED' } },
              { action: 'SITE_EVIDENCE_LOGGED' },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { id: true, action: true, details: true, createdAt: true },
        },
      },
      orderBy: { inspectionDate: 'asc' },
    });

    const enrichedJobs = jobs.map(({ auditTimeline = [], ...job }) => {
      const inspectedLog = auditTimeline.find((l) => String(l.action || '').includes('INSPECTED'));
      const inspectedAt = inspectedLog?.createdAt || null;
      const slaDeadline = inspectedAt
        ? new Date(new Date(inspectedAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
        : null;

      const siteEvidence = auditTimeline
        .filter((l) => l.action === 'SITE_EVIDENCE_LOGGED')
        .map((l) => {
          try {
            const parsed = JSON.parse(l.details || '{}');
            return {
              id: l.id,
              room: parsed.room || 'Site Note',
              note: parsed.note || '',
              url: parsed.url || null,
              time: parsed.time || new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              createdAt: l.createdAt,
            };
          } catch {
            return {
              id: l.id,
              room: 'Site Note',
              note: l.details || '',
              url: null,
              time: new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              createdAt: l.createdAt,
            };
          }
        });

      return {
        ...job,
        inspectedAt,
        slaDeadline,
        siteEvidence,
      };
    });

    return ApiResponse.success(res, { jobs: enrichedJobs, total: enrichedJobs.length });
  } catch (error) {
    next(error);
  }
};

export const getSurveyorJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);
    const surveyorId = req.user.id;

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        surveyorId,
      },
      include: {
        company: true,
        client: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!job) {
      throw ApiError.notFound('Survey instruction not found or you are not assigned to this job');
    }

    return ApiResponse.success(res, { job });
  } catch (error) {
    next(error);
  }
};

