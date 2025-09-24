import mongoose from "mongoose";
import { generateReadableProductCode } from "../lib/helper.js";
import { baseProductSchema } from "./products.js";

const accessories = baseProductSchema.clone();

accessories.remove('shape')
accessories.remove('style')
accessories.remove('sizes')
accessories.remove('gender')

//Add images to base schema 
accessories.add({
    type: { type: String, default: "Accessories" },
    images: [
        { url: { type: String, trim: true } }
    ],
    price: {
        base_price: { type: Number, required: true },
        mrp: { type: Number, required: true },
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
})

accessories.index({
    brand_name: 'text',
    desc: 'text',
    vendorId: 1
})

// Generate package Code before saving
accessories.pre('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("ACS");
    }
    next();
});
export const Accessories = mongoose.model("Accessories", accessories)