import mongoose from "mongoose";

export const baseProductSchema = new mongoose.Schema({
    productCode: {
        type: String,
        unique: true,
        required: true
    },
    brand_name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    dimension: {
        lens_width: String,
        bridge_width: String,
        temple_length: String,
        lens_height: String,
    },
    material: [String],
    shape: [String],
    style: [String],
    hsn_code: {
        type: String,
        required: [true, "HSN Code is required, cannot be empty!!"],
        trim: true
    },
    sizes: [{
        type: String,
        enum: {
            values: ['S', 'M', 'L', 'XL'],
            message: '{VALUE} is not a valid gender'
        },
        default: ['']
    }],
    gender: [{
        type: String,
        enum: {
            values: ['male', 'female', 'kids', 'unisex'],
            message: '{VALUE} is not a valid gender'
        },
        default: ['unisex']
    }],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: [true, 'Product vendor is required']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    total_reviews: {
        type: Number,
        default: 0,
        min: 0,
    },

    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'pending'],
            message: '{VALUE} is not a valid status'
        },
        default: 'active'
    }
}, { timestamps: true })




const productSchema = baseProductSchema.clone();

productSchema.add({
    is_Power: { type: Boolean, default: false },
    type: { type: String, default: "Product" },
    variants: [{
        frame_color: { type: String },
        temple_color: { type: String },
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



// Pattern: find({ status: 'active' }).sort({ createdAt: -1 }).skip().limit()
productSchema.index({ status: 1, createdAt: -1 });

// Pattern: find({ vendorId: id, status: 'active' }).sort({ createdAt: -1 })
productSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Pattern: findOneAndUpdate({ _id: id, "variants._id": variantId })
productSchema.index({ "variants._id": 1 });

// Pattern: find({ $text: { $search: "query" } })
productSchema.index({
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
    name: "product_text_search"
});

// ==========================================
// Future indexes for anticipated features

// Index : Gender/Category filtering with pagination
// Pattern: find({ gender: 'male', status: 'active' }).sort({ createdAt: -1 })
productSchema.index({
    gender: 1,
    status: 1,
    createdAt: -1
});

// Index : "Top Rated" or "Best Sellers" feature
// Pattern: find({ status: 'active' }).sort({ rating: -1, total_reviews: -1 })
productSchema.index({
    status: 1,
    rating: -1,
    total_reviews: -1
});

// Index : Low stock alerts (inventory management)
// Pattern: find({ "variants.stock.current": { $lte: minimum } })
productSchema.index({
    "variants.stock.current": 1,
    status: 1
});

// Index : Price-based search (if you add this feature)
// Pattern: find({ status: 'active' }).sort({ "variants.price.total_price": 1 })
productSchema.index({
    status: 1,
    "variants.price.total_price": 1
});




export const Product = mongoose.model("Product", productSchema);