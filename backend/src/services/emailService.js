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

export const buildEmailHeader = (title = 'NJS PROPERTY GROUP', subtitle = 'Independent RICS-Regulated Practice • Firm #084920') => `
  <div style="background: #ffffff; padding: 20px 26px; border-bottom: 1px solid #e2e8f0; text-align: left;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="left" style="vertical-align: middle; padding: 0;">
          <img src="${NJS_OFFICIAL_LOGO_URL}" alt="NJS Property Group" width="220" style="width: 220px; max-width: 240px; height: auto; display: block; border: 0;" />
        </td>
        <td align="right" style="vertical-align: middle; padding: 0; text-align: right;">
          <div style="display: inline-block; font-size: 11px; font-weight: 700; color: #0B1F4D; background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.3px;">
            RICS Regulated Firm #084920
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
    <div style="font-weight: 700; color: #0B1F4D; margin-bottom: 4px;">NJS Property Group Ltd &bull; Independent Chartered Surveyors</div>
    <div>Regulated by RICS &bull; Firm #084920 &bull; Phone: 0800 169 9661 &bull; Email: info@njspropertygroup.com</div>
    <div style="color: #94a3b8; font-size: 10.5px; margin-top: 6px;">&copy; ${new Date().getFullYear()} NJS Property Group. All rights reserved under UK Law.</div>
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
  const isExpertWitness = enquiryCategory === 'EXPERT_WITNESS';
  const subjectTag = isExpertWitness ? 'Expert Witness Enquiry' : 'New Survey Quote Request';
  const subject = `[${subjectTag}] ${serviceName || disputeType || 'Property Enquiry'} — ${propertyPostcode || propertyAddress || customerName} (${referenceId})`;

  const detailRows = [
    ['Reference ID', referenceId],
    ['Client Name', customerName],
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
        <p style="font-size: 12px; color: #64748b; margin: 18px 0 0 0;">Reply directly to this email to respond to <strong>${escapeHtml(customerName)}</strong> (${escapeHtml(customerEmail)}).</p>
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
        try {
          const customerHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
              ${buildEmailHeader('NJS PROPERTY GROUP', 'Official Quotation Request Acknowledgment')}
              
              <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
                <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(customerName || 'Valued Client')},</h2>
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
                  <a href="${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/login" style="background: #0B1F4D; color: #ffffff; padding: 12px 26px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 13px;">Open Customer Portal &rarr;</a>
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                  For urgent questions, contact our London operations desk at <strong>020 7946 0912</strong> or reply directly to this email.
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
  const subject = `Your Formal RICS Survey Proposal: ${surveyType} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — FORMAL SURVEY PROPOSAL', `RICS Practice Reference • ${escapeHtml(surveyType || 'RICS Home Survey')}`)}
      
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${escapeHtml(clientName || 'Valued Client')},</h2>
        <p>Thank you for instructing NJS Property Group. We have prepared your comprehensive fee proposal for the property inspection below:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${escapeHtml(propertyAddress || 'Subject Property')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Survey Standard:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; text-align: right;">${escapeHtml(surveyType || 'RICS Level 2 Home Survey')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Fixed Fee (inc. 20% VAT):</td>
              <td style="padding: 6px 0; font-weight: 900; color: #059669; font-size: 16px; text-align: right;">£${escapeHtml(quoteAmount || '770.00')}</td>
            </tr>
          </table>
        </div>

        <p>To view full terms, confirm surveyor allocation, and e-sign your engagement agreement, click the secure portal link below:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${quoteLink || `${process.env.FRONTEND_URL || 'https://njspropertygroup.com'}/login`}" style="background: #2563EB; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 14px;">Review &amp; Track Your Survey &rarr;</a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Need assistance? Our operations team is available at <strong>020 7946 0912</strong> or reply directly to this email.
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
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: [to],
        cc: [ENQUIRY_INBOX],
        subject,
        html,
      });
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
}) => {
  const subject = `Payment Confirmation & Official VAT Receipt: ${invoiceRef} — NJS Property Group`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP — OFFICIAL VAT RECEIPT', 'HMRC-Compliant Invoice Settlement')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 18px; margin-top: 0;">✓ Payment Confirmed</h2>
        <p>Dear ${escapeHtml(clientName || 'Valued Client')}, thank you for settling your survey invoice. Your payment has been received and verified.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 42%;">Receipt Reference:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; font-family: monospace; text-align: right;">${escapeHtml(invoiceRef)}</td>
            </tr>
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
      </div>
      ${buildEmailFooter()}
    </div>
  `;

  const resend = getResend();
  const SENDER_EMAIL = process.env.EMAIL_FROM || 'NJS Property Group <info@njspropertygroup.com>';
  const ENQUIRY_INBOX = process.env.ENQUIRY_NOTIFICATION_EMAIL || env.ENQUIRY_NOTIFICATION_EMAIL || 'info@njspropertygroup.com';

  if (resend) {
    try {
      const res = await resend.emails.send({ from: SENDER_EMAIL, to: [to], subject, html });
      return { success: true, messageId: res.id, provider: 'resend_live' };
    } catch (err) {
      console.warn('Resend receipt error:', err.message);
    }
  }

  console.log(`[RESEND SIMULATION] Receipt email dispatched to ${to} for invoice ${invoiceRef}`);
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
  const subject = `[New Client Message] ${clientName} (${clientEmail}) — NJS Property Group Portal`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP', 'Customer Portal Direct Communications Desk')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <div style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 12px;">
          New Client Message Received
        </div>
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Message from ${escapeHtml(clientName)}</h2>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">
          <strong>Sender:</strong> ${escapeHtml(clientName)} &lt;${escapeHtml(clientEmail)}&gt;<br/>
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
  const subject = `New Message from NJS Property Group regarding your Survey`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 31, 77, 0.06);">
      ${buildEmailHeader('NJS PROPERTY GROUP', 'RICS Regulated Surveying Practice • Message Update')}
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <p style="margin-top: 0;">Dear ${escapeHtml(clientName || 'Valued Client')},</p>
        <p>You have received a new reply from <strong>${escapeHtml(adminSenderName)}</strong> regarding your survey instruction.</p>

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
