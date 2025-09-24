// services/ContactLensService.ts
import AppError from "../middlwares/Error.js";
import { ContactLens } from "../models/contact-lens.js";

type ProductType = 'contact_lens' | 'contact_lens_color';

export class ContactLensService {
    // Get the correct model based on product type
    private getModel(productType: ProductType): any {
        const modelMap = {
            'contact_lens': ContactLens,
            'contact_lens_color': ""
        };
        return modelMap[productType];
    }

    async createProduct(productType: ProductType, productData: any): Promise<any> {
        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        const product = new Model(productData);
        await product.save();
        return product;
    }

    async getAllProducts(productType: ProductType, page: number = 1, limit: number = 100, search?: string,): Promise<{ products: any[], pagination: { totalProducts: number, totalPages: number } }> {

        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        const skip = (page - 1) * limit;

        console.debug("\nSearch query: ", search);

        // Build filter object
        let filter: any = { status: 'active' };

        // Add text search filter
        if (search) {
            const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

            filter = {
                ...filter,
                $or: [
                    { productCode: { $regex: escapedSearch, $options: 'i' } },
                    { $text: { $search: search } }
                ]
            };
        }

        console.debug("Filter for products: ", filter);

        // Execute both queries in parallel
        const [products, totalProducts] = await Promise.all([
            Model.find(filter)
                .skip(skip)
                .limit(limit),
            Model.countDocuments(filter)
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

    async getProductById(productType: ProductType, productId: string): Promise<any> {
        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        const product = await Model.findById(productId).populate("vendorId", "business_name email phone");

        if (!product || product.status === 'inactive') {
            throw new AppError('Product not found', 404);
        }

        return product;
    }

    async updateProduct(productType: ProductType, productId: string, updateData: any): Promise<any> {
        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        const product = await Model.findByIdAndUpdate(productId, updateData, { new: true });
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    }

    // Add this to ContactLensService class
    async updateProductStock(productType: ProductType, productId: string, operation: string, quantity: number): Promise<any> {
        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        if (!operation || !quantity) {
            throw new AppError("Operation and quantity are required", 400);
        }

        const finalQuantity = operation === "increase" ? Math.abs(quantity) : -Math.abs(quantity);
        const updateOpn = { $inc: { "stock.current": finalQuantity } };

        console.debug("Update operation: ", updateOpn);

        const product = await Model.findByIdAndUpdate(productId, updateOpn, { new: true });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    }


    async deleteProduct(productType: ProductType, productId: string): Promise<void> {
        const Model = this.getModel(productType);

        if (!Model) {
            throw new AppError('Invalid Product Type', 400);
        }

        const product = await Model.findByIdAndUpdate(productId, { status: "inactive" });
        if (!product) {
            throw new AppError('Product not found', 404);
        }
    }
}
