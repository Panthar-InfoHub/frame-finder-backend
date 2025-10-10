import mongoose, { Model, startSession, Document } from 'mongoose';
import AppError from '../middlwares/Error.js';

interface IProduct extends Document {
    status: string;
}

export class ProductService<T extends IProduct> {
    protected model: Model<T>;
    protected modelName: string;

    constructor(model: Model<any>, modelName: string) {
        this.model = model;
        this.modelName = modelName;
    }

    // Create product
    async create(data: any) {

        const session = await mongoose.startSession();

        const result = await session.withTransaction(async () => {
            const [product] = await this.model.create([data], { session });
            if (!product) {
                throw new AppError(`Failed to create ${this.modelName}`, 500);
            }
            return product;
        })
        return result;
    }

    // Update product except stock
    async update(id: string, updateData: any) {

        const product = await this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!product) {
            throw new AppError(`${this.modelName} not found`, 404);
        }
        return product;
    }

    // Update stock of product variant
    async updateStock(id: string, variantId: string, operation: 'increase' | 'decrease', quantity: number, ...additionalParams: any[]) {
        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);
        const product = await this.model.findOneAndUpdate(
            { _id: id, "variants._id": variantId },
            { $inc: { "variants.$.stock.current": finalQuantity } },
            { new: true }
        );
        if (!product) {
            console.warn(`Product with ID ${id} and variant with ID ${variantId} not found.`);
            throw new AppError(`${this.modelName} not found`, 404);
        }
        return product;
    }

    // Get all products
    async getAll(params: any) {
        const { filter, skip, limit } = params;
        console.debug("\nFilter for products: ", filter);
        console.debug("\nSkip for products: ", skip);
        console.debug("\nLimit for products: ", limit);

        const [products, totalProducts] = await Promise.all([
            this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.model.countDocuments(filter)
        ]);

        console.debug("\nFetched products: ", products);
        console.debug("\nTotal products count: ", totalProducts);

        return {
            products,
            pagination: {
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit)
            }
        };
    }

    // Get product by id
    async getById(id: string) {
        const item = await this.model.findById(id).populate("vendorId", "business_name email phone");
        if (!item || item.status === 'inactive') {
            console.warn(`Product with ID ${id} not found`);
            throw new AppError(`${this.modelName} not found`, 404);
        }
        return item;
    }

    // Delete product
    async delete(id: string) {
        const product = await this.model.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
        if (!product) {
            console.warn(`Product with ID ${id} not found`);
            throw new AppError(`${this.modelName} not found`, 404);
        }
        return product;
    }
}
