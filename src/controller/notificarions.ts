import { NextFunction, Request, Response } from 'express';
import { NotificationService } from '../service/notificationsService'; 

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response,next:NextFunction) {
    try {
      const user = req?.user as any; 
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await notificationService.getNotifications(user.id, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Bildirimleri getirme hatası:', error);
      res.status(500).json({ message: 'Bildirimler getirilemedi' });
    }
  }

  async markNotificationAsRead(req: Request, res: Response,next:NextFunction) {
    try {
      const { notificationId } = req.params;

      await notificationService.markNotificationAsRead(notificationId);
      res.json({ message: 'Bildirim okundu olarak işaretlendi' });
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
      res.status(500).json({ message: 'Bildirim okundu olarak işaretlenemedi' });
    }
  }
}
