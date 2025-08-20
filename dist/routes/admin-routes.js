import { Router } from "express";
import { isSuperAdmin } from "../middlwares/roleCheck.js";
import { loginAdmin, registerAdmin } from "../controllers/admin-controller.js";
export const adminRoutes = Router();
adminRoutes.post("/login", loginAdmin);
adminRoutes.post("/register", [
    isSuperAdmin
], registerAdmin);
