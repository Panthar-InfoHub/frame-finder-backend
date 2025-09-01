import { Router } from "express";
import { auth } from "../middlwares/auth.js";
import { isAdmin, isVendor } from "../middlwares/roleCheck.js";
import { addValues, removeValue, getValues, getAllTypes, deletetype } from "../controllers/misc-controller.js";

export const miscRouter = Router();

miscRouter.post("/", [
    auth,
    isAdmin
], addValues)

miscRouter.put("/", [
    auth,
    isAdmin
], removeValue)

miscRouter.get("/values", [
    auth,
    isVendor
], getValues)

miscRouter.get("/all-", [
    auth,
    isAdmin
], getAllTypes)

miscRouter.delete("/:id", [
    auth,
    isAdmin
], deletetype)