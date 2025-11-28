import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { UserWishlist } from "../models/user_wishlist.js";
import logger from "../lib/logger.js";

class WishlistService {

    async addItemToWishlist(userId: string, item: any) {

        const { productId, variantId, type, ...data } = item;

        if (!userId || !item) {
            logger.warn("User ID or item are required to add to wishlist");
            throw new AppError("Missing user ID or item", 400);
        }

        //findOneandUpdate
        const updatedWishList = await UserWishlist.findOne(
            {
                userId,
                items: { $elemMatch: { product: productId, variant: variantId } }
            },
        );

        logger.debug("\n Updated wishlist ==> ", updatedWishList);
        if (updatedWishList) {
            throw new AppError("Product already in the user wishlist", 400);
        }

        // Add new item
        const newWishList = await UserWishlist.findOneAndUpdate(
            { userId },
            {
                $push: {
                    items: {
                        product: productId,
                        onModel: type,
                        variant: variantId,
                        ...data
                    }
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return {
            success: true,
            message: "Item added to wishlist successfully",
            data: newWishList
        };
    }

    async removeItemFromWishlist(userId: string, itemId: string) {

        if (!itemId) {
            logger.warn("\n ItemId required to remove from wishlist");
            throw new AppError("ItemId required to remove from wishlist", 400);
        }

        const updateList = await UserWishlist.findOneAndUpdate(
            { userId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!updateList) {
            logger.warn("Item not found in wishlist");
            throw new AppError("Item not found in wishlist", 400);
        }

        logger.debug("Item removed from wishlist successfully ==> ", updateList);
        return {
            success: true,
            message: "Item removed from wishlist successfully",
            data: updateList
        };
    }

    async getWishlistByUser(userId: string) {
        // Get the wishlist document and populate the product details and vendor inside product
        const wishlist = await UserWishlist.findOne({ userId }).populate({
            path: "items.product",
            match: { status: 'active' },
            select: 'brand_name productCode variants vendorId price images',
            populate: {
                path: 'vendorId',
                select: 'business_name business_owner'
            }
        }).lean();

        if (!wishlist || wishlist.items.length === 0) {
            return {
                items: [],
            };
        }


        // Process the items to structure the final response : For all items in wishlist
        // Basically filter the corrected variant among all the variant of producty as per the wishlist variant id
        const populatedItems = await Promise.all(wishlist.items.map(async (item: any) => {
            try {
                if (item.variant) {
                    const variant = item.product.variants?.find(
                        (v: any) => v._id.toString() === item.variant?.toString()
                    );
                    if (!variant) {
                        logger.info(`Variant ${item.variant} not found`);
                        return null;
                    }

                    return {
                        _id: item._id,
                        product: {
                            id: item.product._id,
                            brand_name: item.product.brand_name,
                            productCode: item.product.productCode,
                            vendorId: item.product.vendorId
                        },
                        onModel: item.onModel,
                        variant,
                    };
                } else {
                    return {
                        _id: item._id,
                        product: {
                            id: item.product._id,
                            brand_name: item.product.brand_name,
                            productCode: item.product.productCode,
                            vendorId: item.product.vendorId,
                        },
                        images: item.product.images,
                        price: item.product.price,
                        onModel: item.onModel,
                    };
                }

            } catch (err) {
                logger.error(`Error populating item:`, err);
                return null;
            }
        }))

        const filteredItems = populatedItems.filter((item): item is any => item !== null);
        return {
            items: filteredItems,
        };
    }

    async clearWishlist(userId: string, session?: mongoose.ClientSession) {
        logger.info("Clearing wishlist...");
        logger.debug("User ID for clearing wishlist:", userId);

        if (!userId) {
            logger.warn("User ID is required to clear wishlist");
            throw new AppError("Missing user ID", 400);
        }

        const result = await UserWishlist.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { new: true, session }
        );

        if (!result) {
            logger.warn("Wishlist not found");
            throw new AppError("Wishlist of user not found", 404);
        }

        logger.debug("Wishlist cleared successfully ==> ", result);
        return {
            success: true,
            message: "Wishlist cleared successfully",
            data: result
        };
    }
}
export const user_wishlistService = new WishlistService()