import jwt from "jsonwebtoken";
export const generateTokens = (user) => {
    const payload = {
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
        expiresIn: process.env.JWT_EXPIRE
    });
    return { accessToken };
};
