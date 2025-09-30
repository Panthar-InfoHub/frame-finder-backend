import { Router } from "express";
import { body, param } from "express-validator";
import { LensController } from "../controllers/contact-lens-controller.js";
import { auth } from "../middlwares/auth.js";
import { isVendor } from "../middlwares/roleCheck.js";
import { ColorContactLens } from "../models/color-contact-lens.js";

export const clrContactLensRouter = Router();

const contactLensController = new LensController(ColorContactLens, "Color Contact Lens")

clrContactLensRouter.post("/", [
    auth,
    isVendor
], contactLensController.createContactLens)

clrContactLensRouter.get("/", contactLensController.getAllContactLens)
clrContactLensRouter.get("/:id", contactLensController.getContactLensById)

clrContactLensRouter.put("/:id", [
    auth,
    isVendor,
    param('id').isMongoId().withMessage("Invalid Id format"),
], contactLensController.updateContactLens)

clrContactLensRouter.put("/:id/variant", [
    auth,
    isVendor,
    param('id').isMongoId().withMessage("Invalid Id format"),
    body('variantId').isMongoId().withMessage('Invalid variant ID format'),
    body('lens_type').isIn(['non_toric', 'toric', 'multi_focal']).withMessage('Lens type must be non_toric, toric, or multi_focal'),
    body('stock').not().exists().withMessage('Stock updates not allowed in variant update endpoint'),
], contactLensController.updateLensVariantDetail)

clrContactLensRouter.put("/:id/stock", [
    auth,
    isVendor,
    param('id').isMongoId().withMessage("Invalid Id format"),
    body('variantId').isMongoId().withMessage('Invalid variant ID format'),
    body('lens_type').isIn(['non_toric', 'toric', 'multi_focal']).withMessage('Lens type must be non_toric, toric, or multi_focal'),
], contactLensController.updateLensStock)

clrContactLensRouter.delete("/:id", [
    auth,
    isVendor,
    param('id').isMongoId().withMessage("Invalid Id format"),
], contactLensController.deleteContactLens)