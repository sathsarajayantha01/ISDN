import { Request, Response, NextFunction } from "express";
declare class PromotionsController {
    getAllPromotions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPromotionById(req: Request, res: Response, next: NextFunction): Promise<void>;
    createPromotion(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePromotion(req: Request, res: Response, next: NextFunction): Promise<void>;
    deletePromotion(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: PromotionsController;
export default _default;
