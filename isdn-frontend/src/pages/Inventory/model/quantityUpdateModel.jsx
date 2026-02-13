import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export function QuantityUpdateModel({
  isOpen,
  onClose,
  selectedProduct,
  updateQuantity,
  setUpdateQuantity,
  onUpdate,
}) {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Update Quantity - {selectedProduct.name}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Quantity:{" "}
              {selectedProduct.inventories[0]?.quantity || "0"}
            </label>
            <Input
              type="number"
              placeholder="Enter new quantity"
              value={updateQuantity}
              onChange={(e) => setUpdateQuantity(e.target.value)}
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
