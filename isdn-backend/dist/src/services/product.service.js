"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_repository_1 = __importDefault(require("../repositories/product.repository"));
const productCategory_repository_1 = __importDefault(require("../repositories/productCategory.repository"));
class ProductService {
    async getAllProducts() {
        return await product_repository_1.default.findAll();
    }
    async getProductById(id) {
        const product = await product_repository_1.default.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    }
    async getProductsByCategory(categoryId) {
        // Verify category exists
        const category = await productCategory_repository_1.default.findById(categoryId);
        if (!category) {
            throw new Error("Product category not found");
        }
        return await product_repository_1.default.findByCategory(categoryId);
    }
    async createProduct(productData) {
        // Check if product with the same code already exists
        const existingProduct = await product_repository_1.default.findByProductCode(productData.productCode);
        if (existingProduct) {
            throw new Error("Product with this code already exists");
        }
        // Verify category exists
        const category = await productCategory_repository_1.default.findById(Number(productData.categoryId));
        if (!category) {
            throw new Error("Product category not found");
        }
        return await product_repository_1.default.create(productData);
    }
    async updateProduct(id, productData) {
        await this.getProductById(id);
        // If product code is being updated, check if it's already in use by another product
        if (productData.productCode) {
            const existingProduct = await product_repository_1.default.findByProductCode(productData.productCode);
            if (existingProduct && existingProduct.id !== BigInt(id)) {
                throw new Error("Product code is already in use by another product");
            }
        }
        // If category is being updated, verify it exists
        if (productData.categoryId) {
            const category = await productCategory_repository_1.default.findById(Number(productData.categoryId));
            if (!category) {
                throw new Error("Product category not found");
            }
        }
        return await product_repository_1.default.update(id, productData);
    }
    async deleteProduct(id) {
        await this.getProductById(id);
        // Check if product is being used in inventory or orders
        const isInUse = await product_repository_1.default.checkProductInUse(id);
        if (isInUse) {
            throw new Error("Cannot delete product that has inventory or order records. Consider deactivating it instead.");
        }
        return await product_repository_1.default.delete(id);
    }
    async activateProduct(id) {
        await this.getProductById(id);
        return await product_repository_1.default.update(id, { active: true });
    }
    async deactivateProduct(id) {
        await this.getProductById(id);
        return await product_repository_1.default.update(id, { active: false });
    }
}
exports.default = new ProductService();
//# sourceMappingURL=product.service.js.map