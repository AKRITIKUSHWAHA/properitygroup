import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendBookingReminderEmail } from './emailService.js';

const MAX_REMINDERS = 2;

/**
 * Scan DB for paid + terms-signed jobs that are still unbooked
 * and dispatch up to 2 booking reminder emails per job.
 */
export const runBookingReminderScan = async ({
  triggeredByUserId = null,
  minAgeHours = env.BOOKING_REMINDER_MIN_AGE_HOURS,
} = {}) => {
  const cutoffMs = Math.max(0, Number(minAgeHours) || 0) * 60 * 60 * 1000;
  const nowMs = Date.now();

  const candidateJobs = await prisma.job.findMany({
    where: {
      stage: { in: ['PAID', 'TERMS_SIGNED'] },
      inspectionDate: null,
      invoices: { some: { status: 'PAID' } },
      terms: { some: { signed: true } },
    },
    include: {
      auditTimeline: {
        where: { action: 'BOOKING_REMINDER_SENT' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const results = [];

  for (const job of candidateJobs) {
    const sentLogs = job.auditTimeline || [];
    const sentCount = sentLogs.length;

    if (sentCount >= MAX_REMINDERS) {
      continue;
    }

    const lastActivityAt = sentCount > 0 ? sentLogs[0].createdAt : job.updatedAt || job.createdAt;
    const elapsedMs = nowMs - new Date(lastActivityAt).getTime();

    if (cutoffMs > 0 && elapsedMs < cutoffMs) {
      continue;
    }

    if (!job.clientEmail || !job.clientEmail.includes('@')) {
      continue;
    }

    const reminderNumber = sentCount + 1;
    const emailRes = await sendBookingReminderEmail({
      to: job.clientEmail,
      clientName: job.clientName || 'Valued Client',
      jobRef: job.reference,
      propertyAddress: job.propertyAddress,
      surveyType: job.serviceType,
      reminderNumber,
      jobId: job.id,
    });

    const auditUserId = triggeredByUserId || job.clientId || 1;
    try {
      await prisma.auditLog.create({
        data: {
          jobId: job.id,
          userId: auditUserId,
          action: 'BOOKING_REMINDER_SENT',
          details: JSON.stringify({
            reminderNumber,
            sentAt: new Date().toISOString(),
            emailSent: Boolean(emailRes?.success),
            error: emailRes?.error || null,
          }),
        },
      });
    } catch (auditErr) {
      logger.error(`[bookingReminderJob] Failed to log AuditLog for ${job.reference}: ${auditErr.message}`);
    }

    try {
      let targetCustomerId = job.clientId || null;
      if (!targetCustomerId) {
        const user = await prisma.user.findFirst({
          where: { email: job.clientEmail.toLowerCase().trim() },
          select: { id: true },
        });
        if (user) targetCustomerId = user.id;
      }

      if (targetCustomerId) {
        await prisma.notification.create({
          data: {
            userId: targetCustomerId,
            role: 'CUSTOMER',
            title: `Booking Reminder (${reminderNumber}/2) — ${job.reference}`,
            desc: `Your payment and terms for ${job.propertyAddress} are complete. Please schedule your surveyor inspection date.`,
            type: 'booking',
            link: '/customer/my-bookings',
          },
        });
      }
    } catch (notifErr) {
      logger.error(`[bookingReminderJob] Failed to create notification for ${job.reference}: ${notifErr.message}`);
    }

    results.push({
      jobId: job.id,
      reference: job.reference,
      clientEmail: job.clientEmail,
      reminderNumber,
      emailSent: Boolean(emailRes?.success),
      emailError: emailRes?.error || null,
    });
  }

  return {
    scanned: candidateJobs.length,
    dispatched: results.length,
    results,
  };
};

/**
 * Start the periodic booking reminder scheduler (config-controlled).
 */
export const startBookingReminderScheduler = () => {
  if (!env.ENABLE_BOOKING_REMINDER_JOB) {
    logger.info('[bookingReminderJob] Scheduler disabled via ENABLE_BOOKING_REMINDER_JOB=false.');
    return null;
  }

  const intervalMs = Math.max(60 * 1000, env.BOOKING_REMINDER_INTERVAL_MS || 6 * 60 * 60 * 1000);
  logger.info(`[bookingReminderJob] Scheduler active (interval: ${Math.round(intervalMs / 60000)}m, minAgeHours: ${env.BOOKING_REMINDER_MIN_AGE_HOURS}h).`);

  const timer = setInterval(() => {
    runBookingReminderScan().catch((err) => {
      logger.error(`[bookingReminderJob] Scheduled scan failed: ${err.message}`);
    });
  }, intervalMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return timer;
};
