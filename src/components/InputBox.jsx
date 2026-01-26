import React from 'react';

const InputBox = ({ 
  label, 
  type = 'text', 
  placeholder, 
  register, 
  name, 
  maxLength, 
  error,
  disabled = false 
}) => {
  return (
    <div className="relative w-full group">
      {label && (
        <label className="mb-2 block text-sm font-bold tracking-tight text-slate-700 transition-colors group-focus-within:text-primary ml-1">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        {...register(name)}
        className={`
          h-11 md:h-[56px] w-full 
          rounded-xl md:rounded-2xl border 
          px-4 md:px-5 py-2
          text-[13px] md:text-sm font-semibold text-slate-800 
          placeholder-slate-500
          bg-white/95 backdrop-blur-xl shadow-sm
          outline-none appearance-none
          transition-all duration-300 ease-out
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-400 ring-2 ring-red-500/10' 
            : 'border-slate-200/80 hover:border-primary/40 focus:border-primary focus:ring-[3px] focus:ring-primary/10'
          }
        `}
      />

      {error && (
        <p className="mt-2 ml-1 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default InputBox;
