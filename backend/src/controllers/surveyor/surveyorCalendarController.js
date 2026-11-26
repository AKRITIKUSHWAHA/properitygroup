import crypto from 'crypto';
import { prisma } from '../../config/db.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Retrieve or generate a per-surveyor random secret token stored in SystemSetting
 */
const getOrCreateSurveyorFeedToken = async (surveyorId) => {
  const key = `ical_feed_token_srv_${surveyorId}`;
  const existing = await prisma.systemSetting.findUnique({ where: { key } });
  if (existing?.value) {
    return existing.value;
  }
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: token, category: 'SURVEYOR_CALENDAR' },
    create: { key, value: token, category: 'SURVEYOR_CALENDAR' },
  });
  return token;
};

const safeTokenEqual = (a, b) => {
  if (!a || !b || typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Format a Date object to RFC 5545 iCalendar UTC string: YYYYMMDDTHHMMSSZ
 */
const formatIcsUtc = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Clean string for iCal properties (escaping commas, semicolons, backslashes and newlines)
 */
const escapeIcs = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
};

/**
 * Build RFC 5545 VEVENT string for a single Job
 */
const buildJobVEvent = (job, frontendUrl = 'http://localhost:5173') => {
  const inspectionDate = job.inspectionDate ? new Date(job.inspectionDate) : new Date();

  // Parse inspection time (e.g. "10:00 - 13:00" or daylight default 10:00 AM)
  let startHour = 10;
  let startMinute = 0;
  let endHour = 13;
  let endMinute = 0;

  if (job.inspectionTime) {
    const timeMatch = job.inspectionTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      startHour = parseInt(timeMatch[1], 10);
      startMinute = parseInt(timeMatch[2], 10);
      endHour = startHour + 2;
      endMinute = startMinute + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
    }
  }

  const startDate = new Date(inspectionDate);
  startDate.setHours(startHour, startMinute, 0, 0);

  const endDate = new Date(inspectionDate);
  endDate.setHours(endHour, endMinute, 0, 0);

  const dtStamp = formatIcsUtc(job.updatedAt || new Date());
  const dtStart = formatIcsUtc(startDate);
  const dtEnd = formatIcsUtc(endDate);

  const title = `RICS Survey: ${job.serviceType || 'Home Survey'} - ${job.propertyAddress || 'UK Property'}`;
  const location = `${job.propertyAddress || ''}, ${job.postcode || ''}`.trim().replace(/^,\s*/, '');

  const keyAccess =
    job.keyCollectionDetails || 'Contact Estate Agent / Vendor directly for access keys';
  const companyInfo = job.company
    ? `${job.company.name} (${job.company.contactPhone || 'N/A'})`
    : 'Direct Client';
  const specialNotes =
    job.specialInstructions || 'Strict RICS daylight protocol applies (10:00 - 16:00)';

  const descLines = [
    `NJS PROPERTY GROUP - RICS SURVEY DIARY`,
    `Ref: ${job.reference || `JOB-${job.id}`}`,
    `Service: ${job.serviceType || 'RICS Level 2 Survey'}`,
    `Client: ${job.clientName || 'Valued Client'}`,
    `----------------------------------------`,
    `KEY COLLECTION & ACCESS PROTOCOL:`,
    `${keyAccess}`,
    `Estate Agent / Branch: ${companyInfo}`,
    `----------------------------------------`,
    `SPECIAL INSTRUCTIONS & DAYLIGHT PROTOCOL:`,
    `${specialNotes}`,
    `Daylight Window: 10:00 - 16:00 UK Time`,
    `Direct Portal Link: ${frontendUrl}/surveyor/dashboard`,
  ].join('\n');

  return [
    'BEGIN:VEVENT',
    `UID:job-${job.id}-${job.reference || 'ref'}@njspropertygroup.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(descLines)}`,
    `URL:${frontendUrl}/surveyor/dashboard`,
    'STATUS:CONFIRMED',
    'CATEGORIES:RICS Survey,Inspection,NJS Property Group',
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ].join('\r\n');
};

/**
 * Surveyor Menu 2: My Calendar (/surveyor/my-calendar)
 */
