import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import AppError from "../middlwares/Error.js";
import { LensPackageClass } from "../services/lens-package-service.js";

export class LensPackageController {

    lensPackageService: LensPackageClass;
    modelName: string;
    constructor(model: Model<any>, modelName: string) {
        this.lensPackageService = new LensPackageClass(model, modelName);
        this.modelName = modelName;
    }

    //Create Lens Package
    createLensPackage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.debug("requested data for lens package creation  ==> ", req.body);

            const vendorId = req.user?.id;
            console.debug(`Vendor Id for creating ${this.modelName} ==> ${req.user?.id}`);


            const lensPackage = await this.lensPackageService.createLensPackage({ ...req.body, vendorId })
            console.debug(`\n ${this.modelName} ==> ${lensPackage}`)

            res.status(201).send({
                success: true,
                message: `${this.modelName} created successfully`,
                lensPackage: lensPackage
            });
            return;
        } catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            next(error);
            return;
        }
    }
    updateLensPackage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lensPackageId = req.params.id;
            const updateData = req.body;

            const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ? "" : req.user?.id
            //Authorized vendor check already done in auth middleware

            const query: any = { _id: lensPackageId }
            if (vendorId) {
                query.vendorId = vendorId
            }
            const updatedLensPackage = await this.lensPackageService.updateLensPackage(query, updateData);

            if (!updatedLensPackage) {
                console.warn(`\n ${this.modelName} not found or you do not have permission to update it`)
                return res.status(404).json({
                    success: false,
                    message: `${this.modelName} not found or you do not have permission to update it`
                });
            }

            console.debug(`\n updated ${this.modelName} ==> ${updatedLensPackage}`)

            res.status(200).json({
                success: true,
                message: `${this.modelName} updated successfully`,
                data: updatedLensPackage
            });
        } catch (error) {
            console.error(`Error updating ${this.modelName}:`, error);
            next(error);
            return;
        }
    };

    getLensPackagebyID = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const lensPkgId = req.params.id;
            console.debug(`\n ${this.modelName} id for searching ==> ${lensPkgId}`);

            const lensPkg = await this.lensPackageService.getLensPackageById(lensPkgId);

            if (!lensPkg) {
                console.warn(`${this.modelName} not found`);
                throw new AppError("Lens package not found", 404);
            }

            console.debug(`${this.modelName} found ==> ${lensPkg}`)
            res.status(200).send({
                success: true,
                message: `${this.modelName} fetched successfully`,
                data: lensPkg
            })
            return;

        } catch (error) {
            console.error(`Error while fetching ${this.modelName} by id ==> ${error}`);
            next(error);
            return;
        }
    }

    //Get all lens package all : for admin , limited by vendor Id
    getAllLensPackage = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 30
            const productCode = req.query.code as string
            const vendorId = req.query.vendorId as string

            console.debug(`Gell all ${this.modelName} params \nPage: ${page}, Limit: ${limit}, Product Code: ${productCode}`);

            const skip = (page - 1) * limit;

            // const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ?  : req.user?.id
            const query: any = {};

            //Assign package code if provided
            if (productCode) {
                query.productCode = productCode;
            }

            if (["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string)) {
                if (vendorId) {
                    query.vendorId = vendorId
                }
            } else if (req.user?.role === "VENDOR") {
                if (vendorId && req.user?.id !== vendorId) {
                    console.warn(`Vendor ${req.user?.id} attempted to access other vendor's data`);
                    throw new AppError(`Vendor ${req.user?.id} attempted to access other vendor's data`, 400);
                } else {
                    query.vendorId = req.user?.id
                }
            }

            console.debug(`\nQuery for fetching ${this.modelName} ==>  ${query}`);

            const data = await this.lensPackageService.getAllLensPackage(query, skip, limit);

            console.debug(`\nFetched ${this.modelName} ==> ${data.lensPackages}`);
            console.debug(`\nTotal ${this.modelName} count ==> ${data.total}`);

            res.status(200).send({
                success: true,
                message: `${this.modelName} fetched successfully`,
                data
            });
            return;


        } catch (error) {
            console.error(`Error geting all ${this.modelName}:`, error);
            next(error);
            return;
        }
    }

    //Delete Lens Package
    deleteLensPackage = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const packageId = req.params.id
            console.debug(`\nDeleting ${this.modelName} with ID ==> ${packageId}`);

            const vendorId = ["ADMIN", "SUPER_ADMIN"].includes(req.user?.role as string) ? "" : req.user?.id
            const query: any = { _id: packageId };

            vendorId && (query.vendorId = vendorId)
            console.debug(`\nQuery for fetching ${this.modelName} ==>  ${query}`);

            const lensPackage = await this.lensPackageService.deleteLensPackage(query)

            if (!lensPackage) {
                console.warn(`${this.modelName} with ID ${packageId} not found or not authorized to delete`);
                throw new AppError("Lens package not found", 404);
            }

            console.debug(`\n ${this.modelName} deleted ==> ${lensPackage}`)

            res.status(200).send({
                success: true,
                message: `${this.modelName} deleted`,
                data: lensPackage
            })

        } catch (error) {
            console.error(`Deleting ${this.modelName}:`, error);
            next(error);
            return;
        }
    }
}