import prisma from "../../config/database";

interface OrderStatsFilter {
  branchId?: string;
  fromDate?: Date;
  toDate?: Date;
}

class DashboardRepository {
  async getOrderStats(filter: OrderStatsFilter) {
    const whereClause: any = {};

    // Add branch filter if provided
    if (filter.branchId) {
      whereClause.branchId = BigInt(filter.branchId);
    }

    // Add date range filter if provided
    if (filter.fromDate || filter.toDate) {
      whereClause.orderDate = {};
      if (filter.fromDate) {
        whereClause.orderDate.gte = filter.fromDate;
      }
      if (filter.toDate) {
        // Include the entire day for toDate
        const toDateEnd = new Date(filter.toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        whereClause.orderDate.lte = toDateEnd;
      }
    }

    // Get counts for different statuses
    const [
      pendingCount,
      activeCount,
      completedCount,
      cancelledCount,
      totalCount,
    ] = await Promise.all([
      // Pending orders
      prisma.order.count({
        where: {
          ...whereClause,
          status: "Pending",
        },
      }),
      // Active deliveries (dispatched, confirmed, processing, ready)
      prisma.order.count({
        where: {
          ...whereClause,
          status: {
            in: ["Dispatched", "Confirmed", "Processing", "Ready"],
          },
        },
      }),
      // Completed deliveries
      prisma.order.count({
        where: {
          ...whereClause,
          status: "Delivered",
        },
      }),
      // Cancelled deliveries
      prisma.order.count({
        where: {
          ...whereClause,
          status: "Cancelled",
        },
      }),
      // Total orders (all statuses)
      prisma.order.count({
        where: whereClause,
      }),
    ]);

    return {
      pendingCount,
      activeCount,
      completedCount,
      cancelledCount,
      totalCount,
    };
  }

  async getOrderAverages(filter: OrderStatsFilter) {
    const whereClause: any = {};

    // Add branch filter if provided
    if (filter.branchId) {
      whereClause.branchId = BigInt(filter.branchId);
    }

    // Add date range filter if provided
    if (filter.fromDate || filter.toDate) {
      whereClause.orderDate = {};
      if (filter.fromDate) {
        whereClause.orderDate.gte = filter.fromDate;
      }
      if (filter.toDate) {
        const toDateEnd = new Date(filter.toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        whereClause.orderDate.lte = toDateEnd;
      }
    }

    // Calculate averages by grouping orders by date
    const ordersByDate = await prisma.order.groupBy({
      by: ["orderDate", "status"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Group by date only (remove time component)
    const dateGroups: Map<
      string,
      {
        pending: number;
        active: number;
        completed: number;
        cancelled: number;
        total: number;
      }
    > = new Map();

    ordersByDate.forEach((group) => {
      const dateKey = group.orderDate.toISOString().split("T")[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          pending: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
          total: 0,
        });
      }

      const dateData = dateGroups.get(dateKey)!;
      const count = group._count.id;

      // Categorize by status
      if (group.status === "Pending") {
        dateData.pending += count;
      } else if (
        ["Dispatched", "Confirmed", "Processing", "Ready"].includes(
          group.status,
        )
      ) {
        dateData.active += count;
      } else if (group.status === "Delivered") {
        dateData.completed += count;
      } else if (group.status === "Cancelled") {
        dateData.cancelled += count;
      }
      dateData.total += count;
    });

    // Calculate averages
    const daysCount = dateGroups.size || 1; // Avoid division by zero

    const totals = {
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    };

    dateGroups.forEach((data) => {
      totals.pending += data.pending;
      totals.active += data.active;
      totals.completed += data.completed;
      totals.cancelled += data.cancelled;
      totals.total += data.total;
    });

    return {
      pendingAverage: Math.round((totals.pending / daysCount) * 100) / 100,
      activeAverage: Math.round((totals.active / daysCount) * 100) / 100,
      completedAverage: Math.round((totals.completed / daysCount) * 100) / 100,
      cancelledAverage: Math.round((totals.cancelled / daysCount) * 100) / 100,
      totalAverage: Math.round((totals.total / daysCount) * 100) / 100,
    };
  }

  async getRecentOrders(filter: OrderStatsFilter & { userId?: string }) {
    const whereClause: any = {};

    // Add user filter if provided
    if (filter.userId) {
      whereClause.userId = BigInt(filter.userId);
    }

    // Add branch filter if provided
    if (filter.branchId) {
      whereClause.branchId = BigInt(filter.branchId);
    }

    // Add date range filter if provided
    if (filter.fromDate || filter.toDate) {
      whereClause.createdAt = {};
      if (filter.fromDate) {
        whereClause.createdAt.gte = filter.fromDate;
      }
      if (filter.toDate) {
        // Include the entire day for toDate
        const toDateEnd = new Date(filter.toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = toDateEnd;
      }
    }

    // Get last 10 orders ordered by created date
    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNumber: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return orders;
  }

  async getLowStockProducts(filter: OrderStatsFilter) {
    const whereClause: any = {
      active: true,
      quantity: {
        lt: 5,
      },
    };

    // Add branch filter if provided
    if (filter.branchId) {
      whereClause.branchId = BigInt(filter.branchId);
    }

    // Get low stock products with inventory details
    const lowStockInventories = await prisma.inventory.findMany({
      where: whereClause,
      select: {
        quantity: true,
        product: {
          select: {
            productCode: true,
            name: true,
          },
        },
      },
      orderBy: {
        quantity: "asc",
      },
    });

    return lowStockInventories;
  }
}

export default new DashboardRepository();
