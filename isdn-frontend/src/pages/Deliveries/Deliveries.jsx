import React, { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { Search, Filter, AlertCircle, Eye, Edit } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { useToast } from "../../hooks/useToast";
import { DeliveriesDetailsModel } from "./model/DeliveriesDetailsModel";
import { DeliveriesUpdateModel } from "./model/DeliveriesUpdateModel";

export function Deliveries() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { addToast } = useToast();

  // Check if user is a Driver
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole === "Driver") {
      fetchOrders();
    }
  }, [userRole]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user info from localStorage
      const userStr = localStorage.getItem("user");
      const storedUser = userStr ? JSON.parse(userStr) : null;
      const userId = storedUser?.id;

      if (!userId) {
        setError("User information not found");
        addToast("error", "User information not found");
        return;
      }

      // Get orders for the logged-in driver
      const response = await apiAdapter.get(
        `/orders/driver?driverId=${userId}`,
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

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateOrder = async (orderId, updateData) => {
    try {
      const response = await apiAdapter.put(
        `/orders/status/${orderId}`,
        updateData,
      );

      if (response.success) {
        addToast("success", "Order status updated successfully");
        await fetchOrders(); // Refresh the orders list
      } else {
        addToast("error", response.message || "Failed to update order");
      }
    } catch (err) {
      addToast("error", "An error occurred while updating the order");
      console.error("Error updating order:", err);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
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

  // Role-based access control
  if (userRole !== "Driver") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Access Denied</p>
            <p className="text-sm text-amber-800">
              This page is only accessible to drivers.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => handleUpdateStatus(row)}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors group"
            title="Edit Status"
          >
            <Edit className="h-4 w-4 text-amber-600 group-hover:text-amber-700" />
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
            <p className="mt-4 text-slate-600">Loading deliveries...</p>
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
              <h3 className="font-semibold">Error Loading Deliveries</h3>
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
            My Deliveries
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            View and manage your assigned delivery orders
          </p>
        </div>
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
              { value: "confirmed", label: "Confirmed" },
              { value: "processing", label: "Processing" },
              { value: "ready", label: "Ready" },
              { value: "dispatched", label: "Dispatched" },
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
        Showing {filteredOrders.length} of {orders.length} deliveries
      </p>

      <DataTable data={filteredOrders} columns={columns} keyField="id" />

      {/* Delivery Details Modal */}
      <DeliveriesDetailsModel
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
      />

      {/* Delivery Status Update Modal */}
      <DeliveriesUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        order={selectedOrder}
        onUpdate={handleUpdateOrder}
      />
    </div>
  );
}
