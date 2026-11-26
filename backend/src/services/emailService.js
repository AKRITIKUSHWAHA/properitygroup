import { prisma } from '../config/db.js';
import { Resend } from 'resend';
import { env } from '../config/env.js';

const getFrontendBaseUrl = () => {
  const raw =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    env.CLIENT_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://njspropertygroup.com' : 'http://localhost:5175');
  return String(raw).split(',')[0].trim().replace(/\/+$/, '');
};

export const getResend = () => {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (key && key.startsWith('re_') && key.length >= 12) {
    return new Resend(key);
  }
  return null;
};

/**
 * Log email failure and persist admin notification and audit log
 */
export const recordEmailFailure = async ({ to, subject, error, jobId = null, userId = null }) => {
  const recipient = Array.isArray(to) ? to.join(', ') : (to || 'Unknown recipient');
  console.error(`[EMAIL DELIVERY FAILURE] Failed to send email to ${recipient}: ${error} (Subject: "${subject}")`);
  try {
    await prisma.notification.create({
      data: {
        role: 'ADMIN',
        title: `Email delivery failed to ${recipient}`,
        desc: `Subject: "${subject || 'System Notification'}". Reason: ${error || 'RESEND_API_KEY missing or invalid'}`,
        type: 'alert',
        read: false,
      },
    });
    if (jobId || userId) {
      await prisma.auditLog.create({
        data: {
          jobId: jobId ? parseInt(jobId, 10) : undefined,
          userId: userId ? parseInt(userId, 10) : undefined,
          action: 'EMAIL_DELIVERY_FAILED',
          details: JSON.stringify({ to: recipient, subject, error: error || 'RESEND_API_KEY missing or invalid' }),
        },
      });
    }
  } catch (dbErr) {
    console.error('Failed to record email failure in DB:', dbErr.message);
  }
};

/**
 * Handle unconfigured or failed email dispatch
 */
export const handleUnconfiguredOrFailedEmail = async ({
  to,
  subject,
  html,
  error,
  isUnconfigured = false,
  jobId = null,
  userId = null,
}) => {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const recipient = Array.isArray(to) ? to.join(', ') : (to || 'Unknown');
  const errMessage = error || (isUnconfigured ? 'RESEND_API_KEY missing or invalid' : 'Email delivery failed');

  if (isDev) {
    console.log('\n========== [EMAIL SERVICE SIMULATED (NOT SENT)] ==========');
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reason: ${errMessage}`);
    const plainText = (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Preview: ${plainText.slice(0, 300)}...`);
    console.log('==========================================================\n');
  }

  await recordEmailFailure({ to, subject, error: errMessage, jobId, userId });

  return {
    success: false,
    emailSent: false,
    messageId: null,
    provider: isUnconfigured ? 'not_configured' : 'resend_error',
    error: errMessage,
    simulated: true,
  };
};
const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

