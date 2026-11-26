import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const DEFAULT_PRACTICE_SETTINGS = [
  { key: 'practice_name', value: 'NJS Property Group Ltd', category: 'GENERAL' },
  { key: 'rics_firm_number', value: 'RICS Regulated Practice', category: 'RICS' },
  { key: 'vat_registration_number', value: 'GB 984 2190 44', category: 'FINANCIAL' },
  { key: 'standard_vat_rate', value: '20.0', category: 'FINANCIAL' },
  { key: 'registered_office_address', value: 'Belmont House, Uxbridge UB8 1QS', category: 'GENERAL' },
  { key: 'operations_email', value: 'info@njspropertygroup.com', category: 'GENERAL' },
  { key: 'operations_phone', value: '0333 305 2777', category: 'GENERAL' },
  { key: 'default_turnaround_days', value: '5', category: 'GENERAL' },
  { key: 'email_notifications_active', value: 'true', category: 'NOTIFICATION' },
  { key: 'sms_reminders_active', value: 'true', category: 'NOTIFICATION' },
];

/**
 * Superadmin Menu 11: Settings (Practice Config, UK VAT Rate, RICS Credentials)
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSetting.findMany();

    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: DEFAULT_PRACTICE_SETTINGS,
      });
      settings = await prisma.systemSetting.findMany();
    }

    const settingsObject = {};
    for (const s of settings) {
      settingsObject[s.key] = s.value;
    }

    return ApiResponse.success(res, { settings: settingsObject, raw: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // e.g. { operations_email: "...", default_turnaround_days: "3" }

    const operations = Object.entries(updates).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(operations);

    return ApiResponse.success(res, null, 'Settings saved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only: Check Email Service configuration status
 * Returns whether provider is active and sender address, never exposing the secret key
 */
export const getEmailStatus = async (req, res, next) => {
  try {
    const key = (process.env.RESEND_API_KEY || '').trim();
    const isConfigured = Boolean(key && key.startsWith('re_') && key.length >= 12);
    const emailFrom = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
    const enquiryInbox = process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

    return ApiResponse.success(
      res,
      {
        isConfigured,
        provider: isConfigured ? 'resend' : 'not_configured',
        emailFrom,
        enquiryInbox,
      },
      'Email provider status retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const purgeTestData = async (req, res, next) => {
  try {
    const preservedEmails = ['njsadmin@gmail.com', 'njssurveyor@gmail.com'];

    // Cascade clean all test transactions & activity
    await prisma.notification.deleteMany({});
    await prisma.customerReview.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.callLog.deleteMany({});
    await prisma.complaintLog.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.term.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.lead.deleteMany({});

    // Delete all customer users except primary admin and primary surveyor
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: { notIn: preservedEmails },
      },
    });

    // Reset surveyor profile active workload to 0
    await prisma.surveyorProfile.updateMany({
      data: { activeLoad: 0 },
    });

    return ApiResponse.success(
      res,
      {
        deletedUsersCount: deletedUsers.count,
        remainingLeads: 0,
        remainingJobs: 0,
        preservedUsers: preservedEmails,
      },
      'Database cleaned successfully: exactly 0 leads, 0 jobs, 1 admin and 1 surveyor preserved'
    );
  } catch (error) {
    next(error);
  }
};

