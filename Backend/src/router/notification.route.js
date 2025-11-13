import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import * as notificationController from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.get(
  '/list',
  verifyToken,
  notificationController.listNotifications
);

notificationRouter.patch(
  '/:notificationId/read',
  verifyToken,
  notificationController.markAsRead
);

notificationRouter.patch(
  '/read-all',
  verifyToken,
  notificationController.markAllAsRead
);

notificationRouter.get(
  '/company/list',
  verifyToken,
  notificationController.listCompanyNotifications
);

export default notificationRouter;

