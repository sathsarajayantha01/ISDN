import { Request, Response, NextFunction } from "express";
import promotionsService from "../services/promotions.service";
import { CreatePromotionDto, UpdatePromotionDto } from "../types";
import { serializeBigInt } from "../utils/serializer";

class PromotionsController {
  async getAllPromotions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const promotions = await promotionsService.getAllPromotions();
      res.json({
        success: true,
        data: serializeBigInt(promotions),
        message: "Promotions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getPromotionById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const promotionId = Array.isArray(id) ? id[0] : id;
      const promotion = await promotionsService.getPromotionById(promotionId);
      res.json({
        success: true,
        data: serializeBigInt(promotion),
        message: "Promotion retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async createPromotion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const promotionData: CreatePromotionDto = {
        title: req.body.title,
        discountPercent: parseFloat(req.body.discountPercent),
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        active: req.body.active !== undefined ? req.body.active : true,
      };

      const promotion = await promotionsService.createPromotion(promotionData);
      res.status(201).json({
        success: true,
        data: serializeBigInt(promotion),
        message: "Promotion created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePromotion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const updateData: UpdatePromotionDto = {};

      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.discountPercent !== undefined) {
        updateData.discountPercent = parseFloat(req.body.discountPercent);
      }
      if (req.body.startDate !== undefined) {
        updateData.startDate = new Date(req.body.startDate);
      }
      if (req.body.endDate !== undefined) {
        updateData.endDate = new Date(req.body.endDate);
      }
      if (req.body.active !== undefined) updateData.active = req.body.active;

      const promotion = await promotionsService.updatePromotion(id, updateData);
      res.json({
        success: true,
        data: serializeBigInt(promotion),
        message: "Promotion updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePromotion(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await promotionsService.deletePromotion(id);
      res.json({
        success: true,
        message: "Promotion deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PromotionsController();
