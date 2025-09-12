import mongoose from "mongoose";
import { generateReadableProductCode } from "../lib/helper.js";

const lensPackageSchema = new mongoose.Schema({
    packageCode: {
        type: String,
        unique: true,
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    packageImage: [
        {
            url: {
                type: String,
                trim: true
            }
        }
    ],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    package_design: {
        type: String,
        required: true,
        trim: true
    },
    index: {
        type: String,
        required: true,
    },
    stock: {
        current: {
            type: Number,
            default: 0,
            min: 0
        },
        minimum: {
            type: Number,
            default: 5,
            min: 0
        },
        maximum: {
            type: Number,
            default: 100,
            min: 0
        }
    },
    packagePrice: {
        type: Number,
        required: true,
    },
    package_type: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true })

lensPackageSchema.index({ vendorId: 1, package_design: 1, package_type: 1 })

// Generate package Code before saving
lensPackageSchema.pre('validate', async function (next) {
    if (this.isNew && !this.packageCode) {
        this.packageCode = generateReadableProductCode("LPKG");
    }
    next();
});

export const LensPackage = mongoose.model("LensPackage", lensPackageSchema)