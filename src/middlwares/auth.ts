import jwt from "jsonwebtoken"
import { JwtPayload } from "../lib/uitils.js";
import { Admin } from "../models/Admin.js";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "./roleCheck.js";
import { Vendor } from "../models/Vendor.js";

interface resData {
    id: string,
    email: string,
    role: string
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn("No token provided")
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        let resData: resData = {
            id: "",
            email: "",
            role: ""
        }

        if (decoded.role === "ADMIN" || "SUPER_ADMIN") {
            const admin = await Admin.findById(decoded.id)
            console.log("Admin found ==> ", admin)
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }
            resData.id = admin._id.toString();
            resData.email = admin._email;
            resData.role = admin.role
        }

        if (decoded.role === "VENDOR") {
            const vendor = await Vendor.findById(decoded.id)
            if (!vendor) {
                return res.status(401).json({
                    success: false,
                    message: 'Vendor not found in auth middleware'
                });
            }
            resData.id = vendor._id.toString();
            resData.email = vendor.email;
            resData.role = vendor.role
        }

        // const  = await UserRepository.findById(decoded.id); --> For user

        // if (!user || !user.isActive) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid token or user not found'
        //     });
        // }

        req.user = {
            id: resData.id,
            email: resData.email,
            role: resData.role as UserRole
        };

        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired, please login again"
            });
        }

        console.error("Error in authjs ==> ", error)
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};