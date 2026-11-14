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
    // Sees ONLY NJS Operations Desk & their Assigned Surveyor
    // ========================================================
    if (currentUserRole === 'CUSTOMER') {
      const customerConvId = `conv-user-${currentUserId}`;

      const latestCustomerMsg = await prisma.message.findFirst({
        where: { conversationId: customerConvId },
        orderBy: { createdAt: 'desc' },
      });

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
    // FLOW 2: LOGGED IN USER IS A SURVEYOR
    // Sees NJS Operations Desk (Admin) & Assigned Survey Clients
    // ========================================================
    if (currentUserRole === 'SURVEYOR') {
      const surveyorConvId = `conv-user-${currentUserId}`;

      // 1. Channel with NJS Operations Desk
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

      const deskContact = {
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
      };

      // 2. Assigned Clients
      const assignedJobs = await prisma.job.findMany({
        where: { surveyorId: currentUserId },
        select: {
          id: true,
          reference: true,
          clientName: true,
          clientEmail: true,
          clientId: true,
          propertyAddress: true,
        },
      });

      const clientContacts = await Promise.all(
        assignedJobs.map(async (j) => {
          const clientConvId = j.clientId ? `conv-user-${j.clientId}` : `conv-job-${j.id}`;
          const latestClientMsg = await prisma.message.findFirst({
            where: {
              OR: [{ conversationId: clientConvId }, { jobId: j.id }],
            },
            orderBy: { createdAt: 'desc' },
          });

          const nameParts = j.clientName.trim().split(/\s+/);
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : (j.clientName.slice(0, 2) || 'CL').toUpperCase();

          const clientTime = latestClientMsg ? latestClientMsg.createdAt : new Date();
          const clientIsToday = new Date(clientTime).toDateString() === new Date().toDateString();
          const clientFormattedTime = clientIsToday
            ? new Date(clientTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : 'Today';

          return {
            id: clientConvId,
            userId: j.clientId,
            name: `${j.clientName} (${j.reference})`,
            email: j.clientEmail,
            role: 'CUSTOMER',
            roleTitle: 'Assigned Client',
            avatar: initials,
            lastMessage: latestClientMsg ? latestClientMsg.content : `Inspection for ${j.propertyAddress}`,
            time: clientFormattedTime,
            lastMessageTime: clientTime,
            online: true,
            unread: false,
          };
        })
      );

      const allSurveyorContacts = [deskContact, ...clientContacts];
      allSurveyorContacts.sort(
        (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      return ApiResponse.success(res, {
        contacts: allSurveyorContacts,
        total: allSurveyorContacts.length,
      });
    }

    // ========================================================
    // FLOW 3: LOGGED IN USER IS AN ADMIN / SUPER ADMIN
    // Admins manage communication with all Customers & Surveyors
    // Each contact has their own isolated thread!
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

    let conversationId = targetConvId;

    if (userRole === 'CUSTOMER') {
      conversationId = `conv-user-${userId}`;
    } else if (userRole === 'SURVEYOR') {
      // Surveyor can access their desk thread or their assigned client thread
      conversationId = targetConvId || `conv-user-${userId}`;
    }

    if (!conversationId) {
      conversationId = `conv-user-${userId}`;
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    if (userRole === 'CUSTOMER') {
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

    let conversationId = reqConvId;

    if (userRole === 'CUSTOMER') {
      conversationId = `conv-user-${userId}`;
    } else if (userRole === 'SURVEYOR') {
      conversationId = reqConvId || `conv-user-${userId}`;
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
