import { NextFunction, Request, Response } from "express";
import { Product } from "../models/products.js";
import { Sunglass } from "../models/sunglass.js";
import { Accessories } from "../models/Accessories.js";
import { ContactLens } from "../models/contact-lens.js";
import { Order } from "../models/orders.js";
import { getStartDate } from "../lib/uitils.js";

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


// export async function getVendorMonthlyAnalytics(req: Request, res: Response, next: NextFunction) {

//     const period = req.params.period || '6month'
//     const vendorId = req.user?.id!;

//     // --- 1. Determine Date Range (Native JavaScript) ---

//     const startDate = getStartDate(period);
//     const endDate = new Date(); // Today

//     // --- 2. Build the Aggregation Pipeline ---
//     const matchStage: any = { vendorId };
//     if (period === 'more') {
//         matchStage.createdAt = { $lt: startDate };
//     } else {
//         matchStage.createdAt = { $gte: startDate };
//     }

//     const pipeline = [
//         // Stage 1: Filter documents first for performance
//         { $match: matchStage },

//         // Stage 2: Group by month and calculate metrics
//         {
//             $group: {
//                 _id: {
//                     year: { $year: "$createdAt" },
//                     month: { $month: "$createdAt" }
//                 },
//                 totalSales: { $sum: "$totalAmount" }, // Assumes 'totalAmount' field in your Order schema
//                 uniqueCustomers: { $addToSet: "$customerId" }
//             }
//         },

//         // Stage 3: Shape the output and count unique customers
//         {
//             $project: {
//                 _id: 0,
//                 year: "$_id.year",
//                 month: "$_id.month",
//                 totalSales: "$totalSales",
//                 customerCount: { $size: "$uniqueCustomers" }
//             }
//         },

//         // Stage 4: Sort chronologically
//         { $sort: { year: 1, month: 1 } }
//     ];

//     // --- 3. Execute the Pipeline ---
//     const results = await Order.aggregate(pipeline);

//     if (period === 'more') {
//         return results;
//     }

//     // --- 4. Fill in Missing Months (Crucial for Frontend) ---
//     const analyticsMap = new Map(
//         results.map(r => [`${r.year}-${r.month}`, r])
//     );

//     const finalData = [];
//     let loopDate = new Date(startDate);

//     while (loopDate <= endDate) {
//         const year = loopDate.getFullYear();
//         const month = loopDate.getMonth() + 1;
//         const key = `${year}-${month}`;

//         if (analyticsMap.has(key)) {
//             finalData.push(
//                 {
//                     year: analyticsMap.get(key).year,
//                     month: months[analyticsMap.get(key).year],
//                     totalSale: analyticsMap.get(key).totalSales,
//                     customerCount: analyticsMap.get(key).customerCount,
//                 }
//             );
//         } else {
//             // Add a zero-value entry for this month
//             finalData.push({
//                 year,
//                 month: months[month],
//                 totalSales: 0,
//                 customerCount: 0
//             });
//         }
//         // Move to the next month
//         loopDate.setMonth(loopDate.getMonth() + 1);
//     }

//     // For 'more', we just return the raw, sorted results without filling gaps.
//     if (period === 'more') {
//         return results;
//     }

//     return finalData;
// }
