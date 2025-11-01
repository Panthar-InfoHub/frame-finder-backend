import { Router } from "express";
import { CouponController } from "../controllers/coupon-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const couponRouter = Router();
const couponController = new CouponController();


couponRouter.get("/breakdown", [auth], couponController.breakDownCoupon);
couponRouter.get("/search", [auth], couponController.searchCoupon);
couponRouter.get("/:id", [auth], couponController.getCouponByID);

couponRouter.post("/", [auth, isVendor], couponController.createCoupon);
couponRouter.post("/verify", [auth], couponController.verifyCoupon);
couponRouter.put("/:id", [auth, isVendor], couponController.updateCoupon);
couponRouter.delete("/:id", [auth, isVendor], couponController.deleteCoupon)