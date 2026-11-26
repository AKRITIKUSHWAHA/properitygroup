import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  sendClientMessageToAdminNotificationEmail,
  sendAdminReplyToClientNotificationEmail,
} from '../../services/emailService.js';
import { checkIsUserOnline, getUserLastSeen } from '../../services/userPresenceService.js';

/**
 * Customer & Surveyor Messages Controller
 * Strict Chat Thread Isolation per User Role (Customer / Surveyor / Admin)
 */

export const getMessageContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const currentUserRole = (req.user?.role || 'CUSTOMER').toUpperCase();
    const currentUserEmail = req.user?.email || '';

    // ========================================================
    // FLOW 1: LOGGED IN USER IS A CUSTOMER
    // Customer chats strictly 1-on-1 with Admin (NJS Operations & Admin Desk)
    // No other customer or surveyor is visible ("kisi ki v kisi ko na dikhe")
    // ========================================================
    if (currentUserRole === 'CUSTOMER') {
      const customerConvId = `conv-user-${currentUserId}`;

      const [latestCustomerMsg, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: { conversationId: customerConvId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.message.count({
          where: {
            conversationId: customerConvId,
            readByCustomer: false,
          },
        }),
      ]);

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
          unread: unreadCount > 0,
          unreadCount,
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

      const [latestDeskMsg, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { conversationId: surveyorConvId },
              { conversationId: `conv-usr_${currentUserId}` },
            ],
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.message.count({
          where: {
            OR: [
              { conversationId: surveyorConvId },
              { conversationId: `conv-usr_${currentUserId}` },
            ],
            readByCustomer: false,
          },
        }),
      ]);

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
          unread: unreadCount > 0,
          unreadCount,
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
        const existing = uniqueUsersMap.get(key);
        const existingIsDemo = (existing.email || '').toLowerCase().includes('demo.com');
        const currentEmail = (u.email || '').toLowerCase();
        const currentIsDemo = currentEmail.includes('demo.com');
        if (existingIsDemo && !currentIsDemo) {
          uniqueUsersMap.set(key, u);
        } else if (!currentIsDemo && currentEmail.includes('njspropertygroup.com')) {
          uniqueUsersMap.set(key, u);
        }
      }
    }
    const distinctUsers = Array.from(uniqueUsersMap.values());

    const contactsWithActivity = await Promise.all(
      distinctUsers.map(async (u) => {
        const convId = `conv-user-${u.id}`;

        const [latestMsg, unreadCount] = await Promise.all([
          prisma.message.findFirst({
            where: {
              OR: [
                { conversationId: convId },
                { conversationId: `conv-usr_${u.id}` },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: {
              OR: [
                { conversationId: convId },
                { conversationId: `conv-usr_${u.id}` },
              ],
              readByAdmin: false,
            },
          }),
        ]);

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

        const lastMsgTime = latestMsg ? latestMsg.createdAt : u.createdAt;
        const isMsgToday = new Date(lastMsgTime).toDateString() === new Date().toDateString();
        const formattedMsgTime = isMsgToday
          ? new Date(lastMsgTime).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Yesterday';

        const isOnline = checkIsUserOnline(u.id, u.email);
        const presenceLastSeen = getUserLastSeen(u.id, u.email);
        const lastActiveDate = presenceLastSeen || lastMsgTime;
        const isSeenToday = new Date(lastActiveDate).toDateString() === new Date().toDateString();
        const formattedLastSeen = isSeenToday
          ? new Date(lastActiveDate).toLocaleTimeString('en-GB', {
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
          time: formattedMsgTime,
          lastSeen: formattedLastSeen,
          lastMessageTime: lastMsgTime,
          online: isOnline,
          unread: unreadCount > 0,
          unreadCount,
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
    const userRole = (req.user.role || 'CUSTOMER').toUpperCase();
    const targetConvId = req.query.conversationId;

    let conversationId;
    let whereCondition;

    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      // Customer and Surveyor are locked strictly to their own conversation thread with Admin!
      // Absolute privacy - never accesses anyone else's messages
      conversationId = `conv-user-${userId}`;
      whereCondition = {
        OR: [
          { conversationId: `conv-user-${userId}` },
          { conversationId: `conv-usr_${userId}` },
        ],
      };
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admin views whichever contact thread is selected
      conversationId = targetConvId;
      if (conversationId) {
        const altId = conversationId.startsWith('conv-user-')
          ? conversationId.replace('conv-user-', 'conv-usr_')
          : conversationId.replace('conv-usr_', 'conv-user-');
        whereCondition = {
          OR: [
            { conversationId },
            { conversationId: altId },
          ],
        };
      } else {
        // Default to the first customer or surveyor's conversation
        const latestMsg = await prisma.message.findFirst({
          where: { conversationId: { startsWith: 'conv-user-' } },
          orderBy: { createdAt: 'desc' },
        });
        conversationId = latestMsg ? latestMsg.conversationId : 'conv-user-20';
        whereCondition = { conversationId };
      }
    } else {
      conversationId = `conv-user-${userId}`;
      whereCondition = { conversationId };
    }

    const messages = await prisma.message.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      await prisma.message.updateMany({
        where: {
          OR: [
            { conversationId },
            { conversationId: conversationId.replace('conv-user-', 'conv-usr_') },
          ],
          readByCustomer: false,
        },
        data: { readByCustomer: true },
      });
    } else {
      await prisma.message.updateMany({
        where: {
          OR: [
            { conversationId },
            { conversationId: conversationId.replace('conv-user-', 'conv-usr_') },
          ],
          readByAdmin: false,
        },
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
    const userRole = (req.user.role || 'CUSTOMER').toUpperCase();

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

    // ========================================================
    // POINT 9 NOTIFICATIONS DISPATCH ENGINE
    // ========================================================
    if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
      // 1. Gmail Alert to Admin Team (Natasha / info@njspropertygroup.com)
      sendClientMessageToAdminNotificationEmail({
        clientName: req.user.name || (userRole === 'SURVEYOR' ? 'Assigned Surveyor' : 'Client'),
        clientEmail: req.user.email || 'customer@njspropertygroup.com',
        messageContent: content.trim(),
        conversationId,
      }).catch((err) =>
        console.error('[sendClientMessageToAdminNotificationEmail] error:', err.message)
      );

      // 2. In-App Notification for Admin Team
      prisma.notification
        .create({
          data: {
            role: 'ADMIN',
            title: `New Message from ${req.user.name || (userRole === 'SURVEYOR' ? 'Surveyor' : 'Client')}`,
            desc:
              content.trim().length > 140
                ? `${content.trim().slice(0, 140)}...`
                : content.trim(),
            type: 'message',
            link: `/admin/messages?conversationId=${encodeURIComponent(conversationId)}`,
          },
        })
        .catch((err) => console.error('[Notification Admin] error:', err.message));
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admin replied -> Notify the customer or surveyor
      let recipientUser = null;
      const match =
        conversationId.match(/conv-user-(\d+)/) ||
        conversationId.match(/conv-usr_(\d+)/);
      const targetRecipientId = req.body.recipientId || (match && match[1] ? parseInt(match[1], 10) : null);

      if (targetRecipientId) {
        recipientUser = await prisma.user.findUnique({
          where: { id: parseInt(targetRecipientId, 10) },
          select: { id: true, name: true, email: true, role: true },
        });
      }

      if (!recipientUser) {
        try {
          const lastMsgInThread = await prisma.message.findFirst({
            where: {
              conversationId,
              senderId: { not: req.user.id },
            },
            orderBy: { createdAt: 'desc' },
            select: { senderId: true },
          });
          if (lastMsgInThread?.senderId) {
            recipientUser = await prisma.user.findUnique({
              where: { id: lastMsgInThread.senderId },
              select: { id: true, name: true, email: true, role: true },
            });
          }
        } catch (findErr) {
          console.error('[customerMessagesController] Error looking up conversation recipient:', findErr.message);
        }
      }

      if (recipientUser) {
        // 1. Email notification to the client/surveyor
        sendAdminReplyToClientNotificationEmail({
          to: recipientUser.email,
          clientName: recipientUser.name,
          adminSenderName: req.user.name || 'NJS Operations Desk',
          messageSnippet: content.trim(),
        }).catch((err) =>
          console.error('[sendAdminReplyToClientNotificationEmail] error:', err.message)
        );

        // 2. In-App Notification for recipient
        try {
          await prisma.notification.create({
            data: {
              userId: recipientUser.id,
              role: recipientUser.role,
              title: `💬 New Message from ${req.user.name || 'NJS Operations Desk'}`,
              desc:
                content.trim().length > 140
                  ? `${content.trim().slice(0, 140)}...`
                  : content.trim(),
              type: 'message',
              link:
                recipientUser.role === 'SURVEYOR'
                  ? '/surveyor/messages'
                  : '/customer/messages',
            },
          });
        } catch (nErr) {
          console.error('[Notification Recipient] error:', nErr.message);
        }
      }
    }

    return ApiResponse.created(
      res,
      { message },
      'Message dispatched successfully'
    );
  } catch (error) {
    next(error);
  }
};
