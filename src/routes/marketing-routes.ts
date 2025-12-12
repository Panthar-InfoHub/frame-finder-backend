import { Router } from "express";
import { isVendor } from "../middlwares/roleCheck.js";
import { auth } from "../middlwares/auth.js";
import { createMarketingForm, updateMarketingForm, searchMarketingForm, getMarketingFormById } from "../controllers/marketing-controller.js";

export const marketingRouter = Router();

marketingRouter.get("/", [auth, isVendor], searchMarketingForm);
marketingRouter.post("/", [auth, isVendor], createMarketingForm);
marketingRouter.get("/:id", [auth, isVendor], getMarketingFormById);
marketingRouter.put("/:id", [auth, isVendor], updateMarketingForm);