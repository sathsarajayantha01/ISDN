import promotionsRepository from "../repositories/promotions.repository";
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from "../types";

class PromotionsService {
  async getAllPromotions(): Promise<Promotion[]> {
    return await promotionsRepository.findAll();
  }

  async getPromotionById(id: string | number): Promise<Promotion> {
    const promotion = await promotionsRepository.findById(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    return promotion;
  }

  async createPromotion(data: CreatePromotionDto): Promise<Promotion> {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    if (data.discountPercent <= 0 || data.discountPercent > 100) {
      throw new Error("Discount percent must be between 0 and 100");
    }

    return await promotionsRepository.create(data);
  }

  async updatePromotion(
    id: string | number,
    data: UpdatePromotionDto,
  ): Promise<Promotion> {
    // Check if promotion exists
    const existingPromotion = await promotionsRepository.findById(id);
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
    if (
      data.discountPercent !== undefined &&
      (data.discountPercent <= 0 || data.discountPercent > 100)
    ) {
      throw new Error("Discount percent must be between 0 and 100");
    }

    return await promotionsRepository.update(id, data);
  }

  async deletePromotion(id: string | number): Promise<Promotion> {
    // Check if promotion exists
    const existingPromotion = await promotionsRepository.findById(id);
    if (!existingPromotion) {
      throw new Error("Promotion not found");
    }

    return await promotionsRepository.delete(id);
  }
}

export default new PromotionsService();
