import { Router } from "express";
import { webHookHandler } from "../webhook/razorpay.js";

export const webhookRouter = Router();

webhookRouter.post("/rzp-ff-000", webHookHandler);