import mongoose from "mongoose";

const vendor_request_Schema = new mongoose.Schema({
    full_name: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    designation: {
        type: String,
        required: [true, "Designation is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        validate: {
            validator: function (email: string) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Invalid email address",
        },
    },
    phone_number: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    has_gst: {
        type: Boolean,
        required: [true, "Has GST is required"],
    },
    gst_number: {
        type: String,
        required: function () {
            return this.has_gst === true;
        },
        trim: true,
    },
    business_type: [{
        type: String,
        required: [true, "Business type is required"],
        trim: true,
    }],
    business_name: {
        type: String,
        required: [true, "Business name is required"],
        trim: true,
    },
    address: {
        address_line_1: String,
        city: String,
        state: String,
        pincode: String,
    },
    product_category: [{
        type: String,
        required: [true, "Product category is required"],
        trim: true,
    }],
    online_presence: {
        website: Boolean,
        social_media: Boolean,
        marketing_platform: Boolean,
    },
    rating: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "accepted", "rejected"],
            message: "{VALUE} is not a status"
        },
        default: "pending"
    }
}, { timestamps: true });

export const VendorRequest = mongoose.model("VendorRequest", vendor_request_Schema);