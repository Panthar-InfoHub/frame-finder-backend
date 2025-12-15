import { Router } from "express";
import { login, resetPassword, userPhoneVerified, verifyOtp } from "../controllers/auth-controller.js";
import { auth } from "../middlwares/auth.js";

export const authRouter = Router();

authRouter.post("/login", login)
authRouter.post('/verify-user', userPhoneVerified);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/reset', auth, resetPassword);