/**
 * Surveyor Calendar Sync Utility
 * Generates direct Google Calendar web links, Outlook web links,
 * client-side .ICS files, and Apple Calendar webcal:// subscription URLs.
 */

const formatGoogleDateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const escapeIcs = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
};

/**
 * Builds a direct 1-click Google Calendar web event URL
 */
export const generateGoogleCalendarUrl = (apt) => {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  const title = `RICS Survey: ${apt.type || apt.surveyType || 'Inspection'} - ${apt.property || apt.propertyAddress || 'UK Property'}`;
  const location = `${apt.property || apt.propertyAddress || ''}, ${apt.location || apt.postcode || ''}`.trim().replace(/^,\s*/, '');

  const keyAccess = apt.access || apt.keyCollectionDetails || 'Contact Estate Agent / Vendor for access keys';
  const specialNotes = apt.specialInstructions || 'Strict RICS daylight protocol applies (10:00 - 16:00)';

  const details = [
    `NJS PROPERTY GROUP - RICS SURVEY DIARY`,
    `Ref: ${apt.jobNo || apt.reference || `JOB-${apt.id}`}`,
    `Service: ${apt.type || apt.surveyType || 'RICS Level 2 Survey'}`,
    `----------------------------------------`,
    `KEY COLLECTION & ACCESS PROTOCOL:`,
    `${keyAccess}`,
    `----------------------------------------`,
    `SPECIAL INSTRUCTIONS & DAYLIGHT PROTOCOL:`,
    `${specialNotes}`,
    `Daylight Window: 10:00 - 16:00 UK Time`,
    `Direct Portal Link: ${window.location.origin}/surveyor/dashboard`,
  ].join('\n');

  // Compute start & end time
  const targetDate = apt.inspectionDate ? new Date(apt.inspectionDate) : new Date();
  let startH = 10;
  let startM = 0;
  let endH = 13;
  let endM = 0;

  if (apt.time || apt.inspectionTime) {
    const rawTime = apt.time || apt.inspectionTime;
    const match = String(rawTime).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      startH = parseInt(match[1], 10);
      startM = parseInt(match[2], 10);
      endH = startH + 2;
      endM = startM + 30;
      if (endM >= 60) {
        endH += 1;
        endM -= 60;
      }
    }
  }

  const startDate = new Date(targetDate);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(endH, endM, 0, 0);

  const datesParam = `${formatGoogleDateTime(startDate)}/${formatGoogleDateTime(endDate)}`;

  const params = new URLSearchParams({
    text: title,
    dates: datesParam,
    details,
    location,
  });

  return `${base}&${params.toString()}`;
};

/**
 * Builds an Outlook Online (Microsoft 365) direct web event URL
 */
export const generateOutlookOnlineUrl = (apt) => {
  const base = 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent';

  const title = `RICS Survey: ${apt.type || apt.surveyType || 'Inspection'} - ${apt.property || apt.propertyAddress || 'UK Property'}`;
  const location = `${apt.property || apt.propertyAddress || ''}, ${apt.location || apt.postcode || ''}`.trim().replace(/^,\s*/, '');

  const keyAccess = apt.access || apt.keyCollectionDetails || 'Contact Estate Agent / Vendor for access keys';

  const body = [
    `NJS PROPERTY GROUP - RICS SURVEY DIARY`,
    `Ref: ${apt.jobNo || apt.reference || `JOB-${apt.id}`}`,
    `Service: ${apt.type || apt.surveyType || 'RICS Level 2 Survey'}`,
    `Key Access: ${keyAccess}`,
    `Daylight Hours: 10:00 - 16:00 UK Time`,
  ].join('\n');

  const targetDate = apt.inspectionDate ? new Date(apt.inspectionDate) : new Date();
  let startH = 10;
  let startM = 0;

  if (apt.time || apt.inspectionTime) {
    const match = String(apt.time || apt.inspectionTime).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      startH = parseInt(match[1], 10);
      startM = parseInt(match[2], 10);
    }
  }

  const startDate = new Date(targetDate);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(startH + 2, startM + 30, 0, 0);

  const params = new URLSearchParams({
    subject: title,
    location,
    body,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });

  return `${base}&${params.toString()}`;
};

/**
 * Generates RFC 5545 .ICS file content client-side
 */
export const generateJobIcsContent = (apt) => {
  const targetDate = apt.inspectionDate ? new Date(apt.inspectionDate) : new Date();
  let startH = 10;
  let startM = 0;
  let endH = 13;
  let endM = 0;

  if (apt.time || apt.inspectionTime) {
    const match = String(apt.time || apt.inspectionTime).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      startH = parseInt(match[1], 10);
      startM = parseInt(match[2], 10);
      endH = startH + 2;
      endM = startM + 30;
      if (endM >= 60) {
        endH += 1;
        endM -= 60;
      }
    }
  }

  const startDate = new Date(targetDate);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(endH, endM, 0, 0);

  const title = `RICS Survey: ${apt.type || apt.surveyType || 'Inspection'} - ${apt.property || apt.propertyAddress || 'UK Property'}`;
  const location = `${apt.property || apt.propertyAddress || ''}, ${apt.location || apt.postcode || ''}`.trim().replace(/^,\s*/, '');
  const keyAccess = apt.access || apt.keyCollectionDetails || 'Contact Estate Agent / Vendor for access keys';

  const desc = [
    `NJS PROPERTY GROUP - RICS SURVEY DIARY`,
    `Ref: ${apt.jobNo || apt.reference || `JOB-${apt.id}`}`,
    `Service: ${apt.type || apt.surveyType || 'RICS Level 2 Survey'}`,
    `Key Access: ${keyAccess}`,
    `Daylight Hours: 10:00 - 16:00 UK Time`,
    `Portal: ${window.location.origin}/surveyor/dashboard`,
  ].join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NJS Property Group//RICS Surveyor Diary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:job-${apt.id || Date.now()}@njspropertygroup.com`,
    `DTSTAMP:${formatGoogleDateTime(new Date())}`,
    `DTSTART:${formatGoogleDateTime(startDate)}`,
    `DTEND:${formatGoogleDateTime(endDate)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(desc)}`,
    'STATUS:CONFIRMED',
    'CATEGORIES:RICS Survey,Inspection',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

/**
 * Triggers instant browser download of a generated .ICS file
 */
export const downloadIcsFile = (filename, content) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Builds Apple Calendar Webcal / iCal subscription URL
 */
export const getCalendarSubscriptionUrls = (surveyorId = 22, feedToken = '') => {
  const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const token = feedToken || '';
  const feedHttpsUrl = `${backendBase}/surveyor/my-calendar/feed.ics?surveyorId=${surveyorId}&token=${encodeURIComponent(token)}`;

  // Webcal replaces http:// or https:// with webcal:// for native iOS / macOS subscription
  const webcalUrl = feedHttpsUrl.replace(/^https?:\/\//i, 'webcal://');

  return {
    httpsUrl: feedHttpsUrl,
    webcalUrl,
    googleCalendarSubscribeUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feedHttpsUrl)}`,
  };
};
