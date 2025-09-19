// routes/contactLensRoutes.ts
import express from 'express';
import {
    createContactLensProduct,
    getAllContactLensProducts,
    getContactLensProductById,
    updateContactLensProduct,
    updateContactLensProductStock,
    deleteContactLensProduct
} from '../controllers/contact-lens-controller.js';
import { auth } from '../middlwares/auth.js';
import { isVendor } from '../middlwares/roleCheck.js';

export const contactLensRouter = express.Router();

// /contact-lens/contact_lens
contactLensRouter.post('/:type', [auth, isVendor], createContactLensProduct);

// /contact-lens/contact_lens
contactLensRouter.get('/:type', getAllContactLensProducts);

// /contact-lens/contact_lens/:id
contactLensRouter.get('/:type/:id', getContactLensProductById);

// /contact-lens/contact_lens/:id
contactLensRouter.put('/:type/:id', [auth, isVendor], updateContactLensProduct);

// /contact-lens/contact_lens/:id/stock 
contactLensRouter.put('/:type/:id/stock', [auth, isVendor], updateContactLensProductStock);

// /contact-lens/contact_lens/:id
contactLensRouter.delete('/:type/:id', [auth, isVendor], deleteContactLensProduct);