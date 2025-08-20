import mongoose from "mongoose";
import bcrypt from "bcrypt";

interface adminSchemaType extends mongoose.Model<any> {
    comparePassword(password: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for admin"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
    },
    role: {
        type: String,
        enum: {
            values: ["SUPER_ADMIN", "ADMIN"],
            message: `{VALUE} is not a correct role`
        },
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

adminSchema.pre('validate', async function (next) {
    console.debug("in validate....")

    if (this.isNew) {
        console.debug("In password...")
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

adminSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
}

export const Admin = mongoose.model<any, adminSchemaType>('Admin', adminSchema)