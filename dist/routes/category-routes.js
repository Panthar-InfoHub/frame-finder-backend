import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isSuperAdmin } from "../middlwares/roleCheck.js";
import { createCategory, deleteCategory, getAllCategories, getAllSubcategories, updateCategory } from "../controllers/category-controller.js";
export const categoryRouter = Router();
// Create Category or Subcategory
categoryRouter.post("/", [
    auth,
    isSuperAdmin
], createCategory);
//Get All Category
categoryRouter.get("/all", getAllCategories);
//Get All Subcategory from category Id
categoryRouter.get("/all-sub/:id", getAllSubcategories);
//Update Category 
categoryRouter.put("/:id", [
    auth,
    isSuperAdmin
], updateCategory);
//Delete Category
categoryRouter.delete("/:id", [
    auth,
    isSuperAdmin
], deleteCategory);
