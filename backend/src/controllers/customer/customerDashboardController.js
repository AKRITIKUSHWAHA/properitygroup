import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  JOB_STAGES,
  JOB_STAGE_STEPS,
  JOB_STAGE_LABELS,
  normalizeJobStage,
} from '../../utils/jobStages.js';

/**
 * Customer Menu 1: Dashboard (/customer/my-dashboard)
 * Strict Customer Isolation: only returns data belonging to req.user
 */
export const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const userName = req.user.name || 'Valued Client';

    // Fetch customer's primary active job (strictly scoped by clientId or exact clientEmail)
    let activeJob = await prisma.job.findFirst({
      where: {
        OR: [
          ...(userId ? [{ clientId: userId }] : []),
          ...(userEmail ? [{ clientEmail: userEmail }] : []),
        ],
        stage: { not: 'COMPLETE' },
      },
      include: {
        surveyor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            surveyorProfile: true,
          },
        },
        quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
        terms: { orderBy: { createdAt: 'desc' }, take: 1 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 1 },
        auditTimeline: { orderBy: { createdAt: 'desc' }, take: 15 },
      },
      orderBy: { createdAt: 'desc' },
    });

    let activeQuote = activeJob?.quotes?.[0] || null;
    let activeTerm = activeJob?.terms?.[0] || null;
    let activeInvoice = activeJob?.invoices?.[0] || null;

    if (activeJob) {
      const hasPaid = activeJob.invoices?.some((inv) => inv.status === 'PAID') || activeInvoice?.status === 'PAID';
      const hasSigned = activeJob.terms?.some((t) => t.signed) || activeTerm?.signed;
      const currentStage = normalizeJobStage(activeJob.stage);

      let calculatedStep = JOB_STAGE_STEPS[currentStage] || 1;
      if (calculatedStep < 3 && activeQuote?.status === 'ACCEPTED') calculatedStep = 3;
      if (calculatedStep < 4 && hasSigned) calculatedStep = 4;
      if (calculatedStep < 5 && hasPaid) calculatedStep = 5;
      if (calculatedStep < 6 && activeJob.inspectionDate) calculatedStep = 6;

      activeJob = {
        ...activeJob,
        timelineStep: calculatedStep,
        currentStep: calculatedStep,
        status: JOB_STAGE_LABELS[currentStage] || currentStage,
        stage: currentStage,
        property: activeJob.propertyAddress,
        date: activeJob.inspectionDate ? new Date(activeJob.inspectionDate).toLocaleDateString('en-GB') : 'Date: TBD',
        timeSlot: activeJob.inspectionTime || 'Time: TBD',
        surveyor: activeJob.surveyor?.name || 'Pending Allocation',
        paymentStatus: hasPaid ? 'Paid' : (activeInvoice?.status || 'Pending'),
        termsStatus: hasSigned ? 'Signed' : 'Pending',
      };
    }

    // If no activeJob exists in prisma.job, check if there is an active lead in prisma.lead
    if (!activeJob && userEmail) {
      try {
        const lead = await prisma.lead.findFirst({
          where: {
            clientEmail: userEmail,
          },
          include: {
            quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lead) {
          const totalVal = lead.estimatedValue && Number(lead.estimatedValue) > 0 ? Number(lead.estimatedValue) : null;
          const isQuoted =
            (lead.status === 'QUOTE_SENT' ||
            lead.status === 'QUOTED' ||
            lead.status === 'CONVERTED') && Boolean(totalVal);

          const feeStr = totalVal ? `£${totalVal.toFixed(2)}` : 'Pending Quotation';

          activeJob = {
            id: lead.reference || `JOB-${lead.id}`,
            reference: lead.reference,
            serviceType: lead.serviceType || 'Homebuyer Survey – Level 2',
            propertyAddress: lead.propertyAddress,
            postcode: lead.postcode,
            clientName: lead.clientName,
            clientEmail: lead.clientEmail,
            stage: lead.status === 'CONVERTED' ? 'ACCEPTED' : (isQuoted ? 'QUOTE' : 'ENQUIRY'),
            status: lead.status === 'CONVERTED' ? 'Accepted' : (isQuoted ? 'Quoted' : 'Enquiry'),
            timelineStep: lead.status === 'CONVERTED' ? 3 : (isQuoted ? 2 : 1),
            totalFee: feeStr,
            termsStatus: lead.status === 'CONVERTED' ? 'Pending Signature' : 'Not Issued',
            paymentStatus: 'Pending',
            isLead: true,
          };
          if (lead.quotes?.[0]) {
            activeQuote = lead.quotes[0];
          }
        }
      } catch (lErr) {
        console.warn('[getCustomerDashboard] lead check error:', lErr.message);
      }
    }

    // Stat cards matching CustomerDashboardPage.jsx
    const stats = {
      activeSurveyRef: activeJob?.reference || 'No Active Survey',
      serviceType: activeJob?.serviceType || 'Residential Valuation / Home Survey',
      stage: activeJob?.stage || 'NONE',
      timelineStep: activeJob?.timelineStep || 1,
      currentStep: activeJob?.currentStep || 1,
      inspectionDate: activeJob?.inspectionDate || null,
      inspectionTime: activeJob?.inspectionTime || null,
      termsStatus: activeTerm ? (activeTerm.signed ? 'Signed' : 'Pending Signature') : (activeJob?.termsStatus || 'Not Issued'),
      paymentStatus: activeInvoice ? activeInvoice.status : (activeJob?.paymentStatus || 'Pending'),
      totalFee: activeInvoice ? `£${activeInvoice.total}` : activeQuote ? `£${activeQuote.totalAmount}` : (activeJob?.totalFee || '£0'),
      surveyorName: activeJob?.surveyor?.name || 'Surveyor Allocation in Progress',
      surveyorAccreditation: activeJob?.surveyor?.surveyorProfile?.accreditation || 'MRICS',
    };

    return ApiResponse.success(res, {
      activeJob,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
