import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Superadmin Menu 7: Messages Inbox (Direct Customer Messaging & Threads)
 */
export const getMessageThreads = async (req, res, next) => {
  try {
    const { search } = req.query;

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            reference: true,
            propertyAddress: true,
            clientName: true,
            clientEmail: true,
          },
        },
      },
    });

    const threadMap = new Map();
    for (const msg of messages) {
      if (!threadMap.has(msg.conversationId)) {
        threadMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          jobId: msg.job?.reference || null,
          property: msg.job?.propertyAddress || 'Direct Portal Query',
          clientName: msg.job?.clientName || msg.senderName,
          clientEmail: msg.job?.clientEmail || null,
          unreadAdmin: 0,
          unreadCustomer: 0,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          messages: [],
        });
      }

      const thread = threadMap.get(msg.conversationId);
      thread.messages.unshift(msg);
      if (!msg.readByAdmin && msg.role === 'customer') thread.unreadAdmin += 1;
      if (!msg.readByCustomer && msg.role === 'admin') thread.unreadCustomer += 1;
    }

    let threads = Array.from(threadMap.values());
    if (search) {
      const q = search.toLowerCase();
      threads = threads.filter(
        (t) =>
          t.clientName.toLowerCase().includes(q) ||
          t.property.toLowerCase().includes(q) ||
          (t.jobId && t.jobId.toLowerCase().includes(q))
      );
    }

    return ApiResponse.success(res, { threads, total: threads.length });
  } catch (error) {
    next(error);
  }
};

export const getMessagesMetrics = async (req, res, next) => {
  try {
    const [unreadAdminCount, distinctConvs, linkedJobsCount] = await Promise.all([
      prisma.message.count({ where: { readByAdmin: false, role: 'customer' } }),
      prisma.message.groupBy({ by: ['conversationId'] }),
      prisma.message.count({ where: { jobId: { not: null } } }),
    ]);

    return ApiResponse.success(res, {
      activeCustomerThreads: distinctConvs.length,
      unreadCustomerQueries: unreadAdminCount,
      linkedSurveyInstructions: linkedJobsCount,
      gatewayStatus: 'Customer Portal Gateway Active',
    });
  } catch (error) {
    next(error);
  }
};

export const getThreadMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read for admin
    await prisma.message.updateMany({
      where: { conversationId, readByAdmin: false },
      data: { readByAdmin: true },
    });

    return ApiResponse.success(res, { messages, total: messages.length });
  } catch (error) {
    next(error);
  }
};

export const sendAdminMessage = async (req, res, next) => {
  try {
    const { conversationId, content, jobId } = req.body;

    if (!conversationId || !content?.trim()) {
      throw ApiError.badRequest('Conversation ID and message text are required');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        jobId: jobId ? parseInt(jobId) : null,
        senderId: req.user.id,
        senderName: `${req.user.name} (Admin)`,
        role: 'admin',
        content: content.trim(),
        readByAdmin: true,
        readByCustomer: false,
      },
    });

    return ApiResponse.created(res, { message }, 'Reply dispatched to customer portal');
  } catch (error) {
    next(error);
  }
};

export const markThreadRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    await prisma.message.updateMany({
      where: { conversationId, readByAdmin: false },
      data: { readByAdmin: true },
    });

    return ApiResponse.success(res, null, 'Thread marked as read');
  } catch (error) {
    next(error);
  }
};
