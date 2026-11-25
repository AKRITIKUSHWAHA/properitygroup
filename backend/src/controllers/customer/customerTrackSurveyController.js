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

    if (!job && userEmail) {
      try {
        const lead = await prisma.lead.findFirst({
          where: {
            clientEmail: userEmail,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lead) {
          const isQuoted =
            ((lead.status === 'QUOTE_SENT' ||
            lead.status === 'QUOTED' ||
            lead.status === 'CONVERTED') && Boolean(lead.estimatedValue && Number(lead.estimatedValue) > 0));

          const calculatedStep = lead.status === 'CONVERTED' ? 3 : (isQuoted ? 2 : 1);

          const steps = [
            { step: 1, label: 'Enquiry Received', status: 'completed', time: lead.createdAt },
            { step: 2, label: 'Quote Issued', status: calculatedStep >= 2 ? 'completed' : 'pending', time: lead.createdAt },
            { step: 3, label: 'Quote Accepted', status: calculatedStep >= 3 ? 'completed' : 'pending' },
            { step: 4, label: 'Terms Signed', status: 'pending' },
            { step: 5, label: 'Payment Confirmed', status: 'pending' },
            { step: 6, label: 'Appointment Booked', status: 'pending' },
            { step: 7, label: 'Inspection Completed', status: 'pending' },
            { step: 8, label: 'Report Preparation', status: 'pending' },
            { step: 9, label: 'Quality Check', status: 'pending' },
            { step: 10, label: 'Report Delivered', status: 'pending' },
          ];

          return ApiResponse.success(res, {
            jobReference: lead.reference,
            reference: lead.reference,
            property: lead.propertyAddress,
            propertyAddress: lead.propertyAddress,
            serviceType: lead.serviceType,
            currentStage: lead.status === 'CONVERTED' ? 'ACCEPTED' : (isQuoted ? 'QUOTE' : 'ENQUIRY'),
            currentStep: calculatedStep,
            progressPercentage: `${calculatedStep * 10}%`,
            progressScore: `${calculatedStep}/10 Steps Completed`,
            steps,
          });
        }
      } catch (lErr) {}
    }

    if (!job) {
      return ApiResponse.success(res, { tracking: null, message: 'No survey job found for your account' });
    }

    const hasPaid = job.invoices.some((inv) => inv.status === 'PAID') || job.stage === 'PAID';
    const hasSigned = job.terms.some((t) => t.signed);
    const isBooked = ['BOOKED', 'PREPARING_REPORT', 'COMPLETE'].includes(job.stage);
    const isInspected = ['PREPARING_REPORT', 'COMPLETE'].includes(job.stage);
    const isCompleted = job.stage === 'COMPLETE' || Boolean(job.qaApprovedAt);

    const hasDraftSubmitted =
      Boolean(job.reportPdfUrl) ||
      Boolean(job.reportGeneratedAt) ||
      job.status === 'QA_Review' ||
      job.auditTimeline?.some(
        (a) =>
          a.action === 'DRAFT_REPORT_SUBMITTED_FOR_QA' ||
          (a.action === 'STAGE_CHANGED_TO_PREPARING_REPORT' && /submitted draft report|qa audit|qa review/i.test(a.details || ''))
      );

    const isDrafting =
      job.stage === 'DRAFTING' ||
      job.status === 'Drafting' ||
      (job.stage === 'PREPARING_REPORT' &&
        job.auditTimeline?.some(
          (a) =>
            a.action === 'DRAFT_REPORT_STARTED' ||
            (a.action === 'STAGE_CHANGED_TO_PREPARING_REPORT' && /started report drafting|drafting commenced/i.test(a.details || ''))
        ));

    // Only mark QA (Step 9) once report draft is actually uploaded/submitted for QA review
    const isQA = job.stage === 'QA_REVIEW' || job.status === 'QA_Review' || (job.stage === 'PREPARING_REPORT' && hasDraftSubmitted);

    let calculatedStep = 1;
    if (isCompleted) calculatedStep = 10;
    else if (isQA) calculatedStep = 9;
    else if (isDrafting) calculatedStep = 8;
    else if (isInspected) calculatedStep = 7;
    else if (isBooked) calculatedStep = 6;
    else if (hasPaid) calculatedStep = 5;
    else if (hasSigned) calculatedStep = 4;
    else if (job.stage === 'ACCEPTED' || job.quoteStatus === 'ACCEPTED') calculatedStep = 3;
    else if (job.stage === 'QUOTE') calculatedStep = 2;
    else calculatedStep = 1;

    const steps = [
      { step: 1, label: 'Enquiry Received', status: calculatedStep >= 1 ? 'completed' : 'pending', time: job.createdAt },
      { step: 2, label: 'Quote Issued', status: calculatedStep >= 2 ? 'completed' : 'pending', time: job.createdAt },
      { step: 3, label: 'Quote Accepted', status: calculatedStep >= 3 ? 'completed' : 'pending' },
      { step: 4, label: 'Terms Signed', status: calculatedStep >= 4 ? 'completed' : 'pending' },
      { step: 5, label: 'Payment Confirmed', status: calculatedStep >= 5 ? 'completed' : 'pending' },
      { step: 6, label: 'Appointment Booked', status: calculatedStep >= 6 ? 'completed' : 'pending' },
      { step: 7, label: 'Inspection Completed', status: calculatedStep >= 7 ? 'completed' : 'pending' },
      { step: 8, label: 'Report Preparation', status: calculatedStep >= 8 ? 'completed' : 'pending' },
      { step: 9, label: 'Quality Check', status: calculatedStep >= 9 ? (isCompleted ? 'completed' : 'in_progress') : 'pending' },
      { step: 10, label: 'Report Delivered', status: isCompleted ? 'completed' : 'pending' },
    ];

    const completedCount = steps.filter((s) => s.status === 'completed').length;
    const effectiveProgress = isCompleted ? 100 : (calculatedStep * 10);

    return ApiResponse.success(res, {
      jobReference: job.reference,
      reference: job.reference,
      property: job.propertyAddress,
      propertyAddress: job.propertyAddress,
      serviceType: job.serviceType,
      currentStage: isCompleted ? 'COMPLETE' : (isQA ? 'QA_REVIEW' : job.stage),
      currentStep: calculatedStep,
      progressPercentage: `${effectiveProgress}%`,
      progressScore: `${calculatedStep}/10 Steps Completed`,
      steps,
    });
  } catch (error) {
    next(error);
  }
};
