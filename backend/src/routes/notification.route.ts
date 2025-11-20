import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validateResource } from '../middleware/validateResource';
import { authenticateUser } from '../middleware/authenticateUser';
import * as notificationController from '../controllers/notification.controller';
import {
  getUserNotificationsSchema,
  getUnreadCountSchema,
  markAsReadSchema,
  markAllAsReadSchema,
  deleteNotificationSchema
} from '../schemas/notification.schema';

const router = Router();

// All notification routes require authentication
router.use(authenticateUser);

router.get('/', validateResource(getUserNotificationsSchema), asyncHandler(notificationController.getUserNotifications));
router.get('/unread-count', validateResource(getUnreadCountSchema), asyncHandler(notificationController.getUnreadCount));
router.patch('/:id/read', validateResource(markAsReadSchema), asyncHandler(notificationController.markAsRead));
router.patch('/read-all', validateResource(markAllAsReadSchema), asyncHandler(notificationController.markAllAsRead));
router.delete('/:id', validateResource(deleteNotificationSchema), asyncHandler(notificationController.deleteNotification));

export default router;

