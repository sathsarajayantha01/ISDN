import orderRepository from "../repositories/order.repository";
import { Order, CreateOrderDto, UpdateOrderStatusDto } from "../types";
import prisma from "../../config/database";

class OrderService {
  async getAllOrders(): Promise<Order[]> {
    return await orderRepository.findAll();
  }

  async getOrderById(id: string | number): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async getOrdersByUserId(userId: string | number): Promise<Order[]> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      throw new Error("User not found");
    }

    return await orderRepository.findByUserId(userId);
  }

  async getOrdersByBranchId(branchId: string | number): Promise<Order[]> {
    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: BigInt(branchId) },
    });
    if (!branch) {
      throw new Error("Branch not found");
    }

    return await orderRepository.findByBranchId(branchId);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    const validStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Ready",
      "Dispatched",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      );
    }

    return await orderRepository.findByStatus(status);
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(orderData.userId) },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: BigInt(orderData.branchId) },
    });
    if (!branch) {
      throw new Error("Branch not found");
    }

    // Verify all products exist and are active
    for (const item of orderData.items) {
      const product = await prisma.product.findUnique({
        where: { id: BigInt(item.productId) },
      });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      if (!product.active) {
        throw new Error(`Product ${product.name} is not active`);
      }
      if (item.quantity <= 0) {
        throw new Error("Order quantity must be greater than 0");
      }
    }

    // Check if items array is empty
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    return await orderRepository.create(orderData);
  }

  async updateOrderStatus(
    id: string | number,
    statusData: UpdateOrderStatusDto,
  ): Promise<Order> {
    // Verify order exists
    const order = await this.getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate status
    const validStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Ready",
      "Dispatched",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(statusData.status)) {
      throw new Error(
        `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
      );
    }

    // Check if status transition is valid
    const currentStatus = order.status;
    if (currentStatus === "Cancelled") {
      throw new Error("Cannot update status of a cancelled order");
    }
    if (currentStatus === "Delivered") {
      throw new Error("Cannot update status of a delivered order");
    }

    const updatedOrder = await orderRepository.updateStatus(
      id,
      statusData.status,
    );
    if (!updatedOrder) {
      throw new Error("Failed to update order status");
    }

    return updatedOrder;
  }
}

export default new OrderService();
