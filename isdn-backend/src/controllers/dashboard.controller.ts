import { Request, Response, NextFunction } from "express";
import dashboardService from "../services/dashboard.service";
import { serializeBigInt } from "../utils/serializer";

class DashboardController {
  async getOrderStatistics(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fromDate, toDate } = req.query;
      const branchId = req.headers["branchid"] as string | undefined;

      // Validate dates if provided
      if (fromDate && isNaN(Date.parse(fromDate as string))) {
        res.status(400).json({
          success: false,
          message: "Invalid fromDate format. Use ISO 8601 format (YYYY-MM-DD)",
        });
        return;
      }

      if (toDate && isNaN(Date.parse(toDate as string))) {
        res.status(400).json({
          success: false,
          message: "Invalid toDate format. Use ISO 8601 format (YYYY-MM-DD)",
        });
        return;
      }

      const statistics = await dashboardService.getOrderStatistics({
        branchId: branchId as string | undefined,
        fromDate: fromDate as string | undefined,
        toDate: toDate as string | undefined,
      });

      res.json({
        success: true,
        data: statistics,
        message: "Order statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fromDate, toDate } = req.query;
      const branchId = req.headers["branchid"] as string | undefined;
      const user = (req as any).user;

      // Validate dates if provided
      if (fromDate && isNaN(Date.parse(fromDate as string))) {
        res.status(400).json({
          success: false,
          message: "Invalid fromDate format. Use ISO 8601 format (YYYY-MM-DD)",
        });
        return;
      }

      if (toDate && isNaN(Date.parse(toDate as string))) {
        res.status(400).json({
          success: false,
          message: "Invalid toDate format. Use ISO 8601 format (YYYY-MM-DD)",
        });
        return;
      }

      const orders = await dashboardService.getRecentOrders({
        branchId: branchId as string | undefined,
        fromDate: fromDate as string | undefined,
        toDate: toDate as string | undefined,
      });

      res.json({
        success: true,
        data: serializeBigInt(orders),
        message: "Recent orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const branchId = req.headers["branchid"] as string | undefined;

      const products = await dashboardService.getLowStockProducts({
        branchId: branchId as string | undefined,
      });

      res.json({
        success: true,
        data: serializeBigInt(products),
        message: "Low stock products retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
