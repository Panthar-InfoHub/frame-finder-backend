import { NextFunction, Request, Response } from "express";
import { VendorMisc } from "../models/vendor_misc.js";
import { startSession } from "mongoose";

export const addValueToVendorMisc = async (req: Request, res: Response, next: NextFunction) => {
    const session = await startSession();

    await session.startTransaction();
    try {
        const vendorId = req.params.id;
        const { type, values } = req.body;

        console.debug("Vendor ID from params: ", vendorId);
        console.debug("Value from body: ", values);

        if (!vendorId) {
            console.warn("No vendor id provided...");
            res.status(404).send({
                success: false,
                message: "Vendor ID is required"
            });
            return;
        }

        if (!values || !Array.isArray(values) || values.length === 0) {
            console.warn("Invalid values provided...");
            res.status(400).send({
                success: false,
                message: "Values must be a non-empty array"
            });
            return;
        }

        const vendorMisc = await VendorMisc.findOneAndUpdate(
            { vendor: vendorId, type },
            { $addToSet: { values: { $each: values } } },
            { new: true, upsert: true, session }
        );

        console.debug("Vendor misc updated successfully: ", vendorMisc);
        await session.commitTransaction();
        console.debug("Transaction committed successfully");

        res.status(200).send({
            success: true,
            message: "Vendor misc updated successfully",
            data: vendorMisc
        });
        return;

    } catch (error) {
        console.error("Error updating vendor misc: ", error);
        await session.abortTransaction();
        next(error);
        return;
    }
}

export const removeValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorId = req.params.id;
        const { type, value } = req.body;

        console.debug("Vendor ID from params: ", vendorId);
        console.debug("Values from body: ", value);

        if (!vendorId) {
            console.warn("No vendor id provided...");
            res.status(404).send({
                success: false,
                message: "Vendor ID is required"
            });
            return;
        }

        if (!value) {
            console.warn("Invalid values provided...");
            res.status(400).send({
                success: false,
                message: "Values must be specified"
            });
            return;
        }

        const vendorMisc = await VendorMisc.findOneAndUpdate(
            { vendor: vendorId, type },
            { $pull: { values: { value } } },
            { new: true }
        );

        console.debug("Vendor misc updated successfully: ", vendorMisc);

        res.status(200).send({
            success: true,
            message: "Vendor misc updated successfully",
            data: vendorMisc
        });
        return;

    } catch (error) {
        console.error("Error updating vendor misc: ", error);
        next(error);
        return;
    }
}

export const getVendorMiscValuesByVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorId = req.params.id;

        console.debug("Vendor ID from params: ", vendorId);

        const type = req.query.type as string | "";

        if (!vendorId) {
            console.warn("No vendor id provided...");
            res.status(404).send({
                success: false,
                message: "Vendor ID is required"
            });
            return;
        }

        const vendorMisc = await VendorMisc
            .findOne({ vendor: vendorId, type })
            .populate("vendor", "business_name , business_owner, email, phone")
            .lean();

        if (!vendorMisc) {
            console.warn("No vendor misc found...");
            res.status(404).send({
                success: false,
                message: "Vendor misc not found"
            });
            return;
        }

        console.debug("Vendor misc found: ", vendorMisc);

        res.status(200).send({
            success: true,
            message: "Vendor misc retrieved successfully",
            data: vendorMisc
        });
        return;

    } catch (error) {
        console.error("Error retrieving vendor misc: ", error);
        next(error);
        return;
    }
}