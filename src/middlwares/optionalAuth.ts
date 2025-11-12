import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../lib/uitils.js";
import { Admin } from "../models/Admin.js";
import { User } from "../models/user.js";
import { Vendor } from "../models/Vendor.js";
import { UserRole } from "./roleCheck.js";

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return next(); // no user data but continue gracefully
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    let user;

    if (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN") {
      user = await Admin.findById(decoded.id);
    } else if (decoded.role === "VENDOR") {
      user = await Vendor.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role as UserRole,
      };
    }
    next();
  } catch (error) {
    // Log error but don't block request
    console.error("optionalAuth error:", error);
    next();
  }
};

