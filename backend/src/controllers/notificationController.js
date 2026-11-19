import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Seed initial role-based notifications if none exist for this role/user
 */
async function seedDefaultNotificationsForRole(user) {
  if (!prisma?.notification) return;
  const existingCount = await prisma.notification.count({
    where: {
      OR: [
        { userId: user.id },
        { role: user.role, userId: null },
      ],
    },
  });

  if (existingCount > 0) return;

  const now = new Date();
  const formatTime = (minutesAgo) => {
    const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
    return `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

  let defaults = [];

  if (user.role === 'ADMIN') {
    defaults = [
      {
        role: 'ADMIN',
        title: 'RICS Level 2 Survey Booked',
        desc: 'Property inspection scheduled for 18 Highfield Ave, Surrey GU2 7YZ',
        type: 'booking',
        amount: '£650.00',
        read: false,
      },
      {
        role: 'ADMIN',
        title: 'Terms & Conditions Signed',
        desc: 'Client Emma Watson digitally signed contract for quotation #KQ-9042',
        type: 'terms',
        read: false,
      },
      {
        role: 'ADMIN',
        title: 'Payment Received',
        desc: 'Full advance payment received for Building Survey (Commercial, Mayfair)',
        type: 'payment',
        amount: '£1,450.00',
        read: true,
      },
      {
        role: 'ADMIN',
        title: 'Survey Report Uploaded',
        desc: 'Assigned Chartered Surveyor uploaded preliminary defect schedule',
        type: 'report',
        read: true,
      },
    ];
  } else if (user.role === 'SURVEYOR') {
    defaults = [
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'New Survey Inspection Assigned',
        desc: 'Building Survey Level 3 allocated at 18 Highfield Ave, Surrey GU2 7YZ. Please review instruction notes.',
        type: 'booking',
        read: false,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Keyholder Access Logistics',
        desc: 'Access confirmed: Keys with Foxtons Mayfair Branch (Ref #FX-402). Concierge code available in job file.',
        type: 'booking',
        read: false,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Physical Survey Schedule Confirmed',
        desc: 'On-site property inspection confirmed with vendor for tomorrow 10:00 AM.',
        type: 'booking',
        read: true,
      },
      {
        userId: user.id,
        role: 'SURVEYOR',
        title: 'Defect Schedule Ready for Drafting',
        desc: 'Preliminary photos synced. Please complete the RICS standard report draft within 48 business hours.',
        type: 'report',
        read: true,
      },
    ];
  } else {
    // CUSTOMER
    defaults = [
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Formal Survey Quotation Ready',
        desc: 'Your tailored fixed-fee RICS quotation #KQ-9042 is available to review and accept online.',
        type: 'booking',
        amount: '£650.00',
        read: false,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Chartered Surveyor Allocated',
        desc: 'An accredited RICS Chartered Surveyor has been assigned as your lead independent surveyor.',
        type: 'terms',
        read: false,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Payment Receipt & VAT Invoice',
        desc: 'Advance payment confirmed. HMRC-compliant VAT invoice #INV-2026-891 is ready in your portal.',
        type: 'payment',
        amount: '£650.00',
        read: true,
      },
      {
        userId: user.id,
        role: 'CUSTOMER',
        title: 'Terms of Engagement Signed',
        desc: 'Electronic contract confirmed and countersigned. Your property inspection is secured.',
        type: 'report',
        read: true,
      },
    ];
  }

  for (const item of defaults) {
    await prisma.notification.create({
      data: item,
    });
  }
}

/**
 * GET /api/v1/notifications
 * Fetch notifications filtered strictly for the authenticated user's role & ID
 */
export const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    if (!prisma?.notification) {
      return ApiResponse.success(res, {
        notifications: [],
        unreadCount: 0,
        total: 0,
      });
    }

    // Fetch clean real notifications without injecting artificial demo data
    // await seedDefaultNotificationsForRole(user);

    const userEmail = (user.email || '').trim().toLowerCase();
    let userIds = [user.id];
    if (userEmail) {
      try {
        const matchingUsers = await prisma.user.findMany({
          where: { email: userEmail },
          select: { id: true },
        });
        userIds = Array.from(new Set([user.id, ...matchingUsers.map((u) => u.id)].filter(Boolean)));
      } catch {}
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { role: user.role, userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const isSurveyor = (user.role || '').toLowerCase() === 'surveyor';

    let formatted = notifications.map((n) => {
      const d = new Date(n.createdAt);
      const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      return {
        id: n.id,
        title: n.title,
        desc: n.desc,
        time: timeStr,
        read: n.read,
        type: n.type,
        amount: isSurveyor ? null : n.amount,
        link: n.link,
      };
    });

    // Privacy Shield for Surveyors: Block payments and terms signature notices
    if (isSurveyor) {
      formatted = formatted.filter((n) => {
        if (n.type === 'payment') return false;
        const title = (n.title || '').toLowerCase();
        const desc = (n.desc || '').toLowerCase();
        if (
          title.includes('payment') ||
          desc.includes('payment') ||
          title.includes('invoice') ||
          desc.includes('invoice') ||
          title.includes('paid') ||
          title.includes('£') ||
          desc.includes('£')
        ) {
          return false;
        }
        if (
          (title.includes('terms') || title.includes('contract')) &&
          (title.includes('signed') || desc.includes('signed'))
        ) {
          return false;
        }
        return true;
      });
    }

    // Live Unread Messages from Chat Hub - Ensure incoming messages alert the bell instantly
    try {
      const userRole = (user.role || 'CUSTOMER').toUpperCase();
      let unreadMessages = [];

      if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
        const convConditions = userIds.map((uid) => ({ conversationId: `conv-user-${uid}` }));
        convConditions.push({ conversationId: `conv-user-${user.id}` });
        convConditions.push({ conversationId: `conv-usr_${user.id}` });
        if (userEmail) {
          convConditions.push({ conversationId: { contains: userEmail } });
        }
        unreadMessages = await prisma.message.findMany({
          where: {
            OR: convConditions,
            readByCustomer: false,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        unreadMessages = await prisma.message.findMany({
          where: {
            readByAdmin: false,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
      }

      const existingNotifDescs = new Set(
        formatted
          .filter((n) => n.type === 'message')
          .map((n) => (n.desc || '').trim())
      );

      for (const msg of unreadMessages) {
        const cleanContent = (msg.content || '').trim();
        const snippet = cleanContent.length > 140 ? `${cleanContent.slice(0, 140)}...` : cleanContent;
        if (!existingNotifDescs.has(cleanContent) && !existingNotifDescs.has(snippet)) {
          const d = new Date(msg.createdAt);
          const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
          const msgLink =
            userRole === 'SURVEYOR'
              ? '/surveyor/messages'
              : userRole === 'ADMIN'
              ? `/admin/messages?conversationId=${msg.conversationId}`
              : '/customer/messages';

          formatted.unshift({
            id: `msg-${msg.id}`,
            title: `💬 New Message from ${msg.senderName || 'Operations Desk'}`,
            desc: snippet || 'You have an unread message.',
            time: timeStr,
            read: false,
            type: 'message',
            link: msgLink,
          });
        }
      }
    } catch (msgErr) {
      console.warn('Unread messages query in notifications notice:', msgErr.message);
    }

    const unreadCount = formatted.filter((n) => !n.read).length;

    return ApiResponse.success(res, {
      notifications: formatted,
      unreadCount,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a specific notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const rawId = String(req.params.id);

    if (rawId.startsWith('msg-')) {
      const msgId = parseInt(rawId.replace('msg-', ''), 10);
      if (!isNaN(msgId)) {
        await prisma.message.updateMany({
          where: { id: msgId },
          data: {
            readByCustomer: true,
            readByAdmin: req.user.role === 'ADMIN',
          },
        });
      }
      return ApiResponse.success(res, null, 'Message notification marked as read');
    }

    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
      throw ApiError.badRequest('Invalid notification ID');
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    // Role security check
    if (notification.userId && notification.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('Unauthorized access to this notification');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: !notification.read },
    });

    return ApiResponse.success(res, { notification: updated }, 'Notification status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/mark-all-read
 * Mark all notifications for the current user and their role as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role, userId: null },
        ],
        read: false,
      },
      data: { read: true },
    });

    try {
      const userRole = (user.role || 'CUSTOMER').toUpperCase();
      if (userRole === 'CUSTOMER' || userRole === 'SURVEYOR') {
        const convId = `conv-user-${user.id}`;
        await prisma.message.updateMany({
          where: {
            OR: [
              { conversationId: convId },
              { conversationId: `conv-usr_${user.id}` },
            ],
            readByCustomer: false,
          },
          data: { readByCustomer: true },
        });
      } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        await prisma.message.updateMany({
          where: { readByAdmin: false },
          data: { readByAdmin: true },
        });
      }
    } catch {}

    return ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications
 * Dispatch a new notification (Admin or Internal triggers)
 */
export const createNotification = async (req, res, next) => {
  try {
    const { userId, role, title, desc, type = 'booking', amount, link } = req.body;

    if (!title || !desc) {
      throw ApiError.badRequest('Title and description are required');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId ? parseInt(userId, 10) : null,
        role: role ? String(role).toUpperCase() : null,
        title,
        desc,
        type,
        amount,
        link,
      },
    });

    return ApiResponse.created(res, { notification }, 'Notification created successfully');
  } catch (error) {
    next(error);
  }
};
