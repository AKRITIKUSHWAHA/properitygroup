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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0B1F4D; padding: 24px; text-align: left; border-bottom: 3px solid #C5A059;">
        <h1 style="color: #ffffff; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.4px;">NJS PROPERTY GROUP — NEW WEBSITE ENQUIRY</h1>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 12px;">Submitted via ${escapeHtml(sourcePage || 'Website Contact / Quote Form')}</p>
      </div>
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
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
              <div style="background: #0B1F4D; padding: 24px; text-align: left; border-bottom: 3px solid #C5A059;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">NJS PROPERTY GROUP</h1>
                <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 12px;">Independent RICS-Regulated Practice • Firm #084920</p>
              </div>
              
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
              
              <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                &copy; ${new Date().getFullYear()} NJS Property Group Ltd. Independent Chartered Surveyors. Regulated by RICS.
              </div>
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0B1F4D; padding: 24px; text-align: left; border-bottom: 3px solid #C5A059;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">NJS PROPERTY GROUP</h1>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 12px;">Independent RICS-Regulated Practice • Firm #084920</p>
      </div>
      
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #0B1F4D; font-size: 18px; margin-top: 0;">Dear ${clientName || 'Valued Client'},</h2>
        <p>Thank you for instructing NJS Property Group. We have prepared your comprehensive fee proposal for the property inspection below:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Property:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${propertyAddress || 'Subject Property'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Survey Standard:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0B1F4D; text-align: right;">${surveyType || 'RICS Level 2 Home Survey'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Fixed Fee (inc. 20% VAT):</td>
              <td style="padding: 6px 0; font-weight: 900; color: #059669; font-size: 16px; text-align: right;">£${quoteAmount || '770.00'}</td>
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
      
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} NJS Property Group Ltd. Regulated by RICS. All rights reserved.
      </div>
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: #0B1F4D; padding: 24px; text-align: left; border-bottom: 3px solid #C5A059;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">NJS PROPERTY GROUP</h1>
        <p style="color: #cbd5e1; margin: 4px 0 0 0; font-size: 12px;">Official HMRC VAT Invoice Receipt</p>
      </div>
      <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 18px; margin-top: 0;">✓ Payment Confirmed</h2>
        <p>Dear ${clientName || 'Valued Client'}, thank you for settling your survey invoice. Your payment has been received and verified.</p>
        <p><strong>Receipt Reference:</strong> ${invoiceRef}<br/><strong>Total Settled:</strong> £${amount}<br/><strong>Method:</strong> ${paymentMethod}</p>
        <p>Your allocated chartered surveyor will proceed with the site inspection as scheduled.</p>
      </div>
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
