import mongoose from "mongoose";
import { baseProductSchema } from "./products.js";

const lensSolutionSchema = baseProductSchema.clone();

lensSolutionSchema.remove([
    "dimension",
    "material",
    "shape",
    "style",
    "sizes",
    "gender",
    "hsn_code"
]);

lensSolutionSchema.add({
    variants: [{
        sizes: {
            type: String,
            trim: true,
            required: [true, "Size is required"]
        },
        lens_material: [{ type: String }],
        images: [{ url: { type: String, trim: true } }],
        hsn_code: {
            type: String,
            required: [true, "HSN Code is required, cannot be empty!!"],
            trim: true
        },
        mfg_date: { type: Date, default: Date.now, required: true },
        exp_date: {
            type: Date,
            validate: {
                validator: function (value: any) {
                    return value > (this as any).mfg_date;
                },
                message: 'Expiry date must be after manufacturing date'
            }
        },
        origin_country: { type: String },
        case_available: { type: Boolean },
        price: {
            base_price: {
                type: Number, required: true, min: [0, 'Base price cannot be negative']
            },
            mrp: {
                type: Number, required: true, min: [0, 'MRP cannot be negative']
            },
            shipping_price: {
                custom: { type: Boolean, default: false },
                value: { type: Number, default: 0 }
            },
            total_price: {
                type: Number, required: true, min: [0, 'Total price cannot be negative']
            }
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
    }],
})

export const LensSolution = mongoose.model("LensSolution", lensSolutionSchema);