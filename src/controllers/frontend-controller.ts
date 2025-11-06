import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../middlwares/Error.js";
import { ContactLens } from "../models/contact-lens.js";
import { Product } from "../models/products.js";
import { Sunglass } from "../models/sunglass.js";

const allProductModels = [Product, Sunglass, ContactLens];

class FrontendController {
    async searchProductAndSuggestion(req: Request, res: Response, next: NextFunction) {
        const { q: searchText, id: similarToId, type: productType } = req.query as { q: string, id: string, type: string };

        if (!searchText && !similarToId) {
            return next(new AppError("A search query (q) or a product ID (id) is required.", 400));
        }
        console.debug("\nSearch Text: ", searchText, "\tSimilar To ID: ", similarToId, "\tProduct Type: ", productType)

        let searchPromises;
        if (similarToId) {
            if (!productType) {
                return next(new AppError("Product type is required for similarity search.", 400));
            }

            if (!mongoose.Types.ObjectId.isValid(similarToId)) {
                return next(new AppError("Invalid Product ID.", 400));
            }

            const Model = mongoose.model(productType);
            const originalProduct: any = await Model.findById(similarToId).lean();
            if (!originalProduct) {
                return next(new AppError("Original product not found.", 404));
            }

            const derivedSearchText = `${originalProduct.brand_name || ''} ${originalProduct.style?.join(' ') || ''} ${originalProduct.shape?.join(' ') || ''}`.trim();


            searchPromises = allProductModels.map(model => {
                let searchPipeline;

                if (model.modelName === productType) {
                    searchPipeline = {
                        'moreLikeThis': {
                            'like': { '_id': new mongoose.Types.ObjectId(similarToId) }
                        }
                    };
                }
                else {
                    searchPipeline = {
                        'text': {
                            'query': derivedSearchText,
                            'path': { 'wildcard': '*' }
                        }
                    };
                }

                return model.aggregate([
                    { '$search': { 'index': 'default', ...searchPipeline } },
                    {
                        '$project': {
                            'brand_name': 1, 'style': 1, 'variants': 1,
                            'score': { '$meta': 'searchScore' },
                            'type': model.modelName
                        }
                    }
                ]);
            });

        }
        else {
            searchPromises = allProductModels.map(model =>
                model.aggregate([
                    {
                        '$search': {
                            'index': 'default',
                            'text': {
                                'query': searchText,
                                'path': { 'wildcard': '*' }
                            }
                        }
                    },
                    {
                        '$project': {
                            'brand_name': 1, 'style': 1, 'variants': 1,
                            'score': { '$meta': 'searchScore' },
                            'type': model.modelName
                        }
                    }
                ])
            );
        }

        const searchResults = await Promise.all(searchPromises);
        const combined = searchResults.flat();

        console.debug("\nSearch Results: ", combined)

        const filtered = similarToId
            ? combined.filter(item => item._id.toString() !== similarToId)
            : combined;

        filtered.sort((a: any, b: any) => b.score - a.score);

        const finalResults = filtered.slice(0, 10);

        return res.status(200).json({
            data: finalResults,
            message: "Search results",
            success: true
        });

    }
}

export default FrontendController;
