import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";

const lensSolutionSchema = baseProductSchema.clone();

lensSolutionSchema.remove([
    "dimension",
    "material",
    "shape",
    "style",
    "sizes",
    "gender",
    "hsn_code"
]);

lensSolutionSchema.add({
    type: { type: String, default: "LensSolution" },
    variants: [{
        sizes: {
            type: String,
            trim: true,
            required: [true, "Size is required"]
        },
        lens_material: [{ type: String }],
        images: [{ url: { type: String, trim: true } }],
        hsn_code: {
            type: String,
            required: [true, "HSN Code is required, cannot be empty!!"],
            trim: true
        },
        mfg_date: { type: Date, default: Date.now, required: true },
        exp_date: {
            type: Date,
            validate: {
                validator: function (value: any) {
                    return value > (this as any).mfg_date;
                },
                message: 'Expiry date must be after manufacturing date'
            }
        },
        origin_country: { type: String },
        case_available: { type: Boolean },
        price: {
            base_price: {
                type: Number, required: true, min: [0, 'Base price cannot be negative']
            },
            mrp: {
                type: Number, required: true, min: [0, 'MRP cannot be negative']
            },
            shipping_price: {
                custom: { type: Boolean, default: false },
                value: { type: Number, default: 0 }
            },
            total_price: {
                type: Number, required: true, min: [0, 'Total price cannot be negative']
            }
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
    }],
})

// ==========================================
// Indexes for LensSolution

// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
lensSolutionSchema.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
lensSolutionSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: findOneAndUpdate({ _id: id, "variants._id": variantId })
lensSolutionSchema.index({ "variants._id": 1 });

// Pattern: find({ $text: { $search: "query" } })
lensSolutionSchema.index({
    brand_name: "text",
    material: "text"
}, {
    weights: {
        brand_name: 10,
        material: 1
    },
    name: "lens_solution_text_search"
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
lensSolutionSchema.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "variants.stock.current": { $lte: minimum } })
lensSolutionSchema.index({
    "variants.stock.current": 1,
    status: 1
});

// Index : Price-based search
// Pattern: find({ status: 'active' }).sort({ "variants.price.total_price": 1 })
lensSolutionSchema.index({
    status: 1,
    "variants.price.total_price": 1
});

// Index : Size filtering (bottle sizes)
// Pattern: find({ "variants.sizes": '100ml', status: 'active' })
lensSolutionSchema.index({
    "variants.sizes": 1,
    status: 1
});

// Index : Expiry date monitoring
// Pattern: find({ "variants.exp_date": { $lte: date } })
lensSolutionSchema.index({
    "variants.exp_date": 1,
    status: 1
});

// Index : Lens material compatibility filtering
// Pattern: find({ "variants.lens_material": 'silicone_hydrogel', status: 'active' })
lensSolutionSchema.index({
    "variants.lens_material": 1,
    status: 1
});

export const LensSolution = mongoose.model("LensSolution", lensSolutionSchema);