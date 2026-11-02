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
    const [quotesToSubmit, jobsToBook, reportsToUpload, termsToSign, paymentsToCollect, completed] =
      await Promise.all([
        prisma.job.count({ where: { stage: 'QUOTE' } }),
        prisma.job.count({ where: { stage: { in: ['PAID', 'ACCEPTED'] } } }),
        prisma.job.count({ where: { stage: 'PREPARING_REPORT' } }),
        prisma.term.count({ where: { signed: false } }),
        prisma.invoice.count({ where: { status: 'PENDING' } }),
        prisma.job.count({ where: { stage: 'COMPLETE' } }),
      ]);

    return ApiResponse.success(res, {
      buckets: [
        { id: 'quotes_to_submit', label: 'Quotes to Submit', count: quotesToSubmit, stage: 'QUOTE' },
        { id: 'jobs_to_book', label: 'Jobs to Book', count: jobsToBook, stage: 'PAID/ACCEPTED' },
        { id: 'reports_to_upload', label: 'Reports to Upload', count: reportsToUpload, stage: 'PREPARING_REPORT' },
        { id: 'terms_to_sign', label: 'Terms to Sign', count: termsToSign },
        { id: 'payments_to_collect', label: 'Payments to Collect', count: paymentsToCollect },
        { id: 'completed', label: 'Completed Inspections', count: completed, stage: 'COMPLETE' },
      ],
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

