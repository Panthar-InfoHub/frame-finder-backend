import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user-services.js";

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const data = req.body;
        const userId = req.user?.id!
        console.debug("\n Data to update user ==> ", data);

        const result = await userService.updateUser(userId, data);
        console.debug("\n Updated user ==> ", updateUser);

        res.status(200).send({
            success: true,
            message: "User updated successfully",
            data: result
        })

    } catch (error) {
        console.error("Error while updating user ==> ", error);
        next(error);
        return;
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {

        console.debug()

    } catch (error) {
        console.error("Error while fetching user by id ==> ", error);
        next(error);
        return;
    }
}