import prisma from "../../config/database";
import { Order, CreateOrderDto } from "../types";

class OrderRepository {
  async findAll(): Promise<Order[]> {
    return await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            customerCode: true,
            customerType: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            region: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string | number): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            customerCode: true,
            customerType: true,
            contactNumber: true,
            address: true,
            district: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            region: true,
            address: true,
            contactNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
                categoryId: true,
              },
            },
          },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string | number): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { userId: BigInt(userId) },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByBranchId(branchId: string | number): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { branchId: BigInt(branchId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            customerCode: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByStatus(status: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(orderData: CreateOrderDto): Promise<Order> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate total amount
    let totalAmount = 0;
    for (const item of orderData.items) {
      const product = await prisma.product.findUnique({
        where: { id: BigInt(item.productId) },
      });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      totalAmount += Number(product.unitPrice) * item.quantity;
    }

    // Create order with order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: BigInt(orderData.userId),
          branchId: BigInt(orderData.branchId),
          status: "Pending",
          totalAmount,
          address: orderData.address,
          contactNumber: orderData.contactNumber,
          specialNotes: orderData.specialNotes,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              businessName: true,
              customerCode: true,
              customerType: true,
              contactNumber: true,
              address: true,
              district: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              region: true,
              address: true,
              contactNumber: true,
            },
          },
          items: true,
        },
      });

      // Create order items
      for (const item of orderData.items) {
        const product = await tx.product.findUnique({
          where: { id: BigInt(item.productId) },
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const subtotal = Number(product.unitPrice) * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: BigInt(item.productId),
            quantity: item.quantity,
            unitPrice: product.unitPrice,
            subtotal,
          },
        });
      }

      return newOrder;
    });

    // Re-fetch order with all relations
    return (await this.findById(Number(order.id)))!;
  }

  async updateStatus(
    id: string | number,
    deliveryDate: Date,
    status: string,
  ): Promise<Order | null> {
    const order = await prisma.order.update({
      where: { id: BigInt(id) },
      data: { status, deliveryDate },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            customerCode: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  async assignDriver(
    id: string | number,
    driverId: bigint,
  ): Promise<Order | null> {
    const order = await prisma.order.update({
      where: { id: BigInt(id) },
      data: { driverId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            customerCode: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNumber: true,
            licenseNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
                unitType: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  async updateLocation(
    id: string | number,
    latitude: number,
    longitude: number,
  ): Promise<Order | null> {
    const order = await prisma.order.update({
      where: { id: BigInt(id) },
      data: {
        currentLocation: {
          latitude,
          longitude,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                productCode: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return order;
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `ORD${year}${month}${day}`;

    // Find the latest order for today
    const latestOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: datePrefix,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    });

    let sequence = 1;
    if (latestOrder) {
      const lastSequence = parseInt(latestOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${datePrefix}${String(sequence).padStart(4, "0")}`;
  }
}

export default new OrderRepository();
