import { NextFunction, Request, Response } from "express";
import { createCMSEntry, createCMSEntryParams, deleteCMSEntry, getCMSEntryByKey, removeSubCMSValueId, searchCMSEntries, updateCMSEntry } from "../services/cms-service.js";
import AppError from "../middlwares/Error.js";
import logger from "../lib/logger.js";

export const createCMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: createCMSEntryParams = req.body;
        logger.debug("Creating CMS entry with data: ", body);

        //Check iamges action and required fields
        if (body.images && Array.isArray(body.images)) {
            for (const img of body.images) {
                if (img.action === "vendor_store" && !img.vendor_id) {
                    logger.error("Vendor Id is required for action 'vendor_store'");
                    throw new AppError("vendor_id is required for action 'vendor_store'", 400);
                }
                if (img.action === "product_link") {
                    if (!img.product_id || !img.onModel) {
                        logger.error("Product Id and onModel are required for action 'product_link'");
                        throw new AppError("product_id and onModel are required for action 'product_link'", 400);
                    }
                }
            }
        }

        const cms_entry = await createCMSEntry(body);
        logger.debug("Created CMS entry ==> ", cms_entry);

        res.status(201).send({
            success: true,
            message: "CMS entry created successfully",
            data: cms_entry
        });
        return;

    } catch (error) {
        logger.error("\nError creating CMS entry: ", error);
        next(error);
        return;
    }
}

export const updateCMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cms_id = req.params.id;
        const { value }: Partial<createCMSEntryParams> = req.body;
        const { images } = req.body;
        logger.debug("Updating CMS entry with ID:", cms_id, "Data:", { value, images });

        let query: any = { $set: {} };
        let arrayFilters: any[] = [];

        if (value && Array.isArray(value)) {
            value.forEach((reqItem: any, index: number) => {
                const { _id: item_id, ...rest } = reqItem;

                if (!item_id) {
                    logger.error("Missing _id in value item: ", reqItem);
                    throw new AppError("Each value item must have an _id for update", 400);
                }

                const elemKey = `elem${index}`;

                Object.entries(rest).forEach(([field, val]) => {
                    query.$set[`value.$[${elemKey}].${field}`] = val;
                });

                arrayFilters.push({
                    [`${elemKey}._id`]: item_id
                });
            });
        }

        if (images && Array.isArray(images)) {
            images.forEach((imgItem: any, index: number) => {
                const { _id: item_id, ...rest } = imgItem;

                if (!item_id) {
                    logger.error("Missing _id in images item: ", imgItem);
                    throw new AppError("Each image item must have an _id for update", 400);
                }

                const elemKey = `imgElem${index}`;
                Object.entries(rest).forEach(([field, val]) => {
                    query.$set[`images.$[${elemKey}].${field}`] = val;
                });
                arrayFilters.push({
                    [`${elemKey}._id`]: item_id
                });
            });
        }

        const updatedCMSEntry = await updateCMSEntry(cms_id, query, arrayFilters);
        logger.debug("Updated CMS entry ==> ", updatedCMSEntry);

        if (!updatedCMSEntry) {
            logger.error("CMS entry not found for ID: ", cms_id);
            throw new AppError("CMS entry not found", 404);
        }

        res.status(201).json({
            success: true,
            message: "CMS entry updated successfully",
            data: updatedCMSEntry
        });
        return;

    } catch (error) {
        logger.error("\nError updating CMS entry: ", error);
        next(error);
        return;
    }
}

export const getCMSByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.query.key as string;
        logger.debug("Fetching CMS entry with key: ", key);

        const cms_entry = await getCMSEntryByKey(key);
        logger.debug("Fetched CMS entry ==> ", cms_entry);

        res.status(200).json({
            success: true,
            message: "CMS entry fetched successfully",
            data: cms_entry
        });
        return;

    } catch (error) {
        logger.error("\nError fetching CMS entry: ", error);
        next(error);
        return;
    }
}

export const searchCMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 30;

        let query: any = {};
        // Add more query parameters as needed

        const { cms_entries, total_cms_entries } = await searchCMSEntries(query, page, limit);
        logger.debug("Searched CMS entries ==> ", cms_entries);

        res.status(200).json({
            success: true,
            message: "CMS entries fetched successfully",
            data: cms_entries,
            pagination: {
                total: total_cms_entries,
                current_page: page,
                total_pages: Math.ceil(total_cms_entries / limit)
            }
        });
        return;

    } catch (error) {
        logger.error("\nError searching CMS entries: ", error);
        next(error);
        return;
    }
}

export const removeSubCMSValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cms_id = req.params.id;
        const sub_value_id = req.query.sub_id as string;
        logger.debug("Removing sub CMS value with ID:", sub_value_id, "from CMS ID:", cms_id);

        const updatedCMS = await removeSubCMSValueId(cms_id, sub_value_id);
        logger.debug("Updated CMS after removing sub value ==> ", updatedCMS);

        res.status(200).json({
            success: true,
            message: "Sub CMS value removed successfully",
            data: updatedCMS
        });
        return;

    } catch (error) {
        logger.error("\nError removing sub CMS value: ", error);
        next(error);
        return;
    }
}

export const deleteCMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cms_id = req.params.id;
        logger.debug("Deleting CMS entry with ID: ", cms_id);

        const deletedCMS = await deleteCMSEntry(cms_id);
        logger.debug("Deleted CMS entry ==> ", deletedCMS);

        res.status(200).json({
            success: true,
            message: "CMS entry deleted successfully",
            data: deletedCMS
        });
        return;

    } catch (error) {
        logger.error("\nError deleting CMS entry: ", error);
        next(error);
        return;
    }
}