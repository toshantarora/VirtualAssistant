import React from "react";

const InputBox = ({
  label,
  type = "text",
  placeholder,
  register,
  name,
   maxLength,  
  error,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
          maxLength={maxLength}       
        {...register(name)}
        className={`w-full px-4 py-4 rounded-3xl border outline-none appearance-none
        transition
          ${error ? "border-red-600 focus:ring-red-600" : "border-primary-100 focus:border-primary focus:ring-primary"}`}
      />

      {error && (
        <p className="mt-1 pl-4 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default InputBox;
