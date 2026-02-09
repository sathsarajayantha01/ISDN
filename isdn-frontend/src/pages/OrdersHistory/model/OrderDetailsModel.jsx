import { X, Package, Calendar, MapPin, Phone, FileText } from "lucide-react";
import { Modal } from "../../../components/feedback/Modal";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";

export function OrderDetailsModel({ isOpen, onClose, order }) {
  if (!order) return null;

  const formatDate = (dateObj) => {
    if (!dateObj || Object.keys(dateObj).length === 0) return "N/A";
    try {
      const date = new Date(dateObj);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${order.orderNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Delivery Information */}
        {(order.address || order.contactNumber) && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              Delivery Information
            </h3>
            <Card className="bg-slate-50">
              <div className="space-y-3">
                {order.address && (
                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      Address
                    </p>
                    <p className="text-sm text-slate-900 mt-1">
                      {order.address}
                    </p>
                  </div>
                )}
                {order.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <p className="text-sm text-slate-900">
                      {order.contactNumber}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Special Notes */}
        {order.specialNotes && order.specialNotes !== "None" && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Special Notes</h3>
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">{order.specialNotes}</p>
            </Card>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <Card key={item.id || index} className="bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Code: {item.product?.productCode || "N/A"} • Unit:{" "}
                      {item.product?.unitType || "pcs"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-slate-900">
                      ${parseFloat(item.subtotal || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.quantity} × $
                      {parseFloat(item.unitPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-700">
                Total Items (
                {order.items?.reduce(
                  (sum, item) => sum + parseInt(item.quantity),
                  0,
                ) || 0}
                )
              </span>
              <span className="font-medium text-slate-900">
                {order.items?.length || 0} product(s)
              </span>
            </div>
            <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${parseFloat(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
