import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
import { Miscellaneous } from "../models/miscellaneous.js";

export const addValues = async (req: Request, res: Response, next: NextFunction) => {
    const session = await startSession()

    await session.startTransaction()
    try {

        const { type, values, miscellaneous } = req.body

        console.debug("\n Requested data to add or create ==> ", req.body)
        if (!type) {
            console.warn("No type is provided...")
            res.status(400).send({
                success: false,
                message: "No type is provided"
            })
        }

        let query: any = {}
        if (miscellaneous) {
            query.$set = { miscellaneous };
        }
        if (values && Array.isArray(values)) {
            query.$addToSet = { values: { $each: values } }
        }

        const misc = await Miscellaneous.findOneAndUpdate(
            { type },
            query,
            { new: true, upsert: true, session }
        )

        console.debug("Misc document created ==> ", misc)
        await session.commitTransaction();
        console.debug("\nTransaction committed successfully");

        res.status(200).send({
            success: true,
            message: "misc updated successfully",
            data: misc
        });
        return;

    } catch (error) {
        console.error("Error while add values or creating miscellaneous document ==> ", error)
        await session.abortTransaction()
        next(error);
        return;
    }
}

export const removeValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, value } = req.body

        console.debug("Type from body: ", type + " Values" + value);

        if (!type) {
            console.warn("No type is provided...")
            res.status(400).send({
                success: false,
                message: "No type is provided"
            })
        }

        const misc = await Miscellaneous.findOneAndUpdate(
            { type },
            { $pull: { values: { value } } },
            { new: true }
        )

        console.debug("misc value removed successfully: ", misc);

        res.status(200).send({
            success: true,
            message: "misc updated successfully",
            data: misc
        });
        return;

    } catch (error) {
        console.error("Error while removing value from misc document");
        next(error);
        return;
    }
}

export const getValues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.query.type as string

        console.debug("Getting values for type ==> ", type)
        if (!type) {
            console.warn("Type query param is required")
            return res.status(400).send({
                success: false,
                message: "Type query param is required",
            });
        }

        const misc = await Miscellaneous.findOne({ type }).lean();

        if (!misc) {
            console.warn("No misc module found for given type")
            return res.status(404).send({
                success: false,
                message: "No misc module found for given type",
            });
        }

        console.debug("\n Miscellaneous module ==> ", misc)

        res.status(200).send({
            success: true,
            data: misc,
        });
        return;
    } catch (error) {
        console.error("Error while getting value from misc document");
        next(error);
        return;
    }
}

export const getAllTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.debug("Getting all types of misc...")
        const misc = await Miscellaneous.find({}).lean();

        console.debug("misc ==> ", misc)

        res.status(200).send({
            success: true,
            data: misc,
        });
        return;
    } catch (error) {
        console.error("Error while getting all misc type");
        next(error);
        return;
    }
}

export const deletetype = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const miscId = req.params.id;

        console.debug("Deleting misc document of Id ==> ", miscId)

        const misc = await Miscellaneous.findByIdAndDelete(miscId)

        console.debug("\n Deleted document ==> ", misc)

        res.status(200).send({
            success: false,
            message: "Misc document deleted successfully...",
            data: misc
        })
        return;

    } catch (error) {
        console.error("Error while deleting the type", error);
        next(error);
        return;
    }
}
