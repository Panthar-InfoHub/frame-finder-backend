import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"]
    },
    quantity: {
        type: Number,
        default: 1
    },
    is_prescription: {
        type: Boolean,
        default: false
    },
    lens_type: {
        type: String,
        trim: true,
    },
    prescription: {
        type: mongoose.Schema.Types.Mixed,
        required: function () {
            return this.is_prescription;
        }
    },
    lens: {
        type: String,
        trim: true
    },
    saved_at: {
        type: Date,
        default: Date.now
    },
    refund: {
        type: Boolean,
        default: false
    }
}, { _id: false });
const wishListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },
    items: [itemSchema]
}, { timestamps: true });
export const WishList = mongoose.model("WishList", wishListSchema);
