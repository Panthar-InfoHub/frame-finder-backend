import { NextFunction, Request, Response } from "express";
import { Product } from "../models/products.js";
import { Sunglass } from "../models/sunglass.js";
import { Accessories } from "../models/Accessories.js";
import { ContactLens } from "../models/contact-lens.js";
import { Order } from "../models/orders.js";
import { getStartDate, months } from "../lib/uitils.js";
import mongoose from "mongoose";
import { ColorContactLens } from "../models/color-contact-lens.js";
import { Reader } from "../models/reader.js";

export const getVendorProductCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const vendorId = req.user?.id;
        console.debug(`${vendorId} ==> is requesting count analytics`);

        const [productsCount, sunglassCount, accessoriesCount, contactLensCount, clrContactLensCount, readerCount] = await Promise.all([
            Product.countDocuments({ vendorId }),
            Sunglass.countDocuments({ vendorId }),
            Accessories.countDocuments({ vendorId }),
            ContactLens.countDocuments({ vendorId }),
            ColorContactLens.countDocuments({ vendorId }),
            Reader.countDocuments({ vendorId }),
        ])

        console.debug(
            `Product Counts =>\nFrames: ${productsCount}\nSunglasses: ${sunglassCount}\nAccessories: ${accessoriesCount}\nContact Lens: ${contactLensCount}
            \n Clr Contact Lens: ${clrContactLensCount}
            \nReader Lens: ${readerCount},
            `
        )

        res.status(200).send({
            success: true,
            message: "Products counts fetched successfully",
            data: {
                Frame: productsCount,
                Sunglasses: sunglassCount,
                Accessories: accessoriesCount,
                "Contact Lens": contactLensCount,
                "Color Contact Lens": clrContactLensCount,
                Reader: readerCount
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
                    month: month,
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

export async function getVendorMetrics(req: Request, res: Response, next: NextFunction) {
    const vendorId = req.user?.id!;
    console.debug(`\n Calculating vendor metrics for vendor ==> ${vendorId}`)
    try {
        const stats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: { "items.vendorId": new mongoose.Types.ObjectId(vendorId) }
            },
            {
                $group: {
                    _id: null,  // Group all into single result
                    totalSales: { $sum: "$total_amount" },
                    // Total number of orders
                    totalOrders: { $sum: 1 },
                    // Pending orders count
                    pendingOrders: {
                        $sum: {
                            $cond: [
                                { $eq: ["$order_status", "pending"] },
                                1,
                                0
                            ]
                        }
                    },
                    totalItemsSold: {
                        $sum: "$items.quantity"
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    totalSales: { $round: ["$totalSales", 2] },
                    totalOrders: 1,
                    pendingOrders: 1,
                    totalItemsSold: 1
                }
            }
        ]);

        console.debug("\n Final result of metrics analytics ==> ", stats[0])

        if (!stats.length) {
            return {
                totalSales: 0,
                totalOrders: 0,
                pendingOrders: 0,
                totalItemsSold: 0
            };
        }

        const metric = stats[0];
        {

        }

        return res.status(200).send({
            success: true,
            message: "Metrics fetched successfully",
            data: {
                total_sales: metric.totalSales,
                total_orders: metric.totalOrders,
                total_items_sold: metric.totalItemsSold,
                pending_orders: metric.pendingOrders,
            }
        })
    } catch (error) {

    }
}