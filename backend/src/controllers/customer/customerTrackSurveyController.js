import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 4: Track My Survey (/customer/track-my-survey)
 * 10-Step Survey Progress Tracker Timeline
 */
export const getSurveyTracking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const job = await prisma.job.findFirst({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
      },
      include: {
        surveyor: {
          select: { name: true, phone: true, surveyorProfile: true },
        },
        terms: true,
        invoices: true,
        auditTimeline: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!job) {
      return ApiResponse.success(res, { tracking: null, message: 'No survey job found for your account' });
    }

    const hasPaid = job.invoices.some((inv) => inv.status === 'PAID');
    const hasSigned = job.terms.some((t) => t.signed);
    const isBooked = ['BOOKED', 'PREPARING_REPORT', 'COMPLETE'].includes(job.stage);
    const isInspected = ['PREPARING_REPORT', 'COMPLETE'].includes(job.stage);
    const isCompleted = job.stage === 'COMPLETE';

    const steps = [
      { step: 1, label: 'Quote Proposal Requested', status: 'completed', time: job.createdAt },
      { step: 2, label: 'Fee & Inclusions Quoted', status: 'completed', time: job.createdAt },
      { step: 3, label: 'Payment Settled (VAT Receipt)', status: hasPaid ? 'completed' : 'pending' },
      { step: 4, label: 'Terms of Engagement Signed', status: hasSigned ? 'completed' : 'pending' },
      { step: 5, label: 'Chartered Surveyor Allocated', status: isBooked ? 'completed' : 'pending' },
      { step: 6, label: 'Estate Agent Key Collection', status: isBooked ? 'completed' : 'pending' },
      { step: 7, label: 'On-Site Inspection Carried Out', status: isInspected ? 'completed' : 'pending' },
      { step: 8, label: 'Draft Report Compilation', status: isInspected ? 'completed' : 'pending' },
      { step: 9, label: 'Admin QA & Peer Audit Review', status: isCompleted ? 'completed' : 'pending' },
      { step: 10, label: 'Official RICS Report Released', status: isCompleted ? 'completed' : 'pending' },
    ];

    const completedCount = steps.filter((s) => s.status === 'completed').length;

    return ApiResponse.success(res, {
      jobReference: job.reference,
      propertyAddress: job.propertyAddress,
      serviceType: job.serviceType,
      currentStage: job.stage,
      progressPercentage: `${completedCount * 10}%`,
      progressScore: `${completedCount}/10 Steps Completed`,
      steps,
    });
  } catch (error) {
    next(error);
  }
};
