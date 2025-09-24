import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product ID is required"],
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Sunglass', 'Product', 'ContactLens', 'Accessories']
    },

    variant: {
        type: mongoose.Schema.Types.ObjectId,
    },
    quantity: {
        type: Number,
        default: 1
    },
    prescription: {
        type: mongoose.Schema.Types.Mixed
    },
    lens_package_detail: {
        package_type: { type: String },
        package_design: { type: String },
        package_price: { type: Number }
    }

}, { timestamps: true })

const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    items: [itemSchema],

    subTotal: {
        type: Number,
    }
}, { timestamps: true });

export const WishList = mongoose.model("WishList", wishListSchema);