import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getConversations = async (req, res, next) => {
  try {
    const user = req.user;

    // Distinct conversation threads
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
            clientId: true,
          },
        },
      },
    });

    // Group by conversationId
    const map = new Map();
    for (const msg of messages) {
      if (!map.has(msg.conversationId)) {
        map.set(msg.conversationId, {
          conversationId: msg.conversationId,
          jobId: msg.job?.reference,
          property: msg.job?.propertyAddress || 'Direct General Enquiry',
          clientName: msg.job?.clientName || msg.senderName,
          clientEmail: msg.job?.clientEmail,
          unreadAdmin: 0,
          unreadCustomer: 0,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          messages: [],
        });
      }

      const conv = map.get(msg.conversationId);
      conv.messages.unshift(msg);
      if (!msg.readByAdmin && msg.role === 'customer') conv.unreadAdmin += 1;
      if (!msg.readByCustomer && msg.role === 'admin') conv.unreadCustomer += 1;
    }

    let conversations = Array.from(map.values());

    if (user.role === 'CUSTOMER') {
      conversations = conversations.filter(
        (c) => c.clientEmail === user.email || c.messages.some((m) => m.senderId === user.id)
      );
    }

    return ApiResponse.success(res, { conversations, total: conversations.length });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, jobId } = req.body;
    const user = req.user;

    if (!conversationId || !content?.trim()) {
      throw ApiError.badRequest('Conversation ID and message content are required');
    }

    const role = user.role.toLowerCase();

    const message = await prisma.message.create({
      data: {
        conversationId,
        jobId: jobId ? parseInt(jobId) : null,
        senderId: user.id,
        senderName: user.name,
        role,
        content: content.trim(),
        readByAdmin: role === 'admin',
        readByCustomer: role === 'customer',
      },
    });

    return ApiResponse.created(res, { message }, 'Message delivered');
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const role = req.user.role.toLowerCase();

    if (role === 'admin') {
      await prisma.message.updateMany({
        where: { conversationId, readByAdmin: false },
        data: { readByAdmin: true },
      });
    } else {
      await prisma.message.updateMany({
        where: { conversationId, readByCustomer: false },
        data: { readByCustomer: true },
      });
    }

    return ApiResponse.success(res, null, 'Messages marked as read');
  } catch (error) {
    next(error);
  }
};

