import { NextFunction, Request, Response } from "express";
import { createMarketingFormService, getMarketingFormByIdService, searchMarketingFormsService, updateMarketingFormStatusService } from "../services/marketing-service.js";

export const createMarketingForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const marketingForm = await createMarketingFormService(body);
        console.debug("Marketing form created ==> ", marketingForm);

        res.status(201).json({
            success: true,
            message: "Marketing form created successfully",
            data: marketingForm
        });
        return;

    } catch (error) {
        console.error("Error creating marketing form: ", error);
        next(error);
        return;
    }
}

export const updateMarketingForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const form_id = req.params.id;
        const { status, request } = req.body; // request =>  [{request._id , available_slots}]

        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required to update marketing form"
            });
            return;
        }

        let query: any = {};
        let arrayFilters: any[] = [];

        query.$set = { status };

        if (request && Array.isArray(request)) {
            request.forEach((reqItem: any, index: number) => {
                if (reqItem._id && reqItem.available_slots) {
                    const elemKey = `elem${index}`;
                    query.$set[`request.$[${elemKey}].available_slots`] = reqItem.available_slots;
                    arrayFilters.push({
                        [`${elemKey}._id`]: reqItem._id
                    });
                }
            });
        }
        console.debug("Updating marketing form with query: ", query);

        const marketingForm = await updateMarketingFormStatusService(form_id, query, arrayFilters);
        console.debug("Marketing form updated ==> ", marketingForm);

        res.status(201).json({
            success: true,
            message: "Marketing form updated successfully",
            data: marketingForm
        });
        return;

    } catch (error) {
        console.error("Error updating marketing form: ", error);
        next(error);
        return;
    }
}

export const searchMarketingForm = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const status = req.query.status as string || 'pending';
        const vendor_id = req.query.vendor_id as string;
        const ad_type = req.query.ad_type as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;

        let query: any = {};

        if (status) {
            query.status = status;
        }
        if (vendor_id) {
            query.vendor_id = vendor_id;
        }
        if (ad_type) {
            query['request.ad_type'] = ad_type;
        }

        console.debug("Searching marketing forms with query: ", query);

        const marketingForms = await searchMarketingFormsService(query, page, limit);
        console.debug("Marketing forms found: ", marketingForms);

        res.status(200).json({
            success: true,
            message: "Marketing forms fetched successfully",
            data: marketingForms,
            pagination: {
                total: marketingForms.total_marketing_form,
                current_page: page,
                total_pages: Math.ceil(marketingForms.total_marketing_form / limit)
            }
        });
        return;
    } catch (error) {
        console.error("Error in search marketing form: ", error);
        next(error);
        return;
    }
}

export const getMarketingFormById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const form_id = req.params.id;
        const marketingForm = await getMarketingFormByIdService(form_id);
        res.status(200).json({
            success: true,
            message: "Marketing form fetched successfully",
            data: marketingForm
        });
        return;
    } catch (error) {
        console.error("Error fetching marketing form by ID: ", error);
        next(error);
        return;
    }
}