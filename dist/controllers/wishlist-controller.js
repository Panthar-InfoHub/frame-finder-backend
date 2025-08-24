import { WishList } from "../models/Wishlist.js";
export const addItemInWishlist = async (req, res, next) => {
    try {
        console.debug("\nAdding item to wishlist...");
        const { userId, item } = req.body;
        console.debug("User ID for adding item in wishlist:", userId);
        console.debug("\nItem to add:", item);
        if (!userId || !item) {
            console.warn("User ID or item are required to add to wishlist");
            return res.status(400).send({ success: false, message: "Missing user ID or item" });
        }
        // if (!req.user || userId !== req.user.id) {
        //     console.warn("User ID does not match authenticated user");
        //     return res.status(403).send({ success: false, message: "User ID does not match authenticated user" });
        // }
        const exists = await WishList.exists({
            userId,
            "items.productId": item.productId
        });
        if (exists) {
            console.warn("Item already exists in wishlist");
            return res.status(409).send({
                success: false,
                message: "Item already exists in wishlist"
            });
        }
        const updateList = await WishList.findOneAndUpdate({ userId }, { $addToSet: { items: item } }, { new: true, upsert: true });
        console.debug("Item added to wishlist successfully ==> ", updateList);
        return res.status(200).send({ success: true, message: "Item added to wishlist successfully", data: updateList });
    }
    catch (error) {
        console.error("Error adding item to wishlist:", error);
        next(error);
        return;
    }
};
export const removeItemInWishlist = async (req, res, next) => {
    try {
        console.debug("\nRemoving item from wishlist...");
        const { userId, productId } = req.body;
        console.debug("User ID for removing item in wishlist:", userId);
        console.debug("\nItem to remove:", productId);
        if (!userId || !productId) {
            console.warn("User ID or product ID are required to remove from wishlist");
            return res.status(400).send({ success: false, message: "Missing user ID or product ID" });
        }
        const updateList = await WishList.findOneAndUpdate({ userId, "items.productId": productId }, { $pull: { items: { productId } } }, { new: true });
        if (!updateList) {
            console.warn("Item not found in wishlist");
            return res.status(404).send({
                success: false,
                message: "Item not found in wishlist"
            });
        }
        console.debug("Item removed from wishlist successfully ==> ", updateList);
        return res.status(200).send({ success: true, message: "Item removed from wishlist successfully", data: updateList });
    }
    catch (error) {
        console.error("Error adding item to wishlist:", error);
        next(error);
        return;
    }
};
export const findWishlistByUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        console.debug("User ID for finding wishlist:", userId);
        if (!userId) {
            console.warn("User ID is required to find wishlist");
            return res.status(400).send({ success: false, message: "Missing user ID" });
        }
        const wishlist = await WishList.findOne({ userId }).populate({
            path: "items.productId",
            match: { status: { $nin: ['inactive', 'pending'] } },
            select: "name images price"
        }).lean();
        if (!wishlist) {
            console.warn("Wishlist not found");
            return res.status(404).send({
                success: false,
                message: "Wishlist not found"
            });
        }
        console.debug("Wishlist found successfully ==> ", wishlist);
        return res.status(200).send({ success: true, message: "Wishlist found successfully", data: wishlist });
    }
    catch (error) {
        console.error("Error finding wishlist by user:", error);
        next(error);
        return;
    }
};
export const clearWishlistofUser = async (req, res, next) => {
    try {
        console.debug("\nClearing wishlist...");
        const userId = req.params.id;
        console.debug("User ID for clearing wishlist:", userId);
        if (!userId) {
            console.warn("User ID is required to clear wishlist");
            return res.status(400).send({ success: false, message: "Missing user ID" });
        }
        const result = await WishList.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true });
        if (!result) {
            console.warn("Wishlist not found");
            return res.status(404).send({
                success: false,
                message: "Wishlist of user not found"
            });
        }
        console.debug("Wishlist cleared successfully ==> ", result);
        return res.status(200).send({ success: true, message: "Wishlist cleared successfully", data: result });
    }
    catch (error) {
        console.error("Error clearing wishlist:", error);
        next(error);
        return;
    }
};