export const NJS_OFFICIAL_LOGO_URL =
  process.env.NJS_LOGO_URL ||
  'https://raw.githubusercontent.com/AKRITIKUSHWAHA/properitygroup/main/frontend/public/images/njs-official-logo.png';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sanitizeSurveyStandard = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\s*\(\s*Full\s+Structural\s*\)/gi, '')
    .replace(/\s*Full\s+Structural\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const capitalizeName = (str) => {
  if (!str || typeof str !== 'string') return 'Valued Client';
  const trimmed = str.trim();
  if (!trimmed) return 'Valued Client';
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.includes('-')) {
        return word
          .split('-')
          .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const buildEmailHeader = (title = 'NJS PROPERTY GROUP', subtitle = 'Independent RICS-Regulated Practice • Firm #084920') => `
  <div style="background: #ffffff; padding: 20px 26px; border-bottom: 1px solid #e2e8f0; text-align: left;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="left" style="vertical-align: middle; padding: 0;">
          <img src="${NJS_OFFICIAL_LOGO_URL}" alt="NJS Property Group" width="220" style="width: 220px; max-width: 240px; height: auto; display: block; border: 0;" />
        </td>
        <td align="right" style="vertical-align: middle; padding: 0; text-align: right;">
          <div style="display: inline-block; font-size: 11px; font-weight: 700; color: #0B1F4D; background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 6px; letter-spacing: 0.3px; white-space: nowrap;">
            Regulated by RICS
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div style="background: #0B1F4D; padding: 13px 26px; text-align: left; border-bottom: 3px solid #C5A059;">
    <h1 style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(title)}</h1>
    ${subtitle ? `<p style="color: #cbd5e1; margin: 3px 0 0 0; font-size: 11.5px;">${escapeHtml(subtitle)}</p>` : ''}
  </div>
`;

export const buildEmailFooter = () => `
  <div style="background: #f8fafc; padding: 18px 26px; text-align: center; font-size: 11.5px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6;">
    <div style="font-weight: 700; color: #0B1F4D; margin-bottom: 4px; font-size: 12px; line-height: 1.4;">NJS Property Group Ltd &bull; Independent Chartered Surveyors</div>
    <div>Regulated by RICS &bull; Firm #084920 &bull; Phone: <a href="tel:03333052777" style="color: #0B1F4D; font-weight: 700; text-decoration: none;">0333 305 2777</a> &bull; Email: <a href="mailto:info@njspropertygroup.com" style="color: #2563EB; text-decoration: none;">info@njspropertygroup.com</a></div>
    <div style="color: #94a3b8; font-size: 10.5px; margin-top: 6px;">&copy; ${new Date().getFullYear()} NJS Property Group Ltd. All rights reserved under UK Law.</div>
  </div>
`;

/**
 * Send instant website enquiry / quotation notification to info@njspropertygroup.com
 */
export const sendWebsiteEnquiryNotificationEmail = async ({
  referenceId,
  enquiryCategory = 'SURVEY_QUOTE',
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  propertyType,
  propertyAddress,
  propertyPostcode,
  approxBedrooms,
  timescale,
  additionalNotes,
  lawFirmName,
  disputeType,
  courtDeadline,
  isSingleJointExpert,
  sourcePage,
}) => {
  const formattedCustomerName = capitalizeName(customerName);
  const isExpertWitness = enquiryCategory === 'EXPERT_WITNESS';
  const subjectTag = isExpertWitness ? 'Expert Witness Enquiry' : 'New Survey Quote Request';
  const subject = `[${subjectTag}] ${serviceName || disputeType || 'Property Enquiry'} — ${propertyPostcode || propertyAddress || formattedCustomerName} (${referenceId})`;

  const detailRows = [
    ['Reference ID', referenceId],
    ['Client Name', formattedCustomerName],
    ['Client Email', customerEmail],
    ['Phone Number', customerPhone || 'Not provided'],
    ['Service Requested', serviceName || disputeType || 'Property Survey'],
    ['Property Location / Postcode', [propertyAddress, propertyPostcode].filter(Boolean).join(', ') || 'Not specified'],
  ];

  if (!isExpertWitness) {
    detailRows.push(
      ['Property Type', propertyType || 'Not specified'],
      ['Bedrooms', approxBedrooms || 'Not specified'],
      ['Target Timescale', timescale || 'Standard']
    );
  } else {
    detailRows.push(
      ['Law Firm / Instructing Party', lawFirmName || 'Direct / Litigant'],
      ['Court / Pre-Action Deadline', courtDeadline || 'Not specified'],
      ['Single Joint Expert (SJE)', isSingleJointExpert === 'yes' ? 'Yes' : 'No / Party-Appointed']
    );
  }

  const rowsHtml = detailRows
    .map(
      ([label, val]) => `
        <tr>
          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9; width: 42%;">${escapeHtml(label)}:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9; text-align: right;">${escapeHtml(val)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — NEW WEBSITE ENQUIRY', `Submitted via ${escapeHtml(sourcePage || 'Website Contact / Quote Form')}`)}
      <div style="padding: 26px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">A visitor has submitted an enquiry requesting a formal survey quotation or consultation. Details below:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${rowsHtml}
          </table>
        </div>
        ${
          additionalNotes
            ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px; margin: 14px 0;">
                <strong style="display: block; font-size: 12px; color: #92400e; margin-bottom: 4px;">Client Notes / Case Summary:</strong>
                <p style="margin: 0; font-size: 13px; color: #451a03; white-space: pre-wrap;">${escapeHtml(additionalNotes)}</p>
              </div>`
            : ''
        }
        <p style="font-size: 12px; color: #64748b; margin: 18px 0 0 0;">Reply directly to this email to respond to <strong>${escapeHtml(formattedCustomerName)}</strong> (${escapeHtml(customerEmail)}).</p>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend) {
    try {
      // 1. Dispatch enquiry lead notification to Admin inbox (info@njspropertygroup.com)
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [ENQUIRY_INBOX],
        replyTo: customerEmail,
        subject,
        html,
      });

      // 2. Dispatch official acknowledgment receipt to Customer's registered email
      if (customerEmail && customerEmail.includes('@')) {
        const formattedCustomerName = capitalizeName(customerName);
        try {
          const customerHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
              ${buildEmailHeader('NJS PROPERTY GROUP', 'Official Quotation Request Acknowledgment')}
              
              <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(formattedCustomerName)},</h2>
                <p>Thank you for requesting a survey quote with NJS Property Group. We have successfully logged your enquiry and our chartered surveying team has begun assessment.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; width: 42%;">Instruction Reference:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(referenceId)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;">Survey Standard:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(serviceName)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml([propertyAddress, propertyPostcode].filter(Boolean).join(', ') || 'Specified Location')}</td>
                    </tr>
                    ${timescale ? `<tr>
                      <td style="padding: 6px 0; color: #64748b;">Timescale:</td>
                      <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right; text-transform: capitalize;">${escapeHtml(timescale)}</td>
                    </tr>` : ''}
                  </table>
                </div>

                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px; margin: 18px 0;">
                  <strong style="color: #065f46; font-size: 13px; display: block; margin-bottom: 3px;">What Happens Next?</strong>
                  <p style="margin: 0; color: #047857; font-size: 13px; line-height: 1.5;">
                    Our RICS chartered surveyors are reviewing historical sales records and physical property traits to calculate your bespoke, fixed-fee quotation. Your formal quotation proposal will be delivered directly to <strong>${escapeHtml(customerEmail)}</strong> within 24 business hours.
                  </p>
                </div>

                <p style="font-size: 13px; color: #334155;">
                  Your Customer Portal account is active with this email address (<strong>${escapeHtml(customerEmail)}</strong>). You can log in at any time to monitor your survey progress and access digital copies:
                </p>

                <div style="text-align: center; margin: 24px 0;">
                  <a href="${getFrontendBaseUrl()}/login?email=${encodeURIComponent(customerEmail || '')}" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Open Customer Portal &rarr;</a>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                  For urgent questions, contact our operations desk at <strong>0333 305 2777</strong> or reply directly to this email.
                </p>
              </div>
              
              ${buildEmailFooter()}
            </div>
          `;

          await resend.emails.send({
            from: SENDER_EMAIL,
            to: [customerEmail],
            subject: `Your Survey Quotation Request Received (${referenceId}) — NJS Property Group`,
            html: customerHtml,
          });
        } catch (cErr) {
          console.error('Customer acknowledgment email error:', cErr.message);
        }
      }

      return {
        success: true,
        emailSent: true,
        notifiedEmail: ENQUIRY_INBOX,
        customerNotified: customerEmail,
        messageId: response?.data?.id || response?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[sendWebsiteEnquiryNotificationEmail error]:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to: [ENQUIRY_INBOX, customerEmail].filter(Boolean),
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to: [ENQUIRY_INBOX, customerEmail].filter(Boolean),
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Resend Email Notification Service
 * Sends automated RICS fee proposals, invoices, and signed terms receipts
 */

export const sendQuoteProposalEmail = async ({
  to,
  clientName,
  quoteAmount,
  surveyType,
  propertyAddress,
  quoteLink,
}) => {
  const cleanSurveyType = sanitizeSurveyStandard(surveyType) || 'RICS Home Survey';
  const formattedClientName = capitalizeName(clientName);
  const subject = `Your Formal RICS Survey Proposal: ${cleanSurveyType} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — FORMAL SURVEY PROPOSAL', `RICS Practice Reference • ${escapeHtml(cleanSurveyType)}`)}
      
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(formattedClientName)},</h2>
        <p>Thank you for instructing NJS Property Group. We have prepared your comprehensive fee proposal for the property inspection below:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 22px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 500; vertical-align: top; width: 38%; border-bottom: 1px solid #e2e8f0;">Property:</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a; text-align: right; vertical-align: top; width: 62%; border-bottom: 1px solid #e2e8f0; word-break: break-word;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-weight: 500; vertical-align: top; width: 38%; border-bottom: 1px solid #e2e8f0;">Survey Standard:</td>
              <td style="padding: 12px 0; font-weight: 700; color: #0B1F4D; text-align: right; vertical-align: top; width: 62%; line-height: 1.45; border-bottom: 1px solid #e2e8f0; word-break: break-word;">${escapeHtml(cleanSurveyType)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0 6px 0; color: #475569; font-weight: 600; vertical-align: middle; width: 45%;">
                Fixed Fee <span style="font-size: 11px; color: #64748b; font-weight: 400; display: block; margin-top: 2px;">(inc. 20% UK VAT)</span>
              </td>
              <td style="padding: 14px 0 6px 0; font-weight: 900; color: #059669; font-size: 18px; text-align: right; vertical-align: middle; width: 55%; white-space: nowrap;">£${escapeHtml(quoteAmount || '770.00')}</td>
            </tr>
          </table>
        </div>

        <p>To view full terms, confirm surveyor allocation, and e-sign your engagement agreement, click the secure portal link below:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${quoteLink || `${getFrontendBaseUrl()}/customer/my-quotations?email=${encodeURIComponent(to || '')}`}" style="background: #2563EB; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">Review &amp; Track Your Survey &rarr;</a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Need assistance? Our operations team is available at <strong>0333 305 2777</strong> or reply directly to this email.
        </p>
      </div>
      
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend) {
    try {
      // 1. Send client-facing formal proposal exclusively to Customer (NEVER cc admin on customer letters)
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct administrative operations record to Admin inbox (if recipient is not already admin)
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[PROPOSAL ISSUED] RICS Quotation Dispatched to ${clientName || 'Client'}: £${quoteAmount}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS OPERATIONS — PROPOSAL ISSUED', 'Outbound Fee Quotation Dispatched')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>Operations Notice:</strong> A formal fee proposal has been dispatched to <strong>${escapeHtml(clientName || 'Client')}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Client:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(clientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Survey Standard:</td><td>${escapeHtml(cleanSurveyType)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Quoted Fee:</td><td style="font-weight: 800; color: #059669; font-size: 15px;">£${escapeHtml(quoteAmount || '770.00')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Status:</td><td>Awaiting client review &amp; electronic acceptance</td></tr>
                </table>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/quotes" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Quotes in Admin Portal &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin proposal dispatch record notice:', err.message));
      }

      if (response?.error) {
        console.error('[Resend Error] Quote proposal dispatch failed:', response.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: response.error.message || String(response.error),
        });
      }
      return {
        success: true,
        emailSent: true,
        messageId: response?.data?.id || response?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendQuoteProposalEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

export const sendInvoiceReceiptEmail = async ({
  to,
  clientName,
  invoiceRef,
  amount,
  paymentMethod = 'Online Card (Stripe)',
  propertyAddress,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `Payment Confirmation & Official VAT Receipt: ${invoiceRef} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — OFFICIAL VAT RECEIPT', 'HMRC-Compliant Invoice Settlement')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 18px; margin-top: 0;">✓ Payment Confirmed</h2>
        <p>Dear ${escapeHtml(formattedClientName)}, thank you for settling your survey invoice. Your payment has been received and verified.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Receipt Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(invoiceRef)}</td>
            </tr>
            ${
              propertyAddress
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Total Settled (inc. VAT):</td>
              <td style="padding: 6px 0; font-weight: 900; color: #059669; font-size: 15px; text-align: right;">£${escapeHtml(amount)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Settlement Method:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(paymentMethod)}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #334155;"><strong>Payment received. Next: choose your inspection date</strong> to allocate your chartered surveyor and schedule on-site attendance. You can also download your official HMRC 20% VAT receipt directly from your Customer Portal.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${getFrontendBaseUrl()}/customer/my-bookings" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Choose Inspection Date &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend) {
    try {
      // 1. Send client-facing VAT receipt exclusively to Customer
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct accounts settlement alert to Admin desk
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[PAYMENT CONFIRMED] £${amount} Received from ${clientName || 'Client'} (Inv #${invoiceRef})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS ACCOUNTS — PAYMENT CONFIRMED', 'Invoice Settled & Cleared')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>Accounts Notice:</strong> Payment has been verified and settled for invoice <strong>${escapeHtml(invoiceRef)}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Client:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(clientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Amount Settled:</td><td style="font-weight: 800; color: #059669; font-size: 15px;">£${escapeHtml(amount)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Method:</td><td>${escapeHtml(paymentMethod)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td><td style="font-family: monospace;">${escapeHtml(invoiceRef)}</td></tr>
                </table>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/quotes-and-payments" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View in Accounts Ledger &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin payment alert error:', err.message));
      }

      if (res?.error) {
        console.error('[Resend Error] Invoice receipt email failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res?.data?.id || res?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendInvoiceReceiptEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Dispatch Quote Acceptance Email to Customer & CC Admin
 */
export const sendQuoteAcceptedEmail = async ({
  to,
  clientName,
  quoteRef,
  surveyType,
  propertyAddress,
  totalAmount,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `Survey Quotation Accepted (Ref: ${quoteRef}) — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — QUOTATION ACCEPTED', 'RICS Chartered Surveying Instruction Confirmed')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(formattedClientName)},</h2>
        <p>Thank you for accepting your formal quotation with NJS Property Group. Your instruction is now officially registered in our system.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Quotation Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(quoteRef)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Survey Standard:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(surveyType || 'RICS Survey')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            ${
              totalAmount
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Agreed Fee (inc. VAT):</td>
              <td style="padding: 6px 0; font-weight: 800; color: #059669; text-align: right;">£${escapeHtml(totalAmount)}</td>
            </tr>`
                : ''
            }
          </table>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #2563EB; padding: 14px 16px; border-radius: 8px; margin: 18px 0;">
          <strong style="color: #1e40af; font-size: 13px; display: block; margin-bottom: 4px;">Next Steps to Lock in Inspection:</strong>
          <ol style="margin: 0; padding-left: 18px; color: #1e3a8a; font-size: 13px; line-height: 1.5;">
            <li>Review &amp; Digitally Sign your <strong>RICS Terms of Engagement</strong> in your client portal.</li>
            <li>Settle invoice securely to lock in your priority surveyor inspection slot.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${getFrontendBaseUrl()}/customer/terms-to-sign" style="background: #2563EB; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Sign Terms &amp; Proceed &rarr;</a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Questions? Reply directly to this email or speak with our operations desk at <strong>0333 305 2777</strong>.
        </p>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend && to && to.includes('@')) {
    try {
      // 1. Send confirmation exclusively to Customer (NEVER cc admin on customer letters)
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct operations action alert to Admin desk
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[ACTION REQUIRED] Quote Accepted by ${clientName || 'Client'}: ${quoteRef} (£${totalAmount || ''})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS OPERATIONS — QUOTE ACCEPTED', 'Client Instruction Confirmed')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>Instruction Confirmed:</strong> Client <strong>${escapeHtml(clientName)}</strong> has accepted quotation <strong>${escapeHtml(quoteRef)}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Quote Reference:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(quoteRef)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Client:</td><td>${escapeHtml(clientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Survey Standard:</td><td>${escapeHtml(surveyType || 'RICS Survey')}</td></tr>
                  ${totalAmount ? `<tr><td style="padding: 6px 0; color: #64748b;">Agreed Fee:</td><td style="font-weight: 800; color: #059669; font-size: 15px;">£${escapeHtml(totalAmount)}</td></tr>` : ''}
                  <tr><td style="padding: 6px 0; color: #64748b;">Next Action:</td><td>Generate RICS Terms of Engagement and allocate chartered surveyor.</td></tr>
                </table>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/jobs" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Manage Instruction in Admin Portal &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.error('Admin quote accepted notice error:', err.message));
      }

      if (res?.error) {
        console.error('[Resend Error] Quote accepted email failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res?.data?.id || res?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendQuoteAcceptedEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Dispatch Terms of Engagement Signed Confirmation Email to Customer & CC Admin
 */
export const sendTermsSignedEmail = async ({
  to,
  clientName,
  jobRef,
  surveyType,
  propertyAddress,
  signedAt,
  signerIp,
  tamperAuditHash,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const formattedDate = signedAt ? new Date(signedAt).toLocaleString('en-GB') : new Date().toLocaleString('en-GB');
  const subject = `RICS Terms of Engagement Signed & Confirmed: ${propertyAddress || jobRef} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — TERMS EXECUTED', 'Legally Binding RICS Mandate Completed')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 18px; margin-top: 0;">✓ Terms of Engagement Signed</h2>
        <p>Dear ${escapeHtml(formattedClientName)}, thank you for executing your RICS Terms of Engagement. Your mandatory legal contract requirements are now 100% satisfied.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Instruction Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(jobRef)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Execution Timestamp:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(formattedDate)}</td>
            </tr>
            ${
              tamperAuditHash
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Digital Audit Hash:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 11px; color: #64748b; text-align: right;">${escapeHtml(tamperAuditHash.slice(0, 16))}...</td>
            </tr>`
                : ''
            }
          </table>
        </div>

        <p style="font-size: 13px; color: #334155;">
          Our logistics coordinator is now finalizing surveyor scheduling and estate agent key access for your site visit. You can monitor your survey progress at any time:
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${getFrontendBaseUrl()}/customer/track-survey" style="background: #0B1F4D; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Track Survey Status &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend && to && to.includes('@')) {
    try {
      // 1. Send confirmation exclusively to Customer (NEVER cc admin on customer letters)
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct contract confirmation alert to Admin desk
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[CONTRACT SIGNED] Terms Executed by ${clientName || 'Client'}: ${propertyAddress || jobRef}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS OPERATIONS — CONTRACT CONFIRMED', 'RICS Engagement Executed')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>Contract Notice:</strong> Client <strong>${escapeHtml(clientName)}</strong> has digitally executed the RICS Terms of Engagement.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Job Reference:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(jobRef)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Client:</td><td>${escapeHtml(clientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Signed Timestamp:</td><td>${escapeHtml(formattedDate)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Audit Signature:</td><td style="font-family: monospace; font-size: 11px;">${escapeHtml(tamperAuditHash || 'VERIFIED-SHA256')}</td></tr>
                </table>
                <p style="font-size: 13px; color: #475569;"><strong>Next Action:</strong> Allocate surveyor in calendar and confirm site key collection protocol.</p>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/terms" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Executed Contract in Admin &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.error('Admin terms signed notice error:', err.message));
      }

      if (res?.error) {
        console.error('[Resend Error] Terms signed email failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res?.data?.id || res?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendTermsSignedEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Dispatch Terms of Engagement for Digital Signature to Customer & CC Admin
 */
export const sendTermsProposalEmail = async ({
  to,
  clientName,
  jobRef,
  propertyAddress,
  surveyType,
  documentTitle,
  termsLink,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `RICS Terms of Engagement for Signature: ${propertyAddress || jobRef} — NJS Property Group`;
  const cleanLink = termsLink || `${getFrontendBaseUrl()}/customer/terms-to-sign?email=${encodeURIComponent(to || '')}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — TERMS OF ENGAGEMENT', 'Mandatory RICS Statutory Mandate')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(formattedClientName)},</h2>
        <p>Your formal <strong>${escapeHtml(documentTitle || 'RICS Terms of Engagement')}</strong> contract has been prepared and is ready for your digital signature.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Instruction Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(jobRef)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Survey Standard:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(surveyType || 'RICS Survey')}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #334155;">
          Under RICS regulations, we require signed terms prior to conducting the physical inspection. Please click below to review clauses and apply your electronic signature:
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${cleanLink}" style="background: #2563EB; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Review &amp; Sign Terms Online &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (!resend) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      isUnconfigured: true,
    });
  }

  try {
    const res = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (res?.error) {
      console.error('[Resend Error] Terms proposal email error:', res.error);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: res.error.message || String(res.error),
      });
    }

    return {
      success: true,
      emailSent: true,
      messageId: res?.data?.id || res?.id,
      error: null,
      provider: 'resend_live',
      simulated: false,
    };
  } catch (err) {
    console.error('[Resend Exception] sendTermsProposalEmail error:', err.message);
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      error: err.message,
    });
  }
};

