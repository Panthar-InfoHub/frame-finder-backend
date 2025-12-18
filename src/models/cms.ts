import { model, Schema } from "mongoose";

export const cms_schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: [
        {
            title: { type: String, trim: true },
            desc: { type: String, trim: true },
            order: { type: Number },
            misc: { type: Schema.Types.Mixed }
        }
    ],
    images: [
        {
            url: { type: String, trim: true },
            order: { type: Number },
            action: {
                type: String,
                enum: {
                    values: ['vendor_store', 'product_link'],
                    message: '{VALUE} is not a valid action'
                }
            },

            vendor_id: {
                type: Schema.Types.ObjectId,
                ref: "Vendor",
                required: function (this: any) {
                    return this.action === "vendor_store";
                },
            },

            product_id: {
                type: Schema.Types.ObjectId,
                refPath: 'images.onModel',
                required: function (this: any) {
                    return this.action === "product_link";
                },
            },

            onModel: {
                type: String,
                enum: {
                    values: ['Sunglass', 'Product', 'ContactLens', 'ColorContactLens', 'Reader', 'Accessories', 'LensSolution'],
                    message: '{VALUE} is not a valid type, It must be one of Sunglass, Product, ContactLens, ColorContactLens, Reader, Accessories, LensSolution'
                },
                required: function (this: any) {
                    return this.action === "product_link";
                },
            },
        }
    ]
}, { timestamps: true })

export const CMS = model("CMS", cms_schema);