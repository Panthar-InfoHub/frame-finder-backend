import mongoose from "mongoose";
const miscSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "type is required field"],
    },
    values: [
        {
            type: String,
            trim: true,
        }
    ]
}, { timestamps: true });
export const Miscellaneous = mongoose.model("miscellaneous", miscSchema);
