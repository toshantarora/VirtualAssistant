
import React from "react";

const StatsCard = ({
  title,
  value = 0,
  percentage = "0%",
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  trend = "up", // "up" | "down"
  loading = false,
}) => {
  const isUp = trend === "up";

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-6">
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cfded6]">
          <Icon className="h-6 w-6 text-black" />
        </div>

        {!loading && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isUp
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            {percentage}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        <p className="text-sm text-green-900">{title}</p>

        {loading ? (
          <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-black">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;


