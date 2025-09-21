import { Router } from "express";
import { getVendorProductCounts } from "../controllers/vendor-analytics.controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const vendorAnalyticRouter = Router();

vendorAnalyticRouter.get("/product-count", [auth, isVendor], getVendorProductCounts)

