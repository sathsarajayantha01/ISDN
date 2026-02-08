import React, { useId } from "react";
import { ChevronDown } from "lucide-react";

export function Select({
  label,
  options,
  error,
  fullWidth = true,
  className = "",
  id,
  children,
  ...props
}) {
  const selectId = id || useId();

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            block w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm text-slate-900
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
          `}
          {...props}
        >
          {children ||
            (options &&
              options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
