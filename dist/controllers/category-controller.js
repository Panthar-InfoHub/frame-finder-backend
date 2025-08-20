import { categoryService } from "../services/category-service.js";
import { Category } from "../models/categories.js";
export const createCategory = async (req, res, next) => {
    try {
        console.debug("\n Creating category ==> ", req.body);
        const category = await categoryService.createCategory(req.body);
        console.debug("\ncategory created ==> ", category);
        res.status(201).send({
            success: true,
            message: "Category created successfully",
            data: category
        });
        return;
    }
    catch (error) {
        console.error("Error creating category:", error);
        next(error);
        return;
    }
};
export const getAllCategories = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let filter = { isActive: true, parentId: null };
        const [categories, totalCount] = await Promise.all([
            Category.find(filter).skip(skip).limit(limit).populate("parentId", 'name icon'),
            Category.countDocuments(filter)
        ]);
        console.debug("\nFetched categories: ", categories);
        console.debug("\nTotal categories count: ", totalCount);
        res.status(200).send({
            success: true,
            message: "Categories fetched successfully",
            data: categories,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                page,
                limit
            }
        });
        return;
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        next(error);
        return;
    }
};
export const getAllSubcategories = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.debug("\nFetching subcategories for category ID:", id);
        if (!id) {
            console.warn("No category ID provided");
            res.status(400).send({ success: false, message: "Category ID is required" });
            return;
        }
        const subcategories = await Category.find({ parentId: id, isActive: true }).populate("parentId", 'name icon');
        console.debug("Fetched subcategories:", subcategories);
        res.status(200).send({
            success: true,
            message: "Subcategories fetched successfully",
            data: subcategories
        });
        return;
    }
    catch (error) {
        console.error("Error fetching subcategories:", error);
        next(error);
        return;
    }
};
export const updateCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            console.warn("No category ID provided");
            res.status(400).send({ success: false, message: "Category ID is required" });
            return;
        }
        console.debug("Updating category with ID:", id);
        const updatedData = req.body;
        console.debug("\n Updated data for category ==>", updatedData);
        const category = await categoryService.findCategoryByIdandUpdate(id, updatedData);
        if (!category) {
            console.warn("Category not found with ID:", id);
            res.status(404).send({ success: false, message: "Category not found" });
            return;
        }
        console.debug("\nCategory updated successfully: ", category);
        res.status(200).send({
            success: true,
            message: "Category updated successfully",
            data: category
        });
        return;
    }
    catch (error) {
        console.error("Error updating category:", error);
        next(error);
    }
};
export const deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            console.warn("No category ID provided");
            res.status(400).send({ message: "Category ID is required" });
            return;
        }
        console.debug("Deleting category with ID:", id);
        //Checking if it's a parent category and have children
        const hasChildren = await Category.exists({ parentId: id, isActive: true });
        if (hasChildren) {
            console.warn("\nCannot delete category with children");
            return res.status(400).send({ success: false, message: "Cannot delete a category that has subcategories." });
        }
        const category = await categoryService.findCategoryByIdandUpdate(id, { isActive: false });
        if (!category) {
            console.warn("Category not found with ID:", id);
            res.status(404).send({ success: false, message: "Category not found" });
            return;
        }
        console.debug("\nCategory deleted successfully: ", category);
        res.status(200).send({
            success: true,
            message: "Category deleted successfully",
            data: category
        });
        return;
    }
    catch (error) {
        console.error("Error deleting category:", error);
        next(error);
    }
};
