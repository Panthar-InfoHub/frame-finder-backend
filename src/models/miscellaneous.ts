import mongoose from "mongoose";

const miscSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "type is required field"],
        unique: true
    },
    values: [
        {
            type: String,
            trim: true,
        }
    ],
    miscellaneous: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export const Miscellaneous = mongoose.model("miscellaneous", miscSchema)