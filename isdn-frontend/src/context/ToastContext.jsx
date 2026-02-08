import { createContext, useContext } from "react";
import { useToast as useToastHook } from "../hooks/useToast";
import { ToastContainer } from "../components/feedback/ToastContainer";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toasts, addToast, removeToast } = useToastHook();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
