import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

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

    return ApiResponse.created(
      res,
      { ticket },
      `Support ticket #${ticketNo} created. Our operations desk will get back to you shortly.`
    );
  } catch (error) {
    next(error);
  }
};
