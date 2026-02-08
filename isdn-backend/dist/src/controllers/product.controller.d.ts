import { Request, Response, NextFunction } from "express";
declare class ProductController {
    getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    createProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    activateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ProductController;
export default _default;
