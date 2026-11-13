/**
 * Netlify Serverless Function: Public Quote & Expert Witness Enquiry Handler
 * Handles POST /api/v1/public/enquiries when deployed on Netlify.
 */

const ENQUIRY_INBOX =
  process.env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';
const SENDER_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'NJS Property Group <onboarding@resend.dev>';

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(payload),
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, {
      success: false,
      message: 'Invalid JSON request payload.',
    });
  }

  // Forward to full CRM backend if BACKEND_API_URL is configured
  const backendUrl = (process.env.BACKEND_API_URL || '').trim().replace(/\/+$/, '');
  if (backendUrl) {
    try {
      const upstream = await fetch(`${backendUrl}/api/v1/public/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await upstream.json();
      return jsonResponse(upstream.status, data);
    } catch (err) {
      console.warn('Upstream backend forward failed, falling back:', err.message);
    }
  }

  const enquiryCategory =
    body.enquiryCategory === 'EXPERT_WITNESS' ? 'EXPERT_WITNESS' : 'SURVEY_QUOTE';
  const customerName = String(body.customerName || body.contactName || '').trim();
  const customerEmail = String(body.customerEmail || body.contactEmail || '')
    .trim()
    .toLowerCase();
  const customerPhone = String(body.customerPhone || body.contactPhone || '').trim();
  const propertyPostcode = String(body.propertyPostcode || body.postcode || '')
    .trim()
    .toUpperCase();
  const propertyAddress = String(
    body.propertyAddress || body.propertyLocation || propertyPostcode || ''
  ).trim();
  const serviceName = String(
    body.serviceName || body.serviceId || body.disputeType || 'RICS Property Survey'
  ).trim();

  if (!customerName || !customerEmail) {
    return jsonResponse(400, {
      success: false,
      message: 'Customer name and email address are required.',
    });
  }

  if (enquiryCategory === 'SURVEY_QUOTE' && !propertyPostcode && !propertyAddress) {
    return jsonResponse(400, {
      success: false,
      message: 'Property address or UK postcode is required.',
    });
  }

  const referenceId = `ENQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  let emailSent = false;
  let provider = 'netlify_logged';
  let messageId = null;

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey && resendApiKey.startsWith('re_') && resendApiKey.length >= 12) {
    try {
      const rows = [
        ['Reference ID', referenceId],
        ['Category', enquiryCategory === 'EXPERT_WITNESS' ? 'Expert Witness Instruction' : 'Survey Quote Request'],
        ['Service', serviceName],
        ['Client Name', customerName],
        ['Client Email', customerEmail],
        ['Client Phone', customerPhone || 'Not provided'],
        ['Property Address', propertyAddress || 'Not provided'],
        ['UK Postcode', propertyPostcode || 'Not provided'],
        ['Property Type', body.propertyType || body.instructingRole || 'Not specified'],
        ['Approx Bedrooms', body.approxBedrooms || 'Not specified'],
        ['Timescale / Deadline', body.timescale || body.courtDeadline || 'Standard'],
        ['Notes / Summary', body.additionalNotes || body.caseSummary || 'None'],
        ['Source Page', body.sourcePage || '/'],
      ]
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-weight:700;color:#0F172A;width:190px;">${escapeHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#334155;">${escapeHtml(v)}</td></tr>`
        )
        .join('');

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          reply_to: customerEmail,
          subject: `[NJS Website Enquiry] ${serviceName} (${referenceId})`,
          html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #CBD5E1;border-radius:10px;overflow:hidden;"><div style="background:#0A1624;color:#FFFFFF;padding:18px 22px;"><h2 style="margin:0;font-size:18px;">New Website Enquiry Received</h2><p style="margin:4px 0 0;font-size:13px;color:#CBD5E1;">Ref: ${escapeHtml(referenceId)}</p></div><table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table></div>`,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok && resendData?.id) {
        emailSent = true;
        provider = 'resend_live';
        messageId = resendData.id;
      } else {
        provider = 'resend_error';
        console.warn('Resend API warning:', resendData);
      }
    } catch (err) {
      provider = 'resend_error';
      console.warn('Resend dispatch failed:', err.message);
    }
  }

  return jsonResponse(201, {
    success: true,
    message: emailSent
      ? `Enquiry received and notification sent to ${ENQUIRY_INBOX}`
      : `Enquiry logged with reference ${referenceId}`,
    data: {
      referenceId,
      timestamp: new Date().toISOString(),
      dbSaved: false,
      emailNotification: {
        recipient: ENQUIRY_INBOX,
        emailSent,
        provider,
        messageId,
      },
    },
  });
}
