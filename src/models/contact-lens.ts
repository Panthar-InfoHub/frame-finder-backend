import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";

const contactLensSchema = baseProductSchema.clone();


contactLensSchema.remove([
    "material",
    "shape",
    "style",
    "sizes",
    "gender",
    "hsn_code"
]);




const baseVariantSchema = new mongoose.Schema({
    disposability: {
        type: String,
        enum: {
            values: ["daily", "monthly", "quarterly", "yearly"],
            message: `{VALUE} is not a valid disposability value`
        },
        required: [true, "disposability period is required"]
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
    hsn_code: {
        type: String,
        required: [true, "HSN Code is required, cannot be empty!!"],
        trim: true
    },
    pieces_per_box: { type: Number, default: 0 },
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
    images: [{ url: { type: String, trim: true } }],
    power_range: {
        spherical: {
            min: {
                type: Number,
                validate: {
                    validator: function () {
                        const max = (this as any).power_range?.spherical?.max;
                        return max === null || (this as any).power_range.spherical.min <= max;
                    },
                    message: 'Spherical min power must be ≤ max power'
                },
            },
            max: {
                type: Number,
                validate: {
                    validator: function () {
                        const min = (this as any).power_range?.spherical?.min
                        return min === null || (this as any).power_range.spherical.min <= min;
                    },
                    message: 'Spherical max power must be greater than min power'
                }
            }
        },
        addition: {
            min: {
                type: Number,
                validate: {
                    validator: function () {
                        const max = (this as any).power_range?.addition?.max;
                        return max == null || (this as any).power_range.addition.min <= max;
                    },
                    message: 'Addition min power must be ≤ max power'
                }
            },
            max: {
                type: Number,
                validate: {
                    validator: function () {
                        const min = (this as any).power_range?.addition?.min;
                        return min == null || min <= (this as any).power_range.addition.max;
                    },
                    message: 'Addition max power must be ≥ min power'
                }
            }
        },
        cylindrical: {
            min: {
                type: Number,
                validate: {
                    validator: function () {
                        const max = (this as any).power_range?.cylindrical?.max;
                        return max == null || (this as any).power_range.cylindrical.min <= max;
                    },
                    message: 'Cylindrical min power must be ≤ max power'
                }
            },
            max: {
                type: Number,
                validate: {
                    validator: function () {
                        const min = (this as any).power_range?.cylindrical?.min;
                        return min == null || min <= (this as any).power_range.cylindrical.max;
                    },
                    message: 'Cylindrical max power must be ≥ min power'
                }
            }
        },


    },
}, { _id: true })


contactLensSchema.add({
    type: { type: String, default: "ContactLens" },
    contact_lens_cover: { type: Boolean },
    size: [String],
    variants: [baseVariantSchema],
    lens_type: {
        type: String,
        enum: {
            values: ['toric', 'non_toric', 'multi_focal'],
            message: '{VALUE} is not a valid lens type'
        },
        required: [true, 'Lens type is required']
    },
})

// ==========================================
// Indexes for ContactLens

// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
contactLensSchema.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
contactLensSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: findOneAndUpdate({ _id: id, "variants._id": variantId })
contactLensSchema.index({ "variants._id": 1 });

// Pattern: find({ $text: { $search: "query" } })
contactLensSchema.index({
    brand_name: "text"
}, {
    weights: {
        brand_name: 10
    },
    name: "contact_lens_text_search"
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
contactLensSchema.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "variants.stock.current": { $lte: minimum } })
contactLensSchema.index({
    "variants.stock.current": 1,
    status: 1
});

// Index : Price-based search
// Pattern: find({ status: 'active' }).sort({ "variants.price.total_price": 1 })
contactLensSchema.index({
    status: 1,
    "variants.price.total_price": 1
});

// Index : Lens type filtering
// Pattern: find({ lens_type: 'toric', status: 'active' })
contactLensSchema.index({
    lens_type: 1,
    status: 1
});

// Index : Disposability filtering
// Pattern: find({ "variants.disposability": 'daily', status: 'active' })
contactLensSchema.index({
    "variants.disposability": 1,
    status: 1
});

// Index : Expiry date monitoring
// Pattern: find({ "variants.exp_date": { $lte: date } })
contactLensSchema.index({
    "variants.exp_date": 1,
    status: 1
});

// Index : Size filtering
// Pattern: find({ size: '14.0', status: 'active' })
contactLensSchema.index({
    size: 1,
    status: 1
});



export const ContactLens = mongoose.model("ContactLens", contactLensSchema)