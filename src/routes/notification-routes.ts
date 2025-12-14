import { Router } from "express";
import { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification, sendBroadcastNotification } from "../controllers/notification-controller.js";

export const notification_router = Router();

notification_router.post('/', createNotification);
notification_router.post('/broadcast', sendBroadcastNotification);

notification_router.get('/', getNotifications);
notification_router.get('/:id', getNotificationById);

notification_router.put('/:id', updateNotification);
notification_router.delete('/:id', deleteNotification);