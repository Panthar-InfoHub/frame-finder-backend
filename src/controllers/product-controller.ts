import { NextFunction, Request, Response } from "express";
import { Product } from "../models/products.js";
import { startSession } from "mongoose";
import AppError from "../middlwares/Error.js";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {

    const session = await startSession()

    await session.startTransaction();
    try {
        const productData = req.body;

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

        const product = await Product.create([productData], { session });

        if (!product) {
            console.warn("Product creation failed");
            await session.abortTransaction();
            throw new AppError("Failed to create product", 500);
        }

        console.debug("\nProduct created successfully: ", product);
        await session.commitTransaction();
        console.debug("Transaction committed successfully");

        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            data: product
        });
        return;
    } catch (error) {
        await session.abortTransaction();
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
            res.status(400).send({ success: false, message: "Product ID is required" });
            return;
        }

        //check if update Data have variants and if they have stock or not ??
        if (updateData.variants) {
            updateData.variants.forEach((variant: any) => {
                console.debug("\n Checking if variant have stock or not => ", variant)
                if (variant.stock) delete variant.stock
            });
        }

        console.debug("\n Updated data => ", updateData)


        const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });

        if (!product) {
            console.warn(`Product with ID ${productId} not found`);
            res.status(404).send({
                success: false,
                message: "Product not found"
            });
            return;
        }

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

//Update stock of product
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

        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);
        const updateOpn = { $inc: { "variants.$.stock.current": finalQuantity } }

        console.debug("Update operation: ", updateOpn);

        const product = await Product.findOneAndUpdate(
            { _id: productId, "variants._id": variantId },
            updateOpn,
            { new: true }
        );

        if (!product) {
            console.warn(`Product with ID ${productId} and variant with ID ${variantId} not found.`);
            res.status(404).send({ success: false, message: "Product or variant id is invalid" });
            return;
        }

        console.debug("Updated product  ==> ", product);
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

        const search = req.query.search as string || "";

        console.debug("\nSearch query: ", search);

        let filter: any = { status: 'active' };

        if (search) {
            const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            filter = {
                ...filter,
                $or: [
                    { productCode: { $regex: escapedSearch, $options: 'i' } },
                    { $text: { $search: search } }
                ]
            };
        }


        console.debug("Filter for products: ", filter);

        const [products, totalProducts] = await Promise.all([Product
            .find(filter)
            .skip(skip)
            .limit(limit),
        Product.countDocuments(filter)]);

        console.debug("\nFetched products: ", products);
        console.debug("\nTotal products count: ", totalProducts);

        res.status(200).send({
            success: true,
            message: "Products fetched successfully",
            data: {
                products,
                pagination: {
                    totalProducts,
                    totalPages: Math.ceil(totalProducts / limit)
                }
            }
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
            res.status(400).send({ success: false, message: "Product ID is required" });
            return;
        }

        const product = await Product
            .findById(productId)
            .populate("vendorId", "business_name email phone")

        if (!product || product.status === 'inactive') {
            console.warn(`Product with ID ${productId} not found`);
            res.status(404).send({ success: false, message: "Product not found" });
            return;
        }

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
            res.status(404).send({
                success: false,
                message: "Product ID is required"
            })
        }

        const product = await Product.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });

        if (!product) {
            console.warn(`Product with ID ${id} not found`);
            res.status(404).send({ success: false, message: "Product not found" });
            return;
        }

        console.debug("Deleted product: ", product);
        res.status(200).send({
            success: true,
            message: "Product deleted successfully",
            data: product
        });
        return;

    } catch (error) {
        console.error("Error while deleting product... ===> ", error)
        next(error)
        return;
    }
}