import mongoose from "mongoose";
//Usage limit : How many time we can use a single coupon
// User usage limit : How many time a single user can use a particular coupon;
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
    },
    type: {
        type: String,
        enum: {
            values: ["number", "percentage"],
            message: '${VALUE} is not a valid type'
        },
        required: [true, "Type is required"]
    },
    value: {
        type: Number,
        min: 0,
        required: [true, "Discount value is required"]
    },
    scope: {
        type: String,
        enum: {
            values: ["vendor", "global"],
            message: '${VALUE} is not a valid scope'
        },
        required: [true, "Usage Scope is required"]
    },
    min_order_limit: {
        type: Number,
        min: 0
    },
    usage_limit: {
        type: Number,
        min: [1, "Minimun usage limit should be greater than equal to 1"],
        default: 1
    },
    user_usage_limit: {
        type: Number,
        min: 1
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: function (this: any) {
            return this.scope === 'vendor';
        }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    exp_date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value: Date) {
                return value > new Date();
            },
            message: "Expiry date must be greater than today's date."
        }
    }
}, { timestamps: true });

couponSchema.index({ code: 1, vendorId: 1, is_active: 1 });
couponSchema.index({ vendorId: 1 })
couponSchema.index({
    code: 'text',
});

export const Coupon = mongoose.model("Coupon", couponSchema);