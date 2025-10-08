import { NextFunction, Request, Response } from "express";
import { userData, userService } from "../services/user-services.js";
import { generateTokens } from "../lib/uitils.js";

export class UserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData: userData = req.body;
            console.debug(`\n User data to create new user ==> ${userData}`);

            const user = await userService.createUser(userData);
            console.debug(`\n new user ==> ${user}`);

            const token = generateTokens({ id: user._id.toString(), email: user.email!, role: user.role });
            console.debug("\n Generated token for user ==> ", token);

            return res.status(201).send({
                success: true,
                message: "User created successfully",
                data: {
                    _id: user._id,
                    email: user?.email,
                    token
                }
            })

        } catch (error) {
            console.error("Error creating user ==> ", error);
            next(error);
            return;
        }
    };

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData: userData = req.body;
            const userId: string = req.user?.id!;
            console.debug(`\n User id ==> ${userId}`);
            console.debug("\n User data to create new user ==> ", userData)

            const user = await userService.updateUser(userData, userId);
            console.debug(`\n updated user ==> ${user}`);

            return res.status(201).send({
                success: true,
                message: "User updated successfully",
                data: user
            })
        } catch (error) {
            console.error("Error while updating user ==> ", error);
            next(error);
            return;
        }
    };

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId: string = req.user?.id!;
            console.debug(`\n User id ==> ${userId}`);

            const user = await userService.getUserById(userId);
            console.debug(`\n user ==> ${user}`);

            return res.status(201).send({
                success: true,
                message: "User fetched successfully",
                data: user
            })
        } catch (error) {
            console.error("Error while getting user by Id ==> ", error);
            next(error);
            return;
        }
    };

    async searchUser(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 1;
            const search = req.query.search as string || "";

            let query: any = { isActive: true };
            console.debug(`\n query ==> ${query}`);

            if (search) {
                query = {
                    ...query,
                    $or: [
                        { first_name: { $regex: search, $options: "i" } },
                        { last_name: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } }
                    ]
                }
            }

            const user = await userService.searchUser({ page, limit }, query);
            console.debug(`\n user ==> ${user}`);

            return res.status(201).send({
                success: true,
                message: "User fetched successfully",
                data: user
            })
        } catch (error) {
            console.error("Error while getting user by Id ==> ", error);
            next(error);
            return;
        }
    };

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId: string = req.user?.id!;
            console.debug(`\n User id ==> ${userId}`);

            const user = await userService.deleteUser(userId);
            console.debug(`\n user ==> ${user}`);

            return res.status(201).send({
                success: true,
                message: "User deleted successfully",
                data: user
            })
        } catch (error) {
            console.error("Error while deleting user ==> ", error);
            next(error);
            return;
        }
    }
}