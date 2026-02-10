import { Request, Response, NextFunction } from "express";
import orderService from "../services/order.service";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  AssignDriverDto,
  UpdateLocationDto,
} from "../types";
import { serializeBigInt } from "../utils/serializer";

class OrderController {
  async getAllOrders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, branchId, status } = req.query;

      let orders;

      if (userId) {
        orders = await orderService.getOrdersByUserId(userId as string);
      } else if (branchId) {
        orders = await orderService.getOrdersByBranchId(branchId as string);
      } else if (status) {
        orders = await orderService.getOrdersByStatus(status as string);
      } else {
        orders = await orderService.getAllOrders();
      }

      res.json({
        success: true,
        data: serializeBigInt(orders),
        message: "Orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id as string);
      res.json({
        success: true,
        data: serializeBigInt(order),
        message: "Order retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderByOrderNumber(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByOrderNumber(
        orderNumber as string,
      );
      res.json({
        success: true,
        data: serializeBigInt(order),
        message: "Order retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const orders = await orderService.getOrdersByUserId(userId as string);
      res.json({
        success: true,
        data: serializeBigInt(orders),
        message: "Orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByDriverId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { driverId } = req.query;

      if (!driverId) {
        res.status(400).json({
          success: false,
          message: "Driver ID is required",
        });
        return;
      }

      const orders = await orderService.getOrdersByDriverId(driverId as string);
      res.json({
        success: true,
        data: serializeBigInt(orders),
        message: "Orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByStatusList(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { status } = req.query;
      if (!status) {
        res.status(400).json({
          success: false,
          message: "Status query parameter is required",
        });
        return;
      }
      const statusList = (status as string).split(",").map((s) => s.trim());
      const orders = await orderService.getOrdersByStatusList(statusList);
      res.json({
        success: true,
        data: serializeBigInt(orders),
        message: "Orders retrieved successfully",
      });
    } catch (error) {
      next(error);

      return;
    }
  }

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const orderData: CreateOrderDto = req.body;

      // Validate required fields
      const requiredFields = ["userId", "branchId", "items"];
      const missingFields = requiredFields.filter(
        (field) => !orderData[field as keyof CreateOrderDto],
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
        return;
      }

      // Validate items structure
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        res.status(400).json({
          success: false,
          message: "Order must have at least one item",
        });
        return;
      }

      // Convert string IDs to bigint
      orderData.userId = BigInt(orderData.userId);
      orderData.branchId = BigInt(orderData.branchId);
      orderData.items = orderData.items.map((item) => ({
        productId: BigInt(item.productId),
        quantity: Number(item.quantity),
      }));

      const order = await orderService.createOrder(orderData);
      res.status(201).json({
        success: true,
        data: serializeBigInt(order),
        message: "Order created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const statusData: UpdateOrderStatusDto = req.body;

      // Validate required fields
      if (!statusData.status) {
        res.status(400).json({
          success: false,
          message: "Status is required",
        });
        return;
      }

      const order = await orderService.updateOrderStatus(
        id as string,
        statusData,
      );
      res.json({
        success: true,
        data: serializeBigInt(order),
        message: "Order status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDriver(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const driverData: AssignDriverDto = req.body;

      // Validate required fields
      if (!driverData.driverId) {
        res.status(400).json({
          success: false,
          message: "Driver ID is required",
        });
        return;
      }

      // Convert string ID to bigint
      driverData.driverId = BigInt(driverData.driverId);

      const order = await orderService.assignDriver(
        id as string,
        driverData.driverId,
      );
      res.json({
        success: true,
        data: serializeBigInt(order),
        message: "Driver assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const locationData: UpdateLocationDto = req.body;

      // Validate required fields
      if (
        locationData.latitude === undefined ||
        locationData.longitude === undefined
      ) {
        res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
        return;
      }

      // Validate data types
      if (
        typeof locationData.latitude !== "number" ||
        typeof locationData.longitude !== "number"
      ) {
        res.status(400).json({
          success: false,
          message: "Latitude and longitude must be numbers",
        });
        return;
      }

      const order = await orderService.updateLocation(
        id as string,
        locationData,
      );
      res.json({
        success: true,
        data: serializeBigInt(order),
        message: "Order location updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
