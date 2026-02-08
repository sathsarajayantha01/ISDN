import prisma from "../../config/database";
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from "../types";

class PromotionsRepository {
  async findAll(): Promise<Promotion[]> {
    return await prisma.promotion.findMany();
  }

  async findById(id: string | number): Promise<Promotion | null> {
    return await prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
  }

  async create(data: CreatePromotionDto): Promise<Promotion> {
    return await prisma.promotion.create({
      data: {
        title: data.title,
        discountPercent: data.discountPercent,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active ?? true,
      },
    });
  }

  async update(
    id: string | number,
    data: UpdatePromotionDto,
  ): Promise<Promotion> {
    return await prisma.promotion.update({
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

  async delete(id: string | number): Promise<Promotion> {
    return await prisma.promotion.delete({
      where: { id: BigInt(id) },
    });
  }
}

export default new PromotionsRepository();
