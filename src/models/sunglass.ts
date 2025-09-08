import mongoose, { Document } from "mongoose";
import { baseProductSchema } from "./products.js";
import { generateReadableProductCode } from "../lib/helper.js";

interface ISunglass extends Document {
    productCode: string;
    brand_name: string;
    desc: string;
    images: Array<{ url: string }>;
    frame_color: string[];
    temple_color: string[];
    material: string[];
    shape: string[];
    style: string[];
    hsn_code: string;
    price: number;
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
    // Sunglass-specific fields
    is_Power: boolean;
    lens_color: string[];
    // Timestamps
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
    lens_color: {
        type: [String]
    }
})

// Generate product ID before saving
sunglassSchema.pre<ISunglass>('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("SUNGLS");
    }
    next();
});

export const Sunglass = mongoose.model<ISunglass>("Sunglass", sunglassSchema);