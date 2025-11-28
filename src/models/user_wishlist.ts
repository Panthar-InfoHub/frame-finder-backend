// This file defines the Wishlist model for Frame finder
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Product ID is required"],
        refPath: 'items.onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: {
            values: ['Sunglass', 'Product', 'ContactLens', 'ColorContactLens', 'Reader', 'Accessories', 'LensSolution'],
            message: '{VALUE} is not a valid type'
        },
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
    },

}, { timestamps: true })

const user_wishlist_schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    items: [itemSchema],
}, { timestamps: true });

export const UserWishlist = mongoose.model("user_wishlist", user_wishlist_schema);