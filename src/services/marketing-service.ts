import { MarketingForm } from "../models/maketing-form.js"

export const createMarketingFormService = async (data: any) => {
    const marketingForm = await MarketingForm.create(data);
    return marketingForm;
}

export const updateMarketingFormStatusService = async (form_id: string, query: any, arrayFilters?: any[]) => {
    const updatedMarketingForm = await MarketingForm
        .findByIdAndUpdate(
            form_id,
            query,
            { new: true, ...(arrayFilters?.length ? { arrayFilters } : {}) }
        );
    return updatedMarketingForm;
}

export const getMarketingFormByIdService = async (form_id: string) => {
    const marketingForm = await MarketingForm.findById(form_id)
        .populate('vendor_id', 'business_name company_pan business_owner email phone')
        .populate('request.product_id', 'brand_name variants')
        .lean();
    return marketingForm;
}

export const searchMarketingFormsService = async (query: any, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const [marketing_form, total_marketing_form] = await Promise.all([
        MarketingForm
            .find(query)
            .sort({ createdAt: -1 })
            .populate('vendor_id', 'business_name company_pan business_owner email phone')
            .populate('request.product_id', 'brand_name variants')
            .skip(skip)
            .limit(limit)
            .lean(),
        MarketingForm.countDocuments(query)
    ]);
    return { marketing_form, total_marketing_form };
}