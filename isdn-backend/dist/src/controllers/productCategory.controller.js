"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productCategory_service_1 = __importDefault(require("../services/productCategory.service"));
const serializer_1 = require("../utils/serializer");
class ProductCategoryController {
    async getAllCategories(req, res, next) {
        try {
            const categories = await productCategory_service_1.default.getAllCategories();
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(categories),
                message: "Product categories retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await productCategory_service_1.default.getCategoryById(id);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(category),
                message: "Product category retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createCategory(req, res, next) {
        try {
            const categoryData = req.body;
            // Validate required fields
            const requiredFields = ["name"];
            const missingFields = requiredFields.filter((field) => !categoryData[field]);
            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                });
                return;
            }
            const newCategory = await productCategory_service_1.default.createCategory(categoryData);
            res.status(201).json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(newCategory),
                message: "Product category created successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const categoryData = req.body;
            const updatedCategory = await productCategory_service_1.default.updateCategory(id, categoryData);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(updatedCategory),
                message: "Product category updated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            await productCategory_service_1.default.deleteCategory(id);
            res.json({
                success: true,
                message: "Product category deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ProductCategoryController();
//# sourceMappingURL=productCategory.controller.js.map