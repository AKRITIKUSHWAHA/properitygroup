import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 9: My Reports (/customer/reports)
 */
export const getCustomerReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const reports = await prisma.job.findMany({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
        stage: { in: ['PREPARING_REPORT', 'COMPLETE'] },
      },
      select: {
        id: true,
        reference: true,
        serviceType: true,
        propertyAddress: true,
        postcode: true,
        stage: true,
        inspectionDate: true,
        reportPdfUrl: true,
        reportGeneratedAt: true,
        qaApprovedAt: true,
        surveyor: {
          select: { name: true, surveyorProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { reports, total: reports.length });
  } catch (error) {
    next(error);
  }
};

