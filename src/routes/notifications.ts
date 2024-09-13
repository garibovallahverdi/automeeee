import { Router } from 'express';
import { NotificationController } from '../controller/notificarions'; 
import { ensureAuthenticated } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

router.get('/notifications', ensureAuthenticated,(req, res, next) => notificationController.getNotifications(req, res, next));

router.patch('/notifications/:notificationId/read',ensureAuthenticated, (req, res, next) =>notificationController.markNotificationAsRead(req, res, next));

export default router;
