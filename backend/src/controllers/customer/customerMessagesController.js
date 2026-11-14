import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * Customer Menu 10: Messages (/customer/messages)
 * Real Customer & Surveyor Directory with Dynamic Activity Sorting
 */

export const getMessageContacts = async (req, res, next) => {
  try {
    // 1. Query all active Customers and Surveyors from MySQL
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['CUSTOMER', 'SURVEYOR'] },
        status: 'ACTIVE',
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

    // Map names to all related user IDs (handles demo duplicates seamlessly)
    const nameToIds = new Map();
    for (const u of users) {
      const k = u.name.trim().toLowerCase();
      if (!nameToIds.has(k)) nameToIds.set(k, []);
      nameToIds.get(k).push(u.id);
    }

    // Deduplicate unique people by name and role
    const uniqueUsers = [];
    const seen = new Set();
    for (const u of users) {
      const key = `${u.name.trim().toLowerCase()}-${u.role}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueUsers.push(u);
      }
    }

    // 2. Fetch latest message activity for each contact from DB
    const contactsWithActivity = await Promise.all(
      uniqueUsers.map(async (u) => {
        const k = u.name.trim().toLowerCase();
        const relatedIds = nameToIds.get(k) || [u.id];
        const primaryConvId = `conv-user-${u.id}`;

        const latestMsg = await prisma.message.findFirst({
          where: {
            OR: [
              {
                conversationId: {
                  in: relatedIds.flatMap((id) => [
                    `conv-user-${id}`,
                    `conv-usr_${id}`,
                    `conv-${id}`,
                  ]),
                },
              },
              { senderId: { in: relatedIds } },
              { job: { clientId: { in: relatedIds } } },
              { job: { clientEmail: u.email } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        // Generate initials
        const nameParts = u.name.trim().split(/\s+/);
        const initials =
          nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : (u.name.slice(0, 2) || 'UK').toUpperCase();

        const roleTitle =
          u.role === 'SURVEYOR'
            ? 'RICS Surveyor'
            : 'Client';

        const defaultSnippet =
          u.role === 'SURVEYOR'
            ? 'RICS survey protocol & inspection'
            : 'Survey instruction & quote assistance';

        // Format relative or clean time
        const lastTime = latestMsg ? latestMsg.createdAt : u.createdAt;
        const isToday =
          new Date(lastTime).toDateString() === new Date().toDateString();
        const formattedTime = isToday
          ? new Date(lastTime).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Yesterday';

        return {
          id: primaryConvId,
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

    // 3. Dynamic Activity Sorting: contact with latest message activity jumps to top ("jo message kare uska upr aa jay")
    contactsWithActivity.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );

    return ApiResponse.success(res, {
      contacts: contactsWithActivity,
      total: contactsWithActivity.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const targetConvId = req.query.conversationId;

    let conversationId = targetConvId;
    let customerJob = null;

    if (!conversationId) {
      customerJob = await prisma.job.findFirst({
        where: {
          OR: [{ clientId: userId }, { clientEmail: userEmail }],
        },
      });
      conversationId = customerJob
        ? `conv-${customerJob.id}`
        : `conv-user-${userId}`;
    }

    let contactUserId = null;
    if (conversationId.startsWith('conv-user-')) {
      contactUserId = parseInt(conversationId.replace('conv-user-', ''), 10);
    } else if (conversationId.startsWith('conv-usr_')) {
      contactUserId = parseInt(conversationId.replace('conv-usr_', ''), 10);
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { conversationId },
          contactUserId ? { senderId: contactUserId } : undefined,
          contactUserId
            ? { conversationId: `conv-user-${contactUserId}` }
            : undefined,
          contactUserId
            ? { conversationId: `conv-usr_${contactUserId}` }
            : undefined,
          customerJob ? { jobId: customerJob.id } : undefined,
        ].filter(Boolean),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
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
    const { content, conversationId: reqConvId, jobId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!content?.trim()) {
      throw ApiError.badRequest('Message content is required');
    }

    let customerJob = null;
    if (jobId) {
      customerJob = await prisma.job.findFirst({
        where: { id: parseInt(jobId, 10) },
      });
    } else {
      customerJob = await prisma.job.findFirst({
        where: {
          OR: [{ clientId: userId }, { clientEmail: userEmail }],
        },
      });
    }

    const conversationId =
      reqConvId ||
      (customerJob ? `conv-${customerJob.id}` : `conv-user-${userId}`);
    const userRole = req.user.role ? req.user.role.toLowerCase() : 'customer';

    const message = await prisma.message.create({
      data: {
        conversationId,
        jobId: customerJob?.id || null,
        senderId: userId,
        senderName: req.user.name,
        role: userRole,
        content: content.trim(),
        readByCustomer: true,
        readByAdmin: userRole === 'admin',
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
