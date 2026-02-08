"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productCategory_repository_1 = __importDefault(require("../repositories/productCategory.repository"));
class ProductCategoryService {
    async getAllCategories() {
        return await productCategory_repository_1.default.findAll();
    }
    async getCategoryById(id) {
        const category = await productCategory_repository_1.default.findById(id);
        if (!category) {
            throw new Error("Product category not found");
        }
        return category;
    }
    async createCategory(categoryData) {
        // Check if category with the same name already exists
        const existingCategory = await productCategory_repository_1.default.findByName(categoryData.name);
        if (existingCategory) {
            throw new Error("Product category with this name already exists");
        }
        return await productCategory_repository_1.default.create(categoryData);
    }
    async updateCategory(id, categoryData) {
        await this.getCategoryById(id);
        // If name is being updated, check if it's already in use by another category
        if (categoryData.name) {
            const existingCategory = await productCategory_repository_1.default.findByName(categoryData.name);
            if (existingCategory && existingCategory.id !== BigInt(id)) {
                throw new Error("Category name is already in use by another category");
            }
        }
        return await productCategory_repository_1.default.update(id, categoryData);
    }
    async deleteCategory(id) {
        await this.getCategoryById(id);
        // Check if category is being used by any products
        const isInUse = await productCategory_repository_1.default.checkCategoryInUse(id);
        if (isInUse) {
            throw new Error("Cannot delete category that has associated products. Please reassign or delete the products first.");
        }
        return await productCategory_repository_1.default.delete(id);
    }
}
exports.default = new ProductCategoryService();
//# sourceMappingURL=productCategory.service.js.map