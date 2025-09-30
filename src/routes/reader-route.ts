import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
import { createReader, updateReader, updateReaderStock, getAllReader, getReaderById, deleteReader } from "../controllers/reader-controller.js";

export const readerRouter = Router();

// Reader glass Routes with Authentication access for Create, Update and Delete Operation
//Create Reader Glass 
readerRouter.post("/", [
    auth,
    isVendor
], createReader)

//Update Reader Glass details except stock
readerRouter.put("/:id", [
    auth,
    isVendor
], updateReader)

//Update Reader Glass stock
readerRouter.put("/:id/stock", [
    auth,
    isVendor
], updateReaderStock)

//get all Reader Glasss
readerRouter.get("/", [
    // auth,
], getAllReader)

//get Reader Glass by id
readerRouter.get("/:id", [
    // auth,
], getReaderById)

//delete Reader Glass
readerRouter.delete("/:id", [
    auth,
    isVendor
], deleteReader)