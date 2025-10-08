import mongoose from "mongoose";
import { baseLensPackageSchema } from "./frame-lens-package.js";

const sunglassLensPackage = baseLensPackageSchema.clone();

sunglassLensPackage.add({
    lens_color: { type: String, required: true, trim: true, unique: true, lowercase: true },
})

sunglassLensPackage.index({ vendorId: 1, package_design: 1, lens_color: 1 })

export const SunglassLensPackage = mongoose.model('SunglassLensPackage', sunglassLensPackage);