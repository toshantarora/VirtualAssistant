const StatsCard = ({
  title,
  value = 0,
  percentage = "0%",
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  trend = "up",
  loading = false,
  onClick,
  active = false,
}) => {
  const isUp = trend === "up";

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border p-6 cursor-pointer select-none
        transition-all duration-200 ease-out
        ${
          active
            ? "border-primary bg-primary/5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] translate-y-[1px]"
            : "border-primary-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
        }
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]
        active:translate-y-[2px]
        active:shadow-[0_4px_10px_rgba(0,0,0,0.2)]
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm">
          <Icon className="h-6 w-6 text-black" />
        </div>

        {/* {!loading && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
            }`}
          >
            {percentage}
          </span>
        )} */}
      </div>

      <div className="mt-6">
        <p className="text-sm text-green-900">{title}</p>

        {loading ? (
          <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
