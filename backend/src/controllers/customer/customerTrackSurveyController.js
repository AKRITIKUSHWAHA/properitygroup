import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 4: Track My Survey (/customer/track-my-survey)
 * 10-Step Survey Progress Tracker Timeline
 */
export const getSurveyTracking = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const headerEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const userEmail = (headerEmail || req.user?.email || '').toLowerCase().trim();
    const headerName = (req.headers['x-user-name'] || '').toLowerCase().trim();
    const userName = (headerName || req.user?.name || '').toLowerCase().trim();

    let job = await prisma.job.findFirst({
      where: {
        OR: [
          ...(userId ? [{ clientId: userId }] : []),
          ...(userEmail ? [{ clientEmail: userEmail }] : []),
          ...(userName && userName.length > 2 ? [{ clientName: { contains: userName } }] : []),
        ],
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

    if (!job && (userEmail || userName)) {
      try {
        const lead = await prisma.lead.findFirst({
          where: {
            OR: [
              ...(userEmail ? [{ clientEmail: userEmail }] : []),
              ...(userName && userName.length > 2 ? [{ clientName: { contains: userName } }] : []),
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lead) {
          const isQuoted =
            lead.status === 'QUOTE_SENT' ||
            lead.status === 'QUOTED' ||
            lead.status === 'CONVERTED' ||
            Boolean(lead.estimatedValue);

          const steps = [
            { step: 1, label: 'Quote Proposal Requested', status: 'completed', time: lead.createdAt },
            { step: 2, label: 'Fee & Inclusions Quoted', status: isQuoted ? 'completed' : 'pending', time: lead.createdAt },
            { step: 3, label: 'Payment Settled (VAT Receipt)', status: 'pending' },
            { step: 4, label: 'Terms of Engagement Signed', status: 'pending' },
            { step: 5, label: 'Chartered Surveyor Allocated', status: 'pending' },
            { step: 6, label: 'Estate Agent Key Collection', status: 'pending' },
            { step: 7, label: 'On-Site Inspection Carried Out', status: 'pending' },
            { step: 8, label: 'Draft Report Compilation', status: 'pending' },
            { step: 9, label: 'Admin QA & Peer Audit Review', status: 'pending' },
            { step: 10, label: 'Official RICS Report Released', status: 'pending' },
          ];

          const completedCount = steps.filter((s) => s.status === 'completed').length;

          const calculatedStep = lead.status === 'CONVERTED' ? 3 : (isQuoted ? 2 : 1);

          return ApiResponse.success(res, {
            jobReference: lead.reference,
            reference: lead.reference,
            property: lead.propertyAddress,
            propertyAddress: lead.propertyAddress,
            serviceType: lead.serviceType,
            currentStage: lead.status === 'CONVERTED' ? 'ACCEPTED' : (isQuoted ? 'QUOTE' : 'ENQUIRY'),
            currentStep: calculatedStep,
            progressPercentage: `${completedCount * 10}%`,
            progressScore: `${completedCount}/10 Steps Completed`,
            steps,
          });
        }
      } catch (lErr) {}
    }

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

    let calculatedStep = 1;
    if (isCompleted) calculatedStep = 10;
    else if (job.stage === 'PREPARING_REPORT') calculatedStep = 8;
    else if (isInspected) calculatedStep = 7;
    else if (isBooked) calculatedStep = 6;
    else if (hasPaid) calculatedStep = 5;
    else if (hasSigned) calculatedStep = 4;
    else if (job.stage === 'ACCEPTED' || job.quoteStatus === 'ACCEPTED') calculatedStep = 3;
    else if (job.stage === 'QUOTE') calculatedStep = 2;
    else calculatedStep = 1;

    return ApiResponse.success(res, {
      jobReference: job.reference,
      reference: job.reference,
      property: job.propertyAddress,
      propertyAddress: job.propertyAddress,
      serviceType: job.serviceType,
      currentStage: job.stage,
      currentStep: calculatedStep,
      progressPercentage: `${completedCount * 10}%`,
      progressScore: `${completedCount}/10 Steps Completed`,
      steps,
    });
  } catch (error) {
    next(error);
  }
};
