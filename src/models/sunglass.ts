import mongoose, { Document } from "mongoose";
import { baseProductSchema } from "./products.js";
import { generateReadableProductCode } from "../lib/helper.js";

interface ISunglass extends Document {
    productCode: string;
    brand_name: string;
    desc: string;
    variants: Array<{
        frame_color: string[];
        temple_color: string[];
        lens_color: string[];
        price: number;
        images: Array<{ url: string }>;
    }>;
    material: string[];
    shape: string[];
    style: string[];
    hsn_code: string;
    sizes: ('S' | 'M' | 'L' | 'XL')[];
    gender: ('male' | 'female' | 'kids' | 'unisex')[];
    stock: {
        current: number;
        minimum: number;
        maximum: number;
    };
    // categoryId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    rating: number;
    status: 'active' | 'inactive' | 'pending';
    is_Power: boolean;
    createdAt: Date;
    updatedAt: Date;
    type: string
}


const sunglassSchema = baseProductSchema.clone()

sunglassSchema.add({
    is_Power: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "sunglass"
    },
    variants: [{
        frame_color: [String],
        temple_color: [String],
        lens_color: [String],
        price: {
            base_price: { type: Number, required: true },
            mrp: { type: Number, required: true },
        },
        images: [
            { url: { type: String, trim: true } }
        ],
    }]
})

// Generate product ID before saving
sunglassSchema.pre<ISunglass>('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("SUNGLS");
    }
    next();
});

export const Sunglass = mongoose.model<ISunglass>("Sunglass", sunglassSchema);