"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promotions_service_1 = __importDefault(require("../services/promotions.service"));
const serializer_1 = require("../utils/serializer");
class PromotionsController {
    async getAllPromotions(req, res, next) {
        try {
            const promotions = await promotions_service_1.default.getAllPromotions();
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(promotions),
                message: "Promotions retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getPromotionById(req, res, next) {
        try {
            const { id } = req.params;
            const promotionId = Array.isArray(id) ? id[0] : id;
            const promotion = await promotions_service_1.default.getPromotionById(promotionId);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(promotion),
                message: "Promotion retrieved successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createPromotion(req, res, next) {
        try {
            const promotionData = {
                title: req.body.title,
                discountPercent: parseFloat(req.body.discountPercent),
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                active: req.body.active !== undefined ? req.body.active : true,
            };
            const promotion = await promotions_service_1.default.createPromotion(promotionData);
            res.status(201).json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(promotion),
                message: "Promotion created successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePromotion(req, res, next) {
        try {
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const updateData = {};
            if (req.body.title !== undefined)
                updateData.title = req.body.title;
            if (req.body.discountPercent !== undefined) {
                updateData.discountPercent = parseFloat(req.body.discountPercent);
            }
            if (req.body.startDate !== undefined) {
                updateData.startDate = new Date(req.body.startDate);
            }
            if (req.body.endDate !== undefined) {
                updateData.endDate = new Date(req.body.endDate);
            }
            if (req.body.active !== undefined)
                updateData.active = req.body.active;
            const promotion = await promotions_service_1.default.updatePromotion(id, updateData);
            res.json({
                success: true,
                data: (0, serializer_1.serializeBigInt)(promotion),
                message: "Promotion updated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deletePromotion(req, res, next) {
        try {
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            await promotions_service_1.default.deletePromotion(id);
            res.json({
                success: true,
                message: "Promotion deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new PromotionsController();
//# sourceMappingURL=promotions.controller.js.map