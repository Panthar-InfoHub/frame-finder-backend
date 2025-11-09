import { NextFunction, Request, Response } from "express";
import { reviewServices } from "../services/review-services.js";
import logger from "../lib/logger.js";

class ReviewController {

    create_review = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { vendorId, ...reviewData } = req.body;
            console.debug("\n Review data to create review ==> ", reviewData);

            const userId = req.user?.id!;
            reviewData.user = userId;

            const review = await reviewServices.createReview(reviewData, vendorId);
            console.debug(`\n Review created ==> ${review}`);

            return res.status(201).send({
                success: true,
                message: "User created successfully",
                data: review
            })

        } catch (error) {
            console.error("Error creating review ==> ", error);
            next(error);
            return;
        }
    }

    update_review = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { vendorId, ...reviewData } = req.body;
            const reviewId: string = req.params.id;
            console.debug(`\n Review id ==> ${reviewId}`);
            console.debug("\n Review data to update review ==> ", reviewData)

            const userId = req.user?.id!;
            reviewData.user = userId;

            const review = await reviewServices.updateReview(reviewId, reviewData, vendorId);
            console.debug(`\n updated review ==> ${review}`);

            return res.status(201).send({
                success: true,
                message: "Review updated successfully",
                data: review
            })
        } catch (error) {
            console.error("Error while updating review ==> ", error);
            next(error);
            return;
        }
    }

    delete_review = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId: string = req.params.id;
            const vendorId: string = req.body.vendorId;
            console.debug(`\n Review id ==> ${reviewId}`);

            const review = await reviewServices.deleteReview(reviewId, vendorId);
            console.debug(`\n deleted review ==> ${review}`);

            return res.status(201).send({
                success: true,
                message: "Review deleted successfully",
                data: review
            })
        } catch (error) {
            console.error("Error while deleting review ==> ", error);
            next(error);
            return;
        }
    }

    get_user_reviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            console.debug(`\n User id ==> ${userId}`);

            const reviews = await reviewServices.getReviewsByUser(userId);
            console.debug(`\n reviews of user ==> ${reviews}`);

            return res.status(201).send({
                success: true,
                message: "User reviews fetched successfully",
                data: reviews
            })
        } catch (error) {
            console.error("Error while getting user reviews ==> ", error);
            next(error);
            return;
        }
    }

    get_product_reviews = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId: string = req.params.id;
            const userId = req.user?.id || undefined;
            logger.debug(`Product id ==> ${productId}`);
            logger.debug(`User id ==> ${userId}`);

            const reviews = await reviewServices.getReviewsByProduct(productId, userId);
            logger.debug('reviews of product ==>', reviews);


            return res.status(201).send({
                success: true,
                message: "Product reviews fetched successfully",
                data: reviews
            })
        } catch (error) {
            logger.error("Error while getting product reviews ==> ", error);
            next(error);
            return;
        }
    }
}

export const reviewController = new ReviewController();