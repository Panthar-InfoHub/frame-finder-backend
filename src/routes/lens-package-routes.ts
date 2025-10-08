import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
import { LensPackage } from "../models/frame-lens-package.js";
import { LensPackageController } from "../controllers/lens-package-controller.js";

export const lensPackageRouter = Router();

const lensPackageController = new LensPackageController(LensPackage, "Lens Package")

//public route
lensPackageRouter.get("/", [
    auth
], lensPackageController.getAllLensPackage)

lensPackageRouter.get("/:id", lensPackageController.getLensPackagebyID)

// Private Routes
lensPackageRouter.post("/", [auth, isVendor], lensPackageController.createLensPackage)
lensPackageRouter.put("/:id", [auth, isVendor], lensPackageController.updateLensPackage)
lensPackageRouter.delete("/:id", [auth, isVendor], lensPackageController.deleteLensPackage)