import { Router } from "express";
import { createVendor, deleteVendor, getAllVendors, getVendorById, updateVendor } from "../controllers/vendor-controller.js";
import { auth } from "../middlwares/auth.js";
import { isSuperAdmin, isVendor } from "../middlwares/roleCheck.js";

export const vendorRouter = Router();

vendorRouter.post("/", [
    // auth,
    // isVendor
], createVendor)

//Get all vendor
vendorRouter.get("/all", [
    auth,
    isVendor
], getAllVendors)

//Get vendor by ID
vendorRouter.get("/:id", [
    auth,
    isVendor
], getVendorById)

//Update Vendor
vendorRouter.put("/:id", [
    auth,
    isVendor
], updateVendor)

//Delete Vendor
vendorRouter.delete("/:id", [
    auth,
    isSuperAdmin
], deleteVendor)