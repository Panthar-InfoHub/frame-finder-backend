import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct, updateVariantStock } from "../controllers/product-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const productRouter = Router();

//Create Product 
productRouter.post("/", [
    auth,
    isVendor
], createProduct)

//Update product details except stock
productRouter.put("/:id", [
    auth,
    isVendor
], updateProduct)

//Update product stock
productRouter.put("/:id/stock", [
    auth,
    isVendor
], updateVariantStock)

//get all products
productRouter.get("/", [
    // auth,
], getAllProducts)

//get product by id
productRouter.get("/:id", [
    // auth,
], getProductById)

//delete product
productRouter.delete("/:id", [
    auth,
    isVendor
], deleteProduct)