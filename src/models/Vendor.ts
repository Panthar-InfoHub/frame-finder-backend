import bcrypt from "bcrypt";
import mongoose, { Document } from "mongoose";

interface IVendor extends Document {
    _id: mongoose.Types.ObjectId;
    business_name?: string;
    business_owner?: string;
    firm_name?: string;
    dob?: Date;
    company_pan?: string;
    year_of_experience?: number;
    total_reviews?: number;
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
    bank_details?: {
        account_holder_name?: string;
        account_number?: string;
        ifsc_code?: string;
    }
    premium_member?: boolean;
    meta?: {
        email_notifications?: {
            new_order?: boolean;
            return?: boolean;
            payout?: boolean;
        };
        other_notifications?: {
            sms_notification?: boolean;
            app_notification?: boolean;
        };
        language?: string;
        curreny?: string;
    };
    categories?: [string];
}



interface vendorSchemaType extends mongoose.Model<IVendor> {
    comparePassword(password: string): Promise<Boolean>;
    verifyOtp(phone: string, otp: string): Promise<Boolean>;
}


const vendorSchema = new mongoose.Schema<IVendor, vendorSchemaType>({
    business_name: { //brand name
        type: String,
        trim: true,
        // required: [true, "Business name is required for vendor"]
    },
    company_pan: {
        type: String,
        trim: true,
    },
    business_owner: {
        type: String,
        trim: true,
        // required: [true, "Business owner is required for vendor"]
    },
    firm_name: {
        type: String,
        trim: true,
    },
    dob: {
        type: Date,
        trim: true,
    },
    year_of_experience: {
        type: Number,
        trim: true,
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
    total_reviews: {
        type: Number,
        default: 0,
        min: 0,
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
    },
    bank_details: {
        account_holder_name: { type: String, trim: true },
        account_number: { type: String, trim: true },
        ifsc_code: { type: String, trim: true },
        bank_name: { type: String, trim: true },
        personal_aadhar: { type: String, trim: true },
        personal_pan: { type: String, trim: true },
    },
    premium_member: {
        type: Boolean,
        default: false,
    },
    meta: {
        email_notifications: {
            new_order: { type: Boolean, default: true },
            return: { type: Boolean, default: true },
            payout: { type: Boolean, default: true },
        },
        other_notifications: {
            sms_notification: { type: Boolean, default: false },
            app_notification: { type: Boolean, default: false },
        },
        language: { type: String, default: "en" },
        curreny: { type: String, default: "INR" },
    },
    categories: [String]

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


export const Vendor = mongoose.model<IVendor, vendorSchemaType>("Vendor", vendorSchema);