import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }], //Just need to make this array of order IDs
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
        type: String,
        enum: ['initiated', 'successful', 'failed', 'refunded'],
        default: 'initiated',
    },
    method: { type: String },
    provider: { type: String, required: true },
    providerDetails: {
        razorPayOrderId: { type: String, index: true },
        razorpayPaymentId: { type: String, index: true },
        signature: { type: String },
        failureReason: { type: String },
    },
}, { timestamps: true });

paymentSchema.index({ userId: 1, orderId: 1 })

export const Payment = mongoose.model('Payment', paymentSchema);