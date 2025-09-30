import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";

const accessories = baseProductSchema.clone();

accessories.remove('shape')
accessories.remove('dimension')
accessories.remove('style')
accessories.remove('gender')

//Add images to base schema 
accessories.add({
    type: { type: String, default: "Accessories" },
    images: [
        { url: { type: String, trim: true } }
    ],
    mfg_date: { type: Date, default: Date.now },
    exp: { type: Date },
    origin_country: { type: String },
    price: {
        base_price: { type: Number, required: true },
        mrp: { type: Number, required: true },
        total_price: { type: Number, required: true }
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

    // sizes: [String],
})

accessories.index({
    brand_name: 'text',
    vendorId: 1
})

export const Accessories = mongoose.model("Accessories", accessories)