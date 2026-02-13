import { useState, useEffect, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/data/DataTable";
import { apiAdapter } from "../../services/apiAdapter";
import { useToast } from "../../context/ToastContext";

export function TransferList() {
  const { addToast } = useToast();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiAdapter.get("/stock-transfers");
      if (response.success) {
        setTransfers(response.data || []);
      } else {
        addToast(response.message || "Failed to fetch transfers", "error");
      }
    } catch (error) {
      addToast("An error occurred while fetching transfers", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleApprove = async (transfer) => {
    if (approvingId) return;
    setApprovingId(transfer.id);
    try {
      const response = await apiAdapter.put(
        `/stock-transfers/approve/${transfer.id}`,
        {},
      );
      if (response.success) {
        addToast("Transfer approved and completed successfully!", "success");
        fetchTransfers();
      } else {
        addToast(response.message || "Failed to approve transfer", "error");
      }
    } catch (error) {
      addToast("An error occurred while approving the transfer", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (transfer) => {
    if (approvingId) return;
    setApprovingId(transfer.id);
    try {
      const response = await apiAdapter.put(
        `/stock-transfers/reject/${transfer.id}`,
        {},
      );
      if (response.success) {
        addToast("Transfer rejected successfully!", "success");
        fetchTransfers();
      } else {
        addToast(response.message || "Failed to reject transfer", "error");
      }
    } catch (error) {
      addToast("An error occurred while rejecting the transfer", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
    },
    {
      key: "product",
      header: "Product",
      sortable: false,
      render: (value) =>
        value ? `${value.name} (${value.productCode})` : "N/A",
    },
    {
      key: "fromBranch",
      header: "From Branch",
      sortable: false,
      hideOnMobile: true,
      render: (value) => (value ? value.name : "N/A"),
    },
    {
      key: "toBranch",
      header: "To Branch",
      sortable: false,
      hideOnMobile: true,
      render: (value) => (value ? value.name : "N/A"),
    },
    {
      key: "quantity",
      header: "Qty",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: "transferDate",
      header: "Transfer Date",
      sortable: true,
      hideOnMobile: true,
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (_, row) => {
        if (row.status !== "Pending") return null;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleApprove(row)}
              isLoading={approvingId === row.id}
              disabled={!!approvingId}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleReject(row)}
              isLoading={approvingId === row.id}
              disabled={!!approvingId}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Stock Transfers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage all stock transfer requests.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchTransfers}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            data={transfers}
            columns={columns}
            keyField="id"
          />
        )}
      </Card>
    </div>
  );
}
