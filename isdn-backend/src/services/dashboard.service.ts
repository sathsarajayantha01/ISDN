import dashboardRepository from "../repositories/dashboard.repository";

interface DashboardFilter {
  branchId?: string;
  fromDate?: string;
  toDate?: string;
}

class DashboardService {
  async getOrderStatistics(filter: DashboardFilter) {
    // Parse dates if provided
    const parsedFilter: any = {
      branchId: filter.branchId,
    };

    if (filter.fromDate) {
      parsedFilter.fromDate = new Date(filter.fromDate);
    }

    if (filter.toDate) {
      parsedFilter.toDate = new Date(filter.toDate);
    }

    // Get counts and averages
    const [stats, averages] = await Promise.all([
      dashboardRepository.getOrderStats(parsedFilter),
      dashboardRepository.getOrderAverages(parsedFilter),
    ]);

    return {
      pendingOrders: {
        totalCount: stats.pendingCount,
        Average: averages.pendingAverage,
      },
      activeDeliveries: {
        totalCount: stats.activeCount,
        Average: averages.activeAverage,
      },
      completedDeliveries: {
        totalCount: stats.completedCount,
        Average: averages.completedAverage,
      },
      cancelledDeliveries: {
        totalCount: stats.cancelledCount,
        Average: averages.cancelledAverage,
      },
      totalOrders: {
        totalCount: stats.totalCount,
        Average: averages.totalAverage,
      },
    };
  }

  async getRecentOrders(filter: DashboardFilter) {
    // Parse dates if provided
    const parsedFilter: any = {
      branchId: filter.branchId,
    };

    if (filter.fromDate) {
      parsedFilter.fromDate = new Date(filter.fromDate);
    }

    if (filter.toDate) {
      parsedFilter.toDate = new Date(filter.toDate);
    }

    const orders = await dashboardRepository.getRecentOrders(parsedFilter);
    return orders;
  }

  async getLowStockProducts(filter: DashboardFilter) {
    // Parse dates if provided
    const parsedFilter: any = {
      branchId: filter.branchId,
    };

    const products =
      await dashboardRepository.getLowStockProducts(parsedFilter);
    return products;
  }
}

export default new DashboardService();
