import { Promotion, CreatePromotionDto, UpdatePromotionDto } from "../types";
declare class PromotionsService {
    getAllPromotions(): Promise<Promotion[]>;
    getPromotionById(id: string | number): Promise<Promotion>;
    createPromotion(data: CreatePromotionDto): Promise<Promotion>;
    updatePromotion(id: string | number, data: UpdatePromotionDto): Promise<Promotion>;
    deletePromotion(id: string | number): Promise<Promotion>;
}
declare const _default: PromotionsService;
export default _default;
