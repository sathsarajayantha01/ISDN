import React, { useState, useEffect } from "react";
import { StatsCard } from "../../components/data/StatsCard";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import {
  ArrowRight,
  AlertTriangle,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";

export function Dashboard() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statistics, setStatistics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  // Get date range based on filter
  const getDateRange = (filter) => {
    const now = new Date();
    let fromDate = new Date();

    switch (filter) {
      case "today":
        fromDate.setHours(0, 0, 0, 0);
        break;
      case "lastWeek":
        fromDate.setDate(now.getDate() - 7);
        break;
      case "lastMonth":
        fromDate.setMonth(now.getMonth() - 1);
        break;
      default:
        fromDate.setHours(0, 0, 0, 0);
    }

    return {
      fromDate: fromDate.toISOString(),
      toDate: now.toISOString(),
    };
  };

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiAdapter.get("/branches");
        if (response.success) {
          setBranches(response.data);

          // Set default branch to user's branch
          const userBranchId = localStorage.getItem("branchId");
          if (userBranchId) {
            setSelectedBranch(userBranchId);
          } else {
            // Default to "all" if no user branch
            setSelectedBranch("all");
          }
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch statistics when branch or date filter changes
  useEffect(() => {
    if (!selectedBranch) return;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const { fromDate, toDate } = getDateRange(dateFilter);

        // Build query string
        const params = new URLSearchParams({
          fromDate,
          toDate,
        });

        // Only include branchId header if a specific branch is selected (not "all")
        const headers =
          selectedBranch !== "all" ? { branchId: selectedBranch } : {};

        const response = await apiAdapter.get(
          `/dashboard/order-statistics?${params.toString()}`,
          headers,
        );

        if (response.success) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedBranch, dateFilter]);

  // Fetch recent orders when branch or date filter changes
  useEffect(() => {
    if (!selectedBranch) return;

    const fetchRecentOrders = async () => {
      try {
        setOrdersLoading(true);
        const { fromDate, toDate } = getDateRange(dateFilter);

        // Build query string
        const params = new URLSearchParams({
          fromDate,
          toDate,
        });

        // Only include branchId header if a specific branch is selected (not "all")
        const headers =
          selectedBranch !== "all" ? { branchId: selectedBranch } : {};

        const response = await apiAdapter.get(
          `/dashboard/recent-orders?${params.toString()}`,
          headers,
        );

        if (response.success) {
          setRecentOrders(response.data);
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [selectedBranch, dateFilter]);

  // Fetch low stock products when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const fetchLowStockProducts = async () => {
      try {
        setLowStockLoading(true);

        // Only include branchId header if a specific branch is selected (not "all")
        const headers =
          selectedBranch !== "all" ? { branchId: selectedBranch } : {};

        const response = await apiAdapter.get(
          `/dashboard/low-stock-products`,
          headers,
        );

        if (response.success) {
          setLowStockProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      } finally {
        setLowStockLoading(false);
      }
    };

    fetchLowStockProducts();
  }, [selectedBranch]);

  // Map statistics to stats cards
  const stats = statistics
    ? [
        {
          label: "Total Orders",
          value: statistics.totalOrders?.totalCount || 0,
          icon: ShoppingCart,
          color: "blue",
          trend: {
            value: statistics.totalOrders?.Average?.toFixed(1) || 0,
            isPositive: (statistics.totalOrders?.Average || 0) > 0,
          },
        },
        {
          label: "Pending Orders",
          value: statistics.pendingOrders?.totalCount || 0,
          icon: Package,
          color: "amber",
          trend: {
            value: statistics.pendingOrders?.Average?.toFixed(1) || 0,
            isPositive: (statistics.pendingOrders?.Average || 0) > 0,
          },
        },
        {
          label: "Active Deliveries",
          value: statistics.activeDeliveries?.totalCount || 0,
          icon: Truck,
          color: "purple",
          trend: {
            value: statistics.activeDeliveries?.Average?.toFixed(1) || 0,
            isPositive: (statistics.activeDeliveries?.Average || 0) > 0,
          },
        },
        {
          label: "Completed",
          value: statistics.completedDeliveries?.totalCount || 0,
          icon: CheckCircle,
          color: "green",
          trend: {
            value: statistics.completedDeliveries?.Average?.toFixed(1) || 0,
            isPositive: true,
          },
        },
        {
          label: "Cancelled",
          value: statistics.cancelledDeliveries?.totalCount || 0,
          icon: XCircle,
          color: "red",
          trend: {
            value: statistics.cancelledDeliveries?.Average?.toFixed(1) || 0,
            isPositive: false,
          },
        },
      ]
    : [];

  const orderColumns = [
    {
      key: "orderNumber",
      header: "Order #",
    },
    {
      key: "user",
      header: "Customer",
      hideOnMobile: true,
      render: (val) => val?.name || "N/A",
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (val) => <Badge status={val?.toLowerCase()} />,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Welcome back, here's what's happening today.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="min-w-[200px]">
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[150px]">
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading statistics...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
          {stats.map((stat, idx) => (
            <StatsCard key={idx} metric={stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Recent Orders
            </h2>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center h-32 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">Loading orders...</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={recentOrders.slice(0, 5)}
              columns={orderColumns}
              keyField="id"
            />
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Low Stock Alerts
            </h2>
          </div>
          {lowStockLoading ? (
            <div className="flex items-center justify-center h-32 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">
                  Loading products...
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {lowStockProducts.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
                  >
                    <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                        {item.product?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Code: {item.product?.productCode || "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-red-600">
                        {item.quantity} left
                      </p>
                      <p className="text-xs text-slate-400 hidden sm:block">
                        Reorder now
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">
                    No low stock alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
