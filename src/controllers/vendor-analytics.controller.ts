import { NextFunction, Request, Response } from "express";
import { Product } from "../models/products.js";
import { Sunglass } from "../models/sunglass.js";
import { Accessories } from "../models/Accessories.js";
import { ContactLens } from "../models/contact-lens.js";
import { Order } from "../models/orders.js";
import { getStartDate, months } from "../lib/uitils.js";
import mongoose from "mongoose";

export const getVendorProductCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const vendorId = req.user?.id;
        console.debug(`${vendorId} ==> is requesting count analytics`);

        const [productsCount, sunglassCount, accessoriesCount, contactLensCount] = await Promise.all([
            Product.countDocuments({ vendorId }),
            Sunglass.countDocuments({ vendorId }),
            Accessories.countDocuments({ vendorId }),
            ContactLens.countDocuments({ vendorId })
        ])

        console.debug(
            `Product Counts =>\nFrames: ${productsCount}\nSunglasses: ${sunglassCount}\nAccessories: ${accessoriesCount}\nContact Lens: ${contactLensCount}`
        )

        res.status(200).send({
            success: true,
            message: "Products counts fetched successfully",
            data: {
                frames: productsCount,
                sunglasses: sunglassCount,
                accessories: accessoriesCount,
                contactLens: contactLensCount
            }
        })
        return;

    } catch (error) {
        console.error("Error while getting all product count of vendor ==> ", error);
        next(error);
        return
    }
}


export async function getVendorMonthlyAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
        const period = req.params.period || '6month'
        console.debug("getting vendor monthly analytics of ==> ", period)
        const vendorId = new mongoose.Types.ObjectId(req.user?.id!);
        console.debug("\n\nvendor id for analystics ==> ", vendorId)

        // --- 1. Determine Date Range (Native JavaScript) ---

        const startDate = getStartDate(period);
        console.debug("\n Start date ==> ", startDate);

        const endDate = new Date(); // Today
        console.debug("\n Start date ==> ", endDate);

        // --- 2. Build the Aggregation Pipeline ---
        const matchStage: any = { "items.vendorId": vendorId };
        if (period === 'more') {
            matchStage.createdAt = { $lt: startDate };
        } else {
            matchStage.createdAt = { $gte: startDate };
        }

        console.debug("\n match stage filter ==> ", matchStage)
        // --- 3. Execute the Pipeline ---
        const results = await Order.aggregate([
            // Stage 1: Filter documents first for performance : match the order where in items we have at least the desired vendor
            { $match: matchStage },

            //stage 2 : unwind items array to filter via vendor the particular items
            { $unwind: "$items" },

            //stage 3 : filter the items array via vendor
            {
                $match: {
                    "items.vendorId": vendorId
                }
            },

            // Stage 4: Group by month and calculate metrics
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, // Assumes 'totalAmount' field in your Order schema
                    uniqueCustomers: { $addToSet: "$userId" }
                }
            },

            // Stage 5: Shape the output and count unique customers
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    totalSales: "$totalSales",
                    customerCount: { $size: "$uniqueCustomers" }
                }
            },

            // Stage 4: Sort chronologically
            { $sort: { year: 1, month: 1 } }
        ]);

        console.debug("\n aggregation result after mongodb ==> ", results)

        if (period === 'more') {
            return results;
        }

        // --- 4. Fill in Missing Months (Crucial for Frontend) ---
        const analyticsMap = new Map(
            results.map(r => [`${r.year}-${r.month}`, r])
        );

        console.debug("\n map for result ==> ", analyticsMap)

        const finalData = [];
        let loopDate = new Date(startDate);


        console.log("\n Loop date ==> ", loopDate)

        while (loopDate <= endDate) {
            const year = loopDate.getFullYear();
            const month = loopDate.getMonth() + 1;
            const key = `${year}-${month}`;
            console.debug("\n Loop key ==> ", key)

            if (analyticsMap.has(key)) {
                finalData.push(
                    {
                        year: analyticsMap.get(key).year,
                        month: month,
                        totalSale: analyticsMap.get(key).totalSales,
                        customerCount: analyticsMap.get(key).customerCount,
                    }
                );
            } else {
                // Add a zero-value entry for this month
                finalData.push({
                    year,
                    month: month ,
                    totalSales: 0,
                    customerCount: 0
                });
            }
            // Move to the next month
            loopDate.setMonth(loopDate.getMonth() + 1);
        }

        console.debug("Final result ==> ", finalData)
        return res.status(200).send({
            success: true,
            message: "Analytics fetched successfully",
            data: finalData
        })
    } catch (error) {
        console.error("Error while getting all product count of vendor ==> ", error);
        next(error);
        return
    }
}