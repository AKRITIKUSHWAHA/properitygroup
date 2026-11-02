import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Surveyor Menu 1: Dashboard (/surveyor/dashboard)
 * Strict Surveyor Isolation: only returns data assigned to req.user.id
 */
export const getSurveyorDashboard = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;

    // 1. Fetch surveyor profile
    const profile = await prisma.surveyorProfile.findUnique({
      where: { userId: surveyorId },
    });

    // 2. Fetch metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [activeJobsCount, todayVisitsCount, pendingReportsCount] = await Promise.all([
      prisma.job.count({
        where: {
          surveyorId,
          stage: { in: ['BOOKED', 'PREPARING_REPORT'] },
        },
      }),
      prisma.job.count({
        where: {
          surveyorId,
          inspectionDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.job.count({
        where: {
          surveyorId,
          stage: 'PREPARING_REPORT',
        },
      }),
    ]);

    // 3. Upcoming schedule (next 5 inspections)
    const upcomingInspections = await prisma.job.findMany({
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
        keyCollectionDetails: true,
        specialInstructions: true,
        company: {
          select: { name: true, branchName: true, keyCollectionProtocol: true },
        },
      },
      orderBy: { inspectionDate: 'asc' },
      take: 5,
    });

    const stats = {
      activeJobs: activeJobsCount,
      todayInspections: todayVisitsCount,
      pendingReportUploads: pendingReportsCount,
      qualityRating: `${profile?.rating || 4.9} / 5.0 (${profile?.accreditation || 'MRICS'})`,
      piiStatus: profile?.piiValidated ? 'PII Insurance Validated' : 'PII Review Pending',
    };

    return ApiResponse.success(res, {
      stats,
      profile,
      upcomingInspections,
    });
  } catch (error) {
    next(error);
  }
};

