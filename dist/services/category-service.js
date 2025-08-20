import { Category } from "../models/categories.js";
class CategoryClass {
    async createCategory(data) {
        try {
            console.debug("\n Creating category ==> ", data);
            return await Category.create(data);
        }
        catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    }
    async findCategoryByIdandUpdate(id, updateData) {
        try {
            console.debug("Finding category by ID in category service:", id);
            return await Category.findByIdAndUpdate(id, updateData, { new: true });
        }
        catch (error) {
            console.error("Error finding category by ID:", error);
            throw error;
        }
    }
}
export const categoryService = new CategoryClass();
