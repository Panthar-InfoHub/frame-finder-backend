import { Router } from "express";
import { UserController } from "../controllers/user-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";

export const userRouter = Router();

const user = new UserController()

//create user
userRouter.post("/", user.createUser);

//Update user
userRouter.put("/", [auth], user.updateUser);

//get user by id
userRouter.get("/", [auth], user.getUserById);

//get all user
userRouter.get("/search", [auth, isVendor], user.searchUser);

//delete user
userRouter.delete("/", [auth], user.deleteUser);