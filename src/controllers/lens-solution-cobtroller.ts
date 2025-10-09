import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import { ProductService } from "../services/product-service.js";
import { Model } from "mongoose";


class LensSolutionController {
    productService: any;
    constructor(model: Model<any>, modelName: string) {
        this.productService = new ProductService(model, modelName);
    }

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productData = req.body;

            if (!productData || Object.keys(productData).length === 0) {
                console.warn("No Lens Solution data provided");
                throw new AppError("Lens Solution data is required", 400);
            }

            if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
                if (req.user && req.user.id) {
                    productData.vendorId = req.user.id;
                }
            }

            console.debug("\nLens Solution data received for creation ==> ", productData);

            const product = await this.productService.create(productData);

            console.debug("\nLens Solution created successfully: ", product);

            res.status(201).send({
                success: true,
                message: 'Lens Solution created successfully',
                data: product
            });
            return;
        } catch (error) {
            console.error("Error creating Lens Solution ==> ", error);
            next(error);
            return;
        }
    }

    //Update Lens Solution except stock
    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = req.params.id;
            const updateData = req.body;

            console.debug(`Updating Lens Solution with ID: ${productId}`);
            console.debug("\n Updating data => ", updateData)
            if (!productId) {
                console.warn("No Lens Solution ID provided");
                throw new AppError("Lens Solution ID is required", 400);
            }

            //check if update Data have variants and if they have stock or not ??
            if (updateData.variants) {
                updateData.variants.forEach((variant: any) => {
                    console.debug("\n Checking if variant have stock or not => ", variant)
                    if (variant.stock) delete variant.stock
                });
            }

            console.debug("\n Updated data => ", updateData)

            const product = await this.productService.update(productId, updateData);

            console.debug("Updated Lens Solution ==> ", product);
            res.status(200).send({
                success: true,
                message: "Lens Solution updated successfully",
                data: product
            });
            return;

        } catch (error) {
            console.error("Error updating Lens Solution: ", error);
            next(error);
            return;
        }
    }

    //Update stock of Lens Solution variant
    updateVariantStock = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const productId = req.params.id;
            const { operation, quantity, variantId } = req.body;

            console.debug(`Updating stock for Lens Solution with ID: ${productId}`);
            console.debug("\nOperation: ", operation, " Quantity: ", quantity);
            if (!productId) {
                console.warn("No vairant ID provided");
                throw new AppError("Variant ID is required", 400)
            }

            if (!operation || !quantity || !variantId) {
                console.warn("Operation, variant id and quantity are required");
                throw new AppError("Operation, variant id and quantity are required", 400)
            }

            const product = await this.productService.updateStock(productId, variantId, operation, quantity);

            console.debug("Updated Lens Solution stock successfully ==> ", product);
            res.status(200).send({
                success: true,
                message: "Lens Solution stock updated successfully",
                data: product
            });
            return;

        } catch (error) {
            console.error("Error while update Lens Solution stock ==> ", error);
            next(error);
            return;
        }
    }

    //get all Lens Solutions
    getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const page = parseInt(req.params.page as string) || 1;
            const limit = parseInt(req.params.limit as string) || 100;
            const skip = (page - 1) * limit;
            const vendorId = req.query.vendorId as string;

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

            if (vendorId) {
                filter.vendorId = vendorId;
            }

            console.debug("Filter for Lens Solutions: ", filter);

            const result = await this.productService.getAll({ filter, skip, limit });
            console.debug("\nResult: ", result);

            res.status(200).send({
                success: true,
                message: "Lens Solutions fetched successfully",
                data: result
            });
            return;

        } catch (error) {
            console.error("\nError fetching Lens Solutions: ", error);
            next(error);
            return;
        }
    }

    //get Lens Solution by id
    getProductById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = req.params.id;

            if (!productId) {
                console.warn("No Lens Solution ID provided");
                throw new AppError("Lens Solution ID is required", 400);
            }

            const product = await this.productService.getById(productId);

            console.debug("Fetched Lens Solution: ", product);
            res.status(200).send({
                success: true,
                message: "Lens Solution fetched successfully",
                data: product
            });
            return;

        } catch (error) {
            console.error("Error fetching Lens Solution: ", error);
            next(error);
            return;
        }
    }

    //delete Lens Solution
    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id

            console.debug("Lens Solution ID for deleting ==> ", id);

            if (!id) {
                console.warn("No Lens Solution id provided...")
                throw new AppError("Lens Solution ID is required", 400);
            }

            const product: any = await this.productService.delete(id);

            console.debug("Deleted Lens Solution ==> ", product);
            res.status(200).send({
                success: true,
                message: "Lens Solution deleted successfully",
                data: {
                    brand_name: product.brand_name,
                    productCode: product.productCode,
                    id: product._id
                }
            });
            return;

        } catch (error) {
            console.error("Error while deleting Lens Solution... ===> ", error)
            next(error)
            return;
        }
    }
}