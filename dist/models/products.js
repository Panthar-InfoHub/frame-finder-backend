import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
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
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Product price must be positive'],
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Product discount must be positive'],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, 'Product category is required']
    },
    product_type: {
        type: String,
        enum: {
            values: ['sunglasses', 'contact_lens', 'eyeglasses', 'powered_lens'],
            message: '{VALUE} is not a valid product type'
        },
        required: [true, 'Product type is required']
    },
    frame_type: {
        type: String,
        trim: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: [true, 'Product vendor is required']
    },
    color: [String],
    size: [String],
    gender: [{
            type: String,
            enum: {
                values: ['male', 'female', 'unisex'],
                message: '{VALUE} is not a valid gender'
            },
            default: 'unisex'
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
    power_support: {
        type: Boolean,
        required: function () {
            return this.product_type !== 'sunglasses';
        },
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
        default: 'pending'
    }
}, { timestamps: true });
productSchema.index({
    name: 'text',
    desc: 'text',
    categoryId: 1
});
export const Product = mongoose.model("Product", productSchema);
