import { startSession } from "mongoose";
import AppError from "../middlwares/Error.js";
import { User } from "../models/user.js";

export interface userData {
    name?: string;
    img?: { url?: string };
    phone?: string;
    email: string;
    password?: string;
    wallet_point?: number;
    prescription?: Record<string, unknown> | unknown;
    address?: {
        address_line_1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    isActive?: boolean;
}

class UserClass {
    createUser = async (userData: userData) => {
        const session = await startSession();
        try {
            const result = await session.withTransaction(async () => {
                const user = new User(userData)
                await user.save({ session })
                return user;
            })
            return result;

        } catch (error) {
            throw error;
        } finally {
            await session.endSession()
        }
    }

    updateUser = async (userData: userData, id: string) => {
        const session = await startSession();
        try {
            const result = await session.withTransaction(async () => {
                const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: userData }, { session, new: true })
                console.log("Updated user ==> ", updatedUser)
                return updatedUser;
            })
            return result;

        } catch (error) {
            throw error;
        } finally {
            await session.endSession()
        }
    }

    getUserById = async (userId: string) => {
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    }

    searchUser = async (pagination: { limit: number, page: number }, query: any) => {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const [users, totalUser] = await Promise.all([
            User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
            User.countDocuments(query)
        ]);

        console.debug("\nFetched users: ", users);
        console.debug("\nTotal user count: ", totalUser);

        return {
            data: users,
            pagination: {
                totalUser,
                totalPages: Math.ceil(totalUser / limit),
                page,
                limit
            }
        }
    }

    deleteUser = async (userId: string) => {
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    }
}

export const userService = new UserClass();