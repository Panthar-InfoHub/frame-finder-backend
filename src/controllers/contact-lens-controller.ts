import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import { Model } from "mongoose";
import { ContactLensService } from "../services/contact-lens-service.js";
import { ProductService } from "../services/product-service.js";


export class LensController {
    lensService: any
    productService: any

    constructor(model: Model<any>, modelName: string) {
        this.lensService = new ContactLensService(model, modelName);
        this.productService = new ProductService(model, modelName);

        // Bind 'this' context for all methods to ensure 'this.service' is available
        this.createContactLens = this.createContactLens.bind(this);
        this.updateContactLens = this.updateContactLens.bind(this);
        this.updateLensVariantDetail = this.updateLensVariantDetail.bind(this);
        this.updateLensStock = this.updateLensStock.bind(this);
        this.getAllContactLens = this.getAllContactLens.bind(this);
        this.getContactLensById = this.getContactLensById.bind(this);
        this.deleteContactLens = this.deleteContactLens.bind(this);
    }

    //Create Contact Lens
    async createContactLens(req: Request, res: Response, next: NextFunction) {
        try {
            const productData = req.body;

            if (!productData || Object.keys(productData).length === 0) {
                console.warn("No Contact Lens data provided");
                throw new AppError("Contact Lens data is required", 400);
            }

            if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
                if (req.user && req.user.id) {
                    productData.vendorId = req.user.id;
                }
            }

            console.debug("\n Contact Lens data received for creation ==> ", productData);

            const product = await this.productService.create(productData);

            console.debug("\n Contact Lens created successfully: ", product);

            res.status(201).send({
                success: true,
                message: 'Contact Lens created successfully',
                data: product
            });
            return;
        } catch (error) {
            console.error("Error creating Contact Lens ==> ", error);
            next(error);
            return;
        }
    }

    //Update contact lens basic details except stock and variant
    async updateContactLens(req: Request, res: Response, next: NextFunction) {
        try {
            const lensId = req.params.id;
            const updateData = req.body;

            console.debug(`Updating Contact Lens with ID: ${lensId}`);
            console.debug("\n Updating data => ", updateData)
            if (!lensId) {
                console.warn("No Contact Lens ID provided");
                throw new AppError("Contact Lens ID is required", 400);
            }

            console.debug("\n Updated data => ", updateData)
            const product = await this.productService.update(lensId, updateData);

            console.debug("Updated product ==> ", product);
            res.status(200).send({
                success: true,
                message: "Product updated successfully",
                data: {
                    _id: product._id,
                    productCode: product.productCode,
                    brand_name: product.brand_name,
                    lens_type: product.lens_type,
                }
            });
            return;

        } catch (error) {
            console.error("Error updating product: ", error);
            next(error);
            return;
        }
    }

    //Update Contact lens variant except stock
    async updateLensVariantDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { variantId, ...updateData } = req.body;

            console.debug(`Updating contact lens with ID: ${id}`);
            console.debug("\n Updating data => ", updateData)

            if (Object.keys(updateData).length === 0) {
                throw new AppError('At least one field must be provided for update', 400);
            }

            const product: any = await this.lensService.updateLensVariant(id, variantId, updateData);

            console.debug("Updated Lens data ==> ", product);
            res.status(200).send({
                success: true,
                message: `${this.lensService.modelName} variant updated successfully`,
                data: {
                    id: product._id,
                    brand_name: product.brand_name,
                    updated_variant_id: variantId
                }
            });
            return;

        } catch (error) {
            console.error("Error updating product: ", error);
            next(error);
            return;
        }
    }

    // Lens stock update
    async updateLensStock(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { operation, quantity, variantId } = req.body;

            console.debug(`Updating stock for lens with ID: ${id}`);
            console.debug("\nOperation: ", operation, " Quantity: ", quantity, "Vairant ID : ", variantId);

            if (!id) {
                console.warn("No vairant ID provided");
                throw new AppError("Variant ID is required", 400)
            }

            if (!operation || !quantity || !variantId) {
                console.warn("Operation, variant id and quantity are required");
                throw new AppError("Operation, variant id and quantity are required", 400)
            }

            const result = await this.lensService.updateLensStock(id, variantId, operation, quantity);

            console.debug("Updated lens stock successfully ==> ", result);
            res.status(200).send({
                success: true,
                message: "Lens stock updated successfully",
                data: {
                    id: result._id,
                    updated_variant_id: variantId,
                    new_stock_level: result ? result.stock : 'not found'
                }
            });
            return;
        } catch (error) {
            next(error);
        }
    };

    //get all products
    async getAllContactLens(req: Request, res: Response, next: NextFunction) {
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

            console.debug("Filter for Contact Lens: ", filter);

            const result = await this.productService.getAll({ filter, skip, limit });
            console.debug("\nResult: ", result);

            res.status(200).send({
                success: true,
                message: "Contact Lens fetched successfully",
                data: result
            });
            return;

        } catch (error) {
            console.error("\nError fetching Contact Lens: ", error);
            next(error);
            return;
        }
    }

    //get product by id
    async getContactLensById(req: Request, res: Response, next: NextFunction) {
        try {
            const productId = req.params.id;

            if (!productId) {
                console.warn("No Contact Lens ID provided");
                throw new AppError("Contact Lens ID is required", 400);
            }

            const product = await this.productService.getById(productId);

            console.debug("Fetched Contact Lens: ", product);
            res.status(200).send({
                success: true,
                message: "Contact Lens fetched successfully",
                data: product
            });
            return;

        } catch (error) {
            console.error("Error fetching Contact Lens by Id: ", error);
            next(error);
            return;
        }
    }

    //delete contact lens
    async deleteContactLens(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id

            console.debug("Contact Lens ID for deleting product ==> ", id);

            if (!id) {
                console.warn("No Contact Lens id provided...")
                throw new AppError("Contact Lens ID is required", 400);
            }

            const product: any = await this.productService.delete(id);

            console.debug("Deleted Contact Lens ==> ", product);
            res.status(200).send({
                success: true,
                message: "Contact Lens deleted successfully",
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
}