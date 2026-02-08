import { Promotion, CreatePromotionDto, UpdatePromotionDto } from "../types";
declare class PromotionsRepository {
    findAll(): Promise<Promotion[]>;
    findById(id: string | number): Promise<Promotion | null>;
    create(data: CreatePromotionDto): Promise<Promotion>;
    update(id: string | number, data: UpdatePromotionDto): Promise<Promotion>;
    delete(id: string | number): Promise<Promotion>;
}
declare const _default: PromotionsRepository;
export default _default;
