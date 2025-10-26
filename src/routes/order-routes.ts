import { Router } from "express";
import { createOrder, getOrderById, getUserOrders, searchOrders, updateOrderStatus } from "../controllers/order-controller.js";
import { auth } from "../middlwares/auth.js";

export const orderRouter = Router();

orderRouter.get("/search", [auth], searchOrders)

orderRouter.post("/", [auth], createOrder);
orderRouter.get("/my-order", [auth], getUserOrders)

orderRouter.put("/:id", [auth], updateOrderStatus)
orderRouter.get("/:id", [auth], getOrderById)