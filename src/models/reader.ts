import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";



const readerSchema = baseProductSchema.clone()

readerSchema.add({
    type: { type: String, default: "Reader" },
    variants: [{
        frame_color: { type: String },
        temple_color: { type: String },
        lens_color: { type: String },
        power: [{
            type: Number,
            min: -10,
            max: 10,
            default: 0
        }],
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

readerSchema.index({
    brand_name: 'text',
})

export const Reader = mongoose.model("Reader", readerSchema);