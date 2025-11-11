import mongoose from "mongoose";
import { Review } from "../models/Review.js"
import AppError from "../middlwares/Error.js";
import logger from "../lib/logger.js";

class ReviewServices {

    private calculate_avg_rating = async (id: string, onModel: string, rating: number, operation: string = "inc") => {
        const Model = mongoose.model(onModel);

        const product: any = await Model.findById(id);
        if (!product) {
            throw new AppError(`${onModel} with id ${id} not found`, 404);
        }

        console.debug("Modal ==> ", product)

        let totalReviews = product.total_reviews;
        let totalRatingSum = product.rating * totalReviews;

        if (operation === "dec") {
            totalReviews = Math.max(0, totalReviews - 1);
            totalRatingSum -= rating;
        } else {
            totalReviews = totalReviews + 1;
            totalRatingSum += rating;
        }

        const avgRating = totalReviews === 0 ? 0 : totalRatingSum / totalReviews;


        product.rating = parseFloat(avgRating.toFixed(2));
        product.total_reviews = totalReviews;
        await product.save();

        console.debug(`\n Updated ${onModel} (${id}) - Avg Rating: ${product.rating}, Total Reviews: ${product.total_reviews}`);
        return avgRating;
    }


    // Create a review : Calculate average rating after creating review of Product and Vendor
    createReview = async (data: any, vendorId: string) => {
        const review = await Review.create(data);
        const [vendor_rating, product_rating] = await Promise.all([
            this.calculate_avg_rating(vendorId, "Vendor", data.rating),
            this.calculate_avg_rating(data.product, data.onModel, data.rating)
        ]);
        // console.debug(`\nNew Vendor Rating: ${vendor_rating} | New Product Rating: ${product_rating}`);
        return review;
    };

    //Update Review
    updateReview = async (reviewId: string, data: any, vendorId: string) => {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $set: data },
            { new: true }
        );

        if (!review) {
            console.warn(`\nReview with id ${reviewId} not found`);
            throw new AppError(`Review with id ${reviewId} not found`, 404);
        }

        if (data.rating) {
            const [vendor_rating, product_rating] = await Promise.all([
                this.calculate_avg_rating(vendorId, "Vendor", data.rating),
                this.calculate_avg_rating(review.product.toString(), data.onModel, data.rating)
            ]);
            console.debug(`\nNew Vendor Rating: ${vendor_rating} | New Product Rating: ${product_rating}`);
        }

        return review;
    }

    // Delete Review
    deleteReview = async (reviewId: string, vendorId: string) => {
        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            console.warn(`\nReview with id ${reviewId} not found`);
            throw new AppError(`Review with id ${reviewId} not found`, 404);
        }

        const [vendor_rating, product_rating] = await Promise.all([
            this.calculate_avg_rating(vendorId, "Vendor", review.rating, "dec"),
            this.calculate_avg_rating(review.product.toString(), review.onModel, 0, "dec")
        ]);
        console.debug(`\nNew Vendor Rating: ${vendor_rating} | New Product Rating: ${product_rating}`);
        return review;
    }

    //Get reviews of a User
    getReviewsByUser = async (userId: string) => {
        const reviews = await Review.find({ user: userId }).populate('product', 'productCode brand_name').populate('user', 'name email img').sort({ createdAt: -1 }).lean();
        return reviews;
    }

    //Get reviews of a Product
    getReviewsByProduct = async (productId: string, userId?: string | undefined, page: number = 1, limit: number = 10) => {

        const userIdObject = userId ? new mongoose.Types.ObjectId(userId) : null;
        const skip = (page - 1) * limit;

        const reviews = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },

            {
                $facet: {
                    currentUserReviews: [
                        { $match: { user: userIdObject } },
                        { $sort: { createdAt: -1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                comment: 1,
                                rating: 1,
                                product: 1,
                                user: { name: 1, email: 1, img: 1, _id: 1 },
                                createdAt: 1
                            }
                        }
                    ],

                    otherUsersReviews: [
                        { $match: { user: { $ne: userIdObject } } },
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                comment: 1,
                                rating: 1,
                                product: 1,
                                user: { name: 1, email: 1, img: 1, _id: 1 },
                                createdAt: 1
                            }
                        }
                    ],

                    ratingDistribution: [
                        {
                            $addFields: {
                                roundedRating: { $toInt: { $floor: "$rating" } }
                            }
                        },
                        {
                            $group: {
                                _id: "$roundedRating",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: -1 } }
                    ],

                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const result: any = {
            reviews: reviews[0].otherUsersReviews,
            user_reviews: reviews[0].currentUserReviews,
            totalReviews: reviews[0].totalCount[0]?.count || 0,
            ratingDistribution: {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0
            },
            pagination: {
                total: reviews[0].totalCount[0]?.count || 0,
                totalPages: Math.ceil((reviews[0].totalCount[0]?.count || 0) / limit)
            }
        };

        reviews[0].ratingDistribution.forEach((item: any) => {
            if (item._id >= 1 && item._id <= 5) {
                result.ratingDistribution[item._id] = item.count;
            }
        });

        return result;
    }
}

export const reviewServices = new ReviewServices();