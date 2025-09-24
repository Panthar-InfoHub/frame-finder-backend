import { Router } from "express";
import { login, sendOtp, userPhoneVerified, verifyOtp } from "../controllers/auth-controller.js";

export const authRouter = Router();

authRouter.post("/login", login)
authRouter.post('/verify-user', userPhoneVerified);
authRouter.post('/verify-otp', verifyOtp);