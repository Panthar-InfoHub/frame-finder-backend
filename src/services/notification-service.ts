import { getMessaging } from "firebase-admin/messaging";
import { Notification } from "../models/notification.js";
import AppError from "../middlwares/Error.js";
import { User } from "../models/user.js";
import logger from "../lib/logger.js";

export interface NotificationData {
    title: string;
    image?: string;
    message: string;
    adminId: string;
}

export const createNotificationService = async (notificationData: NotificationData) => {
    const notification = await Notification.create(notificationData);
    return notification;
}

export const updateNotificationService = async (notificationId: string, updateData: Partial<NotificationData>) => {
    const notification = await Notification.findByIdAndUpdate(notificationId, updateData, { new: true });
    return notification;
}

export const getNotificationByIdService = async (notificationId: string) => {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    return notification;
}

export const getNotificationsService = async (query: any, skip: number, limit: number) => {
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return notifications;
}

export const deleteNotificationService = async (notificationId: string) => {
    return await Notification.findByIdAndDelete(notificationId);
}

export const sendBroadcastNotificationService = async (notificating_id: string, type: string) => {

    const notification = await getNotificationByIdService(notificating_id);

    const cursor = User.find({ fcmToken: { $exists: true, $ne: null } }, { fcmToken: 1 }).lean().cursor();
    const fcm_tokens: string[] = [];

    for await (const user of cursor) {
        if (user.fcm_token) {
            fcm_tokens.push(user.fcm_token);
        }
    }
    //For future use
    // if (type === "user") {
    //     cursor = User.find({ fcmToken: { $exists: true, $ne: null } }, { fcmToken: 1 }).lean().cursor();
    // }

    const chuck_fcm_tokens: string[][] = create_chuncks(fcm_tokens, 250);
    for (const fcm_tokens of chuck_fcm_tokens) {
        getMessaging().sendEachForMulticast({
            notification: {
                title: notification.title,
                body: notification.message
            },
            android: {
                notification: {
                    imageUrl: notification.image || undefined,
                }
            },
            tokens: fcm_tokens,
        })
            .then((response) => {
                if (response.failureCount > 0) {
                    const failedTokens: any[] = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failedTokens.push(fcm_tokens[idx]);
                        }
                    });
                    logger.warn('List of tokens that caused failures: ' + failedTokens);
                }
            });
    }

}

const create_chuncks = (arr: string[], size: number): string[][] => {
    const chuncks: string[][] = [];

    for (let i = 0; i < arr.length; i += size) {
        chuncks.push(arr.slice(i, i + size));
    }
    return chuncks;
}