import { NextFunction, Request, Response } from "express";
import { Admin } from "../models/Admin.js";
import { Vendor } from "../models/Vendor.js";
import { generateTokens } from "../lib/uitils.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email, password, type } = req.body;
        console.log("Login request received:", req.body);

        if (!email || !password || !type) {
            console.warn("Email, password, and type are required.");
            return res.status(400).send({
                success: false,
                message: "Email, password, and type are required."
            });
        }

        let user: any = null;

        if (type === "ADMIN" || type === "SUPER_ADMIN") {
            user = await Admin.findOne({ email });

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
            user = await Vendor.findOne({ email });

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

        const { accessToken } = generateTokens({ email, id: user?._id, role: user?.role })
        const userRes = user.toObject();
        delete userRes.password;

        console.log("Login successful for user:", userRes);

        res.status(200).json({
            success: true,
            data: {
                user: userRes,
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

//Register : Register will be Create that specified role like 
// Register admin = create admin
// Register vendor = create vendor