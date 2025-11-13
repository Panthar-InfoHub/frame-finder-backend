import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";

const accessories = baseProductSchema.clone();

accessories.remove('shape')
accessories.remove('dimension')
accessories.remove('style')
accessories.remove('gender')

//Add images to base schema 
accessories.add({
    type: { type: String, default: "Accessories" },
    images: [
        { url: { type: String, trim: true } }
    ],
    mfg_date: { type: Date, default: Date.now },
    exp: { type: Date },
    origin_country: { type: String },
    price: {
        base_price: { type: Number, required: true },
        mrp: { type: Number, required: true },
        total_price: { type: Number, required: true }
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
    },

    // sizes: [String],
})

// ==========================================
// Indexes for Accessories

// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
accessories.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
accessories.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: find({ $text: { $search: "query" } })
accessories.index({
    brand_name: "text",
    material: "text"
}, {
    weights: {
        brand_name: 10,
        material: 1
    },
    name: "accessories_text_search"
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
accessories.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "stock.current": { $lte: minimum } })
accessories.index({
    "stock.current": 1,
    status: 1
});

// Index : Price-based search
// Pattern: find({ status: 'active' }).sort({ "price.total_price": 1 })
accessories.index({
    status: 1,
    "price.total_price": 1
});

// Index : Expiry date monitoring
// Pattern: find({ exp: { $lte: date } })
accessories.index({
    exp: 1,
    status: 1
});


export const Accessories = mongoose.model("Accessories", accessories)