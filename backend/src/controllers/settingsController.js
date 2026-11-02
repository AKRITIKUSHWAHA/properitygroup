import { prisma } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const DEFAULT_PRACTICE_SETTINGS = [
  { key: 'practice_name', value: 'NJS Property Group Ltd', category: 'GENERAL' },
  { key: 'rics_firm_number', value: 'RICS-089421-UK', category: 'RICS' },
  { key: 'vat_registration_number', value: 'GB 984 2190 44', category: 'FINANCIAL' },
  { key: 'standard_vat_rate', value: '20.0', category: 'FINANCIAL' },
  { key: 'registered_office_address', value: '14 Berkeley Street, Mayfair, London W1J 8BN', category: 'GENERAL' },
  { key: 'operations_email', value: 'info@njspropertygroup.com', category: 'GENERAL' },
  { key: 'operations_phone', value: '+44 20 7946 0912', category: 'GENERAL' },
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

