"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../config/database"));
class PromotionsRepository {
    async findAll() {
        return await database_1.default.promotion.findMany();
    }
    async findById(id) {
        return await database_1.default.promotion.findUnique({
            where: { id: BigInt(id) },
        });
    }
    async create(data) {
        return await database_1.default.promotion.create({
            data: {
                title: data.title,
                discountPercent: data.discountPercent,
                startDate: data.startDate,
                endDate: data.endDate,
                active: data.active ?? true,
            },
        });
    }
    async update(id, data) {
        return await database_1.default.promotion.update({
            where: { id: BigInt(id) },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.discountPercent !== undefined && {
                    discountPercent: data.discountPercent,
                }),
                ...(data.startDate && { startDate: data.startDate }),
                ...(data.endDate && { endDate: data.endDate }),
                ...(data.active !== undefined && { active: data.active }),
            },
        });
    }
    async delete(id) {
        return await database_1.default.promotion.delete({
            where: { id: BigInt(id) },
        });
    }
}
exports.default = new PromotionsRepository();
//# sourceMappingURL=promotions.repository.js.map