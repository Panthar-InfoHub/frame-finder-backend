// models/ProductAnalytics.ts

import mongoose from 'mongoose';

const bestSellerSchema = new mongoose.Schema({
    // Product identification
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        refPath: 'productType'
    },
    productType: {
        type: String,
        enum: ['Product', 'Sunglass', 'ContactLens', 'ColorContactLens', 'Reader', 'Accessories'],
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'Vendor'
    },

    // Sales metrics
    total_quantity_sold: {
        type: Number,
        default: 0,
        min: 0
    },
    total_revenue: {
        type: Number,
        default: 0,
        min: 0
    },
    total_orders: {
        type: Number,
        default: 0,
        min: 0
    },

    // Best seller ranking
    rank: {
        type: Number,
        index: true,
        min: 1,
        max: 30 // Only top 30
    },

    // Time period for this analytics
    period: {
        type: String,
        enum: [
            'last_7_days',
            'last_15_days',
            'last_30_days',
            'last_60_days',
            'last_90_days',
            'last_month',
            'current_month',
            'all_time'
        ],
        required: true,
        index: true
    },
}, { timestamps: true });

// 1. Primary compound index for querying best sellers by product type and period
bestSellerSchema.index({
    productType: 1,
    period: 1,
    rank: 1
});

// 2. Unique constraint: One document per product/period combination
bestSellerSchema.index({
    productId: 1,
    productType: 1,
    period: 1
}, {
    unique: true
});

// 3. Index for finding a specific product's rank
bestSellerSchema.index({
    productId: 1,
    period: 1
});

bestSellerSchema.index({
    vendorId: 1,
    period: 1
});

export const BestSeller = mongoose.model('BestSeller', bestSellerSchema);