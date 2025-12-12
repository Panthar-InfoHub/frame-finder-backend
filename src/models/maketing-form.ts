import { model, Schema } from "mongoose";

const marketingFormSchema = new Schema({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: [true, 'Vendor ID is required']
    },

    request: [
        {
            ad_type: {
                type: String,
                required: [true, 'Ad type is required'],
                trim: true
            },

            images: [
                {
                    url: { type: String, trim: true },
                    ext: { type: String, trim: true }
                }
            ],

            caption: {
                type: String,
                trim: true
            },

            cost: {
                type: Number,
                required: [true, 'Cost is required']
            },

            total_campaign_day: {
                type: Number,
                required: [true, 'Total campaign days are required']
            },

            available_slots: {
                type: [Date],
                validate: {
                    validator: function (this: any, dates: Date[]) {
                        if (!this.total_campaign_day) return true;
                        return dates.length === this.total_campaign_day;
                    },
                    message: "Available slots must match total_campaign_day"
                }
            },

            action: {
                type: String
            },

            product_id: {
                type: Schema.Types.ObjectId,
                refPath: 'onModel'
            },

            onModel: {
                type: String,
                required: true
            }
        }
    ],

    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    }
}, { timestamps: true });

export const MarketingForm = model('MarketingForm', marketingFormSchema);
