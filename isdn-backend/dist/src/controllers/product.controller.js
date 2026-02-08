"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_service_1 = __importDefault(require("../services/product.service"));
const serializer_1 = require("../utils/serializer");
const multer_1 = require("../utils/multer");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const products = await product_service_1.default.getAllProducts();
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(products),
                message: "Products retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_1.default.getProductById(id);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(product),
                message: "Product retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProductsByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;
            const products = await product_service_1.default.getProductsByCategory(categoryId);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(products),
                message: "Products retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const productData = req.body;
            // Validate required fields
            const requiredFields = [
                "productCode",
                "name",
                "categoryId",
                "unitPrice",
                "unitType",
            ];
            const missingFields = requiredFields.filter((field) => !productData[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                });
                return;
            }
            // Add image path if file was uploaded
            if (req.file) {
                productData.imageUrl = (0, multer_1.getImagePath)(req.file.filename);
            }
            const newProduct = await product_service_1.default.createProduct(productData);
            res.status(201).json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(newProduct),
                message: "Product created successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const productData = req.body;
            // Add image path if file was uploaded
            if (req.file) {
                productData.imageUrl = (0, multer_1.getImagePath)(req.file.filename);
            }
            const updatedProduct = await product_service_1.default.updateProduct(id, productData);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(updatedProduct),
                message: "Product updated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            await product_service_1.default.deleteProduct(id);
            res.json({
                success: true,
                message: "Product deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async activateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProduct = await product_service_1.default.activateProduct(id);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(updatedProduct),
                message: "Product activated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProduct = await product_service_1.default.deactivateProduct(id);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(updatedProduct),
                message: "Product deactivated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ProductController();
//# sourceMappingURL=product.controller.js.map