import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { reviewController } from "../controllers/review-controller.js";

export const reviewRouter = Router();


reviewRouter.post("/", [auth], reviewController.create_review);
reviewRouter.put("/:id", [auth], reviewController.update_review);
reviewRouter.delete("/:id", [auth], reviewController.delete_review);

// === Get Data ===
reviewRouter.get("/user/:id", reviewController.get_user_reviews);
reviewRouter.get("/product/:id", reviewController.get_product_reviews);