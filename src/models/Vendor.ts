import bcrypt from "bcrypt";
import mongoose, { Document } from "mongoose";
import AppError from "../middlwares/Error.js";

interface IVendor extends Document {
    business_name?: string;
    business_owner?: string;
    address?: {
        address_line_1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    email?: string;
    phone: string;
    password?: string;
    gst_number?: string;
    logo?: string;
    banner?: string;
    rating?: number;
    isActive: boolean;
    role: string;
    phoneVerification?: {
        otp?: string;
        otpExpires?: Date;
        isVerified: boolean;
    };
}



interface vendorSchemaType extends mongoose.Model<IVendor> {
    comparePassword(password: string): Promise<Boolean>;
    verifyOtp(phone: string, otp: string): Promise<Boolean>;
}


const vendorSchema = new mongoose.Schema<IVendor, vendorSchemaType>({
    business_name: {
        type: String,
        trim: true,
        // required: [true, "Business name is required for vendor"]
    },
    business_owner: {
        type: String,
        trim: true,
        // required: [true, "Business owner is required for vendor"]
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
        // required: [true, "Email is required for vendor"]
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
        select: false
        // required: [true, "Password is required for vendor"]
    },
    gst_number: {
        type: String,
        // required: true,
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
        default: false,
    },
    role: {
        type: String,
        default: "VENDOR",
    },
    phoneVerification: {
        type: {
            otp: { type: String },
            otpExpires: { type: Date },
            isVerified: { type: Boolean, default: false }
        },
        select: false
    }

}, { timestamps: true });

vendorSchema.pre('validate', async function (next) {
    console.debug("in vendor validate....")


    if (this.isModified('password') && this.password) {
        console.debug("Password has been modified, hashing now...");
        try {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error: any) {
            return next(error);
        }
    }
    next();
});

vendorSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
}

vendorSchema.statics.verifyOtp = async function (phone: string, otp: string) {
    const vendor = await this.findOne({ phone, isActive: false }).select("+phoneVerification");
    if (!vendor || !vendor.phoneVerification || vendor.phoneVerification.isVerified) {
        console.warn("Vendor not found or Vendor already verified.");
        throw new AppError("Vendor not found or Vendor already verified.", 400);
    }

    if (!vendor.phoneVerification.otpExpires || vendor.phoneVerification.otpExpires < new Date()) {
        console.warn("OTP has expired.");
        throw new AppError("OTP has expired.", 410);
    }

    const isMatch = await bcrypt.compare(otp, vendor.phoneVerification.otp!);
    if (!isMatch) {
        console.warn("Invalid OTP.");
        throw new AppError("Invalid OTP.", 400);
    }

    vendor.phoneVerification.isVerified = true;
    vendor.phoneVerification.otp = undefined;
    vendor.phoneVerification.otpExpires = undefined;
    await vendor.save();
    return true;
}

export const Vendor = mongoose.model<IVendor, vendorSchemaType>("Vendor", vendorSchema);
