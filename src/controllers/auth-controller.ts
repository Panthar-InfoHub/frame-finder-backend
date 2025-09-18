import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { Admin } from "../models/Admin.js";
import { Vendor } from "../models/Vendor.js";
import { generateTokens } from "../lib/uitils.js";
import AppError from "../middlwares/Error.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { loginId, password, type } = req.body;
        console.log("Login request received:", req.body);

        if (!loginId || !password || !type) {
            console.warn("loginId, password, and type are required.");
            return res.status(400).send({
                success: false,
                message: "loginId, password, and type are required."
            });
        }

        let user: any = null;

        if (type === "ADMIN" || type === "SUPER_ADMIN") {
            user = await Admin.findOne({ email: loginId });

            console.log("Admin lookup result ==> ", user);

            if (!user) {
                console.warn("\nAdmin not found, check your credentials...");
                return res.status(401).send({
                    success: false,
                    message: "Admin not found, check your credentials..."
                });
            }

            const isPasswordCorrect = await user.comparePassword(password);

            if (!isPasswordCorrect) {
                console.warn("\nInvalid password, check your credentials...");
                return res.status(401).send({
                    success: false,
                    message: "Invalid password, check your credentials..."
                });
            }
        }

        if (type === "VENDOR") {
            user = await Vendor.findOne({ $or: [{ email: loginId }, { phone: loginId }] }).select("+password");;

            console.debug("Vendor lookup result ==> ", user);

            if (!user) {
                console.warn("\nVendor not found, check your credentials...");
                return res.status(401).send({
                    success: false,
                    message: "Vendor not found, check your credentials..."
                });
            }

            const isPasswordCorrect = await user.comparePassword(password);

            if (!isPasswordCorrect) {
                console.warn("\nInvalid password, check your credentials...");
                return res.status(401).send({
                    success: false,
                    message: "Invalid password, check your credentials..."
                });
            }
        }

        const { accessToken } = generateTokens({ email: user.email, id: user?._id, role: user?.role })
        const userRes = user.toObject();
        delete userRes.password;

        console.log("Login successful for user:", userRes);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    business_name: userRes.business_name,
                    business_owner: userRes.business_owner,
                    email: userRes.email,
                    _id: userRes._id
                },
                accessToken: accessToken
            }
        });
        return;

    } catch (error) {
        console.error("Error while logging in:", error);
        next(error);
        return;
    }
}

//Register : Send Otp and Verify Otp
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { phone } = req.body;
        console.debug("\nSend OTP request received for phone:", phone);

        if (!phone) {
            console.warn("Phone number is required.");
            return res.status(400).send({
                success: false,
                message: "Phone number is required."
            });
        }

        // Check if vendor with same phone number already exists or not
        const existingVendor = await Vendor.findOne({ phone, isActive: false });
        console.debug("Existing vendor check ==> ", existingVendor);
        if (existingVendor && existingVendor.phoneVerification && existingVendor.phoneVerification.isVerified) {
            console.warn("Phone number already in use.");
            throw new AppError("Phone number already in use.", 400);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashOtp = await bcrypt.hash(otp, 12);
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        const vendor = await Vendor.findOneAndUpdate(
            { phone },
            {
                $set: {
                    phone,
                    phoneVerification: { otp: hashOtp, otpExpires, isVerified: false }
                }
            },
            { upsert: true, new: true }
        );

        //Send OTP : future work
        console.debug(`OTP for phone ${phone} is ${otp} (valid for 5 minutes)`);

        res.status(200).send({
            success: true,
            message: "OTP sent successfully",
            data: vendor
        });
        return;

    } catch (error) {
        console.error("Error while sending OTP:", error);
        next(error);
        return;
    }
}
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, otp } = req.body;
        console.debug("\nVerify OTP request received for phone:", phone);

        if (!phone || !otp) {
            console.warn("Phone number and OTP are required.");
            throw new AppError("Phone number and OTP are required.", 400);
        }

        const result = await Vendor.verifyOtp(phone, otp);
        console.debug("OTP verification result ==> ", result);

        res.status(200).send({
            success: true,
            message: "OTP verified successfully",
            data: result
        });
        return;

    } catch (error) {
        console.error("Error while verifying OTP:", error);
        next(error);
        return;
    }
}