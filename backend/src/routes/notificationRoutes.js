import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} from '../controllers/notificationController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// All notification routes require authentication
router.use(verifyJWT);

// GET /api/v1/notifications - Role-based notifications for current user
router.get('/', getNotifications);

// PATCH /api/v1/notifications/mark-all-read - Mark all read
router.patch('/mark-all-read', markAllAsRead);

// PATCH /api/v1/notifications/:id/read - Toggle single read
router.patch('/:id/read', markAsRead);

// POST /api/v1/notifications - Admin, Surveyor, or Customer can trigger role-targeted lifecycle alerts
router.post('/', authorizeRoles('ADMIN', 'SURVEYOR', 'CUSTOMER'), createNotification);

// DELETE /api/v1/notifications/:id - Dismiss / delete single notification
router.delete('/:id', deleteNotification);

export default router;
