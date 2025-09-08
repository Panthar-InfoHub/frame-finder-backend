import { Router } from "express";
import { addValueToVendorMisc, getVendorMiscValuesByVendor, removeValue } from "../controllers/vendor-misc-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
export const vendorMiscRouter = Router();
vendorMiscRouter.post('/:id', [
    auth,
    isVendor
], addValueToVendorMisc);
vendorMiscRouter.put('/:id', [
    auth,
    isVendor
], removeValue);
vendorMiscRouter.get('/:id', [
    auth,
], getVendorMiscValuesByVendor);
