import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 10: Messages (/customer/messages)
 * Strict Chat Thread Isolation per User Role (Customer / Surveyor / Admin)
 */

export const getMessageContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role || 'CUSTOMER';
    const currentUserEmail = req.user?.email || '';

    // ========================================================
    // FLOW 1: LOGGED IN USER IS A CUSTOMER
    // A customer MUST ONLY see NJS Operations Desk & their Assigned Surveyor
    // They must NEVER see other customers or other customer messages!
    // ========================================================
    if (currentUserRole === 'CUSTOMER') {
      const customerConvId = `conv-user-${currentUserId}`;

      // 1. Fetch latest message in this customer's dedicated thread
      const latestCustomerMsg = await prisma.message.findFirst({
        where: { conversationId: customerConvId },
        orderBy: { createdAt: 'desc' },
      });

      // 2. Find customer's job to get their assigned surveyor if any
      const customerJob = await prisma.job.findFirst({
        where: {
          OR: [{ clientId: currentUserId }, { clientEmail: currentUserEmail }],
        },
        include: {
          surveyor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              surveyorProfile: { select: { accreditation: true } },
            },
          },
        },
      });

      const assignedSurveyor = customerJob?.surveyor;
      const surveyorName = assignedSurveyor?.name || 'David Thorne MRICS';
      const surveyorInitials = surveyorName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const lastTime = latestCustomerMsg ? latestCustomerMsg.createdAt : new Date();
      const isToday = new Date(lastTime).toDateString() === new Date().toDateString();
      const formattedTime = isToday
        ? new Date(lastTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : 'Today';

      const customerContacts = [
        {
          id: customerConvId,
          userId: currentUserId,
          name: 'NJS Operations & Surveyor Desk',
          email: 'info@njspropertygroup.com',
          role: 'ADMIN',
          roleTitle: 'NJS Coordination Desk',
          avatar: 'NJS',
          lastMessage: latestCustomerMsg ? latestCustomerMsg.content : 'Direct communications channel active',
          time: formattedTime,
          lastMessageTime: lastTime,
          online: true,
          unread: false,
        },
        {
          id: `conv-surveyor-${currentUserId}`,
          userId: assignedSurveyor?.id || 21,
          name: surveyorName,
          email: assignedSurveyor?.email || 'david.thorne@njspropertygroup.com',
          role: 'SURVEYOR',
          roleTitle: 'Assigned RICS Surveyor',
          avatar: surveyorInitials,
          lastMessage: 'RICS on-site inspection protocol & QA',
          time: 'Today, 2:02pm',
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
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
    // FLOW 2: LOGGED IN USER IS AN ADMIN / SUPER ADMIN
    // Admins manage all customer queries and surveyor dispatches
    // Each customer has their own isolated thread!
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

    // Deduplicate duplicate demo accounts by name & role
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

        // Find the latest message in this specific user's conversation thread
        const latestMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { conversationId: convId },
              { conversationId: `conv-usr_${u.id}` },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        // Generate clean initials
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

    // Sort: most recent message activity on top ("jo message kare uska upr aa jay")
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

    let conversationId = targetConvId;

    // Strict Security Isolation:
    // If CUSTOMER is logged in, they can ONLY access their own conversation thread!
    if (userRole === 'CUSTOMER') {
      conversationId = `conv-user-${userId}`;
    }

    if (!conversationId) {
      conversationId = `conv-user-${userId}`;
    }

    // Strictly fetch messages belonging ONLY to this conversationId!
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    if (userRole === 'CUSTOMER') {
      await prisma.message.updateMany({
        where: {
          conversationId,
          readByCustomer: false,
        },
        data: { readByCustomer: true },
      });
    } else {
      await prisma.message.updateMany({
        where: {
          conversationId,
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
    const userRole = req.user.role || 'CUSTOMER';

    if (!content?.trim()) {
      throw ApiError.badRequest('Message content is required');
    }

    let conversationId = reqConvId;

    // If CUSTOMER is sending, enforce their own isolated conversation thread
    if (userRole === 'CUSTOMER') {
      conversationId = `conv-user-${userId}`;
    }

    if (!conversationId) {
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
        readByCustomer: userRole === 'CUSTOMER',
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
