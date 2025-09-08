import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";
import { generateReadableProductCode } from "../lib/helper.js";
const sunglassSchema = baseProductSchema.clone();
sunglassSchema.add({
    is_Power: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "sunglass"
    },
    lens_color: {
        type: [String]
    }
});
// Generate product ID before saving
sunglassSchema.pre('validate', async function (next) {
    if (this.isNew && !this.productCode) {
        this.productCode = generateReadableProductCode("SUNGLS");
    }
    next();
});
export const Sunglass = mongoose.model("Sunglass", sunglassSchema);
