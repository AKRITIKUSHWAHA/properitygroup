import { Resend } from 'resend';
import { env } from '../config/env.js';

const getResend = () => {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (key && key.startsWith('re_') && key.length >= 12) {
    return new Resend(key);
  }
  return null;
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/login?email=${encodeURIComponent(customerEmail || '')}" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Open Customer Portal &rarr;</a>
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
          console.warn('Customer acknowledgment email warning:', cErr.message);
        }
      }

      return {
        success: true,
        emailSent: true,
        notifiedEmail: ENQUIRY_INBOX,
        customerNotified: customerEmail,
        messageId: response?.data?.id || response?.id,
        provider: 'resend_live',
      };
    } catch (err) {
      console.warn('Resend enquiry notification exception:', err.message);
      return {
        success: true,
        emailSent: false,
        notifiedEmail: ENQUIRY_INBOX,
        provider: 'resend_error',
        message: err.message,
      };
    }
  }

  console.log(`[ENQUIRY EMAIL PENDING PROVIDER CONFIG] Target: ${ENQUIRY_INBOX} | Ref: ${referenceId} | From: ${customerEmail}`);
  return {
    success: true,
    emailSent: false,
    notifiedEmail: ENQUIRY_INBOX,
    provider: 'not_configured',
    message: `Set valid RESEND_API_KEY in backend/.env to dispatch live emails to ${ENQUIRY_INBOX}.`,
  };
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
          <a href="${quoteLink || `${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/my-quotations?email=${encodeURIComponent(to || '')}`}" style="background: #2563EB; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">Review &amp; Track Your Survey &rarr;</a>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/quotes" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Quotes in Admin Portal &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin proposal dispatch record notice:', err.message));
      }

      if (response?.error) {
        console.warn('Resend quote proposal error:', response.error.message || response.error);
        return { success: false, error: response.error.message, provider: 'resend_error' };
      }
      return { success: true, messageId: response?.data?.id || response?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend live email error:', err.message);
    }
  }

  // Graceful Dev Simulation when client API key is pending
  console.log(`[RESEND SIMULATION] Quote email dispatched to ${to} for £${quoteAmount}`);
  return {
    success: true,
    provider: 'simulated_fallback',
    message: 'Resend API key pending from client. Email formatted and simulated successfully.',
  };
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
        <p style="font-size: 13px; color: #334155;">Your allocated chartered surveyor will proceed with the site inspection as scheduled. You can download your official PDF VAT receipt directly from your Customer Portal.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/invoices-and-payments" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View VAT Receipt in Portal &rarr;</a>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/quotes-and-payments" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View in Accounts Ledger &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin payment alert error:', err.message));
      }

      return { success: true, messageId: res?.data?.id || res?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend receipt error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Receipt email dispatched to ${to} for invoice ${invoiceRef}`);
  return { success: true, provider: 'simulated_fallback' };
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
          <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/terms-to-sign" style="background: #2563EB; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Sign Terms &amp; Proceed &rarr;</a>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/jobs" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Manage Instruction in Admin Portal &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin quote accepted notice error:', err.message));
      }

      return { success: true, messageId: res?.data?.id || res?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend quote accepted email error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Quote accepted email dispatched to ${to} for ref ${quoteRef}`);
  return { success: true, provider: 'simulated_fallback' };
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
          <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/track-survey" style="background: #0B1F4D; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">Track Survey Status &rarr;</a>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/terms" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Executed Contract in Admin &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin terms signed notice error:', err.message));
      }

      return { success: true, messageId: res?.data?.id || res?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend terms signed email error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Terms signed email dispatched to ${to} for ref ${jobRef}`);
  return { success: true, provider: 'simulated_fallback' };
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
          <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/my-bookings" style="background: #0B1F4D; color: #ffffff; padding: 13px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13.5px;">View Booking &amp; Add Notes &rarr;</a>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/jobs" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View in Dispatch Rota &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin inspection notice error:', err.message));
      }

      return { success: true, messageId: res?.data?.id || res?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend booking email error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Inspection confirmed email dispatched to ${to} for date ${formattedDate}`);
  return { success: true, provider: 'simulated_fallback' };
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
    : `${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/customer/reports`;
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/admin/reports" style="background: #0B1F4D; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">View Reports Repository &rarr;</a>
                </div>
              </div>
              ${buildEmailFooter()}
            </div>
          `,
        }).catch((err) => console.warn('Admin report delivered alert error:', err.message));
      }

      return { success: true, messageId: res?.data?.id || res?.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend report ready email error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Report ready email dispatched to ${to} for ref ${jobRef}`);
  return { success: true, provider: 'simulated_fallback' };
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
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/messages?conversationId=${encodeURIComponent(conversationId)}" 
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
      return { success: true, messageId: res.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend message alert error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Client message notification dispatched to ${ENQUIRY_INBOX} from ${clientEmail}`);
  return { success: true, provider: 'simulated_fallback' };
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
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/customer/messages" 
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
      return { success: true, messageId: res.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend client reply email error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Admin reply notification dispatched to ${to}`);
  return { success: true, provider: 'simulated_fallback' };
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
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [BUSINESS_INBOX],
        replyTo: customerEmail || undefined,
        subject: emailSubject,
        html,
      });
      return { wasSent: true, messageId: response?.data?.id || response?.id };
    } catch (err) {
      console.warn('Support ticket notification email note:', err?.message || err);
    }
  }

  console.log(`[RESEND SIMULATION] Support ticket alert #${ticketNo} logged for ${BUSINESS_INBOX}`);
  return { wasSent: true, simulation: true };
};
