import { ChevronDown } from "lucide-react";

const SelectField = ({
  label,
  name,
  register,
  options = [],
  error,
  placeholder = "Select",
   onChange,
}) => {
  return (
    <div className="w-[306px]">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
           {...register(name, { onChange })}
          className={`h-[60px] w-full appearance-none rounded-[24px] border px-6 py-3 pr-12 text-sm outline-none
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-primary-100 focus:border-primary focus:ring-primary"
            }
          `}
        >
          <option value="">{placeholder}</option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <ChevronDown
          size={22}
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-black"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export default SelectField;




