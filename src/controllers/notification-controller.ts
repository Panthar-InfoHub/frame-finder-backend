import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js"
import { createNotificationService, NotificationData, updateNotificationService, getNotificationByIdService, getNotificationsService, deleteNotificationService, sendBroadcastNotificationService } from "../services/notification-service.js";

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data: NotificationData = req.body;
        logger.debug("Creating notification with data: ", data);

        const notification = await createNotificationService(data);

        logger.debug("Notification created successfully: ", notification);
        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: notification
        });
        return;

    } catch (error) {
        logger.error("\nError creating notification: ", error);
        next(error);
        return;
    }
}

export const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationId = req.params.id;
        const updateData: Partial<NotificationData> = req.body;
        logger.debug(`Updating notification with ID: ${notificationId} and data: `, updateData);

        const notification = await updateNotificationService(notificationId, updateData);

        logger.debug("Notification updated successfully: ", notification);
        res.status(200).json({
            success: true,
            message: "Notification updated successfully",
            data: notification
        });
        return;

    } catch (error) {
        logger.error("\nError updating notification: ", error);
        next(error);
        return;
    }
};

export const getNotificationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationId = req.params.id;
        logger.debug(`Fetching notification with ID: ${notificationId}`);

        const notification = await getNotificationByIdService(notificationId);

        logger.debug("Notification fetched successfully: ", notification);
        res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            data: notification
        });
        return;

    } catch (error) {
        logger.error("\nError fetching notification: ", error);
        next(error);
        return;
    }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        logger.debug(`Fetching notifications with page: ${page}, limit: ${limit}`);

        const notifications = await getNotificationsService({}, skip, Number(limit));

        logger.debug("Notifications fetched successfully: ", notifications);
        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications
        });
        return;

    } catch (error) {
        logger.error("\nError fetching notifications: ", error);
        next(error);
        return;
    }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationId = req.params.id;
        logger.debug(`Deleting notification with ID: ${notificationId}`);

        await deleteNotificationService(notificationId);

        logger.debug("Notification deleted successfully");
        res.status(204).json({
            success: true,
            message: "Notification deleted successfully"
        });
        return;

    } catch (error) {
        logger.error("\nError deleting notification: ", error);
        next(error);
        return;
    }
};

export const sendBroadcastNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { notificationId, type } = req.body;
        logger.debug(`Sending broadcast notification with ID: ${notificationId} and type: ${type}`);

        await sendBroadcastNotificationService(notificationId, type);

        logger.debug("Broadcast notification sent successfully");
        res.status(200).json({
            success: true,
            message: "Broadcast notification sent successfully"
        });
        return;

    } catch (error) {
        logger.error("\nError sending broadcast notification: ", error);
        next(error);
        return;
    }
};