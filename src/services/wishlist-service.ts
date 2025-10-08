import { WishList } from "../models/Wishlist.js";
import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";

class WishlistService {

    async addItemToWishlist(userId: string, item: any) {

        const { productId, variantId, quantity = 1, type, ...data } = item;

        if (!userId || !item) {
            console.warn("User ID or item are required to add to wishlist");
            throw new AppError("Missing user ID or item", 400);
        }

        const updatedWishList = await WishList.findOneAndUpdate(
            {
                userId,
                items: { $elemMatch: { product: productId, variant: variantId } }
            },
            { $inc: { 'items.$.quantity': item.quantity } },
            { new: true }
        );

        console.debug("\n Updated wishlist ==> ", updatedWishList);
        if (updatedWishList) {
            return {
                success: true,
                message: "Product quantity updated successfully",
                data: updatedWishList
            };
        }

        // Add new item
        const newWishList = await WishList.findOneAndUpdate(
            { userId },
            {
                $push: {
                    items: {
                        product: productId,
                        onModel: type,
                        variant: variantId,
                        quantity: quantity,
                        ...data
                    }
                }
            },
            { new: true, upsert: true }
        );

        return {
            success: true,
            message: "Item added to wishlist successfully",
            data: newWishList
        };
    }

    async removeItemFromWishlist(userId: string, itemId: string) {

        if (!itemId) {
            console.warn("\n ItemId required to remove from wishlist");
            throw new AppError("ItemId required to remove from wishlist", 400);
        }

        const updateList = await WishList.findOneAndUpdate(
            { userId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!updateList) {
            console.warn("Item not found in wishlist");
            throw new AppError("Item not found in wishlist", 400);
        }

        console.debug("Item removed from wishlist successfully ==> ", updateList);
        return {
            success: true,
            message: "Item removed from wishlist successfully",
            data: updateList
        };
    }

    async getWishlistByUser(userId: string) {
        // Get the wishlist document and populate the product details and vendor inside product
        const wishlist = await WishList.findOne({ userId }).populate({
            path: "items.product",
            match: { status: 'active' },
            select: 'brand_name productCode variants vendorId',
            populate: {
                path: 'vendorId',
                select: 'business_name business_owner'
            }
        }).lean();

        if (!wishlist || wishlist.items.length === 0) {
            return [];
        }

        console.debug(`\n Wishlist ==> ${JSON.stringify(wishlist, null, 2)}`);

        // Process the items to structure the final response : For all items in wishlist
        // Basically filter the corrected variant among all the variant of producty as per the wishlist variant id
        const populatedItems = await Promise.all(
            wishlist.items.map(async (item: any) => {
                try {
                    const variant = item.product.variants?.find(
                        (v: any) => v._id.toString() === item.variant?.toString()
                    );
                    if (!variant) {
                        console.log(`Variant ${item.variant} not found`);
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
                        quantity: item.quantity,
                        prescription: item.prescription,
                        lens_package_detail: item.lens_package_detail
                    };
                } catch (err) {
                    console.error(`Error populating item:`, err);
                    return null;
                }
            })
        );

        console.debug(`\n Populated items ==> ${JSON.stringify(populatedItems, null, 2)}`);
        const filteredItems = populatedItems.filter(item => item !== null); //

        return filteredItems;
    }

    async clearWishlist(userId: string) {
        console.debug("\nClearing wishlist...");
        console.debug("User ID for clearing wishlist:", userId);

        if (!userId) {
            console.warn("User ID is required to clear wishlist");
            throw new AppError("Missing user ID", 400);
        }

        const result = await WishList.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!result) {
            console.warn("Wishlist not found");
            throw new AppError("Wishlist of user not found", 404);
        }

        console.debug("Wishlist cleared successfully ==> ", result);
        return {
            success: true,
            message: "Wishlist cleared successfully",
            data: result
        };
    }
}
export const wishlistService = new WishlistService()