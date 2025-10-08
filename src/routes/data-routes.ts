import { Router } from "express";
import { getFrameData, getLensData, getSunGlsLensData } from "../controllers/data-controller.js";
import { auth } from "../middlwares/auth.js";

export const dataRouter = Router();

dataRouter.get("/frame-data", [
    auth
], getFrameData)

dataRouter.get("/lens-data", [auth], getLensData)

dataRouter.get("/sunglass-lens-data", [auth], getSunGlsLensData)