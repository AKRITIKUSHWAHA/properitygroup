import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 14: Previous Surveys (/customer/previous-surveys)
 * Past Inspection History & Archived Reports
 */
export const getPreviousSurveys = async (req, res, next) => {
  try {
    const userId = req.user?.id ? Number(req.user.id) : null;
    const userEmail = (req.user?.email || '').toLowerCase().trim();

    if (!userId && !userEmail) {
      return ApiResponse.success(res, { previousSurveys: [], total: 0 });
    }

    const orClauses = [];
    if (userId) orClauses.push({ clientId: userId });
    if (userEmail) orClauses.push({ clientEmail: userEmail });

    const previousSurveys = await prisma.job.findMany({
      where: {
        OR: orClauses,
        stage: 'COMPLETE',
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
        surveyor: {
          select: { name: true, surveyorProfile: true },
        },
        invoices: {
          select: { invoiceNumber: true, total: true, status: true, paidAt: true },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    });

    return ApiResponse.success(res, {
      previousSurveys,
      total: previousSurveys.length,
    });
  } catch (error) {
    next(error);
  }
};

