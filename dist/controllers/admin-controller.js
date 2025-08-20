import { Admin } from "../models/Admin.js";
import { generateTokens } from "../lib/uitils.js";
export const registerAdmin = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        console.debug("\nRegistering admin for data:  ", req.body);
        const admin = await Admin.create({ email, password, role });
        console.debug("\nAdmin registered successfully:  ", admin);
        const adminRes = admin.toObject();
        delete adminRes.password;
        res.status(201).send({
            success: true,
            message: "Admin registered successfully",
            admin: adminRes
        });
        return;
    }
    catch (error) {
        console.error("\nError registering admin:  ", error);
        next(error);
        return;
    }
};
export const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.debug("\nLogging in admin for data:  ", req.body);
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.warn("\nAdmin not found, check your credentials...");
            return res.status(401).send({
                success: false,
                message: "Admin not found, check your credentials..."
            });
        }
        const isPasswordCorrect = await admin.comparePassword(password);
        if (!isPasswordCorrect) {
            console.warn("\nInvalid password, check your credentials...");
            return res.status(401).send({
                success: false,
                message: "Invalid password, check your credentials..."
            });
        }
        const { accessToken } = generateTokens({ email, id: admin?._id, role: admin?.role });
        const adminRes = admin.toObject();
        delete adminRes.password;
        res.status(200).json({
            success: true,
            data: {
                user: adminRes,
                accessToken: accessToken
            }
        });
    }
    catch (error) {
        console.error("Error while admin login ==> ", error);
        next(error);
        return;
    }
};
