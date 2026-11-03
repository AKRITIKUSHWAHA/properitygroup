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
      },
      orderBy: { inspectionDate: 'asc' },
    });

    return ApiResponse.success(res, { jobs, total: jobs.length });
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

