import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
import AppError from "../middlwares/Error.js";
import { Accessories } from "../models/Accessories.js";

export const createAccessories = async (req: Request, res: Response, next: NextFunction) => {

    const session = await startSession()

    await session.startTransaction();
    try {
        const AccessoriesData = req.body;

        if (!AccessoriesData || Object.keys(AccessoriesData).length === 0) {
            console.warn("No accessories data provided");
            throw new AppError("Accessories data is required", 400)
        }

        if (!["SUPER_ADMIN", "ADMIN"].includes(req?.user?.role || "")) {
            if (req.user && req.user.id) {
                AccessoriesData.vendorId = req.user.id;
            }
        }

        console.debug("\n accessories data received for creation ==> ", AccessoriesData);

        const accessories = await Accessories.create([AccessoriesData], { session });

        if (!accessories) {
            console.warn("Accessories creation failed");
            await session.abortTransaction();
            throw new AppError("Failed to create Accessories", 500);
        }

        console.debug("\accessories created successfully: ", accessories);
        await session.commitTransaction();
        console.debug("Transaction committed successfully");

        res.status(201).send({
            success: true,
            message: 'accessories created successfully',
            data: accessories
        });
        return;
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating Accessories ==> ", error);
        next(error);
        return;
    }
}

//Update Accessories except stock
export const updateAccessories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const AccessoriesId = req.params.id;
        const updateData = req.body;

        console.debug(`Updating Accessories with ID: ${AccessoriesId}`);
        console.debug("\n Updating data => ", updateData)
        if (!AccessoriesId) {
            console.warn("No Accessories ID provided");
            res.status(400).send({ success: false, message: "Accessories ID is required" });
            return;
        }

        if (updateData.stock) {
            delete updateData.stock;
        }

        const accessories = await Accessories.findByIdAndUpdate(AccessoriesId, updateData, { new: true });

        if (!accessories) {
            console.warn(`Accessories with ID ${AccessoriesId} not found`);
            res.status(404).send({
                success: false,
                message: "Accessories not found"
            });
            return;
        }

        console.debug("Updated Accessories ==> ", Accessories);
        res.status(200).send({
            success: true,
            message: "Accessories updated successfully",
            data: accessories
        });
        return;

    } catch (error) {
        console.error("Error updating Accessories: ", error);
        next(error);
        return;
    }
}

//Update stock of Accessories
export const updateAccessoriesStock = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const AccessoriesId = req.params.id;
        const { operation, quantity } = req.body;

        console.debug(`Updating stock for Accessories with ID: ${AccessoriesId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!AccessoriesId) {
            console.warn("No Accessories ID provided");
            res.status(400).send({ success: false, message: "Accessories ID is required" });
            return;
        }

        if (!operation || !quantity) {
            console.warn("Operation and quantity are required");
            res.status(400).send({ success: false, message: "Operation and quantity are required" });
            return;
        }

        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);
        const updateOpn = { $inc: { "stock.current": finalQuantity } }

        console.debug("Update operation: ", updateOpn);

        const accessories = await Accessories.findByIdAndUpdate(AccessoriesId, updateOpn, { new: true });

        if (!accessories) {
            console.warn(`Accessories with ID ${AccessoriesId} not found`);
            res.status(404).send({ success: false, message: "Accessories not found" });
            return;
        }

        console.debug("Updated Accessories  ==> ", accessories);
        res.status(200).send({
            success: true,
            message: "Accessories stock updated successfully",
            data: accessories
        });
        return;

    } catch (error) {
        console.error("Error while update stock ==> ", error);
        next(error);
        return;
    }
}

//get all Accessories
export const getAllAccessories = async (req: Request, res: Response, next: NextFunction) => {
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
            filter = {
                ...filter,
                $text: { $search: search }
            }
        }

        if (vendorId) {
            filter.vendorId = vendorId;
        }

        console.debug("Filter for Accessories: ", filter);

        const [accessories, totalAccessoriess] = await Promise.all([Accessories
            .find(filter)
            .skip(skip)
            .limit(limit),
        Accessories.countDocuments(filter)]);

        console.debug("\nFetched Accessoriess: ", accessories);
        console.debug("\nTotal Accessoriess count: ", totalAccessoriess);

        res.status(200).send({
            success: true,
            message: "Accessoriess fetched successfully",
            data: {
                accessories,
                pagination: {
                    totalAccessoriess,
                    totalPages: Math.ceil(totalAccessoriess / limit)
                }
            }
        });
        return;

    } catch (error) {
        console.error("\nError fetching Accessories: ", error);
        next(error);
        return;
    }
}

//get Accessories by id
export const getAccessorieByID = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const AccessoriesId = req.params.id;

        if (!AccessoriesId) {
            console.warn("No Accessories ID provided");
            res.status(400).send({ success: false, message: "Accessories ID is required" });
            return;
        }

        const accessories = await Accessories
            .findById(AccessoriesId)
            .populate("vendorId", "business_name email phone")

        if (!accessories || accessories.status === 'inactive') {
            console.warn(`Accessories with ID ${AccessoriesId} not found`);
            res.status(404).send({ success: false, message: "Accessories not found" });
            return;
        }

        console.debug("Fetched Accessories: ", Accessories);
        res.status(200).send({
            success: true,
            message: "Accessories fetched successfully",
            data: accessories
        });
        return;

    } catch (error) {
        console.error("Error fetching Accessories: ", error);
        next(error);
        return;
    }
}

//delete Accessories
export const deleteAccessories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        console.debug("Accessories ID for deleting Accessories ==> ", id);

        if (!id) {
            console.warn("No Accessories id provided...")
            res.status(404).send({
                success: false,
                message: "Accessories ID is required"
            })
        }

        const accessories = await Accessories.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });

        if (!accessories) {
            console.warn(`Accessories with ID ${id} not found`);
            res.status(404).send({ success: false, message: "Accessories not found" });
            return;
        }

        console.debug("Deleted Accessories: ", accessories);
        res.status(200).send({
            success: true,
            message: "Accessories deleted successfully",
            data: accessories
        });
        return;

    } catch (error) {
        console.error("Error while deleting Accessories... ===> ", error)
        next(error)
        return;
    }
}