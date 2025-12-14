import { CMS } from "../models/cms.js";

export interface createCMSEntryParams {
    key: string;
    value: Array<{ title: string; desc: string; order: number; misc?: any }>;
    images: Array<{ url: string; order: number }>;
}
export const createCMSEntry = async ({ key, value, images }: createCMSEntryParams) => {
    const cms_entry = await CMS.create({ key, value, images });
    return cms_entry;
}

export const updateCMSEntry = async (cms_id: string, query: any, arrayFilters?: any[]) => {
    const updatedMarketingForm = await CMS
        .findByIdAndUpdate(
            cms_id,
            query,
            { new: true, ...(arrayFilters?.length ? { arrayFilters } : {}) }
        );
    return updatedMarketingForm;
}

export const getCMSEntryByKey = async (key: string) => {
    const cms_entry = await CMS.findOne({ key }).lean();
    return cms_entry;
}

export const searchCMSEntries = async (query: any, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [cms_entries, total_cms_entries] = await Promise.all([
        CMS
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        CMS.countDocuments(query)
    ]);
    return { cms_entries, total_cms_entries };
}

export const removeSubCMSValueId = async (cms_id: string, sub_value_id: string) => {
    const updatedCMS = await CMS.findByIdAndUpdate(
        { _id: cms_id },
        {
            $pull: { // Sub value id can be in value or images array
                value: { _id: sub_value_id },
                images: { _id: sub_value_id }
            }
        },
        { new: true }
    );
    return updatedCMS;
}

export const deleteCMSEntry = async (cms_id: string) => {
    const deletedCMS = await CMS.findByIdAndDelete(cms_id);
    return deletedCMS;
}