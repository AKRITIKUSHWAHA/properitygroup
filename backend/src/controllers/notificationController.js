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
        desc: 'Chartered Surveyor David Thorne uploaded preliminary defect schedule',
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
        type: 'terms',
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
        desc: 'David Thorne MRICS has been assigned as your lead independent chartered surveyor.',
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

    // Ensure role-based notifications exist
    await seedDefaultNotificationsForRole(user);

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { role: user.role, userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const formatted = notifications.map((n) => {
      const d = new Date(n.createdAt);
      const timeStr = `${d.toLocaleDateString('en-GB')}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      return {
        id: n.id,
        title: n.title,
        desc: n.desc,
        time: timeStr,
        read: n.read,
        type: n.type,
        amount: n.amount,
        link: n.link,
      };
    });

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
