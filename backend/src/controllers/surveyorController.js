import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getSurveyors = async (req, res, next) => {
  try {
    const surveyors = await prisma.user.findMany({
      where: { role: 'SURVEYOR' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        surveyorProfile: true,
        assignedJobs: {
          select: { id: true, reference: true, stage: true, inspectionDate: true },
        },
      },
    });

    return ApiResponse.success(res, { surveyors, total: surveyors.length });
  } catch (error) {
    next(error);
  }
};

