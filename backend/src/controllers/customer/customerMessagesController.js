import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 10: Messages (/customer/messages)
 * Strict Chat Thread Isolation for Customer
 */
export const getCustomerMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Find customer's conversation thread ID
    const customerJob = await prisma.job.findFirst({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
      },
    });

    const conversationId = customerJob ? `conv-${customerJob.id}` : `user-${userId}`;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { conversationId },
          { senderId: userId },
          { job: { clientId: userId } },
          { job: { clientEmail: userEmail } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread admin messages as read by customer
    await prisma.message.updateMany({
      where: {
        OR: [{ conversationId }, { senderId: userId }],
        readByCustomer: false,
      },
      data: { readByCustomer: true },
    });

    return ApiResponse.success(res, {
      conversationId,
      jobReference: customerJob?.reference || null,
      messages,
      total: messages.length,
    });
  } catch (error) {
    next(error);
  }
};

export const sendCustomerMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!content?.trim()) {
      throw ApiError.badRequest('Message content is required');
    }

    const customerJob = await prisma.job.findFirst({
      where: {
        OR: [{ clientId: userId }, { clientEmail: userEmail }],
      },
    });

    const conversationId = customerJob ? `conv-${customerJob.id}` : `user-${userId}`;

    const message = await prisma.message.create({
      data: {
        conversationId,
        jobId: customerJob?.id || null,
        senderId: userId,
        senderName: req.user.name,
        role: 'customer',
        content: content.trim(),
        readByCustomer: true,
        readByAdmin: false,
      },
    });

    return ApiResponse.created(res, { message }, 'Message sent to NJS operations desk');
  } catch (error) {
    next(error);
  }
};
