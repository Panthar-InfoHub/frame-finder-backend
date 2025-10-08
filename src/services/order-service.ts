import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { wishlistService } from "./wishlist-service.js";
import { Order } from "../models/orders.js";
import { userService } from "./user-services.js";
import { create_order_items } from "../lib/helper.js";


class OrderClass {
    async createOrder(userId: string, orderData: any) {

        const { tax, shipping_address, shipping_cost, discount, coupon_code } = orderData
        const session = await mongoose.startSession();

        try {
            const result = await session.withTransaction(async () => {

                console.debug("Getting wishlist of user...")

                //User and wishlist check : 
                // No user -> throw error of User not found 
                // No wishlist items --> Can't create empty order : Error of cart is empty 
                const user = await userService.getUserById(userId);
                if (!user) {
                    console.error("No user found for this user id ==> ", userId)
                    throw new AppError(`No user found for this user id ==> ${userId}`, 400);
                }

                const wishListItems = await wishlistService.getWishlistByUser(userId);
                if (wishListItems.length === 0) {
                    throw new AppError("Cart is empty, can't create order", 400);
                }

                //Modifying the items as per needed in order : adding snapshot and details
                const orderItems = create_order_items(wishListItems);
                console.debug(`\n Order items mapped properly for creation ==> ${JSON.stringify(orderItems, null, 2)}`)

                //Calculating cost : subtotal and total amount --> Create order
                const subTotal = orderItems.reduce((sum, item) => {
                    return sum + (item.price * item.quantity)
                }, 0);

                // Verify coupon code and calculate discount

                const totalAmount = (subTotal + tax + shipping_cost) - discount;
                console.debug(`Total amount ==> ${totalAmount}`)

                const order = new Order({
                    userId,
                    user_snapshot: {
                        email: user.email || "test_mail",
                        name: `${user.first_name} - ${user.last_name}` || "test_name",
                        phone: user.phone || "1200"
                    },
                    items: orderItems,
                    shipping_address,
                    total_amount: totalAmount,
                    tax,
                    coupon_code:
                        shipping_cost,
                    discount
                })

                await order.save({ session })
                await wishlistService.clearWishlist(userId);
                console.debug(`Order created successfully ==> ${order}`);
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
            .populate('payment_attempts') //Enable later
            .lean();

        if (!order) {
            throw new AppError("Order not found for the user", 404);
        }
        return order;
    }

    // Updated order : Status , tracking id's and Payment attempt
    async updateOrderStatus(orderId: string, statusData: any) {
        const { order_status, tracking_id, paymentAttemptId } = statusData;

        const updateFields: any = {};

        if (order_status) updateFields.orderStatus = order_status;
        if (tracking_id) updateFields.tracking_id = tracking_id;
        if (paymentAttemptId) updateFields.$push = { payment_attempts: paymentAttemptId };


        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: updateFields },
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
        if (status) query.order_status = status;
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
                // .populate('-payment_attempts')
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