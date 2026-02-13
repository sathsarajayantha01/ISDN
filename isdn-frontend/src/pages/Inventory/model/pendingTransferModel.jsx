import React from "react";
import { Button } from "../../../components/ui/Button";
import { Check, X } from "lucide-react";

export function PendingTransferModel({
  isOpen,
  onClose,
  selectedProduct,
  selectedProductTransfers,
  onAcceptTransfer,
  onRejectTransfer,
}) {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Pending Transfers - {selectedProduct.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {selectedProductTransfers.length === 0 ? (
            <p className="text-center text-slate-500 py-4">
              No pending transfers found
            </p>
          ) : (
            selectedProductTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      From Branch:
                    </span>
                    <span className="text-sm text-slate-900 font-semibold">
                      {transfer.fromBranch?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      Quantity:
                    </span>
                    <span className="text-sm text-slate-900 font-semibold">
                      {transfer.quantity} {selectedProduct.unitType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">
                      Status:
                    </span>
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <Button
                    onClick={() => {
                      onAcceptTransfer(transfer);
                      onClose();
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      onRejectTransfer(transfer);
                      onClose();
                    }}
                    className="flex-1 bg-red-400 hover:bg-red-500 text-white"
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
