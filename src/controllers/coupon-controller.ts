import { NextFunction, Request, Response } from "express";
import { couponService } from "../services/coupon-services.js";

export class CouponController {
    createCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            console.debug(`\n Coupon requestd body ==> ${data}`);

            const vendorId = req.user?.id!;
            data.vendorId = vendorId;

            const coupon = await couponService.createCoupon(data);
            console.debug("\n Coupon created successfully: ", coupon);

            return res.status(201).send({
                success: true,
                message: 'Coupon created successfully',
                data: coupon
            });

        } catch (error) {
            console.error("Error creating coupon ==> ", error);
            next(error);
            return;
        }
    }

    updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const couponId = req.params.id as string;
            const data = req.body;
            console.debug(`\n Coupon Id to update ==> ${couponId}`);
            console.debug(`\n Coupon requestd body ==> ${data}`);

            const coupon = await couponService.updateCoupon(data, couponId)
            console.debug("\n Coupon updated successfully: ", coupon);

            return res.status(200).send({
                success: true,
                message: 'Coupon updated successfully',
                data: coupon
            });

        } catch (error) {
            console.error("Error while updating coupon ==> ", error);
            next(error);
            return;
        }
    }

    //Search via :
    // search query params : Coupon code for now 
    //vendor id query params : Search via vendor id 
    //Page and Limit query params to control the limit of content
    searchCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const search = req.query.search as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const vendorId = parseInt(req.query.vendorId as string);

            const skip: number = (page - 1) * limit;

            console.debug("\n Search query for coupon : ", req.query);
            let query: any = {};
            if (search) {
                query.$text = search
            };
            if (vendorId) query.vendorId = vendorId;

            const data = await couponService.searchCoupon(query, { limit, skip })

            return res.status(200).send({
                success: true,
                message: 'Coupon searched successfully',
                data
            });

        } catch (error) {
            console.error("Error while searching coupon ==> ", error);
            next(error);
            return;
        }
    }

    getCouponByID = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const couponId = req.params.id as string;
            console.debug(`\n Coupon Id to fetch ==> ${couponId}`);

            const coupon = await couponService.getCouponById(couponId)
            console.debug("\n Coupon fetched successfully: ", coupon);

            return res.status(200).send({
                success: true,
                message: 'Coupon fetched successfully',
                data: coupon
            });

        } catch (error) {
            console.error("Error while fetching coupon by id ==> ", error);
            next(error);
            return;
        }
    }

    deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const couponId = req.params.id as string;
            console.debug(`\n Coupon Id to delete ==> ${couponId}`);

            const coupon = await couponService.deleteCoupon(couponId)
            console.debug("\n Coupon deleted successfully: ", coupon);

            return res.status(200).send({
                success: true,
                message: 'Coupon deleted successfully',
                data: coupon._id
            });

        } catch (error) {
            console.error("Error while deleting coupon by id ==> ", error);
            next(error);
            return;
        }
    }


    verifyCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { couponCode, orderAmount } = req.body;
            console.debug("\n Requested body ==> ", req.body);

            const userId = req.user?.id!;

            const verify_coupon = await couponService.verifyCoupon(couponCode, userId, orderAmount);
            console.debug("\n Verify coupon ==> ", verify_coupon);

            return res.status(200).send({
                success: true,
                message: verify_coupon.message,
                data: {
                    valid: verify_coupon.valid,
                    coupon: verify_coupon.coupon,
                    discount_price: verify_coupon.discount_price,
                    total_amount: verify_coupon.total_amount,
                }
            });

        } catch (error) {
            console.error("Error while verifying coupon ==> ", error);
            next(error);
            return;
        }
    }
}