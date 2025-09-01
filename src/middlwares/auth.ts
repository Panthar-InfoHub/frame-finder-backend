import jwt from "jsonwebtoken"
import { JwtPayload } from "../lib/uitils.js";
import { Admin } from "../models/Admin.js";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "./roleCheck.js";

interface resData {
    id: string,
    email: string,
    role: string
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['accessToken']
        if (!token) {
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

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }
            resData.id = admin._id;
            resData.email = admin._email;
            resData.role = admin.role
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
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};