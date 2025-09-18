import jwt from "jsonwebtoken"
import { JwtPayload } from "../lib/uitils.js";
import { Admin } from "../models/Admin.js";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "./roleCheck.js";
import { Vendor } from "../models/Vendor.js";
import AppError from "./Error.js";

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

        console.debug("\n Decoded data ==> ", decoded)

       let user; // This will hold either an Admin or a Vendor document

        if (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN") {
            user = await Admin.findById(decoded.id);
        } else if (decoded.role === "VENDOR") {
            user = await Vendor.findById(decoded.id);
        } else {
            throw new AppError('Unsupported user role in token.', 401);
        }

        if (!user) {
            throw new AppError('The user belonging to this token no longer exists.', 401);
        }

        resData.id = user._id.toString();
        resData.email = user.email;
        resData.role = user.role;

        console.debug("User data from token ==> ", resData)

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