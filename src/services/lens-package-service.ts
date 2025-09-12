import { LensPackage } from "../models/lens-package.js"

class LensPackageClass {
    async createLensPackage(data: any) {
        console.debug("\ncreating lens package inside service..")

        return await LensPackage.create(data)
    }

    async updateLensPackage(query: any, updateData: any) {
        try {
            const updatedLensPackage = await LensPackage.findOneAndUpdate(
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
}


export const LensPackageService = new LensPackageClass();