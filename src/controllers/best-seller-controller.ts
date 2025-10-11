import { NextFunction, Request, Response } from "express";
import { getDateRange } from "../lib/helper.js";
import { Order } from "../models/orders.js";
import { BestSeller } from "../models/best-seller.js";
import AppError from "../middlwares/Error.js";

class BestSellerController {
    calculateBestSellers = async () => {

        const productTypes = ['Sunglass', 'Product', 'ContactLens', 'ColorContactLens', 'Reader', 'Accessories'];

        const periods = [
            'last_7_days',
            'last_15_days',
            'last_30_days',
            'last_60_days',
            'last_90_days',
            'last_month',
            'current_month',
            'all_time'
        ];

        let totalProcessed = 0;

        for (const productType of productTypes) {
            console.log(`\nProcessing: ${productType}`);

            for (const period of periods) {
                try {
                    const count = await this.calculateForProductType(productType, period);
                    totalProcessed += count;
                } catch (error) {
                    console.error(`Error calculating ${productType} - ${period}:`, error);
                }
            }
        }

        console.log('\n========================================');
        console.log(` Best Seller Calculation Complete`);
        console.log(`Total products processed: ${totalProcessed}`);
        console.log('========================================\n');
        return totalProcessed;
    }

    private calculateForProductType = async (productType: string, periodName: string): Promise<number> => {

        const { start, end } = getDateRange(periodName);

        const dateFilter: any = {};
        if (start) {
            dateFilter.createdAt = periodName === 'last_month'
                ? { $gte: start, $lte: end } // Specific
                : { $gte: start };             // From start date to now
        }
        console.debug(`\n date filter ==> ${JSON.stringify(dateFilter, null, 2)}`);
        const results = await Order.aggregate([
            {
                $match: {
                    ...dateFilter,
                    order_status: { $in: ['delivered'] }
                }
            },

            // Stage 2: Unwind the items array to work with individual products
            { $unwind: '$items' },

            // Stage 3: Filter for the specific product type we're calculating
            { $match: { 'items.onModel': productType } },

            // Stage 4: Group by product and calculate metrics
            {
                $group: {
                    _id: '$items.productId',
                    total_quantity_sold: { $sum: '$items.quantity' },
                    total_revenue: {
                        $sum: {
                            $multiply: ['$items.quantity', '$items.price']
                        }
                    },
                    vendorId: { $first: '$items.vendorId' },
                    total_orders: { $sum: 1 },
                }
            },

            { $sort: { total_quantity_sold: -1 } },

            { $limit: 10 }
        ]);
        console.debug(`\n Data for best seller ==> ${JSON.stringify(results, null, 4)}`);

        // If no sales data found, clean up old analytics and skip : No sales from 7 days clear last_7_days data
        if (results.length === 0) {
            await BestSeller.deleteMany({
                productType: productType,
                period: periodName
            });
            console.warn(`No sales data found`);
            return 0;
        }

        const bulkOps = results.map((item, index) => ({
            updateOne: {
                filter: {
                    productId: item._id,
                    vendorId: item.vendorId,
                    productType: productType,
                    period: periodName,
                },
                update: {
                    $set: {
                        productId: item._id,
                        productType: productType,
                        vendorId: item.vendorId,
                        total_quantity_sold: item.total_quantity_sold,
                        total_revenue: item.total_revenue,
                        total_orders: item.total_orders,
                        rank: index + 1, // Ranking : 1,2,3...
                        period: periodName,
                        calculated_at: new Date()
                    }
                },
                upsert: true
            }
        }));

        const bulkResult = await BestSeller.bulkWrite(bulkOps);

        const topProductIds = results.map(r => r._id);
        await BestSeller.deleteMany({
            productType: productType,
            period: periodName,
            productId: { $nin: topProductIds }
        });

        console.log(`Saved ${results.length} best sellers (${bulkResult.upsertedCount} new, ${bulkResult.modifiedCount} updated)`);

        return results.length;
    }

    development_calculate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('Manually triggering best seller calculation...\n');
            await this.calculateBestSellers();
            res.json({
                success: true,
                message: 'Best seller calculation completed successfully',
            });

        } catch (error) {
            console.error('Error in manual calculation:', error);
            next(error);
        }
    }

    get_best_seller = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { vendorId, type, period }: { vendorId?: string; type?: string; period?: string } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            let query: any = { period: "last_30_days" };

            if (vendorId) query.vendorId = vendorId;
            if (type) {
                const validTypes = ['Sunglass', 'Product', 'ContactLens', 'ColorContactLens', 'Reader', 'Accessories'];
                if (!validTypes.includes(type)) {
                    throw new AppError('Invalid product type', 400);
                }
                query.type = type;
            }
            if (period) {
                const validPeriods = ['last_7_days', 'last_15_days', 'last_30_days', 'last_60_days', 'last_90_days', 'last_month', 'current_month', 'all_time'];
                if (!validPeriods.includes(period)) {
                    throw new AppError('Invalid product type', 400);
                }
                query.period = period;
            }

            console.debug("\n query ==> ", query);

            const [data, totalCount] = await Promise.all([
                BestSeller
                    .find(query)
                    .sort({ rank: 1 })
                    .skip(skip)
                    .limit(limit)
                    .select(" productId vendorId productType rank total_quantity_sold total_revenue ")
                    .populate('vendorId', 'business_name business_owner')
                    .populate('productId', 'productCode brand_name')
                    .lean(),

                BestSeller.countDocuments(query)
            ]);

            console.debug("\nBest seller data fetched ==> ", data)
            return res.status(200).send({
                success: true,
                message: "Best seller data fetched successfully",
                data: {
                    data,
                    pagination: {
                        totalCount,
                        totalPages: Math.ceil(totalCount / limit)
                    }
                }
            })

        } catch (error) {
            console.error("Error while fetching best seller ==> ", error);
            next(error);
            return;
        }
    }
}

export const bestSellerController = new BestSellerController();