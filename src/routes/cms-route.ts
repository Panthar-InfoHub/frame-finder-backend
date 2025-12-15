import { Router } from "express";
import { isAdmin } from "../middlwares/roleCheck.js";
import { createCMS, searchCMS, updateCMS, deleteCMS, getCMSByKey, removeSubCMSValue } from "../controllers/cms-controller.js";
import { auth } from "../middlwares/auth.js";

export const cms_router = Router();

cms_router.post("/", [auth, isAdmin], createCMS);

cms_router.get("/key", [auth, isAdmin], getCMSByKey);
cms_router.get("/search", [auth, isAdmin], searchCMS);

cms_router.put("/remove-sub-cms/:id", [auth, isAdmin], removeSubCMSValue);
cms_router.put("/:id", [auth, isAdmin], updateCMS);

cms_router.delete("/:id", [auth, isAdmin], deleteCMS);