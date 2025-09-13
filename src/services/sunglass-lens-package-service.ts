import { SunglassLensPackage } from "../models/sunglass-lens-package.js";

class SunglassLensPackageClass {
    async createLensPackage(data: any) {
        console.debug("\ncreating sunglass lens package inside service..")

        return await SunglassLensPackage.create(data)
    }

    async updateLensPackage(query: any, updateData: any) {
        try {
            const updatedLensPackage = await SunglassLensPackage.findOneAndUpdate(
                query,
                updateData,
                { new: true, runValidators: true }
            );
            return updatedLensPackage;
        } catch (error) {
            console.error("Error updating sunglass lens package:", error);
            throw error;
        }
    }
}


export const SunglassLensPackageService = new SunglassLensPackageClass();