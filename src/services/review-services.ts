import mongoose from "mongoose";
import { Review } from "../models/Review.js"
import AppError from "../middlwares/Error.js";

class ReviewServices {

    private calculate_avg_rating = async (id: string, onModel: string, rating: number, operation: string = "inc") => {
        const Model = mongoose.model(onModel);

        const product: any = await Model.findById(id);
        if (!product) {
            throw new AppError(`${onModel} with id ${id} not found`, 404);
        }

        console.debug("Modal ==> ", product)

        let total_reviews = operation === "dec" ? Math.max(0, product.total_reviews - 1) : product.total_reviews + 1;

        const avg_rating = ((product.rating * product.total_reviews) + rating) / (total_reviews);


        product.rating = parseFloat(avg_rating.toFixed(2));
        product.total_reviews = total_reviews;
        await product.save();

        console.debug(`\n Updated ${onModel} (${id}) - Avg Rating: ${product.rating}, Total Reviews: ${product.total_reviews}`);
        return avg_rating;
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
            this.calculate_avg_rating(vendorId, "Vendor", 0, "dec"),
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
    getReviewsByProduct = async (productId: string, userId?: string | undefined) => {
        const [reviews, user_reviews] = await Promise.all([
            Review.find({ product: productId, user: { $ne: userId } }).populate('user', 'name email img').sort({ createdAt: -1 }).lean(),
            Review.find({ user: userId, product: productId }).populate('product', 'productCode brand_name').populate('user', 'name email img').sort({ createdAt: -1 }).lean()
        ])
        return { reviews, user_reviews };
    }
}

export const reviewServices = new ReviewServices();