import { VendorRequest } from "../models/vendor_request.js";
import { VendorService } from "../services/vendor-service.js";
export const createVendorRequest = async (req, res, next) => {
    try {
        const { full_name, designation, email, phone_number, has_gst, gst_number, business_type, business_name, address, product_category, online_presence } = req.body;
        console.debug("\nCreating vendor request for data:  ", req.body);
        const vendorRequest = await VendorRequest.create({ full_name, designation, email, phone_number, has_gst, gst_number, business_type, business_name, address, product_category, online_presence });
        console.debug("\nVendor request created successfully:  ", vendorRequest);
        res.status(201).send({
            success: true,
            message: "Vendor request created successfully",
            vendorRequest
        });
        return;
    }
    catch (error) {
        console.error("\nError creating vendor request:  ", error);
        next(error);
        return;
    }
};
export const getAllVendorRequest = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        console.debug(`\n Fetching vendor requests - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
        let filter = {};
        if (status) {
            filter.status = status;
        }
        console.debug(`\nFilter for vendor requests: `, filter);
        const [vendorRequests, totalRequests] = await Promise.all([
            VendorRequest.find(filter).skip(skip).limit(limit),
            VendorRequest.countDocuments(filter)
        ]);
        console.debug(`\nFetched vendor requests: `, vendorRequests);
        console.debug(`\nTotal vendor requests: `, totalRequests);
        res.status(200).send({
            success: true,
            message: "Vendor requests fetched successfully",
            data: vendorRequests,
            pagination: {
                total: totalRequests,
                totalPages: Math.ceil(totalRequests / limit)
            }
        });
        return;
    }
    catch (error) {
        console.error("Error while getting all vendor requests: ", error);
        next(error);
        return;
    }
};
export const updateRequestStatus = async (req, res, next) => {
    try {
        const reqId = req.params.id;
        const { status } = req.body;
        console.debug(`Request Id : ${reqId} and status : ${status}`);
        const updatedRes = await VendorRequest.findByIdAndUpdate(reqId, { status }, { new: true });
        if (!updatedRes) {
            console.warn("\nVendor Req not found for ID:", reqId);
            res.status(404).send({
                success: false,
                message: "Vendor Req not found",
            });
            return;
        }
        console.debug("\nUpdated vendor request ==> ", updatedRes);
        if (status === "accepted") {
            console.debug("Vendor request accepted and creating vendor...");
            const vendor = await VendorService.createVendor({
                business_name: updatedRes.business_name,
                business_owner: updatedRes.full_name,
                email: updatedRes.email,
                phone: updatedRes.phone_number,
                gst_number: updatedRes.gst_number,
                address: updatedRes.address,
            });
            console.debug("Vendor created successfully from request ====> ", vendor);
        }
        res.status(200).send({
            success: true,
            message: "Vendor request updated successfully",
            data: updatedRes,
        });
    }
    catch (error) {
        console.error("Error while updating status of vendor form ==> ", error);
        next(error);
        return;
    }
};
export const deleteVendorReq = async (req, res, next) => {
    try {
        const vendorReqID = req.params.id;
        console.debug("Deleting Vendor Req id:", vendorReqID);
        const vendorReq = await VendorRequest.findByIdAndDelete(vendorReqID);
        if (!vendorReq) {
            console.warn("Vendor Request not found for ID:", vendorReq);
            res.status(404).send({
                success: false,
                message: "Vendor Request not found",
            });
            return;
        }
        console.debug("Vendor Request deleted successfully:", vendorReq);
        res.status(200).send({
            success: true,
            message: "Vendor Request deleted successfully",
            data: vendorReq,
        });
        return;
    }
    catch (error) {
        console.error("Error deleting booking:", error);
        next(error);
        return;
    }
};
export const getVendorReq = async (req, res, next) => {
    try {
        const reqID = req.params.id;
        console.debug("Vendor Request ID :", reqID);
        const vendorReq = await VendorRequest.findById(reqID);
        if (!vendorReq) {
            console.warn("Vendor Req not found for ID:", vendorReq);
            res.status(404).send({
                success: false,
                message: "Vendor Req not found",
            });
            return;
        }
        console.debug("Vendor Req fetched successfully:", vendorReq);
        res.status(200).send({
            success: true,
            message: "Vendor Req fetched successfully",
            data: vendorReq
        });
        return;
    }
    catch (error) {
        console.error("Error while getting booking : ", error);
        next(error);
        return;
    }
};
