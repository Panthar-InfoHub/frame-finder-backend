import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { addItemInWishlist, removeItemInWishlist, findWishlistByUser, clearWishlistofUser } from "../controllers/user_wishlist-controller.js";

export const user_wishlistRouter = Router();

//Add item in wishlist
user_wishlistRouter.post("/add", [
    auth,
], addItemInWishlist);

//Remove item from wishlist
user_wishlistRouter.put("/remove", [
    auth,
], removeItemInWishlist);

//Get all items in wishlist of a user
user_wishlistRouter.get("/", [
    auth,
], findWishlistByUser);

//Clear wishlist of a user
user_wishlistRouter.put("/clear", [
    auth,
], clearWishlistofUser);