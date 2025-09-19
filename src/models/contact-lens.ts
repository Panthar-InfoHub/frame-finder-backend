import mongoose from "mongoose";
import { generateReadableProductCode } from "../lib/helper.js";
import { baseProductSchema } from "./products.js";

const contactLensSchema = baseProductSchema.clone();

contactLensSchema.remove("material")
contactLensSchema.remove("shape")
contactLensSchema.remove("style")
contactLensSchema.remove("sizes")
contactLensSchema.remove("gender")

contactLensSchema.add({
    exp_date: { type: Date, required: [true, "Expiry Date required for contact lens "] },
    contact_lens_cover: { type: Boolean },
    price: {
        base_price: { type: Number, required: true },
        mrp: { type: Number, required: true },
    },
    images: [
        { url: { type: String, trim: true } }
    ],
    size: [String]
})

// Generate product ID before saving
contactLensSchema.pre('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("CNTLNS");
    }
    next();
});
export const ContactLens = mongoose.model("ContactLens", contactLensSchema)