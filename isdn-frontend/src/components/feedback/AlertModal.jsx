import { CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "../ui/Button";

export function AlertModal({ isOpen, onClose, message, isSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div
              className={`rounded-full p-3 ${
                isSuccess
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="h-12 w-12" />
              ) : (
                <XCircle className="h-12 w-12" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-slate-900">
              {isSuccess ? "Success" : "Error"}
            </h3>

            {/* Message */}
            <p className="text-slate-600">{message}</p>

            {/* Button */}
            <Button
              onClick={onClose}
              //   variant={isSuccess ? "success" : "danger"}
              className={`w-full mt-4 ${isSuccess ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
