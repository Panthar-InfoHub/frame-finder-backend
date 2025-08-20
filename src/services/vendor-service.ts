import { Vendor } from "../models/Vendor.js";

class VendorClass {
    async createVendor(vendorData: any) {
        try {
            return await Vendor.create(vendorData)
        } catch (error) {
            console.error("\nError creating vendor: ", error);
            throw error;
        }
    }
}

export const VendorService = new VendorClass();
