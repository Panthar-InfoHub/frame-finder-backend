import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order-service.js";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!
        console.debug(`\n User Id creating order ==> ${userId}`);

        //Data other than cart item eg : tax, shipping cost , discount, shipping address
        const orderData = req.body;
        console.debug(`Order data for creating ==> ${orderData}`);

        const result = await orderService.createOrder(userId, orderData);

        console.debug("\nOrder ==>", result);


        res.status(201).send({
            success: true,
            message: "Order created successfully",
            data: result
        });
        return;

    } catch (error) {
        console.error("Error while creating order ==> ", error);
        next(error);
        return;
    }
}

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        console.debug(`\n Getting orders of user ==> ${userId}`);

        const page = Number(req.query.page as string) || 1;
        const limit = Number(req.query.page as string) || 10;
        console.debug(`\n Page ==> ${page} \t\t Limit ==> ${limit}`);

        const data = await orderService.getUserOrders(userId, { page, limit });
        console.debug("\nOrder of user specific ==>", data);


        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        console.error("Error fetching user orders:", error);
        next(error);
    }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const userId = req.user?.id!;

        const data = await orderService.getOrderById(orderId, userId);

        console.debug("\nOrder ==>", data);

        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        console.error("Error fetching order:", error);
        next(error);
        return;
    }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const statusData = req.body;

        console.debug(`Order Id for update ==> ${orderId}`)
        console.debug('\nData to updated order ==> ', statusData);

        const data = await orderService.updateOrderStatus(orderId, statusData);
        console.debug("\nOrder ==>", data);
        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        console.error("Error updating order status:", error);
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
        console.debug(`Filter for search in order ==> ${JSON.stringify(filters, null, 2)}`)


        const data = await orderService.searchOrders(filters, pagination);
        console.debug("Order ==>", data);
        res.status(200).send({
            success: true,
            message: "Order fetched successfully",
            data
        });
        return;

    } catch (error) {
        console.error("Error searching orders:", error);
        next(error);
        return;
    }
};
