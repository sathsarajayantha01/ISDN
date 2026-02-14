import { useState, useEffect } from "react";
import { Search, AlertCircle, XCircle } from "lucide-react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { apiAdapter } from "../../services/apiAdapter";
import { AlertModal } from "../../components/feedback/AlertModal";

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiAdapter.get("/orders/my-orders");

      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      return;
    }

    setCancellingId(order.id);
    try {
      const response = await apiAdapter.put(`/orders/${order.id}/cancel`);

      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, status: "Cancelled" } : o,
          ),
        );
        setAlertModal({
          isOpen: true,
          message: `Order ${order.orderNumber} has been cancelled`,
          isSuccess: true,
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to cancel order",
          isSuccess: false,
        });
      }
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: "An error occurred while cancelling the order",
        isSuccess: false,
      });
      console.error("Error cancelling order:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const getItemsCount = (order) => {
    return (
      order.items?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0
    );
  };

  const formatDate = (dateObj) => {
    if (!dateObj || Object.keys(dateObj).length === 0) return "N/A";
    try {
      return new Date(dateObj).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items &&
        order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        ));
    const matchesStatus =
      filterStatus === "all" ||
      order.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
    },
    {
      key: "items",
      header: "Items",
      sortable: false,
      hideOnMobile: true,
      render: (_val, row) => `${getItemsCount(row)} item(s)`,
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (val) => <Badge status={val || "unknown"} />,
    },
    {
      key: "orderDate",
      header: "Order Date",
      sortable: true,
      hideOnMobile: true,
      render: (val) => formatDate(val),
    },
    {
      key: "deliveryDate",
      header: "Delivery Date",
      sortable: true,
      hideOnMobile: true,
      hideOnTablet: true,
      render: (val) => formatDate(val),
    },
    {
      key: "actions",
      header: "",
      render: (_val, row) =>
        row.status === "Pending" ? (
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelOrder(row);
            }}
            isLoading={cancellingId === row.id}
            leftIcon={<XCircle className="h-3 w-3" />}
          >
            Cancel
          </Button>
        ) : null,
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Orders
          </h1>
          <p className="text-slate-600 mt-1">
            {filteredOrders.length} order(s) found
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Search by order # or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Ready">Ready</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card noPadding>
        <DataTable
          data={filteredOrders}
          columns={columns}
          keyField="id"
        />
      </Card>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() =>
          setAlertModal({ isOpen: false, message: "", isSuccess: false })
        }
        message={alertModal.message}
        isSuccess={alertModal.isSuccess}
      />
    </div>
  );
}
