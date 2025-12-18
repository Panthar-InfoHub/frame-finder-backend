import { generateTokens } from "../lib/uitils.js";
import AppError from "../middlwares/Error.js";
import { Vendor } from "../models/Vendor.js";

class VendorClass {
    async completeRegistration(phone: string, vendorData: any) {
        const vendor = await Vendor.findOne({ phone, isActive: false, 'phoneVerification.isVerified': true })

        if (!vendor) {
            console.warn(`Vendor with phone ${phone} is not verified or already active.`);
            throw new AppError("Venddor already verified or phone number not verified.", 409);
        }

        Object.assign(vendor, vendorData);
        vendor.isActive = true;
        const updatedVendor = await vendor.save();
        console.debug("\n Updated vendor ==> ", updatedVendor);

        const token = generateTokens({ id: updatedVendor._id.toString(), email: updatedVendor.email!, role: updatedVendor.role });
        console.debug("\n Generated token for vendor ==> ", token);

        return {
            business_name: updatedVendor.business_name,
            email: updatedVendor.email,
            phone: updatedVendor.phone,
            token
        }
    }

    async searchVendorByPhone(phone: string) {
        return await Vendor.findOne({ phone, isActive: true }).select("-password -phoneVerification");
    }
}

export const VendorService = new VendorClass();
