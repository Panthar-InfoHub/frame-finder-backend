import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import { Sunglass } from "../models/sunglass.js";
import { ProductService } from "../services/product-service.js";
import { buildProductFilter } from "../lib/helper.js";
import { ProductQuery } from "../lib/types.js";

const sunglassService = new ProductService(Sunglass, "Sunglass");


export const createSunglass = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const productData = req.body;

        if (!productData || Object.keys(productData).length === 0) {
            console.warn("No Sunglass data provided");
            throw new AppError("Sunglass data is required", 400);
        }

        if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
            if (req.user && req.user.id) {
                productData.vendorId = req.user.id;
            }
        }

        console.debug("\nSunglass data received for creation ==> ", productData);

        const product = await sunglassService.create(productData);

        console.debug("\nSunglass created successfully: ", product);

        res.status(201).send({
            success: true,
            message: 'Sunglass created successfully',
            data: product
        });
        return;
    } catch (error) {
        console.error("Error creating Sunglass ==> ", error);
        next(error);
        return;
    }
}

//Update Sunglass except stock
export const updateSunglass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SunglassId = req.params.id;
        const updateData = req.body;

        console.debug(`Updating Sunglass with ID: ${SunglassId}`);
        console.debug("\n Updating data => ", updateData)
        if (!SunglassId) {
            console.warn("No Sunglass ID provided");
            res.status(400).send({ success: false, message: "Sunglass ID is required" });
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
        const sunglass = await sunglassService.update(SunglassId, updateData);

        console.debug("Updated Sunglass ==> ", sunglass);
        res.status(200).send({
            success: true,
            message: "Sunglass updated successfully",
            data: sunglass
        });
        return;

    } catch (error) {
        console.error("Error updating Sunglass: ", error);
        next(error);
        return;
    }
}

//Update stock of Sunglass
export const updateSunglassStock = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const SunglassId = req.params.id;
        const { operation, quantity, variantId } = req.body;

        console.debug(`Updating stock for Sunglass with ID: ${SunglassId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!SunglassId) {
            console.warn("No Sunglass ID provided");
            res.status(400).send({ success: false, message: "Sunglass ID is required" });
            return;
        }

        if (!operation || !quantity || !variantId) {
            console.warn("Operation, variant id and quantity are required");
            throw new AppError("Operation, variant id and quantity are required", 400)
        }

        const sunglass: any = await sunglassService.updateStock(SunglassId, variantId, operation, quantity);


        console.debug("Updated Sunglass  ==> ", sunglass);
        res.status(200).send({
            success: true,
            message: "Sunglass stock updated successfully",
            data: sunglass
        });
        return;

    } catch (error) {
        console.error("Error while update stock ==> ", error);
        next(error);
        return;
    }
}

//get all sunglass
export const getAllSunglass = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.params.page as string) || 1;
        const limit = parseInt(req.params.limit as string) || 100;
        const skip = (page - 1) * limit;
        const vendorId = req.query.vendorId as string;

        const search = req.query.search as string || "";

        console.debug("\nSearch query: ", search);
        console.debug("\nVendor ID: ", vendorId);

        const filter = buildProductFilter(req.query as ProductQuery);

        console.debug("Filter for products: ", filter);

        const result = await sunglassService.getAll({ filter, skip, limit });
        console.debug("\nResult: ", result);

        res.status(200).send({
            success: true,
            message: "Sunglasss fetched successfully",
            data: {
                result,
            }
        });
        return;

    } catch (error) {
        console.error("\nError fetching sunglass: ", error);
        next(error);
        return;
    }
}

//get Sunglass by id
export const getSunglassById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SunglassId = req.params.id;

        if (!SunglassId) {
            console.warn("No Sunglass ID provided");
            res.status(400).send({ success: false, message: "Sunglass ID is required" });
            return;
        }

        const sunglass = await sunglassService.getById(SunglassId);


        console.debug("Fetched Sunglass: ", sunglass);
        res.status(200).send({
            success: true,
            message: "Sunglass fetched successfully",
            data: sunglass
        });
        return;

    } catch (error) {
        console.error("Error fetching Sunglass: ", error);
        next(error);
        return;
    }
}

//delete Sunglass
export const deleteSunglass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        console.debug("Sunglass ID for deleting Sunglass ==> ", id);

        if (!id) {
            console.warn("No Sunglass id provided...")
            res.status(404).send({
                success: false,
                message: "Sunglass ID is required"
            })
        }

        const sunglass: any = await sunglassService.delete(id);


        console.debug("Deleted sunglass: ", sunglass);
        res.status(200).send({
            success: true,
            message: "Sunglass deleted successfully",
            data: {
                brand_name: sunglass.brand_name,
                productCode: sunglass.productCode,
                id: sunglass._id
            }
        });
        return;

    } catch (error) {
        console.error("Error while deleting sunglass... ===> ", error)
        next(error)
        return;
    }
}