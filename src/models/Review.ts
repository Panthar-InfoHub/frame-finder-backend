import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User id is required"] },
    product: { type: mongoose.Schema.Types.ObjectId, refPath: 'onModel', required: [true, "Product id is required"] },
    onModel: { type: String, required: true },

    rating: { type: Number, required: [true, "Rating is required"], min: 1, max: 5 },
    comment: { type: String, required: [true, "Comment is required"] },
    images: [
        {
            url: { type: String },
        }
    ],
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);