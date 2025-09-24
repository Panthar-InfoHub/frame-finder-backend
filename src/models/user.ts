import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    img: {
        url: { type: String, trim: true }
    },
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        trim: true,
        select: false
    },
    prescription: {
        type: mongoose.Schema.Types.Mixed
    },
    address: {
        address_line_1: String,
        city: String,
        state: String,
        pincode: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: "USER"
    }
}, { timestamps: true })

userSchema.pre('validate', async function (next): Promise<void> {
    if (!this.isModified('password')) return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

export const User = mongoose.model('User', userSchema)