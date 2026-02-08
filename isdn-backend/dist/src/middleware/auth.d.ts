import { Request, Response, NextFunction } from "express";
import { User } from "../types";
interface AuthenticatedRequest extends Request {
    user?: User;
}
declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
declare const authorize: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export { authenticate, authorize };
