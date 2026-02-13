import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export function TransferProductModel({
  isOpen,
  onClose,
  selectedProduct,
  branches,
  currentUser,
  transferBranchId,
  setTransferBranchId,
  transferQuantity,
  setTransferQuantity,
  onTransfer,
}) {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Transfer Product - {selectedProduct.name}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Available Quantity:{" "}
              {selectedProduct.inventories[0]?.quantity || "0"}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Transfer To Branch
            </label>
            <select
              value={transferBranchId}
              onChange={(e) => setTransferBranchId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Select a branch</option>
              {branches
                .filter((b) => b.id !== currentUser?.branchId)
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity to Transfer
            </label>
            <Input
              type="number"
              placeholder="Enter quantity"
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(e.target.value)}
              min="0"
              max={selectedProduct.inventories[0]?.quantity || "0"}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onTransfer}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Transfer
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
