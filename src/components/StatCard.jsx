const StatsCard = ({
  title,
  value = 0,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  loading = false,
  onClick,
  active = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border p-4 md:py-6 cursor-pointer select-none
        transition-all duration-200 ease-out flex items-center gap-4
        ${
          active
            ? 'border-primary bg-primary/5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] translate-y-px'
            : 'border-primary-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
        }
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]
        active:translate-y-[2px]
        active:shadow-[0_4px_10px_rgba(0,0,0,0.2)]
      `}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
        <Icon className="h-6 w-6 text-black" />
      </div>

      <div className="flex flex-col">
        <p className="text-sm font-medium text-green-900">{title}</p>

        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="text-2xl font-bold leading-none mt-1">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
