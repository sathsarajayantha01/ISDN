import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Trash2, Eye } from "lucide-react";

export function DataTable({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  keyField,
}) {
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getColumnClasses = (column) => {
    let classes = "";
    if (column.hideOnMobile) classes += " hidden sm:table-cell";
    if (column.hideOnTablet) classes += " hidden md:table-cell";
    return classes;
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto -mx-px">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap
                    ${column.sortable ? "cursor-pointer hover:bg-slate-100" : ""}
                    ${getColumnClasses(column)}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{column.header}</span>
                    {sortConfig?.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3 w-3 flex-shrink-0" />
                      ))}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-3 sm:px-4 md:px-6 py-3 text-right sticky right-0 bg-slate-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr
                  key={String(item[keyField])}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((column) => {
                    const cellValue = column.render
                      ? column.render(item[column.key], item)
                      : item[column.key];

                    const displayValue =
                      cellValue === null ||
                      cellValue === undefined ||
                      cellValue === ""
                        ? "N/A"
                        : cellValue;

                    return (
                      <td
                        key={String(column.key)}
                        className={`
                          px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-slate-700 text-xs sm:text-sm
                          ${getColumnClasses(column)}
                        `}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right sticky right-0 bg-white">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1.5 sm:p-1 text-blue-800 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 sm:p-1 text-blue-800 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 sm:p-1 text-blue-800 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length + (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
