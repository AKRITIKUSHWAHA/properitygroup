import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 1: Dashboard
 * KPI Stats, 6 SurveyBooker Action Buckets, Activity feeds, and Charts
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalRevenue, activeJobsCount, pendingQuotesCount, totalLeadsCount, convertedLeadsCount, unreadMessages] =
      await Promise.all([
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true },
        }),
        prisma.job.count({
          where: { stage: { not: 'COMPLETE' } },
        }),
        prisma.quote.count({
          where: { status: 'SENT' },
        }),
        prisma.lead.count(),
        prisma.lead.count({ where: { status: 'CONVERTED' } }),
        prisma.message.count({ where: { readByAdmin: false, role: 'customer' } }),
      ]);

    const conversionRate = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : 0;

    return ApiResponse.success(res, {
      totalRevenue: totalRevenue._sum.total || 0,
      activeJobs: activeJobsCount,
      pendingQuotes: pendingQuotesCount,
      conversionRate: `${conversionRate}%`,
      unreadMessages,
    });
  } catch (error) {
    next(error);
  }
};

export const getActionBuckets = async (req, res, next) => {
  try {
    // Ready to book definition: invoice PAID + terms signed + not yet booked/completed
    const readyToBookCondition = {
      stage: { in: ['PAID', 'QUOTE_ACCEPTED', 'TERMS_SIGNED'] },
      terms: { some: { signed: true } },
      invoices: { some: { status: 'PAID' } },
    };

    const [quotesToSubmit, jobsToBookCount, jobsToBookList, reportsToUpload, termsToSign, paymentsToCollect, completed] =
      await Promise.all([
        prisma.lead.count({ where: { status: { in: ['NEW', 'CONTACTED'] } } }),
        prisma.job.count({ where: readyToBookCondition }),
        prisma.job.findMany({
          where: readyToBookCondition,
          include: {
            surveyor: { select: { id: true, name: true, email: true, phone: true } },
            company: { select: { id: true, name: true, branchName: true, keyCollectionProtocol: true } },
            quotes: true,
            terms: true,
            invoices: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.job.count({ where: { stage: { in: ['INSPECTED', 'DRAFTING'] } } }),
        prisma.term.count({ where: { signed: false } }),
        prisma.invoice.count({ where: { status: 'PENDING' } }),
        prisma.job.count({ where: { stage: 'COMPLETE' } }),
      ]);

    return ApiResponse.success(res, {
      buckets: [
        { id: 'quotes_to_submit', label: 'Quotes to Submit', count: quotesToSubmit, stage: 'QUOTE_ISSUED' },
        { id: 'jobs_to_book', label: 'Jobs to Book', count: jobsToBookCount, stage: 'READY_TO_BOOK' },
        { id: 'reports_to_upload', label: 'Reports to Upload', count: reportsToUpload, stage: 'DRAFTING' },
        { id: 'terms_to_sign', label: 'Terms to Sign', count: termsToSign },
        { id: 'payments_to_collect', label: 'Payments to Collect', count: paymentsToCollect },
        { id: 'completed', label: 'Completed Inspections', count: completed, stage: 'COMPLETE' },
      ],
      jobsToBook: jobsToBookList,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const [recentJobs, recentLeads, recentAuditLogs] = await Promise.all([
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { surveyor: { select: { name: true } } },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: true } } },
      }),
    ]);

    return ApiResponse.success(res, { recentJobs, recentLeads, recentAuditLogs });
  } catch (error) {
    next(error);
  }
};

