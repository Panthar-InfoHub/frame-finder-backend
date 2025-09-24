import AppError from "../middlwares/Error.js";
import { User } from "../models/user.js";

class UserClass {
    async updateUser(userId: string, data: any) {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            data,
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            console.warn("User not found with id ===> ", userId);
            throw new AppError("User not found", 404);
        }
        return updatedUser;
    }
}

export const userService = new UserClass();