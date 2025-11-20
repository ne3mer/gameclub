import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const notifications = await notificationService.getUserNotifications(userId, limit);
  res.json({ data: notifications });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const count = await notificationService.getUnreadNotificationCount(userId);
  res.json({ data: { count } });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  const notification = await notificationService.markNotificationAsRead(id, userId);
  res.json({ message: 'اعلان به عنوان خوانده شده علامت‌گذاری شد', data: notification });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  await notificationService.markAllNotificationsAsRead(userId);
  res.json({ message: 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند' });
};

export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'لطفاً وارد شوید' });
  }

  await notificationService.deleteNotification(id, userId);
  res.status(204).send();
};

