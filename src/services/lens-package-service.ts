import { Model } from "mongoose";

export class LensPackageClass {

    model: Model<any>;
    modelName: string;

    constructor(model: Model<any>, modelName: string) {
        this.model = model;
        this.modelName = modelName;
    }

    async createLensPackage(data: any) {
        console.debug("\ncreating lens package inside service..")

        return await this.model.create(data)
    }

    async updateLensPackage(query: any, updateData: any) {
        try {
            const updatedLensPackage = await this.model.findOneAndUpdate(
                query,
                updateData,
                { new: true, runValidators: true }
            );
            return updatedLensPackage;
        } catch (error) {
            console.error("Error updating lens package:", error);
            throw error;
        }
    }

    async getLensPackageById(id: string) {
        return await this.model.findById(id).populate("vendorId", "business_name email phone logo");
    }

    async getAllLensPackage(query: any, skip: number, limit: number) {
        const [res, total] = await Promise.all([
            this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("vendorId", "business_name email phone logo"),
            this.model.countDocuments(query)
        ])
        return {
            lensPackages: res,
            total,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async deleteLensPackage(query: any) {
        return await this.model.findOneAndDelete(query);
    }
}