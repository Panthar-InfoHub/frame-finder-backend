import mongoose from "mongoose";
import { baseLensPackageSchema } from "./frame-lens-package.js";

const sunglassLensPackage = baseLensPackageSchema.clone();

sunglassLensPackage.add({
    lens_color: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    images: [
        { url: { type: String, trim: true } }
    ]
})

sunglassLensPackage.index({ vendorId: 1, package_design: 1, lens_color: 1 })

// sunglassLensPackage.pre('validate', async function (next) {
//     if (this.isNew && !this.packageCode) {
//         this.packageCode = generateReadableProductCode("SUNGLPKG");
//     }
//     next();
// });
export const SunglassLensPackage = mongoose.model('SunglassLensPackage', sunglassLensPackage);