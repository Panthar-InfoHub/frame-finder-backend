import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        sparse: true
    },
    icon: {
        type: String,
        trim: true,
    },
    desc: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
export const Category = mongoose.model('Category', categorySchema);
