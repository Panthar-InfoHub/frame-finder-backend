import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
import { getAllLensPackage, createLensPackage, deleteLensPackage, updateLensPackage, getSunGlassLensPackagebyID } from "../controllers/sunglass-package-controller.js";

export const sunglassLensPackageRouter = Router();

//public route
sunglassLensPackageRouter.get("/", [
    // auth
], getAllLensPackage)

sunglassLensPackageRouter.get("/:id" , getSunGlassLensPackagebyID)

// Private Routes
sunglassLensPackageRouter.post("/", [auth, isVendor], createLensPackage)
sunglassLensPackageRouter.put("/:id", [auth, isVendor], updateLensPackage)
sunglassLensPackageRouter.delete("/:id", [auth, isVendor], deleteLensPackage)