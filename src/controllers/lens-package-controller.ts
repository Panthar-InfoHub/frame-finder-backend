import { NextFunction, Request, Response } from "express";
import { LensPackageService } from "../services/lens-package-service.js";
import { LensPackage } from "../models/lens-package.js";

export const createLensPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.debug("requested data for lens package creation  ==> ", req.body);

        const vendorId = req.user?.id;
        console.debug("Vendor Id for creating lens package  ==> ", req.user?.id);


        const lensPackage = await LensPackageService.createLensPackage({ ...req.body, vendorId })
        console.debug("\n lens package ==> ", lensPackage)

        res.status(201).send({
            success: true,
            message: "Lens package created successfully",
            lensPackage: lensPackage
        });
        return;
    } catch (error) {
        console.error("Error creating lens package:", error);
        next(error);
        return;
    }
}

export const updateLensPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lensPackageId = req.params.id;
        const updateData = req.body;

        const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ? "" : req.user?.id
        //Authorized vendor check already done in auth middleware

        const query: any = { _id: lensPackageId }
        if (vendorId) {
            query.vendorId = vendorId
        }
        const updatedLensPackage = await LensPackageService.updateLensPackage(query, updateData);

        if (!updatedLensPackage) {
            console.warn("\n Lens package not found or you do not have permission to update it")
            return res.status(404).json({
                success: false,
                message: "Lens package not found or you do not have permission to update it"
            });
        }

        console.debug("\n updated lens package ==> ", updatedLensPackage)

        res.status(200).json({
            success: true,
            message: "Lens package updated successfully",
            data: updatedLensPackage
        });
    } catch (error) {
        console.error("Error updating lens package:", error);
        next(error);
        return;
    }
};

//Get all lens package all : for admin , limited by vendor Id
export const getAllLensPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 30
        const packageCode = req.query.code as string
        const vendorId = req.query.vendorId as string

        console.debug(`Gell all lens package params \nPage: ${page}, Limit: ${limit}, Package Code: ${packageCode}`);

        const skip = (page - 1) * limit;

        // const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ?  : req.user?.id
        const query: any = {};

        //Assign package code if provided
        if (packageCode) {
            query.packageCode = packageCode;
        }

        if (["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string)) {
            if (vendorId) {
                query.vendorId = vendorId
            }
        } else if (req.user?.role === "VENDOR") {

            if (vendorId && req.user?.id !== vendorId) {
                console.warn(`Vendor ${req.user?.id} attempted to access other vendor's data`);
                return res.status(400).send({
                    succcess: false,
                    message: `Vendor ${req.user?.id} attempted to access other vendor's data`
                })
            } else {
                query.vendorId = req.user?.id
            }
        }

        console.debug("\nQuery for fetching lens packages ==>  ", query);

        const [lensPackages, total] = await Promise.all([
            LensPackage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("vendorId", "business_name email phone business_owner"),
            LensPackage.countDocuments(query)
        ]);

        console.debug("\nFetched lens packages ==> ", lensPackages);
        console.debug("\nTotal lens packages count ==> ", total);

        res.status(200).send({
            success: true,
            message: "Lens packages fetched successfully",
            data: {
                lensPackages,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
        return;


    } catch (error) {
        console.error("Error geting all lens package:", error);
        next(error);
        return;
    }
}

//Delete Lens Package
export const deleteLensPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const packageId = req.params.id
        console.debug("\nDeleting lens package with ID ==> ", packageId);

        const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ? "" : req.user?.id
        const query: any = { _id: packageId };

        vendorId && (query.vendorId = vendorId)
        console.debug("\nQuery for fetching lens packages ==>  ", query);

        const lensPackage = await LensPackage.findOneAndDelete(query)

        if (!lensPackage) {
            console.warn(`Lens package with ID ${packageId} not found or not authorized to delete`);
            res.status(404).send({
                success: false,
                message: "Lens package not found"
            });
            return;
        }

        console.debug("\n Lens package deleted ==> ", lensPackage)

        res.status(200).send({
            success: true,
            message: "Lens package deleted",
            data: lensPackage
        })

    } catch (error) {
        console.error("Deleting lens package:", error);
        next(error);
        return;
    }
}
