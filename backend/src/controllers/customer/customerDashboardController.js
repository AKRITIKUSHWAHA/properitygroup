import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 1: Dashboard (/customer/my-dashboard)
 * Strict Customer Isolation: only returns data belonging to req.user
 */
export const getCustomerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Fetch customer's primary active job
    const activeJob = await prisma.job.findFirst({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
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

    const activeQuote = activeJob?.quotes?.[0] || null;
    const activeTerm = activeJob?.terms?.[0] || null;
    const activeInvoice = activeJob?.invoices?.[0] || null;

    // Stat cards matching CustomerDashboardPage.jsx
    const stats = {
      activeSurveyRef: activeJob?.reference || 'No Active Survey',
      serviceType: activeJob?.serviceType || 'Residential Valuation / Home Survey',
      stage: activeJob?.stage || 'NONE',
      inspectionDate: activeJob?.inspectionDate || null,
      inspectionTime: activeJob?.inspectionTime || null,
      termsStatus: activeTerm ? (activeTerm.signed ? 'Signed' : 'Pending Signature') : 'Not Issued',
      paymentStatus: activeInvoice ? activeInvoice.status : 'Pending',
      totalFee: activeInvoice ? `£${activeInvoice.total}` : activeQuote ? `£${activeQuote.totalAmount}` : '£0',
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

