import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { sendSupportTicketNotificationEmail } from '../../services/emailService.js';

/**
 * Customer Menu 12: Support (/customer/support)
 * Dedicated Customer Helpdesk & Support Tickets
 */
export const getSupportTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: {
        job: { select: { reference: true, propertyAddress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponse.success(res, { tickets });
  } catch (error) {
    next(error);
  }
};

export const createSupportTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { subject, message, category = 'SURVEY_QUERY', priority = 'NORMAL', jobId } = req.body;

    if (!subject || !message?.trim()) {
      throw ApiError.badRequest('Subject and message details are required');
    }

    const count = await prisma.supportTicket.count();
    const ticketNo = `TKT-2026-${String(count + 101).padStart(3, '0')}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo,
        userId,
        jobId: jobId ? parseInt(jobId) : null,
        subject,
        message: message.trim(),
        category,
        priority,
        status: 'OPEN',
      },
    });

    // 1. In-App Notification dispatched to Admin
    try {
      const clientName = req.user?.name || 'Customer';
      await prisma.notification.create({
        data: {
          role: 'ADMIN',
          title: `Support Ticket: #${ticketNo}`,
          desc: `New ${priority} priority ticket from ${clientName} (${req.user?.email || 'N/A'}): "${subject}".`,
          type: 'support',
          link: '/admin/support',
        },
      });
    } catch (notifErr) {
      console.warn('Admin ticket in-app notification note:', notifErr?.message || notifErr);
    }

    // 2. Email alert dispatched to business inbox (info@njspropertygroup.com)
    let emailSent = false;
    let emailError = null;
    try {
      const emailRes = await sendSupportTicketNotificationEmail({
        ticketNo,
        customerName: req.user?.name || 'Client',
        customerEmail: req.user?.email || 'Not specified',
        subject,
        category,
        priority,
        message: message.trim(),
      });
      emailSent = Boolean(emailRes?.success || emailRes?.emailSent);
      emailError = emailRes?.error || null;
    } catch (emailErr) {
      console.error('Admin ticket email notification error:', emailErr?.message || emailErr);
      emailError = emailErr?.message || String(emailErr);
    }

    return ApiResponse.created(
      res,
      { ticket, emailSent, emailError },
      `Support ticket #${ticketNo} created. Our operations desk will get back to you shortly.`
    );
  } catch (error) {
    next(error);
  }
};

