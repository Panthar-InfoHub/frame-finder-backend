import jwt from "jsonwebtoken";

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export const generateTokens = (user: JwtPayload): { accessToken: string } => {
    const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const jwtExpire = process.env.JWT_EXPIRE;
    if (!jwtExpire) {
        throw new Error("JWT_EXPIRE is not defined in environment variables");
    }

    const accessToken = jwt.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRE as any
    });

    return { accessToken };
};

export const getStartDate = (p: string): Date => {
        const date = new Date();
        switch (p) {
            case '1day': date.setDate(date.getDate() - 1); break;
            case '1week': date.setDate(date.getDate() - 7); break;
            case '1month': date.setMonth(date.getMonth() - 1); break;
            case '3month': date.setMonth(date.getMonth() - 3); break;
            case '1year': date.setFullYear(date.getFullYear() - 1); break;
            case 'more': date.setFullYear(date.getFullYear() - 1); break;
            default: date.setMonth(date.getMonth() - 6); break; //Default 6 month data
        }
        return date;
    };