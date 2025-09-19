import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isAdmin, isVendor } from "../middlwares/roleCheck.js";
import { createAccessories, deleteAccessories, getAccessorieByID, getAllAccessories, updateAccessories, updateAccessoriesStock } from "../controllers/accessories-controller.js";

export const accessoriesRouter = Router();

//Create Product 
accessoriesRouter.post("/", [
    auth,
    isVendor
], createAccessories)

//Update product details except stock
accessoriesRouter.put("/:id", [
    auth,
    isVendor
], updateAccessories)

//Update product stock
accessoriesRouter.put("/:id/stock", [
    auth,
    isVendor
], updateAccessoriesStock)

//get all products
accessoriesRouter.get("/", [
    // auth,
], getAllAccessories)

//get product by id
accessoriesRouter.get("/:id", [
    // auth,
], getAccessorieByID)

//delete product
accessoriesRouter.delete("/:id", [
    auth,
    isAdmin
], deleteAccessories)