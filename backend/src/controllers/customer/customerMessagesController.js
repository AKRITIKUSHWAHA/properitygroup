import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer & Surveyor Messages Controller
 * Strict Chat Thread Isolation per User Role (Customer / Surveyor / Admin)
 */

export const getMessageContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role || 'CUSTOMER';
    const currentUserEmail = req.user?.email || '';

    // ========================================================
    // FLOW 1: LOGGED IN USER IS A CUSTOMER
    // Customer chats strictly 1-on-1 with Admin (NJS Operations & Admin Desk)
    // No other customer or surveyor is visible ("kisi ki v kisi ko na dikhe")
    // ========================================================
    if (currentUserRole === 'CUSTOMER') {
      const customerConvId = `conv-user-${currentUserId}`;

      const latestCustomerMsg = await prisma.message.findFirst({
        where: { conversationId: customerConvId },
        orderBy: { createdAt: 'desc' },
      });

      const lastTime = latestCustomerMsg ? latestCustomerMsg.createdAt : new Date();
      const isToday = new Date(lastTime).toDateString() === new Date().toDateString();
      const formattedTime = isToday
        ? new Date(lastTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'Today';

      const customerContacts = [
        {
          id: customerConvId,
          userId: currentUserId,
          name: 'NJS Operations & Admin Desk',
          email: 'info@njspropertygroup.com',
          role: 'ADMIN',
          roleTitle: 'NJS Operations & Admin Desk',
          avatar: 'NJS',
          lastMessage: latestCustomerMsg ? latestCustomerMsg.content : 'Direct communications channel active',
          time: formattedTime,
          lastMessageTime: lastTime,
          online: true,
          unread: false,
        },
      ];

      return ApiResponse.success(res, {
        contacts: customerContacts,
        total: customerContacts.length,
      });
    }

    // ========================================================
    // FLOW 2: LOGGED IN USER IS A SURVEYOR
    // Surveyor chats strictly 1-on-1 with Admin (NJS Operations & Dispatch Desk)
    // No other surveyor or customer is visible
    // ========================================================
    if (currentUserRole === 'SURVEYOR') {
      const surveyorConvId = `conv-user-${currentUserId}`;

      const latestDeskMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { conversationId: surveyorConvId },
            { conversationId: `conv-usr_${currentUserId}` },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      const lastTime = latestDeskMsg ? latestDeskMsg.createdAt : new Date();
      const isToday = new Date(lastTime).toDateString() === new Date().toDateString();
      const formattedTime = isToday
        ? new Date(lastTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'Today';

      const surveyorContacts = [
        {
          id: surveyorConvId,
          userId: currentUserId,
          name: 'NJS Operations & Dispatch Desk',
          email: 'info@njspropertygroup.com',
          role: 'ADMIN',
          roleTitle: 'NJS Operations Desk',
          avatar: 'NJS',
          lastMessage: latestDeskMsg ? latestDeskMsg.content : 'Direct surveyor coordination active',
          time: formattedTime,
          lastMessageTime: lastTime,
          online: true,
          unread: false,
        },
      ];

      return ApiResponse.success(res, {
        contacts: surveyorContacts,
        total: surveyorContacts.length,
      });
    }

    // ========================================================
    // FLOW 3: LOGGED IN USER IS AN ADMIN / SUPER ADMIN
    // Admins manage communication with all Customers & Surveyors
    // Each contact has their own isolated thread: conv-user-${u.id}
    // Dynamic Activity Sorting: whoever messages moves to index 0 (top)!
    // ========================================================
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['CUSTOMER', 'SURVEYOR'] },
        status: 'ACTIVE',
        id: { not: currentUserId }, // Exclude admin himself
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        surveyorProfile: {
          select: {
            accreditation: true,
          },
        },
      },
    });

    const uniqueUsersMap = new Map();
    for (const u of users) {
      const key = `${u.name.trim().toLowerCase()}-${u.role}`;
      if (!uniqueUsersMap.has(key)) {
        uniqueUsersMap.set(key, u);
      } else {
        if (u.email.includes('demo.com') || u.email.includes('njspropertygroup.com')) {
          uniqueUsersMap.set(key, u);
        }
      }
    }
    const distinctUsers = Array.from(uniqueUsersMap.values());

    const contactsWithActivity = await Promise.all(
      distinctUsers.map(async (u) => {
        const convId = `conv-user-${u.id}`;

        const latestMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { conversationId: convId },
              { conversationId: `conv-usr_${u.id}` },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const nameParts = u.name.trim().split(/\s+/);
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : (u.name.slice(0, 2) || 'UK').toUpperCase();

        const roleTitle = u.role === 'SURVEYOR' ? 'RICS Surveyor' : 'Client';
        const defaultSnippet =
          u.role === 'SURVEYOR'
            ? 'RICS survey protocol & inspection'
            : 'Survey instruction & quote assistance';

        const lastTime = latestMsg ? latestMsg.createdAt : u.createdAt;
        const isToday = new Date(lastTime).toDateString() === new Date().toDateString();
        const formattedTime = isToday
          ? new Date(lastTime).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Yesterday';

        return {
          id: convId,
          userId: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          roleTitle,
          avatar: initials,
          lastMessage: latestMsg ? latestMsg.content : defaultSnippet,
          time: formattedTime,
          lastMessageTime: lastTime,
          online: true,
          unread: false,
        };
      })
    );

    // Dynamic Activity Sorting: newest activity on top ("jo message kare uska upr aa jay")
    contactsWithActivity.sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return ApiResponse.success(res, {
      contacts: contactsWithActivity,
      total: contactsWithActivity.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Strict Thread Isolation: Retrieve messages for a specific conversation
 */
export const getCustomerMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const targetConvId = req.query.conversationId;

    let conversationId;

    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      // Customer and Surveyor are locked strictly to their own conversation thread with Admin!
      // Absolute privacy - never accesses anyone else's messages
      conversationId = `conv-user-${userId}`;
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admin views whichever contact thread is selected
      conversationId = targetConvId;
      if (!conversationId) {
        // Default to the first customer or surveyor's conversation
        const latestMsg = await prisma.message.findFirst({
          where: { conversationId: { startsWith: 'conv-user-' } },
          orderBy: { createdAt: 'desc' },
        });
        conversationId = latestMsg ? latestMsg.conversationId : 'conv-user-25';
      }
    } else {
      conversationId = `conv-user-${userId}`;
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      await prisma.message.updateMany({
        where: { conversationId, readByCustomer: false },
        data: { readByCustomer: true },
      });
    } else {
      await prisma.message.updateMany({
        where: { conversationId, readByAdmin: false },
        data: { readByAdmin: true },
      });
    }

    return ApiResponse.success(res, {
      conversationId,
      messages,
      total: messages.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Strict Message Sending: Saves message to the isolated conversation thread
 */
export const sendCustomerMessage = async (req, res, next) => {
  try {
    const { content, conversationId: reqConvId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role || 'CUSTOMER';

    if (!content?.trim()) {
      throw ApiError.badRequest('Message content is required');
    }

    let conversationId;

    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      // Customer and Surveyor always send to their own thread with Admin
      conversationId = `conv-user-${userId}`;
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admin sends into the active contact's conversation thread
      conversationId = reqConvId;
      if (!conversationId) {
        throw ApiError.badRequest('Target conversation ID is required for Admin');
      }
    } else {
      conversationId = `conv-user-${userId}`;
    }

    const roleName = userRole.toLowerCase();

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        senderName: req.user.name,
        role: roleName,
        content: content.trim(),
        readByCustomer: userRole === 'CUSTOMER' || userRole === 'SURVEYOR',
        readByAdmin: userRole === 'ADMIN' || userRole === 'SUPER_ADMIN',
      },
    });

    return ApiResponse.created(
      res,
      { message },
      'Message dispatched successfully'
    );
  } catch (error) {
    next(error);
  }
};
