import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        trim: true
    },
    last_name: {
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
    gender: {
        type: String,
        trim: true,
        enum: {
            values: ['male', 'female', 'others'],
            message: '{VALUE} is not a valid status'
        }
    },
    password: {
        type: String,
        trim: true,
        select: false
    },
    wallet_point: {
        type: Number,
        default: 0
    },
    prescription: {
        type: mongoose.Schema.Types.Mixed
    },
    address: [{
        address_line_1: String,
        city: String,
        state: String,
        pincode: String,
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: "USER"
    },
    fcm_token: {
        type: String,
        trim: true,
    }
}, { timestamps: true })

userSchema.pre('validate', async function (next): Promise<void> {
    if (!this.isModified('password')) return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model('User', userSchema)