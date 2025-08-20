import { Product } from "../models/products.js";
import { startSession } from "mongoose";
export const createProduct = async (req, res, next) => {
    const session = await startSession();
    await session.startTransaction();
    try {
        const productData = req.body;
        if (!productData || Object.keys(productData).length === 0) {
            console.warn("No product data provided");
            res.status(400).send({ message: "Product data is required" });
            return;
        }
        console.debug("\nProduct data received for creation ==> ", productData);
        const product = await Product.create([productData], { session });
        if (!product) {
            console.warn("Product creation failed");
            res.status(500).send({ message: "Failed to create product" });
            return;
        }
        await session.commitTransaction();
        console.debug("\nProduct created successfully: ", product);
        console.debug("Transaction committed successfully");
        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            data: product
        });
        return;
    }
    catch (error) {
        await session.abortTransaction();
        console.error("Error creating product ==> ", error);
        next(error);
        return;
    }
};
//Update product except stock
export const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const updateData = req.body;
        console.debug(`Updating product with ID: ${productId}`);
        if (!productId) {
            console.warn("No product ID provided");
            res.status(400).send({ success: false, message: "Product ID is required" });
            return;
        }
        if (updateData.stock) {
            delete updateData.stock;
        }
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
    }
    catch (error) {
        console.error("Error updating product: ", error);
        next(error);
        return;
    }
};
//Update stock of product
export const updateProductStock = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const { operation, quantity } = req.body;
        console.debug(`Updating stock for product with ID: ${productId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!productId) {
            console.warn("No product ID provided");
            res.status(400).send({ success: false, message: "Product ID is required" });
            return;
        }
        if (!operation || !quantity) {
            console.warn("Operation and quantity are required");
            res.status(400).send({ success: false, message: "Operation and quantity are required" });
            return;
        }
        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);
        const updateOpn = { $inc: { "stock.current": finalQuantity } };
        console.debug("Update operation: ", updateOpn);
        const product = await Product.findByIdAndUpdate(productId, updateOpn, { new: true });
        if (!product) {
            console.warn(`Product with ID ${productId} not found`);
            res.status(404).send({ success: false, message: "Product not found" });
            return;
        }
        console.debug("Updated product  ==> ", product);
        res.status(200).send({
            success: true,
            message: "Product stock updated successfully",
            data: product
        });
        return;
    }
    catch (error) {
        console.error("Error while update stock ==> ", error);
        next(error);
        return;
    }
};
//get all products
export const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 100;
        const skip = (page - 1) * limit;
        const categoryIds = req.query.categoryIds?.split(",") || [];
        const search = req.query.search || "";
        console.debug("\nSearch query: ", search);
        console.debug("\nCategory IDs: ", categoryIds);
        let filter = { status: 'active' };
        if (search) {
            filter = {
                ...filter,
                $text: { $search: search }
            };
        }
        if (categoryIds && categoryIds?.length > 0) {
            filter.categoryId = { $in: categoryIds };
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
    }
    catch (error) {
        console.error("\nError fetching products: ", error);
        next(error);
        return;
    }
};
//get product by id
export const getProductById = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            console.warn("No product ID provided");
            res.status(400).send({ success: false, message: "Product ID is required" });
            return;
        }
        const product = await Product
            .findById(productId)
            .populate("categoryId", "name")
            .populate("vendorId", "business_name email phone");
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
    }
    catch (error) {
        console.error("Error fetching product: ", error);
        next(error);
        return;
    }
};
//delete product
export const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.debug("Product ID for deleting product ==> ", id);
        if (!id) {
            console.warn("No product id provided...");
            res.status(404).send({
                success: false,
                message: "Product ID is required"
            });
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
    }
    catch (error) {
        console.error("Error while deleting product... ===> ", error);
        next(error);
        return;
    }
};
