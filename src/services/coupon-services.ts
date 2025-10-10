import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { Coupon } from "../models/coupon.js"
import { Order } from "../models/orders.js";
import { wishlistService } from "./wishlist-service.js";
import { create_order_items, discount_price } from "../lib/helper.js";

class CouponService {

    private isSameVendorItem = async (userId: string, vendorId: string): Promise<Boolean> => {
        const wishListItems = await wishlistService.getWishlistByUser(userId);
        const ordered_items = create_order_items(wishListItems);

        return ordered_items.every((item) =>
            item.vendorId.toString() === vendorId.toString()
        );

    }


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
        return {
            _id: coupon._id,
            code: coupon.code
        }
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
        const coupon = await Coupon.findById(couponId).populate("vendorId", "business_name business_owner");

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
        return {
            _id: coupon._id,
            code: coupon.code
        }
    };

    /**
        * Main coupon verification function
        * Pre verification coupon check for pre validation of coupon
        * Invalid code - expiry - is active - min order amount
    **/
    preVerifyCouponCheck = async (couponCode: string, orderAmount: number) => {
        const now = new Date();
        const couponBasic = await Coupon.findOne({
            code: couponCode.toUpperCase()
        }).lean();

        if (!couponBasic) {
            throw new AppError("Invalid coupon code", 404);
        }

        if (!couponBasic.is_active) {
            throw new AppError("This coupon is no longer active", 400);
        }

        if (couponBasic.exp_date < now) {
            throw new AppError("This coupon has expired", 400);
        }

        if (orderAmount < (couponBasic.min_order_limit ?? 0)) {
            throw new AppError(
                `Minimum order amount of ₹${couponBasic.min_order_limit ?? 0} required`,
                400
            );
        }
        return couponBasic;
    }

    /**
     * Main coupon verification function
     * Flow:
     * 1. Pre-verification: Basic checks (code, active, expired, min amount)
     * 2. User usage check: Via aggregation with user's order history
     * 3. Global usage check: Count total coupon usage across all users
     * 4. Scope validation: Global vs Vendor-specific logic
     * Assuming the order amount is coming correct from frontend either it won't work
    **/
    verifyCoupon = async (couponCode: string, userId: string, orderAmount: number) => {

        const preCoupon: any = await this.preVerifyCouponCheck(couponCode, orderAmount); //Pre check 
        const now = new Date();

        const result = await Coupon.aggregate([
            // 1: $match - Find the coupon
            // Output: Array with 1 coupon document or [] if somehow invalid
            {
                $match: {
                    code: couponCode.toUpperCase(),
                    is_active: true,
                    exp_date: { $gt: now },
                    min_order_limit: { $lte: orderAmount }
                }
            },

            // 2: $lookup - Join with Orders collection
            //  - If user used coupon 2 times: [{ total: 2 }] - If never used: []
            {
                $lookup: {
                    from: "orders",
                    let: {
                        couponCode: "$code"  // Pass coupon code to sub-pipeline
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ["$coupon_code", "$$couponCode"] },
                                        { $not: [{ $in: ["$order_status", ["cancelled"]] }] }
                                    ]
                                }
                            }
                        },
                        { $count: "total" }
                    ],
                    as: "userOrderHistory"
                }
            },

            // ------------------------------------------------------------
            // Stage 3: $addFields - Normalize usage count | userOrderHistory: [{ total: 2 }] → userUsageCount: 2 | userOrderHistory: [] → userUsageCount: 0
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

            // 4: $match - Filter by user usage limit
            {
                $match: {
                    $expr: {
                        $lt: ["$userUsageCount", "$user_usage_limit"]
                    }
                }
            },

            // 5: project the output
            {
                $project: {
                    _id: 1,
                    code: 1,
                    type: 1,
                    value: 1,
                    scope: 1,
                    usage_limit: 1,
                    user_usage_limit: 1,
                    userUsageCount: 1,
                    vendorId: 1,
                    min_order_limit: 1
                }
            }
        ]);


        if (!result.length) {
            throw new AppError(
                `You have already used this coupon ${preCoupon.user_usage_limit} time(s). Usage limit reached.`,
                400
            );
        }

        const coupon = result[0];

        // -: Check Global Usage Limit : This means the coupon has been used 45 times total (by all users)
        const global_usage = await Order.countDocuments({
            coupon_code: couponCode.toUpperCase(),
            order_status: { $nin: ['cancelled'] }
        });

        if (global_usage >= coupon.usage_limit) {
            console.warn("\n Invalid coupon code or user limit exceed ==> ", result);
            throw new Error("Coupon usage limit exceeded globally");
        };


        // -: Validate on Scope :
        if (coupon.scope === "global") {
            return {
                valid: true,
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    scope: 'global'
                },
                discount_price: discount_price(coupon.type, orderAmount, coupon.value),
                total_amount: orderAmount,
                message: "Coupon is applied to your entire order"
            };

        } else {

            return {
                valid: true,
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    scope: 'vendor',
                    vendorId: coupon.vendorId
                },
                discount_price: 0,
                total_amount: orderAmount,
                vendorId: coupon.vendorId,
                message: `Coupon will be applied to vendor products with vendor id ${coupon.vendorId}`
            };
        }
    };
}

export const couponService = new CouponService;