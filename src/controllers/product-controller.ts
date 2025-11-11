import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import { Product } from "../models/products.js";
import { ProductService } from "../services/product-service.js";
import { buildProductFilter } from "../lib/helper.js";
import { ProductQuery } from "../lib/types.js";
import logger from "../lib/logger.js";

const productService = new ProductService(Product, "Product");


export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let productData = req.body;

        if (!productData || Object.keys(productData).length === 0) {
            console.warn("No product data provided");
            throw new AppError("Product data is required", 400);
        }

        if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
            if (req.user && req.user.id) {
                productData.vendorId = req.user.id;
            }
        }

        console.debug("\nProduct data received for creation ==> ", productData);

        //Calculate price of product
        if (productData.variants) {
            productData.variants.forEach((variant: any) => {
                variant.price = {
                    base_price: variant.price.base_price,
                    mrp: variant.price.mrp,
                    shipping_price: variant.price.shipping_price,
                    total_price: variant.price.shipping_price.custom === true ? variant.price.shipping_price.base_price : variant.price.base_price + variant.price.shipping_price.value
                }
            });
        }

        logger.debug("Product data after price calculation ==> ", productData);

        const product = await productService.create(productData);

        console.debug("\nProduct created successfully: ", product);

        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            data: product
        });
        return;
    } catch (error) {
        console.error("Error creating product ==> ", error);
        next(error);
        return;
    }
}

//Update product except stock
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;

        console.debug(`Updating product with ID: ${productId}`);
        console.debug("\n Updating data => ", updateData)
        if (!productId) {
            console.warn("No product ID provided");
            throw new AppError("Product ID is required", 400);
        }

        //check if update Data have variants and if they have stock or not ??
        if (updateData.variants) {
            updateData.variants.forEach((variant: any) => {
                console.debug("\n Checking if variant have stock or not => ", variant)
                if (variant.stock) delete variant.stock
            });
        }

        logger.debug("Updating data: ", updateData);

        const product = await productService.update(productId, updateData);

        console.debug("Updated product ==> ", product);
        res.status(200).send({
            success: true,
            message: "Product updated successfully",
            data: product
        });
        return;

    } catch (error) {
        console.error("Error updating product: ", error);
        next(error);
        return;
    }
}

//Update stock of product variant
export const updateVariantStock = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const productId = req.params.id;
        const { operation, quantity, variantId } = req.body;

        console.debug(`Updating stock for product with ID: ${productId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!productId) {
            console.warn("No vairant ID provided");
            throw new AppError("Variant ID is required", 400)
        }

        if (!operation || !quantity || !variantId) {
            console.warn("Operation, variant id and quantity are required");
            throw new AppError("Operation, variant id and quantity are required", 400)
        }

        const product = await productService.updateStock(productId, variantId, operation, quantity);

        console.debug("Updated product stock successfully ==> ", product);
        res.status(200).send({
            success: true,
            message: "Product stock updated successfully",
            data: product
        });
        return;

    } catch (error) {
        console.error("Error while update stock ==> ", error);
        next(error);
        return;
    }
}

//get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.params.page as string) || 1;
        const limit = parseInt(req.params.limit as string) || 100;
        const skip = (page - 1) * limit;
        const filter = buildProductFilter(req.query as ProductQuery);

        console.debug("Filter for products: ", filter);

        const result = await productService.getAll({ filter, skip, limit });
        console.debug("\nResult: ", result);

        res.status(200).send({
            success: true,
            message: "Products fetched successfully",
            data: result
        });
        return;

    } catch (error) {
        console.error("\nError fetching products: ", error);
        next(error);
        return;
    }
}

//get product by id
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            console.warn("No product ID provided");
            throw new AppError("Product ID is required", 400);
        }

        const product = await productService.getById(productId);

        console.debug("Fetched product: ", product);
        res.status(200).send({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
        return;

    } catch (error) {
        console.error("Error fetching product: ", error);
        next(error);
        return;
    }
}

//delete product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        console.debug("Product ID for deleting product ==> ", id);

        if (!id) {
            console.warn("No product id provided...")
            throw new AppError("Product ID is required", 400);
        }

        const product: any = await productService.delete(id);

        console.debug("Deleted product ==> ", product);
        res.status(200).send({
            success: true,
            message: "Product deleted successfully",
            data: {
                brand_name: product.brand_name,
                productCode: product.productCode,
                id: product._id
            }
        });
        return;

    } catch (error) {
        console.error("Error while deleting product... ===> ", error)
        next(error)
        return;
    }
}