/**
 * Dispatch Inspection Confirmed Email to Customer & CC Admin
 */
export const sendInspectionBookedEmail = async ({
  to,
  clientName,
  jobRef,
  propertyAddress,
  surveyType,
  inspectionDate,
  inspectionTime,
  surveyorName,
  surveyorPhone,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const formattedSurveyorName = capitalizeName(surveyorName);
  const formattedDate = inspectionDate
    ? new Date(inspectionDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Scheduled Date';
  const subject = `Site Inspection Confirmed: ${formattedDate} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — INSPECTION CONFIRMED', 'Surveyor Allocation & Key Logistics Locked')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(formattedClientName)},</h2>
        <p>Your property inspection appointment has been locked in the calendar with chartered surveyor <strong>${escapeHtml(formattedSurveyorName)}</strong>.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(jobRef)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Confirmed Inspection Date:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #059669; font-size: 14px; text-align: right;">${escapeHtml(formattedDate)}</td>
            </tr>
            ${
              inspectionTime
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Arrival Window:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(inspectionTime)}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Assigned Surveyor:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; text-align: right;">${escapeHtml(formattedSurveyorName)}</td>
            </tr>
            ${
              surveyorPhone
                ? `<tr>
              <td style="padding: 6px 0; color: #64748b;">Surveyor Contact:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(surveyorPhone)}</td>
            </tr>`
                : ''
            }
          </table>
        </div>

        <p style="font-size: 13px; color: #334155;">
          Your chartered surveyor carries verified RICS photo identification. If you have any specific defect concerns or questions to raise before the inspection, you can leave a note directly in your portal:
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <a href="${getFrontendBaseUrl()}/customer/my-bookings" style="background: #0B1F4D; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">View Booking &amp; Add Notes &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend && to && to.includes('@')) {
    try {
      // 1. Send inspection notice exclusively to Customer (NEVER cc admin on customer letters)
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct operations schedule alert to Admin desk
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[INSPECTION CONFIRMED] ${jobRef}: ${propertyAddress || 'Subject Property'} (${formattedDate})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS OPERATIONS — INSPECTION SCHEDULED', 'Field Rota Locked')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>Rota Notice:</strong> Physical survey inspection confirmed for <strong>${escapeHtml(propertyAddress || jobRef)}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Job Reference:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(jobRef)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Client:</td><td>${escapeHtml(formattedClientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Assigned Surveyor:</td><td style="font-weight: 700;">${escapeHtml(formattedSurveyorName)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Inspection Date:</td><td style="font-weight: 800; color: #059669;">${escapeHtml(formattedDate)}</td></tr>
                  ${inspectionTime ? `<tr><td style="padding: 6px 0; color: #64748b;">Arrival Window:</td><td>${escapeHtml(inspectionTime)}</td></tr>` : ''}
                </table>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/jobs" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View in Dispatch Rota &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.error('Admin inspection notice error:', err.message));
      }

      if (res?.error) {
        console.error('[Resend Error] Inspection booked email failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res?.data?.id || res?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendInspectionBookedEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Dispatch Final RICS Report Ready Email to Customer & CC Admin
 */
export const sendReportReadyEmail = async ({
  to,
  clientName,
  jobRef,
  propertyAddress,
  surveyType,
  reportPdfUrl,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const downloadUrl = reportPdfUrl?.startsWith('http')
    ? reportPdfUrl
    : `${getFrontendBaseUrl()}/customer/reports`;
  const subject = `Your Official RICS Survey Report is Ready for Download: ${propertyAddress || jobRef} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — FINAL REPORT READY', 'Quality Assured (QA) RICS Report Published')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 18px; margin-top: 0;">✓ Your Survey Report is Ready</h2>
        <p>Dear ${escapeHtml(formattedClientName)}, we are pleased to inform you that your formal ${escapeHtml(surveyType || 'RICS Survey Report')} has completed technical Quality Assurance and is now ready for download.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Instruction Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(jobRef)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Target Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Report Standard:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(surveyType || 'RICS Chartered Home Survey')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Status:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #059669; text-align: right;">QA Signed Off &bull; Official PDF</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #334155;">
          You can download your full color, high-resolution PDF report and photographic appendices directly from your customer portal:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${downloadUrl}" style="background: #059669; color: #ffffff; padding: 14px 30px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);">Download RICS Report (PDF) &rarr;</a>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12.5px; color: #475569;">
          <strong style="color: #0B1F4D; display: block; margin-bottom: 3px;">Post-Survey Consultation:</strong>
          As part of our standard service, you are entitled to a direct post-inspection debrief with your chartered surveyor to discuss findings, defect recommendations, and next steps.
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 16px; margin: 20px 0; font-size: 12.5px; color: #065f46; text-align: center;">
          <strong style="display: block; margin-bottom: 4px;">Share Your Experience on Trustpilot</strong>
          As an independent RICS practice, we value your feedback. Please take 30 seconds to review your experience:
          <div style="margin-top: 10px;">
            <a href="https://www.trustpilot.com/review/njspropertygroup.com" style="background: #00b67a; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 12.5px;">Leave a Trustpilot Review &rarr;</a>
          </div>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend && to && to.includes('@')) {
    try {
      // 1. Send report delivery notice exclusively to Customer (NEVER cc admin on customer letters)
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });

      // 2. Send distinct QA audit delivery alert to Admin desk
      if (to && to.toLowerCase() !== ENQUIRY_INBOX.toLowerCase()) {
        await resend.emails.send({
          from: SENDER_EMAIL,
          to: [ENQUIRY_INBOX],
          subject: `[REPORT DELIVERED] Certified RICS Survey Report Dispatched to ${formattedClientName} (${jobRef})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              ${buildEmailHeader('NJS QA DESK — REPORT DELIVERED', 'Instruction Lifecycle Complete')}
              <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <p><strong>QA Sign-off Notice:</strong> The official certified survey report for <strong>${escapeHtml(propertyAddress || jobRef)}</strong> has been delivered to <strong>${escapeHtml(formattedClientName)}</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Job Reference:</td><td style="font-weight: 700; color: #0B1F4D;">${escapeHtml(jobRef)}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Client:</td><td>${escapeHtml(formattedClientName)} &lt;${escapeHtml(to)}&gt;</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Property:</td><td style="font-weight: 600;">${escapeHtml(propertyAddress || 'Subject Property')}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Delivered Document:</td><td><a href="${downloadUrl}" style="color: #2563EB; font-weight: 600;">Download Official PDF &rarr;</a></td></tr>
                </table>
                <div style="margin-top: 20px;">
                  <a href="${getFrontendBaseUrl()}/admin/reports" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Reports Repository &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.error('Admin report delivered alert error:', err.message));
      }

      if (res?.error) {
        console.error('[Resend Error] Report ready email failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res?.data?.id || res?.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendReportReadyEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Send operational Gmail notification to Admin desk when a client sends a message in the portal
 * Client Requirement Point 9:
 * "The customer sends a message through their portal. The admin team receives the message, including a Gmail notification, and replies."
 */
export const sendClientMessageToAdminNotificationEmail = async ({
  clientName,
  clientEmail,
  messageContent,
  conversationId,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `[New Client Message] ${formattedClientName} (${clientEmail}) — NJS Property Group Portal`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP', 'Customer Portal Direct Communications Desk')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <div style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 12px;">
          New Client Message Received
        </div>
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Message from ${escapeHtml(formattedClientName)}</h2>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">
          <strong>Sender:</strong> ${escapeHtml(formattedClientName)} &lt;${escapeHtml(clientEmail)}&gt;<br/>
          <strong>Thread Reference:</strong> ${escapeHtml(conversationId)}
        </p>

        <div style="background: #f8fafc; border-left: 4px solid #2563EB; padding: 16px; border-radius: 8px; margin: 20px 0; font-style: normal; color: #0f172a;">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">"${escapeHtml(messageContent)}"</p>
        </div>

        <div style="margin-top: 24px; text-align: left;">
          <a href="${getFrontendBaseUrl()}/admin/messages?conversationId=${encodeURIComponent(conversationId)}" 
             style="display: inline-block; background: #0B1F4D; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px;">
            Open Admin Inbox &amp; Reply &rarr;
          </a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
        This is an automated operational notification dispatched to ${ENQUIRY_INBOX}. All messages are stored securely under GDPR and RICS record-keeping rules.
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [ENQUIRY_INBOX],
        subject,
        html,
      });
      if (res?.error) {
        console.error('[Resend Error] Client message alert failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to: ENQUIRY_INBOX,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendClientMessageToAdminNotificationEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to: ENQUIRY_INBOX,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to: ENQUIRY_INBOX,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Send email notification to client when Admin replies to their portal message
 * Client Requirement Point 9:
 * "The customer receives a notification of the reply."
 */
export const sendAdminReplyToClientNotificationEmail = async ({
  to,
  clientName,
  adminSenderName = 'NJS Operations Desk',
  messageSnippet,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const formattedAdminName = capitalizeName(adminSenderName);
  const subject = `New Message from NJS Property Group regarding your Survey`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP', 'RICS Regulated Surveying Practice • Message Update')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">Dear ${escapeHtml(formattedClientName)},</p>
        <p>You have received a new reply from <strong>${escapeHtml(formattedAdminName)}</strong> regarding your survey instruction.</p>

        <div style="background: #f8fafc; border-left: 4px solid #059669; padding: 16px; border-radius: 8px; margin: 20px 0; color: #0f172a;">
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">"${escapeHtml(messageSnippet)}"</p>
        </div>

        <div style="margin-top: 24px; text-align: left;">
          <a href="${getFrontendBaseUrl()}/customer/messages" 
             style="display: inline-block; background: #0B1F4D; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px;">
            Open Client Messages &amp; Reply &rarr;
          </a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      });
      if (res?.error) {
        console.error('[Resend Error] Admin reply notification failed:', res.error);
        return await handleUnconfiguredOrFailedEmail({
          to,
          subject,
          html,
          error: res.error.message || String(res.error),
        });
      }

      return {
        success: true,
        emailSent: true,
        messageId: res.id,
        error: null,
        provider: 'resend_live',
        simulated: false,
      };
    } catch (err) {
      console.error('[Resend Exception] sendAdminReplyToClientNotificationEmail error:', err.message);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: err.message,
      });
    }
  }

  return await handleUnconfiguredOrFailedEmail({
    to,
    subject,
    html,
    isUnconfigured: true,
  });
};

/**
 * Dispatches an immediate alert to info@njspropertygroup.com when a customer submits a support ticket
 */
export const sendSupportTicketNotificationEmail = async ({
  ticketNo,
  customerName,
  customerEmail,
  subject,
  category,
  priority,
  message,
}) => {
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const BUSINESS_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';
  const emailSubject = `[Support Ticket #${ticketNo}] [${priority.toUpperCase()}] ${subject} — ${customerName || customerEmail}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — NEW SUPPORT TICKET', `Ticket #${ticketNo} • Priority: ${priority}`)}
      <div style="padding: 26px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">A client has submitted a support ticket through the customer portal:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 35%;">Ticket No:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">#${ticketNo}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Client Name:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(customerName || 'Valued Client')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Client Email:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(customerEmail || 'Not specified')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Category:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(category || 'General')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Priority:</td><td style="padding: 6px 0; font-weight: 700; color: ${priority === 'High' ? '#dc2626' : '#0f172a'};">${escapeHtml(priority || 'Normal')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Subject:</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(subject)}</td></tr>
          </table>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; margin: 16px 0;">
          <strong style="display: block; font-size: 12px; color: #92400e; margin-bottom: 4px;">Ticket Message:</strong>
          <p style="margin: 0; font-size: 13px; color: #451a03; white-space: pre-wrap;">${escapeHtml(message || '')}</p>
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 18px 0 0 0;">Reply directly to this email to respond to <strong>${escapeHtml(customerName || 'the client')}</strong> (${escapeHtml(customerEmail)}).</p>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  if (!resend) {
    return await handleUnconfiguredOrFailedEmail({
      to: BUSINESS_INBOX,
      subject: emailSubject,
      html,
      isUnconfigured: true,
    });
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [BUSINESS_INBOX],
      replyTo: customerEmail || undefined,
      subject: emailSubject,
      html,
    });

    if (response?.error) {
      console.error('[Resend Error] Support ticket email failed:', response.error);
      return await handleUnconfiguredOrFailedEmail({
        to: BUSINESS_INBOX,
        subject: emailSubject,
        html,
        error: response.error.message || String(response.error),
      });
    }

    return {
      success: true,
      emailSent: true,
      messageId: response?.data?.id || response?.id,
      error: null,
      provider: 'resend_live',
      simulated: false,
    };
  } catch (err) {
    console.error('[Resend Exception] sendSupportTicketNotificationEmail error:', err?.message || err);
    return await handleUnconfiguredOrFailedEmail({
      to: BUSINESS_INBOX,
      subject: emailSubject,
      html,
      error: err?.message || String(err),
    });
  }
};

/**
 * Dispatch Portal Activation & Password Setup Email to Customer
 * Never logs or prints the token
 */
export const sendPortalActivationEmail = async ({
  to,
  clientName,
  activationToken,
  propertyAddress,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `Activate Your NJS Client Portal — NJS Property Group`;
  const frontendBase = getFrontendBaseUrl();
  const activationLink = `${frontendBase}/activate?token=${encodeURIComponent(activationToken)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — CLIENT PORTAL', 'Personal Client Portal Activation')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Activate Your Portal &amp; Set Your Password</h2>
        <p>Dear ${escapeHtml(formattedClientName)},</p>
        <p>Your secure NJS Property Group Client Portal account has been created${propertyAddress ? ` regarding <strong>${escapeHtml(propertyAddress)}</strong>` : ''}.</p>
        <p>Your portal allows you to easily:</p>
        <ul style="padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.8;">
          <li>Review and accept your formal RICS survey quote</li>
          <li>Review and digitally sign your Terms of Engagement</li>
          <li>Settle survey invoices securely with instant VAT receipts</li>
          <li>Track real-time inspection progress and surveyor diaries</li>
        </ul>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${activationLink}" style="background: #0B1F4D; color: #ffffff; padding: 14px 30px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 10px rgba(11, 31, 77, 0.2);">Set Password &amp; Activate Portal &rarr;</a>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          <em>Note: This activation link is valid for 48 hours.</em>
        </p>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  // Ensure token is redacted in console logs/fallbacks
  const safeLoggedHtml = html.replace(/token=[^"&'\s]+/g, 'token=[REDACTED]');

  const resend = getResend();
  if (!resend) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html: safeLoggedHtml,
      isUnconfigured: true,
    });
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (response?.error) {
      console.error('[Resend Error] sendPortalActivationEmail failed:', response.error);
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html: safeLoggedHtml,
        error: response.error.message || String(response.error),
      });
    }

    return {
      success: true,
      emailSent: true,
      messageId: response?.data?.id || response?.id,
      error: null,
      provider: 'resend_live',
      simulated: false,
    };
  } catch (err) {
    console.error('[Resend Exception] sendPortalActivationEmail error:', err?.message || err);
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html: safeLoggedHtml,
      error: err?.message || String(err),
    });
  }
};

/**
 * Dispatch Post-Inspection Update Email when Surveyor marks Site Inspection Complete / Drafting
 */
export const sendPostInspectionUpdateEmail = async ({
  to,
  clientName,
  jobRef,
  propertyAddress,
  surveyType,
  surveyorName,
  jobId = null,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `Site Inspection Attended Today: ${propertyAddress || jobRef} — NJS Property Group`;
  const frontendBase = getFrontendBaseUrl();
  const trackUrl = `${frontendBase}/customer/track-my-survey`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      ${buildEmailHeader('NJS PROPERTY GROUP — SITE INSPECTION UPDATE', 'Surveyor Inspection Completed')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Site Inspection Completed</h2>
        <p>Dear ${escapeHtml(formattedClientName)},</p>
        <p>Site inspection attended today by your surveyor <strong>${escapeHtml(surveyorName || 'Assigned Chartered Surveyor')}</strong> for <strong>${escapeHtml(propertyAddress || 'your property')}</strong> (${escapeHtml(jobRef || '')}).</p>
        <p>Findings and photographs are currently being compiled into your formal ${escapeHtml(surveyType || 'RICS Survey Report')}.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${trackUrl}" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Track Live Survey Progress &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  if (!resend || !to || !to.includes('@')) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      isUnconfigured: !resend,
      error: !to || !to.includes('@') ? 'Invalid recipient email' : undefined,
      jobId,
    });
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (response?.error) {
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: response.error.message || String(response.error),
        jobId,
      });
    }

    return {
      success: true,
      emailSent: true,
      messageId: response?.data?.id || response?.id,
      error: null,
      provider: 'resend_live',
      simulated: false,
    };
  } catch (err) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      error: err?.message || String(err),
      jobId,
    });
  }
};

/**
 * Dispatch Unbooked Survey Booking Reminder Email (max 2 reminders)
 */
export const sendBookingReminderEmail = async ({
  to,
  clientName,
  jobRef,
  propertyAddress,
  surveyType,
  reminderNumber = 1,
  jobId = null,
}) => {
  const formattedClientName = capitalizeName(clientName);
  const subject = `Gentle Reminder (${reminderNumber}/2): Secure your surveyor inspection slot for ${propertyAddress || jobRef}`;
  const frontendBase = getFrontendBaseUrl();
  const bookingUrl = `${frontendBase}/customer/my-bookings`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      ${buildEmailHeader('NJS PROPERTY GROUP — BOOKING REMINDER', `Reminder ${reminderNumber} of 2`)}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Your Survey Slot Is Ready to Schedule</h2>
        <p>Dear ${escapeHtml(formattedClientName)},</p>
        <p>Thank you for completing your Terms of Engagement and payment for <strong>${escapeHtml(propertyAddress || 'your property')}</strong> (${escapeHtml(surveyType || 'RICS Survey')}, Ref: <strong>${escapeHtml(jobRef || '')}</strong>).</p>
        <p>Your inspection date has not yet been confirmed on our surveyor diary. Please view your portal or contact our Operations Desk on <strong>0333 305 2777</strong> so we can allocate your preferred inspection window.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${bookingUrl}" style="background: #2563EB; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">View My Booking Status &rarr;</a>
        </div>
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  if (!resend || !to || !to.includes('@')) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      isUnconfigured: !resend,
      error: !to || !to.includes('@') ? 'Invalid recipient email' : undefined,
      jobId,
    });
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (response?.error) {
      return await handleUnconfiguredOrFailedEmail({
        to,
        subject,
        html,
        error: response.error.message || String(response.error),
        jobId,
      });
    }

    return {
      success: true,
      emailSent: true,
      messageId: response?.data?.id || response?.id,
      error: null,
      provider: 'resend_live',
      simulated: false,
    };
  } catch (err) {
    return await handleUnconfiguredOrFailedEmail({
      to,
      subject,
      html,
      error: err?.message || String(err),
      jobId,
    });
  }
};
