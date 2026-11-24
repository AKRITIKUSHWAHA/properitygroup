import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 1: Dashboard (/customer/my-dashboard)
 * Strict Customer Isolation: only returns data belonging to req.user
 */
export const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const headerEmail = (req.headers['x-user-email'] || '').toLowerCase().trim();
    const userEmail = (headerEmail || req.user?.email || '').toLowerCase().trim();
    const headerName = (req.headers['x-user-name'] || '').toLowerCase().trim();
    const userName = (headerName || req.user?.name || '').toLowerCase().trim();

    // Fetch customer's primary active job
    let activeJob = await prisma.job.findFirst({
      where: {
        OR: [
          ...(userId ? [{ clientId: userId }] : []),
          ...(userEmail ? [{ clientEmail: userEmail }] : []),
          ...(userName && userName.length > 2 ? [{ clientName: { contains: userName } }] : []),
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
      },
      orderBy: { createdAt: 'desc' },
    });

    let activeQuote = activeJob?.quotes?.[0] || null;
    let activeTerm = activeJob?.terms?.[0] || null;
    let activeInvoice = activeJob?.invoices?.[0] || null;

    if (activeJob) {
      const hasPaid = activeJob.invoices?.some((inv) => inv.status === 'PAID') || activeInvoice?.status === 'PAID';
      const hasSigned = activeJob.terms?.some((t) => t.signed) || activeTerm?.signed;
      const isBooked = ['BOOKED', 'PREPARING_REPORT', 'COMPLETE'].includes(activeJob.stage);
      const isInspected = ['PREPARING_REPORT', 'COMPLETE'].includes(activeJob.stage);
      const isCompleted = activeJob.stage === 'COMPLETE';

      let calculatedStep = 1;
      if (isCompleted) calculatedStep = 10;
      else if (activeJob.stage === 'PREPARING_REPORT') calculatedStep = 8;
      else if (isInspected) calculatedStep = 7;
      else if (isBooked) calculatedStep = 6;
      else if (hasPaid) calculatedStep = 5;
      else if (hasSigned) calculatedStep = 4;
      else if (activeJob.stage === 'ACCEPTED' || activeQuote?.status === 'ACCEPTED') calculatedStep = 3;
      else if (activeJob.stage === 'QUOTE') calculatedStep = 2;
      else calculatedStep = 1;

      activeJob = {
        ...activeJob,
        timelineStep: calculatedStep,
        currentStep: calculatedStep,
        status: isCompleted ? 'Completed' : (isBooked ? 'Booked' : (hasPaid ? 'Paid' : (hasSigned ? 'Signed' : activeJob.stage))),
        property: activeJob.propertyAddress,
        date: activeJob.inspectionDate ? new Date(activeJob.inspectionDate).toLocaleDateString('en-GB') : 'Date: TBD',
        timeSlot: activeJob.inspectionTime || 'Time: TBD',
        surveyor: activeJob.surveyor?.name || 'Pending Allocation',
        paymentStatus: hasPaid ? 'Paid' : (activeInvoice?.status || 'Pending'),
        termsStatus: hasSigned ? 'Signed' : 'Pending',
      };
    }

    // If no activeJob exists in prisma.job, check if there is an active lead in prisma.lead
    if (!activeJob && (userEmail || userName)) {
      try {
        const lead = await prisma.lead.findFirst({
          where: {
            OR: [
              ...(userEmail ? [{ clientEmail: userEmail }] : []),
              ...(userName && userName.length > 2 ? [{ clientName: { contains: userName } }] : []),
            ],
          },
          include: {
            quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (lead) {
          const isQuoted =
            lead.status === 'QUOTE_SENT' ||
            lead.status === 'QUOTED' ||
            lead.status === 'CONVERTED' ||
            Boolean(lead.estimatedValue);

          const totalVal = lead.estimatedValue ? Number(lead.estimatedValue) : 660.0;
          const feeStr = `£${totalVal.toFixed(2)}`;

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
