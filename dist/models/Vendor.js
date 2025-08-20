import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generatePassword } from "../lib/helper.js";
const vendorSchema = new mongoose.Schema({
    business_name: {
        type: String,
        trim: true,
        required: [true, "Business name is required for vendor"]
    },
    business_owner: {
        type: String,
        trim: true,
        required: [true, "Business owner is required for vendor"]
    },
    address: {
        address_line_1: String,
        city: String,
        state: String,
        pincode: String,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Email is required for vendor"]
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "Phone number is required for vendor"]
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Password is required for vendor"]
    },
    gst_number: {
        type: String,
        required: true,
        trim: true,
    },
    logo: {
        type: String,
        trim: true
    },
    banner: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
vendorSchema.pre('validate', async function (next) {
    console.debug("in vendor validate....");
    if (this.isNew) {
        console.debug("Generating password for new vendor...");
        const pass = generatePassword("vendor");
        //Send mail to vendor
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(pass, salt);
    }
    else if (this.isModified('password')) { // For password reset or manual change
        console.debug("Password modified, hashing new password...");
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
vendorSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const Vendor = mongoose.model("Vendor", vendorSchema);
