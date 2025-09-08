import { Router } from "express";
import { createSunglass, deleteSunglass, getAllSunglass, getSunglassById, updateSunglass, updateSunglassStock } from "../controllers/sunglass-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const sunglassRouter = Router();

// Sunglasses Routes with Authentication access for Create, Update and Delete Operation
//Create Sunglass 
sunglassRouter.post("/", [
    auth,
    isVendor
], createSunglass)

//Update Sunglass details except stock
sunglassRouter.put("/:id", [
    auth,
    isVendor
], updateSunglass)

//Update Sunglass stock
sunglassRouter.put("/:id/stock", [
    auth,
    isVendor
], updateSunglassStock)

//get all Sunglasss
sunglassRouter.get("/", [
    // auth,
], getAllSunglass)

//get Sunglass by id
sunglassRouter.get("/:id", [
    // auth,
], getSunglassById)

//delete Sunglass
sunglassRouter.delete("/:id", [
    auth,
    isVendor
], deleteSunglass)