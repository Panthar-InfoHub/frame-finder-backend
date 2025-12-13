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
        }
    ]
}, { timestamps: true })

export const CMS = model("CMS", cms_schema);