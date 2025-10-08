import mongoose from "mongoose";

export const baseLensPackageSchema = new mongoose.Schema({
    productCode: {
        type: String,
        unique: true,
    },
    display_name: {
        type: String,
        trim: true
    },
    brand_name: {
        type: String,
        trim: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    index: {
        type: String,
        required: true,
    },
    price: {
        mrp: { type: Number, required: true },
        base_price: { type: Number, required: true },
        total_price: { type: Number, required: true }
    },
    images: [
        {
            url: {
                type: String,
                trim: true
            }
        }
    ],
    duration: { type: Number, required: [true, "Duration is required"] },
    prescription_type: {
        type: String,
        trim: true,
        required: [true, 'Prescription type is required'],
        enum: {
            values: ['single_vision', 'bi_focal', 'multi_focal'],
            message: '{VALUE} is not a valid prescription type'
        },
    },
}, { timestamps: true });

const lensPackageSchema = baseLensPackageSchema.clone();

lensPackageSchema.add({
    lens_type: { type: String, required: true, trim: true, unique: true, lowercase: true },
})

lensPackageSchema.index({ vendorId: 1, package_design: 1, package_type: 1 })


export const LensPackage = mongoose.model("LensPackage", lensPackageSchema)