import mongoose from "mongoose";
import { generateReadableProductCode } from "../lib/helper.js";
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
    desc: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    images: [
        {
            url: {
                type: String,
                trim: true
            }
        }
    ],
    frame_color: [String],
    temple_color: [String],
    material: [String],
    shape: [String],
    style: [String],
    hsn_code: {
        type: String,
        required: [true, "HSN Code is required, cannot be empty!!"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Product price must be positive'],
    },
    sizes: [{
            type: String,
            enum: {
                values: ['S', 'M', 'L', 'XL'],
                message: '{VALUE} is not a valid gender'
            },
            default: ['unisex']
        }],
    gender: [{
            type: String,
            enum: {
                values: ['male', 'female', 'kids', 'unisex'],
                message: '{VALUE} is not a valid gender'
            },
            default: ['unisex']
        }],
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
        maximum: {
            type: Number,
            default: 100,
            min: 0
        }
    },
    // categoryId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Category",
    //     required: [true, 'Product category is required']
    // },
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
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'pending'],
            message: '{VALUE} is not a valid status'
        },
        default: 'active'
    }
}, { timestamps: true });
baseProductSchema.index({
    brand_name: 'text',
    desc: 'text',
    vendorId: 1
});
const productSchema = baseProductSchema.clone();
// Generate product ID before saving
productSchema.pre('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("FRA");
    }
    next();
});
export const Product = mongoose.model("Product", productSchema);
