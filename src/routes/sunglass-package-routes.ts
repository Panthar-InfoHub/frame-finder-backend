import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
import { LensPackageController } from "../controllers/lens-package-controller.js";
import { SunglassLensPackage } from "../models/sunglass-lens-package.js";

export const sunglassLensPackageRouter = Router();

const lensPackageController = new LensPackageController(SunglassLensPackage, "Sunglass Lens Package")


//public route
sunglassLensPackageRouter.get("/", [
    auth
], lensPackageController.getAllLensPackage)

sunglassLensPackageRouter.get("/:id", lensPackageController.getLensPackagebyID)

// Private Routes
sunglassLensPackageRouter.post("/", [auth, isVendor], lensPackageController.createLensPackage)
sunglassLensPackageRouter.put("/:id", [auth, isVendor], lensPackageController.updateLensPackage)
sunglassLensPackageRouter.delete("/:id", [auth, isVendor], lensPackageController.deleteLensPackage)