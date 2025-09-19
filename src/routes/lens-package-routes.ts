import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { getAllLensPackage, createLensPackage, deleteLensPackage, updateLensPackage, getLensPackagebyID } from "../controllers/lens-package-controller.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const lensPackageRouter = Router();

//public route
lensPackageRouter.get("/", [
    // auth
], getAllLensPackage)

lensPackageRouter.get("/:id", getLensPackagebyID)

// Private Routes
lensPackageRouter.post("/", [auth, isVendor], createLensPackage)
lensPackageRouter.put("/:id", [auth, isVendor], updateLensPackage)
lensPackageRouter.delete("/:id", [auth, isVendor], deleteLensPackage)