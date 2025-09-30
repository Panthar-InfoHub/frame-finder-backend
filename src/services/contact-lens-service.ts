import { ProductService } from './product-service.js';
import { ContactLens } from '../models/contact-lens.js';
import { Document, Model } from 'mongoose';
import AppError from '../middlwares/Error.js';
interface IProduct extends Document {
    status: string;
}

export class ContactLensService extends ProductService<IProduct> {
    constructor(model: Model<any>, modelName: string) {
        super(model, modelName);
    }

    // Contact lens specific variant update
    async updateLensVariant(id: string, variantId: string, updateData: any) {

        delete updateData.stock;

        const updateObject = Object.keys(updateData).reduce((acc, key) => {
            acc[`variants.$.${key}`] = updateData[key];
            return acc;
        }, {} as any);

        console.debug("Updated object ==> ", updateObject)

        const product = await this.model.findOneAndUpdate(
            { _id: id, "variants._id": variantId },
            { $set: updateObject },
            { new: true }
        );

        if (!product) {
            console.warn("\n Contact lens not found")
            throw new AppError(`${this.modelName} or variant not found`, 404);
        }
        return product;
    }

    // Override ONLY the stock update method for contact lens structure
    async updateLensStock(id: string, variantId: string, operation: 'increase' | 'decrease', quantity: number) {

        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);

        const product = await this.model.findOneAndUpdate(
            { _id: id, "variants._id": variantId },
            { $inc: { "variants.$.stock.current": finalQuantity } },
            { new: true }
        );

        if (!product) {
            console.warn(`${this.modelName} or variant not found`)
            throw new AppError(`${this.modelName} or variant not found`, 404);
        }
        return product;
    }

}
