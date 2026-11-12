import React from 'react';
import { ChevronDown } from 'lucide-react';

export const NeoSelect = ({
  label,
  options = [],
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full bg-white text-slate-900 font-medium text-sm
            border border-slate-200 rounded-xl
            shadow-xs py-2.5 px-3.5 pr-10 appearance-none cursor-pointer
            focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]
            transition-all duration-150
            ${error ? 'border-rose-400 bg-rose-50/50' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 font-medium">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && (
        <span className="text-xs font-medium text-rose-600 tracking-tight mt-0.5">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};

export default NeoSelect;
