import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Surveyor Menu 2: My Calendar (/surveyor/my-calendar)
 */
export const getSurveyorCalendar = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;
    const { month, year } = req.query;

    const where = {
      surveyorId,
      inspectionDate: { not: null },
    };

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.inspectionDate = { gte: start, lte: end };
    }

    const events = await prisma.job.findMany({
      where,
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
          select: { name: true, branchName: true, contactPhone: true },
        },
      },
      orderBy: { inspectionDate: 'asc' },
    });

    return ApiResponse.success(res, { events, total: events.length });
  } catch (error) {
    next(error);
  }
};
