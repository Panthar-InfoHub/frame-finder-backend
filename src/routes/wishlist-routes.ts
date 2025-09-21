import { Router } from "express";
import { addItemInWishlist, clearWishlistofUser, findWishlistByUser, removeItemInWishlist } from "../controllers/wishlist-controller.js";
import { auth } from "../middlwares/auth.js";

export const wishlistRouter = Router();

//Add item in wishlist
wishlistRouter.post("/add", [
    auth,
], addItemInWishlist);

//Remove item from wishlist
wishlistRouter.put("/remove", [
    auth,
], removeItemInWishlist);

//Get all items in wishlist of a user
wishlistRouter.get("/", [
    auth,
], findWishlistByUser);

//Clear wishlist of a user
wishlistRouter.put("/clear", [
    auth,
], clearWishlistofUser);

//Update Item in wishlist