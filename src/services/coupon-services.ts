import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { Coupon } from "../models/coupon.js"
import { Order } from "../models/orders.js";

class CouponService {
    createCoupon = async (data: any) => {
        return await Coupon.create(data);
    };

    updateCoupon = async (data: any, couponId: string) => {
        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $set: data },
            { new: true }
        );

        if (!coupon) {
            console.error(`\nCoupon not found with id ==> ${couponId}`)
            throw new AppError(`Coupon not found with id ==> ${couponId}`, 404);
        }
        return coupon
    };

    searchCoupon = async (query: any, pagination: { limit: number, skip: number }) => {

        const { limit, skip } = pagination;

        const [coupons, totalCoupons] = await Promise.all([
            Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Coupon.countDocuments(query)
        ]);

        console.debug("\nFetched coupons: ", coupons);
        console.debug("\nTotal coupons count: ", totalCoupons);

        return {
            coupons,
            pagination: {
                limit,
                totalCoupons,
                pages: Math.ceil(totalCoupons / Number(limit))
            },
        };
    };

    getCouponById = async (couponId: string) => {
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            console.error(`\nCoupon not found with id ==> ${couponId}`)
            throw new AppError(`Coupon not found with id ==> ${couponId}`, 404);
        }
        return coupon
    };

    deleteCoupon = async (couponId: string) => {
        const coupon = await Coupon.findByIdAndDelete(couponId);

        if (!coupon) {
            console.error(`\nCoupon not found with id ==> ${couponId}`)
            throw new AppError(`Coupon not found with id ==> ${couponId}`, 404);
        }
        return coupon
    };

    verifyCoupon = async (couponCode: string, vendorId: string, userId: string, orderAmount: number) => {
        const now = new Date();

        // ========================================
        // -: Coupon Validation + User Usage Count
        const result = await Coupon.aggregate([
            // ============================================================
            // 1: $match - Find the valid coupon : Output will be array of valid coupon document or [] if nothing match
            {
                $match: {
                    code: couponCode.toUpperCase(),
                    vendorId: new mongoose.Types.ObjectId(vendorId),
                    is_active: true,
                    exp_date: { $gt: now },
                    min_order_limit: { $lte: orderAmount }
                }
            },
            // ============================================================
            // 2: $lookup - Like Join with Orders collection 
            // userOrderHistory: [{ total: 2 }]      // NEW FIELD from $lookup, User has used this coupon 2 times
            {
                $lookup: {
                    from: "orders",
                    let: {
                        couponCode: "$code",
                        vid: "$vendorId"
                    },
                    pipeline: [ //Pipeline for orders module
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ["$couponCode", "$$couponCode"] },
                                        { $not: { $in: ["$orderStatus", ["cancelled", "delivered"]] } }
                                    ]
                                }
                            }
                        },
                        // Count matching orders
                        { $count: "total" }
                    ],
                    as: "userOrderHistory"
                }
            },
            // ============================================================
            // 3: $addFields - Extract count into clean field 
            // Normalize the output of userOrderHistory --> {userUsageCount : 2}
            {
                $addFields: {
                    userUsageCount: {
                        $ifNull: [
                            { $arrayElemAt: ["$userOrderHistory.total", 0] },
                            0
                        ]
                    }
                }
            },
            // ============================================================
            // 4: $match - Validate user hasn't exceeded limit
            // Compare with user_usage_limit with userUsageCount: If less than then pass
            // if more pass an empty array : []
            {
                $match: {
                    $expr: {
                        $lt: ["$userUsageCount", "$user_usage_limit"]
                    }
                }
            },

            // ============================================================
            // 5: $project the output
            {
                $project: {
                    _id: 1,
                    code: 1,
                    type: 1,
                    value: 1,
                    usage_limit: 1,
                    user_usage_limit: 1,
                    userUsageCount: 1, // Amount of time user used it
                    vendorId: 1
                }
            }
        ]);

        // Check if coupon validation passed
        if (!result.length) {
            console.warn("\n Invalid coupon code or user limit exceed ==> ", result);
            throw new Error("Invalid coupon or user usage limit exceeded");
        }

        // -: Check Global Usage Limit : This means the coupon has been used 45 times total (by all users)
        const global_usage = await Order.countDocuments({
            coupon_code: couponCode.toUpperCase(),
            ["items.vendorId"]: new mongoose.Types.ObjectId(vendorId),
            order_status: { $nin: ['cancelled'] }
        });

        if (global_usage >= result[0].usage_limit) {
            console.warn("\n Invalid coupon code or user limit exceed ==> ", result);
            throw new Error("Coupon usage limit exceeded globally");
        };

        return {
            coupon: result[0],
            global_usage: global_usage,
            remain_usage: result[0].usage_limit - global_usage,
            user_remaining_uses: result[0].user_usage_limit - result[0].userUsageCount
        };
    };
}

export const couponService = new CouponService;