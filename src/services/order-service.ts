import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { wishlistService } from "./wishlist-service.js";
import { Order } from "../models/orders.js";


class OrderClass {
    async createOrder(userId: string, orderData: any) {

        const { tax, shipping_address, shippingCost, discount } = orderData
        const session = await mongoose.startSession();

        try {
            const result = await session.withTransaction(async () => {

                console.debug("Getting wishlist of user...")
                const wishListItems = await wishlistService.getWishlistByUser(userId);
                if (wishListItems.length === 0) {
                    throw new AppError("Cart is empty, can't create order", 400);
                }

                const orderItems = wishListItems.map((item) => ({
                    productId: item.product.vendorId,
                    onModel: item.onModel,
                    variantId: item.variant._id,
                    vendorId: item.product.vendorId,
                    productName: item.product.brand_name,
                    price: item.variant.price.base_price,
                    quantity: item.quantity,
                    prescription: item.prescription,
                    lens_package_detail: item.lens_package_detail
                }))

                console.debug(`\n Order items mapped properly for creation ==> ${JSON.stringify(orderItems, null, 2)}`)

                const subTotal = orderItems.reduce((sum, item) => {
                    return sum + (item.price * item.quantity)
                }, 0);
                const totalAmount = (subTotal + tax + shippingCost) - discount;
                console.debug(`Total amount ==> ${totalAmount}`)

                const order = new Order({
                    userId,
                    items: orderItems,
                    shipping_address,
                    totalAmount,
                    tax,
                    shippingCost,
                    discount
                })

                await order.save({ session })
                console.debug(`Order created successfully ==> ${order}`);

                await wishlistService.clearWishlist(userId);
                console.debug(`\n Wishlist cleared of user after order creation...`)

                return order;
            })
            return result;

        } catch (error) {
            throw error;
        } finally {
            await session.endSession()
        }
    }

    //Orders by User ID
    async getUserOrders(user: any, pagination: { page: Number, limit: Number }) {
        const { page, limit } = pagination;
        const userId = new mongoose.Types.ObjectId(user);

        const [orders, total] = await Promise.all([
            Order.find({ userId })
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                // .populate('paymentAttempts')
                .lean(),
            Order.countDocuments()
        ])

        console.debug("Orders ===> ", orders)

        return {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        };
    }

    //Specific Order by ID
    async getOrderById(orderId: string, userId: string) {
        const filter: any = { _id: orderId, userId };

        const order = await Order.findOne(filter)
            // .populate('paymentAttempts') //Enable later
            .lean();

        if (!order) {
            throw new AppError("Order not found for the user", 404);
        }
        return order;
    }

    async updateOrderStatus(orderId: string, statusData: any) {
        const { orderStatus, tracking_id, paymentAttemptId } = statusData;

        const updateFields: any = {};

        if (orderStatus) updateFields.orderStatus = orderStatus;
        if (tracking_id) updateFields.tracking_id = tracking_id;
        if (paymentAttemptId) updateFields.$push = { paymentAttempts: paymentAttemptId };


        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            throw new AppError("Order not found...", 404);
        }

        return updatedOrder;
    }

    // Admin search with filters
    async searchOrders(filters: any, pagination: any = {}) {
        const { page = 1, limit = 20 } = pagination;
        const { vendorId, status, userId, startDate, endDate, searchTerm } = filters;

        const query: any = {};

        if (searchTerm) {
            query.$text = { $search: searchTerm };
        }

        if (vendorId) query["items.vendorId"] = vendorId;
        if (status) query.orderStatus = status;
        if (userId) query.userId = userId;

        // Date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [orders, totalCount] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                // .populate('paymentAttempts')
                .lean(),
            Order.countDocuments(query)
        ])

        return {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalCount,
                pages: Math.ceil(totalCount / Number(limit))
            },
        };
    }
}

export const orderService = new OrderClass();