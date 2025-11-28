import { NextFunction, Request, Response } from "express";
import AppError from "../middlwares/Error.js";
import logger from "../lib/logger.js";
import { user_wishlistService } from "../services/user_wishlist-service.js";

export const addItemInWishlist = async (req: Request, res: Response, next: NextFunction) => {

    try {

        logger.info("\nAdding item to wishlist...");

        const { item } = req.body;
        const userId = req.user?.id!
        logger.debug("User ID for adding item in wishlist:", userId);
        logger.debug("\nItem to add:", item);

        if (!req.user || userId !== req.user.id) {
            logger.warn("User ID does not match authenticated user");
            throw new AppError("User ID does not match authenticated user", 403)
        }
        //Product Validity check - Optional for future engineer

        const result = await user_wishlistService.addItemToWishlist(userId, item);
        const statusCode = result.message.includes("updated") ? 200 : 201;

        console.debug("Item added to wishlist successfully ==> ", result);
        return res.status(statusCode).send(result);

    } catch (error) {
        console.error("Error adding item to wishlist:", error);
        next(error);
        return;
    }
}

export const removeItemInWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.debug("\nRemoving item from wishlist...");

        const { itemId } = req.body;
        const userId = req.user?.id!;
        console.debug("User ID for removing item in wishlist:", userId);
        console.debug("\nItem to remove:", itemId);

        const result = await user_wishlistService.removeItemFromWishlist(userId, itemId);
        return res.status(200).send(result);

    } catch (error) {
        console.error("Error adding item to wishlist:", error);
        next(error);
        return;
    }
}

export const findWishlistByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id!;
        console.debug(`\n getting the wishlist of user ==> ${userId}`)

        const result = await user_wishlistService.getWishlistByUser(userId);
        return res.status(200).send({
            success: true,
            message: "Wishlist found",
            data: result
        });

    } catch (error) {
        console.error("Error finding wishlist by user:", error);
        next(error);
        return;
    }
}

export const clearWishlistofUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.debug("\nClearing wishlist...");
        const userId = req.user?.id!;
        console.debug("User ID for clearing wishlist:", userId);

        const result = await user_wishlistService.clearWishlist(userId);
        return res.status(200).send(result);

    } catch (error) {
        console.error("Error clearing wishlist:", error);
        next(error);
        return;
    }
}