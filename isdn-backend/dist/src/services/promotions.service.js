"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promotions_repository_1 = __importDefault(require("../repositories/promotions.repository"));
class PromotionsService {
    async getAllPromotions() {
        return await promotions_repository_1.default.findAll();
    }
    async getPromotionById(id) {
        const promotion = await promotions_repository_1.default.findById(id);
        if (!promotion) {
            throw new Error("Promotion not found");
        }
        return promotion;
    }
    async createPromotion(data) {
        // Validate dates
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (endDate <= startDate) {
            throw new Error("End date must be after start date");
        }
        if (data.discountPercent <= 0 || data.discountPercent > 100) {
            throw new Error("Discount percent must be between 0 and 100");
        }
        return await promotions_repository_1.default.create(data);
    }
    async updatePromotion(id, data) {
        // Check if promotion exists
        const existingPromotion = await promotions_repository_1.default.findById(id);
        if (!existingPromotion) {
            throw new Error("Promotion not found");
        }
        // Validate dates if both are provided
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            if (endDate <= startDate) {
                throw new Error("End date must be after start date");
            }
        }
        // Validate discount percent if provided
        if (data.discountPercent !== undefined &&
            (data.discountPercent <= 0 || data.discountPercent > 100)) {
            throw new Error("Discount percent must be between 0 and 100");
        }
        return await promotions_repository_1.default.update(id, data);
    }
    async deletePromotion(id) {
        // Check if promotion exists
        const existingPromotion = await promotions_repository_1.default.findById(id);
        if (!existingPromotion) {
            throw new Error("Promotion not found");
        }
        return await promotions_repository_1.default.delete(id);
    }
}
exports.default = new PromotionsService();
//# sourceMappingURL=promotions.service.js.map