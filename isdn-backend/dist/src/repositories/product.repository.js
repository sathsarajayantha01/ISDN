"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
const multer_1 = require("../utils/multer");
class ProductRepository {
    async findAll() {
        return await database_1.default.product.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                promotion: true,
                productImages: true,
            },
        });
    }
    async findById(id) {
        return await database_1.default.product.findUnique({
            where: { id: BigInt(id) },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                promotion: true,
                productImages: true,
                inventories: {
                    include: {
                        branch: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findByProductCode(productCode) {
        return await database_1.default.product.findUnique({
            where: { productCode },
            include: {
                productImages: true,
            },
        });
    }
    async findByCategory(categoryId) {
        return await database_1.default.product.findMany({
            where: { categoryId: BigInt(categoryId) },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                productImages: true,
            },
        });
    }
    async create(productData) {
        const { imageUrl, ...dataWithoutImage } = productData;
        const product = await database_1.default.product.create({
            data: {
                ...dataWithoutImage,
                imageUrl: imageUrl || null,
                categoryId: BigInt(productData.categoryId),
                promotionId: productData.promotionId
                    ? BigInt(productData.promotionId)
                    : null,
            },
            include: {
                category: true,
                promotion: true,
                productImages: true,
            },
        });
        // If image URL is provided, also create a ProductImage record
        if (imageUrl) {
            await database_1.default.productImage.create({
                data: {
                    productId: product.id,
                    imageUrl: imageUrl,
                },
            });
        }
        return product;
    }
    async update(id, productData) {
        const updateData = { ...productData };
        // Convert BigInt fields
        if (productData.categoryId) {
            updateData.categoryId = BigInt(productData.categoryId);
        }
        if (productData.promotionId !== undefined) {
            updateData.promotionId = productData.promotionId
                ? BigInt(productData.promotionId)
                : null;
        }
        // If updating with a new image, also create a ProductImage record
        const { imageUrl, ...dataWithoutImage } = updateData;
        const product = await database_1.default.product.update({
            where: { id: BigInt(id) },
            data: {
                ...dataWithoutImage,
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
            },
            include: {
                category: true,
                promotion: true,
                productImages: true,
            },
        });
        // If new image URL is provided, create a ProductImage record
        if (imageUrl) {
            await database_1.default.productImage.create({
                data: {
                    productId: product.id,
                    imageUrl: imageUrl,
                },
            });
        }
        return product;
    }
    async delete(id) {
        // Get the product to retrieve image paths
        const product = await this.findById(id);
        if (product && product.imageUrl) {
            (0, multer_1.deleteImageFile)(product.imageUrl);
        }
        // Delete related ProductImage records
        if (product?.productImages) {
            for (const productImage of product.productImages) {
                (0, multer_1.deleteImageFile)(productImage.imageUrl);
            }
        }
        return await database_1.default.product.delete({
            where: { id: BigInt(id) },
        });
    }
    async checkProductInUse(id) {
        const inventoryCount = await database_1.default.inventory.count({
            where: { productId: BigInt(id) },
        });
        const orderItemCount = await database_1.default.orderItem.count({
            where: { productId: BigInt(id) },
        });
        return inventoryCount > 0 || orderItemCount > 0;
    }
}
exports.default = new ProductRepository();
//# sourceMappingURL=product.repository.js.map