export const getSurveyorCalendar = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;
    const { month, year } = req.query;

    const where = {
      surveyorId,
      inspectionDate: { not: null },
    };

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.inspectionDate = { gte: start, lte: end };
    }

    const events = await prisma.job.findMany({
      where,
      select: {
        id: true,
        reference: true,
        serviceType: true,
        propertyAddress: true,
        postcode: true,
        inspectionDate: true,
        inspectionTime: true,
        stage: true,
        keyCollectionDetails: true,
        specialInstructions: true,
        company: {
          select: { name: true, branchName: true, contactPhone: true },
        },
      },
      orderBy: { inspectionDate: 'asc' },
    });

    const feedToken = await getOrCreateSurveyorFeedToken(surveyorId);

    return ApiResponse.success(res, { events, total: events.length, feedToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticated endpoint returning the surveyor's personal secret iCal feed token
 */
export const getSurveyorFeedToken = async (req, res, next) => {
  try {
    const surveyorId = req.user.id;
    const feedToken = await getOrCreateSurveyorFeedToken(surveyorId);
    return ApiResponse.success(res, { surveyorId, feedToken });
  } catch (error) {
    next(error);
  }
};

/**
 * RFC 5545 iCalendar (.ics) Live Subscription Feed
 * Compatible with Apple Calendar (iPhone / Mac), Google Calendar, and Microsoft Outlook.
 */
export const getSurveyorIcalFeed = async (req, res, next) => {
  try {
    let surveyorId = req.user?.id;

    // Allow per-surveyor DB-stored random token for external calendar applications
    if (!surveyorId && req.query.surveyorId && req.query.token) {
      const parsedId = parseInt(req.query.surveyorId, 10);
      const token = String(req.query.token);
      if (!isNaN(parsedId) && parsedId > 0) {
        const expectedSetting = await prisma.systemSetting.findUnique({
          where: { key: `ical_feed_token_srv_${parsedId}` },
        });
        if (expectedSetting?.value && safeTokenEqual(token, expectedSetting.value)) {
          surveyorId = parsedId;
        }
      }
    }

    if (!surveyorId) {
      return res.status(401).send('Unauthorized calendar feed access');
    }

    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
      select: { id: true, name: true, email: true },
    });

    const jobs = await prisma.job.findMany({
      where: {
        surveyorId,
        inspectionDate: { not: null },
      },
      include: {
        company: {
          select: { name: true, branchName: true, contactPhone: true },
        },
      },
      orderBy: { inspectionDate: 'asc' },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const surveyorName = surveyor?.name || 'Surveyor';

    const eventsIcs = jobs.map((j) => buildJobVEvent(j, frontendUrl)).join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NJS Property Group//RICS Surveyor Mobile Diary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:NJS Diary - ${surveyorName}`,
      'X-WR-TIMEZONE:Europe/London',
      'X-PUBLISHED-TTL:PT15M',
      'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
      eventsIcs,
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="njs-surveyor-${surveyorId}-diary.ics"`
    );
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.send(icsContent);
  } catch (error) {
    next(error);
  }
};

/**
 * 1-Click Single Job .ICS Download
 * /api/v1/surveyor/my-calendar/job/:id/ics
 */
export const downloadJobIcs = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id || req.params.jobId, 10);
    const where = { id: jobId };
    if (req.user?.role === 'SURVEYOR') {
      where.surveyorId = req.user.id;
    }
    const job = await prisma.job.findFirst({
      where,
      include: {
        company: {
          select: { name: true, branchName: true, contactPhone: true },
        },
      },
    });

    if (!job) {
      return res.status(404).send('Inspection job not found');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const eventIcs = buildJobVEvent(job, frontendUrl);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NJS Property Group//RICS Surveyor Mobile Diary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:NJS Survey - ${job.reference || `JOB-${job.id}`}`,
      'X-WR-TIMEZONE:Europe/London',
      eventIcs,
      'END:VCALENDAR',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${job.reference || `job-${job.id}`}.ics"`
    );

    return res.send(icsContent);
  } catch (error) {
    next(error);
  }
};

