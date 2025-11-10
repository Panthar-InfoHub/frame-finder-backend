import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger.js";
import { orderService } from "../services/order-service.js";


const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export const webHookHandler = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest("hex");

    if (signature !== expectedSignature) {
        logger.error("Invalid Razorpay Webhook Signature");
        res.status(400).send("Invalid signature");
        return;
    }

    //Filter events
    const event = body.event;

    try {

        if (event === "order.paid") {
            const orderEntity = body.payload.order.entity;
            const paymentEntity = body.payload.payment.entity;

            const { order_ids, user_id } = orderEntity.notes;

            logger.debug(`Razorpay Order Paid Webhook received for Order IDs: ${order_ids} and User ID: ${user_id}`);
            if (!order_ids || !user_id) {
                logger.error('\n Missing orderIds or userId in webhook payload of notes');
                return res.status(400).send('Invalid payload, notes missing order_ids or user_id');
            }

            //Let backend handle the payment creation and order update
            const orders = await orderService.webhookOrderHandler(order_ids, user_id, orderEntity, paymentEntity, signature);
            res.status(200).send("OK");

            //Reduce stock of order items
            await orderService.reduceStock(orders);
            return;
        }

    } catch (error) {
        logger.error(`Error handling Razorpay event ${event}:`, error);
        next(error);
        return;
    }
};