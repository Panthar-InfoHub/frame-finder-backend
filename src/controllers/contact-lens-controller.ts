// controllers/ContactLensController.ts
import { NextFunction, Request, Response } from "express";
import { ContactLensService } from "../services/contact-lens-service.js";
import AppError from "../middlwares/Error.js";

type ProductType = 'contact_lens' | 'contact_lens_color';

const contactLensService = new ContactLensService();

export const createContactLensProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params as { type: ProductType };
        const productData = req.body;

        console.debug(`Creating ${type} with data:`, productData);

        if (!productData || Object.keys(productData).length === 0) {
            throw new AppError("Product data is required", 400);
        }

        if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role!)) {
            if (req.user && req.user.id) {
                productData.vendorId = req.user.id;
            }
        }

        const product = await contactLensService.createProduct(type, productData);

        console.debug(`${type} created successfully:`, product);

        res.status(201).send({
            success: true,
            message: `${type} created successfully`,
            data: product
        });
        return;
    } catch (error) {
        console.error(`Error creating ${req.params.type}:`, error);
        next(error);
        return;
    }
};

export const getAllContactLensProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params as { type: ProductType };

        // For path parameters version
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;

        const search = req.query.search as string || "";

        const result = await contactLensService.getAllProducts(type, page, limit, search);
        console.debug(`\nTotal products ==> ${result.products}`)
        console.debug(`\n Products pagination details ==> ${result.pagination}`)

        res.status(200).send({
            success: true,
            message: `${type} products fetched successfully`,
            data: {
                products: result.products,
                pagination: result.pagination
            }
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.type}:`, error);
        next(error);
    }
};

export const getContactLensProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params as { type: ProductType; id: string };

        console.debug(`Fetching ${type} with ID: ${id}`);

        if (!id) {
            throw new AppError("Product ID is required", 400);
        }

        const product = await contactLensService.getProductById(type, id);

        console.debug(`Fetched ${type}:`, product);

        res.status(200).send({
            success: true,
            message: `${type} fetched successfully`,
            data: product
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.type} by ID:`, error);
        next(error);
    }
};

export const updateContactLensProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params as { type: ProductType; id: string };
        const updateData = req.body;

        console.debug(`Updating ${type} with ID: ${id}`, updateData);

        if (!id) {
            throw new AppError("Product ID is required", 400);
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new AppError("Update data is required", 400);
        }

        if(updateData.stock){
            delete updateData.stock
        }

        const product = await contactLensService.updateProduct(type, id, updateData);

        console.debug(`\nUpdated ${type}:`, product);

        res.status(200).send({
            success: true,
            message: `${type} updated successfully`,
            data: product
        });
    } catch (error) {
        console.error(`Error updating ${req.params.type}:`, error);
        next(error);
    }
};

// Add this to ContactLensController.ts
export const updateContactLensProductStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params as { type: ProductType; id: string };
        const { operation, quantity } = req.body;

        console.debug(`\nUpdating stock for ${type} with ID: ${id}`);
        console.debug("Operation: ", operation, " Quantity: ", quantity);

        if (!id) {
            throw new AppError("Product ID is required", 400);
        }

        const product = await contactLensService.updateProductStock(type, id, operation, quantity);

        console.debug(`\nUpdated ${type} stock:`, product);

        res.status(200).send({
            success: true,
            message: `${type} stock updated successfully`,
            data: product
        });
    } catch (error) {
        console.error(`Error updating ${req.params.type} stock:`, error);
        next(error);
    }
};


export const deleteContactLensProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, id } = req.params as { type: ProductType; id: string };

        console.debug(`Deleting ${type} with ID: ${id}`);

        if (!id) {
            throw new AppError("Product ID is required", 400);
        }

        await contactLensService.deleteProduct(type, id);

        console.debug(`${type} deleted successfully`);

        res.status(200).send({
            success: true,
            message: `${type} deleted successfully`
        });
    } catch (error) {
        console.error(`Error deleting ${req.params.type}:`, error);
        next(error);
    }
};
