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
          jobDbId: msg.jobId || null,
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
      // Deduplicate messages with identical content and role created within 3 seconds of each other
      const isDuplicate = thread.messages.some(
        (existing) =>
          existing.id === msg.id ||
          (existing.content === msg.content &&
            existing.role === msg.role &&
            Math.abs(new Date(existing.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 3000)
      );
      if (!isDuplicate) {
        thread.messages.unshift(msg);
      }
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

    // Deduplicate any rapid identical duplicate messages
    const deduplicated = [];
    for (const m of messages) {
      const isDup = deduplicated.some(
        (existing) =>
          existing.id === m.id ||
          (existing.content === m.content &&
            existing.role === m.role &&
            Math.abs(new Date(existing.createdAt).getTime() - new Date(m.createdAt).getTime()) < 3000)
      );
      if (!isDup) deduplicated.push(m);
    }

    // Mark as read for admin
    await prisma.message.updateMany({
      where: { conversationId, readByAdmin: false },
      data: { readByAdmin: true },
    });

    return ApiResponse.success(res, { messages: deduplicated, total: deduplicated.length });
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

    const trimmedContent = content.trim();

    // Idempotency guard: prevent duplicate submissions created within 3 seconds
    const recentDuplicate = await prisma.message.findFirst({
      where: {
        conversationId,
        content: trimmedContent,
        role: 'admin',
        createdAt: {
          gte: new Date(Date.now() - 3000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentDuplicate) {
      return ApiResponse.success(res, { message: recentDuplicate }, 'Reply already dispatched');
    }

    let numericJobId = null;
    if (jobId) {
      const parsed = parseInt(jobId, 10);
      if (!isNaN(parsed) && String(parsed) === String(jobId).trim()) {
        numericJobId = parsed;
      } else if (typeof jobId === 'string') {
        const matchingJob = await prisma.job.findFirst({
          where: { reference: jobId.trim() },
          select: { id: true },
        });
        if (matchingJob) numericJobId = matchingJob.id;
      }
    }

    if (!numericJobId && conversationId) {
      const existingMsgWithJob = await prisma.message.findFirst({
        where: { conversationId, jobId: { not: null } },
        select: { jobId: true },
      });
      if (existingMsgWithJob) numericJobId = existingMsgWithJob.jobId;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        jobId: numericJobId,
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

