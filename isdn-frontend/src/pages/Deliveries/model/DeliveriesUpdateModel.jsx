import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";

export function DeliveriesUpdateModel({ isOpen, onClose, order, onUpdate }) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (order) {
      const validStatuses = ["Delivered", "Cancelled"];
      const currentStatus = order.status || "";
      // Only set status if it's one of the valid options, otherwise reset to empty
      setStatus(validStatuses.includes(currentStatus) ? currentStatus : "");
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onUpdate(order.id, {
        status,
      });

      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Order #${order.orderNumber}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Package className="h-4 w-4 inline mr-1" />
            Order Status
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Order Summary
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Order #:</span>
              <span className="font-medium text-slate-900">
                {order.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Amount:</span>
              <span className="font-medium text-slate-900">
                ${parseFloat(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Current Status:</span>
              <span className="font-medium text-slate-900">{order.status}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
