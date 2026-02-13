import React from "react";
import { Card } from "../ui/Card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatsCard({ metric }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <Card className="p-4 sm:p-1 md:p-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
            {metric.label}
          </p>
          <h3 className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
            {metric.value}
          </h3>
        </div>
        <div
          className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorStyles[metric.color]}`}
        >
          <metric.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </div>
      </div>

      {metric.trend && (
        <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
          <span
            className={`flex items-center font-medium ${metric.trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {metric.trend.isPositive ? (
              <ArrowUpRight className="mr-0.5 h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <ArrowDownRight className="mr-0.5 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {Math.abs(metric.trend.value)}
          </span>
          <span className="ml-1 sm:ml-2 text-slate-400 hidden sm:inline">
            avg per day
          </span>
        </div>
      )}
    </Card>
  );
}
