import { Router } from "express";
import { LensSolutionController } from "../controllers/lens-solution-controller.js";
import { LensSolution } from "../models/lens-solution.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const lensSolutionRouter = Router();
const lensSolution = new LensSolutionController(LensSolution, "Lens Solution")

//Create Lens Solution 
lensSolutionRouter.post("/", [auth, isVendor], lensSolution.createLensSolution)

//Update Lens Solution details except stock
lensSolutionRouter.put("/:id", [auth, isVendor], lensSolution.updateLensSolution)

//Update Lens Solution vairant stock
lensSolutionRouter.put("/:id/stock", [auth, isVendor], lensSolution.updateVariantStock)

//get all Lens Solution
lensSolutionRouter.get("/", lensSolution.getAllLensSolutions)

//get Lens Solution by id
lensSolutionRouter.get("/:id", lensSolution.getLensSolutionById)

//delete Lens Solution
lensSolutionRouter.delete("/:id", [auth, isVendor], lensSolution.deleteLensSolution)