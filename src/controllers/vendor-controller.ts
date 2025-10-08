import { NextFunction, Request, Response } from "express";
import { Vendor } from "../models/Vendor.js";
import { VendorService } from "../services/vendor-service.js";

export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, ...vendorData } = req.body;
        console.debug("\nCreating vendor with data: ", vendorData);

        const result = await VendorService.completeRegistration(phone, vendorData);
        console.debug("\nVendor created successfully: ", result);

        res.status(201).send({
            success: true,
            message: "Vendor created successfully",
            data: result
        });
        return;

    } catch (error) {
        console.error("\nError creating vendor: ", error);
        next(error);
        return;
    }
}

export const getAllVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || "";
        const skip = (page - 1) * limit;

        let filter: any = { isActive: true }
        if (search) {
            filter = {
                ...filter,
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            }
        }

        const [vendors, totalCount] = await Promise.all([
            Vendor.find(filter).skip(skip).limit(limit).select("-__v -password").sort({ createdAt: -1 }).lean(),
            Vendor.countDocuments(filter)
        ]);

        console.debug("\nFetched vendors: ", vendors);
        console.debug("\nTotal vendors count: ", totalCount);

        res.status(200).send({
            success: true,
            message: "Vendors fetched successfully",
            data: vendors,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                page,
                limit
            }
        });
        return;

    } catch (error) {
        console.error("\nError fetching vendors: ", error);
        next(error);
    }
};

export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorId = req.params.id;
        console.debug(`Fetching vendor with ID: ${vendorId}`);

        const vendor = await Vendor.findById(vendorId).select("-password").lean();

        if (!vendor) {
            console.warn(`Vendor with ID ${vendorId} not found`);
            res.status(404).send({
                success: false,
                message: "Vendor not found"
            });
            return;
        }

        console.debug("Fetched vendor ==> ", vendor);
        res.status(200).send({
            success: true,
            message: "Vendor fetched successfully",
            data: vendor
        });
        return;

    } catch (error) {
        console.error("\nError fetching vendor: ", error);
        next(error);
        return;
    }
};

export const deleteVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorId = req.params.id;
        console.debug(`Deleting vendor with ID: ${vendorId}`);

        const vendor = await Vendor.findByIdAndUpdate(vendorId, { isActive: false }, { new: true });

        if (!vendor) {
            console.warn(`Vendor with ID ${vendorId} not found`);
            res.status(404).send({
                success: false,
                message: "Vendor not found"
            });
            return;
        }

        console.debug("Deleted vendor ==> ", vendor);
        res.status(204).send({
            success: true,
            message: "Vendor deleted successfully",
            data: vendor._id
        });
        return;

    } catch (error) {
        console.error("\nError deleting vendor: ", error);
        next(error);
        return;
    }
};

export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorId = req.params.id;
        console.debug(`Updating vendor with ID: ${vendorId}`);

        const vendor = await Vendor.findByIdAndUpdate(vendorId, req.body, { new: true });

        if (!vendor) {
            console.warn(`Vendor with ID ${vendorId} not found`);
            res.status(404).send({
                success: false,
                message: "Vendor not found"
            });
            return;
        }

        console.debug("Updated vendor ==> ", vendor);
        res.status(200).send({
            success: true,
            message: "Vendor updated successfully",
            data: vendor
        });
        return;

    } catch (error) {
        console.error("\nError updating vendor: ", error);
        next(error);
        return;
    }
};