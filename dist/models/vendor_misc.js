import mongoose from "mongoose";
const vendorMisc = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    type: {
        type: String,
        trim: true,
        required: true
    },
    values: [
        {
            type: String,
            trim: true,
            required: true
        }
    ]
}, { timestamps: true });
export const VendorMisc = mongoose.model("VendorMisc", vendorMisc);
