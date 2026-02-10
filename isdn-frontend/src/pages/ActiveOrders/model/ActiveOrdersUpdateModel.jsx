import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { useState, useEffect } from "react";
import { Calendar, Package } from "lucide-react";

export function ActiveOrdersUpdateModel({ isOpen, onClose, order, onUpdate }) {
  const [status, setStatus] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Processing", label: "Processing" },
    { value: "Ready", label: "Ready" },
    { value: "Dispatched", label: "Dispatched" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (order) {
      setStatus(order.status || "");

      // Format existing delivery date if it exists
      if (order.deliveryDate && Object.keys(order.deliveryDate).length > 0) {
        try {
          const date = new Date(order.deliveryDate);
          const formattedDate = date.toISOString().slice(0, 16);
          setDeliveryDate(formattedDate);
        } catch {
          setDeliveryDate("");
        }
      } else {
        setDeliveryDate("");
      }
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format delivery date to ISO string if provided
      let formattedDeliveryDate = null;
      if (deliveryDate) {
        formattedDeliveryDate = new Date(deliveryDate).toISOString();
      }

      await onUpdate(order.id, {
        status,
        deliveryDate: formattedDeliveryDate,
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
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          />
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Delivery Date & Time
          </label>
          <Input
            type="datetime-local"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Select the expected delivery date and time
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-1">
            Order Summary
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Branch:</span>
              <span className="font-medium text-slate-900">
                {order.branch?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Amount:</span>
              <span className="font-medium text-slate-900">
                ${parseFloat(order.totalAmount || 0).toFixed(2)}
              </span>
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
            {isSubmitting ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
