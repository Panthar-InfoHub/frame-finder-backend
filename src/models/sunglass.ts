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

// ==========================================
// Indexes for Sunglass

// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
sunglassSchema.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
sunglassSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: findOneAndUpdate({ _id: id, "variants._id": variantId })
sunglassSchema.index({ "variants._id": 1 });

// Pattern: find({ $text: { $search: "query" } })
sunglassSchema.index({
    brand_name: "text",
    material: "text",
    shape: "text",
    style: "text"
}, {
    weights: {
        brand_name: 10,
        style: 5,
        shape: 3,
        material: 1
    },
    name: "sunglass_text_search"
});

// ==========================================
// Future indexes for anticipated features

// Index : Gender/Category filtering with pagination
// Pattern: find({ gender: 'male', status: 'active' }).sort({ createdAt: -1 })
sunglassSchema.index({
    gender: 1,
    status: 1,
    createdAt: -1
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
sunglassSchema.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "variants.stock.current": { $lte: minimum } })
sunglassSchema.index({
    "variants.stock.current": 1,
    status: 1
});

// Index : Price-based search (if you add this feature)
// Pattern: find({ status: 'active' }).sort({ "variants.price.total_price": 1 })
sunglassSchema.index({
    status: 1,
    "variants.price.total_price": 1
});

// Index : Power filtering for sunglasses
// Pattern: find({ is_Power: true, status: 'active' })
sunglassSchema.index({
    is_Power: 1,
    status: 1
});


export const Sunglass = mongoose.model<ISunglass>("Sunglass", sunglassSchema);