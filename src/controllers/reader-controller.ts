import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import { Reader } from "../models/reader.js";
import { ProductService } from "../services/product-service.js";

const readerService = new ProductService(Reader, "Reader");


export const createReader = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const productData = req.body;

        if (!productData || Object.keys(productData).length === 0) {
            console.warn("No Reader data provided");
            throw new AppError("Reader data is required", 400);
        }

        if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
            if (req.user && req.user.id) {
                productData.vendorId = req.user.id;
            }
        }

        console.debug("\nReader data received for creation ==> ", productData);

        const product = await readerService.create(productData);

        console.debug("\nReader created successfully: ", product);

        res.status(201).send({
            success: true,
            message: 'Reader created successfully',
            data: product
        });
        return;
    } catch (error) {
        console.error("Error creating Reader ==> ", error);
        next(error);
        return;
    }
}

//Update Reader except stock
export const updateReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readerId = req.params.id;
        const updateData = req.body;

        console.debug(`Updating Reader with ID: ${readerId}`);
        console.debug("\n Updating data => ", updateData)
        if (!readerId) {
            console.warn("No Reader ID provided");
            res.status(400).send({ success: false, message: "Reader ID is required" });
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
        const reader = await readerService.update(readerId, updateData);

        console.debug("Updated Reader ==> ", reader);
        res.status(200).send({
            success: true,
            message: "Reader updated successfully",
            data: reader
        });
        return;

    } catch (error) {
        console.error("Error updating Reader: ", error);
        next(error);
        return;
    }
}

//Update stock of Reader
export const updateReaderStock = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const readerId = req.params.id;
        const { operation, quantity, variantId } = req.body;

        console.debug(`Updating stock for Reader with ID: ${readerId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!readerId) {
            console.warn("No Reader ID provided");
            throw new AppError("Reader ID is required", 400);
        }

        if (!operation || !quantity || !variantId) {
            console.warn("Operation, variant id and quantity are required");
            throw new AppError("Operation, variant id and quantity are required", 400)
        }

        const reader: any = await readerService.updateStock(readerId, variantId, operation, quantity);


        console.debug("Updated Reader  ==> ", reader);
        res.status(200).send({
            success: true,
            message: "Reader stock updated successfully",
            data: reader
        });
        return;

    } catch (error) {
        console.error("Error while update stock ==> ", error);
        next(error);
        return;
    }
}

//get all reader
export const getAllReader = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.params.page as string) || 1;
        const limit = parseInt(req.params.limit as string) || 100;
        const skip = (page - 1) * limit;
        const vendorId = req.query.vendorId as string;

        const search = req.query.search as string || "";

        console.debug("\nSearch query: ", search);
        console.debug("\nVendor ID: ", vendorId);

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

        console.debug("Filter for reader: ", filter);

        const result = await readerService.getAll({ filter, skip, limit });
        console.debug("\nResult: ", result);

        res.status(200).send({
            success: true,
            message: "Readers fetched successfully",
            data: {
                result,
            }
        });
        return;

    } catch (error) {
        console.error("\nError fetching reader: ", error);
        next(error);
        return;
    }
}

//get Reader by id
export const getReaderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readerId = req.params.id;

        if (!readerId) {
            console.warn("No Reader ID provided");
            res.status(400).send({ success: false, message: "Reader ID is required" });
            return;
        }

        const reader = await readerService.getById(readerId);


        console.debug("Fetched Reader: ", reader);
        res.status(200).send({
            success: true,
            message: "Reader fetched successfully",
            data: reader
        });
        return;

    } catch (error) {
        console.error("Error fetching Reader by ID ==> ", error);
        next(error);
        return;
    }
}

//delete Reader
export const deleteReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        console.debug("Reader ID for deleting Reader ==> ", id);

        if (!id) {
            console.warn("No Reader id provided...")
            res.status(404).send({
                success: false,
                message: "Reader ID is required"
            })
        }

        const reader: any = await readerService.delete(id);


        console.debug("Deleted reader: ", reader);
        res.status(200).send({
            success: true,
            message: "Reader deleted successfully",
            data: {
                brand_name: reader.brand_name,
                productCode: reader.productCode,
                id: reader._id
            }
        });
        return;

    } catch (error) {
        console.error("Error while deleting reader... ===> ", error)
        next(error)
        return;
    }
}