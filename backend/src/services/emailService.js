import { logger } from '../utils/logger.js';

export const emailService = {
  /**
   * Dispatches transactional survey milestone notifications (Resend / SendGrid)
   */
  async sendMilestoneEmail({ to, clientName, jobReference, milestoneTitle, message }) {
    logger.info(`[EMAIL DISPATCH] To: ${to} | Ref: ${jobReference} | Milestone: ${milestoneTitle}`);

    // In production, integrate with Resend API:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({...})

    return { success: true, messageId: `msg_${Date.now()}` };
  },

  async sendQuoteNotification({ to, clientName, quoteReference, amount }) {
    logger.info(`[EMAIL QUOTE] To: ${to} | Quote: ${quoteReference} | Amount: £${amount}`);
    return { success: true };
  },
};

