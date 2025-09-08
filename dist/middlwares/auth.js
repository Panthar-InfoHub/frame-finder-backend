import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn("No token provided");
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let resData = {
            id: "",
            email: "",
            role: ""
        };
        if (decoded.role === "ADMIN" || "SUPER_ADMIN") {
            const admin = await Admin.findById(decoded.id);
            console.log("Admin found ==> ", admin);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }
            resData.id = admin._id;
            resData.email = admin._email;
            resData.role = admin.role;
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
            role: resData.role
        };
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired, please login again"
            });
        }
        console.error("Error in authjs ==> ", error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
