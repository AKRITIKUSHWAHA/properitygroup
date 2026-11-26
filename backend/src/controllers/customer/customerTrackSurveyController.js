import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  JOB_STAGES,
  JOB_STAGE_STEPS,
  JOB_STAGE_LABELS,
  normalizeJobStage,
} from '../../utils/jobStages.js';

/**
 * Customer Menu 4: Track My Survey (/customer/track-my-survey)
 * 10-Step Survey Progress Tracker Timeline derived strictly from DB state
 */
export const getSurveyTracking = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();

    // 1. Strict Job Lookup by integer ID if passed via params or query
    const rawJobId = req.params.id || req.query.jobId || req.query.id;
    const parsedJobId = rawJobId ? parseInt(rawJobId, 10) : NaN;
    let job = null;

    if (!isNaN(parsedJobId) && parsedJobId > 0) {
      job = await prisma.job.findFirst({
        where: {
          id: parsedJobId,
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
          quotes: true,
          auditTimeline: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!job) {
        throw ApiError.notFound('Survey job not found for this account.');
      }
    } else {
      // If no ID is passed, retrieve user's active/latest job
      job = await prisma.job.findFirst({
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
          quotes: true,
          auditTimeline: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!job && userEmail) {
      try {
        const lead = await prisma.lead.findFirst({
          where: { clientEmail: userEmail },
          orderBy: { createdAt: 'desc' },
        });

        if (lead) {
          const isQuoted =
            (lead.status === 'QUOTE_SENT' || lead.status === 'QUOTED' || lead.status === 'CONVERTED') &&
            Boolean(lead.estimatedValue && Number(lead.estimatedValue) > 0);

          const calculatedStep = lead.status === 'CONVERTED' ? 3 : isQuoted ? 2 : 1;

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

          const nextStep =
            calculatedStep === 3
              ? {
                key: 'SIGN_TERMS',
                title: 'Sign terms',
                description: 'Quotation accepted. Please review and digitally sign your RICS Standard Terms of Engagement.',
                actionText: 'Sign Terms of Engagement',
                actionLink: '/customer/terms-to-sign',
                stage: 'ACCEPTED',
              }
              : calculatedStep === 2
                ? {
                  key: 'ACCEPT_QUOTE',
                  title: 'Review quote proposal',
                  description: 'Formal RICS survey quotation is ready for your property.',
                  actionText: 'Review Quotation',
                  actionLink: '/customer/my-quotations',
                  stage: 'QUOTE',
                }
                : {
                  key: 'ENQUIRY_LOGGED',
                  title: 'Awaiting quotation proposal',
                  description: 'Your enquiry is being assessed by our surveying team.',
                  actionText: 'View Dashboard',
                  actionLink: '/customer/dashboard',
                  stage: 'ENQUIRY',
                };

          return ApiResponse.success(res, {
            jobReference: lead.reference,
            reference: lead.reference,
            property: lead.propertyAddress,
            propertyAddress: lead.propertyAddress,
            serviceType: lead.serviceType,
            currentStage: lead.status === 'CONVERTED' ? 'ACCEPTED' : isQuoted ? 'QUOTE' : 'ENQUIRY',
            currentStep: calculatedStep,
            progressPercentage: `${calculatedStep * 10}%`,
            progressScore: `${calculatedStep}/10 Steps Completed`,
            steps,
            nextStep,
          });
        }
      } catch (lErr) {
        console.error('[customerTrackSurvey lead fallback error]:', lErr.message);
      }
    }

    if (!job) {
      return ApiResponse.success(res, { tracking: null, message: 'No survey job found for your account' });
    }

    // 2. Strict step computation derived directly from 10-stage DB enum and child associations
    const currentStage = normalizeJobStage(job.stage);
    let calculatedStep = JOB_STAGE_STEPS[currentStage] || 1;

    const acceptedQuote = job.quotes?.find((q) => q.status === 'ACCEPTED');
    const signedTerm = job.terms?.find((t) => t.signed);
    const paidInvoice = job.invoices?.find((inv) => inv.status === 'PAID');
    const claimedInvoice = job.invoices?.find(
      (inv) => inv.paymentMethod === 'BACS_TRANSFER_CLAIMED' && inv.status !== 'PAID'
    );

    // Progression safeguards
    if (calculatedStep < 3 && acceptedQuote) calculatedStep = 3;
    if (calculatedStep < 4 && signedTerm) calculatedStep = 4;
    if (calculatedStep < 5 && paidInvoice) calculatedStep = 5;
    if (calculatedStep < 6 && job.inspectionDate) calculatedStep = 6;

    // 3. Authoritative Next Step Card derived directly from DB state
    const isCompleted = calculatedStep >= 10 || currentStage === 'COMPLETE';
    const isQA = currentStage === 'QA_REVIEW';

    let nextStep = null;
    if (isCompleted) {
      nextStep = {
        key: 'REPORT_DELIVERED',
        title: 'Report Delivered',
        description: 'Your official RICS Home Survey report has been delivered and is available for download.',
        actionText: 'Download Final Report (PDF)',
        actionLink: '/customer/previous-surveys',
        stage: 'COMPLETE',
      };
    } else if (currentStage === 'QA_REVIEW') {
      nextStep = {
        key: 'QA_IN_PROGRESS',
        title: 'Quality Assurance Review',
        description: 'Your survey report is under peer audit by our Lead Chartered Surveyor for final quality signoff.',
        actionText: 'Track Progress',
        actionLink: '/customer/track-my-survey',
        stage: 'QA_REVIEW',
      };
    } else if (currentStage === 'DRAFTING') {
      nextStep = {
        key: 'REPORT_IN_PROGRESS',
        title: 'Report Drafting Underway',
        description: 'Your chartered surveyor is drafting your official RICS survey report and photographic defect notes.',
        actionText: 'Track Progress',
        actionLink: '/customer/track-my-survey',
        stage: 'DRAFTING',
      };
    } else if (currentStage === 'INSPECTED') {
      nextStep = {
        key: 'SITE_INSPECTED',
        title: 'Inspection Completed',
        description: 'Physical inspection completed. The surveyor is compiling laboratory findings and drafting the report.',
        actionText: 'Track Progress',
        actionLink: '/customer/track-my-survey',
        stage: 'INSPECTED',
      };
    } else if (calculatedStep >= 6 || currentStage === 'BOOKED') {
      const formattedDate = job.inspectionDate
        ? new Date(job.inspectionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'scheduled date';
      const timeText = job.inspectionTime ? ` at ${job.inspectionTime}` : '';
      nextStep = {
        key: 'INSPECTION_BOOKED',
        title: `Inspection on ${formattedDate}`,
        description: `Your surveyor inspection attendance is confirmed for ${formattedDate}${timeText}.`,
        actionText: 'View Booking Details',
        actionLink: '/customer/my-bookings',
        stage: 'BOOKED',
      };
    } else if (calculatedStep >= 5 || currentStage === 'PAID') {
      nextStep = {
        key: 'CHOOSE_INSPECTION_DATE',
        title: 'Choose inspection date',
        description: 'Payment verified and settled. Please choose your preferred survey inspection date to allocate a surveyor.',
        actionText: 'Choose Inspection Date',
        actionLink: '/customer/my-bookings',
        stage: 'PAID',
      };
    } else if (calculatedStep >= 4 || currentStage === 'TERMS_SIGNED') {
      if (claimedInvoice) {
        nextStep = {
          key: 'BACS_VERIFICATION_PENDING',
          title: 'Bank Transfer Verification Pending',
          description: 'Your bank transfer claim has been submitted. Our accounts team is verifying receipt of funds so your inspection can be scheduled.',
          actionText: 'View Invoice Status',
          actionLink: '/customer/invoices-and-payments',
          stage: 'TERMS_SIGNED',
        };
      } else {
        nextStep = {
          key: 'PAY_INVOICE',
          title: 'Pay invoice',
          description: 'Terms of Engagement signed. Please settle the invoice via online card or bank transfer to confirm booking.',
          actionText: 'Pay Invoice Online',
          actionLink: '/customer/invoices-and-payments',
          stage: 'TERMS_SIGNED',
        };
      }
    } else if (calculatedStep >= 3 || currentStage === 'QUOTE_ACCEPTED') {
      nextStep = {
        key: 'SIGN_TERMS',
        title: 'Sign terms',
        description: 'Quotation accepted. Please review and digitally sign your RICS Standard Terms of Engagement.',
        actionText: 'Sign Terms of Engagement',
        actionLink: '/customer/terms-to-sign',
        stage: 'QUOTE_ACCEPTED',
      };
    } else {
      nextStep = {
        key: 'ACCEPT_QUOTE',
        title: 'Review quote proposal',
        description: 'A formal survey quotation has been issued for your property.',
        actionText: 'Review Quotation',
        actionLink: '/customer/my-quotations',
        stage: 'QUOTE_ISSUED',
      };
    }

    const steps = [
      { step: 1, label: 'Enquiry Received', status: calculatedStep >= 1 ? 'completed' : 'pending', time: job.createdAt },
      { step: 2, label: 'Quote Issued', status: calculatedStep >= 2 ? 'completed' : 'pending', time: job.createdAt },
      { step: 3, label: 'Quote Accepted', status: calculatedStep >= 3 ? 'completed' : 'pending', time: acceptedQuote?.acceptedAt },
      { step: 4, label: 'Terms Signed', status: calculatedStep >= 4 ? 'completed' : 'pending', time: signedTerm?.signedAt },
      { step: 5, label: 'Payment Confirmed', status: calculatedStep >= 5 ? 'completed' : 'pending', time: paidInvoice?.paidAt },
      { step: 6, label: 'Inspection Booked', status: calculatedStep >= 6 ? 'completed' : 'pending', time: job.inspectionDate },
      { step: 7, label: 'Site Inspected', status: calculatedStep >= 7 ? 'completed' : 'pending' },
      { step: 8, label: 'Report Drafting', status: calculatedStep >= 8 ? 'completed' : 'pending' },
      { step: 9, label: 'QA Review', status: calculatedStep >= 9 ? (calculatedStep >= 10 ? 'completed' : 'in_progress') : 'pending' },
      { step: 10, label: 'Report Delivered', status: calculatedStep >= 10 ? 'completed' : 'pending' },
    ];

    const effectiveProgress = isCompleted ? 100 : calculatedStep * 10;

    return ApiResponse.success(res, {
      jobId: job.id,
      jobReference: job.reference,
      reference: job.reference,
      property: job.propertyAddress,
      propertyAddress: job.propertyAddress,
      serviceType: job.serviceType,
      currentStage: isCompleted ? 'COMPLETE' : isQA ? 'QA_REVIEW' : job.stage,
      currentStep: calculatedStep,
      paymentStatus: paidInvoice ? 'Paid' : claimedInvoice ? 'Claimed (Verification Pending)' : 'Pending',
      progressPercentage: `${effectiveProgress}%`,
      progressScore: `${calculatedStep}/10 Steps Completed`,
      steps,
      nextStep,
      inspectionDate: job.inspectionDate,
      inspectionTime: job.inspectionTime,
      surveyor: job.surveyor,
    });
  } catch (error) {
    next(error);
  }
};
