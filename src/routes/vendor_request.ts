import { Router } from "express";
import { createVendorRequest, deleteVendorReq, updateRequestStatus, getVendorReq, getAllVendorRequest } from "../controllers/vendor-req-controller.js";
import { isSuperAdmin } from "../middlwares/roleCheck.js";
import { auth } from "../middlwares/auth.js";

export const vendorRequestRoutes = Router();

//Create vendor request
vendorRequestRoutes.post("/", createVendorRequest);

//Get all vendor requests
vendorRequestRoutes.get("/", [
    auth,
    isSuperAdmin
], getAllVendorRequest);

//Update vendor request status
vendorRequestRoutes.put("/update-status/:id", [
    auth,
    isSuperAdmin
], updateRequestStatus)

//Delete vendor request
vendorRequestRoutes.delete("/:id", [
    auth,
    isSuperAdmin
], deleteVendorReq)

//Get particular vendor request
vendorRequestRoutes.get("/:id", [
    auth,
    isSuperAdmin
], getVendorReq)