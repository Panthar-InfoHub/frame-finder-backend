import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
import { Sunglass } from "../models/sunglass.js";

export const createSunglass = async (req: Request, res: Response, next: NextFunction) => {

    const session = await startSession()

    await session.startTransaction();
    try {
        const SunglassData = req.body;

        if (!SunglassData || Object.keys(SunglassData).length === 0) {
            console.warn("No Sunglass data provided");
            res.status(400).send({ message: "Sunglass data is required" });
            return;
        }

        console.debug("\nSunglass data received for creation ==> ", SunglassData);

        const sunglass = await Sunglass.create([SunglassData], { session });

        if (!sunglass) {
            console.warn("Sunglass creation failed");
            res.status(500).send({ message: "Failed to create Sunglass" });
            return;
        }

        console.debug("\nSunglass created successfully: ", sunglass);
        await session.commitTransaction();
        console.debug("Transaction committed successfully");

        res.status(201).send({
            success: true,
            message: 'Sunglass created successfully',
            data: sunglass
        });
        return;
    } catch (error) {
        await session.abortTransaction();
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

        if (updateData.stock) {
            delete updateData.stock;
        }

        const sunglass = await Sunglass.findByIdAndUpdate(SunglassId, updateData, { new: true });

        if (!sunglass) {
            console.warn(`Sunglass with ID ${SunglassId} not found`);
            res.status(404).send({
                success: false,
                message: "Sunglass not found"
            });
            return;
        }

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
        const { operation, quantity } = req.body;

        console.debug(`Updating stock for Sunglass with ID: ${SunglassId}`);
        console.debug("\nOperation: ", operation, " Quantity: ", quantity);
        if (!SunglassId) {
            console.warn("No Sunglass ID provided");
            res.status(400).send({ success: false, message: "Sunglass ID is required" });
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

        const sunglass = await Sunglass.findByIdAndUpdate(SunglassId, updateOpn, { new: true });

        if (!sunglass) {
            console.warn(`Sunglass with ID ${SunglassId} not found`);
            res.status(404).send({ success: false, message: "Sunglass not found" });
            return;
        }

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

        console.debug("Filter for sunglass: ", filter);

        const [sunglass, totalSunglasss] = await Promise.all([Sunglass
            .find(filter)
            .skip(skip)
            .limit(limit),
        Sunglass.countDocuments(filter)]);

        console.debug("\nFetched Sunglasss: ", sunglass);
        console.debug("\nTotal Sunglasss count: ", totalSunglasss);

        res.status(200).send({
            success: true,
            message: "Sunglasss fetched successfully",
            data: {
                sunglass,
                pagination: {
                    totalSunglasss,
                    totalPages: Math.ceil(totalSunglasss / limit)
                }
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

        const sunglass = await Sunglass
            .findById(SunglassId)
            .populate("vendorId", "business_name email phone")

        if (!sunglass || sunglass.status === 'inactive') {
            console.warn(`Sunglass with ID ${SunglassId} not found`);
            res.status(404).send({ success: false, message: "Sunglass not found" });
            return;
        }

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

        const sunglass = await Sunglass.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });

        if (!sunglass) {
            console.warn(`Sunglass with ID ${id} not found`);
            res.status(404).send({ success: false, message: "Sunglass not found" });
            return;
        }

        console.debug("Deleted sunglass: ", sunglass);
        res.status(200).send({
            success: true,
            message: "Sunglass deleted successfully",
            data: sunglass
        });
        return;

    } catch (error) {
        console.error("Error while deleting sunglass... ===> ", error)
        next(error)
        return;
    }
}