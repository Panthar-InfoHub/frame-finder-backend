import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order-service.js";
import Mailer from "../lib/nodemailer.js";
import { PopulatedOrderItem } from "../lib/types.js";
import { OrderUpdateEmailTemplate } from "../lib/mail.template.js";
import logger from "../lib/logger.js";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!
        logger.debug(`\n User Id creating order ==> ${userId}`);

        //Data other than cart item eg : tax, shipping cost , discount, shipping address
        const orderData = req.body;
        logger.debug(`Order data for creating ==> ${orderData}`);

        const result = await orderService.createOrder(userId, orderData);

        logger.debug("\nOrder ==>", result);


        res.status(201).send({
            success: true,
            message: "Order created successfully",
            data: result
        });
        return;

    } catch (error) {
        logger.error("Error while creating order ==> ", error);
        next(error);
        return;
    }
}

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        logger.debug(`\n Getting orders of user ==> ${userId}`);

        const page = Number(req.query.page as string) || 1;
        const limit = Number(req.query.page as string) || 10;
        logger.debug(`\n Page ==> ${page} \t\t Limit ==> ${limit}`);

        const data = await orderService.getUserOrders(userId, { page, limit });
        logger.debug("\nOrder of user specific ==>", data);


        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        logger.error("Error fetching user orders:", error);
        next(error);
    }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        let userId = "";

        if (!["SUPER_ADMIN", "ADMIN", "VENDOR"].includes(req.user?.role!)) {
            userId = req.user?.id!
        }



        const data = await orderService.getOrderById(orderId, userId);

        logger.debug("\nOrder ==>", data);

        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        logger.error("Error fetching order:", error);
        next(error);
        return;
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const statusData = req.body;

        logger.debug(`Order Id for update ==> ${orderId}`)
        logger.debug('\nData to updated order ==> ', statusData);

        const data: PopulatedOrderItem = await orderService.updateOrderStatus(orderId, statusData);
        logger.debug("\nOrder ==>", data);
        const mail = new Mailer();
        await mail.sendMail({
            from: process.env.EMAIL_USER,
            to: data.userId?.email!,
            subject: `Order ${data.orderCode} status updated to ${data.order_status}`,
            html: OrderUpdateEmailTemplate({
                data,
                trackingId: statusData.tracking_id || "N/A"
            })  
        });

        logger.info("Email sent to user for order status update")


        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        logger.error("Error updating order status:", error);
        next(error);
        return;
    }
};

// Admin search orders
export const searchOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = req.query;
        const pagination = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 30
        };

        if (req.user?.role === "VENDOR") {
            filters['vendorId'] = req.user?.id;
        } else if (req.user?.role === "USER") {
            filters['userId'] = req.user?.id;
        }

        logger.debug(`Filter for search in order ==> ${JSON.stringify(filters, null, 2)}`)
        const data = await orderService.searchOrders(filters, pagination);
        logger.debug("Order ==>", data);
        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        logger.error("Error searching orders:", error);
        next(error);
        return;
    }
};
