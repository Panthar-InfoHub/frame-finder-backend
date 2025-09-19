import { Router } from "express";
import { login, sendOtp, verifyOtp } from "../controllers/auth-controller.js";

export const authRouter = Router();

authRouter.post("/login", login)
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);