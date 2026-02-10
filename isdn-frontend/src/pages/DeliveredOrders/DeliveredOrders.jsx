import React, { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import {
  Search,
  Download,
  Filter,
  AlertCircle,
  Eye,
  MapPin,
} from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { useToast } from "../../hooks/useToast";
import { ActiveOrdersDetailsModel } from "./model/ActiveOrdersDetailsModel";
import { LocationViewModal } from "../../components/feedback/LocationViewModal";

export function DeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info and branch ID from localStorage
      const userStr = localStorage.getItem("user");
      const storedUser = userStr ? JSON.parse(userStr) : null;
      const branchId = storedUser?.branch?.id;

      // Define delivered order statuses
      const statuses = ["Delivered", "Cancelled"];
      const statusQuery = statuses.join(",");

      // Build query params
      const params = new URLSearchParams();
      params.append("status", statusQuery);
      if (branchId) {
        params.append("branchId", branchId);
      }

      // get orders with delivered/cancelled statuses for selected branch
      const response = await apiAdapter.get(
        `/orders/status?${params.toString()}`,
      );

      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.message || "Failed to fetch orders");
        addToast("error", "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      addToast("error", "An error occurred while fetching orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleViewLocation = (order) => {
    setSelectedOrder(order);
    setIsLocationModalOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items &&
        order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        ));
    const matchesStatus =
      filterStatus === "all" ||
      order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getItemsCount = (order) => {
    return (
      order.items?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0
    );
  };

  const formatDate = (dateObj) => {
    if (!dateObj || Object.keys(dateObj).length === 0) return "N/A";
    try {
      const date = new Date(dateObj);
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
    },
    {
      key: "items",
      header: "Items",
      sortable: true,
      hideOnMobile: true,
      render: (val, row) => `${getItemsCount(row)} item(s)`,
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (val) =>
        `$${parseFloat(val || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },
    {
      key: "deliveryDate",
      header: "Delivery",
      sortable: true,
      hideOnMobile: true,
      render: (val) => formatDate(val),
    },
    {
      key: "driverId",
      header: "Driver",
      sortable: true,
      hideOnMobile: true,
      render: (val) =>
        val ? (
          <Badge status="assigned">Driver #{val}</Badge>
        ) : (
          <Badge status="pending">Not Assigned</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (val) => <Badge status={val.toLowerCase()} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (val, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
          </button>
          <button
            onClick={() => handleViewLocation(row)}
            className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors group"
            title="View Location"
          >
            <MapPin className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error Loading Orders</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button onClick={fetchOrders} className="mt-4" size="sm">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            My Orders
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            View and track your order history.
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Download className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by order number or product..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className={`${showFilters ? "block" : "hidden"} sm:block`}>
          <Select
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "delivered", label: "Delivered" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      <DataTable data={filteredOrders} columns={columns} keyField="id" />

      {/* Order Details Modal */}
      <ActiveOrdersDetailsModel
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
      />

      {/* Location View Modal */}
      <LocationViewModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
