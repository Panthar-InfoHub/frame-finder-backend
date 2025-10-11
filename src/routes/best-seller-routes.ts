import { Router } from "express";
import { bestSellerController } from "../controllers/best-seller-controller.js";

export const bestSellerRouter = Router();

//Best seller : product type - vendor based - period ( will do at last )

bestSellerRouter.get("/search", bestSellerController.get_best_seller)
bestSellerRouter.post("/calculate", bestSellerController.development_calculate)