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
productSchema.index({
    brand_name: 'text',
    vendorId: 1
})

export const Product = mongoose.model("Product", productSchema);