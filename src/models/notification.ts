import { model, Schema } from "mongoose";

const notificationSchema = new Schema({
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true })

export const Notification = model('Notification', notificationSchema);