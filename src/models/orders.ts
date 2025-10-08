import mongoose from "mongoose";
import { generateReadableProductCode } from "../lib/helper.js";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    prescription: {
        type: mongoose.Schema.Types.Mixed,
    },
    lens_package_detail: {
        package_type: { type: String },
        package_design: { type: String },
        package_price: { type: Number }
    },
    product_snapshot: {
        productCode: { type: String, required: true },
        brand_name: { type: String },
        // Store the variant details that were purchased
        variant_details: {
            total_price: Number,
            frame_color: String,
            temple_color: String,
            image_url: String
        },
    },

    vendor_snapshot: {
        business_name: { type: String },
        business_owner: { type: String },
    },
}, { _id: true });


const orderSchema = new mongoose.Schema({
    orderCode: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    user_snapshot: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    },
    items: [orderItemSchema],

    payment_attempts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    shipping_address: {
        address_line_1: String,
        city: String,
        state: String,
        pincode: String,
        phone: { type: String, required: true }
    },
    order_status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    tracking_id: {
        type: String,
        trim: true
    },

    total_amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping_cost: { type: Number, default: 0 },
    coupon_code: { type: String, trim: true, uppercase: true, default: "" },
    discount: { type: Number, default: 0 },

}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({
    orderCode: 'text',
    'items.productName': 'text',
    'shipping_address.phone': 'text',
    'shipping_address.city': 'text',
    'tracking_id': 'text'
});

// Generate product ID before saving
orderSchema.pre('validate', async function (next) {
    if (this.isNew && !this.orderCode) {
        this.orderCode = generateReadableProductCode("ORD");
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);