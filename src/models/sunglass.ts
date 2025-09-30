import mongoose, { Document } from "mongoose";
import { baseProductSchema } from "./products.js";

interface ISunglass extends Document {
    productCode: string;
    brand_name: string;
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
    is_Power: { type: Boolean, default: false },
    type: { type: String, default: "Sunglass" },
    variants: [{
                frame_color: { type: String },
        temple_color: { type: String },
                lens_color: { type: String },
        price: {
            base_price: { type: Number, required: true },
            mrp: { type: Number, required: true },
            shipping_price: {
                custom: { type: Boolean, default: false },
                value: { type: Number, default: 0 }
            },
            total_price: { type: Number, required: true }
        },
        images: [
            { url: { type: String, trim: true } }
        ],
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
        },
    }]
})

sunglassSchema.index({
    brand_name: 'text',
    vendorId: 1
})

export const Sunglass = mongoose.model<ISunglass>("Sunglass", sunglassSchema);