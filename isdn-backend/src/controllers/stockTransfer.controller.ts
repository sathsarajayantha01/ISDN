import { Request, Response, NextFunction } from "express";
import stockTransferService from "../services/stockTransfer.service";
import { serializeBigInt } from "../utils/serializer";

class StockTransferController {
  async createTransfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId, fromBranchId, toBranchId, quantity, notes } = req.body;

      if (!productId || !fromBranchId || !toBranchId || !quantity) {
        res.status(400).json({
          success: false,
          message:
            "Missing required fields: productId, fromBranchId, toBranchId, quantity",
        });
        return;
      }

      const transfer = await stockTransferService.createTransfer({
        productId,
        fromBranchId,
        toBranchId,
        quantity: parseInt(quantity, 10),
        notes,
      });

      res.status(201).json({
        success: true,
        data: serializeBigInt(transfer),
        message: "Stock transfer request created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTransfers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const transfers = await stockTransferService.getAllTransfers();

      res.json({
        success: true,
        data: serializeBigInt(transfers),
        message: "Stock transfers retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransferById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const transfer = await stockTransferService.getTransferById(id as string);

      res.json({
        success: true,
        data: serializeBigInt(transfer),
        message: "Stock transfer retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async approveTransfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const transfer = await stockTransferService.approveTransfer(id as string);

      res.json({
        success: true,
        data: serializeBigInt(transfer),
        message: "Stock transfer approved and completed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectTransfer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const transfer = await stockTransferService.rejectTransfer(id as string);

      res.json({
        success: true,
        data: serializeBigInt(transfer),
        message: "Stock transfer rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StockTransferController();
