import { NextFunction, Request, Response } from "express";
import { Miscellaneous } from "../models/miscellaneous.js";
import mongoose from "mongoose";

export const getFrameData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.debug("\nGetting data for frame form....")

        const vendorId = new mongoose.Types.ObjectId(req.user?.id)


        const matchFields = ["material", "shape", "style"]
        const result = await Miscellaneous.aggregate([
            { $match: { type: { $in: matchFields } } }, //Filter with type in misc module
            { $unwind: "$values" }, //Unwind the db values
            { $project: { type: 1, value: "$values" } },


            // Union with Vendor Misc pipeline 
            {
                $unionWith: {
                    coll: "vendormiscs",
                    pipeline: [
                        {
                            $match: {
                                type: { $in: matchFields },
                                vendorId
                            }
                        },
                        { $unwind: "$values" },
                        { $project: { type: 1, value: "$values" } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$type",
                    values: { $addToSet: "$value" }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    values: 1
                }
            },
            { $sort: { _id: 1 } }
        ])

        console.log("Result for form creation form ==> ", result);

        res.status(200).send({
            success: true,
            message: "Data fetched successfully",
            data: result
        })
    } catch (error) {
        console.error("Error while getting frame data ==> ", error)
        next(error);
        return;
    }
}