import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { UserPlus, Loader } from "lucide-react";
import { apiAdapter } from "../../../services/apiAdapter";

export function ActiveOrdersAssignDriverModel({
  isOpen,
  onClose,
  order,
  onAssign,
}) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      // Pre-select current driver if assigned
      if (order?.driverId) {
        setSelectedDriverId(order.driverId.toString());
      }
    }
  }, [isOpen, order]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiAdapter.get("/users/role?roleName=Driver");

      if (response.success) {
        setDrivers(response.data || []);
      } else {
        setError(response.message || "Failed to fetch drivers");
      }
    } catch (err) {
      setError("An error occurred while fetching drivers");
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDriverId) {
      setError("Please select a driver");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await onAssign(order.id, selectedDriverId);
      onClose();
      setSelectedDriverId("");
    } catch (err) {
      setError("An error occurred while assigning the driver");
      console.error("Error assigning driver:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDriverId("");
    setError(null);
    onClose();
  };

  const driverOptions = [
    { value: "", label: "Select a driver" },
    ...drivers.map((driver) => ({
      value: driver.id.toString(),
      label: `${driver.name} (${driver.email})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Driver to Order"
      icon={<UserPlus className="h-5 w-5" />}
    >
      <div className="space-y-4">
        {/* Order Info */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Order Details
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Order Number:</span>
              <span className="font-medium text-slate-900">
                {order?.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Branch:</span>
              <span className="font-medium text-slate-900">
                {order?.branch?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Amount:</span>
              <span className="font-medium text-slate-900">
                $
                {parseFloat(order?.totalAmount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Current Driver Info */}
        {order?.driver && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-green-700 mb-2">
              Currently Assigned Driver
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">Name:</span>
                <span className="font-medium text-green-900">
                  {order.driver.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Email:</span>
                <span className="font-medium text-green-900">
                  {order.driver.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Contact:</span>
                <span className="font-medium text-green-900">
                  {order.driver.contactNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Driver Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {order?.driver ? "Change Driver" : "Select Driver"}
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading drivers...</span>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No drivers available
            </div>
          ) : (
            <Select
              options={driverOptions}
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              disabled={submitting}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading || submitting || !selectedDriverId}
            leftIcon={
              submitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )
            }
          >
            {submitting
              ? "Assigning..."
              : order?.driver
                ? "Update Driver"
                : "Assign Driver"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
