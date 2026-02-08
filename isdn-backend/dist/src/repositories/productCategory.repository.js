"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
class ProductCategoryRepository {
    async findAll() {
        return await database_1.default.productCategory.findMany({
            include: {
                _count: {
                    select: {
                        product: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return await database_1.default.productCategory.findUnique({
            where: { id: BigInt(id) },
            include: {
                product: {
                    select: {
                        id: true,
                        productCode: true,
                        name: true,
                        unitPrice: true,
                        unitType: true,
                        active: true,
                    },
                },
            },
        });
    }
    async findByName(name) {
        return await database_1.default.productCategory.findUnique({
            where: { name },
        });
    }
    async create(categoryData) {
        return await database_1.default.productCategory.create({
            data: categoryData,
        });
    }
    async update(id, categoryData) {
        return await database_1.default.productCategory.update({
            where: { id: BigInt(id) },
            data: categoryData,
        });
    }
    async delete(id) {
        return await database_1.default.productCategory.delete({
            where: { id: BigInt(id) },
        });
    }
    async checkCategoryInUse(id) {
        const productCount = await database_1.default.product.count({
            where: { categoryId: BigInt(id) },
        });
        return productCount > 0;
    }
}
exports.default = new ProductCategoryRepository();
//# sourceMappingURL=productCategory.repository.js.map