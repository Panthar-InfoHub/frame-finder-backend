import { Router } from "express";
import { getFrameData } from "../controllers/data-controller.js";
import { auth } from "../middlwares/auth.js";

export const dataRouter = Router();

dataRouter.get("/frame-data", [
    auth
], getFrameData)