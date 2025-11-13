import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";



const readerSchema = baseProductSchema.clone()

readerSchema.add({
    type: { type: String, default: "Reader" },
    variants: [{
        frame_color: { type: String },
        temple_color: { type: String },
        lens_color: { type: String },
        power: [{
            type: Number,
            min: -10,
            max: 10,
            default: 0
        }],
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
// Indexes for Reader


// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
readerSchema.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
readerSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: findOneAndUpdate({ _id: id, "variants._id": variantId })
readerSchema.index({ "variants._id": 1 });

// Pattern: find({ $text: { $search: "query" } })
readerSchema.index({
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
    name: "reader_text_search"
});

// Index : Gender/Category filtering with pagination
// Pattern: find({ gender: 'male', status: 'active' }).sort({ createdAt: -1 })
readerSchema.index({
    gender: 1,
    status: 1,
    createdAt: -1
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
readerSchema.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "variants.stock.current": { $lte: minimum } })
readerSchema.index({
    "variants.stock.current": 1,
    status: 1
});

// Index : Price-based search
// Pattern: find({ status: 'active' }).sort({ "variants.price.total_price": 1 })
readerSchema.index({
    status: 1,
    "variants.price.total_price": 1
});

// Index : Power filtering for readers
// Pattern: find({ "variants.power": { $in: [1.0, 1.5] }, status: 'active' })
readerSchema.index({
    "variants.power": 1,
    status: 1
});


export const Reader = mongoose.model("Reader", readerSchema);